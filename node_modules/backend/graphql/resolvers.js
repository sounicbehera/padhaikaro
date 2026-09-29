const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const { checkAuth, checkRole, JWT_SECRET } = require('../middleware/auth');

const resolvers = {
  Query: {
    me: async (_, __, { user }) => {
      checkAuth(user);
      return user;
    },
    getCourses: async (_, { category, level }) => {
      const filter = { isPublished: true };
      if (category) filter.category = category;
      if (level) filter.level = level;
      return Course.find(filter).populate('instructor').populate({
        path: 'modules',
        populate: { path: 'lessons' }
      });
    },
    getCourse: async (_, { slug }) => {
      return Course.findOne({ slug }).populate('instructor').populate({
        path: 'modules',
        populate: { path: 'lessons' }
      });
    },
    getMyEnrollments: async (_, __, { user }) => {
      checkAuth(user);
      return Enrollment.find({ student: user._id }).populate({
        path: 'course',
        populate: { path: 'instructor' }
      }).populate('completedLessons');
    },
    getMyCourses: async (_, __, { user }) => {
      checkRole(user, ['Instructor', 'Admin']);
      return Course.find({ instructor: user._id }).populate('instructor').populate({
        path: 'modules',
        populate: { path: 'lessons' }
      });
    }
  },
  Mutation: {
    register: async (_, { name, email, password, role }) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) throw new Error('Email already in use');

      const hashedPassword = await bcrypt.hash(password, 10);
      const userRole = role || 'Student'; // Default to student
      
      const user = new User({ name, email, password: hashedPassword, role: userRole });
      await user.save();

      const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      return { token, user };
    },
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error('Invalid credentials');

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new Error('Invalid credentials');

      const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      return { token, user };
    },
    createCourse: async (_, args, { user }) => {
      checkRole(user, ['Instructor', 'Admin']);
      const course = new Course({ ...args, instructor: user._id });
      await course.save();
      return course.populate('instructor');
    },
    publishCourse: async (_, { courseId }, { user }) => {
      checkRole(user, ['Instructor', 'Admin']);
      const course = await Course.findById(courseId);
      if (course.instructor.toString() !== user._id.toString() && user.role !== 'Admin') {
        throw new Error('Unauthorized');
      }
      course.isPublished = true;
      await course.save();
      return course.populate('instructor');
    },
    createModule: async (_, { courseId, title, order }, { user }) => {
      checkRole(user, ['Instructor', 'Admin']);
      const module = new Module({ title, order });
      await module.save();
      
      await Course.findByIdAndUpdate(courseId, { $push: { modules: module._id } });
      return module;
    },
    updateModule: async (_, { moduleId, title, order }, { user }) => {
      checkRole(user, ['Instructor', 'Admin']);
      const updates = {};
      if (title !== undefined) updates.title = title;
      if (order !== undefined) updates.order = order;
      return await Module.findByIdAndUpdate(moduleId, updates, { new: true });
    },
    deleteModule: async (_, { courseId, moduleId }, { user }) => {
      checkRole(user, ['Instructor', 'Admin']);
      await Course.findByIdAndUpdate(courseId, { $pull: { modules: moduleId } });
      await Module.findByIdAndDelete(moduleId);
      return true;
    },
    createLesson: async (_, { moduleId, ...args }, { user }) => {
      checkRole(user, ['Instructor', 'Admin']);
      const lesson = new Lesson(args);
      await lesson.save();
      
      await Module.findByIdAndUpdate(moduleId, { $push: { lessons: lesson._id } });
      return lesson;
    },
    updateLesson: async (_, { lessonId, ...args }, { user }) => {
      checkRole(user, ['Instructor', 'Admin']);
      return await Lesson.findByIdAndUpdate(lessonId, args, { new: true });
    },
    deleteLesson: async (_, { moduleId, lessonId }, { user }) => {
      checkRole(user, ['Instructor', 'Admin']);
      await Module.findByIdAndUpdate(moduleId, { $pull: { lessons: lessonId } });
      await Lesson.findByIdAndDelete(lessonId);
      return true;
    },
    enrollStudent: async (_, { courseId }, { user }) => {
      checkAuth(user);
      const existing = await Enrollment.findOne({ student: user._id, course: courseId });
      if (existing) throw new Error('Already enrolled');

      const enrollment = new Enrollment({ student: user._id, course: courseId });
      await enrollment.save();

      // Add to user's enrolledCourses
      await User.findByIdAndUpdate(user._id, { $push: { enrolledCourses: courseId } });

      return enrollment.populate('course').populate('student');
    },
    markLessonComplete: async (_, { enrollmentId, lessonId }, { user }) => {
      checkAuth(user);
      const enrollment = await Enrollment.findById(enrollmentId).populate('course');
      if (enrollment.student.toString() !== user._id.toString()) throw new Error('Unauthorized');
      
      if (!enrollment.completedLessons.includes(lessonId)) {
        enrollment.completedLessons.push(lessonId);
      }
      
      // Calculate progress (simplified, assumes total lessons count is known or fetched)
      // Here we just add it. A real system would calculate percentage based on total course lessons.
      await enrollment.save();
      return enrollment.populate('completedLessons');
    },
    uploadAvatar: async (_, { base64Image }, { user }) => {
      checkAuth(user);
      try {
        // Cloudinary config is automatically picked up from CLOUDINARY_URL in .env
        const cloudinary = require('cloudinary').v2;
        const result = await cloudinary.uploader.upload(base64Image, {
          folder: 'lms/avatars',
          allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
        });
        const updatedUser = await User.findByIdAndUpdate(user._id, { avatar: result.secure_url }, { new: true });
        return updatedUser;
      } catch (error) {
        throw new Error('Failed to upload image: ' + error.message);
      }
    },
    uploadMedia: async (_, { base64Data, mediaType }, { user }) => {
      checkRole(user, ['Instructor', 'Admin']);
      try {
        const cloudinary = require('cloudinary').v2;
        
        let targetUrl = '';
        if (mediaType === 'video') targetUrl = process.env.CLOUDINARY_URL_VIDEO;
        else if (mediaType === 'pdf') targetUrl = process.env.CLOUDINARY_URL_PDF;
        else throw new Error('Invalid media type');

        let options = { folder: 'lms/course_materials' };

        if (targetUrl) {
           const match = targetUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
           if (match) {
              options.api_key = match[1];
              options.api_secret = match[2];
              options.cloud_name = match[3];
           }
        }

        if (mediaType === 'video') {
           options.resource_type = 'video';
        } else if (mediaType === 'pdf') {
           options.resource_type = 'raw';
        }
        
        const result = await cloudinary.uploader.upload(base64Data, options);
        return result.secure_url;
      } catch (error) {
        throw new Error('Failed to upload media: ' + error.message);
      }
    }
  },
  // Type resolvers to map Mongoose _id to GraphQL id
  User: {
    id: (parent) => parent._id.toString(),
  },
  Course: {
    id: (parent) => parent._id.toString(),
  },
  Module: {
    id: (parent) => parent._id.toString(),
  },
  Lesson: {
    id: (parent) => parent._id.toString(),
  },
  Enrollment: {
    id: (parent) => parent._id.toString(),
  }
};

module.exports = resolvers;

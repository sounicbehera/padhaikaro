const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const Notification = require('../models/Notification');
const { checkAuth, checkRole, JWT_SECRET } = require('../middleware/auth');

const sendEmailViaBrevo = async (to, subject, htmlContent) => {
  if (!process.env.BREVO_API_KEY || process.env.BREVO_API_KEY === 'your_brevo_api_key_here') {
    console.log(`[Brevo Mock] To: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'PadhaiKaro LMS', email: process.env.BREVO_SENDER_EMAIL || 'noreply@padhaikarolms.com' },
        to: [{ email: to }],
        subject,
        htmlContent
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to send email via Brevo:', errorText);
    } else {
      console.log(`Email successfully sent to ${to}`);
    }
  } catch (error) {
    console.error('Error sending email via Brevo:', error);
  }
};

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
    },
    getNotifications: async (_, __, { user }) => {
      checkAuth(user);
      return Notification.find({ isGlobal: true }).sort({ createdAt: -1 }).limit(20);
    },
    getUnreadNotificationCount: async (_, __, { user }) => {
      checkAuth(user);
      const lastRead = user.lastReadNotificationsAt || new Date(0);
      return Notification.countDocuments({ isGlobal: true, createdAt: { $gt: lastRead } });
    }
  },
  Mutation: {
    register: async (_, { name, email, password, role }) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        if (existingUser.isVerified) {
          throw new Error('Email already in use');
        } else {
          await User.deleteOne({ email });
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userRole = role || 'Student'; // Default to student
      
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      const user = new User({ 
        name, email, password: hashedPassword, role: userRole, 
        isVerified: false, otp, otpExpiry 
      });
      await user.save();

      console.log(`[OTP] Registration OTP for ${email}: ${otp}`);
      await sendEmailViaBrevo(
        email, 
        'Verify your PadhaiKaro LMS Account', 
        `<html><body><h2>Welcome to PadhaiKaro LMS!</h2><p>Your OTP code to verify your account is: <strong>${otp}</strong></p><p>This code will expire in 10 minutes.</p></body></html>`
      );

      setTimeout(async () => {
        try {
          const checkUser = await User.findById(user._id);
          if (checkUser && !checkUser.isVerified) {
            await User.deleteOne({ _id: user._id });
            console.log(`[System] Deleted unverified user ${email} after 10 minutes.`);
          }
        } catch (e) {
          console.error('Error during automatic user deletion:', e);
        }
      }, 10 * 60 * 1000);

      return { token: null, user };
    },
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error('Invalid credentials');

      if (!user.isVerified) throw new Error('Please verify your email first');

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new Error('Invalid credentials');

      const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      return { token, user };
    },
    verifyOTP: async (_, { email, otp }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error('User not found');
      if (user.otp !== otp) throw new Error('Invalid OTP');
      if (user.otpExpiry < new Date()) throw new Error('OTP expired');
      
      user.isVerified = true;
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();
      
      const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      return { token, user };
    },
    forgotPassword: async (_, { email }) => {
      const user = await User.findOne({ email });
      if (!user) return true; // Pretend it worked
      
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      
      console.log(`[OTP] Password Reset OTP for ${email}: ${otp}`);
      await sendEmailViaBrevo(
        email, 
        'Reset your PadhaiKaro LMS Password', 
        `<html><body><h2>Password Reset</h2><p>Your OTP code to reset your password is: <strong>${otp}</strong></p><p>This code will expire in 10 minutes. If you did not request a password reset, please ignore this email.</p></body></html>`
      );
      return true;
    },
    resetPassword: async (_, { email, otp, newPassword }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error('User not found');
      if (user.otp !== otp) throw new Error('Invalid OTP');
      if (user.otpExpiry < new Date()) throw new Error('OTP expired');
      
      user.password = await bcrypt.hash(newPassword, 10);
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();
      
      return true;
    },
    createCourse: async (_, args, { user }) => {
      checkRole(user, ['Instructor', 'Admin']);
      const course = new Course({ ...args, instructor: user._id });
      await course.save();
      return course.populate('instructor');
    },
    updateCourse: async (_, { courseId, ...args }, { user }) => {
      checkRole(user, ['Instructor', 'Admin']);
      const course = await Course.findById(courseId);
      if (course.instructor.toString() !== user._id.toString() && user.role !== 'Admin') {
        throw new Error('Unauthorized');
      }
      Object.assign(course, args);
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
        else if (mediaType === 'image') targetUrl = process.env.CLOUDINARY_URL;
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
           options.resource_type = 'image';
           options.format = 'pdf';
        } else if (mediaType === 'image') {
           options.resource_type = 'image';
        }
        
        const result = await cloudinary.uploader.upload(base64Data, options);
        return result.secure_url;
      } catch (error) {
        throw new Error('Failed to upload media: ' + error.message);
      }
    },
    pushGlobalNotification: async (_, { message }, { user }) => {
      checkRole(user, ['Instructor', 'Admin']);
      const notif = new Notification({ message, isGlobal: true, sender: user._id });
      await notif.save();
      return notif;
    },
    markNotificationsAsRead: async (_, __, { user }) => {
      checkAuth(user);
      user.lastReadNotificationsAt = new Date();
      await user.save();
      return true;
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
  },
  Notification: {
    id: (parent) => parent._id.toString(),
  }
};

module.exports = resolvers;

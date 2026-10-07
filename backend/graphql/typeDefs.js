const typeDefs = `#graphql
  type WeeklyGoal {
    targetHours: Int
    completedPercentage: Float
  }

  type Activity {
    id: ID
    title: String
    subtitle: String
    type: String
    timeAgo: String
  }

  type Certificate {
    id: ID
    title: String
    issueDate: String
    type: String
  }

  type Notification {
    id: ID!
    message: String!
    isGlobal: Boolean
    createdAt: String!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    avatar: String
    points: Int
    scholarStatus: String
    weeklyGoal: WeeklyGoal
    recentActivity: [Activity]
    certificates: [Certificate]
    enrolledCourses: [Course]
  }

  type Course {
    id: ID!
    title: String!
    slug: String!
    description: String
    instructor: User
    price: Float
    category: String
    thumbnail: String
    level: String
    modules: [Module]
    isPublished: Boolean
    createdAt: String
  }

  type Module {
    id: ID!
    title: String!
    order: Int!
    lessons: [Lesson]
  }

  type Lesson {
    id: ID!
    title: String!
    content: String
    videoUrl: String
    pdfUrl: String
    duration: Int
    quizId: ID
  }

  type Enrollment {
    id: ID!
    student: User!
    course: Course!
    completedLessons: [Lesson]
    progressPercentage: Float
    status: String
    enrolledAt: String
  }

  type AuthPayload {
    token: String
    user: User!
  }

  type Query {
    me: User
    getCourses(category: String, level: String): [Course]
    getCourse(slug: String!): Course
    getMyCourses: [Course]
    getMyEnrollments: [Enrollment]
    getNotifications: [Notification]
    getUnreadNotificationCount: Int
  }

  type Mutation {
    register(name: String!, email: String!, password: String!, role: String): AuthPayload
    login(email: String!, password: String!): AuthPayload
    verifyOTP(email: String!, otp: String!): AuthPayload
    forgotPassword(email: String!): Boolean
    resetPassword(email: String!, otp: String!, newPassword: String!): Boolean
    
    createCourse(title: String!, slug: String!, description: String, price: Float, category: String, level: String, thumbnail: String): Course
    updateCourse(courseId: ID!, title: String, slug: String, description: String, price: Float, category: String, level: String, thumbnail: String): Course
    publishCourse(courseId: ID!): Course
    
    createModule(courseId: ID!, title: String!, order: Int!): Module
    updateModule(moduleId: ID!, title: String!, order: Int): Module
    deleteModule(courseId: ID!, moduleId: ID!): Boolean
    
    createLesson(moduleId: ID!, title: String!, content: String, videoUrl: String, pdfUrl: String, duration: Int): Lesson
    updateLesson(lessonId: ID!, title: String, content: String, videoUrl: String, pdfUrl: String, duration: Int): Lesson
    deleteLesson(moduleId: ID!, lessonId: ID!): Boolean
    
    enrollStudent(courseId: ID!): Enrollment
    markLessonComplete(enrollmentId: ID!, lessonId: ID!): Enrollment
    uploadAvatar(base64Image: String!): User
    uploadMedia(base64Data: String!, mediaType: String!): String!
    pushGlobalNotification(message: String!): Notification
    markNotificationsAsRead: Boolean
  }
`;

module.exports = typeDefs;

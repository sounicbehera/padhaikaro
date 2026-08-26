const typeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    avatar: String
    enrolledCourses: [Course]
  }

  type Course {
    id: ID!
    title: String!
    slug: String!
    description: String
    instructor: User!
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
    token: String!
    user: User!
  }

  type Query {
    me: User
    getCourses(category: String, level: String): [Course]
    getCourse(slug: String!): Course
    getMyEnrollments: [Enrollment]
  }

  type Mutation {
    register(name: String!, email: String!, password: String!, role: String): AuthPayload
    login(email: String!, password: String!): AuthPayload
    
    createCourse(title: String!, slug: String!, description: String, price: Float, category: String, level: String): Course
    publishCourse(courseId: ID!): Course
    
    createModule(courseId: ID!, title: String!, order: Int!): Module
    createLesson(moduleId: ID!, title: String!, content: String, videoUrl: String, duration: Int): Lesson
    
    enrollStudent(courseId: ID!): Enrollment
    markLessonComplete(enrollmentId: ID!, lessonId: ID!): Enrollment
  }
`;

module.exports = typeDefs;

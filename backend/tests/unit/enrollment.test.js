const resolvers = require('../../graphql/resolvers');
const Enrollment = require('../../models/Enrollment');
const User = require('../../models/User');

jest.mock('../../models/Enrollment');
jest.mock('../../models/User');

describe('Enrollment Resolvers - enrollStudent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw Unauthenticated if user is null', async () => {
    await expect(
      resolvers.Mutation.enrollStudent(null, { courseId: 'c123' }, { user: null })
    ).rejects.toThrow('Unauthenticated');
  });

  it('should throw if already enrolled', async () => {
    Enrollment.findOne.mockResolvedValue({ _id: 'e123' });

    await expect(
      resolvers.Mutation.enrollStudent(null, { courseId: 'c123' }, { user: { _id: 'u123' } })
    ).rejects.toThrow('Already enrolled');
  });

  it('should successfully enroll student and populate paths on the document', async () => {
    Enrollment.findOne.mockResolvedValue(null);
    User.findByIdAndUpdate.mockResolvedValue({});

    const mockSave = jest.fn().mockResolvedValue(true);
    const mockPopulate = jest.fn().mockResolvedValue(true);

    Enrollment.mockImplementation(() => {
      return {
        save: mockSave,
        populate: mockPopulate,
        _id: 'e123',
        student: 'u123',
        course: 'c123'
      };
    });

    const result = await resolvers.Mutation.enrollStudent(
      null,
      { courseId: 'c123' },
      { user: { _id: 'u123' } }
    );

    expect(Enrollment.findOne).toHaveBeenCalledWith({ student: 'u123', course: 'c123' });
    expect(mockSave).toHaveBeenCalled();
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith('u123', { $push: { enrolledCourses: 'c123' } });
    expect(mockPopulate).toHaveBeenCalledWith([
      {
        path: 'course',
        populate: { path: 'instructor' }
      },
      { path: 'student' }
    ]);
    expect(result).toBeDefined();
    expect(result._id).toBe('e123');
  });
});

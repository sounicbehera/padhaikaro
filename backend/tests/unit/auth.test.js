const { checkRole } = require('../../middleware/auth');

describe('Auth Middleware - checkRole', () => {
  it('should not throw if user has the correct role', () => {
    const user = { role: 'Instructor' };
    expect(() => checkRole(user, ['Instructor', 'Admin'])).not.toThrow();
  });

  it('should throw Unauthorized if user lacks role', () => {
    const user = { role: 'Student' };
    expect(() => checkRole(user, ['Instructor', 'Admin'])).toThrow('Unauthorized');
  });

  it('should throw Unauthenticated if user is null', () => {
    expect(() => checkRole(null, ['Instructor'])).toThrow('Unauthenticated');
  });
});

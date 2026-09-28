describe('LMS User Journey', () => {
  it('allows a student to log in, browse catalog, and view a course', () => {
    cy.visit('http://localhost:5173/auth');

    cy.get('input[type="email"]').type('student@test.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/catalog');
    cy.contains('Course Catalog').should('be.visible');

    cy.get('button').contains('Enroll Now').first().click();

    cy.url().should('include', '/course/');
    cy.contains('Course Curriculum').should('be.visible');
    cy.contains('Classroom Discussion').should('be.visible');
  });
});

describe('LMS User Journey', () => {
  it('allows a student to log in, browse catalog, and view a course', () => {
    // Note: This assumes the backend and frontend are running, and mocked data/DB state.
    cy.visit('http://localhost:5173/auth');

    // Login
    cy.get('input[type="email"]').type('student@test.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    // Verify redirect to catalog
    cy.url().should('include', '/catalog');
    cy.contains('Course Catalog').should('be.visible');

    // Click Enroll (mocked to redirect to player or mock success)
    cy.get('button').contains('Enroll Now').first().click();

    // Verify course player is visible
    cy.url().should('include', '/course/');
    cy.contains('Course Curriculum').should('be.visible');
    cy.contains('Classroom Discussion').should('be.visible');
  });
});

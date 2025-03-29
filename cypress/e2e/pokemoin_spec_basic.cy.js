describe('Pokémon App Basic GUI Tests', () => {
  beforeEach(() => {
    // Visit the app with testMode enabled so that animations are nearly frozen.
    cy.visit('/?testMode=true');
  });

  it('should load the application and display a canvas element', () => {
    cy.get('canvas').should('exist');
  });

  it('should display the default info overlay text on load', () => {
    // The default text should read as follows.
    cy.get('#pokemonInfo').should('contain.text', 'Click on a Pokémon cube to see its info.');
  });

  it('should reset the overlay text to default after clicking Refresh All', () => {
    // Click the Refresh All button.
    cy.get('#refreshAllBtn').click();
    // Wait for the refresh process to complete (adjust the wait time as needed).
    cy.wait(3000);
    // Verify that the overlay text is reset to the default message.
    cy.get('#pokemonInfo').should('contain.text', 'Click on a Pokémon cube to see its info.');
  });
});

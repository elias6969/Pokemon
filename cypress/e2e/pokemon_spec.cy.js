Cypress.on('uncaught:exception', (err, runnable) => {
  if (err.message.includes('setPointerCapture')){
    return false;
  }
});

describe('Pokémon App', () => {
  beforeEach(() => {
    cy.visit('/?testMode=true');
  });

  it('loads the application and shows the canvas', () => {
    cy.get('canvas').should('exist');
  });

  it('refreshes the Pokémon ring when "Refresh All" is clicked', () => {
    cy.get('#refreshAllBtn').click();
    // Wait for the refresh process to complete.
    cy.wait(4000);
    // Verify that the info overlay now displays the default text.
    cy.get('#pokemonInfo').should('contain.text', 'Click on a cube for details.');
  });

  it('displays Pokémon info when a cube is clicked', () => {
    cy.wait(4000);
    // Force a click on the canvas at coordinates (100, 100)
    cy.get('canvas').click(100, 100, { force: true });
    // Verify that the overlay now contains a '#' (from the Pokémon ID)
    cy.get('#pokemonInfo').should('contain.text', '#');
  });
});

describe('Camera Drag Test', () => {
  beforeEach(() => {
    cy.visit('/?testMode=true');
  });

  it('should move the camera when the canvas is dragged', () => {
    cy.window().then((win) => {
      const initialPos = win.myCamera.position.clone();
      // Simulate a drag on the canvas: mousedown, mousemove, and mouseup.
      cy.get('canvas').trigger('mousedown', { clientX: 300, clientY: 300, force: true });
      cy.get('canvas').trigger('mousemove', { clientX: 400, clientY: 300, force: true });
      cy.get('canvas').trigger('mouseup', { force: true });
      
      // Wait a bit for OrbitControls to update
      cy.wait(1000).then(() => {
        const newPos = win.myCamera.position;
        expect(newPos.distanceTo(initialPos)).to.be.greaterThan(0);
      });
    });
  });
});

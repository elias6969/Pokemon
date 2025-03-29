describe('Pokémon App (Data-Based Tests)', () => {
  // Before each test, visit the application in test mode.
  // This ensures that every test starts from the same state.
  beforeEach(() => {
    cy.visit('/?testMode=true');
  });

  // Test 1: Check that after the Pokémon ring is created,
  // the global variable "lastPokemonIDs" exists and is an array of length 10.
  it('loads and sets lastPokemonIDs after ring creation', () => {
    // Wait for 3 seconds to allow asynchronous fetch calls to complete.
    cy.wait(3000);

    // Access the browser's window object to check the application's state.
    cy.window().then((win) => {
      // Verify that lastPokemonIDs is defined and is an array.
      expect(win.lastPokemonIDs).to.be.an('array');
      // Verify that the array contains exactly 10 items (one for each Pokémon cube).
      expect(win.lastPokemonIDs.length).to.equal(10);
    });
  });

  // Test 2: Verify that each Pokémon ID in the array is either a valid number
  // or null (which is acceptable when the sprite is missing).
  it('has valid or null Pokémon IDs for each cube', () => {
    // Again, wait 3 seconds for the Pokémon ring creation to finish.
    cy.wait(3000);

    // Retrieve the global variable containing the Pokémon IDs.
    cy.window().then((win) => {
      const ids = win.lastPokemonIDs;
      // Ensure that the variable is an array.
      expect(ids).to.be.an('array');
      // Confirm that there are 10 entries.
      expect(ids.length).to.equal(10);
      // For each ID, if it's not null, it must be a number.
      ids.forEach((id) => {
        // A null value is allowed if the Pokémon sprite was missing.
        if (id !== null) {
          expect(id).to.be.a('number');
        }
      });
    });
  });

  // Test 3: Ensure that after clicking the "Refresh All" button,
  // at least one Pokémon ID changes.
  it('changes Pokémon IDs after "Refresh All"', () => {
    // Wait for the initial ring to be set up.
    cy.wait(3000);

    // Capture the current Pokémon IDs for later comparison.
    let oldIDs;
    cy.window().then((win) => {
      // Make a shallow copy of the lastPokemonIDs array.
      oldIDs = [...win.lastPokemonIDs];
    });

    // Simulate a user clicking the "Refresh All" button.
    cy.get('#refreshAllBtn').click();

    // Wait again to allow the new fetch operations to complete.
    cy.wait(3000);

    // Compare the new set of Pokémon IDs with the previously stored ones.
    cy.window().then((win) => {
      const newIDs = win.lastPokemonIDs;
      // Verify that the new array still contains 10 entries.
      expect(newIDs).to.have.length(10);

      // Check if at least one of the IDs in the new array differs from the old array.
      const anyDiff = newIDs.some((id, idx) => id !== oldIDs[idx]);
      // The test will pass if any single Pokémon ID has changed.
      expect(anyDiff).to.be.true;
    });
  });
});

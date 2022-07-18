describe('Metamask', () => {
  context('Test commands', () => {
    it(`acceptMetamaskAccess should accept connection request to metamask`, () => {
      cy.visit('/');
      cy.findByTestId('connect-wallet').click();
      cy.acceptMetamaskAccess().then(connected => {
        expect(connected).to.be.true;
      });
    });
  });
});

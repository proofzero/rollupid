describe('Metamask', () => {
  context('Gate commands', () => {
    it(`acceptMetamaskAccess should accept connection request to metamask`, () => {
      cy.visit('/');
      cy.findByTestId('connect-wallet').click();
      cy.acceptMetamaskAccess().then(connected => {
        expect(connected).to.be.true;
      });
    });

    it(`confirmMetamaskSignatureRequest should succeed`, () => {
      cy.confirmMetamaskSignatureRequest().then(signed => {
        expect(signed).to.be.true;
      });
    });
  });
});

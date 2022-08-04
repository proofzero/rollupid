describe('Metamask', () => {
  context('Gate commands', () => {
    it(`Ensure correct wallet address is being used for gate test`, () => {
      cy.getMetamaskWalletAddress().then(address => {
        expect(address).to.be.eq('0xC5221bd8a49A855DB0E5D2dee9e53d1C3Dcaceb1');
      });
    });

    it(`acceptMetamaskAccess should accept connection request to metamask`, () => {
      cy.visit('/');
      cy.findByTestId('connect-wallet').click();
      cy.acceptMetamaskAccess().then(connected => {
        expect(connected).to.be.true;
      });
    });

    it(`confirmMetamaskSignatureRequest should succeed`, () => {
      cy.wait(5000);
      cy.confirmMetamaskSignatureRequest().then(signed => {
        expect(signed).to.be.true;
      });
    });

    it(`Allowed wallet should be let into gated application`, () => {
      cy.url().should('eq', 'http://localhost:19006/settings');
      cy.findByTestId('wallet-address').contains('0xC5...ceb1');
    });
  });
});

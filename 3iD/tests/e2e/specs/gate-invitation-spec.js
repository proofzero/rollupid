describe("Metamask", () => {
  context("Gate commands", () => {
    before(() => {
      cy.setupMetamask(Cypress.env("INVITE_SECRET_WORDS"));
    });

    it(`Ensure correct wallet address is being used for gate test`, () => {
      cy.getMetamaskWalletAddress().then((address) => {
        expect(address).to.be.eq(Cypress.env("INVITE_ACCOUNT"));
      });
    });

    it(`acceptMetamaskAccess should accept connection request to metamask`, () => {
      cy.visit("/");
      cy.findByTestId("connect-wallet").click();
      cy.acceptMetamaskAccess().then((connected) => {
        expect(connected).to.be.true;
      });
    });

    it(`confirmMetamaskSignatureRequest should succeed`, () => {
      cy.wait(5000);
      cy.confirmMetamaskSignatureRequest().then((signed) => {
        expect(signed).to.be.true;
      });
    });

    it(`Allowed wallet should be let into gated application`, () => {
      cy.url().should("eq", "http://localhost:19006/invitation");
    });
  });
});

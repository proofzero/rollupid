describe("Metamask", () => {
  context("Gate commands", () => {
    before(() => {
      cy.setupMetamask(Cypress.env("GENERIC_SECRET_WORDS"));
    });

    it(`Switch Metamask account to wallet that does not have claims`, () => {
      // Need to disconnect from dapp to ensure state is cleared.
      cy.disconnectMetamaskWalletFromDapp().then((disconnected) => {
        expect(disconnected).to.be.true;
      });
      // `switchMetamaskAccount` function doesn't work because multiple accounts
      // with 0 ETH balance do not get automatically imported.
      // However, it is possible to use `createMetamaskAccount` with the second
      // account's name and that will result in the same ETH address being imported.
      cy.createMetamaskAccount("3id test - denied").then((switched) => {
        expect(switched).to.be.true;
      });
    });

    it(`Ensure correct wallet address is being used for gate denied test`, () => {
      cy.getMetamaskWalletAddress().then((address) => {
        expect(address).to.be.eq("0xb2a0Ad4bc89BD11B0E293F351DbcFDB31cd1caA6");
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

    it(`Denied wallet should be redirected to gate`, () => {
      cy.url().should("eq", "http://localhost:19006/gate");
      cy.findByTestId("try-different-wallet").click();
      cy.url().should("eq", "http://localhost:19006/");
    });

    it(`Switch to allowed wallet to pass the gate`, () => {
      // Need to disconnect from dapp to ensure state is cleared.
      cy.disconnectMetamaskWalletFromDapp().then((disconnected) => {
        expect(disconnected).to.be.true;
      });
      // `Account 1` is how the default wallet is named when imported.
      cy.switchMetamaskAccount("Account 1").then((switched) => {
        expect(switched).to.be.true;
      });
    });

    it(`Ensure correct wallet address is being used after switching`, () => {
      cy.getMetamaskWalletAddress().then((address) => {
        expect(address).to.be.eq(Cypress.env("GENERIC_ACCOUNT"));
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
      cy.url().should("eq", "http://localhost:19006/settings");

      const genericAccount = Cypress.env("GENERIC_ACCOUNT");
      cy.findByTestId("wallet-address").contains(
        `${genericAccount.substring(0, 4)}...${genericAccount.substring(
          genericAccount.length - 4
        )}`
      );
    });
  });
});

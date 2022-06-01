describe('Routes test without connecting wallet', () => {
  it('Opens the dapp locally on the Dashboard page', () => {
    cy.visit('/')
    cy.get("#dashboard").click()
    cy.get('h1', {timeout: 30000}).should('contain', 'Dashboard')
    cy.get('#connect-a-wallet').should('contain', 'Connect a Wallet')
  })

  it('Routing to apps pages works', () => {
    cy.get("#apps").click()
    cy.url().should('include', '/apps')
    cy.get('h1').should('contain', 'Apps')

  })

  it('Routing to reports pages works', () => {
    cy.get("#reports").click()
    cy.url().should('include', '/reports')
    cy.get('h1').should('contain', 'Reports')
  })
})

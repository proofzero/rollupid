describe('Routes test without connecting wallet', () => {
  it('Opens the dapp locally on the Dashboard page', () => {
    cy.visit('/')
    cy.get('h1').should('contain', 'Dashboard')
    cy.get('#connect-a-wallet').should('contain', 'Connect a Wallet')
  })

  it('Routing to cores pages works', () => {
    cy.get("#cores").click()
    cy.url().should('include', '/cores')
    cy.get('h1').should('contain', 'Cores')

  })

  it('Routing to reports pages works', () => {
    cy.get("#reports").click()
    cy.url().should('include', '/reports')
    cy.get('h1').should('contain', 'Reports')
  })
})

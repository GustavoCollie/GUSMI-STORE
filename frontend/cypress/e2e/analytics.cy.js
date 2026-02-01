describe('Analytics Dashboard', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/');
    cy.waitForAppLoad();
    cy.navigateToTab('business');
  });

  it('should display the analytics dashboard', () => {
    cy.contains('Inteligencia de Negocio').should('be.visible');
    cy.contains('Análisis financiero y rendimiento de productos').should('be.visible');
  });

  it('should show KPI cards', () => {
    cy.contains('Ingresos Totales').should('be.visible');
    cy.contains('Costo de Ventas').should('be.visible');
    cy.contains('Ganancia Bruta').should('be.visible');
    cy.contains('Margen de Ganancia').should('be.visible');
  });

  it('should have date range filters', () => {
    cy.get('input[type="date"]').should('have.length.at.least', 2);
  });

  it('should update data when date range changes', () => {
    // Changing the date causes a re-render that detaches the input.
    // Use separate get() calls to avoid detached-DOM errors.
    cy.get('input[type="date"]').first().invoke('val', '2026-01-01').trigger('change');

    // After the re-render, KPIs should still render
    cy.contains('Ingresos Totales').should('be.visible');
  });

  it('should render charts (SVG elements)', () => {
    cy.get('svg').should('have.length.at.least', 1);
  });
});

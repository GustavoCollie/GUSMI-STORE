describe('Purchasing Module', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/');
    cy.waitForAppLoad();
    cy.navigateToTab('purchasing');
  });

  it('should display purchasing dashboard with KPI cards', () => {
    cy.contains('Calidad de Entregas').should('be.visible');
    cy.contains('Valor Adquirido').should('be.visible');
    cy.contains('Ahorro Negociado').should('be.visible');
    cy.contains('Eficiencia Logística').should('be.visible');
  });

  it('should create a new supplier', () => {
    cy.contains('button', 'Gestionar Proveedores').click();

    cy.contains('h2', 'Gestión de Proveedores').should('be.visible');

    const ts = Date.now();
    const ruc = String(ts).slice(-11).padStart(11, '1');
    cy.get('input[placeholder="Ej: Global Supply"]').type(`Proveedor CY ${ts}`);
    cy.get('input[placeholder="20123456789"]').type(ruc);
    cy.get('input[placeholder="proveedor@empresa.com"]').type(`prov-${ts}@test.com`);

    cy.intercept('POST', '**/api/v1/purchasing/suppliers').as('createSupplier');
    cy.contains('button', 'Registrar Proveedor').click();
    cy.wait('@createSupplier').its('response.statusCode').should('eq', 201);

    // Modal closes after success — re-open to verify supplier is in the list
    cy.contains('button', 'Gestionar Proveedores').click();
    // Use the search box to filter the list (avoids scroll-out-of-view issues)
    cy.get('input[placeholder="Buscar proveedor o producto..."]').type(`Proveedor CY ${ts}`);
    cy.contains(`Proveedor CY ${ts}`, { timeout: 10000 }).should('be.visible');
  });

  it('should create a new purchase order', () => {
    const ts = Date.now();
    cy.seedProduct({ name: `Prod OC ${ts}`, sku: `OC-${ts}`, description: 'Para OC' }).then((prodRes) => {
      cy.seedSupplier({
        name: `Prov OC ${ts}`,
        email: `prov-oc-${ts}@test.com`,
        ruc: '11111111111',
        product_ids: [prodRes.body.id],
      }).then(() => {
        cy.intercept('GET', '**/api/v1/purchasing/suppliers').as('getSuppliers');
        cy.reload();
        cy.wait('@getSuppliers');
        cy.waitForAppLoad();
        cy.navigateToTab('purchasing');

        cy.contains('button', 'Nueva Orden de Compra').click();
        cy.contains('h2', 'Nueva Orden de Compra').should('be.visible');

        // Select supplier
        cy.get('select').first().select(1);
        // Select product (need to wait for the supplier selection to enable it)
        cy.get('select').eq(1).should('not.be.disabled');
        cy.get('select').eq(1).select(1);

        // Fill quantity and price
        cy.get('input[type="number"]').first().clear().type('25');
        cy.get('input[type="number"]').eq(1).clear().type('150');

        cy.contains('button', 'Crear Orden').click();

        // Verify order appears
        cy.contains('OC-').should('be.visible');
      });
    });
  });

  it('should display purchase orders table', () => {
    cy.get('.google-table').should('exist');
  });
});

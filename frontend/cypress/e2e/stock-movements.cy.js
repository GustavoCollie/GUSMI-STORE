describe('Stock Movements', () => {
  let productId;
  const productName = 'Producto Stock Test';

  beforeEach(() => {
    cy.login();

    const sku = `STK-${Date.now()}`;
    cy.seedProduct({ name: productName, sku, description: 'Para pruebas de stock' }).then((res) => {
      productId = res.body.id;

      cy.apiRequest('POST', `/products/${productId}/receive-stock`, {
        quantity: 50,
        reference: 'STOCK-INICIAL-CY',
      }, { form: true });
    });

    cy.intercept('GET', '**/api/v1/products').as('getProducts');
    cy.visit('/');
    cy.wait('@getProducts');
    cy.waitForAppLoad();

    // Use search to find the product (avoids scrolling issues)
    cy.get('input[placeholder="Buscar en inventario..."]').type(productName);
    cy.contains('.google-table tr', productName, { timeout: 15000 }).should('be.visible');
  });

  it('should register an internal stock exit', () => {
    cy.contains('tr', productName).within(() => {
      cy.contains('button', 'Salida').click();
    });

    cy.contains('h3', 'Registrar Salida').should('be.visible');

    cy.get('.google-input[type="number"]').first().clear().type('5');
    cy.get('input[placeholder="Nombre completo"]').type('Juan Cypress');
    cy.get('input[placeholder="Área de trabajo"]').type('QA');

    cy.contains('button', 'Confirmar Salida').click();

    // After sale, search again to verify stock
    cy.get('input[placeholder="Buscar en inventario..."]').clear().type(productName);
    cy.contains('tr', productName).within(() => {
      cy.contains('45').should('be.visible');
    });
  });

  it('should show error when exit exceeds stock', () => {
    cy.contains('tr', productName).within(() => {
      cy.contains('button', 'Salida').click();
    });

    cy.get('.google-input[type="number"]').first().clear().type('999');
    cy.get('input[placeholder="Nombre completo"]').type('Test');
    cy.get('input[placeholder="Área de trabajo"]').type('Test');

    cy.contains('button', 'Confirmar Salida').click();

    // The input has max={product.stock}, so the browser shows HTML5 validation
    cy.get('.google-input[type="number"]').first().then(($input) => {
      expect($input[0].validationMessage).to.include('inferior o igual');
    });
  });

  it('should register a stock return', () => {
    cy.contains('tr', productName).within(() => {
      cy.contains('button', 'Retorno').click();
    });

    cy.contains('h3', 'Confirmar Retorno').should('be.visible');

    cy.get('input[type="number"]').clear().type('10');
    cy.get('input[placeholder*="GR-2026"]').type('RET-CY-001');

    cy.contains('button', 'Confirmar Entrada').click();

    // Verify stock increased
    cy.get('input[placeholder="Buscar en inventario..."]').clear().type(productName);
    cy.contains('tr', productName).within(() => {
      cy.contains('60').should('be.visible');
    });
  });

  it('should display movements in the movements tab', () => {
    // Clear search first
    cy.get('input[placeholder="Buscar en inventario..."]').clear();
    cy.navigateToTab('movements');

    cy.contains('h2', 'Historial de Movimientos').should('be.visible');
    cy.get('.google-table').should('be.visible');

    cy.contains('STOCK-INICIAL-CY').should('be.visible');
  });
});

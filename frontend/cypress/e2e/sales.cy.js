describe('Sales Module', () => {
  let productId;

  beforeEach(() => {
    cy.login();

    const ts = Date.now();
    cy.seedProduct({ name: `Prod Venta ${ts}`, sku: `VTA-${ts}`, description: 'Para ventas' }).then((res) => {
      productId = res.body.id;
      cy.apiRequest('POST', `/products/${productId}/receive-stock`, {
        quantity: 100,
        reference: 'STOCK-VENTAS-CY',
      }, { form: true });
    });

    cy.visit('/');
    cy.waitForAppLoad();
    cy.navigateToTab('sales');
  });

  it('should display sales dashboard', () => {
    cy.contains('Ventas').should('be.visible');
    cy.get('.google-table').should('exist');
  });

  it('should create a new sales order', () => {
    cy.contains('button', /Nueva Orden de Venta/).click();

    cy.contains('h3', 'Nueva Orden de Venta').should('be.visible');

    // Customer info
    cy.get('input[placeholder="Nombre del cliente"]').type('Cliente Cypress');
    cy.get('input[placeholder="email@ejemplo.com"]').type('cliente-cy@test.com');

    // Select product
    cy.get('select').first().select(1);

    // Fill quantity and price
    cy.get('input[type="number"]').first().clear().type('10');
    cy.get('input[type="number"]').eq(1).clear().type('250');

    cy.contains('button', 'Crear Orden de Venta').click();

    cy.contains('Cliente Cypress').should('be.visible');
  });

  it('should delete a sales order', () => {
    // Create the sales order via API using the product from beforeEach
    cy.apiRequest('POST', '/sales/orders', {
      customer_name: 'Cliente Delete CY',
      customer_email: 'delete-cy@test.com',
      product_id: productId,
      quantity: 2,
      unit_price: 50,
      shipping_type: 'PICKUP',
    }).then((res) => {
      expect(res.status).to.eq(201);

      cy.intercept('GET', '**/api/v1/sales/orders').as('getSalesOrders');
      cy.reload();
      cy.wait('@getSalesOrders');
      cy.waitForAppLoad();
      cy.navigateToTab('sales');

      const orderId = `OV-${res.body.id.substring(0, 6)}`;
      cy.contains('tr', orderId).within(() => {
        cy.get('button[title="Eliminar Orden"]').click();
      });

      cy.contains('¿Seguro que deseas eliminar esta orden de venta?').should('be.visible');
      cy.contains('button', 'Confirmar').click();

      cy.contains('tr', orderId).should('not.exist');
    });
  });
});

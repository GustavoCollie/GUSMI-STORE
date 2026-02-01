describe('Inventory - Product CRUD', () => {
  beforeEach(() => {
    cy.login();
  });

  it('should create a new product via purchasing tab', () => {
    const sku = `MON-${Date.now()}`;

    cy.visit('/');
    cy.waitForAppLoad();
    cy.navigateToTab('purchasing');
    cy.contains('button', 'Registrar Nuevo Artículo').click();

    cy.contains('h3', 'Registrar Nuevo Producto').should('be.visible');
    cy.get('input[placeholder*="Monitor LED"]').clear().type('Monitor Cypress Test');
    cy.get('input[placeholder="SKU-001"]').clear().type(sku);
    cy.get('textarea[placeholder*="Especificaciones"]').clear().type('Creado por Cypress');

    cy.contains('button', 'Crear Producto').click();

    cy.navigateToTab('inventory');
    // Use search to find it quickly
    cy.get('input[placeholder="Buscar en inventario..."]').type('Monitor Cypress Test');
    cy.contains('td', 'Monitor Cypress Test').should('be.visible');
  });

  it('should edit an existing product', () => {
    const sku = `EDIT-${Date.now()}`;
    cy.seedProduct({ name: 'Producto Para Editar', sku, description: 'Desc original' });

    cy.intercept('GET', '**/api/v1/products').as('getProducts');
    cy.visit('/');
    cy.wait('@getProducts');
    cy.waitForAppLoad();

    // Use search to find the product
    cy.get('input[placeholder="Buscar en inventario..."]').type('Producto Para Editar');
    cy.contains('tr', 'Producto Para Editar').should('be.visible');

    cy.contains('tr', 'Producto Para Editar').within(() => {
      cy.get('button[title="Editar"]').click();
    });

    cy.contains('h3', 'Editar Producto').should('be.visible');
    cy.get('input[placeholder*="Monitor LED"]').clear().type('Producto Editado CY');
    cy.contains('button', 'Guardar Cambios').click();

    // Clear search and search for new name
    cy.get('input[placeholder="Buscar en inventario..."]').clear().type('Producto Editado CY');
    cy.contains('td', 'Producto Editado CY').should('be.visible');
  });

  it('should delete a product with confirmation', () => {
    const sku = `DEL-${Date.now()}`;
    cy.seedProduct({ name: 'Producto Para Eliminar', sku, description: 'Sera eliminado' });

    cy.intercept('GET', '**/api/v1/products').as('getProducts');
    cy.visit('/');
    cy.wait('@getProducts');
    cy.waitForAppLoad();

    // Search for the product
    cy.get('input[placeholder="Buscar en inventario..."]').type('Producto Para Eliminar');
    cy.contains('tr', 'Producto Para Eliminar').should('be.visible');

    cy.contains('tr', 'Producto Para Eliminar').within(() => {
      cy.get('button[title="Eliminar"]').click();
    });

    cy.contains('¿Quieres eliminar este producto permanentemente?').should('be.visible');
    cy.contains('button', 'Confirmar').click();

    cy.contains('td', 'Producto Para Eliminar').should('not.exist');
  });

  it('should search products by name and SKU', () => {
    const ts = Date.now();
    cy.seedProduct({ name: 'Monitor Busqueda', sku: `BUS-MON-${ts}`, description: 'Para buscar' });
    cy.seedProduct({ name: 'Teclado Busqueda', sku: `BUS-TEC-${ts}`, description: 'Para buscar' });

    cy.intercept('GET', '**/api/v1/products').as('getProducts');
    cy.visit('/');
    cy.wait('@getProducts');
    cy.waitForAppLoad();

    cy.get('input[placeholder="Buscar en inventario..."]').clear().type('Monitor Busqueda');
    cy.contains('td', 'Monitor Busqueda').should('be.visible');
    cy.contains('td', 'Teclado Busqueda').should('not.exist');

    cy.get('input[placeholder="Buscar en inventario..."]').clear().type(`BUS-TEC`);
    cy.contains('td', 'Teclado Busqueda').should('be.visible');
    cy.contains('td', 'Monitor Busqueda').should('not.exist');
  });

  it('should show empty state when no products match search', () => {
    cy.visit('/');
    cy.waitForAppLoad();
    cy.get('input[placeholder="Buscar en inventario..."]').clear().type('ZZZZNOTEXIST999');
    cy.contains('No hay productos registrados').should('be.visible');
  });
});

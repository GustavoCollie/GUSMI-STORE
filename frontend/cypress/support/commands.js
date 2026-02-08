// ── Authentication ──

Cypress.Commands.add('login', (email = 'cypress@test.com', password = 'CypressTest123!') => {
  cy.session([email, password], () => {
    // Register (idempotent – ignores if already exists)
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/auth/register`,
      body: { email, password },
      failOnStatusCode: false,
    });

    // Verify the user directly in the DB (email verification required)
    cy.task('verifyUser', email);

    // Now login
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/auth/login`,
      body: { email, password },
    }).then((res) => {
      window.localStorage.setItem('token', res.body.access_token);
    });
  }, {
    validate() {
      expect(localStorage.getItem('token')).to.not.be.null;
    },
  });
});

Cypress.Commands.add('loginViaUI', (email, password) => {
  cy.visit('/login');
  cy.get('input[placeholder="Correo electrónico"]').type(email);
  cy.get('input[placeholder="Introduce tu contraseña"]').type(password);
  cy.contains('button', 'Siguiente').click();
});

// ── API helpers ──

Cypress.Commands.add('apiRequest', (method, endpoint, body = null, options = {}) => {
  const opts = {
    method,
    url: `${Cypress.env('apiUrl')}${endpoint}`,
    headers: { 'X-API-Key': Cypress.env('apiKey') },
    failOnStatusCode: false,
  };
  if (options.form) {
    opts.form = true;
  }
  if (body) {
    opts.body = body;
  }
  return cy.request(opts);
});

Cypress.Commands.add('seedProduct', (overrides = {}) => {
  const data = {
    name: overrides.name || 'Producto Cypress',
    sku: overrides.sku || `CY-${Date.now()}`,
    description: overrides.description || 'Creado por Cypress E2E',
  };
  // Backend expects Form(...) fields, not JSON body
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/products`,
    headers: { 'X-API-Key': Cypress.env('apiKey') },
    form: true,
    body: data,
  });
});

Cypress.Commands.add('seedSupplier', (overrides = {}) => {
  const payload = {
    name: overrides.name || 'Proveedor Cypress',
    email: overrides.email || `supplier-${Date.now()}@test.com`,
    ruc: overrides.ruc || '12345678901',
    phone: overrides.phone || '999888777',
    product_ids: overrides.product_ids || [],
    ...overrides,
  };
  return cy.apiRequest('POST', '/purchasing/suppliers', payload);
});

Cypress.Commands.add('seedSalesOrder', (overrides = {}) => {
  const payload = {
    customer_name: overrides.customer_name || 'Cliente Cypress',
    customer_email: overrides.customer_email || 'cliente@cypress.test',
    quantity: overrides.quantity || 5,
    unit_price: overrides.unit_price || 100,
    shipping_type: overrides.shipping_type || 'PICKUP',
    ...overrides,
  };
  return cy.apiRequest('POST', '/sales/orders', payload);
});

Cypress.Commands.add('cleanProducts', () => {
  cy.apiRequest('GET', '/products').then((res) => {
    if (res.status === 200 && Array.isArray(res.body)) {
      res.body.forEach((p) => cy.apiRequest('DELETE', `/products/${p.id}`));
    }
  });
});

Cypress.Commands.add('cleanSuppliers', () => {
  cy.apiRequest('GET', '/purchasing/suppliers').then((res) => {
    if (res.status === 200 && Array.isArray(res.body)) {
      res.body.forEach((s) => cy.apiRequest('DELETE', `/purchasing/suppliers/${s.id}`));
    }
  });
});

Cypress.Commands.add('cleanSalesOrders', () => {
  cy.apiRequest('GET', '/sales/orders').then((res) => {
    if (res.status === 200 && Array.isArray(res.body)) {
      res.body.forEach((o) => cy.apiRequest('DELETE', `/sales/orders/${o.id}`));
    }
  });
});

// ── Navigation ──

Cypress.Commands.add('navigateToTab', (tabKey) => {
  const map = {
    purchasing: 'Compras',
    sales: 'Ventas',
    business: 'Negocio',
    inventory: 'Inventario',
    movements: 'Movimientos',
  };
  cy.contains('button', map[tabKey]).click();
});

Cypress.Commands.add('waitForAppLoad', () => {
  cy.contains('GUSMI').should('be.visible');
  cy.contains('Jefe de Almacén').should('be.visible');
});

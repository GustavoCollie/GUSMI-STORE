describe('Navigation & UI', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/');
    cy.waitForAppLoad();
  });

  it('should display header with branding and search', () => {
    cy.contains('GUSMI').should('be.visible');
    cy.contains('Inventario').should('be.visible');
    cy.get('input[placeholder="Buscar en inventario..."]').should('be.visible');
    cy.contains('Jefe de Almacén').should('be.visible');
  });

  it('should navigate between all tabs', () => {
    const tabs = [
      { key: 'purchasing', label: 'Compras' },
      { key: 'sales', label: 'Ventas' },
      { key: 'business', label: 'Negocio' },
      { key: 'inventory', label: 'Inventario' },
      { key: 'movements', label: 'Movimientos' },
    ];

    tabs.forEach(({ key, label }) => {
      cy.navigateToTab(key);
      // Verify the tab button has active styling
      cy.contains('button', label).should('have.class', 'text-[#1a73e8]');
    });
  });

  it('should redirect to login when no token', () => {
    cy.clearLocalStorage();
    cy.visit('/');
    cy.url().should('include', '/login');
  });

  it('should logout successfully', () => {
    cy.get('button[title="Cerrar Sesión"]').click();

    cy.url().should('include', '/login');

    // Token should be removed
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.be.null;
    });
  });

  it('should show inventory tab as default', () => {
    cy.contains('button', 'Inventario').should('have.class', 'text-[#1a73e8]');
    cy.contains('Catálogo de Productos').should('be.visible');
  });
});

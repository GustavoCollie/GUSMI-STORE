describe('Authentication', () => {

  describe('Login', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    it('should display the login page', () => {
      cy.contains('h1', 'Iniciar sesión').should('be.visible');
      cy.contains('Usa tu cuenta de Almacenes GUSMI').should('be.visible');
      cy.get('input[placeholder="Correo electrónico"]').should('be.visible');
      cy.get('input[placeholder="Introduce tu contraseña"]').should('be.visible');
      cy.contains('button', 'Siguiente').should('be.visible');
    });

    it('should login with valid credentials and redirect to dashboard', () => {
      // Ensure the test user exists and is verified
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/auth/register`,
        body: { email: 'cypress@test.com', password: 'CypressTest123!' },
        failOnStatusCode: false,
      });
      cy.task('verifyUser', 'cypress@test.com');

      cy.get('input[placeholder="Correo electrónico"]').type('cypress@test.com');
      cy.get('input[placeholder="Introduce tu contraseña"]').type('CypressTest123!');
      cy.contains('button', 'Siguiente').click();

      cy.url().should('eq', `${Cypress.config('baseUrl')}/`);
      cy.contains('GUSMI').should('be.visible');
      cy.contains('Jefe de Almacén').should('be.visible');
    });

    it('should show error with invalid credentials', () => {
      cy.get('input[placeholder="Correo electrónico"]').type('wrong@test.com');
      cy.get('input[placeholder="Introduce tu contraseña"]').type('badpassword');
      cy.contains('button', 'Siguiente').click();

      cy.contains(/Invalid credentials|Credenciales inválidas/).should('be.visible');
      cy.url().should('include', '/login');
    });

    it('should toggle password visibility', () => {
      cy.get('input[placeholder="Introduce tu contraseña"]').should('have.attr', 'type', 'password');
      // Click the eye icon button (sibling of the input)
      cy.get('input[placeholder="Introduce tu contraseña"]').parent().find('button').click();
      cy.get('input[placeholder="Introduce tu contraseña"]').should('have.attr', 'type', 'text');
    });

    it('should navigate to register page', () => {
      cy.contains('a', 'Crear cuenta').click();
      cy.url().should('include', '/register');
    });
  });

  describe('Register', () => {
    beforeEach(() => {
      cy.visit('/register');
    });

    it('should display the register page', () => {
      cy.contains('h1', 'Crear tu cuenta').should('be.visible');
      cy.get('input[placeholder="Correo institucional"]').should('be.visible');
      cy.get('input[placeholder="Contraseña"]').should('be.visible');
      cy.get('input[placeholder="Confirmar contraseña"]').should('be.visible');
    });

    it('should register a new user successfully', () => {
      const email = `cy-${Date.now()}@test.com`;

      cy.get('input[placeholder="Correo institucional"]').type(email);
      cy.get('input[placeholder="Contraseña"]').type('SecurePass123!');
      cy.get('input[placeholder="Confirmar contraseña"]').type('SecurePass123!');
      cy.contains('button', 'Registrar').click();

      cy.contains('¡Todo listo!').should('be.visible');
    });

    it('should show error when passwords do not match', () => {
      cy.get('input[placeholder="Correo institucional"]').type('mismatch@test.com');
      cy.get('input[placeholder="Contraseña"]').type('password123');
      cy.get('input[placeholder="Confirmar contraseña"]').type('different123');
      cy.contains('button', 'Registrar').click();

      cy.contains('Las contraseñas no coinciden').should('be.visible');
    });

    it('should enforce minimum password length', () => {
      cy.get('input[placeholder="Correo institucional"]').type('short@test.com');
      cy.get('input[placeholder="Contraseña"]').type('short');
      cy.get('input[placeholder="Confirmar contraseña"]').type('short');
      cy.contains('button', 'Registrar').click();

      cy.contains('al menos 8 caracteres').should('be.visible');
    });

    it('should navigate to login page', () => {
      cy.contains('a', 'Iniciar sesión en su lugar').click();
      cy.url().should('include', '/login');
    });
  });
});

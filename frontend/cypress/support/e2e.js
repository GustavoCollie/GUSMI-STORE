import './commands';

Cypress.on('uncaught:exception', (err) => {
  // Don't fail tests on unhandled React errors or network issues
  if (
    err.message.includes('Hydration') ||
    err.message.includes('ResizeObserver') ||
    err.message.includes('Network Error')
  ) {
    return false;
  }
});

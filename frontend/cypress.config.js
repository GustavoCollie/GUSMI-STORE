import { defineConfig } from 'cypress';
import { execSync } from 'child_process';
import path from 'path';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    env: {
      apiUrl: 'http://localhost:8000/api/v1',
      apiKey: 'dev-secret-key',
    },
    setupNodeEvents(on, config) {
      on('task', {
        verifyUser(email) {
          const dbPath = path.resolve(__dirname, '..', 'backend', 'inventory.db');
          const cmd = `python -c "import sqlite3; c=sqlite3.connect('${dbPath.replace(/\\/g, '/')}'); c.execute('UPDATE users SET is_verified=1 WHERE email=?', ['${email}']); c.commit(); c.close(); print('verified')"`;
          try {
            execSync(cmd, { encoding: 'utf-8' });
          } catch (e) {
            console.error('verifyUser failed:', e.message);
          }
          return null;
        },
      });
      return config;
    },
  },
  retries: {
    runMode: 2,
    openMode: 0,
  },
});

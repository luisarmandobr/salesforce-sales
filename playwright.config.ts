import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Cargar variables de entorno desde .env
dotenv.config();

/**
 * Configuración de Playwright para pruebas E2E de Salesforce
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  
  // Tiempo máximo para cada test
  timeout: 60 * 1000,
  
  // Configuración de expectativas
  expect: {
    timeout: 10000
  },

  // Ejecutar tests en paralelo
  fullyParallel: false,
  
  // Fallar el build en CI si dejaste test.only
  forbidOnly: !!process.env.CI,
  
  // Reintentos en CI
  retries: process.env.CI ? 2 : 0,
  
  // Número de workers
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter
  reporter: [
    ['html'],
    ['list'],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],

  // Configuración compartida para todos los proyectos
  use: {
    // URL base para usar en tus tests
    baseURL: process.env.SF_BASE_URL || 'https://login.salesforce.com',
    
    // Trazas en el primer reintento de un test fallido
    trace: 'on-first-retry',
    
    // Screenshots solo en fallos
    screenshot: 'only-on-failure',
    
    // Video solo en fallos
    video: 'retain-on-failure',
    
    // Timeout para acciones
    actionTimeout: 15000,
    
    // Navegación timeout
    navigationTimeout: 30000,
  },

  // Configurar proyectos para diferentes navegadores
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    },

    // Descomenta para ejecutar en otros navegadores
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Carpeta para artefactos de test
  outputDir: 'test-results/',
});

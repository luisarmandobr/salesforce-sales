import { test, expect } from '@playwright/test';
import { createSalesforceAuth } from '../helpers/salesforce-auth.helper';

/**
 * Suite de pruebas completa para Salesforce
 * Test unificado que ejecuta todas las validaciones en una sola sesión
 */
test.describe('Salesforce Complete Flow', () => {
  
  /**
   * Test unificado: Validaciones completas de autenticación y navegación en Salesforce
   * Incluye: Login, App Launcher, Perfil de Usuario, Setup y Búsqueda Global
   */
  test('debe completar el flujo completo de autenticación y validaciones en Salesforce', async ({ page }) => {
    // Crear instancia de autenticación
    const sfAuth = createSalesforceAuth();

    // ========================================
    // PASO 1: Autenticación con Login Directo
    // ========================================
    console.log('Paso 1: Autenticando usuario...');
    await sfAuth.loginWithFrontDoor(page, '/lightning/page/home');

    // Verificar que estamos autenticados
    await expect(page).toHaveURL(/lightning/, { timeout: 20000 });
    await page.waitForLoadState('networkidle');
    console.log('Usuario autenticado correctamente');

    // ========================================
    // PASO 2: Abrir App Launcher
    // ========================================
    console.log('Paso 2: Abriendo App Launcher...');
    await page.waitForLoadState('domcontentloaded');

    const waffleButton = page.locator('button.slds-icon-waffle_container, button[title*="App Launcher"]').first();
    await expect(waffleButton).toBeVisible({ timeout: 10000 });
    await waffleButton.click();

    // Verificar que se abre el modal del App Launcher
    const appLauncherModal = page.locator('div.appLauncher, div[class*="oneAppLauncherModal"]').first();
    await expect(appLauncherModal).toBeVisible({ timeout: 5000 });
    console.log('App Launcher abierto correctamente');

    // Cerrar el App Launcher para continuar
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    // ========================================
    // PASO 3: Verificar perfil de usuario
    // ========================================
    console.log('Paso 3: Verificando perfil de usuario...');
    await page.waitForLoadState('networkidle');

    const userProfileButton = page.locator('button[class*="profile"], button[title*="User"], span.uiImage[class*="profile"]').first();
    await expect(userProfileButton).toBeVisible({ timeout: 10000 });
    console.log('Perfil de usuario visible');

    // ========================================
    // PASO 4: Navegar a Setup
    // ========================================
    console.log('Paso 4: Navegando a Setup...');
    const instanceUrl = sfAuth.getInstanceUrl();
    await page.goto(`${instanceUrl}/lightning/setup/SetupOneHome/home`);
    await page.waitForLoadState('networkidle');

    // Verificar que estamos en la página de Setup
    await expect(page).toHaveURL(/lightning\/setup/, { timeout: 15000 });

    const setupTitle = page.locator('h1, h2, span').filter({ hasText: /Setup|Configuration/i }).first();
    await expect(setupTitle).toBeVisible({ timeout: 10000 });
    console.log('Navegación a Setup exitosa');

    // Volver al Home
    await page.goto(`${instanceUrl}/lightning/page/home`);
    await page.waitForLoadState('networkidle');

    // ========================================
    // PASO 5: Búsqueda global
    // ========================================
    console.log('Paso 5: Ejecutando búsqueda global...');
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    await searchInput.fill('Account');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);
    console.log('Búsqueda global ejecutada');

    // ========================================
    // FINALIZACIÓN
    // ========================================
    console.log('Test completo: Todas las validaciones ejecutadas exitosamente');
  });

});

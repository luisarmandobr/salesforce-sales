import { Page } from '@playwright/test';

/**
 * Clase helper para gestionar la autenticación de Salesforce
 * Usa el login directo del navegador para evitar problemas con SOAP API
 */
export class SalesforceAuth {
  private username: string;
  private password: string;
  private loginUrl: string;
  private instanceUrl: string | null = null;
  private isAuthenticated: boolean = false;

  constructor(username: string, password: string, loginUrl: string = 'https://login.salesforce.com') {
    this.username = username;
    this.password = password;
    this.loginUrl = loginUrl;
  }

  /**
   * Realiza el login directamente en el navegador usando el formulario de Salesforce
   * 
   * @param page - Página de Playwright
   * @param retUrl - URL de retorno después de la autenticación (opcional)
   */
  async loginWithFrontDoor(page: Page, retUrl: string = '/lightning/page/home'): Promise<void> {
    try {
      console.log('🔐 Iniciando login en Salesforce...');
      
      // Navegar a la página de login
      await page.goto(this.loginUrl, { waitUntil: 'domcontentloaded' });

      // Esperar y llenar el campo de username
      const usernameInput = page.locator('#username');
      await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
      await usernameInput.fill(this.username);
      console.log('   ✓ Username ingresado');

      // Llenar el campo de password
      const passwordInput = page.locator('#password');
      await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
      await passwordInput.fill(this.password);
      console.log('   ✓ Password ingresado');

      // Hacer clic en el botón de login
      const loginButton = page.locator('#Login');
      await loginButton.click();
      console.log('   ✓ Botón de login presionado');

      // Esperar a que la navegación complete
      await page.waitForLoadState('networkidle', { timeout: 30000 });

      // Verificar que estamos autenticados (debería redirigir a Lightning)
      const currentUrl = page.url();
      
      // Extraer el instance URL de la URL actual
      if (currentUrl.includes('lightning.force.com') || currentUrl.includes('my.salesforce.com')) {
        const urlObj = new URL(currentUrl);
        this.instanceUrl = `${urlObj.protocol}//${urlObj.host}`;
        this.isAuthenticated = true;
        
        console.log('✅ Login exitoso');
        console.log(`   Instance URL: ${this.instanceUrl}`);
        
        // Si se especificó una URL de retorno diferente, navegar a ella
        if (retUrl && !currentUrl.includes(retUrl)) {
          await page.goto(`${this.instanceUrl}${retUrl}`, { waitUntil: 'networkidle' });
          console.log(`   Navegado a: ${retUrl}`);
        }
      } else {
        throw new Error(`No se pudo verificar la autenticación. URL actual: ${currentUrl}`);
      }

    } catch (error) {
      console.error('❌ Error en el login:', error);
      throw error;
    }
  }

  /**
   * Obtiene el Session ID actual
   */
  getSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Obtiene el Instance URL actual
   */
  getInstanceUrl(): string {
    if (!this.instanceUrl) {
      throw new Error('Instance URL no disponible. Debes autenticarte primero.');
    }
    return this.instanceUrl;
  }

  /**
   * Limpia las Instance URL actual
   */
  getInstanceUrl(): string {
    if (!this.instanceUrl) {
      throw new Error('Instance URL no disponible. Debes autenticarte primero.');
    }
    return this.instanceUrl;
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  if (!username || !password) {
    throw new Error('SF_USERNAME y SF_PASSWORD deben estar definidos en el archivo .env');
  }

  return new SalesforceAuth(username, password, baseUrl);
}

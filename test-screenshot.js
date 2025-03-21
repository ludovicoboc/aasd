const { chromium } = require('@playwright/test');

(async () => {
  // Ignorando as mensagens de erro de dependências faltantes
  process.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = '1';
  
  const browser = await chromium.launch({
    headless: true,
    // Ignorando os erros de sandbox se necessário
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('Navegando para https://stayfocus-main.vercel.app/');
    await page.goto('https://stayfocus-main.vercel.app/', { waitUntil: 'networkidle' });
    console.log('Página carregada');
    
    // Tirar screenshots de diferentes partes da página
    await page.screenshot({ path: 'screenshot-full.png', fullPage: true });
    console.log('Screenshot da página completa salvo em screenshot-full.png');
    
    await page.screenshot({ path: 'screenshot-viewport.png' });
    console.log('Screenshot da viewport salvo em screenshot-viewport.png');
    
    // Informações sobre a página
    const title = await page.title();
    console.log('Título da página:', title);
    
    // Verificar elementos da UI
    const headings = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('h1, h2, h3')).map(h => ({
        type: h.tagName,
        text: h.innerText,
      }));
    });
    
    console.log('Cabeçalhos encontrados:', JSON.stringify(headings, null, 2));
    
  } catch (error) {
    console.error('Erro durante a execução:', error);
  } finally {
    await browser.close();
  }
})(); 
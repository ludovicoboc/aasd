const { chromium } = require('@playwright/test');

(async () => {
  // Ignorando as mensagens de erro de dependências faltantes
  process.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = '1';
  
  const browser = await chromium.launch({
    headless: true,
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
    
    // Análise de cores e contraste
    const colorReport = await page.evaluate(() => {
      // Obter todas as cores de fundo e texto
      const elements = document.querySelectorAll('*');
      const colors = new Set();
      const bgColors = new Set();
      
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const color = style.color;
        const bgColor = style.backgroundColor;
        
        if (color && color !== 'rgba(0, 0, 0, 0)') colors.add(color);
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') bgColors.add(bgColor);
      });
      
      return {
        textColors: Array.from(colors),
        backgroundColors: Array.from(bgColors)
      };
    });
    
    console.log('Análise de cores:');
    console.log(JSON.stringify(colorReport, null, 2));
    
    // Verificar botões e interações
    const buttonsReport = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button')).map(btn => ({
        text: btn.innerText,
        hasAriaLabel: btn.hasAttribute('aria-label'),
        ariaLabel: btn.getAttribute('aria-label'),
        disabled: btn.disabled,
        visible: btn.offsetParent !== null
      }));
      
      return { buttons };
    });
    
    console.log('Análise de botões:');
    console.log(JSON.stringify(buttonsReport, null, 2));
    
    // Verificar componentes interativos
    const interactiveReport = await page.evaluate(() => {
      const interactiveElements = Array.from(
        document.querySelectorAll('input, select, textarea, a, button')
      ).map(el => ({
        type: el.tagName,
        inputType: el.type,
        placeholder: el.placeholder,
        hasLabel: el.hasAttribute('aria-label')
      }));
      
      return { interactiveElements };
    });
    
    console.log('Elementos interativos:');
    console.log(JSON.stringify(interactiveReport, null, 2));
    
    // Análise de layout responsivo
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1280, height: 720, name: 'desktop' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      console.log(`Testando viewport ${viewport.name}: ${viewport.width}x${viewport.height}`);
      await page.screenshot({ path: `screenshot-${viewport.name}.png` });
      console.log(`Screenshot salvo como screenshot-${viewport.name}.png`);
    }
    
    // Componentes principais da UI
    const uiComponents = await page.evaluate(() => {
      return {
        mainSections: Array.from(document.querySelectorAll('main, section')).map(section => ({
          tag: section.tagName,
          childrenCount: section.children.length
        })),
        navigation: !!document.querySelector('nav'),
        hasSidebar: !!document.querySelector('aside'),
        hasFooter: !!document.querySelector('footer'),
        fontSizes: [...new Set(Array.from(document.querySelectorAll('*')).map(el => 
          window.getComputedStyle(el).fontSize))]
      };
    });
    
    console.log('Componentes principais da UI:');
    console.log(JSON.stringify(uiComponents, null, 2));
    
    // Capturar elementos específicos
    await page.screenshot({ path: 'header.png', clip: { x: 0, y: 0, width: 1280, height: 100 } });
    console.log('Captura do cabeçalho salva em header.png');
    
    // Localizar elementos importantes e tirar screenshots deles
    const mainElements = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('main > *')).map((el, index) => {
        const rect = el.getBoundingClientRect();
        return {
          index,
          tag: el.tagName,
          text: el.innerText.substring(0, 50) + (el.innerText.length > 50 ? '...' : ''),
          rect: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          }
        };
      });
    });
    
    console.log('Elementos principais:');
    console.log(JSON.stringify(mainElements, null, 2));
    
    // Tirar screenshots dos elementos principais
    for (const [index, element] of mainElements.entries()) {
      if (element.rect.width > 0 && element.rect.height > 0) {
        await page.screenshot({ 
          path: `element-${index}.png`, 
          clip: element.rect 
        });
        console.log(`Screenshot do elemento ${index} salvo`);
      }
    }
    
  } catch (error) {
    console.error('Erro durante a execução:', error);
  } finally {
    await browser.close();
  }
})(); 
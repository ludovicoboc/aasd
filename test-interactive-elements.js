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
    
    // Analisar botões e suas ações
    const buttonsReport = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button')).map(btn => {
        // Capturar eventos de clique registrados
        const clickHandlers = btn.onclick ? 'tem onclick' : 'sem onclick';
        
        // Verificar posição e visibilidade
        const rect = btn.getBoundingClientRect();
        const style = window.getComputedStyle(btn);
        
        return {
          text: btn.innerText.trim() || '[sem texto]',
          ariaLabel: btn.getAttribute('aria-label') || '[sem aria-label]',
          classes: btn.className,
          position: {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(rect.width),
            height: Math.round(rect.height)
          },
          styles: {
            backgroundColor: style.backgroundColor,
            color: style.color,
            borderRadius: style.borderRadius,
            padding: style.padding,
            margin: style.margin,
            fontSize: style.fontSize
          },
          clickHandlers
        };
      });
      
      return { buttons };
    });
    
    console.log('Análise detalhada de botões:');
    console.log(JSON.stringify(buttonsReport, null, 2));
    
    // Analisar inputs e campos de formulário
    const inputsReport = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, textarea, select')).map(input => {
        return {
          type: input.tagName,
          inputType: input.type,
          name: input.name,
          id: input.id,
          placeholder: input.placeholder,
          required: input.required,
          hasLabel: !!input.labels && input.labels.length > 0,
          hasAriaLabel: !!input.getAttribute('aria-label'),
          classes: input.className,
          styles: {
            width: window.getComputedStyle(input).width,
            height: window.getComputedStyle(input).height,
            padding: window.getComputedStyle(input).padding,
            border: window.getComputedStyle(input).border
          }
        };
      });
      
      return { inputs };
    });
    
    console.log('Análise de campos de entrada:');
    console.log(JSON.stringify(inputsReport, null, 2));
    
    // Analisar links
    const linksReport = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a')).map(link => {
        const rect = link.getBoundingClientRect();
        
        return {
          text: link.innerText.trim() || '[sem texto]',
          href: link.href,
          target: link.target,
          ariaLabel: link.getAttribute('aria-label'),
          position: {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            isVisible: rect.width > 0 && rect.height > 0
          },
          style: {
            color: window.getComputedStyle(link).color,
            textDecoration: window.getComputedStyle(link).textDecoration
          }
        };
      });
      
      return { links };
    });
    
    console.log('Análise de links:');
    console.log(JSON.stringify(linksReport, null, 2));
    
    // Análise de feedback visual
    const feedbackReport = await page.evaluate(() => {
      // Identificar elementos com estados de hover, focus, active
      const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
      const hoverStates = [];
      
      interactiveElements.forEach((el, index) => {
        // Só podemos simular pela verificação de estilos, não pelo evento real
        const computedStyle = window.getComputedStyle(el);
        const hasTransition = computedStyle.transition !== 'all 0s ease 0s';
        const hasCursor = computedStyle.cursor === 'pointer';
        
        hoverStates.push({
          element: el.tagName + (el.className ? ' (' + el.className + ')' : ''),
          hasTransition,
          hasCursor,
          feedbackEstimated: hasTransition || hasCursor
        });
      });
      
      return { hoverStates };
    });
    
    console.log('Análise de feedback visual:');
    console.log(JSON.stringify(feedbackReport, null, 2));
    
  } catch (error) {
    console.error('Erro durante a execução:', error);
  } finally {
    await browser.close();
  }
})(); 
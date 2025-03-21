const { chromium } = require('@playwright/test');
const fs = require('fs').promises;
const path = require('path');

// Lista de páginas para analisar
const pages = [
  { url: 'https://stayfocus-main.vercel.app/', name: 'home' },
  { url: 'https://stayfocus-main.vercel.app/alimentacao', name: 'alimentacao' },
  { url: 'https://stayfocus-main.vercel.app/sono', name: 'sono' },
  { url: 'https://stayfocus-main.vercel.app/lazer', name: 'lazer' },
  { url: 'https://stayfocus-main.vercel.app/estudos', name: 'estudos' },
  { url: 'https://stayfocus-main.vercel.app/saude', name: 'saude' },
  { url: 'https://stayfocus-main.vercel.app/financas', name: 'financas' },
  { url: 'https://stayfocus-main.vercel.app/hiperfocos', name: 'hiperfocos' },
  { url: 'https://stayfocus-main.vercel.app/autoconhecimento', name: 'autoconhecimento' },
  { url: 'https://stayfocus-main.vercel.app/roadmap', name: 'roadmap' },
  { url: 'https://stayfocus-main.vercel.app/perfil', name: 'perfil' },
  { url: 'https://stayfocus-main.vercel.app/perfil/ajuda', name: 'ajuda' }
];

// Configurar diretório de saída
const outputDir = './analise-multiplas-paginas';

// Funções de análise
async function analisarCores(page) {
  return page.evaluate(() => {
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
}

async function analisarBotoes(page) {
  return page.evaluate(() => {
    return {
      buttons: Array.from(document.querySelectorAll('button')).map(btn => ({
        text: btn.innerText.trim() || '[sem texto]',
        ariaLabel: btn.getAttribute('aria-label') || '[sem aria-label]',
        hasAriaLabel: !!btn.getAttribute('aria-label'),
        disabled: btn.disabled,
        visible: btn.offsetParent !== null
      }))
    };
  });
}

async function analisarInterativos(page) {
  return page.evaluate(() => {
    return {
      interactiveElements: Array.from(
        document.querySelectorAll('input, select, textarea, a, button')
      ).map(el => ({
        type: el.tagName,
        inputType: el.type,
        placeholder: el.placeholder,
        hasLabel: el.hasAttribute('aria-label')
      }))
    };
  });
}

async function analisarEstruturaUI(page) {
  return page.evaluate(() => {
    return {
      title: document.title,
      headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => ({
        type: h.tagName,
        text: h.innerText,
      })),
      mainSections: Array.from(document.querySelectorAll('main, section')).map(section => ({
        tag: section.tagName,
        childrenCount: section.children.length
      })),
      hasNavigation: !!document.querySelector('nav'),
      hasSidebar: !!document.querySelector('aside'),
      hasFooter: !!document.querySelector('footer'),
      fontSizes: [...new Set(Array.from(document.querySelectorAll('*')).map(el => 
        window.getComputedStyle(el).fontSize))]
    };
  });
}

// Função principal
(async () => {
  // Ignorando as mensagens de erro de dependências faltantes
  process.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = '1';
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  // Criar diretório de saída se não existir
  try {
    await fs.mkdir(outputDir, { recursive: true });
    console.log(`Diretório ${outputDir} criado ou já existente`);
  } catch (err) {
    console.error(`Erro ao criar diretório ${outputDir}:`, err);
  }
  
  // Viewports para testar responsividade
  const viewports = [
    { width: 375, height: 667, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1280, height: 720, name: 'desktop' }
  ];
  
  // Relatório completo
  const relatorioCompleto = {
    dataAnalise: new Date().toISOString(),
    paginas: []
  };
  
  // Analisar cada página
  for (const pagina of pages) {
    console.log(`\n====== ANALISANDO ${pagina.name.toUpperCase()} ======`);
    console.log(`URL: ${pagina.url}`);
    
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    const paginaDir = path.join(outputDir, pagina.name);
    
    try {
      // Criar diretório para a página
      await fs.mkdir(paginaDir, { recursive: true });
      
      // Navegar para a página
      console.log(`Navegando para ${pagina.url}`);
      await page.goto(pagina.url, { waitUntil: 'networkidle', timeout: 60000 });
      console.log('Página carregada');
      
      // Capturar screenshots em diferentes resoluções
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        const screenshotPath = path.join(paginaDir, `${pagina.name}-${viewport.name}.png`);
        await page.screenshot({ path: screenshotPath });
        console.log(`Screenshot ${viewport.name} salvo em ${screenshotPath}`);
      }
      
      // Voltar para desktop para análises
      await page.setViewportSize({ width: 1280, height: 720 });
      
      // Capturar screenshot da página completa
      const fullScreenshotPath = path.join(paginaDir, `${pagina.name}-full.png`);
      await page.screenshot({ path: fullScreenshotPath, fullPage: true });
      console.log(`Screenshot página completa salvo em ${fullScreenshotPath}`);
      
      // Capturar cabeçalho
      const headerScreenshotPath = path.join(paginaDir, `${pagina.name}-header.png`);
      await page.screenshot({ 
        path: headerScreenshotPath, 
        clip: { x: 0, y: 0, width: 1280, height: 100 } 
      });
      
      // Fazer análises
      const coresAnalise = await analisarCores(page);
      const botoesAnalise = await analisarBotoes(page);
      const interativosAnalise = await analisarInterativos(page);
      const estruturaAnalise = await analisarEstruturaUI(page);
      
      // Combinar relatório
      const relatorio = {
        nome: pagina.name,
        url: pagina.url,
        titulo: estruturaAnalise.title,
        estrutura: estruturaAnalise,
        cores: coresAnalise,
        botoes: botoesAnalise.buttons.length,
        interativos: interativosAnalise.interactiveElements.length,
        screenshots: {
          mobile: `${pagina.name}-mobile.png`,
          tablet: `${pagina.name}-tablet.png`,
          desktop: `${pagina.name}-desktop.png`,
          full: `${pagina.name}-full.png`,
          header: `${pagina.name}-header.png`
        }
      };
      
      // Salvar relatório individual
      const relatorioPath = path.join(paginaDir, `${pagina.name}-analise.json`);
      await fs.writeFile(relatorioPath, JSON.stringify({
        ...relatorio,
        detalhes: {
          cores: coresAnalise,
          botoes: botoesAnalise,
          interativos: interativosAnalise,
          estrutura: estruturaAnalise
        }
      }, null, 2));
      console.log(`Relatório detalhado salvo em ${relatorioPath}`);
      
      // Adicionar ao relatório completo
      relatorioCompleto.paginas.push(relatorio);
      
    } catch (error) {
      console.error(`Erro ao analisar ${pagina.name}:`, error);
      
      // Adicionar erro ao relatório
      relatorioCompleto.paginas.push({
        nome: pagina.name,
        url: pagina.url,
        erro: error.message
      });
    } finally {
      await context.close();
    }
  }
  
  // Salvar relatório completo
  const relatorioCompletoPath = path.join(outputDir, 'relatorio-completo.json');
  await fs.writeFile(relatorioCompletoPath, JSON.stringify(relatorioCompleto, null, 2));
  console.log(`\nRelatório completo salvo em ${relatorioCompletoPath}`);
  
  await browser.close();
  console.log('\n====== ANÁLISE CONCLUÍDA ======');
})().catch(error => {
  console.error('Erro durante a execução:', error);
  process.exit(1);
}); 
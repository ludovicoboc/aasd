const fs = require('fs').promises;
const path = require('path');

const diretorioAnalise = './analise-multiplas-paginas';

async function lerRelatorioCompleto() {
  const dados = await fs.readFile(path.join(diretorioAnalise, 'relatorio-completo.json'), 'utf8');
  return JSON.parse(dados);
}

async function analisarConsistencia() {
  const relatorio = await lerRelatorioCompleto();
  
  // Coletar todas as cores usadas em todas as páginas
  const todasCores = {
    texto: new Map(),
    fundo: new Map()
  };
  
  // Coletar todos os tamanhos de fonte
  const tamanhosFonte = new Map();
  
  // Coletar estrutura de cabeçalhos
  const estruturas = new Map();
  
  // Contagem de botões com aria-label por página
  const estatisticasAcessibilidade = [];
  
  // Processar cada página
  for (const pagina of relatorio.paginas) {
    // Pular páginas com erro
    if (pagina.erro) continue;
    
    // Analisar detalhes da página
    const detalhesPath = path.join(diretorioAnalise, pagina.nome, `${pagina.nome}-analise.json`);
    const detalhesRaw = await fs.readFile(detalhesPath, 'utf8');
    const detalhes = JSON.parse(detalhesRaw);
    
    // Contar cores
    if (detalhes.detalhes.cores.textColors) {
      detalhes.detalhes.cores.textColors.forEach(cor => {
        const count = todasCores.texto.get(cor) || 0;
        todasCores.texto.set(cor, count + 1);
      });
    }
    
    if (detalhes.detalhes.cores.backgroundColors) {
      detalhes.detalhes.cores.backgroundColors.forEach(cor => {
        const count = todasCores.fundo.get(cor) || 0;
        todasCores.fundo.set(cor, count + 1);
      });
    }
    
    // Contar tamanhos de fonte
    if (detalhes.detalhes.estrutura.fontSizes) {
      detalhes.detalhes.estrutura.fontSizes.forEach(tamanho => {
        const count = tamanhosFonte.get(tamanho) || 0;
        tamanhosFonte.set(tamanho, count + 1);
      });
    }
    
    // Analisar estrutura de cabeçalhos
    if (detalhes.detalhes.estrutura.headings) {
      const headingKey = detalhes.detalhes.estrutura.headings.map(h => `${h.type}:${h.text}`).join('|');
      const count = estruturas.get(headingKey) || 0;
      estruturas.set(headingKey, count + 1);
    }
    
    // Análise de acessibilidade (botões com aria-label)
    if (detalhes.detalhes.botoes && detalhes.detalhes.botoes.buttons) {
      const totalBotoes = detalhes.detalhes.botoes.buttons.length;
      const botoesComAriaLabel = detalhes.detalhes.botoes.buttons.filter(b => b.hasAriaLabel).length;
      const percentualAcessibilidade = totalBotoes > 0 ? (botoesComAriaLabel / totalBotoes) * 100 : 0;
      
      estatisticasAcessibilidade.push({
        pagina: pagina.nome,
        totalBotoes,
        botoesComAriaLabel,
        percentualAcessibilidade: Math.round(percentualAcessibilidade * 100) / 100
      });
    }
  }
  
  // Ordenar cores por frequência
  const coresTextoOrdenadas = [...todasCores.texto.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([cor, count]) => ({ cor, count, percentual: Math.round((count / relatorio.paginas.length) * 100) }));
    
  const coresFundoOrdenadas = [...todasCores.fundo.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([cor, count]) => ({ cor, count, percentual: Math.round((count / relatorio.paginas.length) * 100) }));
  
  // Ordenar tamanhos de fonte por frequência
  const tamanhosFonteOrdenados = [...tamanhosFonte.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([tamanho, count]) => ({ tamanho, count, percentual: Math.round((count / relatorio.paginas.length) * 100) }));
  
  // Agrupar páginas por estrutura similar
  const estruturasPorFrequencia = [...estruturas.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([estrutura, count]) => ({ estrutura, count, percentual: Math.round((count / relatorio.paginas.length) * 100) }));
  
  // Ordenar estatísticas de acessibilidade
  estatisticasAcessibilidade.sort((a, b) => a.percentualAcessibilidade - b.percentualAcessibilidade);
  
  return {
    totalPaginas: relatorio.paginas.length,
    coresTexto: coresTextoOrdenadas,
    coresFundo: coresFundoOrdenadas,
    tamanhosFonte: tamanhosFonteOrdenados,
    estruturas: estruturasPorFrequencia,
    acessibilidade: {
      estatisticasPorPagina: estatisticasAcessibilidade,
      mediaAcessibilidade: estatisticasAcessibilidade.reduce((acc, curr) => acc + curr.percentualAcessibilidade, 0) / estatisticasAcessibilidade.length
    }
  };
}

async function gerarRelatorioConsistencia() {
  try {
    const analise = await analisarConsistencia();
    
    // Determinar cores primárias (aquelas usadas em mais de 80% das páginas)
    const coresPrimariasTexto = analise.coresTexto.filter(c => c.percentual >= 80);
    const coresPrimariasFundo = analise.coresFundo.filter(c => c.percentual >= 80);
    
    // Determinar tamanhos de fonte predominantes (usados em mais de 80% das páginas)
    const tamanhosFontePredominantes = analise.tamanhosFonte.filter(t => t.percentual >= 80);
    
    // Gerar relatório em Markdown
    let relatorioMd = `# Relatório de Consistência - StayFocus

## Resumo da Análise

Foram analisadas ${analise.totalPaginas} páginas da aplicação StayFocus para verificar a consistência visual,
estrutural e de acessibilidade entre elas.

## Consistência de Cores

### Cores de Texto Principais
${coresPrimariasTexto.map(c => `- \`${c.cor}\`: presente em ${c.percentual}% das páginas`).join('\n')}

### Cores de Texto Secundárias (top 5)
${analise.coresTexto.filter(c => c.percentual < 80).slice(0, 5).map(c => `- \`${c.cor}\`: presente em ${c.percentual}% das páginas`).join('\n')}

### Cores de Fundo Principais
${coresPrimariasFundo.map(c => `- \`${c.cor}\`: presente em ${c.percentual}% das páginas`).join('\n')}

### Cores de Fundo Secundárias (top 5)
${analise.coresFundo.filter(c => c.percentual < 80).slice(0, 5).map(c => `- \`${c.cor}\`: presente em ${c.percentual}% das páginas`).join('\n')}

## Consistência de Tipografia

### Tamanhos de Fonte Predominantes
${tamanhosFontePredominantes.map(t => `- \`${t.tamanho}\`: presente em ${t.percentual}% das páginas`).join('\n')}

### Tamanhos de Fonte Secundários (top 5)
${analise.tamanhosFonte.filter(t => t.percentual < 80).slice(0, 5).map(t => `- \`${t.tamanho}\`: presente em ${t.percentual}% das páginas`).join('\n')}

## Estrutura de Páginas

Foram identificados ${analise.estruturas.length} padrões de estrutura diferentes entre as páginas.

### Estruturas mais comuns

${analise.estruturas.slice(0, 3).map((e, i) => `#### Padrão ${i+1} (${e.percentual}% das páginas)
\`\`\`
${e.estrutura}
\`\`\``).join('\n\n')}

## Acessibilidade

A média de botões com atributos aria-label na aplicação é de **${Math.round(analise.acessibilidade.mediaAcessibilidade)}%**.

### Páginas com menor conformidade em acessibilidade

${analise.acessibilidade.estatisticasPorPagina.slice(0, 3).map(p => `- **${p.pagina}**: ${p.percentualAcessibilidade}% dos botões possuem aria-label (${p.botoesComAriaLabel}/${p.totalBotoes})`).join('\n')}

### Páginas com maior conformidade em acessibilidade

${analise.acessibilidade.estatisticasPorPagina.slice(-3).reverse().map(p => `- **${p.pagina}**: ${p.percentualAcessibilidade}% dos botões possuem aria-label (${p.botoesComAriaLabel}/${p.totalBotoes})`).join('\n')}

## Conclusões

${coresPrimariasTexto.length + coresPrimariasFundo.length >= 10 ? 
  "A aplicação apresenta muitas cores de base, o que pode comprometer a consistência visual." : 
  "A aplicação mantém uma paleta de cores relativamente consistente em todas as páginas."}

${tamanhosFontePredominantes.length > 6 ? 
  "Existe uma grande variação nos tamanhos de fonte utilizados, o que pode afetar a hierarquia visual." : 
  "Os tamanhos de fonte são relativamente consistentes entre as páginas."}

${analise.acessibilidade.mediaAcessibilidade >= 95 ? 
  "A acessibilidade por meio de aria-labels em botões está muito boa na maioria das páginas." : 
  analise.acessibilidade.mediaAcessibilidade >= 80 ? 
  "A acessibilidade por meio de aria-labels em botões está boa, mas pode ser melhorada em algumas páginas." : 
  "Há uma necessidade de melhorar a acessibilidade por meio de aria-labels em botões em várias páginas."}

## Recomendações

1. ${coresPrimariasTexto.length + coresPrimariasFundo.length >= 10 ? 
    "Reduzir a paleta de cores para melhorar a consistência visual" : 
    "Manter a atual paleta de cores que apresenta boa consistência"}
   
2. ${tamanhosFontePredominantes.length > 6 ? 
    "Padronizar os tamanhos de fonte para melhorar a hierarquia visual" : 
    "Continuar utilizando os tamanhos de fonte atuais que apresentam boa consistência"}
   
3. ${analise.acessibilidade.mediaAcessibilidade >= 95 ? 
    "Manter o excelente padrão de acessibilidade com aria-labels" : 
    "Melhorar a implementação de aria-labels nos botões, especialmente nas páginas " + 
    analise.acessibilidade.estatisticasPorPagina.slice(0, 3).map(p => p.pagina).join(", ")}
   
4. ${analise.estruturas.length > 3 ? 
    "Padronizar a estrutura das páginas para proporcionar uma experiência mais consistente" : 
    "Manter a atual estrutura das páginas que apresenta boa consistência"}
   
5. Continuar priorizando a simplicidade e o foco nas necessidades dos usuários neurodivergentes.

`;
    
    // Salvar relatório
    const relatorioPath = path.join(diretorioAnalise, 'relatorio-consistencia.md');
    await fs.writeFile(relatorioPath, relatorioMd);
    console.log(`Relatório de consistência salvo em ${relatorioPath}`);
    
    // Salvar dados brutos
    const dadosPath = path.join(diretorioAnalise, 'analise-consistencia.json');
    await fs.writeFile(dadosPath, JSON.stringify(analise, null, 2));
    console.log(`Dados brutos da análise salvos em ${dadosPath}`);
    
    return relatorioMd;
  } catch (error) {
    console.error('Erro ao gerar relatório de consistência:', error);
    throw error;
  }
}

// Executar análise
gerarRelatorioConsistencia().catch(console.error); 
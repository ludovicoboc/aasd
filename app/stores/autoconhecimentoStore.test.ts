// app/stores/autoconhecimentoStore.test.ts
import { useAutoconhecimentoStore, Nota } from './autoconhecimentoStore';
import { act } from '@testing-library/react';

// Helper para resetar o estado antes de cada teste
const resetStore = () => useAutoconhecimentoStore.setState(useAutoconhecimentoStore.getInitialState());

describe('useAutoconhecimentoStore', () => {
  beforeEach(() => {
    resetStore();
  });

  it('deve adicionar uma nova nota', () => {
    const { adicionarNota } = useAutoconhecimentoStore.getState();
    const notasIniciais = useAutoconhecimentoStore.getState().notas.length;

    let novaNotaId = '';
    act(() => {
      novaNotaId = adicionarNota('Nota Teste', 'Conteúdo da nota', 'quem-sou', ['tag1', 'tag2']);
    });

    const estadoAtualizado = useAutoconhecimentoStore.getState();
    expect(estadoAtualizado.notas.length).toBe(notasIniciais + 1);
    const notaAdicionada = estadoAtualizado.notas.find(n => n.id === novaNotaId);
    expect(notaAdicionada).toBeDefined();
    expect(notaAdicionada?.titulo).toBe('Nota Teste');
    expect(notaAdicionada?.secao).toBe('quem-sou');
    expect(notaAdicionada?.tags).toEqual(['tag1', 'tag2']);
  });

  it('deve atualizar uma nota existente', () => {
    const { adicionarNota, atualizarNota } = useAutoconhecimentoStore.getState();
    let notaId = '';
    act(() => {
      notaId = adicionarNota('Nota Original', 'Conteúdo original', 'meus-porques');
    });

    act(() => {
      atualizarNota(notaId, { titulo: 'Nota Atualizada', conteudo: 'Conteúdo atualizado' });
    });

    const notaAtualizada = useAutoconhecimentoStore.getState().notas.find(n => n.id === notaId);
    expect(notaAtualizada?.titulo).toBe('Nota Atualizada');
    expect(notaAtualizada?.conteudo).toBe('Conteúdo atualizado');
    expect(notaAtualizada?.secao).toBe('meus-porques'); // Seção não deve mudar
  });

  it('deve remover uma nota', () => {
    const { adicionarNota, removerNota } = useAutoconhecimentoStore.getState();
    let notaId = '';
    act(() => {
      notaId = adicionarNota('Nota para Remover', 'Conteúdo', 'meus-padroes');
    });
    const notasAntes = useAutoconhecimentoStore.getState().notas.length;

    act(() => {
      removerNota(notaId);
    });

    expect(useAutoconhecimentoStore.getState().notas.length).toBe(notasAntes - 1);
    expect(useAutoconhecimentoStore.getState().notas.find(n => n.id === notaId)).toBeUndefined();
  });

  it('deve adicionar uma tag a uma nota', () => {
    const { adicionarNota, adicionarTag } = useAutoconhecimentoStore.getState();
    let notaId = '';
    act(() => {
      notaId = adicionarNota('Nota Tags', 'Conteúdo', 'quem-sou');
    });

    act(() => {
      adicionarTag(notaId, 'nova-tag');
    });

    const nota = useAutoconhecimentoStore.getState().notas.find(n => n.id === notaId);
    expect(nota?.tags).toContain('nova-tag');
  });

  it('não deve adicionar uma tag duplicada', () => {
    const { adicionarNota, adicionarTag } = useAutoconhecimentoStore.getState();
    let notaId = '';
    act(() => {
      notaId = adicionarNota('Nota Tags Dup', 'Conteúdo', 'quem-sou', ['existente']);
    });

    act(() => {
      adicionarTag(notaId, 'existente'); // Tenta adicionar a mesma tag
    });

    const nota = useAutoconhecimentoStore.getState().notas.find(n => n.id === notaId);
    expect(nota?.tags.filter(t => t === 'existente').length).toBe(1); // Deve ter apenas uma
  });

  it('deve remover uma tag de uma nota', () => {
    const { adicionarNota, removerTag } = useAutoconhecimentoStore.getState();
    let notaId = '';
    act(() => {
      notaId = adicionarNota('Nota Tags Rem', 'Conteúdo', 'quem-sou', ['tag-a-remover', 'tag-manter']);
    });

    act(() => {
      removerTag(notaId, 'tag-a-remover');
    });

    const nota = useAutoconhecimentoStore.getState().notas.find(n => n.id === notaId);
    expect(nota?.tags).not.toContain('tag-a-remover');
    expect(nota?.tags).toContain('tag-manter');
  });

  it('deve adicionar uma imagem a uma nota', () => {
    const { adicionarNota, adicionarImagem } = useAutoconhecimentoStore.getState();
    let notaId = '';
    const urlImagem = 'http://example.com/imagem.jpg';
    act(() => {
      notaId = adicionarNota('Nota Imagem', 'Conteúdo', 'meus-porques');
    });

    act(() => {
      adicionarImagem(notaId, urlImagem);
    });

    const nota = useAutoconhecimentoStore.getState().notas.find(n => n.id === notaId);
    expect(nota?.imagemUrl).toBe(urlImagem);
  });

  it('deve remover uma imagem de uma nota', () => {
    const { adicionarNota, adicionarImagem, removerImagem } = useAutoconhecimentoStore.getState();
    let notaId = '';
    const urlImagem = 'http://example.com/imagem.jpg';
    act(() => {
      notaId = adicionarNota('Nota Imagem Rem', 'Conteúdo', 'meus-porques');
      adicionarImagem(notaId, urlImagem); // Adiciona primeiro
    });

    expect(useAutoconhecimentoStore.getState().notas.find(n => n.id === notaId)?.imagemUrl).toBe(urlImagem);

    act(() => {
      removerImagem(notaId);
    });

    const nota = useAutoconhecimentoStore.getState().notas.find(n => n.id === notaId);
    expect(nota?.imagemUrl).toBeUndefined();
  });

  it('deve alternar o modo refúgio', () => {
    const { alternarModoRefugio } = useAutoconhecimentoStore.getState();
    const modoInicial = useAutoconhecimentoStore.getState().modoRefugio;

    act(() => {
      alternarModoRefugio();
    });
    expect(useAutoconhecimentoStore.getState().modoRefugio).toBe(!modoInicial);

    act(() => {
      alternarModoRefugio();
    });
    expect(useAutoconhecimentoStore.getState().modoRefugio).toBe(modoInicial);
  });

  it('deve buscar notas pelo título, conteúdo ou tag', () => {
    const { adicionarNota, buscarNotas } = useAutoconhecimentoStore.getState();
    act(() => {
      adicionarNota('Busca Título', 'Conteúdo normal', 'quem-sou', ['tag-comum']);
      adicionarNota('Outro Título', 'Conteúdo com busca', 'meus-porques', ['tag-comum']);
      adicionarNota('Título Final', 'Conteúdo normal', 'meus-padroes', ['tag-busca']);
    });

    let resultados = buscarNotas('busca');
    expect(resultados.length).toBe(3); // Deve encontrar pelo título, conteúdo e tag

    resultados = buscarNotas('tag-busca');
    expect(resultados.length).toBe(1); // Deve encontrar pela tag

    resultados = buscarNotas('tag-comum');
    expect(resultados.length).toBe(2); // Deve encontrar pela tag comum

    resultados = buscarNotas('termo inexistente');
    expect(resultados.length).toBe(0);
  });
});
// app/stores/alimentacaoStore.test.ts
import { useAlimentacaoStore } from './alimentacaoStore';
import { act } from '@testing-library/react'; // Import act for state updates

// Helper para resetar o estado antes de cada teste
const resetStore = () => useAlimentacaoStore.setState(useAlimentacaoStore.getInitialState());

describe('useAlimentacaoStore', () => {
  beforeEach(() => {
    resetStore();
  });

  it('deve adicionar uma refeição corretamente', () => {
    const { adicionarRefeicao, refeicoes } = useAlimentacaoStore.getState();
    const horarioInicial = refeicoes.length;

    act(() => {
      adicionarRefeicao('08:00', 'Torradas com abacate');
    });

    const estadoAtualizado = useAlimentacaoStore.getState();
    expect(estadoAtualizado.refeicoes.length).toBe(horarioInicial + 1);
    expect(estadoAtualizado.refeicoes[horarioInicial].horario).toBe('08:00');
    expect(estadoAtualizado.refeicoes[horarioInicial].descricao).toBe('Torradas com abacate');
  });

  it('deve atualizar uma refeição existente', () => {
    const { adicionarRefeicao, atualizarRefeicao } = useAlimentacaoStore.getState();
    let idRefeicao = '';

    // Adiciona uma refeição para ter o que atualizar
    act(() => {
      adicionarRefeicao('10:00', 'Fruta');
      idRefeicao = useAlimentacaoStore.getState().refeicoes.find(r => r.horario === '10:00')?.id || '';
    });

    expect(idRefeicao).not.toBe(''); // Garante que a refeição foi adicionada

    act(() => {
      atualizarRefeicao(idRefeicao, '10:15', 'Maçã');
    });

    const refeicaoAtualizada = useAlimentacaoStore.getState().refeicoes.find(r => r.id === idRefeicao);
    expect(refeicaoAtualizada?.horario).toBe('10:15');
    expect(refeicaoAtualizada?.descricao).toBe('Maçã');
  });

  it('deve remover uma refeição', () => {
     const { adicionarRefeicao, removerRefeicao } = useAlimentacaoStore.getState();
     let idRefeicao = '';
     const horarioInicial = useAlimentacaoStore.getState().refeicoes.length;

     act(() => {
       adicionarRefeicao('13:00', 'Salada');
       idRefeicao = useAlimentacaoStore.getState().refeicoes.find(r => r.horario === '13:00')?.id || '';
     });

     expect(useAlimentacaoStore.getState().refeicoes.length).toBe(horarioInicial + 1);

     act(() => {
       removerRefeicao(idRefeicao);
     });

     expect(useAlimentacaoStore.getState().refeicoes.length).toBe(horarioInicial);
     expect(useAlimentacaoStore.getState().refeicoes.find(r => r.id === idRefeicao)).toBeUndefined();
  });

  // --- Testes para Hidratação ---

  it('deve adicionar um copo de água', () => {
    const { adicionarCopo } = useAlimentacaoStore.getState();
    const coposIniciais = useAlimentacaoStore.getState().coposBebidos;

    act(() => {
      adicionarCopo();
    });

    expect(useAlimentacaoStore.getState().coposBebidos).toBe(coposIniciais + 1);
    expect(useAlimentacaoStore.getState().ultimoRegistro).not.toBeNull();
  });

  it('não deve adicionar copo além da meta', () => {
    const { adicionarCopo, ajustarMeta } = useAlimentacaoStore.getState();
    
    // Define meta como 1 e adiciona 1 copo
    act(() => {
      ajustarMeta(-7); // Meta inicial é 8, ajusta para 1
      adicionarCopo(); 
    });

    const coposAntes = useAlimentacaoStore.getState().coposBebidos;
    expect(coposAntes).toBe(1);

    // Tenta adicionar outro copo
    act(() => {
      adicionarCopo();
    });

    expect(useAlimentacaoStore.getState().coposBebidos).toBe(1); // Não deve aumentar
  });

  it('deve remover um copo de água', () => {
    const { adicionarCopo, removerCopo } = useAlimentacaoStore.getState();

    act(() => {
      adicionarCopo(); // Garante que há pelo menos 1 copo
    });
    const coposAntes = useAlimentacaoStore.getState().coposBebidos;

    act(() => {
      removerCopo();
    });

    expect(useAlimentacaoStore.getState().coposBebidos).toBe(coposAntes - 1);
  });

  it('não deve remover copo abaixo de zero', () => {
     const { removerCopo } = useAlimentacaoStore.getState();
     // Garante que está em 0
     while(useAlimentacaoStore.getState().coposBebidos > 0) {
        act(() => removerCopo());
     }
     expect(useAlimentacaoStore.getState().coposBebidos).toBe(0);

     act(() => {
       removerCopo();
     });

     expect(useAlimentacaoStore.getState().coposBebidos).toBe(0); // Não deve ser negativo
  });

  it('deve ajustar a meta diária', () => {
    const { ajustarMeta } = useAlimentacaoStore.getState();
    const metaInicial = useAlimentacaoStore.getState().metaDiaria;

    act(() => {
      ajustarMeta(2); // Aumenta em 2
    });
    expect(useAlimentacaoStore.getState().metaDiaria).toBe(metaInicial + 2);

    act(() => {
      ajustarMeta(-1); // Diminui em 1
    });
    expect(useAlimentacaoStore.getState().metaDiaria).toBe(metaInicial + 1);
  });

   it('não deve ajustar a meta abaixo de 1 ou acima de 15', () => {
     const { ajustarMeta } = useAlimentacaoStore.getState();
     
     // Tenta diminuir abaixo de 1
     act(() => {
        // Leva a meta para 1
        while(useAlimentacaoStore.getState().metaDiaria > 1) {
           ajustarMeta(-1);
        }
     });
     expect(useAlimentacaoStore.getState().metaDiaria).toBe(1);
     act(() => ajustarMeta(-1));
     expect(useAlimentacaoStore.getState().metaDiaria).toBe(1); // Não deve mudar

     // Tenta aumentar acima de 15
     act(() => {
        // Leva a meta para 15
        while(useAlimentacaoStore.getState().metaDiaria < 15) {
           ajustarMeta(1);
        }
     });
     expect(useAlimentacaoStore.getState().metaDiaria).toBe(15);
     act(() => ajustarMeta(1));
     expect(useAlimentacaoStore.getState().metaDiaria).toBe(15); // Não deve mudar
   });

  // Adicionar mais testes para RegistroRefeicao se necessário...
});
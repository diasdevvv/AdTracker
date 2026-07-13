# Walkthrough: White Mode, Contraste de Cards e Suporte com Ícone de Telefone

Reorganização completa do visual claro (white version), correção de contraste das caixas superiores de estatísticas (cards), suavização de linhas de grade do gráfico e atualização do ícone de suporte.

## Alterações Realizadas

1. **Correção de Contraste no Modo Claro**:
   - Os 5 cards de estatísticas superiores em `src/components/dashboard-cards.tsx` agora utilizam a classe `bg-card` e o seletor `dark:` para gradientes escuros, fazendo com que fiquem completamente brancos/claros no modo light.
   - Os números das estatísticas agora usam `text-foreground` em vez de `text-white`, garantindo que fiquem pretos em modo claro e brancos em modo escuro.
   - Ajustadas as cores das badges indicativas de status em cada card para variações de cinza, verde, violeta e vermelho de alta visibilidade e suavidade em ambos os modos.
   - Adicionadas regras globais em `globals.css` para suavizar e converter a cor das linhas de grade (`<line>` do SVG) para a cor da borda clara (`var(--border)`) quando em modo light.

2. **Suporte com Ícone de Telefone**:
   - O ícone de Suporte foi alterado para `Phone` (telefone) em ambos os menus suspensos de perfil (cabeçalho e rodapé).
   - O botão de suporte foi completamente removido da barra lateral de navegação (sidenar).

---

## Verificação e Build

- Executado o comando `npm run build` com sucesso sem erros.
- Alterações empurradas e atualizadas na branch principal do GitHub (`main`).

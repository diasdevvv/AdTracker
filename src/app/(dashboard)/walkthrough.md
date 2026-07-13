# Walkthrough: Geração de Dados de Teste e Gráfico de Evolução por Oferta

Implementação do gerador automático de 20 ofertas de teste com histórico diário simulado de 15 dias, e integração do gráfico de evolução de anúncios ativos individual por oferta.

## Alterações Realizadas

1. **Ação do Servidor `generateTestOffers`**:
   - Desenvolvida a Server Action em `src/app/(dashboard)/offers/actions.ts` que simula e insere 20 ofertas completas no banco de dados Supabase do usuário ativo.
   - Cada oferta é gerada com títulos, produtos, nichos e anunciantes altamente realistas da Meta Ad Library.
   - Popula a coluna `ads_history` de cada oferta com dados randômicos flutuantes ao longo dos últimos 15 dias, simulando histórico real de escala de anúncios.
   - A ação resolve para `Promise<void>`, sendo compatível nativamente com o atributo `action` de formulários HTML e Server Actions do Next.js.

2. **Gatilhos Visuais (Botões de Geração)**:
   - Adicionado botão "Gerar 20 Ofertas de Teste" com ícone de banco de dados na tela de listagem de ofertas (`/offers`).
   - Adicionado o mesmo botão na tela do painel do Dashboard (`/`) quando em estado vazio.
   - Ambos disparam a ação de forma nativa e revalidam o cache para carregar e renderizar instantaneamente os novos registros no banco.

3. **Gráfico de Evolução na Oferta Individual**:
   - Integrado o gráfico de área/linha SVG customizado em `src/app/(dashboard)/offers/[id]/details-client.tsx`.
   - Exibe a linha do histórico diário de anúncios ativos específicos desta oferta nos últimos 7 dias, posicionada logo abaixo do calendário editável de dias.
   - Apresenta proporções widescreen que se adaptam sem distorção e com tooltips interativas no hover de cada marcador.

---

## Verificação e Build

- Executado o comando `npm run build`, concluído com sucesso e sem erros TypeScript.
- Commits criados e enviados com sucesso para a branch principal do GitHub (`main`).

# Walkthrough: Aba de Configurações e Reset Seguro do Dashboard

Implementação da página `/settings` e integração no layout lateral de navegação com suporte a atualizações de perfil (nome, foto via URL, credenciais) e reset completo da conta com verificação segura de senha.

## Alterações Realizadas

1. **Novas Server Actions (`actions.ts`)**:
   - `updateUserProfile`: Atualiza o e-mail, senha de login e dados de metadados (`name` e `avatar_url`) do usuário diretamente no Supabase Auth.
   - `resetDashboard`: Valida a senha inserida efetuando um login de verificação. Se correto, deleta todas as ofertas da tabela `offers` atreladas ao usuário ativo.

2. **Interface Visual (`/settings`)**:
   - Desenvolvida a página com visualização em três blocos organizados em cards estilizados (vidro escuro):
     - **Editar Perfil**: Atualização de Nome de Exibição e URL da Foto de Perfil.
     - **Conta & Segurança**: Atualização de credenciais de e-mail e senha.
     - **Zona de Perigo**: Card vermelho explicativo contendo o botão de reset do painel.
   - O reset do dashboard abre um modal dialog (`Dialog`) que exige a confirmação da senha do usuário antes de realizar a exclusão.

3. **Layout e Avatares Adaptativos**:
   - Registrada a propriedade opcional `avatarUrl` no layout.
   - Modificados o cabeçalho superior e o menu inferior do perfil na barra lateral para renderizar o elemento de imagem `<img>` quando preenchido, caindo de volta para o texto de iniciais caso não configurado.
   - Adicionada a rota de Configurações no mapeamento de Breadcrumbs do cabeçalho.
   - Adicionado o link de Configurações na barra lateral usando o ícone `Settings` (engrenagem).

---

## Verificação e Build

- Executado o comando `npm run build` com sucesso sem erros.
- Alterações empurradas e atualizadas na branch principal do GitHub (`main`).

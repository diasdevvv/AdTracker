# Walkthrough: Reorganização das Configurações e Botão de Suporte

Remoção do atalho de Configurações da barra lateral principal, integração do link ao menu de perfil (dropdown) e adição de botões estáticos de suporte na plataforma.

## Alterações Realizadas

1. **Reorganização de Rota das Configurações (`/settings`)**:
   - Removido o link da engrenagem do menu principal de navegação da barra lateral esquerda.
   - O link para `/settings` agora está inserido no menu suspenso (Dropdown) de Perfil em dois locais:
     - No **cabeçalho superior** (ao clicar na foto/nome do usuário).
     - No **rodapé da barra lateral** (ao clicar na foto do usuário).

2. **Botão de Suporte**:
   - Importado o ícone de boia salva-vidas (`LifeBuoy` do `lucide-react`) para representar as ações de ajuda.
   - Adicionado um botão de suporte estático no menu de navegação da barra lateral.
   - Adicionada a opção **"Suporte (Breve)"** em ambos os menus suspensos de Perfil, funcionando como placeholder interativo para implementação posterior.

---

## Verificação e Build

- Executado o comando `npm run build` com sucesso sem erros.
- Alterações empurradas e atualizadas na branch principal do GitHub (`main`).

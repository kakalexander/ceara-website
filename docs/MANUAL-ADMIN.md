# Manual do Painel — Ceará Auto Elétrica

Guia simples para o cliente gerenciar o site do dia a dia. **Não precisa saber programar.**

> Acesso: `https://seusite.com.br/admin/login`

---

## Sumário

1. [Entrando no painel](#1-entrando-no-painel)
2. [Visão geral do dashboard](#2-visão-geral-do-dashboard)
3. [Criando categorias](#3-criando-categorias)
4. [Cadastrando produtos](#4-cadastrando-produtos)
5. [Promoções](#5-promoções)
6. [Destacando produtos na home](#6-destacando-produtos-na-home)
7. [Editando ou removendo](#7-editando-ou-removendo)
8. [Dicas de boas fotos](#8-dicas-de-boas-fotos)
9. [Problemas comuns](#9-problemas-comuns)

---

## 1. Entrando no painel

1. Abra seu navegador (Chrome, Firefox, Edge).
2. Digite o endereço: `https://seusite.com.br/admin/login`
3. Coloque o **e-mail** e a **senha** que você recebeu.
4. Clique em **Entrar no painel**.

> Esqueceu a senha? Fale com o suporte pelo botão **WhatsApp** na tela de login.

---

## 2. Visão geral do dashboard

Quando você loga, vê:

- **Boa tarde, fulano** — saudação personalizada.
- **5 quadros (KPIs)** com números importantes:
  - Produtos cadastrados
  - Ativos no site
  - Em promoção
  - Em destaque
  - Categorias
- **Atalhos rápidos** — botões grandes para Produtos, Categorias e Ver site público.
- **Como usar este painel** — lembretes rápidos.

Use o **menu lateral esquerdo** para navegar entre Dashboard, Produtos e Categorias. Para sair, clique em **Sair** no canto inferior do menu.

---

## 3. Criando categorias

**Faça isto ANTES de cadastrar produtos.** Categorias são as "gavetas" onde você organiza o catálogo.

1. No menu lateral, clique em **Categorias**.
2. No campo **Nome da categoria**, digite (ex: `Baterias`).
3. Clique em **Adicionar categoria**.

A categoria aparece na tabela. O **Slug** (URL) é gerado automaticamente — não precisa mexer.

**Sugestões de categorias para você:**
- Arla 32 / SCR
- Baterias
- Auto Elétrica
- Sensores
- Filtros
- Acessórios

---

## 4. Cadastrando produtos

1. No menu lateral, clique em **Produtos**.
2. Preencha o formulário em **Adicionar novo produto**:

| Campo | O que colocar |
|---|---|
| **Categoria** | Escolha uma da lista (criada antes) |
| **Nome do produto** | Ex: "Bomba Arla 32 Bosch" |
| **Descrição curta** | Uma frase que aparece no card (opcional, até 160 letras) |
| **Descrição completa** | Detalhes técnicos, compatibilidade, marca, garantia |
| **Preço** | Preço normal — use ponto para centavos: `1890.00` |
| **Preço promocional** | Opcional — só preencha se está em promoção |
| **SKU** | Opcional — código interno seu |
| **Marca** | Bosch, Delphi, Moura, Heliar... |
| **Imagem do produto** | Clique no quadro tracejado e escolha a foto |
| **Produto ativo** | Deixe LIGADO para aparecer no site |
| **Destaque na home** | Ligue para aparecer entre os 4 destaques da home |

3. Clique em **Criar produto**.

Pronto. O produto já está no site, **na hora**.

---

## 5. Promoções

Coloque um valor menor no campo **Preço promocional**.

Exemplo:
- Preço: `1890,00`
- Preço promocional: `1690,00`

**No site fica:**
- ~~R$ 1.890,00~~ ← riscado, em cinza
- **R$ 1.690,00** ← em destaque, vermelho
- Badge **-11%** automático no canto do card

**Para encerrar a promoção**, edite o produto e apague o campo **Preço promocional**. Salve.

---

## 6. Destacando produtos na home

Quer que um produto apareça na home, no quadro **"Em destaque"**?

1. Vá em **Produtos**, encontre o produto.
2. Clique em **Editar**.
3. Marque o switch **Destaque na home**.
4. Clique em **Atualizar produto**.

A home mostra os **4 primeiros produtos marcados como destaque** (ordem do mais recente).

---

## 7. Editando ou removendo

Na tabela **Produtos cadastrados**:

- **Editar** — clica no botão azul, o formulário do topo é preenchido com os dados; faça as mudanças e clique em **Atualizar produto**.
- **Excluir** — clica no botão vermelho. O sistema pede confirmação. **Atenção: não dá pra desfazer.**

> Em vez de excluir, prefira **desativar** (switch "Produto ativo" desligado). Assim o produto some do site mas você pode reativar depois.

### Busca rápida
No topo da tabela tem uma **barra de busca**. Digite parte do nome ou da categoria — a lista filtra na hora.

---

## 8. Dicas de boas fotos

A foto do produto é o que mais converte. Recomendações:

- **Tamanho**: ideal 800 × 600 pixels (paisagem)
- **Formato**: JPG ou WEBP (mais leves) — evite PNG transparente em fotos
- **Peso**: até 2 MB
- **Fundo**: branco, cinza claro ou neutro (combina com o tema escuro do site)
- **Iluminação**: luz natural, sem sombras duras
- **Foco**: produto inteiro, centralizado, sem cortes nas bordas

**Compressor grátis**: [tinypng.com](https://tinypng.com) — reduz o peso sem perder qualidade.

---

## 9. Problemas comuns

### "Não consigo entrar"
- Confira CapsLock e o e-mail
- Tente em outro navegador
- Chame o suporte pelo botão WhatsApp

### "Cadastrei o produto mas não aparece no site"
- Confira se o switch **Produto ativo** está LIGADO
- Confira se a **categoria** dele também está ativa (vá em Categorias)
- Recarregue a página do site (Ctrl+F5)

### "A imagem ficou enorme / cortada"
- Use o formato recomendado (800×600)
- Imagens muito altas ficam cortadas no card — prefira paisagem

### "Quero mudar o número do WhatsApp / endereço"
- Esses dados estão no `.env` do servidor. Peça pro suporte alterar (é rápido).

### "Quero adicionar uma página nova / categoria diferente"
- Categorias você mesmo cria pelo painel
- Páginas novas precisam de ajuste no código — chame o suporte

### "O cliente fez um pedido pelo WhatsApp mas eu não vejo no painel"
- O carrinho **abre o WhatsApp do cliente** com a mensagem pronta — você só recebe a mensagem no seu WhatsApp pessoal, **não fica salvo no painel**.
- Para histórico de pedidos formal, dá pra incluir num próximo upgrade (sistema de orçamentos). Fale com o suporte.

---

## Atendimento

**Suporte técnico**: via WhatsApp (botão na tela de login).

Mensagem sugerida:
> "Olá, sou da Ceará Auto Elétrica. Estou com [descreva o problema]. Quando puder dar uma olhada?"

# Blog Esportivo com CRUD

Aplicação web desenvolvida com React e Supabase para gerenciamento de postagens esportivas. O sistema permite criar, visualizar, editar e excluir notícias, além de oferecer um sistema de comentários para interação dos usuários.

---

## Funcionalidades

### CRUD de Postagens

**1. Create — Criar Postagem**
- Formulário com os campos:
  - Título
  - Conteúdo
  - Categoria (Futebol, Basquete, Vôlei, etc.)
  - Autor
  - URL da imagem
- Validação de campos obrigatórios
- Feedback visual:
  - Loading ao salvar
  - Mensagem de sucesso/erro

---

**2. Read — Listar Postagens**
- Página inicial com listagem de posts em formato de cards
- Cada card exibe:
  - Imagem
  - Título
  - Categoria
  - Autor
  - Data
- Clique no card abre a tela de detalhes

---

**3. Update — Editar Postagem**
- Botão de editar disponível nos cards ou na tela de detalhes
- Formulário pré-preenchido
- Atualização dos dados no Supabase

---

**4. Delete — Excluir Postagem**
- Botão de exclusão com confirmação
- Remoção do post no banco
- Atualização automática da lista

---

### Sistema de Comentários

Na tela de detalhes de cada post:

- Adicionar comentário:
  - Nome
  - Mensagem
- Listagem de comentários em ordem cronológica
- Exibição de:
  - Autor
  - Data
- Contador total de comentários
- Exclusão de comentários com confirmação

---

## Interface

- Layout responsivo (mobile, tablet e desktop)
- Navegação entre páginas:
  - Home
  - Criar Post
  - Editar Post
  - Detalhes
- Gerenciamento de rotas com React Router
- Estados de:
  - Loading
  - Erro
- Design moderno e limpo

---

## Tecnologias Utilizadas

- React
- React Router DOM
- Supabase (Banco de dados e autenticação)
- CSS

---

## Instalação e Execução

### 1. Clone o repositório

git clone https://github.com/seu-usuario/blog-esportivo.git

### 2. Acesse a pasta do projeto

cd blog-esportivo

### 3. Instale as dependências

Instale as dependências

### 4. Configure o Supabase

Crie um arquivo no projeto e insira a key e url do supabase:

import { createClient } from '@supabase/supabase-js';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

### 5. Execute o projeto

npm run dev

---

## Script SQL (Supabase)

### Tabela: posts

create table posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  category text not null,
  author text not null,
  image_url text,
  created_at timestamp default now()
);

### Tabela: comments

create table comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  author text not null,
  message text not null,
  created_at timestamp default now()
);

### Tabela Usuários

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  username text unique,
  avatar_url text,
  created_at timestamp default now()
);

---

## Prints da Aplicação

### Home (Listagem de Posts)
print
### Criar Post
print
### Detalhes do Post + Comentários
print
### Editar Post

---

## Autores

- kaorishi11
- JamiledeOliveiraFranquilim

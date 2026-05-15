# TuneCache

TuneCache é um aplicativo web em Flask para gerenciamento pessoal de músicas, playlists e cantores. Ele permite que usuários se cadastrem, façam login, adicionem músicas do YouTube e organizem seu acervo em playlists e coleções de cantores.

## Funcionalidades

- Autenticação de usuários com cadastro e login.
- Página principal com listagem de todas as músicas do usuário.
- Criação, edição e exclusão de playlists pessoais.
- Criação, edição e exclusão de cantores.
- Adição de músicas por URL do YouTube.
- Download e armazenamento local de arquivos de áudio no servidor.
- Associação de músicas a playlists e cantores.
- Remoção de músicas e gerenciamento de relacionamentos entre músicas, playlists e cantores.
- Renderização de páginas usando templates HTML e interação via JavaScript.
- Tratamento de erros com página 404 customizada.

## Estrutura do projeto

- `main.py` - Ponto de entrada para executar o aplicativo.
- `Procfile` - Arquivo de configuração para deploy em plataformas compatíveis com Procfile.
- `requirements.txt` - Dependências Python do projeto.
- `website/` - Pacote principal da aplicação.
  - `__init__.py` - Inicializa o app Flask, o banco de dados e o login manager.
  - `auth.py` - Rotas e lógica de autenticação (login, logout, cadastro).
  - `models.py` - Modelos do banco de dados: `User`, `Audio`, `Personal_playlist`, `Singer`.
  - `views.py` - Rotas de páginas e API para ações de música, playlist e cantor.
  - `static/` - Arquivos estáticos (CSS, JS, imagens, músicas por usuário).
  - `templates/` - Templates HTML para as páginas do site.

## Banco de dados

O aplicativo usa SQLite e cria automaticamente o arquivo `database.db` na raiz do projeto quando executado pela primeira vez.

## Dependências principais

- Flask
- Flask-Login
- Flask-SQLAlchemy
- SQLAlchemy
- pytubefix
- gunicorn
- waitress

## Instalação

1. Crie e ative um ambiente virtual Python.
2. Instale as dependências:

```bash
pip install -r requirements.txt
```

## Execução

Execute a aplicação com:

```bash
python main.py
```

Em seguida, acesse `http://127.0.0.1:5000` no navegador.

## Observações

- Ao criar um usuário, o aplicativo cria uma pasta dedicada em `website/static/users/<user_id>/songs/` para armazenar os áudios baixados.
- O app valida tamanho de áudio e impede o upload de arquivos muito grandes para o servidor.
- O cadastro exige email, primeiro nome e senha com ao menos 7 caracteres.
- O projeto está preparado para ser usado localmente e pode ser adaptado para deploy em ambientes compatíveis com `gunicorn` ou `waitress`.

## Uso geral

1. Faça cadastro de conta.
2. Faça login.
3. Adicione músicas pelo URL do YouTube.
4. Crie playlists e associe músicas a elas.
5. Adicione cantores e organize suas músicas por cantor.
6. Edite nomes de músicas, playlists e cantores.
7. Exclua músicas, playlists ou cantores quando desejar.

---

TuneCache foi desenvolvido para simplificar o gerenciamento de músicas pessoais e coleções de áudio baseadas em downloads do YouTube.

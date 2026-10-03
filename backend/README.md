# Backend do portfólio

O servidor usa apenas a biblioteca padrão do Python. Ele serve o site e fornece a API; notas e mensagens ficam em `backend/data/site.sqlite3`, fora dos arquivos públicos.

## Execução local

1. Crie um arquivo `.env` na raiz com uma senha administrativa própria de pelo menos 12 caracteres. O arquivo `.env.example` mostra as opções aceitas e `.env` não é enviado ao Git.
2. Inicie na raiz do projeto com `py backend/server.py`.
3. Abra `http://127.0.0.1:8000/`.

O primeiro acesso ao dicionário pede a senha configurada. A senha não é armazenada no JavaScript; a sessão usa um cookie `HttpOnly`. Ao entrar, notas antigas salvas no `localStorage` daquele mesmo endereço são importadas para o banco.

As mensagens do formulário são gravadas no SQLite e aparecem em **Mensagens recebidas**, dentro da área privada do dicionário. A resposta pode ser iniciada pelo link de e-mail de cada mensagem. O sistema não envia notificações por e-mail.

## Publicação

O servidor local usa `ThreadingHTTPServer` e é destinado a desenvolvimento/uso pessoal. Para receber mensagens publicamente, hospede a aplicação em um serviço Python com HTTPS e disco persistente; configure `HOST=0.0.0.0`, `COOKIE_SECURE=1` e uma `ADMIN_PASSWORD` forte fora do repositório. Faça backup do banco SQLite. Não use `file://`: a página e a API precisam estar na mesma origem HTTP/HTTPS.
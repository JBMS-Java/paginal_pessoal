# Backend do portfólio

O servidor usa apenas a biblioteca padrão do Python. Ele serve o site e fornece a API; notas e mensagens ficam em `backend/data/site.sqlite3`, fora dos arquivos públicos.

## Execução local

1. Crie um arquivo `.env` na raiz com uma senha administrativa própria de pelo menos 12 caracteres. O arquivo `.env.example` mostra as opções aceitas e `.env` não é enviado ao Git.
2. Inicie na raiz do projeto com `py backend/server.py`.
3. Abra `http://127.0.0.1:8000/`.

O primeiro acesso ao dicionário pede a senha configurada. A senha não é armazenada no JavaScript; a sessão usa um cookie `HttpOnly`. Ao entrar, notas antigas salvas no `localStorage` daquele mesmo endereço são importadas para o banco.

As mensagens do formulário são gravadas no SQLite e aparecem em **Mensagens recebidas**, dentro da área privada do dicionário. A resposta pode ser iniciada pelo link de e-mail de cada mensagem. O sistema não envia notificações por e-mail.

## Publicação

O GitHub Pages hospeda apenas os arquivos estáticos e não executa a API. Para que o formulário, o login e o dicionário funcionem no site público, publique o site e o backend juntos em um serviço Python. O arquivo `render.yaml` prepara a publicação no Render:

1. Envie o projeto ao GitHub.
2. No Render, crie um **Blueprint** usando este repositório e informe uma `ADMIN_PASSWORD` forte com pelo menos 12 caracteres.
3. Aguarde o deploy e use a URL `onrender.com` como endereço público do site. O GitHub Pages continuará sem API.

A configuração usa o plano gratuito do Render. Ele não tem disco persistente: notas e mensagens salvas no SQLite podem desaparecer quando o serviço reiniciar ou for publicado novamente. Para manter esses dados, use hospedagem com disco persistente e configure `DATA_DIR` nesse disco. Não use `file://`: a página e a API precisam estar na mesma origem HTTP/HTTPS.
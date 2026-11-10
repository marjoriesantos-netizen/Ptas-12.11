# PTAS 12.11 — API de Users e Products

API REST em **Express + zod** para os exercícios de versionamento, DTOs e
padronização de erros. Persistência local em JSON, organizada em camadas:

```text
routes → controllers → services → models
```

## Como rodar

Pré-requisito: **Node.js 18 ou superior**.

```bash
npm install
npm run dev      # com --watch
# ou
npm start        # sem watch
```

A API sobe em **http://localhost:3001**.

Testes de integração:

```bash
npm test
```

## Estrutura

```text
src/
├── app.js                         # Express + prefixos /api/v1 e /api/v2
├── server.js                      # entrada da API (porta 3001)
├── controllers/
│   ├── v1/
│   │   ├── users.controller.js    # usa toUserDTO
│   │   └── products.controller.js # usa toProductDTO
│   └── v2/
│       └── users.controller.js    # envelope { data, meta }
├── data/
│   ├── db.js                      # leitura/escrita atômica dos JSON
│   ├── users.json
│   └── products.json
├── dtos/
│   ├── user.dto.js                # lista branca de campos públicos
│   └── product.dto.js
├── errors/
│   ├── erro-format.js             # { status, titulo, detalhe, timestamp }
│   └── http-error.js
├── middleware/
│   ├── error.middleware.js        # handler centralizado
│   ├── log.middleware.js
│   ├── not-found.middleware.js
│   └── validate.middleware.js     # zod → ErroHttp 400
├── models/
│   ├── users.model.js
│   └── products.model.js
├── routes/
│   ├── v1/                        # /api/v1/users, /api/v1/products, /health
│   └── v2/                        # /api/v2/users
├── schemas/
│   ├── user.schema.js
│   └── product.schema.js
├── services/
│   ├── users.service.js
│   └── products.service.js
├── insomnia/
│   └── Ptas-12.11.json            # coleção com base_url
└── tests/
    └── api.test.mjs               # testes de integração v1 + v2
```

## Base URLs

| Versão | Base URL | Formato da listagem de users |
| --- | --- | --- |
| v1 | `http://localhost:3001/api/v1` | array puro |
| v2 | `http://localhost:3001/api/v2` | envelope `{ data, meta }` |

Todas as rotas de negócio da v1 ficam sob `/api/v1`. A v2 convive com a v1 no
mesmo servidor, sem alterar o contrato antigo.

## Contrato de `users`

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `id` | string (uuid) | não — gerado | Identificador do usuário. |
| `name` | string (2–80) | sim | Nome do usuário. |
| `email` | string (e-mail) | sim | E-mail único, salvo em minúsculas. |
| `password` | string (6–100) | sim na criação | Senha em texto puro apenas na entrada; nunca é retornada. |
| `role` | `"admin"` ou `"cliente"` | não | Padrão: `"cliente"`. |
| `createdAt` | string (ISO 8601) | não — gerado | Data de criação. |
| `updatedAt` | string (ISO 8601) | não — gerado | Data da última atualização. |

Campos internos do model que **não aparecem** na resposta: `passwordHash`,
`internalNotes` e `_schemaVersion`.

> A senha é guardada como hash SHA-256 apenas para demonstração. Esta API de
> exercícios não implementa autenticação/sessão; o foco é o contrato REST.

## Contrato de `products`

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `id` | string (uuid) | não — gerado | Identificador do produto. |
| `sku` | string (3–30) | sim | Código único; salvo em maiúsculas. |
| `name` | string (2–100) | sim | Nome do produto. |
| `description` | string ou `null` | não | Descrição livre (até 500 caracteres). |
| `price` | number ≥ 0 | sim | Preço de venda. |
| `stock` | integer ≥ 0 | sim | Quantidade em estoque. |
| `active` | boolean | não | Padrão: `true`. |
| `costPrice` | number ≥ 0 | não | Custo interno; **não aparece** na resposta. |
| `supplierCode` | string ou `null` | não | Código do fornecedor; **não aparece** na resposta. |
| `internalNotes` | string ou `null` | não | Observação interna; **não aparece** na resposta. |
| `createdAt` | string (ISO 8601) | não — gerado | Data de criação. |
| `updatedAt` | string (ISO 8601) | não — gerado | Data da última atualização. |

## Exemplos de curl (users)

**1) Cadastrar um user**

```bash
curl -X POST http://localhost:3001/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Silva",
    "email": "maria.silva@example.com",
    "password": "senha123",
    "role": "cliente"
  }'
```

Resposta `201 Created` (sem `passwordHash`):

```json
{
  "id": "0f5c1a3e-7d2b-4e8a-9c61-2b4d6f8a0c12",
  "name": "Maria Silva",
  "email": "maria.silva@example.com",
  "role": "cliente",
  "createdAt": "2026-11-09T12:00:00.000Z",
  "updatedAt": "2026-11-09T12:00:00.000Z"
}
```

**2) Listar os users**

```bash
curl http://localhost:3001/api/v1/users
```

A v1 devolve um **array puro**:

```json
[
  {
    "id": "0f5c1a3e-7d2b-4e8a-9c61-2b4d6f8a0c12",
    "name": "Maria Silva",
    "email": "maria.silva@example.com",
    "role": "cliente",
    "createdAt": "2026-11-09T12:00:00.000Z",
    "updatedAt": "2026-11-09T12:00:00.000Z"
  }
]
```

> Dica: o mesmo par create/list funciona para products trocando `/users` por
> `/products` e enviando `sku`, `name`, `price` e `stock`.

## Formato único de erro

Qualquer erro — `400`, `404`, `409` ou `500` — devolve **exatamente** as mesmas
quatro chaves:

```json
{
  "status": 404,
  "titulo": "Usuário não encontrado",
  "detalhe": "Não existe usuário com o id 00000000-0000-4000-8000-000000000000.",
  "timestamp": "2026-11-09T12:00:00.000Z"
}
```

Em erro de validação (`400`), `detalhe` vira uma lista de campos:

```json
{
  "status": 400,
  "titulo": "Dados inválidos",
  "detalhe": [
    { "campo": "email", "mensagem": "Informe um e-mail válido" },
    { "campo": "password", "mensagem": "A senha deve ter pelo menos 6 caracteres" }
  ],
  "timestamp": "2026-11-09T12:00:00.000Z"
}
```

O `500` nunca expõe o stack trace:

```json
{
  "status": 500,
  "titulo": "Erro interno do servidor",
  "detalhe": "Ocorreu um erro inesperado. Tente novamente mais tarde.",
  "timestamp": "2026-11-09T12:00:00.000Z"
}
```

## v1 x v2

A v1 mantém o formato antigo; a v2 adiciona o envelope e paginação:

```bash
# v1 — array puro
curl http://localhost:3001/api/v1/users

# v2 — envelope { data, meta }
curl "http://localhost:3001/api/v2/users?page=1&perPage=10"
```

```json
{
  "data": [
    {
      "id": "0f5c1a3e-7d2b-4e8a-9c61-2b4d6f8a0c12",
      "name": "Maria Silva",
      "email": "maria.silva@example.com",
      "role": "cliente",
      "createdAt": "2026-11-09T12:00:00.000Z",
      "updatedAt": "2026-11-09T12:00:00.000Z"
    }
  ],
  "meta": {
    "version": "v2",
    "total": 1,
    "page": 1,
    "perPage": 10,
    "totalPages": 1
  }
}
```

## Insomnia

Importe **`src/insomnia/Ptas-12.11.json`**. O ambiente já traz:

- `base_url` = `http://localhost:3001`
- `user_id` e `product_id` para os exemplos de detalhe/edição/exclusão.

Os requests usam `{{ _.base_url }}/api/v1/...` e `{{ _.base_url }}/api/v2/...`,
então basta trocar a `base_url` para apontar para outro ambiente.

## Onde cada exercício está

| Exercício | Implementação |
| --- | --- |
| 1 — prefixo `/api/v1` | `src/app.js` + `src/routes/v1/` |
| 2 — contrato + curls no README | este arquivo |
| 3 — `erroFormat` + handler centralizado | `src/errors/erro-format.js` + `src/middleware/error.middleware.js` |
| 4 — `toUserDTO` e `toProductDTO` | `src/dtos/` usados por todos os controllers |
| 5 — `/api/v2/users` com `{ data, meta }` | `src/routes/v2/` + `src/controllers/v2/users.controller.js` |

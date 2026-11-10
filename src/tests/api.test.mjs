import { once } from "node:events";

process.env.NODE_ENV = "test";

const { default: app } = await import("../app.js");
const { ensureDatabase } = await import("../data/db.js");

const ERROR_KEYS = ["status", "titulo", "detalhe", "timestamp"];
const USER_DTO_KEYS = ["id", "name", "email", "role", "createdAt", "updatedAt"];
const PRODUCT_DTO_KEYS = [
  "id",
  "sku",
  "name",
  "description",
  "price",
  "stock",
  "active",
  "createdAt",
  "updatedAt",
];

const assert = (condition, label, extra) => {
  if (!condition) {
    throw new Error(`${label}${extra ? ` — ${JSON.stringify(extra)}` : ""}`);
  }

  console.log(`PASS ${label}`);
};

const sameKeys = (data, expected) =>
  JSON.stringify(Object.keys(data).sort()) === JSON.stringify(expected.slice().sort());

const assertErrorFormat = (data, status, label) => {
  assert(data && typeof data === "object", `${label}: corpo é objeto`, data);
  assert(sameKeys(data, ERROR_KEYS), `${label}: chaves padronizadas`, data);
  assert(data.status === status, `${label}: status ${status}`, data);
  assert(typeof data.titulo === "string" && data.titulo.length > 0, `${label}: titulo`, data);
  assert(data.detalhe !== undefined, `${label}: detalhe`, data);
  assert(!Number.isNaN(Date.parse(data.timestamp)), `${label}: timestamp ISO`, data);
};

await ensureDatabase();

const server = app.listen(0);
await once(server, "listening");
const { port } = server.address();
const BASE_URL = `http://127.0.0.1:${port}`;

const request = async (path, options = {}) => {
  const { rawBody, ...rest } = options;
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...rest,
    ...(rawBody !== undefined ? { body: rawBody } : {}),
  });

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  return { status: response.status, data };
};

const createdUserIds = [];
const createdProductIds = [];

const createUser = async (overrides = {}) => {
  const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const payload = {
    name: "QA User",
    email: `qa.${unique}@example.com`,
    password: "senha123",
    role: "cliente",
    ...overrides,
  };

  const created = await request("/api/v1/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  assert(created.status === 201, "POST /api/v1/users responde 201", created);
  createdUserIds.push(created.data.id);
  return created.data;
};

const createProduct = async () => {
  const sku = `QA-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`.toUpperCase();
  const created = await request("/api/v1/products", {
    method: "POST",
    body: JSON.stringify({
      sku,
      name: "Produto QA",
      description: "Produto criado pelo teste automatizado.",
      price: 19.9,
      stock: 5,
      active: true,
      costPrice: 9.5,
      supplierCode: "FORN-QA",
    }),
  });

  assert(created.status === 201, "POST /api/v1/products responde 201", created);
  createdProductIds.push(created.data.id);
  return created.data;
};

const run = async () => {

  const health = await request("/api/v1/health");
  assert(health.status === 200, "GET /api/v1/health responde 200", health);

  const root = await request("/");
  assert(root.status === 404, "GET / (fora de /api/v1) responde 404", root);
  assertErrorFormat(root.data, 404, "404 fora de /api/v1");

  const outside = await request("/users");
  assert(outside.status === 404, "GET /users (sem prefixo) responde 404", outside);

  const emptyUser = await request("/api/v1/users", {
    method: "POST",
    body: JSON.stringify({}),
  });
  assert(emptyUser.status === 400, "POST /api/v1/users vazio responde 400", emptyUser);
  assertErrorFormat(emptyUser.data, 400, "400 de body inválido");
  assert(Array.isArray(emptyUser.data.detalhe), "400 de validação devolve lista em detalhe", emptyUser.data);
  assert(
    emptyUser.data.detalhe.some((item) => item.campo === "email"),
    "400 aponta o campo email",
    emptyUser.data,
  );

  const malformed = await request("/api/v1/users", {
    method: "POST",
    rawBody: "{ isso não é json",
  });
  assert(malformed.status === 400, "JSON malformado responde 400", malformed);
  assertErrorFormat(malformed.data, 400, "400 de JSON malformado");

  const unexpected = await request("/api/v1/_test/error");
  assert(unexpected.status === 500, "Erro inesperado responde 500", unexpected);
  assertErrorFormat(unexpected.data, 500, "500 inesperado");
  assert(
    unexpected.data.detalhe === "Ocorreu um erro inesperado. Tente novamente mais tarde.",
    "500 não vaza detalhe interno",
    unexpected.data,
  );

  const activeUsers = await request("/api/v1/users");
  assert(activeUsers.status === 200 && Array.isArray(activeUsers.data), "GET /api/v1/users responde array");

  const user = await createUser();
  assert(sameKeys(user, USER_DTO_KEYS), "user de criação tem só campos do DTO", user);
  assert(!("passwordHash" in user), "passwordHash não aparece no user");
  assert(!("internalNotes" in user), "internalNotes não aparece no user");
  assert(!("_schemaVersion" in user), "_schemaVersion não aparece no user");

  const userDetail = await request(`/api/v1/users/${user.id}`);
  assert(userDetail.status === 200, "GET /api/v1/users/:id responde 200", userDetail);
  assert(sameKeys(userDetail.data, USER_DTO_KEYS), "detalhe do user usa DTO", userDetail.data);

  const updatedUser = await request(`/api/v1/users/${user.id}`, {
    method: "PUT",
    body: JSON.stringify({ name: "QA User Atualizado" }),
  });
  assert(updatedUser.status === 200, "PUT /api/v1/users/:id responde 200", updatedUser);
  assert(updatedUser.data.name === "QA User Atualizado", "PUT atualiza o nome", updatedUser.data);
  assert(sameKeys(updatedUser.data, USER_DTO_KEYS), "PUT do user usa DTO", updatedUser.data);

  const missingUser = await request("/api/v1/users/00000000-0000-4000-8000-000000000000");
  assert(missingUser.status === 404, "GET user inexistente responde 404", missingUser);
  assertErrorFormat(missingUser.data, 404, "404 de user inexistente");

  const duplicate = await request("/api/v1/users", {
    method: "POST",
    body: JSON.stringify({
      name: "Outro QA",
      email: user.email,
      password: "senha123",
    }),
  });
  assert(duplicate.status === 409, "E-mail duplicado responde 409", duplicate);
  assertErrorFormat(duplicate.data, 409, "409 de e-mail duplicado");

  const removedUser = await request(`/api/v1/users/${user.id}`, { method: "DELETE" });
  assert(removedUser.status === 204, "DELETE /api/v1/users/:id responde 204", removedUser);
  createdUserIds.splice(createdUserIds.indexOf(user.id), 1);

  const removedDetail = await request(`/api/v1/users/${user.id}`);
  assert(removedDetail.status === 404, "User removido responde 404", removedDetail);

  const activeProducts = await request("/api/v1/products");
  assert(
    activeProducts.status === 200 && Array.isArray(activeProducts.data),
    "GET /api/v1/products responde array",
  );

  const invalidProduct = await request("/api/v1/products", {
    method: "POST",
    body: JSON.stringify({ sku: "x", price: -1, stock: 1.5 }),
  });
  assert(invalidProduct.status === 400, "POST product inválido responde 400", invalidProduct);
  assertErrorFormat(invalidProduct.data, 400, "400 de product inválido");

  const product = await createProduct();
  assert(sameKeys(product, PRODUCT_DTO_KEYS), "product de criação tem só campos do DTO", product);
  assert(!("costPrice" in product), "costPrice não aparece no product");
  assert(!("supplierCode" in product), "supplierCode não aparece no product");
  assert(!("internalNotes" in product), "internalNotes não aparece no product");
  assert(!("_schemaVersion" in product), "_schemaVersion não aparece no product");

  const productDetail = await request(`/api/v1/products/${product.id}`);
  assert(productDetail.status === 200, "GET /api/v1/products/:id responde 200", productDetail);
  assert(sameKeys(productDetail.data, PRODUCT_DTO_KEYS), "detalhe do product usa DTO", productDetail.data);

  const updatedProduct = await request(`/api/v1/products/${product.id}`, {
    method: "PUT",
    body: JSON.stringify({ price: 24.9, stock: 3 }),
  });
  assert(updatedProduct.status === 200, "PUT /api/v1/products/:id responde 200", updatedProduct);
  assert(updatedProduct.data.price === 24.9, "PUT atualiza o preço", updatedProduct.data);
  assert(sameKeys(updatedProduct.data, PRODUCT_DTO_KEYS), "PUT do product usa DTO", updatedProduct.data);

  const missingProduct = await request("/api/v1/products/00000000-0000-4000-8000-000000000000");
  assert(missingProduct.status === 404, "GET product inexistente responde 404", missingProduct);
  assertErrorFormat(missingProduct.data, 404, "404 de product inexistente");

  const removedProduct = await request(`/api/v1/products/${product.id}`, { method: "DELETE" });
  assert(removedProduct.status === 204, "DELETE /api/v1/products/:id responde 204", removedProduct);
  createdProductIds.splice(createdProductIds.indexOf(product.id), 1);

  const v2User = await request("/api/v2/users", {
    method: "POST",
    body: JSON.stringify({
      name: "QA V2",
      email: `qa.v2.${Date.now()}@example.com`,
      password: "senha123",
    }),
  });
  assert(v2User.status === 201, "POST /api/v2/users responde 201", v2User);
  assert(
    v2User.data && typeof v2User.data === "object" && "data" in v2User.data && "meta" in v2User.data,
    "v2 devolve envelope { data, meta }",
    v2User.data,
  );
  assert(sameKeys(v2User.data.data, USER_DTO_KEYS), "v2 usa o mesmo DTO de user", v2User.data.data);
  createdUserIds.push(v2User.data.data.id);

  const v2List = await request("/api/v2/users?page=1&perPage=1");
  assert(v2List.status === 200, "GET /api/v2/users responde 200", v2List);
  assert(Array.isArray(v2List.data.data), "v2 lista em data[]", v2List.data);
  assert(v2List.data.data.length === 1, "v2 respeita perPage", v2List.data);
  assert(
    ["total", "page", "perPage", "totalPages", "version"].every((key) => key in v2List.data.meta),
    "v2 meta tem total/page/perPage/totalPages/version",
    v2List.data.meta,
  );

  const v1List = await request("/api/v1/users");
  assert(Array.isArray(v1List.data), "v1 continua devolvendo array puro (sem envelope)", v1List.data);

  const v2Detail = await request(`/api/v2/users/${v2User.data.data.id}`);
  assert(v2Detail.status === 200, "GET /api/v2/users/:id responde 200", v2Detail);
  assert("data" in v2Detail.data && "meta" in v2Detail.data, "detalhe v2 também usa envelope", v2Detail.data);

  const v2Removed = await request(`/api/v2/users/${v2User.data.data.id}`, { method: "DELETE" });
  assert(v2Removed.status === 204, "DELETE /api/v2/users/:id responde 204", v2Removed);
  createdUserIds.splice(createdUserIds.indexOf(v2User.data.data.id), 1);

  console.log("\nTodos os testes da API passaram.");
};

try {
  await run();
} catch (error) {
  console.error(`\nFALHA: ${error.message}`);
  process.exitCode = 1;
} finally {
  for (const id of createdUserIds) {
    await request(`/api/v1/users/${id}`, { method: "DELETE" }).catch(() => undefined);
  }

  for (const id of createdProductIds) {
    await request(`/api/v1/products/${id}`, { method: "DELETE" }).catch(() => undefined);
  }

  await new Promise((resolve) => server.close(resolve));
}

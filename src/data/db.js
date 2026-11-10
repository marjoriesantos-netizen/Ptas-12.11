import { access, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Camada de persistência JSON.
 *
 * Cada coleção (users, products) tem seu próprio arquivo. Toda leitura
 * e escrita passa por aqui — nenhuma outra camada conhece o caminho
 * dos arquivos.
 */
const DATA_DIR = dirname(fileURLToPath(new URL("./db.js", import.meta.url)));

const FILES = {
  users: fileURLToPath(new URL("./users.json", import.meta.url)),
  products: fileURLToPath(new URL("./products.json", import.meta.url)),
};

// Uma fila por coleção evita que duas requisições sobrescrevam uma à outra.
const writeQueues = new Map();

const fileExists = async (path) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

const getFile = (collection) => {
  const file = FILES[collection];

  if (!file) {
    throw new Error(`Coleção desconhecida: ${collection}`);
  }

  return file;
};

/** Cria a pasta e os arquivos JSON vazios na primeira execução. */
export const ensureDatabase = async () => {
  await mkdir(DATA_DIR, { recursive: true });

  for (const file of Object.values(FILES)) {
    if (!(await fileExists(file))) {
      await writeFile(file, "[]\n", "utf8");
      console.log(`Banco JSON criado em ${file}`);
    }
  }
};

/** Lê uma coleção e garante que o conteúdo é um array. */
export const readCollection = async (collection) => {
  const file = getFile(collection);
  await ensureDatabase();

  const raw = await readFile(file, "utf8");
  const data = raw.trim() ? JSON.parse(raw) : [];

  if (!Array.isArray(data)) {
    throw new Error(`O arquivo ${collection}.json deve conter um array`);
  }

  return data;
};

const writeCollection = async (collection, data) => {
  const file = getFile(collection);
  const temporaryFile = `${file}.tmp`;

  // Grava em arquivo temporário e renomeia: o JSON nunca fica pela metade.
  await writeFile(temporaryFile, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  await rename(temporaryFile, file);
};

/**
 * Executa uma mutação dentro de uma fila serializada por coleção.
 * O mutador recebe o array, altera o que precisar e devolve o resultado
 * que será entregue ao model.
 */
export const updateCollection = (collection, mutator) => {
  const previous = writeQueues.get(collection) ?? Promise.resolve();

  const operation = previous.then(async () => {
    const data = await readCollection(collection);
    const result = mutator(data);
    await writeCollection(collection, data);
    return result;
  });

  // Uma falha não deve travar a fila das próximas operações.
  writeQueues.set(
    collection,
    operation.catch(() => undefined),
  );

  return operation;
};

export { FILES as DB_FILES, DATA_DIR };

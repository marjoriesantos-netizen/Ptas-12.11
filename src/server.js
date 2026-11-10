import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

// Carrega src/.env antes de avaliar o app (que lê CORS_ORIGIN).
dotenv.config({ path: fileURLToPath(new URL("./.env", import.meta.url)) });

const { default: app } = await import("./app.js");
const { ensureDatabase } = await import("./data/db.js");

const PORT = Number(process.env.PORT) || 3001;

const start = async () => {
  await ensureDatabase();

  app.listen(PORT, () => {
    console.log("");
    console.log("  PTAS 12.11 API");
    console.log(`  v1: http://localhost:${PORT}/api/v1`);
    console.log(`  v2: http://localhost:${PORT}/api/v2`);
    console.log("  Persistência: src/data/*.json");
    console.log("");
  });
};

start().catch((error) => {
  console.error("Falha ao iniciar a API:", error.message);
  process.exit(1);
});

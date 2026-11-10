import express from "express";
import cors from "cors";
import v1Routes from "./routes/v1/index.js";
import v2Routes from "./routes/v2/index.js";
import { logMiddleware } from "./middleware/log.middleware.js";
import { notFoundHandler } from "./middleware/not-found.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.disable("x-powered-by");

const allowedOrigins = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.includes("*") ? "*" : allowedOrigins,
  }),
);
app.use(express.json({ limit: "100kb" }));
app.use(logMiddleware);

// Todas as rotas de negócio vivem sob /api/v1.
app.use("/api/v1", v1Routes);

// A v2 convive com a v1 no mesmo servidor (Exercício 5).
app.use("/api/v2", v2Routes);

// Rota usada apenas pelos testes para comprovar o formato do 500.
if (process.env.NODE_ENV === "test") {
  app.get("/api/v1/_test/error", () => {
    throw new Error("Erro inesperado de teste");
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

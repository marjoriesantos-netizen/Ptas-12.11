/**
 * Log de acesso: método, rota, status e tempo de resposta.
 * O listener de "finish" garante que o status já foi decidido.
 */
export const logMiddleware = (req, res, next) => {
  const startedAt = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const timestamp = new Date().toISOString();

    console.log(
      `[${timestamp}] ${req.method.padEnd(6)} ${req.originalUrl} -> ${res.statusCode} (${durationMs.toFixed(1)} ms)`,
    );
  });

  next();
};

import { erroFormat, tituloParaStatus } from "../errors/erro-format.js";

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.type === "entity.parse.failed") {
    return res.status(400).json(
      erroFormat({
        status: 400,
        titulo: "Requisição inválida",
        detalhe: "O corpo da requisição não contém um JSON válido.",
      }),
    );
  }

  const status = Number.isInteger(error.status) ? error.status : 500;

  if (status >= 500) {
    console.error(
      `[erro] ${req.method} ${req.originalUrl}`,
      error.stack ?? error.message,
    );
  }

  const detalhe =
    status >= 500
      ? "Ocorreu um erro inesperado. Tente novamente mais tarde."
      : (error.detalhe ??
        error.message ??
        "Não foi possível concluir a requisição.");

  res.status(status).json(
    erroFormat({
      status,
      titulo: error.titulo ?? tituloParaStatus(status),
      detalhe,
    }),
  );
};

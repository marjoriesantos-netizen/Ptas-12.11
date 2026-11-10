import { erroFormat, tituloParaStatus } from "../errors/erro-format.js";

/**
 * Handler centralizado de erros.
 *
 * É o único lugar da aplicação que monta resposta de erro. Qualquer
 * camada pode chamar `next(new ErroHttp(...))` (ou lançar o erro) e o
 * cliente sempre recebe { status, titulo, detalhe, timestamp }.
 */
export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  // JSON malformado enviado no corpo da requisição.
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

  // Em 500 nunca expomos detalhes internos ao cliente.
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

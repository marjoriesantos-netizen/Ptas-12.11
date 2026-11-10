import { ErroHttp } from "../errors/http-error.js";

/** Qualquer rota não registrada cai aqui e vira um 404 padronizado. */
export const notFoundHandler = (req, res, next) => {
  next(
    new ErroHttp(
      404,
      "Rota não encontrada",
      `A rota ${req.method} ${req.originalUrl} não existe nesta API.`,
    ),
  );
};

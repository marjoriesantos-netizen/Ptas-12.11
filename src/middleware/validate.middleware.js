import { ErroHttp } from "../errors/http-error.js";

/**
 * Transforma um schema zod em middleware.
 *
 * Em caso de falha, lança ErroHttp 400 com `detalhe` no formato
 * [{ campo, mensagem }]. O handler centralizado preserva o envelope
 * padrão { status, titulo, detalhe, timestamp }.
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const detalhe = result.error.issues.map((issue) => ({
      campo: issue.path.join(".") || "body",
      mensagem: issue.message,
    }));

    return next(new ErroHttp(400, "Dados inválidos", detalhe));
  }

  // Os dados validados (e normalizados pelo zod) seguem para o controller.
  req.body = result.data;
  next();
};

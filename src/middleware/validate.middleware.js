import { ErroHttp } from "../errors/http-error.js";

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const detalhe = result.error.issues.map((issue) => ({
      campo: issue.path.join(".") || "body",
      mensagem: issue.message,
    }));

    return next(new ErroHttp(400, "Dados inválidos", detalhe));
  }

  req.body = result.data;
  next();
};

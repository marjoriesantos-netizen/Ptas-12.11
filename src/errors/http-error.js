/**
 * Erro de aplicação com status HTTP.
 *
 * As camadas de service/controller lançam ErroHttp e o middleware
 * centralizado converte o erro para o formato de `erroFormat`.
 */
export class ErroHttp extends Error {
  /**
   * @param {number} status Código HTTP.
   * @param {string} titulo Título curto do erro.
   * @param {string|Array<{campo: string, mensagem: string}>} [detalhe]
   */
  constructor(status, titulo, detalhe) {
    super(typeof detalhe === "string" ? detalhe : titulo);
    this.name = "ErroHttp";
    this.status = status;
    this.titulo = titulo;
    this.detalhe = detalhe;
  }
}

// Alias mantido para quem já conhece o nome HttpError do projeto anterior.
export { ErroHttp as HttpError };

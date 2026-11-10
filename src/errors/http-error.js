export class ErroHttp extends Error {

  constructor(status, titulo, detalhe) {
    super(typeof detalhe === "string" ? detalhe : titulo);
    this.name = "ErroHttp";
    this.status = status;
    this.titulo = titulo;
    this.detalhe = detalhe;
  }
}

export { ErroHttp as HttpError };

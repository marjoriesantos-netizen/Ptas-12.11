const TITULOS_POR_STATUS = {
  400: "Requisição inválida",
  401: "Não autenticado",
  403: "Acesso negado",
  404: "Recurso não encontrado",
  405: "Método não permitido",
  409: "Conflito de dados",
  422: "Dados inválidos",
  429: "Muitas requisições",
  500: "Erro interno do servidor",
};

export const tituloParaStatus = (status) =>
  TITULOS_POR_STATUS[status] ?? "Erro na requisição";

export const erroFormat = ({ status, titulo, detalhe }) => ({
  status,
  titulo: titulo ?? tituloParaStatus(status),
  detalhe: detalhe ?? tituloParaStatus(status),
  timestamp: new Date().toISOString(),
});

/**
 * Formato único de erro da API.
 *
 * Toda resposta de erro — 400, 404, 409 ou 500 — nasce com exatamente
 * estas quatro chaves: status, titulo, detalhe e timestamp.
 *
 * `detalhe` pode ser um texto (erros simples) ou uma lista de
 * { campo, mensagem } (erros de validação). O envelope não muda.
 */

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

/**
 * Monta o corpo padronizado de erro.
 *
 * @param {object} params
 * @param {number} params.status Código HTTP.
 * @param {string} [params.titulo] Título curto e legível.
 * @param {string|Array<{campo: string, mensagem: string}>} [params.detalhe]
 *   Explicação do problema ou lista de campos inválidos.
 * @returns {{status: number, titulo: string, detalhe: string|Array, timestamp: string}}
 */
export const erroFormat = ({ status, titulo, detalhe }) => ({
  status,
  titulo: titulo ?? tituloParaStatus(status),
  detalhe: detalhe ?? tituloParaStatus(status),
  timestamp: new Date().toISOString(),
});

/**
 * DTO de saída de user.
 *
 * Lista branca de campos públicos. Tudo que não estiver aqui — como
 * passwordHash, internalNotes e _schemaVersion — fica fora do JSON.
 * Adicionar um campo novo no model não altera a resposta da API.
 */
export const toUserDTO = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

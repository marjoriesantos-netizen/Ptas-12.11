import { randomUUID } from "node:crypto";
import { readCollection, updateCollection } from "../data/db.js";

const COLLECTION = "users";

const byNewest = (first, second) =>
  new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime();

const findIndexById = (users, id) => users.findIndex((user) => user.id === id);

/**
 * Model: única camada que conversa com o arquivo JSON de users.
 * Não conhece req/res e não decide status HTTP.
 */
export const UsersModel = {
  async listar() {
    const users = await readCollection(COLLECTION);
    return users.slice().sort(byNewest);
  },

  async buscarPorId(id) {
    const users = await readCollection(COLLECTION);
    return users.find((user) => user.id === id) ?? null;
  },

  async buscarPorEmail(email) {
    const users = await readCollection(COLLECTION);
    return users.find((user) => user.email === email) ?? null;
  },

  async criar(data) {
    const now = new Date().toISOString();

    const user = {
      id: randomUUID(),
      ...data,
      // Campos internos: existem no model, mas nunca saem no DTO.
      internalNotes: data.internalNotes ?? null,
      _schemaVersion: 1,
      createdAt: now,
      updatedAt: now,
    };

    await updateCollection(COLLECTION, (users) => {
      users.push(user);
      return user;
    });

    return user;
  },

  async atualizar(id, changes) {
    const now = new Date().toISOString();

    return updateCollection(COLLECTION, (users) => {
      const index = findIndexById(users, id);

      if (index === -1) {
        return null;
      }

      const current = users[index];
      const updated = {
        ...current,
        ...changes,
        id: current.id,
        internalNotes: current.internalNotes,
        _schemaVersion: current._schemaVersion,
        createdAt: current.createdAt,
        updatedAt: now,
      };

      users[index] = updated;
      return updated;
    });
  },

  async remover(id) {
    return updateCollection(COLLECTION, (users) => {
      const index = findIndexById(users, id);

      if (index === -1) {
        return false;
      }

      users.splice(index, 1);
      return true;
    });
  },
};

import { randomUUID } from "node:crypto";
import { readCollection, updateCollection } from "../data/db.js";

const COLLECTION = "products";

const byNewest = (first, second) =>
  new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime();

const findIndexById = (products, id) =>
  products.findIndex((product) => product.id === id);

export const ProductsModel = {
  async listar() {
    const products = await readCollection(COLLECTION);
    return products.slice().sort(byNewest);
  },

  async buscarPorId(id) {
    const products = await readCollection(COLLECTION);
    return products.find((product) => product.id === id) ?? null;
  },

  async buscarPorSku(sku) {
    const products = await readCollection(COLLECTION);
    return products.find((product) => product.sku === sku) ?? null;
  },

  async criar(data) {
    const now = new Date().toISOString();

    const product = {
      id: randomUUID(),
      ...data,

      internalNotes: data.internalNotes ?? null,
      _schemaVersion: 1,
      createdAt: now,
      updatedAt: now,
    };

    await updateCollection(COLLECTION, (products) => {
      products.push(product);
      return product;
    });

    return product;
  },

  async atualizar(id, changes) {
    const now = new Date().toISOString();

    return updateCollection(COLLECTION, (products) => {
      const index = findIndexById(products, id);

      if (index === -1) {
        return null;
      }

      const current = products[index];
      const updated = {
        ...current,
        ...changes,
        id: current.id,
        internalNotes: current.internalNotes,
        _schemaVersion: current._schemaVersion,
        createdAt: current.createdAt,
        updatedAt: now,
      };

      products[index] = updated;
      return updated;
    });
  },

  async remover(id) {
    return updateCollection(COLLECTION, (products) => {
      const index = findIndexById(products, id);

      if (index === -1) {
        return false;
      }

      products.splice(index, 1);
      return true;
    });
  },
};

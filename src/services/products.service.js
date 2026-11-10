import { ErroHttp } from "../errors/http-error.js";
import { ProductsModel } from "../models/products.model.js";

const normalizeSku = (sku) => sku.trim().toUpperCase();

const normalizeCreate = (data) => ({
  sku: normalizeSku(data.sku),
  name: data.name,
  description: data.description ?? null,
  price: data.price,
  stock: data.stock,
  active: data.active ?? true,
  // Campos internos: persistidos, mas fora do DTO de saída.
  costPrice: data.costPrice ?? null,
  supplierCode: data.supplierCode ?? null,
  internalNotes: data.internalNotes ?? null,
});

/**
 * Service: regras de negócio de products.
 * Não conhece req/res; lança ErroHttp quando a regra é violada.
 */
export const ProductsService = {
  listar: () => ProductsModel.listar(),

  buscarPorId: async (id) => {
    const product = await ProductsModel.buscarPorId(id);

    if (!product) {
      throw new ErroHttp(
        404,
        "Produto não encontrado",
        `Não existe produto com o id ${id}.`,
      );
    }

    return product;
  },

  criar: async (data) => {
    const sku = normalizeSku(data.sku);
    const existing = await ProductsModel.buscarPorSku(sku);

    if (existing) {
      throw new ErroHttp(
        409,
        "SKU já cadastrado",
        `O SKU ${sku} já está em uso por outro produto.`,
      );
    }

    return ProductsModel.criar({ ...normalizeCreate(data), sku });
  },

  atualizar: async (id, data) => {
    const current = await ProductsModel.buscarPorId(id);

    if (!current) {
      throw new ErroHttp(
        404,
        "Produto não encontrado",
        `Não existe produto com o id ${id}.`,
      );
    }

    const changes = { ...data };

    if (changes.sku) {
      changes.sku = normalizeSku(changes.sku);

      if (changes.sku !== current.sku) {
        const existing = await ProductsModel.buscarPorSku(changes.sku);

        if (existing) {
          throw new ErroHttp(
            409,
            "SKU já cadastrado",
            `O SKU ${changes.sku} já está em uso por outro produto.`,
          );
        }
      }
    }

    return ProductsModel.atualizar(id, changes);
  },

  remover: async (id) => {
    const removed = await ProductsModel.remover(id);

    if (!removed) {
      throw new ErroHttp(
        404,
        "Produto não encontrado",
        `Não existe produto com o id ${id}.`,
      );
    }
  },
};

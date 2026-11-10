import { createHash } from "node:crypto";
import { ErroHttp } from "../errors/http-error.js";
import { UsersModel } from "../models/users.model.js";

const hashPassword = (password) =>
  createHash("sha256").update(password).digest("hex");

const normalizeEmail = (email) => email.trim().toLowerCase();

const normalizeCreate = (data) => ({
  name: data.name,
  email: normalizeEmail(data.email),
  role: data.role ?? "cliente",
  passwordHash: hashPassword(data.password),
  internalNotes: data.internalNotes ?? null,
});

/**
 * Service: regras de negócio de users.
 * Não conhece req/res; lança ErroHttp quando a regra é violada.
 */
export const UsersService = {
  listar: () => UsersModel.listar(),

  buscarPorId: async (id) => {
    const user = await UsersModel.buscarPorId(id);

    if (!user) {
      throw new ErroHttp(
        404,
        "Usuário não encontrado",
        `Não existe usuário com o id ${id}.`,
      );
    }

    return user;
  },

  criar: async (data) => {
    const email = normalizeEmail(data.email);
    const existing = await UsersModel.buscarPorEmail(email);

    if (existing) {
      throw new ErroHttp(
        409,
        "E-mail já cadastrado",
        `O e-mail ${email} já está em uso por outro usuário.`,
      );
    }

    return UsersModel.criar(normalizeCreate(data));
  },

  atualizar: async (id, data) => {
    const current = await UsersModel.buscarPorId(id);

    if (!current) {
      throw new ErroHttp(
        404,
        "Usuário não encontrado",
        `Não existe usuário com o id ${id}.`,
      );
    }

    const changes = { ...data };

    if (changes.email) {
      changes.email = normalizeEmail(changes.email);

      if (changes.email !== current.email) {
        const existing = await UsersModel.buscarPorEmail(changes.email);

        if (existing) {
          throw new ErroHttp(
            409,
            "E-mail já cadastrado",
            `O e-mail ${changes.email} já está em uso por outro usuário.`,
          );
        }
      }
    }

    if (changes.password) {
      changes.passwordHash = hashPassword(changes.password);
      delete changes.password;
    }

    return UsersModel.atualizar(id, changes);
  },

  remover: async (id) => {
    const removed = await UsersModel.remover(id);

    if (!removed) {
      throw new ErroHttp(
        404,
        "Usuário não encontrado",
        `Não existe usuário com o id ${id}.`,
      );
    }
  },
};

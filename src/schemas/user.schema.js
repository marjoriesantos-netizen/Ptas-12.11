import { z } from "zod";

export const USER_ROLES = ["admin", "cliente"];

const emptyToNull = (value) =>
  typeof value === "string" && value.trim() === "" ? null : value;

const name = z
  .string({
    required_error: "Informe o nome do usuário",
    invalid_type_error: "O nome deve ser um texto",
  })
  .trim()
  .min(2, "O nome deve ter pelo menos 2 caracteres")
  .max(80, "O nome deve ter no máximo 80 caracteres");

const email = z
  .string({
    required_error: "Informe o e-mail do usuário",
    invalid_type_error: "O e-mail deve ser um texto",
  })
  .trim()
  .email("Informe um e-mail válido")
  .max(160, "O e-mail deve ter no máximo 160 caracteres");

const password = z
  .string({
    required_error: "Informe a senha do usuário",
    invalid_type_error: "A senha deve ser um texto",
  })
  .min(6, "A senha deve ter pelo menos 6 caracteres")
  .max(100, "A senha deve ter no máximo 100 caracteres");

const role = z.enum(USER_ROLES, {
  errorMap: () => ({ message: "O papel deve ser admin ou cliente" }),
});

const optionalText = (max, label) =>
  z.preprocess(
    emptyToNull,
    z
      .string()
      .trim()
      .max(max, `${label} deve ter no máximo ${max} caracteres`)
      .nullable()
      .optional(),
  );

export const createUserSchema = z
  .object({
    name,
    email,
    password,
    role: role.default("cliente"),
    internalNotes: optionalText(500, "As observações internas"),
  })
  .strict();

export const updateUserSchema = z
  .object({
    name: name.optional(),
    email: email.optional(),
    password: password.optional(),
    role: role.optional(),
    internalNotes: optionalText(500, "As observações internas"),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar",
  });

import { z } from "zod";

const emptyToNull = (value) =>
  typeof value === "string" && value.trim() === "" ? null : value;

const sku = z
  .string({
    required_error: "Informe o SKU do produto",
    invalid_type_error: "O SKU deve ser um texto",
  })
  .trim()
  .min(3, "O SKU deve ter pelo menos 3 caracteres")
  .max(30, "O SKU deve ter no máximo 30 caracteres")
  .regex(
    /^[A-Za-z0-9-]+$/,
    "O SKU deve conter apenas letras, números e hífen",
  );

const name = z
  .string({
    required_error: "Informe o nome do produto",
    invalid_type_error: "O nome deve ser um texto",
  })
  .trim()
  .min(2, "O nome deve ter pelo menos 2 caracteres")
  .max(100, "O nome deve ter no máximo 100 caracteres");

const description = z.preprocess(
  emptyToNull,
  z
    .string()
    .trim()
    .max(500, "A descrição deve ter no máximo 500 caracteres")
    .nullable()
    .optional(),
);

const price = z
  .number({
    required_error: "Informe o preço do produto",
    invalid_type_error: "O preço deve ser um número",
  })
  .finite("O preço deve ser um número válido")
  .nonnegative("O preço não pode ser negativo");

const stock = z
  .number({
    required_error: "Informe o estoque do produto",
    invalid_type_error: "O estoque deve ser um número",
  })
  .int("O estoque deve ser um número inteiro")
  .nonnegative("O estoque não pode ser negativo");

const active = z.boolean({
  invalid_type_error: "O campo active deve ser verdadeiro ou falso",
});

const costPrice = z
  .number({
    invalid_type_error: "O custo deve ser um número",
  })
  .finite("O custo deve ser um número válido")
  .nonnegative("O custo não pode ser negativo")
  .optional();

const supplierCode = z.preprocess(
  emptyToNull,
  z
    .string()
    .trim()
    .max(40, "O código do fornecedor deve ter no máximo 40 caracteres")
    .nullable()
    .optional(),
);

export const createProductSchema = z
  .object({
    sku,
    name,
    description,
    price,
    stock,
    active: active.default(true),
    costPrice,
    supplierCode,
    internalNotes: z.preprocess(
      emptyToNull,
      z.string().trim().max(500).nullable().optional(),
    ),
  })
  .strict();

export const updateProductSchema = z
  .object({
    sku: sku.optional(),
    name: name.optional(),
    description,
    price: price.optional(),
    stock: stock.optional(),
    active: active.optional(),
    costPrice,
    supplierCode,
    internalNotes: z.preprocess(
      emptyToNull,
      z.string().trim().max(500).nullable().optional(),
    ),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar",
  });

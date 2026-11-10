import { Router } from "express";
import {
  atualizar,
  buscarPorId,
  criar,
  listar,
  remover,
} from "../../controllers/v1/products.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../../schemas/product.schema.js";

const router = Router();

router.get("/", listar);
router.get("/:id", buscarPorId);
router.post("/", validate(createProductSchema), criar);
router.put("/:id", validate(updateProductSchema), atualizar);
router.delete("/:id", remover);

export default router;

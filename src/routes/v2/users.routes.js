import { Router } from "express";
import {
  atualizar,
  buscarPorId,
  criar,
  listar,
  remover,
} from "../../controllers/v2/users.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  createUserSchema,
  updateUserSchema,
} from "../../schemas/user.schema.js";

const router = Router();

router.get("/", listar);
router.get("/:id", buscarPorId);
router.post("/", validate(createUserSchema), criar);
router.put("/:id", validate(updateUserSchema), atualizar);
router.delete("/:id", remover);

export default router;

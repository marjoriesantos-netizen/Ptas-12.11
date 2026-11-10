import { Router } from "express";
import usersRoutes from "./users.routes.js";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({
    name: "PTAS 12.11 API",
    version: "v2",
    baseUrl: "/api/v2",
    endpoints: [
      { method: "GET", path: "/api/v2/users", description: "Lista users com envelope { data, meta }" },
      { method: "GET", path: "/api/v2/users/:id", description: "Detalha um user com envelope" },
      { method: "POST", path: "/api/v2/users", description: "Cria um user com envelope (201)" },
      { method: "PUT", path: "/api/v2/users/:id", description: "Atualiza um user com envelope (200)" },
      { method: "DELETE", path: "/api/v2/users/:id", description: "Remove um user (204)" },
    ],
  });
});

router.use("/users", usersRoutes);

export default router;

import { Router } from "express";
import healthRoutes from "./health.routes.js";
import productsRoutes from "./products.routes.js";
import usersRoutes from "./users.routes.js";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({
    name: "PTAS 12.11 API",
    version: "v1",
    baseUrl: "/api/v1",
    endpoints: [
      { method: "GET", path: "/api/v1/health", description: "Status da API" },
      { method: "GET", path: "/api/v1/users", description: "Lista users" },
      { method: "GET", path: "/api/v1/users/:id", description: "Detalha um user" },
      { method: "POST", path: "/api/v1/users", description: "Cria um user (201)" },
      { method: "PUT", path: "/api/v1/users/:id", description: "Atualiza um user (200)" },
      { method: "DELETE", path: "/api/v1/users/:id", description: "Remove um user (204)" },
      { method: "GET", path: "/api/v1/products", description: "Lista products" },
      { method: "GET", path: "/api/v1/products/:id", description: "Detalha um product" },
      { method: "POST", path: "/api/v1/products", description: "Cria um product (201)" },
      { method: "PUT", path: "/api/v1/products/:id", description: "Atualiza um product (200)" },
      { method: "DELETE", path: "/api/v1/products/:id", description: "Remove um product (204)" },
    ],
  });
});

router.use("/health", healthRoutes);
router.use("/users", usersRoutes);
router.use("/products", productsRoutes);

export default router;

import { Router } from "express";
import { readCollection } from "../../data/db.js";

const router = Router();

/** GET /api/v1/health — status da API e contagem por coleção. */
router.get("/", async (req, res, next) => {
  try {
    const [users, products] = await Promise.all([
      readCollection("users"),
      readCollection("products"),
    ]);

    res.status(200).json({
      status: "ok",
      version: "v1",
      collections: {
        users: users.length,
        products: products.length,
      },
      uptime: Number(process.uptime().toFixed(1)),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;

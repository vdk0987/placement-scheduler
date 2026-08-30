import { Router } from "express";

export function createMetricsRouter(store) {
  const router = Router();

  router.get("/", (req, res) => {
    res.json({
      success: true,
      data: store.getMetrics(),
    });
  });

  return router;
}

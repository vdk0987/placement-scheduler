import { Router } from "express";

export function createUnscheduledRouter(store) {
  const router = Router();

  router.get("/", (req, res) => {
    const unscheduled = store.getUnscheduled();

    res.json({
      success: true,
      count: unscheduled.length,
      data: unscheduled,
    });
  });

  return router;
}

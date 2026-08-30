import { Router } from "express";

export function createScheduleRouter(store) {
  const router = Router();

  router.get("/", (req, res, next) => {
    try {
      const { day } = req.query;

      const schedule = store.getSchedule(day);

      res.json({
        success: true,
        count: schedule.length,
        data: schedule,
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

import { Router } from "express";

export function createReplanRouter(controller) {
  const router = Router();

  router.post("/company-late", controller.preview("company-late"));

  router.post("/panel-drop", controller.preview("panel-drop"));

  router.post("/student-withdraw", controller.preview("student-withdraw"));

  router.post("/room-unavailable", controller.preview("room-unavailable"));

  router.get("/preview", controller.getPreview);

  router.post("/commit", controller.commit);

  return router;
}

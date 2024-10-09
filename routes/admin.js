import express from "express";
import { body } from "express-validator";

import * as adminController from "../controllers/admin.js";

const router = express.Router();

router.get("/adminInfo", adminController.getAdminInfo);

router.put(
  "/habit",
  [
    body("title", "Habit title must have a charcters not less than 3")
      .isLength({ min: 3 })
      .trim(),
    body("start")
      .isLength({ max: 5, min: 5 })
      .withMessage("Start time must be in the format HH:MM")
      .custom((value, { req }) => {
        const time = value.split(":");
        if (Number(time[0]) > 23 || Number(time[1] > 59)) {
          return false;
        }
        return true;
      })
      .withMessage("Enter a valid time"),

    body("end")
      .isLength({ max: 5, min: 5 })
      .withMessage("End time must be in the format HH:MM")
      .custom((value, { req }) => {
        const time = value.split(":");

        if (Number(time[0]) > 23 || Number(time[1] > 59)) {
          return false;
        }
        return true;
      })
      .withMessage("Enter a valid time")
      .custom((value, { req }) => {
        const time = value.split(":");
        const startTime = req.body.start.split(":");
        if (
          Number(time[0]) === Number(startTime[0]) &&
          Number(time[1]) <= Number(startTime[1])
        ) {
          return false;
        } else if (Number(time[0]) < Number(startTime[0])) {
          return false;
        }
        return true;
      })
      .withMessage("End time cannot be less than or equal to start time"),
  ],
  adminController.putHabit
);

router.get("/allHabits", adminController.getAllHabits);

router.post("/checkHabit", adminController.checkHabit);
export default router;

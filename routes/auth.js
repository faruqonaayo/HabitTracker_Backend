import express from "express";
import { body } from "express-validator";

import * as authController from "../controllers/auth.js";

const router = express.Router();

router.put(
  "/signup",
  [
    body("firstName")
      .isLength({ min: 2 })
      .withMessage("First name must be at least 2 characters long"),
    body("lastName")
      .isLength({ min: 2 })
      .withMessage("Last name must be at least 2 characters long"),
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long"),
    body("confirmPassword")
      .custom((value, { req }) => {
        if (req.body.password === value) {
          return true;
        }
        return false;
      })
      .withMessage("Passwords do not match"),
  ],
  authController.putSignUp
);

export default router;

import express from "express";
import { body } from "express-validator";

import * as authController from "../controllers/auth.js";

const router = express.Router();

router.put(
  "/signup",
  [
    body("firstName")
      .isLength({ min: 2 })
      .withMessage("First name must be at least 2 characters long")
      .trim(),
    body("lastName")
      .isLength({ min: 2 })
      .withMessage("Last name must be at least 2 characters long")
      .trim(),
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .toLowerCase()
      .trim(),
    body("password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long")
      .trim(),
    body("confirmPassword")
      .custom((value, { req }) => {
        if (req.body.password === value) {
          return true;
        }
        return false;
      })
      .withMessage("Passwords do not match")
      .trim(),
  ],
  authController.putSignUp
);

router.post(
  "/login",
  [body("email").toLowerCase().trim()],
  authController.postLogin
);

export default router;

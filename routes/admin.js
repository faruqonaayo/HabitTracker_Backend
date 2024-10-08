import express from "express";
import { body } from "express-validator";

import * as adminController from "../controllers/admin.js";

const router = express.Router();

router.get("/adminInfo", adminController.getAdminInfo)

export default router;

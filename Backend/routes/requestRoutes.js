import express from "express";
import {createRequest} from "../controllers/requestController.js";

import { protect } from "../middleware/authMiddleware.js";
import { isOwner } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/create", protect, createRequest);



export default router;
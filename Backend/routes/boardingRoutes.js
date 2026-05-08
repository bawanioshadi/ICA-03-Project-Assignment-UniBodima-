import express from 'express'
import { createBoarding } from "../controllers/boardingController.js";

import { protect } from "../middleware/authMiddleware.js";
import { isOwner } from "../middleware/roleMiddleware.js";


const router = express.Router();

router.get("/public", getPublicBoardings);
router.get("/public/:id", getBoardingById);
router.post("/createBoarding", protect, isOwner, createBoarding);


export default router;
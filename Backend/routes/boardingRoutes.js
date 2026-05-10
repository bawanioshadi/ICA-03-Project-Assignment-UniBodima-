import express from 'express'
import { createBoarding,getOwnerBoardings } from "../controllers/boardingController.js";

import { protect } from "../middleware/authMiddleware.js";
import { isOwner } from "../middleware/roleMiddleware.js";


const router = express.Router();


router.post("/createBoarding", protect, isOwner, createBoarding);
router.get("/ownerBoardings", protect, isOwner, getOwnerBoardings);



export default router;
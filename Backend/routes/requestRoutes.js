import express from "express";
import {createRequest,getOwnerRequests,acceptRequest,getStudentRequests} from "../controllers/requestController.js";

import { protect } from "../middleware/authMiddleware.js";
import { isOwner } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/create", protect, createRequest);
router.get("/ownerRequests", protect, isOwner, getOwnerRequests);
router.get("/studentRequests", protect, getStudentRequests);

router.put("/accept/:id", protect, isOwner, acceptRequest);


export default router;
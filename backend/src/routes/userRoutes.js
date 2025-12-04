import { Router } from "express";
import { listUsers, syncUser } from "../controllers/userController.js";

const router = Router();

router.get("/", listUsers);
router.post("/sync", syncUser);

export default router;

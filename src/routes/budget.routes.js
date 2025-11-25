import { Router } from "express";
import {
    getBudgets,
    getBudget,
    createBudget,
    updateBudget,
    deleteBudget
} from "../contollers/budget.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

router.route("/")
    .get(getBudgets)
    .post(createBudget);

router.route("/:id")
    .get(getBudget)
    .put(updateBudget)
    .delete(deleteBudget);

export default router;


import { Router } from "express";
import {
    getTransactions,
    getTransaction,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionStats
} from "../contollers/transaction.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

router.route("/")
    .get(getTransactions)
    .post(createTransaction);

router.route("/stats")
    .get(getTransactionStats);

router.route("/:id")
    .get(getTransaction)
    .put(updateTransaction)
    .delete(deleteTransaction);

export default router;


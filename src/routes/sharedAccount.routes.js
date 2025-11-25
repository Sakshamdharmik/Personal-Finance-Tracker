import { Router } from "express";
import {
    getSharedAccounts,
    getSharedAccount,
    createSharedAccount,
    updateSharedAccount,
    addMember,
    removeMember,
    deleteSharedAccount
} from "../contollers/sharedAccount.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

router.route("/")
    .get(getSharedAccounts)
    .post(createSharedAccount);

router.route("/:id")
    .get(getSharedAccount)
    .put(updateSharedAccount)
    .delete(deleteSharedAccount);

router.route("/:id/members")
    .post(addMember)
    .delete(removeMember);

export default router;


import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { SharedAccount } from "../models/sharedAccount.model.js";
import { User } from "../models/user.model.js";

// Get all shared accounts
const getSharedAccounts = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const sharedAccounts = await SharedAccount.find({
        $or: [
            { owner: userId },
            { "members.user": userId }
        ],
        isActive: true
    })
        .populate("owner", "username email fullName avatar")
        .populate("members.user", "username email fullName avatar")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, sharedAccounts, "Shared accounts fetched successfully")
    );
});

// Get single shared account
const getSharedAccount = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const sharedAccount = await SharedAccount.findOne({
        _id: id,
        $or: [
            { owner: userId },
            { "members.user": userId }
        ]
    })
        .populate("owner", "username email fullName avatar")
        .populate("members.user", "username email fullName avatar");

    if (!sharedAccount) {
        throw new ApiError(404, "Shared account not found");
    }

    return res.status(200).json(
        new ApiResponse(200, sharedAccount, "Shared account fetched successfully")
    );
});

// Create shared account
const createSharedAccount = asyncHandler(async (req, res) => {
    const { name, description, members } = req.body;
    const userId = req.user._id;

    if (!name) {
        throw new ApiError(400, "Name is required");
    }

    // Validate members if provided
    const memberList = [];
    if (members && Array.isArray(members)) {
        for (const memberId of members) {
            const user = await User.findById(memberId);
            if (!user) {
                throw new ApiError(404, `User with ID ${memberId} not found`);
            }
            if (user._id.toString() === userId.toString()) {
                continue; // Skip owner
            }
            memberList.push({
                user: user._id,
                role: "member"
            });
        }
    }

    const sharedAccount = await SharedAccount.create({
        name,
        description: description || "",
        owner: userId,
        members: memberList
    });

    const populated = await SharedAccount.findById(sharedAccount._id)
        .populate("owner", "username email fullName avatar")
        .populate("members.user", "username email fullName avatar");

    return res.status(201).json(
        new ApiResponse(201, populated, "Shared account created successfully")
    );
});

// Update shared account
const updateSharedAccount = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    const updateData = req.body;

    const sharedAccount = await SharedAccount.findOne({
        _id: id,
        owner: userId
    });

    if (!sharedAccount) {
        throw new ApiError(404, "Shared account not found or you don't have permission");
    }

    // Only owner can update
    if (updateData.name) {
        sharedAccount.name = updateData.name;
    }
    if (updateData.description !== undefined) {
        sharedAccount.description = updateData.description;
    }
    if (updateData.settings) {
        sharedAccount.settings = { ...sharedAccount.settings, ...updateData.settings };
    }

    await sharedAccount.save();

    const populated = await SharedAccount.findById(sharedAccount._id)
        .populate("owner", "username email fullName avatar")
        .populate("members.user", "username email fullName avatar");

    return res.status(200).json(
        new ApiResponse(200, populated, "Shared account updated successfully")
    );
});

// Add member to shared account
const addMember = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { userId: memberId, role = "member" } = req.body;
    const currentUserId = req.user._id;

    if (!memberId) {
        throw new ApiError(400, "User ID is required");
    }

    const sharedAccount = await SharedAccount.findOne({
        _id: id,
        owner: currentUserId
    });

    if (!sharedAccount) {
        throw new ApiError(404, "Shared account not found or you don't have permission");
    }

    // Check if user exists
    const user = await User.findById(memberId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Check if already a member
    const existingMember = sharedAccount.members.find(
        m => m.user.toString() === memberId
    );

    if (existingMember) {
        throw new ApiError(400, "User is already a member");
    }

    sharedAccount.members.push({
        user: user._id,
        role: role === "admin" ? "admin" : "member"
    });

    await sharedAccount.save();

    const populated = await SharedAccount.findById(sharedAccount._id)
        .populate("owner", "username email fullName avatar")
        .populate("members.user", "username email fullName avatar");

    return res.status(200).json(
        new ApiResponse(200, populated, "Member added successfully")
    );
});

// Remove member from shared account
const removeMember = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { userId: memberId } = req.body;
    const currentUserId = req.user._id;

    if (!memberId) {
        throw new ApiError(400, "User ID is required");
    }

    const sharedAccount = await SharedAccount.findOne({
        _id: id,
        owner: currentUserId
    });

    if (!sharedAccount) {
        throw new ApiError(404, "Shared account not found or you don't have permission");
    }

    sharedAccount.members = sharedAccount.members.filter(
        m => m.user.toString() !== memberId
    );

    await sharedAccount.save();

    const populated = await SharedAccount.findById(sharedAccount._id)
        .populate("owner", "username email fullName avatar")
        .populate("members.user", "username email fullName avatar");

    return res.status(200).json(
        new ApiResponse(200, populated, "Member removed successfully")
    );
});

// Delete shared account
const deleteSharedAccount = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const sharedAccount = await SharedAccount.findOne({
        _id: id,
        owner: userId
    });

    if (!sharedAccount) {
        throw new ApiError(404, "Shared account not found or you don't have permission");
    }

    // Soft delete
    sharedAccount.isActive = false;
    await sharedAccount.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Shared account deleted successfully")
    );
});

export {
    getSharedAccounts,
    getSharedAccount,
    createSharedAccount,
    updateSharedAccount,
    addMember,
    removeMember,
    deleteSharedAccount
};


import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Budget } from "../models/budget.model.js";
import { Transaction } from "../models/transaction.model.js";

// Get all budgets
const getBudgets = asyncHandler(async (req, res) => {
    const { period, isActive, sharedAccountId } = req.query;
    const userId = req.user._id;

    const query = { owner: userId };

    if (period) {
        query.period = period;
    }

    if (isActive !== undefined) {
        query.isActive = isActive === "true";
    }

    if (sharedAccountId) {
        query.sharedAccount = sharedAccountId;
    } else {
        query.sharedAccount = null;
    }

    const budgets = await Budget.find(query).sort({ createdAt: -1 });

    // Calculate spent amounts for each budget
    const budgetsWithSpent = await Promise.all(
        budgets.map(async (budget) => {
            const periodStart = getPeriodStart(budget.period, new Date());
            const spent = await Transaction.aggregate([
                {
                    $match: {
                        type: "expense",
                        category: budget.category,
                        owner: userId,
                        date: { $gte: periodStart },
                        sharedAccount: budget.sharedAccount || null
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$amount" }
                    }
                }
            ]);

            const totalSpent = spent[0]?.total || 0;
            const remaining = budget.amount - totalSpent;
            const percentage = budget.amount > 0 ? (totalSpent / budget.amount) * 100 : 0;

            return {
                ...budget.toObject(),
                spent: totalSpent,
                remaining,
                percentage: Math.round(percentage * 100) / 100
            };
        })
    );

    return res.status(200).json(
        new ApiResponse(200, budgetsWithSpent, "Budgets fetched successfully")
    );
});

// Get single budget
const getBudget = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const budget = await Budget.findOne({
        _id: id,
        owner: userId
    });

    if (!budget) {
        throw new ApiError(404, "Budget not found");
    }

    // Calculate spent amount
    const periodStart = getPeriodStart(budget.period, new Date());
    const spent = await Transaction.aggregate([
        {
            $match: {
                type: "expense",
                category: budget.category,
                owner: userId,
                date: { $gte: periodStart },
                sharedAccount: budget.sharedAccount || null
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$amount" }
            }
        }
    ]);

    const totalSpent = spent[0]?.total || 0;
    const remaining = budget.amount - totalSpent;
    const percentage = budget.amount > 0 ? (totalSpent / budget.amount) * 100 : 0;

    const budgetWithSpent = {
        ...budget.toObject(),
        spent: totalSpent,
        remaining,
        percentage: Math.round(percentage * 100) / 100
    };

    return res.status(200).json(
        new ApiResponse(200, budgetWithSpent, "Budget fetched successfully")
    );
});

// Create budget
const createBudget = asyncHandler(async (req, res) => {
    const {
        category,
        amount,
        period,
        startDate,
        endDate,
        sharedAccountId,
        notifications
    } = req.body;

    const userId = req.user._id;

    if (!category || !amount || !period) {
        throw new ApiError(400, "Category, amount, and period are required");
    }

    if (amount <= 0) {
        throw new ApiError(400, "Amount must be greater than 0");
    }

    // Validate shared account access if provided
    if (sharedAccountId) {
        const { SharedAccount } = await import("../models/sharedAccount.model.js");
        const sharedAccount = await SharedAccount.findOne({
            _id: sharedAccountId,
            $or: [
                { owner: userId },
                { "members.user": userId }
            ]
        });

        if (!sharedAccount) {
            throw new ApiError(403, "You don't have access to this shared account");
        }
    }

    const budget = await Budget.create({
        category,
        amount: parseFloat(amount),
        period: period || "monthly",
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        owner: userId,
        sharedAccount: sharedAccountId || null,
        notifications: notifications || { enabled: true, threshold: 80 }
    });

    return res.status(201).json(
        new ApiResponse(201, budget, "Budget created successfully")
    );
});

// Update budget
const updateBudget = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    const updateData = req.body;

    const budget = await Budget.findOne({
        _id: id,
        owner: userId
    });

    if (!budget) {
        throw new ApiError(404, "Budget not found");
    }

    Object.keys(updateData).forEach(key => {
        if (key !== "_id" && key !== "owner" && key !== "createdAt") {
            budget[key] = updateData[key];
        }
    });

    await budget.save();

    return res.status(200).json(
        new ApiResponse(200, budget, "Budget updated successfully")
    );
});

// Delete budget
const deleteBudget = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const budget = await Budget.findOne({
        _id: id,
        owner: userId
    });

    if (!budget) {
        throw new ApiError(404, "Budget not found");
    }

    await Budget.findByIdAndDelete(id);

    return res.status(200).json(
        new ApiResponse(200, {}, "Budget deleted successfully")
    );
});

// Helper function to get period start date
function getPeriodStart(period, date) {
    const d = new Date(date);
    switch (period) {
        case "weekly":
            d.setDate(d.getDate() - d.getDay());
            break;
        case "monthly":
            d.setDate(1);
            break;
        case "yearly":
            d.setMonth(0, 1);
            break;
    }
    d.setHours(0, 0, 0, 0);
    return d;
}

export {
    getBudgets,
    getBudget,
    createBudget,
    updateBudget,
    deleteBudget
};


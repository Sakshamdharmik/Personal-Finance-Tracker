import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Transaction } from "../models/transaction.model.js";
import { Budget } from "../models/budget.model.js";
import { SharedAccount } from "../models/sharedAccount.model.js";

// Get all transactions with filtering and sorting
const getTransactions = asyncHandler(async (req, res) => {
    const {
        type,
        category,
        startDate,
        endDate,
        minAmount,
        maxAmount,
        sharedAccountId,
        sortBy = "date",
        sortOrder = "desc",
        page = 1,
        limit = 20
    } = req.query;

    const userId = req.user._id;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query = { owner: userId };

    // Filter by type
    if (type && (type === "income" || type === "expense")) {
        query.type = type;
    }

    // Filter by category
    if (category) {
        query.category = category;
    }

    // Filter by date range
    if (startDate || endDate) {
        query.date = {};
        if (startDate) {
            query.date.$gte = new Date(startDate);
        }
        if (endDate) {
            query.date.$lte = new Date(endDate);
        }
    }

    // Filter by amount range
    if (minAmount || maxAmount) {
        query.amount = {};
        if (minAmount) {
            query.amount.$gte = parseFloat(minAmount);
        }
        if (maxAmount) {
            query.amount.$lte = parseFloat(maxAmount);
        }
    }

    // Filter by shared account
    if (sharedAccountId) {
        // Verify user has access to this shared account
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

        query.sharedAccount = sharedAccountId;
    } else {
        // Only show personal transactions (not shared account transactions)
        query.sharedAccount = null;
    }

    // Build sort object
    const sort = {};
    const validSortFields = ["date", "amount", "createdAt"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "date";
    sort[sortField] = sortOrder === "asc" ? 1 : -1;

    // Execute query
    const transactions = await Transaction.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean();

    const total = await Transaction.countDocuments(query);

    // Calculate summary
    const summary = await Transaction.aggregate([
        { $match: query },
        {
            $group: {
                _id: "$type",
                total: { $sum: "$amount" },
                count: { $sum: 1 }
            }
        }
    ]);

    const incomeTotal = summary.find(s => s._id === "income")?.total || 0;
    const expenseTotal = summary.find(s => s._id === "expense")?.total || 0;
    const balance = incomeTotal - expenseTotal;

    return res.status(200).json(
        new ApiResponse(200, {
            transactions,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            },
            summary: {
                income: incomeTotal,
                expense: expenseTotal,
                balance
            }
        }, "Transactions fetched successfully")
    );
});

// Get single transaction
const getTransaction = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const transaction = await Transaction.findOne({
        _id: id,
        owner: userId
    });

    if (!transaction) {
        throw new ApiError(404, "Transaction not found");
    }

    return res.status(200).json(
        new ApiResponse(200, transaction, "Transaction fetched successfully")
    );
});

// Create transaction
const createTransaction = asyncHandler(async (req, res) => {
    const {
        type,
        amount,
        category,
        description,
        date,
        sharedAccountId,
        isRecurring,
        recurringPattern,
        tags
    } = req.body;

    const userId = req.user._id;

    // Validation
    if (!type || !amount || !category) {
        throw new ApiError(400, "Type, amount, and category are required");
    }

    if (!["income", "expense"].includes(type)) {
        throw new ApiError(400, "Type must be 'income' or 'expense'");
    }

    if (amount <= 0) {
        throw new ApiError(400, "Amount must be greater than 0");
    }

    // Validate shared account access if provided
    let sharedAccount = null;
    if (sharedAccountId) {
        sharedAccount = await SharedAccount.findOne({
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

    // Create transaction
    const transaction = await Transaction.create({
        type,
        amount: parseFloat(amount),
        category,
        description: description || "",
        date: date ? new Date(date) : new Date(),
        owner: userId,
        sharedAccount: sharedAccountId || null,
        isRecurring: isRecurring || false,
        recurringPattern: isRecurring && recurringPattern ? recurringPattern : undefined,
        tags: tags || []
    });

    // Check budget if it's an expense
    if (type === "expense" && !sharedAccountId) {
        const budget = await Budget.findOne({
            category,
            owner: userId,
            isActive: true,
            $or: [
                { endDate: null },
                { endDate: { $gte: new Date() } }
            ]
        });

        if (budget) {
            // Calculate spent amount for current period
            const periodStart = getPeriodStart(budget.period, new Date(transaction.date));
            const spent = await Transaction.aggregate([
                {
                    $match: {
                        type: "expense",
                        category: category,
                        owner: userId,
                        date: { $gte: periodStart },
                        sharedAccount: null
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
            const percentage = (totalSpent / budget.amount) * 100;

            // You can add notification logic here if needed
        }
    }

    return res.status(201).json(
        new ApiResponse(201, transaction, "Transaction created successfully")
    );
});

// Update transaction
const updateTransaction = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    const updateData = req.body;

    // Find transaction
    const transaction = await Transaction.findOne({
        _id: id,
        owner: userId
    });

    if (!transaction) {
        throw new ApiError(404, "Transaction not found");
    }

    // If transaction belongs to shared account, check permissions
    if (transaction.sharedAccount) {
        const sharedAccount = await SharedAccount.findById(transaction.sharedAccount);
        if (sharedAccount && !sharedAccount.settings.allowMemberEditTransactions) {
            const member = sharedAccount.members.find(m => m.user.toString() === userId.toString());
            if (!member || member.role !== "admin") {
                throw new ApiError(403, "You don't have permission to edit this transaction");
            }
        }
    }

    // Update transaction
    Object.keys(updateData).forEach(key => {
        if (key !== "_id" && key !== "owner" && key !== "createdAt") {
            transaction[key] = updateData[key];
        }
    });

    await transaction.save();

    return res.status(200).json(
        new ApiResponse(200, transaction, "Transaction updated successfully")
    );
});

// Delete transaction
const deleteTransaction = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const transaction = await Transaction.findOne({
        _id: id,
        owner: userId
    });

    if (!transaction) {
        throw new ApiError(404, "Transaction not found");
    }

    // If transaction belongs to shared account, check permissions
    if (transaction.sharedAccount) {
        const sharedAccount = await SharedAccount.findById(transaction.sharedAccount);
        if (sharedAccount && !sharedAccount.settings.allowMemberDeleteTransactions) {
            const member = sharedAccount.members.find(m => m.user.toString() === userId.toString());
            if (!member || member.role !== "admin") {
                throw new ApiError(403, "You don't have permission to delete this transaction");
            }
        }
    }

    await Transaction.findByIdAndDelete(id);

    return res.status(200).json(
        new ApiResponse(200, {}, "Transaction deleted successfully")
    );
});

// Get transaction statistics
const getTransactionStats = asyncHandler(async (req, res) => {
    const { startDate, endDate, sharedAccountId } = req.query;
    const userId = req.user._id;

    const query = { owner: userId };
    if (sharedAccountId) {
        query.sharedAccount = sharedAccountId;
    } else {
        query.sharedAccount = null;
    }

    if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
    }

    const stats = await Transaction.aggregate([
        { $match: query },
        {
            $group: {
                _id: {
                    type: "$type",
                    category: "$category"
                },
                total: { $sum: "$amount" },
                count: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: "$_id.type",
                categories: {
                    $push: {
                        category: "$_id.category",
                        total: "$total",
                        count: "$count"
                    }
                },
                total: { $sum: "$total" }
            }
        }
    ]);

    const incomeStats = stats.find(s => s._id === "income");
    const expenseStats = stats.find(s => s._id === "expense");

    return res.status(200).json(
        new ApiResponse(200, {
            income: incomeStats || { total: 0, categories: [] },
            expense: expenseStats || { total: 0, categories: [] },
            balance: (incomeStats?.total || 0) - (expenseStats?.total || 0)
        }, "Statistics fetched successfully")
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
    getTransactions,
    getTransaction,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionStats
};


import mongoose, { Schema } from "mongoose";

const budgetSchema = new Schema(
    {
        category: {
            type: String,
            required: true,
            enum: [
                "Food", "Rent", "Utilities", "Transportation", "Entertainment", 
                "Shopping", "Healthcare", "Education", "Travel", "Bills", "Other Expense"
            ],
            index: true
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        period: {
            type: String,
            required: true,
            enum: ["weekly", "monthly", "yearly"],
            default: "monthly"
        },
        startDate: {
            type: Date,
            required: true,
            default: Date.now
        },
        endDate: {
            type: Date,
            default: null
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        sharedAccount: {
            type: Schema.Types.ObjectId,
            ref: "SharedAccount",
            default: null
        },
        isActive: {
            type: Boolean,
            default: true
        },
        notifications: {
            enabled: {
                type: Boolean,
                default: true
            },
            threshold: {
                type: Number,
                default: 80 // Notify when 80% of budget is used
            }
        }
    },
    {
        timestamps: true
    }
);

// Index for efficient queries
budgetSchema.index({ owner: 1, period: 1, startDate: -1 });
budgetSchema.index({ sharedAccount: 1, period: 1 });

export const Budget = mongoose.model("Budget", budgetSchema);


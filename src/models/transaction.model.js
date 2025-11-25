import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const transactionSchema = new Schema(
    {
        type: {
            type: String,
            required: true,
            enum: ["income", "expense"],
            index: true
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        category: {
            type: String,
            required: true,
            enum: [
                // Income categories
                "Salary", "Freelance", "Investment", "Business", "Gift", "Other Income",
                // Expense categories
                "Food", "Rent", "Utilities", "Transportation", "Entertainment", 
                "Shopping", "Healthcare", "Education", "Travel", "Bills", "Other Expense"
            ],
            index: true
        },
        description: {
            type: String,
            trim: true
        },
        date: {
            type: Date,
            required: true,
            default: Date.now,
            index: true
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
        isRecurring: {
            type: Boolean,
            default: false
        },
        recurringPattern: {
            frequency: {
                type: String,
                enum: ["daily", "weekly", "monthly", "yearly"],
                default: null
            },
            nextDate: {
                type: Date,
                default: null
            },
            endDate: {
                type: Date,
                default: null
            },
            interval: {
                type: Number,
                default: 1 // Every 1 day/week/month/year
            }
        },
        tags: [{
            type: String,
            trim: true
        }]
    },
    {
        timestamps: true
    }
);

// Index for efficient queries
transactionSchema.index({ owner: 1, date: -1 });
transactionSchema.index({ owner: 1, type: 1, category: 1 });
transactionSchema.index({ sharedAccount: 1, date: -1 });

transactionSchema.plugin(mongooseAggregatePaginate);

export const Transaction = mongoose.model("Transaction", transactionSchema);


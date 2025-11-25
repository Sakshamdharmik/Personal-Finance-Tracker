import mongoose, { Schema } from "mongoose";

const sharedAccountSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        members: [{
            user: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            role: {
                type: String,
                enum: ["admin", "member"],
                default: "member"
            },
            joinedAt: {
                type: Date,
                default: Date.now
            }
        }],
        isActive: {
            type: Boolean,
            default: true
        },
        settings: {
            allowMemberAddTransactions: {
                type: Boolean,
                default: true
            },
            allowMemberDeleteTransactions: {
                type: Boolean,
                default: false
            },
            allowMemberEditTransactions: {
                type: Boolean,
                default: true
            }
        }
    },
    {
        timestamps: true
    }
);

// Index for efficient queries
sharedAccountSchema.index({ owner: 1 });
sharedAccountSchema.index({ "members.user": 1 });

export const SharedAccount = mongoose.model("SharedAccount", sharedAccountSchema);


import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        unique: true
    },
    plan: {
        type: String,
        enum: ['free', 'pro', 'premier'],
        default: 'free'
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'cancelled'],
        default: 'active'
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        default: null
    },
    // Usage tracking
    usage: {
        aiScans: {
            type: Number,
            default: 0
        },
        aiScansLimit: {
            type: Number,
            default: 5 // Free plan: 5 scans/month
        },
        analysisReports: {
            type: Number,
            default: 0
        },
        analysisReportsLimit: {
            type: Number,
            default: 1 // Free plan: 1 report/month
        },
        journalEntries: {
            type: Number,
            default: 0
        },
        journalEntriesLimit: {
            type: Number,
            default: 10 // Free plan: 10 entries/month
        },
        productComparisons: {
            type: Number,
            default: 0
        },
        productComparisonsLimit: {
            type: Number,
            default: 0 // Free plan: no comparisons
        },
        lastResetDate: {
            type: Date,
            default: Date.now
        }
    },
    // Payment info
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'bank_transfer', 'momo', 'zalopay', null],
        default: null
    },
    transactionId: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update updatedAt before saving
subscriptionSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Reset usage monthly
subscriptionSchema.methods.resetMonthlyUsage = function() {
    const now = new Date();
    const lastReset = new Date(this.usage.lastResetDate);
    
    // Check if a month has passed
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
        this.usage.aiScans = 0;
        this.usage.analysisReports = 0;
        this.usage.journalEntries = 0;
        this.usage.productComparisons = 0;
        this.usage.lastResetDate = now;
        return true;
    }
    return false;
};

// Check if user can perform action
subscriptionSchema.methods.canPerformAction = function(actionType) {
    this.resetMonthlyUsage();
    
    const limits = {
        'ai_scan': { used: this.usage.aiScans, limit: this.usage.aiScansLimit },
        'analysis_report': { used: this.usage.analysisReports, limit: this.usage.analysisReportsLimit },
        'journal_entry': { used: this.usage.journalEntries, limit: this.usage.journalEntriesLimit },
        'product_comparison': { used: this.usage.productComparisons, limit: this.usage.productComparisonsLimit }
    };
    
    const action = limits[actionType];
    if (!action) return { allowed: true, remaining: Infinity };
    
    return {
        allowed: action.used < action.limit,
        remaining: Math.max(0, action.limit - action.used),
        limit: action.limit
    };
};

// Increment usage
subscriptionSchema.methods.incrementUsage = function(actionType) {
    this.resetMonthlyUsage();
    
    const usageMap = {
        'ai_scan': 'aiScans',
        'analysis_report': 'analysisReports',
        'journal_entry': 'journalEntries',
        'product_comparison': 'productComparisons'
    };
    
    const field = usageMap[actionType];
    if (field && this.usage[field] < this.usage[`${field}Limit`]) {
        this.usage[field] += 1;
        return true;
    }
    return false;
};

const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);

export default Subscription;


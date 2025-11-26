import mongoose from "mongoose";

const pricingPlanSchema = new mongoose.Schema({
    planId: {
        type: String,
        enum: ['free', 'pro', 'premier'],
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    price: {
        monthly: {
            type: Number,
            default: 0
        },
        yearly: {
            type: Number,
            default: 0
        }
    },
    currency: {
        type: String,
        default: 'VND'
    },
    features: {
        aiScansPerMonth: {
            type: Number,
            default: 5
        },
        analysisReportsPerMonth: {
            type: Number,
            default: 1
        },
        journalEntriesPerMonth: {
            type: Number,
            default: 10
        },
        productComparisonsPerMonth: {
            type: Number,
            default: 0
        },
        advancedAnalytics: {
            type: Boolean,
            default: false
        },
        aiRecommendations: {
            type: Boolean,
            default: false
        },
        exportData: {
            type: Boolean,
            default: false
        },
        prioritySupport: {
            type: Boolean,
            default: false
        },
        customRoutines: {
            type: Boolean,
            default: false
        },
        ingredientAlerts: {
            type: Boolean,
            default: false
        }
    },
    isActive: {
        type: Boolean,
        default: true
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

pricingPlanSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const PricingPlan = mongoose.models.PricingPlan || mongoose.model('PricingPlan', pricingPlanSchema);

export default PricingPlan;


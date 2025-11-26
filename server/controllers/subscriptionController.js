import Subscription from '../models/subscriptionModel.js';
import PricingPlan from '../models/pricingPlanModel.js';
import User from '../models/userModel.js';

const applyPlanOverrides = (planDoc) => {
    if (!planDoc) return null;
    const plan = planDoc.toObject ? planDoc.toObject() : { ...planDoc };

    if (plan.planId === 'pro') {
        plan.price = plan.price || {};
        plan.price.monthly = 49000;
        plan.price.yearly = 490000;
    }

    return plan;
};

// Get user subscription
export const getSubscription = async (req, res) => {
    try {
        let subscription = await Subscription.findOne({ user: req.userId })
            .populate('user', 'name email');

        // Create free subscription if doesn't exist
        if (!subscription) {
            const freePlan = await PricingPlan.findOne({ planId: 'free' });
            if (!freePlan) {
                return res.status(500).json({
                    success: false,
                    message: 'Free plan not found. Please run seed script.'
                });
            }

            subscription = await Subscription.create({
                user: req.userId,
                plan: 'free',
                status: 'active',
                usage: {
                    aiScansLimit: freePlan.features.aiScansPerMonth,
                    analysisReportsLimit: freePlan.features.analysisReportsPerMonth,
                    journalEntriesLimit: freePlan.features.journalEntriesPerMonth,
                    productComparisonsLimit: freePlan.features.productComparisonsPerMonth
                }
            });
        }

        // Reset monthly usage if needed
        subscription.resetMonthlyUsage();
        await subscription.save();

        const planDoc = await PricingPlan.findOne({ planId: subscription.plan });
        const plan = applyPlanOverrides(planDoc);

        res.json({
            success: true,
            data: {
                subscription: {
                    plan: subscription.plan,
                    status: subscription.status,
                    startDate: subscription.startDate,
                    endDate: subscription.endDate,
                    usage: subscription.usage
                },
                plan: plan ? {
                    name: plan.name,
                    description: plan.description,
                    price: plan.price,
                    features: plan.features
                } : null
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Check if user can perform action
export const checkActionLimit = async (req, res) => {
    try {
        const { actionType } = req.body; // 'ai_scan', 'analysis_report', 'journal_entry', 'product_comparison'

        let subscription = await Subscription.findOne({ user: req.userId });
        
        if (!subscription) {
            // Create free subscription
            const freePlan = await PricingPlan.findOne({ planId: 'free' });
            subscription = await Subscription.create({
                user: req.userId,
                plan: 'free',
                status: 'active',
                usage: {
                    aiScansLimit: freePlan.features.aiScansPerMonth,
                    analysisReportsLimit: freePlan.features.analysisReportsPerMonth,
                    journalEntriesLimit: freePlan.features.journalEntriesPerMonth,
                    productComparisonsLimit: freePlan.features.productComparisonsPerMonth
                }
            });
        }

        const canPerform = subscription.canPerformAction(actionType);
        
        res.json({
            success: true,
            data: canPerform
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Upgrade subscription
export const upgradeSubscription = async (req, res) => {
    try {
        const { planId, billingCycle } = req.body; // billingCycle: 'monthly' or 'yearly'

        if (!['pro', 'premier'].includes(planId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid plan. Only pro and premier plans are available for upgrade.'
            });
        }

        const plan = await PricingPlan.findOne({ planId, isActive: true });
        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found'
            });
        }

        let subscription = await Subscription.findOne({ user: req.userId });
        
        if (!subscription) {
            // Create new subscription
            subscription = await Subscription.create({
                user: req.userId,
                plan: planId,
                status: 'active',
                startDate: new Date(),
                endDate: billingCycle === 'yearly' 
                    ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                usage: {
                    aiScansLimit: plan.features.aiScansPerMonth === -1 ? 999999 : plan.features.aiScansPerMonth,
                    analysisReportsLimit: plan.features.analysisReportsPerMonth === -1 ? 999999 : plan.features.analysisReportsPerMonth,
                    journalEntriesLimit: plan.features.journalEntriesPerMonth === -1 ? 999999 : plan.features.journalEntriesPerMonth,
                    productComparisonsLimit: plan.features.productComparisonsPerMonth === -1 ? 999999 : plan.features.productComparisonsPerMonth
                }
            });
        } else {
            // Update existing subscription
            subscription.plan = planId;
            subscription.status = 'active';
            subscription.startDate = new Date();
            subscription.endDate = billingCycle === 'yearly' 
                ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            
            // Update limits
            subscription.usage.aiScansLimit = plan.features.aiScansPerMonth === -1 ? 999999 : plan.features.aiScansPerMonth;
            subscription.usage.analysisReportsLimit = plan.features.analysisReportsPerMonth === -1 ? 999999 : plan.features.analysisReportsPerMonth;
            subscription.usage.journalEntriesLimit = plan.features.journalEntriesPerMonth === -1 ? 999999 : plan.features.journalEntriesPerMonth;
            subscription.usage.productComparisonsLimit = plan.features.productComparisonsPerMonth === -1 ? 999999 : plan.features.productComparisonsPerMonth;
            
            await subscription.save();
        }

        // TODO: Integrate with payment gateway (Momo, ZaloPay, etc.)
        // For now, we'll just update the subscription
        
        res.json({
            success: true,
            message: `Đã nâng cấp lên gói ${plan.name} thành công!`,
            data: {
                subscription: {
                    plan: subscription.plan,
                    status: subscription.status,
                    endDate: subscription.endDate
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all pricing plans
export const getPricingPlans = async (req, res) => {
    try {
        const plans = await PricingPlan.find({ isActive: true }).sort({ 'price.monthly': 1 });
        const adjustedPlans = plans.map(applyPlanOverrides);
        
        res.json({
            success: true,
            data: adjustedPlans
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Increment usage (called after action is performed)
export const incrementUsage = async (req, res) => {
    try {
        const { actionType } = req.body;

        let subscription = await Subscription.findOne({ user: req.userId });
        
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        const incremented = subscription.incrementUsage(actionType);
        await subscription.save();

        res.json({
            success: true,
            data: {
                incremented,
                usage: subscription.usage
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


import Subscription from '../models/subscriptionModel.js';
import PricingPlan from '../models/pricingPlanModel.js';

/**
 * Middleware to check if user can perform a specific action
 * Usage: subscriptionCheck('ai_scan')
 */
export const subscriptionCheck = (actionType) => {
    return async (req, res, next) => {
        try {
            if (!req.userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            let subscription = await Subscription.findOne({ user: req.userId });

            // Create free subscription if doesn't exist
            if (!subscription) {
                const freePlan = await PricingPlan.findOne({ planId: 'free' });
                if (!freePlan) {
                    return res.status(500).json({
                        success: false,
                        message: 'Free plan not found'
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

            // Check if subscription is active
            if (subscription.status !== 'active') {
                return res.status(403).json({
                    success: false,
                    message: 'Subscription is not active',
                    code: 'SUBSCRIPTION_INACTIVE'
                });
            }

            // Check if subscription has expired
            if (subscription.endDate && new Date() > subscription.endDate) {
                subscription.status = 'expired';
                await subscription.save();
                
                return res.status(403).json({
                    success: false,
                    message: 'Subscription has expired',
                    code: 'SUBSCRIPTION_EXPIRED'
                });
            }

            // Check action limit
            const canPerform = subscription.canPerformAction(actionType);

            if (!canPerform.allowed) {
                return res.status(403).json({
                    success: false,
                    message: `Bạn đã đạt giới hạn ${actionType}. Vui lòng nâng cấp gói để tiếp tục sử dụng.`,
                    code: 'LIMIT_EXCEEDED',
                    data: {
                        remaining: canPerform.remaining,
                        limit: canPerform.limit,
                        actionType
                    }
                });
            }

            // Attach subscription info to request
            req.subscription = subscription;
            req.canPerform = canPerform;
            
            next();
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };
};

export default subscriptionCheck;


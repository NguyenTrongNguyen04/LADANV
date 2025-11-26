import express from "express";
import {
    getSubscription,
    checkActionLimit,
    upgradeSubscription,
    getPricingPlans,
    incrementUsage
} from "../controllers/subscriptionController.js";
import userAuth from "../middleware/userAuth.js";

const subscriptionRouter = express.Router();

// Public routes
subscriptionRouter.get('/plans', getPricingPlans);

// Protected routes (require authentication)
subscriptionRouter.get('/', userAuth, getSubscription);
subscriptionRouter.post('/check-limit', userAuth, checkActionLimit);
subscriptionRouter.post('/upgrade', userAuth, upgradeSubscription);
subscriptionRouter.post('/increment-usage', userAuth, incrementUsage);

export default subscriptionRouter;


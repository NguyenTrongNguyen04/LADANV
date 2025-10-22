import express from "express";
import {
    adminLogin,
    adminLogout,
    checkAdminAuth,
    createSuperAdmin,
    getAdminProfile,
    updateAdminProfile,
    changeAdminPassword
} from "../controllers/adminController.js";
import adminAuth, { requireSuperAdmin } from "../middleware/adminAuth.js";

const adminRouter = express.Router();

// Public routes
adminRouter.post('/login', adminLogin);
adminRouter.post('/create-super-admin', createSuperAdmin); // Only for initial setup

// Protected routes
adminRouter.post('/logout', adminAuth, adminLogout);
adminRouter.get('/auth', adminAuth, checkAdminAuth);
adminRouter.get('/profile', adminAuth, getAdminProfile);
adminRouter.put('/profile', adminAuth, updateAdminProfile);
adminRouter.put('/change-password', adminAuth, changeAdminPassword);

export default adminRouter;

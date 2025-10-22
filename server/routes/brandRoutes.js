import express from "express";
import {
    getAllBrands,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand,
    getBrandsDropdown
} from "../controllers/brandController.js";
import adminAuth from "../middleware/adminAuth.js";

const brandRouter = express.Router();

// Public routes
brandRouter.get('/dropdown', getBrandsDropdown);
brandRouter.get('/:id', getBrandById);

// Admin routes (protected)
brandRouter.get('/', getAllBrands);
brandRouter.post('/', adminAuth, createBrand);
brandRouter.put('/:id', adminAuth, updateBrand);
brandRouter.delete('/:id', adminAuth, deleteBrand);

export default brandRouter;

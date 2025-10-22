import express from "express";
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getFeaturedProducts,
    getProductsByBrand,
    searchProducts
} from "../controllers/productController.js";
import adminAuth from "../middleware/adminAuth.js";

const productRouter = express.Router();

// Public routes (for market)
productRouter.get('/featured', getFeaturedProducts);
productRouter.get('/search', searchProducts);
productRouter.get('/brand/:brandId', getProductsByBrand);
productRouter.get('/:id', getProductById);
productRouter.get('/', getAllProducts);

// Admin routes (protected)
productRouter.post('/', adminAuth, createProduct);
productRouter.put('/:id', adminAuth, updateProduct);
productRouter.delete('/:id', adminAuth, deleteProduct);

export default productRouter;

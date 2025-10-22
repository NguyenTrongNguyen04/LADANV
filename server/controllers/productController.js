import Product from "../models/productModel.js";
import Brand from "../models/brandModel.js";

// Get all products
export const getAllProducts = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 12, 
            search = '', 
            brand = '', 
            category = '', 
            skinType = '',
            minPrice = '',
            maxPrice = '',
            sortBy = 'createdAt',
            sortOrder = 'desc',
            isActive = 'true'
        } = req.query;
        
        const query = {};
        
        // Search by name or description
        if (search) {
            query.$text = { $search: search };
        }
        
        // Filter by brand
        if (brand) {
            query.brand = brand;
        }
        
        // Filter by category
        if (category) {
            query.category = category;
        }
        
        // Filter by skin type
        if (skinType) {
            query.skinTypes = { $in: [skinType] };
        }
        
        // Filter by price range
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }
        
        // Filter by active status
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }
        
        // Sort options
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
        
        const products = await Product.find(query)
            .populate('brand', 'name logo origin')
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit);
            
        const total = await Product.countDocuments(query);
        
        res.json({
            success: true,
            data: products,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get single product
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('brand', 'name logo origin website');
            
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create new product
export const createProduct = async (req, res) => {
    try {
        const {
            name,
            brand,
            price,
            currency = 'VND',
            description,
            specifications,
            usageInstructions,
            images = [],
            category = 'other',
            skinTypes = [],
            tags = [],
            stock = 0
        } = req.body;
        
        // Validate required fields
        if (!name || !brand || !price || !description || !usageInstructions) {
            return res.status(400).json({
                success: false,
                message: 'Name, brand, price, description, and usage instructions are required'
            });
        }
        
        // Check if brand exists
        const brandExists = await Brand.findById(brand);
        if (!brandExists) {
            return res.status(400).json({
                success: false,
                message: 'Brand not found'
            });
        }
        
        const product = new Product({
            name,
            brand,
            price,
            currency,
            description,
            specifications,
            usageInstructions,
            images,
            category,
            skinTypes,
            tags,
            stock
        });
        
        await product.save();
        await product.populate('brand', 'name logo origin');
        
        res.status(201).json({
            success: true,
            data: product,
            message: 'Product created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update product
export const updateProduct = async (req, res) => {
    try {
        const {
            name,
            brand,
            price,
            currency,
            description,
            specifications,
            usageInstructions,
            images,
            category,
            skinTypes,
            tags,
            stock,
            isActive,
            isFeatured
        } = req.body;
        
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        // Check if brand exists (if brand is being updated)
        if (brand && brand !== product.brand.toString()) {
            const brandExists = await Brand.findById(brand);
            if (!brandExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Brand not found'
                });
            }
        }
        
        const updateData = {};
        if (name) updateData.name = name;
        if (brand) updateData.brand = brand;
        if (price !== undefined) updateData.price = price;
        if (currency) updateData.currency = currency;
        if (description) updateData.description = description;
        if (specifications) updateData.specifications = specifications;
        if (usageInstructions) updateData.usageInstructions = usageInstructions;
        if (images) updateData.images = images;
        if (category) updateData.category = category;
        if (skinTypes) updateData.skinTypes = skinTypes;
        if (tags) updateData.tags = tags;
        if (stock !== undefined) updateData.stock = stock;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
        
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('brand', 'name logo origin');
        
        res.json({
            success: true,
            data: updatedProduct,
            message: 'Product updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete product
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        await Product.findByIdAndDelete(req.params.id);
        
        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get featured products
export const getFeaturedProducts = async (req, res) => {
    try {
        const { limit = 8 } = req.query;
        
        const products = await Product.find({ 
            isActive: true, 
            isFeatured: true 
        })
        .populate('brand', 'name logo origin')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));
        
        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get products by brand
export const getProductsByBrand = async (req, res) => {
    try {
        const { brandId } = req.params;
        const { page = 1, limit = 12 } = req.query;
        
        const products = await Product.find({ 
            brand: brandId, 
            isActive: true 
        })
        .populate('brand', 'name logo origin')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
        
        const total = await Product.countDocuments({ 
            brand: brandId, 
            isActive: true 
        });
        
        res.json({
            success: true,
            data: products,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Search products
export const searchProducts = async (req, res) => {
    try {
        const { q, limit = 10 } = req.query;
        
        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }
        
        const products = await Product.find({
            $text: { $search: q },
            isActive: true
        })
        .populate('brand', 'name logo')
        .limit(parseInt(limit));
        
        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

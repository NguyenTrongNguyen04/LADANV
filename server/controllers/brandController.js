import Brand from "../models/brandModel.js";

// Get all brands
export const getAllBrands = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', isActive } = req.query;
        
        const query = {};
        
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }
        
        const brands = await Brand.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
            
        const total = await Brand.countDocuments(query);
        
        res.json({
            success: true,
            data: brands,
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

// Get single brand
export const getBrandById = async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
            
        if (!brand) {
            return res.status(404).json({
                success: false,
                message: 'Brand not found'
            });
        }
        
        res.json({
            success: true,
            data: brand
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create new brand
export const createBrand = async (req, res) => {
    try {
        const { name, description, logo, origin, website } = req.body;
        
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Brand name is required'
            });
        }
        
        const existingBrand = await Brand.findOne({ name });
        if (existingBrand) {
            return res.status(400).json({
                success: false,
                message: 'Brand already exists'
            });
        }
        
        const brand = new Brand({
            name,
            description,
            logo,
            origin,
            website
        });
        
        await brand.save();
        
        res.status(201).json({
            success: true,
            data: brand,
            message: 'Brand created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update brand
export const updateBrand = async (req, res) => {
    try {
        const { name, description, logo, origin, website, isActive } = req.body;
        
        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return res.status(404).json({
                success: false,
                message: 'Brand not found'
            });
        }
        
        // Check if name is being changed and if it already exists
        if (name && name !== brand.name) {
            const existingBrand = await Brand.findOne({ name });
            if (existingBrand) {
                return res.status(400).json({
                    success: false,
                    message: 'Brand name already exists'
                });
            }
        }
        
        const updateData = {};
        if (name) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (logo !== undefined) updateData.logo = logo;
        if (origin !== undefined) updateData.origin = origin;
        if (website !== undefined) updateData.website = website;
        if (isActive !== undefined) updateData.isActive = isActive;
        
        const updatedBrand = await Brand.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        
        res.json({
            success: true,
            data: updatedBrand,
            message: 'Brand updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete brand
export const deleteBrand = async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return res.status(404).json({
                success: false,
                message: 'Brand not found'
            });
        }
        
        // Check if brand has products
        const Product = (await import('../models/productModel.js')).default;
        const productCount = await Product.countDocuments({ brand: req.params.id });
        
        if (productCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete brand. It has ${productCount} products. Please delete products first.`
            });
        }
        
        await Brand.findByIdAndDelete(req.params.id);
        
        res.json({
            success: true,
            message: 'Brand deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get brands for dropdown (simple list)
export const getBrandsDropdown = async (req, res) => {
    try {
        const brands = await Brand.find({ isActive: true })
            .select('name _id')
            .sort({ name: 1 });
            
        res.json({
            success: true,
            data: brands
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'VND',
        enum: ['VND', 'USD', 'EUR']
    },
    description: {
        type: String,
        required: true
    },
    specifications: {
        barcode: {
            type: String,
            default: ""
        },
        brandOrigin: {
            type: String,
            default: ""
        },
        manufacturePlace: {
            type: String,
            default: ""
        },
        skinType: {
            type: String,
            default: ""
        },
        features: {
            type: String,
            default: ""
        },
        volume: {
            type: String,
            default: ""
        },
        weight: {
            type: String,
            default: ""
        },
        ingredients: {
            type: [String],
            default: []
        }
    },
    usageInstructions: {
        type: String,
        required: true
    },
    images: {
        type: [String],
        default: []
    },
    category: {
        type: String,
        enum: ['cleanser', 'moisturizer', 'serum', 'toner', 'sunscreen', 'mask', 'treatment', 'other'],
        default: 'other'
    },
    skinTypes: {
        type: [String],
        enum: ['oily', 'dry', 'combination', 'sensitive', 'normal'],
        default: []
    },
    tags: {
        type: [String],
        default: []
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    stock: {
        type: Number,
        default: 0,
        min: 0
    },
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
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
productSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Index for better search performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ brand: 1 });
productSchema.index({ category: 1 });
productSchema.index({ skinTypes: 1 });
productSchema.index({ isActive: 1 });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;

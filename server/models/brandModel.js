import mongoose from "mongoose";

const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    logo: {
        type: String,
        default: ""
    },
    origin: {
        type: String,
        default: ""
    },
    website: {
        type: String,
        default: ""
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

// Update updatedAt before saving
brandSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Brand = mongoose.models.Brand || mongoose.model('Brand', brandSchema);

export default Brand;

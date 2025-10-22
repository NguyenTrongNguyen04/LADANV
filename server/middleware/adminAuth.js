import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const adminAuth = async (req, res, next) => {
    const { adminToken } = req.cookies;

    if (!adminToken) {
        return res.status(401).json({
            success: false,
            message: 'Không có token admin. Vui lòng đăng nhập.'
        });
    }

    try {
        const tokenDecode = jwt.verify(adminToken, process.env.JWT_SECRET);

        if (!tokenDecode.userId) {
            return res.status(401).json({
                success: false,
                message: 'Token admin không hợp lệ'
            });
        }

        // Check if user still exists and has admin role
        const user = await User.findById(tokenDecode.userId);
        
        if (!user || !['admin', 'super_admin'].includes(user.role)) {
            return res.status(401).json({
                success: false,
                message: 'Tài khoản admin không tồn tại hoặc không có quyền'
            });
        }

        req.userId = user._id;
        req.adminRole = user.role;
        req.admin = user;
        
        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token admin đã hết hạn. Vui lòng đăng nhập lại.'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token admin không hợp lệ'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi xác thực admin'
        });
    }
};

// Middleware to check admin role
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.adminRole) {
            return res.status(401).json({
                success: false,
                message: 'Không có quyền truy cập'
            });
        }

        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        
        if (!allowedRoles.includes(req.adminRole)) {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền thực hiện hành động này'
            });
        }

        next();
    };
};

// Middleware for super admin only
const requireSuperAdmin = requireRole('super_admin');

// Middleware for admin and super admin
const requireAdmin = requireRole(['admin', 'super_admin']);

export { adminAuth, requireRole, requireSuperAdmin, requireAdmin };
export default adminAuth;

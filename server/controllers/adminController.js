import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

// Admin Login
export const adminLogin = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username và password là bắt buộc'
        });
    }

    try {
        // Find user by email with admin role
        const user = await User.findOne({
            email: username,
            role: { $in: ['admin', 'super_admin'] }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Tài khoản admin không tồn tại'
            });
        }

        // Compare password (using bcrypt directly since User model doesn't have comparePassword method)
        const bcrypt = await import('bcryptjs');
        const isMatch = await bcrypt.default.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Mật khẩu không đúng'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user._id, 
                email: user.email,
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Set cookie
        res.cookie('adminToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.json({
            success: true,
            message: 'Đăng nhập admin thành công',
            admin: {
                id: user._id,
                username: user.email,
                email: user.email,
                fullName: user.name,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi đăng nhập'
        });
    }
};

// Admin Logout
export const adminLogout = async (req, res) => {
    try {
        res.clearCookie('adminToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
        });

        res.json({
            success: true,
            message: 'Đăng xuất admin thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi đăng xuất'
        });
    }
};

// Check Admin Authentication
export const checkAdminAuth = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        
        if (!user || !['admin', 'super_admin'].includes(user.role)) {
            return res.status(401).json({
                success: false,
                message: 'Tài khoản admin không hợp lệ'
            });
        }

        res.json({
            success: true,
            admin: {
                id: user._id,
                username: user.email,
                email: user.email,
                fullName: user.name,
                role: user.role,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi kiểm tra xác thực'
        });
    }
};

// Create Super Admin (for initial setup)
export const createSuperAdmin = async (req, res) => {
    try {
        // Check if super admin already exists
        const existingSuperAdmin = await Admin.findOne({ role: 'super_admin' });
        if (existingSuperAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Super admin đã tồn tại'
            });
        }

        const { username, email, password, fullName } = req.body;

        if (!username || !email || !password || !fullName) {
            return res.status(400).json({
                success: false,
                message: 'Tất cả các trường là bắt buộc'
            });
        }

        const superAdmin = new Admin({
            username,
            email,
            password,
            fullName,
            role: 'super_admin'
        });

        await superAdmin.save();

        res.status(201).json({
            success: true,
            message: 'Super admin đã được tạo thành công',
            admin: {
                id: superAdmin._id,
                username: superAdmin.username,
                email: superAdmin.email,
                fullName: superAdmin.fullName,
                role: superAdmin.role
            }
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Username hoặc email đã tồn tại'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi tạo super admin'
        });
    }
};

// Get Admin Profile
export const getAdminProfile = async (req, res) => {
    try {
        const admin = await Admin.findById(req.adminId).select('-password');
        
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin không tồn tại'
            });
        }

        res.json({
            success: true,
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                fullName: admin.fullName,
                role: admin.role,
                isActive: admin.isActive,
                lastLogin: admin.lastLogin,
                createdAt: admin.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thông tin admin'
        });
    }
};

// Update Admin Profile
export const updateAdminProfile = async (req, res) => {
    try {
        const { fullName, email } = req.body;
        
        const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (email) updateData.email = email;

        const admin = await Admin.findByIdAndUpdate(
            req.adminId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Cập nhật thông tin thành công',
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                fullName: admin.fullName,
                role: admin.role
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Email đã tồn tại'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật thông tin'
        });
    }
};

// Change Admin Password
export const changeAdminPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu hiện tại và mật khẩu mới là bắt buộc'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu mới phải có ít nhất 6 ký tự'
            });
        }

        const admin = await Admin.findById(req.adminId);
        
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin không tồn tại'
            });
        }

        // Verify current password
        const isMatch = await admin.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu hiện tại không đúng'
            });
        }

        // Update password
        admin.password = newPassword;
        await admin.save();

        res.json({
            success: true,
            message: 'Đổi mật khẩu thành công'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi đổi mật khẩu'
        });
    }
};

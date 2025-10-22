import mongoose from 'mongoose';
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const createSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
    if (existingSuperAdmin) {
      console.log('Super admin already exists:', existingSuperAdmin.email);
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123456', salt);

    // Create super admin user
    const superAdmin = new User({
      name: 'Super Administrator',
      email: 'admin@ladanv.com',
      password: hashedPassword,
      role: 'super_admin',
      isAccountVerified: true
    });

    await superAdmin.save();
    console.log('Super admin created successfully!');
    console.log('Email: admin@ladanv.com');
    console.log('Password: admin123456');
    console.log('Role: super_admin');
    console.log('\n⚠️  IMPORTANT: Please change the password after first login!');

  } catch (error) {
    console.error('Error creating super admin:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createSuperAdmin();

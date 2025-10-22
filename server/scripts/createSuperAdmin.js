import mongoose from 'mongoose';
import Admin from '../models/adminModel.js';
import dotenv from 'dotenv';

dotenv.config();

const createSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if super admin already exists
    const existingSuperAdmin = await Admin.findOne({ role: 'super_admin' });
    if (existingSuperAdmin) {
      console.log('Super admin already exists:', existingSuperAdmin.username);
      process.exit(0);
    }

    // Create super admin
    const superAdmin = new Admin({
      username: 'superadmin',
      email: 'admin@ladanv.com',
      password: 'admin123456', // This will be hashed automatically
      fullName: 'Super Administrator',
      role: 'super_admin'
    });

    await superAdmin.save();
    console.log('Super admin created successfully!');
    console.log('Username: superadmin');
    console.log('Password: admin123456');
    console.log('Email: admin@ladanv.com');
    console.log('\n⚠️  IMPORTANT: Please change the password after first login!');

  } catch (error) {
    console.error('Error creating super admin:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createSuperAdmin();

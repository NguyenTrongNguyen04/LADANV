import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/mongodb.js';
import PricingPlan from '../models/pricingPlanModel.js';

const pricingPlans = [
    {
        planId: 'free',
        name: 'Gói Miễn Phí',
        description: 'Dành cho người mới bắt đầu',
        price: {
            monthly: 0,
            yearly: 0
        },
        currency: 'VND',
        features: {
            aiScansPerMonth: 5,
            analysisReportsPerMonth: 1,
            journalEntriesPerMonth: 10,
            productComparisonsPerMonth: 0,
            advancedAnalytics: false,
            aiRecommendations: false,
            exportData: false,
            prioritySupport: false,
            customRoutines: false,
            ingredientAlerts: false
        }
    },
    {
        planId: 'pro',
        name: 'Gói Pro',
        description: 'Dành cho người dùng chuyên nghiệp',
        price: {
            monthly: 49000, // 49k/tháng
            yearly: 490000 // 490k/năm (tiết kiệm ~2 tháng)
        },
        currency: 'VND',
        features: {
            aiScansPerMonth: 50,
            analysisReportsPerMonth: 10,
            journalEntriesPerMonth: 100,
            productComparisonsPerMonth: 20,
            advancedAnalytics: true,
            aiRecommendations: true,
            exportData: true,
            prioritySupport: false,
            customRoutines: true,
            ingredientAlerts: true
        }
    },
    {
        planId: 'premier',
        name: 'Gói Premier',
        description: 'Gói cao cấp với đầy đủ tính năng',
        price: {
            monthly: 199000, // 199k/tháng
            yearly: 1990000 // 1.99M/năm (tiết kiệm 2 tháng)
        },
        currency: 'VND',
        features: {
            aiScansPerMonth: -1, // Unlimited
            analysisReportsPerMonth: -1, // Unlimited
            journalEntriesPerMonth: -1, // Unlimited
            productComparisonsPerMonth: -1, // Unlimited
            advancedAnalytics: true,
            aiRecommendations: true,
            exportData: true,
            prioritySupport: true,
            customRoutines: true,
            ingredientAlerts: true
        }
    }
];

async function seedPricingPlans() {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        for (const plan of pricingPlans) {
            const existingPlan = await PricingPlan.findOne({ planId: plan.planId });
            
            if (existingPlan) {
                await PricingPlan.findOneAndUpdate(
                    { planId: plan.planId },
                    plan,
                    { new: true }
                );
                console.log(`✅ Updated plan: ${plan.name}`);
            } else {
                await PricingPlan.create(plan);
                console.log(`✅ Created plan: ${plan.name}`);
            }
        }

        console.log('\n✅ All pricing plans seeded successfully!');
        
    } catch (error) {
        console.error('Error seeding pricing plans:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
        process.exit(0);
    }
}

seedPricingPlans();


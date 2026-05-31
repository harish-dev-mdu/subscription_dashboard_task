const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Plan = require('../models/Plan');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const plans = [
  {
    name: 'Starter Plan',
    price: 499,
    currency: 'INR',
    duration: 2,
    durationUnit: 'minutes',
    features: [
      'Up to 3 projects',
      '5GB storage',
      'Email support',
      'Basic analytics',
      'API access'
    ],
    maxUsers: 1,
    maxProjects: 3,
    storageLimit: 5000
  },
  {
    name: 'Professional Plan',
    price: 999,
    currency: 'INR',
    duration: 3,
    durationUnit: 'minutes',
    features: [
      'Up to 10 projects',
      '25GB storage',
      'Priority email support',
      'Advanced analytics',
      'API access',
      'Team collaboration (3 members)',
      'Custom integrations'
    ],
    maxUsers: 3,
    maxProjects: 10,
    storageLimit: 25000
  },
  {
    name: 'Business Plan',
    price: 1999,
    currency: 'INR',
    duration: 4,
    durationUnit: 'minutes',
    features: [
      'Unlimited projects',
      '100GB storage',
      'Phone & email support',
      'Real-time analytics',
      'API access',
      'Team collaboration (10 members)',
      'Custom integrations',
      'SSO authentication',
      'Advanced security'
    ],
    maxUsers: 10,
    maxProjects: 50,
    storageLimit: 100000
  },
  {
    name: 'Enterprise Plan',
    price: 4999,
    currency: 'INR',
    duration: 365,
    durationUnit: 'days',
    features: [
      'Unlimited projects',
      'Unlimited storage',
      '24/7 dedicated support',
      'Custom analytics dashboard',
      'API access',
      'Unlimited team members',
      'Custom integrations',
      'SSO & SAML',
      'Enterprise security',
      'Dedicated account manager',
      'Custom onboarding',
      'SLA guarantee'
    ],
    maxUsers: -1,
    maxProjects: -1,
    storageLimit: -1
  }
];

const adminUser = {
  name: 'Admin User',
  email: 'admin@gmail.com',
  password: 'admin123',
  role: 'admin'
};

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Clearing existing data...');
    await Plan.deleteMany({});
    await User.deleteMany({ email: 'admin@gmail.com' });

    console.log('Creating admin user...');
    const admin = await User.create(adminUser);
    console.log(`Admin user created: ${admin.email}`);

    console.log('Seeding plans...');
    for (const plan of plans) {
      await Plan.create(plan);
      console.log(`Created plan: ${plan.name} - ₹${plan.price}`);
    }

    console.log('\nSeed completed successfully!');
    console.log('\nPlans created:');
    const allPlans = await Plan.find().sort({ price: 1 });
    allPlans.forEach(plan => {
      console.log(`- ${plan.name}: ₹${plan.price} (${plan.formattedDuration})`);
    });

    console.log('\nAdmin credentials:');
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: ${adminUser.password}`);

    console.log('\nYou can now use these credentials to login as admin.');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

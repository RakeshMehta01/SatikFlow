import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from './config/db';
import User from './models/User';
import Lead from './models/Lead';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    await connectDB();

    // Clear existing users and leads
    console.log('🧹 Clearing existing collections...');
    await User.deleteMany({});
    await Lead.deleteMany({});

    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password@123', salt);

    console.log('👥 Creating users...');
    
    // Create Manager
    const manager = await User.create({
      name: 'SatikFlow Manager',
      email: 'manager@satikflow.com',
      phone: '9876543210',
      passwordHash,
      role: 'MANAGER',
      status: 'ACTIVE'
    });

    // Create Agent 1
    const agent1 = await User.create({
      name: 'Calling Agent One',
      email: 'agent1@satikflow.com',
      phone: '9111111111',
      passwordHash,
      role: 'AGENT',
      status: 'ACTIVE'
    });

    // Create Agent 2
    const agent2 = await User.create({
      name: 'Calling Agent Two',
      email: 'agent2@satikflow.com',
      phone: '9222222222',
      passwordHash,
      role: 'AGENT',
      status: 'ACTIVE'
    });

    console.log('📋 Creating lead profiles...');

    // 1. Lead 1: Complete, GMB style, assigned to Agent 1, status: NEW
    const customFields1 = new Map();
    customFields1.set('Google Maps Link', 'https://maps.google.com/?cid=123');
    customFields1.set('Review Count', '154');

    await Lead.create({
      displayName: 'Royal Palms Resort',
      businessName: 'Royal Palms Resort',
      customerName: 'Sanjay Sharma',
      mobile: '9876500001',
      email: 'sanjay@royalpalms.com',
      website: 'www.royalpalms.com',
      gmbCategory: 'Resort/Hotel',
      rating: 4.6,
      reviewCount: 154,
      address: '102 Beach Road',
      city: 'Goa',
      state: 'Goa',
      pincode: '403001',
      source: 'GMB',
      status: 'NEW',
      assignedTo: agent1._id,
      uploadedBy: manager._id,
      customFields: customFields1
    });

    // 2. Lead 2: Complete, GMB style, assigned to Agent 2, status: CONTACTED
    const customFields2 = new Map();
    customFields2.set('Google Maps Link', 'https://maps.google.com/?cid=456');
    customFields2.set('Rating', '4.2');

    await Lead.create({
      displayName: 'Apex Dental Care',
      businessName: 'Apex Dental Care',
      customerName: 'Dr. Vivek Mehta',
      mobile: '9876500002',
      email: 'contact@apexdental.com',
      website: 'www.apexdental.com',
      gmbCategory: 'Dental Clinic',
      rating: 4.2,
      reviewCount: 48,
      address: 'Sector 15, Vashi',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400703',
      source: 'GMB',
      status: 'CONTACTED',
      assignedTo: agent2._id,
      uploadedBy: manager._id,
      customFields: customFields2
    });

    // 3. Lead 3: Incomplete, missing mobile, assigned to Agent 1
    await Lead.create({
      displayName: 'Pinnacle Gym & Spa',
      businessName: 'Pinnacle Gym & Spa',
      customerName: 'Rohan Joshi',
      email: 'rohan@pinnaclegym.com',
      website: 'www.pinnaclegym.com',
      gmbCategory: 'Gym/Fitness Center',
      address: 'Jubilee Hills Road No. 36',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500033',
      source: 'EXCEL',
      status: 'INCOMPLETE',
      assignedTo: agent1._id,
      uploadedBy: manager._id
    });

    // 4. Lead 4: Unassigned, GMB style, status: NEW
    const customFields4 = new Map();
    customFields4.set('Google Maps Link', 'https://maps.google.com/?cid=789');

    await Lead.create({
      displayName: 'Gourmet Kitchen',
      businessName: 'Gourmet Kitchen',
      customerName: 'Chef Ananya',
      mobile: '9876500004',
      email: 'ananya@gourmetkitchen.com',
      gmbCategory: 'Restaurant',
      rating: 4.8,
      reviewCount: 312,
      address: 'MG Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      source: 'GMB',
      status: 'NEW',
      uploadedBy: manager._id,
      customFields: customFields4
    });

    // 5. Lead 5: Assigned to Agent 1, status: FOLLOW_UP, nextFollowUpAt: today
    const today = new Date();
    today.setHours(10, 0, 0, 0); // 10:00 AM today

    await Lead.create({
      displayName: 'TechSolutions Software',
      businessName: 'TechSolutions Software',
      customerName: 'Amit Patel',
      mobile: '9876500005',
      email: 'info@techsolutions.com',
      gmbCategory: 'Software Company',
      address: 'Infocity',
      city: 'Gandhinagar',
      state: 'Gujarat',
      pincode: '382007',
      source: 'CSV',
      status: 'FOLLOW_UP',
      assignedTo: agent1._id,
      uploadedBy: manager._id,
      nextFollowUpAt: today,
      lastActivityAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // yesterday
    });

    // 6. Lead 6: Assigned to Agent 2, status: INTERESTED, has remarks
    await Lead.create({
      displayName: 'Zen Yoga Studio',
      businessName: 'Zen Yoga Studio',
      customerName: 'Meera Sen',
      mobile: '9876500006',
      gmbCategory: 'Yoga Studio',
      address: 'Salt Lake Sector 5',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700091',
      source: 'MANUAL',
      status: 'INTERESTED',
      remarks: 'Agent spoke with Meera, wants to start digital marketing package.',
      assignedTo: agent2._id,
      uploadedBy: manager._id
    });

    // 7. Lead 7: Assigned to Agent 1, status: CONVERTED
    await Lead.create({
      displayName: 'Metro Packers and Movers',
      businessName: 'Metro Packers and Movers',
      customerName: 'Karan Malhotra',
      mobile: '9876500007',
      gmbCategory: 'Logistics Service',
      address: 'Dwarka Sector 7',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110075',
      source: 'GMB',
      status: 'CONVERTED',
      assignedTo: agent1._id,
      uploadedBy: manager._id
    });

    // 8. Lead 8: Unassigned, Incomplete, missing mobile
    await Lead.create({
      displayName: 'Sunshine Boutique',
      businessName: 'Sunshine Boutique',
      customerName: 'Neha Kapoor',
      email: 'neha@sunshine.com',
      gmbCategory: 'Clothing Store',
      address: 'Park Street',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700016',
      source: 'EXCEL',
      status: 'INCOMPLETE',
      uploadedBy: manager._id
    });

    console.log('✅ Seeding complete!');
    console.log('Manager: manager@satikflow.com / Password@123');
    console.log('Agent 1: agent1@satikflow.com / Password@123');
    console.log('Agent 2: agent2@satikflow.com / Password@123');
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();

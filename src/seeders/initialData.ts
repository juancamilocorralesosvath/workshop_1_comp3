import { Permission } from '../models/Permission';
import { Role } from '../models/Role';
import { User } from '../models/User';
import { generatePermissionId, generateRoleId, generateUserId } from '../utils/generateId';

const permissions = [
  { name: 'user.create' },
  { name: 'user.read' },
  { name: 'user.update' },
  { name: 'user.delete' },
  { name: 'role.create' },
  { name: 'role.read' },
  { name: 'role.update' },
  { name: 'role.delete' },
  { name: 'permission.create' },
  { name: 'permission.read' },
  { name: 'permission.delete' },
  { name: 'attendance.create' },
  { name: 'attendance.read' },
  { name: 'attendance.update' },
  { name: 'attendance.delete' },
  { name: 'membership.create' },
  { name: 'membership.read' },
  { name: 'membership.update' },
  { name: 'membership.delete' },
  { name: 'subscription.create' },
  { name: 'subscription.read' },
  { name: 'subscription.update' },
  { name: 'subscription.delete' }
];

const roles = [
  {
    name: 'admin',
    permissions: [
      'user.create', 'user.read', 'user.update', 'user.delete',
      'role.create', 'role.read', 'role.update', 'role.delete',
      'permission.create', 'permission.read', 'permission.delete',
      'attendance.create', 'attendance.read', 'attendance.update', 'attendance.delete',
      'membership.create', 'membership.read', 'membership.update', 'membership.delete',
      'subscription.create', 'subscription.read', 'subscription.update', 'subscription.delete'
    ]
  },
  {
    name: 'coach',
    permissions: [
      'user.read', 'attendance.create', 'attendance.read', 'attendance.update',
      'membership.read', 'subscription.read'
    ]
  },
  {
    name: 'recepcionista',
    permissions: [
      'user.create', 'user.read', 'user.update',
      'attendance.create', 'attendance.read', 'attendance.update',
      'membership.read', 'membership.update',
      'subscription.create', 'subscription.read', 'subscription.update'
    ]
  },
  {
    name: 'cliente',
    permissions: [
      'attendance.read', 'membership.read', 'subscription.read'
    ]
  }
];

const defaultAdmin = {
  email: 'admin@gym.com',
  password: 'admin123',
  fulll_name: 'Administrador del Sistema',
  age: '30',
  phone: '+573001234567'
};

export const seedInitialData = async () => {
  try {
    console.log('🌱 Starting initial data seeding...');

    // Check if data already exists
    const existingPermissions = await Permission.countDocuments();
    if (existingPermissions > 0) {
      console.log('📋 Initial data already exists, skipping seed...');
      return;
    }

    // Create permissions
    console.log('📝 Creating permissions...');
    const createdPermissions = [];
    for (const perm of permissions) {
      const permission = new Permission({
        id: generatePermissionId(),
        name: perm.name
      });
      await permission.save();
      createdPermissions.push(permission);
    }
    console.log(`✅ Created ${createdPermissions.length} permissions`);

    // Create roles with permissions
    console.log('👥 Creating roles...');
    const createdRoles = [];
    for (const roleData of roles) {
      const rolePermissions = createdPermissions.filter(perm =>
        roleData.permissions.includes(perm.name)
      );

      const role = new Role({
        id: generateRoleId(),
        name: roleData.name,
        permissions: rolePermissions.map(perm => perm._id)
      });
      await role.save();
      createdRoles.push(role);
    }
    console.log(`✅ Created ${createdRoles.length} roles`);

    // Create default admin user
    console.log('👤 Creating default admin user...');
    const adminRole = createdRoles.find(role => role.name === 'admin');

    if (!adminRole) {
      throw new Error('Admin role not created');
    }

    const existingAdmin = await User.findOne({ email: defaultAdmin.email });
    if (!existingAdmin) {
      const admin = new User({
        id: generateUserId(),
        email: defaultAdmin.email,
        password: defaultAdmin.password,
        fulll_name: defaultAdmin.fulll_name,
        age: defaultAdmin.age,
        phone: defaultAdmin.phone,
        rol: [adminRole._id]
      });

      await admin.save();
      console.log('✅ Default admin user created');
      console.log(`📧 Admin email: ${defaultAdmin.email}`);
      console.log(`🔐 Admin password: ${defaultAdmin.password}`);
    } else {
      console.log('⚠️  Admin user already exists');
    }

    console.log('🎉 Initial data seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding initial data:', error);
    throw error;
  }
};
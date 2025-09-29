import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { Role } from '../../src/models/Role';
import { generateRoleId } from '../../src/utils/generateId';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri);

  // Create default roles for testing
  await createDefaultRoles();
});

afterAll(async () => {
  // Clean up database and close connections
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear all collections except roles before each test
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    if (key !== 'roles') {
      await collections[key].deleteMany({});
    }
  }
});

async function createDefaultRoles() {
  const roles = [
    { id: generateRoleId(), name: 'admin', permissions: ['all'] },
    { id: generateRoleId(), name: 'cliente', permissions: ['basic'] },
    { id: generateRoleId(), name: 'coach', permissions: ['coaching'] },
    { id: generateRoleId(), name: 'recepcionista', permissions: ['reception'] }
  ];

  for (const roleData of roles) {
    const existingRole = await Role.findOne({ name: roleData.name });
    if (!existingRole) {
      await new Role(roleData).save();
    }
  }
}
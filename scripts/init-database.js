// Script para inicializar la base de datos con roles y usuario admin
// Ejecutar con: node scripts/init-database.js

import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const CLOUD_MONGO_URI = 'mongodb+srv://admin_user:35N2qci42thwJ3VB@cluster0.hiuxs5q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const MONGODB_URI = process.env.MONGO_URI || CLOUD_MONGO_URI;
const DATABASE_NAME = 'workshop';

async function initializeDatabase() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB');

    const db = client.db(DATABASE_NAME);

    // Limpiar TODA la base de datos
    console.log('🧹 Cleaning entire database...');
    const collections = await db.listCollections().toArray();

    for (const collection of collections) {
      console.log(`   Dropping collection: ${collection.name}`);
      await db.collection(collection.name).drop();
    }

    console.log('✅ Database completely cleaned');

    // 1. Crear roles
    console.log('📝 Creating roles...');
    const roles = [
      {
        id: "admin_role_id",
        name: "admin",
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "recepcionista_role_id",
        name: "recepcionista",
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "coach_role_id",
        name: "coach",
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "cliente_role_id",
        name: "cliente",
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const roleResult = await db.collection('roles').insertMany(roles);
    console.log('✅ Roles created:', Object.keys(roleResult.insertedIds).length);

    // 2. Obtener ObjectIds de roles para referencias
    const adminRole = await db.collection('roles').findOne({name: "admin"});
    const recepcionistaRole = await db.collection('roles').findOne({name: "recepcionista"});
    const coachRole = await db.collection('roles').findOne({name: "coach"});
    const clienteRole = await db.collection('roles').findOne({name: "cliente"});

    // 3. Crear usuarios de prueba
    console.log('👥 Creating test users...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const hashedPasswordRecep = await bcrypt.hash('recep123', 10);
    const hashedPasswordCoach = await bcrypt.hash('coach123', 10);
    const hashedPasswordCliente = await bcrypt.hash('cliente123', 10);

    const users = [
      {
        id: "admin_user_id",
        email: "admin@test.com",
        password: hashedPassword,
        full_name: "Admin User",
        age: 30,
        phone: "+1234567890",
        rol: [adminRole._id],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "recepcionista_user_id",
        email: "recepcionista@test.com",
        password: hashedPasswordRecep,
        full_name: "Recepcionista User",
        age: 25,
        phone: "+1234567891",
        
        rol: [recepcionistaRole._id],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "coach_user_id",
        email: "coach@test.com",
        password: hashedPasswordCoach,
        full_name: "Coach User",
        age: 28,
        phone: "+1234567892",
        rol: [coachRole._id],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "cliente_user_id",
        email: "cliente@test.com",
        password: hashedPasswordCliente,
        full_name: "Cliente User",
        age: 35,
        phone: "+1234567893",
        rol: [clienteRole._id],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const userResult = await db.collection('users').insertMany(users);
    console.log('✅ Users created:', Object.keys(userResult.insertedIds).length);

    console.log('\n🎉 Database initialized successfully!');
    console.log('\n📋 Test credentials:');
    console.log('Admin: admin@test.com / admin123');
    console.log('Recepcionista: recepcionista@test.com / recep123');
    console.log('Coach: coach@test.com / coach123');
    console.log('Cliente: cliente@test.com / cliente123');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
  } finally {
    await client.close();
    console.log('🔐 Database connection closed');
  }
}

initializeDatabase();
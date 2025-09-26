import mongoose from 'mongoose'
import { config } from 'dotenv'

// Cargar variables de entorno antes de usarlas
config()

const connectionString = process.env.MONGO_URI || 'mongodb://localhost:27017/workshop'

console.log('🔗 Connecting to MongoDB:', connectionString)

export const db = mongoose.connect(connectionString, {dbName: 'workshop'}).then((mongooseInstance) => {
    console.log("✅ Connected to MongoDB")
    return mongooseInstance
}).catch((error) => {
    console.log("❌ MongoDB connection error:", error)
    throw error
})
import mongoose from 'mongoose'
import { config } from 'dotenv'

config()


const CLOUD_MONGO_URI = 'mongodb+srv://admin_user:35N2qci42thwJ3VB@cluster0.hiuxs5q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'


const LOCAL_MONGO_URI = 'mongodb://localhost:27018/workshop'


const connectionString = process.env.MONGO_URI || CLOUD_MONGO_URI
console.log(" ~ connectionString:", connectionString)

console.log(' Connecting to MongoDB:', connectionString.includes('cluster0') ? 'Cloud Database (Atlas)' : 'Local Database (Docker)')

export const db = mongoose.connect(connectionString, {dbName: 'workshop'}).then((mongooseInstance) => {
    console.log(" Connected to MongoDB")
    return mongooseInstance
}).catch((error) => {
    console.log(" MongoDB connection error:", error)
    throw error
})
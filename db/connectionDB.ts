import mongoose from 'mongoose'

const connectionString = process.env.MONGO_URI || 'pailas'

export const db = mongoose.connect(connectionString, {dbName: 'workshop'}).then((mongooseInstance) => {
    console.log("connected to mongo")
    return mongooseInstance
}).catch((error) => {
    console.log("🚀 ~ error:", error)
    throw error
})
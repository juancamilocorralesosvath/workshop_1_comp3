import { Express } from 'express'
import express from 'express'
import cors from 'cors'
import compression from 'compression'
import { db } from '../db/connectionDB'
import { config } from 'dotenv'

// Routes
import authRoutes from './routes/auth.routes'
import userRoutes from './routes/user.routes'

// Middleware
import { errorHandler, notFoundHandler } from './middleware/error.middleware'

// Seeders
import { seedInitialData } from './seeders/initialData'

// esto nos permite cargar y usar las variables de entorno definidas en .env
config()

const app: Express = express()
const port: number = Number(process.env.PORT) || 3000

// Global middleware
app.use(cors())
app.use(compression())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Gym Management API is running',
        timestamp: new Date().toISOString()
    })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)

// Error handling middleware (must be last)
app.use(notFoundHandler)
app.use(errorHandler)

db.then(async () => {
    console.log("✅ Connected to MongoDB")

    // Seed initial data
    await seedInitialData()

    app.listen(port, () => {
        console.log(`🚀 Gym Management API running on port: ${port}`)
        console.log(`📚 API Documentation available at: http://localhost:${port}/health`)
        console.log(`🔐 Default admin credentials:`)
        console.log(`   Email: admin@gym.com`)
        console.log(`   Password: admin123`)
    })
}).catch((error) => {
    console.error("❌ MongoDB connection error:", error)
    process.exit(1)
})

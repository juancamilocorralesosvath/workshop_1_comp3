import { config } from 'dotenv'
config()

console.log('🔄 Simple test starting...')
console.log('🔧 MONGO_URI:', process.env.MONGO_URI)

import express from 'express'

console.log('📦 Express imported successfully')

const app = express()
const port = 3000

app.get('/test', (req, res) => {
  res.json({ message: 'Simple test working!' })
})

app.listen(port, () => {
  console.log(`🚀 Simple test server running on port ${port}`)
})

console.log('✅ Test setup complete')
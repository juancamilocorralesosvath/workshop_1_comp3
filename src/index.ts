import { Express } from 'express'
import express from 'express'
import { db } from '../db/connectionDB'
import { config } from 'dotenv'

// esto nos permite cargar y usar las variables de entorno definidas en .env
config()

const app:Express = express()
const port:number = 3000

app.use(express.urlencoded({extended: false}))
app.use(express.json())

db.then(() => {
    app.listen(port, () => {
        console.log("🚀 ~ port:", port)
        
    })
}).catch((error) => {
    console.log("🚀 ~ error:", error)
    process.exit(1)
})

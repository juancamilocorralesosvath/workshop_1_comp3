import express, { Express } from "express";
import { db } from "../db/connectionDB";
import { userRouter } from "./routes/user.routes";
import { authRouter } from "./routes/auth.routes";


const app: Express = express();
const port: number = 3000;

app.use(express.urlencoded({ extended: false}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

app.use('/users', userRouter)
app.use('/auth', authRouter)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});


db.then(()=>{
    app.listen(port, ()=>{
        console.log("🚀 ~ port:", port) 
    })
})
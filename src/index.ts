import express, { Express } from "express";
import { db } from "./db/connectionDB";
import { userRouter } from "./routes/user.routes";
import { authRouter } from "./routes/auth.routes";
import { membershipRouter } from "./routes/membership.routes";
import { subscriptionRouter } from "./routes/subscription.routes";
import { attendanceRouter } from "./routes/attendance.routes";


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
app.use('/memberships', membershipRouter)
app.use('/subscriptions', subscriptionRouter)
app.use('/attendances', attendanceRouter)


// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});


db.then(()=>{
    app.listen(port, ()=>{
        console.log("🚀 ~ port:", port) 
    })
})
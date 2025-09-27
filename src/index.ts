import express, { Express } from "express";
import { db } from "../db/connectionDB";
import { userRouter } from "./routes/user.routes";
import { authRouter } from "./routes/auth.routes";
import { membershipRouter } from "./routes/membership.routes";


const app: Express = express();
const port: number = 3000;

app.use(express.urlencoded({ extended: false}));
app.use(express.json());
app.use('/user', userRouter)
app.use('/auth', authRouter)
app.use('/memberships', membershipRouter)


db.then(()=>{
    app.listen(port, ()=>{
        console.log("🚀 ~ port:", port) 
    })
})
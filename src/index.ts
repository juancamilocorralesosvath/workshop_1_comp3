import express, { Express } from "express";
import { db } from "../db/connectionDB";
import { userRouter } from "./routes/user.routes";
import { authRouter } from "./routes/auth.routes";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

const app: Express = express();
const port: number = 3000;

app.use(express.urlencoded({ extended: false}));
app.use(express.json());
app.use('/user', userRouter)
app.use('/auth', authRouter)


app.use(notFoundHandler);
app.use(errorHandler);

db.then(()=>{
    app.listen(port, ()=>{
        console.log("🚀 ~ port:", port) 
    })
})
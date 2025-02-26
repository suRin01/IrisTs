import express, { Request, Response } from "express"
import response from "./chatbot/response"
import { Iris } from "./type/iris";


const app = express() 
app.use(express.json());

app.post('/db', function (req: Request, res:Response) {
    
    response(req.body as Iris.Message)
    res.send('Hello World')
})

app.listen(5001)
console.log("server start")
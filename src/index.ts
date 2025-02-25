import express, { Express, Request, Response } from "express"
import response from "./chatbot/response"
import { IrisMessage } from "./type/iris";


const app = express() 
app.use(express.json());

app.post('/db', function (req: Request, res:Response) {
    const messageBody: IrisMessage = req.body as IrisMessage;
    console.log(messageBody)
    //response()
    res.send('Hello World')
})

app.listen(8080)
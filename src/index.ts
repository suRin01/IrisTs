import express, { Request, Response } from "express"
import response from "./chatbot/response"
import { Iris } from "./type/iris";
import irisWs from "./helper/websocketClient";
import wsResponse from "./chatbot/wsResponse";


const app = express() 
app.use(express.json());
app.post('', function (req: Request, res:Response) {
    response(req.body as Iris.Message)
    res.send('Hello World')
})

app.listen(5002)

//try to connect ws
irisWs({
    messageHandler: wsResponse,
    errorHandler: (tset)=>{
        console.log("errorHandler:", tset)
    },
})

console.log("server start")
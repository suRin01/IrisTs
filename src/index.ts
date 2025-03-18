import express, { Request, Response } from "express"
import response from "./chatbot/response.js"
import { Iris } from "./type/iris.js";
import irisWs from "./helper/websocketClient.js";
import wsResponse from "./chatbot/wsResponse.js";
import axiosClient from "./helper/axiosClient.js";
import { sleep } from "./helper/utils.js";
import { setDockerIpWebEndpointUrl } from "./helper/IrisConfig.js";


interface UpStatus {httpServer: boolean,ws: boolean}
const startupHttpServer = async (upStatus: UpStatus): Promise<UpStatus>=>{
    const newUpStatus = {...upStatus};
    if(upStatus.httpServer){
        console.log("skip startup http server")
        return newUpStatus
    }
    //setup http server
    if((await axiosClient.get<Iris.Config>("/config")).data.web_server_endpoint === ""){
        try{
            setDockerIpWebEndpointUrl()
        }catch{
            console.error("updating web server endpoint fail")
            newUpStatus.httpServer = false
            return newUpStatus
        }
    }
    const irisConfig = await axiosClient.get<Iris.Config>("/config")
    try{
        const webServerEndpoint = new URL(irisConfig.data.web_server_endpoint)
        const app = express() 
        app.use(express.json());
        app.post(webServerEndpoint.pathname, function (req: Request, res:Response) {
            response(req.body as Iris.Message)
            res.send('Hello World')
        })
        
        app.listen(5002)
        console.log("IrisTs Server Start")
        newUpStatus.httpServer = true
    }catch{
        console.error("Web server endpoint parsing error.")
    }

    return newUpStatus
}
const startupWs = (upStatus: UpStatus): UpStatus=>{
    const newUpStatus = {...upStatus};
    if(!upStatus.ws){
        console.log("skip startup ws")
        return newUpStatus
    }
    irisWs({
        messageHandler: wsResponse,
        errorHandler: (errorEvent)=>{
            console.log("errorHandler:", errorEvent)
        },
    })
    console.log("IrisTs WS Start")
    newUpStatus.ws = true
    return newUpStatus
}



(async ()=>{
    //restart sever automatically.
    let runningStatus = {
        httpServer: false,
        ws: false
    }
    while(true){
        runningStatus = await startupHttpServer(runningStatus)
        runningStatus = startupWs(runningStatus)
        await sleep(3000)
    }
})()


import fs from "fs";
import axiosClient from "./axiosClient.js";
type ResponseType = "normal" | "image"
interface IrisReplyVO {
    "isSuccess":boolean,
    "type":"normal"|"image",
    "data": string,
    "room": string,
    "msgJson": string
}

class Replier{
    private botUrl: string;
    private botPort: number;


    constructor(botUrl:string, botPort: number){
        this.botUrl = botUrl
        this.botPort = botPort
    }

    /**
     * 
     * @param type: ResponseType "normal" | "image"
     * @param data 
     * @param room 
     * @returns 
     */
    public sendHttpRequest(type: ResponseType, data: string, room: string): boolean{
        axiosClient.post("/reply", {
            type,
            room,
            data
        })

        return true;
    }

}

const ReplierFactory = ()=>{
    if(fs.existsSync("./config_real.json")){
        const configJsonFile = fs.readFileSync('./config_real.json', 'utf8');
        const config = JSON.parse(configJsonFile);
        return new Replier(config["iris_endpoint"]?? "", config["iris_port"])
    }
    const configJsonFile = fs.readFileSync('./config.json', 'utf8');
    const config = JSON.parse(configJsonFile);

    if(!config["iris_endpoint"] || !config["iris_port"]){
        return null
    }

    return new Replier(config["iris_endpoint"]?? "", config["iris_port"])
}

const replier = ReplierFactory()
export = replier
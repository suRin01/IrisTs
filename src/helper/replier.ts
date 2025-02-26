import fs from "fs";
import axios from "axios"
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
        axios.post(`http://${this.botUrl}:${this.botPort}/reply`, {
            type,
            room,
            data
        }, {
            insecureHTTPParser: true
        })

        return true;
    }

}

const ReplierFactory = ()=>{
    // TODO: check real json
    const configJsonFile = fs.readFileSync('./config_real.json', 'utf8');
    const config = JSON.parse(configJsonFile);

    if(!config["iris_endpoint"] || !config["iris_port"]){
        return null
    }

    return new Replier(config["iris_endpoint"]?? "", config["iris_port"])
}

const replier = ReplierFactory()
export = replier
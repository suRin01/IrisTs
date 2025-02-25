import net from 'node:net';
import fs from "fs";
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
        const connection = net.createConnection(this.botPort, this.botUrl, ()=>{
            const sendMsgVO: IrisReplyVO = {
                data: Buffer.from(data).toString('base64'),
                isSuccess: true,
                msgJson: "",
                room: Buffer.from(room).toString('base64'),
                type: type
            }
            connection.write(JSON.stringify(sendMsgVO));
            connection.end();
        });

        return true;
    }

}

const ReplierFactory = ()=>{
    const configJsonFile = fs.readFileSync('./data.json', 'utf8');
    const config = JSON.parse(configJsonFile);

    if(!config["bot_endpoint"] || !config["web_server_endpoint"]){
        return null
    }

    return new Replier(config["web_server_endpoint"]?? "", config["bot_endpoint"])
}

const replier = ReplierFactory()
export = replier
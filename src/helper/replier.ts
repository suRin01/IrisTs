import { Iris } from "../type/iris.js";
import axiosClient from "./axiosClient.js";


class Replier{

    /**
     * 
     * @param type: ResponseType "normal" | "image" | "image_multiple"
     * @param data 
     * @param room 
     * @returns 
     */
    private async sendHttpRequest(type: Iris.ResponseType, data: string, room: string): Promise<boolean>{
        return (await axiosClient.post<Iris.Reply>("/reply", {
            type,
            room,
            data
        })).data.success
    }

    public sendMessage(message: string, room: string){
        this.sendHttpRequest(Iris.Response.NORMAL, message, room)
    }

    public sendImage(imageBuffer: Buffer, room: string){
        this.sendHttpRequest(Iris.Response.IMAGE, imageBuffer.toString("base64"), room)
    }

    public sendImages(imageBuffers: Buffer[], room: string){
        this.sendHttpRequest(Iris.Response.IMAGE_MULTIPLE, JSON.stringify(imageBuffers.map(buf => buf.toString("base64"))), room)

    }

}

const replier = new Replier()
export = replier
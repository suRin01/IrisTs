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
    private async sendHttpRequest(type: Iris.ResponseType, data: string|string[], room: string): Promise<boolean>{
        return (await axiosClient.post<Iris.Reply>("/reply", {
            type,
            room,
            data
        })).data.success
    }

    public sendMessage(message: string, room: string){
        this.sendHttpRequest(Iris.Response.NORMAL, message, room)
    }

    public sendImage(imageB64String: string, room: string){
        this.sendHttpRequest(Iris.Response.IMAGE, imageB64String, room)
    }

    public sendImages(imageB64ArrString: string[], room: string){
        this.sendHttpRequest(Iris.Response.IMAGE_MULTIPLE, imageB64ArrString, room)

    }

}

const replier = new Replier()
export = replier
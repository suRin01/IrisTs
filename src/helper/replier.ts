import { Iris } from "../type/iris.js";
import axiosClient from "./axiosClient.js";
import KakaoLinkClient from "./kakaolink.js"


class Replier{

    /**
     * 
     * @param type: ResponseType "text" | "image" | "image_multiple"
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
        this.sendHttpRequest(Iris.Response.TEXT, message, room)
    }

    public sendImage(imageB64String: string, room: string){
        this.sendHttpRequest(Iris.Response.IMAGE, imageB64String, room)
    }

    public sendImages(imageB64ArrString: string[], room: string){
        this.sendHttpRequest(Iris.Response.IMAGE_MULTIPLE, imageB64ArrString, room)

    }

    /**
     * Send KakaoLink Request
     * @param room 
     * @param templateId KakaoLink Template ID
     * @param templateArgs KakaoLink Template Arguments (key-value)
     * @returns true | false
     */
    public async sendKakaoLink(room: string, templateId: number, templateArgs: { [key: string]: string }): Promise<boolean> {
        try {
            return await KakaoLinkClient.sendLink(room, templateId, templateArgs);
        } catch (error) {
            console.error("Failed to send KakaoLink : ", error);
            return false;
        }
    }

}

const replier = new Replier()
export = replier
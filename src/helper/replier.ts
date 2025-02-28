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

    /**
     * 
     * @param type: ResponseType "normal" | "image"
     * @param data 
     * @param room 
     * @returns 
     */
    public sendHttpRequest(type: ResponseType, data: string, room: string): boolean{
        axiosClient.post<IrisReplyVO>("/reply", {
            type,
            room,
            data
        })

        return true;
    }

}

const replier = new Replier()
export = replier
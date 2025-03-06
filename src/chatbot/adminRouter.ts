import { Iris } from "../type/iris.js"
import replier from "../helper/replier.js"
import { sendQueries, sendQuery } from "./request.js"
import { emojiHandler } from "../helper/emoji.js"

export const AdminRouter = (message:Iris.Message)=>{
    if(message.msg === "!hi"){
        replier?.sendMessage("hello", message.json.chat_id)
    }else if(message.msg === "!axios"){
        sendQuery<Iris.RoomMasterTable>({
            "query": "SELECT * FROM db2.room_master_table limit 1;",
            "bind":[]
        }).then((response)=>{
            replier?.sendMessage(JSON.stringify(response.data), message.json.chat_id)
        })
    }else if(message.msg === "!multi"){
        sendQueries({
            queries: [
                {
                    "query": "SELECT * FROM db2.room_master_table limit 1;"
                    ,"bind":[]
                },{
                    "query": "SELECT * FROM db2.file_path limit 1;",
                    "bind":[]
                },
            ]
        }).then((response)=>{
            replier?.sendMessage(JSON.stringify(response.data), message.json.chat_id)
        })
    }else if(message.msg === "!img"){
        
        replier?.sendImage(emojiHandler("[버럭코"), message.json.chat_id)
    }else if(message.msg === "!imgs"){
        
        replier?.sendImages([emojiHandler("[버럭코"), emojiHandler("[버럭코")], message.json.chat_id)
    }
}
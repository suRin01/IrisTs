import { Iris } from "../type/iris.js"
import replier from "../helper/replier.js"
import { sendQueries, sendQuery } from "./request.js"

const response = (message:Iris.Message)=>{
    console.log(message)
    if(message.msg === "!hi"){
        replier?.sendHttpRequest("normal", "hello", message.json.chat_id)
    }else if(message.msg === "!axios"){
        sendQuery<Iris.RoomMasterTable>({
            "query": "SELECT * FROM db2.room_master_table limit 1;",
            "bind":[]
        }).then((response)=>{
            replier?.sendHttpRequest("normal", JSON.stringify(response.data), message.json.chat_id)
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
            replier?.sendHttpRequest("normal", JSON.stringify(response.data), message.json.chat_id)
        })
    }


}

export = response
import { Iris } from "../type/iris.js"
import replier from "../helper/replier.js"
import { emojiHandler } from "../helper/emoji.js"

const wsResponse = (message:Iris.Message)=>{
    if(message.msg === "!wshi"){
        replier?.sendMessage("hello", message.json.chat_id)
    }
    else if(message.msg === "!wsimg"){
        replier?.sendImage(emojiHandler("[버럭코"), message.json.chat_id)
    }

}

export = wsResponse
import { Iris } from "../type/iris.js"
import replier from "../helper/replier.js"

const response = (message:Iris.Message)=>{
    console.log(message)
    if(message.msg === "!hi"){
        replier?.sendHttpRequest("normal", "hello", message.json.chat_id)
    }
}

export = response
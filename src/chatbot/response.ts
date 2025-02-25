import replier from "../helper/replier.js"

const response = (room:string, msg:string, sender:string, msg_json:string, db:string, g:string)=>{
    if(msg === "!hi"){
        replier?.sendHttpRequest("normal", "hello", room)
    }
}

export = response
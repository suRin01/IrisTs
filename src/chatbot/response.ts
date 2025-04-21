import { Iris } from "../type/iris.js"
import replier from "../helper/replier.js"
import { emojiHandler } from "../helper/emoji.js"
import { AdminRouter } from "./adminRouter.js"

const response = async (message:Iris.Message)=>{
    if(message.msg === "!hi"){
        replier?.sendMessage("hello", message.json.chat_id)
    }else if(message.json.user_id === "adminUserId"){
        AdminRouter(message)
    }
    if(message.msg === "!img"){
        replier?.sendImage(emojiHandler("[버럭코"), message.json.chat_id)
    }else if(message.msg === "!imgs"){
        replier?.sendImages([emojiHandler("[버럭코"), emojiHandler("[버럭코")], message.json.chat_id)
    }else if(message.msg === "!kalink") {
        await replier?.sendKakaoLink(
            message.room,
            3139,
            {
              TITLE: "Kakao Sharing",
              DESCRIPTION: "Hello from IrisTS",
              FIRST_BUTTON_TITLE : "TEST"
            }
          );
        return;
    }

}

export = response
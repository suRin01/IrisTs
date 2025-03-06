import fs from "fs";
export interface EmojiCaches {
    command: string,
    b64Img: string,
}
export const loadImg = (fileUrl: string): string=>{
    try {
        return fs.readFileSync(fileUrl, 'base64');
    }catch(e) {
        console.error(e);
        return ""
    }
}
const emojiDefinition = ():EmojiCaches[]=>{
    const EMOJI_HOME_DIRECTORY_URL = "asset/image";
    const emojiUrls = {
        "버럭코": loadImg(`${EMOJI_HOME_DIRECTORY_URL}/buruk.png`),
        "감사콩": loadImg(`${EMOJI_HOME_DIRECTORY_URL}/gamsa.png`),
        "바보": loadImg(`${EMOJI_HOME_DIRECTORY_URL}/hwansuticon/babo.png`),
        "부들": loadImg(`${EMOJI_HOME_DIRECTORY_URL}/hwansuticon/budul.png`),
        "응애": loadImg(`${EMOJI_HOME_DIRECTORY_URL}/hwansuticon/enge.png`),
        "허접": loadImg(`${EMOJI_HOME_DIRECTORY_URL}/hwansuticon/huzup.png`),
        "환수추": loadImg(`${EMOJI_HOME_DIRECTORY_URL}/hwansuticon/hwansuchu.png`),
    }

    return [
        {
            command: "버럭코",
            b64Img: emojiUrls["버럭코"],
        },
        {
            command: "ㅂㄹㅋ",
            b64Img: emojiUrls["버럭코"],
        },
        {
            command: "감사콩",
            b64Img: emojiUrls["감사콩"],
        },
        {
            command: "ㄱㅅ",
            b64Img: emojiUrls["감사콩"],
        },
        {
            command: "버",
            b64Img: emojiUrls["버럭코"],
        },
        {
            command: "바보",
            b64Img: emojiUrls["바보"],
        },
        {
            command: "ㅂㅂ",
            b64Img: emojiUrls["바보"],
        },
        {
            command: "ㅂㄷ",
            b64Img: emojiUrls["부들"],
        },
        {
            command: "부들",
            b64Img: emojiUrls["부들"],
        },
        {
            command: "응애",
            b64Img: emojiUrls["응애"],
        },
        {
            command: "허접",
            b64Img: emojiUrls["허접"],
        },
        {
            command: "환수추",
            b64Img: emojiUrls["환수추"],
        },
        {
            command: "ㅎㅅㅊ",
            b64Img: emojiUrls["환수추"],
        },
    ]

}
const emojis = emojiDefinition()
export const emojiHandler = (command: string): string =>{
    if(!command.startsWith("[")){
        console.log("command not starts with [")
        return ""
    }
    const refinedCommand = command.replace("[", "");
    const targetEmoji = emojis.find(emoji=>{
        console.log("compare: ", emoji.command, refinedCommand)
        return emoji.command === refinedCommand
    })
    if(!targetEmoji){
        console.log("no emoji found.")
        return ""
    }

    console.log("returning emoji")

    return targetEmoji.b64Img
}


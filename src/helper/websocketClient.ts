
import { Iris } from "../type/iris.js";
import config from "./config.js"


interface IrisWsProp {
    openHandler?: (event: any) => void,
    messageHandler?: (event: Iris.Message) => void,
    closeHandler?: (event: any) => void,
    errorHandler?: (event: Event) => void,
}
const irisWs = (wsHandler?: IrisWsProp) => {
    const _socket = new WebSocket(`ws://${config.getIrisEndpoint()}:${config.getIrisPort()}/ws`);
    _socket.addEventListener('open', event => {
        wsHandler?.openHandler?.call(this, event)
    });
    _socket.addEventListener('message', (event) => {
        try{
            const data = JSON.parse(event.data as string) as Iris.Message

            wsHandler?.messageHandler?.call(this, data)
        }catch{
            console.error("Iris Json Parse Error")
        }
        
    });
    _socket.addEventListener('close', event => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        wsHandler?.closeHandler?.call(this, event)
    });
    _socket.addEventListener('error', error => {
        wsHandler?.errorHandler?.call(this, error)
    });
    return _socket
}

export = irisWs

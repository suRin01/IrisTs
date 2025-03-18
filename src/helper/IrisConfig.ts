import { networkInterfaces } from "node:os";
import axiosClient from "./axiosClient.js";


export const setDockerIpWebEndpointUrl = ()=>{
    const currentMachineNW = networkInterfaces()
    let mayIpAddr = ""
    Object.getOwnPropertyNames(currentMachineNW).forEach((name) => {
        if (!name.startsWith("docker")) {
            return;
        }
        const enpIp = currentMachineNW[name]?.at(0)?.address
        if (enpIp) {
            mayIpAddr = enpIp
        }
    })

    if (mayIpAddr === "") {
        console.error("auto iris web_server_endpoint config fail: cannot get local ip addr.")
        console.error("Check Iris web_server_endpoint is like http://172.17.0.1:5002.")
        console.error("To Enable http server, config Iris web_server_endpoint and restart irisTs server.")
    }
    setWebEndpointUrl(mayIpAddr)
}

const setWebEndpointUrl = (ip: string)=>{
    axiosClient.post("/config/endpoint", {
        "endpoint": `http://${ip}:5002/db`
    })
}
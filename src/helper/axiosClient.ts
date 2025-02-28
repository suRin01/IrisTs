import axios from "axios"
import config from "./config.js"


const axiosClient = (()=>{
    return axios.create({
        baseURL: `http://${config.getIrisEndpoint()}:${config.getIrisPort()}`,
        timeout: 1000,
        insecureHTTPParser: true,
        headers: {'Content-Type': 'application/json'}
    })
})()

axiosClient.interceptors.request.use((config: axios.InternalAxiosRequestConfig<any>)=>{
    console.log(config)


    return config
})

axiosClient.interceptors.response.use((response: axios.AxiosResponse<any, any>)=>{
    console.log(response.data)


    return response
})

export = axiosClient
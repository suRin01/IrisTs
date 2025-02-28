import axiosClient from "../helper/axiosClient.js"
import { Iris } from "../type/iris.js"
import { AxiosResponse } from "axios"


export const sendQuery = <T>(queryRequest: Iris.QueryRequest): Promise<AxiosResponse<Iris.QueryResponse<T>>> =>{
    return axiosClient.post<Iris.QueryResponse<T>, 
            AxiosResponse<Iris.QueryResponse<T>>, 
            Iris.QueryRequest>("/query", queryRequest)
}

export const sendQueries = (queryRequest: Iris.QueriesRequest): Promise<AxiosResponse<Iris.QueriesResponse>> =>{
    return axiosClient.post<Iris.QueriesResponse, 
            AxiosResponse<Iris.QueriesResponse>, 
            Iris.QueriesRequest>
        ("/query", queryRequest)
}
export interface IrisMessage {
    msg: string,
    room: string,
    sender: string,
    json: any,
}

export interface IrisQueryRequest {
    query: string // SQL query string
  }
export interface IrisQueryResponse<T>{
    success: boolean,
    data: T[]
}
export interface IrisDecryptRequest {
    enc: number, // Encryption type (integer from database)
    b64_ciphertext: string, // Base64 encoded encrypted message
    user_id: bigint // User ID (long integer)
}
export interface IrisDecryptResponse {
    plain_text: string
}
interface IrisQuery {
    query: string,
    bind: any[]
}
export interface IrisQueriesRequest {
    queries: IrisQuery[]
}
export interface IrisQueriesResponse{

}
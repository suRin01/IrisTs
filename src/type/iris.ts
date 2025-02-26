
export namespace Iris{
    /**
     * msg: string, decryped plain msg <br/>
     * room: string, decrpted plain room name \n
     * sender: string, decrpted plain sender name \n
     */
    export interface Message {
        msg: string,
        room: string,
        sender: string,
        json: RawChatRow,
    }
    export interface RawChatRow {
        _id: string,
        id: string,
        type: string,
        chat_id: string,
        user_id: string,
        message: string,
        created_at: string,
        deleted_at: string,
        client_message_id: string,
        prev_id: string,
        referer: string,
        v: string,
        attachment: string
        }
    
    export interface QueryRequest {
        query: string // SQL query string
      }
    export interface QueryResponse<T>{
        success: boolean,
        data: T[]
    }
    export interface DecryptRequest {
        enc: number, // Encryption type (integer from database)
        b64_ciphertext: string, // Base64 encoded encrypted message
        user_id: bigint // User ID (long integer)
    }
    export interface DecryptResponse {
        plain_text: string
    }
    export interface Query {
        query: string,
        bind: any[]
    }
    export interface QueriesRequest {
        queries: Query[]
    }
    export interface QueriesResponse{
    
    }
}

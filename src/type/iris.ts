
export namespace Iris {
    /**
     * msg: string, decryped plain msg <br/>
     * room: string, decrpted plain room name \n
     * sender: string, decrpted plain sender name \n
     */
    export const Response = {
        TEXT : "text",
        IMAGE: "image",
        IMAGE_MULTIPLE: "image_multiple",
    } 
    export type ResponseType = typeof Response[keyof typeof Response]
    export interface Reply {
        "success":boolean,
    }
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

    export interface QueryResponse<T> {
        success: boolean,
        data: T[]
    }
    export interface QueryRequest {
        query: string,
        bind: any[]
    }
    export interface QueriesRequest {
        queries: QueryRequest[]
    }
    export interface QueriesResponse {
        success: boolean,
        data: any[][]
    }
    export interface DecryptRequest {
        enc: number, // Encryption type (integer from database)
        b64_ciphertext: string, // Base64 encoded encrypted message
        user_id: bigint // User ID (long integer)
    }
    export interface DecryptResponse {
        plain_text: string
    }

    export interface Config {
        bot_name: string,
        bot_http_port: number,
        web_server_endpoint: string,
        db_polling_rate: number,
        message_send_rate: number,
        bot_id: number
    }


    //db table interface 
    //db2.room_master_table
    export interface RoomMasterTable {
        "id": number,
        "identity_hash": string
    }
}

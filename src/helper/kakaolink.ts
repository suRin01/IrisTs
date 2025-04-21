import axios, { AxiosInstance } from 'axios'; 
import crypto from 'crypto'; 
import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';
import config from './config.js'; 
import qs from 'qs'; 
import { Buffer } from 'buffer'; 
import axiosClient from '../helper/axiosClient.js';
import { Iris } from '../type/iris.js';


interface ClientConfiguration {
    buildVariants: string;
    version: string;
    shortOs: string;
    os: string;
    language: string;
}

interface AuthorizationModel {
    accessToken: string;
    deviceUUID: string;
}

interface GetLoginTokenResponse {
    token: string;
    expires: number;
    status: number;
}

interface TemplateArgs {
    [key: string]: any;
}


const DefaultConfiguration: ClientConfiguration = {
    buildVariants: 'REL',
    version: '10.7.1', 
    shortOs: 'An',
    os: 'android',
    language: 'ko'
};


export class KakaoLinkService {
    private _cookieJar: CookieJar | null = null;
    private _axiosInstance: AxiosInstance | null = null;

    constructor(
        private _configuration: ClientConfiguration,
        private _authorization: AuthorizationModel,
        private _appKey: string,
        private _originHost: string
    ) {}

    static async create(
        authorization: AuthorizationModel,
        _configuration: Partial<ClientConfiguration> = {}
    ): Promise<KakaoLinkService> {
        const appKey = config.getKakaoAPIKey();
        const originHost = config.getKakaoRegisteredDomain();

        if (!appKey || !originHost) {
            throw new Error('카카오 API 키 또는 등록된 도메인이 설정 파일(config.js)에 설정되지 않았습니다.');
        }
        if (originHost && !originHost.startsWith('http://') && !originHost.startsWith('https://')) {
            throw new Error('originHost는 "http://" 또는 "https://"로 시작해야 합니다.');
        }

        const configuration = Object.assign({}, DefaultConfiguration, _configuration);
        const service = new KakaoLinkService(configuration, authorization, appKey, originHost);

        await service.login();

        return service;
    }

    async login(): Promise<void> {
        console.log('카카오링크 로그인 시도 중...');
        try {
            const tokenRes = await this.getLoginToken();
            console.log('로그인 토큰 획득 완료.'); 

            this._cookieJar = await this.webloginWithToken(tokenRes); 

            const cookiesForKakao = await this._cookieJar.getCookies('https://kakao.com');
            if (cookiesForKakao.length === 0) {
                console.warn("경고: 로그인 후 .kakao.com 관련 쿠키가 저장되지 않았습니다. 후속 요청이 실패할 수 있습니다.");
            } else {
                console.log(`카카오링크 로그인 성공.`);
            }

            
            this._axiosInstance = wrapper(axios.create({
                jar: this._cookieJar,
                headers: {
                    'User-Agent': await this.buildUserAgent(false),
                    'Referer': this._originHost ? `${this._originHost}/` : undefined,
                    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
                    'Accept': 'application/json, text/plain, */*'
                },
                maxRedirects: 5,
                validateStatus: (status: number) => status >= 200 && status < 400,
            }));

        } catch (error: any) {
            console.error('카카오링크 로그인 실패:', error.response?.data || error.message || error);
            
            this._cookieJar = null;
            this._axiosInstance = null;
            throw error; 
        }
    }

    private async getLoginToken(): Promise<GetLoginTokenResponse> {
        const { data } = await axios.get<GetLoginTokenResponse>(
            `https://katalk.kakao.com/${this._configuration.os}/account/login_token.json`,
            {
                headers: await this.generateKakaoTalkHeader()
            }
        );
        if (data.status !== 0) {
             throw new Error(`로그인 토큰 요청 실패: status ${data.status}`);
        }
        return data;
    }

    
    private async webloginWithToken(tokenRes: GetLoginTokenResponse): Promise<CookieJar> {
        const jar = new CookieJar();
        const client = wrapper(axios.create({
             jar,
             maxRedirects: 0, 
             validateStatus: status => status >= 200 && status < 400 
        }));

        const loginUrl = 'https://accounts.kakao.com/weblogin/token_login';
        const params = {
            token_type: 'tgt',
            token: tokenRes.token,
            continue: encodeURIComponent('https://sharer.kakao.com') 
        };

        try {
            const response = await client.get(loginUrl, {
                params: params,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
                },
            });

            console.log('웹 로그인 응답 상태:', response.status);
            
            if (response.status === 302 && response.headers['set-cookie']) {
                console.log('웹 로그인 302 리다이렉션 및 Set-Cookie 확인됨.');
            } else if (response.status === 302) {
                console.warn("경고: 웹 로그인 302 응답이지만 Set-Cookie 헤더가 없습니다. 로그인 세션 쿠키가 설정되지 않았을 수 있습니다.");
            } else {
                console.error('웹 로그인 비정상 응답 데이터(일부):', String(response.data).substring(0, 300));
                throw new Error(`웹 로그인 비정상 응답: 상태 ${response.status}`);
            }

        } catch (error: any) {
            console.error('웹 로그인 요청 중 에러 발생:');
            if (error.response) {
                console.error(`  상태: ${error.response.status}`);
                console.error(`  데이터(일부): ${String(error.response.data).substring(0, 500)}...`);
            } else {
                console.error('  에러 메시지:', error.message);
            }
            throw new Error(`웹 로그인 토큰 처리 실패: ${error.message || '알 수 없는 오류'}`);
        }

        
        const finalCookies = await jar.getCookieString('https://kakao.com');
        if (!finalCookies) {
            console.error("치명적 오류: 웹 로그인 후 .kakao.com 쿠키가 설정되지 않았습니다. 로그인 프로세스 실패.");
             
            throw new Error("웹 로그인 후 필수 쿠키(_kawlp, _kadu 등)를 얻지 못했습니다.");
        }

        return jar; 
    }


    
    private async generateKakaoTalkHeader(): Promise<Record<string, string>> {
        const randomUUID = () => crypto.randomBytes(16).toString('hex');
        return {
            'User-Agent': await this.buildUserAgent(true),
            'Authorization': `${this._authorization.accessToken}-${this._authorization.deviceUUID}`,
            'A': `${this._configuration.os}/${this._configuration.version}/${this._configuration.language}`,
            'Accept-Language': this._configuration.language,
            'Adid': randomUUID(),
            'C': randomUUID(),
            'X-Requested-With': 'com.kakao.talk'
        };
    }

    
    private async buildUserAgent(forKakaoTalkApi: boolean): Promise<string> {
        const osInfo = `${this._configuration.os}/${this._configuration.version}`;
        const langInfo = `lang/${this._configuration.language}`;

        if (forKakaoTalkApi) {
            return `KakaoTalk/${this._configuration.version} ${osInfo} ${langInfo}`;
        } else {
            return `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36`;
        }
    }

    
    private base64Encode(str: string): string {
        return Buffer.from(str, 'utf-8').toString('base64');
    }

    private base64Decode(encoded: string): string {
        return Buffer.from(encoded, 'base64').toString('utf-8');
    }

    
    private generateKakaoAgent(): string {
        if (!this._originHost || !(this._originHost.startsWith('http://') || this._originHost.startsWith('https://'))) {
            const errorMsg = `KA 헤더 생성 오류: 유효하지 않은 originHost 값입니다 (${this._originHost}). config.js 설정을 확인하세요.`;
            console.error(errorMsg);
            
            throw new Error(errorMsg);
        }
        
        return `sdk/2.0.1 os/javascript sdk_type/javascript lang/${this._configuration.language} device/Win32 origin/${encodeURIComponent(this._originHost)}`;
    }

    /**
     * Send KakaoLink Message
     * @param roomName 
     * @param template 
     * @param type template type ('custom' | 'default')
     */
    async sendLink(roomName: string, template: Iris.KakaoLinkTemplateArgs, type: 'custom' | 'default' = 'custom'): Promise<boolean> {
        if (!this._cookieJar || !this._axiosInstance) {
            console.error("카카오링크 전송 실패: 로그인 정보 또는 axios 인스턴스가 없습니다. KakaoLinkClient.initialize()를 먼저 호출하거나 재시도 로직을 확인하세요.");
            
            throw new Error("카카오링크 서비스가 제대로 초기화되지 않았습니다.");
        }
        console.log(`카카오링크: "${roomName}" 방에 메시지 전송 시도...`);
        console.log("전송할 템플릿:", JSON.stringify(template, null, 2));

        try {
            const pickerUrl = 'https://sharer.kakao.com/talk/friends/picker/link';
            const pickerData = {
                app_key: this._appKey,
                validation_action: type,
                validation_params: JSON.stringify(template),
                ka: this.generateKakaoAgent(),
                lcba: ''
            };
            const pickerHeaders = {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'Referer': this._originHost ? `${this._originHost}/` : undefined,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'User-Agent': await this.buildUserAgent(false)
            };

            const pickerResponse = await this._axiosInstance.post(
                pickerUrl,
                qs.stringify(pickerData),
                {
                    headers: pickerHeaders,
                    maxRedirects: 5,
                    validateStatus: (status: number) => status >= 200 && status < 300
                }
            );

            const htmlBody = pickerResponse.data;
            const serverDataMatch = String(htmlBody).match(/serverData\s*=\s*"([^"]+)"/); 

            
            if (!serverDataMatch) {
                const errorMsg = 'Picker 응답에서 serverData를 추출하지 못했습니다.';
                console.error(errorMsg);
                console.error('받은 HTML(일부):', String(htmlBody).substring(0, 500));
                if (String(htmlBody).includes('로그인이 필요합니다') || String(htmlBody).includes('accounts.kakao.com/login')) {
                     console.error('오류 추정: 로그인 세션이 만료되었거나 유효하지 않습니다. (쿠키 문제)');
                } else if (String(htmlBody).includes('domain mismatched')) {
                    console.error('오류 추정: 도메인 불일치. 카카오 개발자 센터의 사이트 도메인 설정을 확인하세요.');
                } else if (String(htmlBody).includes('appKey')) {
                    console.error('오류 추정: 유효하지 않은 앱 키(appKey)일 수 있습니다.');
                }
                
                throw new Error(errorMsg);
            }

            const encodedServerData = serverDataMatch[1];
            if (typeof encodedServerData !== 'string') {
                const errorMsg = `Picker 응답에서 유효한 serverData 값(encodedServerData)을 추출하지 못했습니다. 타입: ${typeof encodedServerData}`;
                console.error(errorMsg);
                console.error("Base64 Encoded serverData:", serverDataMatch ? serverDataMatch[1] : 'N/A'); 
                throw new Error(errorMsg);
            }

            let serverDataJson;
            let csrfToken: string | undefined;

            try {
                const decodedServerData = this.base64Decode(encodedServerData);
                serverDataJson = JSON.parse(decodedServerData);
                csrfToken = serverDataJson?.data?.csrfToken;
            } catch (e: any) {
                const errorMsg = `serverData 파싱 실패: ${e.message}`;
                console.error(errorMsg);
                console.error("Base64 Encoded serverData:", encodedServerData); 

                throw new Error(errorMsg);
            }

            
            if (serverDataJson?.data?.error) {
                const errorMsg = `Picker 응답 내 서버 에러: ${JSON.stringify(serverDataJson.data.error)}`;
                console.error(errorMsg);

                throw new Error(errorMsg);
            }

            
            if (!serverDataJson?.data?.shortKey || !serverDataJson?.data?.checksum || !csrfToken) {
                const errorMsg = "serverData에 필요한 키(shortKey, checksum, csrfToken)가 없습니다.";
                console.error(errorMsg);

                throw new Error(errorMsg);
            }

            const { shortKey, checksum, chats } = serverDataJson.data;

            if (!chats || !Array.isArray(chats)) {
                const errorMsg = "채팅방 목록(chats) 데이터가 없습니다.";
                console.error(errorMsg);

                throw new Error(errorMsg);
            }
            const targetChat = chats.find((chat: any) => chat.title === roomName);

            if (!targetChat) {
                const errorMsg = `"${roomName}" 이름의 채팅방을 찾을 수 없습니다.`;
                console.error(errorMsg);
                console.log("사용 가능한 채팅방 목록:", chats.map((c:any) => c.title).join(', '));
                throw new Error(errorMsg);
            }

            const receiver = this.base64Encode(JSON.stringify(targetChat));

            console.log("2단계: 최종 메시지 전송 요청 시작...");
            const sendUrl = 'https://sharer.kakao.com/picker/send';
            const sendData = {
                app_key: this._appKey,
                short_key: shortKey,
                _csrf: csrfToken,
                checksum: checksum,
                receiver: receiver
            };
            const sendHeaders = {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'Referer': this._originHost ? `${this._originHost}/` : undefined, 
                'X-Requested-With': 'XMLHttpRequest', 
                'Accept': 'application/json', 
                'User-Agent': await this.buildUserAgent(false)
            };

            const sendResponse = await this._axiosInstance.post(
                sendUrl,
                qs.stringify(sendData),
                {
                    headers: sendHeaders,
                    validateStatus: (status: number) => status >= 200 && status < 300
                }
            );

            if (sendResponse.status === 200) {
                console.log(`카카오링크: "${roomName}" 방에 메시지 전송 성공!`);
                return true;
            } else {
                console.error(`카카오링크 메시지 전송 실패 (비정상 응답): 상태 ${sendResponse.status}, 응답 ${JSON.stringify(sendResponse.data)}`);
                 
                throw new Error(`최종 전송 실패: 상태 ${sendResponse.status}`);
            }

        } catch (error: any) {
            console.error('카카오링크 메시지 전송 중 에러 발생:');
            if (error.response) {
                console.error(`  응답 상태: ${error.response.status}`);
                console.error(`  응답 데이터(일부): ${String(error.response.data).substring(0, 500)}...`);
                if (error.response.status === 401) {
                    console.error("  오류 유형: 인증 실패 (401 Unauthorized)");
                    
                    throw new Error(`인증 실패 (401): ${error.message}`);
                }
            } else if (error.request) {
                console.error("  요청은 이루어졌으나 응답을 받지 못했습니다.");
                console.error("  요청 정보:", error.config?.method, error.config?.url);
            } else {
                console.error('  에러 메시지:', error.message);
            }
            
            throw error;
        }
    }

}

export class KakaoLinkClient {
    private static _instance: KakaoLinkService | null = null;
    private static _initializing: Promise<void> | null = null;

    
    static isInitialized(): boolean {
        return this._instance !== null;
    }

    
    private static isAuthError(error: any): boolean {
        const errorMsg = String(error?.message || error);
        const statusCode = error?.response?.status;
        
        return statusCode === 401 || 
            errorMsg.includes('인증 실패') || 
            errorMsg.includes('토큰') ||
            errorMsg.includes('로그인') ||
            errorMsg.includes('serverData를 추출하지 못했습니다');
    }

    
    private static async processAuthInfo(data: any): Promise<{accessToken: string, deviceUUID: string}> {
        try {
            
            if (typeof data === 'object' && data !== null && data.success === true && data.aot) {
                return {
                    accessToken: data.aot.access_token,
                    deviceUUID: data.aot.d_id
                };
            }
            
            console.error('예상치 못한 응답 형식:', data);
            throw new Error('인증 정보를 찾을 수 없습니다');
        } catch (error) {
            console.error('인증 정보 처리 실패:', error);
            throw error;
        }
    }

    
    private static async initKakaoLinkClient(): Promise<boolean> {
        try {
            
            const response = await axiosClient.get('/aot');
            console.log('인증 응답 데이터:', response.data);
            
            const authInfo = await this.processAuthInfo(response.data);
            console.log('처리된 인증 정보:', authInfo);
            
            await this.initialize(authInfo);
            
            console.log('KakaoLinkClient 초기화 완료');
            return true;
        } catch (error) {
            console.error('KakaoLinkClient 초기화 실패:', error);
            return false;
        }
    }

    
    static async initialize(authorization: AuthorizationModel): Promise<void> {
        if (this._initializing) {
            console.log("KakaoLinkClient 초기화 진행 중... 완료 대기");
            return this._initializing;
        }

        console.log("KakaoLinkClient 초기화 시작...");
        this._initializing = (async () => {
            try {
                this._instance = null;
                this._instance = await KakaoLinkService.create(authorization);
                console.log("KakaoLinkClient 초기화 완료");
            } catch (error) {
                console.error('KakaoLinkClient 초기화 실패:', error);
                this._instance = null;
                
                throw error;
            } finally {
                this._initializing = null; 
            }
        })();

        try {
            await this._initializing;
        } catch (initError) {
            
            console.error("KakaoLinkClient.initialize() 호출 중 최종 실패");
            throw initError;
        }
    }

    
    static getInstance(): KakaoLinkService {
        if (!this._instance) {
            
            if (this._initializing) {
                 throw new Error('KakaoLinkClient가 현재 초기화 중입니다. 완료될 때까지 기다리세요.');
            }
            throw new Error('KakaoLinkClient가 초기화되지 않았습니다. initialize()를 먼저 성공적으로 호출해야 합니다.');
        }
        return this._instance;
    }

    
    static async sendLink(roomName: string, templateId: number, templateArgs: { [key: string]: string | number }): Promise<boolean> {
        if (!this._instance && !this._initializing) {
            console.log("카카오링크 클라이언트가 초기화되지 않았습니다. 초기화를 시작합니다...");
            try {
                const success = await this.initKakaoLinkClient();
                if (!success) {
                    console.error("카카오링크 초기화 실패");
                    return false;
                }
            } catch (error) {
                console.error("카카오링크 초기화 실패:", error);
                return false;
            }
        }
    
        try {
            
            const instance = this.getInstance();
            return await instance.sendLink(roomName, {
                link_ver: '4.0',
                template_id: templateId,
                template_args: templateArgs
            }, 'custom');
        } catch (error) {
            if (this.isAuthError(error)) {
                console.log("인증 오류 감지, 재초기화 시도...");
                try {
                    this._instance = null;
                    const success = await this.initKakaoLinkClient();
                    if (success) {
                        const instance = this.getInstance();
                        return await instance.sendLink(roomName, {
                            link_ver: '4.0',
                            template_id: templateId,
                            template_args: templateArgs
                        }, 'custom');
                    } else {
                        console.error("재초기화 실패");
                        return false;
                    }
                } catch (reinitError) {
                    console.error("재초기화 및 재시도 실패:", reinitError);
                    return false;
                }
            }
            console.error("카카오링크 전송 실패:", error);
            return false;
        }
    }
}

export default KakaoLinkClient;
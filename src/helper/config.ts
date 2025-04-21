import fs from "fs";


class IrisConfig {
    private irisEndpoint: string;
    private irisPort: number;
    private kakaoRegisteredDomain: string;
    private kakaoAPIKey: string;

    constructor(){
        if(fs.existsSync("./config_real.json")){
                const configJsonFile = fs.readFileSync('./config_real.json', 'utf8');
                const config = JSON.parse(configJsonFile);
                this.irisEndpoint = config["iris_endpoint"];
                this.irisPort = Number.parseInt(config["iris_port"]);
                this.kakaoRegisteredDomain = config["kakao_registered_domain"];
                this.kakaoAPIKey = config["kakao_api_key"];
                
                return this
        }
        const configJsonFile = fs.readFileSync('./config.json', 'utf8');
        const config = JSON.parse(configJsonFile);
    
        this.irisEndpoint = config["iris_endpoint"];
        this.irisPort = Number.parseInt(config["iris_port"]);
        this.kakaoRegisteredDomain = config["kakao_registered_domain"];
        this.kakaoAPIKey = config["kakao_api_key"];

        return this
    }

    public getIrisEndpoint = ()=> this.irisEndpoint
    public getIrisPort = ()=> this.irisPort
    public getKakaoRegisteredDomain = () => this.kakaoRegisteredDomain
    public getKakaoAPIKey = () => this.kakaoAPIKey

}

const config = new IrisConfig()

export = config
import fs from "fs";


class IrisConfig {
    private irisEndpoint: string;
    private irisPort: number;
    constructor(){
        if(fs.existsSync("./config_real.json")){
                const configJsonFile = fs.readFileSync('./config_real.json', 'utf8');
                const config = JSON.parse(configJsonFile);
                this.irisEndpoint = config["iris_endpoint"];
                this.irisPort = Number.parseInt(config["iris_port"])
                
                return this
        }
        const configJsonFile = fs.readFileSync('./config.json', 'utf8');
        const config = JSON.parse(configJsonFile);
    
        this.irisEndpoint = config["iris_endpoint"];
        this.irisPort = Number.parseInt(config["iris_port"])
        return this
    }

    public getIrisEndpoint = ()=> this.irisEndpoint
    public getIrisPort = ()=> this.irisPort

}

const config = new IrisConfig()

export = config
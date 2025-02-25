import fs from "fs";

export const loadImg = (fileUrl: string): string=>{
    try {
        return fs.readFileSync(fileUrl, 'base64');
    }catch(e) {
        console.error(e);
        return ""
    }
}
export const range = (start: number, stop: number, step: number = 1) => {
    if (typeof stop == 'undefined') {
        stop = start;
        start = 0;
    }

    if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
        return [];
    }

    let result: number[] = [];
    for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
        result.push(i);
    }

    return result;
};

export const sleep =async(ms: number): Promise<void> =>{
    return new Promise(
        (resolve) => setTimeout(resolve, ms));
}

export const cacheFactory = <T>()=>{
    let cache:T;
    return {
        get: ()=>{
            return cache;
        },
        set: (_cache:T)=>{
            cache = _cache
        }
    }
}
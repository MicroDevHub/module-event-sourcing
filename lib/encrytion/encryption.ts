import { IEncryption } from "../interface/interface";
import * as crypto from "crypto";

const secret = 'dfdshjgk'
const secretKey = '67fms84bfjsyegwufbwjf8bsjhdffsw3'
const algorithm = 'aes-256-ctr';
const iv = crypto.randomBytes(16)

export class Encryption implements IEncryption {

    constructor() {}
    encrypt(encryptData: string): string {
        const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
        let encryptedData = cipher.update(JSON.stringify(encryptData), 'utf-8', 'hex');
        encryptedData += cipher.final('hex');

        return encryptedData;
    }

    decrypt(encryptedData: string): any {
        const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
        let decryptedData = decipher.update(encryptedData, 'hex', 'utf-8');
        decryptedData += decipher.final('utf-8');
        
        return decryptedData;
    }

}
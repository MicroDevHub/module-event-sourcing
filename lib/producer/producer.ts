import { ISendMessage, IProducerInstance } from "../interface/interface";


export class ProducerInstance implements IProducerInstance{
    constructor() {

    }
    send(message: ISendMessage): void {
        throw new Error("Method not implemented.");
    }
    
    close(): void {
        throw new Error("Method not implemented.");
    }
}
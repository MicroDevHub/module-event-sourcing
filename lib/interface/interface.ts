import { CompressionTypes } from "kafkajs";

export interface ISendMessage {
    topic: string,
    message: any,
    acks: number,
    timeout: number,
    compression: CompressionTypes
}

export interface IProducerInstance {
    send(message: ISendMessage): void;
    close(): void;
}
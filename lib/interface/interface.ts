import { CompressionTypes } from "kafkajs";

export interface ISendMessage {
    topic: string,
    message: any,
    acks?: number,
    timeout?: number,
    compression?: CompressionTypes
}

export interface IProducerInstance {
    connect(): void;
    send(message: ISendMessage): void;
    disconnect(): void;
}

export interface IConsumerInstance {
    connect(): void;
    read(topic: string , fromBegin: boolean): void;
    reads(topics: string[] , fromBegin: boolean): void;
    disconnect(): void;
}
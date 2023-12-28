import { CompressionTypes, IHeaders, Message } from "kafkajs";

export interface IMessage {
    key?: Buffer | string | null
    value: Buffer | string | Object | null // add object type to support schema registry
    partition?: number
    headers?: IHeaders
    timestamp?: string
  }

export interface ISendMessage {
    topic: string,
    message: IMessage,
    acks?: number,
    timeout?: number,
    compression?: CompressionTypes
}

export interface IProducerInstance {
    connect(): void;
    send(message: ISendMessage, schema: string): void;
    disconnect(): void;
}

export interface IConsumerInstance {
    connect(): void;
    read(topic: string , fromBegin: boolean): void;
    reads(topics: string[] , fromBegin: boolean): void;
    disconnect(): void;
}

export interface IEncryption {
    encrypt(encryptData: string): string;
    decrypt(encryptedData: string | any): any;
}
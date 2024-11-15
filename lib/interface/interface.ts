import { CompressionTypes, ConsumerConfig, EachMessagePayload, IHeaders, MessageSetEntry, RecordBatchEntry } from 'kafkajs';
import { ConsumerInstance, ProducerInstance } from '../index';

/**
 * Represents a Kafka instance, providing methods to create a producer or a consumer.
 * @interface IKafkaInstance
 */
export interface IKafkaInstance {
    producer(): ProducerInstance;
    consumer(consumerConfig: ConsumerConfig): ConsumerInstance;
}

/**
 * Represents a message to be produced within a Kafka system.
 * @interface IMessage
 */
export interface IMessage {
    key?: Buffer | string | null;
    value: Buffer | string | object | null;
    partition?: number;
    headers?: IHeaders;
    timestamp?: string;
}

/**
 * Represents a message to be published to a Kafka topic.
 * @interface IPublishMessage
 */
export interface IPublishMessage {
    topic: string,
    message: IMessage,
    acks?: number,
    timeout?: number,
    compression?: CompressionTypes
}

/**
 * Represents an instance of a Kafka producer.
 * @interface IProducerInstance
 */
export interface IProducerInstance {
    connect(): Promise<void>;
    send(message: IPublishMessage, schema: string): Promise<void>;
    disconnect(): Promise<void>;
}

/**
 * Represents an instance of a Kafka consumer.
 * @interface IConsumerInstance
 */
export interface IConsumerInstance {
    connect(): Promise<void>;
    reads(consumerRunConfig: IConsumerRunConfig, consumerHandlers: IConsumerHandler[]): Promise<void>;
    disconnect(): Promise<void>;
}

/**
 * Represents a handler configuration for a Kafka consumer.
 * @interface IConsumerHandler
 */
export interface IConsumerHandler {
    topics: string[];
    schemas: string[];
    fromBeginning: boolean;
    handler: (payload: IEachMessagePayload) => Promise<void>;
}

/**
 * Represents a mapping for a consumer handler.
 *
 * @interface IConsumerHandlerMapping
 */
export interface IConsumerHandlerMapping {
    fingerprintIds: number[];
    topics: string[];
    handler: (payload: IEachMessagePayload) => Promise<void>;
}

/**
 * Represents configuration options for running a Kafka consumer.
 * @interface IConsumerRunConfig
 */
export interface IConsumerRunConfig {
    autoCommit?: boolean;
    autoCommitInterval?: number | null;
    autoCommitThreshold?: number | null;
    eachBatchAutoResolve?: boolean;
    partitionsConsumedConcurrently?: number;
}

/**
 * Represents an entry in a message set, extending the MessageSetEntry interface.
 *
 * @interface IMessageSetEntry
 * @extends {Omit<MessageSetEntry, 'value' | 'key'>}
 */
export interface IMessageSetEntry extends Omit<MessageSetEntry, 'value' | 'key'> {
    key: string | Buffer|  null;
    value: string | Buffer | JSON | null;
}

/**
 * Represents an entry in a record batch, extending the RecordBatchEntry interface.
 *
 * @interface IRecordBatchEntry
 * @extends {Omit<RecordBatchEntry, 'value' | 'key'>}
 */
export interface IRecordBatchEntry extends Omit<RecordBatchEntry, 'value' | 'key'> {
    key: string | Buffer | null;
    value: string | Buffer | JSON | null;
}

/**
 * Represents a payload for each message, extending the EachMessagePayload interface.
 *
 * @interface IEachMessagePayload
 */
export interface IEachMessagePayload  {
    topic: string;
    partition: number;
    message: IMessageSetEntry | IRecordBatchEntry;
}

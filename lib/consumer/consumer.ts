import { Consumer, ConsumerConfig, Kafka, KafkaConfig } from "kafkajs";
import { IConsumerInstance } from "../interface/interface";

export class ConsumerIntance implements IConsumerInstance{
    private _kafka: Kafka;
    private _consumer: Consumer;

    constructor(kafkaConfig: KafkaConfig, consumerConfig: ConsumerConfig) {
        this._kafka = new Kafka(kafkaConfig);
        this._consumer = this._kafka.consumer(consumerConfig);
    }

    connect(): void {
        this._consumer.connect();
    }

    subcribe(): void {
        throw new Error("Method not implemented.");
    }

    disconnect(): void {
        this._consumer.disconnect();
    }

}
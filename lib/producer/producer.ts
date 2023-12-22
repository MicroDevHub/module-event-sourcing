import { Kafka, KafkaConfig, Producer } from "kafkajs";
import { ISendMessage, IProducerInstance } from "../interface/interface";


export class ProducerInstance implements IProducerInstance{
    private _kafka: Kafka;
    private _producer: Producer;

    constructor(kafkaConfig: KafkaConfig) {
        this._kafka = new Kafka(kafkaConfig);
        this._producer = this._kafka.producer();
    }

    connect(): void {
        this._producer.connect();
    }

    send(message: ISendMessage): void {
        this._producer.send({
            topic: message.topic,
            messages: message.message,
            acks: message.acks || 1,
            timeout: message.timeout,
            compression: message.compression
        })
    }
    
    disconnect(): void {
        this._producer.disconnect();
    }
}
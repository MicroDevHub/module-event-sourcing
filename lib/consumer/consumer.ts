import { Consumer, ConsumerConfig, EachMessagePayload, Kafka, KafkaConfig } from "kafkajs";
import { IConsumerInstance } from "../interface/interface";

export class ConsumerInstance implements IConsumerInstance{
    private _kafka: Kafka;
    private _consumer: Consumer;

    constructor(kafkaConfig: KafkaConfig, consumerConfig: ConsumerConfig) {
        this._kafka = new Kafka(kafkaConfig);
        this._consumer = this._kafka.consumer(consumerConfig);
    }

    connect(): void {
        this._consumer.connect();
    }

    read(topic: string , fromBegin: boolean): void {
        this._consumer.subscribe({topic: topic, fromBeginning: fromBegin})

        this._consumer.run({
            eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
                console.log({
                  value: message.value?.toString(),
                })
              },
        })
    }

    reads(topics: string[] , fromBegin: boolean) {
        this._consumer.subscribe({topics: topics, fromBeginning: fromBegin})
    }

    disconnect(): void {
        this._consumer.disconnect();
    }

}
import { Consumer, ConsumerConfig, EachBatchPayload, Kafka, KafkaConfig } from "kafkajs";
import { IConsumerHandler, IConsumerInstance } from "../interface/interface";
import { SchemaRegistry } from "@kafkajs/confluent-schema-registry";
import { SchemaRegistryAPIClientArgs } from "@kafkajs/confluent-schema-registry/dist/api";

export class ConsumerInstance implements IConsumerInstance{
    private _kafka: Kafka;
    private _consumer: Consumer;
    private _schemaRegistry: SchemaRegistry;

    constructor(kafkaConfig: KafkaConfig, consumerConfig: ConsumerConfig, schemaRegistryAPIClientArgs: SchemaRegistryAPIClientArgs) {
        this._kafka = new Kafka(kafkaConfig);
        this._consumer = this._kafka.consumer(consumerConfig);
        this._schemaRegistry = new SchemaRegistry(schemaRegistryAPIClientArgs);
    }

    connect(): void {
        this._consumer.connect();
    }

    async reads(consumerHandler: IConsumerHandler[]): Promise<void> {

        consumerHandler.forEach((item) => {
            this._consumer.subscribe({
                topics: item.topics,
                fromBeginning: item.fromBeginning
            })
        })

        await this._consumer.run({
            autoCommit: true,
            eachBatchAutoResolve: true,
            eachBatch: async (payload: EachBatchPayload) => {
                try {
                    consumerHandler.map(async (item) => {
                        if (item.topics.includes(payload.batch.topic)) {
                            await item.handler(payload);
                        }
                    })
                } catch (error) {
                    console.error('Error processing message:', error);
                }
            },
        })

    }

    disconnect(): void {
        if(this._consumer) {
            this._consumer.disconnect();
        }
    }

    consumerSchemaRegistry(): SchemaRegistry {
        return this._schemaRegistry;
    }

}

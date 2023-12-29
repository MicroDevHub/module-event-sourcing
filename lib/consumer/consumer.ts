import { Consumer, ConsumerConfig, EachMessagePayload, Kafka, KafkaConfig } from "kafkajs";
import { IConsumerInstance, IEncryption } from "../interface/interface";
import { Encryption } from "../encrytion/encryption";
import { SchemaRegistry } from "@kafkajs/confluent-schema-registry";
import { SchemaRegistryAPIClientArgs } from "@kafkajs/confluent-schema-registry/dist/api";

export class ConsumerInstance implements IConsumerInstance{
    private _kafka: Kafka;
    private _consumer: Consumer;
    private _encryption: IEncryption;
    private _schemaRegistry: SchemaRegistry;

    constructor(kafkaConfig: KafkaConfig, consumerConfig: ConsumerConfig, schemaRegistryAPIClientArgs: SchemaRegistryAPIClientArgs) {
        this._kafka = new Kafka(kafkaConfig);
        this._consumer = this._kafka.consumer(consumerConfig);
        this._encryption = new Encryption();
        this._schemaRegistry = new SchemaRegistry(schemaRegistryAPIClientArgs);
    }

    connect(): void {
        this._consumer.connect();
    }

    read(topic: string , fromBegin: boolean): Promise<any> {
        this._consumer.subscribe({topic: topic, fromBeginning: fromBegin})

        return this._consumer.run({
            eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
                try {
                    const originalValue = message.value
                    
                    if(originalValue) {
                        const decoded =  await this._schemaRegistry.decode(originalValue)
                        console.log(decoded)
                    }
            
                  } catch (error) {
                    console.error('Error processing message:', error);
                  }
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

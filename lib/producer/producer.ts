import { Kafka, KafkaConfig, Producer } from "kafkajs";
import { ISendMessage, IProducerInstance, IEncryption } from "../interface/interface";
import { Encryption } from "../encrytion/encryption";
import { SchemaRegistry, SchemaType } from "@kafkajs/confluent-schema-registry"
import { SchemaRegistryAPIClientArgs } from "@kafkajs/confluent-schema-registry/dist/api";


export class ProducerInstance implements IProducerInstance{
    private _kafka: Kafka;
    private _producer: Producer;
    private _encryption: IEncryption;
    private _schemaRegistry: SchemaRegistry;

    constructor(kafkaConfig: KafkaConfig, schemaRegistryAPIClientArgs: SchemaRegistryAPIClientArgs) {
        this._kafka = new Kafka(kafkaConfig);
        this._producer = this._kafka.producer();
        this._encryption = new Encryption();
        this._schemaRegistry = new SchemaRegistry(schemaRegistryAPIClientArgs);
    }

    connect(): void {
        this._producer.connect();
    }

    async send(message: ISendMessage, schema: string): Promise<void> {
        try {
            const registried = await this._schemaRegistry.register({type: SchemaType.AVRO, schema})
            const encodeMessage = await this._schemaRegistry.encode(registried.id, message.message.value)

            this._producer.send({
                topic: message.topic,
                messages: [{value: encodeMessage}],
                acks: message.acks || 1,
                timeout: message.timeout,
                compression: message.compression
            })
        } catch (error) {
            throw new Error(`Send: ${error}`);
        }
    }
    
    disconnect(): void {
        this._producer.disconnect();
    }
}

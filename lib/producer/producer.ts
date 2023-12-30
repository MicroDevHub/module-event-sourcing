import { Kafka, KafkaConfig, Producer } from "kafkajs";
import { IPublishMessage, IProducerInstance } from "../interface/interface";
import { SchemaRegistry, SchemaType } from "@kafkajs/confluent-schema-registry"
import { SchemaRegistryAPIClientArgs } from "@kafkajs/confluent-schema-registry/dist/api";


export class ProducerInstance implements IProducerInstance{
    private _kafka: Kafka;
    private _producer: Producer;
    private _schemaRegistry: SchemaRegistry;

    constructor(kafkaConfig: KafkaConfig, schemaRegistryAPIClientArgs: SchemaRegistryAPIClientArgs) {
        this._kafka = new Kafka(kafkaConfig);
        this._producer = this._kafka.producer();
        this._schemaRegistry = new SchemaRegistry(schemaRegistryAPIClientArgs);
    }

    connect(): void {
        this._producer.connect();
    }

    async send(message: IPublishMessage, schema: string): Promise<void> {
        try {
            const registried = await this._schemaRegistry.register({type: SchemaType.AVRO, schema})
            const encodeMessage = await this._schemaRegistry.encode(registried.id, message.message.value)

            this._producer.send({
                topic: message.topic,
                messages: [{...message.message,value: encodeMessage}],
                acks: message.acks,
                timeout: message.timeout,
                compression: message.compression
            })
        } catch (error) {
            throw new Error(`Send: ${error}`);
        }
    }
    
    disconnect(): void {
        if(this._producer) {
            this._producer.disconnect();
        }
    }
}

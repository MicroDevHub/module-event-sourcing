import { ProducerInstance } from "./producer/producer";
import { ConsumerInstance } from "./consumer/consumer";
import { SchemaRegistryAPIClientArgs } from "@kafkajs/confluent-schema-registry/dist/api";
import { ConsumerConfig } from "kafkajs";
import { IKafkaInstance } from "./index";

export class KafkaInstance implements IKafkaInstance {
    private _clientId: string;
    private _brokers: string[];
    private _schemaRegistryAPIClientArgs: SchemaRegistryAPIClientArgs;

    constructor(clientId: string, brokers: string[], schemaRegistryAPIClientArgs: SchemaRegistryAPIClientArgs) {
        this._clientId = clientId;
        this._brokers = brokers;
        this._schemaRegistryAPIClientArgs = schemaRegistryAPIClientArgs;
    }

    /**
     * Creates and returns a Kafka producer instance.
     * @function producer
     * @returns {ProducerInstance} A Kafka producer instance.
     */
    producer(): ProducerInstance {
        return new ProducerInstance({clientId: this._clientId, brokers: this._brokers}, this._schemaRegistryAPIClientArgs);
    }

    /**
     * Creates and returns a Kafka consumer instance with the specified configuration.
     * @function consumer
     * @param {ConsumerConfig} consumerConfig Configuration options for the Kafka consumer.
     * @returns {ConsumerInstance} A Kafka consumer instance.
     */
    consumer(consumerConfig: ConsumerConfig): ConsumerInstance {
        return new ConsumerInstance({
            clientId: this._clientId,
            brokers: this._brokers},
            consumerConfig, this._schemaRegistryAPIClientArgs);
    }
}

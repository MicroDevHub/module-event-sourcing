import { ProducerInstance } from "./producer/producer";
import { ConsumerInstance } from "./consumer/consumer";
import { SchemaRegistryAPIClientArgs } from "@kafkajs/confluent-schema-registry/dist/api";

export class KafkaInstance {
    private _clientId: string;
    private _brokers: string[];
    private _schemaRegistryAPIClientArgs: SchemaRegistryAPIClientArgs;

    constructor(clientId: string, brokers: string[], schemaRegistryAPIClientArgs: SchemaRegistryAPIClientArgs) {
        this._clientId = clientId;
        this._brokers = brokers;
        this._schemaRegistryAPIClientArgs = schemaRegistryAPIClientArgs;
    }

    producer(): ProducerInstance {
        return new ProducerInstance({clientId: this._clientId, brokers: this._brokers}, this._schemaRegistryAPIClientArgs);
    }

    consumer(): ConsumerInstance {
        return new ConsumerInstance({
            clientId: this._clientId,
            brokers: this._brokers}, 
            {
                groupId: this._clientId,
                minBytes: 5,
                maxBytes: 1e6,
                maxWaitTimeInMs: 3000,
            }, this._schemaRegistryAPIClientArgs);
    }
}

import { ProducerInstance } from "./producer/producer";
import { ConsumerInstance } from "./consumer/consumer";

export class KafkaInstance {
    private _clientId: string;
    private _brokers: string[];

    constructor(clientId: string, brokers: string[]) {
        this._clientId = clientId;
        this._brokers = brokers;
    }

    producer(): ProducerInstance {
        return new ProducerInstance({clientId: this._clientId, brokers: this._brokers});
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
            });
    }
}
import { Consumer, ConsumerConfig, EachMessagePayload, Kafka, KafkaConfig } from "kafkajs";
import { SchemaRegistry } from "@kafkajs/confluent-schema-registry";
import { SchemaRegistryAPIClientArgs } from "@kafkajs/confluent-schema-registry/dist/api";
import { IConsumerHandler, IConsumerInstance, IConsumerRunConfig } from "../index";
import { ILogger, LoggerFactory } from '@micro-dev-hub/module-common-craftsman';

export class ConsumerInstance implements IConsumerInstance{
    private _kafka: Kafka;
    private _consumer: Consumer;
    private _schemaRegistry: SchemaRegistry;
    private logger: ILogger;

    constructor(kafkaConfig: KafkaConfig, consumerConfig: ConsumerConfig, schemaRegistryAPIClientArgs: SchemaRegistryAPIClientArgs) {
        this._kafka = new Kafka(kafkaConfig);
        this._consumer = this._kafka.consumer(consumerConfig);
        this._schemaRegistry = new SchemaRegistry(schemaRegistryAPIClientArgs);
        this.logger = new LoggerFactory().logger;
    }

    /**
     * Start connect to kafka
     * 
     * @async
     * @function connect
     * @returns {Promise<void>}
     */
    public async connect(): Promise<void> {
       await this._consumer.connect();
    }

    /**
     * Read all messages from multiple topic in kafka. 
     * Can customize business logic in handler function as you wish.
     * 
     * @async
     * @function reads
     * @param {IConsumerRunConfig} consumerRunConfig
     * @param {IConsumerHandler[]} consumerHandlers
     * @returns {Promise<void>}
     */
    public async reads(consumerRunConfig: IConsumerRunConfig, consumerHandlers: IConsumerHandler[]): Promise<void> {

        consumerHandlers.forEach((item) => {
            this._consumer.subscribe({
                topics: item.topics,
                fromBeginning: item.fromBeginning
            })
        })

        await this._consumer.run({
            ...consumerRunConfig,
            eachMessage: async (payload: EachMessagePayload) => {
                try {
                    const consumerHandler = consumerHandlers.find((item) => {
                        return item.topics.includes(payload.topic)
                    })

                    if(consumerHandler) {
                       await consumerHandler.handler(payload)
                    }
                } catch (error) {
                    this.logger.error('Error consumer processing message:', error)
                }
            },
        })

    }

    /**
     * Disconnect from kafka
     * 
     * @async
     * @function disconnect
     * @returns {Promise<void>}
     */
    public async disconnect(): Promise<void> {
        if(this._consumer) {
            await this._consumer.disconnect();
        }
    }

    /**
     * Get schema registry
     * 
     * @function consumerSchemaRegistry
     * @returns {SchemaRegistry}
     */
    public getSchemaRegistry(): SchemaRegistry {
        return this._schemaRegistry;
    }

}

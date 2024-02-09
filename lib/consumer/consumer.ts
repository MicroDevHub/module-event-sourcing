import { Consumer, ConsumerConfig, EachMessagePayload, Kafka, KafkaConfig } from 'kafkajs';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { SchemaRegistryAPIClientArgs } from '@kafkajs/confluent-schema-registry/dist/api';
import { IConsumerHandler, IConsumerHandlerMapping, IConsumerInstance, IConsumerRunConfig } from '../index';
import { ILogger, LoggerFactory } from '@micro-dev-hub/module-common-craftsman';

export class ConsumerInstance implements IConsumerInstance {
  private _kafka: Kafka;
  private _consumer: Consumer;
  private _schemaRegistry: SchemaRegistry;
  private logger: ILogger;
  private _consumerHandlerMappings: IConsumerHandlerMapping[];

  constructor(
    kafkaConfig: KafkaConfig,
    consumerConfig: ConsumerConfig,
    schemaRegistryAPIClientArgs: SchemaRegistryAPIClientArgs
  ) {
    this._kafka = new Kafka(kafkaConfig);
    this._consumer = this._kafka.consumer(consumerConfig);
    this._schemaRegistry = new SchemaRegistry(schemaRegistryAPIClientArgs);
    this.logger = new LoggerFactory().logger;
    this._consumerHandlerMappings = [];
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
  public async reads(
    consumerRunConfig: IConsumerRunConfig,
    consumerHandlers: IConsumerHandler[]
  ): Promise<void> {
    // Subcribe all topics in consumerHandlers
    consumerHandlers.forEach(async (item) => {
      this._consumer.subscribe({
        topics: item.topics,
        fromBeginning: item.fromBeginning,
      });
    });

    this._consumerHandlerMappings = await this.getConsumerHandlerMapping(consumerHandlers);

    await this._consumer.run({
      ...consumerRunConfig,
      eachMessage: async (payload: EachMessagePayload) => {
        try {
            const consumerHandlers = this._consumerHandlerMappings.filter((handlerMapping) => handlerMapping.topics.includes(payload.topic)
                && (handlerMapping.fingerprintIds.includes(Number(payload.message.headers?.fingerprintId)) 
                || handlerMapping.fingerprintIds.length === 0))

            const value = payload.message.value
              ? await this._schemaRegistry.decode(payload.message.value)
              : null;

            const consumerMessagePayload = {
              topic: payload.topic,
              partition: payload.partition,
              message: { ...payload.message, value: value },
            };
            
            for (const consumerHandler of consumerHandlers) {
              await consumerHandler.handler(consumerMessagePayload);
            }
        } catch (error) {
          this.logger.error("Error consumer processing message:", error);
        }
      },
    });
  }

  private async getConsumerHandlerMapping(
    consumerHandlers: IConsumerHandler[]
  ): Promise<Array<IConsumerHandlerMapping>> {
    return await Promise.all(
      consumerHandlers.map(async (handler) => {
        let fingerprintIds: number[] = [];

        if (handler.schemas.length > 0) {

          fingerprintIds = (await Promise.all(
            handler.schemas.map(async (schemaName) => {
              try {
                return await this._schemaRegistry.getRegistryId(schemaName, 1);
              } catch (error) {
                this.logger.error(`The ${schemaName} schema is not exist.`);
                throw new Error(`The ${schemaName} schema is not exist.`);
              }
            })
          )) as number[];
          
        }

        return {
          fingerprintIds: fingerprintIds.filter(Boolean),
          topics: handler.topics,
          handler: handler.handler,
        };
      })
    );
  }

  /**
   * Disconnect from kafka
   *
   * @async
   * @function disconnect
   * @returns {Promise<void>}
   */
  public async disconnect(): Promise<void> {
    if (this._consumer) {
      await this._consumer.disconnect();
    }
  }
}

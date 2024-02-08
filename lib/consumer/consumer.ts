import { Consumer, ConsumerConfig, EachMessagePayload, Kafka, KafkaConfig } from 'kafkajs';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { SchemaRegistryAPIClientArgs } from '@kafkajs/confluent-schema-registry/dist/api';
import { IConsumerHandler, IConsumerInstance, IConsumerRunConfig } from '../index';
import { ILogger, LoggerFactory } from '@micro-dev-hub/module-common-craftsman';

export class ConsumerInstance implements IConsumerInstance {
  private _kafka: Kafka;
  private _consumer: Consumer;
  private _schemaRegistry: SchemaRegistry;
  private logger: ILogger;

  constructor(
    kafkaConfig: KafkaConfig,
    consumerConfig: ConsumerConfig,
    schemaRegistryAPIClientArgs: SchemaRegistryAPIClientArgs
  ) {
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

    // Subcribe all topics in consumerHandlers
    consumerHandlers.forEach(async (item) => {
      this._consumer.subscribe({
        topics: item.topics,
        fromBeginning: item.fromBeginning,
      });
    });

    await this._consumer.run({
      ...consumerRunConfig,
      eachMessage: async (payload: EachMessagePayload) => {
        try {
          await this.getConsumerHandler(payload, consumerHandlers);
        } catch (error) {
          this.logger.error('Error consumer processing message:', error);
        }
      },
    });
  }

  /**
   * Get Consumer Handler after callback handler function
   *
   * @async
   * @function getConsumerHandler
   * @param {EachMessagePayload} payload
   * @param {IConsumerHandler[]} consumerHandlers
   * @returns {Promise<void>}
   */
  private async getConsumerHandler(payload: EachMessagePayload, consumerHandlers: IConsumerHandler[]): Promise<void> {
    try {
      const consumerHandlerCustomize = await Promise.all(

        consumerHandlers.map(async (item) => {
          let fingerprintIds: number[] = [];

          if (item.schemas.length > 0) {
            fingerprintIds = await Promise.all(
                    
              item.schemas.map(async (schema) => {
                try {
                  return await this._schemaRegistry.getRegistryId(schema, 1);
                } catch (error) {
                  this.logger.warn(`The ${schema} schema is not exist.`);
                }
              })
            ) as number[];
          }

          return { ...item, fingerprintIds: fingerprintIds.filter(Boolean) };
        })
      );

      const value = payload.message.value
        ? await this._schemaRegistry.decode(payload.message.value)
        : null;

      const consumerMessagePayload = {
        ...payload,
        message: { ...payload.message, value: value },
      };

      const consumerHandler = consumerHandlerCustomize.find((item) => {
        if (item && item.fingerprintIds.length > 0) {
          return (
            item.topics.includes(payload.topic) &&
            item.fingerprintIds.includes(
              Number(payload.message.headers?.fingerprintId)
            )
          );
        } else {
          return item?.topics.includes(payload.topic);
        }
      });

      if (consumerHandler) {
        await consumerHandler.handler(consumerMessagePayload);
      }
      
    } catch (error) {
      this.logger.error('Error get consumer handler:', error);
    }
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

import { Kafka, KafkaConfig, Producer } from 'kafkajs';
import { SchemaRegistry, SchemaType } from '@kafkajs/confluent-schema-registry';
import { SchemaRegistryAPIClientArgs } from '@kafkajs/confluent-schema-registry/dist/api';
import { IProducerInstance, IPublishMessage } from '../index';
import { ILogger, LoggerFactory } from '@micro-dev-hub/module-common-craftsman';


export class ProducerInstance implements IProducerInstance{
  private _kafka: Kafka;
  private _producer: Producer;
  private _schemaRegistry: SchemaRegistry;
  private logger: ILogger;

  constructor(kafkaConfig: KafkaConfig, schemaRegistryAPIClientArgs: SchemaRegistryAPIClientArgs) {
    this._kafka = new Kafka(kafkaConfig);
    this._producer = this._kafka.producer();
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
    await this._producer.connect();
  }

  /**
     * Encode the incoming message using the schema-registry.
     * After, transmit the processed message to a designated Kafka follow-up topic.
     * 
     * @async 
     * @function send
     * @param {IPublishMessage} publishMessages 
     * @param {string} schema 
     * @returns {Promise<void>}
     */
  public async send(publishMessages: IPublishMessage, schema: string): Promise<void> {
    try {
      const getSchemaName = JSON.parse(schema).name;
      const registeredSchema = await this._schemaRegistry.register({type: SchemaType.AVRO, schema}, {subject: getSchemaName});
      const encodeValue = await this._schemaRegistry.encode(registeredSchema.id, publishMessages.message.value);
            
      await this._producer.send({
        topic: publishMessages.topic,
        messages: [{...publishMessages.message, value: encodeValue, headers: {fingerprintId: `${registeredSchema.id}`}}],
        acks: publishMessages.acks,
        timeout: publishMessages.timeout,
        compression: publishMessages.compression
      })
            
    } catch (error) {
      this.logger.error(`Error producer send ${publishMessages.topic} topic: ${error}`);
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
    if(this._producer) {
      await this._producer.disconnect();
    }
  }
}

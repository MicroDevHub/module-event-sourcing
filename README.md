Module kafka-event-sourcing
===================================

Introduction
------------

This module facilitates the transmission of messages to the Kafka system, seamlessly integrated with the Confluent Schema Registry. Leveraging Apache Avro schema, we register new schemas. After, We will follow up registered schema to encode, and decode messages, enhancing the security of messages transmitted to the Kafka system.

Getting started
---------------

```shell
npm install kafka-event-sourcing
```

- Example `docker-compose.yaml`
```yaml
version: '3'

services:
  zookeeper:
    image: confluentinc/cp-zookeeper:6.2.13
    hostname: zookeeper
    container_name: zookeeper
    ports:
      - "2181:2181"
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_SERVER_ID: 1

  kafka:
    image: confluentinc/cp-kafka:7.4.3
    hostname: kafka
    container_name: kafka
    ports:
      - "9092:9092"
    environment:
      KAFKA_ZOOKEEPER_CONNECT: 'zookeeper:2181'
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT_HOST://localhost:9092, PLAINTEXT://kafka:9093
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT, PLAINTEXT_HOST:PLAINTEXT
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      KAFKA_BROKER_ID: 1
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    depends_on:
      - zookeeper

  schema-registry:
    image: confluentinc/cp-schema-registry:7.5.2
    hostname: schema-registry
    container_name: schema-registry
    ports:
      - "8081:8081"
    environment:
      SCHEMA_REGISTRY_KAFKASTORE_BOOTSTRAP_SERVERS: PLAINTEXT://kafka:9093
      SCHEMA_REGISTRY_HOST_NAME: schema-registry
      SCHEMA_REGISTRY_LISTENERS: http://0.0.0.0:8081
      SCHEMA_REGISTRY_DEBUG: 'true'
    depends_on:
      - zookeeper
      - kafka
```

- Create publish messages file
```js
// Example for publish messages
import { KafkaInstance } from "kafka-event-sourcing";

const clientId = "my-app";
const brokers = ["localhost:9092"];
const schemaRegistry = {host: "http://localhost:8081"};

const kafka = new KafkaInstance(clientId, brokers, schemaRegistry);

const producer = kafka.producer();

const produce = async() => {
    await producer.connect();
    let i = 1;
    let topicCount = 1;

    const schema = `
        {
            "type": "record",
            "name": "kafkaEventSourcingTest",
            "namespace": "examples",
            "fields": [{ "type": "string", "name": "fullName" }]
        }
        `;

    setInterval(async() => {
        try {
            if(topicCount > 10) {
                topicCount = 1;
            }

            await producer.send({
                topic: `topic-test-${topicCount}`,
                message: 
                    {
                        value: {fullName: `Test ${i} in topic-test-${topicCount}`}
                    }
            }, schema);

            console.log(`Test ${i} in topic-test-${topicCount}`);

            i++;
            topicCount++;
        } catch (error) {
            console.log(error);
        }
    }, 1000)
    
}

produce();
```

- Create subcribe messages file
```js
// Example for subcribe messages
import { EachMessagePayload } from "kafkajs";
import { IConsumerHandler, KafkaInstance } from "kafka-event-sourcing";

const clientId = "my-app";
const brokers = ["localhost:9092"];
const schemaRegistry = {host: "http://localhost:8081"};

const kafka = new KafkaInstance(clientId, brokers, schemaRegistry);

const consumer = kafka.consumer({
    groupId: clientId,
    minBytes: 5,
    maxBytes: 1e6,
    maxWaitTimeInMs: 3000,
});

consumer.connect();

const testhandler: IConsumerHandler[] = [
    {
        topics: ['topic-test-1','topic-test-2'],
        fromBeginning: true,
        handler: async (payload: EachMessagePayload) => {
                const originalValue = payload.message.value
                if(originalValue) {
                    console.log(`received ${await consumer.getSchemaRegistry().decode(originalValue)} of topic-test-1 and topic-test-2`)
                }
        }
    },
    {
        topics: ['topic-test-3',],
        fromBeginning: true,
        handler: async (payload: EachMessagePayload) => {
                const originalValue = payload.message.value
                if(originalValue) {
                    console.log(`received ${await consumer.getSchemaRegistry().decode(originalValue)} of topic-test-3`)
                }
        }
    },
    {
        topics: ['topic-test-4','topic-test-5'],
        fromBeginning: true,
        handler: async (payload: EachMessagePayload) => {
                const originalValue = payload.message.value
                if(originalValue) {
                    console.log(`received ${await consumer.getSchemaRegistry().decode(originalValue)} of topic-test-4 and topic-test-5`)
                }
        }
    },
]

consumer.reads({autoCommit: true},testhandler);
```

Features
---------------

**KafkaInstance**
- Declare `new KafkaInstance(clientId: string, brokers: string[], schemaRegistryAPIClientArgs: SchemaRegistryAPIClientArgs)`

```text
ClientId: Client-id is a logical grouping of clients with a meaningful name chosen by the client application.

Brokers: Broker is a core component responsible for storing, managing, and serving data in a distributed and fault-tolerant manner within a Kafka cluster.

SchemaRegistryAPIClientArgs: {
    host: string;
    auth?: Authorization;
    clientId?: string;
    retry?: Partial<RetryMiddlewareOptions>;
    /** HTTP Agent that will be passed to underlying API calls */
    agent?: Agent;
}
```

- `prodcuer()`: The method will return `ProducerInstance`.

- `consumer(consumerConfig: ConsumerConfig)`: The method will return `ConsumerInstance`.

```text
ConsumerConfig: {
  groupId: string
  partitionAssigners?: PartitionAssigner[]
  metadataMaxAge?: number
  sessionTimeout?: number
  rebalanceTimeout?: number
  heartbeatInterval?: number
  maxBytesPerPartition?: number
  minBytes?: number
  maxBytes?: number
  maxWaitTimeInMs?: number
  retry?: RetryOptions & { restartOnFailure?: (err: Error) => Promise<boolean> }
  allowAutoTopicCreation?: boolean
  maxInFlightRequests?: number
  readUncommitted?: boolean
  rackId?: string
}
```

**ProducerInstance**

- `connect()`: The method will start connect to kafka.

- `disconnect()`: The method will disconnect to kafka.

- `send(publishMessages: IPublishMessage, schema: string)`: The method facilitates schema registration with the Confluent Schema Registry. If the schema already exists, it returns the identifier of the existing schema; otherwise, it registers the new schema and returns its identifier. Subsequently, the method encodes the message using the registered schema and dispatches it to the Kafka system.

```text
IMessage: {
    key?: Buffer | string | null;
    value: Buffer | string | Object | null;
    partition?: number;
    headers?: IHeaders;
    timestamp?: string;
}

IPublishMessage: {
    topic: string,
    message: IMessage,
    acks?: number,
    timeout?: number,
    compression?: CompressionTypes
}
```

**ConsumerInstance**

- `connect()`: The method will start connect to kafka.

- `disconnect()`: The method will disconnect to kafka.

- `reads(consumerRunConfig: IConsumerRunConfig, consumerHandlers: IConsumerHandler[])`: The reads method is designed to streamline the process of consuming messages from Kafka topics using the provided Kafka consumer configuration (consumerRunConfig) and an array of consumer handlers (consumerHandlers). The method iterates through each specified topic in the consumerHandlers, subscribes the consumer to those topics, and then initiates the consumer's execution. It allows can customize bussiness logic as user wish.

```text
IConsumerRunConfig: {
    autoCommit?: boolean;
    autoCommitInterval?: number | null;
    autoCommitThreshold?: number | null;
    eachBatchAutoResolve?: boolean;
    partitionsConsumedConcurrently?: number;
}

IConsumerHandler: {
    topics: string[];
    fromBeginning: boolean;
    handler: (payload: EachMessagePayload) => Promise<void>;
}
```

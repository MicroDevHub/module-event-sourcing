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

- `producer()`: The method will return `ProducerInstance`.

- `consumer(consumerConfig: ConsumerConfig)`: The method will return `ConsumerInstance`.

**ProducerInstance**

- `connect()`: The method will start connect to kafka.

- `disconnect()`: The method will disconnect to kafka.

- `send(publishMessages: IPublishMessage, schema: string)`: The method facilitates schema registration with the Confluent Schema Registry. If the schema already exists, it returns the identifier of the existing schema; otherwise, it registers the new schema and returns its identifier. Subsequently, the method encodes the message using the registered schema and dispatches it to the Kafka system.

**ConsumerInstance**

- `connect()`: The method will start connect to kafka.

- `disconnect()`: The method will disconnect to kafka.

- `reads(consumerRunConfig: IConsumerRunConfig, consumerHandlers: IConsumerHandler[])`: The reads method is designed to streamline the process of consuming messages from Kafka topics using the provided Kafka consumer configuration (consumerRunConfig) and an array of consumer handlers (consumerHandlers). The method iterates through each specified topic in the consumerHandlers, subscribes the consumer to those topics, and then initiates the consumer's execution. It allows can customize bussiness logic as user wish.

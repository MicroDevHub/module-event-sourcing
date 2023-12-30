import { EachBatchPayload } from "kafkajs"
import { IConsumerHandler } from "../lib/interface/interface"
import { KafkaInstance } from "../lib/kafka-service"

const clientId = "my-app"
const brokers = ["localhost:9092"]
const topic = "send-message"

const kafka = new KafkaInstance(clientId, brokers, {host: "http://localhost:8081"})

const consumer = kafka.consumer()
const testhandler: IConsumerHandler[] = [
    {
        topics: ['topic-test-1','topic-test-2'],
        fromBeginning: true,
        handler: async (payload: EachBatchPayload) => {
            payload.batch.messages.forEach(async (message) => {
                const originalValue = message.value
                if(originalValue) {
                    console.log(`received ${await consumer.consumerSchemaRegistry()?.decode(originalValue)} of topic-test-1 and topic-test-2`)
                }
            })
        }
    },
    {
        topics: ['topic-test-3',],
        fromBeginning: true,
        handler: async (payload: EachBatchPayload) => {
            payload.batch.messages.forEach(async (message) => {
                const originalValue = message.value
                if(originalValue) {
                    console.log(`received ${await consumer.consumerSchemaRegistry()?.decode(originalValue)} of topic-test-3`)
                }
            })
        }
    },
    {
        topics: ['topic-test-4','topic-test-5'],
        fromBeginning: true,
        handler: async (payload: EachBatchPayload) => {
            payload.batch.messages.forEach(async (message) => {
                const originalValue = message.value
                if(originalValue) {
                    console.log(`received ${await consumer.consumerSchemaRegistry()?.decode(originalValue)} of topic-test-4 and topic-test-5`)
                }
            })
        }
    },
]
     consumer.reads(testhandler)

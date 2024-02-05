import { IConsumerHandler, IEachMessagePayload } from "../lib/interface/interface";
import { KafkaInstance } from "../lib/kafka-service";

const clientId = "my-app";
const brokers = ["localhost:9092"];
const schemaRegistry = {host: "http://localhost:8081"};

const kafka = new KafkaInstance(clientId, brokers, schemaRegistry);

const consumer = kafka.consumer({
    groupId: "group-1",
    minBytes: 5,
    maxBytes: 1e6,
    maxWaitTimeInMs: 3000,
});

consumer.connect();

const testhandler: IConsumerHandler[] = [
    {
        topics: ['topic-test-1','topic-test-2'],
        fromBeginning: true,
        handler: async (payload: IEachMessagePayload) => {
            console.log(`received ${payload.message.value} of topic-test-1 and topic-test-2`)
        }
    },
    {
        topics: ['topic-test-3',],
        fromBeginning: true,
        handler: async (payload: IEachMessagePayload) => {
            console.log(`received ${payload.message.value} of topic-test-3`)
        }
    },
    {
        topics: ['topic-test-4','topic-test-5'],
        fromBeginning: true,
        handler: async (payload: IEachMessagePayload) => {
            console.log(`received ${payload.message.value} of topic-test-4 and topic-test-5`)
        }
    },
]

consumer.reads({autoCommit: true},testhandler);

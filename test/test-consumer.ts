import { KafkaInstance } from "../lib/kafka-service"

const clientId = "my-app"
const brokers = ["localhost:9092"]
const topic = "send-message"

const kafka = new KafkaInstance(clientId, brokers)

const consumer = kafka.consumer()

consumer.read(topic, true)
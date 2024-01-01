import { KafkaInstance } from "../lib/kafka-service";

const clientId = "my-app"
const brokers = ["localhost:9092"]

const kafka = new KafkaInstance(clientId, brokers, {host: "http://localhost:8081"})

const producer = kafka.producer()

const produce = async() => {
    await producer.connect()
    let i = 1
    let topicCount = 1

    const schema = `
        {
            "type": "record",
            "name": "RandomTest12",
            "namespace": "examples",
            "fields": [{ "type": "string", "name": "fullName" }]
        }
        `

    setInterval(async() => {
        try {
            if(topicCount > 10) {
                topicCount = 1
            }

            await producer.send({
                topic: `topic-test-${topicCount}`,
                message: 
                    {
                        value: {fullName: `quan ${i} in topic-test-${topicCount}`}
                    }
            }, schema)

            console.log(`quan ${i} in topic-test-${topicCount}`)

            i++
            topicCount++
        } catch (error) {
            console.log(error)
        }
    }, 1000)
    
}

produce()


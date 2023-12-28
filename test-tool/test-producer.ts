import { KafkaInstance } from "../lib/kafka-service";
// const KafkaInstance = require("../lib/kafka-instance");

const clientId = "my-app"
const brokers = ["localhost:9092"]
const topic = "send-message"

const kafka = new KafkaInstance(clientId, brokers, {host: "http://localhost:8081"})

const producer = kafka.producer()

const produce = async() => {
    await producer.connect()
    let i = 1
    const schema = `
        {
            "type": "record",
            "name": "RandomTest12",
            "namespace": "examples",
            "fields": [{ "type": "string", "name": "fullName" }]
        }
        `

    const payload = {"fullName": `quan + ${i}`}
    const subject = 'quan-tran'
    setInterval(async() => {
        try {
            await producer.send({
                topic,
                message: 
                    {
                        value: {fullName: `quan ${i}`}
                    }
            }, schema)

            console.log(`quan ${i}`)

            i++
        } catch (error) {
            console.log(error)
        }
    }, 1000)
    
    // await producer.disconnect()
}

produce()

// console.log('fsdfhjsdfgsdf')


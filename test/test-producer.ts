import { KafkaInstance } from "../lib/kafka-service";
// const KafkaInstance = require("../lib/kafka-instance");

const clientId = "my-app"
const brokers = ["localhost:9092"]
const topic = "send-message"

const kafka = new KafkaInstance(clientId, brokers)

const producer = kafka.producer()


// for(let i = 0; i <= 10; i++) {
//     try {
//         producer.connect()
//         console.log(`ok ${i}`)
//         producer.send({
//             topic: topic,
//             message: [{value: `quan + ${i}`}],
//         })
//     } catch (err) {
//         console.log(err)
//     }
// }

const produce = async() => {
    await producer.connect()
    let i = 1
    setInterval(async() => {
        try {
            await producer.send({
                topic,
                message: [
                    {
                        value: `quan ${i}`
                    }
                ]
            })

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


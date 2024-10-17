import net from "net"
import './server.js';
import promptSync from "prompt-sync"
import { ipAddr } from "./server.js"

const prompt = promptSync()

const client = new net.Socket()
const serverHost = ipAddr
const serverPort = 8080

client.connect(serverPort, serverHost, () => {
  //Initially prompt the user for input
  handleUserInput()
})


function handleUserInput() {
  const message = prompt("Enter your message: ")
  client.write(message)
}


client.on("data", (data) => {
  console.log(`Received from server: ${data}`)
  
  if (data != "exit") {
    handleUserInput()
  }
})

client.on("close", function () {
  console.log("Connection closed")
})

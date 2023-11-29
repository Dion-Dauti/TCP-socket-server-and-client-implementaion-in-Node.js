import net from "net"

const blockList = new net.BlockList()
blockList.addAddress("192.168.0.34")
console.log(blockList.check("123.123.123.123"))

const server = net.createServer()
const port = 8080

server.listen(
  {
    host: "10.180.18.205",
    port: port,
  },
  () => {
    console.log(`Server is setup on port ${port}`)
  }
)

server.on("connection", (stream) => {
  const clientIP = stream.remoteAddress

  if (blockList.check(clientIP)) {
    stream.end("You are blocked")
    return
  }

  stream.setEncoding("utf8")
  const alias = resolveClient(clientIP)
  console.log("Client connected")

  

  stream.on("data", (data) => {
    console.log(`Received data from ${alias}:  ${data}`)

    const responseData = `${data}`
    stream.write(responseData)
  })

  stream.on("close", (data) =>
    console.log(`connection closed: ${clientAddress}` + "\n")
  )

  stream.on("error", (err) => console.log(`Error: ${err}`))
})

const knownClients = [
  {
    id: 1,
    ip: "192.168.0.38",
    name: "Dion Dauti",
    readPremission: false,
    writePremission: true,
    executePremission: false,
  },
  {
    id: 2,
    ip: "10.180.21.251",
    name: "Dion Kastrati",
    readPremission: false,
    writePremission: true,
    executePremission: false,
  },
  {
    id: 3,
    ip: "169.254.183.69",
    name: "Diona",
    readPremission: false,
    writePremission: true,
    executePremission: false,
  },
  {
    id: 4,
    ip: "192.345.235.239",
    name: "Dominik",
    readPremission: false,
    writePremission: true,
    executePremission: false,
  },
]
function resolveClient(ip) {
  const client = knownClients.find((client) => client.ip === ip)
  return client ? client.name : ip
}

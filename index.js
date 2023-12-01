import fs from "fs"
import net from "net"
import { exec } from "child_process"
import { knownClients, resolveClient } from "./clientList.js"

const blockList = new net.BlockList()
blockList.addAddress("192.168.0.34")

const server = net.createServer()
const port = 8080

server.listen(
  {
    host: "172.20.10.2",
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
    if (data.toString().toLowerCase() == "exit") {
      stream.end("Press [ENTER] to close the connection!")
    }
    const responseData = `${data}`

    var splitCommand = data.split(" ")
    // var command = splitCommand[0];

    if (data.toString().includes("/read")) {
      const fileName = data.toString().split(/\s+/)[1]

      // Check if the file exists
      fs.access(`./files/${fileName}`, fs.constants.F_OK, (err) => {
        if (err) {
          console.log(err)
          stream.write("File not found")
          return
        }
      })
      // File exists, read its content

      try {
        var content = fs.readFileSync(`./files/${fileName}`, "utf8")
        stream.write(content)
      } catch (err) {
        console.log(err)
      }
    } else if (data.toString().includes("/write")) {
      // ne komand marrim emrin e fajllit
      const fileName = data.toString().split(/\s+/)[1]
      var content = "\r\n" + splitCommand.slice(2).join(" ")
      try {
        // Check if the file exists
        fs.access(`./files/${fileName}`, fs.constants.F_OK, (err) => {
          if (err) {
            console.log(err)
            stream.write("File not found")
            return
          }

          // File exists, update its content
          fs.writeFile(
            `./files/${fileName}`,
            content,
            { flag: "a+" },
            (error) => {
              if (error) {
                console.log(error)
                stream.write("Error updating file content!")
              } else {
                stream.write("\nFile content UPDATED!")
              }
            }
          )
        })
      } catch (err) {
        stream.write("An error happened, try again!")
        console.log(err)
      }
    } else if (data.includes("/exec")) {
      const fileName = data.toString().split(/\s+/)[1]
      const action = data.toString().split(/\s+/)[2]
      if (action == "new") {
        try {
          // Check if file exists
          fs.promises
            .access(`./files/${fileName}`, fs.constants.F_OK)
            .then(() => stream.write(`File ${fileName} exists!`))
            .catch(() => {
              fs.access(`./files/${fileName}`, fs.constants.F_OK, (err) => {
                if (err) {
                  fs.writeFile(`./files/${fileName}`, "", (err) => {
                    if (err) {
                      console.log(err)
                      stream.write(`Error creating file ${fileName}`)
                      return
                    } else {
                      stream.write(`File ${fileName} created!`)
                    }
                  })
                }
              })
            })
        } catch (err) {
          console.log(err)
        }
      } else if (action == "run") {
        fs.access(`./${fileName}`, fs.constants.F_OK, (err) => {
          if (err) {
            console.log(err)
            stream.write("Script not found")
            return
          }
        })
        exec(`node ${fileName}`, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error executing script: ${error.message}`)
            return
          }

          console.log(`Script output:\n${stdout}`)
          stream.write("Script has run succefully")
          if (stderr) {
            console.error(`Script errors:\n${stderr}`)
          }
        })
      } else {
        stream.write("Invalid command! \r\nType /help to see server commands!")
      }
    } else if (data == "/help") {
      stream.write(
        "\r\n" +
          "Type /read [file name.txt] -> To read from a file! " +
          "\r\n" +
          "Type /write [file name.txt] [content] -> To write in a file! " +
          "\r\n" +
          "Type /exec [file name.txt] [action] -> (Actions: new - create new file, del - delete file, run - open a file)! "
      )
    } else {
      stream.write(responseData)
    }
  })

  stream.on("close", () => console.log(`Connection closed by ${alias}` + "\n"))

  stream.on("error", (err) => console.log(`Error: ${err}`))
})

function checkPermission(ip, action) {
  return !!knownClients.find((client) => client.ip === ip && client[action])
}

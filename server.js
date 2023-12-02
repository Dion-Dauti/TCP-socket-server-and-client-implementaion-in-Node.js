import fs, { readFile } from "fs"
import net from "net"
import { exec } from "child_process"
import { knownClients, resolveClient } from "./clientList.js"

const blockList = new net.BlockList()
blockList.addAddress("172.20.10.10")

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

    if (data.toString().includes("/read")) {
      const fileName = data.toString().split(/\s+/)[1]
      readsFile(fileName, stream)
    } else if (data.toString().includes("/write")) {
      if (!checkPermission(clientIP, "writePermission")) {
        stream.write("You dont have permission to write")
        return
      }
      const fileName = data.toString().split(/\s+/)[1]
      var content = "\r\n" + splitCommand.slice(2).join(" ")

      writeToFile(fileName, content, stream)
    } else if (data.toString().includes("/list")) {
      listFiles(stream)
    } else if (data.includes("/exec")) {
      if (!checkPermission(clientIP, "executePermission")) {
        stream.write("You dont have permission to execute")
        return
      }

      const fileName = data.toString().split(/\s+/)[1]
      const action = data.toString().split(/\s+/)[2]

      if (action == "new") {
        createFile(fileName, stream)
      } else if (action == "run") {
        runScript(fileName, stream)
      } else if (action == "del") {
        deleteFile(fileName, stream)
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
          "Type /exec [file name.txt] [action] -> (Actions: new - create new file, del - delete file, run - open a file)! " +
          "\r\n" +
          "Type exit to close the connection with server!" +
          "\r\n" +
          "Type /list to list the files on server!"
      )
    } else {
      stream.write(responseData)
    }
  })

  stream.on("close", () => console.log(`Connection closed by ${alias}` + "\n"))

  stream.on("error", (err) => console.log(`${err}`))
})

function checkPermission(ip, action) {
  return !!knownClients.find((client) => client.ip === ip && client[action])
}
function writeToFile(fileName, content, stream) {
  try {
    // Check if the file exists
    fs.access(`./files/${fileName}`, fs.constants.F_OK, (err) => {
      if (err) {
        stream.write("File not found")
        return
      }

      // File exists, update its content
      fs.writeFile(`./files/${fileName}`, content, { flag: "a+" }, (error) => {
        if (error) {
          stream.write("Error updating file content!")
        } else {
          stream.write("\nFile content updated!")
        }
      })
    })
  } catch (err) {
    stream.write("An error happened, try again!")
  }
}
function readsFile(fileName, stream) {
  // Check if the file exists
  fs.access(`./files/${fileName}`, fs.constants.F_OK, (err) => {
    if (err) {
      stream.write("File not found")
      return
    }
  })
  // File exists, read its content

  try {
    var content = fs.readFileSync(`./files/${fileName}`, "utf8")
    stream.write(content)
  } catch (err) {
    console.log("Client typed a file that doesn't exists")
  }
}

function createFile(fileName, stream) {
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
}
function deleteFile(fileName, stream) {
  try {
    fs.access(`./files/${fileName}`, fs.constants.F_OK, (err) => {
      if (err) {
        stream.write(`File ${fileName} doesn't exist on server!`)
        return
      } else {
        fs.unlink(`./files/${fileName}`, (err) => {
          if (err) {
            stream.write(`Error deleting file ${fileName}: ${err.message}`)
          } else {
            stream.write(`File ${fileName} has been deleted.`)
          }
        })
      }
    })
  } catch (err) {
    console.log(err)
  }
}

function runScript(fileName, stream) {
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
}

function listFiles(stream) {
  fs.readdir("./files", (err, files) => {
    if (err) {
      stream.write("Server can acess the files!")
    }
    const strArray = files.map((file) => file.toString() + "\n")
    const fileList = "\n" + strArray.join("")
    if (!fileList) {
      stream.write("No files exists on the server!")
    }
    stream.write(fileList)
  })
}

import fs from "fs"
import net from "net"

const blockList = new net.BlockList()
blockList.addAddress("192.168.0.34")

const server = net.createServer()
const port = 8080

server.listen(
  {
    host: "10.180.24.178",
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
    if(data.toString().toLowerCase() == "exit"){
      stream.end("Press [ENTER] to close the connection!")
    }
    const responseData = `${data}`

    var splitCommand = data.split(" ");
    // var command = splitCommand[0];

    if (data.toString().includes("/read")) {
      const filename = data.toString().split(/\s+/)[1]

      // Check if the file exists
      fs.access(`./files/${filename}`, fs.constants.F_OK, (err) => {
        if (err) {
          console.log(err)
          stream.write("File not found")
          return
        }
      })
      // File exists, read its content

      try {
        var content = fs.readFileSync(`./files/${filename}`, "utf8")
        stream.write(content)
      } catch (err) {
        console.log(err)
      }
    }
    else if (data.toString().includes("/write")) {
      // ne komand marrim emrin e fajllit
      const filename = data.toString().split(/\s+/)[1];
      var content = "\r\n" + splitCommand.slice(2).join(" ");
      try {
       // Check if the file exists
        fs.access(`./files/${filename}`, fs.constants.F_OK, (err) => {
          if (err) {
            console.log(err);
            stream.write("File not found");
            return;
          }

          // File exists, update its content
          fs.writeFile(`./files/${filename}`, content, { flag: "a+" }, (error) => {
            if (error) {
              console.log(error);
              stream.write("Error updating file content!");
            } else {
              stream.write("\nFile content UPDATED!");
            }
          });
        });

      } catch (err) {
        stream.write("An error happened, try again!")
        console.log(err)
      }
    } 
      else if(data.includes("/exec")){
      const fileName = data.toString().split(/\s+/)[1];
      const action = data.toString().split(/\s+/)[2];
      if(action == "new"){
        try {
          // Check if file exists
          fs.promises.access(`./files/${fileName}`, fs.constants.F_OK)
              .then(() => stream.write(`File ${fileName} exists!`))
              .catch(() => {
                fs.access(`./files/${fileName}`, fs.constants.F_OK, (err) => {
                  if(err){
                    fs.writeFile(`./files/${fileName}`, "", (err) => {
                      if (err) {
                        console.log(err);
                        stream.write(`Error creating file ${fileName}`);
                        return;
                      } 
                      else {
                        stream.write(`File ${fileName} created!`);
                      }
                    });
                  }
              })
            });
         } catch(err) {
            console.log(err);
        }
      }
        else if (action == "del"){
        try{
          fs.access(`./files/${fileName}`, fs.constants.F_OK, (err) =>{
            if(err){
              stream.write(`File ${fileName} doesn't exist on server!`)
              return;
            }
            else{
              fs.unlink(`./files/${fileName}`, (err) => {
                if (err) {
                  console.error(`Error deleting file ${fileName}: ${err.message}`);
                  stream.write(`Error deleting file ${fileName}: ${err.message}`);
                } else {
                  console.log(`File ${fileName} has been deleted.`);
                  stream.write(`File ${fileName} has been deleted.`);
                }
              });
            }
          })
          
        }
        catch(err){
          console.log(err);
        }
      }
      else{
        stream.write("Invalid command! \r\nType /help to see server commands!");
      }
    }
    else if(data == "/help"){
      stream.write("\r\n"+"Type /read [file name.txt] -> To read from a file! " +
                    "\r\n"+"Type /write [file name.txt] [content] -> To write in a file! " +
                    "\r\n"+"Type /exec [file name.txt] [action] -> (Actions: new - create new file, del - delete file, run - open a file)! ");
    }
    else {
      stream.write(responseData)
      stream.write("\r\n"+"Type /help to see server commands!")
    }
  })

  stream.on("close", (data) =>
    console.log(`connection closed by ${alias}` + "\n")
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
    ip: "192.168.1.14",
    name: "Diona Muçiqi",
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

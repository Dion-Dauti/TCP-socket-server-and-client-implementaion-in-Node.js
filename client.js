import net from "net";
import promptSync from "prompt-sync";
const prompt = promptSync();

const client = new net.Socket();
const serverHost = "172.20.10.5";
const serverPort = 8080;

client.connect(serverPort, serverHost, () => {
  // Call handleUserInput initially to prompt the user for input
  handleUserInput();
});

// Function to handle user input
function handleUserInput() {
  const message = prompt("Enter your message: ");
  client.write(message);
}

// Set up event listeners
client.on("data", (data) => {
    // Handle user input after receiving data
    if(data == "/help"){
      console.log("Type /read [file name.txt] -> To read from a file! ");
      console.log("Type /write [file name.txt] [content] -> To write in a file! ");
      console.log("Type /exec [file name.txt] [action] -> (Actions: new - create new file, del - delete file, run - execute a file)! ");
    }
    console.log(`Received from server: ${data}`);
    if(data != "exit"){
      handleUserInput();
    }
});

client.on("close", function () {
  console.log("Connection closed");
});
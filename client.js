import net from "net";
import promptSync from "prompt-sync";
const prompt = promptSync();

const client = new net.Socket();
const serverHost = "10.180.18.205";
const serverPort = 8080;

client.connect(serverPort, serverHost, () => {});

// Function to handle user input
function handleUserInput() {
  const message = prompt("Enter your message:");
  client.write(message);
}

// Set up event listeners
client.on("data", (data) => {
  console.log(`Received from server: ${data}`);
  // Handle user input after receiving data
  handleUserInput();
});

client.on("close", function () {
  console.log("Connection closed");
});

// Call handleUserInput initially to prompt the user for input
handleUserInput();
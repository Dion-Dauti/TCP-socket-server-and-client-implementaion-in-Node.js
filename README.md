# Computer Networks - TCP Socket Server and Client Implementation in Node.js

## Project Overview

This project is a practical implementation of a simple TCP server and client model using Node.js. The primary goal is to facilitate communication and file manipulation between connected clients and a central server. The project includes features such as IP blocking, file operations, and client alias resolution.

## Project Idea

The TCP server allows clients to connect securely, ensuring that only authorized clients can interact with the server. The project aims to provide a versatile and user-friendly interface for managing files and executing scripts on the server.



## Project Implementation

### Project Structure

- **server.js**: The main script for the TCP server.
- **client.js**: The main script for the TCP client.
- **db-script.js**: Script to initialize and populate a MySQL database with known clients.
- **clientList.js**: Module containing a list of known clients and a function to resolve client names based on IP addresses.

### Key Features

1. **IP Blocking**: Certain IP addresses can be blocked from connecting to the server, ensuring network security.

2. **File Operations**: Clients can read, write, list files, create new files, and execute scripts on the server. This provides a comprehensive set of features for managing files within the network.

3. **Client Aliases**: Clients are identified by aliases rather than raw IP addresses, adding a layer of user-friendliness to the interaction.

### Dependencies

- **Node.js**: The runtime environment for executing JavaScript code.
- **MySQL2**: A Node.js-based MySQL library for database interactions.
- **Prompt-Sync**: A synchronous prompt library for user input in the client script.



### Project Flow

1. **Server Initialization**: The server is set up to listen on a specific IP address and port.

2. **Client Connection**: Clients connect to the server, and IP blocking is enforced to ensure secure connections.

3. **Client Interaction**: Clients can execute various commands, such as read, write, execute, list, and get help, creating a versatile network interaction.

4. **Database Population**: The `db-script.js` script initializes and populates a MySQL database with known clients, providing a centralized repository of client information.

5. **Client Resolution**: The `clientList.js` module provides a list of known clients and resolves client aliases based on their IP addresses, enhancing the user experience.

### Contributors

- **Dion Kastrati**

- **Dion Dauti**

- **Diona Muçiqi**

- **Dominik Pllashniku**



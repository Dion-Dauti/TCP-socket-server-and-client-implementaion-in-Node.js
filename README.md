# TCP client–server model with node

 A simple TCP server that listens for connections and provides a set of custom commands for interacting with files and executing scripts. It includes an IP blocking feature to prevent certain clients from connecting. The server identifies clients by IP address and supports resolving client aliases.

## Features

- Binds to a specific IP address and listens on a configurable port
- Blocks certain IP addresses from connecting
- Handles incoming data and provides custom commands for clients
- Reads and writes to files
- Creates new files and executes scripts
- Responds with help instructions upon client request

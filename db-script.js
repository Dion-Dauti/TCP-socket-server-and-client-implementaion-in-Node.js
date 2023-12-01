import mysql from "mysql2"
import { knownClients } from "./clientList.js"

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "computer-network",
  port: 3307,
  authPlugins: {
    mysql_clear_password: () => () => Buffer.from("root"),
  },
})

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err)
    return
  }
  console.log("Connected to database")
})

knownClients.forEach((data) => {
  connection.query(
    "INSERT INTO clients(ip, name, readPremission, writePremission, executePremission) VALUES (?, ?, ?, ?, ?)",
    [
      data.ip,
      data.name,
      data.readPermission,
      data.writePermission,
      data.executePermission,
    ],
    (error, results) => {
      if (error) throw error
      console.log("Inserted row with ID:", results.insertId)
    }
  )
})

// Close the connection after all queries are executed
connection.end((err) => {
  if (err) {
    console.error("Error closing database connection:", err)
  } else {
    console.log("Connection closed")
  }
})

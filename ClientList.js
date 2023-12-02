export const knownClients = [
  {
    id: 1,
    ip: "10.180.18.205",
    name: "Dion Dauti",
    readPermission: true,
    writePermission: true,
    executePermission: true,
  },
  {
    id: 2,
    ip: "172.20.10.5",
    name: "Dion Kastrati",
    readPermission: true,
    writePermission: true,
    executePermission: true,
  },
  {
    id: 3,
    ip: "192.168.1.14",
    name: "Diona Muçiqi",
    readPermission: true,
    writePermission: true,
    executePermission: false,
  },
  {
    id: 4,
    ip: "192.345.235.239",
    name: "Dominik",
    readPermission: true,
    writePermission: true,
    executePermission: false,
  },
]

export function resolveClient(ip) {
  const client = knownClients.find((client) => client.ip === ip)
  return client ? client.name : ip
}

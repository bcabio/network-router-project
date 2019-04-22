const dgram = require('dgram');
const ip = require('ip');

const multicastListener = dgram.createSocket('udp4');
const multicastSender = dgram.createSocket('udp4');
const dataListener = dgram.createSocket('udp4');
const dataSender = dgram.createSocket('udp4');

const MULTICAST_ADDR = "239.255.255.255";
const SELF_IP = ip.address();

const DATA_PORT = 5000;
const MULTICAST_LISTEN_PORT = 5005;
const MULTICAST_SEND_PORT = 5005;

let routingTable = [
  {
    "addressFamily": "0002",
    "routeTag": "0000",
    "destination": ip.toBuffer(SELF_IP).toString('hex'), // 192.168.1.139
    "subnetMask": "00000000",
    "nextHop": ip.toBuffer(SELF_IP).toString('hex'),
    "hopCount": "00000000",
  },
];

routingTableToRIPPacket = (routingTable) => {
  const header = new Buffer("02020000");

  const entries = [];
  entries.push(header);

  routingTable.forEach((entry) => {
    Object.keys(entry).forEach((field) => {
      entries.push(new Buffer(entry[field]));
    });
  });

  return Buffer.concat(entries);
};

ripPacketToRoutingTable = (ripPacket) => {
  const packet = ripPacket.toString('utf-8');

  const header = packet.slice(0, 8);
  const content = packet.slice(8);
  const numEntries = (content.length) / 40;

  const routingTable = [];
  for (let i = 0; i < numEntries; i++) {
    const entry = content.slice(i*40, (i+1)*40);

    const addressFamily = entry.slice(0, 4);
    const routeTag = entry.slice(4, 8);
    const destination = entry.slice(8, 16);
    const subnetMask = entry.slice(16, 24);
    const nextHop = entry.slice(24, 32);
    const hopCount = entry.slice(32, 40);

    routingTable.push({
      "addressFamily": addressFamily,
      "routeTag": routeTag,
      "destination": destination,
      "subnetMask": subnetMask,
      "nextHop": nextHop,
      "hopCount": hopCount,
    });
  }

  console.log(routingTable);
  return routingTable;
};

/* SEND MULTICAST */
setInterval(function sendMulticast() {
  const message = routingTableToRIPPacket(routingTable);
  multicastSender.send(message, 0, message.length, MULTICAST_SEND_PORT, MULTICAST_ADDR);
}, 3000);

/* LISTEN FOR MULTICAST */
multicastListener.on('listening', () => {
  const address = multicastListener.address();
  console.log(`multicastListener listening ${address.address}:${address.port}`);
});

/* WHEN MULTICAST RECEIVED */
multicastListener.on('message', (msg, rinfo) => {
  if (rinfo.address != SELF_IP) {
    console.log(`multicastListener got: ${msg} from ${rinfo.address}:${rinfo.port}`);

    const message = ripPacketToRoutingTable(msg);

    let found = false;
    message.forEach((receivedEntry) => {
      routingTable.forEach((routingTableEntry, index) => {
        if (receivedEntry['destination'] === routingTableEntry['destination']) {
            
          const receivedHopCount = parseInt(receivedEntry['hopCount'], 16);
          const routingTableHopCount = parseInt(routingTableEntry['hopCount'], 16);
          if (receivedHopCount + 1 < routingTableHopCount) {
            let hopCount = receivedHopCount + 1;
            routingTable[index]['hopCount'] = hopCount.toString(16).padStart(8, "0");
            routingTable[index]['nextHop'] = ip.toBuffer(rinfo.address).toString('hex');
          }
          found = true;
        }
      });
      // if destination does not exist in routing table
      if (!found) {
          receivedEntry['hopCount'] = (parseInt(receivedEntry['hopCount'], 16) + 1).toString(16).padStart(8, "0");
          routingTable.push(receivedEntry);
      }
    });
  }
});

multicastListener.on('error', (err) => {
  console.log(`multicastListener error:\n${err.stack}`);
  multicastListener.close();
});

/* LISTEN FOR DATA */
dataListener.on('listening', () => {
  const address = dataListener.address();
  console.log(`dataListener listening ${address.address}:${address.port}`);
});

/* WHEN DATA MESSAGE RECEIVED */
dataListener.on('message', (msg, rinfo) => {
  console.log(`dataListener got: ${msg} from ${rinfo.address}:${rinfo.port}`);

  const message = JSON.parse(msg);

  routingTable.forEach((entry) => {
    if (entry['destination'] === message['destination']) {
      dataSender.send(msg, DATA_PORT, entry['nextHop']);
    } else {
      // can't reach the destination so drop the packet
    }
  });

});

dataListener.on('error', (err) => {
  console.log(`dataListener error:\n${err.stack}`);
  dataListener.close();
});


dataListener.bind(DATA_PORT);

multicastListener.bind(MULTICAST_LISTEN_PORT, function() {
  multicastListener.addMembership(MULTICAST_ADDR);
});
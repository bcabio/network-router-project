const dgram = require('dgram');
const ip = require('ip');

const multicastListener = dgram.createSocket('udp4');
const multicastSender = dgram.createSocket('udp4');
const dataListener = dgram.createSocket('udp4');
const cmdArgs = process.argv.slice(2);

const MULTICAST_ADDR = "239.255.255.255";
const SELF_IP = ip.address();

const DATA_PORT = 5000;
const MULTICAST_LISTEN_PORT = 5005;
const MULTICAST_SEND_PORT = 5005;


let routingTable = {
  "routing": "table",
};

/* SEND MULTICAST */
setInterval(function sendMulticast() {
  const message = Buffer.from(JSON.stringify(routingTable));
  console.log(message.toString());
  multicastSender.send(message, 0, message.length, MULTICAST_SEND_PORT, MULTICAST_ADDR);
}, 1000);

/* RECEIVE MULTICAST */
multicastListener.on('listening', () => {
  const address = multicastListener.address();
  console.log(`multicastListener listening ${address.address}:${address.port}`);
});

multicastListener.on('message', (msg, rinfo) => {
  if (rinfo.address != SELF_IP) {
    console.log(`multicastListener got: ${msg} from ${rinfo.address}:${rinfo.port}`);
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

dataListener.on('message', (msg, rinfo) => {
  console.log(`dataListener got: ${msg} from ${rinfo.address}:${rinfo.port}`);
});

dataListener.on('error', (err) => {
  console.log(`dataListener error:\n${err.stack}`);
  dataListener.close();
});




dataListener.bind(DATA_PORT);
multicastListener.bind(MULTICAST_LISTEN_PORT, function() {
  multicastListener.addMembership(MULTICAST_ADDR);
});
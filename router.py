#!./python3/bin/ python3.7

import asyncio
import socket
import sys
import json

# Create a TCP/IP socket
'''
client 1: 102

router : 140
server 1: 122
server 2: 95
'''

'''
python3 router.py router_ip server_1_ip server_2_ip 
'''
MULTICAST_PORT = 520
DATA_PORT = 5000

routing_table = {

}

# Set up data socket to receive messages sent to this IP
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind(('localhost', DATA_PORT))

# Set up multicast socket to receive all messages
mult_recv_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)

mult_recv_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
mult_recv_socket.bind(('', MULTICAST_PORT))



async def receiveMultiCast():
  print('receive multicast')
  await asyncio.sleep(1)
  

async def sendMultiCast():
  print('send multicast')
  await asyncio.sleep(1)

async def listenSocket():
  print('waiting for data')
  data, address = sock.recvfrom(DATA_PORT)

  data_json = json.loads(data.decode('raw_unicode_escape'))

  if data_json:
    next_ip = data_json['received_from']
    server_msg = data_json['message'].encode('raw_unicode_escape')
    
    if routing_table[next_ip]:
      destination_addr = routing_table[next_ip]

      server_sent = sock.sendto(server_msg, destination_addr)

      print('sent %s bytes forward to %s' % (server_sent, address))
    else:
      print('server ip %s not reachable' % (next_ip))

async def main():
  await asyncio.gather(sendMultiCast(), receiveMultiCast(), listenSocket(), loop=True)

if __name__ == "__main__":
  asyncio.run(main())
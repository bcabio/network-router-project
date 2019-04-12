import socket
import sys
import json

# Create a TCP/IP socket
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
'''
client 1: 102
server 1: 122
server 2: 95
router : 140
'''

routing_table = {
  '1': ('192.168.1.122', 10001),
  '2': ('192.168.1.95', 10002),
}

sock.bind(('localhost', 10000))

while True:
  print('\nwaiting to receive message')
  data, address = sock.recvfrom(4096)

  print('received %s bytes from %s' % (len(data), address))
  print(data)

  data_json = json.loads(data)

  # data in JSON format
  # destination
  # message

  if data_json:
    # Forward to servers
    server_num = data_json['destination']
    server_msg = data_json['message']
    destination_addr = routing_table[destination_addr]

    server_sent = sock.sendto(server_msg, destination_addr)

    # sent = sock.sendto(data, address)
    print('sent %s bytes back to %s' % (sent, address))

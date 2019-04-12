import socket
import sys
import json

# Create a TCP/IP socket
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
'''
client 1: 102

router : 140
server 1: 122
server 2: 95
'''

'''
python3 router.py routerip server1ip server2ip 
'''
print(sys.argv)

routing_table = {
  '1': ('192.168.1.' + sys.argv[2], 5005),
  '2': ('192.168.1.' + sys.argv[3], 5005),
}
print('192.168.1.' + sys.argv[1])

sock.bind(('192.168.1.' + sys.argv[1], 5005))

while True:
  print('\nwaiting to receive message')
  data, address = sock.recvfrom(4096)

  print('received %s bytes from %s' % (len(data), address))
  print(data)

  data_json = json.loads(data.decode('raw_unicode_escape'))

  # data in JSON format
  # destination
  # message

  if data_json:
    # Forward to servers
    server_num = data_json['destination']
    server_msg = data_json['message'].encode('raw_unicode_escape')
    destination_addr = routing_table[server_num]

    server_sent = sock.sendto(server_msg, destination_addr)

    # sent = sock.sendto(data, address)
    print('sent %s bytes forward to %s' % (server_sent, address))

import socket
import json
import sys

'''
Use:

python3 client.py last_byte_router_ip destination_num
'''



# Convert IP to hex
def ip2hex(ip):
    ip1 = '-'.join([hex(int(x)+256)[3:] for x in ip.split('.')])
    return ip1


routers_ip = 'localhost'
UDP_PORT = 5005

message = {
    "destination": sys.argv[2],
    "message": "Hello, this is a client message"
}


print("Sending " + json.dumps(message))

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.sendto(json.dumps(message).encode('raw_unicode_escape'), (routers_ip, UDP_PORT))
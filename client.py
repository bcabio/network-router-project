import socket
import json


# Convert IP to hex
def ip2hex(ip):
    ip1 = '-'.join([hex(int(x)+256)[3:] for x in ip.split('.')])
    return ip1


routers_ip = "192.168.1.140"
UDP_PORT = 5005

message = {
    "destination": 1,
    "message": "Hello, this is a client"
}


print("Sending " + json.dumps(message))

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.sendto(json.dumps(message).encode('raw_unicode_escape'), (routers_ip, UDP_PORT))
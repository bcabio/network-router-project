import socket
import json


# Convert IP to hex
def ip2hex(ip):
    ip1 = '-'.join([hex(int(x)+256)[3:] for x in ip.split('.')])
    return ip1


DEST_UDP_IP = "192.168.1.122"
UDP_PORT = 5005

message = {
    "destination": socket.inet_aton(DEST_UDP_IP).hex().upper(),
    "message": "Hello, this is a client"
}


print("Sending " + json.dumps(message))

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.sendto(json.dumps(message).encode('raw_unicode_escape'), (DEST_UDP_IP, UDP_PORT))
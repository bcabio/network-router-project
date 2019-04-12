import socket
import json


UDP_IP = "192.168.1.140"
UDP_PORT = 10000
MESSAGE = b'{"name": "Brian"}'

print(MESSAGE, json.loads(MESSAGE))
print("sending")

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.sendto(MESSAGE, (UDP_IP, UDP_PORT))

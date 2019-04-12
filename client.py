import socket

UDP_IP = "192.168.1.95"
UDP_PORT = 5005
MESSAGE = b'1 hello world'

print("sending")

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.sendto(MESSAGE, (UDP_IP, UDP_PORT))
### Allow acces to NodeMCU USB-port
`sudo chmod 666 /dev/ttyUSB0`

### Flashing the firmware
`esptool.py --port <serial-port-of-ESP8266> write_flash -fm qio 0x00000 <nodemcu-firmware>.bin`

### Upload to NodeMCU
`nodemcu-tool upload --port /dev/ttyUSB0 init.lua --connection-delay 50`

### Access NodeMCU terminal logger
`nodemcu-tool terminal --port /dev/ttyUSB0`

call npm update

del build\js\services\firmware.hex
copy js\services\firmware.hex build\js\services\firmware.hex

call python js\services\hexfirmware2js.py

del build\js\services\firmware.js
copy js\services\firmware.js build\js\services\firmware.js

call grunt shell
call grunt copy
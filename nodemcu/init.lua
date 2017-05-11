-- Defines used modules
local config = require 'config'
local wifimodule = require 'wifimodule'
local socket = require 'socket'
local timer = require 'timer'
local servo = require 'servo'

-- Initializes ESP8266 code, after Wi-Fi initialization
function init()
  -- Initializes socket connection
  local ws = socket.init()

  -- Defines 'global' variables ( local within init() )
  local initFlex = nil
  local initLock = false

  local button = 1
  local isPressed = 1

  local productPrice = nil
  local coinInput = 0
  local inQueue = 0

  -- Defines servo opn GPIO-3 and sets it to a 1-degree angle
  servo.defineServo(3,0,1800)
  servo.setServo(3, 1)

  -- Checks type of socket message to run different functions
  ws:on('receive', function(_, msg)
    local data = cjson.decode(msg)

    -- Sets custom average price and watches coin input afterwards
    if data.type == 'assigned coinbox' then
      productPrice = data.avgPrice

      -- Runs watch function
      watch()
    end
  end)

  -- Runs a setinterval to read analog flex-sensor
  function watch()
    -- Sets interval of 50ms
    timer.setInterval(function()
      local flex = adc.read(0)

      -- Sets idle flex after wifi-initialization, for better accuracy
      if initLock == false then
        initFlex = flex
        print('Initial flex: ' .. initFlex)

        -- Disables initFlex overwriting
        initLock = true
      end

      -- Senses if coin has passed the flex-sensor
      if initFlex - flex >= 10 then
        coinInput = coinInput + 1
        print('Coin! ' .. coinInput)

        -- Sends JSON over websocket when the input coins equals the average price
        if coinInput >= productPrice then
          inQueue = inQueue + 1

          ok, json = pcall(cjson.encode, {
            id = node.chipid(),
            type = 'customer',
            queue = inQueue
          })
          if ok then
            ws:send(json)
          else
            print('Failed to send data')
          end

          coinInput = 0
        end
      end
    end, 50)
  end

  -- Disposes coin tray
  function btnChange()
    if gpio.read(button) < isPressed then
        print('Open coin tray!')
        servo.setServo(3, 70)

        -- Resets initial flex-sensor value
        initFlex = adc.read(0)

        -- Stops watch function
        timer.stop()

        -- Resets queue
        inQueue = 0

        -- Sends data to server via websocket
        ok, json = pcall(cjson.encode, {
          id = node.chipid(),
          type = 'empty coinbox'
        })
        if ok then
          ws:send(json)
        else
          print('Failed to send data')
        end

        -- Resets coin tray
        timer.setTimeout(function()
          print('Close coin tray!')
          servo.setServo(3, 1)

          watch()
        end, 1500)
    end
  end

  -- Initializes button GPIO
  gpio.mode(button, gpio.INT, gpio.PULLUP)
  gpio.trig(button, 'both', btnChange)
end

-- Initilizes Wi-Fi connection
wifimodule.connect(config, init)

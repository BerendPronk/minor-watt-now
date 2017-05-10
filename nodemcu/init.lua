local wifimodule = require 'wifimodule'
local socket = require 'socket'
local config = require 'config'
local timer = require 'timer'
local servo = require 'servo'

function init()
  local ws = socket.init()

  local initFlex = nil
  local initLock = false

  local button = 1
  local isPressed = 1

  local coinAmount = 0

  servo.defineServo(3,0,1800)
  servo.setServo(3, 1)

  timer.setInterval(function()
    local flex = adc.read(0)

    if initLock == false then
      initFlex = flex

      print('Initial flex: ' .. initFlex)

      initLock = true
    end

    if initFlex - flex >= 10 then
      coinAmount = coinAmount + 1
      print('Coin! ' .. coinAmount)

      ok, json = pcall(cjson.encode, {
        id = node.chipid(),
        type = 'customer',
        coins = coinAmount
      })
      if ok then
        ws:send(json)
      else
        print('Failed to send data')
      end

      -- if (coinAmount == 3) then
      --   coinAmount = 0
      --
      --   servo.setServo(3, 70)
      --
      --   timer.setTimeout(function()
      --     servo.setServo(3, 1)
      --   end, 1500)
      -- end
    end
  end, 50)

  -- Dispose coin tray
  function btnChange()
    if gpio.read(button) < isPressed then
        print('Open coin tray!')

        servo.setServo(3, 70)

        -- Reset coin tray
        timer.setTimeout(function()
          print('Close coin tray!')
          servo.setServo(3, 1)
        end, 1500)
    end
  end

  -- Initialize button GPIO
  gpio.mode(button, gpio.INT, gpio.PULLUP)
  gpio.trig(button, 'both', btnChange)
end

-- Initilize Wi-fi connection
wifimodule.connect(config, init)

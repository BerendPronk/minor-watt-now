local config = require 'config'
local module = {}

module.init = function ()
  -- Creates socket connection
  local ws = websocket.createClient()

  -- On successful connection with socket
  ws:on('connection', function(ws)
    print('[WebSocket] Connected!')

    ok, json = pcall(cjson.encode, {
      id = node.chipid(),
      type = 'participate'
    })
    if ok then
      ws:send(json)
    else
      print('[WebSocket] Failed to encode JSON!')
    end
  end)

  -- Error handling
  ws:on('close', function(_, status)
    print('[WebSocket] Connection closed.', status)
    ws = nil
  end)

  -- Connects to websocket from the address given in config.lua
  print('[WebSocket] Connecting to ws at ws://' .. config.address .. ':' .. config.port .. '...')
  ws:connect('ws://' .. config.address .. ':' .. config.port)

  return ws
end

return module

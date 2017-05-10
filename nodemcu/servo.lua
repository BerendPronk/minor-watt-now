local servo = {}

function servo.defineServo (pin, left, right)
  if not servoleft then
    servoleft = {}
  end
  if not servoright then
    servoright = {}
  end
  if not servotimer then
    servotimer = {}
  end
  servoleft[pin] = left
  servoright[pin] = right
  servotimer[pin] = 2+#servotimer
  gpio.mode(pin,gpio.OUTPUT)
end

function servo.setServovalue (pin, svalue)
  local cnt = 25
  local tmrnum
  if not servotimer or not servotimer[pin] then
    tmrnum = 2
  else
    tmrnum = servotimer[pin]
  end
  servovalue = math.min(2000,math.max(svalue,0))
  tmr.alarm(tmrnum,20,1,function()
    if servovalue and servovalue>0 then
      gpio.write(pin, gpio.HIGH)
      tmr.delay(servovalue)
      gpio.write(pin, gpio.LOW)
    end
    cnt = cnt-1
    if cnt<=0 then
      tmr.stop(tmrnum)
    end
  end)
end

function servo.setServo (pin, angle)
  local servovalue
  if servoleft[pin] and servoright[pin] then
    servovalue = (servoright[pin]-servoleft[pin])/180*angle+servoleft[pin]
  else
    servovalue = 2000/180*angle
  end
  servo.setServovalue(pin,servovalue)
end

return servo

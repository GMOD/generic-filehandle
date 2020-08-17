// Thanks! https://github.com/mafintosh/speedometer
let tick = 1
const maxTick = 65535
const resolution = 4
const inc = function () {
  tick = (tick + 1) & maxTick
}

const timer = setInterval(inc, (1000 / resolution) | 0)
if (timer.unref) {
  timer.unref()
}

export default function speedometer(seconds) {
  const size = resolution * (seconds || 5)
  const buffer = [0]
  let pointer = 1
  let last = (tick - 1) & maxTick

  return function (delta) {
    let dist = (tick - last) & maxTick
    if (dist > size) {
      dist = size
    }
    last = tick

    while (dist--) {
      if (pointer === size) {
        pointer = 0
      }
      buffer[pointer] = buffer[pointer === 0 ? size - 1 : pointer - 1]
      pointer++
    }

    if (delta) {
      buffer[pointer - 1] += delta
    }

    const top = buffer[pointer - 1]
    const btm = buffer.length < size ? 0 : buffer[pointer === size ? 0 : pointer]

    return buffer.length < resolution ? top : ((top - btm) * resolution) / buffer.length
  }
}

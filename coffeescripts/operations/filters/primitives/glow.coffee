###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Filter = require "../filter.coffee"
class PrimitiveGlowFilter extends Filter
  constructor: (options = {}) ->
    super
    @setColorToAdd options.r, options.g, options.b

  apply: (imageData) ->
    w = imageData.width
    h = imageData.height

    for x in [0...w]
      for y in [0...h]
        index = (w * y + x) * 4

        x01 = x / w
        y01 = y / h

        nx = (x01 - 0.5) / 0.75
        ny = (y01 - 0.5) / 0.75

        scalarX = nx * nx
        scalarY = ny * ny
        d = 1 - (scalarX + scalarY)
        d = Math.min(Math.max(d, 0.1), 1.0)

        imageData.data[index] = imageData.data[index] * (d * @colorToAdd[0])
        imageData.data[index + 1] = imageData.data[index + 1] * (d * @colorToAdd[1])
        imageData.data[index + 2] = imageData.data[index + 2] * (d * @colorToAdd[2])
        imageData.data[index + 3] = 255
    imageData

  setColorToAdd: (r, g, b) ->
    @colorToAdd = [
      if typeof r is 'number' then r else 1.0,
      if typeof g is 'number' then g else 1.0,
      if typeof b is 'number' then b else 1.0,
    ]

module.exports = PrimitiveGlowFilter

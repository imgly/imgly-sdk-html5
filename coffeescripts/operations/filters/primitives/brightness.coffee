###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Filter = require "../filter.coffee"
class PrimitiveBrightnessFilter extends Filter
  constructor: (options = {}) ->
    super
    @setBrightness options.brightness

  apply: (imageData) ->
    w = imageData.width
    h = imageData.height

    for x in [0...w]
      for y in [0...h]
        index = (w * y + x) * 4

        imageData.data[index] = Math.min(imageData.data[index] + @brightness * 255, 255)
        imageData.data[index + 1] = Math.min(imageData.data[index + 1] + @brightness * 255, 255)
        imageData.data[index + 2] = Math.min(imageData.data[index + 2] + @brightness * 255, 255)
        imageData.data[index + 3] = 255
    imageData

  setBrightness: (brightness) ->
    @brightness = if typeof brightness is 'number' then brightness else 0.0

module.exports = PrimitiveBrightnessFilter

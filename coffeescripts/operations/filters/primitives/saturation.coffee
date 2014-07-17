###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Filter = require "../filter.coffee"
class PrimitiveSaturationFilter extends Filter
  constructor: (@app, options = {}) ->
    super
    if options.saturation?
      @setSaturation options.saturation

  setSaturation: (saturation) ->
    @saturation = if typeof saturation is 'number' then saturation + 1 else 1

  apply: (imageData) ->
    w = imageData.width
    h = imageData.height

    for x in [0...w]
      for y in [0...h]
        index = (w * y + x) * 4

        luminance = imageData.data[index] * 0.2125 + imageData.data[index + 1] * 0.7154 + imageData.data[index + 2] * 0.0721
        imageData.data[index] = luminance * (1 - @saturation) + (imageData.data[index] * @saturation)
        imageData.data[index + 1] = luminance * (1 - @saturation) + (imageData.data[index + 1] * @saturation)
        imageData.data[index + 2] = luminance * (1 - @saturation) + (imageData.data[index + 2] * @saturation)
        imageData.data[index + 3] = 255
    imageData

module.exports = PrimitiveSaturationFilter

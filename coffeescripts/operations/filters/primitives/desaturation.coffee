###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Filter = require "../filter.coffee"
class PrimitiveDesaturationFilter extends Filter
  constructor: (@app, options = {}) ->
    super

    @desaturation ?= options?.desaturation

  apply: (imageData) ->
    w = imageData.width
    h = imageData.height

    for x in [0...w]
      for y in [0...h]
        index = (w * y + x) * 4

        luminance = imageData.data[index] * 0.3 + imageData.data[index + 1] * 0.59 + imageData.data[index + 2] * 0.11
        imageData.data[index] = luminance * (1 - @desaturation) + (imageData.data[index] * @desaturation)
        imageData.data[index + 1] = luminance * (1 - @desaturation) + (imageData.data[index + 1] * @desaturation)
        imageData.data[index + 2] = luminance * (1 - @desaturation) + (imageData.data[index + 2] * @desaturation)
        imageData.data[index + 3] = 255
    imageData

module.exports = PrimitiveDesaturationFilter

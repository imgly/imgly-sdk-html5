###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Filter = require "../filter.coffee"
class PrimitiveContrastFilter extends Filter
  constructor: (@app, options = {}) ->
    super
    @setContrast options.contrast

  apply: (imageData) ->
    w = imageData.width
    h = imageData.height

    for x in [0...w]
      for y in [0...h]
        index = (w * y + x) * 4

        if @contrast > 0
          imageData.data[index]     = (imageData.data[index] - 128) / (1 - @contrast) + 128
          imageData.data[index + 1] = (imageData.data[index + 1] - 128) / (1 - @contrast) + 128
          imageData.data[index + 2] = (imageData.data[index + 2] - 128) / (1 - @contrast) + 128
          imageData.data[index + 3] = 255
        else
          imageData.data[index]     = (imageData.data[index] - 128) * (1 + @contrast) + 128
          imageData.data[index + 1] = (imageData.data[index + 1] - 128) * (1 + @contrast) + 128
          imageData.data[index + 2] = (imageData.data[index + 2] - 128) * (1 + @contrast) + 128
          imageData.data[index + 3] = 255
    imageData

  setContrast: (contrast) ->
    @contrast = if typeof contrast is 'number' then contrast else 1.0

module.exports = PrimitiveContrastFilter

###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Filter = require "../filter.coffee"
class PrimitiveGobblinFilter extends Filter
  apply: (imageData) ->
    w = imageData.width
    h = imageData.height

    for x in [0...w]
      for y in [0...h]
        index = (w * y + x) * 4

        imageData.data[index + 2] = imageData.data[index + 1] * 0.33
        imageData.data[index] = imageData.data[index] * 0.6
        imageData.data[index + 2] += imageData.data[index] * 0.33
        imageData.data[index + 1] = imageData.data[index + 1] * 0.7
        imageData.data[index + 3] = 255
    imageData

module.exports = PrimitiveGobblinFilter

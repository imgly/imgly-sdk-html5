###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
ToneCurve = require "./primitives/tonecurve.coffee"
class CelsiusFilter extends ToneCurve
  @preview: 'celsius.png'
  @displayName: 'Celsius'

  redControlPoints: [
    [0, 69 / 255],
    [55 / 255, 110 / 255],
    [202 / 255, 230 / 255],
    [1, 1]
  ]
  greenControlPoints: [
    [0, 44 / 255],
    [89 / 255, 93 / 255],
    [185 / 255, 141 / 255],
    [1, 189 / 255]
  ]
  blueControlPoints: [
    [0, 76 / 255],
    [39 / 255, 82 / 255],
    [218 / 255, 138 / 255],
    [1, 171 / 255]
  ]

module.exports = CelsiusFilter

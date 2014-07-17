###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
ToneCurve = require "./primitives/tonecurve.coffee"
class ChestFilter extends ToneCurve
  @preview: 'chest.png'
  @displayName: 'Chest'

  redControlPoints: [
    [0, 0],
    [44 / 255, 44 / 255],
    [124 / 255, 143 / 255],
    [221 / 255, 204 / 255],
    [1, 1]
  ]
  greenControlPoints: [
    [0, 0],
    [130 / 255, 127 / 255],
    [213 / 255, 199 / 255],
    [1, 1]
  ]
  blueControlPoints: [
    [0, 0],
    [51 / 255, 52 / 255],
    [219 / 255, 204 / 255],
    [1, 1]
  ]

module.exports = ChestFilter

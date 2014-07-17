###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
ToneCurve  = require "./primitives/tonecurve.coffee"
class FridgeFilter extends ToneCurve
  @preview: "fridge.png"
  @displayName: "Fridge"

  redControlPoints: [
    [0, 9 / 255],
    [21 / 255, 11 / 255],
    [45 / 255, 24 / 255],
    [1, 220 / 255]
  ]
  greenControlPoints: [
    [0, 12 / 255],
    [21 / 255, 21 / 255],
    [42 / 255, 42 / 255],
    [150 / 255, 150 / 255],
    [170 / 255, 173 / 255],
    [1, 210 / 255]
  ]
  blueControlPoints: [
    [0, 28 / 255],
    [43 / 255, 72 / 255],
    [128 / 255, 185 / 255],
    [1, 220 / 255]
  ]

module.exports = FridgeFilter

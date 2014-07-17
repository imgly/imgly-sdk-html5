###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
ToneCurve = require "./primitives/tonecurve.coffee"
class MellowFilter extends ToneCurve
  @preview: 'mellow.png'
  @displayName: 'Mellow'

  redControlPoints: [
    [0, 0],
    [41 / 255, 84 / 255],
    [87 / 255, 134 / 255],
    [1, 1]
  ]
  greenControlPoints: [
    [0, 0],
    [1, 216 / 255]
  ]
  blueControlPoints: [
    [0, 0],
    [1, 131 / 255]
  ]

module.exports = MellowFilter

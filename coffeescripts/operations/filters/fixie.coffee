###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
ToneCurve = require "./primitives/tonecurve.coffee"
class FixieFilter extends ToneCurve
  @preview: 'fixie.png'
  @displayName: 'Fixie'

  redControlPoints: [
    [0, 0],
    [44 / 255, 28 / 255],
    [63 / 255, 48 / 255],
    [128 / 255, 132 / 255],
    [235 / 255, 248 / 255],
    [1, 1]
  ]
  greenControlPoints: [
    [0, 0],
    [20 / 255, 10 / 255],
    [60 / 255, 45 / 255],
    [190 / 255, 209 / 255],
    [211 / 255, 231 / 255],
    [1, 1]
  ]
  blueControlPoints: [
    [0, 31 / 255],
    [41 / 255, 62 / 255],
    [150 / 255, 142 / 255],
    [234 / 255, 212 / 255],
    [1, 224 / 255]
  ]

module.exports = FixieFilter

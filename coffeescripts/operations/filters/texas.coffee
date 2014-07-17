###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
ToneCurve = require "./primitives/tonecurve.coffee"
class TexasFilter extends ToneCurve
  @preview: 'texas.png'
  @displayName: 'Texas'

  redControlPoints: [
    [0, 72 / 255],
    [89 / 255, 99 / 255],
    [176 / 255, 212 / 255],
    [1, 237 / 255]
  ]
  greenControlPoints: [
    [0, 49 / 255],
    [1, 192 / 255]
  ]
  blueControlPoints: [
    [0, 72 / 255],
    [1, 151 / 255]
  ]

module.exports = TexasFilter

###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
ToneCurve = require "./primitives/tonecurve.coffee"
class FrontFilter extends ToneCurve
  @preview: 'front.png'
  @displayName: 'Front'

  redControlPoints: [
    [0, 65 / 255],
    [28 / 255, 67 / 255],
    [67 / 255, 113 / 255],
    [125 / 255, 183 / 255],
    [187 / 255, 217 / 255],
    [1, 229 / 255]
  ]
  greenControlPoints: [
    [0, 52 / 255],
    [42 / 255, 59 / 255],
    [104 / 255, 134 / 255],
    [169 / 255, 209 / 255],
    [1, 240 / 255]
  ]
  blueControlPoints: [
    [0, 52 / 255],
    [65 / 255, 68 / 255],
    [93 / 255, 104 / 255],
    [150 / 255, 153 / 255],
    [1, 198 / 255]
  ]

module.exports = FrontFilter

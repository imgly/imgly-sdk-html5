###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
ToneCurve = require "./primitives/tonecurve.coffee"

controlPoints = [
  [0, 0],
  [87 / 255, 20 / 255],
  [131 / 255, 156 / 255],
  [183 / 255, 205 / 255],
  [1, 183 / 208]
]

class LomoFilter extends ToneCurve
  @preview: 'lomo.png'
  @displayName: 'Lomo'

  redControlPoints: controlPoints
  greenControlPoints: controlPoints
  blueControlPoints: controlPoints

module.exports = LomoFilter

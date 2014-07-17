###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Filter = require "./filter.coffee"
ToneCurve = require "./primitives/tonecurve.coffee"
Desaturation = require "./primitives/desaturation.coffee"
class OrchidFilter extends Filter
  @preview: "orchid.png"
  @displayName: "Orchid"

  apply: (new ToneCurve @app,
    redControlPoints: [
      [0, 0],
      [115 / 255, 130 / 255],
      [195 / 255, 215 / 255],
      [1, 1]
    ]
    greenControlPoints: [
      [0, 0],
      [148 / 255, 153 / 255],
      [172 / 255, 215 / 255],
      [1, 1]
    ]
    blueControlPoints: [
      [0, 46 / 255],
      [58 / 255, 75 / 255],
      [178 / 255, 205 / 255],
      [1, 1]
    ]
  ).compose(ToneCurve,
    rgbControlPoints: [
      [0, 0],
      [117 / 255, 151 / 255],
      [189 / 255, 217 / 255],
      [1, 1]
    ]
  ).compose(Desaturation, desaturation: 0.65)

module.exports = OrchidFilter

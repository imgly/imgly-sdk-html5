###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Filter    = require "./filter.coffee"
Glow      = require "./primitives/glow.coffee"
ToneCurve = require "./primitives/tonecurve.coffee"
class SemiRedFilter extends Filter
  @preview: 'semired.png'
  @displayName: 'SemiRed'

  apply: (new ToneCurve @app,
      redControlPoints: [
        [0, 129 / 255],
        [75 / 255, 153 / 255],
        [181 / 255, 227 / 255],
        [1, 1]
      ]
      greenControlPoints: [
        [0, 8 / 255],
        [111 / 255, 85 / 255],
        [212 / 255, 158 / 255],
        [1, 226 / 255]
      ]
      blueControlPoints: [
        [0, 5 / 255],
        [75 / 255, 22 / 255],
        [193 / 255, 90 / 255],
        [1, 229 / 255]
      ]
    ).compose(Glow)

module.exports = SemiRedFilter

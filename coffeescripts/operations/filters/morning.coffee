###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Filter    = require "./filter.coffee"
Glow      = require "./primitives/glow.coffee"
ToneCurve = require "./primitives/tonecurve.coffee"
class MorningFilter extends Filter
  @preview: 'morning.png'
  @displayName: 'Morning'

  apply: (new ToneCurve @app,
      redControlPoints: [
        [0, 40 / 255],
        [1, 230 / 255]
      ]
      greenControlPoints: [
        [0, 10 / 255],
        [1, 225 / 255]
      ]
      blueControlPoints: [
        [0, 20 / 255],
        [1, 181 / 255]
      ]
    ).compose(Glow)

module.exports = MorningFilter

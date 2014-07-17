###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Filter     = require "./filter.coffee"
Saturation = require "./primitives/saturation.coffee"
Contrast   = require "./primitives/contrast.coffee"
class FoodFilter extends Filter
  @preview: 'food.png'
  @displayName: 'Food'

  apply: (new Saturation @app, saturation: 0.35).compose(Contrast, contrast: 0.1)

module.exports = FoodFilter

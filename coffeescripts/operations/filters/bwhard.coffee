###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Filter    = require "./filter.coffee"
Grayscale = require "./primitives/grayscale.coffee"
Contrast  = require "./primitives/contrast.coffee"
class BWHardFilter extends Filter
  @preview: '1920.png'
  @displayName: '1920'

  apply: (new Grayscale).compose(Contrast, contrast: 0.5)

module.exports = BWHardFilter

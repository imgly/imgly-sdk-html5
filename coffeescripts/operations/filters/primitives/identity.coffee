###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Filter = require "../filter.coffee"
class PrimitiveIdentityFilter extends Filter
  apply: (imageData) -> imageData

module.exports = PrimitiveIdentityFilter

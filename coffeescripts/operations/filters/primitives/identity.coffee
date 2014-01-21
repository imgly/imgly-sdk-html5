###
  imglyKit
  Copyright (c) 2013 img.ly
###
Filter = require "../filter.coffee"
class PrimitiveIdentityFilter extends Filter
  apply: (imageData) -> imageData

module.exports = PrimitiveIdentityFilter

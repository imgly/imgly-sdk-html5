###
  imglyKit
  Copyright (c) 2013 img.ly
###
IdentityFilter = require "./primitives/identity.coffee"
class DefaultFilter extends IdentityFilter
  @preview: 'default.png'
  @displayName: 'Default'

module.exports = DefaultFilter

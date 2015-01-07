###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Utils         = require "../utils.coffee"
Vector2       = require "../math/vector2.coffee"
CropOperation = require "./crop.coffee"


class SocialNetworkResizeOperation extends CropOperation
  calculateRatio: (size) ->
    switch size
      when "facebook"
        @options.ratio = 4 / 3
      when "twitter"
        @options.ratio = 2 / 1
      when "linkedin"
        @options.ratio = 18 / 11
      when "instagram"
        @options.ratio = 1 / 1
      when "pinterest"
        @options.ratio = 1 / 1
    return

module.exports = SocialNetworkResizeOperation


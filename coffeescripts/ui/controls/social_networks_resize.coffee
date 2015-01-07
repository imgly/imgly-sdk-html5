###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
$       = require "jquery"
Crop    = require "./crop.coffee"
Vector2 = require "../../math/vector2.coffee"
Rect    = require "../../math/rect.coffee"
class UIControlsSocialNetworkResize extends Crop
  displayButtons: true
  minimumCropSize: 50
  singleOperation: true
  ###
    @param {ImglyKit} app
    @param {ImglyKit.UI} ui
    @param {ImglyKit.UI.Controls} controls
  ###
  constructor: (@app, @ui, @controls) ->
    super
    @operationClass = require "../../operations/social_networks_resize.coffee"
    @listItems = [
      {
        name: "Facebook"
        cssClass: "facebook"
        method: "setSize"
        arguments: ["facebook"]
        tooltip: "Facebook"
        default: true
        options:
          size: "4:3"
      },
      {
        name: "Twitter"
        cssClass: "twitter"
        method: "setSize"
        arguments: ["twitter"]
        tooltip: "Twitter"
        options:
          size: "2:1"
      },
      {
        name: "LinkedIn"
        cssClass: "linkedin"
        method: "setSize"
        arguments: ["linkedin"]
        tooltip: "LinkedIn"
        options:
          size: "18:11"
      },
      {
        name: "Instagram"
        cssClass: "instagram"
        method: "setSize"
        arguments: ["instagram"]
        tooltip: "Instagram"
        options:
          size: "1:1"
      },
      {
        name: "Pinterest"
        cssClass: "pinterest"
        method: "setSize"
        arguments: ["pinterest"]
        tooltip: "Pinterest"
        options:
          size: "1:1"
      }
    ]

module.exports = UIControlsSocialNetworkResize


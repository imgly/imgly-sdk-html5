###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
List = require "./base/list.coffee"
class UIControlsOrientation extends List
  displayButtons: true
  singleOperation: true
  ###
    @param {imglyUtil} app
    @param {imglyUtil.UI} ui
  ###
  constructor: (@app, @ui, @controls) ->
    super
    @operationClass = require "../../operations/orientation.coffee"
    @listItems = [
      {
        name: "Rotate L"
        cssClass: "rotate-l"
        method: "rotateLeft"
        tooltip: "Rotate left"
      },
      {
        name: "Rotate R"
        cssClass: "rotate-r"
        method: "rotateRight"
        tooltip: "Rotate right"
      },
      {
        name: "Flip V"
        cssClass: "flip-v"
        method: "flipVertically"
        tooltip: "Flip vertically"
      },
      {
        name: "Flip H"
        cssClass: "flip-h"
        method: "flipHorizontally"
        tooltip: "Flip horizontally"
      }
    ]

module.exports = UIControlsOrientation

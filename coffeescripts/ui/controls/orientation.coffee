###
  imglyKit
  Copyright (c) 2013 img.ly
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
      },
      {
        name: "Rotate R"
        cssClass: "rotate-r"
        method: "rotateRight"
      },
      {
        name: "Flip V"
        cssClass: "flip-v"
        method: "flipVertically"
      },
      {
        name: "Flip H"
        cssClass: "flip-h"
        method: "flipHorizontally"
      }
    ]

module.exports = UIControlsOrientation

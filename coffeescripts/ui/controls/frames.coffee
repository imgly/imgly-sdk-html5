###
  imglyKit
  Copyright (c) 2013 img.ly
###
List    = require "./base/list.coffee"
Utils   = require "../../utils.coffee"
Vector2 = require "../../math/vector2.coffee"
Rect    = require "../../math/rect.coffee"
class UIControlsFrames extends List
  displayButtons: true
  singleOperation: true
  init: ->
    @createList()

    @operationClass = require "../../operations/frames.coffee"
    options = [
      {
        id: "black"
        name: "Black"
        cssClass: "black"
        method: "setFrameOptions"
        arguments: [
          "black", 0.1
        ]
        default: true
      },
      {
        id: "blackwood"
        name: "Black Wood"
        cssClass: "black-wood"
        method: "setFrameOptions"
        arguments: [
          "blackwood", 0.1
        ]
      },
      {
        id: "dia"
        name: "Dia"
        cssClass: "dia"
        method: "setFrameOptions"
        arguments: [
          "dia", 0.1
        ]
      }
    ]

    for option in options
      ((option) =>
        item = $("<li>")
          .addClass(imglyKit.classPrefix + "controls-item")
          .appendTo @list

        preview = $("<div>")
          .addClass(imglyKit.classPrefix + "controls-frame-preview-" + Utils.dasherize(option.id))
          .appendTo item

        item.click (e) =>
          @handleOptionSelect option, item

        if option.default?
          item.click()
      )(option)

module.exports = UIControlsFrames

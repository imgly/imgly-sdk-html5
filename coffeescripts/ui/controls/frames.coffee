###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
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
        tooltip: "Black"
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
        tooltip: "Black wood"
      },
      {
        id: "dia"
        name: "Dia"
        cssClass: "dia"
        method: "setFrameOptions"
        arguments: [
          "dia", 0.1
        ]
        tooltip: "Dia"
      }
    ]

    for option in options
      ((option) =>
        item = $("<li>")
          .addClass(ImglyKit.classPrefix + "controls-item")
          .appendTo @list

        preview = $("<div>")
          .addClass(ImglyKit.classPrefix + "controls-frame-preview-" + Utils.dasherize(option.id))
          .appendTo item
          
        if option.tooltip?
          preview.attr "title", option.tooltip

        item.click (e) =>
          @handleOptionSelect option, item

        if option.default?
          item.click()
      )(option)

module.exports = UIControlsFrames

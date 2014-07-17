###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
List  = require "./base/list.coffee"
Utils = require "../../utils.coffee"
class UIControlsFilters extends List
  displayButtons: true
  cssClassIdentifier: "filters"
  ###
    Initializes the container
  ###
  init: ->
    @createList()

    for filter in [
      require("../../operations/filters/default.coffee"),
      require("../../operations/filters/k1.coffee"),
      require("../../operations/filters/k2.coffee"),
      require("../../operations/filters/k6.coffee"),
      require("../../operations/filters/kdynamic.coffee"),
      require("../../operations/filters/fridge.coffee"),
      require("../../operations/filters/breeze.coffee"),
      require("../../operations/filters/orchid.coffee"),
      require("../../operations/filters/chest.coffee"),
      require("../../operations/filters/front.coffee"),
      require("../../operations/filters/fixie.coffee"),
      require("../../operations/filters/x400.coffee"),
      require("../../operations/filters/bw.coffee"),
      require("../../operations/filters/bwhard.coffee"),
      require("../../operations/filters/lenin.coffee"),
      require("../../operations/filters/quozi.coffee"),
      require("../../operations/filters/pola669.coffee"),
      require("../../operations/filters/pola.coffee"),
      require("../../operations/filters/food.coffee"),
      require("../../operations/filters/glam.coffee"),
      require("../../operations/filters/celsius.coffee"),
      require("../../operations/filters/texas.coffee"),
      require("../../operations/filters/morning.coffee"),
      require("../../operations/filters/lomo.coffee"),
      require("../../operations/filters/gobblin.coffee"),
      require("../../operations/filters/mellow.coffee"),
      require("../../operations/filters/sunny.coffee"),
      require("../../operations/filters/a15.coffee"),
      require("../../operations/filters/semired.coffee")
    ]
      ((filter) =>
        item = $("<li>")
          .addClass(ImglyKit.classPrefix + "controls-item")
          .appendTo @list

        preview = $("<div>")
          .addClass(ImglyKit.classPrefix + "controls-preview-" + Utils.dasherize(filter.displayName))
          .appendTo item

        item.click (e) =>
          @reset()
          activeClass = ImglyKit.classPrefix + "controls-list-item-active"
          item.addClass activeClass

          @emit "select", operation: filter
      )(filter)

module.exports = UIControlsFilters

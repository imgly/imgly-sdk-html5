###
  imglyKit
  Copyright (c) 2013 img.ly
###
List = require "./base/list.coffee"
class UIControlsOverview extends List
  ###
    @param {imglyKit} app
    @param {imglyKit.UI} ui
    @param {imglyKit.UI.Controls} controls
  ###
  allowMultipleClick: false
  constructor: (@app, @ui, @controls) ->
    super
    @listItems = [
      {
        name: "Filters"
        cssClass: "filters"
        controls: require "./filters.coffee"
      }, {
        name: "Orientation"
        cssClass: "orientation"
        controls: require "./orientation.coffee"
      }, {
        name: "Focus"
        cssClass: "focus"
        controls: require "./focus.coffee"
      }, {
        name: "Crop"
        cssClass: "crop"
        controls: require "./crop.coffee"
        operation: require "../../operations/crop.coffee"
      }, {
        name: "Brightness"
        cssClass: "brightness"
        controls: require "./brightness.coffee"
        operation: require "../../operations/brightness.coffee"
      }, {
        name: "Contrast"
        cssClass: "contrast"
        controls: require "./contrast.coffee"
        operation: require "../../operations/contrast.coffee"
      }, {
        name: "Saturation"
        cssClass: "saturation"
        controls: require "./saturation.coffee"
        operation: require "../../operations/saturation.coffee"
      }, {
        name: "Text"
        cssClass: "text"
        controls: require "./text.coffee"
        operation: require "../../operations/text.coffee"
      }, {
        name: "Frames"
        cssClass: "frames"
        controls: require "./frames.coffee"
        operation: require "../../operations/frames.coffee"
      }
    ]

module.exports = UIControlsOverview

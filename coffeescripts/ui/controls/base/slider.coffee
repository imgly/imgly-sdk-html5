###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Base = require "./base.coffee"
class UIControlsBaseSlider extends Base
  init: ->
    spaceForPlusAndMinus = 60

    width = @controls.getContainer().width()
    width -= @controls.getHeight() * 2 # Button width == Controls height
    width -= spaceForPlusAndMinus

    # Create the slider DOM tree
    @wrapper = $("<div>")
      .addClass(ImglyKit.classPrefix + "controls-wrapper")
      .attr("data-control", @constructor.name)
      .appendTo @controls.getContainer()

    @sliderWrapper = $("<div>")
      .addClass(ImglyKit.classPrefix + "controls-slider-wrapper")
      .width(width)
      .appendTo @wrapper

    @sliderCenterDot = $("<div>")
      .addClass(ImglyKit.classPrefix + "controls-slider-dot")
      .appendTo @sliderWrapper

    @sliderBar = $("<div>")
      .addClass(ImglyKit.classPrefix + "controls-slider-bar")
      .appendTo @sliderWrapper

    @slider = $("<div>")
      .addClass(ImglyKit.classPrefix + "controls-slider")
      .css(left: width / 2)
      .appendTo @sliderWrapper

    ###
      Plus / Minus images
    ###
    $("<div>")
      .addClass(ImglyKit.classPrefix + "controls-slider-plus")
      .appendTo @sliderWrapper

    $("<div>")
      .addClass(ImglyKit.classPrefix + "controls-slider-minus")
      .appendTo @sliderWrapper

    @handleSliderControl()
    @createButtons()

  ###
    Handles slider dragging
  ###
  handleSliderControl: ->
    @sliderWidth = @sliderWrapper.width()

    @slider.mousedown (e) =>
      @lastX = e.clientX
      @currentSliderLeft = parseInt @slider.css("left")

      $(document).mousemove @onMouseMove
      $(document).mouseup @onMouseUp

  ###
    Is called when the slider has been moved

    @param {Integer} left
  ###
  setSliderLeft: (left) ->
    @slider.css left: left

    # Slider is left of center
    if left < @sliderWidth / 2
      barWidth = @sliderWidth / 2 - left
      @sliderBar.css
        left: left
        width: barWidth
    else
      barWidth = left - @sliderWidth / 2
      @sliderBar.css
        left: @sliderWidth / 2
        width: barWidth

    # Normalize to -1 to 1
    normalized = (left - @sliderWidth / 2) / @sliderWidth * 2

    # Set the new value
    @operation[@valueSetMethod].apply @operation, [normalized]
    @app.getPhotoProcessor().renderPreview()

  ###
    Is called when the slider has been pressed and is being dragged

    @param {MouseEvent} e
  ###
  onMouseMove: (e) =>
    curX = e.clientX
    deltaX = curX - @lastX

    sliderLeft = Math.min(Math.max(0, @currentSliderLeft + deltaX), @sliderWidth)

    if sliderLeft < @sliderWidth and sliderLeft > 0
      @lastX = curX
      @currentSliderLeft = sliderLeft

    @setSliderLeft sliderLeft

  ###
    Is called when the slider has been pressed and is being dragged

    @param {MouseEvent} e
  ###
  onMouseUp: (e) =>
    $(document).off "mouseup", @onMouseUp
    $(document).off "mousemove", @onMouseMove

module.exports = UIControlsBaseSlider

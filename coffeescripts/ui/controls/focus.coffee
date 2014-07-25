###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
List            = require "./base/list.coffee"
Utils           = require "../../utils.coffee"
Vector2         = require "../../math/vector2.coffee"

radialOperation = require "../../operations/focus/radial.coffee"
linearOperation = require "../../operations/focus/linear.coffee"

class UIControlsFocus extends List
  displayButtons: true
  ###
    @param {ImglyKit} app
    @param {ImglyKit.UI} ui
    @param {ImglyKit.UI.Controls} controls
  ###
  constructor: (@app, @ui, @controls) ->
    super
    @listItems = [
      {
        name: "Radial"
        cssClass: "radial"
        operation: radialOperation
        tooltip: "Radial blur"
        default: true
      },
      {
        name: "Linear"
        cssClass: "linear"
        operation: linearOperation
        tooltip: "Linear blur"
      }
    ]

  ###
    @params {Object} options
  ###
  updateOptions: (@operationOptions) ->
    @rerenderCanvas()

  ###
    We call this every time we change the options, e.g.
    when the user drags a knob or a crosshair
  ###
  onOptionsUpdated: ->
    @operation.setOptions @operationOptions
    @rerenderCanvas()
    @repositionControls()

    @emit "renderPreview"

  ###
    @param {jQuery.Object} canvasControlsContainer
  ###
  hasCanvasControls: true
  setupCanvasControls: (@canvasControlsContainer) ->
    width  = @canvasControlsContainer.width()
    height = @canvasControlsContainer.height()

    @canvas = $("<canvas>").css(
      width: width
      height: height
    ).appendTo @canvasControlsContainer

    @canvas  = @canvas.get(0)

    @canvas.width = $(@canvas).width()
    @canvas.height = $(@canvas).height()

    @context = @canvas.getContext "2d"

    if window.devicePixelRatio > 1
      @canvas.width *= window.devicePixelRatio
      @canvas.height *= window.devicePixelRatio

  ###
    @param {Object} option
    @param {jQuery.Object} item
  ###
  handleOptionSelect: (option, item) ->
    super
    switch option.operation
      when radialOperation
        @setControlsMode "radial"
      when linearOperation
        @setControlsMode "linear"

    @onOptionsUpdated()

  ###
    @param {String} mode
  ###
  setControlsMode: (mode) ->
    @controlsMode = mode
    @canvasControlsContainer.find("div").remove()

    @knobs = []
    for i in [0..1]
      knob = $("<div>").addClass(ImglyKit.classPrefix + "canvas-knob")
      knob.appendTo @canvasControlsContainer

      @knobs.push knob

    @crosshair = $("<div>").addClass(ImglyKit.classPrefix + "canvas-crosshair")
    @crosshair.appendTo @canvasControlsContainer

    @handleKnobControl()
    @handleCrosshairControl()

  ###
    We call this everytime the user dragged a knob
    or a crosshair to reposition the controls
  ###
  repositionControls: ->
    canvasSize =
      width: @canvasControlsContainer.width()
      height: @canvasControlsContainer.height()

    for i in [0..1]
      knob = @knobs[i]
      position = @operationOptions["controlPoint" + (i + 1) + "Position"]

      knob.css
        left: canvasSize.width  * position.x
        top:  canvasSize.height * position.y

    ###
      Multiply the control points with the canvas
      size to get real pixel information
    ###
    controlPoint1 = new Vector2()
      .copy(@operationOptions.controlPoint1Position)
      .multiplyWithRect(canvasSize)

    controlPoint2 = new Vector2()
      .copy(@operationOptions.controlPoint2Position)
      .multiplyWithRect(canvasSize)

    diff = new Vector2()
      .copy(controlPoint2)
      .substract(controlPoint1)
      .divide(2)

    @crosshair.css
      left: controlPoint1.x + diff.x
      top:  controlPoint1.y + diff.y

  ###
    Handle dragging of the crosshair
  ###
  handleCrosshairControl: ->
    canvasSize = new Vector2(
      @canvasControlsContainer.width(),
      @canvasControlsContainer.height()
    )

    @crosshair.mousedown (e) =>
      lastPos = new Vector2(e.clientX, e.clientY)

      $(document).mousemove (e) =>
        # Get a normalized (0..1) difference between the last
        # mouse position and the current one
        normalizedDiff = new Vector2(e.clientX, e.clientY)
          .substract(lastPos)
          .divide(canvasSize)

        # Calculate new knob positions and check for boundaries
        newKnobPositions = {}
        knobPositions    = {}
        for i in [1..2]
          knobPositions[i] = @operationOptions["controlPoint" + i + "Position"]
          newKnobPositions[i] = new Vector2()
            .copy(knobPositions[i])
            .add(normalizedDiff)

          # Did we reach a boundary? Simply cancel everything
          unless Utils.withinBoundaries(newKnobPositions[i])
            return

        # Apply the new positions
        for i in [1..2]
          knobPositions[i].copy(newKnobPositions[i])

        # Store the current mouse position
        lastPos.set e.clientX, e.clientY

        # Reposition controls etc
        @onOptionsUpdated()

      $(document).mouseup (e) =>
        $(document).off "mousemove"
        $(document).off "mouseup"

  ###
    Handle dragging of the knobs
  ###
  handleKnobControl: ->
    canvasSize = new Vector2(
      @canvasControlsContainer.width(),
      @canvasControlsContainer.height()
    )

    for knob, index in @knobs
      ((knob, index) =>
        knob.mousedown (e) =>
          lastPos = new Vector2(e.clientX, e.clientY)

          $(document).mousemove (e) =>
            # Get a normalized (0..1) difference between the last
            # mouse position and the current one
            normalizedDiff = new Vector2(e.clientX, e.clientY)
              .substract(lastPos)
              .divide(canvasSize)

            # Calculate indexes for our knobs
            currentKnobIndex  = index + 1
            currentKnobPosition  = @operationOptions["controlPoint" + currentKnobIndex + "Position"]

            oppositeKnobIndex = if index is 0 then 2 else 1
            oppositeKnobPosition = @operationOptions["controlPoint" + oppositeKnobIndex + "Position"]

            # Calculate new control point / knob positions
            newKnobPosition = new Vector2()
              .copy(currentKnobPosition)
              .add(normalizedDiff)

            newOppositeKnobPosition = new Vector2()
              .copy(oppositeKnobPosition)
              .substract(normalizedDiff)

            # Boundaries for the knobs
            # Default boundaries are 0 to 1
            unless Utils.withinBoundaries(newKnobPosition) and
              Utils.withinBoundaries(newOppositeKnobPosition)
                return

            # Apply the new positions
            currentKnobPosition.copy  newKnobPosition
            oppositeKnobPosition.copy newOppositeKnobPosition

            # We have updated the options, broadcast them
            @onOptionsUpdated()

            # Store the current mouse position
            lastPos.set e.clientX, e.clientY

          $(document).mouseup =>
            $(document).off "mouseup"
            $(document).off "mousemove"
      )(knob, index)


  ###
    Re-renders the canvas controls
  ###
  rerenderCanvas: ->
    @context.clearRect 0, 0, @canvas.width, @canvas.height
    switch @controlsMode
      when "radial"
        @drawRadialControl()
      when "linear"
        @drawLinearControl()

  ###
    Renders the radial indicator for the currently blurred area
  ###
  drawRadialControl: ->
    controlPoint1 = new Vector2()
      .copy(@operationOptions.controlPoint1Position)
      .multiplyWithRect(@canvas)

    controlPoint2 = new Vector2()
      .copy(@operationOptions.controlPoint2Position)
      .multiplyWithRect(@canvas)

    halfDiff = new Vector2()
      .copy(controlPoint2)
      .substract(controlPoint1)
      .divide(2)

    radius  = Math.sqrt(Math.pow(halfDiff.x, 2) + Math.pow(halfDiff.y, 2))

    center = new Vector2()
      .copy(controlPoint1)
      .add(halfDiff)

    # `color`, `thickness`, `additionalRadius`
    circleProperties = [
      ["#FFFFFF", 2 * (window.devicePixelRatio or 1), 0],
      ["rgba(0, 0, 0, 0.35)", 2 * (window.devicePixelRatio or 1), 2],
      ["rgba(0, 0, 0, 0.35)", 2 * (window.devicePixelRatio or 1), -1]
    ]

    for circle in circleProperties
      @context.beginPath()
      @context.arc center.x, center.y, radius + circle[2], 0, 2 * Math.PI, false
      @context.lineWidth = circle[1]
      @context.strokeStyle = circle[0]
      @context.stroke()
      @context.closePath()

  ###
    Renders the line indicators for the currently blurred area
  ###
  drawLinearControl: ->
    controlPoint1 = new Vector2()
      .copy(@operationOptions.controlPoint1Position)
      .multiplyWithRect(@canvas)

    controlPoint2 = new Vector2()
      .copy(@operationOptions.controlPoint2Position)
      .multiplyWithRect(@canvas)

    controlPoints = [controlPoint1, controlPoint2]

    diff = new Vector2()
      .copy(controlPoint2)
      .substract(controlPoint1)

    diagonal = Math.sqrt(Math.pow(@canvas.width, 2) + Math.pow(@canvas.height, 2))

    # We need to draw two lines
    for point in [0..1]
      controlPoint = controlPoints[point]

      # Each line consists of 3 lines, two shadow line and one
      # solid white line
      # `color`, `thickness`, `offset`
      lines = [
        ["#FFFFFF", 2 * (window.devicePixelRatio or 1), 0],
        ["rgba(0, 0, 0, 0.35)", 2 * (window.devicePixelRatio or 1), 2],
        ["rgba(0, 0, 0, 0.35)", 2 * (window.devicePixelRatio or 1), -1]
      ]
      for line in lines
        # Top line
        @context.beginPath()
        @context.moveTo controlPoint.x + diff.y * diagonal + line[2], controlPoint.y - diff.x * diagonal + line[2]
        @context.lineTo controlPoint.x - diff.y * diagonal + line[2], controlPoint.y + diff.x * diagonal + line[2]
        @context.strokeStyle = line[0]
        @context.lineWidth = line[1]
        @context.stroke()
        @context.closePath()

module.exports = UIControlsFocus

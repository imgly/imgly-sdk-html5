###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Focus   = require "./focus.coffee"
Vector2 = require "../../math/vector2.coffee"
class LinearFocus extends Focus
  ###
    @param {ImglyKit} app
    @param {CanvasRenderingContext2d} context
    @param {Object} options
  ###
  constructor: (@app, @options={}) ->
    super
    @options.radius       ?= 5

    # Rectangle options
    @options.controlPoint1Position ?= new Vector2(0.5, 0.4)
    @options.controlPoint2Position ?= new Vector2(0.5, 0.6)

  ###
    @param {HTMLCanvasElement} canvas
    @param {CanvasRenderingContext2d} context
  ###
  drawMask: (canvas, context) ->
    ###
      Multiply the control points with the canvas
      size to get real pixel information
    ###
    controlPoint1 = new Vector2()
      .copy(@options.controlPoint1Position)
      .multiplyWithRect(canvas)

    controlPoint2 = new Vector2()
      .copy(@options.controlPoint2Position)
      .multiplyWithRect(canvas)

    ###
      Calculate the difference between the two points
      and divide it by two
    ###
    halfDiff = new Vector2()
      .copy(controlPoint2)
      .substract(controlPoint1)
      .divide(2)

    ###
      Calculate start and end of the gradient
      We want the gradient to start 50% before
      and 50% after the control points, so that
      the gradient is outside of our control points
    ###
    start = new Vector2()
      .copy(controlPoint1)
      .substract(halfDiff)

    end = new Vector2()
      .copy(controlPoint2)
      .add(halfDiff)

    ###
      Finally draw the gradient
    ###
    gradient = context.createLinearGradient(
      start.x, start.y,
      end.x,   end.y
    )

    gradient.addColorStop 0, '#000000'
    gradient.addColorStop 0.25, '#FFFFFF'
    gradient.addColorStop 0.75, '#FFFFFF'
    gradient.addColorStop 1, '#000000'

    context.fillStyle = gradient
    context.fillRect 0, 0, canvas.width, canvas.height

module.exports = LinearFocus

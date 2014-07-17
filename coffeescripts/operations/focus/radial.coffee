###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###
Focus   = require "./focus.coffee"
Vector2 = require "../../math/vector2.coffee"
class RadialFocus extends Focus
  ###
    @param {ImglyKit} app
    @param {CanvasRenderingContext2d} context
    @param {Object} options
  ###
  constructor: (@app, @options={}) ->
    super
    @options.radius       ?= 5

    # Ellipse options
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
      The of the circle is the center of the two points
    ###
    center = new Vector2()
      .copy(controlPoint1)
      .add(halfDiff)

    innerRadius = Math.sqrt(Math.pow(halfDiff.x, 2) + Math.pow(halfDiff.y, 2))
    outerRadius = innerRadius * 3 / 2

    ###
      Finally draw the gradient
    ###
    gradient = context.createRadialGradient(
      center.x, center.y, outerRadius,
      center.x, center.y, innerRadius
    )

    gradient.addColorStop 0, '#000000'
    gradient.addColorStop 1, '#FFFFFF'

    context.fillStyle = gradient
    context.fillRect 0, 0, canvas.width, canvas.height

module.exports = RadialFocus

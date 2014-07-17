###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###

class Vector2
  constructor: (@x, @y) ->
    @x ?= 0
    @y ?= 0

  ###
    @param {Integer} x
    @param {Integer} y
  ###
  set: (@x, @y) -> return

  ###
    @returns {Vector2} A clone of this vector
  ###
  clone: -> return new Vector2(@x, @y)

  ###
    @param {ImglyKit.Vector2} The vector we want to copy
  ###
  copy: (other) ->
    @x = other.x
    @y = other.y

    return this

  ###
    @param {Integer|Vector2} Minimum value
    @param {Integer|Vector2} Maximum value
  ###
  clamp: (minimum, maximum) ->
    unless minimum instanceof Vector2
      minimum = new Vector2(minimum, minimum)
    unless maximum instanceof Vector2
      maximum = new Vector2(maximum, maximum)

    @x = Math.max(minimum.x, Math.min(maximum.x, @x))
    @y = Math.max(minimum.y, Math.min(maximum.y, @y))

    return this

  ###
    @param {Object|Rect} The object to multiply with. Must have `width` and `height`
  ###
  multiplyWithRect: (multiplier) ->
    @x *= multiplier.width
    @y *= multiplier.height

    return this

  ###
    @param {Integer|Vector2}
  ###
  divide: (divisor) ->
    if divisor instanceof Vector2
      @x /= divisor.x
      @y /= divisor.y
    else
      @x /= divisor
      @y /= divisor

    return this

  ###
    @param {Object|Rect} The object to multiply with. Must have `width` and `height`
  ###
  divideByRect: (divisor) ->
    @x /= divisor.width
    @y /= divisor.height

    return this

  ###
    @param {Integer|Vector2}
  ###
  substract: (subtrahend) ->
    if subtrahend instanceof Vector2
      @x -= subtrahend.x
      @y -= subtrahend.y
    else
      @x -= subtrahend
      @y -= subtrahend

    return this

  ###
    @param {Rect} The object to substract
  ###
  substractRect: (subtrahend) ->
    @x -= subtrahend.width
    @y -= subtrahend.height

    return this

  ###
    @param {Rect} The object to add
  ###
  addRect: (addend) ->
    @x += addend.width
    @y += addend.height

    return this

  ###
    @param {Integer|Vector2}
  ###
  add: (addend) ->
    if addend instanceof Vector2
      @x += addend.x
      @y += addend.y
    else
      @x += addend
      @y += addend

    return this

  toString: -> "Vector2({ x: #{@x}, y: #{@y} })"

module.exports = Vector2

###
  ImglyKit
  Copyright (c) 2013-2014 img.ly
###

class Rect
  constructor: (@x, @y, @width, @height) ->
    @x ?= 0
    @y ?= 0
    @width ?= 0
    @height ?= 0

  ###
    @param {Integer} x
    @param {Integer} y
    @param {Integer} width
    @param {Integer} height
  ###
  set: (@x, @y, @width, @height) -> return

  ###
    @param {Integer} x
    @param {Integer} y
  ###
  setPosition: (@x, @y) -> return

  ###
    @param {Integer} width
    @param {Integer} height
  ###
  setDimensions: (@width, @height) -> return

  ###
    @param {ImglyKit.Rect} The vector we want to copy
  ###
  copy: (other) ->
    @x = other.x
    @y = other.y
    @width = other.width
    @height = other.height

    return this

  toString: -> "Rect({ x: #{@x}, y: #{@y}, width: #{@width}, height: #{@height} })"

module.exports = Rect

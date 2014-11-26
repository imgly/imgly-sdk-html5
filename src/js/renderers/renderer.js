/*jshint unused:false */
"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */
var Vector2 = require("../lib/math/vector2");

/**
 * @class
 * @alias ImglyKit.Renderer
 * @param {Vector2} dimensions
 * @private
 */
function Renderer(dimensions) {
  /**
   * @type {Canvas}
   * @private
   */
  this._canvas = this._createCanvas();

  this.setSize(dimensions);

  /**
   * @type {RenderingContext}
   * @private
   */
  this._context = this._getContext();
}

/**
 * Checks whether this type of renderer is supported in the current environment
 * @abstract
 * @returns {boolean}
 */
Renderer.isSupported = function() {
  /* istanbul ignore next */
  throw new Error("Renderer#isSupported is abstract and not implemented in inherited class.");
};

/**
 * Creates a new canvas
 * @return {Canvas}
 * @private
 */
Renderer.prototype._createCanvas = function() {
  var isBrowser = typeof window !== "undefined";
  if (isBrowser) {
    /* istanbul ignore next */
    return document.createElement("canvas");
  } else {
    var Canvas = require("canvas");
    return new Canvas();
  }
};

/**
 * Returns the current size of the canvas
 * @return {Vector2}
 */
Renderer.prototype.getSize = function() {
  return new Vector2(this._canvas.width, this._canvas.height);
};

/**
 * Sets the canvas dimensions
 * @param {Vector2} dimensions
 */
Renderer.prototype.setSize = function(dimensions) {
  this._canvas.width = dimensions.x;
  this._canvas.height = dimensions.y;
};

/**
 * Gets the rendering context from the Canva
 * @return {RenderingContext}
 * @abstract
 */
Renderer.prototype._getContext = function() {
  /* istanbul ignore next */
  throw new Error("Renderer#_getContext is abstract and not implemented in inherited class.");
};

/**
 * Resizes the current canvas picture to the given dimensions
 * @param  {Vector2} dimensions
 * @return {Promise}
 * @abstract
 */
Renderer.prototype.resizeTo = function(dimensions) {
  /* istanbul ignore next */
  throw new Error("Renderer#resizeTo is abstract and not implemented in inherited class.");
};

/**
 * Draws the given image on the canvas
 * @param  {Image} image
 * @abstract
 */
Renderer.prototype.drawImage = function(image) {
  /* istanbul ignore next */
  throw new Error("Renderer#drawImage is abstract and not implemented in inherited class.");
};

/**
 * Returns the canvas
 * @return {Canvas}
 */
Renderer.prototype.getCanvas = function() {
  return this._canvas;
};

/**
 * To create an {@link ImglyKit.Renderer} class of your own, call this
 * method and provide instance properties and functions.
 * @function
 */
Renderer.extend = require("../lib/extend");

module.exports = Renderer;

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
  this._canvas = this.createCanvas();

  this.setSize(dimensions);

  /**
   * @type {RenderingContext}
   * @private
   */
  this._context = this._getContext();
}

/**
 * A unique string that identifies this renderer
 * @type {String}
 */
Renderer.prototype.identifier = null;

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
 * @param {Number} [width]
 * @param {Number} [height]
 * @return {Canvas}
 * @private
 */
Renderer.prototype.createCanvas = function(width, height) {
  var isBrowser = typeof window !== "undefined";
  var canvas;
  if (isBrowser) {
    /* istanbul ignore next */
    canvas = document.createElement("canvas");
  } else {
    var Canvas = require("canvas");
    canvas = new Canvas();
  }

  // Apply width
  if (typeof width !== "undefined") {
    canvas.width = width;
  }

  // Apply height
  if (typeof height !== "undefined") {
    canvas.height = height;
  }

  return canvas;
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
 * Gets called after the stack has been rendered
 * @param  {Image} image
 */
Renderer.prototype.renderFinal = function() {};

/**
 * Returns the canvas
 * @return {Canvas}
 */
Renderer.prototype.getCanvas = function() {
  return this._canvas;
};

/**
 * Returns the context
 * @return {RenderingContext}
 */
Renderer.prototype.getContext = function() {
  return this._context;
};

/**
 * Sets the current canvas to the given one
 * @param {Canvas} canvas
 */
Renderer.prototype.setCanvas = function(canvas) {
  this._canvas = canvas;
  this._context = this._getContext();
};

/**
 * Sets the current context to the given one
 * @param {RenderingContext2D} context
 */
Renderer.prototype.setContext = function(context) {
  this._context = context;
};

/**
 * To create an {@link ImglyKit.Renderer} class of your own, call this
 * method and provide instance properties and functions.
 * @function
 */
Renderer.extend = require("../lib/extend");

module.exports = Renderer;

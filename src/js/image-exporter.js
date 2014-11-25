"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */
var RenderType = require("./constants").RenderType;

/**
 * @class
 * @alias ImglyKit.ImageExporter
 * @private
 */
var ImageExporter = {};

/**
 * Exports the image from the given canvas with the given options
 * @param  {Canvas} canvas
 * @param  {ImglyKit.RenderType} renderType
 * @param  {ImglyKit.ImageFormat} imageFormat
 * @return {string|image}
 */
ImageExporter.export = function (canvas, renderType, imageFormat) {
  var result = canvas.toDataURL(imageFormat);
  if (renderType == RenderType.IMAGE) {
    var image;

    if (typeof window === "undefined") {
      // Not a browser environment
      var CanvasImage = require("canvas").Image;
      image = new CanvasImage();
    } else {
      image = new Image();
    }

    image.src = result;
    result = image;
  }
  return result;
};

module.exports = ImageExporter;

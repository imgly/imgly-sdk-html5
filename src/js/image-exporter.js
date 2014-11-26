"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */
var Constants = require("./constants");
var RenderType = Constants.RenderType;
var ImageFormat = Constants.ImageFormat;
var Utils = require("./lib/utils");

/**
 * @class
 * @alias ImglyKit.ImageExporter
 * @private
 */
var ImageExporter = {};

ImageExporter.validateSettings = function (renderType, imageFormat) {
  var settings = {
    renderType: renderType,
    imageFormat: imageFormat
  };

  // Validate RenderType
  if ((typeof settings.renderType !== "undefined" && settings.renderType !== null) &&
    Utils.values(RenderType).indexOf(settings.renderType) === -1) {
      throw new Error("Invalid render type: " + settings.renderType);
  } else if (typeof renderType === "undefined") {
    settings.renderType = RenderType.DATA_URL;
  }

  // Validate ImageFormat
  if ((typeof settings.imageFormat !== "undefined" && settings.imageFormat !== null) &&
    Utils.values(ImageFormat).indexOf(settings.imageFormat) === -1) {
      throw new Error("Invalid image format: " + settings.imageFormat);
  } else if (typeof imageFormat === "undefined") {
    settings.imageFormat = ImageFormat.PNG;
  }

  return settings;
};

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

    /* istanbul ignore else  */
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

"use strict";
/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Operation from "./operation";
import PrimitivesStack from "./filters/primitives-stack";
import SaturationPrimitive from "./filters/primitives/saturation";

/**
 * @class
 * @alias ImglyKit.Operations.SaturationOperation
 * @extends ImglyKit.Operation
 */
class SaturationOperation extends Operation {
  constructor (...args) {
    this.availableOptions = {
      saturation: { type: "number", default: 1.0 }
    };

    super(...args);
  }

  /**
   * A unique string that identifies this operation. Can be used to select
   * operations.
   * @type {String}
   */
  get identifier () {
    return "saturation";
  }

  /**
   * Renders the saturation using WebGL
   * @param  {WebGLRenderer} renderer
   * @override
   */
  /* istanbul ignore next */
  _renderWebGL (renderer) {
    this._render(renderer);
  }

  /**
   * Renders the saturation using Canvas2D
   * @param {CanvasRenderer} renderer
   * @override
   */
  _renderCanvas (renderer) {
    this._render(renderer);
  }

  /**
   * Renders the saturation (all renderers supported)
   * @param  {Renderer} renderer
   * @private
   */
  _render (renderer) {
    var stack = new PrimitivesStack();

    stack.add(new SaturationPrimitive({
      saturation: this._options.saturation
    }));

    stack.render(renderer);
  }
}

export default SaturationOperation;

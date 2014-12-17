"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Operation from "./operation";
import PrimitivesStack from "./filters/primitives-stack";
import BrightnessPrimitive from "./filters/primitives/brightness";

/**
 * @class
 * @alias ImglyKit.Operations.BrightnessOperation
 * @extends ImglyKit.Operation
 */
class BrightnessOperation extends Operation {
  constructor (...args) {
    this.availableOptions = {
      brightness: { type: "number", default: 0 }
    };

    super(...args);
  }

  /**
   * A unique string that identifies this operation. Can be used to select
   * operations.
   * @type {String}
   */
  get identifier () {
    return "brightness";
  }

  /**
   * Renders the filter
   * @param  {Renderer} renderer
   * @return {Promise}
   */
  render (renderer) {
    var stack = new PrimitivesStack();

    stack.add(new BrightnessPrimitive({
      brightness: this._options.brightness
    }));

    stack.render(renderer);
  }
}

export default BrightnessOperation;

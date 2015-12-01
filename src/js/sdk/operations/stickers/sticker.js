/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Configurable from '../../lib/configurable'
import Vector2 from '../../lib/math/vector2'

export default class Sticker extends Configurable {
  constructor (operation, options) {
    super(options)
    this._operation = operation
  }
}

Sticker.prototype.availableOptions = {
  image: { type: 'object', required: true },
  position: { type: 'vector2', default: new Vector2(0.5, 0.5) },
  scale: { type: 'vector2', default: new Vector2(1.0, 1.0) },
  anchor: { type: 'vector2', default: new Vector2(0.5, 0.5) },
  pivot: { type: 'vector2', default: new Vector2(0.5, 0.5) },
  rotation: { type: 'number', default: 0 },
  flipHorizontally: { type: 'boolean', default: false },
  flipVertically: { type: 'boolean', default: false },
  adjustments: { type: 'configurable', structure: {
    brightness: { type: 'number', default: 0 },
    saturation: { type: 'number', default: 1 },
    contrast: { type: 'number', default: 1 },
    blur: { type: 'number', default: 0 }
  }}
}

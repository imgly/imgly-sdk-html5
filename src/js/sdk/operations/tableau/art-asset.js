/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Utils from '../../lib/utils'
import Configurable from '../../lib/configurable'

export default class ArtAsset extends Configurable {
  constructor (operation, options) {
    super(options)
    this._operation = operation
    this.id = Utils.getUUID()
  }
}

ArtAsset.prototype.availableOptions = {
  image: { type: 'object', required: true }
}

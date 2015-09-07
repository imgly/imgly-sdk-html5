/*!
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { RenderType, ImageFormat } from './constants'

let PhotoEditorSDK = {}

PhotoEditorSDK.Renderer = require('./lib/renderer')

/**
 * The current version of the SDK
 * @name PhotoEditorSDK.version
 * @internal Keep in sync with package.json
 */
PhotoEditorSDK.version = require('../../../package.json').version

// Exposed classes
PhotoEditorSDK.RenderImage = require('./lib/render-image')
PhotoEditorSDK.Color = require('./lib/color')
PhotoEditorSDK.Filter = require('./operations/filters/filter')
PhotoEditorSDK.Operation = require('./operations/operation')
PhotoEditorSDK.Operations = require('./operations/operations')

PhotoEditorSDK.Filters = require('./operations/filters/filters')

// Exposed constants
PhotoEditorSDK.RenderType = RenderType
PhotoEditorSDK.ImageFormat = ImageFormat
PhotoEditorSDK.Vector2 = require('./lib/math/vector2')
PhotoEditorSDK.EventEmitter = require('./lib/event-emitter')
PhotoEditorSDK.Utils = require('./lib/utils')

export default PhotoEditorSDK

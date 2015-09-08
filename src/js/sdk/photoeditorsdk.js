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
PhotoEditorSDK.WebGLRenderer = require('./renderers/webgl-renderer')
PhotoEditorSDK.CanvasRenderer = require('./renderers/canvas-renderer')
PhotoEditorSDK.Vector2 = require('./lib/math/vector2')
PhotoEditorSDK.EventEmitter = require('./lib/event-emitter')
PhotoEditorSDK.Utils = require('./lib/utils')

PhotoEditorSDK.Operations = require('./operations/')
PhotoEditorSDK.Filters = require('./operations/filters/')

// Exposed constants
PhotoEditorSDK.RenderType = RenderType
PhotoEditorSDK.ImageFormat = ImageFormat

// Exposed helpers
PhotoEditorSDK.extend = require('./lib/extend')

export default PhotoEditorSDK

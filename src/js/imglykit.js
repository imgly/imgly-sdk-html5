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

let ImglyKit = {}

ImglyKit.Renderer = require('./lib/renderer')

/**
 * The current version of the SDK
 * @name ImglyKit.version
 * @internal Keep in sync with package.json
 */
ImglyKit.version = require('../../package.json').version

// Exposed classes
ImglyKit.RenderImage = require('./lib/render-image')
ImglyKit.Color = require('./lib/color')
ImglyKit.Filter = require('./operations/filters/filter')
ImglyKit.Operation = require('./operations/operation')
ImglyKit.Operations = require('./operations/operations')
ImglyKit.Filters = require('./operations/filters/filters')

ImglyKit.UI = {}
ImglyKit.UI.Night = require('./ui/night/ui')
ImglyKit.UI.NightReact = require('./ui/night-react/ui')

// Exposed constants
ImglyKit.RenderType = RenderType
ImglyKit.ImageFormat = ImageFormat
ImglyKit.Vector2 = require('./lib/math/vector2')

// UI
ImglyKit.NightUI = require('./ui/night/ui')
ImglyKit.NightReactUI = require('./ui/night-react/ui')

export default ImglyKit

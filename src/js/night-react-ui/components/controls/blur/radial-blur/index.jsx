/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import RadialBlurControlsComponent from './radial-blur-controls-component'
import RadialBlurCanvasControlsComponent from './radial-blur-canvas-controls-component'

export default {
  canvasControls: RadialBlurCanvasControlsComponent,
  controls: RadialBlurControlsComponent,
  identifier: 'radial-blur',
  getInitialSharedState: (context) => {
    return {
      operationExistedBefore: context.ui.operationExists('radial-blur'),
      operation: context.ui.getOrCreateOperation('radial-blur')
    }
  },
  isSelectable: (ui) => {
    return ui.isOperationSelected('radial-blur')
  }
}

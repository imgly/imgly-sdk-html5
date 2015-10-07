/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import CropControlsComponent from './crop-controls-component'
import CropCanvasControlsComponent from './crop-canvas-controls-component'

export default {
  canvasControls: CropCanvasControlsComponent,
  controls: CropControlsComponent,
  identifier: 'crop',
  getInitialSharedState: (context) => {
    const operationExistedBefore = context.ui.operationExists('crop')
    const operation = context.ui.getOrCreateOperation('crop')
    return {
      operationExistedBefore,
      operation
    }
  },
  isSelectable: (ui) => {
    return ui.isOperationSelected('crop')
  }
}

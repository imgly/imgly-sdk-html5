/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import StickersControlsComponent from './stickers-controls-component'
import StickersCanvasControlsComponent from './stickers-canvas-controls-component'

export default {
  canvasControls: StickersCanvasControlsComponent,
  controls: StickersControlsComponent,
  identifier: 'stickers',
  getInitialSharedState: (context) => {
    const operationExistedBefore = context.ui.operationExists('stickers')
    const operation = context.ui.getOrCreateOperation('stickers')
    const stickers = operation.getStickers()
    operation.setStickers([])

    return {
      operationExistedBefore, operation, stickers,
      stickerDimensions: {}
    }
  },
  isSelectable: (ui) => {
    return ui.isOperationSelected('stickers')
  }
}

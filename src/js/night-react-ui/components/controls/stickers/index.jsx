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

  /**
   * Gets called when the user leaves these controls
   * @this {StickersControlsComponent}
   */
  onExit: function () {
    const { editor } = this.props
    editor.addHistory(
      this.getSharedState('operation'),
      this.getSharedState('initialOptions'),
      this.getSharedState('operationExistedBefore')
    )
  },

  /**
   * Checks if there is something at the given position that
   * would cause the UI to switch to this control on click
   * @param  {Vector2} position
   * @param  {Object} context
   * @return {*}
   */
  clickAtPosition: (position, context) => {
    if (!context.ui.operationExists('stickers')) return false
    const renderer = context.kit.getRenderer()
    const operation = context.ui.getOrCreateOperation('stickers')
    const sticker = operation.getStickerAtPosition(renderer, position)
    if (!sticker) {
      return false
    } else {
      return { selectedSticker: sticker }
    }
  },

  /**
   * Returns the initial state for this control
   * @param  {Object} context
   * @return {Object}
   */
  getInitialSharedState: (context) => {
    const operationExistedBefore = context.ui.operationExists('stickers')
    const operation = context.ui.getOrCreateOperation('stickers')
    const stickers = operation.getStickers()
    const initialOptions = operation.serializeOptions()

    return {
      operationExistedBefore, operation, stickers, initialOptions,
      stickerDimensions: {}
    }
  },

  isSelectable: (ui) => {
    return ui.isOperationSelected('stickers')
  }
}

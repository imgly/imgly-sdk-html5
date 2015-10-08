/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import TextCanvasControlsComponent from './text-canvas-controls-component'
import TextControlsComponent from './text-controls-component'

export default {
  canvasControls: TextCanvasControlsComponent,
  controls: TextControlsComponent,
  identifier: 'text',
  /**
   * Returns the initial state for this control
   * @param  {Object} context
   * @return {Object}
   */
  getInitialSharedState: (context) => {
    const operationExistedBefore = context.ui.operationExists('text')
    const operation = context.ui.getOrCreateOperation('text')
    const texts = operation.getTexts()
    operation.setTexts([])

    return {
      operationExistedBefore, operation, texts
    }
  },
  isSelectable: (ui) => {
    return ui.isOperationSelected('text')
  }
}

/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import FiltersControlsComponent from './filters-controls-component'
import FiltersCanvasControlsComponent from './filters-canvas-controls-component'

export default {
  canvasControls: FiltersCanvasControlsComponent,
  controls: FiltersControlsComponent,
  largeCanvasControls: true,
  identifier: 'filters',
  getInitialSharedState: (context) => {
    const operationExistedBefore = context.ui.operationExists('filters')
    const operation = context.ui.getOrCreateOperation('filters')
    return {
      operationExistedBefore,
      operation
    }
  },
  isSelectable: (ui) => {
    return ui.isOperationSelected('filters')
  }
}

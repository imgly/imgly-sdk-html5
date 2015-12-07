/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import StreetControlsComponent from './street-controls-component'
import ArtCanvasControlsComponent from '../art-canvas-controls-component'

export default {
  canvasControls: ArtCanvasControlsComponent,
  controls: StreetControlsComponent,
  largeCanvasControls: true,
  identifier: 'street',
  icon: 'controls/overview/filters@2x.png',
  label: 'controls.overview.filters',
  getInitialSharedState: (context) => {
    const { ui } = context
    const tableauOperationExists = ui.operationExists('tableau')

    let initialOperation = tableauOperationExists
      ? ui.getOperation('tableau')
      : ui.getOperation('street')

    if (!initialOperation) {
      initialOperation = ui.getOrCreateOperation('tableau')
    }

    const initialOptions = initialOperation
      ? initialOperation.serializeOptions()
      : {}

    return {
      initialOperation,
      operation: initialOperation,
      initialOptions
    }
  },
  isSelectable: (ui) => {
    return true // return ui.isOperationSelected('filters')
  }
}

/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import FrameControlsComponent from './frame-controls-component'

export default {
  canvasControls: null,
  controls: FrameControlsComponent,
  identifier: 'frame',
  icon: 'controls/overview/frame@2x.png',
  label: 'controls.overview.frame',
  getInitialSharedState: (context) => {
    const { ui } = context
    const operationExistedBefore = ui.operationExists('frame')
    const operation = ui.getOrCreateOperation('frame')
    const initialOptions = {
      color: operation.getColor().clone(),
      thickness: operation.getThickness()
    }
    return {
      operation, operationExistedBefore, initialOptions
    }
  },
  isSelectable: (ui) => {
    return ui.isOperationEnabled('frame')
  }
}

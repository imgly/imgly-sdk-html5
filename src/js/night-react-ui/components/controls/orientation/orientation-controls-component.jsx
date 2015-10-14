/** @jsx ReactBEM.createElement **/
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import {
  ReactBEM,
  BaseChildComponent,
  Constants,
  Vector2
} from '../../../globals'
import ScrollbarComponent from '../../scrollbar-component'

export default class OrientationControlsComponent extends BaseChildComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onRotateClick',
      '_onFlipClick',
      '_onBackClick',
      '_onOperationUpdated'
    )

    this._cropOperation = this.context.ui.getOperation('crop')

    this._events = {
      [Constants.EVENTS.OPERATION_UPDATED]: this._onOperationUpdated
    }
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when an operation has been updated
   * @param  {Operation} operation
   * @private
   */
  _onOperationUpdated (operation) {
    if (operation === this._rotationOperation ||
        operation === this._flipOperation) {
      this.forceUpdate()
    }
  }

  /**
   * Gets called when the user clicks the back button
   * @param {Event} e
   * @private
   */
  _onBackClick (e) {
    this.props.onSwitchControls('back')
  }

  /**
   * Gets called when the user clicks a rotation button
   * @param {String} direction
   * @private
   */
  _onRotateClick (direction) {
    const { ui } = this.context
    const operationExistedBefore = ui.operationExists('rotation')
    const rotationOperation = this._getRotationOperation()
    const previousOptions = {
      degrees: rotationOperation.getDegrees()
    }

    const degrees = rotationOperation.getDegrees()
    const additionalDegrees = 90 * (direction === 'left' ? -1 : 1)
    const newDegrees = (degrees + additionalDegrees) % 360
    rotationOperation.setDegrees(newDegrees)
    this._rotateCrop(additionalDegrees)

    const { editor } = this.props
    editor.addHistory(rotationOperation,
      previousOptions,
      operationExistedBefore)

    this._emitEvent(Constants.EVENTS.CANVAS_RENDER)
  }

  /**
   * Gets called when the user clicks a flip button
   * @param {String} direction
   * @private
   */
  _onFlipClick (direction) {
    const { ui } = this.context
    const operationExistedBefore = ui.operationExists('flip')
    const flipOperation = this._getFlipOperation()
    const previousOptions = {
      horizontal: flipOperation.getHorizontal(),
      vertical: flipOperation.getVertical()
    }

    switch (direction) {
      case 'horizontal':
        const horizontal = flipOperation.getHorizontal()
        flipOperation.setHorizontal(!horizontal)
        break
      case 'vertical':
        const vertical = flipOperation.getVertical()
        flipOperation.setVertical(!vertical)
        break
    }

    const { editor } = this.props
    editor.addHistory(flipOperation,
      previousOptions,
      operationExistedBefore)

    this._emitEvent(Constants.EVENTS.CANVAS_RENDER)
  }

  // -------------------------------------------------------------------------- GETTERS

  /**
   * Returns or create the flip operation
   * @return {FlipOperation}
   * @private
   */
  _getFlipOperation () {
    const { ui } = this.context
    this._flipOperation = ui.getOrCreateOperation('flip')
    return this._flipOperation
  }

  /**
   * Returns or create the rotation operation
   * @return {RotationOperation}
   * @private
   */
  _getRotationOperation () {
    const { ui } = this.context
    this._rotationOperation = ui.getOrCreateOperation('rotation')
    return this._rotationOperation
  }

  // -------------------------------------------------------------------------- MISC

  /**
   * Rotates the current crop options by the given degrees
   * @param  {Number} degrees
   * @private
   */
  _rotateCrop (degrees) {
    if (!this._cropOperation) return

    let start = this._cropOperation.getStart().clone()
    let end = this._cropOperation.getEnd().clone()

    const _start = start.clone()
    switch (degrees) {
      case 90:
        start = new Vector2(1.0 - end.y, _start.x)
        end = new Vector2(1.0 - _start.y, end.x)
        break
      case -90:
        start = new Vector2(_start.y, 1.0 - end.x)
        end = new Vector2(end.y, 1.0 - _start.x)
        break
    }

    this._cropOperation.set({ start, end })
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const ui = this.context.ui

    const itemsMap = [
      {
        identifier: 'rotate-l',
        onClick: this._onRotateClick.bind(this, 'left')
      },
      {
        identifier: 'rotate-r',
        onClick: this._onRotateClick.bind(this, 'right')
      },
      null, // gap
      {
        identifier: 'flip-h',
        onClick: this._onFlipClick.bind(this, 'horizontal')
      },
      {
        identifier: 'flip-v',
        onClick: this._onFlipClick.bind(this, 'vertical')
      }
    ]

    const listItems = itemsMap.map((item) => {
      if (item === null) {
        return (<li bem='e:item m:gap' key='gap' />)
      }

      return (<li
        bem='e:item'
        key={item.identifier}>
        <bem specifier='$b:controls'>
          <div bem='$e:button m:withLabel' onClick={item.onClick}>
            <img bem='e:icon' src={ui.getHelpers().assetPath(`controls/orientation/${item.identifier}@2x.png`, true)} />
            <div bem='e:label'>{this._t(`controls.orientation.${item.identifier}`)}</div>
          </div>
        </bem>
      </li>)
    })

    return (<div bem='$b:controls e:table'>
      <div bem='e:cell m:button m:withBorderRight'>
        <div bem='$e:button' onClick={this._onBackClick}>
          <img bem='e:icon' src={ui.getHelpers().assetPath(`controls/back@2x.png`, true)} />
        </div>
      </div>
      <div bem='e:cell m:list'>
        <ScrollbarComponent>
          <ul bem='$e:list'>
            {listItems}
          </ul>
        </ScrollbarComponent>
      </div>
    </div>)
  }
}

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

import { ReactBEM, BaseChildComponent, Vector2 } from '../../../globals'
import DraggableComponent from '../../draggable-component.jsx'

const MIN_DIMENSIONS = new Vector2(50, 50)

export default class CropCanvasControlsComponent extends BaseChildComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onCenterDragStart',
      '_onCenterDrag'
    )

    this._operation = this.getSharedState('operation')

    if (this.props.sharedState) {
      this.setSharedState({
        start: new Vector2(0, 0),
        end: new Vector2(1, 1)
      }, false)
    }
  }

  // -------------------------------------------------------------------------- CENTER DRAGGING

  /**
   * Gets called when the user stars dragging the center
   * @private
   */
  _onCenterDragStart () {
    this._initialStart = this.getSharedState('start').clone()
    this._initialEnd = this.getSharedState('end').clone()
    this._initialCropSize = this._initialEnd.clone().subtract(this._initialStart)
  }

  /**
   * Gets called while the user drags the center
   * @param {Vector2} offset
   * @private
   */
  _onCenterDrag (offset) {
    const { kit } = this.context
    const canvasDimensions = kit.getOutputDimensions()
    const cropDifference = offset.clone().divide(canvasDimensions)

    const minStart = new Vector2(0, 0)
    const maxStart = new Vector2(1, 1)
      .subtract(this._initialCropSize)

    const newStart = this._initialStart.clone()
      .add(cropDifference)
      .clamp(minStart, maxStart)
    const newEnd = newStart.clone()
      .add(this._initialCropSize)

    this.setSharedState({ start: newStart, end: newEnd })
  }

  // -------------------------------------------------------------------------- KNOB DRAGGING

  /**
   * Gets called when the user starts dragging a knob
   * @param {String} optionName
   * @private
   */
  _onKnobDragStart (optionName) {
    this._currentDragOption = optionName
    this._initialDragValue = this.getSharedState(optionName).clone()
  }

  /**
   * Gets called while the user drags a knob
   * @param {String} optionName
   * @param {Vector2} offset
   * @private
   */
  _onKnobDrag (optionName, offset) {
    const start = this.getSharedState('start')
    const end = this.getSharedState('end')

    const { kit } = this.context
    const canvasDimensions = kit.getOutputDimensions()
    const cropDifference = offset.clone().divide(canvasDimensions)
    const newValue = this._initialDragValue.clone().add(cropDifference)

    // Clamp values
    let minValue, maxValue
    switch (optionName) {
      case 'start':
        minValue = new Vector2(0, 0)
        maxValue = end.clone()
          .subtract(
            MIN_DIMENSIONS.clone()
              .divide(canvasDimensions)
          )
        newValue.clamp(minValue, maxValue)
        break
      case 'end':
        minValue = start.clone()
          .add(
            MIN_DIMENSIONS.clone()
              .divide(canvasDimensions)
          )
        maxValue = new Vector2(1, 1)
        newValue.clamp(minValue, maxValue)
        break
    }

    this.setSharedState({ [this._currentDragOption]: newValue })
  }

  // -------------------------------------------------------------------------- MISC

  /**
   * Returns the dimensions according to the currentcrop dimensions
   * @private
   */
  _calculateDimensions () {
    const start = this.getSharedState('start')
    const end = this.getSharedState('end')

    return end.clone()
      .subtract(start)
      .multiply(this.props.editor.getInitialDimensions())
      .round()
  }

  // -------------------------------------------------------------------------- RESIZING / STYLING

  /**
   * Returns the styles (width / height) for the crop areas that define the
   * crop size
   * @return {Object}
   * @private
   */
  _getAreaStyles () {
    const canvasDimensions = this.props.editor.getCanvasDimensions()

    const start = this.getSharedState('start').clone().multiply(canvasDimensions).floor()
    const end = this.getSharedState('end').clone().multiply(canvasDimensions).ceil()
    const size = end.clone().subtract(start)

    return {
      topLeft: this._getDimensionsStyles(start.x, start.y),
      topCenter: this._getDimensionsStyles(size.x, start.y),
      centerLeft: this._getDimensionsStyles(start.x, size.y),
      center: this._getDimensionsStyles(size.x, size.y)
    }
  }

  /**
   * Returns the dimensions style (width / height) for the given dimensions
   * @param {Number} x
   * @param {Number} y
   * @return {Object}
   * @private
   */
  _getDimensionsStyles (x, y) {
    // Table cells and rows can't have a width / height of 0
    return {
      width: Math.max(1, x),
      height: Math.max(1, y)
    }
  }

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const { ui } = this.context
    const areaStyles = this._getAreaStyles()
    const dimensions = this._calculateDimensions()

    return (<div bem='b:canvasControls e:container m:full' ref='container'>
      <div bem='$b:cropCanvasControls'>
        <div bem='e:row'>
          <div bem='e:cell m:dark' style={areaStyles.topLeft} />
          <div bem='e:cell m:dark' style={areaStyles.topCenter} />
          <div bem='e:cell m:dark' />
        </div>
        <div bem='e:row'>
          <div bem='e:cell m:dark' style={areaStyles.centerLeft} />
          <DraggableComponent
            onStart={this._onCenterDragStart}
            onDrag={this._onCenterDrag}>
              <div bem='e:cell m:bordered' style={areaStyles.center}>
                <DraggableComponent
                  onStart={this._onKnobDragStart.bind(this, 'start')}
                  onDrag={this._onKnobDrag.bind(this, 'start')}>
                    <div bem='e:knob m:topLeft $b:knob'>
                      <img bem='e:icon' src={ui.getHelpers().assetPath('controls/knobs/resize-diagonal-down@2x.png', true)} />
                    </div>
                </DraggableComponent>
                <div bem='e:dimensions'>{dimensions.x} x {dimensions.y}</div>
                <DraggableComponent
                  onStart={this._onKnobDragStart.bind(this, 'end')}
                  onDrag={this._onKnobDrag.bind(this, 'end')}>
                    <div bem='e:knob m:bottomRight $b:knob'>
                      <img bem='e:icon' src={ui.getHelpers().assetPath('controls/knobs/resize-diagonal-down@2x.png', true)} />
                    </div>
                </DraggableComponent>
              </div>
          </DraggableComponent>
          <div bem='e:cell m:dark' />
        </div>
        <div bem='e:row'>
          <div bem='e:cell m:dark' />
          <div bem='e:cell m:dark' />
          <div bem='e:cell m:dark' />
        </div>
      </div>
    </div>)
  }
}

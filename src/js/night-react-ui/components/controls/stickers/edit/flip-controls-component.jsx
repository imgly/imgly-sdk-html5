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
import { ReactBEM, Constants } from '../../../../globals'
import ControlsComponent from '../../controls-component'
import ScrollbarComponent from '../../../scrollbar-component'

export default class StickersFlipControlsComponent extends ControlsComponent {
  constructor (...args) {
    super(...args)

    this._selectedSticker = this.getSharedState('selectedSticker')
    this._operation = this.getSharedState('operation')
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the user clicks an item
   * @param  {String} direction
   * @private
   */
  _onItemClick (direction) {
    switch (direction) {
      case 'h':
        this._selectedSticker.setFlipHorizontally(!this._selectedSticker.getFlipHorizontally())
        break
      case 'v':
        this._selectedSticker.setFlipVertically(!this._selectedSticker.getFlipVertically())
        break
    }
    this._operation.setDirty(true)
    this._emitEvent(Constants.EVENTS.CANVAS_RENDER)
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders the list items for this control
   * @return {Array.<ReactBEM.Element>}
   * @private
   */
  _renderListItems () {
    return ['h', 'v']
      .map((direction, i) => {
        return (<li
          bem='e:item'
          key={i}
          onClick={this._onItemClick.bind(this, direction)}>
            <bem specifier='$b:controls'>
              <div bem='$e:button m:withLabel'>
                <img bem='e:icon' src={this._getAssetPath(`controls/orientation/flip-${direction}@2x.png`, true)} />
                <div bem='e:label'>{this._t(`controls.stickers.flip-${direction}`)}</div>
              </div>
            </bem>
        </li>)
      })
  }

  /**
   * Renders the controls of this component
   * @return {ReactBEM.Element}
   */
  renderControls () {
    const listItems = this._renderListItems()

    return (<div bem='e:cell m:list'>
      <ScrollbarComponent>
        <ul bem='$e:list'>
          {listItems}
        </ul>
      </ScrollbarComponent>
    </div>)
  }
}

StickersFlipControlsComponent.identifier = 'flip'

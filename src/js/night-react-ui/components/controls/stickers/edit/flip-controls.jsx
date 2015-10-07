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
import { ReactBEM, BaseChildComponent, Constants } from '../../../../globals'
import ScrollbarComponent from '../../../scrollbar-component'

export default class StickersFlipControlsComponent extends BaseChildComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onBackClick'
    )

    this._selectedSticker = this.getSharedState('selectedSticker')
    this._operation = this.getSharedState('operation')
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the user clicks the back button
   * @param {Event} e
   * @private
   */
  _onBackClick (e) {
    this.props.onSwitchControls('back')
  }

  /**
   * Gets called when the user clicks an item
   * @param  {String} direction
   * @private
   */
  _onItemClick (direction) {
    switch (direction) {
      case 'h':
        this._selectedSticker.flipHorizontally = !this._selectedSticker.flipHorizontally
        break
      case 'v':
        this._selectedSticker.flipVertically = !this._selectedSticker.flipVertically
        break
    }
    this._operation.setDirty(true)
    this._emitEvent(Constants.EVENTS.CANVAS_RENDER)
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const { ui } = this.context
    const listItems = ['h', 'v']
      .map((direction, i) => {
        return (<li
          bem='e:item'
          key={i}
          onClick={this._onItemClick.bind(this, direction)}>
            <bem specifier='$b:controls'>
              <div bem='$e:button m:withLabel'>
                <img bem='e:icon' src={ui.getHelpers().assetPath(`controls/orientation/flip-${direction}@2x.png`, true)} />
                <div bem='e:label'>{this._t(`controls.stickers.flip-${direction}`)}</div>
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

StickersFlipControlsComponent.identifier = 'flip'

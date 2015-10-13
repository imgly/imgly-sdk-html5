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

import { ReactBEM, BaseChildComponent } from '../../../globals'
import FontPreviewComponent from './font-preview-component'

export default class FontComponent extends BaseChildComponent {
  constructor (...args) {
    super(...args)
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the user clicks one one of the list items
   * @param  {Object} font
   * @param  {Event} e
   * @private
   */
  _onListItemClick (font, e) {
    this.props.onChange &&
      this.props.onChange(font)
  }

  // -------------------------------------------------------------------------- LIST ITEMS

  /**
   * Renders the list items
   * @return {Array.<ReactBEM.Element>}
   * @private
   */
  _renderListItems () {
    const { fonts } = this.props

    return fonts.map((font, i) => {
      const isSelected = this.props.fontFamily === font.fontFamily &&
        this.props.fontWeight === font.fontWeight
      const className = isSelected ? 'is-active' : null

      return (<li
        bem='e:item'
        key={i}
        className={className}
        onClick={this._onListItemClick.bind(this, font)} >
          <FontPreviewComponent
            fontFamily={font.fontFamily}
            fontWeight={font.fontWeight} />
          <div bem='e:label'>{font.fontFamily}</div>
      </li>)
    })
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const listItems = this._renderListItems()

    return (<div bem='$b:controls e:overlay m:dark'>
      <ul bem='$b:fontFamily e:list'>
        {listItems}
      </ul>
    </div>)
  }
}

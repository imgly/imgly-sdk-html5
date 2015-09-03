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

import { ReactBEM, React, BaseChildComponent } from '../../../globals'
import ButtonComponent from '../../button-component'

export default class WebcamComponent extends BaseChildComponent {
  renderWithBEM () {
    return (<bem specifier='b:splashScreen'>
      <div bem='e:row m:withContent m:webcam'>
        <div bem='$e:cell m:webcam'>
          <img bem='e:image'
            src={this._getAssetPath('splash/shutter@2x.png', true)} />
          <ButtonComponent bem='e:button'
            onClick={this.props.onClick}>
              {this._t('splash.webcam.button')}
          </ButtonComponent>
          <div bem='e:description'>
            {this._t('splash.webcam.description')}
          </div>
        </div>
      </div>
    </bem>)
  }
}

WebcamComponent.propTypes = {
  onClick: React.PropTypes.func.isRequired
}

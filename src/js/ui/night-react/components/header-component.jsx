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
import { ReactBEM, BaseChildComponent } from '../globals'

export default class SplashScreenComponent extends BaseChildComponent {
  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    return (<div bem='$b:header e:row'>
      <div bem='e:cell'>
        <div bem='e:label'>Photo Editor SDK</div>
      </div>
    </div>)
  }
}

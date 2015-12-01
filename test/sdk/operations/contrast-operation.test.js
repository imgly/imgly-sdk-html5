/* global SpecHelpers, describe, it, beforeEach */
/*
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

let kit

beforeEach(function () {
  kit = SpecHelpers.initRenderer()
})

describe('ContrastOperation', function () {

  describe('#render', function () {

    it('should succeed', function () {
      const operation = kit.createOperation('contrast')
      kit.operationsStack.push(operation)

      return kit.render()
        .should.be
        .fulfilled
    })

  })

})


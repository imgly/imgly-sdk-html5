/* global SpecHelpers, PhotoEditorSDK, describe, it, beforeEach */
/*
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

let kit, image
beforeEach(function () {
  kit = SpecHelpers.initRenderer()
  image = kit.getImage()
})

describe('OrientationOperation', function () {
  describe('with a rotation that\'s not divisible by 90', function () {
    it('should fail', function () {
      const throwable = () => {
        kit.createOperation('orientation', {
          rotation: 45
        })
      }
      throwable.should.throw('OrientationOperation: `rotation` has to be a multiple of 90.')
    })
  })

  describe('#render', function () {
    it('should succeed', function () {
      const operation = kit.createOperation('orientation', {
        rotation: 90
      })
      kit.operationsStack.push(operation)

      return kit.render()
        .should.be.fulfilled
    })

    it('should correctly resize the canvas', function (done) {
      const operation = kit.createOperation('orientation', {
        rotation: 90
      })
      kit.operationsStack.push(operation)

      kit.export(PhotoEditorSDK.RenderType.IMAGE)
        .then(function (result) {
          result.width.should.equal(image.height)
          result.height.should.equal(image.width)
          done()
        })
        .catch(function (err) {
          done(err)
        })
    })
  })
})

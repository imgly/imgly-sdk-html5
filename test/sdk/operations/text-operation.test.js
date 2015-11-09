/* global SpecHelpers, PhotoEditorSDK, describe, it, beforeEach */
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

describe('TextOperation', function () {

  describe('#render', function () {

    describe('with `position` not being an instance of Vector2', function () {

      it('should throw an error', function () {

        var throwable = function () {
          new TextOperation(kit, {
            position: null,
            fontSize: 12,
            fontFamily: 'Impact',
            fontWeight: 'bold',
            color: new PhotoEditorSDK.Color(1.0, 1.0, 1.0, 0.5),
            text: 'foo'
          })
        }
        throwable.should.throw('Operation `text`: Option `position` has to be an instance of PhotoEditorSDK.Vector2.')

      })

    })

    describe('with `alignment` being invalid', function () {

      it('should throw an error', function () {

        var throwable = function () {
          new TextOperation(kit, {
            alignment: 'somewhere?',
            text: 'foo'
          })
        }
        throwable.should.throw('Operation `text`: Invalid value for `alignment` (valid values are: left, center, right)')

      })

    })

    describe('with `verticalAlignment` being invalid', function () {

      it('should throw an error', function () {

        var throwable = function () {
          new TextOperation(kit, {
            verticalAlignment: 'somewhere?',
            text: 'foo'
          })
        }
        throwable.should.throw('Operation `text`: Invalid value for `verticalAlignment` (valid values are: top, center, bottom)')

      })

    })

  })

})

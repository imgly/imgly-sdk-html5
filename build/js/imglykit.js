(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("canvas"));
	else if(typeof define === 'function' && define.amd)
		define(["canvas"], factory);
	else if(typeof exports === 'object')
		exports["ImglyKit"] = factory(require("canvas"));
	else
		root["ImglyKit"] = factory(root["canvas"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_53__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var _lodash = __webpack_require__(1);

	var _lodash2 = _interopRequireDefault(_lodash);

	var _libRenderImage = __webpack_require__(2);

	var _libRenderImage2 = _interopRequireDefault(_libRenderImage);

	var _libImageExporter = __webpack_require__(3);

	var _libImageExporter2 = _interopRequireDefault(_libImageExporter);

	var _libVersionChecker = __webpack_require__(4);

	var _libVersionChecker2 = _interopRequireDefault(_libVersionChecker);

	var _constants = __webpack_require__(5);

	var _libUtils = __webpack_require__(6);

	var _libUtils2 = _interopRequireDefault(_libUtils);

	var VERSION = '2.0.0-beta.13';

	/**
	 * @class
	 * @param {Object} options
	 * @param {Image} [options.image] - The source image
	 * @param {HTMLElement} [options.container] - Specifies where the UI should be
	 *                                          added to. If none is given, the UI
	 *                                          will automatically be disabled.
	 * @param {Boolean} [options.ui.enabled=true] - Enables or disables the UI
	 * @param {Boolean} [options.renderOnWindowResize] - Specifies whether the canvas
	 *                                                 should re-render itself when
	 *                                                 the window is being resized.
	 * @param {String} [options.assetsUrl='assets'] - The base path for all external assets.
	 * @param {String} [options.renderer='webgl'] - The renderer identifier. Can either
	 *                                            be 'webgl' or 'canvas'.
	 */

	var ImglyKit = (function () {
	  function ImglyKit(options) {
	    _classCallCheck(this, ImglyKit);

	    // `options` is required
	    if (typeof options === 'undefined') {
	      throw new Error('No options given.');
	    }

	    // Set default options
	    options = _lodash2['default'].defaults(options, {
	      assetsUrl: 'assets',
	      container: null,
	      renderOnWindowResize: false
	    });
	    options.ui = options.ui || {};
	    options.ui = _lodash2['default'].defaults(options.ui, {
	      enabled: true
	    });

	    if (typeof options.image === 'undefined' && !options.ui.enabled) {
	      throw new Error('`options.image` needs to be set when UI is disabled.');
	    }

	    /**
	     * @type {Object}
	     * @private
	     */
	    this._options = options;

	    /**
	     * The stack of {@link Operation} instances that will be used
	     * to render the final Image
	     * @type {Array.<ImglyKit.Operation>}
	     */
	    this.operationsStack = [];

	    /**
	     * The registered UI types that can be selected via the `ui` option
	     * @type {Object.<String, UI>}
	     * @private
	     */
	    this._registeredUIs = {};

	    // Register the default UIs
	    this._registerUIs();

	    /**
	     * The registered operations
	     * @type {Object.<String, ImglyKit.Operation>}
	     */
	    this._registeredOperations = {};

	    // Register the default operations
	    this._registerOperations();

	    if (typeof window !== 'undefined') {
	      this._versionChecker = new _libVersionChecker2['default'](VERSION);
	    }

	    if (this._options.ui.enabled) {
	      this._initUI();
	      if (this._options.renderOnWindowResize) {
	        this._handleWindowResize();
	      }
	    }
	  }

	  _createClass(ImglyKit, [{
	    key: 'render',

	    /**
	     * Renders the image
	     * @param  {ImglyKit.RenderType} [renderType=ImglyKit.RenderType.DATAURL] - The output type
	     * @param  {ImglyKit.ImageFormat} [imageFormat=ImglyKit.ImageFormat.PNG] - The output image format
	     * @param  {string} [dimensions] - The final dimensions of the image
	     * @param  {Number} [quality] - The image quality, between 0 and 1
	     * @return {Promise}
	     */
	    value: function render(renderType, imageFormat, dimensions, quality) {
	      var _this = this;

	      var settings = _libImageExporter2['default'].validateSettings(renderType, imageFormat);

	      renderType = settings.renderType;
	      imageFormat = settings.imageFormat;

	      // Create a RenderImage
	      var renderImage = new _libRenderImage2['default'](this._options.image, this.operationsStack, dimensions, this._options.renderer);

	      // Set all operations to dirty, since we have another webgl renderer
	      for (var i = 0; i < this.operationsStack.length; i++) {
	        var operation = this.operationsStack[i];
	        if (!operation) {
	          continue;
	        }
	        operation.dirty = true;
	      }

	      // Initiate image rendering
	      return renderImage.render().then(function () {
	        var canvas = renderImage.getRenderer().getCanvas();
	        return _libImageExporter2['default']['export'](_this._options.image, canvas, renderType, imageFormat, quality);
	      });
	    }
	  }, {
	    key: 'reset',

	    /**
	     * Resets all custom and selected operations
	     */
	    value: function reset() {}
	  }, {
	    key: 'getAssetPath',

	    /**
	     * Returns the asset path for the given filename
	     * @param  {String} asset
	     * @return {String}
	     */
	    value: function getAssetPath(asset) {
	      var isBrowser = typeof window !== 'undefined';
	      if (isBrowser) {
	        /* istanbul ignore next */
	        return this._options.assetsUrl + '/' + asset;
	      } else {
	        var path = __webpack_require__(52);
	        return path.resolve(this._options.assetsUrl, asset);
	      }
	    }
	  }, {
	    key: '_handleWindowResize',

	    /**
	     * If `options.renderOnWindowResize` is set to true, this function
	     * will re-render the canvas with a slight delay so that it won't
	     * cause lagging of the resize
	     * @private
	     */
	    value: function _handleWindowResize() {
	      var _this2 = this;

	      var timer = null;
	      window.addEventListener('resize', function () {
	        if (timer !== null) {
	          clearTimeout(timer);
	        }

	        timer = setTimeout(function () {
	          timer = null;
	          _this2.ui.render();
	        }, 300);
	      });
	    }
	  }, {
	    key: '_registerUIs',

	    /**
	     * Registers all default UIs
	     * @private
	     */
	    value: function _registerUIs() {
	      this.registerUI(ImglyKit.NightUI);
	    }
	  }, {
	    key: '_registerOperations',

	    /**
	     * Registers all default operations
	     * @private
	     */
	    value: function _registerOperations() {
	      for (var operationName in ImglyKit.Operations) {
	        this.registerOperation(ImglyKit.Operations[operationName]);
	      }
	    }
	  }, {
	    key: 'registerOperation',

	    /**
	     * Registers the given operation
	     * @param {ImglyKit.Operation} operation - The operation class
	     */
	    value: function registerOperation(operation) {
	      this._registeredOperations[operation.prototype.identifier] = operation;
	      if (this.ui) {
	        this.ui.addOperation(operation);
	      }
	    }
	  }, {
	    key: 'registerUI',

	    /**
	     * Registers the given UI
	     * @param {UI} ui
	     */
	    value: function registerUI(ui) {
	      this._registeredUIs[ui.prototype.identifier] = ui;
	    }
	  }, {
	    key: '_initUI',

	    /**
	     * Initializes the UI
	     * @private
	     */
	    /* istanbul ignore next */
	    value: function _initUI() {
	      var UI;

	      if (this._options.ui.enabled === true) {
	        // Select the first UI by default
	        UI = _libUtils2['default'].values(this._registeredUIs)[0];
	      }

	      if (!UI) {
	        return;
	      }

	      /**
	       * @type {ImglyKit.UI}
	       */
	      this.ui = new UI(this, this._options);
	    }
	  }, {
	    key: 'getOperationFromStack',

	    /**
	     * Returns the Operation instance with the given identifier,
	     * if it exists
	     * @param {String} identifier
	     * @returns {Operation}
	     */
	    value: function getOperationFromStack(identifier) {
	      var operation = this.operationsStack.filter(function (operation) {
	        return operation.identifier === identifier;
	      })[0];
	      return operation;
	    }
	  }, {
	    key: 'run',

	    /**
	     * Runs the UI, if present
	     */
	    value: function run() {
	      if (typeof this.ui !== 'undefined') {
	        this.ui.run();
	      }
	    }
	  }, {
	    key: 'registeredOperations',
	    get: function () {
	      return this._registeredOperations;
	    }
	  }]);

	  return ImglyKit;
	})();

	/**
	 * The current version of the SDK
	 * @name ImglyKit.version
	 * @internal Keep in sync with package.json
	 */
	ImglyKit.version = VERSION;

	// Exposed classes
	ImglyKit.RenderImage = _libRenderImage2['default'];
	ImglyKit.Color = __webpack_require__(7);
	ImglyKit.Filter = __webpack_require__(8);
	ImglyKit.Operation = __webpack_require__(9);
	ImglyKit.Operations = {};
	ImglyKit.Operations.Filters = __webpack_require__(10);
	ImglyKit.Operations.Crop = __webpack_require__(11);
	ImglyKit.Operations.Rotation = __webpack_require__(12);
	ImglyKit.Operations.Saturation = __webpack_require__(13);
	ImglyKit.Operations.Contrast = __webpack_require__(14);
	ImglyKit.Operations.Brightness = __webpack_require__(15);
	ImglyKit.Operations.Flip = __webpack_require__(16);
	ImglyKit.Operations.TiltShift = __webpack_require__(17);
	ImglyKit.Operations.RadialBlur = __webpack_require__(18);
	ImglyKit.Operations.Text = __webpack_require__(19);
	ImglyKit.Operations.Stickers = __webpack_require__(20);
	ImglyKit.Operations.Frames = __webpack_require__(21);

	ImglyKit.Filters = {};
	ImglyKit.Filters.A15 = __webpack_require__(22);
	ImglyKit.Filters.Breeze = __webpack_require__(23);
	ImglyKit.Filters.BW = __webpack_require__(24);
	ImglyKit.Filters.BWHard = __webpack_require__(25);
	ImglyKit.Filters.Celsius = __webpack_require__(26);
	ImglyKit.Filters.Chest = __webpack_require__(27);
	ImglyKit.Filters.Fixie = __webpack_require__(28);
	ImglyKit.Filters.Food = __webpack_require__(29);
	ImglyKit.Filters.Fridge = __webpack_require__(30);
	ImglyKit.Filters.Front = __webpack_require__(31);
	ImglyKit.Filters.Glam = __webpack_require__(32);
	ImglyKit.Filters.Gobblin = __webpack_require__(33);
	ImglyKit.Filters.K1 = __webpack_require__(34);
	ImglyKit.Filters.K2 = __webpack_require__(35);
	ImglyKit.Filters.K6 = __webpack_require__(36);
	ImglyKit.Filters.KDynamic = __webpack_require__(37);
	ImglyKit.Filters.Lenin = __webpack_require__(38);
	ImglyKit.Filters.Lomo = __webpack_require__(39);
	ImglyKit.Filters.Mellow = __webpack_require__(40);
	ImglyKit.Filters.Morning = __webpack_require__(41);
	ImglyKit.Filters.Orchid = __webpack_require__(42);
	ImglyKit.Filters.Pola = __webpack_require__(43);
	ImglyKit.Filters.Pola669 = __webpack_require__(44);
	ImglyKit.Filters.Quozi = __webpack_require__(45);
	ImglyKit.Filters.Semired = __webpack_require__(46);
	ImglyKit.Filters.Sunny = __webpack_require__(47);
	ImglyKit.Filters.Texas = __webpack_require__(48);
	ImglyKit.Filters.X400 = __webpack_require__(49);

	// Exposed constants
	ImglyKit.RenderType = _constants.RenderType;
	ImglyKit.ImageFormat = _constants.ImageFormat;
	ImglyKit.Vector2 = __webpack_require__(50);

	// UI
	ImglyKit.NightUI = __webpack_require__(51);

	exports['default'] = ImglyKit;
	module.exports = exports['default'];

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module, global) {/**
	 * @license
	 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
	 * Build: `lodash include="defaults,extend"`
	 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <http://lodash.com/license>
	 */
	'use strict';

	;(function () {

	  /** Used internally to indicate various things */
	  var indicatorObject = {};

	  /** Used to detected named functions */
	  var reFuncName = /^\s*function[ \n\r\t]+\w/;

	  /** Used to detect functions containing a `this` reference */
	  var reThis = /\bthis\b/;

	  /** Used to fix the JScript [[DontEnum]] bug */
	  var shadowedProps = ['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf'];

	  /** `Object#toString` result shortcuts */
	  var argsClass = '[object Arguments]',
	      arrayClass = '[object Array]',
	      boolClass = '[object Boolean]',
	      dateClass = '[object Date]',
	      errorClass = '[object Error]',
	      funcClass = '[object Function]',
	      numberClass = '[object Number]',
	      objectClass = '[object Object]',
	      regexpClass = '[object RegExp]',
	      stringClass = '[object String]';

	  /** Used as the property descriptor for `__bindData__` */
	  var descriptor = {
	    'configurable': false,
	    'enumerable': false,
	    'value': null,
	    'writable': false
	  };

	  /** Used as the data object for `iteratorTemplate` */
	  var iteratorData = {
	    'args': '',
	    'array': null,
	    'bottom': '',
	    'firstArg': '',
	    'init': '',
	    'keys': null,
	    'loop': '',
	    'shadowedProps': null,
	    'support': null,
	    'top': '',
	    'useHas': false
	  };

	  /** Used to determine if values are of the language type Object */
	  var objectTypes = {
	    'boolean': false,
	    'function': true,
	    'object': true,
	    'number': false,
	    'string': false,
	    'undefined': false
	  };

	  /** Used as a reference to the global object */
	  var root = objectTypes[typeof window] && window || this;

	  /** Detect free variable `exports` */
	  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

	  /** Detect free variable `module` */
	  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

	  /** Detect the popular CommonJS extension `module.exports` */
	  var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;

	  /** Detect free variable `global` from Node.js or Browserified code and use it as `root` */
	  var freeGlobal = objectTypes[typeof global] && global;
	  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
	    root = freeGlobal;
	  }

	  /*--------------------------------------------------------------------------*/

	  /**
	   * Slices the `collection` from the `start` index up to, but not including,
	   * the `end` index.
	   *
	   * Note: This function is used instead of `Array#slice` to support node lists
	   * in IE < 9 and to ensure dense arrays are returned.
	   *
	   * @private
	   * @param {Array|Object|string} collection The collection to slice.
	   * @param {number} start The start index.
	   * @param {number} end The end index.
	   * @returns {Array} Returns the new array.
	   */
	  function slice(array, start, end) {
	    start || (start = 0);
	    if (typeof end == 'undefined') {
	      end = array ? array.length : 0;
	    }
	    var index = -1,
	        length = end - start || 0,
	        result = Array(length < 0 ? 0 : length);

	    while (++index < length) {
	      result[index] = array[start + index];
	    }
	    return result;
	  }

	  /*--------------------------------------------------------------------------*/

	  /**
	   * Used for `Array` method references.
	   *
	   * Normally `Array.prototype` would suffice, however, using an array literal
	   * avoids issues in Narwhal.
	   */
	  var arrayRef = [];

	  /** Used for native method references */
	  var errorProto = Error.prototype,
	      objectProto = Object.prototype,
	      stringProto = String.prototype;

	  /** Used to resolve the internal [[Class]] of values */
	  var toString = objectProto.toString;

	  /** Used to detect if a method is native */
	  var reNative = RegExp('^' + String(toString).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/toString| for [^\]]+/g, '.*?') + '$');

	  /** Native method shortcuts */
	  var fnToString = Function.prototype.toString,
	      hasOwnProperty = objectProto.hasOwnProperty,
	      push = arrayRef.push,
	      propertyIsEnumerable = objectProto.propertyIsEnumerable,
	      unshift = arrayRef.unshift;

	  /** Used to set meta data on functions */
	  var defineProperty = (function () {
	    // IE 8 only accepts DOM elements
	    try {
	      var o = {},
	          func = isNative(func = Object.defineProperty) && func,
	          result = func(o, o, o) && func;
	    } catch (e) {}
	    return result;
	  })();

	  /* Native method shortcuts for methods with the same name as other `lodash` methods */
	  var nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate,
	      nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray,
	      nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys;

	  /** Used to avoid iterating non-enumerable properties in IE < 9 */
	  var nonEnumProps = {};
	  nonEnumProps[arrayClass] = nonEnumProps[dateClass] = nonEnumProps[numberClass] = { 'constructor': true, 'toLocaleString': true, 'toString': true, 'valueOf': true };
	  nonEnumProps[boolClass] = nonEnumProps[stringClass] = { 'constructor': true, 'toString': true, 'valueOf': true };
	  nonEnumProps[errorClass] = nonEnumProps[funcClass] = nonEnumProps[regexpClass] = { 'constructor': true, 'toString': true };
	  nonEnumProps[objectClass] = { 'constructor': true };

	  (function () {
	    var length = shadowedProps.length;
	    while (length--) {
	      var key = shadowedProps[length];
	      for (var className in nonEnumProps) {
	        if (hasOwnProperty.call(nonEnumProps, className) && !hasOwnProperty.call(nonEnumProps[className], key)) {
	          nonEnumProps[className][key] = false;
	        }
	      }
	    }
	  })();

	  /*--------------------------------------------------------------------------*/

	  /**
	   * Creates a `lodash` object which wraps the given value to enable intuitive
	   * method chaining.
	   *
	   * In addition to Lo-Dash methods, wrappers also have the following `Array` methods:
	   * `concat`, `join`, `pop`, `push`, `reverse`, `shift`, `slice`, `sort`, `splice`,
	   * and `unshift`
	   *
	   * Chaining is supported in custom builds as long as the `value` method is
	   * implicitly or explicitly included in the build.
	   *
	   * The chainable wrapper functions are:
	   * `after`, `assign`, `bind`, `bindAll`, `bindKey`, `chain`, `compact`,
	   * `compose`, `concat`, `countBy`, `create`, `createCallback`, `curry`,
	   * `debounce`, `defaults`, `defer`, `delay`, `difference`, `filter`, `flatten`,
	   * `forEach`, `forEachRight`, `forIn`, `forInRight`, `forOwn`, `forOwnRight`,
	   * `functions`, `groupBy`, `indexBy`, `initial`, `intersection`, `invert`,
	   * `invoke`, `keys`, `map`, `max`, `memoize`, `merge`, `min`, `object`, `omit`,
	   * `once`, `pairs`, `partial`, `partialRight`, `pick`, `pluck`, `pull`, `push`,
	   * `range`, `reject`, `remove`, `rest`, `reverse`, `shuffle`, `slice`, `sort`,
	   * `sortBy`, `splice`, `tap`, `throttle`, `times`, `toArray`, `transform`,
	   * `union`, `uniq`, `unshift`, `unzip`, `values`, `where`, `without`, `wrap`,
	   * and `zip`
	   *
	   * The non-chainable wrapper functions are:
	   * `clone`, `cloneDeep`, `contains`, `escape`, `every`, `find`, `findIndex`,
	   * `findKey`, `findLast`, `findLastIndex`, `findLastKey`, `has`, `identity`,
	   * `indexOf`, `isArguments`, `isArray`, `isBoolean`, `isDate`, `isElement`,
	   * `isEmpty`, `isEqual`, `isFinite`, `isFunction`, `isNaN`, `isNull`, `isNumber`,
	   * `isObject`, `isPlainObject`, `isRegExp`, `isString`, `isUndefined`, `join`,
	   * `lastIndexOf`, `mixin`, `noConflict`, `parseInt`, `pop`, `random`, `reduce`,
	   * `reduceRight`, `result`, `shift`, `size`, `some`, `sortedIndex`, `runInContext`,
	   * `template`, `unescape`, `uniqueId`, and `value`
	   *
	   * The wrapper functions `first` and `last` return wrapped values when `n` is
	   * provided, otherwise they return unwrapped values.
	   *
	   * Explicit chaining can be enabled by using the `_.chain` method.
	   *
	   * @name _
	   * @constructor
	   * @category Chaining
	   * @param {*} value The value to wrap in a `lodash` instance.
	   * @returns {Object} Returns a `lodash` instance.
	   * @example
	   *
	   * var wrapped = _([1, 2, 3]);
	   *
	   * // returns an unwrapped value
	   * wrapped.reduce(function(sum, num) {
	   *   return sum + num;
	   * });
	   * // => 6
	   *
	   * // returns a wrapped value
	   * var squares = wrapped.map(function(num) {
	   *   return num * num;
	   * });
	   *
	   * _.isArray(squares);
	   * // => false
	   *
	   * _.isArray(squares.value());
	   * // => true
	   */
	  function lodash() {}

	  /**
	   * An object used to flag environments features.
	   *
	   * @static
	   * @memberOf _
	   * @type Object
	   */
	  var support = lodash.support = {};

	  (function () {
	    var ctor = function ctor() {
	      this.x = 1;
	    },
	        object = { '0': 1, 'length': 1 },
	        props = [];

	    ctor.prototype = { 'valueOf': 1, 'y': 1 };
	    for (var key in new ctor()) {
	      props.push(key);
	    }
	    for (key in arguments) {}

	    /**
	     * Detect if an `arguments` object's [[Class]] is resolvable (all but Firefox < 4, IE < 9).
	     *
	     * @memberOf _.support
	     * @type boolean
	     */
	    support.argsClass = toString.call(arguments) == argsClass;

	    /**
	     * Detect if `arguments` objects are `Object` objects (all but Narwhal and Opera < 10.5).
	     *
	     * @memberOf _.support
	     * @type boolean
	     */
	    support.argsObject = arguments.constructor == Object && !(arguments instanceof Array);

	    /**
	     * Detect if `name` or `message` properties of `Error.prototype` are
	     * enumerable by default. (IE < 9, Safari < 5.1)
	     *
	     * @memberOf _.support
	     * @type boolean
	     */
	    support.enumErrorProps = propertyIsEnumerable.call(errorProto, 'message') || propertyIsEnumerable.call(errorProto, 'name');

	    /**
	     * Detect if `prototype` properties are enumerable by default.
	     *
	     * Firefox < 3.6, Opera > 9.50 - Opera < 11.60, and Safari < 5.1
	     * (if the prototype or a property on the prototype has been set)
	     * incorrectly sets a function's `prototype` property [[Enumerable]]
	     * value to `true`.
	     *
	     * @memberOf _.support
	     * @type boolean
	     */
	    support.enumPrototypes = propertyIsEnumerable.call(ctor, 'prototype');

	    /**
	     * Detect if functions can be decompiled by `Function#toString`
	     * (all but PS3 and older Opera mobile browsers & avoided in Windows 8 apps).
	     *
	     * @memberOf _.support
	     * @type boolean
	     */
	    support.funcDecomp = !isNative(root.WinRTError) && reThis.test(function () {
	      return this;
	    });

	    /**
	     * Detect if `Function#name` is supported (all but IE).
	     *
	     * @memberOf _.support
	     * @type boolean
	     */
	    support.funcNames = typeof Function.name == 'string';

	    /**
	     * Detect if `arguments` object indexes are non-enumerable
	     * (Firefox < 4, IE < 9, PhantomJS, Safari < 5.1).
	     *
	     * @memberOf _.support
	     * @type boolean
	     */
	    support.nonEnumArgs = key != 0;

	    /**
	     * Detect if properties shadowing those on `Object.prototype` are non-enumerable.
	     *
	     * In IE < 9 an objects own properties, shadowing non-enumerable ones, are
	     * made non-enumerable as well (a.k.a the JScript [[DontEnum]] bug).
	     *
	     * @memberOf _.support
	     * @type boolean
	     */
	    support.nonEnumShadows = !/valueOf/.test(props);

	    /**
	     * Detect if `Array#shift` and `Array#splice` augment array-like objects correctly.
	     *
	     * Firefox < 10, IE compatibility mode, and IE < 9 have buggy Array `shift()`
	     * and `splice()` functions that fail to remove the last element, `value[0]`,
	     * of array-like objects even though the `length` property is set to `0`.
	     * The `shift()` method is buggy in IE 8 compatibility mode, while `splice()`
	     * is buggy regardless of mode in IE < 9 and buggy in compatibility mode in IE 9.
	     *
	     * @memberOf _.support
	     * @type boolean
	     */
	    support.spliceObjects = (arrayRef.splice.call(object, 0, 1), !object[0]);

	    /**
	     * Detect lack of support for accessing string characters by index.
	     *
	     * IE < 8 can't access characters by index and IE 8 can only access
	     * characters by index on string literals.
	     *
	     * @memberOf _.support
	     * @type boolean
	     */
	    support.unindexedChars = 'x'[0] + Object('x')[0] != 'xx';
	  })(1);

	  /*--------------------------------------------------------------------------*/

	  /**
	   * The template used to create iterator functions.
	   *
	   * @private
	   * @param {Object} data The data object used to populate the text.
	   * @returns {string} Returns the interpolated text.
	   */
	  var iteratorTemplate = function iteratorTemplate(obj) {

	    var __p = 'var index, iterable = ' + obj.firstArg + ', result = ' + obj.init + ';\nif (!iterable) return result;\n' + obj.top + ';';
	    if (obj.array) {
	      __p += '\nvar length = iterable.length; index = -1;\nif (' + obj.array + ') {  ';
	      if (support.unindexedChars) {
	        __p += '\n  if (isString(iterable)) {\n    iterable = iterable.split(\'\')\n  }  ';
	      }
	      __p += '\n  while (++index < length) {\n    ' + obj.loop + ';\n  }\n}\nelse {  ';
	    } else if (support.nonEnumArgs) {
	      __p += '\n  var length = iterable.length; index = -1;\n  if (length && isArguments(iterable)) {\n    while (++index < length) {\n      index += \'\';\n      ' + obj.loop + ';\n    }\n  } else {  ';
	    }

	    if (support.enumPrototypes) {
	      __p += '\n  var skipProto = typeof iterable == \'function\';\n  ';
	    }

	    if (support.enumErrorProps) {
	      __p += '\n  var skipErrorProps = iterable === errorProto || iterable instanceof Error;\n  ';
	    }

	    var conditions = [];if (support.enumPrototypes) {
	      conditions.push('!(skipProto && index == "prototype")');
	    }if (support.enumErrorProps) {
	      conditions.push('!(skipErrorProps && (index == "message" || index == "name"))');
	    }

	    if (obj.useHas && obj.keys) {
	      __p += '\n  var ownIndex = -1,\n      ownProps = objectTypes[typeof iterable] && keys(iterable),\n      length = ownProps ? ownProps.length : 0;\n\n  while (++ownIndex < length) {\n    index = ownProps[ownIndex];\n';
	      if (conditions.length) {
	        __p += '    if (' + conditions.join(' && ') + ') {\n  ';
	      }
	      __p += obj.loop + ';    ';
	      if (conditions.length) {
	        __p += '\n    }';
	      }
	      __p += '\n  }  ';
	    } else {
	      __p += '\n  for (index in iterable) {\n';
	      if (obj.useHas) {
	        conditions.push('hasOwnProperty.call(iterable, index)');
	      }if (conditions.length) {
	        __p += '    if (' + conditions.join(' && ') + ') {\n  ';
	      }
	      __p += obj.loop + ';    ';
	      if (conditions.length) {
	        __p += '\n    }';
	      }
	      __p += '\n  }    ';
	      if (support.nonEnumShadows) {
	        __p += '\n\n  if (iterable !== objectProto) {\n    var ctor = iterable.constructor,\n        isProto = iterable === (ctor && ctor.prototype),\n        className = iterable === stringProto ? stringClass : iterable === errorProto ? errorClass : toString.call(iterable),\n        nonEnum = nonEnumProps[className];\n      ';
	        for (k = 0; k < 7; k++) {
	          __p += '\n    index = \'' + obj.shadowedProps[k] + '\';\n    if ((!(isProto && nonEnum[index]) && hasOwnProperty.call(iterable, index))';
	          if (!obj.useHas) {
	            __p += ' || (!nonEnum[index] && iterable[index] !== objectProto[index])';
	          }
	          __p += ') {\n      ' + obj.loop + ';\n    }      ';
	        }
	        __p += '\n  }    ';
	      }
	    }

	    if (obj.array || support.nonEnumArgs) {
	      __p += '\n}';
	    }
	    __p += obj.bottom + ';\nreturn result';

	    return __p;
	  };

	  /*--------------------------------------------------------------------------*/

	  /**
	   * The base implementation of `_.bind` that creates the bound function and
	   * sets its meta data.
	   *
	   * @private
	   * @param {Array} bindData The bind data array.
	   * @returns {Function} Returns the new bound function.
	   */
	  function baseBind(bindData) {
	    var func = bindData[0],
	        partialArgs = bindData[2],
	        thisArg = bindData[4];

	    function bound() {
	      // `Function#bind` spec
	      // http://es5.github.io/#x15.3.4.5
	      if (partialArgs) {
	        // avoid `arguments` object deoptimizations by using `slice` instead
	        // of `Array.prototype.slice.call` and not assigning `arguments` to a
	        // variable as a ternary expression
	        var args = slice(partialArgs);
	        push.apply(args, arguments);
	      }
	      // mimic the constructor's `return` behavior
	      // http://es5.github.io/#x13.2.2
	      if (this instanceof bound) {
	        // ensure `new bound` is an instance of `func`
	        var thisBinding = baseCreate(func.prototype),
	            result = func.apply(thisBinding, args || arguments);
	        return isObject(result) ? result : thisBinding;
	      }
	      return func.apply(thisArg, args || arguments);
	    }
	    setBindData(bound, bindData);
	    return bound;
	  }

	  /**
	   * The base implementation of `_.create` without support for assigning
	   * properties to the created object.
	   *
	   * @private
	   * @param {Object} prototype The object to inherit from.
	   * @returns {Object} Returns the new object.
	   */
	  function baseCreate(prototype, properties) {
	    return isObject(prototype) ? nativeCreate(prototype) : {};
	  }
	  // fallback for browsers without `Object.create`
	  if (!nativeCreate) {
	    baseCreate = (function () {
	      function Object() {}
	      return function (prototype) {
	        if (isObject(prototype)) {
	          Object.prototype = prototype;
	          var result = new Object();
	          Object.prototype = null;
	        }
	        return result || root.Object();
	      };
	    })();
	  }

	  /**
	   * The base implementation of `_.createCallback` without support for creating
	   * "_.pluck" or "_.where" style callbacks.
	   *
	   * @private
	   * @param {*} [func=identity] The value to convert to a callback.
	   * @param {*} [thisArg] The `this` binding of the created callback.
	   * @param {number} [argCount] The number of arguments the callback accepts.
	   * @returns {Function} Returns a callback function.
	   */
	  function baseCreateCallback(func, thisArg, argCount) {
	    if (typeof func != 'function') {
	      return identity;
	    }
	    // exit early for no `thisArg` or already bound by `Function#bind`
	    if (typeof thisArg == 'undefined' || !('prototype' in func)) {
	      return func;
	    }
	    var bindData = func.__bindData__;
	    if (typeof bindData == 'undefined') {
	      if (support.funcNames) {
	        bindData = !func.name;
	      }
	      bindData = bindData || !support.funcDecomp;
	      if (!bindData) {
	        var source = fnToString.call(func);
	        if (!support.funcNames) {
	          bindData = !reFuncName.test(source);
	        }
	        if (!bindData) {
	          // checks if `func` references the `this` keyword and stores the result
	          bindData = reThis.test(source);
	          setBindData(func, bindData);
	        }
	      }
	    }
	    // exit early if there are no `this` references or `func` is bound
	    if (bindData === false || bindData !== true && bindData[1] & 1) {
	      return func;
	    }
	    switch (argCount) {
	      case 1:
	        return function (value) {
	          return func.call(thisArg, value);
	        };
	      case 2:
	        return function (a, b) {
	          return func.call(thisArg, a, b);
	        };
	      case 3:
	        return function (value, index, collection) {
	          return func.call(thisArg, value, index, collection);
	        };
	      case 4:
	        return function (accumulator, value, index, collection) {
	          return func.call(thisArg, accumulator, value, index, collection);
	        };
	    }
	    return bind(func, thisArg);
	  }

	  /**
	   * The base implementation of `createWrapper` that creates the wrapper and
	   * sets its meta data.
	   *
	   * @private
	   * @param {Array} bindData The bind data array.
	   * @returns {Function} Returns the new function.
	   */
	  function baseCreateWrapper(bindData) {
	    var func = bindData[0],
	        bitmask = bindData[1],
	        partialArgs = bindData[2],
	        partialRightArgs = bindData[3],
	        thisArg = bindData[4],
	        arity = bindData[5];

	    var isBind = bitmask & 1,
	        isBindKey = bitmask & 2,
	        isCurry = bitmask & 4,
	        isCurryBound = bitmask & 8,
	        key = func;

	    function bound() {
	      var thisBinding = isBind ? thisArg : this;
	      if (partialArgs) {
	        var args = slice(partialArgs);
	        push.apply(args, arguments);
	      }
	      if (partialRightArgs || isCurry) {
	        args || (args = slice(arguments));
	        if (partialRightArgs) {
	          push.apply(args, partialRightArgs);
	        }
	        if (isCurry && args.length < arity) {
	          bitmask |= 16 & ~32;
	          return baseCreateWrapper([func, isCurryBound ? bitmask : bitmask & ~3, args, null, thisArg, arity]);
	        }
	      }
	      args || (args = arguments);
	      if (isBindKey) {
	        func = thisBinding[key];
	      }
	      if (this instanceof bound) {
	        thisBinding = baseCreate(func.prototype);
	        var result = func.apply(thisBinding, args);
	        return isObject(result) ? result : thisBinding;
	      }
	      return func.apply(thisBinding, args);
	    }
	    setBindData(bound, bindData);
	    return bound;
	  }

	  /**
	   * Creates a function that, when called, either curries or invokes `func`
	   * with an optional `this` binding and partially applied arguments.
	   *
	   * @private
	   * @param {Function|string} func The function or method name to reference.
	   * @param {number} bitmask The bitmask of method flags to compose.
	   *  The bitmask may be composed of the following flags:
	   *  1 - `_.bind`
	   *  2 - `_.bindKey`
	   *  4 - `_.curry`
	   *  8 - `_.curry` (bound)
	   *  16 - `_.partial`
	   *  32 - `_.partialRight`
	   * @param {Array} [partialArgs] An array of arguments to prepend to those
	   *  provided to the new function.
	   * @param {Array} [partialRightArgs] An array of arguments to append to those
	   *  provided to the new function.
	   * @param {*} [thisArg] The `this` binding of `func`.
	   * @param {number} [arity] The arity of `func`.
	   * @returns {Function} Returns the new function.
	   */
	  function createWrapper(_x, _x2, _x3, _x4, _x5, _x6) {
	    var _arguments = arguments;
	    var _again = true;

	    _function: while (_again) {
	      var func = _x,
	          bitmask = _x2,
	          partialArgs = _x3,
	          partialRightArgs = _x4,
	          thisArg = _x5,
	          arity = _x6;
	      isBind = isBindKey = isCurry = isCurryBound = isPartial = isPartialRight = bindData = creater = undefined;
	      _again = false;

	      var isBind = bitmask & 1,
	          isBindKey = bitmask & 2,
	          isCurry = bitmask & 4,
	          isCurryBound = bitmask & 8,
	          isPartial = bitmask & 16,
	          isPartialRight = bitmask & 32;

	      if (!isBindKey && !isFunction(func)) {
	        throw new TypeError();
	      }
	      if (isPartial && !partialArgs.length) {
	        bitmask &= ~16;
	        isPartial = partialArgs = false;
	      }
	      if (isPartialRight && !partialRightArgs.length) {
	        bitmask &= ~32;
	        isPartialRight = partialRightArgs = false;
	      }
	      var bindData = func && func.__bindData__;
	      if (bindData && bindData !== true) {
	        // clone `bindData`
	        bindData = slice(bindData);
	        if (bindData[2]) {
	          bindData[2] = slice(bindData[2]);
	        }
	        if (bindData[3]) {
	          bindData[3] = slice(bindData[3]);
	        }
	        // set `thisBinding` is not previously bound
	        if (isBind && !(bindData[1] & 1)) {
	          bindData[4] = thisArg;
	        }
	        // set if previously bound but not currently (subsequent curried functions)
	        if (!isBind && bindData[1] & 1) {
	          bitmask |= 8;
	        }
	        // set curried arity if not yet set
	        if (isCurry && !(bindData[1] & 4)) {
	          bindData[5] = arity;
	        }
	        // append partial left arguments
	        if (isPartial) {
	          push.apply(bindData[2] || (bindData[2] = []), partialArgs);
	        }
	        // append partial right arguments
	        if (isPartialRight) {
	          unshift.apply(bindData[3] || (bindData[3] = []), partialRightArgs);
	        }
	        // merge flags
	        bindData[1] |= bitmask;
	        _arguments = bindData;
	        _x = _arguments[0];
	        _x2 = _arguments[1];
	        _x3 = _arguments[2];
	        _x4 = _arguments[3];
	        _x5 = _arguments[4];
	        _x6 = _arguments[5];
	        _again = true;
	        continue _function;
	      }
	      // fast path for `_.bind`
	      var creater = bitmask == 1 || bitmask === 17 ? baseBind : baseCreateWrapper;
	      return creater([func, bitmask, partialArgs, partialRightArgs, thisArg, arity]);
	    }
	  }

	  /**
	   * Creates compiled iteration functions.
	   *
	   * @private
	   * @param {...Object} [options] The compile options object(s).
	   * @param {string} [options.array] Code to determine if the iterable is an array or array-like.
	   * @param {boolean} [options.useHas] Specify using `hasOwnProperty` checks in the object loop.
	   * @param {Function} [options.keys] A reference to `_.keys` for use in own property iteration.
	   * @param {string} [options.args] A comma separated string of iteration function arguments.
	   * @param {string} [options.top] Code to execute before the iteration branches.
	   * @param {string} [options.loop] Code to execute in the object loop.
	   * @param {string} [options.bottom] Code to execute after the iteration branches.
	   * @returns {Function} Returns the compiled function.
	   */
	  function createIterator() {
	    // data properties
	    iteratorData.shadowedProps = shadowedProps;

	    // iterator options
	    iteratorData.array = iteratorData.bottom = iteratorData.loop = iteratorData.top = '';
	    iteratorData.init = 'iterable';
	    iteratorData.useHas = true;

	    // merge options into a template data object
	    for (var object, index = 0; object = arguments[index]; index++) {
	      for (var key in object) {
	        iteratorData[key] = object[key];
	      }
	    }
	    var args = iteratorData.args;
	    iteratorData.firstArg = /^[^,]+/.exec(args)[0];

	    // create the function factory
	    var factory = Function('baseCreateCallback, errorClass, errorProto, hasOwnProperty, ' + 'indicatorObject, isArguments, isArray, isString, keys, objectProto, ' + 'objectTypes, nonEnumProps, stringClass, stringProto, toString', 'return function(' + args + ') {\n' + iteratorTemplate(iteratorData) + '\n}');

	    // return the compiled function
	    return factory(baseCreateCallback, errorClass, errorProto, hasOwnProperty, indicatorObject, isArguments, isArray, isString, iteratorData.keys, objectProto, objectTypes, nonEnumProps, stringClass, stringProto, toString);
	  }

	  /**
	   * Checks if `value` is a native function.
	   *
	   * @private
	   * @param {*} value The value to check.
	   * @returns {boolean} Returns `true` if the `value` is a native function, else `false`.
	   */
	  function isNative(value) {
	    return typeof value == 'function' && reNative.test(value);
	  }

	  /**
	   * Sets `this` binding data on a given function.
	   *
	   * @private
	   * @param {Function} func The function to set data on.
	   * @param {Array} value The data array to set.
	   */
	  var setBindData = !defineProperty ? noop : function (func, value) {
	    descriptor.value = value;
	    defineProperty(func, '__bindData__', descriptor);
	  };

	  /*--------------------------------------------------------------------------*/

	  /**
	   * Checks if `value` is an `arguments` object.
	   *
	   * @static
	   * @memberOf _
	   * @category Objects
	   * @param {*} value The value to check.
	   * @returns {boolean} Returns `true` if the `value` is an `arguments` object, else `false`.
	   * @example
	   *
	   * (function() { return _.isArguments(arguments); })(1, 2, 3);
	   * // => true
	   *
	   * _.isArguments([1, 2, 3]);
	   * // => false
	   */
	  function isArguments(value) {
	    return value && typeof value == 'object' && typeof value.length == 'number' && toString.call(value) == argsClass || false;
	  }
	  // fallback for browsers that can't detect `arguments` objects by [[Class]]
	  if (!support.argsClass) {
	    isArguments = function (value) {
	      return value && typeof value == 'object' && typeof value.length == 'number' && hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee') || false;
	    };
	  }

	  /**
	   * Checks if `value` is an array.
	   *
	   * @static
	   * @memberOf _
	   * @type Function
	   * @category Objects
	   * @param {*} value The value to check.
	   * @returns {boolean} Returns `true` if the `value` is an array, else `false`.
	   * @example
	   *
	   * (function() { return _.isArray(arguments); })();
	   * // => false
	   *
	   * _.isArray([1, 2, 3]);
	   * // => true
	   */
	  var isArray = nativeIsArray || function (value) {
	    return value && typeof value == 'object' && typeof value.length == 'number' && toString.call(value) == arrayClass || false;
	  };

	  /**
	   * A fallback implementation of `Object.keys` which produces an array of the
	   * given object's own enumerable property names.
	   *
	   * @private
	   * @type Function
	   * @param {Object} object The object to inspect.
	   * @returns {Array} Returns an array of property names.
	   */
	  var shimKeys = createIterator({
	    'args': 'object',
	    'init': '[]',
	    'top': 'if (!(objectTypes[typeof object])) return result',
	    'loop': 'result.push(index)'
	  });

	  /**
	   * Creates an array composed of the own enumerable property names of an object.
	   *
	   * @static
	   * @memberOf _
	   * @category Objects
	   * @param {Object} object The object to inspect.
	   * @returns {Array} Returns an array of property names.
	   * @example
	   *
	   * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
	   * // => ['one', 'two', 'three'] (property order is not guaranteed across environments)
	   */
	  var keys = !nativeKeys ? shimKeys : function (object) {
	    if (!isObject(object)) {
	      return [];
	    }
	    if (support.enumPrototypes && typeof object == 'function' || support.nonEnumArgs && object.length && isArguments(object)) {
	      return shimKeys(object);
	    }
	    return nativeKeys(object);
	  };

	  /** Reusable iterator options for `assign` and `defaults` */
	  var defaultsIteratorOptions = {
	    'args': 'object, source, guard',
	    'top': 'var args = arguments,\n' + '    argsIndex = 0,\n' + '    argsLength = typeof guard == \'number\' ? 2 : args.length;\n' + 'while (++argsIndex < argsLength) {\n' + '  iterable = args[argsIndex];\n' + '  if (iterable && objectTypes[typeof iterable]) {',
	    'keys': keys,
	    'loop': 'if (typeof result[index] == \'undefined\') result[index] = iterable[index]',
	    'bottom': '  }\n}'
	  };

	  /*--------------------------------------------------------------------------*/

	  /**
	   * Assigns own enumerable properties of source object(s) to the destination
	   * object. Subsequent sources will overwrite property assignments of previous
	   * sources. If a callback is provided it will be executed to produce the
	   * assigned values. The callback is bound to `thisArg` and invoked with two
	   * arguments; (objectValue, sourceValue).
	   *
	   * @static
	   * @memberOf _
	   * @type Function
	   * @alias extend
	   * @category Objects
	   * @param {Object} object The destination object.
	   * @param {...Object} [source] The source objects.
	   * @param {Function} [callback] The function to customize assigning values.
	   * @param {*} [thisArg] The `this` binding of `callback`.
	   * @returns {Object} Returns the destination object.
	   * @example
	   *
	   * _.assign({ 'name': 'fred' }, { 'employer': 'slate' });
	   * // => { 'name': 'fred', 'employer': 'slate' }
	   *
	   * var defaults = _.partialRight(_.assign, function(a, b) {
	   *   return typeof a == 'undefined' ? b : a;
	   * });
	   *
	   * var object = { 'name': 'barney' };
	   * defaults(object, { 'name': 'fred', 'employer': 'slate' });
	   * // => { 'name': 'barney', 'employer': 'slate' }
	   */
	  var assign = createIterator(defaultsIteratorOptions, {
	    'top': defaultsIteratorOptions.top.replace(';', ';\n' + 'if (argsLength > 3 && typeof args[argsLength - 2] == \'function\') {\n' + '  var callback = baseCreateCallback(args[--argsLength - 1], args[argsLength--], 2);\n' + '} else if (argsLength > 2 && typeof args[argsLength - 1] == \'function\') {\n' + '  callback = args[--argsLength];\n' + '}'),
	    'loop': 'result[index] = callback ? callback(result[index], iterable[index]) : iterable[index]'
	  });

	  /**
	   * Assigns own enumerable properties of source object(s) to the destination
	   * object for all destination properties that resolve to `undefined`. Once a
	   * property is set, additional defaults of the same property will be ignored.
	   *
	   * @static
	   * @memberOf _
	   * @type Function
	   * @category Objects
	   * @param {Object} object The destination object.
	   * @param {...Object} [source] The source objects.
	   * @param- {Object} [guard] Allows working with `_.reduce` without using its
	   *  `key` and `object` arguments as sources.
	   * @returns {Object} Returns the destination object.
	   * @example
	   *
	   * var object = { 'name': 'barney' };
	   * _.defaults(object, { 'name': 'fred', 'employer': 'slate' });
	   * // => { 'name': 'barney', 'employer': 'slate' }
	   */
	  var defaults = createIterator(defaultsIteratorOptions);

	  /**
	   * Checks if `value` is a function.
	   *
	   * @static
	   * @memberOf _
	   * @category Objects
	   * @param {*} value The value to check.
	   * @returns {boolean} Returns `true` if the `value` is a function, else `false`.
	   * @example
	   *
	   * _.isFunction(_);
	   * // => true
	   */
	  function isFunction(value) {
	    return typeof value == 'function';
	  }
	  // fallback for older versions of Chrome and Safari
	  if (isFunction(/x/)) {
	    isFunction = function (value) {
	      return typeof value == 'function' && toString.call(value) == funcClass;
	    };
	  }

	  /**
	   * Checks if `value` is the language type of Object.
	   * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	   *
	   * @static
	   * @memberOf _
	   * @category Objects
	   * @param {*} value The value to check.
	   * @returns {boolean} Returns `true` if the `value` is an object, else `false`.
	   * @example
	   *
	   * _.isObject({});
	   * // => true
	   *
	   * _.isObject([1, 2, 3]);
	   * // => true
	   *
	   * _.isObject(1);
	   * // => false
	   */
	  function isObject(value) {
	    // check if the value is the ECMAScript language type of Object
	    // http://es5.github.io/#x8
	    // and avoid a V8 bug
	    // http://code.google.com/p/v8/issues/detail?id=2291
	    return !!(value && objectTypes[typeof value]);
	  }

	  /**
	   * Checks if `value` is a string.
	   *
	   * @static
	   * @memberOf _
	   * @category Objects
	   * @param {*} value The value to check.
	   * @returns {boolean} Returns `true` if the `value` is a string, else `false`.
	   * @example
	   *
	   * _.isString('fred');
	   * // => true
	   */
	  function isString(value) {
	    return typeof value == 'string' || value && typeof value == 'object' && toString.call(value) == stringClass || false;
	  }

	  /*--------------------------------------------------------------------------*/

	  /**
	   * Creates a function that, when called, invokes `func` with the `this`
	   * binding of `thisArg` and prepends any additional `bind` arguments to those
	   * provided to the bound function.
	   *
	   * @static
	   * @memberOf _
	   * @category Functions
	   * @param {Function} func The function to bind.
	   * @param {*} [thisArg] The `this` binding of `func`.
	   * @param {...*} [arg] Arguments to be partially applied.
	   * @returns {Function} Returns the new bound function.
	   * @example
	   *
	   * var func = function(greeting) {
	   *   return greeting + ' ' + this.name;
	   * };
	   *
	   * func = _.bind(func, { 'name': 'fred' }, 'hi');
	   * func();
	   * // => 'hi fred'
	   */
	  function bind(func, thisArg) {
	    return arguments.length > 2 ? createWrapper(func, 17, slice(arguments, 2), null, thisArg) : createWrapper(func, 1, null, null, thisArg);
	  }

	  /*--------------------------------------------------------------------------*/

	  /**
	   * This method returns the first argument provided to it.
	   *
	   * @static
	   * @memberOf _
	   * @category Utilities
	   * @param {*} value Any value.
	   * @returns {*} Returns `value`.
	   * @example
	   *
	   * var object = { 'name': 'fred' };
	   * _.identity(object) === object;
	   * // => true
	   */
	  function identity(value) {
	    return value;
	  }

	  /**
	   * A no-operation function.
	   *
	   * @static
	   * @memberOf _
	   * @category Utilities
	   * @example
	   *
	   * var object = { 'name': 'fred' };
	   * _.noop(object) === undefined;
	   * // => true
	   */
	  function noop() {}

	  /*--------------------------------------------------------------------------*/

	  lodash.assign = assign;
	  lodash.bind = bind;
	  lodash.defaults = defaults;
	  lodash.keys = keys;

	  lodash.extend = assign;

	  /*--------------------------------------------------------------------------*/

	  lodash.identity = identity;
	  lodash.isArguments = isArguments;
	  lodash.isArray = isArray;
	  lodash.isFunction = isFunction;
	  lodash.isObject = isObject;
	  lodash.isString = isString;
	  lodash.noop = noop;

	  /*--------------------------------------------------------------------------*/

	  /**
	   * The semantic version number.
	   *
	   * @static
	   * @memberOf _
	   * @type string
	   */
	  lodash.VERSION = '2.4.1';

	  /*--------------------------------------------------------------------------*/

	  // some AMD build optimizers like r.js check for condition patterns like the following:
	  if (true) {
	    // Expose Lo-Dash to the global object even when an AMD loader is present in
	    // case Lo-Dash is loaded with a RequireJS shim config.
	    // See http://requirejs.org/docs/api.html#config-shim
	    root._ = lodash;

	    // define as an anonymous module so, through path mapping, it can be
	    // referenced as the "underscore" module
	    !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
	      return lodash;
	    }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  }
	  // check for `exports` after `define` in case a build optimizer adds an `exports` object
	  else if (freeExports && freeModule) {
	    // in Node.js or RingoJS
	    if (moduleExports) {
	      (freeModule.exports = lodash)._ = lodash;
	    }
	    // in Narwhal or Rhino -require
	    else {
	      freeExports._ = lodash;
	    }
	  } else {
	    // in a browser or Rhino
	    root._ = lodash;
	  }
	}).call(undefined);

	// no operation performed

	// no operation performed
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(93)(module), (function() { return this; }())))

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */
	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var _imageDimensions = __webpack_require__(54);

	var _imageDimensions2 = _interopRequireDefault(_imageDimensions);

	var _mathVector2 = __webpack_require__(50);

	var _mathVector22 = _interopRequireDefault(_mathVector2);

	var _renderersCanvasRenderer = __webpack_require__(55);

	var _renderersCanvasRenderer2 = _interopRequireDefault(_renderersCanvasRenderer);

	var _renderersWebglRenderer = __webpack_require__(56);

	var _renderersWebglRenderer2 = _interopRequireDefault(_renderersWebglRenderer);

	/**
	 * Handles the image rendering process
	 * @class
	 * @alias ImglyKit.RenderImage
	 * @param {Image} image
	 * @param {Array.<ImglyKit.Operation>} operationsStack
	 * @param {string} dimensions
	 * @param {string} preferredRenderer
	 * @private
	 */

	var RenderImage = (function () {
	  function RenderImage(image, operationsStack, dimensions, preferredRenderer) {
	    _classCallCheck(this, RenderImage);

	    /**
	     * @type {Object}
	     * @private
	     */
	    this._options = {
	      preferredRenderer: preferredRenderer
	    };

	    /**
	     * @type {Boolean}
	     * @private
	     * @default false
	     */
	    this._webglEnabled = false;

	    /**
	     * @type {Renderer}
	     * @private
	     */
	    this._renderer = null;

	    /**
	     * @type {Image}
	     * @private
	     */
	    this._image = image;

	    /**
	     * @type {Array.<ImglyKit.Operation>}
	     * @private
	     */
	    this._stack = operationsStack;

	    /**
	     * @type {ImglyKit.ImageDimensions}
	     * @private
	     */
	    this._dimensions = new _imageDimensions2['default'](dimensions);

	    /**
	     * @type {Vector2}
	     * @private
	     */
	    this._initialDimensions = new _mathVector22['default'](this._image.width, this._image.height);

	    this._initRenderer();
	  }

	  _createClass(RenderImage, [{
	    key: '_initRenderer',

	    /**
	     * Creates a renderer (canvas or webgl, depending on support)
	     * @return {Promise}
	     * @private
	     */
	    value: function _initRenderer() {
	      /* istanbul ignore if */
	      if (_renderersWebglRenderer2['default'].isSupported() && this._options.preferredRenderer !== 'canvas') {
	        this._renderer = new _renderersWebglRenderer2['default'](this._initialDimensions);
	        this._webglEnabled = true;
	      } else if (_renderersCanvasRenderer2['default'].isSupported()) {
	        this._renderer = new _renderersCanvasRenderer2['default'](this._initialDimensions);
	        this._webglEnabled = false;
	      }

	      /* istanbul ignore if */
	      if (this._renderer === null) {
	        throw new Error('Neither Canvas nor WebGL renderer are supported.');
	      }

	      this._renderer.drawImage(this._image);
	    }
	  }, {
	    key: 'render',

	    /**
	     * Renders the image
	     * @return {Promise}
	     */
	    value: function render() {
	      var _this = this;

	      var stack = this.sanitizedStack;

	      var validationPromises = [];
	      for (var i = 0; i < stack.length; i++) {
	        var operation = stack[i];
	        validationPromises.push(operation.validateSettings());
	      }

	      return Promise.all(validationPromises).then(function () {
	        var promises = [];
	        for (var i = 0; i < stack.length; i++) {
	          var operation = stack[i];
	          promises.push(operation.render(_this._renderer));
	        }
	        return Promise.all(promises);
	      }).then(function () {
	        return _this._renderer.renderFinal();
	      }).then(function () {
	        var initialSize = _this._renderer.getSize();
	        var finalDimensions = _this._dimensions.calculateFinalDimensions(initialSize);

	        if (finalDimensions.equals(initialSize)) {
	          // No need to resize
	          return;
	        }

	        return _this._renderer.resizeTo(finalDimensions);
	      });
	    }
	  }, {
	    key: 'getRenderer',

	    /**
	     * Returns the renderer
	     * @return {Renderer}
	     */
	    value: function getRenderer() {
	      return this._renderer;
	    }
	  }, {
	    key: 'sanitizedStack',

	    /**
	     * Returns the operations stack without falsy values
	     * @type {Array.<Operation>}
	     */
	    get: function () {
	      var sanitizedStack = [];
	      for (var i = 0; i < this._stack.length; i++) {
	        var operation = this._stack[i];
	        if (!operation) continue;
	        sanitizedStack.push(operation);
	      }
	      return sanitizedStack;
	    }
	  }]);

	  return RenderImage;
	})();

	exports['default'] = RenderImage;
	module.exports = exports['default'];

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/* global Image */
	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */
	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var _constants = __webpack_require__(5);

	var _exifRestorer = __webpack_require__(57);

	var _exifRestorer2 = _interopRequireDefault(_exifRestorer);

	var _utils = __webpack_require__(6);

	var _utils2 = _interopRequireDefault(_utils);

	/**
	 * @class
	 * @alias ImglyKit.ImageExporter
	 * @private
	 */

	var ImageExporter = (function () {
	  function ImageExporter() {
	    _classCallCheck(this, ImageExporter);
	  }

	  _createClass(ImageExporter, null, [{
	    key: 'validateSettings',
	    value: function validateSettings(renderType, imageFormat) {
	      var settings = {
	        renderType: renderType,
	        imageFormat: imageFormat
	      };

	      // Validate RenderType
	      if (typeof settings.renderType !== 'undefined' && settings.renderType !== null && _utils2['default'].values(_constants.RenderType).indexOf(settings.renderType) === -1) {
	        throw new Error('Invalid render type: ' + settings.renderType);
	      } else if (typeof renderType === 'undefined') {
	        settings.renderType = _constants.RenderType.DATAURL;
	      }

	      // Validate ImageFormat
	      if (typeof settings.imageFormat !== 'undefined' && settings.imageFormat !== null && _utils2['default'].values(_constants.ImageFormat).indexOf(settings.imageFormat) === -1) {
	        throw new Error('Invalid image format: ' + settings.imageFormat);
	      } else if (typeof imageFormat === 'undefined') {
	        settings.imageFormat = _constants.ImageFormat.PNG;
	      }

	      // Render type 'buffer' only available in node
	      if (settings.renderType === _constants.RenderType.BUFFER && typeof process === 'undefined') {
	        throw new Error('Render type \'buffer\' is only available when using node.js');
	      }

	      return settings;
	    }
	  }, {
	    key: 'export',

	    /**
	     * Exports the image from the given canvas with the given options
	     * @param  {Image} image
	     * @param  {Canvas} canvas
	     * @param  {ImglyKit.RenderType} renderType
	     * @param  {ImglyKit.ImageFormat} imageFormat
	     * @param  {Number} quality = 0.8
	     * @return {Promise}
	     */
	    value: function _export(image, canvas, renderType, imageFormat) {
	      var quality = arguments[4] === undefined ? 0.8 : arguments[4];

	      return new Promise(function (resolve, reject) {
	        var result = undefined;
	        if (renderType === _constants.RenderType.IMAGE || renderType === _constants.RenderType.DATAURL) {
	          if (typeof window === 'undefined') {
	            // Quality not supported in node environment / node-canvas
	            result = canvas.toDataURL(imageFormat);
	          } else {
	            result = canvas.toDataURL(imageFormat, quality);
	          }

	          // When image's `src` attribute is a jpeg data url, we can restore
	          // the exif information
	          var jpegMatch = /^data:image\/jpeg/i;
	          if (image.src.match(jpegMatch) && result.match(jpegMatch)) {
	            result = _exifRestorer2['default'].restore(image.src, result);
	          }
	        }

	        if (renderType === _constants.RenderType.IMAGE) {
	          var outputImage = undefined;

	          /* istanbul ignore else  */
	          if (typeof window === 'undefined') {
	            // Not a browser environment
	            var CanvasImage = __webpack_require__(53).Image;
	            outputImage = new CanvasImage();
	          } else {
	            outputImage = new Image();
	          }

	          outputImage.src = result;
	          resolve(outputImage);
	        } else if (renderType === _constants.RenderType.DATAURL) {
	          resolve(result);
	        } else if (renderType === _constants.RenderType.BUFFER) {
	          resolve(canvas.toBuffer());
	        } else if (renderType === _constants.RenderType.BLOB) {
	          canvas.toBlob(function (blob) {
	            resolve(blob);
	          }, imageFormat, quality);
	        }
	      });
	    }
	  }]);

	  return ImageExporter;
	})();

	exports['default'] = ImageExporter;
	module.exports = exports['default'];
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(74)))

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var VERSION_CHECK_FN = 'imglySDKVersionCallback';
	var VERSION_CHECK_URL = 'http://sdk.img.ly/version.json?sdk=html5&jsoncallback=' + VERSION_CHECK_FN;

	var VersionChecker = (function () {
	  function VersionChecker(version) {
	    _classCallCheck(this, VersionChecker);

	    this._version = version;
	    this._check();
	  }

	  _createClass(VersionChecker, [{
	    key: '_check',

	    /**
	     * Checks if this version of the SDK is outdated
	     * @private
	     */
	    value: function _check() {
	      var self = this;
	      window[VERSION_CHECK_FN] = function (response) {
	        if (response.outdated) {
	          console.warn('imgly-sdk-html5: Your version ' + self._version + ' is outdated.');
	          console.warn('imgly-sdk-html5: Current version is ' + response.version + '.');
	        }
	      };

	      var script = document.createElement('script');
	      script.src = VERSION_CHECK_URL + '&version=' + this._version;
	      script.async = true;
	      document.getElementsByTagName('head')[0].appendChild(script);
	    }
	  }]);

	  return VersionChecker;
	})();

	exports['default'] = VersionChecker;
	module.exports = exports['default'];

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	/**
	 * The available render types
	 * @enum {string}
	 * @alias ImglyKit.RenderType
	 */
	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	var RenderType = {
	  IMAGE: 'image',
	  DATAURL: 'data-url',
	  BUFFER: 'buffer',
	  BLOB: 'blob'
	};

	exports.RenderType = RenderType;
	/**
	 * The available output image formats
	 * @enum {string}
	 * @alias ImglyKit.ImageFormat
	 */
	var ImageFormat = {
	  PNG: 'image/png',
	  JPEG: 'image/jpeg'
	};
	exports.ImageFormat = ImageFormat;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/* global HTMLElement */
	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var _mathVector2 = __webpack_require__(50);

	var _mathVector22 = _interopRequireDefault(_mathVector2);

	/**
	 * Provides utility functions for internal use
	 * @class
	 * @alias ImglyKit.Utils
	 * @private
	 */

	var Utils = (function () {
	  function Utils() {
	    _classCallCheck(this, Utils);
	  }

	  _createClass(Utils, null, [{
	    key: 'isArray',

	    /**
	     * Checks if the given object is an Array
	     * @param  {Object}  object
	     * @return {Boolean}
	     */
	    value: function isArray(object) {
	      return Object.prototype.toString.call(object) === '[object Array]';
	    }
	  }, {
	    key: 'select',

	    /**
	     * Returns the items selected by the given selector
	     * @param  {Array} items
	     * @param  {ImglyKit~Selector} selector - The selector
	     * @return {Array} The selected items
	     */
	    value: function select(items) {
	      var selector = arguments[1] === undefined ? null : arguments[1];

	      if (selector === null) {
	        return items;
	      }

	      // Turn string parameter into an array
	      if (typeof selector === 'string') {
	        selector = selector.split(',').map(function (identifier) {
	          return identifier.trim();
	        });
	      }

	      // Turn array parameter into an object with `only`
	      if (Utils.isArray(selector)) {
	        selector = { only: selector };
	      }

	      if (typeof selector.only !== 'undefined') {
	        if (typeof selector.only === 'string') {
	          selector.only = selector.only.split(',').map(function (identifier) {
	            return identifier.trim();
	          });
	        }

	        // Select only the given identifiers
	        return items.filter(function (item) {
	          return selector.only.indexOf(item) !== -1;
	        });
	      } else if (typeof selector.except !== 'undefined') {
	        if (typeof selector.except === 'string') {
	          selector.except = selector.except.split(',').map(function (identifier) {
	            return identifier.trim();
	          });
	        }

	        // Select all but the given identifiers
	        return items.filter(function (item) {
	          return selector.except.indexOf(item) === -1;
	        });
	      }

	      throw new Error('Utils#select failed to filter items.');
	    }
	  }, {
	    key: 'values',

	    /**
	     * Returns the given object's values as an array
	     * @param {Object} object
	     * @returns {Array<*>}
	     */
	    value: function values(object) {
	      var values = [];
	      for (var key in object) {
	        values.push(object[key]);
	      }
	      return values;
	    }
	  }, {
	    key: 'isDOMElement',

	    /**
	     * Checks if the given object is a DOM element
	     * @param  {Object}  o
	     * @return {Boolean}
	     */
	    /* istanbul ignore next */
	    value: function isDOMElement(o) {
	      return typeof HTMLElement === 'object' ? o instanceof HTMLElement : o && typeof o === 'object' && o !== null && o.nodeType === 1 && typeof o.nodeName === 'string';
	    }
	  }, {
	    key: 'getEventPosition',

	    /**
	     * Gets the x and y position for the given event.
	     * @param {Event} e
	     * @return {Vector2}
	     */
	    value: function getEventPosition(e) {
	      var x = e.pageX;
	      var y = e.pageY;
	      if (e.type.indexOf('touch') !== -1) {
	        x = e.touches[0].pageX;
	        y = e.touches[0].pageY;
	      }
	      return new _mathVector22['default'](x, y);
	    }
	  }]);

	  return Utils;
	})();

	exports['default'] = Utils;
	module.exports = exports['default'];

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	/**
	 * Represents a color
	 * @class
	 * @alias ImglyKit.Color
	 * @param {Number} r
	 * @param {Number} g
	 * @param {Number} b
	 * @param {Number} [a]
	 * @private
	 */
	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var Color = (function () {
	  function Color(r, g, b, a) {
	    _classCallCheck(this, Color);

	    if (typeof a === 'undefined') {
	      a = 1;
	    }

	    this.r = r;
	    this.g = g;
	    this.b = b;
	    this.a = a;
	  }

	  _createClass(Color, [{
	    key: 'toRGBA',

	    /**
	     * Returns an rgba() representation of this color
	     * @return {String}
	     */
	    value: function toRGBA() {
	      var colors = [Math.round(this.r * 255), Math.round(this.g * 255), Math.round(this.b * 255), this.a];
	      return 'rgba(' + colors.join(',') + ')';
	    }
	  }, {
	    key: 'toHex',

	    /**
	     * Returns a hex representation of this color
	     * @return {String}
	     */
	    value: function toHex() {
	      var components = [this._componentToHex(Math.round(this.r * 255)), this._componentToHex(Math.round(this.g * 255)), this._componentToHex(Math.round(this.b * 255))];
	      return '#' + components.join('');
	    }
	  }, {
	    key: 'toGLColor',

	    /**
	     * Returns an array with 4 values (0...1)
	     * @return {Array.<Number>}
	     */
	    value: function toGLColor() {
	      return [this.r, this.g, this.b, this.a];
	    }
	  }, {
	    key: 'toRGBGLColor',

	    /**
	     * Returns an array with 3 values (0...1)
	     * @return {Array.<Number>}
	     */
	    value: function toRGBGLColor() {
	      return [this.r, this.g, this.b];
	    }
	  }, {
	    key: 'toHSV',

	    /**
	     * Converts the RGB value to HSV
	     * @return {Array.<Number>}
	     */
	    value: function toHSV() {
	      var max = Math.max(this.r, this.g, this.b);
	      var min = Math.min(this.r, this.g, this.b);
	      var h = undefined;
	      var s = undefined;
	      var v = max;
	      var d = max - min;
	      s = max === 0 ? 0 : d / max;

	      if (max === min) {
	        h = 0 // achromatic
	        ;
	      } else {
	        switch (max) {
	          case this.r:
	            h = (this.g - this.b) / d + (this.g < this.b ? 6 : 0);
	            break;
	          case this.g:
	            h = (this.b - this.r) / d + 2;
	            break;
	          case this.b:
	            h = (this.r - this.g) / d + 4;
	            break;
	        }
	        h /= 6;
	      }

	      return [h, s, v];
	    }
	  }, {
	    key: 'fromHSV',

	    /**
	     * Sets the RGB values of this color to match the given HSV values
	     * @param {Number} h
	     * @param {Number} s
	     * @param {Number} v
	     */
	    value: function fromHSV(h, s, v) {
	      var r = this.r;
	      var g = this.g;
	      var b = this.b;

	      var i = Math.floor(h * 6);
	      var f = h * 6 - i;
	      var p = v * (1 - s);
	      var q = v * (1 - f * s);
	      var t = v * (1 - (1 - f) * s);

	      switch (i % 6) {
	        case 0:
	          r = v;
	          g = t;
	          b = p;
	          break;
	        case 1:
	          r = q;
	          g = v;
	          b = p;
	          break;
	        case 2:
	          r = p;
	          g = v;
	          b = t;
	          break;
	        case 3:
	          r = p;
	          g = q;
	          b = v;
	          break;
	        case 4:
	          r = t;
	          g = p;
	          b = v;
	          break;
	        case 5:
	          r = v;
	          g = p;
	          b = q;
	          break;
	      }

	      this.r = r;
	      this.g = g;
	      this.b = b;
	    }
	  }, {
	    key: 'clone',

	    /**
	     * Returns a clone of the current color
	     * @return {Color}
	     */
	    value: function clone() {
	      return new Color(this.r, this.g, this.b, this.a);
	    }
	  }, {
	    key: '_componentToHex',

	    /**
	     * Returns the given number as hex
	     * @param  {Number} component
	     * @return {String}
	     * @private
	     */
	    value: function _componentToHex(component) {
	      var hex = component.toString(16);
	      return hex.length === 1 ? '0' + hex : hex;
	    }
	  }, {
	    key: 'toString',

	    /**
	     * Returns the string representation of this color
	     * @returns {String}
	     */
	    value: function toString() {
	      return 'Color(' + this.r + ', ' + this.g + ', ' + this.b + ', ' + this.a + ')';
	    }
	  }]);

	  return Color;
	})();

	exports['default'] = Color;
	module.exports = exports['default'];

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/* jshint unused: false */
	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	/**
	 * Base class for filters. Extendable via {@link ImglyKit.Filter#extend}
	 * @class
	 * @alias ImglyKit.Filter
	 */
	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var Filter = (function () {
	  function Filter() {
	    _classCallCheck(this, Filter);
	  }

	  _createClass(Filter, [{
	    key: 'render',

	    /**
	     * Renders the filter
	     * @param  {Renderer} renderer
	     * @return {Promise}
	     */
	    value: function render(renderer) {
	      /* istanbul ignore next */
	      throw new Error('Filter#render is abstract and not implemented in inherited class.');
	    }
	  }], [{
	    key: 'identifier',

	    /**
	     * A unique string that identifies this operation. Can be used to select
	     * the active filter.
	     * @type {String}
	     */
	    get: function () {
	      return null;
	    }
	  }]);

	  return Filter;
	})();

	/**
	 * To create an {@link ImglyKit.Filter} class of your own, call this
	 * method and provide instance properties and functions.
	 * @function
	 */
	Filter.extend = __webpack_require__(58);

	// Exposed classes
	Filter.PrimitivesStack = __webpack_require__(59);
	Filter.Primitives = {};
	Filter.Primitives.Saturation = __webpack_require__(60);
	Filter.Primitives.LookupTable = __webpack_require__(61);
	Filter.Primitives.ToneCurve = __webpack_require__(62);
	Filter.Primitives.SoftColorOverlay = __webpack_require__(63);
	Filter.Primitives.Desaturation = __webpack_require__(64);
	Filter.Primitives.X400 = __webpack_require__(65);
	Filter.Primitives.Grayscale = __webpack_require__(66);
	Filter.Primitives.Contrast = __webpack_require__(67);
	Filter.Primitives.Glow = __webpack_require__(68);
	Filter.Primitives.Gobblin = __webpack_require__(69);
	Filter.Primitives.Brightness = __webpack_require__(70);

	exports['default'] = Filter;
	module.exports = exports['default'];

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/* jshint unused:false */
	/* jshint -W083 */
	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _lodash = __webpack_require__(1);

	var _lodash2 = _interopRequireDefault(_lodash);

	var _libMathVector2 = __webpack_require__(50);

	var _libMathVector22 = _interopRequireDefault(_libMathVector2);

	var _libColor = __webpack_require__(7);

	var _libColor2 = _interopRequireDefault(_libColor);

	var _libEventEmitter = __webpack_require__(72);

	var _libEventEmitter2 = _interopRequireDefault(_libEventEmitter);

	/**
	 * To create an {@link ImglyKit.Operation} class of your own, call this
	 * method and provide instance properties and functions.
	 * @function
	 */

	var _libExtend = __webpack_require__(58);

	var _libExtend2 = _interopRequireDefault(_libExtend);

	/**
	 * Base class for Operations. Extendable via {@link ImglyKit.Operation#extend}.
	 * @class
	 * @alias ImglyKit.Operation
	 */

	var Operation = (function (_EventEmitter) {
	  function Operation(kit, options) {
	    _classCallCheck(this, Operation);

	    _get(Object.getPrototypeOf(Operation.prototype), 'constructor', this).call(this);

	    if (kit.constructor.name !== 'ImglyKit') {
	      throw new Error('Operation: First parameter for constructor has to be an ImglyKit instance.');
	    }

	    this._kit = kit;
	    this.availableOptions = _lodash2['default'].extend(this.availableOptions || {}, {
	      numberFormat: { type: 'string', 'default': 'relative', available: ['absolute', 'relative'] }
	    });
	    this._dirty = true;

	    this._uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
	      var r = Math.random() * 16 | 0;
	      var v = c === 'x' ? r : r & 3 | 8;
	      return v.toString(16);
	    });

	    this._initOptions(options || {});
	  }

	  _inherits(Operation, _EventEmitter);

	  _createClass(Operation, [{
	    key: 'validateSettings',

	    /**
	     * Checks whether this Operation can be applied the way it is configured
	     * @return {Promise}
	     */
	    value: function validateSettings() {
	      var _this = this;

	      var identifier = this.identifier;
	      return new Promise(function (resolve, reject) {
	        // Check for required options
	        for (var optionName in _this.availableOptions) {
	          var optionConfig = _this.availableOptions[optionName];
	          if (optionConfig.required && typeof _this._options[optionName] === 'undefined') {
	            return reject(new Error('Operation `' + identifier + '`: Option `' + optionName + '` is required.'));
	          }
	        }

	        resolve();
	      });
	    }
	  }, {
	    key: 'render',

	    /**
	     * Applies this operation
	     * @param  {Renderer} renderer
	     * @return {Promise}
	     * @abstract
	     */
	    value: function render(renderer) {
	      var renderFn = undefined;
	      if (renderer.identifier === 'webgl') {
	        /* istanbul ignore next */
	        renderFn = this._renderWebGL.bind(this);
	      } else {
	        renderFn = this._renderCanvas.bind(this);
	      }

	      // Handle caching
	      if (this._dirty) {
	        renderFn(renderer);
	        renderer.cache(this._uuid);
	        this._dirty = false;
	      } else {
	        renderer.drawCached(this._uuid);
	      }
	    }
	  }, {
	    key: '_renderWebGL',

	    /**
	     * Applies this operation using WebGL
	     * @return {WebGLRenderer} renderer
	     * @private
	     */
	    /* istanbul ignore next */
	    value: function _renderWebGL() {
	      throw new Error('Operation#_renderWebGL is abstract and not implemented in inherited class.');
	    }
	  }, {
	    key: '_renderCanvas',

	    /**
	     * Applies this operation using Canvas2D
	     * @return {CanvasRenderer} renderer
	     * @private
	     */
	    value: function _renderCanvas() {
	      throw new Error('Operation#_renderCanvas is abstract and not implemented in inherited class.');
	    }
	  }, {
	    key: '_initOptions',

	    /**
	     * Goes through the available options, sets _options defaults
	     * @param {Object} userOptions
	     * @private
	     */
	    value: function _initOptions(userOptions) {
	      this._options = {};

	      // Set defaults, create getters and setters
	      var optionName, option, capitalized;
	      var self = this;
	      for (optionName in this.availableOptions) {
	        capitalized = optionName.charAt(0).toUpperCase() + optionName.slice(1);
	        option = this.availableOptions[optionName];

	        // Create setter and getter
	        var fn = function fn(optionName, option) {
	          self['set' + capitalized] = function (value) {
	            self._setOption(optionName, value);
	          };

	          // Default getter
	          self['get' + capitalized] = function () {
	            return self._getOption(optionName);
	          };
	        };
	        fn(optionName, option);

	        // Set default if available
	        if (typeof option['default'] !== 'undefined') {
	          this['set' + capitalized](option['default']);
	        }
	      }

	      // Overwrite options with the ones given by user
	      for (optionName in userOptions) {
	        // Check if option is available
	        if (typeof this.availableOptions[optionName] === 'undefined') {
	          throw new Error('Invalid option: ' + optionName);
	        }

	        // Call setter
	        capitalized = optionName.charAt(0).toUpperCase() + optionName.slice(1);
	        this['set' + capitalized](userOptions[optionName]);
	      }
	    }
	  }, {
	    key: 'set',

	    /**
	     * Sets the given options
	     * @param {Object} options
	     */
	    value: function set(options) {
	      for (var optionName in options) {
	        this._setOption(optionName, options[optionName], false);
	      }

	      this.emit('update');
	    }
	  }, {
	    key: '_getOption',

	    /**
	     * Returns the value for the given option
	     * @param {String} optionName
	     * @return {*}
	     * @private
	     */
	    value: function _getOption(optionName) {
	      return this._options[optionName];
	    }
	  }, {
	    key: '_setOption',

	    /**
	     * Sets the value for the given option, validates it
	     * @param {String} optionName
	     * @param {*} value
	     * @param {Boolean} update
	     * @private
	     */
	    value: function _setOption(optionName, value) {
	      var update = arguments[2] === undefined ? true : arguments[2];

	      var optionConfig = this.availableOptions[optionName];
	      var identifier = this.identifier;

	      if (typeof optionConfig.setter !== 'undefined') {
	        value = optionConfig.setter.call(this, value);
	      }

	      if (typeof optionConfig.validation !== 'undefined') {
	        optionConfig.validation(value);
	      }

	      switch (optionConfig.type) {
	        // String options
	        case 'string':
	          if (typeof value !== 'string') {
	            throw new Error('Operation `' + identifier + '`: Option `' + optionName + '` has to be a string.');
	          }

	          // String value restrictions
	          var available = optionConfig.available;
	          if (typeof available !== 'undefined' && available.indexOf(value) === -1) {
	            throw new Error('Operation `' + identifier + '`: Invalid value for `' + optionName + '` (valid values are: ' + optionConfig.available.join(', ') + ')');
	          }

	          this._options[optionName] = value;
	          break;

	        // Number options
	        case 'number':
	          if (typeof value !== 'number') {
	            throw new Error('Operation `' + identifier + '`: Option `' + optionName + '` has to be a number.');
	          }

	          this._options[optionName] = value;
	          break;

	        // Boolean options
	        case 'boolean':
	          if (typeof value !== 'boolean') {
	            throw new Error('Operation `' + identifier + '`: Option `' + optionName + '` has to be a boolean.');
	          }

	          this._options[optionName] = value;
	          break;

	        // Vector2 options
	        case 'vector2':
	          if (!(value instanceof _libMathVector22['default'])) {
	            throw new Error('Operation `' + identifier + '`: Option `' + optionName + '` has to be an instance of ImglyKit.Vector2.');
	          }

	          this._options[optionName] = value.clone();

	          break;

	        // Color options
	        case 'color':
	          if (!(value instanceof _libColor2['default'])) {
	            throw new Error('Operation `' + identifier + '`: Option `' + optionName + '` has to be an instance of ImglyKit.Color.');
	          }

	          this._options[optionName] = value;
	          break;

	        // Object options
	        case 'object':
	          this._options[optionName] = value;
	          break;
	      }

	      this._dirty = true;
	      if (update) {
	        this.emit('update');
	      }
	    }
	  }, {
	    key: 'getNewDimensions',

	    /**
	     * Gets the new dimensions
	     * @param {Renderer} renderer
	     * @param {Vector2} [dimensions]
	     * @return {Vector2}
	     * @private
	     */
	    value: function getNewDimensions(renderer, dimensions) {
	      var canvas = renderer.getCanvas();
	      dimensions = dimensions || new _libMathVector22['default'](canvas.width, canvas.height);

	      return dimensions;
	    }
	  }, {
	    key: 'dirty',

	    /**
	     * Sets this operation to dirty, so that it will re-render next time
	     * @param {Boolean} dirty = true
	     */
	    set: function (dirty) {
	      this._dirty = dirty;
	    },

	    /**
	     * Returns the dirty state
	     * @type {Boolean}
	     */
	    get: function () {
	      return this._dirty;
	    }
	  }]);

	  return Operation;
	})(_libEventEmitter2['default']);

	/**
	 * A unique string that identifies this operation. Can be used to select
	 * operations.
	 * @type {String}
	 */
	Operation.prototype.identifier = null;
	Operation.extend = _libExtend2['default'];

	exports['default'] = Operation;
	module.exports = exports['default'];

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _operation = __webpack_require__(9);

	var _operation2 = _interopRequireDefault(_operation);

	var _filtersIdentityFilter = __webpack_require__(71);

	var _filtersIdentityFilter2 = _interopRequireDefault(_filtersIdentityFilter);

	/**
	 * An operation that can apply a selected filter
	 *
	 * @class
	 * @alias ImglyKit.Operations.FiltersOperation
	 * @extends ImglyKit.Operation
	 */

	var FiltersOperation = (function (_Operation) {
	  function FiltersOperation() {
	    _classCallCheck(this, FiltersOperation);

	    if (_Operation != null) {
	      _Operation.apply(this, arguments);
	    }
	  }

	  _inherits(FiltersOperation, _Operation);

	  _createClass(FiltersOperation, [{
	    key: '_renderWebGL',

	    /**
	     * Renders the filter using WebGL
	     * @param  {WebGLRenderer} renderer
	     * @override
	     */
	    /* istanbul ignore next */
	    value: function _renderWebGL(renderer) {
	      this._render(renderer);
	    }
	  }, {
	    key: '_renderCanvas',

	    /**
	     * Renders the filter using Canvas2D
	     * @param {CanvasRenderer} renderer
	     * @override
	     */
	    value: function _renderCanvas(renderer) {
	      this._render(renderer);
	    }
	  }, {
	    key: '_render',

	    /**
	     * Renders the filter (all renderers supported)
	     * @param {Renderer} renderer
	     * @private
	     */
	    value: function _render(renderer) {
	      this._selectedFilter.render(renderer);
	    }
	  }]);

	  return FiltersOperation;
	})(_operation2['default']);

	/**
	 * A unique string that identifies this operation. Can be used to select
	 * operations.
	 * @type {String}
	 */
	FiltersOperation.prototype.identifier = 'filters';

	/**
	 * Specifies the available options for this operation
	 * @type {Object}
	 */
	FiltersOperation.prototype.availableOptions = {
	  filter: { type: 'object', 'default': _filtersIdentityFilter2['default'],
	    setter: function setter(Filter) {
	      this._selectedFilter = new Filter();
	      return Filter;
	    }
	  }
	};

	exports['default'] = FiltersOperation;
	module.exports = exports['default'];

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _operation = __webpack_require__(9);

	var _operation2 = _interopRequireDefault(_operation);

	var _libMathVector2 = __webpack_require__(50);

	var _libMathVector22 = _interopRequireDefault(_libMathVector2);

	/**
	 * An operation that can crop out a part of the image
	 *
	 * @class
	 * @alias ImglyKit.Operations.CropOperation
	 * @extends ImglyKit.Operation
	 */

	var CropOperation = (function (_Operation) {
	  function CropOperation() {
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    _classCallCheck(this, CropOperation);

	    _get(Object.getPrototypeOf(CropOperation.prototype), 'constructor', this).apply(this, args);

	    /**
	     * The fragment shader used for this operation
	     */
	    this.fragmentShader = '\n      precision mediump float;\n      uniform sampler2D u_image;\n      varying vec2 v_texCoord;\n      uniform vec2 u_cropStart;\n      uniform vec2 u_cropEnd;\n\n      void main() {\n        vec2 size = u_cropEnd - u_cropStart;\n        gl_FragColor = texture2D(u_image, v_texCoord * size + u_cropStart);\n      }\n    ';
	  }

	  _inherits(CropOperation, _Operation);

	  _createClass(CropOperation, [{
	    key: '_renderWebGL',

	    /**
	     * Rotates and crops the image using WebGL
	     * @param  {WebGLRenderer} renderer
	     * @override
	     * @private
	     */
	    /* istanbul ignore next */
	    value: function _renderWebGL(renderer) {
	      var canvas = renderer.getCanvas();
	      var canvasSize = new _libMathVector22['default'](canvas.width, canvas.height);

	      var start = this._options.start.clone();
	      var end = this._options.end.clone();

	      if (this._options.numberFormat === 'absolute') {
	        start.divide(canvasSize);
	        end.divide(canvasSize);
	      }

	      // 0..1 > 1..0 on y-axis
	      var originalStartY = start.y;
	      start.y = 1 - end.y;
	      end.y = 1 - originalStartY;

	      // The new size
	      var newDimensions = this.getNewDimensions(renderer);

	      // Resize the canvas
	      canvas.width = newDimensions.x;
	      canvas.height = newDimensions.y;

	      // Run the cropping shader
	      renderer.runShader(null, this.fragmentShader, {
	        uniforms: {
	          u_cropStart: { type: '2f', value: [start.x, start.y] },
	          u_cropEnd: { type: '2f', value: [end.x, end.y] }
	        }
	      });
	    }
	  }, {
	    key: '_renderCanvas',

	    /**
	     * Crops the image using Canvas
	     * @param {CanvasRenderer} renderer
	     * @override
	     * @private
	     */
	    value: function _renderCanvas(renderer) {
	      var canvas = renderer.getCanvas();
	      var dimensions = new _libMathVector22['default'](canvas.width, canvas.height);

	      var newDimensions = this.getNewDimensions(renderer);

	      // Create a temporary canvas to draw to
	      var newCanvas = renderer.createCanvas();
	      newCanvas.width = newDimensions.x;
	      newCanvas.height = newDimensions.y;
	      var newContext = newCanvas.getContext('2d');

	      // The upper left corner of the cropped area on the original image
	      var startPosition = this._options.start.clone();

	      if (this._options.numberFormat === 'relative') {
	        startPosition.multiply(dimensions);
	      }

	      // Draw the source canvas onto the new one
	      newContext.drawImage(canvas, startPosition.x, startPosition.y, // source x, y
	      newDimensions.x, newDimensions.y, // source dimensions
	      0, 0, // destination x, y
	      newDimensions.x, newDimensions.y // destination dimensions
	      );

	      // Set the new canvas
	      renderer.setCanvas(newCanvas);
	    }
	  }, {
	    key: 'getNewDimensions',

	    /**
	     * Gets the new dimensions
	     * @param {Renderer} renderer
	     * @param {Vector2} [dimensions]
	     * @return {Vector2}
	     */
	    value: function getNewDimensions(renderer, dimensions) {
	      var canvas = renderer.getCanvas();
	      dimensions = dimensions || new _libMathVector22['default'](canvas.width, canvas.height);

	      var newDimensions = this._options.end.clone().subtract(this._options.start);

	      if (this._options.numberFormat === 'relative') {
	        newDimensions.multiply(dimensions);
	      }

	      return newDimensions;
	    }
	  }]);

	  return CropOperation;
	})(_operation2['default']);

	/**
	 * A unique string that identifies this operation. Can be used to select
	 * operations.
	 * @type {String}
	 */
	CropOperation.prototype.identifier = 'crop';

	/**
	 * Specifies the available options for this operation
	 * @type {Object}
	 */
	CropOperation.prototype.availableOptions = {
	  start: { type: 'vector2', required: true, 'default': new _libMathVector22['default'](0, 0) },
	  end: { type: 'vector2', required: true, 'default': new _libMathVector22['default'](1, 1) }
	};

	exports['default'] = CropOperation;
	module.exports = exports['default'];

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _operation = __webpack_require__(9);

	var _operation2 = _interopRequireDefault(_operation);

	var _libMathVector2 = __webpack_require__(50);

	var _libMathVector22 = _interopRequireDefault(_libMathVector2);

	/**
	 * An operation that can crop out a part of the image and rotates it
	 *
	 * @class
	 * @alias ImglyKit.Operations.RotationOperation
	 * @extends ImglyKit.Operation
	 */

	var RotationOperation = (function (_Operation) {
	  function RotationOperation() {
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    _classCallCheck(this, RotationOperation);

	    _get(Object.getPrototypeOf(RotationOperation.prototype), 'constructor', this).apply(this, args);

	    /**
	     * The fragment shader used for this operation
	     */
	    this.vertexShader = '\n      attribute vec2 a_position;\n      attribute vec2 a_texCoord;\n      varying vec2 v_texCoord;\n      uniform mat3 u_matrix;\n\n      void main() {\n        gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);\n        v_texCoord = a_texCoord;\n      }\n    ';
	  }

	  _inherits(RotationOperation, _Operation);

	  _createClass(RotationOperation, [{
	    key: '_renderWebGL',

	    /**
	     * Rotates the image using WebGL
	     * @param  {WebGLRenderer} renderer
	     */
	    /* istanbul ignore next */
	    value: function _renderWebGL(renderer) {
	      var canvas = renderer.getCanvas();

	      var actualDegrees = this._options.degrees % 360;

	      // If we're not rotating by 180 degrees, we need to resize the canvas
	      // and the texture
	      if (actualDegrees % 180 !== 0) {
	        var newDimensions = this.getNewDimensions(renderer);

	        // Resize the canvas
	        canvas.width = newDimensions.x;
	        canvas.height = newDimensions.y;
	      }

	      // Build the rotation matrix
	      var radians = actualDegrees * (Math.PI / 180);
	      var c = Math.cos(radians);
	      var s = Math.sin(radians);
	      var rotationMatrix = [c, -s, 0, s, c, 0, 0, 0, 1];

	      // Run the shader
	      renderer.runShader(this.vertexShader, null, {
	        uniforms: {
	          u_matrix: { type: 'mat3fv', value: rotationMatrix }
	        }
	      });
	    }
	  }, {
	    key: '_renderCanvas',

	    /**
	     * Crops the image using Canvas2D
	     * @param  {CanvasRenderer} renderer
	     */
	    value: function _renderCanvas(renderer) {
	      var canvas = renderer.getCanvas();

	      var actualDegrees = this._options.degrees % 360;
	      var newDimensions = this.getNewDimensions(renderer);

	      // Create a rotated canvas
	      var newCanvas = renderer.createCanvas();
	      newCanvas.width = newDimensions.x;
	      newCanvas.height = newDimensions.y;
	      var newContext = newCanvas.getContext('2d');

	      newContext.save();

	      // Translate the canvas
	      newContext.translate(newCanvas.width / 2, newCanvas.height / 2);

	      // Rotate the canvas
	      newContext.rotate(actualDegrees * (Math.PI / 180));

	      // Create a temporary canvas so that we can draw the image
	      // with the applied transformation
	      var tempCanvas = renderer.cloneCanvas();
	      newContext.drawImage(tempCanvas, -canvas.width / 2, -canvas.height / 2);

	      // Restore old transformation
	      newContext.restore();

	      renderer.setCanvas(newCanvas);
	    }
	  }, {
	    key: 'getNewDimensions',

	    /**
	     * Gets the new dimensions
	     * @param {Renderer} renderer
	     * @param {Vector2} [dimensions]
	     * @return {Vector2}
	     */
	    value: function getNewDimensions(renderer, dimensions) {
	      var canvas = renderer.getCanvas();
	      dimensions = dimensions || new _libMathVector22['default'](canvas.width, canvas.height);

	      var actualDegrees = this._options.degrees % 360;
	      if (actualDegrees % 180 !== 0) {
	        var tempX = dimensions.x;
	        dimensions.x = dimensions.y;
	        dimensions.y = tempX;
	      }

	      return dimensions;
	    }
	  }]);

	  return RotationOperation;
	})(_operation2['default']);

	/**
	 * A unique string that identifies this operation. Can be used to select
	 * operations.
	 * @type {String}
	 */
	RotationOperation.prototype.identifier = 'rotation';

	/**
	 * Specifies the available options for this operation
	 * @type {Object}
	 */
	RotationOperation.prototype.availableOptions = {
	  degrees: { type: 'number', 'default': 0, validation: function validation(value) {
	      if (value % 90 !== 0) {
	        throw new Error('RotationOperation: `rotation` has to be a multiple of 90.');
	      }
	    } }
	};

	exports['default'] = RotationOperation;
	module.exports = exports['default'];

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _operation = __webpack_require__(9);

	var _operation2 = _interopRequireDefault(_operation);

	var _filtersPrimitivesStack = __webpack_require__(59);

	var _filtersPrimitivesStack2 = _interopRequireDefault(_filtersPrimitivesStack);

	var _filtersPrimitivesSaturation = __webpack_require__(60);

	var _filtersPrimitivesSaturation2 = _interopRequireDefault(_filtersPrimitivesSaturation);

	/**
	 * @class
	 * @alias ImglyKit.Operations.SaturationOperation
	 * @extends ImglyKit.Operation
	 */

	var SaturationOperation = (function (_Operation) {
	  function SaturationOperation() {
	    _classCallCheck(this, SaturationOperation);

	    if (_Operation != null) {
	      _Operation.apply(this, arguments);
	    }
	  }

	  _inherits(SaturationOperation, _Operation);

	  _createClass(SaturationOperation, [{
	    key: '_renderWebGL',

	    /**
	     * Renders the saturation using WebGL
	     * @param  {WebGLRenderer} renderer
	     * @override
	     */
	    /* istanbul ignore next */
	    value: function _renderWebGL(renderer) {
	      this._render(renderer);
	    }
	  }, {
	    key: '_renderCanvas',

	    /**
	     * Renders the saturation using Canvas2D
	     * @param {CanvasRenderer} renderer
	     * @override
	     */
	    value: function _renderCanvas(renderer) {
	      this._render(renderer);
	    }
	  }, {
	    key: '_render',

	    /**
	     * Renders the saturation (all renderers supported)
	     * @param  {Renderer} renderer
	     * @private
	     */
	    value: function _render(renderer) {
	      var stack = new _filtersPrimitivesStack2['default']();

	      stack.add(new _filtersPrimitivesSaturation2['default']({
	        saturation: this._options.saturation
	      }));

	      stack.render(renderer);
	    }
	  }]);

	  return SaturationOperation;
	})(_operation2['default']);

	/**
	 * A unique string that identifies this operation. Can be used to select
	 * operations.
	 * @type {String}
	 */
	SaturationOperation.prototype.identifier = 'saturation';

	/**
	 * Specifies the available options for this operation
	 * @type {Object}
	 */
	SaturationOperation.prototype.availableOptions = {
	  saturation: { type: 'number', 'default': 1 }
	};

	exports['default'] = SaturationOperation;
	module.exports = exports['default'];

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _operation = __webpack_require__(9);

	var _operation2 = _interopRequireDefault(_operation);

	var _filtersPrimitivesStack = __webpack_require__(59);

	var _filtersPrimitivesStack2 = _interopRequireDefault(_filtersPrimitivesStack);

	var _filtersPrimitivesContrast = __webpack_require__(67);

	var _filtersPrimitivesContrast2 = _interopRequireDefault(_filtersPrimitivesContrast);

	/**
	 * @class
	 * @alias ImglyKit.Operations.ContrastOperation
	 * @extends ImglyKit.Operation
	 */

	var ContrastOperation = (function (_Operation) {
	  function ContrastOperation() {
	    _classCallCheck(this, ContrastOperation);

	    if (_Operation != null) {
	      _Operation.apply(this, arguments);
	    }
	  }

	  _inherits(ContrastOperation, _Operation);

	  _createClass(ContrastOperation, [{
	    key: '_renderWebGL',

	    /**
	     * Renders the contrast using WebGL
	     * @param  {WebGLRenderer} renderer
	     * @override
	     */
	    /* istanbul ignore next */
	    value: function _renderWebGL(renderer) {
	      this._render(renderer);
	    }
	  }, {
	    key: '_renderCanvas',

	    /**
	     * Renders the contrast using Canvas2D
	     * @param {CanvasRenderer} renderer
	     * @override
	     */
	    value: function _renderCanvas(renderer) {
	      this._render(renderer);
	    }
	  }, {
	    key: '_render',

	    /**
	     * Renders the contrast (all renderers supported)
	     * @param  {Renderer} renderer
	     * @private
	     */
	    value: function _render(renderer) {
	      var stack = new _filtersPrimitivesStack2['default']();

	      stack.add(new _filtersPrimitivesContrast2['default']({
	        contrast: this._options.contrast
	      }));

	      stack.render(renderer);
	    }
	  }]);

	  return ContrastOperation;
	})(_operation2['default']);

	/**
	 * A unique string that identifies this operation. Can be used to select
	 * operations.
	 * @type {String}
	 */
	ContrastOperation.prototype.identifier = 'contrast';

	/**
	 * Specifies the available options for this operation
	 * @type {Object}
	 */
	ContrastOperation.prototype.availableOptions = {
	  contrast: { type: 'number', 'default': 1 }
	};

	exports['default'] = ContrastOperation;
	module.exports = exports['default'];

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _operation = __webpack_require__(9);

	var _operation2 = _interopRequireDefault(_operation);

	var _filtersPrimitivesStack = __webpack_require__(59);

	var _filtersPrimitivesStack2 = _interopRequireDefault(_filtersPrimitivesStack);

	var _filtersPrimitivesBrightness = __webpack_require__(70);

	var _filtersPrimitivesBrightness2 = _interopRequireDefault(_filtersPrimitivesBrightness);

	/**
	 * @class
	 * @alias ImglyKit.Operations.BrightnessOperation
	 * @extends ImglyKit.Operation
	 */

	var BrightnessOperation = (function (_Operation) {
	  function BrightnessOperation() {
	    _classCallCheck(this, BrightnessOperation);

	    if (_Operation != null) {
	      _Operation.apply(this, arguments);
	    }
	  }

	  _inherits(BrightnessOperation, _Operation);

	  _createClass(BrightnessOperation, [{
	    key: '_renderWebGL',

	    /**
	     * Renders the brightness using WebGL
	     * @param  {WebGLRenderer} renderer
	     * @override
	     */
	    /* istanbul ignore next */
	    value: function _renderWebGL(renderer) {
	      this._render(renderer);
	    }
	  }, {
	    key: '_renderCanvas',

	    /**
	     * Renders the brightness using Canvas2D
	     * @param {CanvasRenderer} renderer
	     * @override
	     */
	    value: function _renderCanvas(renderer) {
	      this._render(renderer);
	    }
	  }, {
	    key: '_render',

	    /**
	     * Renders the brightness (all renderers supported)
	     * @param {Renderer} renderer
	     * @private
	     */
	    value: function _render(renderer) {
	      var stack = new _filtersPrimitivesStack2['default']();

	      stack.add(new _filtersPrimitivesBrightness2['default']({
	        brightness: this._options.brightness
	      }));

	      stack.render(renderer);
	    }
	  }]);

	  return BrightnessOperation;
	})(_operation2['default']);

	/**
	 * A unique string that identifies this operation. Can be used to select
	 * operations.
	 * @type {String}
	 */
	BrightnessOperation.prototype.identifier = 'brightness';

	/**
	 * Specifies the available options for this operation
	 * @type {Object}
	 */
	BrightnessOperation.prototype.availableOptions = {
	  brightness: { type: 'number', 'default': 0 }
	};

	exports['default'] = BrightnessOperation;
	module.exports = exports['default'];

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _operation = __webpack_require__(9);

	var _operation2 = _interopRequireDefault(_operation);

	/**
	 * An operation that can flip the canvas
	 *
	 * @class
	 * @alias ImglyKit.Operations.FlipOperation
	 * @extends ImglyKit.Operation
	 */

	var FlipOperation = (function (_Operation) {
	  function FlipOperation() {
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    _classCallCheck(this, FlipOperation);

	    _get(Object.getPrototypeOf(FlipOperation.prototype), 'constructor', this).apply(this, args);

	    /**
	     * The fragment shader used for this operation
	     */
	    this.fragmentShader = '\n      precision mediump float;\n      uniform sampler2D u_image;\n      varying vec2 v_texCoord;\n      uniform bool u_flipVertical;\n      uniform bool u_flipHorizontal;\n\n      void main() {\n        vec2 texCoord = vec2(v_texCoord);\n        if (u_flipVertical) {\n          texCoord.y = 1.0 - texCoord.y;\n        }\n        if (u_flipHorizontal) {\n          texCoord.x = 1.0 - texCoord.x;\n        }\n        gl_FragColor = texture2D(u_image, texCoord);\n      }\n    ';
	  }

	  _inherits(FlipOperation, _Operation);

	  _createClass(FlipOperation, [{
	    key: '_renderWebGL',

	    /**
	     * Crops this image using WebGL
	     * @param  {WebGLRenderer} renderer
	     */
	    /* istanbul ignore next */
	    value: function _renderWebGL(renderer) {
	      renderer.runShader(null, this.fragmentShader, {
	        uniforms: {
	          u_flipVertical: { type: 'f', value: this._options.vertical },
	          u_flipHorizontal: { type: 'f', value: this._options.horizontal }
	        }
	      });
	    }
	  }, {
	    key: '_renderCanvas',

	    /**
	     * Crops the image using Canvas2D
	     * @param  {CanvasRenderer} renderer
	     */
	    value: function _renderCanvas(renderer) {
	      var canvas = renderer.getCanvas();
	      var context = renderer.getContext();

	      var scaleX = 1,
	          scaleY = 1;
	      var translateX = 0,
	          translateY = 0;

	      if (this._options.horizontal) {
	        scaleX = -1;
	        translateX = canvas.width;
	      }

	      if (this._options.vertical) {
	        scaleY = -1;
	        translateY = canvas.height;
	      }

	      // Save the current state
	      context.save();

	      // Apply the transformation
	      context.translate(translateX, translateY);
	      context.scale(scaleX, scaleY);

	      // Create a temporary canvas so that we can draw the image
	      // with the applied transformation
	      var tempCanvas = renderer.cloneCanvas();
	      context.drawImage(tempCanvas, 0, 0);

	      // Restore old transformation
	      context.restore();
	    }
	  }]);

	  return FlipOperation;
	})(_operation2['default']);

	/**
	 * A unique string that identifies this operation. Can be used to select
	 * operations.
	 * @type {String}
	 */
	FlipOperation.prototype.identifier = 'flip';

	/**
	 * Specifies the available options for this operation
	 * @type {Object}
	 */
	FlipOperation.prototype.availableOptions = {
	  horizontal: { type: 'boolean', 'default': false },
	  vertical: { type: 'boolean', 'default': false }
	};

	exports['default'] = FlipOperation;
	module.exports = exports['default'];

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _set = function set(object, property, value, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent !== null) { set(parent, property, value, receiver); } } else if ('value' in desc && desc.writable) { desc.value = value; } else { var setter = desc.set; if (setter !== undefined) { setter.call(receiver, value); } } return value; };

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _operation = __webpack_require__(9);

	var _operation2 = _interopRequireDefault(_operation);

	var _libMathVector2 = __webpack_require__(50);

	var _libMathVector22 = _interopRequireDefault(_libMathVector2);

	var _vendorStackBlur = __webpack_require__(73);

	var _vendorStackBlur2 = _interopRequireDefault(_vendorStackBlur);

	/**
	 * An operation that can crop out a part of the image
	 *
	 * @class
	 * @alias ImglyKit.Operations.TiltShiftOperation
	 * @extends ImglyKit.Operation
	 */

	var TiltShiftOperation = (function (_Operation) {
	  function TiltShiftOperation() {
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    _classCallCheck(this, TiltShiftOperation);

	    _get(Object.getPrototypeOf(TiltShiftOperation.prototype), 'constructor', this).apply(this, args);

	    /**
	     * The fragment shader used for this operation
	     * @internal Based on evanw's glfx.js tilt shift shader:
	     *           https://github.com/evanw/glfx.js/blob/master/src/filters/blur/tiltshift.js
	     */
	    this.fragmentShader = '\n      precision mediump float;\n      uniform sampler2D u_image;\n      uniform float blurRadius;\n      uniform float gradientRadius;\n      uniform vec2 start;\n      uniform vec2 end;\n      uniform vec2 delta;\n      uniform vec2 texSize;\n      varying vec2 v_texCoord;\n\n      float random(vec3 scale, float seed) {\n        return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);\n      }\n\n      void main() {\n          vec4 color = vec4(0.0);\n          float total = 0.0;\n\n          float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);\n\n          vec2 normal = normalize(vec2(start.y - end.y, end.x - start.x));\n          float radius = smoothstep(0.0, 1.0, abs(dot(v_texCoord * texSize - start, normal)) / gradientRadius) * blurRadius;\n          for (float t = -30.0; t <= 30.0; t++) {\n              float percent = (t + offset - 0.5) / 30.0;\n              float weight = 1.0 - abs(percent);\n              vec4 sample = texture2D(u_image, v_texCoord + delta * percent * radius / texSize);\n\n              sample.rgb *= sample.a;\n\n              color += sample * weight;\n              total += weight;\n          }\n\n          gl_FragColor = color / total;\n          gl_FragColor.rgb /= gl_FragColor.a + 0.00001;\n      }\n    ';

	    this._cachedBlurredCanvas = null;
	    this._lastBlurRadius = this._options.blurRadius;
	    this._lastGradientRadius = this._options.gradientRadius;
	  }

	  _inherits(TiltShiftOperation, _Operation);

	  _createClass(TiltShiftOperation, [{
	    key: '_renderWebGL',

	    /**
	     * Crops this image using WebGL
	     * @param  {WebGLRenderer} renderer
	     */
	    /* istanbul ignore next */
	    value: function _renderWebGL(renderer) {
	      var canvas = renderer.getCanvas();
	      var canvasSize = new _libMathVector22['default'](canvas.width, canvas.height);

	      var start = this._options.start.clone();
	      var end = this._options.end.clone();

	      if (this._options.numberFormat === 'relative') {
	        start.multiply(canvasSize);
	        end.multiply(canvasSize);
	      }

	      start.y = canvasSize.y - start.y;
	      end.y = canvasSize.y - end.y;

	      var delta = end.clone().subtract(start);
	      var d = Math.sqrt(delta.x * delta.x + delta.y * delta.y);

	      var uniforms = {
	        blurRadius: { type: 'f', value: this._options.blurRadius },
	        gradientRadius: { type: 'f', value: this._options.gradientRadius },
	        start: { type: '2f', value: [start.x, start.y] },
	        end: { type: '2f', value: [end.x, end.y] },
	        delta: { type: '2f', value: [delta.x / d, delta.y / d] },
	        texSize: { type: '2f', value: [canvas.width, canvas.height] }
	      };

	      renderer.runShader(null, this.fragmentShader, {
	        uniforms: uniforms
	      });

	      uniforms.delta.value = [-delta.y / d, delta.x / d];

	      renderer.runShader(null, this.fragmentShader, {
	        uniforms: uniforms
	      });
	    }
	  }, {
	    key: '_renderCanvas',

	    /**
	     * Crops the image using Canvas2D
	     * @param  {CanvasRenderer} renderer
	     */
	    value: function _renderCanvas(renderer) {
	      var canvas = renderer.getCanvas();

	      var optionsChanged = this._options.blurRadius !== this._lastBlurRadius || this._options.gradientRadius !== this._lastGradientRadius;
	      var blurryCanvas = undefined;
	      if (optionsChanged || this._cachedBlurredCanvas === null) {
	        // Blur and cache canvas
	        blurryCanvas = this._blurCanvas(renderer);
	        this._cachedBlurredCanvas = blurryCanvas;
	        this._lastBlurRadius = this._options.blurRadius;
	        this._lastGradientRadius = this._options.gradientRadius;
	      } else {
	        // Use cached canvas
	        blurryCanvas = this._cachedBlurredCanvas;
	      }

	      var maskCanvas = this._createMask(renderer);

	      this._applyMask(canvas, blurryCanvas, maskCanvas);
	    }
	  }, {
	    key: '_blurCanvas',

	    /**
	     * Creates a blurred copy of the canvas
	     * @param  {CanvasRenderer} renderer
	     * @return {Canvas}
	     * @private
	     */
	    value: function _blurCanvas(renderer) {
	      var newCanvas = renderer.cloneCanvas();
	      var blurryContext = newCanvas.getContext('2d');
	      var blurryImageData = blurryContext.getImageData(0, 0, newCanvas.width, newCanvas.height);
	      _vendorStackBlur2['default'].stackBlurCanvasRGBA(blurryImageData, 0, 0, newCanvas.width, newCanvas.height, this._options.blurRadius);
	      blurryContext.putImageData(blurryImageData, 0, 0);

	      return newCanvas;
	    }
	  }, {
	    key: '_createMask',

	    /**
	     * Creates the mask canvas
	     * @param  {CanvasRenderer} renderer
	     * @return {Canvas}
	     * @private
	     */
	    value: function _createMask(renderer) {
	      var canvas = renderer.getCanvas();

	      var canvasSize = new _libMathVector22['default'](canvas.width, canvas.height);
	      var gradientRadius = this._options.gradientRadius;

	      var maskCanvas = renderer.createCanvas(canvas.width, canvas.height);
	      var maskContext = maskCanvas.getContext('2d');

	      var start = this._options.start.clone();
	      var end = this._options.end.clone();

	      if (this._options.numberFormat === 'relative') {
	        start.multiply(canvasSize);
	        end.multiply(canvasSize);
	      }

	      var dist = end.clone().subtract(start);
	      var middle = start.clone().add(dist.clone().divide(2));

	      var totalDist = Math.sqrt(Math.pow(dist.x, 2) + Math.pow(dist.y, 2));
	      var factor = dist.clone().divide(totalDist);

	      var gradientStart = middle.clone().add(gradientRadius * factor.y, -gradientRadius * factor.x);
	      var gradientEnd = middle.clone().add(-gradientRadius * factor.y, gradientRadius * factor.x);

	      // Build gradient
	      var gradient = maskContext.createLinearGradient(gradientStart.x, gradientStart.y, gradientEnd.x, gradientEnd.y);
	      gradient.addColorStop(0, '#000000');
	      gradient.addColorStop(0.5, '#FFFFFF');
	      gradient.addColorStop(1, '#000000');

	      // Draw gradient
	      maskContext.fillStyle = gradient;
	      maskContext.fillRect(0, 0, canvas.width, canvas.height);

	      return maskCanvas;
	    }
	  }, {
	    key: '_applyMask',

	    /**
	     * Applies the blur and mask to the input canvas
	     * @param  {Canvas} inputCanvas
	     * @param  {Canvas} blurryCanvas
	     * @param  {Canvas} maskCanvas
	     * @private
	     */
	    value: function _applyMask(inputCanvas, blurryCanvas, maskCanvas) {
	      var inputContext = inputCanvas.getContext('2d');
	      var blurryContext = blurryCanvas.getContext('2d');
	      var maskContext = maskCanvas.getContext('2d');

	      var inputImageData = inputContext.getImageData(0, 0, inputCanvas.width, inputCanvas.height);
	      var pixels = inputImageData.data;
	      var blurryPixels = blurryContext.getImageData(0, 0, inputCanvas.width, inputCanvas.height).data;
	      var maskPixels = maskContext.getImageData(0, 0, inputCanvas.width, inputCanvas.height).data;

	      for (var i = 0; i < maskPixels.length; i++) {
	        var alpha = maskPixels[i] / 255;
	        pixels[i] = alpha * pixels[i] + (1 - alpha) * blurryPixels[i];
	      }

	      inputContext.putImageData(inputImageData, 0, 0);
	    }
	  }, {
	    key: 'dirty',

	    /**
	     * Sets the dirty state of this operation
	     * @param {Boolean} dirty
	     * @comment Since blur operations do seperate caching of the
	     *          blurred canvas, we need to invalidate the cache when the
	     *          dirty state changes.
	     */
	    set: function (dirty) {
	      _set(Object.getPrototypeOf(TiltShiftOperation.prototype), 'dirty', dirty, this);
	      this._cachedBlurredCanvas = null;
	    },

	    /**
	     * Returns the dirty state
	     * @type {Boolean}
	     */
	    get: function () {
	      return _get(Object.getPrototypeOf(TiltShiftOperation.prototype), 'dirty', this);
	    }
	  }]);

	  return TiltShiftOperation;
	})(_operation2['default']);

	/**
	 * A unique string that identifies this operation. Can be used to select
	 * operations.
	 * @type {String}
	 */
	TiltShiftOperation.prototype.identifier = 'tilt-shift';

	/**
	 * Specifies the available options for this operation
	 * @type {Object}
	 */
	TiltShiftOperation.prototype.availableOptions = {
	  start: { type: 'vector2', 'default': new _libMathVector22['default'](0, 0.5) },
	  end: { type: 'vector2', 'default': new _libMathVector22['default'](1, 0.5) },
	  blurRadius: { type: 'number', 'default': 30 },
	  gradientRadius: { type: 'number', 'default': 50 }
	};

	exports['default'] = TiltShiftOperation;
	module.exports = exports['default'];

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _set = function set(object, property, value, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent !== null) { set(parent, property, value, receiver); } } else if ('value' in desc && desc.writable) { desc.value = value; } else { var setter = desc.set; if (setter !== undefined) { setter.call(receiver, value); } } return value; };

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _operation = __webpack_require__(9);

	var _operation2 = _interopRequireDefault(_operation);

	var _libMathVector2 = __webpack_require__(50);

	var _libMathVector22 = _interopRequireDefault(_libMathVector2);

	var _vendorStackBlur = __webpack_require__(73);

	var _vendorStackBlur2 = _interopRequireDefault(_vendorStackBlur);

	/**
	 * An operation that can crop out a part of the image
	 *
	 * @class
	 * @alias ImglyKit.Operations.RadialBlurOperation
	 * @extends ImglyKit.Operation
	 */

	var RadialBlurOperation = (function (_Operation) {
	  function RadialBlurOperation() {
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    _classCallCheck(this, RadialBlurOperation);

	    _get(Object.getPrototypeOf(RadialBlurOperation.prototype), 'constructor', this).apply(this, args);

	    /**
	     * The fragment shader used for this operation
	     * @internal Based on evanw's glfx.js tilt shift shader:
	     *           https://github.com/evanw/glfx.js/blob/master/src/filters/blur/tiltshift.js
	     */
	    this.fragmentShader = '\n      precision mediump float;\n      uniform sampler2D u_image;\n      uniform float blurRadius;\n      uniform float gradientRadius;\n      uniform vec2 position;\n      uniform vec2 delta;\n      uniform vec2 texSize;\n      varying vec2 v_texCoord;\n\n      float random(vec3 scale, float seed) {\n        return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);\n      }\n\n      void main() {\n          vec4 color = vec4(0.0);\n          float total = 0.0;\n\n          float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);\n          float radius = smoothstep(0.0, 1.0, abs(distance(v_texCoord * texSize, position)) / (gradientRadius * 2.0)) * blurRadius;\n          for (float t = -30.0; t <= 30.0; t++) {\n              float percent = (t + offset - 0.5) / 30.0;\n              float weight = 1.0 - abs(percent);\n              vec4 sample = texture2D(u_image, v_texCoord + delta * percent * radius / texSize);\n\n              sample.rgb *= sample.a;\n\n              color += sample * weight;\n              total += weight;\n          }\n\n          gl_FragColor = color / total;\n          gl_FragColor.rgb /= gl_FragColor.a + 0.00001;\n      }\n    ';

	    this._cachedBlurredCanvas = null;
	    this._lastBlurRadius = this._options.blurRadius;
	    this._lastGradientRadius = this._options.gradientRadius;
	  }

	  _inherits(RadialBlurOperation, _Operation);

	  _createClass(RadialBlurOperation, [{
	    key: '_renderWebGL',

	    /**
	     * Crops this image using WebGL
	     * @param  {WebGLRenderer} renderer
	     */
	    /* istanbul ignore next */
	    value: function _renderWebGL(renderer) {
	      var canvas = renderer.getCanvas();
	      var canvasSize = new _libMathVector22['default'](canvas.width, canvas.height);

	      var position = this._options.position.clone();
	      position.y = 1 - position.y;

	      if (this._options.numberFormat === 'relative') {
	        position.multiply(canvasSize);
	      }

	      var uniforms = {
	        blurRadius: { type: 'f', value: this._options.blurRadius },
	        gradientRadius: { type: 'f', value: this._options.gradientRadius },
	        position: { type: '2f', value: [position.x, position.y] },
	        texSize: { type: '2f', value: [canvas.width, canvas.height] },
	        delta: { type: '2f', value: [1, 1] }
	      };

	      // First pass
	      renderer.runShader(null, this.fragmentShader, {
	        uniforms: uniforms
	      });

	      // Update delta for second pass
	      uniforms.delta.value = [-1, 1];

	      renderer.runShader(null, this.fragmentShader, {
	        uniforms: uniforms
	      });
	    }
	  }, {
	    key: '_renderCanvas',

	    /**
	     * Crops the image using Canvas2D
	     * @param  {CanvasRenderer} renderer
	     */
	    value: function _renderCanvas(renderer) {
	      var canvas = renderer.getCanvas();

	      var blurRadiusChanged = this._options.blurRadius !== this._lastBlurRadius;
	      var blurryCanvas = undefined;
	      if (blurRadiusChanged || this._cachedBlurredCanvas === null) {
	        // Blur and cache canvas
	        blurryCanvas = this._blurCanvas(renderer);
	        this._cachedBlurredCanvas = blurryCanvas;
	        this._lastBlurRadius = this._options.blurRadius;
	        this._lastGradientRadius = this._options.gradientRadius;
	      } else {
	        // Use cached canvas
	        blurryCanvas = this._cachedBlurredCanvas;
	      }

	      var maskCanvas = this._createMask(renderer);

	      this._applyMask(canvas, blurryCanvas, maskCanvas);
	    }
	  }, {
	    key: '_blurCanvas',

	    /**
	     * Creates a blurred copy of the canvas
	     * @param  {CanvasRenderer} renderer
	     * @return {Canvas}
	     * @private
	     */
	    value: function _blurCanvas(renderer) {
	      var newCanvas = renderer.cloneCanvas();
	      var blurryContext = newCanvas.getContext('2d');
	      var blurryImageData = blurryContext.getImageData(0, 0, newCanvas.width, newCanvas.height);
	      _vendorStackBlur2['default'].stackBlurCanvasRGBA(blurryImageData, 0, 0, newCanvas.width, newCanvas.height, this._options.blurRadius);
	      blurryContext.putImageData(blurryImageData, 0, 0);

	      return newCanvas;
	    }
	  }, {
	    key: '_createMask',

	    /**
	     * Creates the mask canvas
	     * @param  {CanvasRenderer} renderer
	     * @return {Canvas}
	     * @private
	     */
	    value: function _createMask(renderer) {
	      var canvas = renderer.getCanvas();

	      var canvasSize = new _libMathVector22['default'](canvas.width, canvas.height);
	      var gradientRadius = this._options.gradientRadius;

	      var maskCanvas = renderer.createCanvas(canvas.width, canvas.height);
	      var maskContext = maskCanvas.getContext('2d');

	      var position = this._options.position.clone();

	      if (this._options.numberFormat === 'relative') {
	        position.multiply(canvasSize);
	      }

	      // Build gradient
	      var gradient = maskContext.createRadialGradient(position.x, position.y, 0, position.x, position.y, gradientRadius);
	      gradient.addColorStop(0, '#FFFFFF');
	      gradient.addColorStop(1, '#000000');

	      // Draw gradient
	      maskContext.fillStyle = gradient;
	      maskContext.fillRect(0, 0, canvas.width, canvas.height);

	      return maskCanvas;
	    }
	  }, {
	    key: '_applyMask',

	    /**
	     * Applies the blur and mask to the input canvas
	     * @param  {Canvas} inputCanvas
	     * @param  {Canvas} blurryCanvas
	     * @param  {Canvas} maskCanvas
	     * @private
	     */
	    value: function _applyMask(inputCanvas, blurryCanvas, maskCanvas) {
	      var inputContext = inputCanvas.getContext('2d');
	      var blurryContext = blurryCanvas.getContext('2d');
	      var maskContext = maskCanvas.getContext('2d');

	      var inputImageData = inputContext.getImageData(0, 0, inputCanvas.width, inputCanvas.height);
	      var pixels = inputImageData.data;
	      var blurryPixels = blurryContext.getImageData(0, 0, inputCanvas.width, inputCanvas.height).data;
	      var maskPixels = maskContext.getImageData(0, 0, inputCanvas.width, inputCanvas.height).data;

	      var index, alpha;
	      for (var y = 0; y < inputCanvas.height; y++) {
	        for (var x = 0; x < inputCanvas.width; x++) {
	          index = (y * inputCanvas.width + x) * 4;
	          alpha = maskPixels[index] / 255;

	          pixels[index] = alpha * pixels[index] + (1 - alpha) * blurryPixels[index];
	          pixels[index + 1] = alpha * pixels[index + 1] + (1 - alpha) * blurryPixels[index + 1];
	          pixels[index + 2] = alpha * pixels[index + 2] + (1 - alpha) * blurryPixels[index + 2];
	        }
	      }

	      inputContext.putImageData(inputImageData, 0, 0);
	    }
	  }, {
	    key: 'dirty',

	    /**
	     * Sets the dirty state of this operation
	     * @param {Boolean} dirty
	     * @comment Since blur operations do seperate caching of the
	     *          blurred canvas, we need to invalidate the cache when the
	     *          dirty state changes.
	     */
	    set: function (dirty) {
	      _set(Object.getPrototypeOf(RadialBlurOperation.prototype), 'dirty', dirty, this);
	      this._cachedBlurredCanvas = null;
	    },

	    /**
	     * Returns the dirty state
	     * @type {Boolean}
	     */
	    get: function () {
	      return _get(Object.getPrototypeOf(RadialBlurOperation.prototype), 'dirty', this);
	    }
	  }]);

	  return RadialBlurOperation;
	})(_operation2['default']);

	/**
	 * A unique string that identifies this operation. Can be used to select
	 * operations.
	 * @type {String}
	 */
	RadialBlurOperation.prototype.identifier = 'radial-blur';

	/**
	 * Specifies the available options for this operation
	 * @type {Object}
	 */
	RadialBlurOperation.prototype.availableOptions = {
	  position: { type: 'vector2', 'default': new _libMathVector22['default'](0.5, 0.5) },
	  gradientRadius: { type: 'number', 'default': 50 },
	  blurRadius: { type: 'number', 'default': 20 }
	};

	exports['default'] = RadialBlurOperation;
	module.exports = exports['default'];

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _operation = __webpack_require__(9);

	var _operation2 = _interopRequireDefault(_operation);

	var _libMathVector2 = __webpack_require__(50);

	var _libMathVector22 = _interopRequireDefault(_libMathVector2);

	var _libColor = __webpack_require__(7);

	var _libColor2 = _interopRequireDefault(_libColor);

	/**
	 * An operation that can draw text on the canvas
	 *
	 * @class
	 * @alias ImglyKit.Operations.TextOperation
	 * @extends ImglyKit.Operation
	 */

	var TextOperation = (function (_Operation) {
	  function TextOperation() {
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    _classCallCheck(this, TextOperation);

	    _get(Object.getPrototypeOf(TextOperation.prototype), 'constructor', this).apply(this, args);

	    /**
	     * The texture index used for the text
	     * @type {Number}
	     * @private
	     */
	    this._textureIndex = 1;

	    /**
	     * The fragment shader used for this operation
	     */
	    this._fragmentShader = '\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_image;\n      uniform sampler2D u_textImage;\n      uniform vec2 u_position;\n      uniform vec2 u_size;\n\n      void main() {\n        vec4 color0 = texture2D(u_image, v_texCoord);\n        vec2 relative = (v_texCoord - u_position) / u_size;\n\n        if (relative.x >= 0.0 && relative.x <= 1.0 &&\n          relative.y >= 0.0 && relative.y <= 1.0) {\n\n            vec4 color1 = texture2D(u_textImage, relative);\n\n            // GL_SOURCE_ALPHA, GL_ONE_MINUS_SOURCE_ALPHA\n            gl_FragColor = color1 + color0 * (1.0 - color1.a);\n\n        } else {\n\n          gl_FragColor = color0;\n\n        }\n      }\n    ';
	  }

	  _inherits(TextOperation, _Operation);

	  _createClass(TextOperation, [{
	    key: '_renderWebGL',

	    /**
	     * Crops this image using WebGL
	     * @param  {WebGLRenderer} renderer
	     */
	    /* istanbul ignore next */
	    value: function _renderWebGL(renderer) {
	      var textCanvas = this._renderTextCanvas(renderer);

	      var canvas = renderer.getCanvas();
	      var gl = renderer.getContext();

	      var position = this._options.position.clone();
	      var canvasSize = new _libMathVector22['default'](canvas.width, canvas.height);
	      var size = new _libMathVector22['default'](textCanvas.width, textCanvas.height).divide(canvasSize);

	      if (this._options.numberFormat === 'absolute') {
	        position.divide(canvasSize);
	      }

	      position.y = 1 - position.y; // Invert y
	      position.y -= size.y; // Fix y

	      // Adjust vertical alignment
	      if (this._options.verticalAlignment === 'center') {
	        position.y += size.y / 2;
	      } else if (this._options.verticalAlignment === 'bottom') {
	        position.y += size.y;
	      }

	      // Adjust horizontal alignment
	      if (this._options.alignment === 'center') {
	        position.x -= size.x / 2;
	      } else if (this._options.alignment === 'right') {
	        position.x -= size.x;
	      }

	      // Upload the texture
	      gl.activeTexture(gl.TEXTURE0 + this._textureIndex);
	      this._texture = gl.createTexture();
	      gl.bindTexture(gl.TEXTURE_2D, this._texture);

	      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	      // Set premultiplied alpha
	      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);
	      gl.activeTexture(gl.TEXTURE0);

	      // Execute the shader
	      renderer.runShader(null, this._fragmentShader, {
	        uniforms: {
	          u_textImage: { type: 'i', value: this._textureIndex },
	          u_position: { type: '2f', value: [position.x, position.y] },
	          u_size: { type: '2f', value: [size.x, size.y] }
	        }
	      });
	    }
	  }, {
	    key: '_renderCanvas',

	    /**
	     * Crops the image using Canvas2D
	     * @param  {CanvasRenderer} renderer
	     */
	    value: function _renderCanvas(renderer) {
	      var textCanvas = this._renderTextCanvas(renderer);

	      var canvas = renderer.getCanvas();
	      var context = renderer.getContext();

	      var canvasSize = new _libMathVector22['default'](canvas.width, canvas.height);
	      var scaledPosition = this._options.position.clone();

	      if (this._options.numberFormat === 'relative') {
	        scaledPosition.multiply(canvasSize);
	      }

	      // Adjust vertical alignment
	      if (this._options.verticalAlignment === 'center') {
	        scaledPosition.y -= textCanvas.height / 2;
	      } else if (this._options.verticalAlignment === 'bottom') {
	        scaledPosition.y -= textCanvas.height;
	      }

	      // Adjust horizontal alignment
	      if (this._options.alignment === 'center') {
	        scaledPosition.x -= textCanvas.width / 2;
	      } else if (this._options.alignment === 'right') {
	        scaledPosition.x -= textCanvas.width;
	      }

	      context.drawImage(textCanvas, scaledPosition.x, scaledPosition.y);
	    }
	  }, {
	    key: '_renderTextCanvas',

	    /**
	     * Renders the text canvas that will be used as a texture in WebGL
	     * and as an image in canvas
	     * @return {Canvas}
	     * @private
	     */
	    value: function _renderTextCanvas(renderer) {
	      var line = undefined,
	          lineNum = undefined;
	      var canvas = renderer.createCanvas();
	      var context = canvas.getContext('2d');

	      var outputCanvas = renderer.getCanvas();
	      var canvasSize = new _libMathVector22['default'](outputCanvas.width, outputCanvas.height);

	      var maxWidth = this._options.maxWidth;
	      var actualFontSize = this._options.fontSize * canvasSize.y;
	      var actualLineHeight = this._options.lineHeight * actualFontSize;

	      if (this._options.numberFormat === 'relative') {
	        maxWidth *= renderer.getCanvas().width;
	      }

	      // Apply text options
	      this._applyTextOptions(renderer, context);

	      var boundingBox = new _libMathVector22['default']();

	      var lines = this._options.text.split('\n');
	      if (typeof maxWidth !== 'undefined') {
	        // Calculate the bounding box
	        boundingBox.x = maxWidth;
	        lines = this._buildOutputLines(context, maxWidth);
	      } else {
	        for (lineNum = 0; lineNum < lines.length; lineNum++) {
	          line = lines[lineNum];
	          boundingBox.x = Math.max(boundingBox.x, context.measureText(line).width);
	        }
	      }

	      // Calculate boundingbox height
	      boundingBox.y = actualLineHeight * lines.length;

	      // Resize the canvas
	      canvas.width = boundingBox.x;
	      canvas.height = boundingBox.y;

	      // Get the context again
	      context = canvas.getContext('2d');

	      // Render background color
	      context.fillStyle = this._options.backgroundColor.toRGBA();
	      context.fillRect(0, 0, canvas.width, canvas.height);

	      // Apply text options
	      this._applyTextOptions(renderer, context);

	      // Draw lines
	      for (lineNum = 0; lineNum < lines.length; lineNum++) {
	        line = lines[lineNum];
	        this._drawText(context, line, actualLineHeight * lineNum);
	      }

	      return canvas;
	    }
	  }, {
	    key: '_applyTextOptions',

	    /**
	     * Applies the text options on the given context
	     * @param  {Renderer} renderer
	     * @param  {RenderingContext2D} context
	     * @private
	     */
	    value: function _applyTextOptions(renderer, context) {
	      var canvas = renderer.getCanvas();
	      var canvasSize = new _libMathVector22['default'](canvas.width, canvas.height);
	      var actualFontSize = this._options.fontSize * canvasSize.y;

	      context.font = this._options.fontWeight + ' ' + actualFontSize + 'px ' + this._options.fontFamily;
	      context.textBaseline = 'top';
	      context.textAlign = this._options.alignment;
	      context.fillStyle = this._options.color.toRGBA();
	    }
	  }, {
	    key: '_buildOutputLines',

	    /**
	     * Iterate over all lines and split them into multiple lines, depending
	     * on the width they need
	     * @param {RenderingContext2d} context
	     * @param {Number} maxWidth
	     * @return {Array.<string>}
	     * @private
	     */
	    value: function _buildOutputLines(context, maxWidth) {
	      var inputLines = this._options.text.split('\n');
	      var outputLines = [];
	      var currentChars = [];

	      for (var lineNum = 0; lineNum < inputLines.length; lineNum++) {
	        var inputLine = inputLines[lineNum];
	        var lineChars = inputLine.split('');

	        if (lineChars.length === 0) {
	          outputLines.push('');
	        }

	        for (var charNum = 0; charNum < lineChars.length; charNum++) {
	          var currentChar = lineChars[charNum];
	          currentChars.push(currentChar);
	          var currentLine = currentChars.join('');
	          var lineWidth = context.measureText(currentLine).width;

	          if (lineWidth > maxWidth && currentChars.length === 1) {
	            outputLines.push(currentChars[0]);
	            currentChars = [];
	          } else if (lineWidth > maxWidth) {
	            // Remove the last word
	            var lastWord = currentChars.pop();

	            // Add the line, clear the words
	            outputLines.push(currentChars.join(''));
	            currentChars = [];

	            // Make sure to use the last word for the next line
	            currentChars = [lastWord];
	          } else if (charNum === lineChars.length - 1) {
	            // Add the line, clear the words
	            outputLines.push(currentChars.join(''));
	            currentChars = [];
	          }
	        }

	        // Line ended, but there's words left
	        if (currentChars.length) {
	          outputLines.push(currentChars.join(''));
	          currentChars = [];
	        }
	      }

	      return outputLines;
	    }
	  }, {
	    key: '_drawText',

	    /**
	     * Draws the given line onto the given context at the given Y position
	     * @param  {RenderingContext2D} context
	     * @param  {String} text
	     * @param  {Number} y
	     * @private
	     */
	    value: function _drawText(context, text, y) {
	      var canvas = context.canvas;
	      if (this._options.alignment === 'center') {
	        context.fillText(text, canvas.width / 2, y);
	      } else if (this._options.alignment === 'left') {
	        context.fillText(text, 0, y);
	      } else if (this._options.alignment === 'right') {
	        context.fillText(text, canvas.width, y);
	      }
	    }
	  }]);

	  return TextOperation;
	})(_operation2['default']);

	/**
	 * A unique string that identifies this operation. Can be used to select
	 * operations.
	 * @type {String}
	 */
	TextOperation.prototype.identifier = 'text';

	/**
	 * Specifies the available options for this operation
	 * @type {Object}
	 */
	TextOperation.prototype.availableOptions = {
	  fontSize: { type: 'number', 'default': 0.1 },
	  lineHeight: { type: 'number', 'default': 1.1 },
	  fontFamily: { type: 'string', 'default': 'Times New Roman' },
	  fontWeight: { type: 'string', 'default': 'normal' },
	  alignment: { type: 'string', 'default': 'left', available: ['left', 'center', 'right'] },
	  verticalAlignment: { type: 'string', 'default': 'top', available: ['top', 'center', 'bottom'] },
	  color: { type: 'color', 'default': new _libColor2['default'](1, 1, 1, 1) },
	  backgroundColor: { type: 'color', 'default': new _libColor2['default'](0, 0, 0, 0) },
	  position: { type: 'vector2', 'default': new _libMathVector22['default'](0, 0) },
	  text: { type: 'string', required: true },
	  maxWidth: { type: 'number', 'default': 1 }
	};

	exports['default'] = TextOperation;
	module.exports = exports['default'];

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	/* global Image */
	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _operation = __webpack_require__(9);

	var _operation2 = _interopRequireDefault(_operation);

	var _libMathVector2 = __webpack_require__(50);

	var _libMathVector22 = _interopRequireDefault(_libMathVector2);

	/**
	 * An operation that can draw text on the canvas
	 *
	 * @class
	 * @alias ImglyKit.Operations.StickersOperation
	 * @extends ImglyKit.Operation
	 */

	var StickersOperation = (function (_Operation) {
	  function StickersOperation() {
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    _classCallCheck(this, StickersOperation);

	    _get(Object.getPrototypeOf(StickersOperation.prototype), 'constructor', this).apply(this, args);

	    /**
	     * The texture index used for the sticker
	     * @type {Number}
	     * @private
	     */
	    this._textureIndex = 1;

	    /**
	     * The fragment shader used for this operation
	     */
	    this._fragmentShader = '\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_image;\n      uniform sampler2D u_stickerImage;\n      uniform vec2 u_position;\n      uniform vec2 u_size;\n\n      void main() {\n        vec4 color0 = texture2D(u_image, v_texCoord);\n        vec2 relative = (v_texCoord - u_position) / u_size;\n\n        if (relative.x >= 0.0 && relative.x <= 1.0 &&\n          relative.y >= 0.0 && relative.y <= 1.0) {\n\n            vec4 color1 = texture2D(u_stickerImage, relative);\n\n            // GL_SOURCE_ALPHA, GL_ONE_MINUS_SOURCE_ALPHA\n            gl_FragColor = color1 + color0 * (1.0 - color1.a);\n\n        } else {\n\n          gl_FragColor = color0;\n\n        }\n      }\n    ';

	    this._loadedStickers = {};
	  }

	  _inherits(StickersOperation, _Operation);

	  _createClass(StickersOperation, [{
	    key: 'render',

	    /**
	     * Applies this operation
	     * @param  {Renderer} renderer
	     * @return {Promise}
	     * @abstract
	     */
	    value: function render(renderer) {
	      var self = this;
	      return this._loadSticker().then(function (image) {
	        if (renderer.identifier === 'webgl') {
	          /* istanbul ignore next */
	          return self._renderWebGL(renderer, image);
	        } else {
	          return self._renderCanvas(renderer, image);
	        }
	      });
	    }
	  }, {
	    key: '_renderWebGL',

	    /**
	     * Crops this image using WebGL
	     * @param  {WebGLRenderer} renderer
	     * @param  {Image} image
	     * @private
	     */
	    /* istanbul ignore next */
	    value: function _renderWebGL(renderer, image) {
	      var canvas = renderer.getCanvas();
	      var gl = renderer.getContext();

	      var position = this._options.position.clone();
	      var canvasSize = new _libMathVector22['default'](canvas.width, canvas.height);

	      if (this._options.numberFormat === 'absolute') {
	        position.divide(canvasSize);
	      }

	      var size = new _libMathVector22['default'](image.width, image.height);
	      if (typeof this._options.size !== 'undefined') {
	        size.copy(this._options.size);

	        if (this._options.numberFormat === 'relative') {
	          size.multiply(canvasSize);
	        }

	        // Calculate image ratio, scale by width
	        var ratio = image.height / image.width;
	        size.y = size.x * ratio;
	      }
	      size.divide(canvasSize);

	      position.y = 1 - position.y; // Invert y
	      position.y -= size.y; // Fix y

	      // Upload the texture
	      gl.activeTexture(gl.TEXTURE0 + this._textureIndex);
	      this._texture = gl.createTexture();

	      gl.bindTexture(gl.TEXTURE_2D, this._texture);

	      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	      // Set premultiplied alpha
	      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	      gl.activeTexture(gl.TEXTURE0);

	      // Execute the shader
	      renderer.runShader(null, this._fragmentShader, {
	        uniforms: {
	          u_stickerImage: { type: 'i', value: this._textureIndex },
	          u_position: { type: '2f', value: [position.x, position.y] },
	          u_size: { type: '2f', value: [size.x, size.y] }
	        }
	      });
	    }
	  }, {
	    key: '_renderCanvas',

	    /**
	     * Crops the image using Canvas2D
	     * @param  {CanvasRenderer} renderer
	     * @param  {Image} image
	     * @private
	     */
	    value: function _renderCanvas(renderer, image) {
	      var canvas = renderer.getCanvas();
	      var context = renderer.getContext();

	      var canvasSize = new _libMathVector22['default'](canvas.width, canvas.height);
	      var scaledPosition = this._options.position.clone();

	      if (this._options.numberFormat === 'relative') {
	        scaledPosition.multiply(canvasSize);
	      }

	      var size = new _libMathVector22['default'](image.width, image.height);
	      if (typeof this._options.size !== 'undefined') {
	        size.copy(this._options.size);

	        if (this._options.numberFormat === 'relative') {
	          size.multiply(canvasSize);
	        }
	      }

	      context.drawImage(image, 0, 0, image.width, image.height, scaledPosition.x, scaledPosition.y, size.x, size.y);
	    }
	  }, {
	    key: '_loadSticker',

	    /**
	     * Loads the sticker
	     * @return {Promise}
	     * @private
	     */
	    value: function _loadSticker() {
	      var isBrowser = typeof window !== 'undefined';
	      if (isBrowser) {
	        return this._loadImageBrowser(this._options.sticker);
	      } else {
	        return this._loadImageNode(this._options.sticker);
	      }
	    }
	  }, {
	    key: '_loadImageBrowser',

	    /**
	     * Loads the given image using the browser's `Image` class
	     * @param  {String} fileName
	     * @return {Promise}
	     * @private
	     */
	    value: function _loadImageBrowser(fileName) {
	      var self = this;
	      return new Promise(function (resolve, reject) {
	        // Return preloaded sticker if available
	        if (self._loadedStickers[fileName]) {
	          return resolve(self._loadedStickers[fileName]);
	        }

	        var image = new Image();

	        image.addEventListener('load', function () {
	          self._loadedStickers[fileName] = image;
	          resolve(image);
	        });
	        image.addEventListener('error', function () {
	          reject(new Error('Could not load sticker: ' + fileName));
	        });

	        image.src = self._kit.getAssetPath(fileName);
	      });
	    }
	  }, {
	    key: '_loadImageNode',

	    /**
	     * Loads the given image using node.js' `fs` and node-canvas `Image`
	     * @param  {String} fileName
	     * @return {Promise}
	     * @private
	     */
	    value: function _loadImageNode(fileName) {
	      var Canvas = __webpack_require__(53);
	      

	      var self = this;
	      var image = new Canvas.Image();
	      var path = self._kit.getAssetPath(fileName);

	      return new Promise(function (resolve, reject) {
	        fs.readFile(path, function (err, buffer) {
	          if (err) return reject(err);

	          image.src = buffer;
	          resolve(image);
	        });
	      });
	    }
	  }, {
	    key: 'stickers',

	    /**
	     * The registered stickers
	     * @type {Object.<String,String>}
	     */
	    get: function () {
	      return this._stickers;
	    }
	  }]);

	  return StickersOperation;
	})(_operation2['default']);

	/**
	 * A unique string that identifies this operation. Can be used to select
	 * operations.
	 * @type {String}
	 */
	StickersOperation.prototype.identifier = 'stickers';

	/**
	 * Specifies the available options for this operation
	 * @type {Object}
	 */
	StickersOperation.prototype.availableOptions = {
	  sticker: { type: 'string' },
	  position: { type: 'vector2', 'default': new _libMathVector22['default'](0, 0) },
	  size: { type: 'vector2', 'default': new _libMathVector22['default'](0, 0) }
	};

	exports['default'] = StickersOperation;
	module.exports = exports['default'];

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _operation = __webpack_require__(9);

	var _operation2 = _interopRequireDefault(_operation);

	var _libColor = __webpack_require__(7);

	var _libColor2 = _interopRequireDefault(_libColor);

	/**
	 * An operation that can frames on the canvas
	 *
	 * @class
	 * @alias ImglyKit.Operations.FramesOperation
	 * @extends ImglyKit.Operation
	 */

	var FramesOperation = (function (_Operation) {
	  function FramesOperation() {
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    _classCallCheck(this, FramesOperation);

	    _get(Object.getPrototypeOf(FramesOperation.prototype), 'constructor', this).apply(this, args);

	    /**
	     * The texture index used for the frame
	     * @type {Number}
	     * @private
	     */
	    this._textureIndex = 1;

	    /**
	     * The fragment shader used for this operation
	     */
	    this._fragmentShader = '\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_image;\n      uniform sampler2D u_frameImage;\n      uniform vec4 u_color;\n      uniform vec2 u_thickness;\n\n      void main() {\n        vec4 fragColor = texture2D(u_image, v_texCoord);\n        if (v_texCoord.x < u_thickness.x || v_texCoord.x > 1.0 - u_thickness.x ||\n          v_texCoord.y < u_thickness.y || v_texCoord.y > 1.0 - u_thickness.y) {\n            fragColor = mix(fragColor, u_color, u_color.a);\n          }\n\n        gl_FragColor = fragColor;\n      }\n    ';
	  }

	  _inherits(FramesOperation, _Operation);

	  _createClass(FramesOperation, [{
	    key: '_renderWebGL',

	    /**
	     * Crops this image using WebGL
	     * @param  {WebGLRenderer} renderer
	     * @private
	     */
	    /* istanbul ignore next */
	    value: function _renderWebGL(renderer) {
	      var canvas = renderer.getCanvas();

	      var color = this._options.color;
	      var thickness = this._options.thickness * canvas.height;
	      var thicknessVec2 = [thickness / canvas.width, thickness / canvas.height];

	      renderer.runShader(null, this._fragmentShader, {
	        uniforms: {
	          u_color: { type: '4f', value: color.toGLColor() },
	          u_thickness: { type: '2f', value: thicknessVec2 }
	        }
	      });
	    }
	  }, {
	    key: '_renderCanvas',

	    /**
	     * Crops the image using Canvas2D
	     * @param  {CanvasRenderer} renderer
	     * @private
	     */
	    value: function _renderCanvas(renderer) {
	      var canvas = renderer.getCanvas();
	      var context = renderer.getContext();

	      var color = this._options.color;
	      var thickness = this._options.thickness * canvas.height;

	      context.save();
	      context.beginPath();
	      context.lineWidth = thickness * 2;
	      context.strokeStyle = color.toRGBA();
	      context.rect(0, 0, canvas.width, canvas.height);
	      context.stroke();
	      context.restore();
	    }
	  }]);

	  return FramesOperation;
	})(_operation2['default']);

	/**
	 * A unique string that identifies this operation. Can be used to select
	 * operations.
	 * @type {String}
	 */
	FramesOperation.prototype.identifier = 'frames';

	/**
	 * Specifies the available options for this operation
	 * @type {Object}
	 */
	FramesOperation.prototype.availableOptions = {
	  color: { type: 'color', 'default': new _libColor2['default'](0, 0, 0, 1) },
	  thickness: { type: 'number', 'default': 0.02 }
	};

	exports['default'] = FramesOperation;
	module.exports = exports['default'];

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _filter = __webpack_require__(8);

	var _filter2 = _interopRequireDefault(_filter);

	/**
	 * A15 Filter
	 * @class
	 * @alias ImglyKit.Filters.A15Filter
	 * @extends {ImglyKit.Filter}
	 */

	var A15Filter = (function (_Filter) {
	  function A15Filter() {
	    _classCallCheck(this, A15Filter);

	    if (_Filter != null) {
	      _Filter.apply(this, arguments);
	    }
	  }

	  _inherits(A15Filter, _Filter);

	  _createClass(A15Filter, [{
	    key: 'render',

	    /**
	     * Renders the filter
	     * @param  {Renderer} renderer
	     * @return {Promise}
	     */
	    value: function render(renderer) {
	      var stack = new _filter2['default'].PrimitivesStack();

	      stack.add(new _filter2['default'].Primitives.Contrast({
	        contrast: 0.63
	      }));

	      stack.add(new _filter2['default'].Primitives.Brightness({
	        brightness: 0.12
	      }));

	      stack.add(new _filter2['default'].Primitives.ToneCurve({
	        rgbControlPoints: {
	          red: [[0, 38], [94, 94], [148, 142], [175, 187], [255, 255]],
	          green: [[0, 0], [77, 53], [171, 190], [255, 255]],
	          blue: [[0, 10], [48, 85], [174, 228], [255, 255]]
	        }
	      }));

	      stack.render(renderer);
	    }
	  }, {
	    key: 'name',

	    /**
	     * The name that is displayed in the UI
	     * @type {String}
	     */
	    get: function () {
	      return '15';
	    }
	  }], [{
	    key: 'identifier',

	    /**
	     * A unique string that identifies this operation. Can be used to select
	     * the active filter.
	     * @type {String}
	     */
	    get: function () {
	      return 'a15';
	    }
	  }]);

	  return A15Filter;
	})(_filter2['default']);

	exports['default'] = A15Filter;
	module.exports = exports['default'];

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _filter = __webpack_require__(8);

	var _filter2 = _interopRequireDefault(_filter);

	/**
	 * Breeze Filter
	 * @class
	 * @alias ImglyKit.Filters.BreezeFilter
	 * @extends {ImglyKit.Filter}
	 */

	var BreezeFilter = (function (_Filter) {
	  function BreezeFilter() {
	    _classCallCheck(this, BreezeFilter);

	    if (_Filter != null) {
	      _Filter.apply(this, arguments);
	    }
	  }

	  _inherits(BreezeFilter, _Filter);

	  _createClass(BreezeFilter, [{
	    key: 'render',

	    /**
	     * Renders the filter
	     * @param  {Renderer} renderer
	     * @return {Promise}
	     */
	    value: function render(renderer) {
	      var stack = new _filter2['default'].PrimitivesStack();

	      // Desaturation
	      stack.add(new _filter2['default'].Primitives.Desaturation({
	        desaturation: 0.5
	      }));

	      // Tone curve
	      stack.add(new _filter2['default'].Primitives.ToneCurve({
	        rgbControlPoints: {
	          red: [[0, 0], [170, 170], [212, 219], [234, 242], [255, 255]],
	          green: [[0, 0], [170, 168], [234, 231], [255, 255]],
	          blue: [[0, 0], [170, 170], [212, 208], [255, 255]]
	        }
	      }));

	      stack.render(renderer);
	    }
	  }, {
	    key: 'name',

	    /**
	     * The name that is displayed in the UI
	     * @type {String}
	     */
	    get: function () {
	      return 'Breeze';
	    }
	  }], [{
	    key: 'identifier',

	    /**
	     * A unique string that identifies this operation. Can be used to select
	     * the active filter.
	     * @type {String}
	     */
	    get: function () {
	      return 'breeze';
	    }
	  }]);

	  return BreezeFilter;
	})(_filter2['default']);

	exports['default'] = BreezeFilter;
	module.exports = exports['default'];

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _filter = __webpack_require__(8);

	var _filter2 = _interopRequireDefault(_filter);

	/**
	 * BW Filter
	 * @class
	 * @alias ImglyKit.Filters.BWFilter
	 * @extends {ImglyKit.Filter}
	 */

	var BWFilter = (function (_Filter) {
	  function BWFilter() {
	    _classCallCheck(this, BWFilter);

	    if (_Filter != null) {
	      _Filter.apply(this, arguments);
	    }
	  }

	  _inherits(BWFilter, _Filter);

	  _createClass(BWFilter, [{
	    key: 'render',

	    /**
	     * Renders the filter
	     * @param  {Renderer} renderer
	     * @return {Promise}
	     */
	    value: function render(renderer) {
	      var stack = new _filter2['default'].PrimitivesStack();

	      stack.add(new _filter2['default'].Primitives.Grayscale());

	      stack.render(renderer);
	    }
	  }, {
	    key: 'name',

	    /**
	     * The name that is displayed in the UI
	     * @type {String}
	     */
	    get: function () {
	      return 'B&W';
	    }
	  }], [{
	    key: 'identifier',

	    /**
	     * A unique string that identifies this operation. Can be used to select
	     * the active filter.
	     * @type {String}
	     */
	    get: function () {
	      return 'bw';
	    }
	  }]);

	  return BWFilter;
	})(_filter2['default']);

	exports['default'] = BWFilter;
	module.exports = exports['default'];

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _filter = __webpack_require__(8);

	var _filter2 = _interopRequireDefault(_filter);

	/**
	 * BWHard Filter
	 * @class
	 * @alias ImglyKit.Filters.BWHardFilter
	 * @extends {ImglyKit.Filter}
	 */

	var BWHardFilter = (function (_Filter) {
	  function BWHardFilter() {
	    _classCallCheck(this, BWHardFilter);

	    if (_Filter != null) {
	      _Filter.apply(this, arguments);
	    }
	  }

	  _inherits(BWHardFilter, _Filter);

	  _createClass(BWHardFilter, [{
	    key: 'render',

	    /**
	     * Renders the filter
	     * @param  {Renderer} renderer
	     * @return {Promise}
	     */
	    value: function render(renderer) {
	      var stack = new _filter2['default'].PrimitivesStack();

	      stack.add(new _filter2['default'].Primitives.Grayscale());
	      stack.add(new _filter2['default'].Primitives.Contrast({
	        contrast: 1.5
	      }));

	      stack.render(renderer);
	    }
	  }, {
	    key: 'name',

	    /**
	     * The name that is displayed in the UI
	     * @type {String}
	     */
	    get: function () {
	      return '1920';
	    }
	  }], [{
	    key: 'identifier',

	    /**
	     * A unique string that identifies this operation. Can be used to select
	     * the active filter.
	     * @type {String}
	     */
	    get: function () {
	      return 'bwhard';
	    }
	  }]);

	  return BWHardFilter;
	})(_filter2['default']);

	exports['default'] = BWHardFilter;
	module.exports = exports['default'];

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _filter = __webpack_require__(8);

	var _filter2 = _interopRequireDefault(_filter);

	/**
	 * Celsius Filter
	 * @class
	 * @alias ImglyKit.Filters.CelsiusFilter
	 * @extends {ImglyKit.Filter}
	 */

	var CelsiusFilter = (function (_Filter) {
	  function CelsiusFilter() {
	    _classCallCheck(this, CelsiusFilter);

	    if (_Filter != null) {
	      _Filter.apply(this, arguments);
	    }
	  }

	  _inherits(CelsiusFilter, _Filter);

	  _createClass(CelsiusFilter, [{
	    key: 'render',

	    /**
	     * Renders the filter
	     * @param  {Renderer} renderer
	     * @return {Promise}
	     */
	    value: function render(renderer) {
	      var stack = new _filter2['default'].PrimitivesStack();

	      stack.add(new _filter2['default'].Primitives.ToneCurve({
	        rgbControlPoints: {
	          red: [[0, 69], [55, 110], [202, 230], [255, 255]],
	          green: [[0, 44], [89, 93], [185, 141], [255, 189]],
	          blue: [[0, 76], [39, 82], [218, 138], [255, 171]]
	        }
	      }));

	      stack.render(renderer);
	    }
	  }, {
	    key: 'name',

	    /**
	     * The name that is displayed in the UI
	     * @type {String}
	     */
	    get: function () {
	      return 'Celsius';
	    }
	  }], [{
	    key: 'identifier',

	    /**
	     * A unique string that identifies this operation. Can be used to select
	     * the active filter.
	     * @type {String}
	     */
	    get: function () {
	      return 'celsius';
	    }
	  }]);

	  return CelsiusFilter;
	})(_filter2['default']);

	exports['default'] = CelsiusFilter;
	module.exports = exports['default'];

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _filter = __webpack_require__(8);

	var _filter2 = _interopRequireDefault(_filter);

	/**
	 * Chest Filter
	 * @class
	 * @alias ImglyKit.Filters.ChestFilter
	 * @extends {ImglyKit.Filter}
	 */

	var ChestFilter = (function (_Filter) {
	  function ChestFilter() {
	    _classCallCheck(this, ChestFilter);

	    if (_Filter != null) {
	      _Filter.apply(this, arguments);
	    }
	  }

	  _inherits(ChestFilter, _Filter);

	  _createClass(ChestFilter, [{
	    key: 'render',

	    /**
	     * Renders the filter
	     * @param  {Renderer} renderer
	     * @return {Promise}
	     */
	    value: function render(renderer) {
	      var stack = new _filter2['default'].PrimitivesStack();

	      // Tone curve
	      stack.add(new _filter2['default'].Primitives.ToneCurve({
	        rgbControlPoints: {
	          red: [[0, 0], [44, 44], [124, 143], [221, 204], [255, 255]],
	          green: [[0, 0], [130, 127], [213, 199], [255, 255]],
	          blue: [[0, 0], [51, 52], [219, 204], [255, 255]]
	        }
	      }));

	      stack.render(renderer);
	    }
	  }, {
	    key: 'name',

	    /**
	     * The name that is displayed in the UI
	     * @type {String}
	     */
	    get: function () {
	      return 'Chest';
	    }
	  }], [{
	    key: 'identifier',

	    /**
	     * A unique string that identifies this operation. Can be used to select
	     * the active filter.
	     * @type {String}
	     */
	    get: function () {
	      return 'chest';
	    }
	  }]);

	  return ChestFilter;
	})(_filter2['default']);

	exports['default'] = ChestFilter;
	module.exports = exports['default'];

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _filter = __webpack_require__(8);

	var _filter2 = _interopRequireDefault(_filter);

	/**
	 * Fixie Filter
	 * @class
	 * @alias ImglyKit.Filters.FixieFilter
	 * @extends {ImglyKit.Filter}
	 */

	var FixieFilter = (function (_Filter) {
	  function FixieFilter() {
	    _classCallCheck(this, FixieFilter);

	    if (_Filter != null) {
	      _Filter.apply(this, arguments);
	    }
	  }

	  _inherits(FixieFilter, _Filter);

	  _createClass(FixieFilter, [{
	    key: 'render',

	    /**
	     * Renders the filter
	     * @param  {Renderer} renderer
	     * @return {Promise}
	     */
	    value: function render(renderer) {
	      var stack = new _filter2['default'].PrimitivesStack();

	      // Tone curve
	      stack.add(new _filter2['default'].Primitives.ToneCurve({
	        rgbControlPoints: {
	          red: [[0, 0], [44, 28], [63, 48], [128, 132], [235, 248], [255, 255]],
	          green: [[0, 0], [20, 10], [60, 45], [190, 209], [211, 231], [255, 255]],
	          blue: [[0, 31], [41, 62], [150, 142], [234, 212], [255, 224]]
	        }
	      }));

	      stack.render(renderer);
	    }
	  }, {
	    key: 'name',

	    /**
	     * The name that is displayed in the UI
	     * @type {String}
	     */
	    get: function () {
	      return 'Fixie';
	    }
	  }], [{
	    key: 'identifier',

	    /**
	     * A unique string that identifies this operation. Can be used to select
	     * the active filter.
	     * @type {String}
	     */
	    get: function () {
	      return 'fixie';
	    }
	  }]);

	  return FixieFilter;
	})(_filter2['default']);

	exports['default'] = FixieFilter;
	module.exports = exports['default'];

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _filter = __webpack_require__(8);

	var _filter2 = _interopRequireDefault(_filter);

	/**
	 * Food Filter
	 * @class
	 * @alias ImglyKit.Filters.FoodFilter
	 * @extends {ImglyKit.Filter}
	 */

	var FoodFilter = (function (_Filter) {
	  function FoodFilter() {
	    _classCallCheck(this, FoodFilter);

	    if (_Filter != null) {
	      _Filter.apply(this, arguments);
	    }
	  }

	  _inherits(FoodFilter, _Filter);

	  _createClass(FoodFilter, [{
	    key: 'render',

	    /**
	     * Renders the filter
	     * @param  {Renderer} renderer
	     * @return {Promise}
	     */
	    value: function render(renderer) {
	      var stack = new _filter2['default'].PrimitivesStack();

	      stack.add(new _filter2['default'].Primitives.Saturation({
	        saturation: 1.35
	      }));

	      stack.add(new _filter2['default'].Primitives.Contrast({
	        contrast: 1.1
	      }));

	      stack.render(renderer);
	    }
	  }, {
	    key: 'name',

	    /**
	     * The name that is displayed in the UI
	     * @type {String}
	     */
	    get: function () {
	      return 'Food';
	    }
	  }], [{
	    key: 'identifier',

	    /**
	     * A unique string that identifies this operation. Can be used to select
	     * the active filter.
	     * @type {String}
	     */
	    get: function () {
	      return 'food';
	    }
	  }]);

	  return FoodFilter;
	})(_filter2['default']);

	exports['default'] = FoodFilter;
	module.exports = exports['default'];

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _filter = __webpack_require__(8);

	var _filter2 = _interopRequireDefault(_filter);

	/**
	 * Fridge Filter
	 * @class
	 * @alias ImglyKit.Filters.FridgeFilter
	 * @extends {ImglyKit.Filter}
	 */

	var FridgeFilter = (function (_Filter) {
	  function FridgeFilter() {
	    _classCallCheck(this, FridgeFilter);

	    if (_Filter != null) {
	      _Filter.apply(this, arguments);
	    }
	  }

	  _inherits(FridgeFilter, _Filter);

	  _createClass(FridgeFilter, [{
	    key: 'render',

	    /**
	     * Renders the filter
	     * @param  {Renderer} renderer
	     * @return {Promise}
	     */
	    value: function render(renderer) {
	      var stack = new _filter2['default'].PrimitivesStack();

	      // Tone curve
	      stack.add(new _filter2['default'].Primitives.ToneCurve({
	        rgbControlPoints: {
	          red: [[0, 9], [21, 11], [45, 24], [255, 220]],
	          green: [[0, 12], [21, 21], [42, 42], [150, 150], [170, 173], [255, 210]],
	          blue: [[0, 28], [43, 72], [128, 185], [255, 220]]
	        }
	      }));

	      stack.render(renderer);
	    }
	  }, {
	    key: 'name',

	    /**
	     * The name that is displayed in the UI
	     * @type {String}
	     */
	    get: function () {
	      return 'Fridge';
	    }
	  }], [{
	    key: 'identifier',

	    /**
	     * A unique string that identifies this operation. Can be used to select
	     * the active filter.
	     * @type {String}
	     */
	    get: function () {
	      return 'fridge';
	    }
	  }]);

	  return FridgeFilter;
	})(_filter2['default']);

	exports['default'] = FridgeFilter;
	module.exports = exports['default'];

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _filter = __webpack_require__(8);

	var _filter2 = _interopRequireDefault(_filter);

	/**
	 * Front Filter
	 * @class
	 * @alias ImglyKit.Filters.FrontFilter
	 * @extends {ImglyKit.Filter}
	 */

	var FrontFilter = (function (_Filter) {
	  function FrontFilter() {
	    _classCallCheck(this, FrontFilter);

	    if (_Filter != null) {
	      _Filter.apply(this, arguments);
	    }
	  }

	  _inherits(FrontFilter, _Filter);

	  _createClass(FrontFilter, [{
	    key: 'render',

	    /**
	     * Renders the filter
	     * @param  {Renderer} renderer
	     * @return {Promise}
	     */
	    value: function render(renderer) {
	      var stack = new _filter2['default'].PrimitivesStack();

	      // Tone curve
	      stack.add(new _filter2['default'].Primitives.ToneCurve({
	        rgbControlPoints: {
	          red: [[0, 65], [28, 67], [67, 113], [125, 183], [187, 217], [255, 229]],
	          green: [[0, 52], [42, 59], [104, 134], [169, 209], [255, 240]],
	          blue: [[0, 52], [65, 68], [93, 104], [150, 153], [255, 198]]
	        }
	      }));

	      stack.render(renderer);
	    }
	  }, {
	    key: 'name',

	    /**
	     * The name that is displayed in the UI
	     * @type {String}
	     */
	    get: function () {
	      return 'Front';
	    }
	  }], [{
	    key: 'identifier',

	    /**
	     * A unique string that identifies this operation. Can be used to select
	     * the active filter.
	     * @type {String}
	     */
	    get: function () {
	      return 'front';
	    }
	  }]);

	  return FrontFilter;
	})(_filter2['default']);

	exports['default'] = FrontFilter;
	module.exports = exports['default'];

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _filter = __webpack_require__(8);

	var _filter2 = _interopRequireDefault(_filter);

	/**
	 * Glam Filter
	 * @class
	 * @alias ImglyKit.Filters.GlamFilter
	 * @extends {ImglyKit.Filter}
	 */

	var GlamFilter = (function (_Filter) {
	  function GlamFilter() {
	    _classCallCheck(this, GlamFilter);

	    if (_Filter != null) {
	      _Filter.apply(this, arguments);
	    }
	  }

	  _inherits(GlamFilter, _Filter);

	  _createClass(GlamFilter, [{
	    key: 'render',

	    /**
	     * Renders the filter
	     * @param  {Renderer} renderer
	     * @return {Promise}
	     */
	    value: function render(renderer) {
	      var stack = new _filter2['default'].PrimitivesStack();

	      stack.add(new _filter2['default'].Primitives.Contrast({
	        contrast: 1.1
	      }));

	      stack.add(new _filter2['default'].Primitives.ToneCurve({
	        rgbControlPoints: {
	          red: [[0, 0], [94, 74], [181, 205], [255, 255]],
	          green: [[0, 0], [127, 127], [255, 255]],
	          blue: [[0, 0], [102, 73], [227, 213], [255, 255]]
	        }
	      }));

	      stack.render(renderer);
	    }
	  }, {
	    key: 'name',

	    /**
	     * The name that is displayed in the UI
	     * @type {String}
	     */
	    get: function () {
	      return 'Glam';
	    }
	  }], [{
	    key: 'identifier',

	    /**
	     * A unique string that identifies this operation. Can be used to select
	     * the active filter.
	     * @type {String}
	     */
	    get: function () {
	      return 'glam';
	    }
	  }]);

	  return GlamFilter;
	})(_filter2['default']);

	exports['default'] = GlamFilter;
	module.exports = exports['default'];

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _filter = __webpack_require__(8);

	var _filter2 = _interopRequireDefault(_filter);

	/**
	 * Gobblin Filter
	 * @class
	 * @alias ImglyKit.Filters.GobblinFilter
	 * @extends {ImglyKit.Filter}
	 */

	var GobblinFilter = (function (_Filter) {
	  function GobblinFilter() {
	    _classCallCheck(this, GobblinFilter);

	    if (_Filter != null) {
	      _Filter.apply(this, arguments);
	    }
	  }

	  _inherits(GobblinFilter, _Filter);

	  _createClass(GobblinFilter, [{
	    key: 'render',

	    /**
	     * Renders the filter
	     * @param  {Renderer} renderer
	     * @return {Promise}
	     */
	    value: function render(renderer) {
	      var stack = new _filter2['default'].PrimitivesStack();

	      stack.add(new _filter2['default'].Primitives.Gobblin());

	      stack.render(renderer);
	    }
	  }, {
	    key: 'name',

	    /**
	     * The name that is displayed in the UI
	     * @type {String}
	     */
	    get: function () {
	      return 'Gobblin';
	    }
	  }], [{
	    key: 'identifier',

	    /**
	     * A unique string that identifies this operation. Can be used to select
	     * the active filter.
	     * @type {String}
	     */
	    get: function () {
	      return 'gobblin';
	    }
	  }]);

	  return GobblinFilter;
	})(_filter2['default']);

	exports['default'] = GobblinFilter;
	module.exports = exports['default'];

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _filter = __webpack_require__(8);

	var _filter2 = _interopRequireDefault(_filter);

	/**
	 * K1 Filter
	 * @class
	 * @alias ImglyKit.Filters.K1Filter
	 * @extends {ImglyKit.Filter}
	 */

	var K1Filter = (function (_Filter) {
	  function K1Filter() {
	    _classCallCheck(this, K1Filter);

	    if (_Filter != null) {
	      _Filter.apply(this, arguments);
	    }
	  }

	  _inherits(K1Filter, _Filter);

	  _createClass(K1Filter, [{
	    key: 'render',

	    /**
	     * Renders the filter
	     * @param  {Renderer} renderer
	     * @return {Promise}
	     */
	    value: function render(renderer) {
	      var stack = new _filter2['default'].PrimitivesStack();

	      // Tone curve
	      stack.add(new _filter2['default'].Primitives.ToneCurve({
	        controlPoints: [[0, 0], [53, 32], [91, 80], [176, 205], [255, 255]]
	      }));

	      // Saturation
	      stack.add(new _filter2['default'].Primitives.Saturation({
	        saturation: 0.9
	      }));

	      stack.render(renderer);
	    }
	  }, {
	    key: 'name',

	    /**
	     * The name that is displayed in the UI
	     * @type {String}
	     */
	    get: function () {
	      return 'K1';
	    }
	  }], [{
	    key: 'identifier',

	    /**
	     * A unique string that identifies this operation. Can be used to select
	     * the active filter.
	     * @type {String}
	     */
	    get: function () {
	      return 'k1';
	    }
	  }]);

	  return K1Filter;
	})(_filter2['default']);

	exports['default'] = K1Filter;
	module.exports = exports['default'];

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _filter = __webpack_require__(8);

	var _filter2 = _interopRequireDefault(_filter);

	var _libColor = __webpack_require__(7);

	var _libColor2 = _interopRequireDefault(_libColor);

	/**
	 * K2 Filter
	 * @class
	 * @alias ImglyKit.Filters.K2Filter
	 * @extends {ImglyKit.Filter}
	 */

	var K2Filter = (function (_Filter) {
	  function K2Filter() {
	    _classCallCheck(this, K2Filter);

	    if (_Filter != null) {
	      _Filter.apply(this, arguments);
	    }
	  }

	  _inherits(K2Filter, _Filter);

	  _createClass(K2Filter, [{
	    key: 'render',

	    /**
	     * Renders the filter
	     * @param  {Renderer} renderer
	     * @return {Promise}
	     */
	    value: function render(renderer) {
	      var stack = new _filter2['default'].PrimitivesStack();

	      // Tone curve
	      stack.add(new _filter2['default'].Primitives.ToneCurve({
	        controlPoints: [[0, 0], [54, 33], [77, 82], [94, 103], [122, 126], [177, 193], [229, 232], [255, 255]]
	      }));

	      // Soft color overlay
	      stack.add(new _filter2['default'].Primitives.SoftColorOverlay({
	        color: new _libColor2['default'](40 / 255, 40 / 255, 40 / 255)
	      }));

	      stack.render(renderer);
	    }
	  }, {
	    key: 'name',

	    /**
	     * The name that is displayed in the UI
	     * @type {String}
	     */
	    get: function () {
	      return 'K2';
	    }
	  }], [{
	    key: 'identifier',

	    /**
	     * A unique string that identifies this operation. Can be used to select
	     * the active filter.
	     * @type {String}
	     */
	    get: function () {
	      return 'k2';
	    }
	  }]);

	  return K2Filter;
	})(_filter2['default']);

	exports['default'] = K2Filter;
	module.exports = exports['default'];

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _filter = __webpack_require__(8);

	var _filter2 = _interopRequireDefault(_filter);

	/**
	 * K6 Filter
	 * @class
	 * @alias ImglyKit.Filters.K6Filter
	 * @extends {ImglyKit.Filter}
	 */

	var K6Filter = (function (_Filter) {
	  function K6Filter() {
	    _classCallCheck(this, K6Filter);

	    if (_Filter != null) {
	      _Filter.apply(this, arguments);
	    }
	  }

	  _inherits(K6Filter, _Filter);

	  _createClass(K6Filter, [{
	    key: 'render',

	    /**
	     * Renders the filter
	     * @param  {Renderer} renderer
	     * @return {Promise}
	     */
	    value: function render(renderer) {
	      var stack = new _filter2['default'].PrimitivesStack();

	      // Saturation
	      stack.add(new _filter2['default'].Primitives.Saturation({
	        saturation: 0.5
	      }));

	      stack.render(renderer);
	    }
	  }, {
	    key: 'name',

	    /**
	     * The name that is displayed in the UI
	     * @type {String}
	     */
	    get: function () {
	      return 'K6';
	    }
	  }], [{
	    key: 'identifier',

	    /**
	     * A unique string that identifies this operation. Can be used to select
	     * the active filter.
	     * @type {String}
	     */
	    get: function () {
	      return 'k6';
	    }
	  }]);

	  return K6Filter;
	})(_filter2['default']);

	exports['default'] = K6Filter;
	module.exports = exports['default'];

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _filter = __webpack_require__(8);

	var _filter2 = _interopRequireDefault(_filter);

	/**
	 * KDynamic Filter
	 * @class
	 * @alias ImglyKit.Filters.KDynamicFilter
	 * @extends {ImglyKit.Filter}
	 */

	var KDynamicFilter = (function (_Filter) {
	  function KDynamicFilter() {
	    _classCallCheck(this, KDynamicFilter);

	    if (_Filter != null) {
	      _Filter.apply(this, arguments);
	    }
	  }

	  _inherits(KDynamicFilter, _Filter);

	  _createClass(KDynamicFilter, [{
	    key: 'render',

	    /**
	     * Renders the filter
	     * @param  {Renderer} renderer
	     * @return {Promise}
	     */
	    value: function render(renderer) {
	      var stack = new _filter2['default'].PrimitivesStack();

	      // Tone curve
	      stack.add(new _filter2['default'].Primitives.ToneCurve({
	        controlPoints: [[0, 0], [17, 27], [46, 69], [90, 112], [156, 200], [203, 243], [255, 255]]
	      }));

	      // Saturation
	      stack.add(new _filter2['default'].Primitives.Saturation({
	        saturation: 0.7
	      }));

	      stack.render(renderer);
	    }
	  }, {
	    key: 'name',

	    /**
	     * The name that is displayed in the UI
	     * @type {String}
	     */
	    get: function () {
	      return 'KDynamic';
	    }
	  }], [{
	    key: 'identifier',

	    /**
	     * A unique string that identifies this operation. Can be used to select
	     * the active filter.
	     * @type {String}
	     */
	    get: function () {
	      return 'kdynamic';
	    }
	  }]);

	  return KDynamicFilter;
	})(_filter2['default']);

	exports['default'] = KDynamicFilter;
	module.exports = exports['default'];

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _filter = __webpack_require__(8);

	var _filter2 = _interopRequireDefault(_filter);

	/**
	 * Lenin Filter
	 * @class
	 * @alias ImglyKit.Filters.LeninFilter
	 * @extends {ImglyKit.Filter}
	 */

	var LeninFilter = (function (_Filter) {
	  function LeninFilter() {
	    _classCallCheck(this, LeninFilter);

	    if (_Filter != null) {
	      _Filter.apply(this, arguments);
	    }
	  }

	  _inherits(LeninFilter, _Filter);

	  _createClass(LeninFilter, [{
	    key: 'render',

	    /**
	     * Renders the filter
	     * @param  {Renderer} renderer
	     * @return {Promise}
	     */
	    value: function render(renderer) {
	      var stack = new _filter2['default'].PrimitivesStack();

	      // Desaturation
	      stack.add(new _filter2['default'].Primitives.Desaturation({
	        desaturation: 0.4
	      }));

	      // Tone curve
	      stack.add(new _filter2['default'].Primitives.ToneCurve({
	        rgbControlPoints: {
	          red: [[0, 20], [40, 20], [106, 111], [129, 153], [190, 223], [255, 255]],
	          green: [[0, 20], [40, 20], [62, 41], [106, 108], [132, 159], [203, 237], [255, 255]],
	          blue: [[0, 40], [40, 40], [73, 60], [133, 160], [191, 297], [203, 237], [237, 239], [255, 255]]
	        }
	      }));

	      stack.render(renderer);
	    }
	  }, {
	    key: 'name',

	    /**
	     * The name that is displayed in the UI
	     * @type {String}
	     */
	    get: function () {
	      return 'Lenin';
	    }
	  }], [{
	    key: 'identifier',

	    /**
	     * A unique string that identifies this operation. Can be used to select
	     * the active filter.
	     * @type {String}
	     */
	    get: function () {
	      return 'lenin';
	    }
	  }]);

	  return LeninFilter;
	})(_filter2['default']);

	exports['default'] = LeninFilter;
	module.exports = exports['default'];

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _filter = __webpack_require__(8);

	var _filter2 = _interopRequireDefault(_filter);

	/**
	 * Lomo Filter
	 * @class
	 * @alias ImglyKit.Filters.LomoFilter
	 * @extends {ImglyKit.Filter}
	 */

	var LomoFilter = (function (_Filter) {
	  function LomoFilter() {
	    _classCallCheck(this, LomoFilter);

	    if (_Filter != null) {
	      _Filter.apply(this, arguments);
	    }
	  }

	  _inherits(LomoFilter, _Filter);

	  _createClass(LomoFilter, [{
	    key: 'render',

	    /**
	     * Renders the filter
	     * @param  {Renderer} renderer
	     * @return {Promise}
	     */
	    value: function render(renderer) {
	      var stack = new _filter2['default'].PrimitivesStack();

	      stack.add(new _filter2['default'].Primitives.ToneCurve({
	        controlPoints: [[0, 0], [87, 20], [131, 156], [183, 205], [255, 200]]
	      }));

	      stack.render(renderer);
	    }
	  }, {
	    key: 'name',

	    /**
	     * The name that is displayed in the UI
	     * @type {String}
	     */
	    get: function () {
	      return 'Lomo';
	    }
	  }], [{
	    key: 'identifier',

	    /**
	     * A unique string that identifies this operation. Can be used to select
	     * the active filter.
	     * @type {String}
	     */
	    get: function () {
	      return 'lomo';
	    }
	  }]);

	  return LomoFilter;
	})(_filter2['default']);

	exports['default'] = LomoFilter;
	module.exports = exports['default'];

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _filter = __webpack_require__(8);

	var _filter2 = _interopRequireDefault(_filter);

	/**
	 * Mellow Filter
	 * @class
	 * @alias ImglyKit.Filters.MellowFilter
	 * @extends {ImglyKit.Filter}
	 */

	var MellowFilter = (function (_Filter) {
	  function MellowFilter() {
	    _classCallCheck(this, MellowFilter);

	    if (_Filter != null) {
	      _Filter.apply(this, arguments);
	    }
	  }

	  _inherits(MellowFilter, _Filter);

	  _createClass(MellowFilter, [{
	    key: 'render',

	    /**
	     * Renders the filter
	     * @param  {Renderer} renderer
	     * @return {Promise}
	     */
	    value: function render(renderer) {
	      var stack = new _filter2['default'].PrimitivesStack();

	      stack.add(new _filter2['default'].Primitives.ToneCurve({
	        rgbControlPoints: {
	          red: [[0, 0], [41, 84], [87, 134], [255, 255]],
	          green: [[0, 0], [255, 216]],
	          blue: [[0, 0], [255, 131]]
	        }
	      }));

	      stack.render(renderer);
	    }
	  }, {
	    key: 'name',

	    /**
	     * The name that is displayed in the UI
	     * @type {String}
	     */
	    get: function () {
	      return 'Mellow';
	    }
	  }], [{
	    key: 'identifier',

	    /**
	     * A unique string that identifies this operation. Can be used to select
	     * the active filter.
	     * @type {String}
	     */
	    get: function () {
	      return 'mellow';
	    }
	  }]);

	  return MellowFilter;
	})(_filter2['default']);

	exports['default'] = MellowFilter;
	module.exports = exports['default'];

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _filter = __webpack_require__(8);

	var _filter2 = _interopRequireDefault(_filter);

	/**
	 * Morning Filter
	 * @class
	 * @alias ImglyKit.Filters.MorningFilter
	 * @extends {ImglyKit.Filter}
	 */

	var MorningFilter = (function (_Filter) {
	  function MorningFilter() {
	    _classCallCheck(this, MorningFilter);

	    if (_Filter != null) {
	      _Filter.apply(this, arguments);
	    }
	  }

	  _inherits(MorningFilter, _Filter);

	  _createClass(MorningFilter, [{
	    key: 'render',

	    /**
	     * Renders the filter
	     * @param  {Renderer} renderer
	     * @return {Promise}
	     */
	    value: function render(renderer) {
	      var stack = new _filter2['default'].PrimitivesStack();

	      stack.add(new _filter2['default'].Primitives.ToneCurve({
	        rgbControlPoints: {
	          red: [[0, 40], [255, 230]],
	          green: [[0, 10], [255, 225]],
	          blue: [[0, 20], [255, 181]]
	        }
	      }));

	      stack.add(new _filter2['default'].Primitives.Glow());

	      stack.render(renderer);
	    }
	  }, {
	    key: 'name',

	    /**
	     * The name that is displayed in the UI
	     * @type {String}
	     */
	    get: function () {
	      return 'Morning';
	    }
	  }], [{
	    key: 'identifier',

	    /**
	     * A unique string that identifies this operation. Can be used to select
	     * the active filter.
	     * @type {String}
	     */
	    get: function () {
	      return 'morning';
	    }
	  }]);

	  return MorningFilter;
	})(_filter2['default']);

	exports['default'] = MorningFilter;
	module.exports = exports['default'];

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _filter = __webpack_require__(8);

	var _filter2 = _interopRequireDefault(_filter);

	/**
	 * Orchid Filter
	 * @class
	 * @alias ImglyKit.Filters.OrchidFilter
	 * @extends {ImglyKit.Filter}
	 */

	var OrchidFilter = (function (_Filter) {
	  function OrchidFilter() {
	    _classCallCheck(this, OrchidFilter);

	    if (_Filter != null) {
	      _Filter.apply(this, arguments);
	    }
	  }

	  _inherits(OrchidFilter, _Filter);

	  _createClass(OrchidFilter, [{
	    key: 'render',

	    /**
	     * Renders the filter
	     * @param  {Renderer} renderer
	     * @return {Promise}
	     */
	    value: function render(renderer) {
	      var stack = new _filter2['default'].PrimitivesStack();

	      // Tone curve
	      stack.add(new _filter2['default'].Primitives.ToneCurve({
	        rgbControlPoints: {
	          red: [[0, 0], [115, 130], [195, 215], [255, 255]],
	          green: [[0, 0], [148, 153], [172, 215], [255, 255]],
	          blue: [[0, 46], [58, 75], [178, 205], [255, 255]]
	        }
	      }));

	      // Tone curve
	      stack.add(new _filter2['default'].Primitives.ToneCurve({
	        controlPoints: [[0, 0], [117, 151], [189, 217], [255, 255]]
	      }));

	      // Desaturation
	      stack.add(new _filter2['default'].Primitives.Desaturation({
	        desaturation: 0.65
	      }));

	      stack.render(renderer);
	    }
	  }, {
	    key: 'name',

	    /**
	     * The name that is displayed in the UI
	     * @type {String}
	     */
	    get: function () {
	      return 'Orchid';
	    }
	  }], [{
	    key: 'identifier',

	    /**
	     * A unique string that identifies this operation. Can be used to select
	     * the active filter.
	     * @type {String}
	     */
	    get: function () {
	      return 'orchid';
	    }
	  }]);

	  return OrchidFilter;
	})(_filter2['default']);

	exports['default'] = OrchidFilter;
	module.exports = exports['default'];

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _filter = __webpack_require__(8);

	var _filter2 = _interopRequireDefault(_filter);

	/**
	 * Pola Filter
	 * @class
	 * @alias ImglyKit.Filters.PolaFilter
	 * @extends {ImglyKit.Filter}
	 */

	var PolaFilter = (function (_Filter) {
	  function PolaFilter() {
	    _classCallCheck(this, PolaFilter);

	    if (_Filter != null) {
	      _Filter.apply(this, arguments);
	    }
	  }

	  _inherits(PolaFilter, _Filter);

	  _createClass(PolaFilter, [{
	    key: 'render',

	    /**
	     * Renders the filter
	     * @param  {Renderer} renderer
	     * @return {Promise}
	     */
	    value: function render(renderer) {
	      var stack = new _filter2['default'].PrimitivesStack();

	      stack.add(new _filter2['default'].Primitives.ToneCurve({
	        rgbControlPoints: {
	          red: [[0, 0], [94, 74], [181, 205], [255, 255]],
	          green: [[0, 0], [34, 34], [99, 76], [176, 190], [255, 255]],
	          blue: [[0, 0], [102, 73], [227, 213], [255, 255]]
	        }
	      }));

	      stack.add(new _filter2['default'].Primitives.Saturation({
	        saturation: 0.8
	      }));

	      stack.add(new _filter2['default'].Primitives.Contrast({
	        contrast: 1.5
	      }));

	      stack.render(renderer);
	    }
	  }, {
	    key: 'name',

	    /**
	     * The name that is displayed in the UI
	     * @type {String}
	     */
	    get: function () {
	      return 'Pola SX';
	    }
	  }], [{
	    key: 'identifier',

	    /**
	     * A unique string that identifies this operation. Can be used to select
	     * the active filter.
	     * @type {String}
	     */
	    get: function () {
	      return 'pola';
	    }
	  }]);

	  return PolaFilter;
	})(_filter2['default']);

	exports['default'] = PolaFilter;
	module.exports = exports['default'];

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _filter = __webpack_require__(8);

	var _filter2 = _interopRequireDefault(_filter);

	/**
	 * Pola669 Filter
	 * @class
	 * @alias ImglyKit.Filters.Pola669Filter
	 * @extends {ImglyKit.Filter}
	 */

	var Pola669Filter = (function (_Filter) {
	  function Pola669Filter() {
	    _classCallCheck(this, Pola669Filter);

	    if (_Filter != null) {
	      _Filter.apply(this, arguments);
	    }
	  }

	  _inherits(Pola669Filter, _Filter);

	  _createClass(Pola669Filter, [{
	    key: 'render',

	    /**
	     * Renders the filter
	     * @param  {Renderer} renderer
	     * @return {Promise}
	     */
	    value: function render(renderer) {
	      var stack = new _filter2['default'].PrimitivesStack();

	      stack.add(new _filter2['default'].Primitives.ToneCurve({
	        rgbControlPoints: {
	          red: [[0, 0], [56, 18], [196, 209], [255, 255]],
	          green: [[0, 38], [71, 84], [255, 255]],
	          blue: [[0, 0], [131, 133], [204, 211], [255, 255]]
	        }
	      }));

	      stack.add(new _filter2['default'].Primitives.Saturation({
	        saturation: 0.8
	      }));

	      stack.add(new _filter2['default'].Primitives.Contrast({
	        contrast: 1.5
	      }));

	      stack.render(renderer);
	    }
	  }, {
	    key: 'name',

	    /**
	     * The name that is displayed in the UI
	     * @type {String}
	     */
	    get: function () {
	      return 'Pola 669';
	    }
	  }], [{
	    key: 'identifier',

	    /**
	     * A unique string that identifies this operation. Can be used to select
	     * the active filter.
	     * @type {String}
	     */
	    get: function () {
	      return 'pola669';
	    }
	  }]);

	  return Pola669Filter;
	})(_filter2['default']);

	exports['default'] = Pola669Filter;
	module.exports = exports['default'];

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _filter = __webpack_require__(8);

	var _filter2 = _interopRequireDefault(_filter);

	/**
	 * Quozi Filter
	 * @class
	 * @alias ImglyKit.Filters.QuoziFilter
	 * @extends {ImglyKit.Filter}
	 */

	var QuoziFilter = (function (_Filter) {
	  function QuoziFilter() {
	    _classCallCheck(this, QuoziFilter);

	    if (_Filter != null) {
	      _Filter.apply(this, arguments);
	    }
	  }

	  _inherits(QuoziFilter, _Filter);

	  _createClass(QuoziFilter, [{
	    key: 'render',

	    /**
	     * Renders the filter
	     * @param  {Renderer} renderer
	     * @return {Promise}
	     */
	    value: function render(renderer) {
	      var stack = new _filter2['default'].PrimitivesStack();

	      // Desaturation
	      stack.add(new _filter2['default'].Primitives.Desaturation({
	        desaturation: 0.65
	      }));

	      // Tone curve
	      stack.add(new _filter2['default'].Primitives.ToneCurve({
	        rgbControlPoints: {
	          red: [[0, 50], [40, 78], [118, 170], [181, 211], [255, 255]],
	          green: [[0, 27], [28, 45], [109, 157], [157, 195], [179, 208], [206, 212], [255, 240]],
	          blue: [[0, 50], [12, 55], [46, 103], [103, 162], [194, 182], [241, 201], [255, 219]]
	        }
	      }));

	      stack.render(renderer);
	    }
	  }, {
	    key: 'name',

	    /**
	     * The name that is displayed in the UI
	     * @type {String}
	     */
	    get: function () {
	      return 'Quozi';
	    }
	  }], [{
	    key: 'identifier',

	    /**
	     * A unique string that identifies this operation. Can be used to select
	     * the active filter.
	     * @type {String}
	     */
	    get: function () {
	      return 'quozi';
	    }
	  }]);

	  return QuoziFilter;
	})(_filter2['default']);

	exports['default'] = QuoziFilter;
	module.exports = exports['default'];

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _filter = __webpack_require__(8);

	var _filter2 = _interopRequireDefault(_filter);

	/**
	 * Semired Filter
	 * @class
	 * @alias ImglyKit.Filters.SemiredFilter
	 * @extends {ImglyKit.Filter}
	 */

	var SemiredFilter = (function (_Filter) {
	  function SemiredFilter() {
	    _classCallCheck(this, SemiredFilter);

	    if (_Filter != null) {
	      _Filter.apply(this, arguments);
	    }
	  }

	  _inherits(SemiredFilter, _Filter);

	  _createClass(SemiredFilter, [{
	    key: 'render',

	    /**
	     * Renders the filter
	     * @param  {Renderer} renderer
	     * @return {Promise}
	     */
	    value: function render(renderer) {
	      var stack = new _filter2['default'].PrimitivesStack();

	      stack.add(new _filter2['default'].Primitives.ToneCurve({
	        rgbControlPoints: {
	          red: [[0, 129], [75, 153], [181, 227], [255, 255]],
	          green: [[0, 8], [111, 85], [212, 158], [255, 226]],
	          blue: [[0, 5], [75, 22], [193, 90], [255, 229]]
	        }
	      }));

	      stack.add(new _filter2['default'].Primitives.Glow());

	      stack.render(renderer);
	    }
	  }, {
	    key: 'name',

	    /**
	     * The name that is displayed in the UI
	     * @type {String}
	     */
	    get: function () {
	      return 'Semi Red';
	    }
	  }], [{
	    key: 'identifier',

	    /**
	     * A unique string that identifies this operation. Can be used to select
	     * the active filter.
	     * @type {String}
	     */
	    get: function () {
	      return 'semired';
	    }
	  }]);

	  return SemiredFilter;
	})(_filter2['default']);

	exports['default'] = SemiredFilter;
	module.exports = exports['default'];

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _filter = __webpack_require__(8);

	var _filter2 = _interopRequireDefault(_filter);

	/**
	 * Sunny Filter
	 * @class
	 * @alias ImglyKit.Filters.SunnyFilter
	 * @extends {ImglyKit.Filter}
	 */

	var SunnyFilter = (function (_Filter) {
	  function SunnyFilter() {
	    _classCallCheck(this, SunnyFilter);

	    if (_Filter != null) {
	      _Filter.apply(this, arguments);
	    }
	  }

	  _inherits(SunnyFilter, _Filter);

	  _createClass(SunnyFilter, [{
	    key: 'render',

	    /**
	     * Renders the filter
	     * @param  {Renderer} renderer
	     * @return {Promise}
	     */
	    value: function render(renderer) {
	      var stack = new _filter2['default'].PrimitivesStack();

	      stack.add(new _filter2['default'].Primitives.ToneCurve({
	        rgbControlPoints: {
	          red: [[0, 0], [62, 82], [141, 154], [255, 255]],
	          green: [[0, 39], [56, 96], [192, 176], [255, 255]],
	          blue: [[0, 0], [174, 99], [255, 235]]
	        }
	      }));

	      stack.add(new _filter2['default'].Primitives.ToneCurve({
	        controlPoints: [[0, 0], [55, 20], [158, 191], [255, 255]]
	      }));

	      stack.render(renderer);
	    }
	  }, {
	    key: 'name',

	    /**
	     * The name that is displayed in the UI
	     * @type {String}
	     */
	    get: function () {
	      return 'Sunny';
	    }
	  }], [{
	    key: 'identifier',

	    /**
	     * A unique string that identifies this operation. Can be used to select
	     * the active filter.
	     * @type {String}
	     */
	    get: function () {
	      return 'sunny';
	    }
	  }]);

	  return SunnyFilter;
	})(_filter2['default']);

	exports['default'] = SunnyFilter;
	module.exports = exports['default'];

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _filter = __webpack_require__(8);

	var _filter2 = _interopRequireDefault(_filter);

	/**
	 * Texas Filter
	 * @class
	 * @alias ImglyKit.Filters.TexasFilter
	 * @extends {ImglyKit.Filter}
	 */

	var TexasFilter = (function (_Filter) {
	  function TexasFilter() {
	    _classCallCheck(this, TexasFilter);

	    if (_Filter != null) {
	      _Filter.apply(this, arguments);
	    }
	  }

	  _inherits(TexasFilter, _Filter);

	  _createClass(TexasFilter, [{
	    key: 'render',

	    /**
	     * Renders the filter
	     * @param  {Renderer} renderer
	     * @return {Promise}
	     */
	    value: function render(renderer) {
	      var stack = new _filter2['default'].PrimitivesStack();

	      stack.add(new _filter2['default'].Primitives.ToneCurve({
	        rgbControlPoints: {
	          red: [[0, 72], [89, 99], [176, 212], [255, 237]],
	          green: [[0, 49], [255, 192]],
	          blue: [[0, 72], [255, 151]]
	        }
	      }));

	      stack.render(renderer);
	    }
	  }, {
	    key: 'name',

	    /**
	     * The name that is displayed in the UI
	     * @type {String}
	     */
	    get: function () {
	      return 'Texas';
	    }
	  }], [{
	    key: 'identifier',

	    /**
	     * A unique string that identifies this operation. Can be used to select
	     * the active filter.
	     * @type {String}
	     */
	    get: function () {
	      return 'texas';
	    }
	  }]);

	  return TexasFilter;
	})(_filter2['default']);

	exports['default'] = TexasFilter;
	module.exports = exports['default'];

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _filter = __webpack_require__(8);

	var _filter2 = _interopRequireDefault(_filter);

	/**
	 * X400 Filter
	 * @class
	 * @alias ImglyKit.Filters.X400Filter
	 * @extends {ImglyKit.Filter}
	 */

	var X400Filter = (function (_Filter) {
	  function X400Filter() {
	    _classCallCheck(this, X400Filter);

	    if (_Filter != null) {
	      _Filter.apply(this, arguments);
	    }
	  }

	  _inherits(X400Filter, _Filter);

	  _createClass(X400Filter, [{
	    key: 'render',

	    /**
	     * Renders the filter
	     * @param  {Renderer} renderer
	     * @return {Promise}
	     */
	    value: function render(renderer) {
	      var stack = new _filter2['default'].PrimitivesStack();

	      stack.add(new _filter2['default'].Primitives.X400());

	      stack.render(renderer);
	    }
	  }, {
	    key: 'name',

	    /**
	     * The name that is displayed in the UI
	     * @type {String}
	     */
	    get: function () {
	      return 'X400';
	    }
	  }], [{
	    key: 'identifier',

	    /**
	     * A unique string that identifies this operation. Can be used to select
	     * the active filter.
	     * @type {String}
	     */
	    get: function () {
	      return 'x400';
	    }
	  }]);

	  return X400Filter;
	})(_filter2['default']);

	exports['default'] = X400Filter;
	module.exports = exports['default'];

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	/**
	 * Represents a 2-dimensional vector while providing math functions to
	 * modify / clone the vector. Fully chainable.
	 * @class
	 * @alias ImglyKit.Vector2
	 * @param {number} x
	 * @param {number} y
	 * @private
	 */
	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var Vector2 = (function () {
	  function Vector2(x, y) {
	    _classCallCheck(this, Vector2);

	    this.x = x;
	    this.y = y;
	    if (typeof this.x === 'undefined') {
	      this.x = 0;
	    }
	    if (typeof this.y === 'undefined') {
	      this.y = 0;
	    }
	  }

	  _createClass(Vector2, [{
	    key: 'set',

	    /**
	     * Sets the given values
	     * @param {number} x
	     * @param {number} y
	     * @return {Vector2}
	     */
	    value: function set(x, y) {
	      this.x = x;
	      this.y = y;
	      return this;
	    }
	  }, {
	    key: 'clone',

	    /**
	     * Creates a clone of this vector
	     * @return {Vector2}
	     */
	    value: function clone() {
	      return new Vector2(this.x, this.y);
	    }
	  }, {
	    key: 'copy',

	    /**
	     * Copies the values of the given vector
	     * @param  {Vector2} other
	     * @return {Vector2}
	     */
	    value: function copy(other) {
	      this.x = other.x;
	      this.y = other.y;
	      return this;
	    }
	  }, {
	    key: 'clamp',

	    /**
	     * Clamps this vector with the given Vector2 / number
	     * @param  {(number|Vector2)} minimum
	     * @param  {(number|Vector2)} maximum
	     * @return {Vector2}
	     */
	    value: function clamp(minimum, maximum) {
	      var minimumSet = minimum !== null && typeof minimum !== 'undefined';
	      var maximumSet = maximum !== null && typeof maximum !== 'undefined';

	      /* istanbul ignore else  */
	      if (!(minimum instanceof Vector2) && minimumSet) {
	        minimum = new Vector2(minimum, minimum);
	      }
	      /* istanbul ignore else  */
	      if (!(maximum instanceof Vector2) && maximumSet) {
	        maximum = new Vector2(maximum, maximum);
	      }

	      if (minimumSet) {
	        this.x = Math.max(minimum.x, this.x);
	        this.y = Math.max(minimum.y, this.y);
	      }

	      if (maximumSet) {
	        this.x = Math.min(maximum.x, this.x);
	        this.y = Math.min(maximum.y, this.y);
	      }
	      return this;
	    }
	  }, {
	    key: 'divide',

	    /**
	     * Divides this vector by the given Vector2 / number
	     * @param  {(number|Vector2)} divisor
	     * @param  {number} [y]
	     * @return {Vector2}
	     */
	    value: function divide(divisor, y) {
	      if (divisor instanceof Vector2) {
	        this.x /= divisor.x;
	        this.y /= divisor.y;
	      } else {
	        this.x /= divisor;
	        this.y /= typeof y === 'undefined' ? divisor : y;
	      }
	      return this;
	    }
	  }, {
	    key: 'subtract',

	    /**
	     * Subtracts the given Vector2 / number from this vector
	     * @param  {(number|Vector2)} subtrahend
	     * @param  {number} [y]
	     * @return {Vector2}
	     */
	    value: function subtract(subtrahend, y) {
	      if (subtrahend instanceof Vector2) {
	        this.x -= subtrahend.x;
	        this.y -= subtrahend.y;
	      } else {
	        this.x -= subtrahend;
	        this.y -= typeof y === 'undefined' ? subtrahend : y;
	      }
	      return this;
	    }
	  }, {
	    key: 'multiply',

	    /**
	     * Multiplies the given Vector2 / number with this vector
	     * @param  {(number|Vector2)} subtrahend
	     * @param  {number} [y]
	     * @return {Vector2}
	     */
	    value: function multiply(factor, y) {
	      if (factor instanceof Vector2) {
	        this.x *= factor.x;
	        this.y *= factor.y;
	      } else {
	        this.x *= factor;
	        this.y *= typeof y === 'undefined' ? factor : y;
	      }
	      return this;
	    }
	  }, {
	    key: 'add',

	    /**
	     * Adds the given Vector2 / numbers to this vector
	     * @param {(number|Vector2)} addend
	     * @param {number} [y]
	     */
	    value: function add(addend, y) {
	      if (addend instanceof Vector2) {
	        this.x += addend.x;
	        this.y += addend.y;
	      } else {
	        this.x += addend;
	        this.y += typeof y === 'undefined' ? addend : y;
	      }
	      return this;
	    }
	  }, {
	    key: 'equals',

	    /**
	     * Checks whether the x and y value are the same as the given ones
	     * @param  {(number|Vector2)} vec
	     * @param  {number} y
	     * @return {boolean}
	     */
	    value: function equals(vec, y) {
	      if (vec instanceof Vector2) {
	        return vec.x === this.x && vec.y === this.y;
	      } else {
	        return vec === this.x && y === this.y;
	      }
	    }
	  }, {
	    key: 'flip',

	    /**
	     * Flips the x and y values of this vector
	     * @return {Vector2}
	     */
	    value: function flip() {
	      var tempX = this.x;
	      this.x = this.y;
	      this.y = tempX;
	      return this;
	    }
	  }, {
	    key: 'toString',

	    /**
	     * Returns a string representation of this vector
	     * @return {String}
	     */
	    value: function toString() {
	      return 'Vector2({ x: ' + this.x + ', y: ' + this.y + ' })';
	    }
	  }]);

	  return Vector2;
	})();

	exports['default'] = Vector2;
	module.exports = exports['default'];

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	/* global FileReader, Image */
	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _lodash = __webpack_require__(1);

	var _lodash2 = _interopRequireDefault(_lodash);

	var _baseUi = __webpack_require__(75);

	var _baseUi2 = _interopRequireDefault(_baseUi);

	var _libCanvas = __webpack_require__(76);

	var _libCanvas2 = _interopRequireDefault(_libCanvas);

	var _libFileLoader = __webpack_require__(77);

	var _libFileLoader2 = _interopRequireDefault(_libFileLoader);

	var _libTopControls = __webpack_require__(78);

	var _libTopControls2 = _interopRequireDefault(_libTopControls);

	var _libScrollbar = __webpack_require__(79);

	var _libScrollbar2 = _interopRequireDefault(_libScrollbar);

	var _constants = __webpack_require__(5);



	var NightUI = (function (_UI) {
	  function NightUI() {
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    _classCallCheck(this, NightUI);

	    _get(Object.getPrototypeOf(NightUI.prototype), 'constructor', this).apply(this, args);

	    this._operationsMap = {};
	    this._template = "<div class=\"imglykit-container\">\n  <div class=\"imglykit-loadingOverlay\">\n    <div class=\"imglykit-loadingOverlay-content\">\n      <img src=\"{{= it.helpers.assetPath('ui/night/loading.gif')}}\" />\n      <span>Loading...</span>\n    </div>\n  </div>\n  {{? !it.options.ui.hideHeader }}\n  <div class=\"imglykit-header\">\n    img.ly Photo Editor SDK\n\n    {{? it.options.ui.showCloseButton }}\n    <div class=\"imglykit-close-button\">\n      <img src=\"{{=it.helpers.assetPath('ui/night/close.png')}}\" />\n    </div>\n    {{?}}\n  </div>\n  {{?}}\n  <div class=\"imglykit-top-controls{{? !it.options.ui.hideHeader }} imglykit-header-padding{{?}}\">\n    <div class=\"imglykit-top-controls-left\">\n      {{? it.options.ui.showNewButton }}\n      <div class=\"imglykit-new\">\n        <img src=\"{{=it.helpers.assetPath('ui/night/top/new.png')}}\" />\n        New\n      </div>\n      {{?}}\n      <div class=\"imglykit-undo\">\n        <img src=\"{{=it.helpers.assetPath('ui/night/top/undo.png')}}\" />\n        Undo\n      </div>\n      {{? it.options.ui.showExportButton }}\n      <div class=\"imglykit-export\">\n        <img src=\"{{=it.helpers.assetPath('ui/night/top/export.png')}}\" />\n        Export\n      </div>\n      {{?}}\n    </div>\n    <div class=\"imglykit-top-controls-right\">\n      <div class=\"imglykit-zoom-fit\"></div>\n      <div class=\"imglykit-zoom-level\">Zoom: <span class=\"imglykit-zoom-level-num\">100</span>%</div>\n      <div class=\"imglykit-zoom-in\">\n        <img src=\"{{=it.helpers.assetPath('ui/night/top/zoom-in.png')}}\" />\n      </div>\n      <div class=\"imglykit-zoom-out\">\n        <img src=\"{{=it.helpers.assetPath('ui/night/top/zoom-out.png')}}\" />\n      </div>\n    </div>\n  </div>\n\n  <div class=\"imglykit-canvas-container{{? !it.options.ui.hideHeader }} imglykit-header-padding{{?}}\">\n    <div class=\"imglykit-canvas-inner-container\">\n      <canvas class=\"imglykit-canvas-draggable\"></canvas>\n      <div class=\"imglykit-canvas-controls imglykit-canvas-controls-disabled\"></div>\n    </div>\n    {{? it.renderDropArea }}\n    <div class=\"imglykit-drop-area-container{{? !it.options.ui.hideHeader }} imglykit-header-padding{{?}}\">\n      <div class=\"imglykit-drop-area\">\n        <input type=\"file\" class=\"imglykit-drop-area-hidden-input\" />\n        <img src=\"{{=it.helpers.assetPath('ui/night/upload.png')}}\" />\n\n        <div class=\"imglykit-drop-area-content\">\n          <h1>Upload a picture</h1>\n          <span>Click to upload a picture from your library or just drag and drop</span>\n        </div>\n      </div>\n    </div>\n    {{?}}\n  </div>\n\n  <div class=\"imglykit-controls-container\">\n    <div class=\"imglykit-controls\">\n\n      <div>\n        <div class=\"imglykit-controls-overview\">\n          <ul class=\"imglykit-controls-list\">\n          {{ for (var identifier in it.controls) { }}\n            {{ var control = it.controls[identifier]; }}\n            <li data-identifier=\"{{= control.identifier}}\"{{? it.controlsDisabled }} data-disabled{{?}}>\n              <img src=\"{{=it.helpers.assetPath('ui/night/operations/' + control.identifier + '.png') }}\" />\n            </li>\n          {{ } }}\n          </ul>\n        </div>\n      </div>\n\n    </div>\n  </div>\n</div>\n";
	    this._registeredControls = {};
	    this._history = [];

	    // The `Night` UI has a fixed operation order
	    this._preferredOperationOrder = [
	    // First, all operations that affect the image dimensions
	    'rotation', 'crop', 'flip',

	    // Then color operations (first filters, then fine-tuning)
	    'filters', 'contrast', 'brightness', 'saturation',

	    // Then post-processing
	    'radial-blur', 'tilt-shift', 'frames', 'stickers', 'text'];

	    this._paused = false;

	    this._options.ui = _lodash2['default'].defaults(this._options.ui, {
	      showNewButton: !this._options.image,
	      showHeader: true,
	      showCloseButton: false,
	      showExportButton: false,
	      'export': {}
	    });

	    this._options.ui['export'] = _lodash2['default'].defaults(this._options.ui['export'], {
	      type: _constants.ImageFormat.JPEG,
	      quality: 0.8
	    });
	  }

	  _inherits(NightUI, _UI);

	  _createClass(NightUI, [{
	    key: 'run',

	    /**
	     * Prepares the UI for use
	     */
	    value: function run() {
	      this._registerControls();

	      _get(Object.getPrototypeOf(NightUI.prototype), 'run', this).call(this);

	      var container = this._options.container;

	      this._controlsContainer = container.querySelector('.imglykit-controls');
	      this._canvasControlsContainer = container.querySelector('.imglykit-canvas-controls');
	      this._overviewControlsContainer = container.querySelector('.imglykit-controls-overview');
	      this._loadingOverlay = container.querySelector('.imglykit-loadingOverlay');
	      this._loadingSpan = container.querySelector('.imglykit-loadingOverlay span');

	      this._handleOverview();

	      if (this._options.image) {
	        this._initCanvas();
	      }

	      if (this._options.ui.showNewButton) {
	        this._initFileLoader();
	      }

	      this._initTopControls();
	      this._initControls();

	      if (this._options.image) {
	        this.showZoom();
	      }

	      if (this._options.ui.showCloseButton) {
	        this._handleCloseButton();
	      }

	      this._topControls.updateExportButton();
	    }
	  }, {
	    key: '_initFileLoader',

	    /**
	     * Initializes the file loader
	     * @private
	     */
	    value: function _initFileLoader() {
	      this._fileLoader = new _libFileLoader2['default'](this._kit, this);
	      this._fileLoader.on('file', this._onFileLoaded.bind(this));
	    }
	  }, {
	    key: '_onFileLoaded',

	    /**
	     * Gets called when the user loaded a file using the FileLoader
	     * @param {File} file
	     * @private
	     */
	    value: function _onFileLoaded(file) {
	      var _this = this;

	      var reader = new FileReader();
	      reader.onload = (function () {
	        return function (e) {
	          var data = e.target.result;
	          var image = new Image();

	          image.addEventListener('load', function () {
	            _this._setImage(image);
	          });

	          image.src = data;
	        };
	      })(file);
	      reader.readAsDataURL(file);
	    }
	  }, {
	    key: '_setImage',

	    /**
	     * Sets the image option and starts rendering
	     * @param {Image} image
	     * @private
	     */
	    value: function _setImage(image) {
	      this._options.image = image;
	      if (this._canvas) {
	        this._canvas.reset();
	      }

	      this._fileLoader.removeDOM();

	      if (!this._canvas) {
	        this._initCanvas();
	      } else {
	        this._canvas.setImage(this._options.image);
	      }

	      this.showZoom();
	      this._topControls.init();
	      this._enableControls();

	      this._topControls.updateExportButton();
	    }
	  }, {
	    key: '_initTopControls',

	    /**
	     * Initializes the top controls
	     * @private
	     */
	    value: function _initTopControls() {
	      var _this2 = this;

	      this._topControls = new _libTopControls2['default'](this._kit, this);
	      this._topControls.run();

	      this._topControls.on('undo', function () {
	        _this2.undo();
	      });

	      this._topControls.on('export', function () {
	        _this2['export']();
	      });

	      // Pass zoom in event
	      this._topControls.on('zoom-in', function () {
	        _this2._canvas.zoomIn().then(function () {
	          if (_this2._currentControl) {
	            _this2._currentControl.onZoom();
	          }
	        });
	      });

	      // Pass zoom out event
	      this._topControls.on('zoom-out', function () {
	        _this2._canvas.zoomOut().then(function () {
	          if (_this2._currentControl) {
	            _this2._currentControl.onZoom();
	          }
	        });
	      });
	    }
	  }, {
	    key: '_initCanvas',

	    /**
	     * Inititializes the canvas
	     * @private
	     */
	    value: function _initCanvas() {
	      var _this3 = this;

	      this._canvas = new _libCanvas2['default'](this._kit, this, this._options);
	      this._canvas.run();
	      this._canvas.on('zoom', function () {
	        _this3._topControls.updateZoomLevel();
	      });
	    }
	  }, {
	    key: 'selectOperations',

	    /**
	     * Selects the enabled operations
	     * @param {ImglyKit.Selector}
	     */
	    value: function selectOperations(selector) {
	      _get(Object.getPrototypeOf(NightUI.prototype), 'selectOperations', this).call(this, selector);
	    }
	  }, {
	    key: 'getOrCreateOperation',

	    /**
	     * Returns or creates an instance of the operation with the given identifier
	     * @param {String} identifier
	     */
	    value: function getOrCreateOperation(identifier) {
	      var _kit = this._kit;
	      var operationsStack = _kit.operationsStack;
	      var registeredOperations = _kit.registeredOperations;

	      var Operation = registeredOperations[identifier];

	      if (typeof this._operationsMap[identifier] === 'undefined') {
	        // Create operation
	        var operationInstance = new Operation(this._kit);
	        this._operationsMap[identifier] = operationInstance;

	        // Find index in preferred operation order
	        var index = this._preferredOperationOrder.indexOf(identifier);
	        if (index === -1) {
	          index = this._preferredOperationOrder.length;
	        }
	        operationsStack[index] = operationInstance;

	        return operationInstance;
	      } else {
	        return this._operationsMap[identifier];
	      }
	    }
	  }, {
	    key: 'removeOperation',

	    /**
	     * Removes the operation with the given identifier from the stack
	     * @param {String} identifier
	     */
	    value: function removeOperation(identifier) {
	      if (!this._operationsMap[identifier]) return;

	      var operation = this._operationsMap[identifier];
	      delete this._operationsMap[identifier];

	      var index = this._kit.operationsStack.indexOf(operation);
	      this._kit.operationsStack.splice(index, 1);
	    }
	  }, {
	    key: '_registerControls',

	    /**
	     * Registers all default operation controls
	     * @private
	     */
	    value: function _registerControls() {
	      this.registerControl('filters', 'filters', __webpack_require__(80));
	      this.registerControl('rotation', 'rotation', __webpack_require__(81));
	      this.registerControl('flip', 'flip', __webpack_require__(82));
	      this.registerControl('brightness', 'brightness', __webpack_require__(83));
	      this.registerControl('contrast', 'contrast', __webpack_require__(84));
	      this.registerControl('saturation', 'saturation', __webpack_require__(85));
	      this.registerControl('crop', 'crop', __webpack_require__(86));
	      this.registerControl('radial-blur', 'radial-blur', __webpack_require__(87));
	      this.registerControl('tilt-shift', 'tilt-shift', __webpack_require__(88));
	      this.registerControl('frames', 'frames', __webpack_require__(89));
	      this.registerControl('stickers', 'stickers', __webpack_require__(90));
	      this.registerControl('text', 'text', __webpack_require__(91));
	    }
	  }, {
	    key: '_handleOverview',

	    /**
	     * Handles the overview button click events
	     * @private
	     */
	    value: function _handleOverview() {
	      var _this4 = this;

	      var listItems = this._overviewControlsContainer.querySelectorAll(':scope > ul > li');

	      // Turn NodeList into an Array
	      listItems = Array.prototype.slice.call(listItems);

	      var _loop = function (i) {
	        var listItem = listItems[i];
	        var identifier = listItem.dataset.identifier;

	        listItem.addEventListener('click', function () {
	          _this4.switchToControl(identifier);
	        });
	      };

	      // Add click events to all items
	      for (var i = 0; i < listItems.length; i++) {
	        _loop(i);
	      }
	    }
	  }, {
	    key: '_enableControls',

	    /**
	     * Enables the overview controls
	     * @private
	     */
	    value: function _enableControls() {
	      var listItems = this._overviewControlsContainer.querySelectorAll(':scope > ul > li');

	      // Turn NodeList into an Array
	      listItems = Array.prototype.slice.call(listItems);

	      // Add click events to all items
	      for (var i = 0; i < listItems.length; i++) {
	        var listItem = listItems[i];
	        listItem.removeAttribute('data-disabled');
	      }
	    }
	  }, {
	    key: 'switchToControl',

	    /**
	     * Gets called when an overview button has been clicked
	     * @private
	     */
	    value: function switchToControl(identifier) {
	      if (this.context.controlsDisabled) return;
	      this._overviewControlsContainer.style.display = 'none';

	      this._scrollbar.remove();

	      if (this._currentControl) {
	        this._currentControl.leave();
	      }

	      this._currentControl = this._registeredControls[identifier];
	      this._currentControl.enter();
	      this._currentControl.once('back', this._switchToOverview.bind(this));
	    }
	  }, {
	    key: '_switchToOverview',

	    /**
	     * Switches back to the overview controls
	     * @private
	     */
	    value: function _switchToOverview() {
	      if (this._currentControl) {
	        this._currentControl.leave();
	      }

	      this._currentControl = null;
	      this._overviewControlsContainer.style.display = '';

	      this._initScrollbar();
	    }
	  }, {
	    key: 'registerControl',

	    /**
	     * Registers the controls for an operation
	     * @param {String} identifier
	     * @param {String} operationIdentifier
	     * @param {Control} ControlClass
	     */
	    value: function registerControl(identifier, operationIdentifier, ControlClass) {
	      if (!this.isOperationSelected(operationIdentifier)) return;

	      var instance = new ControlClass(this._kit, this);
	      this._registeredControls[identifier] = instance;
	    }
	  }, {
	    key: '_initControls',

	    /**
	     * Initializes the registered controls
	     * @private
	     */
	    value: function _initControls() {
	      for (var identifier in this._registeredControls) {
	        var control = this._registeredControls[identifier];
	        control.setContainers(this._controlsContainer, this._canvasControlsContainer);
	        control.init();
	      }

	      this._initScrollbar();
	    }
	  }, {
	    key: '_initScrollbar',

	    /**
	     * Initializes the custom scrollbar
	     * @private
	     */
	    value: function _initScrollbar() {
	      var container = this._controlsContainer.querySelector('.imglykit-controls-list').parentNode;
	      this._scrollbar = new _libScrollbar2['default'](container);
	    }
	  }, {
	    key: '_handleCloseButton',

	    /**
	     * Handles the click event on the close button, emits a `close` event
	     * when clicking
	     * @private
	     */
	    value: function _handleCloseButton() {
	      var _this5 = this;

	      var closeButton = this._options.container.querySelector('.imglykit-close-button');
	      closeButton.addEventListener('click', function (e) {
	        e.preventDefault();
	        _this5.emit('close');
	      });
	    }
	  }, {
	    key: 'render',

	    /**
	     * Re-renders the canvas
	     */
	    value: function render() {
	      if (this._canvas) {
	        this._canvas.render();
	      }
	    }
	  }, {
	    key: 'pause',

	    /**
	     * Pauses the UI. Operation updates will not cause a re-rendering
	     * of the canvas.
	     */
	    value: function pause() {
	      this._paused = true;
	    }
	  }, {
	    key: 'resume',

	    /**
	     * Resumes the UI and re-renders the canvas
	     * @param {Boolean} rerender = true
	     */
	    value: function resume() {
	      var rerender = arguments[0] === undefined ? true : arguments[0];

	      this._paused = false;
	      if (rerender) {
	        this.render();
	      }
	    }
	  }, {
	    key: 'addHistory',

	    /**
	     * Adds the given operation and options to the history stack
	     * @param {Operation} operation
	     * @param {Object.<String, *>} options
	     * @param {Boolean} existent
	     */
	    value: function addHistory(operation, options, existent) {
	      this._history.push({ operation: operation, options: options, existent: existent });
	      this._topControls.updateUndoButton();
	    }
	  }, {
	    key: 'hideZoom',

	    /**
	     * Hides the zoom control
	     */
	    value: function hideZoom() {
	      this._topControls.hideZoom();
	    }
	  }, {
	    key: 'showZoom',

	    /**
	     * Hides the zoom control
	     */
	    value: function showZoom() {
	      this._topControls.showZoom();
	    }
	  }, {
	    key: 'undo',

	    /**
	     * Takes the last history item and applies its options
	     */
	    value: function undo() {
	      var lastItem = this._history.pop();
	      if (lastItem) {
	        var operation = lastItem.operation;
	        var existent = lastItem.existent;
	        var options = lastItem.options;

	        if (!existent) {
	          this.removeOperation(operation.identifier);
	        } else {
	          operation = this.getOrCreateOperation(operation.identifier);
	          operation.set(options);
	        }
	        this.canvas.zoomToFit(true);
	      }
	      this._topControls.updateUndoButton();
	    }
	  }, {
	    key: 'export',

	    /**
	     * Exports the current image with the default settings
	     */
	    value: function _export() {
	      var _this6 = this;

	      this.displayLoadingMessage('Exporting...');

	      setTimeout(function () {
	        _this6._kit.render(_constants.RenderType.DATAURL, _this6._options.ui['export'].type, _this6._options.ui['export'].dimensions, _this6._options.ui['export'].quality).then(function (data) {
	          var link = document.createElement('a');
	          var extension = _this6._options.ui['export'].type.split('/').pop();
	          link.download = 'imglykit-export.' + extension;

	          link.href = data;
	          document.body.appendChild(link);
	          link.click();
	          // Cleanup the DOM
	          document.body.removeChild(link);

	          _this6.hideLoadingMessage();
	        });
	      }, 1000);
	    }
	  }, {
	    key: 'displayLoadingMessage',

	    /**
	     * Displays the given message inside the loading overlay
	     * @param {String} message
	     */
	    value: function displayLoadingMessage(message) {
	      this._loadingSpan.innerText = message;
	      this._loadingOverlay.style.display = 'block';
	    }
	  }, {
	    key: 'hideLoadingMessage',

	    /**
	     * Hides the loading message
	     */
	    value: function hideLoadingMessage() {
	      this._loadingOverlay.style.display = 'none';
	    }
	  }, {
	    key: 'identifier',

	    /**
	     * A unique string that represents this UI
	     * @type {String}
	     */
	    get: function () {
	      return 'night';
	    }
	  }, {
	    key: 'operations',

	    /**
	     * An object containing all active operations
	     * @type {Object.<String,Operation>}
	     */
	    get: function () {
	      return this._operationsMap;
	    }
	  }, {
	    key: 'controls',

	    /**
	     * An object containing all registered controls
	     * @type {Object.<String,Control>}
	     */
	    get: function () {
	      return this._registeredControls;
	    }
	  }, {
	    key: 'context',

	    /**
	     * The data that is passed to the template renderer
	     * @type {Object}
	     */
	    get: function () {
	      var context = _get(Object.getPrototypeOf(NightUI.prototype), 'context', this);
	      context.controls = this._registeredControls;
	      context.renderDropArea = this._options.ui.showNewButton;
	      context.controlsDisabled = !this._options.image;
	      return context;
	    }
	  }, {
	    key: 'history',

	    /**
	     * The undo history
	     * @type {Array.<Object>}
	     */
	    get: function () {
	      return this._history;
	    }
	  }, {
	    key: 'fileLoader',

	    /**
	     * The file loader
	     * @type {FileLoader}
	     */
	    get: function () {
	      return this._fileLoader;
	    }
	  }]);

	  return NightUI;
	})(_baseUi2['default']);

	NightUI.Control = __webpack_require__(92);

	exports['default'] = NightUI;
	module.exports = exports['default'];

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_53__;

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	/**
	 * Parses the dimensions string and provides calculation functions
	 * @class
	 * @alias ImglyKit.ImageDimensions
	 * @param {string} dimensions
	 * @private
	 */
	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var ImageDimensions = (function () {
	  function ImageDimensions(dimensions) {
	    _classCallCheck(this, ImageDimensions);

	    /**
	     * The available dimension modifiers
	     * @type {Object}
	     * @private
	     */
	    this._modifiers = {
	      FIXED: '!'
	    };

	    /**
	     * @type {string}
	     * @private
	     */
	    this._dimensionsString = dimensions;

	    /**
	     * An object that represents the parsed dimensions string
	     * @type {Object}
	     */
	    this._rules = this._parse();

	    this._validateRules();
	  }

	  _createClass(ImageDimensions, [{
	    key: '_parse',

	    /**
	     * Parses the dimensions string
	     * @private
	     */
	    value: function _parse() {
	      if (typeof this._dimensionsString === 'undefined' || this._dimensionsString === null) {
	        return null;
	      }

	      var match = this._dimensionsString.match(/^([0-9]+)?x([0-9]+)?([\!])?$/i);
	      if (!match) {
	        throw new Error('Invalid size option: ' + this._dimensionsString);
	      }

	      return {
	        x: isNaN(match[1]) ? null : parseInt(match[1], 10),
	        y: isNaN(match[2]) ? null : parseInt(match[2], 10),
	        modifier: match[3]
	      };
	    }
	  }, {
	    key: '_validateRules',

	    /**
	     * Validates the rules
	     * @private
	     */
	    value: function _validateRules() {
	      if (this._rules === null) return;

	      var xAvailable = this._rules.x !== null;
	      var yAvailable = this._rules.y !== null;

	      if (this._rules.modifier === this._modifiers.FIXED && !(xAvailable && yAvailable)) {
	        throw new Error('Both `x` and `y` have to be set when using the fixed (!) modifier.');
	      }

	      if (!xAvailable && !yAvailable) {
	        throw new Error('Neither `x` nor `y` are given.');
	      }
	    }
	  }, {
	    key: 'calculateFinalDimensions',

	    /**
	     * Calculates the final dimensions using the dimensions string and the
	     * given initial dimensions
	     * @param  {Vector2} initialDimensions
	     * @return {Vector2}
	     */
	    value: function calculateFinalDimensions(initialDimensions) {
	      var dimensions = initialDimensions.clone(),
	          ratio;

	      if (this._rules === null) return dimensions;

	      /* istanbul ignore else */
	      if (this._rules.modifier === this._modifiers.FIXED) {
	        // Fixed dimensions
	        dimensions.set(this._rules.x, this._rules.y);
	      } else if (this._rules.x !== null && this._rules.y !== null) {
	        // Both x and y given, resize to fit
	        ratio = Math.min(this._rules.x / dimensions.x, this._rules.y / dimensions.y);
	        dimensions.multiply(ratio);
	      } else if (this._rules.x !== null) {
	        // Fixed x, y by ratio
	        ratio = initialDimensions.y / initialDimensions.x;
	        dimensions.x = this._rules.x;
	        dimensions.y = dimensions.x * ratio;
	      } else if (this._rules.y !== null) {
	        // Fixed y, x by ratio
	        ratio = initialDimensions.x / initialDimensions.y;
	        dimensions.y = this._rules.y;
	        dimensions.x = dimensions.y * ratio;
	      }

	      return dimensions;
	    }
	  }]);

	  return ImageDimensions;
	})();

	exports['default'] = ImageDimensions;
	module.exports = exports['default'];

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */
	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _renderer = __webpack_require__(95);

	var _renderer2 = _interopRequireDefault(_renderer);

	var _libMathVector2 = __webpack_require__(50);

	var _libMathVector22 = _interopRequireDefault(_libMathVector2);

	/**
	 * @class
	 * @alias ImglyKit.CanvasRenderer
	 * @extends {ImglyKit.Renderer}
	 * @private
	 */

	var CanvasRenderer = (function (_Renderer) {
	  function CanvasRenderer() {
	    _classCallCheck(this, CanvasRenderer);

	    if (_Renderer != null) {
	      _Renderer.apply(this, arguments);
	    }
	  }

	  _inherits(CanvasRenderer, _Renderer);

	  _createClass(CanvasRenderer, [{
	    key: 'cache',

	    /**
	     * Caches the current canvas content for the given identifier
	     * @param {String} identifier
	     */
	    value: function cache(identifier) {
	      this._cache[identifier] = {
	        data: this._context.getImageData(0, 0, this._canvas.width, this._canvas.height),
	        size: new _libMathVector22['default'](this._canvas.width, this._canvas.height)
	      };
	    }
	  }, {
	    key: 'drawCached',

	    /**
	     * Draws the stored texture / image data for the given identifier
	     * @param {String} identifier
	     */
	    value: function drawCached(identifier) {
	      var _cache$identifier = this._cache[identifier];
	      var data = _cache$identifier.data;
	      var size = _cache$identifier.size;

	      this._canvas.width = size.x;
	      this._canvas.height = size.y;
	      this._context.putImageData(data, 0, 0);
	    }
	  }, {
	    key: '_getContext',

	    /**
	     * Gets the rendering context from the Canva
	     * @return {RenderingContext}
	     * @abstract
	     */
	    value: function _getContext() {
	      /* istanbul ignore next */
	      return this._canvas.getContext('2d');
	    }
	  }, {
	    key: 'drawImage',

	    /**
	     * Draws the given image on the canvas
	     * @param  {Image} image
	     * @returns {Promis}
	     */
	    value: function drawImage(image) {
	      var _this = this;

	      return new Promise(function (resolve, reject) {
	        _this._context.drawImage(image, 0, 0, image.width, image.height, 0, 0, _this._canvas.width, _this._canvas.height);
	        resolve();
	      });
	    }
	  }, {
	    key: 'resizeTo',

	    /**
	     * Resizes the current canvas picture to the given dimensions
	     * @param  {Vector2} dimensions
	     * @return {Promise}
	     */
	    value: function resizeTo(dimensions) {
	      // Create a temporary canvas to draw to
	      var newCanvas = this.createCanvas();
	      newCanvas.width = dimensions.x;
	      newCanvas.height = dimensions.y;
	      var newContext = newCanvas.getContext('2d');

	      // Draw the source canvas onto the new one
	      newContext.drawImage(this._canvas, 0, 0, this._canvas.width, this._canvas.height, 0, 0, newCanvas.width, newCanvas.height);

	      // Set the new canvas and context
	      this.setCanvas(newCanvas);
	    }
	  }, {
	    key: 'cloneCanvas',

	    /**
	     * Returns a cloned version of the current canvas
	     * @return {Canvas}
	     */
	    value: function cloneCanvas() {
	      var canvas = this.createCanvas();
	      var context = canvas.getContext('2d');

	      // Resize the canvas
	      canvas.width = this._canvas.width;
	      canvas.height = this._canvas.height;

	      // Draw the current canvas on the new one
	      context.drawImage(this._canvas, 0, 0);

	      return canvas;
	    }
	  }, {
	    key: 'reset',

	    /**
	     * Resets the renderer
	     * @param {Boolean} resetCache = false
	     * @override
	     */
	    value: function reset() {
	      var resetCache = arguments[0] === undefined ? false : arguments[0];

	      if (resetCache) {
	        this._cache = [];
	      }
	    }
	  }], [{
	    key: 'isSupported',

	    /**
	     * Checks whether this type of renderer is supported in the current environment
	     * @abstract
	     * @returns {boolean}
	     */
	    value: function isSupported() {
	      var elem = this.prototype.createCanvas();
	      return !!(elem.getContext && elem.getContext('2d'));
	    }
	  }, {
	    key: 'identifier',

	    /**
	     * A unique string that identifies this renderer
	     * @type {String}
	     */
	    get: function () {
	      return 'canvas';
	    }
	  }]);

	  return CanvasRenderer;
	})(_renderer2['default']);

	exports['default'] = CanvasRenderer;
	module.exports = exports['default'];

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	/* global Image */
	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _renderer = __webpack_require__(95);

	var _renderer2 = _interopRequireDefault(_renderer);

	var _libMathVector2 = __webpack_require__(50);

	var _libMathVector22 = _interopRequireDefault(_libMathVector2);

	var _libExifRestorer = __webpack_require__(57);

	var _libExifRestorer2 = _interopRequireDefault(_libExifRestorer);

	/**
	 * @class
	 * @alias ImglyKit.WebGLRenderer
	 * @extends {ImglyKit.Renderer}
	 * @private
	 */

	var WebGLRenderer = (function (_Renderer) {
	  function WebGLRenderer() {
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    _classCallCheck(this, WebGLRenderer);

	    _get(Object.getPrototypeOf(WebGLRenderer.prototype), 'constructor', this).apply(this, args);

	    this._defaultProgram = this.setupGLSLProgram();
	    this.reset();
	  }

	  _inherits(WebGLRenderer, _Renderer);

	  _createClass(WebGLRenderer, [{
	    key: 'cache',

	    /**
	     * Caches the current canvas content for the given identifier
	     * @param {String} identifier
	     */
	    value: function cache(identifier) {
	      var size = new _libMathVector22['default'](this._canvas.width, this._canvas.height);

	      // Re-use FBO and textures
	      var fbo = undefined,
	          texture = undefined,
	          cacheObject = undefined;
	      if (!this._cache[identifier]) {
	        cacheObject = this._createFramebuffer();
	      } else {
	        cacheObject = this._cache[identifier];
	      }

	      // Extract FBO and texture
	      fbo = cacheObject.fbo;
	      texture = cacheObject.texture;

	      // Resize output texture
	      var gl = this._context;
	      gl.useProgram(this._defaultProgram);

	      // Resize cached texture
	      gl.bindTexture(gl.TEXTURE_2D, texture);
	      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size.x, size.y, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

	      // Render to FBO
	      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
	      gl.viewport(0, 0, size.x, size.y);

	      // Use last fbo texture as input
	      gl.bindTexture(gl.TEXTURE_2D, this._lastTexture);

	      gl.drawArrays(gl.TRIANGLES, 0, 6);

	      this._cache[identifier] = { fbo: fbo, texture: texture, size: size };
	    }
	  }, {
	    key: '_drawCachedFinal',

	    /**
	     * Debugging method to draw a cached texture to the canvas instead
	     * to an FBO
	     * @private
	     */
	    value: function _drawCachedFinal(identifier) {
	      var _cache$identifier = this._cache[identifier];
	      var texture = _cache$identifier.texture;
	      var size = _cache$identifier.size;

	      var gl = this._context;
	      gl.useProgram(this._defaultProgram);
	      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	      // Use the cached texture as input
	      gl.bindTexture(gl.TEXTURE_2D, texture);

	      // Resize the canvas
	      this._canvas.width = size.x;
	      this._canvas.height = size.y;

	      gl.viewport(0, 0, size.x, size.y);

	      // Draw the rectangle
	      gl.drawArrays(gl.TRIANGLES, 0, 6);
	    }
	  }, {
	    key: 'drawCached',

	    /**
	     * Draws the stored texture / image data for the given identifier
	     * @param {String} identifier
	     */
	    value: function drawCached(identifier) {
	      var _cache$identifier2 = this._cache[identifier];
	      var texture = _cache$identifier2.texture;
	      var size = _cache$identifier2.size;

	      var fbo = this.getCurrentFramebuffer();
	      var currentTexture = this.getCurrentTexture();

	      var gl = this._context;
	      gl.useProgram(this._defaultProgram);

	      // Resize the canvas
	      this._canvas.width = size.x;
	      this._canvas.height = size.y;

	      // Resize all textures
	      for (var i = 0; i < this._textures.length; i++) {
	        var otherTexture = this._textures[i];
	        gl.bindTexture(gl.TEXTURE_2D, otherTexture);
	        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size.x, size.y, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	      }

	      // Select the current framebuffer to draw to
	      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

	      // Resize the texture we're drawing to
	      gl.bindTexture(gl.TEXTURE_2D, currentTexture);
	      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size.x, size.y, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

	      // Use the cached texture as input
	      gl.bindTexture(gl.TEXTURE_2D, texture);

	      gl.viewport(0, 0, size.x, size.y);

	      // Clear
	      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	      // Draw the rectangle
	      gl.drawArrays(gl.TRIANGLES, 0, 6);

	      this.setLastTexture(currentTexture);
	      this.selectNextBuffer();
	    }
	  }, {
	    key: '_getContext',

	    /**
	     * Gets the rendering context from the Canvas
	     * @return {RenderingContext}
	     * @abstract
	     */
	    value: function _getContext() {
	      /* istanbul ignore next */
	      var gl = this._canvas.getContext('webgl', this._contextOptions) || this._canvas.getContext('webgl-experimental', this._contextOptions);

	      gl.disable(gl.DEPTH_TEST);
	      gl.disable(gl.CULL_FACE);

	      this._maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);

	      return gl;
	    }
	  }, {
	    key: 'drawImage',

	    /**
	     * Draws the given image on the canvas
	     * @param  {Image} image
	     * @returns {Promise}
	     */
	    /* istanbul ignore next */
	    value: function drawImage(image) {
	      var _this = this;

	      return new Promise(function (resolve, reject) {
	        var gl = _this._context;
	        gl.useProgram(_this._defaultProgram);

	        // Create the texture
	        var texture = _this.createTexture();
	        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	        _this._inputTexture = texture;
	        _this.setLastTexture(texture);

	        // Set premultiplied alpha
	        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	        // Upload the image into the texture
	        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

	        _this._clear(gl);

	        // Draw the rectangle
	        gl.drawArrays(gl.TRIANGLES, 0, 6);

	        resolve();
	      });
	    }
	  }, {
	    key: 'prepareImage',

	    /**
	     * Resizes the given image to fit the maximum texture size
	     * @param {Image}
	     * @returns {Promise}
	     * @private
	     */
	    value: function prepareImage(image) {
	      if (image.width <= this._maxTextureSize && image.height <= this._maxTextureSize) {
	        return Promise.resolve(image);
	      }

	      // Calculate new size that fits the graphics card's max texture size
	      var maxSize = new _libMathVector22['default'](this._maxTextureSize, this._maxTextureSize);
	      var size = new _libMathVector22['default'](image.width, image.height);
	      var scale = Math.min(maxSize.x / size.x, maxSize.y / size.y);
	      var newSize = size.clone().multiply(scale);

	      // Create a new canvas to draw the image to
	      var canvas = this.createCanvas(newSize.x, newSize.y);
	      var context = canvas.getContext('2d');

	      // Draw the resized image
	      context.drawImage(image, 0, 0, size.x, size.y, 0, 0, newSize.x, newSize.y);

	      // Turn into a data url and make an image out of it
	      var data = canvas.toDataURL('image/jpeg');

	      var jpegMatch = /^data:image\/jpeg/i;
	      if (image.src.match(jpegMatch) && data.match(jpegMatch)) {
	        data = _libExifRestorer2['default'].restore(image.src, data);
	      }

	      return new Promise(function (resolve, reject) {
	        var image = new Image();
	        image.addEventListener('load', function () {
	          resolve(image);
	        });
	        image.src = data;
	      });
	    }
	  }, {
	    key: '_clear',

	    /**
	     * Clears the WebGL context
	     * @param {WebGLRenderingContext} gl
	     * @private
	     */
	    value: function _clear(gl) {
	      gl.clearColor(0, 0, 0, 0);
	      gl.clear(gl.COLOR_BUFFER_BIT);
	    }
	  }, {
	    key: 'runShader',

	    /**
	     * Runs the given shader
	     * @param  {String} [vertexShader]
	     * @param  {String} [fragmentShader]
	     */
	    /* istanbul ignore next */
	    value: function runShader(vertexShader, fragmentShader, options) {
	      if (typeof options === 'undefined') options = {};
	      if (typeof options.uniforms === 'undefined') options.uniforms = {};

	      var gl = this._context;
	      var program = this.setupGLSLProgram(vertexShader, fragmentShader);
	      gl.useProgram(program);

	      var fbo = this.getCurrentFramebuffer();
	      var currentTexture = this.getCurrentTexture();

	      // Select the current framebuffer
	      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
	      gl.viewport(0, 0, this._canvas.width, this._canvas.height);

	      // Resize the texture to canvas size
	      gl.bindTexture(gl.TEXTURE_2D, currentTexture);

	      // Set premultiplied alpha
	      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this._canvas.width, this._canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

	      // Make sure we select the current texture
	      gl.bindTexture(gl.TEXTURE_2D, this._lastTexture);

	      // Set the uniforms
	      for (var name in options.uniforms) {
	        var location = gl.getUniformLocation(program, name);
	        var uniform = options.uniforms[name];

	        switch (uniform.type) {
	          case 'i':
	          case '1i':
	            gl.uniform1i(location, uniform.value);
	            break;
	          case 'f':
	          case '1f':
	            gl.uniform1f(location, uniform.value);
	            break;
	          case '2f':
	            gl.uniform2f(location, uniform.value[0], uniform.value[1]);
	            break;
	          case '3f':
	            gl.uniform3f(location, uniform.value[0], uniform.value[1], uniform.value[2]);
	            break;
	          case '4f':
	            gl.uniform4f(location, uniform.value[0], uniform.value[1], uniform.value[2], uniform.value[3]);
	            break;
	          case '2fv':
	            gl.uniform2fv(location, uniform.value);
	            break;
	          case 'mat3fv':
	            gl.uniformMatrix3fv(location, false, uniform.value);
	            break;
	          default:
	            throw new Error('Unknown uniform type: ' + uniform.type);
	        }
	      }

	      // Clear
	      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	      // Draw the rectangle
	      gl.drawArrays(gl.TRIANGLES, 0, 6);

	      this.setLastTexture(currentTexture);
	      this.selectNextBuffer();
	    }
	  }, {
	    key: 'renderFinal',

	    /**
	     * Draws the last used buffer onto the canvas
	     */
	    /* istanbul ignore next */
	    value: function renderFinal() {
	      var gl = this._context;
	      var program = this._defaultProgram;
	      gl.useProgram(program);

	      // Don't draw to framebuffer
	      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	      // Make sure the viewport size is correct
	      gl.viewport(0, 0, this._canvas.width, this._canvas.height);

	      // Select the last texture that has been rendered to
	      gl.bindTexture(gl.TEXTURE_2D, this._lastTexture);

	      // Clear
	      this._clear(gl);

	      // Draw the rectangle
	      gl.drawArrays(gl.TRIANGLES, 0, 6);
	    }
	  }, {
	    key: 'setupGLSLProgram',

	    /**
	     * Sets up a GLSL program. Uses the default vertex and fragment shader
	     * if none are given.
	     * @param {String} [vertexShader]
	     * @param {String} [fragmentShader]
	     * @return {WebGLProgram}
	     */
	    /* istanbul ignore next */
	    value: function setupGLSLProgram(vertexShader, fragmentShader) {
	      var gl = this._context;
	      var shaders = [];

	      // Use default vertex shader
	      vertexShader = this._createShader(gl.VERTEX_SHADER, vertexShader || WebGLRenderer.prototype.defaultVertexShader);
	      shaders.push(vertexShader);

	      // Use default fragment shader
	      fragmentShader = this._createShader(gl.FRAGMENT_SHADER, fragmentShader || WebGLRenderer.prototype.defaultFragmentShader);
	      shaders.push(fragmentShader);

	      // Create the program
	      var program = gl.createProgram();

	      // Attach the shaders
	      for (var i = 0; i < shaders.length; i++) {
	        gl.attachShader(program, shaders[i]);
	      }

	      // Link the program
	      gl.linkProgram(program);

	      // Check linking status
	      var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
	      if (!linked) {
	        var lastError = gl.getProgramInfoLog(program);
	        gl.deleteProgram(program);
	        throw new Error('WebGL program linking error: ' + lastError);
	      }

	      // Lookup texture coordinates location
	      var positionLocation = gl.getAttribLocation(program, 'a_position');
	      var texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');

	      // Provide texture coordinates
	      var texCoordBuffer = gl.createBuffer();
	      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
	      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
	      // First triangle
	      0, 0, 1, 0, 0, 1,

	      // Second triangle
	      0, 1, 1, 0, 1, 1]), gl.STATIC_DRAW);
	      gl.enableVertexAttribArray(texCoordLocation);
	      gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

	      // Create a buffer for the rectangle positions
	      var buffer = gl.createBuffer();
	      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	      gl.enableVertexAttribArray(positionLocation);
	      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
	      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
	      // First triangle
	      -1, -1, 1, -1, -1, 1,

	      // Second triangle
	      -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

	      return program;
	    }
	  }, {
	    key: '_createShader',

	    /**
	     * Creates a WebGL shader with the given type and source code
	     * @param  {WebGLShaderType} shaderType
	     * @param  {String} shaderSource
	     * @return {WebGLShader}
	     * @private
	     */
	    /* istanbul ignore next */
	    value: function _createShader(shaderType, shaderSource) {
	      var gl = this._context;

	      // Create the shader and compile it
	      var shader = gl.createShader(shaderType);
	      gl.shaderSource(shader, shaderSource);
	      gl.compileShader(shader);

	      // Check compilation status
	      var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	      if (!compiled) {
	        var lastError = gl.getShaderInfoLog(shader);
	        gl.deleteShader(shader);
	        throw new Error('WebGL shader compilation error: ' + lastError);
	      }

	      return shader;
	    }
	  }, {
	    key: 'createTexture',

	    /**
	     * Creates an empty texture
	     * @return {WebGLTexture}
	     */
	    /* istanbul ignore next */
	    value: function createTexture() {
	      var gl = this._context;
	      var texture = gl.createTexture();

	      gl.bindTexture(gl.TEXTURE_2D, texture);

	      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

	      return texture;
	    }
	  }, {
	    key: '_createFramebuffers',

	    /**
	     * Creates two textures and framebuffers that are used for the stack
	     * rendering
	     * @private
	     */
	    /* istanbul ignore next */
	    value: function _createFramebuffers() {
	      for (var i = 0; i < 2; i++) {
	        var _createFramebuffer2 = this._createFramebuffer();

	        var fbo = _createFramebuffer2.fbo;
	        var texture = _createFramebuffer2.texture;

	        this._textures.push(texture);
	        this._framebuffers.push(fbo);
	      }
	    }
	  }, {
	    key: '_createFramebuffer',

	    /**
	     * Creates and returns a frame buffer and texture
	     * @return {Object}
	     * @private
	     */
	    value: function _createFramebuffer() {
	      var gl = this._context;

	      // Create texture
	      var texture = this.createTexture();

	      // Set premultiplied alpha
	      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this._canvas.width, this._canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

	      // Create framebuffer
	      var fbo = gl.createFramebuffer();
	      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

	      // Attach the texture
	      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

	      return { fbo: fbo, texture: texture };
	    }
	  }, {
	    key: 'resizeTo',

	    /**
	     * Resizes the current canvas picture to the given dimensions
	     * @param  {Vector2} dimensions
	     * @todo Use a downsampling shader for smoother image resizing
	     */
	    /* istanbul ignore next */
	    value: function resizeTo(dimensions) {
	      var gl = this._context;

	      // Resize the canvas
	      this._canvas.width = dimensions.x;
	      this._canvas.height = dimensions.y;

	      // Update the viewport dimensions
	      gl.viewport(0, 0, this._canvas.width, this._canvas.height);

	      // Draw the rectangle
	      gl.drawArrays(gl.TRIANGLES, 0, 6);
	    }
	  }, {
	    key: 'getCurrentFramebuffer',

	    /**
	     * Returns the current framebuffer
	     * @return {WebGLFramebuffer}
	     */
	    value: function getCurrentFramebuffer() {
	      return this._framebuffers[this._bufferIndex % 2];
	    }
	  }, {
	    key: 'getCurrentTexture',

	    /**
	     * Returns the current texture
	     * @return {WebGLTexture}
	     */
	    value: function getCurrentTexture() {
	      return this._textures[this._bufferIndex % 2];
	    }
	  }, {
	    key: 'selectNextBuffer',

	    /**
	     * Increases the buffer index
	     */
	    value: function selectNextBuffer() {
	      this._bufferIndex++;
	    }
	  }, {
	    key: 'getDefaultProgram',

	    /**
	     * Returns the default program
	     * @return {WebGLProgram}
	     */
	    value: function getDefaultProgram() {
	      return this._defaultProgram;
	    }
	  }, {
	    key: 'getLastTexture',

	    /**
	     * Returns the last texture that has been drawn to
	     * @return {WebGLTexture}
	     */
	    value: function getLastTexture() {
	      return this._lastTexture;
	    }
	  }, {
	    key: 'getTextures',

	    /**
	     * Returns all textures
	     * @return {Array.<WebGLTexture>}
	     */
	    value: function getTextures() {
	      return this._textures;
	    }
	  }, {
	    key: 'setLastTexture',

	    /**
	     * Sets the last texture
	     * @param {WebGLTexture} texture
	     */
	    value: function setLastTexture(texture) {
	      this._lastTexture = texture;
	    }
	  }, {
	    key: 'reset',

	    /**
	     * Resets the renderer
	     * @param {Boolean} resetCache = false
	     * @override
	     */
	    value: function reset() {
	      var resetCache = arguments[0] === undefined ? false : arguments[0];

	      this._lastTexture = null;
	      this._textures = [];
	      this._framebuffers = [];
	      this._bufferIndex = 0;

	      if (resetCache) {
	        this._cache = [];
	      }

	      this._createFramebuffers();
	      this.setLastTexture(this._inputTexture);
	    }
	  }, {
	    key: '_contextOptions',

	    /**
	     * Returns the context options passed to getContext()
	     * @type {Object}
	     * @private
	     */
	    get: function () {
	      return {
	        alpha: true,
	        premultipliedAlpha: true
	      };
	    }
	  }, {
	    key: 'identifier',

	    /**
	     * A unique string that identifies this renderer
	     * @type {String}
	     */
	    get: function () {
	      return 'webgl';
	    }
	  }, {
	    key: 'defaultVertexShader',

	    /**
	     * The default vertex shader which just passes the texCoord to the
	     * fragment shader.
	     * @type {String}
	     * @private
	     */
	    get: function () {
	      var shader = '\n      attribute vec2 a_position;\n      attribute vec2 a_texCoord;\n      varying vec2 v_texCoord;\n\n      void main() {\n        gl_Position = vec4(a_position, 0, 1);\n        v_texCoord = a_texCoord;\n      }\n    ';
	      return shader;
	    }
	  }, {
	    key: 'defaultFragmentShader',

	    /**
	     * The default fragment shader which will just look up the colors from the
	     * texture.
	     * @type {String}
	     * @private
	     */
	    get: function () {
	      var shader = '\n      precision mediump float;\n      uniform sampler2D u_image;\n      varying vec2 v_texCoord;\n\n      void main() {\n        gl_FragColor = texture2D(u_image, v_texCoord);\n      }\n    ';
	      return shader;
	    }
	  }, {
	    key: 'maxTextureSize',
	    get: function () {
	      return this._maxTextureSize;
	    }
	  }], [{
	    key: 'isSupported',

	    /**
	     * Checks whether this type of renderer is supported in the current environment
	     * @abstract
	     * @returns {boolean}
	     */
	    value: function isSupported() {
	      return !!(typeof window !== 'undefined' && window.WebGLRenderingContext);
	    }
	  }]);

	  return WebGLRenderer;
	})(_renderer2['default']);

	exports['default'] = WebGLRenderer;
	module.exports = exports['default'];

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) FILSH Media GmbH - All Rights Reserved
	 *
	 * This file is part of VLIGHT.MXR.TWO
	 *
	 * Unauthorized copying of this file, via any medium is strictly prohibited.
	 * Proprietary and confidential.
	 *
	 * Written by Sascha Gehlich <sascha@gehlich.us>, June 2015
	 *
	 * Extracted from MinifyJpeg:
	 * https://github.com/hMatoba/MinifyJpeg
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var _base64 = __webpack_require__(94);

	var _base642 = _interopRequireDefault(_base64);

	var DATA_JPEG_PREFIX = 'data:image/jpeg;base64,';

	var ExifRestorer = (function () {
	  function ExifRestorer() {
	    _classCallCheck(this, ExifRestorer);
	  }

	  _createClass(ExifRestorer, null, [{
	    key: 'restore',
	    value: function restore(originalData, newData) {
	      // Only for jpeg
	      if (!originalData.match(DATA_JPEG_PREFIX)) {
	        return newData;
	      }

	      var rawImage = _base642['default'].decode(originalData.replace(DATA_JPEG_PREFIX, ''));
	      var segments = this._sliceIntoSegments(rawImage);

	      var image = this._exifManipulation(newData, segments);

	      return DATA_JPEG_PREFIX + _base642['default'].encode(image);
	    }
	  }, {
	    key: '_exifManipulation',
	    value: function _exifManipulation(data, segments) {
	      var exifArray = this._getExifArray(segments);
	      var newImageArray = this._insertExif(data, exifArray);
	      var buffer = new Uint8Array(newImageArray);
	      return buffer;
	    }
	  }, {
	    key: '_getExifArray',
	    value: function _getExifArray(segments) {
	      var seg = undefined;
	      for (var i = 0; i < segments.length; i++) {
	        seg = segments[i];
	        if (seg[0] === 255 && seg[1] === 225) {
	          return seg;
	        }
	      }
	      return [];
	    }
	  }, {
	    key: '_insertExif',
	    value: function _insertExif(data, exifArray) {
	      var imageData = data.replace(DATA_JPEG_PREFIX, '');
	      var buf = _base642['default'].decode(imageData);
	      var separatePoint = buf.indexOf(255, 3);
	      var mae = buf.slice(0, separatePoint);
	      var ato = buf.slice(separatePoint);
	      var array = mae;

	      array = array.concat(exifArray);
	      array = array.concat(ato);
	      return array;
	    }
	  }, {
	    key: '_sliceIntoSegments',
	    value: function _sliceIntoSegments(data) {
	      var head = 0;
	      var segments = [];

	      while (1) {
	        if (data[head] === 255 && data[head + 1] === 218) {
	          break;
	        }

	        if (data[head] === 255 && data[head + 1] === 216) {
	          head += 2;
	        } else {
	          var _length = data[head + 2] * 256 + data[head + 3];
	          var endPoint = head + _length + 2;
	          var seg = data.slice(head, endPoint);
	          segments.push(seg);
	          head = endPoint;
	        }

	        if (head > data.length) {
	          break;
	        }
	      }

	      return segments;
	    }
	  }]);

	  return ExifRestorer;
	})();

	exports['default'] = ExifRestorer;
	module.exports = exports['default'];

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	/**
	 * Helper function to correctly set up the prototype chain
	 * Based on the backbone.js extend function:
	 * https://github.com/jashkenas/backbone/blob/master/backbone.js
	 * @param  {Object} prototypeProperties
	 * @param  {Object} classProperties
	 * @return {Object}
	 */
	'use strict';

	module.exports = function (prototypeProperties, classProperties) {
	  /*jshint validthis:true*/
	  var parent = this;
	  var child;

	  // The constructor function for the new subclass is either defined by you
	  // (the 'constructor' property in your `extend` definition), or defaulted
	  // by us to simply call the parent's constructor.
	  if (prototypeProperties && prototypeProperties.hasOwnProperty('constructor')) {
	    child = prototypeProperties.constructor;
	  } else {
	    child = function () {
	      return parent.apply(this, arguments);
	    };
	  }

	  // Add static properties to the constructor function, if supplied.
	  var key;
	  for (key in parent) {
	    child[key] = parent[key];
	  }
	  if (typeof classProperties !== 'undefined') {
	    for (key in classProperties) {
	      child[key] = classProperties[key];
	    }
	  }

	  // Set the prototype chain to inherit from `parent`, without calling
	  // `parent`'s constructor function.
	  var Surrogate = function Surrogate() {
	    this.constructor = child;
	  };
	  Surrogate.prototype = parent.prototype;
	  child.prototype = new Surrogate();

	  // Add prototype properties (instance properties) to the subclass,
	  // if supplied.
	  if (prototypeProperties) {
	    for (key in prototypeProperties) {
	      child.prototype[key] = prototypeProperties[key];
	    }
	  }

	  // Set a convenience property in case the parent's prototype is needed
	  // later.
	  child.__super__ = parent.prototype;

	  return child;
	};

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	/**
	 * A helper class that can collect {@link Primitive} instances and render
	 * the stack
	 * @class
	 * @alias ImglyKit.Filter.PrimitivesStack
	 */
	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var PrimitivesStack = (function () {
	  function PrimitivesStack() {
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    _classCallCheck(this, PrimitivesStack);

	    /**
	     * The stack of {@link ImglyKit.Filter.Primitive} instances
	     * @type {Array}
	     * @private
	     */
	    this._stack = [];
	  }

	  _createClass(PrimitivesStack, [{
	    key: "add",

	    /**
	     * Adds the given primitive to the stack
	     * @param {ImglyKit.Filter.Primitive} primitive
	     */
	    value: function add(primitive) {
	      this._stack.push(primitive);
	    }
	  }, {
	    key: "render",

	    /**
	     * Renders the stack of primitives on the renderer
	     * @param  {Renderer} renderer
	     */
	    value: function render(renderer) {
	      for (var i = 0; i < this._stack.length; i++) {
	        var primitive = this._stack[i];
	        primitive.render(renderer);
	      }
	    }
	  }]);

	  return PrimitivesStack;
	})();

	exports["default"] = PrimitivesStack;
	module.exports = exports["default"];

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _lodash = __webpack_require__(1);

	var _lodash2 = _interopRequireDefault(_lodash);

	var _primitive = __webpack_require__(96);

	var _primitive2 = _interopRequireDefault(_primitive);

	/**
	 * Saturation primitive
	 * @class
	 * @alias ImglyKit.Filter.Primitives.Saturation
	 * @extends {ImglyKit.Filter.Primitive}
	 */

	var Saturation = (function (_Primitive) {
	  function Saturation() {
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    _classCallCheck(this, Saturation);

	    _get(Object.getPrototypeOf(Saturation.prototype), 'constructor', this).apply(this, args);

	    this._options = _lodash2['default'].defaults(this._options, {
	      saturation: 0
	    });

	    /**
	     * The fragment shader for this primitive
	     * @return {String}
	     * @private
	     */
	    this._fragmentShader = '\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_image;\n      uniform float u_saturation;\n\n      const vec3 luminanceWeighting = vec3(0.2125, 0.7154, 0.0721);\n\n      void main() {\n        vec4 texColor = texture2D(u_image, v_texCoord);\n        float luminance = dot(texColor.rgb, luminanceWeighting);\n\n        vec3 greyScaleColor = vec3(luminance);\n\n        gl_FragColor = vec4(mix(greyScaleColor, texColor.rgb, u_saturation) * texColor.a, texColor.a);\n      }\n    ';
	  }

	  _inherits(Saturation, _Primitive);

	  _createClass(Saturation, [{
	    key: 'renderWebGL',

	    /**
	     * Renders the primitive (WebGL)
	     * @param  {WebGLRenderer} renderer
	     */
	    /* istanbul ignore next */
	    value: function renderWebGL(renderer) {
	      renderer.runShader(null, this._fragmentShader, {
	        uniforms: {
	          u_saturation: { type: 'f', value: this._options.saturation }
	        }
	      });
	    }
	  }, {
	    key: 'renderCanvas',

	    /**
	     * Renders the primitive (Canvas)
	     * @param  {CanvasRenderer} renderer
	     * @return {Promise}
	     */
	    value: function renderCanvas(renderer) {
	      var canvas = renderer.getCanvas();
	      var imageData = renderer.getContext().getImageData(0, 0, canvas.width, canvas.height);
	      var saturation = this._options.saturation;

	      for (var x = 0; x < canvas.width; x++) {
	        for (var y = 0; y < canvas.height; y++) {
	          var index = (canvas.width * y + x) * 4;

	          var luminance = imageData.data[index] * 0.2125 + imageData.data[index + 1] * 0.7154 + imageData.data[index + 2] * 0.0721;
	          imageData.data[index] = luminance * (1 - saturation) + imageData.data[index] * saturation;
	          imageData.data[index + 1] = luminance * (1 - saturation) + imageData.data[index + 1] * saturation;
	          imageData.data[index + 2] = luminance * (1 - saturation) + imageData.data[index + 2] * saturation;
	        }
	      }

	      renderer.getContext().putImageData(imageData, 0, 0);
	    }
	  }]);

	  return Saturation;
	})(_primitive2['default']);

	exports['default'] = Saturation;
	module.exports = exports['default'];

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _primitive = __webpack_require__(96);

	var _primitive2 = _interopRequireDefault(_primitive);

	/**
	 * Stores a 256 byte long lookup table in a 2d texture which will be
	 * used to look up the corresponding value for each channel.
	 * @class
	 * @alias ImglyKit.Filter.Primitives.LookupTable
	 * @extends {ImglyKit.Filter.Primitive}
	 */

	var LookupTable = (function (_Primitive) {
	  function LookupTable() {
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    _classCallCheck(this, LookupTable);

	    _get(Object.getPrototypeOf(LookupTable.prototype), 'constructor', this).apply(this, args);

	    this._textureIndex = 3;

	    /**
	     * The fragment shader for this primitive
	     * @return {String}
	     * @private
	     */
	    this._fragmentShader = '\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_image;\n      uniform sampler2D u_lookupTable;\n\n      void main() {\n        vec4 texColor = texture2D(u_image, v_texCoord);\n        float r = texture2D(u_lookupTable, vec2(texColor.r, 0.0)).r;\n        float g = texture2D(u_lookupTable, vec2(texColor.g, 0.0)).g;\n        float b = texture2D(u_lookupTable, vec2(texColor.b, 0.0)).b;\n\n        gl_FragColor = vec4(vec3(r, g, b) * texColor.a, texColor.a);\n      }\n    ';
	  }

	  _inherits(LookupTable, _Primitive);

	  _createClass(LookupTable, [{
	    key: 'renderWebGL',

	    /**
	     * Renders the primitive (WebGL)
	     * @param  {WebGLRenderer} renderer
	     */
	    /* istanbul ignore next */
	    value: function renderWebGL(renderer) {
	      this._updateTexture(renderer);

	      renderer.runShader(null, this._fragmentShader, {
	        uniforms: {
	          u_lookupTable: { type: 'i', value: 3 }
	        }
	      });
	    }
	  }, {
	    key: 'renderCanvas',

	    /**
	     * Renders the primitive (Canvas)
	     * @param  {CanvasRenderer} renderer
	     */
	    value: function renderCanvas(renderer) {
	      var canvas = renderer.getCanvas();
	      var imageData = renderer.getContext().getImageData(0, 0, canvas.width, canvas.height);
	      var table = this._options.data;

	      for (var x = 0; x < canvas.width; x++) {
	        for (var y = 0; y < canvas.height; y++) {
	          var index = (canvas.width * y + x) * 4;

	          var r = imageData.data[index];
	          imageData.data[index] = table[r * 4];
	          var g = imageData.data[index + 1];
	          imageData.data[index + 1] = table[1 + g * 4];
	          var b = imageData.data[index + 2];
	          imageData.data[index + 2] = table[2 + b * 4];
	        }
	      }

	      renderer.getContext().putImageData(imageData, 0, 0);
	    }
	  }, {
	    key: '_updateTexture',

	    /**
	     * Updates the lookup table texture (WebGL only)
	     * @private
	     */
	    /* istanbul ignore next */
	    value: function _updateTexture(renderer) {
	      var gl = renderer.getContext();

	      if (typeof this._options.data === 'undefined') {
	        throw new Error('LookupTable: No data specified.');
	      }

	      var dataTypedArray = new Uint8Array(this._options.data);

	      gl.activeTexture(gl.TEXTURE0 + this._textureIndex);
	      if (!this._texture) {
	        this._texture = gl.createTexture();
	      }
	      gl.bindTexture(gl.TEXTURE_2D, this._texture);

	      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, dataTypedArray);
	      gl.activeTexture(gl.TEXTURE0);
	    }
	  }]);

	  return LookupTable;
	})(_primitive2['default']);

	exports['default'] = LookupTable;
	module.exports = exports['default'];

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _lodash = __webpack_require__(1);

	var _lodash2 = _interopRequireDefault(_lodash);

	var _lookupTable = __webpack_require__(61);

	var _lookupTable2 = _interopRequireDefault(_lookupTable);

	/**
	 * Tone curve primitive
	 * @class
	 * @alias ImglyKit.Filter.Primitives.ToneCurve
	 * @extends {ImglyKit.Filter.Primitives.LookupTable}
	 */

	var ToneCurve = (function (_LookupTable) {
	  function ToneCurve() {
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    _classCallCheck(this, ToneCurve);

	    _get(Object.getPrototypeOf(ToneCurve.prototype), 'constructor', this).apply(this, args);

	    this._options = _lodash2['default'].defaults(this._options, {
	      rgbControlPoints: {
	        red: this._options.controlPoints,
	        green: this._options.controlPoints,
	        blue: this._options.controlPoints
	      }
	    });

	    if (typeof this._options.rgbControlPoints !== 'undefined') {
	      this._updateLookupTable();
	    }
	  }

	  _inherits(ToneCurve, _LookupTable);

	  _createClass(ToneCurve, [{
	    key: '_updateLookupTable',

	    /**
	     * Calculates the lookup table
	     * @private
	     */
	    value: function _updateLookupTable() {
	      var r = this._calculateSplineCurve(this._options.rgbControlPoints.red);
	      var g = this._calculateSplineCurve(this._options.rgbControlPoints.green);
	      var b = this._calculateSplineCurve(this._options.rgbControlPoints.blue);

	      this._options.data = this._buildLookupTable(r, g, b);
	    }
	  }, {
	    key: '_buildLookupTable',

	    /**
	     * Builds the lookup table
	     * @param  {Array} r
	     * @param  {Array} g
	     * @param  {Array} b
	     * @return {Array}
	     * @private
	     */
	    value: function _buildLookupTable(r, g, b) {
	      var data = [];

	      for (var i = 0; i < 256; i++) {
	        data.push(Math.min(Math.max(i + r[i], 0), 255));
	        data.push(Math.min(Math.max(i + g[i], 0), 255));
	        data.push(Math.min(Math.max(i + b[i], 0), 255));
	        data.push(255);
	      }

	      return data;
	    }
	  }, {
	    key: '_calculateSplineCurve',

	    /**
	     * Calculates the spline curve data for the given points
	     * @param  {Array.<Array.<Number>>} points
	     * @return {Array.<Number>}
	     */
	    value: function _calculateSplineCurve(points) {
	      points = points.sort(function (a, b) {
	        return a[0] > b[0];
	      });

	      var splinePoints = this._getSplineCurve(points);
	      var firstSplinePoint = splinePoints[0];
	      var i;

	      if (firstSplinePoint[0] > 0) {
	        for (i = 0; i < firstSplinePoint[0]; i++) {
	          splinePoints.unshift([0, 0]);
	        }
	      }

	      var preparedPoints = [];
	      for (i = 0; i < splinePoints.length; i++) {
	        var newPoint = splinePoints[i];
	        var origPoint = [newPoint[0], newPoint[0]];

	        var distance = Math.sqrt(Math.pow(origPoint[0] - newPoint[0], 2) + Math.pow(origPoint[1] - newPoint[1], 2));

	        if (origPoint[1] > newPoint[1]) {
	          distance = -distance;
	        }

	        preparedPoints.push(distance);
	      }

	      return preparedPoints;
	    }
	  }, {
	    key: '_getSplineCurve',
	    value: function _getSplineCurve(points) {
	      var sdA = this._secondDerivative(points);

	      var n = sdA.length;
	      var sd = [];
	      var i;

	      for (i = 0; i < n; i++) {
	        sd[i] = sdA[i];
	      }

	      var output = [];

	      for (i = 0; i < n - 1; i++) {
	        var cur = points[i];
	        var next = points[i + 1];

	        for (var x = cur[0]; x < next[0]; x++) {
	          var t = (x - cur[0]) / (next[0] - cur[0]);

	          var a = 1 - t;
	          var b = t;
	          var h = next[0] - cur[0];

	          var y = a * cur[1] + b * next[1] + h * h / 6 * ((a * a * a - a) * sd[i] + (b * b * b - b) * sd[i + 1]);

	          if (y > 255) {
	            y = 255;
	          } else if (y < 0) {
	            y = 0;
	          }

	          output.push([x, y]);
	        }
	      }

	      if (output.length === 255) {
	        output.push(points[points.length - 1]);
	      }

	      return output;
	    }
	  }, {
	    key: '_secondDerivative',
	    value: function _secondDerivative(points) {
	      var n = points.length;
	      if (n <= 0 || n === 1) {
	        return null;
	      }

	      var matrix = [];
	      var result = [];
	      var i, k;

	      matrix[0] = [0, 1, 0];

	      for (i = 1; i < n - 1; i++) {
	        var P1 = points[i - 1];
	        var P2 = points[i];
	        var P3 = points[i + 1];

	        matrix[i] = matrix[i] || [];
	        matrix[i][0] = (P2[0] - P1[0]) / 6;
	        matrix[i][1] = (P3[0] - P1[0]) / 3;
	        matrix[i][2] = (P3[0] - P2[0]) / 6;
	        result[i] = (P3[1] - P2[1]) / (P3[0] - P2[0]) - (P2[1] - P1[1]) / (P2[0] - P1[0]);
	      }

	      result[0] = 0;
	      result[n - 1] = 0;

	      matrix[n - 1] = [0, 1, 0];

	      // Pass 1
	      for (i = 1; i < n; i++) {
	        k = matrix[1][0] / matrix[i - 1][1];
	        matrix[i][1] -= k * matrix[i - 1][2];
	        matrix[i][0] = 0;
	        result[i] -= k * result[i - 1];
	      }

	      // Pass 2
	      for (i = n - 2; i > 0; i--) {
	        k = matrix[i][2] / matrix[i + 1][1];
	        matrix[i][1] -= k * matrix[i + 1][0];
	        matrix[i][2] = 0;
	        result[i] -= k * result[i + 1];
	      }

	      var y2 = [];
	      for (i = 0; i < n; i++) {
	        y2[i] = result[i] / matrix[i][1];
	      }

	      return y2;
	    }
	  }]);

	  return ToneCurve;
	})(_lookupTable2['default']);

	exports['default'] = ToneCurve;
	module.exports = exports['default'];

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _lodash = __webpack_require__(1);

	var _lodash2 = _interopRequireDefault(_lodash);

	var _primitive = __webpack_require__(96);

	var _primitive2 = _interopRequireDefault(_primitive);

	var _libColor = __webpack_require__(7);

	var _libColor2 = _interopRequireDefault(_libColor);

	/**
	 * SoftColorOverlay primitive
	 * @class
	 * @alias ImglyKit.Filter.Primitives.SoftColorOverlay
	 * @extends {ImglyKit.Filter.Primitive}
	 */

	var SoftColorOverlay = (function (_Primitive) {
	  function SoftColorOverlay() {
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    _classCallCheck(this, SoftColorOverlay);

	    _get(Object.getPrototypeOf(SoftColorOverlay.prototype), 'constructor', this).apply(this, args);

	    this._options = _lodash2['default'].defaults(this._options, {
	      color: new _libColor2['default'](1, 1, 1)
	    });

	    /**
	     * The fragment shader for this primitive
	     * @return {String}
	     * @private
	     */
	    this._fragmentShader = '\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_image;\n      uniform vec3 u_overlay;\n\n      void main() {\n        vec4 texColor = texture2D(u_image, v_texCoord);\n        vec4 overlayVec4 = vec4(u_overlay, texColor.a);\n        gl_FragColor = max(overlayVec4 * texColor.a, texColor);\n      }\n    ';
	  }

	  _inherits(SoftColorOverlay, _Primitive);

	  _createClass(SoftColorOverlay, [{
	    key: 'renderWebGL',

	    /**
	     * Renders the primitive (WebGL)
	     * @param  {WebGLRenderer} renderer
	     */
	    /* istanbul ignore next */
	    value: function renderWebGL(renderer) {
	      renderer.runShader(null, this._fragmentShader, {
	        uniforms: {
	          u_overlay: { type: '3f', value: this._options.color.toRGBGLColor() }
	        }
	      });
	    }
	  }, {
	    key: 'renderCanvas',

	    /**
	     * Renders the primitive (Canvas)
	     * @param  {CanvasRenderer} renderer
	     */
	    value: function renderCanvas(renderer) {
	      var canvas = renderer.getCanvas();
	      var imageData = renderer.getContext().getImageData(0, 0, canvas.width, canvas.height);

	      for (var x = 0; x < canvas.width; x++) {
	        for (var y = 0; y < canvas.height; y++) {
	          var index = (canvas.width * y + x) * 4;

	          imageData.data[index] = Math.max(this._options.color.r, imageData.data[index]);
	          imageData.data[index + 1] = Math.max(this._options.color.g, imageData.data[index + 1]);
	          imageData.data[index + 2] = Math.max(this._options.color.b, imageData.data[index + 2]);
	        }
	      }

	      renderer.getContext().putImageData(imageData, 0, 0);
	    }
	  }]);

	  return SoftColorOverlay;
	})(_primitive2['default']);

	exports['default'] = SoftColorOverlay;
	module.exports = exports['default'];

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _lodash = __webpack_require__(1);

	var _lodash2 = _interopRequireDefault(_lodash);

	var _primitive = __webpack_require__(96);

	var _primitive2 = _interopRequireDefault(_primitive);

	/**
	 * Desaturation primitive
	 * @class
	 * @alias ImglyKit.Filter.Primitives.Desaturation
	 * @extends {ImglyKit.Filter.Primitive}
	 */

	var Desaturation = (function (_Primitive) {
	  function Desaturation() {
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    _classCallCheck(this, Desaturation);

	    _get(Object.getPrototypeOf(Desaturation.prototype), 'constructor', this).apply(this, args);

	    this._options = _lodash2['default'].defaults(this._options, {
	      desaturation: 1
	    });

	    /**
	     * The fragment shader for this primitive
	     * @return {String}
	     * @private
	     */
	    this._fragmentShader = '\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_image;\n      uniform float u_desaturation;\n\n      const vec3 luminanceWeighting = vec3(0.2125, 0.7154, 0.0721);\n\n      void main() {\n        vec4 texColor = texture2D(u_image, v_texCoord);\n        vec3 grayXfer = vec3(0.3, 0.59, 0.11);\n        vec3 gray = vec3(dot(grayXfer, texColor.xyz));\n        gl_FragColor = vec4(mix(texColor.xyz, gray, u_desaturation) * texColor.a, texColor.a);\n      }\n    ';
	  }

	  _inherits(Desaturation, _Primitive);

	  _createClass(Desaturation, [{
	    key: 'renderWebGL',

	    /**
	     * Renders the primitive (WebGL)
	     * @param  {WebGLRenderer} renderer
	     * @return {Promise}
	     */
	    /* istanbul ignore next */
	    value: function renderWebGL(renderer) {
	      renderer.runShader(null, this._fragmentShader, {
	        uniforms: {
	          u_desaturation: { type: 'f', value: this._options.desaturation }
	        }
	      });
	    }
	  }, {
	    key: 'renderCanvas',

	    /**
	     * Renders the primitive (Canvas)
	     * @param  {CanvasRenderer} renderer
	     */
	    value: function renderCanvas(renderer) {
	      var canvas = renderer.getCanvas();
	      var imageData = renderer.getContext().getImageData(0, 0, canvas.width, canvas.height);
	      var desaturation = this._options.desaturation;

	      for (var x = 0; x < canvas.width; x++) {
	        for (var y = 0; y < canvas.height; y++) {
	          var index = (canvas.width * y + x) * 4;

	          var luminance = imageData.data[index] * 0.3 + imageData.data[index + 1] * 0.59 + imageData.data[index + 2] * 0.11;
	          imageData.data[index] = luminance * (1 - desaturation) + imageData.data[index] * desaturation;
	          imageData.data[index + 1] = luminance * (1 - desaturation) + imageData.data[index + 1] * desaturation;
	          imageData.data[index + 2] = luminance * (1 - desaturation) + imageData.data[index + 2] * desaturation;
	        }
	      }

	      renderer.getContext().putImageData(imageData, 0, 0);
	    }
	  }]);

	  return Desaturation;
	})(_primitive2['default']);

	exports['default'] = Desaturation;
	module.exports = exports['default'];

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _primitive = __webpack_require__(96);

	var _primitive2 = _interopRequireDefault(_primitive);

	/**
	 * X400 primitive
	 * @class
	 * @alias ImglyKit.Filter.Primitives.X400
	 * @extends {ImglyKit.Filter.Primitive}
	 */

	var X400 = (function (_Primitive) {
	  function X400() {
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    _classCallCheck(this, X400);

	    _get(Object.getPrototypeOf(X400.prototype), 'constructor', this).apply(this, args);

	    /**
	     * The fragment shader for this primitive
	     * @return {String}
	     * @private
	     */
	    this._fragmentShader = '\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_image;\n\n      void main() {\n        vec4 texColor = texture2D(u_image, v_texCoord);\n        float gray = texColor.r * 0.3 + texColor.g * 0.3 + texColor.b * 0.3;\n        gray -= 0.2;\n        gray = clamp(gray, 0.0, 1.0);\n        gray += 0.15;\n        gray *= 1.4;\n        gl_FragColor = vec4(vec3(gray) * texColor.a, texColor.a);\n      }\n    ';
	  }

	  _inherits(X400, _Primitive);

	  _createClass(X400, [{
	    key: 'renderWebGL',

	    /**
	     * Renders the primitive (WebGL)
	     * @param  {WebGLRenderer} renderer
	     */
	    /* istanbul ignore next */
	    value: function renderWebGL(renderer) {
	      renderer.runShader(null, this._fragmentShader);
	    }
	  }, {
	    key: 'renderCanvas',

	    /**
	     * Renders the primitive (Canvas)
	     * @param  {CanvasRenderer} renderer
	     */
	    value: function renderCanvas(renderer) {
	      var canvas = renderer.getCanvas();
	      var imageData = renderer.getContext().getImageData(0, 0, canvas.width, canvas.height);

	      for (var x = 0; x < canvas.width; x++) {
	        for (var y = 0; y < canvas.height; y++) {
	          var index = (canvas.width * y + x) * 4;

	          var gray = imageData.data[index] / 255 * 0.3 + imageData.data[index + 1] / 255 * 0.3 + imageData.data[index + 2] / 255 * 0.3;
	          gray -= 0.2;
	          gray = Math.max(0, Math.min(1, gray));
	          gray += 0.15;
	          gray *= 1.4;

	          gray *= 255;
	          imageData.data[index] = gray;
	          imageData.data[index + 1] = gray;
	          imageData.data[index + 2] = gray;
	        }
	      }

	      renderer.getContext().putImageData(imageData, 0, 0);
	    }
	  }]);

	  return X400;
	})(_primitive2['default']);

	exports['default'] = X400;
	module.exports = exports['default'];

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _primitive = __webpack_require__(96);

	var _primitive2 = _interopRequireDefault(_primitive);

	/**
	 * Grayscale primitive
	 * @class
	 * @alias ImglyKit.Filter.Primitives.Grayscale
	 * @extends {ImglyKit.Filter.Primitive}
	 */

	var Grayscale = (function (_Primitive) {
	  function Grayscale() {
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    _classCallCheck(this, Grayscale);

	    _get(Object.getPrototypeOf(Grayscale.prototype), 'constructor', this).apply(this, args);

	    /**
	     * The fragment shader for this primitive
	     * @return {String}
	     * @private
	     */
	    this._fragmentShader = '\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_image;\n      vec3 W = vec3(0.2125, 0.7154, 0.0721);\n\n      void main() {\n        vec4 texColor = texture2D(u_image, v_texCoord);\n        float luminance = dot(texColor.rgb, W);\n        gl_FragColor = vec4(vec3(luminance) * texColor.a, texColor.a);\n      }\n    ';
	  }

	  _inherits(Grayscale, _Primitive);

	  _createClass(Grayscale, [{
	    key: 'renderWebGL',

	    /**
	     * Renders the primitive (WebGL)
	     * @param  {WebGLRenderer} renderer
	     * @return {Promise}
	     */
	    /* istanbul ignore next */
	    value: function renderWebGL(renderer) {
	      renderer.runShader(null, this._fragmentShader);
	    }
	  }, {
	    key: 'renderCanvas',

	    /**
	     * Renders the primitive (Canvas)
	     * @param  {CanvasRenderer} renderer
	     */
	    value: function renderCanvas(renderer) {
	      var canvas = renderer.getCanvas();
	      var imageData = renderer.getContext().getImageData(0, 0, canvas.width, canvas.height);

	      for (var x = 0; x < canvas.width; x++) {
	        for (var y = 0; y < canvas.height; y++) {
	          var index = (canvas.width * y + x) * 4;

	          var luminance = imageData.data[index] * 0.2125 + imageData.data[index + 1] * 0.7154 + imageData.data[index + 2] * 0.0721;

	          imageData.data[index] = luminance;
	          imageData.data[index + 1] = luminance;
	          imageData.data[index + 2] = luminance;
	        }
	      }

	      renderer.getContext().putImageData(imageData, 0, 0);
	    }
	  }]);

	  return Grayscale;
	})(_primitive2['default']);

	exports['default'] = Grayscale;
	module.exports = exports['default'];

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _lodash = __webpack_require__(1);

	var _lodash2 = _interopRequireDefault(_lodash);

	var _primitive = __webpack_require__(96);

	var _primitive2 = _interopRequireDefault(_primitive);

	/**
	 * Contrast primitive
	 * @class
	 * @alias ImglyKit.Filter.Primitives.Contrast
	 * @extends {ImglyKit.Filter.Primitive}
	 */

	var Contrast = (function (_Primitive) {
	  function Contrast() {
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    _classCallCheck(this, Contrast);

	    _get(Object.getPrototypeOf(Contrast.prototype), 'constructor', this).apply(this, args);

	    this._options = _lodash2['default'].defaults(this._options, {
	      contrast: 1
	    });

	    /**
	     * The fragment shader for this primitive
	     * @return {String}
	     * @private
	     */
	    this._fragmentShader = '\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_image;\n      uniform float u_contrast;\n\n      void main() {\n        vec4 texColor = texture2D(u_image, v_texCoord);\n        gl_FragColor = vec4(((texColor.rgb - vec3(0.5)) * u_contrast + vec3(0.5) * texColor.a), texColor.a);\n      }\n    ';
	  }

	  _inherits(Contrast, _Primitive);

	  _createClass(Contrast, [{
	    key: 'renderWebGL',

	    /**
	     * Renders the primitive (WebGL)
	     * @param  {WebGLRenderer} renderer
	     */
	    /* istanbul ignore next */
	    value: function renderWebGL(renderer) {
	      renderer.runShader(null, this._fragmentShader, {
	        uniforms: {
	          u_contrast: { type: 'f', value: this._options.contrast }
	        }
	      });
	    }
	  }, {
	    key: 'renderCanvas',

	    /**
	     * Renders the primitive (Canvas)
	     * @param  {CanvasRenderer} renderer
	     */
	    value: function renderCanvas(renderer) {
	      var canvas = renderer.getCanvas();
	      var imageData = renderer.getContext().getImageData(0, 0, canvas.width, canvas.height);
	      var contrast = this._options.contrast;

	      for (var x = 0; x < canvas.width; x++) {
	        for (var y = 0; y < canvas.height; y++) {
	          var index = (canvas.width * y + x) * 4;

	          imageData.data[index] = (imageData.data[index] - 127) * contrast + 127;
	          imageData.data[index + 1] = (imageData.data[index + 1] - 127) * contrast + 127;
	          imageData.data[index + 2] = (imageData.data[index + 2] - 127) * contrast + 127;
	        }
	      }

	      renderer.getContext().putImageData(imageData, 0, 0);
	    }
	  }]);

	  return Contrast;
	})(_primitive2['default']);

	exports['default'] = Contrast;
	module.exports = exports['default'];

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _lodash = __webpack_require__(1);

	var _lodash2 = _interopRequireDefault(_lodash);

	var _primitive = __webpack_require__(96);

	var _primitive2 = _interopRequireDefault(_primitive);

	var _libColor = __webpack_require__(7);

	var _libColor2 = _interopRequireDefault(_libColor);

	/**
	 * Glow primitive
	 * @class
	 * @alias ImglyKit.Filter.Primitives.Glow
	 * @extends {ImglyKit.Filter.Primitive}
	 */

	var Glow = (function (_Primitive) {
	  function Glow() {
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    _classCallCheck(this, Glow);

	    _get(Object.getPrototypeOf(Glow.prototype), 'constructor', this).apply(this, args);

	    this._options = _lodash2['default'].defaults(this._options, {
	      color: new _libColor2['default'](1, 1, 1)
	    });

	    /**
	     * The fragment shader for this primitive
	     * @return {String}
	     * @private
	     */
	    this._fragmentShader = '\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_image;\n\n      uniform vec3 u_color;\n\n      void main() {\n        vec4 texColor = texture2D(u_image, v_texCoord);\n\n        vec2 textureCoord = v_texCoord - vec2(0.5, 0.5);\n        textureCoord /= 0.75;\n\n        float d = 1.0 - dot(textureCoord, textureCoord);\n        d = clamp(d, 0.2, 1.0);\n        vec3 newColor = texColor.rgb * d * u_color.rgb;\n        gl_FragColor = vec4(vec3(newColor) * texColor.a, texColor.a);\n      }\n    ';
	  }

	  _inherits(Glow, _Primitive);

	  _createClass(Glow, [{
	    key: 'renderWebGL',

	    /**
	     * Renders the primitive (WebGL)
	     * @param  {WebGLRenderer} renderer
	     * @return {Promise}
	     */
	    /* istanbul ignore next */
	    value: function renderWebGL(renderer) {
	      renderer.runShader(null, this._fragmentShader, {
	        uniforms: {
	          u_color: { type: '3f', value: this._options.color.toRGBGLColor() }
	        }
	      });
	    }
	  }, {
	    key: 'renderCanvas',

	    /**
	     * Renders the primitive (Canvas)
	     * @param  {CanvasRenderer} renderer
	     * @return {Promise}
	     */
	    value: function renderCanvas(renderer) {
	      var canvas = renderer.getCanvas();
	      var imageData = renderer.getContext().getImageData(0, 0, canvas.width, canvas.height);
	      var color = this._options.color;

	      var d;
	      for (var x = 0; x < canvas.width; x++) {
	        for (var y = 0; y < canvas.height; y++) {
	          var index = (canvas.width * y + x) * 4;

	          var x01 = x / canvas.width;
	          var y01 = y / canvas.height;

	          var nx = (x01 - 0.5) / 0.75;
	          var ny = (y01 - 0.5) / 0.75;

	          var scalarX = nx * nx;
	          var scalarY = ny * ny;
	          d = 1 - (scalarX + scalarY);
	          d = Math.min(Math.max(d, 0.1), 1);

	          imageData.data[index] = imageData.data[index] * (d * color.r);
	          imageData.data[index + 1] = imageData.data[index + 1] * (d * color.g);
	          imageData.data[index + 2] = imageData.data[index + 2] * (d * color.b);
	          imageData.data[index + 3] = 255;
	        }
	      }

	      renderer.getContext().putImageData(imageData, 0, 0);
	    }
	  }]);

	  return Glow;
	})(_primitive2['default']);

	exports['default'] = Glow;
	module.exports = exports['default'];

/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _primitive = __webpack_require__(96);

	var _primitive2 = _interopRequireDefault(_primitive);

	/**
	 * Gobblin primitive
	 * @class
	 * @alias ImglyKit.Filter.Primitives.Gobblin
	 * @extends {ImglyKit.Filter.Primitive}
	 */

	var Gobblin = (function (_Primitive) {
	  function Gobblin() {
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    _classCallCheck(this, Gobblin);

	    _get(Object.getPrototypeOf(Gobblin.prototype), 'constructor', this).apply(this, args);

	    /**
	     * The fragment shader for this primitive
	     * @return {String}
	     * @private
	     */
	    this._fragmentShader = '\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_image;\n\n      void main() {\n        vec4 texColor = texture2D(u_image, v_texCoord);\n        texColor.b = texColor.g * 0.33;\n        texColor.r = texColor.r * 0.6;\n        texColor.b += texColor.r * 0.33;\n        texColor.g = texColor.g * 0.7;\n        gl_FragColor = texColor;\n      }\n    ';
	  }

	  _inherits(Gobblin, _Primitive);

	  _createClass(Gobblin, [{
	    key: 'renderWebGL',

	    /**
	     * Renders the primitive (WebGL)
	     * @param  {WebGLRenderer} renderer
	     * @return {Promise}
	     */
	    /* istanbul ignore next */
	    value: function renderWebGL(renderer) {
	      renderer.runShader(null, this._fragmentShader);
	    }
	  }, {
	    key: 'renderCanvas',

	    /**
	     * Renders the primitive (Canvas)
	     * @param  {CanvasRenderer} renderer
	     */
	    value: function renderCanvas(renderer) {
	      var canvas = renderer.getCanvas();
	      var imageData = renderer.getContext().getImageData(0, 0, canvas.width, canvas.height);

	      for (var x = 0; x < canvas.width; x++) {
	        for (var y = 0; y < canvas.height; y++) {
	          var index = (canvas.width * y + x) * 4;

	          imageData.data[index + 2] = imageData.data[index + 1] * 0.33;
	          imageData.data[index] = imageData.data[index] * 0.6;
	          imageData.data[index + 2] += imageData.data[index] * 0.33;
	          imageData.data[index + 1] = imageData.data[index + 1] * 0.7;
	          imageData.data[index + 3] = 255;
	        }
	      }

	      renderer.getContext().putImageData(imageData, 0, 0);
	    }
	  }]);

	  return Gobblin;
	})(_primitive2['default']);

	exports['default'] = Gobblin;
	module.exports = exports['default'];

/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _lodash = __webpack_require__(1);

	var _lodash2 = _interopRequireDefault(_lodash);

	var _primitive = __webpack_require__(96);

	var _primitive2 = _interopRequireDefault(_primitive);

	/**
	 * Brightness primitive
	 * @class
	 * @alias ImglyKit.Filter.Primitives.Brightness
	 * @extends {ImglyKit.Filter.Primitive}
	 */

	var Brightness = (function (_Primitive) {
	  function Brightness() {
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    _classCallCheck(this, Brightness);

	    _get(Object.getPrototypeOf(Brightness.prototype), 'constructor', this).apply(this, args);

	    this._options = _lodash2['default'].defaults(this._options, {
	      brightness: 1
	    });

	    /**
	     * The fragment shader for this primitive
	     * @return {String}
	     * @private
	     */
	    this._fragmentShader = '\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_image;\n      uniform float u_brightness;\n\n      void main() {\n        vec4 texColor = texture2D(u_image, v_texCoord);\n        gl_FragColor = vec4((texColor.rgb + vec3(u_brightness) * texColor.a), texColor.a);;\n      }\n    ';
	  }

	  _inherits(Brightness, _Primitive);

	  _createClass(Brightness, [{
	    key: 'renderWebGL',

	    /**
	     * Renders the primitive (WebGL)
	     * @param  {WebGLRenderer} renderer
	     */
	    /* istanbul ignore next */
	    value: function renderWebGL(renderer) {
	      renderer.runShader(null, this._fragmentShader, {
	        uniforms: {
	          u_brightness: { type: 'f', value: this._options.brightness }
	        }
	      });
	    }
	  }, {
	    key: 'renderCanvas',

	    /**
	     * Renders the primitive (Canvas)
	     * @param  {CanvasRenderer} renderer
	     */
	    value: function renderCanvas(renderer) {
	      var canvas = renderer.getCanvas();
	      var imageData = renderer.getContext().getImageData(0, 0, canvas.width, canvas.height);
	      var brightness = this._options.brightness;

	      for (var x = 0; x < canvas.width; x++) {
	        for (var y = 0; y < canvas.height; y++) {
	          var index = (canvas.width * y + x) * 4;

	          imageData.data[index] = imageData.data[index] + brightness * 255;
	          imageData.data[index + 1] = imageData.data[index + 1] + brightness * 255;
	          imageData.data[index + 2] = imageData.data[index + 2] + brightness * 255;
	        }
	      }

	      renderer.getContext().putImageData(imageData, 0, 0);
	    }
	  }]);

	  return Brightness;
	})(_primitive2['default']);

	exports['default'] = Brightness;
	module.exports = exports['default'];

/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _filter = __webpack_require__(8);

	var _filter2 = _interopRequireDefault(_filter);

	/**
	 * Identity Filter
	 * @class
	 * @alias ImglyKit.Filters.IdentityFilter
	 * @extends {ImglyKit.Filter}
	 */

	var IdentityFilter = (function (_Filter) {
	  function IdentityFilter() {
	    _classCallCheck(this, IdentityFilter);

	    if (_Filter != null) {
	      _Filter.apply(this, arguments);
	    }
	  }

	  _inherits(IdentityFilter, _Filter);

	  _createClass(IdentityFilter, [{
	    key: 'render',

	    /**
	     * Renders the filter
	     * @return {Promise}
	     */
	    value: function render() {}
	  }, {
	    key: 'name',

	    /**
	     * The name that is displayed in the UI
	     * @type {String}
	     */
	    get: function () {
	      return 'Original';
	    }
	  }], [{
	    key: 'identifier',

	    /**
	     * A unique string that identifies this operation. Can be used to select
	     * the active filter.
	     * @type {String}
	     */
	    get: function () {
	      return 'identity';
	    }
	  }]);

	  return IdentityFilter;
	})(_filter2['default']);

	exports['default'] = IdentityFilter;
	module.exports = exports['default'];

	// This is the identity filter, it doesn't have any effect.

/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * EventEmitter (ES6) from:
	 * https://gist.github.com/bloodyowl/41b1de3388c626796eca
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var DEFAULT_MAX_LISTENERS = 12;

	function error(message) {
	  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	    args[_key - 1] = arguments[_key];
	  }

	  console.error.apply(console, [message].concat(args));
	  console.trace();
	}

	var EventEmitter = (function () {
	  function EventEmitter() {
	    _classCallCheck(this, EventEmitter);

	    this._maxListeners = DEFAULT_MAX_LISTENERS;
	    this._events = {};
	  }

	  _createClass(EventEmitter, [{
	    key: 'on',
	    value: function on(type, listener) {
	      if (typeof listener !== 'function') {
	        throw new TypeError();
	      }

	      var listeners = this._events[type] || (this._events[type] = []);
	      if (listeners.indexOf(listener) !== -1) {
	        return this;
	      }
	      listeners.push(listener);

	      if (listeners.length > this._maxListeners) {
	        error('possible memory leak, added %i %s listeners,\n        use EventEmitter#setMaxListeners(number) if you\n        want to increase the limit (%i now)', listeners.length, type, this._maxListeners);
	      }
	      return this;
	    }
	  }, {
	    key: 'once',
	    value: function once(type, listener) {
	      var eventsInstance = this;
	      function onceCallback() {
	        eventsInstance.off(type, onceCallback);
	        listener.apply(null, arguments);
	      }
	      return this.on(type, onceCallback);
	    }
	  }, {
	    key: 'off',
	    value: function off(type) {
	      for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
	        args[_key2 - 1] = arguments[_key2];
	      }

	      if (args.length === 0) {
	        this._events[type] = null;
	        return this;
	      }

	      var listener = args[0];
	      if (typeof listener !== 'function') {
	        throw new TypeError();
	      }

	      var listeners = this._events[type];
	      if (!listeners || !listeners.length) {
	        return this;
	      }

	      var indexOfListener = listeners.indexOf(listener);
	      if (indexOfListener === -1) {
	        return this;
	      }

	      listeners.splice(indexOfListener, 1);
	      return this;
	    }
	  }, {
	    key: 'emit',
	    value: function emit(type) {
	      for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
	        args[_key3 - 1] = arguments[_key3];
	      }

	      var listeners = this._events[type];
	      if (!listeners || !listeners.length) {
	        return false;
	      }

	      listeners.forEach(function (fn) {
	        return fn.apply(null, args);
	      });

	      return true;
	    }
	  }, {
	    key: 'setMaxListeners',
	    value: function setMaxListeners(newMaxListeners) {
	      if (parseInt(newMaxListeners, 10) !== newMaxListeners) {
	        throw new TypeError();
	      }

	      this._maxListeners = newMaxListeners;
	    }
	  }]);

	  return EventEmitter;
	})();

	exports['default'] = EventEmitter;
	module.exports = exports['default'];

/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/*

	StackBlur - a fast almost Gaussian Blur For Canvas

	Version:  0.5
	Author:   Mario Klingemann
	Contact:  mario@quasimondo.com
	Website:  http://www.quasimondo.com/StackBlurForCanvas
	Twitter:  @quasimondo

	In case you find this class useful - especially in commercial projects -
	I am not totally unhappy for a small donation to my PayPal account
	mario@quasimondo.de

	Or support me on flattr:
	https://flattr.com/thing/72791/StackBlur-a-fast-almost-Gaussian-Blur-Effect-for-CanvasJavascript

	Copyright (c) 2010 Mario Klingemann

	Permission is hereby granted, free of charge, to any person
	obtaining a copy of this software and associated documentation
	files (the "Software"), to deal in the Software without
	restriction, including without limitation the rights to use,
	copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the
	Software is furnished to do so, subject to the following
	conditions:

	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
	OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
	HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
	WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
	FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
	OTHER DEALINGS IN THE SOFTWARE.
	*/

	var mul_table = [512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292, 512, 454, 405, 364, 328, 298, 271, 496, 456, 420, 388, 360, 335, 312, 292, 273, 512, 482, 454, 428, 405, 383, 364, 345, 328, 312, 298, 284, 271, 259, 496, 475, 456, 437, 420, 404, 388, 374, 360, 347, 335, 323, 312, 302, 292, 282, 273, 265, 512, 497, 482, 468, 454, 441, 428, 417, 405, 394, 383, 373, 364, 354, 345, 337, 328, 320, 312, 305, 298, 291, 284, 278, 271, 265, 259, 507, 496, 485, 475, 465, 456, 446, 437, 428, 420, 412, 404, 396, 388, 381, 374, 367, 360, 354, 347, 341, 335, 329, 323, 318, 312, 307, 302, 297, 292, 287, 282, 278, 273, 269, 265, 261, 512, 505, 497, 489, 482, 475, 468, 461, 454, 447, 441, 435, 428, 422, 417, 411, 405, 399, 394, 389, 383, 378, 373, 368, 364, 359, 354, 350, 345, 341, 337, 332, 328, 324, 320, 316, 312, 309, 305, 301, 298, 294, 291, 287, 284, 281, 278, 274, 271, 268, 265, 262, 259, 257, 507, 501, 496, 491, 485, 480, 475, 470, 465, 460, 456, 451, 446, 442, 437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388, 385, 381, 377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335, 332, 329, 326, 323, 320, 318, 315, 312, 310, 307, 304, 302, 299, 297, 294, 292, 289, 287, 285, 282, 280, 278, 275, 273, 271, 269, 267, 265, 263, 261, 259];

	var shg_table = [9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24];

	function stackBlurCanvasRGBA(imageData, top_x, top_y, width, height, radius) {
	  if (isNaN(radius) || radius < 1) return;
	  radius |= 0;

	  var pixels = imageData.data;

	  var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum, a_sum, r_out_sum, g_out_sum, b_out_sum, a_out_sum, r_in_sum, g_in_sum, b_in_sum, a_in_sum, pr, pg, pb, pa, rbs;

	  var div = radius + radius + 1;
	  var widthMinus1 = width - 1;
	  var heightMinus1 = height - 1;
	  var radiusPlus1 = radius + 1;
	  var sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;

	  var stackStart = new BlurStack();
	  var stackEnd;
	  var stack = stackStart;
	  for (i = 1; i < div; i++) {
	    stack = stack.next = new BlurStack();
	    if (i == radiusPlus1) stackEnd = stack;
	  }
	  stack.next = stackStart;
	  var stackIn = null;
	  var stackOut = null;

	  yw = yi = 0;

	  var mul_sum = mul_table[radius];
	  var shg_sum = shg_table[radius];

	  for (y = 0; y < height; y++) {
	    r_in_sum = g_in_sum = b_in_sum = a_in_sum = r_sum = g_sum = b_sum = a_sum = 0;

	    r_out_sum = radiusPlus1 * (pr = pixels[yi]);
	    g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
	    b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
	    a_out_sum = radiusPlus1 * (pa = pixels[yi + 3]);

	    r_sum += sumFactor * pr;
	    g_sum += sumFactor * pg;
	    b_sum += sumFactor * pb;
	    a_sum += sumFactor * pa;

	    stack = stackStart;

	    for (i = 0; i < radiusPlus1; i++) {
	      stack.r = pr;
	      stack.g = pg;
	      stack.b = pb;
	      stack.a = pa;
	      stack = stack.next;
	    }

	    for (i = 1; i < radiusPlus1; i++) {
	      p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
	      r_sum += (stack.r = pr = pixels[p]) * (rbs = radiusPlus1 - i);
	      g_sum += (stack.g = pg = pixels[p + 1]) * rbs;
	      b_sum += (stack.b = pb = pixels[p + 2]) * rbs;
	      a_sum += (stack.a = pa = pixels[p + 3]) * rbs;

	      r_in_sum += pr;
	      g_in_sum += pg;
	      b_in_sum += pb;
	      a_in_sum += pa;

	      stack = stack.next;
	    }

	    stackIn = stackStart;
	    stackOut = stackEnd;
	    for (x = 0; x < width; x++) {
	      pixels[yi + 3] = pa = a_sum * mul_sum >> shg_sum;
	      if (pa !== 0) {
	        pa = 255 / pa;
	        pixels[yi] = (r_sum * mul_sum >> shg_sum) * pa;
	        pixels[yi + 1] = (g_sum * mul_sum >> shg_sum) * pa;
	        pixels[yi + 2] = (b_sum * mul_sum >> shg_sum) * pa;
	      } else {
	        pixels[yi] = pixels[yi + 1] = pixels[yi + 2] = 0;
	      }

	      r_sum -= r_out_sum;
	      g_sum -= g_out_sum;
	      b_sum -= b_out_sum;
	      a_sum -= a_out_sum;

	      r_out_sum -= stackIn.r;
	      g_out_sum -= stackIn.g;
	      b_out_sum -= stackIn.b;
	      a_out_sum -= stackIn.a;

	      p = yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1) << 2;

	      r_in_sum += stackIn.r = pixels[p];
	      g_in_sum += stackIn.g = pixels[p + 1];
	      b_in_sum += stackIn.b = pixels[p + 2];
	      a_in_sum += stackIn.a = pixels[p + 3];

	      r_sum += r_in_sum;
	      g_sum += g_in_sum;
	      b_sum += b_in_sum;
	      a_sum += a_in_sum;

	      stackIn = stackIn.next;

	      r_out_sum += pr = stackOut.r;
	      g_out_sum += pg = stackOut.g;
	      b_out_sum += pb = stackOut.b;
	      a_out_sum += pa = stackOut.a;

	      r_in_sum -= pr;
	      g_in_sum -= pg;
	      b_in_sum -= pb;
	      a_in_sum -= pa;

	      stackOut = stackOut.next;

	      yi += 4;
	    }
	    yw += width;
	  }

	  for (x = 0; x < width; x++) {
	    g_in_sum = b_in_sum = a_in_sum = r_in_sum = g_sum = b_sum = a_sum = r_sum = 0;

	    yi = x << 2;
	    r_out_sum = radiusPlus1 * (pr = pixels[yi]);
	    g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
	    b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
	    a_out_sum = radiusPlus1 * (pa = pixels[yi + 3]);

	    r_sum += sumFactor * pr;
	    g_sum += sumFactor * pg;
	    b_sum += sumFactor * pb;
	    a_sum += sumFactor * pa;

	    stack = stackStart;

	    for (i = 0; i < radiusPlus1; i++) {
	      stack.r = pr;
	      stack.g = pg;
	      stack.b = pb;
	      stack.a = pa;
	      stack = stack.next;
	    }

	    yp = width;

	    for (i = 1; i <= radius; i++) {
	      yi = yp + x << 2;

	      r_sum += (stack.r = pr = pixels[yi]) * (rbs = radiusPlus1 - i);
	      g_sum += (stack.g = pg = pixels[yi + 1]) * rbs;
	      b_sum += (stack.b = pb = pixels[yi + 2]) * rbs;
	      a_sum += (stack.a = pa = pixels[yi + 3]) * rbs;

	      r_in_sum += pr;
	      g_in_sum += pg;
	      b_in_sum += pb;
	      a_in_sum += pa;

	      stack = stack.next;

	      if (i < heightMinus1) {
	        yp += width;
	      }
	    }

	    yi = x;
	    stackIn = stackStart;
	    stackOut = stackEnd;
	    for (y = 0; y < height; y++) {
	      p = yi << 2;
	      pixels[p + 3] = pa = a_sum * mul_sum >> shg_sum;
	      if (pa > 0) {
	        pa = 255 / pa;
	        pixels[p] = (r_sum * mul_sum >> shg_sum) * pa;
	        pixels[p + 1] = (g_sum * mul_sum >> shg_sum) * pa;
	        pixels[p + 2] = (b_sum * mul_sum >> shg_sum) * pa;
	      } else {
	        pixels[p] = pixels[p + 1] = pixels[p + 2] = 0;
	      }

	      r_sum -= r_out_sum;
	      g_sum -= g_out_sum;
	      b_sum -= b_out_sum;
	      a_sum -= a_out_sum;

	      r_out_sum -= stackIn.r;
	      g_out_sum -= stackIn.g;
	      b_out_sum -= stackIn.b;
	      a_out_sum -= stackIn.a;

	      p = x + ((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width << 2;

	      r_sum += r_in_sum += stackIn.r = pixels[p];
	      g_sum += g_in_sum += stackIn.g = pixels[p + 1];
	      b_sum += b_in_sum += stackIn.b = pixels[p + 2];
	      a_sum += a_in_sum += stackIn.a = pixels[p + 3];

	      stackIn = stackIn.next;

	      r_out_sum += pr = stackOut.r;
	      g_out_sum += pg = stackOut.g;
	      b_out_sum += pb = stackOut.b;
	      a_out_sum += pa = stackOut.a;

	      r_in_sum -= pr;
	      g_in_sum -= pg;
	      b_in_sum -= pb;
	      a_in_sum -= pa;

	      stackOut = stackOut.next;

	      yi += width;
	    }
	  }
	}

	function BlurStack() {
	  this.r = 0;
	  this.g = 0;
	  this.b = 0;
	  this.a = 0;
	  this.next = null;
	}

	module.exports = {
	  stackBlurCanvasRGBA: stackBlurCanvasRGBA
	};

/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    draining = true;
	    var currentQueue;
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        var i = -1;
	        while (++i < len) {
	            currentQueue[i]();
	        }
	        len = queue.length;
	    }
	    draining = false;
	}
	process.nextTick = function (fun) {
	    queue.push(fun);
	    if (!draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	// TODO(shtylman)
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */
	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _dot = __webpack_require__(98);

	var _dot2 = _interopRequireDefault(_dot);

	var _libUtils = __webpack_require__(6);

	var _libUtils2 = _interopRequireDefault(_libUtils);

	var _libEventEmitter = __webpack_require__(72);

	var _libEventEmitter2 = _interopRequireDefault(_libEventEmitter);

	var _helpers = __webpack_require__(97);

	var _helpers2 = _interopRequireDefault(_helpers);

	var BaseUI = (function (_EventEmitter) {
	  function BaseUI(kit, options) {
	    _classCallCheck(this, BaseUI);

	    _get(Object.getPrototypeOf(BaseUI.prototype), 'constructor', this).call(this);

	    this._kit = kit;
	    this._options = options;
	    this._options.ui = this._options.ui || {};
	    this._operations = [];
	    this._helpers = new _helpers2['default'](this.kit, this, options);
	    this.selectOperations(null);
	  }

	  _inherits(BaseUI, _EventEmitter);

	  _createClass(BaseUI, [{
	    key: 'run',

	    /**
	     * Prepares the UI for use
	     */
	    value: function run() {
	      this._attach();
	    }
	  }, {
	    key: '_attach',

	    /**
	     * Renders and attaches the UI HTML
	     * @private
	     */
	    value: function _attach() {
	      if (this._options.container === null) {
	        throw new Error('BaseUI#attach: No container set.');
	      }

	      var html = this._render();
	      this._options.container.innerHTML = html;

	      // Container has to be position: relative
	      this._options.container.style.position = 'relative';
	    }
	  }, {
	    key: '_render',

	    /**
	     * Renders the template
	     * @private
	     */
	    value: function _render() {
	      if (typeof this._template === 'undefined') {
	        throw new Error('BaseUI#_render: No template set.');
	      }

	      var renderFn = _dot2['default'].template(this._template);
	      return renderFn(this.context);
	    }
	  }, {
	    key: 'selectOperations',

	    /**
	     * Selects the enabled operations
	     * @param {ImglyKit.Selector}
	     */
	    value: function selectOperations(selector) {
	      var registeredOperations = this._kit.registeredOperations;

	      var operationIdentifiers = Object.keys(registeredOperations);

	      var selectedOperations = _libUtils2['default'].select(operationIdentifiers, selector);
	      this._operations = selectedOperations.map(function (identifier) {
	        return registeredOperations[identifier];
	      });
	    }
	  }, {
	    key: 'addOperation',

	    /**
	     * Adds the given operation to the available operations
	     * @param {Operation} operation
	     */
	    value: function addOperation(operation) {
	      this._operations.push(operation);
	    }
	  }, {
	    key: 'isOperationSelected',

	    /**
	     * Checks whether the operation with the given identifier is selected
	     * @param {String} identifier
	     * @returns {Boolean}
	     */
	    value: function isOperationSelected(identifier) {
	      var operationIdentifiers = this._operations.map(function (operation) {
	        return operation.prototype.identifier;
	      });
	      return operationIdentifiers.indexOf(identifier) !== -1;
	    }
	  }, {
	    key: 'identifier',

	    /**
	     * A unique string that represents this UI
	     * @type {String}
	     */
	    get: function () {
	      return null;
	    }
	  }, {
	    key: 'context',

	    /**
	     * The data that is passed to the template renderer
	     * @type {Object}
	     */
	    get: function () {
	      return {
	        operations: this._operations,
	        helpers: this._helpers,
	        options: this._options
	      };
	    }
	  }, {
	    key: 'container',

	    /**
	     * The DOM container
	     * @type {DOMElement}
	     */
	    get: function () {
	      return this._options.container;
	    }
	  }, {
	    key: 'operations',

	    /**
	     * The selected / active operations
	     * @type {Array.<ImglyKit.Operation>}
	     */
	    get: function () {
	      return this._operations;
	    }
	  }, {
	    key: 'options',

	    /**
	     * The options
	     * @type {Object}
	     */
	    get: function () {
	      return this._options;
	    }
	  }, {
	    key: 'canvas',

	    /**
	     * The canvas object
	     * @type {Canvas}
	     */
	    get: function () {
	      return this._canvas;
	    }
	  }, {
	    key: 'helpers',

	    /**
	     * The helpers
	     * @type {Helpers}
	     */
	    get: function () {
	      return this._helpers;
	    }
	  }, {
	    key: 'image',

	    /**
	     * The image
	     * @type {Image}
	     */
	    get: function () {
	      return this._options.image;
	    }
	  }]);

	  return BaseUI;
	})(_libEventEmitter2['default']);

	exports['default'] = BaseUI;
	module.exports = exports['default'];

/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _renderersWebglRenderer = __webpack_require__(56);

	var _renderersWebglRenderer2 = _interopRequireDefault(_renderersWebglRenderer);

	var _renderersCanvasRenderer = __webpack_require__(55);

	var _renderersCanvasRenderer2 = _interopRequireDefault(_renderersCanvasRenderer);

	var _libMathVector2 = __webpack_require__(50);

	var _libMathVector22 = _interopRequireDefault(_libMathVector2);

	var _libEventEmitter = __webpack_require__(72);

	var _libEventEmitter2 = _interopRequireDefault(_libEventEmitter);

	var Canvas = (function (_EventEmitter) {
	  function Canvas(kit, ui, options) {
	    _classCallCheck(this, Canvas);

	    _get(Object.getPrototypeOf(Canvas.prototype), 'constructor', this).call(this);

	    this._kit = kit;
	    this._ui = ui;
	    this._options = options;

	    var container = this._ui.container;

	    this._canvasContainer = container.querySelector('.imglykit-canvas-container');
	    this._canvasInnerContainer = container.querySelector('.imglykit-canvas-inner-container');
	    this._canvas = this._canvasContainer.querySelector('canvas');
	    this._image = this._options.image;
	    this._roundZoomBy = 0.1;
	    this._isFirstRender = true;

	    // Mouse event callbacks bound to the class context
	    this._dragOnMousedown = this._dragOnMousedown.bind(this);
	    this._dragOnMousemove = this._dragOnMousemove.bind(this);
	    this._dragOnMouseup = this._dragOnMouseup.bind(this);
	  }

	  _inherits(Canvas, _EventEmitter);

	  _createClass(Canvas, [{
	    key: 'run',

	    /**
	     * Initializes the renderer, sets the zoom level and initially
	     * renders the operations stack
	     */
	    value: function run() {
	      this._initRenderer();

	      // Calculate the initial zoom level
	      this._zoomLevel = this._getInitialZoomLevel();
	      this._initialZoomLevel = this._zoomLevel;
	      this._isInitialZoom = true;
	      this._size = null;

	      this.render();
	      this._centerCanvas();
	      this._handleDrag();
	    }
	  }, {
	    key: 'render',

	    /**
	     * Renders the current operations stack
	     */
	    value: function render() {
	      var _this = this;

	      this._initialZoomLevel = this._getInitialZoomLevel();

	      // Reset the zoom level to initial
	      // Some operations change the texture resolution (e.g. rotation)
	      // If we're on initial zoom level, we still want to make the canvas
	      // fit into the container. Find the new initial zoom level and set it.
	      if (this._isInitialZoom) {
	        this.setZoomLevel(this._initialZoomLevel, false);
	      }

	      // Calculate the initial size
	      var imageSize = new _libMathVector22['default'](this._image.width, this._image.height);
	      var initialSize = imageSize.multiply(this._zoomLevel);
	      this._setCanvasSize(initialSize);

	      // Reset framebuffers
	      this._renderer.reset();

	      // Run the operations stack
	      var stack = this.sanitizedStack;
	      this._updateStackDirtyStates(stack);

	      var validationPromises = [];
	      for (var i = 0; i < stack.length; i++) {
	        var operation = stack[i];
	        validationPromises.push(operation.validateSettings());
	      }

	      return Promise.all(validationPromises).then(function () {
	        // When using WebGL, resize the image to max texture size if necessary
	        if (_this._isFirstRender && _this._renderer.identifier === 'webgl') {

	          if (_this._image.width > _this._renderer.maxTextureSize || _this._image.height > _this._renderer.maxTextureSize) {
	            _this._ui.displayLoadingMessage('Resizing...');
	            return new Promise(function (resolve, reject) {
	              setTimeout(function () {
	                _this._renderer.prepareImage(_this._image).then(function (image) {
	                  _this._ui.hideLoadingMessage();
	                  _this._options.image = image;
	                  _this._image = _this._options.image;
	                  resolve();
	                })['catch'](function (e) {
	                  reject(e);
	                });
	              }, 100);
	            });
	          }
	        }
	      }).then(function () {
	        // On first render, draw the image to the input texture
	        if (_this._isFirstRender || _this._renderer.constructor.identifier === 'canvas') {
	          _this._isFirstRender = false;
	          return _this._renderer.drawImage(_this._image);
	        }
	      })
	      // Render the operations stack
	      .then(function () {
	        var promises = [];
	        for (var i = 0; i < stack.length; i++) {
	          var operation = stack[i];
	          promises.push(operation.render(_this._renderer));
	        }
	        return Promise.all(promises);
	      })
	      // Render the final image
	      .then(function () {
	        return _this._renderer.renderFinal();
	      })
	      // Update the margins and boundaries
	      .then(function () {
	        _this._storeCanvasSize();
	        _this._updateContainerSize();
	        _this._updateCanvasMargins();
	        _this._applyBoundaries();
	      });
	    }
	  }, {
	    key: 'setImage',

	    /**
	     * Sets the image to the given one
	     * @param {Image} image
	     */
	    value: function setImage(image) {
	      this._image = image;
	      this.reset();
	      this.render();
	      this._centerCanvas();
	    }
	  }, {
	    key: 'zoomIn',

	    /**
	     * Increase zoom level
	     */
	    value: function zoomIn() {
	      this._isInitialZoom = false;

	      var zoomLevel = Math.round(this._zoomLevel * 100);
	      var roundZoomBy = Math.round(this._roundZoomBy * 100);
	      var initialZoomLevel = Math.round(this._initialZoomLevel * 100);

	      // Round up if needed
	      if (zoomLevel % roundZoomBy !== 0) {
	        zoomLevel = Math.ceil(zoomLevel / roundZoomBy) * roundZoomBy;
	      } else {
	        zoomLevel += roundZoomBy;
	      }

	      zoomLevel = Math.min(initialZoomLevel * 2, zoomLevel);
	      return this.setZoomLevel(zoomLevel / 100);
	    }
	  }, {
	    key: 'zoomOut',

	    /**
	     * Decrease zoom level
	     */
	    value: function zoomOut() {
	      this._isInitialZoom = false;

	      var zoomLevel = Math.round(this._zoomLevel * 100);
	      var roundZoomBy = Math.round(this._roundZoomBy * 100);
	      var initialZoomLevel = Math.round(this._initialZoomLevel * 100);

	      // Round up if needed
	      if (zoomLevel % roundZoomBy !== 0) {
	        zoomLevel = Math.floor(zoomLevel / roundZoomBy) * roundZoomBy;
	      } else {
	        zoomLevel -= roundZoomBy;
	      }

	      zoomLevel = Math.max(initialZoomLevel, zoomLevel);
	      return this.setZoomLevel(zoomLevel / 100);
	    }
	  }, {
	    key: '_setCanvasSize',

	    /**
	     * Resizes and positions the canvas
	     * @param {Vector2} [size]
	     * @private
	     */
	    value: function _setCanvasSize(size) {
	      size = size || new _libMathVector22['default'](this._canvas.width, this._canvas.height);

	      this._canvas.width = size.x;
	      this._canvas.height = size.y;

	      this._storeCanvasSize();
	      this._updateContainerSize();
	    }
	  }, {
	    key: '_updateContainerSize',

	    /**
	     * Updates the canvas container size
	     * @private
	     */
	    value: function _updateContainerSize() {
	      var size = this._size;
	      this._canvasInnerContainer.style.width = '' + size.x + 'px';
	      this._canvasInnerContainer.style.height = '' + size.y + 'px';
	    }
	  }, {
	    key: '_storeCanvasSize',

	    /**
	     * Remembers the canvas size
	     * @comment This was introduced because the canvas size was not always
	     *          correct due to some race conditions. Now that promises work
	     *          properly, do we still need this?
	     * @private
	     */
	    value: function _storeCanvasSize() {
	      this._size = new _libMathVector22['default'](this._canvas.width, this._canvas.height);
	    }
	  }, {
	    key: '_centerCanvas',

	    /**
	     * Centers the canvas inside the container
	     * @private
	     */
	    value: function _centerCanvas() {
	      var position = this._maxSize.divide(2);

	      this._canvasInnerContainer.style.left = '' + position.x + 'px';
	      this._canvasInnerContainer.style.top = '' + position.y + 'px';

	      this._updateCanvasMargins();
	    }
	  }, {
	    key: '_updateCanvasMargins',

	    /**
	     * Updates the canvas margins so that they are the negative half width
	     * and height of the canvas
	     * @private
	     */
	    value: function _updateCanvasMargins() {
	      var canvasSize = new _libMathVector22['default'](this._canvas.width, this._canvas.height);
	      var margin = canvasSize.divide(2).multiply(-1);
	      this._canvasInnerContainer.style.marginLeft = '' + margin.x + 'px';
	      this._canvasInnerContainer.style.marginTop = '' + margin.y + 'px';
	    }
	  }, {
	    key: 'setZoomLevel',

	    /**
	     * Sets the zoom level, re-renders the canvas and
	     * repositions it
	     * @param {Number} zoomLevel
	     * @param {Boolean} render
	     * @private
	     */
	    value: function setZoomLevel(zoomLevel) {
	      var _this2 = this;

	      var render = arguments[1] === undefined ? true : arguments[1];

	      this._zoomLevel = zoomLevel;
	      if (render) {
	        this.setAllOperationsToDirty();
	        return this.render().then(function () {
	          _this2._updateCanvasMargins();
	          _this2._applyBoundaries();
	          _this2.emit('zoom');
	        });
	      } else {
	        this._updateCanvasMargins();
	        this._applyBoundaries();
	        this.emit('zoom');
	      }
	    }
	  }, {
	    key: 'setAllOperationsToDirty',

	    /**
	     * Sets all operations to dirty
	     */
	    value: function setAllOperationsToDirty() {
	      var operationsStack = this._kit.operationsStack;

	      for (var i = 0; i < operationsStack.length; i++) {
	        var operation = operationsStack[i];
	        if (!operation) continue;
	        operation.dirty = true;
	      }
	    }
	  }, {
	    key: '_getInitialZoomLevel',

	    /**
	     * Gets the initial zoom level so that the image fits the maximum
	     * canvas size
	     * @private
	     */
	    value: function _getInitialZoomLevel() {
	      var inputSize = new _libMathVector22['default'](this._image.width, this._image.height);

	      var cropOperation = this._ui.operations.crop;
	      var rotationOperation = this._ui.operations.rotation;

	      var cropSize = undefined,
	          croppedSize = undefined,
	          finalSize = undefined,
	          initialSize = undefined;

	      if (cropOperation) {
	        cropSize = cropOperation.getEnd().clone().subtract(cropOperation.getStart());
	      } else {
	        cropSize = new _libMathVector22['default'](1, 1);
	      }

	      croppedSize = inputSize.clone().multiply(cropSize);

	      // Has the image been rotated?
	      if (rotationOperation && rotationOperation.getDegrees() % 180 !== 0) {
	        var tempX = croppedSize.x;
	        croppedSize.x = croppedSize.y;
	        croppedSize.y = tempX;
	      }

	      finalSize = this._resizeVectorToFit(croppedSize);

	      // Rotate back to be able to find the final size
	      if (rotationOperation && rotationOperation.getDegrees() % 180 !== 0) {
	        var tempX = finalSize.x;
	        finalSize.x = finalSize.y;
	        finalSize.y = tempX;
	      }

	      initialSize = finalSize.clone().divide(cropSize);
	      return initialSize.x / inputSize.x;
	    }
	  }, {
	    key: '_resizeVectorToFit',

	    /**
	     * Resizes the given two-dimensional vector so that it fits
	     * the maximum size.
	     * @private
	     */
	    value: function _resizeVectorToFit(size) {
	      var maxSize = this._maxSize;
	      var scale = Math.min(maxSize.x / size.x, maxSize.y / size.y);

	      var newSize = size.clone().multiply(scale);

	      return newSize;
	    }
	  }, {
	    key: '_initRenderer',

	    /**
	     * Initializes the renderer
	     * @private
	     */
	    value: function _initRenderer() {
	      var _this3 = this;

	      if (_renderersWebglRenderer2['default'].isSupported() && this._options.renderer !== 'canvas') {
	        this._renderer = new _renderersWebglRenderer2['default'](null, this._canvas);
	        this._webglEnabled = true;
	      } else if (_renderersCanvasRenderer2['default'].isSupported()) {
	        this._renderer = new _renderersCanvasRenderer2['default'](null, this._canvas);
	        this._webglEnabled = false;
	      }

	      if (this._renderer === null) {
	        throw new Error('Neither Canvas nor WebGL renderer are supported.');
	      }

	      this._renderer.on('new-canvas', function (canvas) {
	        _this3._setCanvas(canvas);
	      });
	    }
	  }, {
	    key: '_setCanvas',

	    /**
	     * Replaces the canvas with the given canvas, updates margins etc
	     * @param {DOMElement} canvas
	     * @private
	     */
	    value: function _setCanvas(canvas) {
	      var canvasParent = this._canvas.parentNode;
	      canvasParent.removeChild(this._canvas);
	      this._canvas = canvas;
	      canvasParent.appendChild(this._canvas);

	      this._updateCanvasMargins();
	      this._applyBoundaries();
	      this._updateContainerSize();
	    }
	  }, {
	    key: '_handleDrag',

	    /**
	     * Handles the dragging
	     * @private
	     */
	    value: function _handleDrag() {
	      this._canvas.addEventListener('mousedown', this._dragOnMousedown);
	      this._canvas.addEventListener('touchstart', this._dragOnMousedown);
	    }
	  }, {
	    key: '_dragOnMousedown',

	    /**
	     * Gets called when the user started touching / clicking the canvas
	     * @param {Event} e
	     * @private
	     */
	    value: function _dragOnMousedown(e) {
	      if (e.type === 'mousedown' && e.button !== 0) return;
	      e.preventDefault();

	      var x = e.pageX,
	          y = e.pageY;
	      if (e.type === 'touchstart') {
	        x = e.touches[0].pageX;
	        y = e.touches[0].pageY;
	      }

	      var canvasX = parseInt(this._canvasInnerContainer.style.left, 10);
	      var canvasY = parseInt(this._canvasInnerContainer.style.top, 10);

	      document.addEventListener('mousemove', this._dragOnMousemove);
	      document.addEventListener('touchmove', this._dragOnMousemove);

	      document.addEventListener('mouseup', this._dragOnMouseup);
	      document.addEventListener('touchend', this._dragOnMouseup);

	      // Remember initial position
	      this._initialMousePosition = new _libMathVector22['default'](x, y);
	      this._initialCanvasPosition = new _libMathVector22['default'](canvasX, canvasY);
	    }
	  }, {
	    key: '_dragOnMousemove',

	    /**
	     * Gets called when the user drags the canvas
	     * @param {Event} e
	     * @private
	     */
	    value: function _dragOnMousemove(e) {
	      e.preventDefault();

	      var x = e.pageX,
	          y = e.pageY;
	      if (e.type === 'touchmove') {
	        x = e.touches[0].pageX;
	        y = e.touches[0].pageY;
	      }

	      var newMousePosition = new _libMathVector22['default'](x, y);
	      var mouseDiff = newMousePosition.clone().subtract(this._initialMousePosition);
	      var newPosition = this._initialCanvasPosition.clone().add(mouseDiff);

	      this._canvasInnerContainer.style.left = '' + newPosition.x + 'px';
	      this._canvasInnerContainer.style.top = '' + newPosition.y + 'px';

	      this._applyBoundaries();
	    }
	  }, {
	    key: '_applyBoundaries',

	    /**
	     * Makes sure the canvas positions are within the boundaries
	     * @private
	     */
	    value: function _applyBoundaries() {
	      var x = parseInt(this._canvasInnerContainer.style.left, 10);
	      var y = parseInt(this._canvasInnerContainer.style.top, 10);
	      var canvasPosition = new _libMathVector22['default'](x, y);

	      // Boundaries
	      var boundaries = this._boundaries;
	      canvasPosition.x = Math.min(boundaries.max.x, Math.max(boundaries.min.x, canvasPosition.x));
	      canvasPosition.y = Math.min(boundaries.max.y, Math.max(boundaries.min.y, canvasPosition.y));

	      this._canvasInnerContainer.style.left = '' + canvasPosition.x + 'px';
	      this._canvasInnerContainer.style.top = '' + canvasPosition.y + 'px';
	    }
	  }, {
	    key: '_dragOnMouseup',

	    /**
	     * Gets called when the user stopped dragging the canvsa
	     * @param {Event} e
	     * @private
	     */
	    value: function _dragOnMouseup(e) {
	      e.preventDefault();

	      document.removeEventListener('mousemove', this._dragOnMousemove);
	      document.removeEventListener('touchmove', this._dragOnMousemove);

	      document.removeEventListener('mouseup', this._dragOnMouseup);
	      document.removeEventListener('touchend', this._dragOnMouseup);
	    }
	  }, {
	    key: '_updateStackDirtyStates',

	    /**
	     * Find the first dirty operation of the stack and sets all following
	     * operations to dirty
	     * @param {Array.<Operation>} stack
	     * @private
	     */
	    value: function _updateStackDirtyStates(stack) {
	      var dirtyFound = false;
	      for (var i = 0; i < stack.length; i++) {
	        var operation = stack[i];
	        if (!operation) continue;
	        if (operation.dirty) {
	          dirtyFound = true;
	        }

	        if (dirtyFound) {
	          operation.dirty = true;
	        }
	      }
	    }
	  }, {
	    key: 'zoomToFit',

	    /**
	     * Zooms the canvas so that it fits the container
	     * @param {Boolean} render
	     */
	    value: function zoomToFit() {
	      var render = arguments[0] === undefined ? true : arguments[0];

	      var initialZoomLevel = this._getInitialZoomLevel();
	      return this.setZoomLevel(initialZoomLevel, render);
	    }
	  }, {
	    key: 'reset',

	    /**
	     * Resets the renderer
	     */
	    value: function reset() {
	      this._renderer.reset(true);
	      this._kit.operationsStack = [];
	      this._isFirstRender = true;
	    }
	  }, {
	    key: '_boundaries',

	    /**
	     * The position boundaries for the canvas inside the container
	     * @type {Object.<Vector2>}
	     * @private
	     */
	    get: function () {
	      var canvasSize = new _libMathVector22['default'](this._canvas.width, this._canvas.height);
	      var maxSize = this._maxSize;

	      var diff = canvasSize.clone().subtract(maxSize).multiply(-1);

	      var boundaries = {
	        min: new _libMathVector22['default'](diff.x, diff.y),
	        max: new _libMathVector22['default'](0, 0)
	      };

	      if (canvasSize.x < maxSize.x) {
	        boundaries.min.x = diff.x / 2;
	        boundaries.max.x = diff.x / 2;
	      }

	      if (canvasSize.y < maxSize.y) {
	        boundaries.min.y = diff.y / 2;
	        boundaries.max.y = diff.y / 2;
	      }

	      var halfCanvasSize = canvasSize.clone().divide(2);
	      boundaries.min.add(halfCanvasSize);
	      boundaries.max.add(halfCanvasSize);
	      return boundaries;
	    }
	  }, {
	    key: '_maxSize',

	    /**
	     * The maximum canvas size
	     * @private
	     */
	    get: function () {
	      var computedStyle = window.getComputedStyle(this._canvasContainer);
	      var size = new _libMathVector22['default'](this._canvasContainer.offsetWidth, this._canvasContainer.offsetHeight);

	      var paddingX = parseInt(computedStyle.getPropertyValue('padding-left'), 10);
	      paddingX += parseInt(computedStyle.getPropertyValue('padding-right'), 10);

	      var paddingY = parseInt(computedStyle.getPropertyValue('padding-top'), 10);
	      paddingY += parseInt(computedStyle.getPropertyValue('padding-bottom'), 10);

	      size.x -= paddingX;
	      size.y -= paddingY;

	      var controlsHeight = this._ui._controlsContainer.offsetHeight;
	      size.y -= controlsHeight;

	      return size;
	    }
	  }, {
	    key: 'sanitizedStack',

	    /**
	     * Returns the operations stack without falsy values
	     * @type {Array.<Operation>}
	     */
	    get: function () {
	      var sanitizedStack = [];
	      for (var i = 0; i < this._kit.operationsStack.length; i++) {
	        var operation = this._kit.operationsStack[i];
	        if (!operation) continue;
	        sanitizedStack.push(operation);
	      }
	      return sanitizedStack;
	    }
	  }, {
	    key: 'zoomLevel',

	    /**
	     * The current zoom level
	     * @type {Number}
	     */
	    get: function () {
	      return this._zoomLevel;
	    }
	  }, {
	    key: 'size',

	    /**
	     * The canvas size in pixels
	     * @type {Vector2}
	     */
	    get: function () {
	      return this._size;
	    }
	  }]);

	  return Canvas;
	})(_libEventEmitter2['default']);

	exports['default'] = Canvas;
	module.exports = exports['default'];
	// will be redirected to top controls
	// will be redirected to top controls

/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _libEventEmitter = __webpack_require__(72);

	var _libEventEmitter2 = _interopRequireDefault(_libEventEmitter);

	var FileLoader = (function (_EventEmitter) {
	  function FileLoader(kit, ui) {
	    _classCallCheck(this, FileLoader);

	    _get(Object.getPrototypeOf(FileLoader.prototype), 'constructor', this).call(this);

	    this._kit = kit;
	    this._ui = ui;

	    // http://stackoverflow.com/questions/7110353/html5-dragleave-fired-when-hovering-a-child-element
	    this._dragCounter = 0;

	    this._container = this._ui.container.querySelector('.imglykit-drop-area-container');

	    this._onDropAreaDragEnter = this._onDropAreaDragEnter.bind(this);
	    this._onDropAreaDragOver = this._onDropAreaDragOver.bind(this);
	    this._onDropAreaDragLeave = this._onDropAreaDragLeave.bind(this);
	    this._onDropAreaDrop = this._onDropAreaDrop.bind(this);
	    this._onDropAreaClick = this._onDropAreaClick.bind(this);
	    this._onFileInputChange = this._onFileInputChange.bind(this);

	    this._hiddenInputField = this._ui.container.querySelector('.imglykit-drop-area .imglykit-drop-area-hidden-input');
	    this._hiddenInputField.addEventListener('change', this._onFileInputChange);

	    this._handleDropArea();
	    if (this._ui.options.image) {
	      this.removeDOM();
	    }
	  }

	  _inherits(FileLoader, _EventEmitter);

	  _createClass(FileLoader, [{
	    key: 'openFileDialog',

	    /**
	     * Opens the file dialog
	     */
	    value: function openFileDialog() {
	      this._hiddenInputField.click();
	    }
	  }, {
	    key: '_handleDropArea',

	    /**
	     * Finds the drop area, adds event listeners
	     * @private
	     */
	    value: function _handleDropArea() {
	      var container = this._ui.container;

	      this._dropArea = container.querySelector('.imglykit-drop-area');
	      this._dropArea.addEventListener('dragenter', this._onDropAreaDragEnter);
	      this._dropArea.addEventListener('dragover', this._onDropAreaDragOver);
	      this._dropArea.addEventListener('dragleave', this._onDropAreaDragLeave);
	      this._dropArea.addEventListener('drop', this._onDropAreaDrop);
	      this._dropArea.addEventListener('dragdrop', this._onDropAreaDrop);
	      this._dropArea.addEventListener('click', this._onDropAreaClick);
	    }
	  }, {
	    key: '_onDropAreaClick',

	    /**
	     * Gets called when the user clicks on the drop area. Opens the file
	     * dialog by triggering a click on the hidden input field
	     * @param {Event} e
	     * @private
	     */
	    value: function _onDropAreaClick() {
	      this.openFileDialog();
	    }
	  }, {
	    key: '_onDropAreaDragEnter',

	    /**
	     * Gets called when the user drags a file over the drop area
	     * @param {Event} e
	     * @private
	     */
	    value: function _onDropAreaDragEnter(e) {
	      e.preventDefault();

	      this._dragCounter++;
	      this._dropArea.classList.add('imglykit-drop-area-active');
	    }
	  }, {
	    key: '_onDropAreaDragOver',

	    /**
	     * We need to cancel this event to get a drop event
	     * @param {Event} e
	     * @private
	     */
	    value: function _onDropAreaDragOver(e) {
	      e.preventDefault();
	    }
	  }, {
	    key: '_onDropAreaDragLeave',

	    /**
	     * Gets called when the user does no longer drag a file over the drop area
	     * @param {Event} e
	     * @private
	     */
	    value: function _onDropAreaDragLeave(e) {
	      e.preventDefault();

	      this._dragCounter--;

	      if (this._dragCounter === 0) {
	        this._dropArea.classList.remove('imglykit-drop-area-active');
	      }
	    }
	  }, {
	    key: '_onDropAreaDrop',

	    /**
	     * Gets called when the user drops a file on the drop area
	     * @param {Event} e
	     * @private
	     */
	    value: function _onDropAreaDrop(e) {
	      e.stopPropagation();
	      e.preventDefault();
	      e.returnValue = false;

	      this._dropArea.classList.remove('imglykit-drop-area-active');

	      if (!e.dataTransfer) return;

	      this._handleFile(e.dataTransfer.files[0]);
	    }
	  }, {
	    key: '_onFileInputChange',

	    /**
	     * Gets called when the user selected a file
	     * @param {Event} e
	     * @private
	     */
	    value: function _onFileInputChange() {
	      this._handleFile(this._hiddenInputField.files[0]);
	    }
	  }, {
	    key: '_handleFile',

	    /**
	     * Gets called when the user selected a file. Emits a `file` event.
	     * @param {File} file
	     * @private
	     */
	    value: function _handleFile(file) {
	      this.emit('file', file);
	    }
	  }, {
	    key: 'removeDOM',

	    /**
	     * Removes event listeners and removes the container form the dom
	     */
	    value: function removeDOM() {
	      this._dropArea.removeEventListener('dragenter', this._onDropAreaDragEnter);
	      this._dropArea.removeEventListener('dragover', this._onDropAreaDragOver);
	      this._dropArea.removeEventListener('dragleave', this._onDropAreaDragLeave);
	      this._dropArea.removeEventListener('drop', this._onDropAreaDrop);
	      this._dropArea.removeEventListener('dragdrop', this._onDropAreaDrop);
	      this._dropArea.removeEventListener('click', this._onDropAreaClick);

	      if (this._container) {
	        this._container.style.display = 'none';
	      }
	    }
	  }]);

	  return FileLoader;
	})(_libEventEmitter2['default']);

	exports['default'] = FileLoader;
	module.exports = exports['default'];

/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _libEventEmitter = __webpack_require__(72);

	var _libEventEmitter2 = _interopRequireDefault(_libEventEmitter);

	var TopControls = (function (_EventEmitter) {
	  function TopControls(kit, ui) {
	    _classCallCheck(this, TopControls);

	    _get(Object.getPrototypeOf(TopControls.prototype), 'constructor', this).call(this);

	    this._kit = kit;
	    this._ui = ui;
	    this.init();
	  }

	  _inherits(TopControls, _EventEmitter);

	  _createClass(TopControls, [{
	    key: 'init',

	    /**
	     * Initializes the controls
	     */
	    value: function init() {
	      this._canvas = this._ui.canvas;
	    }
	  }, {
	    key: 'run',

	    /**
	     * Initializes the controls
	     */
	    value: function run() {
	      var container = this._ui.container;

	      this._rightControls = container.querySelector('.imglykit-top-controls-right');
	      this._leftControls = container.querySelector('.imglykit-top-controls-left');

	      this._undoButton = container.querySelector('.imglykit-undo');
	      this._zoomIn = container.querySelector('.imglykit-zoom-in');
	      this._zoomOut = container.querySelector('.imglykit-zoom-out');
	      this._zoomLevel = container.querySelector('.imglykit-zoom-level-num');
	      this._newButton = container.querySelector('.imglykit-new');
	      this._exportButton = container.querySelector('.imglykit-export');
	      this._handleZoom();
	      this._handleUndo();
	      this._handleNew();
	      this._handleExport();
	    }
	  }, {
	    key: '_handleZoom',

	    /**
	     * Handles the zoom controls
	     * @private
	     */
	    value: function _handleZoom() {
	      this._zoomIn.addEventListener('click', this._onZoomInClick.bind(this));
	      this._zoomOut.addEventListener('click', this._onZoomOutClick.bind(this));
	    }
	  }, {
	    key: '_handleUndo',

	    /**
	     * Handles the undo control
	     * @private
	     */
	    value: function _handleUndo() {
	      this._undoButton.addEventListener('click', this._undo.bind(this));
	      this._undo();
	    }
	  }, {
	    key: '_handleNew',

	    /**
	     * Handles the new button
	     * @private
	     */
	    value: function _handleNew() {
	      if (!this._newButton) return;

	      this._newButton.addEventListener('click', this._onNewClick.bind(this));
	    }
	  }, {
	    key: '_handleExport',

	    /**
	     * Handles the export button
	     * @private
	     */
	    value: function _handleExport() {
	      if (!this._exportButton) return;

	      this._exportButton.addEventListener('click', this._onExportClick.bind(this));
	    }
	  }, {
	    key: '_onNewClick',

	    /**
	     * Gets called when the user clicks the new button
	     * @param {Event} e
	     * @private
	     */
	    value: function _onNewClick(e) {
	      e.preventDefault();

	      var fileLoader = this._ui.fileLoader;

	      fileLoader.openFileDialog();
	    }
	  }, {
	    key: '_onExportClick',

	    /**
	     * Gets called when the user clicks the export button
	     * @param {Event} e
	     * @private
	     */
	    value: function _onExportClick(e) {
	      e.preventDefault();

	      this.emit('export');
	    }
	  }, {
	    key: '_undo',

	    /**
	     * Gets called when the user clicks the undo button
	     * @private
	     */
	    value: function _undo() {
	      this.emit('undo');
	    }
	  }, {
	    key: 'updateUndoButton',

	    /**
	     * Updates the undo button visible state
	     */
	    value: function updateUndoButton() {
	      var history = this._ui.history;

	      if (history.length === 0) {
	        this._undoButton.style.display = 'none';
	      } else {
	        this._undoButton.style.display = 'inline-block';
	      }
	    }
	  }, {
	    key: 'updateExportButton',

	    /**
	     * Updates the export button visible state
	     */
	    value: function updateExportButton() {
	      if (!this._exportButton) return;

	      var image = this._ui.image;

	      if (image) {
	        this._exportButton.style.display = 'inline-block';
	      } else {
	        this._exportButton.style.display = 'none';
	      }
	    }
	  }, {
	    key: '_onZoomInClick',

	    /**
	     * Gets called when the user clicked the zoom in button
	     * @param {Event}
	     * @private
	     */
	    value: function _onZoomInClick(e) {
	      e.preventDefault();

	      this.emit('zoom-in');
	      this.updateZoomLevel();
	    }
	  }, {
	    key: '_onZoomOutClick',

	    /**
	     * Gets called when the user clicked the zoom out button
	     * @param {Event}
	     * @private
	     */
	    value: function _onZoomOutClick(e) {
	      e.preventDefault();

	      this.emit('zoom-out');
	      this.updateZoomLevel();
	    }
	  }, {
	    key: 'showZoom',

	    /**
	     * Shows the zoom control
	     */
	    value: function showZoom() {
	      this._rightControls.style.display = 'inline-block';
	    }
	  }, {
	    key: 'hideZoom',

	    /**
	     * Hides the zoom control
	     */
	    value: function hideZoom() {
	      this._rightControls.style.display = 'none';
	    }
	  }, {
	    key: 'updateZoomLevel',

	    /**
	     * Updates the zoom level display
	     */
	    value: function updateZoomLevel() {
	      var zoomLevel = this._canvas.zoomLevel;

	      this._zoomLevel.innerHTML = Math.round(zoomLevel * 100);
	    }
	  }]);

	  return TopControls;
	})(_libEventEmitter2['default']);

	exports['default'] = TopControls;
	module.exports = exports['default'];

/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var _libUtils = __webpack_require__(6);

	var _libUtils2 = _interopRequireDefault(_libUtils);

	var _libMathVector2 = __webpack_require__(50);

	var _libMathVector22 = _interopRequireDefault(_libMathVector2);

	var maxScrollbarWidth = 18;

	/**
	 * Our custom scroll bar
	 */

	var Scrollbar = (function () {
	  /**
	   * @param {DOMElement} container
	   */

	  function Scrollbar(container) {
	    _classCallCheck(this, Scrollbar);

	    this._container = container;
	    this._isDragging = false;
	    this._isHovering = false;

	    this._appendDOM();
	    this._resizeButton();
	    this._updateValues();

	    this._onButtonDown = this._onButtonDown.bind(this);
	    this._onButtonMove = this._onButtonMove.bind(this);
	    this._onButtonUp = this._onButtonUp.bind(this);

	    this._onContainerEnter = this._onContainerEnter.bind(this);
	    this._onContainerLeave = this._onContainerLeave.bind(this);

	    this._onBackgroundClick = this._onBackgroundClick.bind(this);

	    this._container.addEventListener('mouseenter', this._onContainerEnter);
	    this._container.addEventListener('mouseleave', this._onContainerLeave);
	    this._container.addEventListener('mousemove', this._onContainerEnter);
	    this._dom.button.addEventListener('mousedown', this._onButtonDown);
	    this._dom.button.addEventListener('touchstart', this._onButtonDown);
	    this._dom.background.addEventListener('click', this._onBackgroundClick);
	    this._list.addEventListener('scroll', this._onListScroll.bind(this));

	    this._onListScroll();
	  }

	  _createClass(Scrollbar, [{
	    key: '_onBackgroundClick',

	    /**
	     * Gets called when the user clicks the scrollbar background
	     * @param {Event} e
	     * @private
	     */
	    value: function _onBackgroundClick(e) {
	      e.preventDefault();
	      if (e.target !== this._dom.background) return;

	      var position = _libUtils2['default'].getEventPosition(e);
	      var backgroundOffset = this._dom.background.getBoundingClientRect();
	      backgroundOffset = new _libMathVector22['default'](backgroundOffset.left, backgroundOffset.top);

	      var relativePosition = position.clone().subtract(backgroundOffset);

	      relativePosition.x -= this._values.button.width * 0.5;

	      this._setButtonPosition(relativePosition.x);
	    }
	  }, {
	    key: '_onContainerEnter',

	    /**
	     * Gets called when the user enters the list with the mouse
	     * @private
	     */
	    value: function _onContainerEnter() {
	      this._isHovering = true;
	      this.show();
	    }
	  }, {
	    key: '_onContainerLeave',

	    /**
	     * Gets called when the user leaves the list with the mouse
	     * @private
	     */
	    value: function _onContainerLeave() {
	      this._isHovering = false;
	      this.hide();
	    }
	  }, {
	    key: 'show',

	    /**
	     * Shows the scrollbar
	     */
	    value: function show() {
	      if (!this._isScrollingNecessary) return;
	      this._dom.background.classList.add('visible');
	    }
	  }, {
	    key: 'hide',

	    /**
	     * Hides the scrollbar
	     */
	    value: function hide() {
	      if (this._isDragging) return;
	      this._dom.background.classList.remove('visible');
	    }
	  }, {
	    key: '_updateValues',

	    /**
	     * Updates the size values
	     * @private
	     */
	    value: function _updateValues() {
	      this._values = {
	        list: {
	          totalWidth: this._list.scrollWidth,
	          visibleWidth: this._list.offsetWidth,
	          scrollableWidth: this._list.scrollWidth - this._list.offsetWidth
	        },
	        button: {
	          width: this._dom.button.offsetWidth,
	          scrollableWidth: this._dom.background.offsetWidth - this._dom.button.offsetWidth
	        }
	      };
	    }
	  }, {
	    key: '_onButtonDown',

	    /**
	     * Gets called when the user starts dragging the button
	     * @param {Event} event
	     * @private
	     */
	    value: function _onButtonDown(event) {
	      event.preventDefault();

	      this._isDragging = true;

	      this._initialMousePosition = _libUtils2['default'].getEventPosition(event);
	      this._initialButtonPosition = this._buttonPosition || 0;

	      document.addEventListener('mousemove', this._onButtonMove);
	      document.addEventListener('touchmove', this._onButtonMove);
	      document.addEventListener('mouseup', this._onButtonUp);
	      document.addEventListener('touchend', this._onButtonUp);
	    }
	  }, {
	    key: '_onButtonMove',

	    /**
	     * Gets called when the user drags the button
	     * @param {Event} event
	     * @private
	     */
	    value: function _onButtonMove(event) {
	      event.preventDefault();

	      var mousePosition = _libUtils2['default'].getEventPosition(event);
	      var diff = mousePosition.clone().subtract(this._initialMousePosition);
	      var newButtonPosition = this._initialButtonPosition + diff.x;

	      this._setButtonPosition(newButtonPosition);
	    }
	  }, {
	    key: '_setButtonPosition',

	    /**
	     * Sets the button position to the given value
	     * @param {Number} newButtonPosition
	     * @private
	     */
	    value: function _setButtonPosition(newButtonPosition) {
	      // Clamp button position
	      newButtonPosition = Math.max(0, newButtonPosition);
	      newButtonPosition = Math.min(newButtonPosition, this._values.button.scrollableWidth);

	      // Set button position
	      this._buttonPosition = newButtonPosition;
	      this._dom.button.style.left = '' + this._buttonPosition + 'px';

	      // Update list scroll position
	      var progress = newButtonPosition / this._values.button.scrollableWidth;
	      var scrollPosition = this._values.list.scrollableWidth * progress;
	      this._list.scrollLeft = scrollPosition;
	    }
	  }, {
	    key: '_onButtonUp',

	    /**
	     * Gets called when the user releases the button
	     * @private
	     */
	    value: function _onButtonUp() {
	      this._isDragging = false;

	      document.removeEventListener('mousemove', this._onButtonMove);
	      document.removeEventListener('touchmove', this._onButtonMove);
	      document.removeEventListener('mouseup', this._onButtonUp);
	      document.removeEventListener('touchend', this._onButtonUp);
	    }
	  }, {
	    key: '_onListScroll',

	    /**
	     * Gets called when the user scrolls the list
	     * @private
	     */
	    value: function _onListScroll() {
	      if (this._isDragging) return;

	      var listScrollWidth = this._list.scrollWidth - this._list.offsetWidth;
	      var listScrollPosition = this._list.scrollLeft;

	      var backgroundScrollWidth = this._dom.background.offsetWidth - this._dom.button.offsetWidth;
	      var progress = listScrollPosition / listScrollWidth;

	      this._buttonPosition = backgroundScrollWidth * progress;
	      this._dom.button.style.left = '' + this._buttonPosition + 'px';
	    }
	  }, {
	    key: '_resizeButton',

	    /**
	     * Resizes the button to represent the visible size of the container
	     * @private
	     */
	    value: function _resizeButton() {
	      var listScrollWidth = this._list.scrollWidth;
	      var listWidth = this._list.offsetWidth;

	      this._buttonWidth = listWidth / listScrollWidth * listWidth;
	      this._dom.button.style.width = '' + this._buttonWidth + 'px';
	    }
	  }, {
	    key: '_appendDOM',

	    /**
	     * Appends the DOM elements to the container
	     * @private
	     */
	    value: function _appendDOM() {
	      var background = document.createElement('div');
	      background.classList.add('imglykit-scrollbar-background');
	      background.style.bottom = '' + maxScrollbarWidth + 'px';

	      var button = document.createElement('div');
	      button.classList.add('imglykit-scrollbar-button');

	      background.appendChild(button);
	      this._container.appendChild(background);

	      // Container should have position: relative
	      this._container.style.position = 'relative';

	      // Find the list
	      this._list = this._container.querySelector('.imglykit-controls-list');
	      this._dom = { background: background, button: button };

	      // Resize the list and the container
	      this._list.style.height = '';
	      var listHeight = this._list.offsetHeight;
	      listHeight += maxScrollbarWidth;
	      this._container.style.height = '' + listHeight + 'px';
	      this._list.style.height = '' + listHeight + 'px';
	    }
	  }, {
	    key: 'remove',

	    /**
	     * Removes the DOM elements and event listeners
	     */
	    value: function remove() {
	      this._dom.button.removeEventListener('mousedown', this._onButtonDown);
	      this._dom.button.removeEventListener('touchstart', this._onButtonDown);

	      this._dom.background.remove();
	    }
	  }, {
	    key: '_isScrollingNecessary',

	    /**
	     * Checks whether scrolling is necessary
	     * @returns {Boolean}
	     * @private
	     */
	    get: function () {
	      return this._list.scrollWidth > this._list.offsetWidth;
	    }
	  }]);

	  return Scrollbar;
	})();

	exports['default'] = Scrollbar;
	module.exports = exports['default'];

/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _control = __webpack_require__(92);

	var _control2 = _interopRequireDefault(_control);

	var _libUtils = __webpack_require__(6);

	var _libUtils2 = _interopRequireDefault(_libUtils);



	var FiltersControl = (function (_Control) {
	  function FiltersControl() {
	    _classCallCheck(this, FiltersControl);

	    if (_Control != null) {
	      _Control.apply(this, arguments);
	    }
	  }

	  _inherits(FiltersControl, _Control);

	  _createClass(FiltersControl, [{
	    key: 'init',

	    /**
	     * Entry point for this control
	     */
	    value: function init() {
	      var controlsTemplate = "{{##def.control:\n  <div>\n    <ul class=\"imglykit-controls-list imgly-controls-list-with-buttons\">\n      {{ for(var identifier in it.filters) { }}\n        {{ var filter = it.filters[identifier]; }}\n        {{ var name = filter.prototype.name; }}\n        {{ var enabled = it.activeFilter.identifier === identifier; }}\n        <li data-identifier=\"{{= identifier}}\" class=\"imglykit-controls-item-with-label{{? enabled}} imglykit-controls-item-active{{?}}\">\n          <img src=\"{{=it.helpers.assetPath('ui/night/filters/' + identifier + '.png')}}\" />\n          <div class=\"imglykit-controls-item-label\">{{= name }}</div>\n        </li>\n      {{ } }}\n    </ul>\n  </div>\n#}}\n";
	      this._controlsTemplate = controlsTemplate;

	      this._availableFilters = {};
	      this._filters = {};

	      this._addDefaultFilters();

	      // Select all filters per default
	      this.selectFilters(null);
	    }
	  }, {
	    key: '_renderAllControls',

	    /**
	     * Renders the controls
	     * @private
	     * @internal We need to access information from the operation when
	     *           rendering, which is why we have to override this function
	     */
	    value: function _renderAllControls() {
	      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	        args[_key] = arguments[_key];
	      }

	      this._operationExistedBefore = !!this._ui.operations.filters;
	      this._operation = this._ui.getOrCreateOperation('filters');

	      _get(Object.getPrototypeOf(FiltersControl.prototype), '_renderAllControls', this).apply(this, args);
	    }
	  }, {
	    key: '_onEnter',

	    /**
	     * Gets called when this control is activated
	     * @override
	     */
	    value: function _onEnter() {
	      var _this = this;

	      this._initialFilter = this._operation.getFilter();
	      this._defaultFilter = this._operation.availableOptions.filter['default'];

	      var listItems = this._controls.querySelectorAll('li');
	      this._listItems = Array.prototype.slice.call(listItems);

	      var _loop = function (i) {
	        var listItem = _this._listItems[i];
	        listItem.addEventListener('click', function () {
	          _this._onListItemClick(listItem);
	        });
	      };

	      // Listen to click events
	      for (var i = 0; i < this._listItems.length; i++) {
	        _loop(i);
	      }
	    }
	  }, {
	    key: '_onBack',

	    /**
	     * Gets called when the user hits the back button
	     * @override
	     */
	    value: function _onBack() {
	      var currentFilter = this._operation.getFilter();
	      if (currentFilter !== this._initialFilter) {
	        this._ui.addHistory(this._operation, {
	          filter: this._initialFilter
	        }, this._operationExistedBefore);
	      }
	      if (currentFilter === this._defaultFilter) {
	        this._ui.removeOperation('filters');
	      }
	      this._ui.canvas.render();
	    }
	  }, {
	    key: '_onListItemClick',

	    /**
	     * Gets called when the user clicked a list item
	     * @private
	     */
	    value: function _onListItemClick(item) {
	      this._deactivateAllItems();

	      var identifier = item.dataset.identifier;

	      this._operation.setFilter(this._filters[identifier]);
	      this._ui.canvas.render();

	      item.classList.add('imglykit-controls-item-active');
	    }
	  }, {
	    key: '_deactivateAllItems',

	    /**
	     * Deactivates all list items
	     * @private
	     */
	    value: function _deactivateAllItems() {
	      for (var i = 0; i < this._listItems.length; i++) {
	        var listItem = this._listItems[i];
	        listItem.classList.remove('imglykit-controls-item-active');
	      }
	    }
	  }, {
	    key: '_addDefaultFilters',

	    /**
	     * Registers all the known filters
	     * @private
	     */
	    value: function _addDefaultFilters() {
	      this.addFilter(__webpack_require__(71));
	      this.addFilter(__webpack_require__(34));
	      this.addFilter(__webpack_require__(35));
	      this.addFilter(__webpack_require__(36));
	      this.addFilter(__webpack_require__(37));
	      this.addFilter(__webpack_require__(30));
	      this.addFilter(__webpack_require__(23));
	      this.addFilter(__webpack_require__(42));
	      this.addFilter(__webpack_require__(27));
	      this.addFilter(__webpack_require__(31));
	      this.addFilter(__webpack_require__(28));
	      this.addFilter(__webpack_require__(49));
	      this.addFilter(__webpack_require__(24));
	      this.addFilter(__webpack_require__(25));
	      this.addFilter(__webpack_require__(38));
	      this.addFilter(__webpack_require__(45));
	      this.addFilter(__webpack_require__(44));
	      this.addFilter(__webpack_require__(43));
	      this.addFilter(__webpack_require__(29));
	      this.addFilter(__webpack_require__(32));
	      this.addFilter(__webpack_require__(26));
	      this.addFilter(__webpack_require__(48));
	      this.addFilter(__webpack_require__(41));
	      this.addFilter(__webpack_require__(39));
	      this.addFilter(__webpack_require__(33));
	      this.addFilter(__webpack_require__(40));
	      this.addFilter(__webpack_require__(47));
	      this.addFilter(__webpack_require__(22));
	      this.addFilter(__webpack_require__(46));
	    }
	  }, {
	    key: 'addFilter',

	    /**
	     * Registers the given filter
	     * @param  {class} filter
	     * @private
	     */
	    value: function addFilter(filter) {
	      this._availableFilters[filter.identifier] = filter;
	    }
	  }, {
	    key: 'selectFilters',

	    /**
	     * Selects the filters
	     * @param {Selector} selector
	     */
	    value: function selectFilters(selector) {
	      this._filters = {};

	      var filterIdentifiers = Object.keys(this._availableFilters);

	      var selectedFilters = _libUtils2['default'].select(filterIdentifiers, selector);
	      for (var i = 0; i < selectedFilters.length; i++) {
	        var identifier = selectedFilters[i];
	        this._filters[identifier] = this._availableFilters[identifier];
	      }

	      if (this._active) {
	        this._renderControls();
	      }
	    }
	  }, {
	    key: 'context',

	    /**
	     * The data that is available to the template
	     * @type {Object}
	     * @override
	     */
	    get: function () {
	      var context = _get(Object.getPrototypeOf(FiltersControl.prototype), 'context', this);
	      context.filters = this._filters;
	      context.activeFilter = this._operation.getFilter();
	      return context;
	    }
	  }]);

	  return FiltersControl;
	})(_control2['default']);

	/**
	 * A unique string that identifies this control.
	 * @type {String}
	 */
	FiltersControl.prototype.identifier = 'filters';

	exports['default'] = FiltersControl;
	module.exports = exports['default'];

/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _control = __webpack_require__(92);

	var _control2 = _interopRequireDefault(_control);

	var _libMathVector2 = __webpack_require__(50);

	var _libMathVector22 = _interopRequireDefault(_libMathVector2);



	var RotationControl = (function (_Control) {
	  function RotationControl() {
	    _classCallCheck(this, RotationControl);

	    if (_Control != null) {
	      _Control.apply(this, arguments);
	    }
	  }

	  _inherits(RotationControl, _Control);

	  _createClass(RotationControl, [{
	    key: 'init',

	    /**
	     * Entry point for this control
	     */
	    value: function init() {
	      var controlsTemplate = "{{##def.control:\n  <div>\n    <ul class=\"imglykit-controls-list imgly-controls-list-with-buttons\">\n      <li data-degrees=\"-90\">\n        <img src=\"{{=it.helpers.assetPath('ui/night/rotation/left.png')}}\" />\n      </li>\n      <li data-degrees=\"90\">\n        <img src=\"{{=it.helpers.assetPath('ui/night/rotation/right.png')}}\" />\n      </li>\n    </ul>\n  </div>\n#}}\n";
	      this._controlsTemplate = controlsTemplate;

	      var canvasControlsTemplate = "<div class=\"imglykit-canvas-crop-container imglykit-canvas-crop-container-hidden\">\n  <div class=\"imglykit-canvas-crop-top\">\n    <div class=\"imglykit-canvas-crop-top-left\"></div>\n    <div class=\"imglykit-canvas-crop-top-center\"></div>\n    <div class=\"imglykit-canvas-crop-top-right\"></div>\n  </div>\n\n  <div class=\"imglykit-canvas-crop-center\">\n    <div class=\"imglykit-canvas-crop-center-left\"></div>\n    <div class=\"imglykit-canvas-crop-center-center imglykit-canvas-crop-center-center-nomove\">\n\n    </div>\n    <div class=\"imglykit-canvas-crop-center-right\"></div>\n  </div>\n\n  <div class=\"imglykit-canvas-crop-bottom\">\n    <div class=\"imglykit-canvas-crop-bottom-left\"></div>\n    <div class=\"imglykit-canvas-crop-bottom-center\"></div>\n    <div class=\"imglykit-canvas-crop-bottom-right\"></div>\n  </div>\n</div>\n";
	      this._canvasControlsTemplate = canvasControlsTemplate;
	    }
	  }, {
	    key: '_onEnter',

	    /**
	     * Gets called when this control is activated
	     */
	    value: function _onEnter() {
	      var _this = this;

	      this._operationExistedBefore = !!this._ui.operations.rotation;
	      this._operation = this._ui.getOrCreateOperation('rotation');

	      this._cropOperation = this._ui.operations.crop;

	      this._initialZoomLevel = this._ui.canvas.zoomLevel;
	      this._ui.canvas.zoomToFit(false);

	      if (this._cropOperation) {
	        // Store initial settings for 'back' and 'done' buttons
	        this._initialStart = this._cropOperation.getStart().clone();
	        this._initialEnd = this._cropOperation.getEnd().clone();

	        // Make sure we see the whole input image
	        this._cropOperation.set({
	          start: new _libMathVector22['default'](0, 0),
	          end: new _libMathVector22['default'](1, 1)
	        });
	      }

	      this._initialDegrees = this._operation.getDegrees();

	      var listItems = this._controls.querySelectorAll('li');
	      this._listItems = Array.prototype.slice.call(listItems);

	      var _loop = function (i) {
	        var listItem = _this._listItems[i];
	        listItem.addEventListener('click', function () {
	          _this._onListItemClick(listItem);
	        });
	      };

	      // Listen to click events
	      for (var i = 0; i < this._listItems.length; i++) {
	        _loop(i);
	      }

	      // Find the div areas that affect the displayed crop size
	      var prefix = '.imglykit-canvas-crop';
	      this._cropAreas = {
	        topLeft: this._canvasControls.querySelector('' + prefix + '-top-left'),
	        topCenter: this._canvasControls.querySelector('' + prefix + '-top-center'),
	        centerLeft: this._canvasControls.querySelector('' + prefix + '-center-left'),
	        centerCenter: this._canvasControls.querySelector('' + prefix + '-center-center')
	      };

	      // Resume the rendering
	      this._ui.canvas.render().then(function () {
	        _this._showCropContainer();
	        _this._updateCropDOM();
	      });
	    }
	  }, {
	    key: '_showCropContainer',

	    /**
	     * Shows the crop container which is hidden initially to avoid flickering
	     * when resizing after the rendering
	     * @private
	     */
	    value: function _showCropContainer() {
	      var container = this._canvasControls.querySelector('.imglykit-canvas-crop-container');
	      container.classList.remove('imglykit-canvas-crop-container-hidden');
	    }
	  }, {
	    key: '_onListItemClick',

	    /**
	     * Gets called when the given item has been clicked
	     * @param {DOMObject} item
	     * @private
	     */
	    value: function _onListItemClick(item) {
	      var _this2 = this;

	      var degrees = item.dataset.degrees;

	      degrees = parseInt(degrees, 10);

	      var currentDegrees = this._operation.getDegrees();
	      this._operation.setDegrees(currentDegrees + degrees);
	      this._ui.canvas.zoomToFit().then(function () {
	        _this2._updateCropDOM();
	      });
	    }
	  }, {
	    key: 'onZoom',

	    /**
	     * Gets called when the zoom level has been changed while
	     * this control is active
	     */
	    value: function onZoom() {
	      this._updateCropDOM();
	    }
	  }, {
	    key: '_updateCropDOM',

	    /**
	     * Updates the cropping divs for the current operation settings
	     * @private
	     */
	    value: function _updateCropDOM() {
	      var start = undefined,
	          end = undefined;
	      if (this._cropOperation) {
	        start = this._initialStart.clone();
	        end = this._initialEnd.clone();
	      } else {
	        start = new _libMathVector22['default'](0, 0);
	        end = new _libMathVector22['default'](1, 1);
	      }

	      var canvasSize = this._ui.canvas.size;

	      var startAbsolute = start.multiply(canvasSize);
	      var endAbsolute = end.multiply(canvasSize);
	      var size = endAbsolute.clone().subtract(startAbsolute);

	      var top = Math.max(1, startAbsolute.y);
	      var left = Math.max(1, startAbsolute.x);
	      var width = Math.max(1, size.x);
	      var height = Math.max(1, size.y);

	      // widths are defined by top left and top center areas
	      this._cropAreas.topLeft.style.width = '' + left + 'px';
	      this._cropAreas.topCenter.style.width = '' + width + 'px';

	      // heights are defined by top left and center left areas
	      this._cropAreas.topLeft.style.height = '' + top + 'px';
	      this._cropAreas.centerLeft.style.height = '' + height + 'px';
	    }
	  }, {
	    key: '_onBack',

	    /**
	     * Gets called when the back button has been clicked
	     * @override
	     */
	    value: function _onBack() {
	      var currentDegrees = this._operation.getDegrees();
	      if (this._initialDegrees !== currentDegrees) {
	        this._ui.addHistory(this._operation, {
	          degrees: this._initialDegrees
	        }, this._operationExistedBefore);
	      }

	      if (currentDegrees === 0) {
	        this._ui.removeOperation('rotation');
	      }

	      if (this._cropOperation) {
	        this._cropOperation.set({
	          start: this._initialStart,
	          end: this._initialEnd
	        });
	      }
	      this._ui.canvas.render();
	    }
	  }]);

	  return RotationControl;
	})(_control2['default']);

	/**
	 * A unique string that identifies this control.
	 * @type {String}
	 */
	RotationControl.prototype.identifier = 'rotation';

	exports['default'] = RotationControl;
	module.exports = exports['default'];

/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _control = __webpack_require__(92);

	var _control2 = _interopRequireDefault(_control);



	var FlipControl = (function (_Control) {
	  function FlipControl() {
	    _classCallCheck(this, FlipControl);

	    if (_Control != null) {
	      _Control.apply(this, arguments);
	    }
	  }

	  _inherits(FlipControl, _Control);

	  _createClass(FlipControl, [{
	    key: 'init',

	    /**
	     * Entry point for this control
	     */
	    value: function init() {
	      var controlsTemplate = "{{##def.control:\n  <div>\n    <ul class=\"imglykit-controls-list imgly-controls-list-with-buttons\">\n      <li data-direction=\"horizontal\">\n        <img src=\"{{=it.helpers.assetPath('ui/night/flip/horizontal.png')}}\" />\n      </li>\n      <li data-direction=\"vertical\">\n        <img src=\"{{=it.helpers.assetPath('ui/night/flip/vertical.png')}}\" />\n      </li>\n    </ul>\n  </div>\n#}}\n";
	      this._controlsTemplate = controlsTemplate;
	    }
	  }, {
	    key: '_onEnter',

	    /**
	     * Gets called when this control is activated
	     */
	    value: function _onEnter() {
	      var _this = this;

	      this._operationExistedBefore = !!this._ui.operations.flip;
	      this._operation = this._ui.getOrCreateOperation('flip');

	      this._initialHorizontal = this._operation.getHorizontal();
	      this._initialVertical = this._operation.getVertical();

	      var listItems = this._controls.querySelectorAll('li');
	      this._listItems = Array.prototype.slice.call(listItems);

	      var _loop = function (i) {
	        var listItem = _this._listItems[i];
	        listItem.addEventListener('click', function () {
	          _this._onListItemClick(listItem);
	        });

	        var direction = listItem.dataset.direction;

	        if (direction === 'horizontal' && _this._operation.getHorizontal()) {
	          _this._toggleItem(listItem, true);
	        } else if (direction === 'vertical' && _this._operation.getVertical()) {
	          _this._toggleItem(listItem, true);
	        }
	      };

	      // Listen to click events
	      for (var i = 0; i < this._listItems.length; i++) {
	        _loop(i);
	      }
	    }
	  }, {
	    key: '_onListItemClick',

	    /**
	     * Gets called when the user clicked a list item
	     * @private
	     */
	    value: function _onListItemClick(item) {
	      var direction = item.dataset.direction;

	      var active = false;

	      if (direction === 'horizontal') {
	        var currentHorizontal = this._operation.getHorizontal();
	        this._operation.setHorizontal(!currentHorizontal);
	        this._ui.canvas.render();
	        active = !currentHorizontal;
	      } else if (direction === 'vertical') {
	        var currentVertical = this._operation.getVertical();
	        this._operation.setVertical(!currentVertical);
	        this._ui.canvas.render();
	        active = !currentVertical;
	      }

	      this._toggleItem(item, active);
	    }
	  }, {
	    key: '_toggleItem',

	    /**
	     * Toggles the active state of the given item
	     * @param {DOMElement} item
	     * @param {Boolean} active
	     * @private
	     */
	    value: function _toggleItem(item, active) {
	      var activeClass = 'imglykit-controls-item-active';
	      if (active) {
	        item.classList.add(activeClass);
	      } else {
	        item.classList.remove(activeClass);
	      }
	    }
	  }, {
	    key: '_onBack',

	    /**
	     * Gets called when the back button has been clicked
	     * @override
	     */
	    value: function _onBack() {
	      var currentVertical = this._operation.getVertical();
	      var currentHorizontal = this._operation.getHorizontal();

	      if (this._initialVertical !== currentVertical || this._initialHorizontal !== currentHorizontal) {
	        this._ui.addHistory(this._operation, {
	          vertical: this._initialVertical,
	          horizontal: this._initialHorizontal
	        }, this._operationExistedBefore);
	      }

	      if (!currentVertical && !currentHorizontal) {
	        this._ui.removeOperation('flip');
	      }

	      this._ui.canvas.render();
	    }
	  }]);

	  return FlipControl;
	})(_control2['default']);

	/**
	 * A unique string that identifies this control.
	 * @type {String}
	 */
	FlipControl.prototype.identifier = 'flip';

	exports['default'] = FlipControl;
	module.exports = exports['default'];

/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _control = __webpack_require__(92);

	var _control2 = _interopRequireDefault(_control);

	var _libSlider = __webpack_require__(99);

	var _libSlider2 = _interopRequireDefault(_libSlider);



	var BrightnessControl = (function (_Control) {
	  function BrightnessControl() {
	    _classCallCheck(this, BrightnessControl);

	    if (_Control != null) {
	      _Control.apply(this, arguments);
	    }
	  }

	  _inherits(BrightnessControl, _Control);

	  _createClass(BrightnessControl, [{
	    key: 'init',

	    /**
	     * The entry point for this control
	     */
	    value: function init() {
	      var controlsTemplate = "{{##def.control:\n  <div>\n    {{#def.slider}}\n  </div>\n#}}\n";
	      this._controlsTemplate = controlsTemplate;
	      this._partialTemplates.push(_libSlider2['default'].template);
	    }
	  }, {
	    key: '_onEnter',

	    /**
	     * Gets called when this control is activated
	     * @override
	     */
	    value: function _onEnter() {
	      this._operationExistedBefore = !!this._ui.operations.brightness;
	      this._operation = this._ui.getOrCreateOperation('brightness');

	      // Initially set value
	      var brightness = this._operation.getBrightness();
	      this._initialBrightness = brightness;

	      var sliderElement = this._controls.querySelector('.imglykit-slider');
	      this._slider = new _libSlider2['default'](sliderElement, {
	        minValue: -1,
	        maxValue: 1,
	        defaultValue: brightness
	      });
	      this._slider.on('update', this._onUpdate.bind(this));
	      this._slider.setValue(this._initialBrightness);
	    }
	  }, {
	    key: '_onBack',

	    /**
	     * Gets called when the back button has been clicked
	     * @override
	     */
	    value: function _onBack() {
	      var currentBrightness = this._operation.getBrightness();

	      if (this._initialBrightness !== currentBrightness) {
	        this._ui.addHistory(this._operation, {
	          brightness: this._initialBrightness
	        }, this._operationExistedBefore);
	      }

	      if (currentBrightness === 1) {
	        this._ui.removeOperation('brightness');
	      }

	      this._ui.canvas.render();
	    }
	  }, {
	    key: '_onUpdate',

	    /**
	     * Gets called when the value has been updated
	     * @override
	     */
	    value: function _onUpdate(value) {
	      this._operation.setBrightness(value);
	      this._ui.canvas.render();
	    }
	  }]);

	  return BrightnessControl;
	})(_control2['default']);

	/**
	 * A unique string that identifies this control.
	 * @type {String}
	 */
	BrightnessControl.prototype.identifier = 'brightness';

	exports['default'] = BrightnessControl;
	module.exports = exports['default'];

/***/ },
/* 84 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _control = __webpack_require__(92);

	var _control2 = _interopRequireDefault(_control);

	var _libSlider = __webpack_require__(99);

	var _libSlider2 = _interopRequireDefault(_libSlider);



	var ContrastControl = (function (_Control) {
	  function ContrastControl() {
	    _classCallCheck(this, ContrastControl);

	    if (_Control != null) {
	      _Control.apply(this, arguments);
	    }
	  }

	  _inherits(ContrastControl, _Control);

	  _createClass(ContrastControl, [{
	    key: 'init',

	    /**
	     * Entry point for this control
	     */
	    value: function init() {
	      var controlsTemplate = "{{##def.control:\n  <div>\n    {{#def.slider}}\n  </div>\n#}}\n";
	      this._controlsTemplate = controlsTemplate;
	      this._partialTemplates.push(_libSlider2['default'].template);
	    }
	  }, {
	    key: '_onEnter',

	    /**
	     * Gets called when this control is activated
	     * @override
	     */
	    value: function _onEnter() {
	      this._operationExistedBefore = !!this._ui.operations.contrast;
	      this._operation = this._ui.getOrCreateOperation('contrast');

	      // Initially set value
	      var contrast = this._operation.getContrast();
	      this._initialContrast = contrast;

	      var sliderElement = this._controls.querySelector('.imglykit-slider');
	      this._slider = new _libSlider2['default'](sliderElement, {
	        minValue: 0,
	        maxValue: 2,
	        defaultValue: contrast
	      });
	      this._slider.on('update', this._onUpdate.bind(this));
	      this._slider.setValue(this._initialContrast);
	    }
	  }, {
	    key: '_onBack',

	    /**
	     * Gets called when the back button has been clicked
	     * @override
	     */
	    value: function _onBack() {
	      var currentContrast = this._operation.getContrast();

	      if (this._initialContrast !== currentContrast) {
	        this._ui.addHistory(this._operation, {
	          contrast: this._initialContrast
	        }, this._operationExistedBefore);
	      }

	      if (currentContrast === 1) {
	        this._ui.removeOperation('contrast');
	      }

	      this._ui.canvas.render();
	    }
	  }, {
	    key: '_onUpdate',

	    /**
	     * Gets called when the value has been updated
	     * @override
	     */
	    value: function _onUpdate(value) {
	      this._operation.setContrast(value);
	      this._ui.canvas.render();
	    }
	  }]);

	  return ContrastControl;
	})(_control2['default']);

	/**
	 * A unique string that identifies this control.
	 * @type {String}
	 */
	ContrastControl.prototype.identifier = 'contrast';

	exports['default'] = ContrastControl;
	module.exports = exports['default'];

/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _libSlider = __webpack_require__(99);

	var _libSlider2 = _interopRequireDefault(_libSlider);

	var _control = __webpack_require__(92);

	var _control2 = _interopRequireDefault(_control);



	var SaturationControl = (function (_Control) {
	  function SaturationControl() {
	    _classCallCheck(this, SaturationControl);

	    if (_Control != null) {
	      _Control.apply(this, arguments);
	    }
	  }

	  _inherits(SaturationControl, _Control);

	  _createClass(SaturationControl, [{
	    key: 'init',

	    /**
	     * Entry point for this control
	     */
	    value: function init() {
	      var controlsTemplate = "{{##def.control:\n  <div>\n    {{#def.slider}}\n  </div>\n#}}\n";
	      this._controlsTemplate = controlsTemplate;
	      this._partialTemplates.push(_libSlider2['default'].template);
	    }
	  }, {
	    key: '_onEnter',

	    /**
	     * Gets called when this control is activated
	     * @override
	     */
	    value: function _onEnter() {
	      _get(Object.getPrototypeOf(SaturationControl.prototype), '_onEnter', this).call(this);

	      this._operationExistedBefore = !!this._ui.operations.saturation;
	      this._operation = this._ui.getOrCreateOperation('saturation');

	      // Initially set value
	      var saturation = this._operation.getSaturation();
	      this._initialSaturation = saturation;

	      var sliderElement = this._controls.querySelector('.imglykit-slider');
	      this._slider = new _libSlider2['default'](sliderElement, {
	        minValue: 0,
	        maxValue: 2,
	        defaultValue: saturation
	      });
	      this._slider.on('update', this._onUpdate.bind(this));
	      this._slider.setValue(this._initialSaturation);
	    }
	  }, {
	    key: '_onBack',

	    /**
	     * Gets called when the back button has been clicked
	     * @override
	     */
	    value: function _onBack() {
	      var currentSaturation = this._operation.getSaturation();

	      if (this._initialSaturation !== currentSaturation) {
	        this._ui.addHistory(this._operation, {
	          saturation: this._initialSaturation
	        }, this._operationExistedBefore);
	      }

	      if (currentSaturation === 1) {
	        this._ui.removeOperation('saturation');
	      }

	      this._ui.canvas.render();
	    }
	  }, {
	    key: '_onUpdate',

	    /**
	     * Gets called when the value has been updated
	     * @override
	     */
	    value: function _onUpdate(value) {
	      this._operation.setSaturation(value);
	      this._ui.canvas.render();
	    }
	  }]);

	  return SaturationControl;
	})(_control2['default']);

	/**
	 * A unique string that identifies this control.
	 * @type {String}
	 */
	SaturationControl.prototype.identifier = 'saturation';

	exports['default'] = SaturationControl;
	module.exports = exports['default'];

/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _control = __webpack_require__(92);

	var _control2 = _interopRequireDefault(_control);

	var _libMathVector2 = __webpack_require__(50);

	var _libMathVector22 = _interopRequireDefault(_libMathVector2);

	var _libUtils = __webpack_require__(6);

	var _libUtils2 = _interopRequireDefault(_libUtils);



	var CropControl = (function (_Control) {
	  function CropControl() {
	    _classCallCheck(this, CropControl);

	    if (_Control != null) {
	      _Control.apply(this, arguments);
	    }
	  }

	  _inherits(CropControl, _Control);

	  _createClass(CropControl, [{
	    key: 'init',

	    /**
	     * Entry point for this control
	     */
	    value: function init() {
	      this._availableRatios = {};
	      this._ratios = {};

	      var controlsTemplate = "{{##def.control:\n  <div>\n    <ul class=\"imglykit-controls-list imgly-controls-list-with-buttons\">\n      {{ for(var identifier in it.ratios) { }}\n        {{ var ratio = it.ratios[identifier]; }}\n        {{ var enabled = ratio.selected; }}\n        <li data-identifier=\"{{= identifier}}\" data-ratio=\"{{= ratio.ratio}}\"{{? enabled}} data-selected{{?}}>\n          <img src=\"{{=it.helpers.assetPath('ui/night/crop/' + identifier + '.png')}}\" />\n        </li>\n      {{ } }}\n    </ul>\n  </div>\n\n  {{#def.doneButton}}\n#}}\n";
	      this._controlsTemplate = controlsTemplate;

	      var canvasControlsTemplate = "<div class=\"imglykit-canvas-crop-container\">\n  <div class=\"imglykit-canvas-crop-top\">\n    <div class=\"imglykit-canvas-crop-top-left\"></div>\n    <div class=\"imglykit-canvas-crop-top-center\"></div>\n    <div class=\"imglykit-canvas-crop-top-right\"></div>\n  </div>\n\n  <div class=\"imglykit-canvas-crop-center\">\n    <div class=\"imglykit-canvas-crop-center-left\"></div>\n    <div class=\"imglykit-canvas-crop-center-center\">\n      <div class=\"imglykit-canvas-crop-knobs\">\n        <div data-corner=\"top-left\"></div>\n        <div data-corner=\"top-right\"></div>\n        <div data-corner=\"bottom-left\"></div>\n        <div data-corner=\"bottom-right\"></div>\n      </div>\n    </div>\n    <div class=\"imglykit-canvas-crop-center-right\"></div>\n  </div>\n\n  <div class=\"imglykit-canvas-crop-bottom\">\n    <div class=\"imglykit-canvas-crop-bottom-left\"></div>\n    <div class=\"imglykit-canvas-crop-bottom-center\"></div>\n    <div class=\"imglykit-canvas-crop-bottom-right\"></div>\n  </div>\n</div>\n";
	      this._canvasControlsTemplate = canvasControlsTemplate;

	      // Mouse event callbacks bound to the class context
	      this._onKnobDown = this._onKnobDown.bind(this);
	      this._onKnobDrag = this._onKnobDrag.bind(this);
	      this._onKnobUp = this._onKnobUp.bind(this);
	      this._onCenterDown = this._onCenterDown.bind(this);
	      this._onCenterDrag = this._onCenterDrag.bind(this);
	      this._onCenterUp = this._onCenterUp.bind(this);

	      this._addDefaultRatios();

	      // Select all ratios per default
	      this.selectRatios(null);
	    }
	  }, {
	    key: 'selectRatios',

	    /**
	     * Selects the ratios
	     * @param {Selector} selector
	     */
	    value: function selectRatios(selector) {
	      this._ratios = {};

	      var ratioIdentifiers = Object.keys(this._availableRatios);

	      var selectedRatios = _libUtils2['default'].select(ratioIdentifiers, selector);
	      for (var i = 0; i < selectedRatios.length; i++) {
	        var identifier = selectedRatios[i];
	        this._ratios[identifier] = this._availableRatios[identifier];
	      }

	      if (this._active) {
	        this._renderControls();
	      }
	    }
	  }, {
	    key: '_addDefaultRatios',

	    /**
	     * Adds the default ratios
	     * @private
	     */
	    value: function _addDefaultRatios() {
	      this.addRatio('custom', '*', true);
	      this.addRatio('square', '1');
	      this.addRatio('4-3', '1.33');
	      this.addRatio('16-9', '1.77');
	    }
	  }, {
	    key: 'addRatio',

	    /**
	     * Adds a ratio with the given identifier
	     * @param {String} identifier
	     * @param {Number} ratio
	     * @param {Boolean} selected
	     */
	    value: function addRatio(identifier, ratio, selected) {
	      this._availableRatios[identifier] = { ratio: ratio, selected: selected };
	    }
	  }, {
	    key: '_onEnter',

	    /**
	     * Gets called when this control is activated
	     * @override
	     */
	    value: function _onEnter() {
	      var _this = this;

	      _get(Object.getPrototypeOf(CropControl.prototype), '_onEnter', this).call(this);

	      this._operationExistedBefore = !!this._ui.operations.crop;
	      this._operation = this._ui.getOrCreateOperation('crop');

	      this._defaultStart = new _libMathVector22['default'](0.1, 0.1);
	      this._defaultEnd = new _libMathVector22['default'](0.9, 0.9);

	      this._initialOptions = {
	        start: this._operation.getStart(),
	        end: this._operation.getEnd()
	      };

	      this._start = this._initialOptions.start || this._defaultStart;
	      this._end = this._initialOptions.end || this._defaultEnd;

	      // Minimum size in pixels
	      this._minimumSize = new _libMathVector22['default'](50, 50);

	      this._initialZoomLevel = this._ui.canvas.zoomLevel;
	      this._ui.canvas.zoomToFit(false);

	      var prefix = '.imglykit-canvas-crop';
	      var container = this._canvasControls;
	      var knobsContainer = container.querySelector('' + prefix + '-knobs');

	      // Store initial settings for 'back' button
	      this._initialStart = this._operation.getStart().clone();
	      this._initialEnd = this._operation.getEnd().clone();

	      // Make sure we see the whole input image
	      this._operation.set({
	        start: new _libMathVector22['default'](0, 0),
	        end: new _libMathVector22['default'](1, 1)
	      });

	      // Find all 4 knobs
	      this._knobs = {
	        topLeft: knobsContainer.querySelector('[data-corner=top-left]'),
	        topRight: knobsContainer.querySelector('[data-corner=top-right]'),
	        bottomLeft: knobsContainer.querySelector('[data-corner=bottom-left]'),
	        bottomRight: knobsContainer.querySelector('[data-corner=bottom-right]')
	      };

	      // Find the div areas that affect the displayed crop size
	      this._areas = {
	        topLeft: this._canvasControls.querySelector('' + prefix + '-top-left'),
	        topCenter: this._canvasControls.querySelector('' + prefix + '-top-center'),
	        centerLeft: this._canvasControls.querySelector('' + prefix + '-center-left'),
	        centerCenter: this._canvasControls.querySelector('' + prefix + '-center-center')
	      };

	      this._handleControls();
	      this._handleKnobs();
	      this._handleCenter();

	      // Resume the rendering
	      this._ui.canvas.render().then(function () {
	        _this._updateDOM();
	      });
	    }
	  }, {
	    key: '_handleControls',

	    /**
	     * Handles the ratio controls
	     * @private
	     */
	    value: function _handleControls() {
	      var _this2 = this;

	      var listItems = this._controls.querySelectorAll('ul > li');
	      this._ratioItems = Array.prototype.slice.call(listItems);

	      var _loop = function (i) {
	        var item = _this2._ratioItems[i];
	        var _item$dataset = item.dataset;
	        var selected = _item$dataset.selected;
	        var ratio = _item$dataset.ratio;
	        var identifier = _item$dataset.identifier;

	        if (typeof selected !== 'undefined' && !_this2._operationExistedBefore) {
	          _this2._setRatio(identifier, ratio, false);
	          _this2._selectRatio(item);
	        }

	        item.addEventListener('click', function (e) {
	          e.preventDefault();
	          _this2._onRatioClick(item);
	        });
	      };

	      for (var i = 0; i < this._ratioItems.length; i++) {
	        _loop(i);
	      }
	    }
	  }, {
	    key: '_onRatioClick',

	    /**
	     * Gets called when the given ratio has been selected
	     * @param {DOMElement} item
	     * @private
	     */
	    value: function _onRatioClick(item) {
	      this._unselectAllRatios();
	      this._selectRatio(item);
	    }
	  }, {
	    key: '_unselectAllRatios',

	    /**
	     * Unselects all ratio control items
	     * @private
	     */
	    value: function _unselectAllRatios() {
	      for (var i = 0; i < this._ratioItems.length; i++) {
	        var item = this._ratioItems[i];
	        item.classList.remove('imglykit-controls-item-active');
	      }
	    }
	  }, {
	    key: '_selectRatio',

	    /**
	     * Activates the given ratio control item
	     * @param {DOMElement} item
	     * @private
	     */
	    value: function _selectRatio(item) {
	      item.classList.add('imglykit-controls-item-active');
	      var _item$dataset2 = item.dataset;
	      var ratio = _item$dataset2.ratio;
	      var identifier = _item$dataset2.identifier;

	      this._setRatio(identifier, ratio);
	    }
	  }, {
	    key: '_setRatio',

	    /**
	     * Sets the given ratio
	     * @param {String} identifier
	     * @param {String} ratio
	     * @param {Boolean} resize
	     * @private
	     */
	    value: function _setRatio(identifier, ratio) {
	      var resize = arguments[2] === undefined ? true : arguments[2];

	      var canvasSize = this._ui.canvas.size;
	      this._selectedRatio = identifier;

	      if (ratio === '*') {
	        this._ratio = null;
	        this._start = new _libMathVector22['default'](0.1, 0.1);
	        this._end = new _libMathVector22['default'](0.9, 0.9);
	      } else {
	        if (ratio === 'original') {
	          this._ratio = canvasSize.x / canvasSize.y;
	        } else {
	          ratio = parseFloat(ratio);
	          this._ratio = ratio;
	        }

	        if (resize) {
	          if (canvasSize.x / canvasSize.y <= this._ratio) {
	            this._start.x = 0.1;
	            this._end.x = 0.9;
	            var height = 1 / canvasSize.y * (canvasSize.x / this._ratio * 0.8);
	            this._start.y = (1 - height) / 2;
	            this._end.y = 1 - this._start.y;
	          } else {
	            this._start.y = 0.1;
	            this._end.y = 0.9;
	            var width = 1 / canvasSize.x * (this._ratio * canvasSize.y * 0.8);
	            this._start.x = (1 - width) / 2;
	            this._end.x = 1 - this._start.x;
	          }
	        }
	      }

	      this._updateDOM();
	    }
	  }, {
	    key: '_updateDOM',

	    /**
	     * Updates the cropping divs for the current operation settings
	     * @private
	     */
	    value: function _updateDOM() {
	      var canvasSize = this._ui.canvas.size;
	      var startAbsolute = this._start.clone().multiply(canvasSize);
	      var endAbsolute = this._end.clone().multiply(canvasSize);
	      var size = endAbsolute.clone().subtract(startAbsolute);

	      var top = Math.max(1, startAbsolute.y);
	      var left = Math.max(1, startAbsolute.x);
	      var width = Math.max(1, size.x);
	      var height = Math.max(1, size.y);

	      // widths are defined by top left and top center areas
	      this._areas.topLeft.style.width = '' + left + 'px';
	      this._areas.topCenter.style.width = '' + width + 'px';

	      // heights are defined by top left and center left areas
	      this._areas.topLeft.style.height = '' + top + 'px';
	      this._areas.centerLeft.style.height = '' + height + 'px';
	    }
	  }, {
	    key: '_handleKnobs',

	    /**
	     * Handles the knob dragging
	     * @private
	     */
	    value: function _handleKnobs() {
	      var _this3 = this;

	      var _loop2 = function (identifier) {
	        var knob = _this3._knobs[identifier];
	        knob.addEventListener('mousedown', function (e) {
	          _this3._onKnobDown(e, knob);
	        });
	        knob.addEventListener('touchstart', function (e) {
	          _this3._onKnobDown(e, knob);
	        });
	      };

	      for (var identifier in this._knobs) {
	        _loop2(identifier);
	      }
	    }
	  }, {
	    key: '_onKnobDown',

	    /**
	     * Gets called when the user presses a knob
	     * @param {Event} e
	     * @param {DOMElement} knob
	     * @private
	     */
	    value: function _onKnobDown(e, knob) {
	      e.preventDefault();
	      e.stopPropagation();

	      this._currentKnob = knob;
	      this._initialMousePosition = _libUtils2['default'].getEventPosition(e);

	      // Remember the current values
	      this._startBeforeDrag = this._start.clone();
	      this._endBeforeDrag = this._end.clone();

	      document.addEventListener('mousemove', this._onKnobDrag);
	      document.addEventListener('touchmove', this._onKnobDrag);
	      document.addEventListener('mouseup', this._onKnobUp);
	      document.addEventListener('touchend', this._onKnobUp);
	    }
	  }, {
	    key: '_onKnobDrag',

	    /**
	     * Gets called whe the user drags a knob
	     * @param {Event} e
	     * @private
	     */
	    value: function _onKnobDrag(e) {
	      e.preventDefault();

	      var mousePosition = _libUtils2['default'].getEventPosition(e);
	      var mouseDiff = mousePosition.subtract(this._initialMousePosition);
	      var corner = this._currentKnob.dataset.corner;
	      var canvasSize = this._ui.canvas.size;

	      var absoluteStart = this._startBeforeDrag.clone().multiply(canvasSize);
	      var absoluteEnd = this._endBeforeDrag.clone().multiply(canvasSize);

	      var width = undefined,
	          height = undefined,
	          maximum = undefined,
	          minimum = undefined;

	      switch (corner) {
	        case 'top-left':
	          absoluteStart.add(mouseDiff);
	          maximum = absoluteEnd.clone().subtract(this._minimumSize);
	          absoluteStart.clamp(null, maximum);
	          break;
	        case 'top-right':
	          absoluteEnd.x += mouseDiff.x;
	          absoluteStart.y += mouseDiff.y;
	          absoluteEnd.x = Math.max(absoluteStart.x + this._minimumSize.x, absoluteEnd.x);
	          absoluteStart.y = Math.min(absoluteEnd.y - this._minimumSize.y, absoluteStart.y);
	          break;
	        case 'bottom-right':
	          absoluteEnd.add(mouseDiff);
	          minimum = absoluteStart.clone().add(this._minimumSize);
	          absoluteEnd.clamp(minimum);
	          break;
	        case 'bottom-left':
	          absoluteStart.x += mouseDiff.x;
	          absoluteEnd.y += mouseDiff.y;
	          absoluteStart.x = Math.min(absoluteEnd.x - this._minimumSize.x, absoluteStart.x);
	          absoluteEnd.y = Math.max(absoluteStart.y + this._minimumSize.y, absoluteEnd.y);
	          break;
	      }

	      this._start.copy(absoluteStart).divide(canvasSize);
	      this._end.copy(absoluteEnd).divide(canvasSize);

	      this._start.clamp(0, 1);
	      this._end.clamp(0, 1);

	      /**
	       * Calculate boundaries
	       */
	      if (this._ratio !== null) {
	        switch (corner) {
	          case 'top-left':
	            width = (this._end.x - this._start.x) * canvasSize.x;
	            height = width / this._ratio;
	            this._start.y = this._end.y - height / canvasSize.y;

	            if (this._start.y <= 0) {
	              this._start.y = 0;
	              height = (this._end.y - this._start.y) * canvasSize.y;
	              width = height * this._ratio;
	              this._start.x = this._end.x - width / canvasSize.x;
	            }
	            break;
	          case 'top-right':
	            width = (this._end.x - this._start.x) * canvasSize.x;
	            height = width / this._ratio;
	            this._start.y = this._end.y - height / canvasSize.y;

	            if (this._start.y <= 0) {
	              this._start.y = 0;
	              height = (this._end.y - this._start.y) * canvasSize.y;
	              width = height * this._ratio;
	              this._end.x = this._start.x + width / canvasSize.x;
	            }
	            break;
	          case 'bottom-right':
	            width = (this._end.x - this._start.x) * canvasSize.x;
	            height = width / this._ratio;
	            this._end.y = this._start.y + height / canvasSize.y;

	            // If boundaries are exceeded, calculate width by maximum height
	            if (this._end.y >= 1) {
	              this._end.y = 1;
	              height = (this._end.y - this._start.y) * canvasSize.y;
	              width = height * this._ratio;
	              this._end.x = this._start.x + width / canvasSize.x;
	            }
	            break;
	          case 'bottom-left':
	            width = (this._end.x - this._start.x) * canvasSize.x;
	            height = width / this._ratio;
	            this._end.y = this._start.y + height / canvasSize.y;

	            if (this._end.y >= 1) {
	              this._end.y = 1;
	              height = (this._end.y - this._start.y) * canvasSize.y;
	              width = height * this._ratio;
	              this._start.x = this._end.x - width / canvasSize.x;
	            }
	            break;
	        }
	      }

	      this._updateDOM();
	    }
	  }, {
	    key: '_onKnobUp',

	    /**
	     * Gets called whe the user releases a knob
	     * @param {Event} e
	     * @private
	     */
	    value: function _onKnobUp() {
	      this._currentKnob = null;
	      document.removeEventListener('mousemove', this._onKnobDrag);
	      document.removeEventListener('touchmove', this._onKnobDrag);
	      document.removeEventListener('mouseup', this._onKnobUp);
	      document.removeEventListener('touchend', this._onKnobUp);
	    }
	  }, {
	    key: '_handleCenter',

	    /**
	     * Handles the center dragging
	     * @private
	     */
	    value: function _handleCenter() {
	      this._areas.centerCenter.addEventListener('mousedown', this._onCenterDown);
	      this._areas.centerCenter.addEventListener('touchstart', this._onCenterDown);
	    }
	  }, {
	    key: '_onCenterDown',

	    /**
	     * Gets called when the user presses the center area
	     * @param {Event} e
	     * @private
	     */
	    value: function _onCenterDown(e) {
	      this._initialMousePosition = _libUtils2['default'].getEventPosition(e);

	      // Remember the current values
	      this._startBeforeDrag = this._start.clone();
	      this._endBeforeDrag = this._end.clone();

	      document.addEventListener('mousemove', this._onCenterDrag);
	      document.addEventListener('touchmove', this._onCenterDrag);
	      document.addEventListener('mouseup', this._onCenterUp);
	      document.addEventListener('touchend', this._onCenterUp);
	    }
	  }, {
	    key: '_onCenterDrag',

	    /**
	     * Gets called when the user presses the center area and moves his mouse
	     * @param {Event} e
	     * @private
	     */
	    value: function _onCenterDrag(e) {
	      var mousePosition = _libUtils2['default'].getEventPosition(e);
	      var mouseDiff = mousePosition.subtract(this._initialMousePosition);
	      var canvasSize = this._ui.canvas.size;

	      // Get the crop size
	      var cropSize = this._endBeforeDrag.clone().subtract(this._startBeforeDrag);
	      var absoluteCropSize = cropSize.clone().multiply(canvasSize);

	      // Get the absolute initial values
	      var absoluteStart = this._startBeforeDrag.clone().multiply(canvasSize);
	      var absoluteEnd = this._endBeforeDrag.clone().multiply(canvasSize);

	      // Add the mouse position difference
	      absoluteStart.add(mouseDiff);

	      // Clamp the value
	      var maxStart = canvasSize.clone().subtract(absoluteCropSize);
	      absoluteStart.clamp(new _libMathVector22['default'](0, 0), maxStart);

	      // End position does not change (relative to start)
	      absoluteEnd.copy(absoluteStart).add(absoluteCropSize);

	      // Set the final values
	      this._start.copy(absoluteStart).divide(canvasSize);
	      this._end.copy(absoluteEnd).divide(canvasSize);

	      this._updateDOM();
	    }
	  }, {
	    key: '_onCenterUp',

	    /**
	     * Gets called when the user releases the center area
	     * @param {Event} e
	     * @private
	     */
	    value: function _onCenterUp() {
	      document.removeEventListener('mousemove', this._onCenterDrag);
	      document.removeEventListener('touchmove', this._onCenterDrag);
	      document.removeEventListener('mouseup', this._onCenterUp);
	      document.removeEventListener('touchend', this._onCenterUp);
	    }
	  }, {
	    key: '_onBack',

	    /**
	     * Gets called when the back button has been clicked
	     * @override
	     */
	    value: function _onBack() {
	      this._ui.canvas.setZoomLevel(this._initialZoomLevel, false);

	      if (this._operationExistedBefore) {
	        this._operation.set({
	          start: this._initialStart,
	          end: this._initialEnd
	        });
	      } else {
	        this._ui.removeOperation('crop');
	      }
	      this._ui.canvas.render();
	    }
	  }, {
	    key: '_onDone',

	    /**
	     * Gets called when the done button has been clicked
	     * @protected
	     */
	    value: function _onDone() {
	      this._operation.set({
	        start: this._start,
	        end: this._end
	      });
	      this._ui.canvas.zoomToFit(true);

	      this._ui.addHistory(this._operation, {
	        start: this._initialStart.clone(),
	        end: this._initialEnd.clone()
	      }, this._operationExistedBefore);
	    }
	  }, {
	    key: 'context',

	    /**
	     * The data that is available to the template
	     * @type {Object}
	     * @override
	     */
	    get: function () {
	      var context = _get(Object.getPrototypeOf(CropControl.prototype), 'context', this);
	      context.ratios = this._ratios;
	      return context;
	    }
	  }, {
	    key: 'selectedRatio',

	    /**
	     * The selected ratio identifier
	     * @type {String}
	     */
	    get: function () {
	      return this._selectedRatio;
	    }
	  }]);

	  return CropControl;
	})(_control2['default']);

	/**
	 * A unique string that identifies this control.
	 * @type {String}
	 */
	CropControl.prototype.identifier = 'crop';

	exports['default'] = CropControl;
	module.exports = exports['default'];

/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _control = __webpack_require__(92);

	var _control2 = _interopRequireDefault(_control);

	var _libMathVector2 = __webpack_require__(50);

	var _libMathVector22 = _interopRequireDefault(_libMathVector2);

	var _libUtils = __webpack_require__(6);

	var _libUtils2 = _interopRequireDefault(_libUtils);

	var _libSimpleSlider = __webpack_require__(100);

	var _libSimpleSlider2 = _interopRequireDefault(_libSimpleSlider);



	var RadialBlurControl = (function (_Control) {
	  function RadialBlurControl() {
	    _classCallCheck(this, RadialBlurControl);

	    if (_Control != null) {
	      _Control.apply(this, arguments);
	    }
	  }

	  _inherits(RadialBlurControl, _Control);

	  _createClass(RadialBlurControl, [{
	    key: 'init',

	    /**
	     * Entry point for this control
	     */
	    value: function init() {
	      var controlsTemplate = "{{##def.control:\n  <div class=\"imglykit-controls-icon\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/blur/blur.png')}}\" />\n  </div>\n\n  <div>\n    {{var sliderId = \"imglykit-blur-radius-slider\";}}\n    {{#def.simpleSlider}}\n  </div>\n\n  {{#def.doneButton}}\n#}}\n";
	      this._controlsTemplate = controlsTemplate;

	      var canvasControlsTemplate = "<div class=\"imglykit-canvas-radial-blur-container\">\n  <div class=\"imglykit-canvas-radial-blur-dot\" id=\"imglykit-radial-blur-position\"></div>\n  <div class=\"imglykit-canvas-radial-blur-dot\" id=\"imglykit-radial-blur-gradient\"></div>\n  <div class=\"imglykit-canvas-radial-blur-circle-container\">\n    <div class=\"imglykit-canvas-radial-blur-circle\"></div>\n  </div>\n</div>\n";
	      this._canvasControlsTemplate = canvasControlsTemplate;

	      this._partialTemplates.push(_libSimpleSlider2['default'].template);
	    }
	  }, {
	    key: '_onEnter',

	    /**
	     * Gets called when this control is activated
	     * @override
	     */
	    value: function _onEnter() {
	      var _this = this;

	      this._operationExistedBefore = !!this._ui.operations['radial-blur'];
	      this._operation = this._ui.getOrCreateOperation('radial-blur');

	      // Remember initial identity state
	      this._initialSettings = {
	        position: this._operation.getPosition().clone(),
	        gradientRadius: this._operation.getGradientRadius(),
	        blurRadius: this._operation.getBlurRadius()
	      };

	      // Mouse event callbacks bound to the class context
	      this._onPositionKnobDown = this._onPositionKnobDown.bind(this);
	      this._onPositionKnobDrag = this._onPositionKnobDrag.bind(this);
	      this._onPositionKnobUp = this._onPositionKnobUp.bind(this);
	      this._onGradientKnobDown = this._onGradientKnobDown.bind(this);
	      this._onGradientKnobDrag = this._onGradientKnobDrag.bind(this);
	      this._onGradientKnobUp = this._onGradientKnobUp.bind(this);

	      this._positionKnob = this._canvasControls.querySelector('#imglykit-radial-blur-position');
	      this._gradientKnob = this._canvasControls.querySelector('#imglykit-radial-blur-gradient');
	      this._circle = this._canvasControls.querySelector('.imglykit-canvas-radial-blur-circle');
	      this._handleKnobs();
	      this._initSliders();

	      this._ui.canvas.render().then(function () {
	        _this._updateDOM();
	      });
	    }
	  }, {
	    key: '_initSliders',

	    /**
	     * Initializes the slider controls
	     * @private
	     */
	    value: function _initSliders() {
	      var blurRadiusSlider = this._controls.querySelector('#imglykit-blur-radius-slider');
	      this._blurRadiusSlider = new _libSimpleSlider2['default'](blurRadiusSlider, {
	        minValue: 0,
	        maxValue: 40
	      });
	      this._blurRadiusSlider.on('update', this._onBlurRadiusUpdate.bind(this));
	      this._blurRadiusSlider.setValue(this._initialSettings.blurRadius);
	    }
	  }, {
	    key: '_onBlurRadiusUpdate',

	    /**
	     * Gets called when the value of the blur radius slider has been updated
	     * @param {Number} value
	     * @private
	     */
	    value: function _onBlurRadiusUpdate(value) {
	      this._operation.setBlurRadius(value);
	      this._ui.canvas.render();
	      this._highlightDoneButton();
	    }
	  }, {
	    key: '_handleKnobs',

	    /**
	     * Handles the knob dragging
	     * @private
	     */
	    value: function _handleKnobs() {
	      // Initially set gradient knob position
	      var canvasSize = this._ui.canvas.size;
	      var position = this._operation.getPosition().clone().multiply(canvasSize);
	      this._gradientKnobPosition = position.clone().add(this._initialSettings.gradientRadius, 0);

	      this._positionKnob.addEventListener('mousedown', this._onPositionKnobDown);
	      this._positionKnob.addEventListener('touchstart', this._onPositionKnobDown);
	      this._gradientKnob.addEventListener('mousedown', this._onGradientKnobDown);
	      this._gradientKnob.addEventListener('touchstart', this._onGradientKnobDown);
	    }
	  }, {
	    key: '_onPositionKnobDown',

	    /**
	     * Gets called when the user starts dragging the position knob
	     * @param {Event} e
	     * @private
	     */
	    value: function _onPositionKnobDown(e) {
	      e.preventDefault();

	      var canvasSize = this._ui.canvas.size;

	      this._initialMousePosition = _libUtils2['default'].getEventPosition(e);
	      this._initialPosition = this._operation.getPosition().clone();
	      this._gradientKnobDistance = this._gradientKnobPosition.clone().subtract(this._initialPosition.clone().multiply(canvasSize));

	      document.addEventListener('mousemove', this._onPositionKnobDrag);
	      document.addEventListener('touchmove', this._onPositionKnobDrag);

	      document.addEventListener('mouseup', this._onPositionKnobUp);
	      document.addEventListener('touchend', this._onPositionKnobUp);
	    }
	  }, {
	    key: '_onPositionKnobDrag',

	    /**
	     * Gets called while the user starts drags the position knob
	     * @param {Event} e
	     * @private
	     */
	    value: function _onPositionKnobDrag(e) {
	      e.preventDefault();

	      var canvasSize = this._ui.canvas.size;
	      var mousePosition = _libUtils2['default'].getEventPosition(e);
	      var diff = mousePosition.subtract(this._initialMousePosition);

	      var newPosition = this._initialPosition.clone().multiply(canvasSize).add(diff);

	      var maxPosition = canvasSize.clone().subtract(this._gradientKnobDistance);
	      newPosition.clamp(new _libMathVector22['default'](0, 0), maxPosition);

	      this._gradientKnobPosition.copy(newPosition).add(this._gradientKnobDistance);

	      // Translate to 0...1
	      newPosition.divide(canvasSize);

	      this._operation.setPosition(newPosition);
	      this._updateDOM();
	      this._ui.canvas.render();
	    }
	  }, {
	    key: '_onPositionKnobUp',

	    /**
	     * Gets called when the user stops dragging the position knob
	     * @param {Event} e
	     * @private
	     */
	    value: function _onPositionKnobUp(e) {
	      e.preventDefault();

	      document.removeEventListener('mousemove', this._onPositionKnobDrag);
	      document.removeEventListener('touchmove', this._onPositionKnobDrag);

	      document.removeEventListener('mouseup', this._onPositionKnobUp);
	      document.removeEventListener('touchend', this._onPositionKnobUp);
	    }
	  }, {
	    key: '_onGradientKnobDown',

	    /**
	     * Gets called when the user starts dragging the position knob
	     * @param {Event} e
	     * @private
	     */
	    value: function _onGradientKnobDown(e) {
	      e.preventDefault();

	      this._initialMousePosition = _libUtils2['default'].getEventPosition(e);
	      this._initialGradientKnobPosition = this._gradientKnobPosition.clone();

	      document.addEventListener('mousemove', this._onGradientKnobDrag);
	      document.addEventListener('touchmove', this._onGradientKnobDrag);

	      document.addEventListener('mouseup', this._onGradientKnobUp);
	      document.addEventListener('touchend', this._onGradientKnobUp);
	    }
	  }, {
	    key: '_onGradientKnobDrag',

	    /**
	     * Gets called while the user starts drags the position knob
	     * @param {Event} e
	     * @private
	     */
	    value: function _onGradientKnobDrag(e) {
	      e.preventDefault();

	      var canvasSize = this._ui.canvas.size;
	      var mousePosition = _libUtils2['default'].getEventPosition(e);
	      var diff = mousePosition.subtract(this._initialMousePosition);

	      // Calculate new gradient knob position
	      this._gradientKnobPosition = this._initialGradientKnobPosition.clone().add(diff);
	      this._gradientKnobPosition.clamp(new _libMathVector22['default'](0, 0), canvasSize);

	      // Calculate distance to position
	      var position = this._operation.getPosition().clone().multiply(canvasSize);
	      var distance = this._gradientKnobPosition.clone().subtract(position);
	      var gradientRadius = Math.sqrt(Math.pow(distance.x, 2) + Math.pow(distance.y, 2));

	      // Update operation
	      this._operation.setGradientRadius(gradientRadius);
	      this._updateDOM();
	      this._ui.canvas.render();
	    }
	  }, {
	    key: '_onGradientKnobUp',

	    /**
	     * Gets called when the user stops dragging the position knob
	     * @param {Event} e
	     * @private
	     */
	    value: function _onGradientKnobUp(e) {
	      e.preventDefault();

	      document.removeEventListener('mousemove', this._onGradientKnobDrag);
	      document.removeEventListener('touchmove', this._onGradientKnobDrag);

	      document.removeEventListener('mouseup', this._onGradientKnobUp);
	      document.removeEventListener('touchend', this._onGradientKnobUp);
	    }
	  }, {
	    key: '_updateDOM',

	    /**
	     * Updates the knob
	     * @private
	     */
	    value: function _updateDOM() {
	      var canvasSize = this._ui.canvas.size;
	      var position = this._operation.getPosition().clone().multiply(canvasSize);

	      this._positionKnob.style.left = '' + position.x + 'px';
	      this._positionKnob.style.top = '' + position.y + 'px';

	      this._gradientKnob.style.left = '' + this._gradientKnobPosition.x + 'px';
	      this._gradientKnob.style.top = '' + this._gradientKnobPosition.y + 'px';

	      var circleSize = this._operation.getGradientRadius() * 2;
	      this._circle.style.left = '' + position.x + 'px';
	      this._circle.style.top = '' + position.y + 'px';
	      this._circle.style.width = '' + circleSize + 'px';
	      this._circle.style.height = '' + circleSize + 'px';
	      this._circle.style.marginLeft = '-' + circleSize / 2 + 'px';
	      this._circle.style.marginTop = '-' + circleSize / 2 + 'px';
	    }
	  }, {
	    key: '_onBack',

	    /**
	     * Gets called when the back button has been clicked
	     * @override
	     */
	    value: function _onBack() {
	      if (this._operationExistedBefore) {
	        this._operation.set(this._initialSettings);
	      } else {
	        this._ui.removeOperation('radial-blur');
	      }
	      this._ui.canvas.render();
	    }
	  }, {
	    key: '_onDone',

	    /**
	     * Gets called when the done button has been clicked
	     * @override
	     */
	    value: function _onDone() {
	      this._ui.addHistory(this._operation, {
	        position: this._initialSettings.position.clone(),
	        gradientRadius: this._initialSettings.gradientRadius,
	        blurRadius: this._initialSettings.blurRadius
	      }, this._operationExistedBefore);
	    }
	  }]);

	  return RadialBlurControl;
	})(_control2['default']);

	/**
	 * A unique string that identifies this control.
	 * @type {String}
	 */
	RadialBlurControl.prototype.identifier = 'radial-blur';

	exports['default'] = RadialBlurControl;
	module.exports = exports['default'];

/***/ },
/* 88 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _control = __webpack_require__(92);

	var _control2 = _interopRequireDefault(_control);

	var _libMathVector2 = __webpack_require__(50);

	var _libMathVector22 = _interopRequireDefault(_libMathVector2);

	var _libUtils = __webpack_require__(6);

	var _libUtils2 = _interopRequireDefault(_libUtils);

	var _libSimpleSlider = __webpack_require__(100);

	var _libSimpleSlider2 = _interopRequireDefault(_libSimpleSlider);



	var TiltShiftControl = (function (_Control) {
	  function TiltShiftControl() {
	    _classCallCheck(this, TiltShiftControl);

	    if (_Control != null) {
	      _Control.apply(this, arguments);
	    }
	  }

	  _inherits(TiltShiftControl, _Control);

	  _createClass(TiltShiftControl, [{
	    key: 'init',

	    /**
	     * Entry point for this control
	     */
	    value: function init() {
	      var controlsTemplate = "{{##def.control:\n  <div class=\"imglykit-controls-icon\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/blur/blur.png')}}\" />\n  </div>\n\n  <div>\n    {{var sliderId = \"imglykit-blur-radius-slider\";}}\n    {{#def.simpleSlider}}\n  </div>\n\n  {{#def.doneButton}}\n#}}\n";
	      this._controlsTemplate = controlsTemplate;

	      var canvasControlsTemplate = "<div class=\"imglykit-canvas-tilt-shift-container\">\n  <div class=\"imglykit-canvas-tilt-shift-dot\" data-option=\"position\"></div>\n  <div class=\"imglykit-canvas-tilt-shift-dot\" data-option=\"gradient\"></div>\n  <div class=\"imglykit-canvas-tilt-shift-rect-container\">\n    <div class=\"imglykit-canvas-tilt-shift-rect\"></div>\n  </div>\n</div>\n";
	      this._canvasControlsTemplate = canvasControlsTemplate;

	      this._partialTemplates.push(_libSimpleSlider2['default'].template);
	      this._currentKnob = null;
	    }
	  }, {
	    key: '_onEnter',

	    /**
	     * Gets called when this control is activated
	     * @override
	     */
	    value: function _onEnter() {
	      var _this = this;

	      this._operationExistedBefore = !!this._ui.operations['tilt-shift'];
	      this._operation = this._ui.getOrCreateOperation('tilt-shift');

	      this._initialSettings = {
	        start: this._operation.getStart().clone(),
	        end: this._operation.getEnd().clone(),
	        gradientRadius: this._operation.getGradientRadius(),
	        blurRadius: this._operation.getBlurRadius()
	      };

	      // Mouse event callbacks bound to the class context
	      this._onPositionKnobDown = this._onPositionKnobDown.bind(this);
	      this._onPositionKnobDrag = this._onPositionKnobDrag.bind(this);
	      this._onPositionKnobUp = this._onPositionKnobUp.bind(this);
	      this._onGradientKnobDown = this._onGradientKnobDown.bind(this);
	      this._onGradientKnobDrag = this._onGradientKnobDrag.bind(this);
	      this._onGradientKnobUp = this._onGradientKnobUp.bind(this);

	      // Find DOM elements
	      var selector = '.imglykit-canvas-tilt-shift-dot';
	      this._positionKnob = this._canvasControls.querySelector('' + selector + '[data-option=\'position\']');
	      this._gradientKnob = this._canvasControls.querySelector('' + selector + '[data-option=\'gradient\']');
	      this._rect = this._canvasControls.querySelector('.imglykit-canvas-tilt-shift-rect');

	      // Initialization
	      this._initSliders();

	      this._ui.canvas.render().then(function () {
	        _this._handleKnobs();
	        _this._updateDOM();
	      });
	    }
	  }, {
	    key: '_initSliders',

	    /**
	     * Initializes the slider controls
	     * @private
	     */
	    value: function _initSliders() {
	      var blurRadiusSlider = this._controls.querySelector('#imglykit-blur-radius-slider');
	      this._blurRadiusSlider = new _libSimpleSlider2['default'](blurRadiusSlider, {
	        minValue: 0,
	        maxValue: 40
	      });
	      this._blurRadiusSlider.on('update', this._onBlurRadiusUpdate.bind(this));
	      this._blurRadiusSlider.setValue(this._initialSettings.blurRadius);
	    }
	  }, {
	    key: '_onBlurRadiusUpdate',

	    /**
	     * Gets called when the value of the blur radius slider has been updated
	     * @param {Number} value
	     * @private
	     */
	    value: function _onBlurRadiusUpdate(value) {
	      this._operation.setBlurRadius(value);
	      this._ui.canvas.render();
	      this._highlightDoneButton();
	    }
	  }, {
	    key: '_handleKnobs',

	    /**
	     * Handles the knob dragging
	     * @private
	     */
	    value: function _handleKnobs() {
	      // Add event listeners
	      this._positionKnob.addEventListener('mousedown', this._onPositionKnobDown);
	      this._positionKnob.addEventListener('touchstart', this._onPositionKnobDown);
	      this._gradientKnob.addEventListener('mousedown', this._onGradientKnobDown);
	      this._gradientKnob.addEventListener('touchstart', this._onGradientKnobDown);

	      var canvasSize = this._ui.canvas.size;
	      var _initialSettings = this._initialSettings;
	      var start = _initialSettings.start;
	      var end = _initialSettings.end;

	      start = start.clone().multiply(canvasSize);
	      end = end.clone().multiply(canvasSize);

	      var dist = end.clone().subtract(start);
	      var middle = start.clone().add(dist.clone().divide(2));

	      var totalDist = Math.sqrt(Math.pow(dist.x, 2) + Math.pow(dist.y, 2));
	      var factor = dist.clone().divide(totalDist).divide(2);

	      // Calculate initial knob position (middle of start and end)
	      this._knobPosition = middle.clone();

	      // Calculate initial gradient knob position
	      var gradientRadius = this._initialSettings.gradientRadius;
	      this._gradientKnobPosition = middle.clone().add(-gradientRadius * factor.y, gradientRadius * factor.x);

	      this._updateStartAndEnd();
	      this._updateDOM();

	      this._ui.canvas.render();
	    }
	  }, {
	    key: '_updateStartAndEnd',

	    /**
	     * Calculate start and end positions using the knob positions
	     * @private
	     */
	    value: function _updateStartAndEnd() {
	      var canvasSize = this._ui.canvas.size;

	      // Calculate distance between gradient and position knob
	      var diff = this._gradientKnobPosition.clone().subtract(this._knobPosition);

	      var start = this._knobPosition.clone().add(-diff.y, diff.x).divide(canvasSize);
	      var end = this._knobPosition.clone().add(diff.y, -diff.x).divide(canvasSize);

	      this._operation.set({ start: start, end: end });
	    }
	  }, {
	    key: '_onPositionKnobDown',

	    /**
	     * Gets called when the user starts dragging the position knob
	     * @param {Event} e
	     * @private
	     */
	    value: function _onPositionKnobDown(e) {
	      e.preventDefault();

	      this._initialMousePosition = _libUtils2['default'].getEventPosition(e);
	      this._initialPosition = this._knobPosition.clone();
	      this._initialDistanceToGradientKnob = this._gradientKnobPosition.clone().subtract(this._initialPosition);

	      document.addEventListener('mousemove', this._onPositionKnobDrag);
	      document.addEventListener('touchmove', this._onPositionKnobDrag);

	      document.addEventListener('mouseup', this._onPositionKnobUp);
	      document.addEventListener('touchend', this._onPositionKnobUp);
	    }
	  }, {
	    key: '_onPositionKnobDrag',

	    /**
	     * Gets called when the user drags the position knob
	     * @param {Event} e
	     * @private
	     */
	    value: function _onPositionKnobDrag(e) {
	      e.preventDefault();

	      var canvasSize = this._ui.canvas.size;
	      var mousePosition = _libUtils2['default'].getEventPosition(e);
	      var diff = mousePosition.subtract(this._initialMousePosition);

	      var newPosition = this._initialPosition.clone().add(diff);
	      this._knobPosition.copy(newPosition);

	      var minPosition = new _libMathVector22['default']().subtract(this._initialDistanceToGradientKnob);
	      minPosition.clamp(new _libMathVector22['default'](0, 0));

	      var maxPosition = canvasSize.clone().subtract(this._initialDistanceToGradientKnob);
	      maxPosition.clamp(null, canvasSize);

	      this._knobPosition.clamp(minPosition, maxPosition);

	      this._gradientKnobPosition.copy(this._knobPosition).add(this._initialDistanceToGradientKnob);

	      this._updateStartAndEnd();
	      this._updateDOM();
	      this._ui.canvas.render();
	    }
	  }, {
	    key: '_onPositionKnobUp',

	    /**
	     * Gets called when the user stops dragging the position knob
	     * @param {Event} e
	     * @private
	     */
	    value: function _onPositionKnobUp(e) {
	      e.preventDefault();

	      document.removeEventListener('mousemove', this._onPositionKnobDrag);
	      document.removeEventListener('touchmove', this._onPositionKnobDrag);

	      document.removeEventListener('mouseup', this._onPositionKnobUp);
	      document.removeEventListener('touchend', this._onPositionKnobUp);
	    }
	  }, {
	    key: '_onGradientKnobDown',

	    /**
	     * Gets called when the user starts dragging the gradient knob
	     * @param {Event} e
	     * @private
	     */
	    value: function _onGradientKnobDown(e) {
	      e.preventDefault();

	      this._initialMousePosition = _libUtils2['default'].getEventPosition(e);
	      this._initialGradientKnobPosition = this._gradientKnobPosition.clone();

	      document.addEventListener('mousemove', this._onGradientKnobDrag);
	      document.addEventListener('touchmove', this._onGradientKnobDrag);

	      document.addEventListener('mouseup', this._onGradientKnobUp);
	      document.addEventListener('touchend', this._onGradientKnobUp);
	    }
	  }, {
	    key: '_onGradientKnobDrag',

	    /**
	     * Gets called when the user drags the gradient knob
	     * @param {Event} e
	     * @private
	     */
	    value: function _onGradientKnobDrag(e) {
	      e.preventDefault();

	      var canvasSize = this._ui.canvas.size;
	      var mousePosition = _libUtils2['default'].getEventPosition(e);
	      var diff = mousePosition.subtract(this._initialMousePosition);

	      this._gradientKnobPosition.copy(this._initialGradientKnobPosition).add(diff);
	      this._gradientKnobPosition.clamp(new _libMathVector22['default'](0, 0), canvasSize);

	      var distance = this._gradientKnobPosition.clone().subtract(this._knobPosition);
	      var newGradientRadius = 2 * Math.sqrt(Math.pow(distance.x, 2) + Math.pow(distance.y, 2));

	      this._operation.setGradientRadius(newGradientRadius);
	      this._updateStartAndEnd();
	      this._updateDOM();
	      this._ui.canvas.render();
	    }
	  }, {
	    key: '_onGradientKnobUp',

	    /**
	     * Gets called when the user stops dragging the gradient knob
	     * @param {Event} e
	     * @private
	     */
	    value: function _onGradientKnobUp(e) {
	      e.preventDefault();

	      document.removeEventListener('mousemove', this._onGradientKnobDrag);
	      document.removeEventListener('touchmove', this._onGradientKnobDrag);

	      document.removeEventListener('mouseup', this._onGradientKnobUp);
	      document.removeEventListener('touchend', this._onGradientKnobUp);
	    }
	  }, {
	    key: '_updateDOM',

	    /**
	     * Updates the knob
	     * @private
	     */
	    value: function _updateDOM() {
	      var position = this._knobPosition;
	      this._positionKnob.style.left = '' + position.x + 'px';
	      this._positionKnob.style.top = '' + position.y + 'px';

	      var gradientPosition = this._gradientKnobPosition;
	      this._gradientKnob.style.left = '' + gradientPosition.x + 'px';
	      this._gradientKnob.style.top = '' + gradientPosition.y + 'px';

	      // Resize rectangle to worst case size
	      var canvasSize = this._ui.canvas.size;
	      var gradientRadius = this._operation.getGradientRadius();
	      var rectSize = new _libMathVector22['default'](Math.sqrt(Math.pow(canvasSize.x, 2) + Math.pow(canvasSize.y, 2)) * 2, gradientRadius);

	      this._rect.style.width = '' + rectSize.x + 'px';
	      this._rect.style.height = '' + rectSize.y + 'px';
	      this._rect.style.marginLeft = '-' + rectSize.x / 2 + 'px';
	      this._rect.style.marginTop = '-' + rectSize.y / 2 + 'px';
	      this._rect.style.left = '' + position.x + 'px';
	      this._rect.style.top = '' + position.y + 'px';

	      // Rotate rectangle
	      var dist = gradientPosition.clone().subtract(position);
	      var degrees = Math.atan2(dist.x, dist.y) * (180 / Math.PI);
	      this._rect.style.transform = 'rotate(' + (-degrees).toFixed(2) + 'deg)';
	    }
	  }, {
	    key: '_onBack',

	    /**
	     * Gets called when the back button has been clicked
	     * @override
	     */
	    value: function _onBack() {
	      if (this._operationExistedBefore) {
	        this._operation.set(this._initialSettings);
	      } else {
	        this._ui.removeOperation('tilt-shift');
	      }
	      this._ui.canvas.render();
	    }
	  }, {
	    key: '_onDone',

	    /**
	     * Gets called when the done button has been clicked
	     * @override
	     */
	    value: function _onDone() {
	      this._ui.addHistory(this._operation, {
	        start: this._initialSettings.start.clone(),
	        end: this._initialSettings.end.clone(),
	        blurRadius: this._initialSettings.blurRadius,
	        gradientRadius: this._initialSettings.gradientRadius
	      }, this._operationExistedBefore);
	    }
	  }]);

	  return TiltShiftControl;
	})(_control2['default']);

	/**
	 * A unique string that identifies this control.
	 * @type {String}
	 */
	TiltShiftControl.prototype.identifier = 'tilt-shift';

	exports['default'] = TiltShiftControl;
	module.exports = exports['default'];

/***/ },
/* 89 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _control = __webpack_require__(92);

	var _control2 = _interopRequireDefault(_control);

	var _libSimpleSlider = __webpack_require__(100);

	var _libSimpleSlider2 = _interopRequireDefault(_libSimpleSlider);

	var _libColorPicker = __webpack_require__(101);

	var _libColorPicker2 = _interopRequireDefault(_libColorPicker);



	var FramesControl = (function (_Control) {
	  function FramesControl() {
	    _classCallCheck(this, FramesControl);

	    if (_Control != null) {
	      _Control.apply(this, arguments);
	    }
	  }

	  _inherits(FramesControl, _Control);

	  _createClass(FramesControl, [{
	    key: 'init',

	    /**
	     * Entry point for this control
	     */
	    value: function init() {
	      var controlsTemplate = "{{##def.control:\n  <div>\n    {{#def.simpleSlider}}\n  </div>\n\n  <div class=\"imglykit-controls-button\">\n    {{var colorpickerLabel = \"Color\";}}\n    {{#def.colorpicker}}\n  </div>\n\n  {{#def.doneButton}}\n#}}\n";
	      this._controlsTemplate = controlsTemplate;
	      this._partialTemplates.push(_libSimpleSlider2['default'].template);
	      this._partialTemplates.push(_libColorPicker2['default'].template);
	    }
	  }, {
	    key: '_onEnter',

	    /**
	     * Gets called when this control is activated
	     * @override
	     */
	    value: function _onEnter() {
	      this._operationExistedBefore = !!this._ui.operations.frames;
	      this._operation = this._ui.getOrCreateOperation('frames');

	      this._initialOptions = {
	        thickness: this._operation.getThickness(),
	        color: this._operation.getColor()
	      };

	      this._ui.canvas.render();

	      // Init slider
	      var sliderElement = this._controls.querySelector('.imglykit-slider');
	      this._slider = new _libSimpleSlider2['default'](sliderElement, {
	        minValue: 0,
	        maxValue: 0.5
	      });
	      this._slider.on('update', this._onThicknessUpdate.bind(this));
	      this._slider.setValue(this._initialOptions.thickness);

	      // Init colorpicker
	      var colorPickerElement = this._controls.querySelector('.imglykit-color-picker');
	      this._colorPicker = new _libColorPicker2['default'](this._ui, colorPickerElement);
	      this._colorPicker.on('update', this._onColorUpdate.bind(this));
	      this._colorPicker.setValue(this._initialOptions.color);
	    }
	  }, {
	    key: '_onBack',

	    /**
	     * Gets called when the back button has been clicked
	     * @override
	     */
	    value: function _onBack() {
	      if (this._operationExistedBefore) {
	        this._operation.set(this._initialOptions);
	      } else {
	        this._ui.removeOperation('frames');
	      }
	      this._ui.canvas.render();
	    }
	  }, {
	    key: '_onThicknessUpdate',

	    /**
	     * Gets called when the thickness has been changed
	     * @override
	     */
	    value: function _onThicknessUpdate(value) {
	      this._operation.setThickness(value);
	      this._ui.canvas.render();
	      this._highlightDoneButton();
	    }
	  }, {
	    key: '_onColorUpdate',

	    /**
	     * Gets called when the color has been changed
	     * @override
	     */
	    value: function _onColorUpdate(value) {
	      this._operation.setColor(value);
	      this._ui.canvas.render();
	      this._highlightDoneButton();
	    }
	  }, {
	    key: '_onDone',

	    /**
	     * Gets called when the done button has been clicked
	     * @override
	     */
	    value: function _onDone() {
	      this._ui.addHistory(this._operation, {
	        color: this._initialOptions.color,
	        thickness: this._initialOptions.thickness
	      }, this._operationExistedBefore);
	    }
	  }]);

	  return FramesControl;
	})(_control2['default']);

	/**
	 * A unique string that identifies this control.
	 * @type {String}
	 */
	FramesControl.prototype.identifier = 'frames';

	exports['default'] = FramesControl;
	module.exports = exports['default'];

/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _control = __webpack_require__(92);

	var _control2 = _interopRequireDefault(_control);

	var _libMathVector2 = __webpack_require__(50);

	var _libMathVector22 = _interopRequireDefault(_libMathVector2);

	var _libUtils = __webpack_require__(6);

	var _libUtils2 = _interopRequireDefault(_libUtils);



	var StickersControl = (function (_Control) {
	  function StickersControl() {
	    _classCallCheck(this, StickersControl);

	    if (_Control != null) {
	      _Control.apply(this, arguments);
	    }
	  }

	  _inherits(StickersControl, _Control);

	  _createClass(StickersControl, [{
	    key: 'init',

	    /**
	     * Entry point for this control
	     */
	    value: function init() {
	      var controlsTemplate = "{{##def.control:\n  <div>\n    <ul class=\"imglykit-controls-list imgly-controls-list-with-buttons\">\n      {{ for(var identifier in it.stickers) { }}\n        {{ var stickerPath = it.stickers[identifier]; }}\n        {{ var enabled = it.activeSticker === identifier; }}\n        <li data-identifier=\"{{= identifier}}\"{{? enabled}} class=\"imglykit-controls-item-active\"{{?}} style=\"background-image: url('{{=it.helpers.assetPath(stickerPath)}}');\">\n        </li>\n      {{ } }}\n    </ul>\n  </div>\n\n  {{#def.doneButton}}\n#}}\n";
	      this._controlsTemplate = controlsTemplate;

	      var canvasControlsTemplate = "<div class=\"imglykit-canvas-stickers-container\">\n  <div class=\"imglykit-canvas-stickers\">\n    <img class=\"imglykit-canvas-sticker-image\" />\n    <div class=\"imglykit-knob\"></div>\n  </div>\n</div>\n";
	      this._canvasControlsTemplate = canvasControlsTemplate;

	      /**
	       * The registered stickers
	       * @type {Object.<string, class>}
	       */
	      this._availableStickers = {};
	      this._stickers = {};
	      this._addDefaultStickers();
	      this.selectStickers(null);
	    }
	  }, {
	    key: '_addDefaultStickers',

	    /**
	     * Registers the default stickers
	     * @private
	     */
	    value: function _addDefaultStickers() {
	      this.addSticker('glasses-nerd', 'stickers/sticker-glasses-nerd.png');
	      this.addSticker('glasses-normal', 'stickers/sticker-glasses-normal.png');
	      this.addSticker('glasses-shutter-green', 'stickers/sticker-glasses-shutter-green.png');
	      this.addSticker('glasses-shutter-yellow', 'stickers/sticker-glasses-shutter-yellow.png');
	      this.addSticker('glasses-sun', 'stickers/sticker-glasses-sun.png');
	      this.addSticker('hat-cap', 'stickers/sticker-hat-cap.png');
	      this.addSticker('hat-cylinder', 'stickers/sticker-hat-cylinder.png');
	      this.addSticker('hat-party', 'stickers/sticker-hat-party.png');
	      this.addSticker('hat-sheriff', 'stickers/sticker-hat-sheriff.png');
	      this.addSticker('heart', 'stickers/sticker-heart.png');
	      this.addSticker('mustache-long', 'stickers/sticker-mustache-long.png');
	      this.addSticker('mustache1', 'stickers/sticker-mustache1.png');
	      this.addSticker('mustache2', 'stickers/sticker-mustache2.png');
	      this.addSticker('mustache3', 'stickers/sticker-mustache3.png');
	      this.addSticker('pipe', 'stickers/sticker-pipe.png');
	      this.addSticker('snowflake', 'stickers/sticker-snowflake.png');
	      this.addSticker('star', 'stickers/sticker-star.png');
	    }
	  }, {
	    key: 'addSticker',

	    /**
	     * Registers the sticker with the given identifier and path
	     * @private
	     */
	    value: function addSticker(identifier, path) {
	      this._availableStickers[identifier] = path;
	    }
	  }, {
	    key: 'selectStickers',

	    /**
	     * Selects the stickers
	     * @param {Selector} selector
	     */
	    value: function selectStickers(selector) {
	      this._stickers = {};

	      var stickerIdentifiers = Object.keys(this._availableStickers);

	      var selectedStickers = _libUtils2['default'].select(stickerIdentifiers, selector);
	      for (var i = 0; i < selectedStickers.length; i++) {
	        var identifier = selectedStickers[i];
	        this._stickers[identifier] = this._availableStickers[identifier];
	      }

	      if (this._active) {
	        this._renderControls();
	      }
	    }
	  }, {
	    key: '_onEnter',

	    /**
	     * Gets called when this control is activated
	     * @override
	     */
	    value: function _onEnter() {
	      var _this = this;

	      this._operationExistedBefore = !!this._ui.operations.stickers;
	      this._operation = this._ui.getOrCreateOperation('stickers');

	      // Don't render initially
	      this._ui.removeOperation('stickers');

	      this._initialSettings = {
	        sticker: this._operation.getSticker(),
	        position: this._operation.getPosition().clone(),
	        size: this._operation.getSize().clone()
	      };

	      var canvasSize = this._ui.canvas.size;

	      this._size = this._initialSettings.size.clone();
	      this._position = this._initialSettings.position.clone().multiply(canvasSize);

	      // Remember zoom level and zoom to fit the canvas
	      this._initialZoomLevel = this._ui.canvas.zoomLevel;
	      this._ui.canvas.zoomToFit();

	      // Find DOM elements
	      this._container = this._canvasControls.querySelector('.imglykit-canvas-stickers');
	      this._stickerImage = this._canvasControls.querySelector('img');
	      this._stickerImage.addEventListener('load', function () {
	        _this._stickerSize = new _libMathVector22['default'](_this._stickerImage.width, _this._stickerImage.height);
	        _this._onStickerLoad();
	      });
	      this._knob = this._canvasControls.querySelector('div.imglykit-knob');

	      // Mouse event callbacks bound to the class context
	      this._onImageDown = this._onImageDown.bind(this);
	      this._onImageDrag = this._onImageDrag.bind(this);
	      this._onImageUp = this._onImageUp.bind(this);
	      this._onKnobDown = this._onKnobDown.bind(this);
	      this._onKnobDrag = this._onKnobDrag.bind(this);
	      this._onKnobUp = this._onKnobUp.bind(this);

	      this._handleListItems();
	      this._handleImage();
	      this._handleKnob();
	    }
	  }, {
	    key: '_handleListItems',

	    /**
	     * Handles the list item click events
	     * @private
	     */
	    value: function _handleListItems() {
	      var _this2 = this;

	      var listItems = this._controls.querySelectorAll('li');
	      this._listItems = Array.prototype.slice.call(listItems);

	      var _loop = function (i) {
	        var listItem = _this2._listItems[i];
	        var identifier = listItem.dataset.identifier;

	        listItem.addEventListener('click', function () {
	          _this2._onListItemClick(listItem);
	        });

	        if (!_this2._operationExistedBefore && i === 0 || _this2._operationExistedBefore && _this2._stickers[identifier] === _this2._initialSettings.sticker) {
	          _this2._onListItemClick(listItem, false);
	        }
	      };

	      // Listen to click events
	      for (var i = 0; i < this._listItems.length; i++) {
	        _loop(i);
	      }
	    }
	  }, {
	    key: '_applySettings',

	    /**
	     * Resizes and positions the sticker according to the current settings
	     * @private
	     */
	    value: function _applySettings() {
	      var ratio = this._stickerSize.y / this._stickerSize.x;
	      this._size.y = this._size.x * ratio;

	      this._stickerImage.style.width = '' + this._size.x + 'px';
	      this._stickerImage.style.height = '' + this._size.y + 'px';
	      this._container.style.left = '' + this._position.x + 'px';
	      this._container.style.top = '' + this._position.y + 'px';
	    }
	  }, {
	    key: '_onBack',

	    /**
	     * Gets called when the user hits the back button
	     * @override
	     */
	    value: function _onBack() {
	      if (this._operationExistedBefore) {
	        this._operation = this._ui.getOrCreateOperation('stickers');
	        this._operation.set(this._initialSettings);
	      } else {
	        this._ui.removeOperation('stickers');
	      }
	      this._ui.canvas.setZoomLevel(this._initialZoomLevel);
	    }
	  }, {
	    key: '_onDone',

	    /**
	     * Gets called when the done button has been clicked
	     * @protected
	     */
	    value: function _onDone() {
	      // Map the position and size options to 0...1 values
	      var canvasSize = this._ui.canvas.size;
	      var position = this._position.clone().divide(canvasSize);
	      var size = this._size.clone().divide(canvasSize);

	      this._ui.canvas.setZoomLevel(this._initialZoomLevel, false);

	      // Create a new operation and render it
	      this._operation = this._ui.getOrCreateOperation('stickers');
	      this._operation.set({
	        sticker: this._availableStickers[this._sticker],
	        position: position,
	        size: size
	      });
	      this._ui.canvas.render();

	      this._ui.addHistory(this, {
	        sticker: this._initialSettings.sticker,
	        position: this._initialSettings.position.clone(),
	        size: this._initialSettings.size.clone()
	      }, this._operationExistedBefore);
	    }
	  }, {
	    key: '_handleKnob',

	    /**
	     * Handles the knob dragging
	     * @private
	     */
	    value: function _handleKnob() {
	      this._knob.addEventListener('mousedown', this._onKnobDown);
	      this._knob.addEventListener('touchstart', this._onKnobDown);
	    }
	  }, {
	    key: '_onKnobDown',

	    /**
	     * Gets called when the user clicks the knob
	     * @param {Event} e
	     * @private
	     */
	    value: function _onKnobDown(e) {
	      e.preventDefault();

	      this._initialMousePosition = _libUtils2['default'].getEventPosition(e);
	      this._initialSize = this._size.clone();

	      document.addEventListener('mousemove', this._onKnobDrag);
	      document.addEventListener('touchmove', this._onKnobDrag);

	      document.addEventListener('mouseup', this._onKnobUp);
	      document.addEventListener('touchend', this._onKnobUp);
	    }
	  }, {
	    key: '_onKnobDrag',

	    /**
	     * Gets called when the user drags the knob
	     * @param {Event} e
	     * @private
	     */
	    value: function _onKnobDrag(e) {
	      e.preventDefault();

	      var mousePosition = _libUtils2['default'].getEventPosition(e);
	      var diff = mousePosition.clone().subtract(this._initialMousePosition);

	      var size = this._initialSize.clone();
	      var ratio = this._stickerImage.height / this._stickerImage.width;
	      size.x += diff.x;
	      size.y = size.x * ratio;

	      this._size.copy(size);

	      this._applySettings();
	      this._highlightDoneButton();
	    }
	  }, {
	    key: '_onKnobUp',

	    /**
	     * Gets called when the user releases the knob
	     * @param {Event} e
	     * @private
	     */
	    value: function _onKnobUp() {
	      document.removeEventListener('mousemove', this._onKnobDrag);
	      document.removeEventListener('touchmove', this._onKnobDrag);

	      document.removeEventListener('mouseup', this._onKnobUp);
	      document.removeEventListener('touchend', this._onKnobUp);
	    }
	  }, {
	    key: '_handleImage',

	    /**
	     * Handles the image dragging
	     * @private
	     */
	    value: function _handleImage() {
	      this._stickerImage.addEventListener('mousedown', this._onImageDown);
	      this._stickerImage.addEventListener('touchstart', this._onImageDown);
	    }
	  }, {
	    key: '_onImageDown',

	    /**
	     * Gets called when the user clicks the image
	     * @param {Event} e
	     * @private
	     */
	    value: function _onImageDown(e) {
	      e.preventDefault();

	      this._initialMousePosition = _libUtils2['default'].getEventPosition(e);
	      this._initialPosition = this._position.clone();

	      document.addEventListener('mousemove', this._onImageDrag);
	      document.addEventListener('touchmove', this._onImageDrag);

	      document.addEventListener('mouseup', this._onImageUp);
	      document.addEventListener('touchend', this._onImageUp);
	    }
	  }, {
	    key: '_onImageDrag',

	    /**
	     * Gets called when the user drags the image
	     * @param {Event} e
	     * @private
	     */
	    value: function _onImageDrag(e) {
	      e.preventDefault();

	      var mousePosition = _libUtils2['default'].getEventPosition(e);
	      var diff = mousePosition.clone().subtract(this._initialMousePosition);

	      var position = this._initialPosition.clone();
	      position.add(diff);

	      this._position.copy(position);

	      this._applySettings();
	      this._highlightDoneButton();
	    }
	  }, {
	    key: '_onImageUp',

	    /**
	     * Gets called when the user releases the image
	     * @param {Event} e
	     * @private
	     */
	    value: function _onImageUp() {
	      document.removeEventListener('mousemove', this._onImageDrag);
	      document.removeEventListener('touchmove', this._onImageDrag);

	      document.removeEventListener('mouseup', this._onImageUp);
	      document.removeEventListener('touchend', this._onImageUp);
	    }
	  }, {
	    key: '_onStickerLoad',

	    /**
	     * Gets called as soon as the sticker image has been loaded
	     * @private
	     */
	    value: function _onStickerLoad() {
	      this._size = new _libMathVector22['default'](this._stickerImage.width, this._stickerImage.height);

	      if (typeof this._position === 'undefined') {
	        this._position = new _libMathVector22['default'](0, 0);
	      }

	      this._applySettings();
	    }
	  }, {
	    key: '_onListItemClick',

	    /**
	     * Gets called when the user clicked a list item
	     * @private
	     */
	    value: function _onListItemClick(item) {
	      var manually = arguments[1] === undefined ? true : arguments[1];

	      this._deactivateAllItems();

	      var identifier = item.dataset.identifier;

	      var stickerPath = this._availableStickers[identifier];
	      stickerPath = this._kit.getAssetPath(stickerPath);

	      try {
	        this._stickerImage.attributes.removeNamedItem('style');
	      } catch (e) {}

	      this._sticker = identifier;
	      this._stickerImage.src = stickerPath;

	      item.classList.add('imglykit-controls-item-active');

	      if (manually) {
	        this._highlightDoneButton();
	      }
	    }
	  }, {
	    key: '_deactivateAllItems',

	    /**
	     * Deactivates all list items
	     * @private
	     */
	    value: function _deactivateAllItems() {
	      for (var i = 0; i < this._listItems.length; i++) {
	        var listItem = this._listItems[i];
	        listItem.classList.remove('imglykit-controls-item-active');
	      }
	    }
	  }, {
	    key: 'context',

	    /**
	     * The data that is available to the template
	     * @type {Object}
	     * @override
	     */
	    get: function () {
	      var context = _get(Object.getPrototypeOf(StickersControl.prototype), 'context', this);
	      context.stickers = this._stickers;
	      return context;
	    }
	  }]);

	  return StickersControl;
	})(_control2['default']);

	/**
	 * A unique string that identifies this control.
	 * @type {String}
	 */
	StickersControl.prototype.identifier = 'stickers';

	exports['default'] = StickersControl;
	module.exports = exports['default'];

/***/ },
/* 91 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _control = __webpack_require__(92);

	var _control2 = _interopRequireDefault(_control);

	var _libColorPicker = __webpack_require__(101);

	var _libColorPicker2 = _interopRequireDefault(_libColorPicker);

	var _libMathVector2 = __webpack_require__(50);

	var _libMathVector22 = _interopRequireDefault(_libMathVector2);

	var _libUtils = __webpack_require__(6);

	var _libUtils2 = _interopRequireDefault(_libUtils);



	var TextControl = (function (_Control) {
	  function TextControl() {
	    _classCallCheck(this, TextControl);

	    if (_Control != null) {
	      _Control.apply(this, arguments);
	    }
	  }

	  _inherits(TextControl, _Control);

	  _createClass(TextControl, [{
	    key: 'init',

	    /**
	     * Entry point for this control
	     */
	    value: function init() {
	      var controlsTemplate = "{{##def.control:\n  <div>\n    <ul class=\"imglykit-controls-list imgly-controls-list-with-buttons\">\n      {{~it.fonts :value:index}}\n        <li data-name=\"{{= value.name}}\" data-weight=\"{{= value.weight}}\" style=\"font-family: {{= value.name}}; font-weight: {{= value.weight}}\">{{= value.name.substr(0, 2)}}</li>\n      {{~}}\n    </ul>\n  </div>\n\n  <div class=\"imglykit-controls-button\">\n    {{var colorpickerId = \"imglykit-text-foreground-color-picker\";}}\n    {{var colorpickerLabel = \"Foreground\";}}\n    {{#def.colorpicker}}\n  </div>\n\n  <div class=\"imglykit-controls-button\">\n    {{var colorpickerId = \"imglykit-text-background-color-picker\";}}\n    {{var colorpickerLabel = \"Background\";}}\n    {{#def.colorpicker}}\n  </div>\n\n  {{#def.doneButton}}\n#}}\n";
	      this._controlsTemplate = controlsTemplate;

	      var canvasControlsTemplate = "<div class=\"imglykit-canvas-text-container\">\n  <div class=\"imglykit-canvas-text\">\n    <div class=\"imglykit-crosshair\">\n      <img src=\"{{=it.helpers.assetPath('ui/night/crosshair.png')}}\" />\n    </div>\n    <div class=\"imglykit-canvas-text-textarea\">\n      <textarea></textarea>\n      <div class=\"imglykit-knob\"></div>\n    </div>\n  </div>\n</div>\n";
	      this._canvasControlsTemplate = canvasControlsTemplate;

	      this._partialTemplates.push(_libColorPicker2['default'].template);

	      this._fonts = [];
	      this._addFonts();
	    }
	  }, {
	    key: '_onEnter',

	    /**
	     * Gets called when this control is activated
	     * @override
	     */
	    value: function _onEnter() {
	      var _this = this;

	      this._operationExistedBefore = !!this._ui.operations.text;
	      this._operation = this._ui.getOrCreateOperation('text');

	      // Don't render initially
	      this._ui.removeOperation('text');

	      var canvasSize = this._ui.canvas.size;

	      this._initialSettings = {
	        lineHeight: this._operation.getLineHeight(),
	        fontSize: this._operation.getFontSize(),
	        fontFamily: this._operation.getFontFamily(),
	        fontWeight: this._operation.getFontWeight(),
	        color: this._operation.getColor(),
	        position: this._operation.getPosition(),
	        text: this._operation.getText() || '',
	        maxWidth: this._operation.getMaxWidth(),
	        backgroundColor: this._operation.getBackgroundColor()
	      };

	      this._settings = {
	        lineHeight: this._initialSettings.lineHeight,
	        fontSize: this._initialSettings.fontSize,
	        fontFamily: this._initialSettings.fontFamily,
	        fontWeight: this._initialSettings.fontWeight,
	        color: this._initialSettings.color.clone(),
	        position: this._initialSettings.position.clone().multiply(canvasSize),
	        text: this._initialSettings.text,
	        maxWidth: this._initialSettings.maxWidth * canvasSize.x,
	        backgroundColor: this._initialSettings.backgroundColor.clone()
	      };

	      // Remember zoom level and zoom to fit the canvas
	      this._initialZoomLevel = this._ui.canvas.zoomLevel;

	      this._container = this._canvasControls.querySelector('.imglykit-canvas-text');
	      this._textarea = this._canvasControls.querySelector('textarea');
	      this._textarea.focus();

	      this._moveKnob = this._canvasControls.querySelector('.imglykit-crosshair');
	      this._resizeKnob = this._canvasControls.querySelector('.imglykit-knob');

	      // If the text has been edited before, subtract the knob width and padding
	      if (this._operationExistedBefore) {
	        this._settings.position.x -= 2;
	        this._settings.position.y -= 2;
	      }

	      this._onTextareaKeyUp = this._onTextareaKeyUp.bind(this);
	      this._onResizeKnobDown = this._onResizeKnobDown.bind(this);
	      this._onResizeKnobDrag = this._onResizeKnobDrag.bind(this);
	      this._onResizeKnobUp = this._onResizeKnobUp.bind(this);
	      this._onMoveKnobDown = this._onMoveKnobDown.bind(this);
	      this._onMoveKnobDrag = this._onMoveKnobDrag.bind(this);
	      this._onMoveKnobUp = this._onMoveKnobUp.bind(this);
	      this._onForegroundColorUpdate = this._onForegroundColorUpdate.bind(this);
	      this._onBackgroundColorUpdate = this._onBackgroundColorUpdate.bind(this);

	      this._initColorPickers();
	      this._handleListItems();
	      this._handleTextarea();
	      this._handleResizeKnob();
	      this._handleMoveKnob();

	      // Resize asynchronously to render a frame
	      setTimeout(function () {
	        _this._resizeTextarea();
	      }, 1);

	      this._ui.canvas.zoomToFit().then(function () {
	        _this._applySettings();
	      });
	    }
	  }, {
	    key: '_initColorPickers',

	    /**
	     * Initializes the color pickers
	     * @private
	     */
	    value: function _initColorPickers() {
	      var _this2 = this;

	      var foregroundColorPicker = this._controls.querySelector('#imglykit-text-foreground-color-picker');
	      this._foregroundColorPicker = new _libColorPicker2['default'](this._ui, foregroundColorPicker);
	      this._foregroundColorPicker.setValue(this._operation.getColor());
	      this._foregroundColorPicker.on('update', this._onForegroundColorUpdate);
	      this._foregroundColorPicker.on('show', function () {
	        _this2._backgroundColorPicker.hide();
	      });

	      var backgroundColorPicker = this._controls.querySelector('#imglykit-text-background-color-picker');
	      this._backgroundColorPicker = new _libColorPicker2['default'](this._ui, backgroundColorPicker);
	      this._backgroundColorPicker.setValue(this._operation.getBackgroundColor());
	      this._backgroundColorPicker.on('update', this._onBackgroundColorUpdate);
	      this._backgroundColorPicker.on('show', function () {
	        _this2._foregroundColorPicker.hide();
	      });
	    }
	  }, {
	    key: '_handleListItems',

	    /**
	     * Handles the list item click events
	     * @private
	     */
	    value: function _handleListItems() {
	      var _this3 = this;

	      var listItems = this._controls.querySelectorAll('li');
	      this._listItems = Array.prototype.slice.call(listItems);

	      var _loop = function (i) {
	        var listItem = _this3._listItems[i];
	        var name = listItem.dataset.name;

	        listItem.addEventListener('click', function () {
	          _this3._onListItemClick(listItem);
	        });

	        if (!_this3._operationExistedBefore && i === 0 || _this3._operationExistedBefore && name === _this3._initialSettings.fontFamily) {
	          _this3._onListItemClick(listItem, false);
	        }
	      };

	      // Listen to click events
	      for (var i = 0; i < this._listItems.length; i++) {
	        _loop(i);
	      }
	    }
	  }, {
	    key: '_handleTextarea',

	    /**
	     * Handles the text area key events
	     * @private
	     */
	    value: function _handleTextarea() {
	      this._textarea.addEventListener('keyup', this._onTextareaKeyUp);
	    }
	  }, {
	    key: '_onTextareaKeyUp',

	    /**
	     * Gets called when the user releases a key inside the text area
	     * @private
	     */
	    value: function _onTextareaKeyUp() {
	      this._resizeTextarea();
	      this._settings.text = this._textarea.value;
	      this._highlightDoneButton();
	    }
	  }, {
	    key: '_resizeTextarea',

	    /**
	     * Resizes the text area to fit the text inside of it
	     * @private
	     */
	    value: function _resizeTextarea() {
	      var scrollTop = this._textarea.scrollTop;

	      if (!scrollTop) {
	        var _scrollHeight = undefined,
	            height = undefined;
	        do {
	          _scrollHeight = this._textarea.scrollHeight;
	          height = this._textarea.offsetHeight;
	          this._textarea.style.height = '' + (height - 5) + 'px';
	        } while (_scrollHeight && _scrollHeight !== this._textarea.scrollHeight);
	      }

	      var scrollHeight = this._textarea.scrollHeight;
	      this._textarea.style.height = '' + (scrollHeight + 20) + 'px';
	    }
	  }, {
	    key: '_handleMoveKnob',

	    /**
	     * Handles the move knob dragging
	     * @private
	     */
	    value: function _handleMoveKnob() {
	      this._moveKnob.addEventListener('mousedown', this._onMoveKnobDown);
	      this._moveKnob.addEventListener('touchstart', this._onMoveKnobDown);
	    }
	  }, {
	    key: '_onMoveKnobDown',

	    /**
	     * Gets called when the user clicks the move knob
	     * @private
	     */
	    value: function _onMoveKnobDown(e) {
	      e.preventDefault();

	      this._initialMousePosition = _libUtils2['default'].getEventPosition(e);
	      this._initialPosition = this._settings.position.clone();

	      document.addEventListener('mousemove', this._onMoveKnobDrag);
	      document.addEventListener('touchmove', this._onMoveKnobDrag);

	      document.addEventListener('mouseup', this._onMoveKnobUp);
	      document.addEventListener('tochend', this._onMoveKnobUp);
	    }
	  }, {
	    key: '_onMoveKnobDrag',

	    /**
	     * Gets called when the user drags the move knob
	     * @private
	     */
	    value: function _onMoveKnobDrag(e) {
	      e.preventDefault();

	      var canvasSize = this._ui.canvas.size;

	      var mousePosition = _libUtils2['default'].getEventPosition(e);
	      var diff = mousePosition.clone().subtract(this._initialMousePosition);

	      var minPosition = new _libMathVector22['default'](0, 0);
	      var containerSize = new _libMathVector22['default'](this._container.offsetWidth, this._container.offsetHeight);
	      var maxPosition = canvasSize.clone().subtract(containerSize);
	      var position = this._initialPosition.clone().add(diff).clamp(minPosition, maxPosition);

	      this._settings.position = position;

	      this._container.style.left = '' + position.x + 'px';
	      this._container.style.top = '' + position.y + 'px';
	    }
	  }, {
	    key: '_onMoveKnobUp',

	    /**
	     * Gets called when the user releases the move knob
	     * @private
	     */
	    value: function _onMoveKnobUp() {
	      document.removeEventListener('mousemove', this._onMoveKnobDrag);
	      document.removeEventListener('touchmove', this._onMoveKnobDrag);

	      document.removeEventListener('mouseup', this._onMoveKnobUp);
	      document.removeEventListener('touchend', this._onMoveKnobUp);
	    }
	  }, {
	    key: '_handleResizeKnob',

	    /**
	     * Handles the resize knob dragging
	     * @private
	     */
	    value: function _handleResizeKnob() {
	      this._resizeKnob.addEventListener('mousedown', this._onResizeKnobDown);
	      this._resizeKnob.addEventListener('touchstart', this._onResizeKnobDown);
	    }
	  }, {
	    key: '_onResizeKnobDown',

	    /**
	     * Gets called when the user clicks the resize knob
	     * @param {Event} e
	     * @private
	     */
	    value: function _onResizeKnobDown(e) {
	      e.preventDefault();

	      this._initialMousePosition = _libUtils2['default'].getEventPosition(e);
	      this._initialMaxWidth = this._settings.maxWidth;

	      document.addEventListener('mousemove', this._onResizeKnobDrag);
	      document.addEventListener('touchmove', this._onResizeKnobDrag);

	      document.addEventListener('mouseup', this._onResizeKnobUp);
	      document.addEventListener('touchend', this._onResizeKnobUp);
	    }
	  }, {
	    key: '_onResizeKnobDrag',

	    /**
	     * Gets called when the user drags the resize knob
	     * @param {Event} e
	     * @private
	     */
	    value: function _onResizeKnobDrag(e) {
	      e.preventDefault();

	      var canvasSize = this._ui.canvas.size;
	      var mousePosition = _libUtils2['default'].getEventPosition(e);
	      var diff = mousePosition.subtract(this._initialMousePosition);

	      var position = this._settings.position.clone();
	      var maxWidthAllowed = canvasSize.x - position.x;

	      var maxWidth = this._initialMaxWidth + diff.x;
	      maxWidth = Math.max(100, Math.min(maxWidthAllowed, maxWidth));
	      this._settings.maxWidth = maxWidth;
	      this._textarea.style.width = '' + maxWidth + 'px';

	      this._resizeTextarea();
	    }
	  }, {
	    key: '_onResizeKnobUp',

	    /**
	     * Gets called when the user releases the resize knob
	     * @param {Event} e
	     * @private
	     */
	    value: function _onResizeKnobUp() {
	      document.removeEventListener('mousemove', this._onResizeKnobDrag);
	      document.removeEventListener('touchmove', this._onResizeKnobDrag);

	      document.removeEventListener('mouseup', this._onResizeKnobUp);
	      document.removeEventListener('touchend', this._onResizeKnobUp);
	    }
	  }, {
	    key: '_onForegroundColorUpdate',

	    /**
	     * Gets called when the user selects another color using
	     * the color picker.
	     * @param {Color} value
	     * @private
	     */
	    value: function _onForegroundColorUpdate(value) {
	      this._settings.color = value;
	      this._applySettings();
	      this._highlightDoneButton();
	    }
	  }, {
	    key: '_onBackgroundColorUpdate',

	    /**
	     * Gets called when the user selects another color using
	     * the color picker.
	     * @param {Color} value
	     * @private
	     */
	    value: function _onBackgroundColorUpdate(value) {
	      this._settings.backgroundColor = value;
	      this._applySettings();
	      this._highlightDoneButton();
	    }
	  }, {
	    key: '_applySettings',

	    /**
	     * Styles the textarea to represent the current settings
	     * @private
	     */
	    value: function _applySettings() {
	      var textarea = this._textarea;
	      var settings = this._settings;

	      var canvasSize = this._ui.canvas.size;
	      var actualFontSize = settings.fontSize * canvasSize.y;

	      this._container.style.left = '' + settings.position.x + 'px';
	      this._container.style.top = '' + settings.position.y + 'px';

	      textarea.value = settings.text;
	      textarea.style.fontFamily = settings.fontFamily;
	      textarea.style.fontSize = '' + actualFontSize + 'px';
	      textarea.style.fontWeight = settings.fontWeight;
	      textarea.style.lineHeight = settings.lineHeight;
	      textarea.style.color = settings.color.toRGBA();
	      textarea.style.backgroundColor = settings.backgroundColor.toRGBA();
	      textarea.style.width = '' + settings.maxWidth + 'px';
	    }
	  }, {
	    key: '_onListItemClick',

	    /**
	     * Gets called when the user clicked a list item
	     * @private
	     */
	    value: function _onListItemClick(item) {
	      var manually = arguments[1] === undefined ? true : arguments[1];

	      this._deactivateAllItems();

	      var _item$dataset = item.dataset;
	      var name = _item$dataset.name;
	      var weight = _item$dataset.weight;

	      this._settings.fontFamily = name;
	      this._settings.fontWeight = weight;

	      this._applySettings();

	      item.classList.add('imglykit-controls-item-active');

	      if (manually) {
	        this._highlightDoneButton();
	      }
	    }
	  }, {
	    key: '_deactivateAllItems',

	    /**
	     * Deactivates all list items
	     * @private
	     */
	    value: function _deactivateAllItems() {
	      for (var i = 0; i < this._listItems.length; i++) {
	        var listItem = this._listItems[i];
	        listItem.classList.remove('imglykit-controls-item-active');
	      }
	    }
	  }, {
	    key: '_addFonts',

	    /**
	     * Adds the default fonts
	     * @private
	     */
	    value: function _addFonts() {
	      this.addFont('Helvetica', 'normal');
	      this.addFont('Lucida Grande', 'normal');
	      this.addFont('Times New Roman', 'normal');
	    }
	  }, {
	    key: 'addFont',

	    /**
	     * Adds a font with the given name and weight
	     * @param {String} name
	     * @param {String} weight
	     */
	    value: function addFont(name, weight) {
	      this._fonts.push({ name: name, weight: weight });
	    }
	  }, {
	    key: '_onDone',

	    /**
	     * Gets called when the done button has been clicked
	     * @override
	     */
	    value: function _onDone() {
	      var canvasSize = this._ui.canvas.size;
	      var padding = new _libMathVector22['default'](2, 2);
	      var position = this._settings.position.clone().add(padding).divide(canvasSize);

	      this._ui.canvas.setZoomLevel(this._initialZoomLevel, false);

	      this._operation = this._ui.getOrCreateOperation('text');
	      this._operation.set({
	        fontSize: this._settings.fontSize,
	        fontFamily: this._settings.fontFamily,
	        fontWeight: this._settings.fontWeight,
	        color: this._settings.color,
	        backgroundColor: this._settings.backgroundColor,
	        position: position,
	        text: this._settings.text,
	        maxWidth: this._settings.maxWidth / canvasSize.x
	      });
	      this._ui.canvas.render();

	      this._ui.addHistory(this, {
	        fontFamily: this._initialSettings.fontFamily,
	        fontWeight: this._initialSettings.fontWeight,
	        color: this._initialSettings.color.clone(),
	        backgroundColor: this._initialSettings.backgroundColor.clone(),
	        position: this._initialSettings.position.clone(),
	        text: this._initialSettings.text,
	        maxWidth: this._initialSettings.maxWidth
	      }, this._operationExistedBefore);
	    }
	  }, {
	    key: '_onBack',

	    /**
	     * Gets called when the back button has been clicked
	     * @override
	     */
	    value: function _onBack() {
	      if (this._operationExistedBefore) {
	        this._operation = this._ui.getOrCreateOperation('text');
	        this._operation.set(this._initialSettings);
	      } else {
	        this._ui.removeOperation('text');
	      }
	      this._ui.canvas.setZoomLevel(this._initialZoomLevel);
	    }
	  }, {
	    key: 'context',

	    /**
	     * The data that is available to the template
	     * @type {Object}
	     * @override
	     */
	    get: function () {
	      var context = _get(Object.getPrototypeOf(TextControl.prototype), 'context', this);
	      context.fonts = this._fonts;
	      return context;
	    }
	  }]);

	  return TextControl;
	})(_control2['default']);

	/**
	 * A unique string that identifies this control.
	 * @type {String}
	 */
	TextControl.prototype.identifier = 'text';

	exports['default'] = TextControl;
	module.exports = exports['default'];

/***/ },
/* 92 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _dot = __webpack_require__(98);

	var _dot2 = _interopRequireDefault(_dot);

	var _baseHelpers = __webpack_require__(97);

	var _baseHelpers2 = _interopRequireDefault(_baseHelpers);

	var _libEventEmitter = __webpack_require__(72);

	var _libEventEmitter2 = _interopRequireDefault(_libEventEmitter);

	var _libScrollbar = __webpack_require__(79);

	var _libScrollbar2 = _interopRequireDefault(_libScrollbar);

	/**
	 * To create an {@link ImglyKit.NightUI.Control} class of your own, call
	 * this method and provide instance properties and functions.
	 * @function
	 */

	var _libExtend = __webpack_require__(58);

	var _libExtend2 = _interopRequireDefault(_libExtend);



	var Control = (function (_EventEmitter) {
	  function Control(kit, ui, operation) {
	    _classCallCheck(this, Control);

	    _get(Object.getPrototypeOf(Control.prototype), 'constructor', this).call(this);

	    this._kit = kit;
	    this._ui = ui;
	    this._operation = operation;
	    this._helpers = new _baseHelpers2['default'](this._kit, this._ui, this._ui.options);
	    this._partialTemplates = ["{{##def.doneButton:\n  <div class=\"imglykit-controls-button imglykit-controls-done\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/done.png') }}\" />\n    <div class=\"imglykit-controls-done-highlighted\">\n      <img src=\"{{=it.helpers.assetPath('ui/night/buttons/done-highlighted.png') }}\" />\n    </div>\n  </div>\n#}}\n"];

	    this._template = "<div class=\"imglykit-controls-{{=it.identifier}}\">\n  <div class=\"imglykit-controls-button imglykit-controls-back\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/back.png') }}\" />\n  </div>\n\n  {{#def.control}}\n</div>\n";
	    this._active = false;

	    this.init();
	  }

	  _inherits(Control, _EventEmitter);

	  _createClass(Control, [{
	    key: 'setContainers',

	    /**
	     * Sets the containers that the control will be rendered to
	     * @param {DOMElement} controlsContainer
	     * @param {DOMElement} canvasControlsContainer
	     */
	    value: function setContainers(controlsContainer, canvasControlsContainer) {
	      this._controlsContainer = controlsContainer;
	      this._canvasControlsContainer = canvasControlsContainer;
	    }
	  }, {
	    key: 'init',

	    /**
	     * The entry point for this control
	     */
	    value: function init() {}
	  }, {
	    key: '_renderAllControls',

	    /**
	     * Renders the controls
	     * @private
	     */
	    value: function _renderAllControls() {
	      this._renderControls();
	      this._renderCanvasControls();
	      this._initScrollbar();
	    }
	  }, {
	    key: '_renderControls',

	    /**
	     * Renders the controls
	     * @private
	     */
	    value: function _renderControls() {
	      if (typeof this._controlsTemplate === 'undefined') {
	        throw new Error('Control#_renderOverviewControls: Control needs to define this._controlsTemplate.');
	      }

	      var template = this._partialTemplates.concat([this._controlsTemplate, this._template]).join('\r\n');

	      // Render the template
	      var renderFn = _dot2['default'].template(template);
	      var html = renderFn(this.context);

	      if (typeof this._controls !== 'undefined' && this._controls.parentNode !== null) {
	        this._controls.parentNode.removeChild(this._controls);
	      }

	      // Create a wrapper
	      this._controls = document.createElement('div');
	      this._controls.innerHTML = html;

	      // Append to DOM
	      this._controlsContainer.appendChild(this._controls);
	    }
	  }, {
	    key: '_renderCanvasControls',

	    /**
	     * Renders the canvas controls
	     * @private
	     */
	    value: function _renderCanvasControls() {
	      if (typeof this._canvasControlsTemplate === 'undefined') {
	        return; // Canvas controls are optional
	      }

	      var template = this._partialTemplates.concat([this._canvasControlsTemplate]).join('\r\n');

	      // Render the template
	      var renderFn = _dot2['default'].template(template);
	      var html = renderFn(this.context);

	      // Create a wrapper
	      this._canvasControls = document.createElement('div');
	      this._canvasControls.innerHTML = html;

	      // Append to DOM
	      this._canvasControlsContainer.appendChild(this._canvasControls);
	    }
	  }, {
	    key: '_initScrollbar',

	    /**
	     * Initializes the custom scrollbar
	     * @private
	     */
	    value: function _initScrollbar() {
	      var list = this._controls.querySelector('.imglykit-controls-list');
	      if (list) {
	        this._scrollbar = new _libScrollbar2['default'](list.parentNode);
	      }
	    }
	  }, {
	    key: '_removeControls',

	    /**
	     * Removes the controls from the DOM
	     * @private
	     */
	    value: function _removeControls() {
	      this._controls.parentNode.removeChild(this._controls);
	      if (this._canvasControls) {
	        this._canvasControls.parentNode.removeChild(this._canvasControls);
	      }

	      if (this._scrollbar) this._scrollbar.remove();
	    }
	  }, {
	    key: '_handleBackAndDoneButtons',

	    /**
	     * Handles the back and done buttons
	     * @private
	     */
	    value: function _handleBackAndDoneButtons() {
	      // Back button
	      this._backButton = this._controls.querySelector('.imglykit-controls-back');
	      if (this._backButton) {
	        this._backButton.addEventListener('click', this._onBackButtonClick.bind(this));
	      }

	      // Done button
	      this._doneButton = this._controls.querySelector('.imglykit-controls-done');
	      if (this._doneButton) {
	        this._doneButton.addEventListener('click', this._onDoneButtonClick.bind(this));
	      }
	    }
	  }, {
	    key: '_onBackButtonClick',

	    /**
	     * Gets called when the back button has been clicked
	     * @private
	     */
	    value: function _onBackButtonClick() {
	      this._onBack();
	      this.emit('back');
	    }
	  }, {
	    key: '_onDoneButtonClick',

	    /**
	     * Gets called when the done button has been clicked
	     * @private
	     */
	    value: function _onDoneButtonClick() {
	      this._onDone();
	      this.emit('back');
	    }
	  }, {
	    key: '_highlightDoneButton',

	    /**
	     * Highlights the done button
	     * @private
	     */
	    value: function _highlightDoneButton() {
	      this._doneButton.classList.add('highlighted');
	    }
	  }, {
	    key: 'enter',

	    /**
	     * Gets called when this control is activated
	     * @internal Used by the SDK, don't override.
	     */
	    value: function enter() {
	      this._active = true;

	      this._ui.hideZoom();

	      this._renderAllControls();
	      this._handleBackAndDoneButtons();
	      this._enableCanvasControls();
	      this._onEnter();
	    }
	  }, {
	    key: 'leave',

	    /**
	     * Gets called when this control is deactivated
	     * @internal Used by the SDK, don't override.
	     */
	    value: function leave() {
	      this._active = false;

	      this._ui.showZoom();

	      this._removeControls();
	      this._disableCanvasControls();
	      this._onLeave();
	    }
	  }, {
	    key: '_enableCanvasControls',
	    value: function _enableCanvasControls() {
	      this._canvasControlsContainer.classList.remove('imglykit-canvas-controls-disabled');
	    }
	  }, {
	    key: '_disableCanvasControls',
	    value: function _disableCanvasControls() {
	      this._canvasControlsContainer.classList.add('imglykit-canvas-controls-disabled');
	    }
	  }, {
	    key: '_onEnter',

	    // Protected methods

	    /**
	     * Gets called when this control is activated.
	     * @protected
	     */
	    value: function _onEnter() {}
	  }, {
	    key: '_onLeave',

	    /**
	     * Gets called when this control is deactivated
	     * @protected
	     */
	    value: function _onLeave() {}
	  }, {
	    key: '_onBack',

	    /**
	     * Gets called when the back button has been clicked
	     * @protected
	     */
	    value: function _onBack() {}
	  }, {
	    key: '_onDone',

	    /**
	     * Gets called when the done button has been clicked
	     * @protected
	     */
	    value: function _onDone() {}
	  }, {
	    key: 'onZoom',

	    /**
	     * Gets called when the zoom level has been changed while
	     * this control is active
	     */
	    value: function onZoom() {}
	  }, {
	    key: 'context',

	    /**
	     * The data that is available to the template
	     * @type {Object}
	     */
	    get: function () {
	      return {
	        helpers: this._helpers,
	        identifier: this.identifier
	      };
	    }
	  }]);

	  return Control;
	})(_libEventEmitter2['default']);

	/**
	 * A unique string that identifies this control.
	 * @type {String}
	 */
	Control.prototype.identifier = null;
	Control.extend = _libExtend2['default'];

	exports['default'] = Control;
	module.exports = exports['default'];

/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 94 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) FILSH Media GmbH - All Rights Reserved
	 *
	 * This file is part of VLIGHT.MXR.TWO
	 *
	 * Unauthorized copying of this file, via any medium is strictly prohibited.
	 * Proprietary and confidential.
	 *
	 * Written by Sascha Gehlich <sascha@gehlich.us>, June 2015
	 *
	 * Extracted from MinifyJpeg:
	 * https://github.com/hMatoba/MinifyJpeg
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	var KEY_STR = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

	exports['default'] = {
	  encode: function encode(input) {
	    var output = '',
	        chr1 = undefined,
	        chr2 = undefined,
	        chr3 = '',
	        enc1 = undefined,
	        enc2 = undefined,
	        enc3 = undefined,
	        enc4 = '',
	        i = 0;

	    do {
	      chr1 = input[i++];
	      chr2 = input[i++];
	      chr3 = input[i++];

	      enc1 = chr1 >> 2;
	      enc2 = (chr1 & 3) << 4 | chr2 >> 4;
	      enc3 = (chr2 & 15) << 2 | chr3 >> 6;
	      enc4 = chr3 & 63;

	      if (isNaN(chr2)) {
	        enc3 = enc4 = 64;
	      } else if (isNaN(chr3)) {
	        enc4 = 64;
	      }

	      output = output + KEY_STR.charAt(enc1) + KEY_STR.charAt(enc2) + KEY_STR.charAt(enc3) + KEY_STR.charAt(enc4);
	      chr1 = chr2 = chr3 = '';
	      enc1 = enc2 = enc3 = enc4 = '';
	    } while (i < input.length);

	    return output;
	  },

	  decode: function decode(input) {
	    var chr1 = undefined,
	        chr2 = undefined,
	        chr3 = '',
	        enc1 = undefined,
	        enc2 = undefined,
	        enc3 = undefined,
	        enc4 = '',
	        i = 0,
	        buf = [];

	    // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
	    var base64test = /[^A-Za-z0-9\+\/\=]/g;
	    if (base64test.exec(input)) {
	      throw new Error('There were invalid base64 characters in the input text.\n' + 'Valid base64 characters are A-Z, a-z, 0-9, \'+\', \'/\',and \'=\'\n' + 'Expect errors in decoding.');
	    }
	    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

	    do {
	      enc1 = KEY_STR.indexOf(input.charAt(i++));
	      enc2 = KEY_STR.indexOf(input.charAt(i++));
	      enc3 = KEY_STR.indexOf(input.charAt(i++));
	      enc4 = KEY_STR.indexOf(input.charAt(i++));

	      chr1 = enc1 << 2 | enc2 >> 4;
	      chr2 = (enc2 & 15) << 4 | enc3 >> 2;
	      chr3 = (enc3 & 3) << 6 | enc4;

	      buf.push(chr1);

	      if (enc3 !== 64) {
	        buf.push(chr2);
	      }
	      if (enc4 !== 64) {
	        buf.push(chr3);
	      }

	      chr1 = chr2 = chr3 = '';
	      enc1 = enc2 = enc3 = enc4 = '';
	    } while (i < input.length);

	    return buf;
	  }
	};
	module.exports = exports['default'];

/***/ },
/* 95 */
/***/ function(module, exports, __webpack_require__) {

	/*jshint unused:false */
	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _libMathVector2 = __webpack_require__(50);

	var _libMathVector22 = _interopRequireDefault(_libMathVector2);

	var _libEventEmitter = __webpack_require__(72);

	var _libEventEmitter2 = _interopRequireDefault(_libEventEmitter);

	/**
	 * @class
	 * @alias ImglyKit.Renderer
	 * @param {Vector2} dimensions
	 * @private
	 */

	var Renderer = (function (_EventEmitter) {
	  function Renderer(dimensions, canvas) {
	    _classCallCheck(this, Renderer);

	    _get(Object.getPrototypeOf(Renderer.prototype), 'constructor', this).call(this);

	    /**
	     * @type {Canvas}
	     * @private
	     */
	    this._canvas = canvas || this.createCanvas();

	    if (!canvas) {
	      this.setSize(dimensions);
	    }

	    /**
	     * @type {RenderingContext}
	     * @private
	     */
	    this._context = this._getContext();

	    /**
	     * The texture / image data cache
	     * @type {Object.<String, *>}
	     */
	    this._cache = {};
	  }

	  _inherits(Renderer, _EventEmitter);

	  _createClass(Renderer, [{
	    key: 'cache',

	    /**
	     * Caches the current canvas content for the given identifier
	     * @param {String} identifier
	     */
	    value: function cache(identifier) {}
	  }, {
	    key: 'drawCached',

	    /**
	     * Draws the stored texture / image data for the given identifier
	     * @param {String} identifier
	     */
	    value: function drawCached(identifier) {}
	  }, {
	    key: 'createCanvas',

	    /**
	     * Creates a new canvas
	     * @param {Number} [width]
	     * @param {Number} [height]
	     * @return {Canvas}
	     * @private
	     */
	    value: function createCanvas(width, height) {
	      var isBrowser = typeof window !== 'undefined';
	      var canvas;
	      if (isBrowser) {
	        /* istanbul ignore next */
	        canvas = document.createElement('canvas');
	      } else {
	        var Canvas = __webpack_require__(53);
	        canvas = new Canvas();
	      }

	      // Apply width
	      if (typeof width !== 'undefined') {
	        canvas.width = width;
	      }

	      // Apply height
	      if (typeof height !== 'undefined') {
	        canvas.height = height;
	      }

	      return canvas;
	    }
	  }, {
	    key: 'getSize',

	    /**
	     * Returns the current size of the canvas
	     * @return {Vector2}
	     */
	    value: function getSize() {
	      return new _libMathVector22['default'](this._canvas.width, this._canvas.height);
	    }
	  }, {
	    key: 'setSize',

	    /**
	     * Sets the canvas dimensions
	     * @param {Vector2} dimensions
	     */
	    value: function setSize(dimensions) {
	      this._canvas.width = dimensions.x;
	      this._canvas.height = dimensions.y;
	    }
	  }, {
	    key: '_getContext',

	    /**
	     * Gets the rendering context from the Canva
	     * @return {RenderingContext}
	     * @abstract
	     */
	    value: function _getContext() {
	      /* istanbul ignore next */
	      throw new Error('Renderer#_getContext is abstract and not implemented in inherited class.');
	    }
	  }, {
	    key: 'resizeTo',

	    /**
	     * Resizes the current canvas picture to the given dimensions
	     * @param  {Vector2} dimensions
	     * @return {Promise}
	     * @abstract
	     */
	    value: function resizeTo(dimensions) {
	      /* istanbul ignore next */
	      throw new Error('Renderer#resizeTo is abstract and not implemented in inherited class.');
	    }
	  }, {
	    key: 'drawImage',

	    /**
	     * Draws the given image on the canvas
	     * @param  {Image} image
	     * @abstract
	     */
	    value: function drawImage(image) {
	      /* istanbul ignore next */
	      throw new Error('Renderer#drawImage is abstract and not implemented in inherited class.');
	    }
	  }, {
	    key: 'renderFinal',

	    /**
	     * Gets called after the stack has been rendered
	     * @param  {Image} image
	     */
	    value: function renderFinal() {}
	  }, {
	    key: 'getCanvas',

	    /**
	     * Returns the canvas
	     * @return {Canvas}
	     */
	    value: function getCanvas() {
	      return this._canvas;
	    }
	  }, {
	    key: 'getContext',

	    /**
	     * Returns the context
	     * @return {RenderingContext}
	     */
	    value: function getContext() {
	      return this._context;
	    }
	  }, {
	    key: 'setCanvas',

	    /**
	     * Sets the current canvas to the given one
	     * @param {Canvas} canvas
	     */
	    value: function setCanvas(canvas) {
	      this._canvas = canvas;
	      this._context = this._getContext();

	      this.emit('new-canvas', this._canvas);
	    }
	  }, {
	    key: 'setContext',

	    /**
	     * Sets the current context to the given one
	     * @param {RenderingContext2D} context
	     */
	    value: function setContext(context) {
	      this._context = context;
	    }
	  }, {
	    key: 'reset',

	    /**
	     * Resets the renderer
	     * @param {Boolean} resetCache = false
	     */
	    value: function reset() {
	      var resetCache = arguments[0] === undefined ? false : arguments[0];
	    }
	  }, {
	    key: 'identifier',

	    /**
	     * A unique string that identifies this renderer
	     * @type {String}
	     */
	    get: function () {
	      return null;
	    }
	  }], [{
	    key: 'isSupported',

	    /**
	     * Checks whether this type of renderer is supported in the current environment
	     * @abstract
	     * @returns {boolean}
	     */
	    value: function isSupported() {
	      /* istanbul ignore next */
	      throw new Error('Renderer#isSupported is abstract and not implemented in inherited class.');
	    }
	  }]);

	  return Renderer;
	})(_libEventEmitter2['default']);

	exports['default'] = Renderer;
	module.exports = exports['default'];

/***/ },
/* 96 */
/***/ function(module, exports, __webpack_require__) {

	/* jshint unused: false */
	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	/**
	 * Base class for primitives. Extendable via {@link ImglyKit.Filter.Primitive#extend}
	 * @class
	 * @alias ImglyKit.Filter.Primitive
	 */
	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var Primitive = (function () {
	  function Primitive(options) {
	    _classCallCheck(this, Primitive);

	    options = options || {};

	    this._options = options;
	  }

	  _createClass(Primitive, [{
	    key: 'render',

	    /**
	     * Renders the primitive
	     * @param  {Renderer} renderer
	     * @return {Promise}
	     */
	    value: function render(renderer) {
	      if (renderer.identifier === 'webgl') {
	        this.renderWebGL(renderer);
	      } else {
	        this.renderCanvas(renderer);
	      }
	    }
	  }, {
	    key: 'renderWebGL',

	    /**
	     * Renders the primitive (WebGL)
	     * @param  {CanvasRenderer} renderer
	     */
	    /* istanbul ignore next */
	    value: function renderWebGL(renderer) {
	      /* istanbul ignore next */
	      throw new Error('Primitive#renderWebGL is abstract and not implemented in inherited class.');
	    }
	  }, {
	    key: 'renderCanvas',

	    /**
	     * Renders the primitive (Canvas2D)
	     * @param  {CanvasRenderer} renderer
	     */
	    value: function renderCanvas(renderer) {
	      /* istanbul ignore next */
	      throw new Error('Primitive#renderCanvas is abstract and not implemented in inherited class.');
	    }
	  }]);

	  return Primitive;
	})();

	exports['default'] = Primitive;
	module.exports = exports['default'];

/***/ },
/* 97 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var Helpers = (function () {
	  function Helpers(kit, ui, options) {
	    _classCallCheck(this, Helpers);

	    this._kit = kit;
	    this._ui = ui;
	    this._options = options;
	  }

	  _createClass(Helpers, [{
	    key: 'assetPath',
	    value: function assetPath(asset) {
	      return this._options.assetsUrl + '/' + asset;
	    }
	  }]);

	  return Helpers;
	})();

	exports['default'] = Helpers;
	module.exports = exports['default'];

/***/ },
/* 98 */
/***/ function(module, exports, __webpack_require__) {

	/* doT + auto-compilation of doT templates
	 *
	 * 2012, Laura Doktorova, https://github.com/olado/doT
	 * Licensed under the MIT license
	 *
	 * Compiles .def, .dot, .jst files found under the specified path.
	 * It ignores sub-directories.
	 * Template files can have multiple extensions at the same time.
	 * Files with .def extension can be included in other files via {{#def.name}}
	 * Files with .dot extension are compiled into functions with the same name and
	 * can be accessed as renderer.filename
	 * Files with .jst extension are compiled into .js files. Produced .js file can be
	 * loaded as a commonJS, AMD module, or just installed into a global variable
	 * (default is set to window.render).
	 * All inline defines defined in the .jst file are
	 * compiled into separate functions and are available via _render.filename.definename
	 *
	 * Basic usage:
	 * var dots = require("dot").process({path: "./views"});
	 * dots.mytemplate({foo:"hello world"});
	 *
	 * The above snippet will:
	 * 1. Compile all templates in views folder (.dot, .def, .jst)
	 * 2. Place .js files compiled from .jst templates into the same folder.
	 *    These files can be used with require, i.e. require("./views/mytemplate").
	 * 3. Return an object with functions compiled from .dot templates as its properties.
	 * 4. Render mytemplate template.
	 */

	var fs = __webpack_require__(52),
		doT = module.exports = __webpack_require__(102);

	doT.process = function(options) {
		//path, destination, global, rendermodule, templateSettings
		return new InstallDots(options).compileAll();
	};

	function InstallDots(o) {
		this.__path 		= o.path || "./";
		if (this.__path[this.__path.length-1] !== '/') this.__path += '/';
		this.__destination	= o.destination || this.__path;
		if (this.__destination[this.__destination.length-1] !== '/') this.__destination += '/';
		this.__global		= o.global || "window.render";
		this.__rendermodule	= o.rendermodule || {};
		this.__settings 	= o.templateSettings ? copy(o.templateSettings, copy(doT.templateSettings)) : undefined;
		this.__includes		= {};
	}

	InstallDots.prototype.compileToFile = function(path, template, def) {
		def = def || {};
		var modulename = path.substring(path.lastIndexOf("/")+1, path.lastIndexOf("."))
			, defs = copy(this.__includes, copy(def))
			, settings = this.__settings || doT.templateSettings
			, compileoptions = copy(settings)
			, defaultcompiled = doT.template(template, settings, defs)
			, exports = []
			, compiled = ""
			, fn;

		for (var property in defs) {
			if (defs[property] !== def[property] && defs[property] !== this.__includes[property]) {
				fn = undefined;
				if (typeof defs[property] === 'string') {
					fn = doT.template(defs[property], settings, defs);
				} else if (typeof defs[property] === 'function') {
					fn = defs[property];
				} else if (defs[property].arg) {
					compileoptions.varname = defs[property].arg;
					fn = doT.template(defs[property].text, compileoptions, defs);
				}
				if (fn) {
					compiled += fn.toString().replace('anonymous', property);
					exports.push(property);
				}
			}
		}
		compiled += defaultcompiled.toString().replace('anonymous', modulename);
		fs.writeFileSync(path, "(function(){" + compiled
			+ "var itself=" + modulename + ", _encodeHTML=(" + doT.encodeHTMLSource.toString() + "(" + (settings.doNotSkipEncoded || '') + "));"
			+ addexports(exports)
			+ "if(typeof module!=='undefined' && module.exports) module.exports=itself;else if(typeof define==='function')define(function(){return itself;});else {"
			+ this.__global + "=" + this.__global + "||{};" + this.__global + "['" + modulename + "']=itself;}}());");
	};

	function addexports(exports) {
		for (var ret ='', i=0; i< exports.length; i++) {
			ret += "itself." + exports[i]+ "=" + exports[i]+";";
		}
		return ret;
	}

	function copy(o, to) {
		to = to || {};
		for (var property in o) {
			to[property] = o[property];
		}
		return to;
	}

	function readdata(path) {
		var data = fs.readFileSync(path);
		if (data) return data.toString();
		console.log("problems with " + path);
	}

	InstallDots.prototype.compilePath = function(path) {
		var data = readdata(path);
		if (data) {
			return doT.template(data,
						this.__settings || doT.templateSettings,
						copy(this.__includes));
		}
	};

	InstallDots.prototype.compileAll = function() {
		console.log("Compiling all doT templates...");

		var defFolder = this.__path,
			sources = fs.readdirSync(defFolder),
			k, l, name;

		for( k = 0, l = sources.length; k < l; k++) {
			name = sources[k];
			if (/\.def(\.dot|\.jst)?$/.test(name)) {
				console.log("Loaded def " + name);
				this.__includes[name.substring(0, name.indexOf('.'))] = readdata(defFolder + name);
			}
		}

		for( k = 0, l = sources.length; k < l; k++) {
			name = sources[k];
			if (/\.dot(\.def|\.jst)?$/.test(name)) {
				console.log("Compiling " + name + " to function");
				this.__rendermodule[name.substring(0, name.indexOf('.'))] = this.compilePath(defFolder + name);
			}
			if (/\.jst(\.dot|\.def)?$/.test(name)) {
				console.log("Compiling " + name + " to file");
				this.compileToFile(this.__destination + name.substring(0, name.indexOf('.')) + '.js',
						readdata(defFolder + name));
			}
		}
		return this.__rendermodule;
	};


/***/ },
/* 99 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _libEventEmitter = __webpack_require__(72);

	var _libEventEmitter2 = _interopRequireDefault(_libEventEmitter);

	var _libUtils = __webpack_require__(6);

	var _libUtils2 = _interopRequireDefault(_libUtils);

	var _libMathVector2 = __webpack_require__(50);

	var _libMathVector22 = _interopRequireDefault(_libMathVector2);

	var _lodash = __webpack_require__(1);

	var _lodash2 = _interopRequireDefault(_lodash);



	var Slider = (function (_EventEmitter) {
	  function Slider(element, options) {
	    _classCallCheck(this, Slider);

	    _get(Object.getPrototypeOf(Slider.prototype), 'constructor', this).call(this);

	    this._element = element;
	    this._options = _lodash2['default'].defaults(options, {
	      minValue: 0,
	      maxValue: 1,
	      defaultValue: 0
	    });

	    this._value = this._options.defaultValue;

	    this._sliderElement = this._element.querySelector('.imglykit-slider-slider');
	    this._dotElement = this._element.querySelector('.imglykit-slider-dot');
	    this._centerDotElement = this._element.querySelector('.imglykit-slider-center-dot');
	    this._fillElement = this._element.querySelector('.imglykit-slider-fill');
	    this._backgroundElement = this._element.querySelector('.imglykit-slider-background');

	    // Mouse event callbacks bound to class context
	    this._onMouseDown = this._onMouseDown.bind(this);
	    this._onMouseMove = this._onMouseMove.bind(this);
	    this._onMouseUp = this._onMouseUp.bind(this);
	    this._onCenterDotClick = this._onCenterDotClick.bind(this);
	    this._onBackgroundClick = this._onBackgroundClick.bind(this);

	    this._backgroundElement.addEventListener('click', this._onBackgroundClick);
	    this._fillElement.addEventListener('click', this._onBackgroundClick);

	    this._handleDot();
	  }

	  _inherits(Slider, _EventEmitter);

	  _createClass(Slider, [{
	    key: 'setValue',

	    /**
	     * Sets the given value
	     * @param {Number} value
	     */
	    value: function setValue(value) {
	      this._value = value;

	      var _options = this._options;
	      var maxValue = _options.maxValue;
	      var minValue = _options.minValue;

	      // Calculate the X position
	      var valueRange = maxValue - minValue;
	      var percentage = (value - minValue) / valueRange;
	      var sliderWidth = this._sliderElement.offsetWidth;
	      this._setX(sliderWidth * percentage);
	    }
	  }, {
	    key: '_setX',

	    /**
	     * Sets the slider position to the given X value and resizes
	     * the fill div
	     * @private
	     */
	    value: function _setX(x) {
	      this._xPosition = x;
	      this._dotElement.style.left = '' + x + 'px';

	      // X position relative to center to simplify calculations
	      var halfSliderWidth = this._sliderElement.offsetWidth / 2;
	      var relativeX = x - halfSliderWidth;

	      // Update style
	      this._fillElement.style.width = '' + Math.abs(relativeX) + 'px';
	      if (relativeX < 0) {
	        this._fillElement.style.left = halfSliderWidth - Math.abs(relativeX) + 'px';
	      } else {
	        this._fillElement.style.left = halfSliderWidth + 'px';
	      }
	    }
	  }, {
	    key: '_handleDot',

	    /**
	     * Handles the dot dragging
	     * @private
	     */
	    value: function _handleDot() {
	      this._dotElement.addEventListener('mousedown', this._onMouseDown);
	      this._dotElement.addEventListener('touchstart', this._onMouseDown);

	      if (this._centerDotElement) {
	        this._centerDotElement.addEventListener('click', this._onCenterDotClick);
	      }
	    }
	  }, {
	    key: '_onCenterDotClick',

	    /**
	     * Gets called when the user clicks the center button. Resets to default
	     * settings.
	     * @private
	     */
	    value: function _onCenterDotClick() {
	      this.setValue(this._options.defaultValue);
	      this.emit('update', this._value);
	    }
	  }, {
	    key: '_onBackgroundClick',

	    /**
	     * Gets called when the user clicks on the slider background
	     * @param {Event} e
	     * @private
	     */
	    value: function _onBackgroundClick(e) {
	      var position = _libUtils2['default'].getEventPosition(e);
	      var sliderOffset = this._sliderElement.getBoundingClientRect();
	      sliderOffset = new _libMathVector22['default'](sliderOffset.left, sliderOffset.y);

	      var relativePosition = position.clone().subtract(sliderOffset);

	      this._setX(relativePosition.x);
	      this._updateValue();
	    }
	  }, {
	    key: '_onMouseDown',

	    /**
	     * Gets called when the user presses a mouse button on the slider dot
	     * @private
	     */
	    value: function _onMouseDown(e) {
	      if (e.type === 'mousedown' && e.button !== 0) return;
	      e.preventDefault();

	      var mousePosition = _libUtils2['default'].getEventPosition(e);

	      document.addEventListener('mousemove', this._onMouseMove);
	      document.addEventListener('touchmove', this._onMouseMove);

	      document.addEventListener('mouseup', this._onMouseUp);
	      document.addEventListener('touchend', this._onMouseUp);

	      // Remember initial position
	      var dotPosition = this._dotElement.getBoundingClientRect();
	      var sliderPosition = this._sliderElement.getBoundingClientRect();

	      this._initialSliderX = dotPosition.left - sliderPosition.left;
	      this._initialMousePosition = mousePosition;
	    }
	  }, {
	    key: '_onMouseMove',

	    /**
	     * Gets called when the user drags the mouse
	     * @private
	     */
	    value: function _onMouseMove(e) {
	      e.preventDefault();

	      var mousePosition = _libUtils2['default'].getEventPosition(e);
	      var mouseDiff = mousePosition.subtract(this._initialMousePosition);

	      // Add half width of the dot for negative margin compensation
	      var halfDotWidth = this._dotElement.offsetWidth * 0.5;
	      var newSliderX = this._initialSliderX + mouseDiff.x + halfDotWidth;

	      // X boundaries
	      var sliderWidth = this._sliderElement.offsetWidth;
	      newSliderX = Math.max(0, Math.min(newSliderX, sliderWidth));

	      this._setX(newSliderX);
	      this._updateValue();
	    }
	  }, {
	    key: '_updateValue',

	    /**
	     * Updates the value using the slider position
	     * @private
	     */
	    value: function _updateValue() {
	      var sliderWidth = this._sliderElement.offsetWidth;

	      // Calculate the new value
	      var _options2 = this._options;
	      var minValue = _options2.minValue;
	      var maxValue = _options2.maxValue;

	      var percentage = this._xPosition / sliderWidth;
	      var value = minValue + (maxValue - minValue) * percentage;
	      this.emit('update', value);
	    }
	  }, {
	    key: '_onMouseUp',

	    /**
	     * Gets called when the user does not press the mouse button anymore
	     * @private
	     */
	    value: function _onMouseUp() {
	      document.removeEventListener('mousemove', this._onMouseMove);
	      document.removeEventListener('touchmove', this._onMouseMove);

	      document.removeEventListener('mouseup', this._onMouseUp);
	      document.removeEventListener('touchend', this._onMouseUp);
	    }
	  }], [{
	    key: 'template',

	    /**
	     * The partial template string
	     * @type {String}
	     */
	    get: function () {
	      return "{{##def.slider:\n  <div class=\"imglykit-slider\" id=\"{{=(typeof sliderId === \"undefined\"?'':sliderId)}}\">\n    <div class=\"imglykit-slider-minus\">\n      <img src=\"{{=it.helpers.assetPath('ui/night/slider/minus.png') }}\" />\n    </div>\n    <div class=\"imglykit-slider-slider\">\n      <div class=\"imglykit-slider-background\"></div>\n      <div class=\"imglykit-slider-fill\"></div>\n      <div class=\"imglykit-slider-center-dot\"></div>\n      <div class=\"imglykit-slider-dot\"></div>\n    </div>\n    <div class=\"imglykit-slider-plus\">\n      <img src=\"{{=it.helpers.assetPath('ui/night/slider/plus.png') }}\" />\n    </div>\n  </div>\n#}}\n";
	    }
	  }]);

	  return Slider;
	})(_libEventEmitter2['default']);

	exports['default'] = Slider;
	module.exports = exports['default'];

/***/ },
/* 100 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _slider = __webpack_require__(99);

	var _slider2 = _interopRequireDefault(_slider);



	var SimpleSlider = (function (_Slider) {
	  function SimpleSlider() {
	    _classCallCheck(this, SimpleSlider);

	    if (_Slider != null) {
	      _Slider.apply(this, arguments);
	    }
	  }

	  _inherits(SimpleSlider, _Slider);

	  _createClass(SimpleSlider, [{
	    key: '_setX',

	    /**
	     * Sets the slider position to the given X value and resizes
	     * the fill div
	     * @private
	     */
	    value: function _setX(x) {
	      this._xPosition = x;

	      this._dotElement.style.left = '' + x + 'px';
	      this._fillElement.style.width = '' + x + 'px';
	    }
	  }], [{
	    key: 'template',

	    /**
	     * The partial template string
	     * @type {String}
	     */
	    get: function () {
	      return "{{##def.simpleSlider:\n  <div class=\"imglykit-slider\" id=\"{{=(typeof sliderId === \"undefined\"?'':sliderId)}}\">\n    <div class=\"imglykit-slider-minus\">\n      <img src=\"{{=it.helpers.assetPath('ui/night/slider/minus.png') }}\" />\n    </div>\n    <div class=\"imglykit-slider-slider\">\n      <div class=\"imglykit-slider-background\"></div>\n      <div class=\"imglykit-slider-fill\"></div>\n      <div class=\"imglykit-slider-dot\"></div>\n    </div>\n    <div class=\"imglykit-slider-plus\">\n      <img src=\"{{=it.helpers.assetPath('ui/night/slider/plus.png') }}\" />\n    </div>\n  </div>\n#}}\n";
	    }
	  }]);

	  return SimpleSlider;
	})(_slider2['default']);

	exports['default'] = SimpleSlider;
	module.exports = exports['default'];

/***/ },
/* 101 */
/***/ function(module, exports, __webpack_require__) {

	/* global Image */
	/*!
	 * Copyright (c) 2013-2015 9elements GmbH
	 *
	 * Released under Attribution-NonCommercial 3.0 Unported
	 * http://creativecommons.org/licenses/by-nc/3.0/
	 *
	 * For commercial use, please contact us at contact@9elements.com
	 */

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _libEventEmitter = __webpack_require__(72);

	var _libEventEmitter2 = _interopRequireDefault(_libEventEmitter);

	var _libUtils = __webpack_require__(6);

	var _libUtils2 = _interopRequireDefault(_libUtils);

	var _libColor = __webpack_require__(7);

	var _libColor2 = _interopRequireDefault(_libColor);

	var _libMathVector2 = __webpack_require__(50);

	var _libMathVector22 = _interopRequireDefault(_libMathVector2);



	var ColorPicker = (function (_EventEmitter) {
	  function ColorPicker(ui, element) {
	    _classCallCheck(this, ColorPicker);

	    _get(Object.getPrototypeOf(ColorPicker.prototype), 'constructor', this).call(this);

	    this._ui = ui;
	    this._element = element;
	    this._visible = false;
	    this._loaded = false;

	    this._overlay = this._element.querySelector('.imglykit-color-picker-overlay');
	    this._currentColorCanvas = this._element.querySelector('.imglykit-color-picker-color');

	    this._alphaCanvas = this._element.querySelector('canvas.imglykit-color-picker-alpha');
	    this._alphaKnob = this._element.querySelector('.imglykit-color-picker-alpha-container .imglykit-transparent-knob');

	    this._hueCanvas = this._element.querySelector('canvas.imglykit-color-picker-hue');
	    this._hueKnob = this._element.querySelector('.imglykit-color-picker-hue-container .imglykit-transparent-knob');

	    this._saturationCanvas = this._element.querySelector('canvas.imglykit-color-picker-saturation');
	    this._saturationKnob = this._element.querySelector('.imglykit-color-picker-saturation-container .imglykit-transparent-knob');

	    this._transparencyImage = new Image();
	    this._transparencyImage.src = ui.helpers.assetPath('ui/night/transparency.png');
	    this._transparencyImage.addEventListener('load', this._onTransparencyImageLoad.bind(this));

	    this._onAlphaCanvasDown = this._onAlphaCanvasDown.bind(this);
	    this._onAlphaCanvasDrag = this._onAlphaCanvasDrag.bind(this);
	    this._onAlphaCanvasUp = this._onAlphaCanvasUp.bind(this);
	    this._onHueCanvasDown = this._onHueCanvasDown.bind(this);
	    this._onHueCanvasDrag = this._onHueCanvasDrag.bind(this);
	    this._onHueCanvasUp = this._onHueCanvasUp.bind(this);

	    this._onSaturationCanvasDown = this._onSaturationCanvasDown.bind(this);
	    this._onSaturationCanvasDrag = this._onSaturationCanvasDrag.bind(this);
	    this._onSaturationCanvasUp = this._onSaturationCanvasUp.bind(this);

	    this._onElementClick = this._onElementClick.bind(this);

	    this._handleToggle();
	    this._handleAlphaKnob();
	    this._handleHueKnob();
	    this._handleSaturationKnob();
	  }

	  _inherits(ColorPicker, _EventEmitter);

	  _createClass(ColorPicker, [{
	    key: '_onTransparencyImageLoad',
	    value: function _onTransparencyImageLoad() {
	      this._loaded = true;
	      this._render();
	    }
	  }, {
	    key: '_handleToggle',

	    /**
	     * Handles the toggling of the overlay
	     * @private
	     */
	    value: function _handleToggle() {
	      this._element.addEventListener('click', this._onElementClick);
	    }
	  }, {
	    key: '_onElementClick',

	    /**
	     * Gets called when the element has been clicked
	     * @param {Event} e
	     * @private
	     */
	    value: function _onElementClick(e) {
	      if (e.target === this._element || e.target === this._currentColorCanvas) {
	        if (this._visible) {
	          this.hide();
	          this.emit('hide');
	        } else {
	          this.show();
	          this.emit('show');
	        }
	      }
	    }
	  }, {
	    key: 'hide',

	    /**
	     * Hides the color picker
	     */
	    value: function hide() {
	      this._overlay.classList.remove('imglykit-visible');
	      this._visible = false;
	    }
	  }, {
	    key: 'show',

	    /**
	     * Shows the color picker
	     */
	    value: function show() {
	      this._overlay.classList.add('imglykit-visible');
	      this._visible = true;
	    }
	  }, {
	    key: 'setValue',

	    /**
	     * Sets the given value
	     * @param {Number} value
	     */
	    value: function setValue(value) {
	      this._value = value.clone();

	      var _value$toHSV = this._value.toHSV();

	      var _value$toHSV2 = _slicedToArray(_value$toHSV, 3);

	      var h = _value$toHSV2[0];
	      var s = _value$toHSV2[1];
	      var v = _value$toHSV2[2];

	      this._hsvColor = { h: h, s: s, v: v };
	      this._positionKnobs();
	      this._render();
	    }
	  }, {
	    key: '_positionKnobs',

	    /**
	     * Updates the knob positions to represent the current HSV color
	     * @private
	     */
	    value: function _positionKnobs() {
	      this._positionAlphaKnob();
	      this._positionHueKnob();
	      this._positionSaturationKnob();
	    }
	  }, {
	    key: '_positionAlphaKnob',

	    /**
	     * Positions the alpha knob according to the current alpha value
	     * @private
	     */
	    value: function _positionAlphaKnob() {
	      var canvas = this._alphaCanvas;
	      var canvasSize = new _libMathVector22['default'](canvas.width, canvas.height);

	      var left = this._value.a * canvasSize.x;
	      this._alphaKnob.style.left = '' + left + 'px';
	    }
	  }, {
	    key: '_positionHueKnob',

	    /**
	     * Positions the hue knob according to the current hue value
	     * @private
	     */
	    value: function _positionHueKnob() {
	      var canvas = this._hueCanvas;
	      var canvasSize = new _libMathVector22['default'](canvas.width, canvas.height);

	      var top = this._hsvColor.h * canvasSize.y;
	      this._hueKnob.style.top = '' + top + 'px';
	    }
	  }, {
	    key: '_positionSaturationKnob',

	    /**
	     * Positions the saturation knob according to the current saturation value
	     * @private
	     */
	    value: function _positionSaturationKnob() {
	      var canvas = this._saturationCanvas;
	      var canvasSize = new _libMathVector22['default'](canvas.width, canvas.height);

	      var left = this._hsvColor.s * canvasSize.x;
	      this._saturationKnob.style.left = '' + left + 'px';
	      var top = (1 - this._hsvColor.v) * canvasSize.y;
	      this._saturationKnob.style.top = '' + top + 'px';
	    }
	  }, {
	    key: '_render',

	    /**
	     * Updates and renders all controls to represent the current value
	     * @private
	     */
	    value: function _render() {
	      if (!this._loaded) return;
	      this._renderCurrentColor();
	      this._renderAlpha();
	      this._renderHue();
	      this._renderSaturation();
	    }
	  }, {
	    key: '_renderCurrentColor',

	    /**
	     * Renders the currently selected color on the controls canvas
	     * @private
	     */
	    value: function _renderCurrentColor() {
	      var canvas = this._currentColorCanvas;
	      var context = canvas.getContext('2d');

	      var pattern = context.createPattern(this._transparencyImage, 'repeat');
	      context.rect(0, 0, canvas.width, canvas.height);
	      context.fillStyle = pattern;
	      context.fill();

	      context.fillStyle = this._value.toRGBA();
	      context.fill();
	    }
	  }, {
	    key: '_renderAlpha',

	    /**
	     * Renders the transparency canvas with the current color
	     * @private
	     */
	    value: function _renderAlpha() {
	      var canvas = this._alphaCanvas;
	      var context = canvas.getContext('2d');

	      var pattern = context.createPattern(this._transparencyImage, 'repeat');
	      context.rect(0, 0, canvas.width, canvas.height);
	      context.fillStyle = pattern;
	      context.fill();

	      var gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);

	      var color = this._value.clone();
	      color.a = 0;
	      gradient.addColorStop(0, color.toRGBA());
	      gradient.addColorStop(1, this._value.toHex());
	      context.fillStyle = gradient;
	      context.fill();
	    }
	  }, {
	    key: '_renderHue',

	    /**
	     * Renders the hue canvas
	     * @private
	     */
	    value: function _renderHue() {
	      var canvas = this._hueCanvas;
	      var context = canvas.getContext('2d');

	      var color = new _libColor2['default']();
	      for (var y = 0; y < canvas.height; y++) {
	        var ratio = y / canvas.height;
	        color.fromHSV(ratio, 1, 1);

	        context.strokeStyle = color.toRGBA();
	        context.beginPath();
	        context.moveTo(0, y);
	        context.lineTo(canvas.width, y);
	        context.stroke();
	      }
	    }
	  }, {
	    key: '_renderSaturation',

	    /**
	     * Renders the saturation canvas
	     * @private
	     */
	    value: function _renderSaturation() {
	      var canvas = this._saturationCanvas;
	      var context = canvas.getContext('2d');

	      var imageData = context.getImageData(0, 0, canvas.width, canvas.height);

	      var color = new _libColor2['default'](1, 0, 0, 1);
	      for (var y = 0; y < canvas.height; y++) {
	        var value = (canvas.height - y) / canvas.height;
	        for (var x = 0; x < canvas.width; x++) {
	          var saturation = x / canvas.width;
	          color.fromHSV(this._hsvColor.h, saturation, value);
	          var r = color.r;
	          var g = color.g;
	          var b = color.b;
	          var a = color.a;

	          var index = (y * canvas.width + x) * 4;

	          imageData.data[index] = r * 255;
	          imageData.data[index + 1] = g * 255;
	          imageData.data[index + 2] = b * 255;
	          imageData.data[index + 3] = a * 255;
	        }
	      }

	      context.putImageData(imageData, 0, 0);
	    }
	  }, {
	    key: '_handleAlphaKnob',

	    /**
	     * Handles the dragging of the alpha knob
	     * @private
	     */
	    value: function _handleAlphaKnob() {
	      this._alphaCanvas.addEventListener('mousedown', this._onAlphaCanvasDown);
	      this._alphaCanvas.addEventListener('touchstart', this._onAlphaCanvasDown);
	    }
	  }, {
	    key: '_onAlphaCanvasDown',

	    /**
	     * Gets called when the user clicks the alpha knob
	     * @param {Event} e
	     * @private
	     */
	    value: function _onAlphaCanvasDown(e) {
	      e.preventDefault();

	      this._onAlphaCanvasDrag(e);

	      document.addEventListener('mousemove', this._onAlphaCanvasDrag);
	      document.addEventListener('touchmove', this._onAlphaCanvasDrag);

	      document.addEventListener('mouseup', this._onAlphaCanvasUp);
	      document.addEventListener('touchend', this._onAlphaCanvasUp);
	    }
	  }, {
	    key: '_onAlphaCanvasDrag',

	    /**
	     * Gets called when the user drags the alpha knob
	     * @param {Event} e
	     * @private
	     */
	    value: function _onAlphaCanvasDrag(e) {
	      e.preventDefault();

	      // Calculate relative mouse position on canvas
	      var canvas = this._alphaCanvas;
	      var canvasSize = new _libMathVector22['default'](canvas.width, canvas.height);
	      var mousePosition = _libUtils2['default'].getEventPosition(e);

	      var _canvas$getBoundingClientRect = canvas.getBoundingClientRect();

	      var left = _canvas$getBoundingClientRect.left;
	      var top = _canvas$getBoundingClientRect.top;

	      var offset = new _libMathVector22['default'](left, top);
	      var relativePosition = mousePosition.subtract(offset);
	      relativePosition.clamp(new _libMathVector22['default'](0, 0), canvasSize);

	      // Update knob css positioning
	      this._alphaKnob.style.left = '' + relativePosition.x + 'px';

	      // Update alpha value
	      this._value.a = relativePosition.x / canvasSize.x;
	      this._updateColor();
	    }
	  }, {
	    key: '_onAlphaCanvasUp',

	    /**
	     * Gets called when the user stops dragging the alpha knob
	     * @param {Event} e
	     * @private
	     */
	    value: function _onAlphaCanvasUp() {
	      document.removeEventListener('mousemove', this._onAlphaCanvasDrag);
	      document.removeEventListener('touchmove', this._onAlphaCanvasDrag);

	      document.removeEventListener('mouseup', this._onAlphaCanvasUp);
	      document.removeEventListener('touchend', this._onAlphaCanvasUp);
	    }
	  }, {
	    key: '_handleHueKnob',

	    /**
	     * Handles the dragging of the hue knob
	     * @private
	     */
	    value: function _handleHueKnob() {
	      this._hueCanvas.addEventListener('mousedown', this._onHueCanvasDown);
	      this._hueCanvas.addEventListener('touchstart', this._onHueCanvasDown);
	    }
	  }, {
	    key: '_onHueCanvasDown',

	    /**
	     * Gets called when the user clicks the canvas knob
	     * @param {Event} e
	     * @private
	     */
	    value: function _onHueCanvasDown(e) {
	      e.preventDefault();

	      this._onHueCanvasDrag(e);

	      document.addEventListener('mousemove', this._onHueCanvasDrag);
	      document.addEventListener('touchmove', this._onHueCanvasDrag);

	      document.addEventListener('mouseup', this._onHueCanvasUp);
	      document.addEventListener('touchend', this._onHueCanvasUp);
	    }
	  }, {
	    key: '_onHueCanvasDrag',

	    /**
	     * Gets called when the user drags the hue knob
	     * @param {Event} e
	     * @private
	     */
	    value: function _onHueCanvasDrag(e) {
	      e.preventDefault();

	      var canvas = this._hueCanvas;
	      var canvasSize = new _libMathVector22['default'](canvas.width, canvas.height);

	      // Calculate relative mouse position on canvas
	      var mousePosition = _libUtils2['default'].getEventPosition(e);

	      var _canvas$getBoundingClientRect2 = canvas.getBoundingClientRect();

	      var left = _canvas$getBoundingClientRect2.left;
	      var top = _canvas$getBoundingClientRect2.top;

	      var offset = new _libMathVector22['default'](left, top);
	      var relativePosition = mousePosition.subtract(offset);
	      relativePosition.clamp(new _libMathVector22['default'](0, 0), canvasSize);

	      // Update saturaiton knob css positioning
	      this._hueKnob.style.top = '' + relativePosition.y + 'px';

	      // Update saturation and value
	      relativePosition.divide(canvasSize);
	      this._hsvColor.h = relativePosition.y;
	      this._updateColor();
	    }
	  }, {
	    key: '_onHueCanvasUp',

	    /**
	     * Gets called when the user stops dragging the alpha knob
	     * @param {Event} e
	     * @private
	     */
	    value: function _onHueCanvasUp() {
	      document.removeEventListener('mousemove', this._onHueCanvasDrag);
	      document.removeEventListener('touchmove', this._onHueCanvasDrag);

	      document.removeEventListener('mouseup', this._onHueCanvasUp);
	      document.removeEventListener('touchend', this._onHueCanvasUp);
	    }
	  }, {
	    key: '_handleSaturationKnob',

	    /**
	     * Handles the dragging of the saturation knob
	     * @private
	     */
	    value: function _handleSaturationKnob() {
	      this._saturationCanvas.addEventListener('mousedown', this._onSaturationCanvasDown);
	      this._saturationCanvas.addEventListener('touchstart', this._onSaturationCanvasDown);
	    }
	  }, {
	    key: '_onSaturationCanvasDown',

	    /**
	     * Gets called when the user clicks the saturation canvas
	     * @param {Event} e
	     * @private
	     */
	    value: function _onSaturationCanvasDown(e) {
	      e.preventDefault();

	      this._onSaturationCanvasDrag(e);

	      document.addEventListener('mousemove', this._onSaturationCanvasDrag);
	      document.addEventListener('touchmove', this._onSaturationCanvasDrag);

	      document.addEventListener('mouseup', this._onSaturationCanvasUp);
	      document.addEventListener('touchend', this._onSaturationCanvasUp);
	    }
	  }, {
	    key: '_onSaturationCanvasDrag',

	    /**
	     * Gets called when the user drags the saturation knob
	     * @param {Event} e
	     * @private
	     */
	    value: function _onSaturationCanvasDrag(e) {
	      e.preventDefault();

	      var canvas = this._saturationCanvas;
	      var canvasSize = new _libMathVector22['default'](canvas.width, canvas.height);

	      // Calculate relative mouse position on canvas
	      var mousePosition = _libUtils2['default'].getEventPosition(e);

	      var _canvas$getBoundingClientRect3 = canvas.getBoundingClientRect();

	      var left = _canvas$getBoundingClientRect3.left;
	      var top = _canvas$getBoundingClientRect3.top;

	      var offset = new _libMathVector22['default'](left, top);
	      var relativePosition = mousePosition.subtract(offset);
	      relativePosition.clamp(0, canvas.width);

	      // Update saturaiton knob css positioning
	      this._saturationKnob.style.left = '' + relativePosition.x + 'px';
	      this._saturationKnob.style.top = '' + relativePosition.y + 'px';

	      // Update saturation and value
	      relativePosition.divide(canvasSize);
	      this._hsvColor.s = relativePosition.x;
	      this._hsvColor.v = 1 - relativePosition.y;
	      this._updateColor();
	    }
	  }, {
	    key: '_onSaturationCanvasUp',

	    /**
	     * Gets called when the user stops dragging the saturation knob
	     * @param {Event} e
	     * @private
	     */
	    value: function _onSaturationCanvasUp() {
	      document.removeEventListener('mousemove', this._onSaturationCanvasDrag);
	      document.removeEventListener('touchmove', this._onSaturationCanvasDrag);

	      document.removeEventListener('mouseup', this._onSaturationCanvasUp);
	      document.removeEventListener('touchend', this._onSaturationCanvasUp);
	    }
	  }, {
	    key: '_updateColor',

	    /**
	     * Updates the attached color, emits the `update` event and triggers
	     * a render
	     * @private
	     */
	    value: function _updateColor() {
	      this._value.fromHSV(this._hsvColor.h, this._hsvColor.s, this._hsvColor.v);
	      this.emit('update', this._value);
	      this._render();
	    }
	  }], [{
	    key: 'template',

	    /**
	     * The partial template string
	     * @type {String}
	     */
	    get: function () {
	      return "{{##def.colorpicker:\n  <div class=\"imglykit-color-picker\" id=\"{{=(typeof colorpickerId === \"undefined\"?'':colorpickerId)}}\">\n    <canvas class=\"imglykit-color-picker-color\" width=\"34\" height=\"34\"></canvas>\n    <div class=\"imglykit-controls-item-label\">{{=(typeof colorpickerLabel === \"undefined\"?'':colorpickerLabel)}}</div>\n\n    <div class=\"imglykit-color-picker-overlay\">\n      <div class=\"imglykit-color-picker-alpha-container\">\n        <canvas class=\"imglykit-color-picker-alpha\" width=\"200\" height=\"30\"></canvas>\n        <div class=\"imglykit-transparent-knob\"></div>\n      </div>\n\n      <div class=\"imglykit-color-picker-saturation-container\">\n        <canvas class=\"imglykit-color-picker-saturation\" width=\"160\" height=\"160\"></canvas>\n        <div class=\"imglykit-transparent-knob\"></div>\n      </div>\n\n      <div class=\"imglykit-color-picker-hue-container\">\n        <canvas class=\"imglykit-color-picker-hue\" width=\"30\" height=\"160\"></canvas>\n        <div class=\"imglykit-transparent-knob\"></div>\n      </div>\n    </div>\n  </div>\n#}}\n";
	    }
	  }]);

	  return ColorPicker;
	})(_libEventEmitter2['default']);

	exports['default'] = ColorPicker;
	module.exports = exports['default'];

/***/ },
/* 102 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;// doT.js
	// 2011-2014, Laura Doktorova, https://github.com/olado/doT
	// Licensed under the MIT license.

	(function() {
		"use strict";

		var doT = {
			version: "1.0.3",
			templateSettings: {
				evaluate:    /\{\{([\s\S]+?(\}?)+)\}\}/g,
				interpolate: /\{\{=([\s\S]+?)\}\}/g,
				encode:      /\{\{!([\s\S]+?)\}\}/g,
				use:         /\{\{#([\s\S]+?)\}\}/g,
				useParams:   /(^|[^\w$])def(?:\.|\[[\'\"])([\w$\.]+)(?:[\'\"]\])?\s*\:\s*([\w$\.]+|\"[^\"]+\"|\'[^\']+\'|\{[^\}]+\})/g,
				define:      /\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}/g,
				defineParams:/^\s*([\w$]+):([\s\S]+)/,
				conditional: /\{\{\?(\?)?\s*([\s\S]*?)\s*\}\}/g,
				iterate:     /\{\{~\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\}\})/g,
				varname:	"it",
				strip:		true,
				append:		true,
				selfcontained: false,
				doNotSkipEncoded: false
			},
			template: undefined, //fn, compile template
			compile:  undefined  //fn, for express
		}, _globals;

		doT.encodeHTMLSource = function(doNotSkipEncoded) {
			var encodeHTMLRules = { "&": "&#38;", "<": "&#60;", ">": "&#62;", '"': "&#34;", "'": "&#39;", "/": "&#47;" },
				matchHTML = doNotSkipEncoded ? /[&<>"'\/]/g : /&(?!#?\w+;)|<|>|"|'|\//g;
			return function(code) {
				return code ? code.toString().replace(matchHTML, function(m) {return encodeHTMLRules[m] || m;}) : "";
			};
		};

		_globals = (function(){ return this || (0,eval)("this"); }());

		if (typeof module !== "undefined" && module.exports) {
			module.exports = doT;
		} else if (true) {
			!(__WEBPACK_AMD_DEFINE_RESULT__ = function(){return doT;}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		} else {
			_globals.doT = doT;
		}

		var startend = {
			append: { start: "'+(",      end: ")+'",      startencode: "'+encodeHTML(" },
			split:  { start: "';out+=(", end: ");out+='", startencode: "';out+=encodeHTML(" }
		}, skip = /$^/;

		function resolveDefs(c, block, def) {
			return ((typeof block === "string") ? block : block.toString())
			.replace(c.define || skip, function(m, code, assign, value) {
				if (code.indexOf("def.") === 0) {
					code = code.substring(4);
				}
				if (!(code in def)) {
					if (assign === ":") {
						if (c.defineParams) value.replace(c.defineParams, function(m, param, v) {
							def[code] = {arg: param, text: v};
						});
						if (!(code in def)) def[code]= value;
					} else {
						new Function("def", "def['"+code+"']=" + value)(def);
					}
				}
				return "";
			})
			.replace(c.use || skip, function(m, code) {
				if (c.useParams) code = code.replace(c.useParams, function(m, s, d, param) {
					if (def[d] && def[d].arg && param) {
						var rw = (d+":"+param).replace(/'|\\/g, "_");
						def.__exp = def.__exp || {};
						def.__exp[rw] = def[d].text.replace(new RegExp("(^|[^\\w$])" + def[d].arg + "([^\\w$])", "g"), "$1" + param + "$2");
						return s + "def.__exp['"+rw+"']";
					}
				});
				var v = new Function("def", "return " + code)(def);
				return v ? resolveDefs(c, v, def) : v;
			});
		}

		function unescape(code) {
			return code.replace(/\\('|\\)/g, "$1").replace(/[\r\t\n]/g, " ");
		}

		doT.template = function(tmpl, c, def) {
			c = c || doT.templateSettings;
			var cse = c.append ? startend.append : startend.split, needhtmlencode, sid = 0, indv,
				str  = (c.use || c.define) ? resolveDefs(c, tmpl, def || {}) : tmpl;

			str = ("var out='" + (c.strip ? str.replace(/(^|\r|\n)\t* +| +\t*(\r|\n|$)/g," ")
						.replace(/\r|\n|\t|\/\*[\s\S]*?\*\//g,""): str)
				.replace(/'|\\/g, "\\$&")
				.replace(c.interpolate || skip, function(m, code) {
					return cse.start + unescape(code) + cse.end;
				})
				.replace(c.encode || skip, function(m, code) {
					needhtmlencode = true;
					return cse.startencode + unescape(code) + cse.end;
				})
				.replace(c.conditional || skip, function(m, elsecase, code) {
					return elsecase ?
						(code ? "';}else if(" + unescape(code) + "){out+='" : "';}else{out+='") :
						(code ? "';if(" + unescape(code) + "){out+='" : "';}out+='");
				})
				.replace(c.iterate || skip, function(m, iterate, vname, iname) {
					if (!iterate) return "';} } out+='";
					sid+=1; indv=iname || "i"+sid; iterate=unescape(iterate);
					return "';var arr"+sid+"="+iterate+";if(arr"+sid+"){var "+vname+","+indv+"=-1,l"+sid+"=arr"+sid+".length-1;while("+indv+"<l"+sid+"){"
						+vname+"=arr"+sid+"["+indv+"+=1];out+='";
				})
				.replace(c.evaluate || skip, function(m, code) {
					return "';" + unescape(code) + "out+='";
				})
				+ "';return out;")
				.replace(/\n/g, "\\n").replace(/\t/g, '\\t').replace(/\r/g, "\\r")
				.replace(/(\s|;|\}|^|\{)out\+='';/g, '$1').replace(/\+''/g, "");
				//.replace(/(\s|;|\}|^|\{)out\+=''\+/g,'$1out+=');

			if (needhtmlencode) {
				if (!c.selfcontained && _globals && !_globals._encodeHTML) _globals._encodeHTML = doT.encodeHTMLSource(c.doNotSkipEncoded);
				str = "var encodeHTML = typeof _encodeHTML !== 'undefined' ? _encodeHTML : ("
					+ doT.encodeHTMLSource.toString() + "(" + (c.doNotSkipEncoded || '') + "));"
					+ str;
			}
			try {
				return new Function(c.varname, str);
			} catch (e) {
				if (typeof console !== "undefined") console.log("Could not create a template function: " + str);
				throw e;
			}
		};

		doT.compile = function(tmpl, def) {
			return doT.template(tmpl, null, def);
		};
	}());


/***/ }
/******/ ])
});
;
require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var ImglyKit = _interopRequire(require("./src/js/imglykit"));

/* istanbul ignore next */
(function () {
  if (typeof window !== "undefined") {
    window.ImglyKit = ImglyKit;
  } else if (typeof module !== "undefined") {
    module.exports = ImglyKit;
  } else if (typeof global !== "undefined") {
    global.ImglyKit = ImglyKit;
  }
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./src/js/imglykit":12}],2:[function(require,module,exports){
(function (global){
"use strict";

if (global._babelPolyfill) {
  throw new Error("only one instance of babel/polyfill is allowed");
}
global._babelPolyfill = true;

require("core-js/shim");

require("regenerator-babel/runtime");
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"core-js/shim":3,"regenerator-babel/runtime":4}],3:[function(require,module,exports){
/**
 * Core.js 0.6.1
 * https://github.com/zloirock/core-js
 * License: http://rock.mit-license.org
 * © 2015 Denis Pushkarev
 */
!function(global, framework, undefined){
'use strict';

/******************************************************************************
 * Module : common                                                            *
 ******************************************************************************/

  // Shortcuts for [[Class]] & property names
var OBJECT          = 'Object'
  , FUNCTION        = 'Function'
  , ARRAY           = 'Array'
  , STRING          = 'String'
  , NUMBER          = 'Number'
  , REGEXP          = 'RegExp'
  , DATE            = 'Date'
  , MAP             = 'Map'
  , SET             = 'Set'
  , WEAKMAP         = 'WeakMap'
  , WEAKSET         = 'WeakSet'
  , SYMBOL          = 'Symbol'
  , PROMISE         = 'Promise'
  , MATH            = 'Math'
  , ARGUMENTS       = 'Arguments'
  , PROTOTYPE       = 'prototype'
  , CONSTRUCTOR     = 'constructor'
  , TO_STRING       = 'toString'
  , TO_STRING_TAG   = TO_STRING + 'Tag'
  , TO_LOCALE       = 'toLocaleString'
  , HAS_OWN         = 'hasOwnProperty'
  , FOR_EACH        = 'forEach'
  , ITERATOR        = 'iterator'
  , FF_ITERATOR     = '@@' + ITERATOR
  , PROCESS         = 'process'
  , CREATE_ELEMENT  = 'createElement'
  // Aliases global objects and prototypes
  , Function        = global[FUNCTION]
  , Object          = global[OBJECT]
  , Array           = global[ARRAY]
  , String          = global[STRING]
  , Number          = global[NUMBER]
  , RegExp          = global[REGEXP]
  , Date            = global[DATE]
  , Map             = global[MAP]
  , Set             = global[SET]
  , WeakMap         = global[WEAKMAP]
  , WeakSet         = global[WEAKSET]
  , Symbol          = global[SYMBOL]
  , Math            = global[MATH]
  , TypeError       = global.TypeError
  , RangeError      = global.RangeError
  , setTimeout      = global.setTimeout
  , setImmediate    = global.setImmediate
  , clearImmediate  = global.clearImmediate
  , parseInt        = global.parseInt
  , isFinite        = global.isFinite
  , process         = global[PROCESS]
  , nextTick        = process && process.nextTick
  , document        = global.document
  , html            = document && document.documentElement
  , navigator       = global.navigator
  , define          = global.define
  , console         = global.console || {}
  , ArrayProto      = Array[PROTOTYPE]
  , ObjectProto     = Object[PROTOTYPE]
  , FunctionProto   = Function[PROTOTYPE]
  , Infinity        = 1 / 0
  , DOT             = '.';

// http://jsperf.com/core-js-isobject
function isObject(it){
  return it !== null && (typeof it == 'object' || typeof it == 'function');
}
function isFunction(it){
  return typeof it == 'function';
}
// Native function?
var isNative = ctx(/./.test, /\[native code\]\s*\}\s*$/, 1);

// Object internal [[Class]] or toStringTag
// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring
var toString = ObjectProto[TO_STRING];
function setToStringTag(it, tag, stat){
  if(it && !has(it = stat ? it : it[PROTOTYPE], SYMBOL_TAG))hidden(it, SYMBOL_TAG, tag);
}
function cof(it){
  return toString.call(it).slice(8, -1);
}
function classof(it){
  var O, T;
  return it == undefined ? it === undefined ? 'Undefined' : 'Null'
    : typeof (T = (O = Object(it))[SYMBOL_TAG]) == 'string' ? T : cof(O);
}

// Function
var call  = FunctionProto.call
  , apply = FunctionProto.apply
  , REFERENCE_GET;
// Partial apply
function part(/* ...args */){
  var fn     = assertFunction(this)
    , length = arguments.length
    , args   = Array(length)
    , i      = 0
    , _      = path._
    , holder = false;
  while(length > i)if((args[i] = arguments[i++]) === _)holder = true;
  return function(/* ...args */){
    var that    = this
      , _length = arguments.length
      , i = 0, j = 0, _args;
    if(!holder && !_length)return invoke(fn, args, that);
    _args = args.slice();
    if(holder)for(;length > i; i++)if(_args[i] === _)_args[i] = arguments[j++];
    while(_length > j)_args.push(arguments[j++]);
    return invoke(fn, _args, that);
  }
}
// Optional / simple context binding
function ctx(fn, that, length){
  assertFunction(fn);
  if(~length && that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    }
    case 2: return function(a, b){
      return fn.call(that, a, b);
    }
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    }
  } return function(/* ...args */){
      return fn.apply(that, arguments);
  }
}
// Fast apply
// http://jsperf.lnkit.com/fast-apply/5
function invoke(fn, args, that){
  var un = that === undefined;
  switch(args.length | 0){
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
    case 5: return un ? fn(args[0], args[1], args[2], args[3], args[4])
                      : fn.call(that, args[0], args[1], args[2], args[3], args[4]);
  } return              fn.apply(that, args);
}

// Object:
var create           = Object.create
  , getPrototypeOf   = Object.getPrototypeOf
  , setPrototypeOf   = Object.setPrototypeOf
  , defineProperty   = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getOwnDescriptor = Object.getOwnPropertyDescriptor
  , getKeys          = Object.keys
  , getNames         = Object.getOwnPropertyNames
  , getSymbols       = Object.getOwnPropertySymbols
  , isFrozen         = Object.isFrozen
  , has              = ctx(call, ObjectProto[HAS_OWN], 2)
  // Dummy, fix for not array-like ES3 string in es5 module
  , ES5Object        = Object
  , Dict;
function toObject(it){
  return ES5Object(assertDefined(it));
}
function returnIt(it){
  return it;
}
function returnThis(){
  return this;
}
function get(object, key){
  if(has(object, key))return object[key];
}
function ownKeys(it){
  assertObject(it);
  return getSymbols ? getNames(it).concat(getSymbols(it)) : getNames(it);
}
// 19.1.2.1 Object.assign(target, source, ...)
var assign = Object.assign || function(target, source){
  var T = Object(assertDefined(target))
    , l = arguments.length
    , i = 1;
  while(l > i){
    var S      = ES5Object(arguments[i++])
      , keys   = getKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)T[key = keys[j++]] = S[key];
  }
  return T;
}
function keyOf(object, el){
  var O      = toObject(object)
    , keys   = getKeys(O)
    , length = keys.length
    , index  = 0
    , key;
  while(length > index)if(O[key = keys[index++]] === el)return key;
}

// Array
// array('str1,str2,str3') => ['str1', 'str2', 'str3']
function array(it){
  return String(it).split(',');
}
var push    = ArrayProto.push
  , unshift = ArrayProto.unshift
  , slice   = ArrayProto.slice
  , splice  = ArrayProto.splice
  , indexOf = ArrayProto.indexOf
  , forEach = ArrayProto[FOR_EACH];
/*
 * 0 -> forEach
 * 1 -> map
 * 2 -> filter
 * 3 -> some
 * 4 -> every
 * 5 -> find
 * 6 -> findIndex
 */
function createArrayMethod(type){
  var isMap       = type == 1
    , isFilter    = type == 2
    , isSome      = type == 3
    , isEvery     = type == 4
    , isFindIndex = type == 6
    , noholes     = type == 5 || isFindIndex;
  return function(callbackfn/*, that = undefined */){
    var O      = Object(assertDefined(this))
      , that   = arguments[1]
      , self   = ES5Object(O)
      , f      = ctx(callbackfn, that, 3)
      , length = toLength(self.length)
      , index  = 0
      , result = isMap ? Array(length) : isFilter ? [] : undefined
      , val, res;
    for(;length > index; index++)if(noholes || index in self){
      val = self[index];
      res = f(val, index, O);
      if(type){
        if(isMap)result[index] = res;             // map
        else if(res)switch(type){
          case 3: return true;                    // some
          case 5: return val;                     // find
          case 6: return index;                   // findIndex
          case 2: result.push(val);               // filter
        } else if(isEvery)return false;           // every
      }
    }
    return isFindIndex ? -1 : isSome || isEvery ? isEvery : result;
  }
}
function createArrayContains(isContains){
  return function(el /*, fromIndex = 0 */){
    var O      = toObject(this)
      , length = toLength(O.length)
      , index  = toIndex(arguments[1], length);
    if(isContains && el != el){
      for(;length > index; index++)if(sameNaN(O[index]))return isContains || index;
    } else for(;length > index; index++)if(isContains || index in O){
      if(O[index] === el)return isContains || index;
    } return !isContains && -1;
  }
}
function generic(A, B){
  // strange IE quirks mode bug -> use typeof vs isFunction
  return typeof A == 'function' ? A : B;
}

// Math
var MAX_SAFE_INTEGER = 0x1fffffffffffff // pow(2, 53) - 1 == 9007199254740991
  , pow    = Math.pow
  , abs    = Math.abs
  , ceil   = Math.ceil
  , floor  = Math.floor
  , max    = Math.max
  , min    = Math.min
  , random = Math.random
  , trunc  = Math.trunc || function(it){
      return (it > 0 ? floor : ceil)(it);
    }
// 20.1.2.4 Number.isNaN(number)
function sameNaN(number){
  return number != number;
}
// 7.1.4 ToInteger
function toInteger(it){
  return isNaN(it) ? 0 : trunc(it);
}
// 7.1.15 ToLength
function toLength(it){
  return it > 0 ? min(toInteger(it), MAX_SAFE_INTEGER) : 0;
}
function toIndex(index, length){
  var index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
}
function lz(num){
  return num > 9 ? num : '0' + num;
}

function createReplacer(regExp, replace, isStatic){
  var replacer = isObject(replace) ? function(part){
    return replace[part];
  } : replace;
  return function(it){
    return String(isStatic ? it : this).replace(regExp, replacer);
  }
}
function createPointAt(toString){
  return function(pos){
    var s = String(assertDefined(this))
      , i = toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return toString ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? toString ? s.charAt(i) : a
      : toString ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  }
}

// Assertion & errors
var REDUCE_ERROR = 'Reduce of empty object with no initial value';
function assert(condition, msg1, msg2){
  if(!condition)throw TypeError(msg2 ? msg1 + msg2 : msg1);
}
function assertDefined(it){
  if(it == undefined)throw TypeError('Function called on null or undefined');
  return it;
}
function assertFunction(it){
  assert(isFunction(it), it, ' is not a function!');
  return it;
}
function assertObject(it){
  assert(isObject(it), it, ' is not an object!');
  return it;
}
function assertInstance(it, Constructor, name){
  assert(it instanceof Constructor, name, ": use the 'new' operator!");
}

// Property descriptors & Symbol
function descriptor(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  }
}
function simpleSet(object, key, value){
  object[key] = value;
  return object;
}
function createDefiner(bitmap){
  return DESC ? function(object, key, value){
    return defineProperty(object, key, descriptor(bitmap, value));
  } : simpleSet;
}
function uid(key){
  return SYMBOL + '(' + key + ')_' + (++sid + random())[TO_STRING](36);
}
function getWellKnownSymbol(name, setter){
  return (Symbol && Symbol[name]) || (setter ? Symbol : safeSymbol)(SYMBOL + DOT + name);
}
// The engine works fine with descriptors? Thank's IE8 for his funny defineProperty.
var DESC = !!function(){
      try {
        return defineProperty({}, 'a', {get: function(){ return 2 }}).a == 2;
      } catch(e){}
    }()
  , sid    = 0
  , hidden = createDefiner(1)
  , set    = Symbol ? simpleSet : hidden
  , safeSymbol = Symbol || uid;
function assignHidden(target, src){
  for(var key in src)hidden(target, key, src[key]);
  return target;
}

var SYMBOL_UNSCOPABLES = getWellKnownSymbol('unscopables')
  , ArrayUnscopables   = ArrayProto[SYMBOL_UNSCOPABLES] || {}
  , SYMBOL_TAG         = getWellKnownSymbol(TO_STRING_TAG)
  , SYMBOL_SPECIES     = getWellKnownSymbol('species')
  , SYMBOL_ITERATOR;
function setSpecies(C){
  if(DESC && (framework || !isNative(C)))defineProperty(C, SYMBOL_SPECIES, {
    configurable: true,
    get: returnThis
  });
}

/******************************************************************************
 * Module : common.export                                                     *
 ******************************************************************************/

var NODE = cof(process) == PROCESS
  , core = {}
  , path = framework ? global : core
  , old  = global.core
  , exportGlobal
  // type bitmap
  , FORCED = 1
  , GLOBAL = 2
  , STATIC = 4
  , PROTO  = 8
  , BIND   = 16
  , WRAP   = 32;
function $define(type, name, source){
  var key, own, out, exp
    , isGlobal = type & GLOBAL
    , target   = isGlobal ? global : (type & STATIC)
        ? global[name] : (global[name] || ObjectProto)[PROTOTYPE]
    , exports  = isGlobal ? core : core[name] || (core[name] = {});
  if(isGlobal)source = name;
  for(key in source){
    // there is a similar native
    own = !(type & FORCED) && target && key in target
      && (!isFunction(target[key]) || isNative(target[key]));
    // export native or passed
    out = (own ? target : source)[key];
    // prevent global pollution for namespaces
    if(!framework && isGlobal && !isFunction(target[key]))exp = source[key];
    // bind timers to global for call from export context
    else if(type & BIND && own)exp = ctx(out, global);
    // wrap global constructors for prevent change them in library
    else if(type & WRAP && !framework && target[key] == out){
      exp = function(param){
        return this instanceof out ? new out(param) : out(param);
      }
      exp[PROTOTYPE] = out[PROTOTYPE];
    } else exp = type & PROTO && isFunction(out) ? ctx(call, out) : out;
    // extend global
    if(framework && target && !own){
      if(isGlobal)target[key] = out;
      else delete target[key] && hidden(target, key, out);
    }
    // export
    if(exports[key] != out)hidden(exports, key, exp);
  }
}
// CommonJS export
if(typeof module != 'undefined' && module.exports)module.exports = core;
// RequireJS export
else if(isFunction(define) && define.amd)define(function(){return core});
// Export to global object
else exportGlobal = true;
if(exportGlobal || framework){
  core.noConflict = function(){
    global.core = old;
    return core;
  }
  global.core = core;
}

/******************************************************************************
 * Module : common.iterators                                                  *
 ******************************************************************************/

SYMBOL_ITERATOR = getWellKnownSymbol(ITERATOR);
var ITER  = safeSymbol('iter')
  , KEY   = 1
  , VALUE = 2
  , Iterators = {}
  , IteratorPrototype = {}
    // Safari has byggy iterators w/o `next`
  , BUGGY_ITERATORS = 'keys' in ArrayProto && !('next' in [].keys());
// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
setIterator(IteratorPrototype, returnThis);
function setIterator(O, value){
  hidden(O, SYMBOL_ITERATOR, value);
  // Add iterator for FF iterator protocol
  FF_ITERATOR in ArrayProto && hidden(O, FF_ITERATOR, value);
}
function createIterator(Constructor, NAME, next, proto){
  Constructor[PROTOTYPE] = create(proto || IteratorPrototype, {next: descriptor(1, next)});
  setToStringTag(Constructor, NAME + ' Iterator');
}
function defineIterator(Constructor, NAME, value, DEFAULT){
  var proto = Constructor[PROTOTYPE]
    , iter  = get(proto, SYMBOL_ITERATOR) || get(proto, FF_ITERATOR) || (DEFAULT && get(proto, DEFAULT)) || value;
  if(framework){
    // Define iterator
    setIterator(proto, iter);
    if(iter !== value){
      var iterProto = getPrototypeOf(iter.call(new Constructor));
      // Set @@toStringTag to native iterators
      setToStringTag(iterProto, NAME + ' Iterator', true);
      // FF fix
      has(proto, FF_ITERATOR) && setIterator(iterProto, returnThis);
    }
  }
  // Plug for library
  Iterators[NAME] = iter;
  // FF & v8 fix
  Iterators[NAME + ' Iterator'] = returnThis;
  return iter;
}
function defineStdIterators(Base, NAME, Constructor, next, DEFAULT, IS_SET){
  function createIter(kind){
    return function(){
      return new Constructor(this, kind);
    }
  }
  createIterator(Constructor, NAME, next);
  var entries = createIter(KEY+VALUE)
    , values  = createIter(VALUE);
  if(DEFAULT == VALUE)values = defineIterator(Base, NAME, values, 'values');
  else entries = defineIterator(Base, NAME, entries, 'entries');
  if(DEFAULT){
    $define(PROTO + FORCED * BUGGY_ITERATORS, NAME, {
      entries: entries,
      keys: IS_SET ? values : createIter(KEY),
      values: values
    });
  }
}
function iterResult(done, value){
  return {value: value, done: !!done};
}
function isIterable(it){
  var O      = Object(it)
    , Symbol = global[SYMBOL]
    , hasExt = (Symbol && Symbol[ITERATOR] || FF_ITERATOR) in O;
  return hasExt || SYMBOL_ITERATOR in O || has(Iterators, classof(O));
}
function getIterator(it){
  var Symbol  = global[SYMBOL]
    , ext     = it[Symbol && Symbol[ITERATOR] || FF_ITERATOR]
    , getIter = ext || it[SYMBOL_ITERATOR] || Iterators[classof(it)];
  return assertObject(getIter.call(it));
}
function stepCall(fn, value, entries){
  return entries ? invoke(fn, value) : fn(value);
}
function checkDangerIterClosing(fn){
  var danger = true;
  var O = {
    next: function(){ throw 1 },
    'return': function(){ danger = false }
  };
  O[SYMBOL_ITERATOR] = returnThis;
  try {
    fn(O);
  } catch(e){}
  return danger;
}
function closeIterator(iterator){
  var ret = iterator['return'];
  if(ret !== undefined)ret.call(iterator);
}
function safeIterClose(exec, iterator){
  try {
    exec(iterator);
  } catch(e){
    closeIterator(iterator);
    throw e;
  }
}
function forOf(iterable, entries, fn, that){
  safeIterClose(function(iterator){
    var f = ctx(fn, that, entries ? 2 : 1)
      , step;
    while(!(step = iterator.next()).done)if(stepCall(f, step.value, entries) === false){
      return closeIterator(iterator);
    }
  }, getIterator(iterable));
}

/******************************************************************************
 * Module : es6.symbol                                                        *
 ******************************************************************************/

// ECMAScript 6 symbols shim
!function(TAG, SymbolRegistry, AllSymbols, setter){
  // 19.4.1.1 Symbol([description])
  if(!isNative(Symbol)){
    Symbol = function(description){
      assert(!(this instanceof Symbol), SYMBOL + ' is not a ' + CONSTRUCTOR);
      var tag = uid(description)
        , sym = set(create(Symbol[PROTOTYPE]), TAG, tag);
      AllSymbols[tag] = sym;
      DESC && setter && defineProperty(ObjectProto, tag, {
        configurable: true,
        set: function(value){
          hidden(this, tag, value);
        }
      });
      return sym;
    }
    hidden(Symbol[PROTOTYPE], TO_STRING, function(){
      return this[TAG];
    });
  }
  $define(GLOBAL + WRAP, {Symbol: Symbol});
  
  var symbolStatics = {
    // 19.4.2.1 Symbol.for(key)
    'for': function(key){
      return has(SymbolRegistry, key += '')
        ? SymbolRegistry[key]
        : SymbolRegistry[key] = Symbol(key);
    },
    // 19.4.2.4 Symbol.iterator
    iterator: SYMBOL_ITERATOR || getWellKnownSymbol(ITERATOR),
    // 19.4.2.5 Symbol.keyFor(sym)
    keyFor: part.call(keyOf, SymbolRegistry),
    // 19.4.2.10 Symbol.species
    species: SYMBOL_SPECIES,
    // 19.4.2.13 Symbol.toStringTag
    toStringTag: SYMBOL_TAG = getWellKnownSymbol(TO_STRING_TAG, true),
    // 19.4.2.14 Symbol.unscopables
    unscopables: SYMBOL_UNSCOPABLES,
    pure: safeSymbol,
    set: set,
    useSetter: function(){setter = true},
    useSimple: function(){setter = false}
  };
  // 19.4.2.2 Symbol.hasInstance
  // 19.4.2.3 Symbol.isConcatSpreadable
  // 19.4.2.6 Symbol.match
  // 19.4.2.8 Symbol.replace
  // 19.4.2.9 Symbol.search
  // 19.4.2.11 Symbol.split
  // 19.4.2.12 Symbol.toPrimitive
  forEach.call(array('hasInstance,isConcatSpreadable,match,replace,search,split,toPrimitive'),
    function(it){
      symbolStatics[it] = getWellKnownSymbol(it);
    }
  );
  $define(STATIC, SYMBOL, symbolStatics);
  
  setToStringTag(Symbol, SYMBOL);
  
  $define(STATIC + FORCED * !isNative(Symbol), OBJECT, {
    // 19.1.2.7 Object.getOwnPropertyNames(O)
    getOwnPropertyNames: function(it){
      var names = getNames(toObject(it)), result = [], key, i = 0;
      while(names.length > i)has(AllSymbols, key = names[i++]) || result.push(key);
      return result;
    },
    // 19.1.2.8 Object.getOwnPropertySymbols(O)
    getOwnPropertySymbols: function(it){
      var names = getNames(toObject(it)), result = [], key, i = 0;
      while(names.length > i)has(AllSymbols, key = names[i++]) && result.push(AllSymbols[key]);
      return result;
    }
  });
  
  // 20.2.1.9 Math[@@toStringTag]
  setToStringTag(Math, MATH, true);
  // 24.3.3 JSON[@@toStringTag]
  setToStringTag(global.JSON, 'JSON', true);
}(safeSymbol('tag'), {}, {}, true);

/******************************************************************************
 * Module : es6.object.statics                                                *
 ******************************************************************************/

!function(){
  var objectStatic = {
    // 19.1.3.1 Object.assign(target, source)
    assign: assign,
    // 19.1.3.10 Object.is(value1, value2)
    is: function(x, y){
      return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
    }
  };
  // 19.1.3.19 Object.setPrototypeOf(O, proto)
  // Works with __proto__ only. Old v8 can't works with null proto objects.
  '__proto__' in ObjectProto && function(buggy, set){
    try {
      set = ctx(call, getOwnDescriptor(ObjectProto, '__proto__').set, 2);
      set({}, ArrayProto);
    } catch(e){ buggy = true }
    objectStatic.setPrototypeOf = setPrototypeOf = setPrototypeOf || function(O, proto){
      assertObject(O);
      assert(proto === null || isObject(proto), proto, ": can't set as prototype!");
      if(buggy)O.__proto__ = proto;
      else set(O, proto);
      return O;
    }
  }();
  $define(STATIC, OBJECT, objectStatic);
}();

/******************************************************************************
 * Module : es6.object.prototype                                              *
 ******************************************************************************/

!function(tmp){
  // 19.1.3.6 Object.prototype.toString()
  tmp[SYMBOL_TAG] = DOT;
  if(cof(tmp) != DOT)hidden(ObjectProto, TO_STRING, function(){
    return '[object ' + classof(this) + ']';
  });
}({});

/******************************************************************************
 * Module : es6.object.statics-accept-primitives                              *
 ******************************************************************************/

!function(){
  // Object static methods accept primitives
  function wrapObjectMethod(key, MODE){
    var fn  = Object[key]
      , exp = core[OBJECT][key]
      , f   = 0
      , o   = {};
    if(!exp || isNative(exp)){
      o[key] = MODE == 1 ? function(it){
        return isObject(it) ? fn(it) : it;
      } : MODE == 2 ? function(it){
        return isObject(it) ? fn(it) : true;
      } : MODE == 3 ? function(it){
        return isObject(it) ? fn(it) : false;
      } : MODE == 4 ? function(it, key){
        return fn(toObject(it), key);
      } : function(it){
        return fn(toObject(it));
      };
      try { fn(DOT) }
      catch(e){ f = 1 }
      $define(STATIC + FORCED * f, OBJECT, o);
    }
  }
  wrapObjectMethod('freeze', 1);
  wrapObjectMethod('seal', 1);
  wrapObjectMethod('preventExtensions', 1);
  wrapObjectMethod('isFrozen', 2);
  wrapObjectMethod('isSealed', 2);
  wrapObjectMethod('isExtensible', 3);
  wrapObjectMethod('getOwnPropertyDescriptor', 4);
  wrapObjectMethod('getPrototypeOf');
  wrapObjectMethod('keys');
  wrapObjectMethod('getOwnPropertyNames');
}();

/******************************************************************************
 * Module : es6.function                                                      *
 ******************************************************************************/

!function(NAME){
  // 19.2.4.2 name
  NAME in FunctionProto || (DESC && defineProperty(FunctionProto, NAME, {
    configurable: true,
    get: function(){
      var match = String(this).match(/^\s*function ([^ (]*)/)
        , name  = match ? match[1] : '';
      has(this, NAME) || defineProperty(this, NAME, descriptor(5, name));
      return name;
    },
    set: function(value){
      has(this, NAME) || defineProperty(this, NAME, descriptor(0, value));
    }
  }));
}('name');

/******************************************************************************
 * Module : es6.number.constructor                                            *
 ******************************************************************************/

Number('0o1') && Number('0b1') || function(_Number, NumberProto){
  function toNumber(it){
    if(isObject(it))it = toPrimitive(it);
    if(typeof it == 'string' && it.length > 2 && it.charCodeAt(0) == 48){
      var binary = false;
      switch(it.charCodeAt(1)){
        case 66 : case 98  : binary = true;
        case 79 : case 111 : return parseInt(it.slice(2), binary ? 2 : 8);
      }
    } return +it;
  }
  function toPrimitive(it){
    var fn, val;
    if(isFunction(fn = it.valueOf) && !isObject(val = fn.call(it)))return val;
    if(isFunction(fn = it[TO_STRING]) && !isObject(val = fn.call(it)))return val;
    throw TypeError("Can't convert object to number");
  }
  Number = function Number(it){
    return this instanceof Number ? new _Number(toNumber(it)) : toNumber(it);
  }
  forEach.call(DESC ? getNames(_Number)
  : array('MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY'), function(key){
    key in Number || defineProperty(Number, key, getOwnDescriptor(_Number, key));
  });
  Number[PROTOTYPE] = NumberProto;
  NumberProto[CONSTRUCTOR] = Number;
  hidden(global, NUMBER, Number);
}(Number, Number[PROTOTYPE]);

/******************************************************************************
 * Module : es6.number.statics                                                *
 ******************************************************************************/

!function(isInteger){
  $define(STATIC, NUMBER, {
    // 20.1.2.1 Number.EPSILON
    EPSILON: pow(2, -52),
    // 20.1.2.2 Number.isFinite(number)
    isFinite: function(it){
      return typeof it == 'number' && isFinite(it);
    },
    // 20.1.2.3 Number.isInteger(number)
    isInteger: isInteger,
    // 20.1.2.4 Number.isNaN(number)
    isNaN: sameNaN,
    // 20.1.2.5 Number.isSafeInteger(number)
    isSafeInteger: function(number){
      return isInteger(number) && abs(number) <= MAX_SAFE_INTEGER;
    },
    // 20.1.2.6 Number.MAX_SAFE_INTEGER
    MAX_SAFE_INTEGER: MAX_SAFE_INTEGER,
    // 20.1.2.10 Number.MIN_SAFE_INTEGER
    MIN_SAFE_INTEGER: -MAX_SAFE_INTEGER,
    // 20.1.2.12 Number.parseFloat(string)
    parseFloat: parseFloat,
    // 20.1.2.13 Number.parseInt(string, radix)
    parseInt: parseInt
  });
// 20.1.2.3 Number.isInteger(number)
}(Number.isInteger || function(it){
  return !isObject(it) && isFinite(it) && floor(it) === it;
});

/******************************************************************************
 * Module : es6.math                                                          *
 ******************************************************************************/

// ECMAScript 6 shim
!function(){
  // 20.2.2.28 Math.sign(x)
  var E    = Math.E
    , exp  = Math.exp
    , log  = Math.log
    , sqrt = Math.sqrt
    , sign = Math.sign || function(x){
        return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
      };
  
  // 20.2.2.5 Math.asinh(x)
  function asinh(x){
    return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : log(x + sqrt(x * x + 1));
  }
  // 20.2.2.14 Math.expm1(x)
  function expm1(x){
    return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : exp(x) - 1;
  }
    
  $define(STATIC, MATH, {
    // 20.2.2.3 Math.acosh(x)
    acosh: function(x){
      return (x = +x) < 1 ? NaN : isFinite(x) ? log(x / E + sqrt(x + 1) * sqrt(x - 1) / E) + 1 : x;
    },
    // 20.2.2.5 Math.asinh(x)
    asinh: asinh,
    // 20.2.2.7 Math.atanh(x)
    atanh: function(x){
      return (x = +x) == 0 ? x : log((1 + x) / (1 - x)) / 2;
    },
    // 20.2.2.9 Math.cbrt(x)
    cbrt: function(x){
      return sign(x = +x) * pow(abs(x), 1 / 3);
    },
    // 20.2.2.11 Math.clz32(x)
    clz32: function(x){
      return (x >>>= 0) ? 32 - x[TO_STRING](2).length : 32;
    },
    // 20.2.2.12 Math.cosh(x)
    cosh: function(x){
      return (exp(x = +x) + exp(-x)) / 2;
    },
    // 20.2.2.14 Math.expm1(x)
    expm1: expm1,
    // 20.2.2.16 Math.fround(x)
    // TODO: fallback for IE9-
    fround: function(x){
      return new Float32Array([x])[0];
    },
    // 20.2.2.17 Math.hypot([value1[, value2[, … ]]])
    hypot: function(value1, value2){
      var sum  = 0
        , len1 = arguments.length
        , len2 = len1
        , args = Array(len1)
        , larg = -Infinity
        , arg;
      while(len1--){
        arg = args[len1] = +arguments[len1];
        if(arg == Infinity || arg == -Infinity)return Infinity;
        if(arg > larg)larg = arg;
      }
      larg = arg || 1;
      while(len2--)sum += pow(args[len2] / larg, 2);
      return larg * sqrt(sum);
    },
    // 20.2.2.18 Math.imul(x, y)
    imul: function(x, y){
      var UInt16 = 0xffff
        , xn = +x
        , yn = +y
        , xl = UInt16 & xn
        , yl = UInt16 & yn;
      return 0 | xl * yl + ((UInt16 & xn >>> 16) * yl + xl * (UInt16 & yn >>> 16) << 16 >>> 0);
    },
    // 20.2.2.20 Math.log1p(x)
    log1p: function(x){
      return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : log(1 + x);
    },
    // 20.2.2.21 Math.log10(x)
    log10: function(x){
      return log(x) / Math.LN10;
    },
    // 20.2.2.22 Math.log2(x)
    log2: function(x){
      return log(x) / Math.LN2;
    },
    // 20.2.2.28 Math.sign(x)
    sign: sign,
    // 20.2.2.30 Math.sinh(x)
    sinh: function(x){
      return (abs(x = +x) < 1) ? (expm1(x) - expm1(-x)) / 2 : (exp(x - 1) - exp(-x - 1)) * (E / 2);
    },
    // 20.2.2.33 Math.tanh(x)
    tanh: function(x){
      var a = expm1(x = +x)
        , b = expm1(-x);
      return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(x) + exp(-x));
    },
    // 20.2.2.34 Math.trunc(x)
    trunc: trunc
  });
}();

/******************************************************************************
 * Module : es6.string                                                        *
 ******************************************************************************/

!function(fromCharCode){
  function assertNotRegExp(it){
    if(cof(it) == REGEXP)throw TypeError();
  }
  
  $define(STATIC, STRING, {
    // 21.1.2.2 String.fromCodePoint(...codePoints)
    fromCodePoint: function(x){
      var res = []
        , len = arguments.length
        , i   = 0
        , code
      while(len > i){
        code = +arguments[i++];
        if(toIndex(code, 0x10ffff) !== code)throw RangeError(code + ' is not a valid code point');
        res.push(code < 0x10000
          ? fromCharCode(code)
          : fromCharCode(((code -= 0x10000) >> 10) + 0xd800, code % 0x400 + 0xdc00)
        );
      } return res.join('');
    },
    // 21.1.2.4 String.raw(callSite, ...substitutions)
    raw: function(callSite){
      var raw = toObject(callSite.raw)
        , len = toLength(raw.length)
        , sln = arguments.length
        , res = []
        , i   = 0;
      while(len > i){
        res.push(String(raw[i++]));
        if(i < sln)res.push(String(arguments[i]));
      } return res.join('');
    }
  });
  
  $define(PROTO, STRING, {
    // 21.1.3.3 String.prototype.codePointAt(pos)
    codePointAt: createPointAt(false),
    // 21.1.3.6 String.prototype.endsWith(searchString [, endPosition])
    endsWith: function(searchString /*, endPosition = @length */){
      assertNotRegExp(searchString);
      var that = String(assertDefined(this))
        , endPosition = arguments[1]
        , len = toLength(that.length)
        , end = endPosition === undefined ? len : min(toLength(endPosition), len);
      searchString += '';
      return that.slice(end - searchString.length, end) === searchString;
    },
    // 21.1.3.7 String.prototype.includes(searchString, position = 0)
    includes: function(searchString /*, position = 0 */){
      assertNotRegExp(searchString);
      return !!~String(assertDefined(this)).indexOf(searchString, arguments[1]);
    },
    // 21.1.3.13 String.prototype.repeat(count)
    repeat: function(count){
      var str = String(assertDefined(this))
        , res = ''
        , n   = toInteger(count);
      if(0 > n || n == Infinity)throw RangeError("Count can't be negative");
      for(;n > 0; (n >>>= 1) && (str += str))if(n & 1)res += str;
      return res;
    },
    // 21.1.3.18 String.prototype.startsWith(searchString [, position ])
    startsWith: function(searchString /*, position = 0 */){
      assertNotRegExp(searchString);
      var that  = String(assertDefined(this))
        , index = toLength(min(arguments[1], that.length));
      searchString += '';
      return that.slice(index, index + searchString.length) === searchString;
    }
  });
}(String.fromCharCode);

/******************************************************************************
 * Module : es6.array.statics                                                 *
 ******************************************************************************/

!function(){
  $define(STATIC + FORCED * checkDangerIterClosing(Array.from), ARRAY, {
    // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
    from: function(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
      var O       = Object(assertDefined(arrayLike))
        , mapfn   = arguments[1]
        , mapping = mapfn !== undefined
        , f       = mapping ? ctx(mapfn, arguments[2], 2) : undefined
        , index   = 0
        , length, result, step;
      if(isIterable(O)){
        result = new (generic(this, Array));
        safeIterClose(function(iterator){
          for(; !(step = iterator.next()).done; index++){
            result[index] = mapping ? f(step.value, index) : step.value;
          }
        }, getIterator(O));
      } else {
        result = new (generic(this, Array))(length = toLength(O.length));
        for(; length > index; index++){
          result[index] = mapping ? f(O[index], index) : O[index];
        }
      }
      result.length = index;
      return result;
    }
  });
  
  $define(STATIC, ARRAY, {
    // 22.1.2.3 Array.of( ...items)
    of: function(/* ...args */){
      var index  = 0
        , length = arguments.length
        , result = new (generic(this, Array))(length);
      while(length > index)result[index] = arguments[index++];
      result.length = length;
      return result;
    }
  });
  
  setSpecies(Array);
}();

/******************************************************************************
 * Module : es6.array.prototype                                               *
 ******************************************************************************/

!function(){
  $define(PROTO, ARRAY, {
    // 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
    copyWithin: function(target /* = 0 */, start /* = 0, end = @length */){
      var O     = Object(assertDefined(this))
        , len   = toLength(O.length)
        , to    = toIndex(target, len)
        , from  = toIndex(start, len)
        , end   = arguments[2]
        , fin   = end === undefined ? len : toIndex(end, len)
        , count = min(fin - from, len - to)
        , inc   = 1;
      if(from < to && to < from + count){
        inc  = -1;
        from = from + count - 1;
        to   = to + count - 1;
      }
      while(count-- > 0){
        if(from in O)O[to] = O[from];
        else delete O[to];
        to += inc;
        from += inc;
      } return O;
    },
    // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
    fill: function(value /*, start = 0, end = @length */){
      var O      = Object(assertDefined(this))
        , length = toLength(O.length)
        , index  = toIndex(arguments[1], length)
        , end    = arguments[2]
        , endPos = end === undefined ? length : toIndex(end, length);
      while(endPos > index)O[index++] = value;
      return O;
    },
    // 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
    find: createArrayMethod(5),
    // 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
    findIndex: createArrayMethod(6)
  });
  
  if(framework){
    // 22.1.3.31 Array.prototype[@@unscopables]
    forEach.call(array('find,findIndex,fill,copyWithin,entries,keys,values'), function(it){
      ArrayUnscopables[it] = true;
    });
    SYMBOL_UNSCOPABLES in ArrayProto || hidden(ArrayProto, SYMBOL_UNSCOPABLES, ArrayUnscopables);
  }
}();

/******************************************************************************
 * Module : es6.iterators                                                     *
 ******************************************************************************/

!function(at){
  // 22.1.3.4 Array.prototype.entries()
  // 22.1.3.13 Array.prototype.keys()
  // 22.1.3.29 Array.prototype.values()
  // 22.1.3.30 Array.prototype[@@iterator]()
  defineStdIterators(Array, ARRAY, function(iterated, kind){
    set(this, ITER, {o: toObject(iterated), i: 0, k: kind});
  // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
  }, function(){
    var iter  = this[ITER]
      , O     = iter.o
      , kind  = iter.k
      , index = iter.i++;
    if(!O || index >= O.length){
      iter.o = undefined;
      return iterResult(1);
    }
    if(kind == KEY)  return iterResult(0, index);
    if(kind == VALUE)return iterResult(0, O[index]);
                     return iterResult(0, [index, O[index]]);
  }, VALUE);
  
  // argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
  Iterators[ARGUMENTS] = Iterators[ARRAY];
  
  // 21.1.3.27 String.prototype[@@iterator]()
  defineStdIterators(String, STRING, function(iterated){
    set(this, ITER, {o: String(iterated), i: 0});
  // 21.1.5.2.1 %StringIteratorPrototype%.next()
  }, function(){
    var iter  = this[ITER]
      , O     = iter.o
      , index = iter.i
      , point;
    if(index >= O.length)return iterResult(1);
    point = at.call(O, index);
    iter.i += point.length;
    return iterResult(0, point);
  });
}(createPointAt(true));

/******************************************************************************
 * Module : es6.regexp                                                        *
 ******************************************************************************/

DESC && !function(RegExpProto, _RegExp){  
  // RegExp allows a regex with flags as the pattern
  if(!function(){try{return RegExp(/a/g, 'i') == '/a/i'}catch(e){}}()){
    RegExp = function RegExp(pattern, flags){
      return new _RegExp(cof(pattern) == REGEXP && flags !== undefined
        ? pattern.source : pattern, flags);
    }
    forEach.call(getNames(_RegExp), function(key){
      key in RegExp || defineProperty(RegExp, key, {
        configurable: true,
        get: function(){ return _RegExp[key] },
        set: function(it){ _RegExp[key] = it }
      });
    });
    RegExpProto[CONSTRUCTOR] = RegExp;
    RegExp[PROTOTYPE] = RegExpProto;
    hidden(global, REGEXP, RegExp);
  }
  
  // 21.2.5.3 get RegExp.prototype.flags()
  if(/./g.flags != 'g')defineProperty(RegExpProto, 'flags', {
    configurable: true,
    get: createReplacer(/^.*\/(\w*)$/, '$1')
  });
  
  setSpecies(RegExp);
}(RegExp[PROTOTYPE], RegExp);

/******************************************************************************
 * Module : web.immediate                                                     *
 ******************************************************************************/

// setImmediate shim
// Node.js 0.9+ & IE10+ has setImmediate, else:
isFunction(setImmediate) && isFunction(clearImmediate) || function(ONREADYSTATECHANGE){
  var postMessage      = global.postMessage
    , addEventListener = global.addEventListener
    , MessageChannel   = global.MessageChannel
    , counter          = 0
    , queue            = {}
    , defer, channel, port;
  setImmediate = function(fn){
    var args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[++counter] = function(){
      invoke(isFunction(fn) ? fn : Function(fn), args);
    }
    defer(counter);
    return counter;
  }
  clearImmediate = function(id){
    delete queue[id];
  }
  function run(id){
    if(has(queue, id)){
      var fn = queue[id];
      delete queue[id];
      fn();
    }
  }
  function listner(event){
    run(event.data);
  }
  // Node.js 0.8-
  if(NODE){
    defer = function(id){
      nextTick(part.call(run, id));
    }
  // Modern browsers, skip implementation for WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is object
  } else if(addEventListener && isFunction(postMessage) && !global.importScripts){
    defer = function(id){
      postMessage(id, '*');
    }
    addEventListener('message', listner, false);
  // WebWorkers
  } else if(isFunction(MessageChannel)){
    channel = new MessageChannel;
    port    = channel.port2;
    channel.port1.onmessage = listner;
    defer = ctx(port.postMessage, port, 1);
  // IE8-
  } else if(document && ONREADYSTATECHANGE in document[CREATE_ELEMENT]('script')){
    defer = function(id){
      html.appendChild(document[CREATE_ELEMENT]('script'))[ONREADYSTATECHANGE] = function(){
        html.removeChild(this);
        run(id);
      }
    }
  // Rest old browsers
  } else {
    defer = function(id){
      setTimeout(run, 0, id);
    }
  }
}('onreadystatechange');
$define(GLOBAL + BIND, {
  setImmediate:   setImmediate,
  clearImmediate: clearImmediate
});

/******************************************************************************
 * Module : es6.promise                                                       *
 ******************************************************************************/

// ES6 promises shim
// Based on https://github.com/getify/native-promise-only/
!function(Promise, test){
  isFunction(Promise) && isFunction(Promise.resolve)
  && Promise.resolve(test = new Promise(function(){})) == test
  || function(asap, RECORD){
    function isThenable(it){
      var then;
      if(isObject(it))then = it.then;
      return isFunction(then) ? then : false;
    }
    function handledRejectionOrHasOnRejected(promise){
      var record = promise[RECORD]
        , chain  = record.c
        , i      = 0
        , react;
      if(record.h)return true;
      while(chain.length > i){
        react = chain[i++];
        if(react.fail || handledRejectionOrHasOnRejected(react.P))return true;
      }
    }
    function notify(record, reject){
      var chain = record.c;
      if(reject || chain.length)asap(function(){
        var promise = record.p
          , value   = record.v
          , ok      = record.s == 1
          , i       = 0;
        if(reject && !handledRejectionOrHasOnRejected(promise)){
          setTimeout(function(){
            if(!handledRejectionOrHasOnRejected(promise)){
              if(NODE){
                if(!process.emit('unhandledRejection', value, promise)){
                  // default node.js behavior
                }
              } else if(isFunction(console.error)){
                console.error('Unhandled promise rejection', value);
              }
            }
          }, 1e3);
        } else while(chain.length > i)!function(react){
          var cb = ok ? react.ok : react.fail
            , ret, then;
          try {
            if(cb){
              if(!ok)record.h = true;
              ret = cb === true ? value : cb(value);
              if(ret === react.P){
                react.rej(TypeError(PROMISE + '-chain cycle'));
              } else if(then = isThenable(ret)){
                then.call(ret, react.res, react.rej);
              } else react.res(ret);
            } else react.rej(value);
          } catch(err){
            react.rej(err);
          }
        }(chain[i++]);
        chain.length = 0;
      });
    }
    function resolve(value){
      var record = this
        , then, wrapper;
      if(record.d)return;
      record.d = true;
      record = record.r || record; // unwrap
      try {
        if(then = isThenable(value)){
          wrapper = {r: record, d: false}; // wrap
          then.call(value, ctx(resolve, wrapper, 1), ctx(reject, wrapper, 1));
        } else {
          record.v = value;
          record.s = 1;
          notify(record);
        }
      } catch(err){
        reject.call(wrapper || {r: record, d: false}, err); // wrap
      }
    }
    function reject(value){
      var record = this;
      if(record.d)return;
      record.d = true;
      record = record.r || record; // unwrap
      record.v = value;
      record.s = 2;
      notify(record, true);
    }
    function getConstructor(C){
      var S = assertObject(C)[SYMBOL_SPECIES];
      return S != undefined ? S : C;
    }
    // 25.4.3.1 Promise(executor)
    Promise = function(executor){
      assertFunction(executor);
      assertInstance(this, Promise, PROMISE);
      var record = {
        p: this,      // promise
        c: [],        // chain
        s: 0,         // state
        d: false,     // done
        v: undefined, // value
        h: false      // handled rejection
      };
      hidden(this, RECORD, record);
      try {
        executor(ctx(resolve, record, 1), ctx(reject, record, 1));
      } catch(err){
        reject.call(record, err);
      }
    }
    assignHidden(Promise[PROTOTYPE], {
      // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
      then: function(onFulfilled, onRejected){
        var S = assertObject(assertObject(this)[CONSTRUCTOR])[SYMBOL_SPECIES];
        var react = {
          ok:   isFunction(onFulfilled) ? onFulfilled : true,
          fail: isFunction(onRejected)  ? onRejected  : false
        } , P = react.P = new (S != undefined ? S : Promise)(function(resolve, reject){
          react.res = assertFunction(resolve);
          react.rej = assertFunction(reject);
        }), record = this[RECORD];
        record.c.push(react);
        record.s && notify(record);
        return P;
      },
      // 25.4.5.1 Promise.prototype.catch(onRejected)
      'catch': function(onRejected){
        return this.then(undefined, onRejected);
      }
    });
    assignHidden(Promise, {
      // 25.4.4.1 Promise.all(iterable)
      all: function(iterable){
        var Promise = getConstructor(this)
          , values  = [];
        return new Promise(function(resolve, reject){
          forOf(iterable, false, push, values);
          var remaining = values.length
            , results   = Array(remaining);
          if(remaining)forEach.call(values, function(promise, index){
            Promise.resolve(promise).then(function(value){
              results[index] = value;
              --remaining || resolve(results);
            }, reject);
          });
          else resolve(results);
        });
      },
      // 25.4.4.4 Promise.race(iterable)
      race: function(iterable){
        var Promise = getConstructor(this);
        return new Promise(function(resolve, reject){
          forOf(iterable, false, function(promise){
            Promise.resolve(promise).then(resolve, reject);
          });
        });
      },
      // 25.4.4.5 Promise.reject(r)
      reject: function(r){
        return new (getConstructor(this))(function(resolve, reject){
          reject(r);
        });
      },
      // 25.4.4.6 Promise.resolve(x)
      resolve: function(x){
        return isObject(x) && RECORD in x && getPrototypeOf(x) === this[PROTOTYPE]
          ? x : new (getConstructor(this))(function(resolve, reject){
            resolve(x);
          });
      }
    });
  }(nextTick || setImmediate, safeSymbol('record'));
  setToStringTag(Promise, PROMISE);
  setSpecies(Promise);
  $define(GLOBAL + FORCED * !isNative(Promise), {Promise: Promise});
}(global[PROMISE]);

/******************************************************************************
 * Module : es6.collections                                                   *
 ******************************************************************************/

// ECMAScript 6 collections shim
!function(){
  var UID   = safeSymbol('uid')
    , O1    = safeSymbol('O1')
    , WEAK  = safeSymbol('weak')
    , LEAK  = safeSymbol('leak')
    , LAST  = safeSymbol('last')
    , FIRST = safeSymbol('first')
    , SIZE  = DESC ? safeSymbol('size') : 'size'
    , uid   = 0
    , tmp   = {};
  
  function getCollection(C, NAME, methods, commonMethods, isMap, isWeak){
    var ADDER = isMap ? 'set' : 'add'
      , proto = C && C[PROTOTYPE]
      , O     = {};
    function initFromIterable(that, iterable){
      if(iterable != undefined)forOf(iterable, isMap, that[ADDER], that);
      return that;
    }
    function fixSVZ(key, chain){
      var method = proto[key];
      if(framework)proto[key] = function(a, b){
        var result = method.call(this, a === 0 ? 0 : a, b);
        return chain ? this : result;
      };
    }
    if(!isNative(C) || !(isWeak || (!BUGGY_ITERATORS && has(proto, FOR_EACH) && has(proto, 'entries')))){
      // create collection constructor
      C = isWeak
        ? function(iterable){
            assertInstance(this, C, NAME);
            set(this, UID, uid++);
            initFromIterable(this, iterable);
          }
        : function(iterable){
            var that = this;
            assertInstance(that, C, NAME);
            set(that, O1, create(null));
            set(that, SIZE, 0);
            set(that, LAST, undefined);
            set(that, FIRST, undefined);
            initFromIterable(that, iterable);
          };
      assignHidden(assignHidden(C[PROTOTYPE], methods), commonMethods);
      isWeak || !DESC || defineProperty(C[PROTOTYPE], 'size', {get: function(){
        return assertDefined(this[SIZE]);
      }});
    } else {
      var Native = C
        , inst   = new C
        , chain  = inst[ADDER](isWeak ? {} : -0, 1)
        , buggyZero;
      // wrap to init collections from iterable
      if(checkDangerIterClosing(function(O){ new C(O) })){
        C = function(iterable){
          assertInstance(this, C, NAME);
          return initFromIterable(new Native, iterable);
        }
        C[PROTOTYPE] = proto;
        if(framework)proto[CONSTRUCTOR] = C;
      }
      isWeak || inst[FOR_EACH](function(val, key){
        buggyZero = 1 / key === -Infinity;
      });
      // fix converting -0 key to +0
      if(buggyZero){
        fixSVZ('delete');
        fixSVZ('has');
        isMap && fixSVZ('get');
      }
      // + fix .add & .set for chaining
      if(buggyZero || chain !== inst)fixSVZ(ADDER, true);
    }
    setToStringTag(C, NAME);
    setSpecies(C);
    
    O[NAME] = C;
    $define(GLOBAL + WRAP + FORCED * !isNative(C), O);
    
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    isWeak || defineStdIterators(C, NAME, function(iterated, kind){
      set(this, ITER, {o: iterated, k: kind});
    }, function(){
      var iter  = this[ITER]
        , kind  = iter.k
        , entry = iter.l;
      // revert to the last existing entry
      while(entry && entry.r)entry = entry.p;
      // get next entry
      if(!iter.o || !(iter.l = entry = entry ? entry.n : iter.o[FIRST])){
        // or finish the iteration
        iter.o = undefined;
        return iterResult(1);
      }
      // return step by kind
      if(kind == KEY)  return iterResult(0, entry.k);
      if(kind == VALUE)return iterResult(0, entry.v);
                       return iterResult(0, [entry.k, entry.v]);   
    }, isMap ? KEY+VALUE : VALUE, !isMap);
    
    return C;
  }
  
  function fastKey(it, create){
    // return primitive with prefix
    if(!isObject(it))return (typeof it == 'string' ? 'S' : 'P') + it;
    // can't set id to frozen object
    if(isFrozen(it))return 'F';
    if(!has(it, UID)){
      // not necessary to add id
      if(!create)return 'E';
      // add missing object id
      hidden(it, UID, ++uid);
    // return object id with prefix
    } return 'O' + it[UID];
  }
  function getEntry(that, key){
    // fast case
    var index = fastKey(key), entry;
    if(index != 'F')return that[O1][index];
    // frozen object case
    for(entry = that[FIRST]; entry; entry = entry.n){
      if(entry.k == key)return entry;
    }
  }
  function def(that, key, value){
    var entry = getEntry(that, key)
      , prev, index;
    // change existing entry
    if(entry)entry.v = value;
    // create new entry
    else {
      that[LAST] = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that[LAST],          // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if(!that[FIRST])that[FIRST] = entry;
      if(prev)prev.n = entry;
      that[SIZE]++;
      // add to index
      if(index != 'F')that[O1][index] = entry;
    } return that;
  }

  var collectionMethods = {
    // 23.1.3.1 Map.prototype.clear()
    // 23.2.3.2 Set.prototype.clear()
    clear: function(){
      for(var that = this, data = that[O1], entry = that[FIRST]; entry; entry = entry.n){
        entry.r = true;
        if(entry.p)entry.p = entry.p.n = undefined;
        delete data[entry.i];
      }
      that[FIRST] = that[LAST] = undefined;
      that[SIZE] = 0;
    },
    // 23.1.3.3 Map.prototype.delete(key)
    // 23.2.3.4 Set.prototype.delete(value)
    'delete': function(key){
      var that  = this
        , entry = getEntry(that, key);
      if(entry){
        var next = entry.n
          , prev = entry.p;
        delete that[O1][entry.i];
        entry.r = true;
        if(prev)prev.n = next;
        if(next)next.p = prev;
        if(that[FIRST] == entry)that[FIRST] = next;
        if(that[LAST] == entry)that[LAST] = prev;
        that[SIZE]--;
      } return !!entry;
    },
    // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
    // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
    forEach: function(callbackfn /*, that = undefined */){
      var f = ctx(callbackfn, arguments[1], 3)
        , entry;
      while(entry = entry ? entry.n : this[FIRST]){
        f(entry.v, entry.k, this);
        // revert to the last existing entry
        while(entry && entry.r)entry = entry.p;
      }
    },
    // 23.1.3.7 Map.prototype.has(key)
    // 23.2.3.7 Set.prototype.has(value)
    has: function(key){
      return !!getEntry(this, key);
    }
  }
  
  // 23.1 Map Objects
  Map = getCollection(Map, MAP, {
    // 23.1.3.6 Map.prototype.get(key)
    get: function(key){
      var entry = getEntry(this, key);
      return entry && entry.v;
    },
    // 23.1.3.9 Map.prototype.set(key, value)
    set: function(key, value){
      return def(this, key === 0 ? 0 : key, value);
    }
  }, collectionMethods, true);
  
  // 23.2 Set Objects
  Set = getCollection(Set, SET, {
    // 23.2.3.1 Set.prototype.add(value)
    add: function(value){
      return def(this, value = value === 0 ? 0 : value, value);
    }
  }, collectionMethods);
  
  function defWeak(that, key, value){
    if(isFrozen(assertObject(key)))leakStore(that).set(key, value);
    else {
      has(key, WEAK) || hidden(key, WEAK, {});
      key[WEAK][that[UID]] = value;
    } return that;
  }
  function leakStore(that){
    return that[LEAK] || hidden(that, LEAK, new Map)[LEAK];
  }
  
  var weakMethods = {
    // 23.3.3.2 WeakMap.prototype.delete(key)
    // 23.4.3.3 WeakSet.prototype.delete(value)
    'delete': function(key){
      if(!isObject(key))return false;
      if(isFrozen(key))return leakStore(this)['delete'](key);
      return has(key, WEAK) && has(key[WEAK], this[UID]) && delete key[WEAK][this[UID]];
    },
    // 23.3.3.4 WeakMap.prototype.has(key)
    // 23.4.3.4 WeakSet.prototype.has(value)
    has: function(key){
      if(!isObject(key))return false;
      if(isFrozen(key))return leakStore(this).has(key);
      return has(key, WEAK) && has(key[WEAK], this[UID]);
    }
  };
  
  // 23.3 WeakMap Objects
  WeakMap = getCollection(WeakMap, WEAKMAP, {
    // 23.3.3.3 WeakMap.prototype.get(key)
    get: function(key){
      if(isObject(key)){
        if(isFrozen(key))return leakStore(this).get(key);
        if(has(key, WEAK))return key[WEAK][this[UID]];
      }
    },
    // 23.3.3.5 WeakMap.prototype.set(key, value)
    set: function(key, value){
      return defWeak(this, key, value);
    }
  }, weakMethods, true, true);
  
  // IE11 WeakMap frozen keys fix
  if(framework && new WeakMap().set(Object.freeze(tmp), 7).get(tmp) != 7){
    forEach.call(array('delete,has,get,set'), function(key){
      var method = WeakMap[PROTOTYPE][key];
      WeakMap[PROTOTYPE][key] = function(a, b){
        // store frozen objects on leaky map
        if(isObject(a) && isFrozen(a)){
          var result = leakStore(this)[key](a, b);
          return key == 'set' ? this : result;
        // store all the rest on native weakmap
        } return method.call(this, a, b);
      };
    });
  }
  
  // 23.4 WeakSet Objects
  WeakSet = getCollection(WeakSet, WEAKSET, {
    // 23.4.3.1 WeakSet.prototype.add(value)
    add: function(value){
      return defWeak(this, value, true);
    }
  }, weakMethods, false, true);
}();

/******************************************************************************
 * Module : es6.reflect                                                       *
 ******************************************************************************/

!function(){
  function Enumerate(iterated){
    var keys = [], key;
    for(key in iterated)keys.push(key);
    set(this, ITER, {o: iterated, a: keys, i: 0});
  }
  createIterator(Enumerate, OBJECT, function(){
    var iter = this[ITER]
      , keys = iter.a
      , key;
    do {
      if(iter.i >= keys.length)return iterResult(1);
    } while(!((key = keys[iter.i++]) in iter.o));
    return iterResult(0, key);
  });
  
  function wrap(fn){
    return function(it){
      assertObject(it);
      try {
        return fn.apply(undefined, arguments), true;
      } catch(e){
        return false;
      }
    }
  }
  
  function reflectGet(target, propertyKey/*, receiver*/){
    var receiver = arguments.length < 3 ? target : arguments[2]
      , desc = getOwnDescriptor(assertObject(target), propertyKey), proto;
    if(desc)return has(desc, 'value')
      ? desc.value
      : desc.get === undefined
        ? undefined
        : desc.get.call(receiver);
    return isObject(proto = getPrototypeOf(target))
      ? reflectGet(proto, propertyKey, receiver)
      : undefined;
  }
  function reflectSet(target, propertyKey, V/*, receiver*/){
    var receiver = arguments.length < 4 ? target : arguments[3]
      , ownDesc  = getOwnDescriptor(assertObject(target), propertyKey)
      , existingDescriptor, proto;
    if(!ownDesc){
      if(isObject(proto = getPrototypeOf(target))){
        return reflectSet(proto, propertyKey, V, receiver);
      }
      ownDesc = descriptor(0);
    }
    if(has(ownDesc, 'value')){
      if(ownDesc.writable === false || !isObject(receiver))return false;
      existingDescriptor = getOwnDescriptor(receiver, propertyKey) || descriptor(0);
      existingDescriptor.value = V;
      return defineProperty(receiver, propertyKey, existingDescriptor), true;
    }
    return ownDesc.set === undefined
      ? false
      : (ownDesc.set.call(receiver, V), true);
  }
  var isExtensible = Object.isExtensible || returnIt;
  
  var reflect = {
    // 26.1.1 Reflect.apply(target, thisArgument, argumentsList)
    apply: ctx(call, apply, 3),
    // 26.1.2 Reflect.construct(target, argumentsList [, newTarget])
    construct: function(target, argumentsList /*, newTarget*/){
      var proto    = assertFunction(arguments.length < 3 ? target : arguments[2])[PROTOTYPE]
        , instance = create(isObject(proto) ? proto : ObjectProto)
        , result   = apply.call(target, instance, argumentsList);
      return isObject(result) ? result : instance;
    },
    // 26.1.3 Reflect.defineProperty(target, propertyKey, attributes)
    defineProperty: wrap(defineProperty),
    // 26.1.4 Reflect.deleteProperty(target, propertyKey)
    deleteProperty: function(target, propertyKey){
      var desc = getOwnDescriptor(assertObject(target), propertyKey);
      return desc && !desc.configurable ? false : delete target[propertyKey];
    },
    // 26.1.5 Reflect.enumerate(target)
    enumerate: function(target){
      return new Enumerate(assertObject(target));
    },
    // 26.1.6 Reflect.get(target, propertyKey [, receiver])
    get: reflectGet,
    // 26.1.7 Reflect.getOwnPropertyDescriptor(target, propertyKey)
    getOwnPropertyDescriptor: function(target, propertyKey){
      return getOwnDescriptor(assertObject(target), propertyKey);
    },
    // 26.1.8 Reflect.getPrototypeOf(target)
    getPrototypeOf: function(target){
      return getPrototypeOf(assertObject(target));
    },
    // 26.1.9 Reflect.has(target, propertyKey)
    has: function(target, propertyKey){
      return propertyKey in target;
    },
    // 26.1.10 Reflect.isExtensible(target)
    isExtensible: function(target){
      return !!isExtensible(assertObject(target));
    },
    // 26.1.11 Reflect.ownKeys(target)
    ownKeys: ownKeys,
    // 26.1.12 Reflect.preventExtensions(target)
    preventExtensions: wrap(Object.preventExtensions || returnIt),
    // 26.1.13 Reflect.set(target, propertyKey, V [, receiver])
    set: reflectSet
  }
  // 26.1.14 Reflect.setPrototypeOf(target, proto)
  if(setPrototypeOf)reflect.setPrototypeOf = function(target, proto){
    return setPrototypeOf(assertObject(target), proto), true;
  };
  
  $define(GLOBAL, {Reflect: {}});
  $define(STATIC, 'Reflect', reflect);
}();

/******************************************************************************
 * Module : es7.proposals                                                     *
 ******************************************************************************/

!function(){
  $define(PROTO, ARRAY, {
    // https://github.com/domenic/Array.prototype.includes
    includes: createArrayContains(true)
  });
  $define(PROTO, STRING, {
    // https://github.com/mathiasbynens/String.prototype.at
    at: createPointAt(true)
  });
  
  function createObjectToArray(isEntries){
    return function(object){
      var O      = toObject(object)
        , keys   = getKeys(object)
        , length = keys.length
        , i      = 0
        , result = Array(length)
        , key;
      if(isEntries)while(length > i)result[i] = [key = keys[i++], O[key]];
      else while(length > i)result[i] = O[keys[i++]];
      return result;
    }
  }
  $define(STATIC, OBJECT, {
    // https://gist.github.com/WebReflection/9353781
    getOwnPropertyDescriptors: function(object){
      var O      = toObject(object)
        , result = {};
      forEach.call(ownKeys(O), function(key){
        defineProperty(result, key, descriptor(0, getOwnDescriptor(O, key)));
      });
      return result;
    },
    // https://github.com/rwaldron/tc39-notes/blob/master/es6/2014-04/apr-9.md#51-objectentries-objectvalues
    values:  createObjectToArray(false),
    entries: createObjectToArray(true)
  });
  $define(STATIC, REGEXP, {
    // https://gist.github.com/kangax/9698100
    escape: createReplacer(/([\\\-[\]{}()*+?.,^$|])/g, '\\$1', true)
  });
}();

/******************************************************************************
 * Module : es7.abstract-refs                                                 *
 ******************************************************************************/

// https://github.com/zenparsing/es-abstract-refs
!function(REFERENCE){
  REFERENCE_GET = getWellKnownSymbol(REFERENCE+'Get', true);
  var REFERENCE_SET = getWellKnownSymbol(REFERENCE+SET, true)
    , REFERENCE_DELETE = getWellKnownSymbol(REFERENCE+'Delete', true);
  
  $define(STATIC, SYMBOL, {
    referenceGet: REFERENCE_GET,
    referenceSet: REFERENCE_SET,
    referenceDelete: REFERENCE_DELETE
  });
  
  hidden(FunctionProto, REFERENCE_GET, returnThis);
  
  function setMapMethods(Constructor){
    if(Constructor){
      var MapProto = Constructor[PROTOTYPE];
      hidden(MapProto, REFERENCE_GET, MapProto.get);
      hidden(MapProto, REFERENCE_SET, MapProto.set);
      hidden(MapProto, REFERENCE_DELETE, MapProto['delete']);
    }
  }
  setMapMethods(Map);
  setMapMethods(WeakMap);
}('reference');

/******************************************************************************
 * Module : js.array.statics                                                  *
 ******************************************************************************/

// JavaScript 1.6 / Strawman array statics shim
!function(arrayStatics){
  function setArrayStatics(keys, length){
    forEach.call(array(keys), function(key){
      if(key in ArrayProto)arrayStatics[key] = ctx(call, ArrayProto[key], length);
    });
  }
  setArrayStatics('pop,reverse,shift,keys,values,entries', 1);
  setArrayStatics('indexOf,every,some,forEach,map,filter,find,findIndex,includes', 3);
  setArrayStatics('join,slice,concat,push,splice,unshift,sort,lastIndexOf,' +
                  'reduce,reduceRight,copyWithin,fill,turn');
  $define(STATIC, ARRAY, arrayStatics);
}({});

/******************************************************************************
 * Module : web.dom.itarable                                                  *
 ******************************************************************************/

!function(NodeList){
  if(framework && NodeList && !(SYMBOL_ITERATOR in NodeList[PROTOTYPE])){
    hidden(NodeList[PROTOTYPE], SYMBOL_ITERATOR, Iterators[ARRAY]);
  }
  Iterators.NodeList = Iterators[ARRAY];
}(global.NodeList);
}(typeof self != 'undefined' && self.Math === Math ? self : Function('return this')(), true);
},{}],4:[function(require,module,exports){
(function (global){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
 * additional grant of patent rights can be found in the PATENTS file in
 * the same directory.
 */

!(function(global) {
  "use strict";

  var hasOwn = Object.prototype.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var iteratorSymbol =
    typeof Symbol === "function" && Symbol.iterator || "@@iterator";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    return new Generator(innerFn, outerFn, self || null, tryLocsList || []);
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype;
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = "GeneratorFunction";

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    genFun.__proto__ = GeneratorFunctionPrototype;
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    return new Promise(function(resolve, reject) {
      var generator = wrap(innerFn, outerFn, self, tryLocsList);
      var callNext = step.bind(generator.next);
      var callThrow = step.bind(generator["throw"]);

      function step(arg) {
        var record = tryCatch(this, null, arg);
        if (record.type === "throw") {
          reject(record.arg);
          return;
        }

        var info = record.arg;
        if (info.done) {
          resolve(info.value);
        } else {
          Promise.resolve(info.value).then(callNext, callThrow);
        }
      }

      callNext();
    });
  };

  function Generator(innerFn, outerFn, self, tryLocsList) {
    var generator = outerFn ? Object.create(outerFn.prototype) : this;
    var context = new Context(tryLocsList);
    var state = GenStateSuspendedStart;

    function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var record = tryCatch(
            delegate.iterator[method],
            delegate.iterator,
            arg
          );

          if (record.type === "throw") {
            context.delegate = null;

            // Like returning generator.throw(uncaught), but without the
            // overhead of an extra function call.
            method = "throw";
            arg = record.arg;

            continue;
          }

          // Delegate generator ran and handled its own exceptions so
          // regardless of what the method was, we continue as if it is
          // "next" with an undefined arg.
          method = "next";
          arg = undefined;

          var info = record.arg;
          if (info.done) {
            context[delegate.resultName] = info.value;
            context.next = delegate.nextLoc;
          } else {
            state = GenStateSuspendedYield;
            return info;
          }

          context.delegate = null;
        }

        if (method === "next") {
          if (state === GenStateSuspendedStart &&
              typeof arg !== "undefined") {
            // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
            throw new TypeError(
              "attempt to send " + JSON.stringify(arg) + " to newborn generator"
            );
          }

          if (state === GenStateSuspendedYield) {
            context.sent = arg;
          } else {
            delete context.sent;
          }

        } else if (method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw arg;
          }

          if (context.dispatchException(arg)) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            method = "next";
            arg = undefined;
          }

        } else if (method === "return") {
          context.abrupt("return", arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          var info = {
            value: record.arg,
            done: context.done
          };

          if (record.arg === ContinueSentinel) {
            if (context.delegate && method === "next") {
              // Deliberately forget the last sent value so that we don't
              // accidentally pass it on to the delegate.
              arg = undefined;
            }
          } else {
            return info;
          }

        } else if (record.type === "throw") {
          state = GenStateCompleted;

          if (method === "next") {
            context.dispatchException(record.arg);
          } else {
            arg = record.arg;
          }
        }
      }
    }

    generator.next = invoke.bind(generator, "next");
    generator["throw"] = invoke.bind(generator, "throw");
    generator["return"] = invoke.bind(generator, "return");

    return generator;
  }

  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset();
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function() {
      this.prev = 0;
      this.next = 0;
      this.sent = undefined;
      this.done = false;
      this.delegate = null;

      this.tryEntries.forEach(resetTryEntry);

      // Pre-initialize at least 20 temporary variables to enable hidden
      // class optimizations for simple generators.
      for (var tempIndex = 0, tempName;
           hasOwn.call(this, tempName = "t" + tempIndex) || tempIndex < 20;
           ++tempIndex) {
        this[tempName] = null;
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;
        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg < finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.next = finallyEntry.finallyLoc;
      } else {
        this.complete(record);
      }

      return ContinueSentinel;
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = record.arg;
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          return this.complete(entry.completion, entry.afterLoc);
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      return ContinueSentinel;
    }
  };
})(
  // Among the various tricks for obtaining a reference to the global
  // object, this seems to be the most reliable technique that does not
  // use indirect eval (which violates Content Security Policy).
  typeof global === "object" ? global :
  typeof window === "object" ? window : this
);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(require,module,exports){
module.exports = require("./lib/babel/polyfill");

},{"./lib/babel/polyfill":2}],6:[function(require,module,exports){

},{}],7:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":8}],8:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canMutationObserver = typeof window !== 'undefined'
    && window.MutationObserver;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    var queue = [];

    if (canMutationObserver) {
        var hiddenDiv = document.createElement("div");
        var observer = new MutationObserver(function () {
            var queueList = queue.slice();
            queue.length = 0;
            queueList.forEach(function (fn) {
                fn();
            });
        });

        observer.observe(hiddenDiv, { attributes: true });

        return function nextTick(fn) {
            if (!queue.length) {
                hiddenDiv.setAttribute('yes', 'no');
            }
            queue.push(fn);
        };
    }

    if (canPost) {
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

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

},{}],9:[function(require,module,exports){
// doT.js
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
	} else if (typeof define === "function" && define.amd) {
		define(function(){return doT;});
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

},{}],10:[function(require,module,exports){
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

var fs = require("fs"),
	doT = module.exports = require("./doT");

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

},{"./doT":9,"fs":6}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
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
var RenderType = {
  IMAGE: "image",
  DATAURL: "data-url"
};

exports.RenderType = RenderType;
/**
 * The available output image formats
 * @enum {string}
 * @alias ImglyKit.ImageFormat
 */
var ImageFormat = {
  PNG: "image/png",
  JPEG: "image/jpeg"
};
exports.ImageFormat = ImageFormat;

},{}],12:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

require("babel/polyfill");

var _ = _interopRequire(require("lodash"));

var RenderImage = _interopRequire(require("./lib/render-image"));

var ImageExporter = _interopRequire(require("./lib/image-exporter"));

var _constants = require("./constants");

var RenderType = _constants.RenderType;
var ImageFormat = _constants.ImageFormat;

var Utils = _interopRequire(require("./lib/utils"));

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
    if (typeof options === "undefined") {
      throw new Error("No options given.");
    }

    // Set default options
    options = _.defaults(options, {
      assetsUrl: "assets",
      container: null,
      renderOnWindowResize: false
    });
    options.ui = options.ui || {};
    options.ui = _.defaults(options.ui, {
      enabled: true
    });

    if (typeof options.image === "undefined" && !options.ui.enabled) {
      throw new Error("`options.image` needs to be set when UI is disabled.");
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

    if (this._options.ui.enabled) {
      this._initUI();
      if (this._options.renderOnWindowResize) {
        this._handleWindowResize();
      }
    }
  }

  _createClass(ImglyKit, {
    render: {

      /**
       * Renders the image
       * @param  {ImglyKit.RenderType} [renderType=ImglyKit.RenderType.DATA_URL] - The output type
       * @param  {ImglyKit.ImageFormat} [imageFormat=ImglyKit.ImageFormat.PNG] - The output image format
       * @param  {string} [dimensions] - The final dimensions of the image
       * @return {Promise}
       */

      value: function render(renderType, imageFormat, dimensions) {
        var settings = ImageExporter.validateSettings(renderType, imageFormat);

        renderType = settings.renderType;
        imageFormat = settings.imageFormat;

        // Create a RenderImage
        var renderImage = new RenderImage(this._options.image, this.operationsStack, dimensions, this._options.renderer);

        // Set all operations to dirty, since we have another webgl renderer
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.operationsStack[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var operation = _step.value;

            if (!operation) {
              continue;
            }
            operation.dirty = true;
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"]) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        // Initiate image rendering
        return renderImage.render().then(function () {
          var canvas = renderImage.getRenderer().getCanvas();
          return ImageExporter["export"](canvas, renderType, imageFormat);
        });
      }
    },
    reset: {

      /**
       * Resets all custom and selected operations
       */

      value: function reset() {}
    },
    getAssetPath: {

      /**
       * Returns the asset path for the given filename
       * @param  {String} asset
       * @return {String}
       */

      value: function getAssetPath(asset) {
        var isBrowser = typeof window !== "undefined";
        if (isBrowser) {
          /* istanbul ignore next */
          return this._options.assetsUrl + "/" + asset;
        } else {
          var path = require("path");
          return path.resolve(this._options.assetsUrl, asset);
        }
      }
    },
    _handleWindowResize: {

      /**
       * If `options.renderOnWindowResize` is set to true, this function
       * will re-render the canvas with a slight delay so that it won't
       * cause lagging of the resize
       * @private
       */

      value: function _handleWindowResize() {
        var _this = this;

        var timer = null;
        window.addEventListener("resize", function () {
          if (timer !== null) {
            clearTimeout(timer);
          }

          timer = setTimeout(function () {
            timer = null;
            _this.ui.render();
          }, 300);
        });
      }
    },
    _registerUIs: {

      /**
       * Registers all default UIs
       * @private
       */

      value: function _registerUIs() {
        this.registerUI(ImglyKit.NightUI);
      }
    },
    _registerOperations: {

      /**
       * Registers all default operations
       * @private
       */

      value: function _registerOperations() {
        for (var operationName in ImglyKit.Operations) {
          this.registerOperation(ImglyKit.Operations[operationName]);
        }
      }
    },
    registerOperation: {

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
    },
    registerUI: {

      /**
       * Registers the given UI
       * @param {UI} ui
       */

      value: function registerUI(ui) {
        this._registeredUIs[ui.prototype.identifier] = ui;
      }
    },
    _initUI: {

      /**
       * Initializes the UI
       * @private
       */
      /* istanbul ignore next */

      value: function _initUI() {
        var UI;

        if (this._options.ui.enabled === true) {
          // Select the first UI by default
          UI = Utils.values(this._registeredUIs)[0];
        }

        if (!UI) {
          return;
        }

        /**
         * @type {ImglyKit.UI}
         */
        this.ui = new UI(this, this._options);
      }
    },
    getOperationFromStack: {

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
    },
    run: {

      /**
       * Runs the UI, if present
       */

      value: function run() {
        if (typeof this.ui !== "undefined") {
          this.ui.run();
        }
      }
    },
    registeredOperations: {
      get: function () {
        return this._registeredOperations;
      }
    }
  });

  return ImglyKit;
})();

/**
 * The current version of the SDK
 * @name ImglyKit.version
 * @internal Keep in sync with package.json
 */
ImglyKit.version = "2.0.0-beta6";

// Exposed classes
ImglyKit.RenderImage = RenderImage;
ImglyKit.Color = require("./lib/color");
ImglyKit.Filter = require("./operations/filters/filter");
ImglyKit.Operation = require("./operations/operation");
ImglyKit.Operations = {};
ImglyKit.Operations.Filters = require("./operations/filters-operation");
ImglyKit.Operations.Crop = require("./operations/crop-operation");
ImglyKit.Operations.Rotation = require("./operations/rotation-operation");
ImglyKit.Operations.Saturation = require("./operations/saturation-operation");
ImglyKit.Operations.Contrast = require("./operations/contrast-operation");
ImglyKit.Operations.Brightness = require("./operations/brightness-operation");
ImglyKit.Operations.Flip = require("./operations/flip-operation");
ImglyKit.Operations.TiltShift = require("./operations/tilt-shift-operation");
ImglyKit.Operations.RadialBlur = require("./operations/radial-blur-operation");
ImglyKit.Operations.Text = require("./operations/text-operation");
ImglyKit.Operations.Stickers = require("./operations/stickers-operation");
ImglyKit.Operations.Frames = require("./operations/frames-operation");

ImglyKit.Filters = {};
ImglyKit.Filters.A15 = require("./operations/filters/a15-filter");
ImglyKit.Filters.Breeze = require("./operations/filters/breeze-filter");
ImglyKit.Filters.BW = require("./operations/filters/bw-filter");
ImglyKit.Filters.BWHard = require("./operations/filters/bwhard-filter");
ImglyKit.Filters.Celsius = require("./operations/filters/celsius-filter");
ImglyKit.Filters.Chest = require("./operations/filters/chest-filter");
ImglyKit.Filters.Fixie = require("./operations/filters/fixie-filter");
ImglyKit.Filters.Food = require("./operations/filters/food-filter");
ImglyKit.Filters.Fridge = require("./operations/filters/fridge-filter");
ImglyKit.Filters.Front = require("./operations/filters/front-filter");
ImglyKit.Filters.Glam = require("./operations/filters/glam-filter");
ImglyKit.Filters.Gobblin = require("./operations/filters/gobblin-filter");
ImglyKit.Filters.K1 = require("./operations/filters/k1-filter");
ImglyKit.Filters.K2 = require("./operations/filters/k2-filter");
ImglyKit.Filters.K6 = require("./operations/filters/k6-filter");
ImglyKit.Filters.KDynamic = require("./operations/filters/kdynamic-filter");
ImglyKit.Filters.Lenin = require("./operations/filters/lenin-filter");
ImglyKit.Filters.Lomo = require("./operations/filters/lomo-filter");
ImglyKit.Filters.Mellow = require("./operations/filters/mellow-filter");
ImglyKit.Filters.Morning = require("./operations/filters/morning-filter");
ImglyKit.Filters.Orchid = require("./operations/filters/orchid-filter");
ImglyKit.Filters.Pola = require("./operations/filters/pola-filter");
ImglyKit.Filters.Pola669 = require("./operations/filters/pola669-filter");
ImglyKit.Filters.Quozi = require("./operations/filters/quozi-filter");
ImglyKit.Filters.Semired = require("./operations/filters/semired-filter");
ImglyKit.Filters.Sunny = require("./operations/filters/sunny-filter");
ImglyKit.Filters.Texas = require("./operations/filters/texas-filter");
ImglyKit.Filters.X400 = require("./operations/filters/x400-filter");

// Exposed constants
ImglyKit.RenderType = RenderType;
ImglyKit.ImageFormat = ImageFormat;
ImglyKit.Vector2 = require("./lib/math/vector2");

// UI
ImglyKit.NightUI = require("./ui/night/ui");

module.exports = ImglyKit;

},{"./constants":11,"./lib/color":13,"./lib/image-exporter":17,"./lib/math/vector2":18,"./lib/render-image":19,"./lib/utils":20,"./operations/brightness-operation":21,"./operations/contrast-operation":22,"./operations/crop-operation":23,"./operations/filters-operation":24,"./operations/filters/a15-filter":25,"./operations/filters/breeze-filter":26,"./operations/filters/bw-filter":27,"./operations/filters/bwhard-filter":28,"./operations/filters/celsius-filter":29,"./operations/filters/chest-filter":30,"./operations/filters/filter":31,"./operations/filters/fixie-filter":32,"./operations/filters/food-filter":33,"./operations/filters/fridge-filter":34,"./operations/filters/front-filter":35,"./operations/filters/glam-filter":36,"./operations/filters/gobblin-filter":37,"./operations/filters/k1-filter":39,"./operations/filters/k2-filter":40,"./operations/filters/k6-filter":41,"./operations/filters/kdynamic-filter":42,"./operations/filters/lenin-filter":43,"./operations/filters/lomo-filter":44,"./operations/filters/mellow-filter":45,"./operations/filters/morning-filter":46,"./operations/filters/orchid-filter":47,"./operations/filters/pola-filter":48,"./operations/filters/pola669-filter":49,"./operations/filters/quozi-filter":63,"./operations/filters/semired-filter":64,"./operations/filters/sunny-filter":65,"./operations/filters/texas-filter":66,"./operations/filters/x400-filter":67,"./operations/flip-operation":68,"./operations/frames-operation":69,"./operations/operation":70,"./operations/radial-blur-operation":71,"./operations/rotation-operation":72,"./operations/saturation-operation":73,"./operations/stickers-operation":74,"./operations/text-operation":75,"./operations/tilt-shift-operation":76,"./ui/night/ui":102,"babel/polyfill":5,"lodash":"lodash","path":7}],13:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

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

var Color = (function () {
  function Color(r, g, b, a) {
    _classCallCheck(this, Color);

    if (typeof a === "undefined") {
      a = 1;
    }

    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  _createClass(Color, {
    toRGBA: {

      /**
       * Returns an rgba() representation of this color
       * @return {String}
       */

      value: function toRGBA() {
        var colors = [Math.round(this.r * 255), Math.round(this.g * 255), Math.round(this.b * 255), this.a];
        return "rgba(" + colors.join(",") + ")";
      }
    },
    toHex: {

      /**
       * Returns a hex representation of this color
       * @return {String}
       */

      value: function toHex() {
        var components = [this._componentToHex(Math.round(this.r * 255)), this._componentToHex(Math.round(this.g * 255)), this._componentToHex(Math.round(this.b * 255))];
        return "#" + components.join("");
      }
    },
    toGLColor: {

      /**
       * Returns an array with 4 values (0...1)
       * @return {Array.<Number>}
       */

      value: function toGLColor() {
        return [this.r, this.g, this.b, this.a];
      }
    },
    toRGBGLColor: {

      /**
       * Returns an array with 3 values (0...1)
       * @return {Array.<Number>}
       */

      value: function toRGBGLColor() {
        return [this.r, this.g, this.b];
      }
    },
    toHSV: {

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
    },
    fromHSV: {

      /**
       * Sets the RGB values of this color to match the given HSV values
       * @param {Number} h
       * @param {Number} s
       * @param {Number} v
       */

      value: function fromHSV(h, s, v) {
        var _ref = this;

        var r = _ref.r;
        var g = _ref.g;
        var b = _ref.b;

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
    },
    clone: {

      /**
       * Returns a clone of the current color
       * @return {Color}
       */

      value: function clone() {
        return new Color(this.r, this.g, this.b, this.a);
      }
    },
    _componentToHex: {

      /**
       * Returns the given number as hex
       * @param  {Number} component
       * @return {String}
       * @private
       */

      value: function _componentToHex(component) {
        var hex = component.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      }
    },
    toString: {

      /**
       * Returns the string representation of this color
       * @returns {String}
       */

      value: function toString() {
        return "Color(" + this.r + ", " + this.g + ", " + this.b + ", " + this.a + ")";
      }
    }
  });

  return Color;
})();

module.exports = Color;

},{}],14:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/**
 * EventEmitter (ES6) from:
 * https://gist.github.com/bloodyowl/41b1de3388c626796eca
 */

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

  _createClass(EventEmitter, {
    on: {
      value: function on(type, listener) {
        if (typeof listener !== "function") {
          throw new TypeError();
        }

        var listeners = this._events[type] || (this._events[type] = []);
        if (listeners.indexOf(listener) !== -1) {
          return this;
        }
        listeners.push(listener);

        if (listeners.length > this._maxListeners) {
          error("possible memory leak, added %i %s listeners,\n        use EventEmitter#setMaxListeners(number) if you\n        want to increase the limit (%i now)", listeners.length, type, this._maxListeners);
        }
        return this;
      }
    },
    once: {
      value: function once(type, listener) {
        var eventsInstance = this;
        function onceCallback() {
          eventsInstance.off(type, onceCallback);
          listener.apply(null, arguments);
        }
        return this.on(type, onceCallback);
      }
    },
    off: {
      value: function off(type) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        if (args.length === 0) {
          this._events[type] = null;
          return this;
        }

        var listener = args[0];
        if (typeof listener !== "function") {
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
    },
    emit: {
      value: function emit(type) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
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
    },
    setMaxListeners: {
      value: function setMaxListeners(newMaxListeners) {
        if (parseInt(newMaxListeners, 10) !== newMaxListeners) {
          throw new TypeError();
        }

        this._maxListeners = newMaxListeners;
      }
    }
  });

  return EventEmitter;
})();

module.exports = EventEmitter;

},{}],15:[function(require,module,exports){
"use strict";
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
module.exports = function (prototypeProperties, classProperties) {
  /*jshint validthis:true*/
  var parent = this;
  var child;

  // The constructor function for the new subclass is either defined by you
  // (the "constructor" property in your `extend` definition), or defaulted
  // by us to simply call the parent's constructor.
  if (prototypeProperties && prototypeProperties.hasOwnProperty("constructor")) {
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
  if (typeof classProperties !== "undefined") {
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

},{}],16:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

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

var ImageDimensions = (function () {
  function ImageDimensions(dimensions) {
    _classCallCheck(this, ImageDimensions);

    /**
     * The available dimension modifiers
     * @type {Object}
     * @private
     */
    this._modifiers = {
      FIXED: "!"
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

  _createClass(ImageDimensions, {
    _parse: {

      /**
       * Parses the dimensions string
       * @private
       */

      value: function _parse() {
        if (typeof this._dimensionsString === "undefined") {
          return null;
        }

        var match = this._dimensionsString.match(/^([0-9]+)?x([0-9]+)?([\!])?$/i);
        if (!match) {
          throw new Error("Invalid size option: " + this._dimensionsString);
        }

        return {
          x: isNaN(match[1]) ? null : parseInt(match[1]),
          y: isNaN(match[2]) ? null : parseInt(match[2]),
          modifier: match[3]
        };
      }
    },
    _validateRules: {

      /**
       * Validates the rules
       * @private
       */

      value: function _validateRules() {
        if (this._rules === null) {
          return;
        }var xAvailable = this._rules.x !== null;
        var yAvailable = this._rules.y !== null;

        if (this._rules.modifier === this._modifiers.FIXED && !(xAvailable && yAvailable)) {
          throw new Error("Both `x` and `y` have to be set when using the fixed (!) modifier.");
        }

        if (!xAvailable && !yAvailable) {
          throw new Error("Neither `x` nor `y` are given.");
        }
      }
    },
    calculateFinalDimensions: {

      /**
       * Calculates the final dimensions using the dimensions string and the
       * given initial dimensions
       * @param  {Vector2} initialDimensions
       * @return {Vector2}
       */

      value: function calculateFinalDimensions(initialDimensions) {
        var dimensions = initialDimensions.clone(),
            ratio;

        if (this._rules === null) {
          return dimensions;
        } /* istanbul ignore else */
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
    }
  });

  return ImageDimensions;
})();

module.exports = ImageDimensions;

},{}],17:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var _constants = require("../constants");

var RenderType = _constants.RenderType;
var ImageFormat = _constants.ImageFormat;

var Utils = _interopRequire(require("./utils"));

/**
 * @class
 * @alias ImglyKit.ImageExporter
 * @private
 */

var ImageExporter = (function () {
  function ImageExporter() {
    _classCallCheck(this, ImageExporter);
  }

  _createClass(ImageExporter, null, {
    validateSettings: {
      value: function validateSettings(renderType, imageFormat) {
        var settings = {
          renderType: renderType,
          imageFormat: imageFormat
        };

        // Validate RenderType
        if (typeof settings.renderType !== "undefined" && settings.renderType !== null && Utils.values(RenderType).indexOf(settings.renderType) === -1) {
          throw new Error("Invalid render type: " + settings.renderType);
        } else if (typeof renderType === "undefined") {
          settings.renderType = RenderType.DATA_URL;
        }

        // Validate ImageFormat
        if (typeof settings.imageFormat !== "undefined" && settings.imageFormat !== null && Utils.values(ImageFormat).indexOf(settings.imageFormat) === -1) {
          throw new Error("Invalid image format: " + settings.imageFormat);
        } else if (typeof imageFormat === "undefined") {
          settings.imageFormat = ImageFormat.PNG;
        }

        return settings;
      }
    },
    "export": {

      /**
       * Exports the image from the given canvas with the given options
       * @param  {Canvas} canvas
       * @param  {ImglyKit.RenderType} renderType
       * @param  {ImglyKit.ImageFormat} imageFormat
       * @return {string|image}
       */

      value: function _export(canvas, renderType, imageFormat) {
        var result = canvas.toDataURL(imageFormat);
        if (renderType == RenderType.IMAGE) {
          var image;

          /* istanbul ignore else  */
          if (typeof window === "undefined") {
            // Not a browser environment
            var CanvasImage = require("canvas").Image;
            image = new CanvasImage();
          } else {
            image = new Image();
          }

          image.src = result;
          result = image;
        }
        return result;
      }
    }
  });

  return ImageExporter;
})();

module.exports = ImageExporter;

},{"../constants":11,"./utils":20,"canvas":"canvas"}],18:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

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

var Vector2 = (function () {
  function Vector2(x, y) {
    _classCallCheck(this, Vector2);

    this.x = x;
    this.y = y;
    if (typeof this.x === "undefined") {
      this.x = 0;
    }
    if (typeof this.y === "undefined") {
      this.y = 0;
    }
  }

  _createClass(Vector2, {
    set: {

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
    },
    clone: {

      /**
       * Creates a clone of this vector
       * @return {Vector2}
       */

      value: function clone() {
        return new Vector2(this.x, this.y);
      }
    },
    copy: {

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
    },
    clamp: {

      /**
       * Clamps this vector with the given Vector2 / number
       * @param  {(number|Vector2)} minimum
       * @param  {(number|Vector2)} maximum
       * @return {Vector2}
       */

      value: function clamp(minimum, maximum) {
        var minimumSet = minimum !== null && typeof minimum !== "undefined";
        var maximumSet = maximum !== null && typeof maximum !== "undefined";

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
    },
    divide: {

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
          this.y /= typeof y === "undefined" ? divisor : y;
        }
        return this;
      }
    },
    subtract: {

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
          this.y -= typeof y === "undefined" ? subtrahend : y;
        }
        return this;
      }
    },
    multiply: {

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
          this.y *= typeof y === "undefined" ? factor : y;
        }
        return this;
      }
    },
    add: {

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
          this.y += typeof y === "undefined" ? addend : y;
        }
        return this;
      }
    },
    equals: {

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
    },
    flip: {

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
    },
    toString: {

      /**
       * Returns a string representation of this vector
       * @return {String}
       */

      value: function toString() {
        return "Vector2({ x: " + this.x + ", y: " + this.y + " })";
      }
    }
  });

  return Vector2;
})();

module.exports = Vector2;

},{}],19:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var ImageDimensions = _interopRequire(require("./image-dimensions"));

var Vector2 = _interopRequire(require("./math/vector2"));

var CanvasRenderer = _interopRequire(require("../renderers/canvas-renderer"));

var WebGLRenderer = _interopRequire(require("../renderers/webgl-renderer"));

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
    this._dimensions = new ImageDimensions(dimensions);

    /**
     * @type {Vector2}
     * @private
     */
    this._initialDimensions = new Vector2(this._image.width, this._image.height);

    this._initRenderer();
  }

  _createClass(RenderImage, {
    _initRenderer: {

      /**
       * Creates a renderer (canvas or webgl, depending on support)
       * @return {Promise}
       * @private
       */

      value: function _initRenderer() {
        /* istanbul ignore if */
        if (WebGLRenderer.isSupported() && this._options.preferredRenderer !== "canvas") {
          this._renderer = new WebGLRenderer(this._initialDimensions);
          this._webglEnabled = true;
        } else if (CanvasRenderer.isSupported()) {
          this._renderer = new CanvasRenderer(this._initialDimensions);
          this._webglEnabled = false;
        }

        /* istanbul ignore if */
        if (this._renderer === null) {
          throw new Error("Neither Canvas nor WebGL renderer are supported.");
        }

        this._renderer.drawImage(this._image);
      }
    },
    render: {

      /**
       * Renders the image
       * @return {Promise}
       */

      value: function render() {
        var _this = this;

        var stack = this.sanitizedStack;

        var validationPromises = [];
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = stack[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var operation = _step.value;

            validationPromises.push(operation.validateSettings());
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"]) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        return Promise.all(validationPromises).then(function () {
          var promises = [];
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = stack[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var operation = _step2.value;

              promises.push(operation.render(_this._renderer));
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
                _iterator2["return"]();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
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
    },
    getRenderer: {

      /**
       * Returns the renderer
       * @return {Renderer}
       */

      value: function getRenderer() {
        return this._renderer;
      }
    },
    sanitizedStack: {

      /**
       * Returns the operations stack without falsy values
       * @type {Array.<Operation>}
       */

      get: function () {
        var sanitizedStack = [];
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this._stack[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var operation = _step.value;

            if (!operation) continue;
            sanitizedStack.push(operation);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"]) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        return sanitizedStack;
      }
    }
  });

  return RenderImage;
})();

module.exports = RenderImage;

},{"../renderers/canvas-renderer":77,"../renderers/webgl-renderer":79,"./image-dimensions":16,"./math/vector2":18}],20:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Vector2 = _interopRequire(require("./math/vector2"));

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

  _createClass(Utils, null, {
    isArray: {

      /**
       * Checks if the given object is an Array
       * @param  {Object}  object
       * @return {Boolean}
       */

      value: function isArray(object) {
        return Object.prototype.toString.call(object) === "[object Array]";
      }
    },
    select: {

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
        if (typeof selector === "string") {
          selector = selector.split(",").map(function (identifier) {
            return identifier.trim();
          });
        }

        // Turn array parameter into an object with `only`
        if (Utils.isArray(selector)) {
          selector = { only: selector };
        }

        if (typeof selector.only !== "undefined") {
          if (typeof selector.only === "string") {
            selector.only = selector.only.split(",").map(function (identifier) {
              return identifier.trim();
            });
          }

          // Select only the given identifiers
          return items.filter(function (item) {
            return selector.only.indexOf(item) !== -1;
          });
        } else if (typeof selector.except !== "undefined") {
          if (typeof selector.except === "string") {
            selector.except = selector.except.split(",").map(function (identifier) {
              return identifier.trim();
            });
          }

          // Select all but the given identifiers
          return items.filter(function (item) {
            return selector.except.indexOf(item) === -1;
          });
        }

        throw new Error("Utils#select failed to filter items.");
      }
    },
    values: {

      /**
       * Returns the given object's values as an array
       * @param {Object} object
       * @returns {Array<*>}
       */

      value: (function (_values) {
        var _valuesWrapper = function values(_x) {
          return _values.apply(this, arguments);
        };

        _valuesWrapper.toString = function () {
          return _values.toString();
        };

        return _valuesWrapper;
      })(function (object) {
        var values = [];
        for (var key in object) {
          values.push(object[key]);
        }
        return values;
      })
    },
    isDOMElement: {

      /**
       * Checks if the given object is a DOM element
       * @param  {Object}  o
       * @return {Boolean}
       */
      /* istanbul ignore next */

      value: function isDOMElement(o) {
        return typeof HTMLElement === "object" ? o instanceof HTMLElement : o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string";
      }
    },
    getEventPosition: {

      /**
       * Gets the x and y position for the given event.
       * @param {Event} e
       * @return {Vector2}
       */

      value: function getEventPosition(e) {
        var x = e.pageX;
        var y = e.pageY;
        if (e.type.indexOf("touch") !== -1) {
          x = e.touches[0].pageX;
          y = e.touches[0].pageY;
        }
        return new Vector2(x, y);
      }
    }
  });

  return Utils;
})();

module.exports = Utils;

},{"./math/vector2":18}],21:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Operation = _interopRequire(require("./operation"));

var PrimitivesStack = _interopRequire(require("./filters/primitives-stack"));

var BrightnessPrimitive = _interopRequire(require("./filters/primitives/brightness"));

/**
 * @class
 * @alias ImglyKit.Operations.BrightnessOperation
 * @extends ImglyKit.Operation
 */

var BrightnessOperation = (function (_Operation) {
  function BrightnessOperation() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, BrightnessOperation);

    this.availableOptions = {
      brightness: { type: "number", "default": 0 }
    };

    _get(Object.getPrototypeOf(BrightnessOperation.prototype), "constructor", this).apply(this, args);
  }

  _inherits(BrightnessOperation, _Operation);

  _createClass(BrightnessOperation, {
    _renderWebGL: {

      /**
       * Renders the brightness using WebGL
       * @param  {WebGLRenderer} renderer
       * @override
       */
      /* istanbul ignore next */

      value: function _renderWebGL(renderer) {
        this._render(renderer);
      }
    },
    _renderCanvas: {

      /**
       * Renders the brightness using Canvas2D
       * @param {CanvasRenderer} renderer
       * @override
       */

      value: function _renderCanvas(renderer) {
        this._render(renderer);
      }
    },
    _render: {

      /**
       * Renders the brightness (all renderers supported)
       * @param {Renderer} renderer
       * @private
       */

      value: function _render(renderer) {
        var stack = new PrimitivesStack();

        stack.add(new BrightnessPrimitive({
          brightness: this._options.brightness
        }));

        stack.render(renderer);
      }
    }
  });

  return BrightnessOperation;
})(Operation);

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
BrightnessOperation.prototype.identifier = "brightness";

module.exports = BrightnessOperation;

},{"./filters/primitives-stack":50,"./filters/primitives/brightness":51,"./operation":70}],22:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Operation = _interopRequire(require("./operation"));

var PrimitivesStack = _interopRequire(require("./filters/primitives-stack"));

var ContrastPrimitive = _interopRequire(require("./filters/primitives/contrast"));

/**
 * @class
 * @alias ImglyKit.Operations.ContrastOperation
 * @extends ImglyKit.Operation
 */

var ContrastOperation = (function (_Operation) {
  function ContrastOperation() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, ContrastOperation);

    this.availableOptions = {
      contrast: { type: "number", "default": 1 }
    };

    _get(Object.getPrototypeOf(ContrastOperation.prototype), "constructor", this).apply(this, args);
  }

  _inherits(ContrastOperation, _Operation);

  _createClass(ContrastOperation, {
    _renderWebGL: {

      /**
       * Renders the contrast using WebGL
       * @param  {WebGLRenderer} renderer
       * @override
       */
      /* istanbul ignore next */

      value: function _renderWebGL(renderer) {
        this._render(renderer);
      }
    },
    _renderCanvas: {

      /**
       * Renders the contrast using Canvas2D
       * @param {CanvasRenderer} renderer
       * @override
       */

      value: function _renderCanvas(renderer) {
        this._render(renderer);
      }
    },
    _render: {

      /**
       * Renders the contrast (all renderers supported)
       * @param  {Renderer} renderer
       * @private
       */

      value: function _render(renderer) {
        var stack = new PrimitivesStack();

        stack.add(new ContrastPrimitive({
          contrast: this._options.contrast
        }));

        stack.render(renderer);
      }
    }
  });

  return ContrastOperation;
})(Operation);

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
ContrastOperation.prototype.identifier = "contrast";

module.exports = ContrastOperation;

},{"./filters/primitives-stack":50,"./filters/primitives/contrast":52,"./operation":70}],23:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Operation = _interopRequire(require("./operation"));

var Vector2 = _interopRequire(require("../lib/math/vector2"));

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

    this.availableOptions = {
      start: { type: "vector2", required: true, "default": new Vector2(0, 0) },
      end: { type: "vector2", required: true, "default": new Vector2(1, 1) }
    };

    /**
     * The fragment shader used for this operation
     */
    this.fragmentShader = "\n      precision mediump float;\n      uniform sampler2D u_image;\n      varying vec2 v_texCoord;\n      uniform vec2 u_cropStart;\n      uniform vec2 u_cropEnd;\n\n      void main() {\n        vec2 size = u_cropEnd - u_cropStart;\n        gl_FragColor = texture2D(u_image, v_texCoord * size + u_cropStart);\n      }\n    ";

    _get(Object.getPrototypeOf(CropOperation.prototype), "constructor", this).apply(this, args);
  }

  _inherits(CropOperation, _Operation);

  _createClass(CropOperation, {
    _renderWebGL: {

      /**
       * Rotates and crops the image using WebGL
       * @param  {WebGLRenderer} renderer
       * @override
       * @private
       */
      /* istanbul ignore next */

      value: function _renderWebGL(renderer) {
        var canvas = renderer.getCanvas();
        var canvasSize = new Vector2(canvas.width, canvas.height);

        var start = this._options.start.clone();
        var end = this._options.end.clone();

        if (this._options.numberFormat === "absolute") {
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
            u_cropStart: { type: "2f", value: [start.x, start.y] },
            u_cropEnd: { type: "2f", value: [end.x, end.y] }
          }
        });
      }
    },
    _renderCanvas: {

      /**
       * Crops the image using Canvas
       * @param {CanvasRenderer} renderer
       * @override
       * @private
       */

      value: function _renderCanvas(renderer) {
        var canvas = renderer.getCanvas();
        var dimensions = new Vector2(canvas.width, canvas.height);

        var newDimensions = this.getNewDimensions(renderer);

        // Create a temporary canvas to draw to
        var newCanvas = renderer.createCanvas();
        newCanvas.width = newDimensions.x;
        newCanvas.height = newDimensions.y;
        var newContext = newCanvas.getContext("2d");

        // The upper left corner of the cropped area on the original image
        var startPosition = this._options.start.clone();

        if (this._options.numberFormat === "relative") {
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
    },
    getNewDimensions: {

      /**
       * Gets the new dimensions
       * @param {Renderer} renderer
       * @param {Vector2} [dimensions]
       * @return {Vector2}
       */

      value: function getNewDimensions(renderer, dimensions) {
        var canvas = renderer.getCanvas();
        dimensions = dimensions || new Vector2(canvas.width, canvas.height);

        var newDimensions = this._options.end.clone().subtract(this._options.start);

        if (this._options.numberFormat === "relative") {
          newDimensions.multiply(dimensions);
        }

        return newDimensions;
      }
    }
  });

  return CropOperation;
})(Operation);

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
CropOperation.prototype.identifier = "crop";

module.exports = CropOperation;

},{"../lib/math/vector2":18,"./operation":70}],24:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Operation = _interopRequire(require("./operation"));

var IdentityFilter = _interopRequire(require("./filters/identity-filter"));

/**
 * An operation that can apply a selected filter
 *
 * @class
 * @alias ImglyKit.Operations.FiltersOperation
 * @extends ImglyKit.Operation
 */

var FiltersOperation = (function (_Operation) {
  function FiltersOperation() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, FiltersOperation);

    this.availableOptions = {
      filter: { type: "object", "default": IdentityFilter,
        setter: function setter(Filter) {
          this._selectedFilter = new Filter();
          return Filter;
        }
      }
    };

    _get(Object.getPrototypeOf(FiltersOperation.prototype), "constructor", this).apply(this, args);
  }

  _inherits(FiltersOperation, _Operation);

  _createClass(FiltersOperation, {
    _renderWebGL: {

      /**
       * Renders the filter using WebGL
       * @param  {WebGLRenderer} renderer
       * @override
       */
      /* istanbul ignore next */

      value: function _renderWebGL(renderer) {
        this._render(renderer);
      }
    },
    _renderCanvas: {

      /**
       * Renders the filter using Canvas2D
       * @param {CanvasRenderer} renderer
       * @override
       */

      value: function _renderCanvas(renderer) {
        this._render(renderer);
      }
    },
    _render: {

      /**
       * Renders the filter (all renderers supported)
       * @param {Renderer} renderer
       * @private
       */

      value: function _render(renderer) {
        this._selectedFilter.render(renderer);
      }
    }
  });

  return FiltersOperation;
})(Operation);

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
FiltersOperation.prototype.identifier = "filters";

module.exports = FiltersOperation;

},{"./filters/identity-filter":38,"./operation":70}],25:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

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

  _createClass(A15Filter, {
    name: {

      /**
       * The name that is displayed in the UI
       * @type {String}
       */

      get: function () {
        return "15";
      }
    },
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        stack.add(new Filter.Primitives.Contrast({
          contrast: 0.63
        }));

        stack.add(new Filter.Primitives.Brightness({
          brightness: 0.12
        }));

        stack.add(new Filter.Primitives.ToneCurve({
          rgbControlPoints: {
            red: [[0, 38], [94, 94], [148, 142], [175, 187], [255, 255]],
            green: [[0, 0], [77, 53], [171, 190], [255, 255]],
            blue: [[0, 10], [48, 85], [174, 228], [255, 255]]
          }
        }));

        stack.render(renderer);
      }
    }
  }, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "a15";
      }
    }
  });

  return A15Filter;
})(Filter);

module.exports = A15Filter;

},{"./filter":31}],26:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

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

  _createClass(BreezeFilter, {
    name: {

      /**
       * The name that is displayed in the UI
       * @type {String}
       */

      get: function () {
        return "Breeze";
      }
    },
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        // Desaturation
        stack.add(new Filter.Primitives.Desaturation({
          desaturation: 0.5
        }));

        // Tone curve
        stack.add(new Filter.Primitives.ToneCurve({
          rgbControlPoints: {
            red: [[0, 0], [170, 170], [212, 219], [234, 242], [255, 255]],
            green: [[0, 0], [170, 168], [234, 231], [255, 255]],
            blue: [[0, 0], [170, 170], [212, 208], [255, 255]]
          }
        }));

        stack.render(renderer);
      }
    }
  }, {
    identifier: {

      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "breeze";
      }
    }
  });

  return BreezeFilter;
})(Filter);

module.exports = BreezeFilter;

},{"./filter":31}],27:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

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

  _createClass(BWFilter, {
    name: {

      /**
       * The name that is displayed in the UI
       * @type {String}
       */

      get: function () {
        return "B&W";
      }
    },
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        stack.add(new Filter.Primitives.Grayscale());

        stack.render(renderer);
      }
    }
  }, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "bw";
      }
    }
  });

  return BWFilter;
})(Filter);

module.exports = BWFilter;

},{"./filter":31}],28:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

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

  _createClass(BWHardFilter, {
    name: {

      /**
       * The name that is displayed in the UI
       * @type {String}
       */

      get: function () {
        return "1920";
      }
    },
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        stack.add(new Filter.Primitives.Grayscale());
        stack.add(new Filter.Primitives.Contrast({
          contrast: 1.5
        }));

        stack.render(renderer);
      }
    }
  }, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "bwhard";
      }
    }
  });

  return BWHardFilter;
})(Filter);

module.exports = BWHardFilter;

},{"./filter":31}],29:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

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

  _createClass(CelsiusFilter, {
    name: {

      /**
       * The name that is displayed in the UI
       * @type {String}
       */

      get: function () {
        return "Celsius";
      }
    },
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        stack.add(new Filter.Primitives.ToneCurve({
          rgbControlPoints: {
            red: [[0, 69], [55, 110], [202, 230], [255, 255]],
            green: [[0, 44], [89, 93], [185, 141], [255, 189]],
            blue: [[0, 76], [39, 82], [218, 138], [255, 171]]
          }
        }));

        stack.render(renderer);
      }
    }
  }, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "celsius";
      }
    }
  });

  return CelsiusFilter;
})(Filter);

module.exports = CelsiusFilter;

},{"./filter":31}],30:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

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

  _createClass(ChestFilter, {
    name: {

      /**
       * The name that is displayed in the UI
       * @type {String}
       */

      get: function () {
        return "Chest";
      }
    },
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        // Tone curve
        stack.add(new Filter.Primitives.ToneCurve({
          rgbControlPoints: {
            red: [[0, 0], [44, 44], [124, 143], [221, 204], [255, 255]],
            green: [[0, 0], [130, 127], [213, 199], [255, 255]],
            blue: [[0, 0], [51, 52], [219, 204], [255, 255]]
          }
        }));

        stack.render(renderer);
      }
    }
  }, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "chest";
      }
    }
  });

  return ChestFilter;
})(Filter);

module.exports = ChestFilter;

},{"./filter":31}],31:[function(require,module,exports){
/* jshint unused: false */
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

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

var Filter = (function () {
  function Filter() {
    _classCallCheck(this, Filter);
  }

  _createClass(Filter, {
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        /* istanbul ignore next */
        throw new Error("Filter#render is abstract and not implemented in inherited class.");
      }
    }
  }, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return null;
      }
    }
  });

  return Filter;
})();

/**
 * To create an {@link ImglyKit.Filter} class of your own, call this
 * method and provide instance properties and functions.
 * @function
 */
Filter.extend = require("../../lib/extend");

// Exposed classes
Filter.PrimitivesStack = require("./primitives-stack");
Filter.Primitives = {};
Filter.Primitives.Saturation = require("./primitives/saturation");
Filter.Primitives.LookupTable = require("./primitives/lookup-table");
Filter.Primitives.ToneCurve = require("./primitives/tone-curve");
Filter.Primitives.SoftColorOverlay = require("./primitives/soft-color-overlay");
Filter.Primitives.Desaturation = require("./primitives/desaturation");
Filter.Primitives.X400 = require("./primitives/x400");
Filter.Primitives.Grayscale = require("./primitives/grayscale");
Filter.Primitives.Contrast = require("./primitives/contrast");
Filter.Primitives.Glow = require("./primitives/glow");
Filter.Primitives.Gobblin = require("./primitives/gobblin");
Filter.Primitives.Brightness = require("./primitives/brightness");

module.exports = Filter;

},{"../../lib/extend":15,"./primitives-stack":50,"./primitives/brightness":51,"./primitives/contrast":52,"./primitives/desaturation":53,"./primitives/glow":54,"./primitives/gobblin":55,"./primitives/grayscale":56,"./primitives/lookup-table":57,"./primitives/saturation":59,"./primitives/soft-color-overlay":60,"./primitives/tone-curve":61,"./primitives/x400":62}],32:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

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

  _createClass(FixieFilter, {
    name: {

      /**
       * The name that is displayed in the UI
       * @type {String}
       */

      get: function () {
        return "Fixie";
      }
    },
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        // Tone curve
        stack.add(new Filter.Primitives.ToneCurve({
          rgbControlPoints: {
            red: [[0, 0], [44, 28], [63, 48], [128, 132], [235, 248], [255, 255]],
            green: [[0, 0], [20, 10], [60, 45], [190, 209], [211, 231], [255, 255]],
            blue: [[0, 31], [41, 62], [150, 142], [234, 212], [255, 224]]
          }
        }));

        stack.render(renderer);
      }
    }
  }, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "fixie";
      }
    }
  });

  return FixieFilter;
})(Filter);

module.exports = FixieFilter;

},{"./filter":31}],33:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

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

  _createClass(FoodFilter, {
    name: {

      /**
       * The name that is displayed in the UI
       * @type {String}
       */

      get: function () {
        return "Food";
      }
    },
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        stack.add(new Filter.Primitives.Saturation({
          saturation: 1.35
        }));

        stack.add(new Filter.Primitives.Contrast({
          contrast: 1.1
        }));

        stack.render(renderer);
      }
    }
  }, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "food";
      }
    }
  });

  return FoodFilter;
})(Filter);

module.exports = FoodFilter;

},{"./filter":31}],34:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

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

  _createClass(FridgeFilter, {
    name: {

      /**
       * The name that is displayed in the UI
       * @type {String}
       */

      get: function () {
        return "Fridge";
      }
    },
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        // Tone curve
        stack.add(new Filter.Primitives.ToneCurve({
          rgbControlPoints: {
            red: [[0, 9], [21, 11], [45, 24], [255, 220]],
            green: [[0, 12], [21, 21], [42, 42], [150, 150], [170, 173], [255, 210]],
            blue: [[0, 28], [43, 72], [128, 185], [255, 220]]
          }
        }));

        stack.render(renderer);
      }
    }
  }, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "fridge";
      }
    }
  });

  return FridgeFilter;
})(Filter);

module.exports = FridgeFilter;

},{"./filter":31}],35:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

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

  _createClass(FrontFilter, {
    name: {

      /**
       * The name that is displayed in the UI
       * @type {String}
       */

      get: function () {
        return "Front";
      }
    },
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        // Tone curve
        stack.add(new Filter.Primitives.ToneCurve({
          rgbControlPoints: {
            red: [[0, 65], [28, 67], [67, 113], [125, 183], [187, 217], [255, 229]],
            green: [[0, 52], [42, 59], [104, 134], [169, 209], [255, 240]],
            blue: [[0, 52], [65, 68], [93, 104], [150, 153], [255, 198]]
          }
        }));

        stack.render(renderer);
      }
    }
  }, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "front";
      }
    }
  });

  return FrontFilter;
})(Filter);

module.exports = FrontFilter;

},{"./filter":31}],36:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

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

  _createClass(GlamFilter, {
    name: {

      /**
       * The name that is displayed in the UI
       * @type {String}
       */

      get: function () {
        return "Glam";
      }
    },
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        stack.add(new Filter.Primitives.Contrast({
          contrast: 1.1
        }));

        stack.add(new Filter.Primitives.ToneCurve({
          rgbControlPoints: {
            red: [[0, 0], [94, 74], [181, 205], [255, 255]],
            green: [[0, 0], [127, 127], [255, 255]],
            blue: [[0, 0], [102, 73], [227, 213], [255, 255]]
          }
        }));

        stack.render(renderer);
      }
    }
  }, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "glam";
      }
    }
  });

  return GlamFilter;
})(Filter);

module.exports = GlamFilter;

},{"./filter":31}],37:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

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

  _createClass(GobblinFilter, {
    name: {

      /**
       * The name that is displayed in the UI
       * @type {String}
       */

      get: function () {
        return "Gobblin";
      }
    },
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        stack.add(new Filter.Primitives.Gobblin());

        stack.render(renderer);
      }
    }
  }, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "gobblin";
      }
    }
  });

  return GobblinFilter;
})(Filter);

module.exports = GobblinFilter;

},{"./filter":31}],38:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

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

  _createClass(IdentityFilter, {
    name: {

      /**
       * The name that is displayed in the UI
       * @type {String}
       */

      get: function () {
        return "Original";
      }
    },
    render: {

      /**
       * Renders the filter
       * @return {Promise}
       */

      value: function render() {}
    }
  }, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "identity";
      }
    }
  });

  return IdentityFilter;
})(Filter);

module.exports = IdentityFilter;

// This is the identity filter, it doesn't have any effect.

},{"./filter":31}],39:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

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

  _createClass(K1Filter, {
    name: {

      /**
       * The name that is displayed in the UI
       * @type {String}
       */

      get: function () {
        return "K1";
      }
    },
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        // Tone curve
        stack.add(new Filter.Primitives.ToneCurve({
          controlPoints: [[0, 0], [53, 32], [91, 80], [176, 205], [255, 255]]
        }));

        // Saturation
        stack.add(new Filter.Primitives.Saturation({
          saturation: 0.9
        }));

        stack.render(renderer);
      }
    }
  }, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "k1";
      }
    }
  });

  return K1Filter;
})(Filter);

module.exports = K1Filter;

},{"./filter":31}],40:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

var Color = _interopRequire(require("../../lib/color"));

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

  _createClass(K2Filter, {
    name: {

      /**
       * The name that is displayed in the UI
       * @type {String}
       */

      get: function () {
        return "K2";
      }
    },
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        // Tone curve
        stack.add(new Filter.Primitives.ToneCurve({
          controlPoints: [[0, 0], [54, 33], [77, 82], [94, 103], [122, 126], [177, 193], [229, 232], [255, 255]]
        }));

        // Soft color overlay
        stack.add(new Filter.Primitives.SoftColorOverlay({
          color: new Color(40 / 255, 40 / 255, 40 / 255)
        }));

        stack.render(renderer);
      }
    }
  }, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "k2";
      }
    }
  });

  return K2Filter;
})(Filter);

module.exports = K2Filter;

},{"../../lib/color":13,"./filter":31}],41:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

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

  _createClass(K6Filter, {
    name: {

      /**
       * The name that is displayed in the UI
       * @type {String}
       */

      get: function () {
        return "K6";
      }
    },
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        // Saturation
        stack.add(new Filter.Primitives.Saturation({
          saturation: 0.5
        }));

        stack.render(renderer);
      }
    }
  }, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "k6";
      }
    }
  });

  return K6Filter;
})(Filter);

module.exports = K6Filter;

},{"./filter":31}],42:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

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

  _createClass(KDynamicFilter, {
    name: {

      /**
       * The name that is displayed in the UI
       * @type {String}
       */

      get: function () {
        return "KDynamic";
      }
    },
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        // Tone curve
        stack.add(new Filter.Primitives.ToneCurve({
          controlPoints: [[0, 0], [17, 27], [46, 69], [90, 112], [156, 200], [203, 243], [255, 255]]
        }));

        // Saturation
        stack.add(new Filter.Primitives.Saturation({
          saturation: 0.7
        }));

        stack.render(renderer);
      }
    }
  }, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "kdynamic";
      }
    }
  });

  return KDynamicFilter;
})(Filter);

module.exports = KDynamicFilter;

},{"./filter":31}],43:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

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

  _createClass(LeninFilter, {
    name: {

      /**
       * The name that is displayed in the UI
       * @type {String}
       */

      get: function () {
        return "Lenin";
      }
    },
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        // Desaturation
        stack.add(new Filter.Primitives.Desaturation({
          desaturation: 0.4
        }));

        // Tone curve
        stack.add(new Filter.Primitives.ToneCurve({
          rgbControlPoints: {
            red: [[0, 20], [40, 20], [106, 111], [129, 153], [190, 223], [255, 255]],
            green: [[0, 20], [40, 20], [62, 41], [106, 108], [132, 159], [203, 237], [255, 255]],
            blue: [[0, 40], [40, 40], [73, 60], [133, 160], [191, 297], [203, 237], [237, 239], [255, 255]]
          }
        }));

        stack.render(renderer);
      }
    }
  }, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "lenin";
      }
    }
  });

  return LeninFilter;
})(Filter);

module.exports = LeninFilter;

},{"./filter":31}],44:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

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

  _createClass(LomoFilter, {
    name: {

      /**
       * The name that is displayed in the UI
       * @type {String}
       */

      get: function () {
        return "Lomo";
      }
    },
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        stack.add(new Filter.Primitives.ToneCurve({
          controlPoints: [[0, 0], [87, 20], [131, 156], [183, 205], [255, 200]]
        }));

        stack.render(renderer);
      }
    }
  }, {
    identifier: {

      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "lomo";
      }
    }
  });

  return LomoFilter;
})(Filter);

module.exports = LomoFilter;

},{"./filter":31}],45:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

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

  _createClass(MellowFilter, {
    name: {

      /**
       * The name that is displayed in the UI
       * @type {String}
       */

      get: function () {
        return "Mellow";
      }
    },
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        stack.add(new Filter.Primitives.ToneCurve({
          rgbControlPoints: {
            red: [[0, 0], [41, 84], [87, 134], [255, 255]],
            green: [[0, 0], [255, 216]],
            blue: [[0, 0], [255, 131]]
          }
        }));

        stack.render(renderer);
      }
    }
  }, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "mellow";
      }
    }
  });

  return MellowFilter;
})(Filter);

module.exports = MellowFilter;

},{"./filter":31}],46:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

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

  _createClass(MorningFilter, {
    name: {

      /**
       * The name that is displayed in the UI
       * @type {String}
       */

      get: function () {
        return "Morning";
      }
    },
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        stack.add(new Filter.Primitives.ToneCurve({
          rgbControlPoints: {
            red: [[0, 40], [255, 230]],
            green: [[0, 10], [255, 225]],
            blue: [[0, 20], [255, 181]]
          }
        }));

        stack.add(new Filter.Primitives.Glow());

        stack.render(renderer);
      }
    }
  }, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "morning";
      }
    }
  });

  return MorningFilter;
})(Filter);

module.exports = MorningFilter;

},{"./filter":31}],47:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

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

  _createClass(OrchidFilter, {
    name: {

      /**
       * The name that is displayed in the UI
       * @type {String}
       */

      get: function () {
        return "Orchid";
      }
    },
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        // Tone curve
        stack.add(new Filter.Primitives.ToneCurve({
          rgbControlPoints: {
            red: [[0, 0], [115, 130], [195, 215], [255, 255]],
            green: [[0, 0], [148, 153], [172, 215], [255, 255]],
            blue: [[0, 46], [58, 75], [178, 205], [255, 255]]
          }
        }));

        // Tone curve
        stack.add(new Filter.Primitives.ToneCurve({
          controlPoints: [[0, 0], [117, 151], [189, 217], [255, 255]]
        }));

        // Desaturation
        stack.add(new Filter.Primitives.Desaturation({
          desaturation: 0.65
        }));

        stack.render(renderer);
      }
    }
  }, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "orchid";
      }
    }
  });

  return OrchidFilter;
})(Filter);

module.exports = OrchidFilter;

},{"./filter":31}],48:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

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

  _createClass(PolaFilter, {
    name: {

      /**
       * The name that is displayed in the UI
       * @type {String}
       */

      get: function () {
        return "Pola SX";
      }
    },
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        stack.add(new Filter.Primitives.ToneCurve({
          rgbControlPoints: {
            red: [[0, 0], [94, 74], [181, 205], [255, 255]],
            green: [[0, 0], [34, 34], [99, 76], [176, 190], [255, 255]],
            blue: [[0, 0], [102, 73], [227, 213], [255, 255]]
          }
        }));

        stack.add(new Filter.Primitives.Saturation({
          saturation: 0.8
        }));

        stack.add(new Filter.Primitives.Contrast({
          contrast: 1.5
        }));

        stack.render(renderer);
      }
    }
  }, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "pola";
      }
    }
  });

  return PolaFilter;
})(Filter);

module.exports = PolaFilter;

},{"./filter":31}],49:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

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

  _createClass(Pola669Filter, {
    name: {

      /**
       * The name that is displayed in the UI
       * @type {String}
       */

      get: function () {
        return "Pola 669";
      }
    },
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        stack.add(new Filter.Primitives.ToneCurve({
          rgbControlPoints: {
            red: [[0, 0], [56, 18], [196, 209], [255, 255]],
            green: [[0, 38], [71, 84], [255, 255]],
            blue: [[0, 0], [131, 133], [204, 211], [255, 255]]
          }
        }));

        stack.add(new Filter.Primitives.Saturation({
          saturation: 0.8
        }));

        stack.add(new Filter.Primitives.Contrast({
          contrast: 1.5
        }));

        stack.render(renderer);
      }
    }
  }, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "pola669";
      }
    }
  });

  return Pola669Filter;
})(Filter);

module.exports = Pola669Filter;

},{"./filter":31}],50:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

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

var PrimitivesStack = (function () {
  function PrimitivesStack() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, PrimitivesStack);

    _get(Object.getPrototypeOf(PrimitivesStack.prototype), "constructor", this).apply(this, args);

    /**
     * The stack of {@link ImglyKit.Filter.Primitive} instances
     * @type {Array}
     * @private
     */
    this._stack = [];
  }

  _createClass(PrimitivesStack, {
    add: {

      /**
       * Adds the given primitive to the stack
       * @param {ImglyKit.Filter.Primitive} primitive
       */

      value: function add(primitive) {
        this._stack.push(primitive);
      }
    },
    render: {

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
    }
  });

  return PrimitivesStack;
})();

module.exports = PrimitivesStack;

},{}],51:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var _ = _interopRequire(require("lodash"));

var Primitive = _interopRequire(require("./primitive"));

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

    _get(Object.getPrototypeOf(Brightness.prototype), "constructor", this).apply(this, args);

    this._options = _.defaults(this._options, {
      brightness: 1
    });

    /**
     * The fragment shader for this primitive
     * @return {String}
     * @private
     */
    this._fragmentShader = "\n\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_image;\n      uniform float u_brightness;\n\n      void main() {\n        vec4 texColor = texture2D(u_image, v_texCoord);\n        gl_FragColor = vec4((texColor.rgb + vec3(u_brightness)), texColor.a);\n      }\n\n    ";
  }

  _inherits(Brightness, _Primitive);

  _createClass(Brightness, {
    renderWebGL: {

      /**
       * Renders the primitive (WebGL)
       * @param  {WebGLRenderer} renderer
       */
      /* istanbul ignore next */

      value: function renderWebGL(renderer) {
        renderer.runShader(null, this._fragmentShader, {
          uniforms: {
            u_brightness: { type: "f", value: this._options.brightness }
          }
        });
      }
    },
    renderCanvas: {

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
    }
  });

  return Brightness;
})(Primitive);

module.exports = Brightness;

},{"./primitive":58,"lodash":"lodash"}],52:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var _ = _interopRequire(require("lodash"));

var Primitive = _interopRequire(require("./primitive"));

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

    _get(Object.getPrototypeOf(Contrast.prototype), "constructor", this).apply(this, args);

    this._options = _.defaults(this._options, {
      contrast: 1
    });

    /**
     * The fragment shader for this primitive
     * @return {String}
     * @private
     */
    this._fragmentShader = "\n\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_image;\n      uniform float u_contrast;\n\n      void main() {\n        vec4 texColor = texture2D(u_image, v_texCoord);\n        gl_FragColor = vec4(((texColor.rgb - vec3(0.5)) * u_contrast + vec3(0.5)), texColor.a);\n      }\n\n    ";
  }

  _inherits(Contrast, _Primitive);

  _createClass(Contrast, {
    renderWebGL: {

      /**
       * Renders the primitive (WebGL)
       * @param  {WebGLRenderer} renderer
       */
      /* istanbul ignore next */

      value: function renderWebGL(renderer) {
        renderer.runShader(null, this._fragmentShader, {
          uniforms: {
            u_contrast: { type: "f", value: this._options.contrast }
          }
        });
      }
    },
    renderCanvas: {

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
    }
  });

  return Contrast;
})(Primitive);

module.exports = Contrast;

},{"./primitive":58,"lodash":"lodash"}],53:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var _ = _interopRequire(require("lodash"));

var Primitive = _interopRequire(require("./primitive"));

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

    _get(Object.getPrototypeOf(Desaturation.prototype), "constructor", this).apply(this, args);

    this._options = _.defaults(this._options, {
      desaturation: 1
    });

    /**
     * The fragment shader for this primitive
     * @return {String}
     * @private
     */
    this._fragmentShader = "\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_image;\n      uniform float u_desaturation;\n\n      const vec3 luminanceWeighting = vec3(0.2125, 0.7154, 0.0721);\n\n      void main() {\n        vec3 texColor = texture2D(u_image, v_texCoord).xyz;\n        vec3 grayXfer = vec3(0.3, 0.59, 0.11);\n        vec3 gray = vec3(dot(grayXfer, texColor));\n        gl_FragColor = vec4(mix(texColor, gray, u_desaturation), 1.0);\n      }\n    ";
  }

  _inherits(Desaturation, _Primitive);

  _createClass(Desaturation, {
    renderWebGL: {

      /**
       * Renders the primitive (WebGL)
       * @param  {WebGLRenderer} renderer
       * @return {Promise}
       */
      /* istanbul ignore next */

      value: function renderWebGL(renderer) {
        renderer.runShader(null, this._fragmentShader, {
          uniforms: {
            u_desaturation: { type: "f", value: this._options.desaturation }
          }
        });
      }
    },
    renderCanvas: {

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
    }
  });

  return Desaturation;
})(Primitive);

module.exports = Desaturation;

},{"./primitive":58,"lodash":"lodash"}],54:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var _ = _interopRequire(require("lodash"));

var Primitive = _interopRequire(require("./primitive"));

var Color = _interopRequire(require("../../../lib/color"));

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

    _get(Object.getPrototypeOf(Glow.prototype), "constructor", this).apply(this, args);

    this._options = _.defaults(this._options, {
      color: new Color(1, 1, 1)
    });

    /**
     * The fragment shader for this primitive
     * @return {String}
     * @private
     */
    this._fragmentShader = "\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_image;\n\n      uniform vec3 u_color;\n\n      void main() {\n        vec3 texColor = texture2D(u_image, v_texCoord).rgb;\n\n        vec2 textureCoord = v_texCoord - vec2(0.5, 0.5);\n        textureCoord /= 0.75;\n\n        float d = 1.0 - dot(textureCoord, textureCoord);\n        d = clamp(d, 0.2, 1.0);\n        vec3 newColor = texColor * d * u_color.rgb;\n        gl_FragColor = vec4(vec3(newColor),1.0);\n      }\n    ";
  }

  _inherits(Glow, _Primitive);

  _createClass(Glow, {
    renderWebGL: {

      /**
       * Renders the primitive (WebGL)
       * @param  {WebGLRenderer} renderer
       * @return {Promise}
       */
      /* istanbul ignore next */

      value: function renderWebGL(renderer) {
        renderer.runShader(null, this._fragmentShader, {
          uniforms: {
            u_color: { type: "3f", value: this._options.color.toRGBGLColor() }
          }
        });
      }
    },
    renderCanvas: {

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
    }
  });

  return Glow;
})(Primitive);

module.exports = Glow;

},{"../../../lib/color":13,"./primitive":58,"lodash":"lodash"}],55:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Primitive = _interopRequire(require("./primitive"));

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

    _get(Object.getPrototypeOf(Gobblin.prototype), "constructor", this).apply(this, args);

    /**
     * The fragment shader for this primitive
     * @return {String}
     * @private
     */
    this._fragmentShader = "\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_image;\n\n      void main() {\n        vec4 texColor = texture2D(u_image, v_texCoord);\n        texColor.b = texColor.g * 0.33;\n        texColor.r = texColor.r * 0.6;\n        texColor.b += texColor.r * 0.33;\n        texColor.g = texColor.g * 0.7;\n        gl_FragColor = texColor;\n      }\n    ";
  }

  _inherits(Gobblin, _Primitive);

  _createClass(Gobblin, {
    renderWebGL: {

      /**
       * Renders the primitive (WebGL)
       * @param  {WebGLRenderer} renderer
       * @return {Promise}
       */
      /* istanbul ignore next */

      value: function renderWebGL(renderer) {
        renderer.runShader(null, this._fragmentShader);
      }
    },
    renderCanvas: {

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
    }
  });

  return Gobblin;
})(Primitive);

module.exports = Gobblin;

},{"./primitive":58}],56:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Primitive = _interopRequire(require("./primitive"));

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

    _get(Object.getPrototypeOf(Grayscale.prototype), "constructor", this).apply(this, args);

    /**
     * The fragment shader for this primitive
     * @return {String}
     * @private
     */
    this._fragmentShader = "\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_image;\n      vec3 W = vec3(0.2125, 0.7154, 0.0721);\n\n      void main() {\n        vec3 texColor = texture2D(u_image, v_texCoord).rgb;\n        float luminance = dot(texColor, W);\n        gl_FragColor = vec4(vec3(luminance), 1.0);\n      }\n    ";
  }

  _inherits(Grayscale, _Primitive);

  _createClass(Grayscale, {
    renderWebGL: {

      /**
       * Renders the primitive (WebGL)
       * @param  {WebGLRenderer} renderer
       * @return {Promise}
       */
      /* istanbul ignore next */

      value: function renderWebGL(renderer) {
        renderer.runShader(null, this._fragmentShader);
      }
    },
    renderCanvas: {

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
    }
  });

  return Grayscale;
})(Primitive);

module.exports = Grayscale;

},{"./primitive":58}],57:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Primitive = _interopRequire(require("./primitive"));

/**
 * Stores a 256 byte long lookup table in a 2d texture which will be
 * used to look up the corresponding value for each channel.
 * @class
 * @alias ImglyKit.Filter.Primitives.LookupTable
 * @extends {ImglyKit.Filter.Primitive}
 */

var LookupTable = (function (_Primitive) {
  function LookupTable() {
    _classCallCheck(this, LookupTable);

    Primitive.apply(this, arguments);

    this._textureIndex = 3;

    /**
     * The fragment shader for this primitive
     * @return {String}
     * @private
     */
    this._fragmentShader = "\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_image;\n      uniform sampler2D u_lookupTable;\n\n      void main() {\n        vec4 texColor = texture2D(u_image, v_texCoord);\n        float r = texture2D(u_lookupTable, vec2(texColor.r, 0.0)).r;\n        float g = texture2D(u_lookupTable, vec2(texColor.g, 0.0)).g;\n        float b = texture2D(u_lookupTable, vec2(texColor.b, 0.0)).b;\n\n        gl_FragColor = vec4(r, g, b, texColor.a);\n      }\n    ";
  }

  _inherits(LookupTable, _Primitive);

  _createClass(LookupTable, {
    renderWebGL: {

      /**
       * Renders the primitive (WebGL)
       * @param  {WebGLRenderer} renderer
       */
      /* istanbul ignore next */

      value: function renderWebGL(renderer) {
        this._updateTexture(renderer);

        renderer.runShader(null, this._fragmentShader, {
          uniforms: {
            u_lookupTable: { type: "i", value: 3 }
          }
        });
      }
    },
    renderCanvas: {

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
    },
    _updateTexture: {

      /**
       * Updates the lookup table texture (WebGL only)
       * @private
       */
      /* istanbul ignore next */

      value: function _updateTexture(renderer) {
        var gl = renderer.getContext();

        if (typeof this._options.data === "undefined") {
          throw new Error("LookupTable: No data specified.");
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
    }
  });

  return LookupTable;
})(Primitive);

module.exports = LookupTable;

},{"./primitive":58}],58:[function(require,module,exports){
/* jshint unused: false */
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

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

var Primitive = (function () {
  function Primitive(options) {
    _classCallCheck(this, Primitive);

    options = options || {};

    this._options = options;
  }

  _createClass(Primitive, {
    render: {

      /**
       * Renders the primitive
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        if (renderer.identifier === "webgl") {
          this.renderWebGL(renderer);
        } else {
          this.renderCanvas(renderer);
        }
      }
    },
    renderWebGL: {

      /**
       * Renders the primitive (WebGL)
       * @param  {CanvasRenderer} renderer
       */
      /* istanbul ignore next */

      value: function renderWebGL(renderer) {
        /* istanbul ignore next */
        throw new Error("Primitive#renderWebGL is abstract and not implemented in inherited class.");
      }
    },
    renderCanvas: {

      /**
       * Renders the primitive (Canvas2D)
       * @param  {CanvasRenderer} renderer
       */

      value: function renderCanvas(renderer) {
        /* istanbul ignore next */
        throw new Error("Primitive#renderCanvas is abstract and not implemented in inherited class.");
      }
    }
  });

  return Primitive;
})();

module.exports = Primitive;

},{}],59:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var _ = _interopRequire(require("lodash"));

var Primitive = _interopRequire(require("./primitive"));

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

    _get(Object.getPrototypeOf(Saturation.prototype), "constructor", this).apply(this, args);

    this._options = _.defaults(this._options, {
      saturation: 0
    });

    /**
     * The fragment shader for this primitive
     * @return {String}
     * @private
     */
    this._fragmentShader = "\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_image;\n      uniform float u_saturation;\n\n      const vec3 luminanceWeighting = vec3(0.2125, 0.7154, 0.0721);\n\n      void main() {\n        vec4 texColor = texture2D(u_image, v_texCoord);\n        float luminance = dot(texColor.rgb, luminanceWeighting);\n\n        vec3 greyScaleColor = vec3(luminance);\n\n        gl_FragColor = vec4(mix(greyScaleColor, texColor.rgb, u_saturation), texColor.a);\n      }\n    ";
  }

  _inherits(Saturation, _Primitive);

  _createClass(Saturation, {
    renderWebGL: {

      /**
       * Renders the primitive (WebGL)
       * @param  {WebGLRenderer} renderer
       */
      /* istanbul ignore next */

      value: function renderWebGL(renderer) {
        renderer.runShader(null, this._fragmentShader, {
          uniforms: {
            u_saturation: { type: "f", value: this._options.saturation }
          }
        });
      }
    },
    renderCanvas: {

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
    }
  });

  return Saturation;
})(Primitive);

module.exports = Saturation;

},{"./primitive":58,"lodash":"lodash"}],60:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var _ = _interopRequire(require("lodash"));

var Primitive = _interopRequire(require("./primitive"));

var Color = _interopRequire(require("../../../lib/color"));

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

    _get(Object.getPrototypeOf(SoftColorOverlay.prototype), "constructor", this).apply(this, args);

    this._options = _.defaults(this._options, {
      color: new Color(1, 1, 1)
    });

    /**
     * The fragment shader for this primitive
     * @return {String}
     * @private
     */
    this._fragmentShader = "\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_image;\n      uniform vec3 u_overlay;\n\n      void main() {\n        vec4 texColor = texture2D(u_image, v_texCoord);\n        vec4 overlayVec4 = vec4(u_overlay, texColor.a);\n        gl_FragColor = max(overlayVec4, texColor);\n      }\n    ";
  }

  _inherits(SoftColorOverlay, _Primitive);

  _createClass(SoftColorOverlay, {
    renderWebGL: {

      /**
       * Renders the primitive (WebGL)
       * @param  {WebGLRenderer} renderer
       */
      /* istanbul ignore next */

      value: function renderWebGL(renderer) {
        renderer.runShader(null, this._fragmentShader, {
          uniforms: {
            u_overlay: { type: "3f", value: this._options.color.toRGBGLColor() }
          }
        });
      }
    },
    renderCanvas: {

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
    }
  });

  return SoftColorOverlay;
})(Primitive);

module.exports = SoftColorOverlay;

},{"../../../lib/color":13,"./primitive":58,"lodash":"lodash"}],61:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var _ = _interopRequire(require("lodash"));

var LookupTable = _interopRequire(require("./lookup-table"));

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

    _get(Object.getPrototypeOf(ToneCurve.prototype), "constructor", this).apply(this, args);

    this._options = _.defaults(this._options, {
      rgbControlPoints: {
        red: this._options.controlPoints,
        green: this._options.controlPoints,
        blue: this._options.controlPoints
      }
    });

    if (typeof this._options.rgbControlPoints !== "undefined") {
      this._updateLookupTable();
    }
  }

  _inherits(ToneCurve, _LookupTable);

  _createClass(ToneCurve, {
    _updateLookupTable: {

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
    },
    _buildLookupTable: {

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
    },
    _calculateSplineCurve: {

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
    },
    _getSplineCurve: {
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
    },
    _secondDerivative: {
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
    }
  });

  return ToneCurve;
})(LookupTable);

module.exports = ToneCurve;

},{"./lookup-table":57,"lodash":"lodash"}],62:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Primitive = _interopRequire(require("./primitive"));

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

    _get(Object.getPrototypeOf(X400.prototype), "constructor", this).apply(this, args);

    /**
     * The fragment shader for this primitive
     * @return {String}
     * @private
     */
    this._fragmentShader = "\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_image;\n\n      void main() {\n        vec4 texColor = texture2D(u_image, v_texCoord);\n        float gray = texColor.r * 0.3 + texColor.g * 0.3 + texColor.b * 0.3;\n        gray -= 0.2;\n        gray = clamp(gray, 0.0, 1.0);\n        gray += 0.15;\n        gray *= 1.4;\n        gl_FragColor = vec4(vec3(gray), 1.0);\n      }\n    ";
  }

  _inherits(X400, _Primitive);

  _createClass(X400, {
    renderWebGL: {

      /**
       * Renders the primitive (WebGL)
       * @param  {WebGLRenderer} renderer
       */
      /* istanbul ignore next */

      value: function renderWebGL(renderer) {
        renderer.runShader(null, this._fragmentShader);
      }
    },
    renderCanvas: {

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
    }
  });

  return X400;
})(Primitive);

module.exports = X400;

},{"./primitive":58}],63:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

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

  _createClass(QuoziFilter, {
    name: {

      /**
       * The name that is displayed in the UI
       * @type {String}
       */

      get: function () {
        return "Quozi";
      }
    },
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        // Desaturation
        stack.add(new Filter.Primitives.Desaturation({
          desaturation: 0.65
        }));

        // Tone curve
        stack.add(new Filter.Primitives.ToneCurve({
          rgbControlPoints: {
            red: [[0, 50], [40, 78], [118, 170], [181, 211], [255, 255]],
            green: [[0, 27], [28, 45], [109, 157], [157, 195], [179, 208], [206, 212], [255, 240]],
            blue: [[0, 50], [12, 55], [46, 103], [103, 162], [194, 182], [241, 201], [255, 219]]
          }
        }));

        stack.render(renderer);
      }
    }
  }, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "quozi";
      }
    }
  });

  return QuoziFilter;
})(Filter);

module.exports = QuoziFilter;

},{"./filter":31}],64:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

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

  _createClass(SemiredFilter, {
    name: {

      /**
       * The name that is displayed in the UI
       * @type {String}
       */

      get: function () {
        return "Semi Red";
      }
    },
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        stack.add(new Filter.Primitives.ToneCurve({
          rgbControlPoints: {
            red: [[0, 129], [75, 153], [181, 227], [255, 255]],
            green: [[0, 8], [111, 85], [212, 158], [255, 226]],
            blue: [[0, 5], [75, 22], [193, 90], [255, 229]]
          }
        }));

        stack.add(new Filter.Primitives.Glow());

        stack.render(renderer);
      }
    }
  }, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "semired";
      }
    }
  });

  return SemiredFilter;
})(Filter);

module.exports = SemiredFilter;

},{"./filter":31}],65:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

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

  _createClass(SunnyFilter, {
    name: {

      /**
       * The name that is displayed in the UI
       * @type {String}
       */

      get: function () {
        return "Sunny";
      }
    },
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        stack.add(new Filter.Primitives.ToneCurve({
          rgbControlPoints: {
            red: [[0, 0], [62, 82], [141, 154], [255, 255]],
            green: [[0, 39], [56, 96], [192, 176], [255, 255]],
            blue: [[0, 0], [174, 99], [255, 235]]
          }
        }));

        stack.add(new Filter.Primitives.ToneCurve({
          controlPoints: [[0, 0], [55, 20], [158, 191], [255, 255]]
        }));

        stack.render(renderer);
      }
    }
  }, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "sunny";
      }
    }
  });

  return SunnyFilter;
})(Filter);

module.exports = SunnyFilter;

},{"./filter":31}],66:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

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

  _createClass(TexasFilter, {
    name: {

      /**
       * The name that is displayed in the UI
       * @type {String}
       */

      get: function () {
        return "Texas";
      }
    },
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        stack.add(new Filter.Primitives.ToneCurve({
          rgbControlPoints: {
            red: [[0, 72], [89, 99], [176, 212], [255, 237]],
            green: [[0, 49], [255, 192]],
            blue: [[0, 72], [255, 151]]
          }
        }));

        stack.render(renderer);
      }
    }
  }, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "texas";
      }
    }
  });

  return TexasFilter;
})(Filter);

module.exports = TexasFilter;

},{"./filter":31}],67:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Filter = _interopRequire(require("./filter"));

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

  _createClass(X400Filter, {
    name: {

      /**
       * The name that is displayed in the UI
       * @type {String}
       */

      get: function () {
        return "X400";
      }
    },
    render: {

      /**
       * Renders the filter
       * @param  {Renderer} renderer
       * @return {Promise}
       */

      value: function render(renderer) {
        var stack = new Filter.PrimitivesStack();

        stack.add(new Filter.Primitives.X400());

        stack.render(renderer);
      }
    }
  }, {
    identifier: {
      /**
       * A unique string that identifies this operation. Can be used to select
       * the active filter.
       * @type {String}
       */

      get: function () {
        return "x400";
      }
    }
  });

  return X400Filter;
})(Filter);

module.exports = X400Filter;

},{"./filter":31}],68:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Operation = _interopRequire(require("./operation"));

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

    this.availableOptions = {
      horizontal: { type: "boolean", "default": false },
      vertical: { type: "boolean", "default": false }
    };

    /**
     * The fragment shader used for this operation
     */
    this.fragmentShader = "\n      precision mediump float;\n      uniform sampler2D u_image;\n      varying vec2 v_texCoord;\n      uniform bool u_flipVertical;\n      uniform bool u_flipHorizontal;\n\n      void main() {\n        vec2 texCoord = vec2(v_texCoord);\n        if (u_flipVertical) {\n          texCoord.y = 1.0 - texCoord.y;\n        }\n        if (u_flipHorizontal) {\n          texCoord.x = 1.0 - texCoord.x;\n        }\n        gl_FragColor = texture2D(u_image, texCoord);\n      }\n    ";

    _get(Object.getPrototypeOf(FlipOperation.prototype), "constructor", this).apply(this, args);
  }

  _inherits(FlipOperation, _Operation);

  _createClass(FlipOperation, {
    _renderWebGL: {

      /**
       * Crops this image using WebGL
       * @param  {WebGLRenderer} renderer
       */
      /* istanbul ignore next */

      value: function _renderWebGL(renderer) {
        renderer.runShader(null, this.fragmentShader, {
          uniforms: {
            u_flipVertical: { type: "f", value: this._options.vertical },
            u_flipHorizontal: { type: "f", value: this._options.horizontal }
          }
        });
      }
    },
    _renderCanvas: {

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
    }
  });

  return FlipOperation;
})(Operation);

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
FlipOperation.prototype.identifier = "flip";

module.exports = FlipOperation;

},{"./operation":70}],69:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Operation = _interopRequire(require("./operation"));

var Color = _interopRequire(require("../lib/color"));

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

    this.availableOptions = {
      color: { type: "color", "default": new Color(0, 0, 0, 1) },
      thickness: { type: "number", "default": 0.02 }
    };

    /**
     * The texture index used for the frame
     * @type {Number}
     * @private
     */
    this._textureIndex = 1;

    /**
     * The fragment shader used for this operation
     */
    this._fragmentShader = "\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_image;\n      uniform sampler2D u_frameImage;\n      uniform vec4 u_color;\n      uniform vec2 u_thickness;\n\n      void main() {\n        vec4 fragColor = texture2D(u_image, v_texCoord);\n        if (v_texCoord.x < u_thickness.x || v_texCoord.x > 1.0 - u_thickness.x ||\n          v_texCoord.y < u_thickness.y || v_texCoord.y > 1.0 - u_thickness.y) {\n            fragColor = mix(fragColor, u_color, u_color.a);\n          }\n\n        gl_FragColor = fragColor;\n      }\n    ";

    _get(Object.getPrototypeOf(FramesOperation.prototype), "constructor", this).apply(this, args);
  }

  _inherits(FramesOperation, _Operation);

  _createClass(FramesOperation, {
    _renderWebGL: {

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
            u_color: { type: "4f", value: color.toGLColor() },
            u_thickness: { type: "2f", value: thicknessVec2 }
          }
        });
      }
    },
    _renderCanvas: {

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
    }
  });

  return FramesOperation;
})(Operation);

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
FramesOperation.prototype.identifier = "frames";

module.exports = FramesOperation;

},{"../lib/color":13,"./operation":70}],70:[function(require,module,exports){
/* jshint unused:false */
/* jshint -W083 */
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var _ = _interopRequire(require("lodash"));

var Vector2 = _interopRequire(require("../lib/math/vector2"));

var Color = _interopRequire(require("../lib/color"));

var EventEmitter = _interopRequire(require("../lib/event-emitter"));

/**
 * Base class for Operations. Extendable via {@link ImglyKit.Operation#extend}.
 * @class
 * @alias ImglyKit.Operation
 */

var Operation = (function (_EventEmitter) {
  function Operation(kit, options) {
    _classCallCheck(this, Operation);

    _get(Object.getPrototypeOf(Operation.prototype), "constructor", this).call(this);

    if (kit.constructor.name !== "ImglyKit") {
      throw new Error("Operation: First parameter for constructor has to be an ImglyKit instance.");
    }

    this._kit = kit;
    this.availableOptions = _.extend(this.availableOptions || {}, {
      numberFormat: { type: "string", "default": "relative", available: ["absolute", "relative"] }
    });
    this._dirty = true;

    this._uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      var v = c == "x" ? r : r & 3 | 8;
      return v.toString(16);
    });

    this._initOptions(options || {});
  }

  _inherits(Operation, _EventEmitter);

  _createClass(Operation, {
    validateSettings: {

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
            if (optionConfig.required && typeof _this._options[optionName] === "undefined") {
              return reject(new Error("Operation `" + identifier + "`: Option `" + optionName + "` is required."));
            }
          }

          resolve();
        });
      }
    },
    render: {

      /**
       * Applies this operation
       * @param  {Renderer} renderer
       * @return {Promise}
       * @abstract
       */

      value: function render(renderer) {
        var renderFn = undefined;
        if (renderer.identifier === "webgl") {
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
    },
    _renderWebGL: {

      /**
       * Applies this operation using WebGL
       * @return {WebGLRenderer} renderer
       * @private
       */
      /* istanbul ignore next */

      value: function _renderWebGL() {
        throw new Error("Operation#_renderWebGL is abstract and not implemented in inherited class.");
      }
    },
    _renderCanvas: {

      /**
       * Applies this operation using Canvas2D
       * @return {CanvasRenderer} renderer
       * @private
       */

      value: function _renderCanvas() {
        throw new Error("Operation#_renderCanvas is abstract and not implemented in inherited class.");
      }
    },
    _initOptions: {

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
          (function (optionName, option) {
            self["set" + capitalized] = function (value) {
              self._setOption(optionName, value);
            };

            // Default getter
            self["get" + capitalized] = function () {
              return self._getOption(optionName);
            };
          })(optionName, option);

          // Set default if available
          if (typeof option["default"] !== "undefined") {
            this["set" + capitalized](option["default"]);
          }
        }

        // Overwrite options with the ones given by user
        for (optionName in userOptions) {
          // Check if option is available
          if (typeof this.availableOptions[optionName] === "undefined") {
            throw new Error("Invalid option: " + optionName);
          }

          // Call setter
          capitalized = optionName.charAt(0).toUpperCase() + optionName.slice(1);
          this["set" + capitalized](userOptions[optionName]);
        }
      }
    },
    set: {

      /**
       * Sets the given options
       * @param {Object} options
       */

      value: function set(options) {
        for (var optionName in options) {
          this._setOption(optionName, options[optionName], false);
        }

        this.emit("update");
      }
    },
    _getOption: {

      /**
       * Returns the value for the given option
       * @param {String} optionName
       * @return {*}
       * @private
       */

      value: function _getOption(optionName) {
        return this._options[optionName];
      }
    },
    _setOption: {

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

        if (typeof optionConfig.setter !== "undefined") {
          value = optionConfig.setter.call(this, value);
        }

        if (typeof optionConfig.validation !== "undefined") {
          optionConfig.validation(value);
        }

        switch (optionConfig.type) {
          // String options
          case "string":
            if (typeof value !== "string") {
              throw new Error("Operation `" + identifier + "`: Option `" + optionName + "` has to be a string.");
            }

            // String value restrictions
            var available = optionConfig.available;
            if (typeof available !== "undefined" && available.indexOf(value) === -1) {
              throw new Error("Operation `" + identifier + "`: Invalid value for `" + optionName + "` (valid values are: " + optionConfig.available.join(", ") + ")");
            }

            this._options[optionName] = value;
            break;

          // Number options
          case "number":
            if (typeof value !== "number") {
              throw new Error("Operation `" + identifier + "`: Option `" + optionName + "` has to be a number.");
            }

            this._options[optionName] = value;
            break;

          // Boolean options
          case "boolean":
            if (typeof value !== "boolean") {
              throw new Error("Operation `" + identifier + "`: Option `" + optionName + "` has to be a boolean.");
            }

            this._options[optionName] = value;
            break;

          // Vector2 options
          case "vector2":
            if (!(value instanceof Vector2)) {
              throw new Error("Operation `" + identifier + "`: Option `" + optionName + "` has to be an instance of ImglyKit.Vector2.");
            }

            this._options[optionName] = value.clone();

            break;

          // Color options
          case "color":
            if (!(value instanceof Color)) {
              throw new Error("Operation `" + identifier + "`: Option `" + optionName + "` has to be an instance of ImglyKit.Color.");
            }

            this._options[optionName] = value;
            break;

          // Object options
          case "object":
            this._options[optionName] = value;
            break;
        }

        this._dirty = true;
        if (update) {
          this.emit("update");
        }
      }
    },
    getNewDimensions: {

      /**
       * Gets the new dimensions
       * @param {Renderer} renderer
       * @param {Vector2} [dimensions]
       * @return {Vector2}
       * @private
       */

      value: function getNewDimensions(renderer, dimensions) {
        var canvas = renderer.getCanvas();
        dimensions = dimensions || new Vector2(canvas.width, canvas.height);

        return dimensions;
      }
    },
    dirty: {

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
    }
  });

  return Operation;
})(EventEmitter);

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
Operation.prototype.identifier = null;

/**
 * To create an {@link ImglyKit.Operation} class of your own, call this
 * method and provide instance properties and functions.
 * @function
 */

var extend = _interopRequire(require("../lib/extend"));

Operation.extend = extend;

module.exports = Operation;

},{"../lib/color":13,"../lib/event-emitter":14,"../lib/extend":15,"../lib/math/vector2":18,"lodash":"lodash"}],71:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _set = function set(object, property, value, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent !== null) { return set(parent, property, value, receiver); } } else if ("value" in desc && desc.writable) { return desc.value = value; } else { var setter = desc.set; if (setter !== undefined) { return setter.call(receiver, value); } } };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Operation = _interopRequire(require("./operation"));

var Vector2 = _interopRequire(require("../lib/math/vector2"));

var StackBlur = _interopRequire(require("../vendor/stack-blur"));

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

    this.availableOptions = {
      position: { type: "vector2", "default": new Vector2(0.5, 0.5) },
      gradientRadius: { type: "number", "default": 50 },
      blurRadius: { type: "number", "default": 20 }
    };

    /**
     * The fragment shader used for this operation
     * @internal Based on evanw's glfx.js tilt shift shader:
     *           https://github.com/evanw/glfx.js/blob/master/src/filters/blur/tiltshift.js
     */
    this.fragmentShader = "\n      precision mediump float;\n      uniform sampler2D u_image;\n      uniform float blurRadius;\n      uniform float gradientRadius;\n      uniform vec2 position;\n      uniform vec2 delta;\n      uniform vec2 texSize;\n      varying vec2 v_texCoord;\n\n      float random(vec3 scale, float seed) {\n        return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);\n      }\n\n      void main() {\n          vec4 color = vec4(0.0);\n          float total = 0.0;\n\n          float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);\n          float radius = smoothstep(0.0, 1.0, abs(distance(v_texCoord * texSize, position)) / (gradientRadius * 2.0)) * blurRadius;\n          for (float t = -30.0; t <= 30.0; t++) {\n              float percent = (t + offset - 0.5) / 30.0;\n              float weight = 1.0 - abs(percent);\n              vec4 sample = texture2D(u_image, v_texCoord + delta * percent * radius / texSize);\n\n              sample.rgb *= sample.a;\n\n              color += sample * weight;\n              total += weight;\n          }\n\n          gl_FragColor = color / total;\n          gl_FragColor.rgb /= gl_FragColor.a + 0.00001;\n      }\n    ";

    _get(Object.getPrototypeOf(RadialBlurOperation.prototype), "constructor", this).apply(this, args);

    this._cachedBlurredCanvas = null;
    this._lastBlurRadius = this._options.blurRadius;
    this._lastGradientRadius = this._options.gradientRadius;
  }

  _inherits(RadialBlurOperation, _Operation);

  _createClass(RadialBlurOperation, {
    _renderWebGL: {

      /**
       * Crops this image using WebGL
       * @param  {WebGLRenderer} renderer
       */
      /* istanbul ignore next */

      value: function _renderWebGL(renderer) {
        var canvas = renderer.getCanvas();
        var canvasSize = new Vector2(canvas.width, canvas.height);

        var position = this._options.position.clone();
        position.y = 1 - position.y;

        if (this._options.numberFormat === "relative") {
          position.multiply(canvasSize);
        }

        var uniforms = {
          blurRadius: { type: "f", value: this._options.blurRadius },
          gradientRadius: { type: "f", value: this._options.gradientRadius },
          position: { type: "2f", value: [position.x, position.y] },
          texSize: { type: "2f", value: [canvas.width, canvas.height] },
          delta: { type: "2f", value: [1, 1] }
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
    },
    _renderCanvas: {

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
    },
    _blurCanvas: {

      /**
       * Creates a blurred copy of the canvas
       * @param  {CanvasRenderer} renderer
       * @return {Canvas}
       * @private
       */

      value: function _blurCanvas(renderer) {
        var newCanvas = renderer.cloneCanvas();
        var blurryContext = newCanvas.getContext("2d");
        var blurryImageData = blurryContext.getImageData(0, 0, newCanvas.width, newCanvas.height);
        StackBlur.stackBlurCanvasRGBA(blurryImageData, 0, 0, newCanvas.width, newCanvas.height, this._options.blurRadius);
        blurryContext.putImageData(blurryImageData, 0, 0);

        return newCanvas;
      }
    },
    _createMask: {

      /**
       * Creates the mask canvas
       * @param  {CanvasRenderer} renderer
       * @return {Canvas}
       * @private
       */

      value: function _createMask(renderer) {
        var canvas = renderer.getCanvas();

        var canvasSize = new Vector2(canvas.width, canvas.height);
        var gradientRadius = this._options.gradientRadius;

        var maskCanvas = renderer.createCanvas(canvas.width, canvas.height);
        var maskContext = maskCanvas.getContext("2d");

        var position = this._options.position.clone();

        if (this._options.numberFormat === "relative") {
          position.multiply(canvasSize);
        }

        // Build gradient
        var gradient = maskContext.createRadialGradient(position.x, position.y, 0, position.x, position.y, gradientRadius);
        gradient.addColorStop(0, "#FFFFFF");
        gradient.addColorStop(1, "#000000");

        // Draw gradient
        maskContext.fillStyle = gradient;
        maskContext.fillRect(0, 0, canvas.width, canvas.height);

        return maskCanvas;
      }
    },
    _applyMask: {

      /**
       * Applies the blur and mask to the input canvas
       * @param  {Canvas} inputCanvas
       * @param  {Canvas} blurryCanvas
       * @param  {Canvas} maskCanvas
       * @private
       */

      value: function _applyMask(inputCanvas, blurryCanvas, maskCanvas) {
        var inputContext = inputCanvas.getContext("2d");
        var blurryContext = blurryCanvas.getContext("2d");
        var maskContext = maskCanvas.getContext("2d");

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
    },
    dirty: {

      /**
       * Sets the dirty state of this operation
       * @param {Boolean} dirty
       * @comment Since blur operations do seperate caching of the
       *          blurred canvas, we need to invalidate the cache when the
       *          dirty state changes.
       */

      set: function (dirty) {
        _set(Object.getPrototypeOf(RadialBlurOperation.prototype), "dirty", dirty, this);
        this._cachedBlurredCanvas = null;
      },

      /**
       * Returns the dirty state
       * @type {Boolean}
       */
      get: function () {
        return _get(Object.getPrototypeOf(RadialBlurOperation.prototype), "dirty", this);
      }
    }
  });

  return RadialBlurOperation;
})(Operation);

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
RadialBlurOperation.prototype.identifier = "radial-blur";

module.exports = RadialBlurOperation;

},{"../lib/math/vector2":18,"../vendor/stack-blur":103,"./operation":70}],72:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Operation = _interopRequire(require("./operation"));

var Vector2 = _interopRequire(require("../lib/math/vector2"));

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

    this.availableOptions = {
      degrees: { type: "number", "default": 0, validation: function validation(value) {
          if (value % 90 !== 0) {
            throw new Error("RotationOperation: `rotation` has to be a multiple of 90.");
          }
        } }
    };

    /**
     * The fragment shader used for this operation
     */
    this.vertexShader = "\n      attribute vec2 a_position;\n      attribute vec2 a_texCoord;\n      varying vec2 v_texCoord;\n      uniform mat3 u_matrix;\n\n      void main() {\n        gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);\n        v_texCoord = a_texCoord;\n      }\n    ";

    _get(Object.getPrototypeOf(RotationOperation.prototype), "constructor", this).apply(this, args);
  }

  _inherits(RotationOperation, _Operation);

  _createClass(RotationOperation, {
    _renderWebGL: {

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
            u_matrix: { type: "mat3fv", value: rotationMatrix }
          }
        });
      }
    },
    _renderCanvas: {

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
        var newContext = newCanvas.getContext("2d");

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
    },
    getNewDimensions: {

      /**
       * Gets the new dimensions
       * @param {Renderer} renderer
       * @param {Vector2} [dimensions]
       * @return {Vector2}
       */

      value: function getNewDimensions(renderer, dimensions) {
        var canvas = renderer.getCanvas();
        dimensions = dimensions || new Vector2(canvas.width, canvas.height);

        var actualDegrees = this._options.degrees % 360;
        if (actualDegrees % 180 !== 0) {
          var tempX = dimensions.x;
          dimensions.x = dimensions.y;
          dimensions.y = tempX;
        }

        return dimensions;
      }
    }
  });

  return RotationOperation;
})(Operation);

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
RotationOperation.prototype.identifier = "rotation";

module.exports = RotationOperation;

},{"../lib/math/vector2":18,"./operation":70}],73:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Operation = _interopRequire(require("./operation"));

var PrimitivesStack = _interopRequire(require("./filters/primitives-stack"));

var SaturationPrimitive = _interopRequire(require("./filters/primitives/saturation"));

/**
 * @class
 * @alias ImglyKit.Operations.SaturationOperation
 * @extends ImglyKit.Operation
 */

var SaturationOperation = (function (_Operation) {
  function SaturationOperation() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, SaturationOperation);

    this.availableOptions = {
      saturation: { type: "number", "default": 1 }
    };

    _get(Object.getPrototypeOf(SaturationOperation.prototype), "constructor", this).apply(this, args);
  }

  _inherits(SaturationOperation, _Operation);

  _createClass(SaturationOperation, {
    _renderWebGL: {

      /**
       * Renders the saturation using WebGL
       * @param  {WebGLRenderer} renderer
       * @override
       */
      /* istanbul ignore next */

      value: function _renderWebGL(renderer) {
        this._render(renderer);
      }
    },
    _renderCanvas: {

      /**
       * Renders the saturation using Canvas2D
       * @param {CanvasRenderer} renderer
       * @override
       */

      value: function _renderCanvas(renderer) {
        this._render(renderer);
      }
    },
    _render: {

      /**
       * Renders the saturation (all renderers supported)
       * @param  {Renderer} renderer
       * @private
       */

      value: function _render(renderer) {
        var stack = new PrimitivesStack();

        stack.add(new SaturationPrimitive({
          saturation: this._options.saturation
        }));

        stack.render(renderer);
      }
    }
  });

  return SaturationOperation;
})(Operation);

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
SaturationOperation.prototype.identifier = "saturation";

module.exports = SaturationOperation;

},{"./filters/primitives-stack":50,"./filters/primitives/saturation":59,"./operation":70}],74:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Operation = _interopRequire(require("./operation"));

var Vector2 = _interopRequire(require("../lib/math/vector2"));

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

    this.availableOptions = {
      sticker: { type: "string" },
      position: { type: "vector2", "default": new Vector2(0, 0) },
      size: { type: "vector2", "default": new Vector2(0, 0) }
    };

    /**
     * The texture index used for the sticker
     * @type {Number}
     * @private
     */
    this._textureIndex = 1;

    /**
     * The fragment shader used for this operation
     */
    this._fragmentShader = "\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_image;\n      uniform sampler2D u_stickerImage;\n      uniform vec2 u_position;\n      uniform vec2 u_size;\n\n      void main() {\n        vec4 color0 = texture2D(u_image, v_texCoord);\n        vec2 relative = (v_texCoord - u_position) / u_size;\n\n        if (relative.x >= 0.0 && relative.x <= 1.0 &&\n          relative.y >= 0.0 && relative.y <= 1.0) {\n\n            vec4 color1 = texture2D(u_stickerImage, relative);\n            gl_FragColor = vec4(mix(color0.rgb, color1.rgb, color1.a), 1.0);\n\n        } else {\n\n          gl_FragColor = color0;\n\n        }\n      }\n    ";

    this._loadedStickers = {};

    _get(Object.getPrototypeOf(StickersOperation.prototype), "constructor", this).apply(this, args);
  }

  _inherits(StickersOperation, _Operation);

  _createClass(StickersOperation, {
    render: {

      /**
       * Applies this operation
       * @param  {Renderer} renderer
       * @return {Promise}
       * @abstract
       */

      value: function render(renderer) {
        var self = this;
        return this._loadSticker().then(function (image) {
          if (renderer.identifier === "webgl") {
            /* istanbul ignore next */
            return self._renderWebGL(renderer, image);
          } else {
            return self._renderCanvas(renderer, image);
          }
        });
      }
    },
    _renderWebGL: {

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
        var canvasSize = new Vector2(canvas.width, canvas.height);

        if (this._options.numberFormat === "absolute") {
          position.divide(canvasSize);
        }

        var size = new Vector2(image.width, image.height);
        if (typeof this._options.size !== "undefined") {
          size.copy(this._options.size);

          if (this._options.numberFormat === "relative") {
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

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.activeTexture(gl.TEXTURE0);

        // Execute the shader
        renderer.runShader(null, this._fragmentShader, {
          uniforms: {
            u_stickerImage: { type: "i", value: this._textureIndex },
            u_position: { type: "2f", value: [position.x, position.y] },
            u_size: { type: "2f", value: [size.x, size.y] }
          }
        });
      }
    },
    _renderCanvas: {

      /**
       * Crops the image using Canvas2D
       * @param  {CanvasRenderer} renderer
       * @param  {Image} image
       * @private
       */

      value: function _renderCanvas(renderer, image) {
        var canvas = renderer.getCanvas();
        var context = renderer.getContext();

        var canvasSize = new Vector2(canvas.width, canvas.height);
        var scaledPosition = this._options.position.clone();

        if (this._options.numberFormat === "relative") {
          scaledPosition.multiply(canvasSize);
        }

        var size = new Vector2(image.width, image.height);
        if (typeof this._options.size !== "undefined") {
          size.copy(this._options.size);

          if (this._options.numberFormat === "relative") {
            size.multiply(canvasSize);
          }
        }

        context.drawImage(image, 0, 0, image.width, image.height, scaledPosition.x, scaledPosition.y, size.x, size.y);
      }
    },
    _loadSticker: {

      /**
       * Loads the sticker
       * @return {Promise}
       * @private
       */

      value: function _loadSticker() {
        var isBrowser = typeof window !== "undefined";
        if (isBrowser) {
          return this._loadImageBrowser(this._options.sticker);
        } else {
          return this._loadImageNode(this._options.sticker);
        }
      }
    },
    _loadImageBrowser: {

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

          image.addEventListener("load", function () {
            self._loadedStickers[fileName] = image;
            resolve(image);
          });
          image.addEventListener("error", function () {
            reject(new Error("Could not load sticker: " + fileName));
          });

          image.src = self._kit.getAssetPath(fileName);
        });
      }
    },
    _loadImageNode: {

      /**
       * Loads the given image using node.js' `fs` and node-canvas `Image`
       * @param  {String} fileName
       * @return {Promise}
       * @private
       */

      value: function _loadImageNode(fileName) {
        var Canvas = require("canvas");
        

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
    },
    stickers: {

      /**
       * The registered stickers
       * @type {Object.<String,String>}
       */

      get: function () {
        return this._stickers;
      }
    }
  });

  return StickersOperation;
})(Operation);

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
StickersOperation.prototype.identifier = "stickers";

module.exports = StickersOperation;

},{"../lib/math/vector2":18,"./operation":70,"canvas":"canvas"}],75:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Operation = _interopRequire(require("./operation"));

var Vector2 = _interopRequire(require("../lib/math/vector2"));

var Color = _interopRequire(require("../lib/color"));

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

    this.availableOptions = {
      fontSize: { type: "number", "default": 0.1 },
      lineHeight: { type: "number", "default": 1.1 },
      fontFamily: { type: "string", "default": "Times New Roman" },
      fontWeight: { type: "string", "default": "normal" },
      alignment: { type: "string", "default": "left", available: ["left", "center", "right"] },
      verticalAlignment: { type: "string", "default": "top", available: ["top", "center", "bottom"] },
      color: { type: "color", "default": new Color(1, 1, 1, 1) },
      backgroundColor: { type: "color", "default": new Color(0, 0, 0, 0) },
      position: { type: "vector2", "default": new Vector2(0, 0) },
      text: { type: "string", required: true },
      maxWidth: { type: "number", "default": 1 }
    };

    /**
     * The texture index used for the text
     * @type {Number}
     * @private
     */
    this._textureIndex = 1;

    /**
     * The fragment shader used for this operation
     */
    this._fragmentShader = "\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_image;\n      uniform sampler2D u_textImage;\n      uniform vec2 u_position;\n      uniform vec2 u_size;\n\n      void main() {\n        vec4 color0 = texture2D(u_image, v_texCoord);\n        vec2 relative = (v_texCoord - u_position) / u_size;\n\n        if (relative.x >= 0.0 && relative.x <= 1.0 &&\n          relative.y >= 0.0 && relative.y <= 1.0) {\n\n            vec4 color1 = texture2D(u_textImage, relative);\n            gl_FragColor = vec4(mix(color0.rgb, color1.rgb, color1.a), 1.0);\n\n        } else {\n\n          gl_FragColor = color0;\n\n        }\n      }\n    ";

    _get(Object.getPrototypeOf(TextOperation.prototype), "constructor", this).apply(this, args);
  }

  _inherits(TextOperation, _Operation);

  _createClass(TextOperation, {
    _renderWebGL: {

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
        var canvasSize = new Vector2(canvas.width, canvas.height);
        var size = new Vector2(textCanvas.width, textCanvas.height).divide(canvasSize);

        if (this._options.numberFormat === "absolute") {
          position.divide(canvasSize);
        }

        position.y = 1 - position.y; // Invert y
        position.y -= size.y; // Fix y

        // Adjust vertical alignment
        if (this._options.verticalAlignment === "center") {
          position.y += size.y / 2;
        } else if (this._options.verticalAlignment === "bottom") {
          position.y += size.y;
        }

        // Adjust horizontal alignment
        if (this._options.alignment === "center") {
          position.x -= size.x / 2;
        } else if (this._options.alignment === "right") {
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

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);
        gl.activeTexture(gl.TEXTURE0);

        // Execute the shader
        renderer.runShader(null, this._fragmentShader, {
          uniforms: {
            u_textImage: { type: "i", value: this._textureIndex },
            u_position: { type: "2f", value: [position.x, position.y] },
            u_size: { type: "2f", value: [size.x, size.y] }
          }
        });
      }
    },
    _renderCanvas: {

      /**
       * Crops the image using Canvas2D
       * @param  {CanvasRenderer} renderer
       */

      value: function _renderCanvas(renderer) {
        var textCanvas = this._renderTextCanvas(renderer);

        var canvas = renderer.getCanvas();
        var context = renderer.getContext();

        var canvasSize = new Vector2(canvas.width, canvas.height);
        var scaledPosition = this._options.position.clone();

        if (this._options.numberFormat === "relative") {
          scaledPosition.multiply(canvasSize);
        }

        // Adjust vertical alignment
        if (this._options.verticalAlignment === "center") {
          scaledPosition.y -= textCanvas.height / 2;
        } else if (this._options.verticalAlignment === "bottom") {
          scaledPosition.y -= textCanvas.height;
        }

        // Adjust horizontal alignment
        if (this._options.alignment === "center") {
          scaledPosition.x -= textCanvas.width / 2;
        } else if (this._options.alignment === "right") {
          scaledPosition.x -= textCanvas.width;
        }

        context.drawImage(textCanvas, scaledPosition.x, scaledPosition.y);
      }
    },
    _renderTextCanvas: {

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
        var context = canvas.getContext("2d");

        var outputCanvas = renderer.getCanvas();
        var canvasSize = new Vector2(outputCanvas.width, outputCanvas.height);

        var maxWidth = this._options.maxWidth;
        var actualFontSize = this._options.fontSize * canvasSize.y;
        var actualLineHeight = this._options.lineHeight * actualFontSize;

        if (this._options.numberFormat === "relative") {
          maxWidth *= renderer.getCanvas().width;
        }

        // Apply text options
        this._applyTextOptions(renderer, context);

        var boundingBox = new Vector2();

        var lines = this._options.text.split("\n");
        if (typeof maxWidth !== "undefined") {
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
        context = canvas.getContext("2d");

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
    },
    _applyTextOptions: {

      /**
       * Applies the text options on the given context
       * @param  {Renderer} renderer
       * @param  {RenderingContext2D} context
       * @private
       */

      value: function _applyTextOptions(renderer, context) {
        var canvas = renderer.getCanvas();
        var canvasSize = new Vector2(canvas.width, canvas.height);
        var actualFontSize = this._options.fontSize * canvasSize.y;

        context.font = this._options.fontWeight + " " + actualFontSize + "px " + this._options.fontFamily;
        context.textBaseline = "top";
        context.textAlign = this._options.alignment;
        context.fillStyle = this._options.color.toRGBA();
      }
    },
    _buildOutputLines: {

      /**
       * Iterate over all lines and split them into multiple lines, depending
       * on the width they need
       * @param {RenderingContext2d} context
       * @param {Number} maxWidth
       * @return {Array.<string>}
       * @private
       */

      value: function _buildOutputLines(context, maxWidth) {
        var inputLines = this._options.text.split("\n");
        var outputLines = [];
        var currentChars = [];

        for (var lineNum = 0; lineNum < inputLines.length; lineNum++) {
          var inputLine = inputLines[lineNum];
          var lineChars = inputLine.split("");

          if (lineChars.length === 0) {
            outputLines.push("");
          }

          for (var charNum = 0; charNum < lineChars.length; charNum++) {
            var currentChar = lineChars[charNum];
            currentChars.push(currentChar);
            var currentLine = currentChars.join("");
            var lineWidth = context.measureText(currentLine).width;

            if (lineWidth > maxWidth && currentChars.length === 1) {
              outputLines.push(currentChars[0]);
              currentChars = [];
            } else if (lineWidth > maxWidth) {
              // Remove the last word
              var lastWord = currentChars.pop();

              // Add the line, clear the words
              outputLines.push(currentChars.join(""));
              currentChars = [];

              // Make sure to use the last word for the next line
              currentChars = [lastWord];
            } else if (charNum === lineChars.length - 1) {
              // Add the line, clear the words
              outputLines.push(currentChars.join(""));
              currentChars = [];
            }
          }

          // Line ended, but there's words left
          if (currentChars.length) {
            outputLines.push(currentChars.join(""));
            currentChars = [];
          }
        }
        return outputLines;
      }
    },
    _drawText: {

      /**
       * Draws the given line onto the given context at the given Y position
       * @param  {RenderingContext2D} context
       * @param  {String} text
       * @param  {Number} y
       * @private
       */

      value: function _drawText(context, text, y) {
        var canvas = context.canvas;
        if (this._options.alignment === "center") {
          context.fillText(text, canvas.width / 2, y);
        } else if (this._options.alignment === "left") {
          context.fillText(text, 0, y);
        } else if (this._options.alignment === "right") {
          context.fillText(text, canvas.width, y);
        }
      }
    }
  });

  return TextOperation;
})(Operation);

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
TextOperation.prototype.identifier = "text";

module.exports = TextOperation;

},{"../lib/color":13,"../lib/math/vector2":18,"./operation":70}],76:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _set = function set(object, property, value, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent !== null) { return set(parent, property, value, receiver); } } else if ("value" in desc && desc.writable) { return desc.value = value; } else { var setter = desc.set; if (setter !== undefined) { return setter.call(receiver, value); } } };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Operation = _interopRequire(require("./operation"));

var Vector2 = _interopRequire(require("../lib/math/vector2"));

var StackBlur = _interopRequire(require("../vendor/stack-blur"));

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

    this.availableOptions = {
      start: { type: "vector2", "default": new Vector2(0, 0.5) },
      end: { type: "vector2", "default": new Vector2(1, 0.5) },
      blurRadius: { type: "number", "default": 30 },
      gradientRadius: { type: "number", "default": 50 }
    };

    /**
     * The fragment shader used for this operation
     * @internal Based on evanw's glfx.js tilt shift shader:
     *           https://github.com/evanw/glfx.js/blob/master/src/filters/blur/tiltshift.js
     */
    this.fragmentShader = "\n      precision mediump float;\n      uniform sampler2D u_image;\n      uniform float blurRadius;\n      uniform float gradientRadius;\n      uniform vec2 start;\n      uniform vec2 end;\n      uniform vec2 delta;\n      uniform vec2 texSize;\n      varying vec2 v_texCoord;\n\n      float random(vec3 scale, float seed) {\n        return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);\n      }\n\n      void main() {\n          vec4 color = vec4(0.0);\n          float total = 0.0;\n\n          float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);\n\n          vec2 normal = normalize(vec2(start.y - end.y, end.x - start.x));\n          float radius = smoothstep(0.0, 1.0, abs(dot(v_texCoord * texSize - start, normal)) / gradientRadius) * blurRadius;\n          for (float t = -30.0; t <= 30.0; t++) {\n              float percent = (t + offset - 0.5) / 30.0;\n              float weight = 1.0 - abs(percent);\n              vec4 sample = texture2D(u_image, v_texCoord + delta * percent * radius / texSize);\n\n              sample.rgb *= sample.a;\n\n              color += sample * weight;\n              total += weight;\n          }\n\n          gl_FragColor = color / total;\n          gl_FragColor.rgb /= gl_FragColor.a + 0.00001;\n      }\n    ";

    _get(Object.getPrototypeOf(TiltShiftOperation.prototype), "constructor", this).apply(this, args);

    this._cachedBlurredCanvas = null;
    this._lastBlurRadius = this._options.blurRadius;
    this._lastGradientRadius = this._options.gradientRadius;
  }

  _inherits(TiltShiftOperation, _Operation);

  _createClass(TiltShiftOperation, {
    _renderWebGL: {

      /**
       * Crops this image using WebGL
       * @param  {WebGLRenderer} renderer
       */
      /* istanbul ignore next */

      value: function _renderWebGL(renderer) {
        var canvas = renderer.getCanvas();
        var canvasSize = new Vector2(canvas.width, canvas.height);

        var start = this._options.start.clone();
        var end = this._options.end.clone();

        if (this._options.numberFormat === "relative") {
          start.multiply(canvasSize);
          end.multiply(canvasSize);
        }

        start.y = canvasSize.y - start.y;
        end.y = canvasSize.y - end.y;

        var delta = end.clone().subtract(start);
        var d = Math.sqrt(delta.x * delta.x + delta.y * delta.y);

        var uniforms = {
          blurRadius: { type: "f", value: this._options.blurRadius },
          gradientRadius: { type: "f", value: this._options.gradientRadius },
          start: { type: "2f", value: [start.x, start.y] },
          end: { type: "2f", value: [end.x, end.y] },
          delta: { type: "2f", value: [delta.x / d, delta.y / d] },
          texSize: { type: "2f", value: [canvas.width, canvas.height] }
        };

        renderer.runShader(null, this.fragmentShader, {
          uniforms: uniforms
        });

        uniforms.delta.value = [-delta.y / d, delta.x / d];

        renderer.runShader(null, this.fragmentShader, {
          uniforms: uniforms
        });
      }
    },
    _renderCanvas: {

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
    },
    _blurCanvas: {

      /**
       * Creates a blurred copy of the canvas
       * @param  {CanvasRenderer} renderer
       * @return {Canvas}
       * @private
       */

      value: function _blurCanvas(renderer) {
        var newCanvas = renderer.cloneCanvas();
        var blurryContext = newCanvas.getContext("2d");
        var blurryImageData = blurryContext.getImageData(0, 0, newCanvas.width, newCanvas.height);
        StackBlur.stackBlurCanvasRGBA(blurryImageData, 0, 0, newCanvas.width, newCanvas.height, this._options.blurRadius);
        blurryContext.putImageData(blurryImageData, 0, 0);

        return newCanvas;
      }
    },
    _createMask: {

      /**
       * Creates the mask canvas
       * @param  {CanvasRenderer} renderer
       * @return {Canvas}
       * @private
       */

      value: function _createMask(renderer) {
        var canvas = renderer.getCanvas();

        var canvasSize = new Vector2(canvas.width, canvas.height);
        var gradientRadius = this._options.gradientRadius;

        var maskCanvas = renderer.createCanvas(canvas.width, canvas.height);
        var maskContext = maskCanvas.getContext("2d");

        var start = this._options.start.clone();
        var end = this._options.end.clone();

        if (this._options.numberFormat === "relative") {
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
        gradient.addColorStop(0, "#000000");
        gradient.addColorStop(0.5, "#FFFFFF");
        gradient.addColorStop(1, "#000000");

        // Draw gradient
        maskContext.fillStyle = gradient;
        maskContext.fillRect(0, 0, canvas.width, canvas.height);

        return maskCanvas;
      }
    },
    _applyMask: {

      /**
       * Applies the blur and mask to the input canvas
       * @param  {Canvas} inputCanvas
       * @param  {Canvas} blurryCanvas
       * @param  {Canvas} maskCanvas
       * @private
       */

      value: function _applyMask(inputCanvas, blurryCanvas, maskCanvas) {
        var inputContext = inputCanvas.getContext("2d");
        var blurryContext = blurryCanvas.getContext("2d");
        var maskContext = maskCanvas.getContext("2d");

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
    },
    dirty: {

      /**
       * Sets the dirty state of this operation
       * @param {Boolean} dirty
       * @comment Since blur operations do seperate caching of the
       *          blurred canvas, we need to invalidate the cache when the
       *          dirty state changes.
       */

      set: function (dirty) {
        _set(Object.getPrototypeOf(TiltShiftOperation.prototype), "dirty", dirty, this);
        this._cachedBlurredCanvas = null;
      },

      /**
       * Returns the dirty state
       * @type {Boolean}
       */
      get: function () {
        return _get(Object.getPrototypeOf(TiltShiftOperation.prototype), "dirty", this);
      }
    }
  });

  return TiltShiftOperation;
})(Operation);

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
TiltShiftOperation.prototype.identifier = "tilt-shift";

module.exports = TiltShiftOperation;

},{"../lib/math/vector2":18,"../vendor/stack-blur":103,"./operation":70}],77:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Renderer = _interopRequire(require("./renderer"));

var Vector2 = _interopRequire(require("../lib/math/vector2"));

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

  _createClass(CanvasRenderer, {
    cache: {

      /**
       * Caches the current canvas content for the given identifier
       * @param {String} identifier
       */

      value: function cache(identifier) {
        this._cache[identifier] = {
          data: this._context.getImageData(0, 0, this._canvas.width, this._canvas.height),
          size: new Vector2(this._canvas.width, this._canvas.height)
        };
      }
    },
    drawCached: {

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
    },
    _getContext: {

      /**
       * Gets the rendering context from the Canva
       * @return {RenderingContext}
       * @abstract
       */

      value: function _getContext() {
        /* istanbul ignore next */
        return this._canvas.getContext("2d");
      }
    },
    drawImage: {

      /**
       * Draws the given image on the canvas
       * @param  {Image} image
       */

      value: function drawImage(image) {
        this._context.drawImage(image, 0, 0, image.width, image.height, 0, 0, this._canvas.width, this._canvas.height);
      }
    },
    resizeTo: {

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
        var newContext = newCanvas.getContext("2d");

        // Draw the source canvas onto the new one
        newContext.drawImage(this._canvas, 0, 0, this._canvas.width, this._canvas.height, 0, 0, newCanvas.width, newCanvas.height);

        // Set the new canvas and context
        this.setCanvas(newCanvas);
      }
    },
    cloneCanvas: {

      /**
       * Returns a cloned version of the current canvas
       * @return {Canvas}
       */

      value: function cloneCanvas() {
        var canvas = this.createCanvas();
        var context = canvas.getContext("2d");

        // Resize the canvas
        canvas.width = this._canvas.width;
        canvas.height = this._canvas.height;

        // Draw the current canvas on the new one
        context.drawImage(this._canvas, 0, 0);

        return canvas;
      }
    },
    reset: {

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
    }
  }, {
    identifier: {
      /**
       * A unique string that identifies this renderer
       * @type {String}
       */

      get: function () {
        return "canvas";
      }
    },
    isSupported: {

      /**
       * Checks whether this type of renderer is supported in the current environment
       * @abstract
       * @returns {boolean}
       */

      value: function isSupported() {
        var elem = this.prototype.createCanvas();
        return !!(elem.getContext && elem.getContext("2d"));
      }
    }
  });

  return CanvasRenderer;
})(Renderer);

module.exports = CanvasRenderer;

},{"../lib/math/vector2":18,"./renderer":78}],78:[function(require,module,exports){
/*jshint unused:false */
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Vector2 = _interopRequire(require("../lib/math/vector2"));

var EventEmitter = _interopRequire(require("../lib/event-emitter"));

/**
 * @class
 * @alias ImglyKit.Renderer
 * @param {Vector2} dimensions
 * @private
 */

var Renderer = (function (_EventEmitter) {
  function Renderer(dimensions, canvas) {
    _classCallCheck(this, Renderer);

    _get(Object.getPrototypeOf(Renderer.prototype), "constructor", this).call(this);

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

  _createClass(Renderer, {
    identifier: {

      /**
       * A unique string that identifies this renderer
       * @type {String}
       */

      get: function () {
        return null;
      }
    },
    cache: {

      /**
       * Caches the current canvas content for the given identifier
       * @param {String} identifier
       */

      value: function cache(identifier) {}
    },
    drawCached: {

      /**
       * Draws the stored texture / image data for the given identifier
       * @param {String} identifier
       */

      value: function drawCached(identifier) {}
    },
    createCanvas: {

      /**
       * Creates a new canvas
       * @param {Number} [width]
       * @param {Number} [height]
       * @return {Canvas}
       * @private
       */

      value: function createCanvas(width, height) {
        var isBrowser = typeof window !== "undefined";
        var canvas;
        if (isBrowser) {
          /* istanbul ignore next */
          canvas = document.createElement("canvas");
        } else {
          var Canvas = require("canvas");
          canvas = new Canvas();
        }

        // Apply width
        if (typeof width !== "undefined") {
          canvas.width = width;
        }

        // Apply height
        if (typeof height !== "undefined") {
          canvas.height = height;
        }

        return canvas;
      }
    },
    getSize: {

      /**
       * Returns the current size of the canvas
       * @return {Vector2}
       */

      value: function getSize() {
        return new Vector2(this._canvas.width, this._canvas.height);
      }
    },
    setSize: {

      /**
       * Sets the canvas dimensions
       * @param {Vector2} dimensions
       */

      value: function setSize(dimensions) {
        this._canvas.width = dimensions.x;
        this._canvas.height = dimensions.y;
      }
    },
    _getContext: {

      /**
       * Gets the rendering context from the Canva
       * @return {RenderingContext}
       * @abstract
       */

      value: function _getContext() {
        /* istanbul ignore next */
        throw new Error("Renderer#_getContext is abstract and not implemented in inherited class.");
      }
    },
    resizeTo: {

      /**
       * Resizes the current canvas picture to the given dimensions
       * @param  {Vector2} dimensions
       * @return {Promise}
       * @abstract
       */

      value: function resizeTo(dimensions) {
        /* istanbul ignore next */
        throw new Error("Renderer#resizeTo is abstract and not implemented in inherited class.");
      }
    },
    drawImage: {

      /**
       * Draws the given image on the canvas
       * @param  {Image} image
       * @abstract
       */

      value: function drawImage(image) {
        /* istanbul ignore next */
        throw new Error("Renderer#drawImage is abstract and not implemented in inherited class.");
      }
    },
    renderFinal: {

      /**
       * Gets called after the stack has been rendered
       * @param  {Image} image
       */

      value: function renderFinal() {}
    },
    getCanvas: {

      /**
       * Returns the canvas
       * @return {Canvas}
       */

      value: function getCanvas() {
        return this._canvas;
      }
    },
    getContext: {

      /**
       * Returns the context
       * @return {RenderingContext}
       */

      value: function getContext() {
        return this._context;
      }
    },
    setCanvas: {

      /**
       * Sets the current canvas to the given one
       * @param {Canvas} canvas
       */

      value: function setCanvas(canvas) {
        this._canvas = canvas;
        this._context = this._getContext();

        this.emit("new-canvas", this._canvas);
      }
    },
    setContext: {

      /**
       * Sets the current context to the given one
       * @param {RenderingContext2D} context
       */

      value: function setContext(context) {
        this._context = context;
      }
    },
    reset: {

      /**
       * Resets the renderer
       * @param {Boolean} resetCache = false
       */

      value: function reset() {
        var resetCache = arguments[0] === undefined ? false : arguments[0];
      }
    }
  }, {
    isSupported: {

      /**
       * Checks whether this type of renderer is supported in the current environment
       * @abstract
       * @returns {boolean}
       */

      value: function isSupported() {
        /* istanbul ignore next */
        throw new Error("Renderer#isSupported is abstract and not implemented in inherited class.");
      }
    }
  });

  return Renderer;
})(EventEmitter);

module.exports = Renderer;

},{"../lib/event-emitter":14,"../lib/math/vector2":18,"canvas":"canvas"}],79:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Renderer = _interopRequire(require("./renderer"));

var Vector2 = _interopRequire(require("../lib/math/vector2"));

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

    _get(Object.getPrototypeOf(WebGLRenderer.prototype), "constructor", this).apply(this, args);

    this._defaultProgram = this.setupGLSLProgram();
    this.reset();
  }

  _inherits(WebGLRenderer, _Renderer);

  _createClass(WebGLRenderer, {
    identifier: {

      /**
       * A unique string that identifies this renderer
       * @type {String}
       */

      get: function () {
        return "webgl";
      }
    },
    cache: {

      /**
       * Caches the current canvas content for the given identifier
       * @param {String} identifier
       */

      value: function cache(identifier) {
        var size = new Vector2(this._canvas.width, this._canvas.height);

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
    },
    _drawCachedFinal: {

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
    },
    drawCached: {

      /**
       * Draws the stored texture / image data for the given identifier
       * @param {String} identifier
       */

      value: function drawCached(identifier) {
        var _cache$identifier = this._cache[identifier];
        var texture = _cache$identifier.texture;
        var size = _cache$identifier.size;

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

        // Draw the rectangle
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        this.setLastTexture(currentTexture);
        this.selectNextBuffer();
      }
    },
    defaultVertexShader: {

      /**
       * The default vertex shader which just passes the texCoord to the
       * fragment shader.
       * @type {String}
       * @private
       */

      get: function () {
        var shader = "\n      attribute vec2 a_position;\n      attribute vec2 a_texCoord;\n      varying vec2 v_texCoord;\n\n      void main() {\n        gl_Position = vec4(a_position, 0, 1);\n        v_texCoord = a_texCoord;\n      }\n    ";
        return shader;
      }
    },
    defaultFragmentShader: {

      /**
       * The default fragment shader which will just look up the colors from the
       * texture.
       * @type {String}
       * @private
       */

      get: function () {
        var shader = "\n      precision mediump float;\n      uniform sampler2D u_image;\n      varying vec2 v_texCoord;\n\n      void main() {\n        gl_FragColor = texture2D(u_image, v_texCoord);\n      }\n    ";
        return shader;
      }
    },
    _getContext: {

      /**
       * Gets the rendering context from the Canvas
       * @return {RenderingContext}
       * @abstract
       */

      value: function _getContext() {
        /* istanbul ignore next */
        return this._canvas.getContext("webgl") || this._canvas.getContext("webgl-experimental");
      }
    },
    drawImage: {

      /**
       * Draws the given image on the canvas
       * @param  {Image} image
       */
      /* istanbul ignore next */

      value: function drawImage(image) {
        var gl = this._context;
        gl.useProgram(this._defaultProgram);

        // Create the texture
        var texture = this.createTexture();
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        this._inputTexture = texture;
        this.setLastTexture(texture);

        // Upload the image into the texture
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        // Draw the rectangle
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
    },
    runShader: {

      /**
       * Runs the given shader
       * @param  {String} [vertexShader]
       * @param  {String} [fragmentShader]
       */
      /* istanbul ignore next */

      value: function runShader(vertexShader, fragmentShader, options) {
        if (typeof options === "undefined") options = {};
        if (typeof options.uniforms === "undefined") options.uniforms = {};

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
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this._canvas.width, this._canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        // Make sure we select the current texture
        gl.bindTexture(gl.TEXTURE_2D, this._lastTexture);

        // Set the uniforms
        for (var name in options.uniforms) {
          var location = gl.getUniformLocation(program, name);
          var uniform = options.uniforms[name];

          switch (uniform.type) {
            case "i":
            case "1i":
              gl.uniform1i(location, uniform.value);
              break;
            case "f":
            case "1f":
              gl.uniform1f(location, uniform.value);
              break;
            case "2f":
              gl.uniform2f(location, uniform.value[0], uniform.value[1]);
              break;
            case "3f":
              gl.uniform3f(location, uniform.value[0], uniform.value[1], uniform.value[2]);
              break;
            case "4f":
              gl.uniform4f(location, uniform.value[0], uniform.value[1], uniform.value[2], uniform.value[3]);
              break;
            case "2fv":
              gl.uniform2fv(location, uniform.value);
              break;
            case "mat3fv":
              gl.uniformMatrix3fv(location, false, uniform.value);
              break;
            default:
              throw new Error("Unknown uniform type: " + uniform.type);
          }
        }

        // Draw the rectangle
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        this.setLastTexture(currentTexture);
        this.selectNextBuffer();
      }
    },
    renderFinal: {

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

        // Draw the rectangle
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
    },
    setupGLSLProgram: {

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
          throw new Error("WebGL program linking error: " + lastError);
        }

        // Lookup texture coordinates location
        var positionLocation = gl.getAttribLocation(program, "a_position");
        var texCoordLocation = gl.getAttribLocation(program, "a_texCoord");

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
    },
    _createShader: {

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
          throw new Error("WebGL shader compilation error: " + lastError);
        }

        return shader;
      }
    },
    createTexture: {

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
    },
    _createFramebuffers: {

      /**
       * Creates two textures and framebuffers that are used for the stack
       * rendering
       * @private
       */
      /* istanbul ignore next */

      value: function _createFramebuffers() {
        for (var i = 0; i < 2; i++) {
          var _createFramebuffer = this._createFramebuffer();

          var fbo = _createFramebuffer.fbo;
          var texture = _createFramebuffer.texture;

          this._textures.push(texture);
          this._framebuffers.push(fbo);
        }
      }
    },
    _createFramebuffer: {

      /**
       * Creates and returns a frame buffer and texture
       * @return {Object}
       * @private
       */

      value: function _createFramebuffer() {
        var gl = this._context;

        // Create texture
        var texture = this.createTexture();
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this._canvas.width, this._canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        // Create framebuffer
        var fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

        // Attach the texture
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

        return { fbo: fbo, texture: texture };
      }
    },
    resizeTo: {

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
    },
    getCurrentFramebuffer: {

      /**
       * Returns the current framebuffer
       * @return {WebGLFramebuffer}
       */

      value: function getCurrentFramebuffer() {
        return this._framebuffers[this._bufferIndex % 2];
      }
    },
    getCurrentTexture: {

      /**
       * Returns the current texture
       * @return {WebGLTexture}
       */

      value: function getCurrentTexture() {
        return this._textures[this._bufferIndex % 2];
      }
    },
    selectNextBuffer: {

      /**
       * Increases the buffer index
       */

      value: function selectNextBuffer() {
        this._bufferIndex++;
      }
    },
    getDefaultProgram: {

      /**
       * Returns the default program
       * @return {WebGLProgram}
       */

      value: function getDefaultProgram() {
        return this._defaultProgram;
      }
    },
    getLastTexture: {

      /**
       * Returns the last texture that has been drawn to
       * @return {WebGLTexture}
       */

      value: function getLastTexture() {
        return this._lastTexture;
      }
    },
    getTextures: {

      /**
       * Returns all textures
       * @return {Array.<WebGLTexture>}
       */

      value: function getTextures() {
        return this._textures;
      }
    },
    setLastTexture: {

      /**
       * Sets the last texture
       * @param {WebGLTexture} texture
       */

      value: function setLastTexture(texture) {
        this._lastTexture = texture;
      }
    },
    reset: {

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
    }
  }, {
    isSupported: {

      /**
       * Checks whether this type of renderer is supported in the current environment
       * @abstract
       * @returns {boolean}
       */

      value: function isSupported() {
        return !!(typeof window !== "undefined" && window.WebGLRenderingContext);
      }
    }
  });

  return WebGLRenderer;
})(Renderer);

module.exports = WebGLRenderer;

},{"../lib/math/vector2":18,"./renderer":78}],80:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Helpers = (function () {
  function Helpers(kit, ui, options) {
    _classCallCheck(this, Helpers);

    this._kit = kit;
    this._ui = ui;
    this._options = options;
  }

  _createClass(Helpers, {
    assetPath: {
      value: function assetPath(asset) {
        return this._options.assetsUrl + "/" + asset;
      }
    }
  });

  return Helpers;
})();

module.exports = Helpers;

},{}],81:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var dot = _interopRequire(require("dot"));

var Utils = _interopRequire(require("../../lib/utils"));

var EventEmitter = _interopRequire(require("../../lib/event-emitter"));

var Helpers = _interopRequire(require("./helpers"));

var BaseUI = (function (_EventEmitter) {
  function BaseUI(kit, options) {
    _classCallCheck(this, BaseUI);

    _get(Object.getPrototypeOf(BaseUI.prototype), "constructor", this).call(this);

    this._kit = kit;
    this._options = options;
    this._options.ui = this._options.ui || {};
    this._operations = [];
    this._helpers = new Helpers(this.kit, this, options);
    this.selectOperations(null);
  }

  _inherits(BaseUI, _EventEmitter);

  _createClass(BaseUI, {
    run: {

      /**
       * Prepares the UI for use
       */

      value: function run() {
        this._attach();
      }
    },
    identifier: {

      /**
       * A unique string that represents this UI
       * @type {String}
       */

      get: function () {
        return null;
      }
    },
    _attach: {

      /**
       * Renders and attaches the UI HTML
       * @private
       */

      value: function _attach() {
        if (this._options.container === null) {
          throw new Error("BaseUI#attach: No container set.");
        }

        var html = this._render();
        this._options.container.innerHTML = html;

        // Container has to be position: relative
        this._options.container.style.position = "relative";
      }
    },
    _render: {

      /**
       * Renders the template
       * @private
       */

      value: function _render() {
        if (typeof this._template === "undefined") {
          throw new Error("BaseUI#_render: No template set.");
        }

        var renderFn = dot.template(this._template);
        return renderFn(this.context);
      }
    },
    selectOperations: {

      /**
       * Selects the enabled operations
       * @param {ImglyKit.Selector}
       */

      value: function selectOperations(selector) {
        var registeredOperations = this._kit.registeredOperations;

        var operationIdentifiers = Object.keys(registeredOperations);

        var selectedOperations = Utils.select(operationIdentifiers, selector);
        this._operations = selectedOperations.map(function (identifier) {
          return registeredOperations[identifier];
        });
      }
    },
    addOperation: {

      /**
       * Adds the given operation to the available operations
       * @param {Operation} operation
       */

      value: function addOperation(operation) {
        this._operations.push(operation);
      }
    },
    isOperationSelected: {

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
    },
    context: {

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
    },
    container: {

      /**
       * The DOM container
       * @type {DOMElement}
       */

      get: function () {
        return this._options.container;
      }
    },
    operations: {

      /**
       * The selected / active operations
       * @type {Array.<ImglyKit.Operation>}
       */

      get: function () {
        return this._operations;
      }
    },
    options: {

      /**
       * The options
       * @type {Object}
       */

      get: function () {
        return this._options;
      }
    },
    canvas: {

      /**
       * The canvas object
       * @type {Canvas}
       */

      get: function () {
        return this._canvas;
      }
    },
    helpers: {

      /**
       * The helpers
       * @type {Helpers}
       */

      get: function () {
        return this._helpers;
      }
    },
    image: {

      /**
       * The image
       * @type {Image}
       */

      get: function () {
        return this._options.image;
      }
    }
  });

  return BaseUI;
})(EventEmitter);

module.exports = BaseUI;

},{"../../lib/event-emitter":14,"../../lib/utils":20,"./helpers":80,"dot":10}],82:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Control = _interopRequire(require("./control"));

var Slider = _interopRequire(require("../lib/slider"));



var BrightnessControl = (function (_Control) {
  function BrightnessControl() {
    _classCallCheck(this, BrightnessControl);

    if (_Control != null) {
      _Control.apply(this, arguments);
    }
  }

  _inherits(BrightnessControl, _Control);

  _createClass(BrightnessControl, {
    init: {
      /**
       * The entry point for this control
       */

      value: function init() {
        var controlsTemplate = "<div class=\"imglykit-controls-filters\">\n  <div class=\"imglykit-controls-button imglykit-controls-back\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/back.png') }}\" />\n  </div>\n\n  <div>\n    {{#def.slider}}\n  </div>\n</div>\n";
        this._controlsTemplate = controlsTemplate;
        this._partialTemplates.push(Slider.template);
      }
    },
    _onEnter: {

      /**
       * Gets called when this control is activated
       * @override
       */

      value: function _onEnter() {
        this._operationExistedBefore = !!this._ui.operations.brightness;
        this._operation = this._ui.getOrCreateOperation("brightness");

        // Initially set value
        var brightness = this._operation.getBrightness();
        this._initialBrightness = brightness;

        var sliderElement = this._controls.querySelector(".imglykit-slider");
        this._slider = new Slider(sliderElement, {
          minValue: -1,
          maxValue: 1,
          defaultValue: brightness
        });
        this._slider.on("update", this._onUpdate.bind(this));
        this._slider.setValue(this._initialBrightness);
      }
    },
    _onBack: {

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
          this._ui.removeOperation("brightness");
        }

        this._ui.canvas.render();
      }
    },
    _onUpdate: {

      /**
       * Gets called when the value has been updated
       * @override
       */

      value: function _onUpdate(value) {
        this._operation.setBrightness(value);
        this._ui.canvas.render();
      }
    }
  });

  return BrightnessControl;
})(Control);

/**
 * A unique string that identifies this control.
 * @type {String}
 */
BrightnessControl.prototype.identifier = "brightness";

module.exports = BrightnessControl;

},{"../lib/slider":100,"./control":84}],83:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Control = _interopRequire(require("./control"));

var Slider = _interopRequire(require("../lib/slider"));



var ContrastControl = (function (_Control) {
  function ContrastControl() {
    _classCallCheck(this, ContrastControl);

    if (_Control != null) {
      _Control.apply(this, arguments);
    }
  }

  _inherits(ContrastControl, _Control);

  _createClass(ContrastControl, {
    init: {
      /**
       * Entry point for this control
       */

      value: function init() {
        var controlsTemplate = "<div class=\"imglykit-controls-filters\">\n  <div class=\"imglykit-controls-button imglykit-controls-back\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/back.png') }}\" />\n  </div>\n\n  <div>\n    {{#def.slider}}\n  </div>\n</div>\n";
        this._controlsTemplate = controlsTemplate;
        this._partialTemplates.push(Slider.template);
      }
    },
    _onEnter: {

      /**
       * Gets called when this control is activated
       * @override
       */

      value: function _onEnter() {
        this._operationExistedBefore = !!this._ui.operations.contrast;
        this._operation = this._ui.getOrCreateOperation("contrast");

        // Initially set value
        var contrast = this._operation.getContrast();
        this._initialContrast = contrast;

        var sliderElement = this._controls.querySelector(".imglykit-slider");
        this._slider = new Slider(sliderElement, {
          minValue: 0,
          maxValue: 2,
          defaultValue: contrast
        });
        this._slider.on("update", this._onUpdate.bind(this));
        this._slider.setValue(this._initialContrast);
      }
    },
    _onBack: {

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
          this._ui.removeOperation("contrast");
        }

        this._ui.canvas.render();
      }
    },
    _onUpdate: {

      /**
       * Gets called when the value has been updated
       * @override
       */

      value: function _onUpdate(value) {
        this._operation.setContrast(value);
        this._ui.canvas.render();
      }
    }
  });

  return ContrastControl;
})(Control);

/**
 * A unique string that identifies this control.
 * @type {String}
 */
ContrastControl.prototype.identifier = "contrast";

module.exports = ContrastControl;

},{"../lib/slider":100,"./control":84}],84:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var dot = _interopRequire(require("dot"));

var Helpers = _interopRequire(require("../../base/helpers"));

var EventEmitter = _interopRequire(require("../../../lib/event-emitter"));

var Scrollbar = _interopRequire(require("../lib/scrollbar"));

var Control = (function (_EventEmitter) {
  function Control(kit, ui, operation) {
    _classCallCheck(this, Control);

    _get(Object.getPrototypeOf(Control.prototype), "constructor", this).call(this);

    this._kit = kit;
    this._ui = ui;
    this._operation = operation;
    this._helpers = new Helpers(this._kit, this._ui, this._ui.options);
    this._partialTemplates = [];
    this._active = false;

    this.init();
  }

  _inherits(Control, _EventEmitter);

  _createClass(Control, {
    setContainers: {

      /**
       * Sets the containers that the control will be rendered to
       * @param {DOMElement} controlsContainer
       * @param {DOMElement} canvasControlsContainer
       */

      value: function setContainers(controlsContainer, canvasControlsContainer) {
        this._controlsContainer = controlsContainer;
        this._canvasControlsContainer = canvasControlsContainer;
      }
    },
    init: {

      /**
       * The entry point for this control
       */

      value: function init() {}
    },
    _renderAllControls: {

      /**
       * Renders the controls
       * @private
       */

      value: function _renderAllControls() {
        this._renderControls();
        this._renderCanvasControls();
        this._initScrollbar();
      }
    },
    _renderControls: {

      /**
       * Renders the controls
       * @private
       */

      value: function _renderControls() {
        if (typeof this._controlsTemplate === "undefined") {
          throw new Error("Control#_renderOverviewControls: Control needs to define this._controlsTemplate.");
        }

        var template = this._partialTemplates.concat([this._controlsTemplate]).join("\r\n");

        // Render the template
        var renderFn = dot.template(template);
        var html = renderFn(this.context);

        if (typeof this._controls !== "undefined" && this._controls.parentNode !== null) {
          this._controls.parentNode.removeChild(this._controls);
        }

        // Create a wrapper
        this._controls = document.createElement("div");
        this._controls.innerHTML = html;

        // Append to DOM
        this._controlsContainer.appendChild(this._controls);
      }
    },
    _renderCanvasControls: {

      /**
       * Renders the canvas controls
       * @private
       */

      value: function _renderCanvasControls() {
        if (typeof this._canvasControlsTemplate === "undefined") {
          return; // Canvas controls are optional
        }

        var template = this._partialTemplates.concat([this._canvasControlsTemplate]).join("\r\n");

        // Render the template
        var renderFn = dot.template(template);
        var html = renderFn(this.context);

        // Create a wrapper
        this._canvasControls = document.createElement("div");
        this._canvasControls.innerHTML = html;

        // Append to DOM
        this._canvasControlsContainer.appendChild(this._canvasControls);
      }
    },
    _initScrollbar: {

      /**
       * Initializes the custom scrollbar
       * @private
       */

      value: function _initScrollbar() {
        var list = this._controls.querySelector(".imglykit-controls-list");
        if (list) {
          this._scrollbar = new Scrollbar(list.parentNode);
        }
      }
    },
    _removeControls: {

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
    },
    _handleBackAndDoneButtons: {

      /**
       * Handles the back and done buttons
       * @private
       */

      value: function _handleBackAndDoneButtons() {
        // Back button
        this._backButton = this._controls.querySelector(".imglykit-controls-back");
        if (this._backButton) {
          this._backButton.addEventListener("click", this._onBackButtonClick.bind(this));
        }

        // Done button
        this._doneButton = this._controls.querySelector(".imglykit-controls-done");
        if (this._doneButton) {
          this._doneButton.addEventListener("click", this._onDoneButtonClick.bind(this));
        }
      }
    },
    _onBackButtonClick: {

      /**
       * Gets called when the back button has been clicked
       * @private
       */

      value: function _onBackButtonClick() {
        this._onBack();
        this.emit("back");
      }
    },
    _onDoneButtonClick: {

      /**
       * Gets called when the done button has been clicked
       * @private
       */

      value: function _onDoneButtonClick() {
        this._onDone();
        this.emit("back");
      }
    },
    _highlightDoneButton: {

      /**
       * Highlights the done button
       * @private
       */

      value: function _highlightDoneButton() {
        this._doneButton.classList.add("highlighted");
      }
    },
    enter: {

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
    },
    leave: {

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
    },
    _enableCanvasControls: {
      value: function _enableCanvasControls() {
        this._canvasControlsContainer.classList.remove("imglykit-canvas-controls-disabled");
      }
    },
    _disableCanvasControls: {
      value: function _disableCanvasControls() {
        this._canvasControlsContainer.classList.add("imglykit-canvas-controls-disabled");
      }
    },
    _onEnter: {

      // Protected methods

      /**
       * Gets called when this control is activated.
       * @protected
       */

      value: function _onEnter() {}
    },
    _onLeave: {

      /**
       * Gets called when this control is deactivated
       * @protected
       */

      value: function _onLeave() {}
    },
    _onBack: {

      /**
       * Gets called when the back button has been clicked
       * @protected
       */

      value: function _onBack() {}
    },
    _onDone: {

      /**
       * Gets called when the done button has been clicked
       * @protected
       */

      value: function _onDone() {}
    },
    onZoom: {

      /**
       * Gets called when the zoom level has been changed while
       * this control is active
       */

      value: function onZoom() {}
    },
    context: {

      /**
       * The data that is available to the template
       * @type {Object}
       */

      get: function () {
        return {
          helpers: this._helpers
        };
      }
    }
  });

  return Control;
})(EventEmitter);

/**
 * A unique string that identifies this control.
 * @type {String}
 */
Control.prototype.identifier = null;

/**
 * To create an {@link ImglyKit.NightUI.Control} class of your own, call
 * this method and provide instance properties and functions.
 * @function
 */

var extend = _interopRequire(require("../../../lib/extend"));

Control.extend = extend;

module.exports = Control;

},{"../../../lib/event-emitter":14,"../../../lib/extend":15,"../../base/helpers":80,"../lib/scrollbar":98,"dot":10}],85:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Control = _interopRequire(require("./control"));

var Vector2 = _interopRequire(require("../../../lib/math/vector2"));

var Utils = _interopRequire(require("../../../lib/utils"));



var CropControl = (function (_Control) {
  function CropControl() {
    _classCallCheck(this, CropControl);

    if (_Control != null) {
      _Control.apply(this, arguments);
    }
  }

  _inherits(CropControl, _Control);

  _createClass(CropControl, {
    init: {
      /**
       * Entry point for this control
       */

      value: function init() {
        this._availableRatios = {};
        this._ratios = {};

        var controlsTemplate = "<div class=\"imglykit-controls-rotation\">\n  <div class=\"imglykit-controls-button imglykit-controls-back\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/back.png') }}\" />\n  </div>\n\n  <div>\n    <ul class=\"imglykit-controls-list imgly-controls-list-with-buttons\">\n      {{ for(var identifier in it.ratios) { }}\n        {{ var ratio = it.ratios[identifier]; }}\n        {{ var enabled = ratio.selected; }}\n        <li data-identifier=\"{{= identifier}}\" data-ratio=\"{{= ratio.ratio}}\"{{? enabled}} data-selected{{?}}>\n          <img src=\"{{=it.helpers.assetPath('ui/night/crop/' + identifier + '.png')}}\" />\n        </li>\n      {{ } }}\n    </ul>\n  </div>\n\n  <div class=\"imglykit-controls-button imglykit-controls-done\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/done.png') }}\" />\n  </div>\n</div>\n";
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
    },
    selectRatios: {

      /**
       * Selects the ratios
       * @param {Selector} selector
       */

      value: function selectRatios(selector) {
        this._ratios = {};

        var ratioIdentifiers = Object.keys(this._availableRatios);

        var selectedRatios = Utils.select(ratioIdentifiers, selector);
        for (var i = 0; i < selectedRatios.length; i++) {
          var identifier = selectedRatios[i];
          this._ratios[identifier] = this._availableRatios[identifier];
        }

        if (this._active) {
          this._renderControls();
        }
      }
    },
    _addDefaultRatios: {

      /**
       * Adds the default ratios
       * @private
       */

      value: function _addDefaultRatios() {
        this.addRatio("custom", "*", true);
        this.addRatio("square", "1");
        this.addRatio("4-3", "1.33");
        this.addRatio("16-9", "1.77");
      }
    },
    addRatio: {

      /**
       * Adds a ratio with the given identifier
       * @param {String} identifier
       * @param {Number} ratio
       * @param {Boolean} selected
       */

      value: function addRatio(identifier, ratio, selected) {
        this._availableRatios[identifier] = { ratio: ratio, selected: selected };
      }
    },
    _onEnter: {

      /**
       * Gets called when this control is activated
       * @override
       */

      value: function _onEnter() {
        var _this = this;

        _get(Object.getPrototypeOf(CropControl.prototype), "_onEnter", this).call(this);

        this._operationExistedBefore = !!this._ui.operations.crop;
        this._operation = this._ui.getOrCreateOperation("crop");

        this._defaultStart = new Vector2(0.1, 0.1);
        this._defaultEnd = new Vector2(0.9, 0.9);

        this._initialOptions = {
          start: this._operation.getStart(),
          end: this._operation.getEnd()
        };

        this._start = this._initialOptions.start || this._defaultStart;
        this._end = this._initialOptions.end || this._defaultEnd;

        // Minimum size in pixels
        this._minimumSize = new Vector2(50, 50);

        this._initialZoomLevel = this._ui.canvas.zoomLevel;
        this._ui.canvas.zoomToFit(false);

        var prefix = ".imglykit-canvas-crop";
        var container = this._canvasControls;
        var knobsContainer = container.querySelector("" + prefix + "-knobs");

        // Store initial settings for "back" button
        this._initialStart = this._operation.getStart().clone();
        this._initialEnd = this._operation.getEnd().clone();

        // Make sure we see the whole input image
        this._operation.set({
          start: new Vector2(0, 0),
          end: new Vector2(1, 1)
        });

        // Find all 4 knobs
        this._knobs = {
          topLeft: knobsContainer.querySelector("[data-corner=top-left]"),
          topRight: knobsContainer.querySelector("[data-corner=top-right]"),
          bottomLeft: knobsContainer.querySelector("[data-corner=bottom-left]"),
          bottomRight: knobsContainer.querySelector("[data-corner=bottom-right]")
        };

        // Find the div areas that affect the displayed crop size
        this._areas = {
          topLeft: this._canvasControls.querySelector("" + prefix + "-top-left"),
          topCenter: this._canvasControls.querySelector("" + prefix + "-top-center"),
          centerLeft: this._canvasControls.querySelector("" + prefix + "-center-left"),
          centerCenter: this._canvasControls.querySelector("" + prefix + "-center-center")
        };

        this._handleControls();
        this._handleKnobs();
        this._handleCenter();

        // Resume the rendering
        this._ui.canvas.render().then(function () {
          _this._updateDOM();
        });
      }
    },
    _handleControls: {

      /**
       * Handles the ratio controls
       * @private
       */

      value: function _handleControls() {
        var _this = this;

        var listItems = this._controls.querySelectorAll("ul > li");
        this._ratioItems = Array.prototype.slice.call(listItems);

        for (var i = 0; i < this._ratioItems.length; i++) {
          var _item$dataset;

          (function (i) {
            var item = _this._ratioItems[i];
            _item$dataset = item.dataset;
            var selected = _item$dataset.selected;
            var ratio = _item$dataset.ratio;
            var identifier = _item$dataset.identifier;

            if (typeof selected !== "undefined" && !_this._operationExistedBefore) {
              _this._setRatio(identifier, ratio, false);
              _this._selectRatio(item);
            }

            item.addEventListener("click", function (e) {
              e.preventDefault();
              _this._onRatioClick(item);
            });
          })(i);
        }
      }
    },
    _onRatioClick: {

      /**
       * Gets called when the given ratio has been selected
       * @param {DOMElement} item
       * @private
       */

      value: function _onRatioClick(item) {
        this._unselectAllRatios();
        this._selectRatio(item);
      }
    },
    _unselectAllRatios: {

      /**
       * Unselects all ratio control items
       * @private
       */

      value: function _unselectAllRatios() {
        for (var i = 0; i < this._ratioItems.length; i++) {
          var item = this._ratioItems[i];
          item.classList.remove("imglykit-controls-item-active");
        }
      }
    },
    _selectRatio: {

      /**
       * Activates the given ratio control item
       * @param {DOMElement} item
       * @private
       */

      value: function _selectRatio(item) {
        item.classList.add("imglykit-controls-item-active");
        var _item$dataset = item.dataset;
        var ratio = _item$dataset.ratio;
        var identifier = _item$dataset.identifier;

        this._setRatio(identifier, ratio);
      }
    },
    _setRatio: {

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

        if (ratio === "*") {
          this._ratio = null;
          this._start = new Vector2(0.1, 0.1);
          this._end = new Vector2(0.9, 0.9);
        } else {
          if (ratio === "original") {
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
    },
    _updateDOM: {

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
        this._areas.topLeft.style.width = "" + left + "px";
        this._areas.topCenter.style.width = "" + width + "px";

        // heights are defined by top left and center left areas
        this._areas.topLeft.style.height = "" + top + "px";
        this._areas.centerLeft.style.height = "" + height + "px";
      }
    },
    _handleKnobs: {

      /**
       * Handles the knob dragging
       * @private
       */

      value: function _handleKnobs() {
        var _this = this;

        for (var identifier in this._knobs) {
          (function (identifier) {
            var knob = _this._knobs[identifier];
            knob.addEventListener("mousedown", function (e) {
              _this._onKnobDown(e, knob);
            });
            knob.addEventListener("touchstart", function (e) {
              _this._onKnobDown(e, knob);
            });
          })(identifier);
        }
      }
    },
    _onKnobDown: {

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
        this._initialMousePosition = Utils.getEventPosition(e);

        // Remember the current values
        this._startBeforeDrag = this._start.clone();
        this._endBeforeDrag = this._end.clone();

        document.addEventListener("mousemove", this._onKnobDrag);
        document.addEventListener("touchmove", this._onKnobDrag);
        document.addEventListener("mouseup", this._onKnobUp);
        document.addEventListener("touchend", this._onKnobUp);
      }
    },
    _onKnobDrag: {

      /**
       * Gets called whe the user drags a knob
       * @param {Event} e
       * @private
       */

      value: function _onKnobDrag(e) {
        e.preventDefault();

        var mousePosition = Utils.getEventPosition(e);
        var mouseDiff = mousePosition.subtract(this._initialMousePosition);
        var corner = this._currentKnob.dataset.corner;
        var canvasSize = this._ui.canvas.size;

        var absoluteStart = this._startBeforeDrag.clone().multiply(canvasSize);
        var absoluteEnd = this._endBeforeDrag.clone().multiply(canvasSize);
        var maxHeight = canvasSize.y;

        var width = undefined,
            height = undefined,
            maximum = undefined,
            minimum = undefined;

        switch (corner) {
          case "top-left":
            absoluteStart.add(mouseDiff);
            maximum = absoluteEnd.clone().subtract(this._minimumSize);
            absoluteStart.clamp(null, maximum);
            break;
          case "top-right":
            absoluteEnd.x += mouseDiff.x;
            absoluteStart.y += mouseDiff.y;
            absoluteEnd.x = Math.max(absoluteStart.x + this._minimumSize.x, absoluteEnd.x);
            absoluteStart.y = Math.min(absoluteEnd.y - this._minimumSize.y, absoluteStart.y);
            break;
          case "bottom-right":
            absoluteEnd.add(mouseDiff);
            minimum = absoluteStart.clone().add(this._minimumSize);
            absoluteEnd.clamp(minimum);
            maxHeight = canvasSize.y - absoluteStart.y;
            break;
          case "bottom-left":
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
            case "top-left":
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
            case "top-right":
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
            case "bottom-right":
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
            case "bottom-left":
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
    },
    _onKnobUp: {

      /**
       * Gets called whe the user releases a knob
       * @param {Event} e
       * @private
       */

      value: function _onKnobUp() {
        this._currentKnob = null;
        document.removeEventListener("mousemove", this._onKnobDrag);
        document.removeEventListener("touchmove", this._onKnobDrag);
        document.removeEventListener("mouseup", this._onKnobUp);
        document.removeEventListener("touchend", this._onKnobUp);
      }
    },
    _handleCenter: {

      /**
       * Handles the center dragging
       * @private
       */

      value: function _handleCenter() {
        this._areas.centerCenter.addEventListener("mousedown", this._onCenterDown);
        this._areas.centerCenter.addEventListener("touchstart", this._onCenterDown);
      }
    },
    _onCenterDown: {

      /**
       * Gets called when the user presses the center area
       * @param {Event} e
       * @private
       */

      value: function _onCenterDown(e) {
        this._initialMousePosition = Utils.getEventPosition(e);

        // Remember the current values
        this._startBeforeDrag = this._start.clone();
        this._endBeforeDrag = this._end.clone();

        document.addEventListener("mousemove", this._onCenterDrag);
        document.addEventListener("touchmove", this._onCenterDrag);
        document.addEventListener("mouseup", this._onCenterUp);
        document.addEventListener("touchend", this._onCenterUp);
      }
    },
    _onCenterDrag: {

      /**
       * Gets called when the user presses the center area and moves his mouse
       * @param {Event} e
       * @private
       */

      value: function _onCenterDrag(e) {
        var mousePosition = Utils.getEventPosition(e);
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
        absoluteStart.clamp(new Vector2(0, 0), maxStart);

        // End position does not change (relative to start)
        absoluteEnd.copy(absoluteStart).add(absoluteCropSize);

        // Set the final values
        this._start.copy(absoluteStart).divide(canvasSize);
        this._end.copy(absoluteEnd).divide(canvasSize);

        this._updateDOM();
      }
    },
    _onCenterUp: {

      /**
       * Gets called when the user releases the center area
       * @param {Event} e
       * @private
       */

      value: function _onCenterUp() {
        document.removeEventListener("mousemove", this._onCenterDrag);
        document.removeEventListener("touchmove", this._onCenterDrag);
        document.removeEventListener("mouseup", this._onCenterUp);
        document.removeEventListener("touchend", this._onCenterUp);
      }
    },
    _onBack: {

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
          this._ui.removeOperation("crop");
        }
        this._ui.canvas.render();
      }
    },
    _onDone: {

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
    },
    context: {

      /**
       * The data that is available to the template
       * @type {Object}
       * @override
       */

      get: function () {
        var context = _get(Object.getPrototypeOf(CropControl.prototype), "context", this);
        context.ratios = this._ratios;
        return context;
      }
    },
    selectedRatio: {

      /**
       * The selected ratio identifier
       * @type {String}
       */

      get: function () {
        return this._selectedRatio;
      }
    }
  });

  return CropControl;
})(Control);

/**
 * A unique string that identifies this control.
 * @type {String}
 */
CropControl.prototype.identifier = "crop";

module.exports = CropControl;

},{"../../../lib/math/vector2":18,"../../../lib/utils":20,"./control":84}],86:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Control = _interopRequire(require("./control"));

var Utils = _interopRequire(require("../../../lib/utils"));



var FiltersControl = (function (_Control) {
  function FiltersControl() {
    _classCallCheck(this, FiltersControl);

    if (_Control != null) {
      _Control.apply(this, arguments);
    }
  }

  _inherits(FiltersControl, _Control);

  _createClass(FiltersControl, {
    init: {
      /**
       * Entry point for this control
       */

      value: function init() {
        var controlsTemplate = "<div class=\"imglykit-controls-filters\">\n  <div class=\"imglykit-controls-button imglykit-controls-back\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/back.png') }}\" />\n  </div>\n\n  <div>\n    <ul class=\"imglykit-controls-list imgly-controls-list-with-buttons\">\n      {{ for(var identifier in it.filters) { }}\n        {{ var filter = it.filters[identifier]; }}\n        {{ var name = filter.prototype.name; }}\n        {{ var enabled = it.activeFilter.identifier === identifier; }}\n        <li data-identifier=\"{{= identifier}}\" class=\"imglykit-controls-item-with-label{{? enabled}} imglykit-controls-item-active{{?}}\">\n          <img src=\"{{=it.helpers.assetPath('ui/night/filters/' + identifier + '.png')}}\" />\n          <div class=\"imglykit-controls-item-label\">{{= name }}</div>\n        </li>\n      {{ } }}\n    </ul>\n  </div>\n</div>\n";
        this._controlsTemplate = controlsTemplate;

        this._availableFilters = {};
        this._filters = {};

        this._addDefaultFilters();

        // Select all filters per default
        this.selectFilters(null);
      }
    },
    _renderAllControls: {

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
        this._operation = this._ui.getOrCreateOperation("filters");

        _get(Object.getPrototypeOf(FiltersControl.prototype), "_renderAllControls", this).apply(this, args);
      }
    },
    _onEnter: {

      /**
       * Gets called when this control is activated
       * @override
       */

      value: function _onEnter() {
        var _this = this;

        this._initialFilter = this._operation.getFilter();
        this._defaultFilter = this._operation.availableOptions.filter["default"];

        var listItems = this._controls.querySelectorAll("li");
        this._listItems = Array.prototype.slice.call(listItems);

        // Listen to click events
        for (var i = 0; i < this._listItems.length; i++) {
          (function (i) {
            var listItem = _this._listItems[i];
            listItem.addEventListener("click", function () {
              _this._onListItemClick(listItem);
            });
          })(i);
        }
      }
    },
    _onBack: {

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
          this._ui.removeOperation("filters");
        }
        this._ui.canvas.render();
      }
    },
    _onListItemClick: {

      /**
       * Gets called when the user clicked a list item
       * @private
       */

      value: function _onListItemClick(item) {
        this._deactivateAllItems();

        var identifier = item.dataset.identifier;

        this._operation.setFilter(this._filters[identifier]);
        this._ui.canvas.render();

        item.classList.add("imglykit-controls-item-active");
      }
    },
    _deactivateAllItems: {

      /**
       * Deactivates all list items
       * @private
       */

      value: function _deactivateAllItems() {
        for (var i = 0; i < this._listItems.length; i++) {
          var listItem = this._listItems[i];
          listItem.classList.remove("imglykit-controls-item-active");
        }
      }
    },
    _addDefaultFilters: {

      /**
       * Registers all the known filters
       * @private
       */

      value: function _addDefaultFilters() {
        this.addFilter(require("../../../operations/filters/identity-filter"));
        this.addFilter(require("../../../operations/filters/k1-filter"));
        this.addFilter(require("../../../operations/filters/k2-filter"));
        this.addFilter(require("../../../operations/filters/k6-filter"));
        this.addFilter(require("../../../operations/filters/kdynamic-filter"));
        this.addFilter(require("../../../operations/filters/fridge-filter"));
        this.addFilter(require("../../../operations/filters/breeze-filter"));
        this.addFilter(require("../../../operations/filters/orchid-filter"));
        this.addFilter(require("../../../operations/filters/chest-filter"));
        this.addFilter(require("../../../operations/filters/front-filter"));
        this.addFilter(require("../../../operations/filters/fixie-filter"));
        this.addFilter(require("../../../operations/filters/x400-filter"));
        this.addFilter(require("../../../operations/filters/bw-filter"));
        this.addFilter(require("../../../operations/filters/bwhard-filter"));
        this.addFilter(require("../../../operations/filters/lenin-filter"));
        this.addFilter(require("../../../operations/filters/quozi-filter"));
        this.addFilter(require("../../../operations/filters/pola669-filter"));
        this.addFilter(require("../../../operations/filters/pola-filter"));
        this.addFilter(require("../../../operations/filters/food-filter"));
        this.addFilter(require("../../../operations/filters/glam-filter"));
        this.addFilter(require("../../../operations/filters/celsius-filter"));
        this.addFilter(require("../../../operations/filters/texas-filter"));
        this.addFilter(require("../../../operations/filters/morning-filter"));
        this.addFilter(require("../../../operations/filters/lomo-filter"));
        this.addFilter(require("../../../operations/filters/gobblin-filter"));
        this.addFilter(require("../../../operations/filters/mellow-filter"));
        this.addFilter(require("../../../operations/filters/sunny-filter"));
        this.addFilter(require("../../../operations/filters/a15-filter"));
        this.addFilter(require("../../../operations/filters/semired-filter"));
      }
    },
    addFilter: {

      /**
       * Registers the given filter
       * @param  {class} filter
       * @private
       */

      value: function addFilter(filter) {
        this._availableFilters[filter.identifier] = filter;
      }
    },
    selectFilters: {

      /**
       * Selects the filters
       * @param {Selector} selector
       */

      value: function selectFilters(selector) {
        this._filters = {};

        var filterIdentifiers = Object.keys(this._availableFilters);

        var selectedFilters = Utils.select(filterIdentifiers, selector);
        for (var i = 0; i < selectedFilters.length; i++) {
          var identifier = selectedFilters[i];
          this._filters[identifier] = this._availableFilters[identifier];
        }

        if (this._active) {
          this._renderControls();
        }
      }
    },
    context: {

      /**
       * The data that is available to the template
       * @type {Object}
       * @override
       */

      get: function () {
        var context = _get(Object.getPrototypeOf(FiltersControl.prototype), "context", this);
        context.filters = this._filters;
        context.activeFilter = this._operation.getFilter();
        return context;
      }
    }
  });

  return FiltersControl;
})(Control);

/**
 * A unique string that identifies this control.
 * @type {String}
 */
FiltersControl.prototype.identifier = "filters";

module.exports = FiltersControl;

},{"../../../lib/utils":20,"../../../operations/filters/a15-filter":25,"../../../operations/filters/breeze-filter":26,"../../../operations/filters/bw-filter":27,"../../../operations/filters/bwhard-filter":28,"../../../operations/filters/celsius-filter":29,"../../../operations/filters/chest-filter":30,"../../../operations/filters/fixie-filter":32,"../../../operations/filters/food-filter":33,"../../../operations/filters/fridge-filter":34,"../../../operations/filters/front-filter":35,"../../../operations/filters/glam-filter":36,"../../../operations/filters/gobblin-filter":37,"../../../operations/filters/identity-filter":38,"../../../operations/filters/k1-filter":39,"../../../operations/filters/k2-filter":40,"../../../operations/filters/k6-filter":41,"../../../operations/filters/kdynamic-filter":42,"../../../operations/filters/lenin-filter":43,"../../../operations/filters/lomo-filter":44,"../../../operations/filters/mellow-filter":45,"../../../operations/filters/morning-filter":46,"../../../operations/filters/orchid-filter":47,"../../../operations/filters/pola-filter":48,"../../../operations/filters/pola669-filter":49,"../../../operations/filters/quozi-filter":63,"../../../operations/filters/semired-filter":64,"../../../operations/filters/sunny-filter":65,"../../../operations/filters/texas-filter":66,"../../../operations/filters/x400-filter":67,"./control":84}],87:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Control = _interopRequire(require("./control"));



var FlipControl = (function (_Control) {
  function FlipControl() {
    _classCallCheck(this, FlipControl);

    if (_Control != null) {
      _Control.apply(this, arguments);
    }
  }

  _inherits(FlipControl, _Control);

  _createClass(FlipControl, {
    init: {
      /**
       * Entry point for this control
       */

      value: function init() {
        var controlsTemplate = "<div class=\"imglykit-controls-rotation\">\n  <div class=\"imglykit-controls-button imglykit-controls-back\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/back.png') }}\" />\n  </div>\n\n  <div>\n    <ul class=\"imglykit-controls-list imgly-controls-list-with-buttons\">\n      <li data-direction=\"horizontal\">\n        <img src=\"{{=it.helpers.assetPath('ui/night/flip/horizontal.png')}}\" />\n      </li>\n      <li data-direction=\"vertical\">\n        <img src=\"{{=it.helpers.assetPath('ui/night/flip/vertical.png')}}\" />\n      </li>\n    </ul>\n  </div>\n</div>\n";
        this._controlsTemplate = controlsTemplate;
      }
    },
    _onEnter: {

      /**
       * Gets called when this control is activated
       */

      value: function _onEnter() {
        var _this = this;

        this._operationExistedBefore = !!this._ui.operations.flip;
        this._operation = this._ui.getOrCreateOperation("flip");

        this._initialHorizontal = this._operation.getHorizontal();
        this._initialVertical = this._operation.getVertical();

        var listItems = this._controls.querySelectorAll("li");
        this._listItems = Array.prototype.slice.call(listItems);

        // Listen to click events
        for (var i = 0; i < this._listItems.length; i++) {
          (function (i) {
            var listItem = _this._listItems[i];
            listItem.addEventListener("click", function () {
              _this._onListItemClick(listItem);
            });

            var direction = listItem.dataset.direction;

            if (direction === "horizontal" && _this._operation.getHorizontal()) {
              _this._toggleItem(listItem, true);
            } else if (direction === "vertical" && _this._operation.getVertical()) {
              _this._toggleItem(listItem, true);
            }
          })(i);
        }
      }
    },
    _onListItemClick: {

      /**
       * Gets called when the user clicked a list item
       * @private
       */

      value: function _onListItemClick(item) {
        var direction = item.dataset.direction;

        var active = false;

        if (direction === "horizontal") {
          var currentHorizontal = this._operation.getHorizontal();
          this._operation.setHorizontal(!currentHorizontal);
          this._ui.canvas.render();
          active = !currentHorizontal;
        } else if (direction === "vertical") {
          var currentVertical = this._operation.getVertical();
          this._operation.setVertical(!currentVertical);
          this._ui.canvas.render();
          active = !currentVertical;
        }

        this._toggleItem(item, active);
      }
    },
    _toggleItem: {

      /**
       * Toggles the active state of the given item
       * @param {DOMElement} item
       * @param {Boolean} active
       * @private
       */

      value: function _toggleItem(item, active) {
        var activeClass = "imglykit-controls-item-active";
        if (active) {
          item.classList.add(activeClass);
        } else {
          item.classList.remove(activeClass);
        }
      }
    },
    _onBack: {

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
          this._ui.removeOperation("flip");
        }

        this._ui.canvas.render();
      }
    }
  });

  return FlipControl;
})(Control);

/**
 * A unique string that identifies this control.
 * @type {String}
 */
FlipControl.prototype.identifier = "flip";

module.exports = FlipControl;

},{"./control":84}],88:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Control = _interopRequire(require("./control"));

var SimpleSlider = _interopRequire(require("../lib/simple-slider"));

var ColorPicker = _interopRequire(require("../lib/color-picker"));



var FramesControl = (function (_Control) {
  function FramesControl() {
    _classCallCheck(this, FramesControl);

    if (_Control != null) {
      _Control.apply(this, arguments);
    }
  }

  _inherits(FramesControl, _Control);

  _createClass(FramesControl, {
    init: {
      /**
       * Entry point for this control
       */

      value: function init() {
        var controlsTemplate = "<div class=\"imglykit-controls-filters\">\n  <div class=\"imglykit-controls-button imglykit-controls-back\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/back.png') }}\" />\n  </div>\n\n  <div>\n    {{#def.simpleSlider}}\n  </div>\n\n  <div class=\"imglykit-controls-button\">\n    {{var colorpickerLabel = \"Color\";}}\n    {{#def.colorpicker}}\n  </div>\n\n  <div class=\"imglykit-controls-button imglykit-controls-done\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/done.png') }}\" />\n    <div class=\"imglykit-controls-done-highlighted\">\n      <img src=\"{{=it.helpers.assetPath('ui/night/buttons/done-highlighted.png') }}\" />\n    </div>\n  </div>\n</div>\n";
        this._controlsTemplate = controlsTemplate;
        this._partialTemplates.push(SimpleSlider.template);
        this._partialTemplates.push(ColorPicker.template);
      }
    },
    _onEnter: {

      /**
       * Gets called when this control is activated
       * @override
       */

      value: function _onEnter() {
        this._operationExistedBefore = !!this._ui.operations.frames;
        this._operation = this._ui.getOrCreateOperation("frames");

        this._initialOptions = {
          thickness: this._operation.getThickness(),
          color: this._operation.getColor()
        };

        this._ui.canvas.render();

        // Init slider
        var sliderElement = this._controls.querySelector(".imglykit-slider");
        this._slider = new SimpleSlider(sliderElement, {
          minValue: 0,
          maxValue: 0.5
        });
        this._slider.on("update", this._onThicknessUpdate.bind(this));
        this._slider.setValue(this._initialOptions.thickness);

        // Init colorpicker
        var colorPickerElement = this._controls.querySelector(".imglykit-color-picker");
        this._colorPicker = new ColorPicker(this._ui, colorPickerElement);
        this._colorPicker.on("update", this._onColorUpdate.bind(this));
        this._colorPicker.setValue(this._initialOptions.color);
      }
    },
    _onBack: {

      /**
       * Gets called when the back button has been clicked
       * @override
       */

      value: function _onBack() {
        if (this._operationExistedBefore) {
          this._operation.set(this._initialOptions);
        } else {
          this._ui.removeOperation("frames");
        }
        this._ui.canvas.render();
      }
    },
    _onThicknessUpdate: {

      /**
       * Gets called when the thickness has been changed
       * @override
       */

      value: function _onThicknessUpdate(value) {
        this._operation.setThickness(value);
        this._ui.canvas.render();
        this._highlightDoneButton();
      }
    },
    _onColorUpdate: {

      /**
       * Gets called when the color has been changed
       * @override
       */

      value: function _onColorUpdate(value) {
        this._operation.setColor(value);
        this._ui.canvas.render();
        this._highlightDoneButton();
      }
    },
    _onDone: {

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
    }
  });

  return FramesControl;
})(Control);

/**
 * A unique string that identifies this control.
 * @type {String}
 */
FramesControl.prototype.identifier = "frames";

module.exports = FramesControl;

},{"../lib/color-picker":96,"../lib/simple-slider":99,"./control":84}],89:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Control = _interopRequire(require("./control"));

var Vector2 = _interopRequire(require("../../../lib/math/vector2"));

var Utils = _interopRequire(require("../../../lib/utils"));

var SimpleSlider = _interopRequire(require("../lib/simple-slider"));



var RadialBlurControl = (function (_Control) {
  function RadialBlurControl() {
    _classCallCheck(this, RadialBlurControl);

    if (_Control != null) {
      _Control.apply(this, arguments);
    }
  }

  _inherits(RadialBlurControl, _Control);

  _createClass(RadialBlurControl, {
    init: {
      /**
       * Entry point for this control
       */

      value: function init() {
        var controlsTemplate = "<div class=\"imglykit-controls-radial-blur\">\n  <div class=\"imglykit-controls-button imglykit-controls-back\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/back.png') }}\" />\n  </div>\n\n  <div class=\"imglykit-controls-icon\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/blur/blur.png')}}\" />\n  </div>\n\n  <div>\n    {{var sliderId = \"imglykit-blur-radius-slider\";}}\n    {{#def.simpleSlider}}\n  </div>\n\n  <div class=\"imglykit-controls-button imglykit-controls-done\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/done.png') }}\" />\n    <div class=\"imglykit-controls-done-highlighted\">\n      <img src=\"{{=it.helpers.assetPath('ui/night/buttons/done-highlighted.png') }}\" />\n    </div>\n  </div>\n</div>\n";
        this._controlsTemplate = controlsTemplate;

        var canvasControlsTemplate = "<div class=\"imglykit-canvas-radial-blur-container\">\n  <div class=\"imglykit-canvas-radial-blur-dot\" id=\"imglykit-radial-blur-position\"></div>\n  <div class=\"imglykit-canvas-radial-blur-dot\" id=\"imglykit-radial-blur-gradient\"></div>\n  <div class=\"imglykit-canvas-radial-blur-circle-container\">\n    <div class=\"imglykit-canvas-radial-blur-circle\"></div>\n  </div>\n</div>\n";
        this._canvasControlsTemplate = canvasControlsTemplate;

        this._partialTemplates.push(SimpleSlider.template);
      }
    },
    _onEnter: {

      /**
       * Gets called when this control is activated
       * @override
       */

      value: function _onEnter() {
        var _this = this;

        this._operationExistedBefore = !!this._ui.operations["radial-blur"];
        this._operation = this._ui.getOrCreateOperation("radial-blur");

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

        this._positionKnob = this._canvasControls.querySelector("#imglykit-radial-blur-position");
        this._gradientKnob = this._canvasControls.querySelector("#imglykit-radial-blur-gradient");
        this._circle = this._canvasControls.querySelector(".imglykit-canvas-radial-blur-circle");
        this._handleKnobs();
        this._initSliders();

        this._ui.canvas.render().then(function () {
          _this._updateDOM();
        });
      }
    },
    _initSliders: {

      /**
       * Initializes the slider controls
       * @private
       */

      value: function _initSliders() {
        var blurRadiusSlider = this._controls.querySelector("#imglykit-blur-radius-slider");
        this._blurRadiusSlider = new SimpleSlider(blurRadiusSlider, {
          minValue: 0,
          maxValue: 40
        });
        this._blurRadiusSlider.on("update", this._onBlurRadiusUpdate.bind(this));
        this._blurRadiusSlider.setValue(this._initialSettings.blurRadius);
      }
    },
    _onBlurRadiusUpdate: {

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
    },
    _handleKnobs: {

      /**
       * Handles the knob dragging
       * @private
       */

      value: function _handleKnobs() {
        // Initially set gradient knob position
        var canvasSize = this._ui.canvas.size;
        var position = this._operation.getPosition().clone().multiply(canvasSize);
        this._gradientKnobPosition = position.clone().add(this._initialSettings.gradientRadius, 0);

        this._positionKnob.addEventListener("mousedown", this._onPositionKnobDown);
        this._positionKnob.addEventListener("touchstart", this._onPositionKnobDown);
        this._gradientKnob.addEventListener("mousedown", this._onGradientKnobDown);
        this._gradientKnob.addEventListener("touchstart", this._onGradientKnobDown);
      }
    },
    _onPositionKnobDown: {

      /**
       * Gets called when the user starts dragging the position knob
       * @param {Event} e
       * @private
       */

      value: function _onPositionKnobDown(e) {
        e.preventDefault();

        var canvasSize = this._ui.canvas.size;

        this._initialMousePosition = Utils.getEventPosition(e);
        this._initialPosition = this._operation.getPosition().clone();
        this._gradientKnobDistance = this._gradientKnobPosition.clone().subtract(this._initialPosition.clone().multiply(canvasSize));

        document.addEventListener("mousemove", this._onPositionKnobDrag);
        document.addEventListener("touchmove", this._onPositionKnobDrag);

        document.addEventListener("mouseup", this._onPositionKnobUp);
        document.addEventListener("touchend", this._onPositionKnobUp);
      }
    },
    _onPositionKnobDrag: {

      /**
       * Gets called while the user starts drags the position knob
       * @param {Event} e
       * @private
       */

      value: function _onPositionKnobDrag(e) {
        e.preventDefault();

        var canvasSize = this._ui.canvas.size;
        var mousePosition = Utils.getEventPosition(e);
        var diff = mousePosition.subtract(this._initialMousePosition);

        var newPosition = this._initialPosition.clone().multiply(canvasSize).add(diff);

        var maxPosition = canvasSize.clone().subtract(this._gradientKnobDistance);
        newPosition.clamp(new Vector2(0, 0), maxPosition);

        this._gradientKnobPosition.copy(newPosition).add(this._gradientKnobDistance);

        // Translate to 0...1
        newPosition.divide(canvasSize);

        this._operation.setPosition(newPosition);
        this._updateDOM();
        this._ui.canvas.render();
      }
    },
    _onPositionKnobUp: {

      /**
       * Gets called when the user stops dragging the position knob
       * @param {Event} e
       * @private
       */

      value: function _onPositionKnobUp(e) {
        e.preventDefault();

        document.removeEventListener("mousemove", this._onPositionKnobDrag);
        document.removeEventListener("touchmove", this._onPositionKnobDrag);

        document.removeEventListener("mouseup", this._onPositionKnobUp);
        document.removeEventListener("touchend", this._onPositionKnobUp);
      }
    },
    _onGradientKnobDown: {

      /**
       * Gets called when the user starts dragging the position knob
       * @param {Event} e
       * @private
       */

      value: function _onGradientKnobDown(e) {
        e.preventDefault();

        this._initialMousePosition = Utils.getEventPosition(e);
        this._initialGradientKnobPosition = this._gradientKnobPosition.clone();

        document.addEventListener("mousemove", this._onGradientKnobDrag);
        document.addEventListener("touchmove", this._onGradientKnobDrag);

        document.addEventListener("mouseup", this._onGradientKnobUp);
        document.addEventListener("touchend", this._onGradientKnobUp);
      }
    },
    _onGradientKnobDrag: {

      /**
       * Gets called while the user starts drags the position knob
       * @param {Event} e
       * @private
       */

      value: function _onGradientKnobDrag(e) {
        e.preventDefault();

        var canvasSize = this._ui.canvas.size;
        var mousePosition = Utils.getEventPosition(e);
        var diff = mousePosition.subtract(this._initialMousePosition);

        // Calculate new gradient knob position
        this._gradientKnobPosition = this._initialGradientKnobPosition.clone().add(diff);
        this._gradientKnobPosition.clamp(new Vector2(0, 0), canvasSize);

        // Calculate distance to position
        var position = this._operation.getPosition().clone().multiply(canvasSize);
        var distance = this._gradientKnobPosition.clone().subtract(position);
        var gradientRadius = Math.sqrt(Math.pow(distance.x, 2) + Math.pow(distance.y, 2));

        // Update operation
        this._operation.setGradientRadius(gradientRadius);
        this._updateDOM();
        this._ui.canvas.render();
      }
    },
    _onGradientKnobUp: {

      /**
       * Gets called when the user stops dragging the position knob
       * @param {Event} e
       * @private
       */

      value: function _onGradientKnobUp(e) {
        e.preventDefault();

        document.removeEventListener("mousemove", this._onGradientKnobDrag);
        document.removeEventListener("touchmove", this._onGradientKnobDrag);

        document.removeEventListener("mouseup", this._onGradientKnobUp);
        document.removeEventListener("touchend", this._onGradientKnobUp);
      }
    },
    _updateDOM: {

      /**
       * Updates the knob
       * @private
       */

      value: function _updateDOM() {
        var canvasSize = this._ui.canvas.size;
        var position = this._operation.getPosition().clone().multiply(canvasSize);

        this._positionKnob.style.left = "" + position.x + "px";
        this._positionKnob.style.top = "" + position.y + "px";

        this._gradientKnob.style.left = "" + this._gradientKnobPosition.x + "px";
        this._gradientKnob.style.top = "" + this._gradientKnobPosition.y + "px";

        var circleSize = this._operation.getGradientRadius() * 2;
        this._circle.style.left = "" + position.x + "px";
        this._circle.style.top = "" + position.y + "px";
        this._circle.style.width = "" + circleSize + "px";
        this._circle.style.height = "" + circleSize + "px";
        this._circle.style.marginLeft = "-" + circleSize / 2 + "px";
        this._circle.style.marginTop = "-" + circleSize / 2 + "px";
      }
    },
    _onBack: {

      /**
       * Gets called when the back button has been clicked
       * @override
       */

      value: function _onBack() {
        if (this._operationExistedBefore) {
          this._operation.set(this._initialSettings);
        } else {
          this._ui.removeOperation("radial-blur");
        }
        this._ui.canvas.render();
      }
    },
    _onDone: {

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
    }
  });

  return RadialBlurControl;
})(Control);

/**
 * A unique string that identifies this control.
 * @type {String}
 */
RadialBlurControl.prototype.identifier = "radial-blur";

module.exports = RadialBlurControl;

},{"../../../lib/math/vector2":18,"../../../lib/utils":20,"../lib/simple-slider":99,"./control":84}],90:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Control = _interopRequire(require("./control"));

var Vector2 = _interopRequire(require("../../../lib/math/vector2"));



var RotationControl = (function (_Control) {
  function RotationControl() {
    _classCallCheck(this, RotationControl);

    if (_Control != null) {
      _Control.apply(this, arguments);
    }
  }

  _inherits(RotationControl, _Control);

  _createClass(RotationControl, {
    init: {
      /**
       * Entry point for this control
       */

      value: function init() {
        var controlsTemplate = "<div class=\"imglykit-controls-rotation\">\n  <div class=\"imglykit-controls-button imglykit-controls-back\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/back.png') }}\" />\n  </div>\n\n  <div>\n    <ul class=\"imglykit-controls-list imgly-controls-list-with-buttons\">\n      <li data-degrees=\"-90\">\n        <img src=\"{{=it.helpers.assetPath('ui/night/rotation/left.png')}}\" />\n      </li>\n      <li data-degrees=\"90\">\n        <img src=\"{{=it.helpers.assetPath('ui/night/rotation/right.png')}}\" />\n      </li>\n    </ul>\n  </div>\n</div>\n";
        this._controlsTemplate = controlsTemplate;

        var canvasControlsTemplate = "<div class=\"imglykit-canvas-crop-container imglykit-canvas-crop-container-hidden\">\n  <div class=\"imglykit-canvas-crop-top\">\n    <div class=\"imglykit-canvas-crop-top-left\"></div>\n    <div class=\"imglykit-canvas-crop-top-center\"></div>\n    <div class=\"imglykit-canvas-crop-top-right\"></div>\n  </div>\n\n  <div class=\"imglykit-canvas-crop-center\">\n    <div class=\"imglykit-canvas-crop-center-left\"></div>\n    <div class=\"imglykit-canvas-crop-center-center imglykit-canvas-crop-center-center-nomove\">\n\n    </div>\n    <div class=\"imglykit-canvas-crop-center-right\"></div>\n  </div>\n\n  <div class=\"imglykit-canvas-crop-bottom\">\n    <div class=\"imglykit-canvas-crop-bottom-left\"></div>\n    <div class=\"imglykit-canvas-crop-bottom-center\"></div>\n    <div class=\"imglykit-canvas-crop-bottom-right\"></div>\n  </div>\n</div>\n";
        this._canvasControlsTemplate = canvasControlsTemplate;
      }
    },
    _onEnter: {

      /**
       * Gets called when this control is activated
       */

      value: function _onEnter() {
        var _this = this;

        this._operationExistedBefore = !!this._ui.operations.rotation;
        this._operation = this._ui.getOrCreateOperation("rotation");

        this._cropOperation = this._ui.operations.crop;

        this._initialZoomLevel = this._ui.canvas.zoomLevel;
        this._ui.canvas.zoomToFit(false);

        if (this._cropOperation) {
          // Store initial settings for "back" and "done" buttons
          this._initialStart = this._cropOperation.getStart().clone();
          this._initialEnd = this._cropOperation.getEnd().clone();

          // Make sure we see the whole input image
          this._cropOperation.set({
            start: new Vector2(0, 0),
            end: new Vector2(1, 1)
          });
        }

        this._initialDegrees = this._operation.getDegrees();

        var listItems = this._controls.querySelectorAll("li");
        this._listItems = Array.prototype.slice.call(listItems);

        // Listen to click events
        for (var i = 0; i < this._listItems.length; i++) {
          (function (i) {
            var listItem = _this._listItems[i];
            listItem.addEventListener("click", function () {
              _this._onListItemClick(listItem);
            });
          })(i);
        }

        // Find the div areas that affect the displayed crop size
        var prefix = ".imglykit-canvas-crop";
        this._cropAreas = {
          topLeft: this._canvasControls.querySelector("" + prefix + "-top-left"),
          topCenter: this._canvasControls.querySelector("" + prefix + "-top-center"),
          centerLeft: this._canvasControls.querySelector("" + prefix + "-center-left"),
          centerCenter: this._canvasControls.querySelector("" + prefix + "-center-center")
        };

        // Resume the rendering
        this._ui.canvas.render().then(function () {
          _this._showCropContainer();
          _this._updateCropDOM();
        });
      }
    },
    _showCropContainer: {

      /**
       * Shows the crop container which is hidden initially to avoid flickering
       * when resizing after the rendering
       * @private
       */

      value: function _showCropContainer() {
        var container = this._canvasControls.querySelector(".imglykit-canvas-crop-container");
        container.classList.remove("imglykit-canvas-crop-container-hidden");
      }
    },
    _onListItemClick: {

      /**
       * Gets called when the given item has been clicked
       * @param {DOMObject} item
       * @private
       */

      value: function _onListItemClick(item) {
        var _this = this;

        var degrees = item.dataset.degrees;

        degrees = parseInt(degrees);

        var currentDegrees = this._operation.getDegrees();
        this._operation.setDegrees(currentDegrees + degrees);
        this._ui.canvas.zoomToFit().then(function () {
          _this._updateCropDOM();
        });
      }
    },
    onZoom: {

      /**
       * Gets called when the zoom level has been changed while
       * this control is active
       */

      value: function onZoom() {
        this._updateCropDOM();
      }
    },
    _updateCropDOM: {

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
          start = new Vector2(0, 0);
          end = new Vector2(1, 1);
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
        this._cropAreas.topLeft.style.width = "" + left + "px";
        this._cropAreas.topCenter.style.width = "" + width + "px";

        // heights are defined by top left and center left areas
        this._cropAreas.topLeft.style.height = "" + top + "px";
        this._cropAreas.centerLeft.style.height = "" + height + "px";
      }
    },
    _onBack: {

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
          this._ui.removeOperation("rotation");
        }

        if (this._cropOperation) {
          this._cropOperation.set({
            start: this._initialStart,
            end: this._initialEnd
          });
        }
        this._ui.canvas.render();
      }
    }
  });

  return RotationControl;
})(Control);

/**
 * A unique string that identifies this control.
 * @type {String}
 */
RotationControl.prototype.identifier = "rotation";

module.exports = RotationControl;

},{"../../../lib/math/vector2":18,"./control":84}],91:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Slider = _interopRequire(require("../lib/slider"));

var Control = _interopRequire(require("./control"));



var SaturationControl = (function (_Control) {
  function SaturationControl() {
    _classCallCheck(this, SaturationControl);

    if (_Control != null) {
      _Control.apply(this, arguments);
    }
  }

  _inherits(SaturationControl, _Control);

  _createClass(SaturationControl, {
    init: {
      /**
       * Entry point for this control
       */

      value: function init() {
        var controlsTemplate = "<div class=\"imglykit-controls-filters\">\n  <div class=\"imglykit-controls-button imglykit-controls-back\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/back.png') }}\" />\n  </div>\n\n  <div>\n    {{#def.slider}}\n  </div>\n</div>\n";
        this._controlsTemplate = controlsTemplate;
        this._partialTemplates.push(Slider.template);
      }
    },
    _onEnter: {

      /**
       * Gets called when this control is activated
       * @override
       */

      value: function _onEnter() {
        _get(Object.getPrototypeOf(SaturationControl.prototype), "_onEnter", this).call(this);

        this._operationExistedBefore = !!this._ui.operations.saturation;
        this._operation = this._ui.getOrCreateOperation("saturation");

        // Initially set value
        var saturation = this._operation.getSaturation();
        this._initialSaturation = saturation;

        var sliderElement = this._controls.querySelector(".imglykit-slider");
        this._slider = new Slider(sliderElement, {
          minValue: 0,
          maxValue: 2,
          defaultValue: saturation
        });
        this._slider.on("update", this._onUpdate.bind(this));
        this._slider.setValue(this._initialSaturation);
      }
    },
    _onBack: {

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
          this._ui.removeOperation("saturation");
        }

        this._ui.canvas.render();
      }
    },
    _onUpdate: {

      /**
       * Gets called when the value has been updated
       * @override
       */

      value: function _onUpdate(value) {
        this._operation.setSaturation(value);
        this._ui.canvas.render();
      }
    }
  });

  return SaturationControl;
})(Control);

/**
 * A unique string that identifies this control.
 * @type {String}
 */
SaturationControl.prototype.identifier = "saturation";

module.exports = SaturationControl;

},{"../lib/slider":100,"./control":84}],92:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Control = _interopRequire(require("./control"));

var Vector2 = _interopRequire(require("../../../lib/math/vector2"));

var Utils = _interopRequire(require("../../../lib/utils"));



var StickersControl = (function (_Control) {
  function StickersControl() {
    _classCallCheck(this, StickersControl);

    if (_Control != null) {
      _Control.apply(this, arguments);
    }
  }

  _inherits(StickersControl, _Control);

  _createClass(StickersControl, {
    init: {
      /**
       * Entry point for this control
       */

      value: function init() {
        var controlsTemplate = "<div class=\"imglykit-controls-stickers\">\n  <div class=\"imglykit-controls-button imglykit-controls-back\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/back.png') }}\" />\n  </div>\n\n  <div>\n    <ul class=\"imglykit-controls-list imgly-controls-list-with-buttons\">\n      {{ for(var identifier in it.stickers) { }}\n        {{ var stickerPath = it.stickers[identifier]; }}\n        {{ var enabled = it.activeSticker === identifier; }}\n        <li data-identifier=\"{{= identifier}}\"{{? enabled}} class=\"imglykit-controls-item-active\"{{?}} style=\"background-image: url('{{=it.helpers.assetPath(stickerPath)}}');\">\n        </li>\n      {{ } }}\n    </ul>\n  </div>\n\n  <div class=\"imglykit-controls-button imglykit-controls-done\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/done.png') }}\" />\n    <div class=\"imglykit-controls-done-highlighted\">\n      <img src=\"{{=it.helpers.assetPath('ui/night/buttons/done-highlighted.png') }}\" />\n    </div>\n  </div>\n</div>\n";
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
    },
    _addDefaultStickers: {

      /**
       * Registers the default stickers
       * @private
       */

      value: function _addDefaultStickers() {
        this.addSticker("glasses-nerd", "stickers/sticker-glasses-nerd.png");
        this.addSticker("glasses-normal", "stickers/sticker-glasses-normal.png");
        this.addSticker("glasses-shutter-green", "stickers/sticker-glasses-shutter-green.png");
        this.addSticker("glasses-shutter-yellow", "stickers/sticker-glasses-shutter-yellow.png");
        this.addSticker("glasses-sun", "stickers/sticker-glasses-sun.png");
        this.addSticker("hat-cap", "stickers/sticker-hat-cap.png");
        this.addSticker("hat-cylinder", "stickers/sticker-hat-cylinder.png");
        this.addSticker("hat-party", "stickers/sticker-hat-party.png");
        this.addSticker("hat-sheriff", "stickers/sticker-hat-sheriff.png");
        this.addSticker("heart", "stickers/sticker-heart.png");
        this.addSticker("mustache-long", "stickers/sticker-mustache-long.png");
        this.addSticker("mustache1", "stickers/sticker-mustache1.png");
        this.addSticker("mustache2", "stickers/sticker-mustache2.png");
        this.addSticker("mustache3", "stickers/sticker-mustache3.png");
        this.addSticker("pipe", "stickers/sticker-pipe.png");
        this.addSticker("snowflake", "stickers/sticker-snowflake.png");
        this.addSticker("star", "stickers/sticker-star.png");
      }
    },
    addSticker: {

      /**
       * Registers the sticker with the given identifier and path
       * @private
       */

      value: function addSticker(identifier, path) {
        this._availableStickers[identifier] = path;
      }
    },
    selectStickers: {

      /**
       * Selects the stickers
       * @param {Selector} selector
       */

      value: function selectStickers(selector) {
        this._stickers = {};

        var stickerIdentifiers = Object.keys(this._availableStickers);

        var selectedStickers = Utils.select(stickerIdentifiers, selector);
        for (var i = 0; i < selectedStickers.length; i++) {
          var identifier = selectedStickers[i];
          this._stickers[identifier] = this._availableStickers[identifier];
        }

        if (this._active) {
          this._renderControls();
        }
      }
    },
    _onEnter: {

      /**
       * Gets called when this control is activated
       * @override
       */

      value: function _onEnter() {
        var _this = this;

        this._operationExistedBefore = !!this._ui.operations.stickers;
        this._operation = this._ui.getOrCreateOperation("stickers");

        // Don't render initially
        this._ui.removeOperation("stickers");

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
        this._container = this._canvasControls.querySelector(".imglykit-canvas-stickers");
        this._stickerImage = this._canvasControls.querySelector("img");
        this._stickerImage.addEventListener("load", function () {
          _this._stickerSize = new Vector2(_this._stickerImage.width, _this._stickerImage.height);
          _this._onStickerLoad();
        });
        this._knob = this._canvasControls.querySelector("div.imglykit-knob");

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
    },
    _handleListItems: {

      /**
       * Handles the list item click events
       * @private
       */

      value: function _handleListItems() {
        var _this = this;

        var listItems = this._controls.querySelectorAll("li");
        this._listItems = Array.prototype.slice.call(listItems);

        // Listen to click events
        for (var i = 0; i < this._listItems.length; i++) {
          (function (i) {
            var listItem = _this._listItems[i];
            var identifier = listItem.dataset.identifier;

            listItem.addEventListener("click", function () {
              _this._onListItemClick(listItem);
            });

            if (!_this._operationExistedBefore && i === 0 || _this._operationExistedBefore && _this._stickers[identifier] === _this._initialSettings.sticker) {
              _this._onListItemClick(listItem, false);
            }
          })(i);
        }
      }
    },
    _applySettings: {

      /**
       * Resizes and positions the sticker according to the current settings
       * @private
       */

      value: function _applySettings() {
        var ratio = this._stickerSize.y / this._stickerSize.x;
        this._size.y = this._size.x * ratio;

        this._stickerImage.style.width = "" + this._size.x + "px";
        this._stickerImage.style.height = "" + this._size.y + "px";
        this._container.style.left = "" + this._position.x + "px";
        this._container.style.top = "" + this._position.y + "px";
      }
    },
    _onBack: {

      /**
       * Gets called when the user hits the back button
       * @override
       */

      value: function _onBack() {
        if (this._operationExistedBefore) {
          this._operation = this._ui.getOrCreateOperation("stickers");
          this._operation.set(this._initialSettings);
        } else {
          this._ui.removeOperation("stickers");
        }
        this._ui.canvas.setZoomLevel(this._initialZoomLevel);
      }
    },
    _onDone: {

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
        this._operation = this._ui.getOrCreateOperation("stickers");
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
    },
    _handleKnob: {

      /**
       * Handles the knob dragging
       * @private
       */

      value: function _handleKnob() {
        this._knob.addEventListener("mousedown", this._onKnobDown);
        this._knob.addEventListener("touchstart", this._onKnobDown);
      }
    },
    _onKnobDown: {

      /**
       * Gets called when the user clicks the knob
       * @param {Event} e
       * @private
       */

      value: function _onKnobDown(e) {
        e.preventDefault();

        this._initialMousePosition = Utils.getEventPosition(e);
        this._initialSize = this._size.clone();

        document.addEventListener("mousemove", this._onKnobDrag);
        document.addEventListener("touchmove", this._onKnobDrag);

        document.addEventListener("mouseup", this._onKnobUp);
        document.addEventListener("touchend", this._onKnobUp);
      }
    },
    _onKnobDrag: {

      /**
       * Gets called when the user drags the knob
       * @param {Event} e
       * @private
       */

      value: function _onKnobDrag(e) {
        e.preventDefault();

        var mousePosition = Utils.getEventPosition(e);
        var diff = mousePosition.clone().subtract(this._initialMousePosition);

        var size = this._initialSize.clone();
        var ratio = this._stickerImage.height / this._stickerImage.width;
        size.x += diff.x;
        size.y = size.x * ratio;

        this._size.copy(size);

        this._applySettings();
        this._highlightDoneButton();
      }
    },
    _onKnobUp: {

      /**
       * Gets called when the user releases the knob
       * @param {Event} e
       * @private
       */

      value: function _onKnobUp() {
        document.removeEventListener("mousemove", this._onKnobDrag);
        document.removeEventListener("touchmove", this._onKnobDrag);

        document.removeEventListener("mouseup", this._onKnobUp);
        document.removeEventListener("touchend", this._onKnobUp);
      }
    },
    _handleImage: {

      /**
       * Handles the image dragging
       * @private
       */

      value: function _handleImage() {
        this._stickerImage.addEventListener("mousedown", this._onImageDown);
        this._stickerImage.addEventListener("touchstart", this._onImageDown);
      }
    },
    _onImageDown: {

      /**
       * Gets called when the user clicks the image
       * @param {Event} e
       * @private
       */

      value: function _onImageDown(e) {
        e.preventDefault();

        this._initialMousePosition = Utils.getEventPosition(e);
        this._initialPosition = this._position.clone();

        document.addEventListener("mousemove", this._onImageDrag);
        document.addEventListener("touchmove", this._onImageDrag);

        document.addEventListener("mouseup", this._onImageUp);
        document.addEventListener("touchend", this._onImageUp);
      }
    },
    _onImageDrag: {

      /**
       * Gets called when the user drags the image
       * @param {Event} e
       * @private
       */

      value: function _onImageDrag(e) {
        e.preventDefault();

        var mousePosition = Utils.getEventPosition(e);
        var diff = mousePosition.clone().subtract(this._initialMousePosition);

        var position = this._initialPosition.clone();
        position.add(diff);

        this._position.copy(position);

        this._applySettings();
        this._highlightDoneButton();
      }
    },
    _onImageUp: {

      /**
       * Gets called when the user releases the image
       * @param {Event} e
       * @private
       */

      value: function _onImageUp() {
        document.removeEventListener("mousemove", this._onImageDrag);
        document.removeEventListener("touchmove", this._onImageDrag);

        document.removeEventListener("mouseup", this._onImageUp);
        document.removeEventListener("touchend", this._onImageUp);
      }
    },
    _onStickerLoad: {

      /**
       * Gets called as soon as the sticker image has been loaded
       * @private
       */

      value: function _onStickerLoad() {
        this._size = new Vector2(this._stickerImage.width, this._stickerImage.height);

        if (typeof this._position === "undefined") {
          this._position = new Vector2(0, 0);
        }

        this._applySettings();
      }
    },
    _onListItemClick: {

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
          this._stickerImage.attributes.removeNamedItem("style");
        } catch (e) {}

        this._sticker = identifier;
        this._stickerImage.src = stickerPath;

        item.classList.add("imglykit-controls-item-active");

        if (manually) {
          this._highlightDoneButton();
        }
      }
    },
    _deactivateAllItems: {

      /**
       * Deactivates all list items
       * @private
       */

      value: function _deactivateAllItems() {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this._listItems[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var listItem = _step.value;

            listItem.classList.remove("imglykit-controls-item-active");
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"]) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
    },
    context: {

      /**
       * The data that is available to the template
       * @type {Object}
       * @override
       */

      get: function () {
        var context = _get(Object.getPrototypeOf(StickersControl.prototype), "context", this);
        context.stickers = this._stickers;
        return context;
      }
    }
  });

  return StickersControl;
})(Control);

/**
 * A unique string that identifies this control.
 * @type {String}
 */
StickersControl.prototype.identifier = "stickers";

module.exports = StickersControl;

},{"../../../lib/math/vector2":18,"../../../lib/utils":20,"./control":84}],93:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Control = _interopRequire(require("./control"));

var ColorPicker = _interopRequire(require("../lib/color-picker"));

var Vector2 = _interopRequire(require("../../../lib/math/vector2"));

var Utils = _interopRequire(require("../../../lib/utils"));



var TextControl = (function (_Control) {
  function TextControl() {
    _classCallCheck(this, TextControl);

    if (_Control != null) {
      _Control.apply(this, arguments);
    }
  }

  _inherits(TextControl, _Control);

  _createClass(TextControl, {
    init: {
      /**
       * Entry point for this control
       */

      value: function init() {
        var controlsTemplate = "<div class=\"imglykit-controls-text\">\n  <div class=\"imglykit-controls-button imglykit-controls-back\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/back.png') }}\" />\n  </div>\n\n  <div>\n    <ul class=\"imglykit-controls-list imgly-controls-list-with-buttons\">\n      {{~it.fonts :value:index}}\n        <li data-name=\"{{= value.name}}\" data-weight=\"{{= value.weight}}\" style=\"font-family: {{= value.name}}; font-weight: {{= value.weight}}\">{{= value.name.substr(0, 2)}}</li>\n      {{~}}\n    </ul>\n  </div>\n\n  <div class=\"imglykit-controls-button\">\n    {{var colorpickerId = \"imglykit-text-foreground-color-picker\";}}\n    {{var colorpickerLabel = \"Foreground\";}}\n    {{#def.colorpicker}}\n  </div>\n\n  <div class=\"imglykit-controls-button\">\n    {{var colorpickerId = \"imglykit-text-background-color-picker\";}}\n    {{var colorpickerLabel = \"Background\";}}\n    {{#def.colorpicker}}\n  </div>\n\n  <div class=\"imglykit-controls-button imglykit-controls-done\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/done.png') }}\" />\n    <div class=\"imglykit-controls-done-highlighted\">\n      <img src=\"{{=it.helpers.assetPath('ui/night/buttons/done-highlighted.png') }}\" />\n    </div>\n  </div>\n</div>\n";
        this._controlsTemplate = controlsTemplate;

        var canvasControlsTemplate = "<div class=\"imglykit-canvas-text-container\">\n  <div class=\"imglykit-canvas-text\">\n    <div class=\"imglykit-crosshair\">\n      <img src=\"{{=it.helpers.assetPath('ui/night/crosshair.png')}}\" />\n    </div>\n    <div class=\"imglykit-canvas-text-textarea\">\n      <textarea></textarea>\n      <div class=\"imglykit-knob\"></div>\n    </div>\n  </div>\n</div>\n";
        this._canvasControlsTemplate = canvasControlsTemplate;

        this._partialTemplates.push(ColorPicker.template);

        this._fonts = [];
        this._addFonts();
      }
    },
    _onEnter: {

      /**
       * Gets called when this control is activated
       * @override
       */

      value: function _onEnter() {
        var _this = this;

        this._operationExistedBefore = !!this._ui.operations.text;
        this._operation = this._ui.getOrCreateOperation("text");

        // Don't render initially
        this._ui.removeOperation("text");

        var canvasSize = this._ui.canvas.size;

        this._initialSettings = {
          lineHeight: this._operation.getLineHeight(),
          fontSize: this._operation.getFontSize(),
          fontFamily: this._operation.getFontFamily(),
          fontWeight: this._operation.getFontWeight(),
          color: this._operation.getColor(),
          position: this._operation.getPosition(),
          text: this._operation.getText() || "",
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

        this._container = this._canvasControls.querySelector(".imglykit-canvas-text");
        this._textarea = this._canvasControls.querySelector("textarea");
        this._textarea.focus();

        this._moveKnob = this._canvasControls.querySelector(".imglykit-crosshair");
        this._resizeKnob = this._canvasControls.querySelector(".imglykit-knob");

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
    },
    _initColorPickers: {

      /**
       * Initializes the color pickers
       * @private
       */

      value: function _initColorPickers() {
        var _this = this;

        var foregroundColorPicker = this._controls.querySelector("#imglykit-text-foreground-color-picker");
        this._foregroundColorPicker = new ColorPicker(this._ui, foregroundColorPicker);
        this._foregroundColorPicker.setValue(this._operation.getColor());
        this._foregroundColorPicker.on("update", this._onForegroundColorUpdate);
        this._foregroundColorPicker.on("show", function () {
          _this._backgroundColorPicker.hide();
        });

        var backgroundColorPicker = this._controls.querySelector("#imglykit-text-background-color-picker");
        this._backgroundColorPicker = new ColorPicker(this._ui, backgroundColorPicker);
        this._backgroundColorPicker.setValue(this._operation.getBackgroundColor());
        this._backgroundColorPicker.on("update", this._onBackgroundColorUpdate);
        this._backgroundColorPicker.on("show", function () {
          _this._foregroundColorPicker.hide();
        });
      }
    },
    _handleListItems: {

      /**
       * Handles the list item click events
       * @private
       */

      value: function _handleListItems() {
        var _this = this;

        var listItems = this._controls.querySelectorAll("li");
        this._listItems = Array.prototype.slice.call(listItems);

        // Listen to click events
        for (var i = 0; i < this._listItems.length; i++) {
          (function (i) {
            var listItem = _this._listItems[i];
            var name = listItem.dataset.name;

            listItem.addEventListener("click", function () {
              _this._onListItemClick(listItem);
            });

            if (!_this._operationExistedBefore && i === 0 || _this._operationExistedBefore && name === _this._initialSettings.fontFamily) {
              _this._onListItemClick(listItem, false);
            }
          })(i);
        }
      }
    },
    _handleTextarea: {

      /**
       * Handles the text area key events
       * @private
       */

      value: function _handleTextarea() {
        this._textarea.addEventListener("keyup", this._onTextareaKeyUp);
      }
    },
    _onTextareaKeyUp: {

      /**
       * Gets called when the user releases a key inside the text area
       * @private
       */

      value: function _onTextareaKeyUp() {
        this._resizeTextarea();
        this._settings.text = this._textarea.value;
        this._highlightDoneButton();
      }
    },
    _resizeTextarea: {

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
            this._textarea.style.height = "" + (height - 5) + "px";
          } while (_scrollHeight && _scrollHeight != this._textarea.scrollHeight);
        }

        var scrollHeight = this._textarea.scrollHeight;
        this._textarea.style.height = "" + (scrollHeight + 20) + "px";
      }
    },
    _handleMoveKnob: {

      /**
       * Handles the move knob dragging
       * @private
       */

      value: function _handleMoveKnob() {
        this._moveKnob.addEventListener("mousedown", this._onMoveKnobDown);
        this._moveKnob.addEventListener("touchstart", this._onMoveKnobDown);
      }
    },
    _onMoveKnobDown: {

      /**
       * Gets called when the user clicks the move knob
       * @private
       */

      value: function _onMoveKnobDown(e) {
        e.preventDefault();

        this._initialMousePosition = Utils.getEventPosition(e);
        this._initialPosition = this._settings.position.clone();

        document.addEventListener("mousemove", this._onMoveKnobDrag);
        document.addEventListener("touchmove", this._onMoveKnobDrag);

        document.addEventListener("mouseup", this._onMoveKnobUp);
        document.addEventListener("tochend", this._onMoveKnobUp);
      }
    },
    _onMoveKnobDrag: {

      /**
       * Gets called when the user drags the move knob
       * @private
       */

      value: function _onMoveKnobDrag(e) {
        e.preventDefault();

        var canvasSize = this._ui.canvas.size;

        var mousePosition = Utils.getEventPosition(e);
        var diff = mousePosition.clone().subtract(this._initialMousePosition);

        var minPosition = new Vector2(0, 0);
        var containerSize = new Vector2(this._container.offsetWidth, this._container.offsetHeight);
        var maxPosition = canvasSize.clone().subtract(containerSize);
        var position = this._initialPosition.clone().add(diff).clamp(minPosition, maxPosition);

        this._settings.position = position;

        this._container.style.left = "" + position.x + "px";
        this._container.style.top = "" + position.y + "px";
      }
    },
    _onMoveKnobUp: {

      /**
       * Gets called when the user releases the move knob
       * @private
       */

      value: function _onMoveKnobUp() {
        document.removeEventListener("mousemove", this._onMoveKnobDrag);
        document.removeEventListener("touchmove", this._onMoveKnobDrag);

        document.removeEventListener("mouseup", this._onMoveKnobUp);
        document.removeEventListener("touchend", this._onMoveKnobUp);
      }
    },
    _handleResizeKnob: {

      /**
       * Handles the resize knob dragging
       * @private
       */

      value: function _handleResizeKnob() {
        this._resizeKnob.addEventListener("mousedown", this._onResizeKnobDown);
        this._resizeKnob.addEventListener("touchstart", this._onResizeKnobDown);
      }
    },
    _onResizeKnobDown: {

      /**
       * Gets called when the user clicks the resize knob
       * @param {Event} e
       * @private
       */

      value: function _onResizeKnobDown(e) {
        e.preventDefault();

        this._initialMousePosition = Utils.getEventPosition(e);
        this._initialMaxWidth = this._settings.maxWidth;

        document.addEventListener("mousemove", this._onResizeKnobDrag);
        document.addEventListener("touchmove", this._onResizeKnobDrag);

        document.addEventListener("mouseup", this._onResizeKnobUp);
        document.addEventListener("touchend", this._onResizeKnobUp);
      }
    },
    _onResizeKnobDrag: {

      /**
       * Gets called when the user drags the resize knob
       * @param {Event} e
       * @private
       */

      value: function _onResizeKnobDrag(e) {
        e.preventDefault();

        var canvasSize = this._ui.canvas.size;
        var mousePosition = Utils.getEventPosition(e);
        var diff = mousePosition.subtract(this._initialMousePosition);

        var position = this._settings.position.clone();
        var maxWidthAllowed = canvasSize.x - position.x;

        var maxWidth = this._initialMaxWidth + diff.x;
        maxWidth = Math.max(100, Math.min(maxWidthAllowed, maxWidth));
        this._settings.maxWidth = maxWidth;
        this._textarea.style.width = "" + maxWidth + "px";

        this._resizeTextarea();
      }
    },
    _onResizeKnobUp: {

      /**
       * Gets called when the user releases the resize knob
       * @param {Event} e
       * @private
       */

      value: function _onResizeKnobUp() {
        document.removeEventListener("mousemove", this._onResizeKnobDrag);
        document.removeEventListener("touchmove", this._onResizeKnobDrag);

        document.removeEventListener("mouseup", this._onResizeKnobUp);
        document.removeEventListener("touchend", this._onResizeKnobUp);
      }
    },
    _onForegroundColorUpdate: {

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
    },
    _onBackgroundColorUpdate: {

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
    },
    _applySettings: {

      /**
       * Styles the textarea to represent the current settings
       * @private
       */

      value: function _applySettings() {
        var textarea = this._textarea;
        var settings = this._settings;

        var canvasSize = this._ui.canvas.size;
        var actualFontSize = settings.fontSize * canvasSize.y;

        this._container.style.left = "" + settings.position.x + "px";
        this._container.style.top = "" + settings.position.y + "px";

        textarea.value = settings.text;
        textarea.style.fontFamily = settings.fontFamily;
        textarea.style.fontSize = "" + actualFontSize + "px";
        textarea.style.fontWeight = settings.fontWeight;
        textarea.style.lineHeight = settings.lineHeight;
        textarea.style.color = settings.color.toRGBA();
        textarea.style.backgroundColor = settings.backgroundColor.toRGBA();
        textarea.style.width = "" + settings.maxWidth + "px";
      }
    },
    _onListItemClick: {

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

        item.classList.add("imglykit-controls-item-active");

        if (manually) {
          this._highlightDoneButton();
        }
      }
    },
    _deactivateAllItems: {

      /**
       * Deactivates all list items
       * @private
       */

      value: function _deactivateAllItems() {
        for (var i = 0; i < this._listItems.length; i++) {
          var listItem = this._listItems[i];
          listItem.classList.remove("imglykit-controls-item-active");
        }
      }
    },
    _addFonts: {

      /**
       * Adds the default fonts
       * @private
       */

      value: function _addFonts() {
        this.addFont("Helvetica", "normal");
        this.addFont("Lucida Grande", "normal");
        this.addFont("Times New Roman", "normal");
      }
    },
    addFont: {

      /**
       * Adds a font with the given name and weight
       * @param {String} name
       * @param {String} weight
       */

      value: function addFont(name, weight) {
        this._fonts.push({ name: name, weight: weight });
      }
    },
    _onDone: {

      /**
       * Gets called when the done button has been clicked
       * @override
       */

      value: function _onDone() {
        var canvasSize = this._ui.canvas.size;
        var padding = new Vector2(2, 2);
        var position = this._settings.position.clone().add(padding).divide(canvasSize);

        this._ui.canvas.setZoomLevel(this._initialZoomLevel, false);

        this._operation = this._ui.getOrCreateOperation("text");
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
    },
    _onBack: {

      /**
       * Gets called when the back button has been clicked
       * @override
       */

      value: function _onBack() {
        if (this._operationExistedBefore) {
          this._operation = this._ui.getOrCreateOperation("text");
          this._operation.set(this._initialSettings);
        } else {
          this._ui.removeOperation("text");
        }
        this._ui.canvas.setZoomLevel(this._initialZoomLevel);
      }
    },
    context: {

      /**
       * The data that is available to the template
       * @type {Object}
       * @override
       */

      get: function () {
        var context = _get(Object.getPrototypeOf(TextControl.prototype), "context", this);
        context.fonts = this._fonts;
        return context;
      }
    }
  });

  return TextControl;
})(Control);

/**
 * A unique string that identifies this control.
 * @type {String}
 */
TextControl.prototype.identifier = "text";

module.exports = TextControl;

},{"../../../lib/math/vector2":18,"../../../lib/utils":20,"../lib/color-picker":96,"./control":84}],94:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Control = _interopRequire(require("./control"));

var Vector2 = _interopRequire(require("../../../lib/math/vector2"));

var Utils = _interopRequire(require("../../../lib/utils"));

var SimpleSlider = _interopRequire(require("../lib/simple-slider"));



var TiltShiftControl = (function (_Control) {
  function TiltShiftControl() {
    _classCallCheck(this, TiltShiftControl);

    if (_Control != null) {
      _Control.apply(this, arguments);
    }
  }

  _inherits(TiltShiftControl, _Control);

  _createClass(TiltShiftControl, {
    init: {
      /**
       * Entry point for this control
       */

      value: function init() {
        var controlsTemplate = "<div class=\"imglykit-controls-tilt-shift\">\n  <div class=\"imglykit-controls-button imglykit-controls-back\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/back.png') }}\" />\n  </div>\n\n  <div class=\"imglykit-controls-icon\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/blur/blur.png')}}\" />\n  </div>\n\n  <div>\n    {{var sliderId = \"imglykit-blur-radius-slider\";}}\n    {{#def.simpleSlider}}\n  </div>\n\n  <div class=\"imglykit-controls-button imglykit-controls-done\">\n    <img src=\"{{=it.helpers.assetPath('ui/night/buttons/done.png') }}\" />\n    <div class=\"imglykit-controls-done-highlighted\">\n      <img src=\"{{=it.helpers.assetPath('ui/night/buttons/done-highlighted.png') }}\" />\n    </div>\n  </div>\n</div>\n";
        this._controlsTemplate = controlsTemplate;

        var canvasControlsTemplate = "<div class=\"imglykit-canvas-tilt-shift-container\">\n  <div class=\"imglykit-canvas-tilt-shift-dot\" data-option=\"position\"></div>\n  <div class=\"imglykit-canvas-tilt-shift-dot\" data-option=\"gradient\"></div>\n  <div class=\"imglykit-canvas-tilt-shift-rect-container\">\n    <div class=\"imglykit-canvas-tilt-shift-rect\"></div>\n  </div>\n</div>\n";
        this._canvasControlsTemplate = canvasControlsTemplate;

        this._partialTemplates.push(SimpleSlider.template);
        this._currentKnob = null;
      }
    },
    _onEnter: {

      /**
       * Gets called when this control is activated
       * @override
       */

      value: function _onEnter() {
        var _this = this;

        this._operationExistedBefore = !!this._ui.operations["tilt-shift"];
        this._operation = this._ui.getOrCreateOperation("tilt-shift");

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
        var selector = ".imglykit-canvas-tilt-shift-dot";
        this._positionKnob = this._canvasControls.querySelector("" + selector + "[data-option=\"position\"]");
        this._gradientKnob = this._canvasControls.querySelector("" + selector + "[data-option=\"gradient\"]");
        this._rect = this._canvasControls.querySelector(".imglykit-canvas-tilt-shift-rect");

        // Initialization
        this._initSliders();

        this._ui.canvas.render().then(function () {
          _this._handleKnobs();
          _this._updateDOM();
        });
      }
    },
    _initSliders: {

      /**
       * Initializes the slider controls
       * @private
       */

      value: function _initSliders() {
        var blurRadiusSlider = this._controls.querySelector("#imglykit-blur-radius-slider");
        this._blurRadiusSlider = new SimpleSlider(blurRadiusSlider, {
          minValue: 0,
          maxValue: 40
        });
        this._blurRadiusSlider.on("update", this._onBlurRadiusUpdate.bind(this));
        this._blurRadiusSlider.setValue(this._initialSettings.blurRadius);
      }
    },
    _onBlurRadiusUpdate: {

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
    },
    _handleKnobs: {

      /**
       * Handles the knob dragging
       * @private
       */

      value: function _handleKnobs() {
        // Add event listeners
        this._positionKnob.addEventListener("mousedown", this._onPositionKnobDown);
        this._positionKnob.addEventListener("touchstart", this._onPositionKnobDown);
        this._gradientKnob.addEventListener("mousedown", this._onGradientKnobDown);
        this._gradientKnob.addEventListener("touchstart", this._onGradientKnobDown);

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
    },
    _updateStartAndEnd: {

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
    },
    _onPositionKnobDown: {

      /**
       * Gets called when the user starts dragging the position knob
       * @param {Event} e
       * @private
       */

      value: function _onPositionKnobDown(e) {
        e.preventDefault();

        this._initialMousePosition = Utils.getEventPosition(e);
        this._initialPosition = this._knobPosition.clone();
        this._initialDistanceToGradientKnob = this._gradientKnobPosition.clone().subtract(this._initialPosition);

        document.addEventListener("mousemove", this._onPositionKnobDrag);
        document.addEventListener("touchmove", this._onPositionKnobDrag);

        document.addEventListener("mouseup", this._onPositionKnobUp);
        document.addEventListener("touchend", this._onPositionKnobUp);
      }
    },
    _onPositionKnobDrag: {

      /**
       * Gets called when the user drags the position knob
       * @param {Event} e
       * @private
       */

      value: function _onPositionKnobDrag(e) {
        e.preventDefault();

        var canvasSize = this._ui.canvas.size;
        var mousePosition = Utils.getEventPosition(e);
        var diff = mousePosition.subtract(this._initialMousePosition);

        var newPosition = this._initialPosition.clone().add(diff);
        this._knobPosition.copy(newPosition);

        var minPosition = new Vector2().subtract(this._initialDistanceToGradientKnob);
        minPosition.clamp(new Vector2(0, 0));

        var maxPosition = canvasSize.clone().subtract(this._initialDistanceToGradientKnob);
        maxPosition.clamp(null, canvasSize);

        this._knobPosition.clamp(minPosition, maxPosition);

        this._gradientKnobPosition.copy(this._knobPosition).add(this._initialDistanceToGradientKnob);

        this._updateStartAndEnd();
        this._updateDOM();
        this._ui.canvas.render();
      }
    },
    _onPositionKnobUp: {

      /**
       * Gets called when the user stops dragging the position knob
       * @param {Event} e
       * @private
       */

      value: function _onPositionKnobUp(e) {
        e.preventDefault();

        document.removeEventListener("mousemove", this._onPositionKnobDrag);
        document.removeEventListener("touchmove", this._onPositionKnobDrag);

        document.removeEventListener("mouseup", this._onPositionKnobUp);
        document.removeEventListener("touchend", this._onPositionKnobUp);
      }
    },
    _onGradientKnobDown: {

      /**
       * Gets called when the user starts dragging the gradient knob
       * @param {Event} e
       * @private
       */

      value: function _onGradientKnobDown(e) {
        e.preventDefault();

        this._initialMousePosition = Utils.getEventPosition(e);
        this._initialGradientKnobPosition = this._gradientKnobPosition.clone();

        document.addEventListener("mousemove", this._onGradientKnobDrag);
        document.addEventListener("touchmove", this._onGradientKnobDrag);

        document.addEventListener("mouseup", this._onGradientKnobUp);
        document.addEventListener("touchend", this._onGradientKnobUp);
      }
    },
    _onGradientKnobDrag: {

      /**
       * Gets called when the user drags the gradient knob
       * @param {Event} e
       * @private
       */

      value: function _onGradientKnobDrag(e) {
        e.preventDefault();

        var canvasSize = this._ui.canvas.size;
        var mousePosition = Utils.getEventPosition(e);
        var diff = mousePosition.subtract(this._initialMousePosition);

        this._gradientKnobPosition.copy(this._initialGradientKnobPosition).add(diff);
        this._gradientKnobPosition.clamp(new Vector2(0, 0), canvasSize);

        var distance = this._gradientKnobPosition.clone().subtract(this._knobPosition);
        var newGradientRadius = 2 * Math.sqrt(Math.pow(distance.x, 2) + Math.pow(distance.y, 2));

        this._operation.setGradientRadius(newGradientRadius);
        this._updateStartAndEnd();
        this._updateDOM();
        this._ui.canvas.render();
      }
    },
    _onGradientKnobUp: {

      /**
       * Gets called when the user stops dragging the gradient knob
       * @param {Event} e
       * @private
       */

      value: function _onGradientKnobUp(e) {
        e.preventDefault();

        document.removeEventListener("mousemove", this._onGradientKnobDrag);
        document.removeEventListener("touchmove", this._onGradientKnobDrag);

        document.removeEventListener("mouseup", this._onGradientKnobUp);
        document.removeEventListener("touchend", this._onGradientKnobUp);
      }
    },
    _updateDOM: {

      /**
       * Updates the knob
       * @private
       */

      value: function _updateDOM() {
        var position = this._knobPosition;
        this._positionKnob.style.left = "" + position.x + "px";
        this._positionKnob.style.top = "" + position.y + "px";

        var gradientPosition = this._gradientKnobPosition;
        this._gradientKnob.style.left = "" + gradientPosition.x + "px";
        this._gradientKnob.style.top = "" + gradientPosition.y + "px";

        // Resize rectangle to worst case size
        var canvasSize = this._ui.canvas.size;
        var gradientRadius = this._operation.getGradientRadius();
        var rectSize = new Vector2(Math.sqrt(Math.pow(canvasSize.x, 2) + Math.pow(canvasSize.y, 2)) * 2, gradientRadius);

        this._rect.style.width = "" + rectSize.x + "px";
        this._rect.style.height = "" + rectSize.y + "px";
        this._rect.style.marginLeft = "-" + rectSize.x / 2 + "px";
        this._rect.style.marginTop = "-" + rectSize.y / 2 + "px";
        this._rect.style.left = "" + position.x + "px";
        this._rect.style.top = "" + position.y + "px";

        // Rotate rectangle
        var dist = gradientPosition.clone().subtract(position);
        var degrees = Math.atan2(dist.x, dist.y) * (180 / Math.PI);
        this._rect.style.transform = "rotate(" + (-degrees).toFixed(2) + "deg)";
      }
    },
    _onBack: {

      /**
       * Gets called when the back button has been clicked
       * @override
       */

      value: function _onBack() {
        if (this._operationExistedBefore) {
          this._operation.set(this._initialSettings);
        } else {
          this._ui.removeOperation("tilt-shift");
        }
        this._ui.canvas.render();
      }
    },
    _onDone: {

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
    }
  });

  return TiltShiftControl;
})(Control);

/**
 * A unique string that identifies this control.
 * @type {String}
 */
TiltShiftControl.prototype.identifier = "tilt-shift";

module.exports = TiltShiftControl;

},{"../../../lib/math/vector2":18,"../../../lib/utils":20,"../lib/simple-slider":99,"./control":84}],95:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var WebGLRenderer = _interopRequire(require("../../../renderers/webgl-renderer"));

var CanvasRenderer = _interopRequire(require("../../../renderers/canvas-renderer"));

var Vector2 = _interopRequire(require("../../../lib/math/vector2"));

var EventEmitter = _interopRequire(require("../../../lib/event-emitter"));

var Canvas = (function (_EventEmitter) {
  function Canvas(kit, ui, options) {
    _classCallCheck(this, Canvas);

    _get(Object.getPrototypeOf(Canvas.prototype), "constructor", this).call(this);

    this._kit = kit;
    this._ui = ui;
    this._options = options;

    var container = this._ui.container;

    this._canvasContainer = container.querySelector(".imglykit-canvas-container");
    this._canvasInnerContainer = container.querySelector(".imglykit-canvas-inner-container");
    this._canvas = this._canvasContainer.querySelector("canvas");
    this._image = this._options.image;
    this._roundZoomBy = 0.1;
    this._isFirstRender = true;

    // Mouse event callbacks bound to the class context
    this._dragOnMousedown = this._dragOnMousedown.bind(this);
    this._dragOnMousemove = this._dragOnMousemove.bind(this);
    this._dragOnMouseup = this._dragOnMouseup.bind(this);
  }

  _inherits(Canvas, _EventEmitter);

  _createClass(Canvas, {
    run: {

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
    },
    render: {

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
        var imageSize = new Vector2(this._image.width, this._image.height);
        var initialSize = imageSize.multiply(this._zoomLevel);
        this._setCanvasSize(initialSize);

        // Reset framebuffers
        this._renderer.reset();

        // On first render, draw the image to the input texture
        if (this._isFirstRender || this._renderer.constructor.identifier === "canvas") {
          this._renderer.drawImage(this._image);
          this._isFirstRender = false;
        }

        // Run the operations stack
        var stack = this.sanitizedStack;
        this._updateStackDirtyStates(stack);

        var validationPromises = [];
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = stack[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var operation = _step.value;

            validationPromises.push(operation.validateSettings());
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"]) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        return Promise.all(validationPromises)
        // Render the operations stack
        .then(function () {
          var promises = [];
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = stack[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var operation = _step2.value;

              promises.push(operation.render(_this._renderer));
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
                _iterator2["return"]();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
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
    },
    setImage: {

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
    },
    zoomIn: {

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
    },
    zoomOut: {

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
    },
    _setCanvasSize: {

      /**
       * Resizes and positions the canvas
       * @param {Vector2} [size]
       * @private
       */

      value: function _setCanvasSize(size) {
        size = size || new Vector2(this._canvas.width, this._canvas.height);

        this._canvas.width = size.x;
        this._canvas.height = size.y;

        this._storeCanvasSize();
        this._updateContainerSize();
      }
    },
    _updateContainerSize: {

      /**
       * Updates the canvas container size
       * @private
       */

      value: function _updateContainerSize() {
        var size = this._size;
        this._canvasInnerContainer.style.width = "" + size.x + "px";
        this._canvasInnerContainer.style.height = "" + size.y + "px";
      }
    },
    _storeCanvasSize: {

      /**
       * Remembers the canvas size
       * @comment This was introduced because the canvas size was not always
       *          correct due to some race conditions. Now that promises work
       *          properly, do we still need this?
       * @private
       */

      value: function _storeCanvasSize() {
        this._size = new Vector2(this._canvas.width, this._canvas.height);
      }
    },
    _centerCanvas: {

      /**
       * Centers the canvas inside the container
       * @private
       */

      value: function _centerCanvas() {
        var position = this._maxSize.divide(2);

        this._canvasInnerContainer.style.left = "" + position.x + "px";
        this._canvasInnerContainer.style.top = "" + position.y + "px";

        this._updateCanvasMargins();
      }
    },
    _updateCanvasMargins: {

      /**
       * Updates the canvas margins so that they are the negative half width
       * and height of the canvas
       * @private
       */

      value: function _updateCanvasMargins() {
        var canvasSize = new Vector2(this._canvas.width, this._canvas.height);
        var margin = canvasSize.divide(2).multiply(-1);
        this._canvasInnerContainer.style.marginLeft = "" + margin.x + "px";
        this._canvasInnerContainer.style.marginTop = "" + margin.y + "px";
      }
    },
    setZoomLevel: {

      /**
       * Sets the zoom level, re-renders the canvas and
       * repositions it
       * @param {Number} zoomLevel
       * @param {Boolean} render
       * @private
       */

      value: function setZoomLevel(zoomLevel) {
        var _this = this;

        var render = arguments[1] === undefined ? true : arguments[1];

        this._zoomLevel = zoomLevel;
        if (render) {
          this.setAllOperationsToDirty();
          return this.render().then(function () {
            _this._updateCanvasMargins();
            _this._applyBoundaries();
            _this.emit("zoom"); // will be redirected to top controls
          });
        } else {
          this._updateCanvasMargins();
          this._applyBoundaries();
          this.emit("zoom"); // will be redirected to top controls
        }
      }
    },
    setAllOperationsToDirty: {

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
    },
    _getInitialZoomLevel: {

      /**
       * Gets the initial zoom level so that the image fits the maximum
       * canvas size
       * @private
       */

      value: function _getInitialZoomLevel() {
        var inputSize = new Vector2(this._image.width, this._image.height);

        var cropOperation = this._ui.operations.crop;
        var rotationOperation = this._ui.operations.rotation;

        var cropSize = undefined,
            croppedSize = undefined,
            finalSize = undefined,
            initialSize = undefined;

        if (cropOperation) {
          cropSize = cropOperation.getEnd().clone().subtract(cropOperation.getStart());
        } else {
          cropSize = new Vector2(1, 1);
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
    },
    _resizeVectorToFit: {

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
    },
    _initRenderer: {

      /**
       * Initializes the renderer
       * @private
       */

      value: function _initRenderer() {
        var _this = this;

        if (WebGLRenderer.isSupported() && this._options.renderer !== "canvas") {
          this._renderer = new WebGLRenderer(null, this._canvas);
          this._webglEnabled = true;
        } else if (CanvasRenderer.isSupported()) {
          this._renderer = new CanvasRenderer(null, this._canvas);
          this._webglEnabled = false;
        }

        if (this._renderer === null) {
          throw new Error("Neither Canvas nor WebGL renderer are supported.");
        }

        this._renderer.on("new-canvas", function (canvas) {
          _this._setCanvas(canvas);
        });
      }
    },
    _setCanvas: {

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
    },
    _handleDrag: {

      /**
       * Handles the dragging
       * @private
       */

      value: function _handleDrag() {
        this._canvas.addEventListener("mousedown", this._dragOnMousedown);
        this._canvas.addEventListener("touchstart", this._dragOnMousedown);
      }
    },
    _dragOnMousedown: {

      /**
       * Gets called when the user started touching / clicking the canvas
       * @param {Event} e
       * @private
       */

      value: function _dragOnMousedown(e) {
        if (e.type === "mousedown" && e.button !== 0) {
          return;
        }e.preventDefault();

        var x = e.pageX,
            y = e.pageY;
        if (e.type === "touchstart") {
          x = e.touches[0].pageX;
          y = e.touches[0].pageY;
        }

        var canvasX = parseInt(this._canvasInnerContainer.style.left);
        var canvasY = parseInt(this._canvasInnerContainer.style.top);

        document.addEventListener("mousemove", this._dragOnMousemove);
        document.addEventListener("touchmove", this._dragOnMousemove);

        document.addEventListener("mouseup", this._dragOnMouseup);
        document.addEventListener("touchend", this._dragOnMouseup);

        // Remember initial position
        this._initialMousePosition = new Vector2(x, y);
        this._initialCanvasPosition = new Vector2(canvasX, canvasY);
      }
    },
    _dragOnMousemove: {

      /**
       * Gets called when the user drags the canvas
       * @param {Event} e
       * @private
       */

      value: function _dragOnMousemove(e) {
        e.preventDefault();

        var x = e.pageX,
            y = e.pageY;
        if (e.type === "touchmove") {
          x = e.touches[0].pageX;
          y = e.touches[0].pageY;
        }

        var newMousePosition = new Vector2(x, y);
        var mouseDiff = newMousePosition.clone().subtract(this._initialMousePosition);
        var newPosition = this._initialCanvasPosition.clone().add(mouseDiff);

        this._canvasInnerContainer.style.left = "" + newPosition.x + "px";
        this._canvasInnerContainer.style.top = "" + newPosition.y + "px";

        this._applyBoundaries();
      }
    },
    _applyBoundaries: {

      /**
       * Makes sure the canvas positions are within the boundaries
       * @private
       */

      value: function _applyBoundaries() {
        var x = parseInt(this._canvasInnerContainer.style.left);
        var y = parseInt(this._canvasInnerContainer.style.top);
        var canvasPosition = new Vector2(x, y);

        // Boundaries
        var boundaries = this._boundaries;
        canvasPosition.x = Math.min(boundaries.max.x, Math.max(boundaries.min.x, canvasPosition.x));
        canvasPosition.y = Math.min(boundaries.max.y, Math.max(boundaries.min.y, canvasPosition.y));

        this._canvasInnerContainer.style.left = "" + canvasPosition.x + "px";
        this._canvasInnerContainer.style.top = "" + canvasPosition.y + "px";
      }
    },
    _dragOnMouseup: {

      /**
       * Gets called when the user stopped dragging the canvsa
       * @param {Event} e
       * @private
       */

      value: function _dragOnMouseup(e) {
        e.preventDefault();

        document.removeEventListener("mousemove", this._dragOnMousemove);
        document.removeEventListener("touchmove", this._dragOnMousemove);

        document.removeEventListener("mouseup", this._dragOnMouseup);
        document.removeEventListener("touchend", this._dragOnMouseup);
      }
    },
    _boundaries: {

      /**
       * The position boundaries for the canvas inside the container
       * @type {Object.<Vector2>}
       * @private
       */

      get: function () {
        var canvasSize = new Vector2(this._canvas.width, this._canvas.height);
        var maxSize = this._maxSize;

        var diff = canvasSize.clone().subtract(maxSize).multiply(-1);

        var boundaries = {
          min: new Vector2(diff.x, diff.y),
          max: new Vector2(0, 0)
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
    },
    _maxSize: {

      /**
       * The maximum canvas size
       * @private
       */

      get: function () {
        var computedStyle = getComputedStyle(this._canvasContainer);
        var size = new Vector2(this._canvasContainer.offsetWidth, this._canvasContainer.offsetHeight);

        var paddingX = parseInt(computedStyle.getPropertyValue("padding-left"));
        paddingX += parseInt(computedStyle.getPropertyValue("padding-right"));

        var paddingY = parseInt(computedStyle.getPropertyValue("padding-top"));
        paddingY += parseInt(computedStyle.getPropertyValue("padding-bottom"));

        size.x -= paddingX;
        size.y -= paddingY;

        var controlsHeight = this._ui._controlsContainer.offsetHeight;
        size.y -= controlsHeight;

        return size;
      }
    },
    _updateStackDirtyStates: {

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
    },
    zoomToFit: {

      /**
       * Zooms the canvas so that it fits the container
       * @param {Boolean} render
       */

      value: function zoomToFit() {
        var render = arguments[0] === undefined ? true : arguments[0];

        var initialZoomLevel = this._getInitialZoomLevel();
        return this.setZoomLevel(initialZoomLevel, render);
      }
    },
    reset: {

      /**
       * Resets the renderer
       */

      value: function reset() {
        this._renderer.reset(true);
        this._kit.operationsStack = [];
        this._isFirstRender = true;
      }
    },
    sanitizedStack: {

      /**
       * Returns the operations stack without falsy values
       * @type {Array.<Operation>}
       */

      get: function () {
        var sanitizedStack = [];
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this._kit.operationsStack[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var operation = _step.value;

            if (!operation) continue;
            sanitizedStack.push(operation);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"]) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        return sanitizedStack;
      }
    },
    zoomLevel: {

      /**
       * The current zoom level
       * @type {Number}
       */

      get: function () {
        return this._zoomLevel;
      }
    },
    size: {

      /**
       * The canvas size in pixels
       * @type {Vector2}
       */

      get: function () {
        return this._size;
      }
    }
  });

  return Canvas;
})(EventEmitter);

module.exports = Canvas;

},{"../../../lib/event-emitter":14,"../../../lib/math/vector2":18,"../../../renderers/canvas-renderer":77,"../../../renderers/webgl-renderer":79}],96:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var EventEmitter = _interopRequire(require("../../../lib/event-emitter"));

var Utils = _interopRequire(require("../../../lib/utils"));

var Color = _interopRequire(require("../../../lib/color"));

var Vector2 = _interopRequire(require("../../../lib/math/vector2"));



var ColorPicker = (function (_EventEmitter) {
  function ColorPicker(ui, element) {
    _classCallCheck(this, ColorPicker);

    _get(Object.getPrototypeOf(ColorPicker.prototype), "constructor", this).call(this);

    this._ui = ui;
    this._element = element;
    this._visible = false;
    this._loaded = false;

    this._overlay = this._element.querySelector(".imglykit-color-picker-overlay");
    this._currentColorCanvas = this._element.querySelector(".imglykit-color-picker-color");

    this._alphaCanvas = this._element.querySelector("canvas.imglykit-color-picker-alpha");
    this._alphaKnob = this._element.querySelector(".imglykit-color-picker-alpha-container .imglykit-transparent-knob");

    this._hueCanvas = this._element.querySelector("canvas.imglykit-color-picker-hue");
    this._hueKnob = this._element.querySelector(".imglykit-color-picker-hue-container .imglykit-transparent-knob");

    this._saturationCanvas = this._element.querySelector("canvas.imglykit-color-picker-saturation");
    this._saturationKnob = this._element.querySelector(".imglykit-color-picker-saturation-container .imglykit-transparent-knob");

    this._transparencyImage = new Image();
    this._transparencyImage.src = ui.helpers.assetPath("ui/night/transparency.png");
    this._transparencyImage.addEventListener("load", this._onTransparencyImageLoad.bind(this));

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

  _createClass(ColorPicker, {
    _onTransparencyImageLoad: {
      value: function _onTransparencyImageLoad() {
        this._loaded = true;
        this._render();
      }
    },
    _handleToggle: {

      /**
       * Handles the toggling of the overlay
       * @private
       */

      value: function _handleToggle() {
        this._element.addEventListener("click", this._onElementClick);
      }
    },
    _onElementClick: {

      /**
       * Gets called when the element has been clicked
       * @param {Event} e
       * @private
       */

      value: function _onElementClick(e) {
        if (e.target === this._element || e.target === this._currentColorCanvas) {
          if (this._visible) {
            this.hide();
            this.emit("hide");
          } else {
            this.show();
            this.emit("show");
          }
        }
      }
    },
    hide: {

      /**
       * Hides the color picker
       */

      value: function hide() {
        this._overlay.classList.remove("imglykit-visible");
        this._visible = false;
      }
    },
    show: {

      /**
       * Shows the color picker
       */

      value: function show() {
        this._overlay.classList.add("imglykit-visible");
        this._visible = true;
      }
    },
    setValue: {

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
    },
    _positionKnobs: {

      /**
       * Updates the knob positions to represent the current HSV color
       * @private
       */

      value: function _positionKnobs() {
        this._positionAlphaKnob();
        this._positionHueKnob();
        this._positionSaturationKnob();
      }
    },
    _positionAlphaKnob: {

      /**
       * Positions the alpha knob according to the current alpha value
       * @private
       */

      value: function _positionAlphaKnob() {
        var canvas = this._alphaCanvas;
        var canvasSize = new Vector2(canvas.width, canvas.height);

        var left = this._value.a * canvasSize.x;
        this._alphaKnob.style.left = "" + left + "px";
      }
    },
    _positionHueKnob: {

      /**
       * Positions the hue knob according to the current hue value
       * @private
       */

      value: function _positionHueKnob() {
        var canvas = this._hueCanvas;
        var canvasSize = new Vector2(canvas.width, canvas.height);

        var top = this._hsvColor.h * canvasSize.y;
        this._hueKnob.style.top = "" + top + "px";
      }
    },
    _positionSaturationKnob: {

      /**
       * Positions the saturation knob according to the current saturation value
       * @private
       */

      value: function _positionSaturationKnob() {
        var canvas = this._saturationCanvas;
        var canvasSize = new Vector2(canvas.width, canvas.height);

        var left = this._hsvColor.s * canvasSize.x;
        this._saturationKnob.style.left = "" + left + "px";
        var top = (1 - this._hsvColor.v) * canvasSize.y;
        this._saturationKnob.style.top = "" + top + "px";
      }
    },
    _render: {

      /**
       * Updates and renders all controls to represent the current value
       * @private
       */

      value: function _render() {
        if (!this._loaded) {
          return;
        }this._renderCurrentColor();
        this._renderAlpha();
        this._renderHue();
        this._renderSaturation();
      }
    },
    _renderCurrentColor: {

      /**
       * Renders the currently selected color on the controls canvas
       * @private
       */

      value: function _renderCurrentColor() {
        var canvas = this._currentColorCanvas;
        var context = canvas.getContext("2d");

        var pattern = context.createPattern(this._transparencyImage, "repeat");
        context.rect(0, 0, canvas.width, canvas.height);
        context.fillStyle = pattern;
        context.fill();

        context.fillStyle = this._value.toRGBA();
        context.fill();
      }
    },
    _renderAlpha: {

      /**
       * Renders the transparency canvas with the current color
       * @private
       */

      value: function _renderAlpha() {
        var canvas = this._alphaCanvas;
        var context = canvas.getContext("2d");

        var pattern = context.createPattern(this._transparencyImage, "repeat");
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
    },
    _renderHue: {

      /**
       * Renders the hue canvas
       * @private
       */

      value: function _renderHue() {
        var canvas = this._hueCanvas;
        var context = canvas.getContext("2d");

        var color = new Color();
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
    },
    _renderSaturation: {

      /**
       * Renders the saturation canvas
       * @private
       */

      value: function _renderSaturation() {
        var canvas = this._saturationCanvas;
        var context = canvas.getContext("2d");

        var imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        var color = new Color(1, 0, 0, 1);
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
    },
    _handleAlphaKnob: {

      /**
       * Handles the dragging of the alpha knob
       * @private
       */

      value: function _handleAlphaKnob() {
        this._alphaCanvas.addEventListener("mousedown", this._onAlphaCanvasDown);
        this._alphaCanvas.addEventListener("touchstart", this._onAlphaCanvasDown);
      }
    },
    _onAlphaCanvasDown: {

      /**
       * Gets called when the user clicks the alpha knob
       * @param {Event} e
       * @private
       */

      value: function _onAlphaCanvasDown(e) {
        e.preventDefault();

        this._onAlphaCanvasDrag(e);

        document.addEventListener("mousemove", this._onAlphaCanvasDrag);
        document.addEventListener("touchmove", this._onAlphaCanvasDrag);

        document.addEventListener("mouseup", this._onAlphaCanvasUp);
        document.addEventListener("touchend", this._onAlphaCanvasUp);
      }
    },
    _onAlphaCanvasDrag: {

      /**
       * Gets called when the user drags the alpha knob
       * @param {Event} e
       * @private
       */

      value: function _onAlphaCanvasDrag(e) {
        e.preventDefault();

        // Calculate relative mouse position on canvas
        var canvas = this._alphaCanvas;
        var canvasSize = new Vector2(canvas.width, canvas.height);
        var mousePosition = Utils.getEventPosition(e);

        var _canvas$getBoundingClientRect = canvas.getBoundingClientRect();

        var left = _canvas$getBoundingClientRect.left;
        var top = _canvas$getBoundingClientRect.top;

        var offset = new Vector2(left, top);
        var relativePosition = mousePosition.subtract(offset);
        relativePosition.clamp(new Vector2(0, 0), canvasSize);

        // Update knob css positioning
        this._alphaKnob.style.left = "" + relativePosition.x + "px";

        // Update alpha value
        this._value.a = relativePosition.x / canvasSize.x;
        this._updateColor();
      }
    },
    _onAlphaCanvasUp: {

      /**
       * Gets called when the user stops dragging the alpha knob
       * @param {Event} e
       * @private
       */

      value: function _onAlphaCanvasUp() {
        document.removeEventListener("mousemove", this._onAlphaCanvasDrag);
        document.removeEventListener("touchmove", this._onAlphaCanvasDrag);

        document.removeEventListener("mouseup", this._onAlphaCanvasUp);
        document.removeEventListener("touchend", this._onAlphaCanvasUp);
      }
    },
    _handleHueKnob: {

      /**
       * Handles the dragging of the hue knob
       * @private
       */

      value: function _handleHueKnob() {
        this._hueCanvas.addEventListener("mousedown", this._onHueCanvasDown);
        this._hueCanvas.addEventListener("touchstart", this._onHueCanvasDown);
      }
    },
    _onHueCanvasDown: {

      /**
       * Gets called when the user clicks the canvas knob
       * @param {Event} e
       * @private
       */

      value: function _onHueCanvasDown(e) {
        e.preventDefault();

        this._onHueCanvasDrag(e);

        document.addEventListener("mousemove", this._onHueCanvasDrag);
        document.addEventListener("touchmove", this._onHueCanvasDrag);

        document.addEventListener("mouseup", this._onHueCanvasUp);
        document.addEventListener("touchend", this._onHueCanvasUp);
      }
    },
    _onHueCanvasDrag: {

      /**
       * Gets called when the user drags the hue knob
       * @param {Event} e
       * @private
       */

      value: function _onHueCanvasDrag(e) {
        e.preventDefault();

        var canvas = this._hueCanvas;
        var canvasSize = new Vector2(canvas.width, canvas.height);

        // Calculate relative mouse position on canvas
        var mousePosition = Utils.getEventPosition(e);

        var _canvas$getBoundingClientRect = canvas.getBoundingClientRect();

        var left = _canvas$getBoundingClientRect.left;
        var top = _canvas$getBoundingClientRect.top;

        var offset = new Vector2(left, top);
        var relativePosition = mousePosition.subtract(offset);
        relativePosition.clamp(new Vector2(0, 0), canvasSize);

        // Update saturaiton knob css positioning
        this._hueKnob.style.top = "" + relativePosition.y + "px";

        // Update saturation and value
        relativePosition.divide(canvasSize);
        this._hsvColor.h = relativePosition.y;
        this._updateColor();
      }
    },
    _onHueCanvasUp: {

      /**
       * Gets called when the user stops dragging the alpha knob
       * @param {Event} e
       * @private
       */

      value: function _onHueCanvasUp() {
        document.removeEventListener("mousemove", this._onHueCanvasDrag);
        document.removeEventListener("touchmove", this._onHueCanvasDrag);

        document.removeEventListener("mouseup", this._onHueCanvasUp);
        document.removeEventListener("touchend", this._onHueCanvasUp);
      }
    },
    _handleSaturationKnob: {

      /**
       * Handles the dragging of the saturation knob
       * @private
       */

      value: function _handleSaturationKnob() {
        this._saturationCanvas.addEventListener("mousedown", this._onSaturationCanvasDown);
        this._saturationCanvas.addEventListener("touchstart", this._onSaturationCanvasDown);
      }
    },
    _onSaturationCanvasDown: {

      /**
       * Gets called when the user clicks the saturation canvas
       * @param {Event} e
       * @private
       */

      value: function _onSaturationCanvasDown(e) {
        e.preventDefault();

        this._onSaturationCanvasDrag(e);

        document.addEventListener("mousemove", this._onSaturationCanvasDrag);
        document.addEventListener("touchmove", this._onSaturationCanvasDrag);

        document.addEventListener("mouseup", this._onSaturationCanvasUp);
        document.addEventListener("touchend", this._onSaturationCanvasUp);
      }
    },
    _onSaturationCanvasDrag: {

      /**
       * Gets called when the user drags the saturation knob
       * @param {Event} e
       * @private
       */

      value: function _onSaturationCanvasDrag(e) {
        e.preventDefault();

        var canvas = this._saturationCanvas;
        var canvasSize = new Vector2(canvas.width, canvas.height);

        // Calculate relative mouse position on canvas
        var mousePosition = Utils.getEventPosition(e);

        var _canvas$getBoundingClientRect = canvas.getBoundingClientRect();

        var left = _canvas$getBoundingClientRect.left;
        var top = _canvas$getBoundingClientRect.top;

        var offset = new Vector2(left, top);
        var relativePosition = mousePosition.subtract(offset);
        relativePosition.clamp(0, canvas.width);

        // Update saturaiton knob css positioning
        this._saturationKnob.style.left = "" + relativePosition.x + "px";
        this._saturationKnob.style.top = "" + relativePosition.y + "px";

        // Update saturation and value
        relativePosition.divide(canvasSize);
        this._hsvColor.s = relativePosition.x;
        this._hsvColor.v = 1 - relativePosition.y;
        this._updateColor();
      }
    },
    _onSaturationCanvasUp: {

      /**
       * Gets called when the user stops dragging the saturation knob
       * @param {Event} e
       * @private
       */

      value: function _onSaturationCanvasUp() {
        document.removeEventListener("mousemove", this._onSaturationCanvasDrag);
        document.removeEventListener("touchmove", this._onSaturationCanvasDrag);

        document.removeEventListener("mouseup", this._onSaturationCanvasUp);
        document.removeEventListener("touchend", this._onSaturationCanvasUp);
      }
    },
    _updateColor: {

      /**
       * Updates the attached color, emits the `update` event and triggers
       * a render
       * @private
       */

      value: function _updateColor() {
        this._value.fromHSV(this._hsvColor.h, this._hsvColor.s, this._hsvColor.v);
        this.emit("update", this._value);
        this._render();
      }
    }
  }, {
    template: {

      /**
       * The partial template string
       * @type {String}
       */

      get: function () {
        return "{{##def.colorpicker:\n  <div class=\"imglykit-color-picker\" id=\"{{=(typeof colorpickerId === \"undefined\"?'':colorpickerId)}}\">\n    <canvas class=\"imglykit-color-picker-color\" width=\"34\" height=\"34\"></canvas>\n    <div class=\"imglykit-controls-item-label\">{{=(typeof colorpickerLabel === \"undefined\"?'':colorpickerLabel)}}</div>\n\n    <div class=\"imglykit-color-picker-overlay\">\n      <div class=\"imglykit-color-picker-alpha-container\">\n        <canvas class=\"imglykit-color-picker-alpha\" width=\"200\" height=\"30\"></canvas>\n        <div class=\"imglykit-transparent-knob\"></div>\n      </div>\n\n      <div class=\"imglykit-color-picker-saturation-container\">\n        <canvas class=\"imglykit-color-picker-saturation\" width=\"160\" height=\"160\"></canvas>\n        <div class=\"imglykit-transparent-knob\"></div>\n      </div>\n\n      <div class=\"imglykit-color-picker-hue-container\">\n        <canvas class=\"imglykit-color-picker-hue\" width=\"30\" height=\"160\"></canvas>\n        <div class=\"imglykit-transparent-knob\"></div>\n      </div>\n    </div>\n  </div>\n#}}\n";
      }
    }
  });

  return ColorPicker;
})(EventEmitter);

module.exports = ColorPicker;

},{"../../../lib/color":13,"../../../lib/event-emitter":14,"../../../lib/math/vector2":18,"../../../lib/utils":20}],97:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var EventEmitter = _interopRequire(require("../../../lib/event-emitter"));

var FileLoader = (function (_EventEmitter) {
  function FileLoader(kit, ui) {
    _classCallCheck(this, FileLoader);

    _get(Object.getPrototypeOf(FileLoader.prototype), "constructor", this).call(this);

    this._kit = kit;
    this._ui = ui;

    // http://stackoverflow.com/questions/7110353/html5-dragleave-fired-when-hovering-a-child-element
    this._dragCounter = 0;

    this._container = this._ui.container.querySelector(".imglykit-drop-area-container");

    this._onDropAreaDragEnter = this._onDropAreaDragEnter.bind(this);
    this._onDropAreaDragOver = this._onDropAreaDragOver.bind(this);
    this._onDropAreaDragLeave = this._onDropAreaDragLeave.bind(this);
    this._onDropAreaDrop = this._onDropAreaDrop.bind(this);
    this._onDropAreaClick = this._onDropAreaClick.bind(this);
    this._onFileInputChange = this._onFileInputChange.bind(this);

    this._hiddenInputField = this._ui.container.querySelector(".imglykit-drop-area .imglykit-drop-area-hidden-input");
    this._hiddenInputField.addEventListener("change", this._onFileInputChange);

    this._handleDropArea();
  }

  _inherits(FileLoader, _EventEmitter);

  _createClass(FileLoader, {
    openFileDialog: {

      /**
       * Opens the file dialog
       */

      value: function openFileDialog() {
        this._hiddenInputField.click();
      }
    },
    _handleDropArea: {

      /**
       * Finds the drop area, adds event listeners
       * @private
       */

      value: function _handleDropArea() {
        var container = this._ui.container;

        this._dropArea = container.querySelector(".imglykit-drop-area");
        this._dropArea.addEventListener("dragenter", this._onDropAreaDragEnter);
        this._dropArea.addEventListener("dragover", this._onDropAreaDragOver);
        this._dropArea.addEventListener("dragleave", this._onDropAreaDragLeave);
        this._dropArea.addEventListener("drop", this._onDropAreaDrop);
        this._dropArea.addEventListener("dragdrop", this._onDropAreaDrop);
        this._dropArea.addEventListener("click", this._onDropAreaClick);
      }
    },
    _onDropAreaClick: {

      /**
       * Gets called when the user clicks on the drop area. Opens the file
       * dialog by triggering a click on the hidden input field
       * @param {Event} e
       * @private
       */

      value: function _onDropAreaClick() {
        this.openFileDialog();
      }
    },
    _onDropAreaDragEnter: {

      /**
       * Gets called when the user drags a file over the drop area
       * @param {Event} e
       * @private
       */

      value: function _onDropAreaDragEnter(e) {
        e.preventDefault();

        this._dragCounter++;
        this._dropArea.classList.add("imglykit-drop-area-active");
      }
    },
    _onDropAreaDragOver: {

      /**
       * We need to cancel this event to get a drop event
       * @param {Event} e
       * @private
       */

      value: function _onDropAreaDragOver(e) {
        e.preventDefault();
      }
    },
    _onDropAreaDragLeave: {

      /**
       * Gets called when the user does no longer drag a file over the drop area
       * @param {Event} e
       * @private
       */

      value: function _onDropAreaDragLeave(e) {
        e.preventDefault();

        this._dragCounter--;

        if (this._dragCounter === 0) {
          this._dropArea.classList.remove("imglykit-drop-area-active");
        }
      }
    },
    _onDropAreaDrop: {

      /**
       * Gets called when the user drops a file on the drop area
       * @param {Event} e
       * @private
       */

      value: function _onDropAreaDrop(e) {
        e.stopPropagation();
        e.preventDefault();
        e.returnValue = false;

        this._dropArea.classList.remove("imglykit-drop-area-active");

        if (!e.dataTransfer) {
          return;
        }this._handleFile(e.dataTransfer.files[0]);
      }
    },
    _onFileInputChange: {

      /**
       * Gets called when the user selected a file
       * @param {Event} e
       * @private
       */

      value: function _onFileInputChange() {
        this._handleFile(this._hiddenInputField.files[0]);
      }
    },
    _handleFile: {

      /**
       * Gets called when the user selected a file. Emits a `file` event.
       * @param {File} file
       * @private
       */

      value: function _handleFile(file) {
        this.emit("file", file);
      }
    },
    removeDOM: {

      /**
       * Removes event listeners and removes the container form the dom
       */

      value: function removeDOM() {
        this._dropArea.removeEventListener("dragenter", this._onDropAreaDragEnter);
        this._dropArea.removeEventListener("dragover", this._onDropAreaDragOver);
        this._dropArea.removeEventListener("dragleave", this._onDropAreaDragLeave);
        this._dropArea.removeEventListener("drop", this._onDropAreaDrop);
        this._dropArea.removeEventListener("dragdrop", this._onDropAreaDrop);
        this._dropArea.removeEventListener("click", this._onDropAreaClick);

        if (this._container.parentNode) {
          this._container.parentNode.removeChild(this._container);
        }
      }
    }
  });

  return FileLoader;
})(EventEmitter);

module.exports = FileLoader;

},{"../../../lib/event-emitter":14}],98:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Utils = _interopRequire(require("../../../lib/utils"));

var Vector2 = _interopRequire(require("../../../lib/math/vector2"));

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

    this._container.addEventListener("mouseenter", this._onContainerEnter);
    this._container.addEventListener("mouseleave", this._onContainerLeave);
    this._container.addEventListener("mousemove", this._onContainerEnter);
    this._dom.button.addEventListener("mousedown", this._onButtonDown);
    this._dom.button.addEventListener("touchstart", this._onButtonDown);
    this._dom.background.addEventListener("click", this._onBackgroundClick);
    this._list.addEventListener("scroll", this._onListScroll.bind(this));

    this._onListScroll();
  }

  _createClass(Scrollbar, {
    _onBackgroundClick: {

      /**
       * Gets called when the user clicks the scrollbar background
       * @param {Event} e
       * @private
       */

      value: function _onBackgroundClick(e) {
        e.preventDefault();
        if (e.target !== this._dom.background) {
          return;
        }var position = Utils.getEventPosition(e);
        var backgroundOffset = this._dom.background.getBoundingClientRect();
        backgroundOffset = new Vector2(backgroundOffset.left, backgroundOffset.top);

        var relativePosition = position.clone().subtract(backgroundOffset);

        relativePosition.x -= this._values.button.width * 0.5;

        this._setButtonPosition(relativePosition.x);
      }
    },
    _onContainerEnter: {

      /**
       * Gets called when the user enters the list with the mouse
       * @private
       */

      value: function _onContainerEnter() {
        this._isHovering = true;
        this.show();
      }
    },
    _onContainerLeave: {

      /**
       * Gets called when the user leaves the list with the mouse
       * @private
       */

      value: function _onContainerLeave() {
        this._isHovering = false;
        this.hide();
      }
    },
    show: {

      /**
       * Shows the scrollbar
       */

      value: function show() {
        if (!this._isScrollingNecessary) {
          return;
        }this._dom.background.classList.add("visible");
      }
    },
    hide: {

      /**
       * Hides the scrollbar
       */

      value: function hide() {
        if (this._isDragging) {
          return;
        }this._dom.background.classList.remove("visible");
      }
    },
    _updateValues: {

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
    },
    _onButtonDown: {

      /**
       * Gets called when the user starts dragging the button
       * @param {Event} event
       * @private
       */

      value: function _onButtonDown(event) {
        event.preventDefault();

        this._isDragging = true;

        this._initialMousePosition = Utils.getEventPosition(event);
        this._initialButtonPosition = this._buttonPosition || 0;

        document.addEventListener("mousemove", this._onButtonMove);
        document.addEventListener("touchmove", this._onButtonMove);
        document.addEventListener("mouseup", this._onButtonUp);
        document.addEventListener("touchend", this._onButtonUp);
      }
    },
    _onButtonMove: {

      /**
       * Gets called when the user drags the button
       * @param {Event} event
       * @private
       */

      value: function _onButtonMove(event) {
        event.preventDefault();

        var mousePosition = Utils.getEventPosition(event);
        var diff = mousePosition.clone().subtract(this._initialMousePosition);
        var newButtonPosition = this._initialButtonPosition + diff.x;

        this._setButtonPosition(newButtonPosition);
      }
    },
    _setButtonPosition: {

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
        this._dom.button.style.left = "" + this._buttonPosition + "px";

        // Update list scroll position
        var progress = newButtonPosition / this._values.button.scrollableWidth;
        var scrollPosition = this._values.list.scrollableWidth * progress;
        this._list.scrollLeft = scrollPosition;
      }
    },
    _onButtonUp: {

      /**
       * Gets called when the user releases the button
       * @private
       */

      value: function _onButtonUp() {
        this._isDragging = false;

        document.removeEventListener("mousemove", this._onButtonMove);
        document.removeEventListener("touchmove", this._onButtonMove);
        document.removeEventListener("mouseup", this._onButtonUp);
        document.removeEventListener("touchend", this._onButtonUp);
      }
    },
    _onListScroll: {

      /**
       * Gets called when the user scrolls the list
       * @private
       */

      value: function _onListScroll() {
        if (this._isDragging) {
          return;
        }var listScrollWidth = this._list.scrollWidth - this._list.offsetWidth;
        var listScrollPosition = this._list.scrollLeft;

        var backgroundScrollWidth = this._dom.background.offsetWidth - this._dom.button.offsetWidth;
        var progress = listScrollPosition / listScrollWidth;

        this._buttonPosition = backgroundScrollWidth * progress;
        this._dom.button.style.left = "" + this._buttonPosition + "px";
      }
    },
    _resizeButton: {

      /**
       * Resizes the button to represent the visible size of the container
       * @private
       */

      value: function _resizeButton() {
        var listScrollWidth = this._list.scrollWidth;
        var listWidth = this._list.offsetWidth;

        this._buttonWidth = listWidth / listScrollWidth * listWidth;
        this._dom.button.style.width = "" + this._buttonWidth + "px";
      }
    },
    _appendDOM: {

      /**
       * Appends the DOM elements to the container
       * @private
       */

      value: function _appendDOM() {
        var background = document.createElement("div");
        background.classList.add("imglykit-scrollbar-background");
        background.style.bottom = "" + maxScrollbarWidth + "px";

        var button = document.createElement("div");
        button.classList.add("imglykit-scrollbar-button");

        background.appendChild(button);
        this._container.appendChild(background);

        // Container should have position: relative
        this._container.style.position = "relative";

        // Find the list
        this._list = this._container.querySelector(".imglykit-controls-list");
        this._dom = { background: background, button: button };

        // Resize the list and the container
        this._list.style.height = "";
        var listHeight = this._list.offsetHeight;
        listHeight += maxScrollbarWidth;
        this._container.style.height = "" + listHeight + "px";
        this._list.style.height = "" + listHeight + "px";
      }
    },
    remove: {

      /**
       * Removes the DOM elements and event listeners
       */

      value: function remove() {
        this._dom.button.removeEventListener("mousedown", this._onButtonDown);
        this._dom.button.removeEventListener("touchstart", this._onButtonDown);

        this._dom.background.remove();
      }
    },
    _isScrollingNecessary: {

      /**
       * Checks whether scrolling is necessary
       * @returns {Boolean}
       * @private
       */

      get: function () {
        return this._list.scrollWidth > this._list.offsetWidth;
      }
    }
  });

  return Scrollbar;
})();

module.exports = Scrollbar;

},{"../../../lib/math/vector2":18,"../../../lib/utils":20}],99:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Slider = _interopRequire(require("./slider"));



var SimpleSlider = (function (_Slider) {
  function SimpleSlider() {
    _classCallCheck(this, SimpleSlider);

    if (_Slider != null) {
      _Slider.apply(this, arguments);
    }
  }

  _inherits(SimpleSlider, _Slider);

  _createClass(SimpleSlider, {
    _setX: {

      /**
       * Sets the slider position to the given X value and resizes
       * the fill div
       * @private
       */

      value: function _setX(x) {
        this._xPosition = x;

        this._dotElement.style.left = "" + x + "px";
        this._fillElement.style.width = "" + x + "px";
      }
    }
  }, {
    template: {
      /**
       * The partial template string
       * @type {String}
       */

      get: function () {
        return "{{##def.simpleSlider:\n  <div class=\"imglykit-slider\" id=\"{{=(typeof sliderId === \"undefined\"?'':sliderId)}}\">\n    <div class=\"imglykit-slider-minus\">\n      <img src=\"{{=it.helpers.assetPath('ui/night/slider/minus.png') }}\" />\n    </div>\n    <div class=\"imglykit-slider-slider\">\n      <div class=\"imglykit-slider-background\"></div>\n      <div class=\"imglykit-slider-fill\"></div>\n      <div class=\"imglykit-slider-dot\"></div>\n    </div>\n    <div class=\"imglykit-slider-plus\">\n      <img src=\"{{=it.helpers.assetPath('ui/night/slider/plus.png') }}\" />\n    </div>\n  </div>\n#}}\n";
      }
    }
  });

  return SimpleSlider;
})(Slider);

module.exports = SimpleSlider;

},{"./slider":100}],100:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var EventEmitter = _interopRequire(require("../../../lib/event-emitter"));

var Utils = _interopRequire(require("../../../lib/utils"));

var Vector2 = _interopRequire(require("../../../lib/math/vector2"));

var _ = _interopRequire(require("lodash"));



var Slider = (function (_EventEmitter) {
  function Slider(element, options) {
    _classCallCheck(this, Slider);

    _get(Object.getPrototypeOf(Slider.prototype), "constructor", this).call(this);

    this._element = element;
    this._options = _.defaults(options, {
      minValue: 0,
      maxValue: 1,
      defaultValue: 0
    });

    this._value = this._options.defaultValue;

    this._sliderElement = this._element.querySelector(".imglykit-slider-slider");
    this._dotElement = this._element.querySelector(".imglykit-slider-dot");
    this._centerDotElement = this._element.querySelector(".imglykit-slider-center-dot");
    this._fillElement = this._element.querySelector(".imglykit-slider-fill");
    this._backgroundElement = this._element.querySelector(".imglykit-slider-background");

    // Mouse event callbacks bound to class context
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onCenterDotClick = this._onCenterDotClick.bind(this);
    this._onBackgroundClick = this._onBackgroundClick.bind(this);

    this._backgroundElement.addEventListener("click", this._onBackgroundClick);
    this._fillElement.addEventListener("click", this._onBackgroundClick);

    this._handleDot();
  }

  _inherits(Slider, _EventEmitter);

  _createClass(Slider, {
    setValue: {

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
    },
    _setX: {

      /**
       * Sets the slider position to the given X value and resizes
       * the fill div
       * @private
       */

      value: function _setX(x) {
        this._xPosition = x;
        this._dotElement.style.left = "" + x + "px";

        // X position relative to center to simplify calculations
        var halfSliderWidth = this._sliderElement.offsetWidth / 2;
        var relativeX = x - halfSliderWidth;

        // Update style
        this._fillElement.style.width = "" + Math.abs(relativeX) + "px";
        if (relativeX < 0) {
          this._fillElement.style.left = halfSliderWidth - Math.abs(relativeX) + "px";
        } else {
          this._fillElement.style.left = halfSliderWidth + "px";
        }
      }
    },
    _handleDot: {

      /**
       * Handles the dot dragging
       * @private
       */

      value: function _handleDot() {
        this._dotElement.addEventListener("mousedown", this._onMouseDown);
        this._dotElement.addEventListener("touchstart", this._onMouseDown);

        if (this._centerDotElement) {
          this._centerDotElement.addEventListener("click", this._onCenterDotClick);
        }
      }
    },
    _onCenterDotClick: {

      /**
       * Gets called when the user clicks the center button. Resets to default
       * settings.
       * @private
       */

      value: function _onCenterDotClick() {
        this.setValue(this._options.defaultValue);
        this.emit("update", this._value);
      }
    },
    _onBackgroundClick: {

      /**
       * Gets called when the user clicks on the slider background
       * @param {Event} e
       * @private
       */

      value: function _onBackgroundClick(e) {
        var position = Utils.getEventPosition(e);
        var sliderOffset = this._sliderElement.getBoundingClientRect();
        sliderOffset = new Vector2(sliderOffset.left, sliderOffset.y);

        var relativePosition = position.clone().subtract(sliderOffset);

        this._setX(relativePosition.x);
        this._updateValue();
      }
    },
    _onMouseDown: {

      /**
       * Gets called when the user presses a mouse button on the slider dot
       * @private
       */

      value: function _onMouseDown(e) {
        if (e.type === "mousedown" && e.button !== 0) {
          return;
        }e.preventDefault();

        var mousePosition = Utils.getEventPosition(e);

        document.addEventListener("mousemove", this._onMouseMove);
        document.addEventListener("touchmove", this._onMouseMove);

        document.addEventListener("mouseup", this._onMouseUp);
        document.addEventListener("touchend", this._onMouseUp);

        // Remember initial position
        var dotPosition = this._dotElement.getBoundingClientRect();
        var sliderPosition = this._sliderElement.getBoundingClientRect();

        this._initialSliderX = dotPosition.left - sliderPosition.left;
        this._initialMousePosition = mousePosition;
      }
    },
    _onMouseMove: {

      /**
       * Gets called when the user drags the mouse
       * @private
       */

      value: function _onMouseMove(e) {
        e.preventDefault();

        var mousePosition = Utils.getEventPosition(e);
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
    },
    _updateValue: {

      /**
       * Updates the value using the slider position
       * @private
       */

      value: function _updateValue() {
        var sliderWidth = this._sliderElement.offsetWidth;

        // Calculate the new value
        var _options = this._options;
        var minValue = _options.minValue;
        var maxValue = _options.maxValue;

        var percentage = this._xPosition / sliderWidth;
        var value = minValue + (maxValue - minValue) * percentage;
        this.emit("update", value);
      }
    },
    _onMouseUp: {

      /**
       * Gets called when the user does not press the mouse button anymore
       * @private
       */

      value: function _onMouseUp() {
        document.removeEventListener("mousemove", this._onMouseMove);
        document.removeEventListener("touchmove", this._onMouseMove);

        document.removeEventListener("mouseup", this._onMouseUp);
        document.removeEventListener("touchend", this._onMouseUp);
      }
    }
  }, {
    template: {

      /**
       * The partial template string
       * @type {String}
       */

      get: function () {
        return "{{##def.slider:\n  <div class=\"imglykit-slider\" id=\"{{=(typeof sliderId === \"undefined\"?'':sliderId)}}\">\n    <div class=\"imglykit-slider-minus\">\n      <img src=\"{{=it.helpers.assetPath('ui/night/slider/minus.png') }}\" />\n    </div>\n    <div class=\"imglykit-slider-slider\">\n      <div class=\"imglykit-slider-background\"></div>\n      <div class=\"imglykit-slider-fill\"></div>\n      <div class=\"imglykit-slider-center-dot\"></div>\n      <div class=\"imglykit-slider-dot\"></div>\n    </div>\n    <div class=\"imglykit-slider-plus\">\n      <img src=\"{{=it.helpers.assetPath('ui/night/slider/plus.png') }}\" />\n    </div>\n  </div>\n#}}\n";
      }
    }
  });

  return Slider;
})(EventEmitter);

module.exports = Slider;

},{"../../../lib/event-emitter":14,"../../../lib/math/vector2":18,"../../../lib/utils":20,"lodash":"lodash"}],101:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var EventEmitter = _interopRequire(require("../../../lib/event-emitter"));

var TopControls = (function (_EventEmitter) {
  function TopControls(kit, ui) {
    _classCallCheck(this, TopControls);

    _get(Object.getPrototypeOf(TopControls.prototype), "constructor", this).call(this);

    this._kit = kit;
    this._ui = ui;
    this.init();
  }

  _inherits(TopControls, _EventEmitter);

  _createClass(TopControls, {
    init: {

      /**
       * Initializes the controls
       */

      value: function init() {
        this._canvas = this._ui.canvas;
      }
    },
    run: {

      /**
       * Initializes the controls
       */

      value: function run() {
        var container = this._ui.container;

        this._rightControls = container.querySelector(".imglykit-top-controls-right");
        this._leftControls = container.querySelector(".imglykit-top-controls-left");

        this._undoButton = container.querySelector(".imglykit-undo");
        this._zoomIn = container.querySelector(".imglykit-zoom-in");
        this._zoomOut = container.querySelector(".imglykit-zoom-out");
        this._zoomLevel = container.querySelector(".imglykit-zoom-level-num");
        this._newButton = container.querySelector(".imglykit-new");
        this._handleZoom();
        this._handleUndo();
        this._handleNew();
      }
    },
    _handleZoom: {

      /**
       * Handles the zoom controls
       * @private
       */

      value: function _handleZoom() {
        this._zoomIn.addEventListener("click", this._onZoomInClick.bind(this));
        this._zoomOut.addEventListener("click", this._onZoomOutClick.bind(this));
      }
    },
    _handleUndo: {

      /**
       * Handles the undo control
       * @private
       */

      value: function _handleUndo() {
        this._undoButton.addEventListener("click", this._undo.bind(this));
        this._undo();
      }
    },
    _handleNew: {

      /**
       * Handles the new button
       * @private
       */

      value: function _handleNew() {
        if (!this._newButton) {
          return;
        }this._newButton.addEventListener("click", this._onNewClick.bind(this));
      }
    },
    _onNewClick: {

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
    },
    _undo: {

      /**
       * Gets called when the user clicks the undo button
       * @private
       */

      value: function _undo() {
        this.emit("undo");
      }
    },
    updateUndoButton: {

      /**
       * Updates the undo button active state
       */

      value: function updateUndoButton() {
        var history = this._ui.history;

        if (history.length === 0) {
          this._undoButton.style.display = "none";
        } else {
          this._undoButton.style.display = "inline-block";
        }
      }
    },
    _onZoomInClick: {

      /**
       * Gets called when the user clicked the zoom in button
       * @param {Event}
       * @private
       */

      value: function _onZoomInClick(e) {
        e.preventDefault();

        this.emit("zoom-in");
        this.updateZoomLevel();
      }
    },
    _onZoomOutClick: {

      /**
       * Gets called when the user clicked the zoom out button
       * @param {Event}
       * @private
       */

      value: function _onZoomOutClick(e) {
        e.preventDefault();

        this.emit("zoom-out");
        this.updateZoomLevel();
      }
    },
    showZoom: {

      /**
       * Shows the zoom control
       */

      value: function showZoom() {
        this._rightControls.style.display = "inline-block";
      }
    },
    hideZoom: {

      /**
       * Hides the zoom control
       */

      value: function hideZoom() {
        this._rightControls.style.display = "none";
      }
    },
    updateZoomLevel: {

      /**
       * Updates the zoom level display
       */

      value: function updateZoomLevel() {
        var zoomLevel = this._canvas.zoomLevel;

        this._zoomLevel.innerHTML = Math.round(zoomLevel * 100);
      }
    }
  });

  return TopControls;
})(EventEmitter);

module.exports = TopControls;

},{"../../../lib/event-emitter":14}],102:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */



var _ = _interopRequire(require("lodash"));

var UI = _interopRequire(require("../base/ui"));

var Canvas = _interopRequire(require("./lib/canvas"));

var FileLoader = _interopRequire(require("./lib/file-loader"));

var TopControls = _interopRequire(require("./lib/top-controls"));

var Scrollbar = _interopRequire(require("./lib/scrollbar"));

var NightUI = (function (_UI) {
  function NightUI() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, NightUI);

    this._operationsMap = {};
    this._template = "<div class=\"imglykit-container\">\n  {{? !it.options.ui.hideHeader }}\n  <div class=\"imglykit-header\">\n    img.ly Photo Editor SDK\n\n    {{? it.options.ui.showCloseButton }}\n    <div class=\"imglykit-close-button\">\n      <img src=\"{{=it.helpers.assetPath('ui/night/close.png')}}\" />\n    </div>\n    {{?}}\n  </div>\n  {{?}}\n  <div class=\"imglykit-top-controls{{? !it.options.ui.hideHeader }} imglykit-header-padding{{?}}\">\n    <div class=\"imglykit-top-controls-left\">\n      {{? it.options.ui.showNewButton }}\n      <div class=\"imglykit-new\">\n        <img src=\"{{=it.helpers.assetPath('ui/night/top/new.png')}}\" />\n        New\n      </div>\n      {{?}}\n      <div class=\"imglykit-undo\">\n        <img src=\"{{=it.helpers.assetPath('ui/night/top/undo.png')}}\" />\n        Undo\n      </div>\n    </div>\n    <div class=\"imglykit-top-controls-right\">\n      <div class=\"imglykit-zoom-fit\"></div>\n      <div class=\"imglykit-zoom-level\">Zoom: <span class=\"imglykit-zoom-level-num\">100</span>%</div>\n      <div class=\"imglykit-zoom-in\">\n        <img src=\"{{=it.helpers.assetPath('ui/night/top/zoom-in.png')}}\" />\n      </div>\n      <div class=\"imglykit-zoom-out\">\n        <img src=\"{{=it.helpers.assetPath('ui/night/top/zoom-out.png')}}\" />\n      </div>\n    </div>\n  </div>\n\n  <div class=\"imglykit-canvas-container{{? !it.options.ui.hideHeader }} imglykit-header-padding{{?}}\">\n    <div class=\"imglykit-canvas-inner-container\">\n      <canvas class=\"imglykit-canvas-draggable\"></canvas>\n      <div class=\"imglykit-canvas-controls imglykit-canvas-controls-disabled\"></div>\n    </div>\n    {{? it.renderDropArea }}\n    <div class=\"imglykit-drop-area-container{{? !it.options.ui.hideHeader }} imglykit-header-padding{{?}}\">\n      <div class=\"imglykit-drop-area\">\n        <input type=\"file\" class=\"imglykit-drop-area-hidden-input\" />\n        <img src=\"{{=it.helpers.assetPath('ui/night/upload.png')}}\" />\n\n        <div class=\"imglykit-drop-area-content\">\n          <h1>Upload a picture</h1>\n          <span>Click to upload a picture from your library or just drag and drop</span>\n        </div>\n      </div>\n    </div>\n    {{?}}\n  </div>\n\n  <div class=\"imglykit-controls-container\">\n    <div class=\"imglykit-controls\">\n\n      <div>\n        <div class=\"imglykit-controls-overview\">\n          <ul class=\"imglykit-controls-list\">\n          {{ for (var identifier in it.controls) { }}\n            {{ var control = it.controls[identifier]; }}\n            <li data-identifier=\"{{= control.identifier}}\"{{? it.controlsDisabled }} data-disabled{{?}}>\n              <img src=\"{{=it.helpers.assetPath('ui/night/operations/' + control.identifier + '.png') }}\" />\n            </li>\n          {{ } }}\n          </ul>\n        </div>\n      </div>\n\n    </div>\n  </div>\n</div>\n";
    this._registeredControls = {};
    this._history = [];

    // The `Night` UI has a fixed operation order
    this._preferredOperationOrder = [
    // First, all operations that affect the image dimensions
    "rotation", "crop", "flip",

    // Then color operations (first filters, then fine-tuning)
    "filters", "contrast", "brightness", "saturation",

    // Then post-processing
    "radial-blur", "tilt-shift", "frames", "stickers", "text"];

    this._paused = false;

    _get(Object.getPrototypeOf(NightUI.prototype), "constructor", this).apply(this, args);

    this._options.ui = _.defaults(this._options.ui, {
      showNewButton: !this._options.image,
      showHeader: true,
      showCloseButton: false
    });
  }

  _inherits(NightUI, _UI);

  _createClass(NightUI, {
    identifier: {

      /**
       * A unique string that represents this UI
       * @type {String}
       */

      get: function () {
        return "night";
      }
    },
    run: {

      /**
       * Prepares the UI for use
       */

      value: function run() {
        this._registerControls();

        _get(Object.getPrototypeOf(NightUI.prototype), "run", this).call(this);

        var container = this._options.container;

        this._controlsContainer = container.querySelector(".imglykit-controls");
        this._canvasControlsContainer = container.querySelector(".imglykit-canvas-controls");
        this._overviewControlsContainer = container.querySelector(".imglykit-controls-overview");

        this._handleOverview();

        if (this._options.image) {
          this._initCanvas();
        } else {
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
      }
    },
    _initFileLoader: {

      /**
       * Initializes the file loader
       * @private
       */

      value: function _initFileLoader() {
        this._fileLoader = new FileLoader(this._kit, this);
        this._fileLoader.on("file", this._onFileLoaded.bind(this));
      }
    },
    _onFileLoaded: {

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
            image.src = data;

            _this._setImage(image);
          };
        })(file);
        reader.readAsDataURL(file);
      }
    },
    _setImage: {

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
      }
    },
    _initTopControls: {

      /**
       * Initializes the top controls
       * @private
       */

      value: function _initTopControls() {
        var _this = this;

        this._topControls = new TopControls(this._kit, this);
        this._topControls.run();

        this._topControls.on("undo", function () {
          _this.undo();
        });

        // Pass zoom in event
        this._topControls.on("zoom-in", function () {
          _this._canvas.zoomIn().then(function () {
            if (_this._currentControl) {
              _this._currentControl.onZoom();
            }
          });
        });

        // Pass zoom out event
        this._topControls.on("zoom-out", function () {
          _this._canvas.zoomOut().then(function () {
            if (_this._currentControl) {
              _this._currentControl.onZoom();
            }
          });
        });
      }
    },
    _initCanvas: {

      /**
       * Inititializes the canvas
       * @private
       */

      value: function _initCanvas() {
        var _this = this;

        this._canvas = new Canvas(this._kit, this, this._options);
        this._canvas.run();
        this._canvas.on("zoom", function () {
          _this._topControls.updateZoomLevel();
        });
      }
    },
    selectOperations: {

      /**
       * Selects the enabled operations
       * @param {ImglyKit.Selector}
       */

      value: function selectOperations(selector) {
        _get(Object.getPrototypeOf(NightUI.prototype), "selectOperations", this).call(this, selector);
      }
    },
    getOrCreateOperation: {

      /**
       * Returns or creates an instance of the operation with the given identifier
       * @param {String} identifier
       */

      value: function getOrCreateOperation(identifier) {
        var _kit = this._kit;
        var operationsStack = _kit.operationsStack;
        var registeredOperations = _kit.registeredOperations;

        var Operation = registeredOperations[identifier];

        if (typeof this._operationsMap[identifier] === "undefined") {
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
    },
    removeOperation: {

      /**
       * Removes the operation with the given identifier from the stack
       * @param {String} identifier
       */

      value: function removeOperation(identifier) {
        if (!this._operationsMap[identifier]) {
          return;
        }var operation = this._operationsMap[identifier];
        delete this._operationsMap[identifier];

        var index = this._kit.operationsStack.indexOf(operation);
        this._kit.operationsStack.splice(index, 1);
      }
    },
    _registerControls: {

      /**
       * Registers all default operation controls
       * @private
       */

      value: function _registerControls() {
        this.registerControl("filters", "filters", require("./controls/filters"));
        this.registerControl("rotation", "rotation", require("./controls/rotation"));
        this.registerControl("flip", "flip", require("./controls/flip"));
        this.registerControl("brightness", "brightness", require("./controls/brightness"));
        this.registerControl("contrast", "contrast", require("./controls/contrast"));
        this.registerControl("saturation", "saturation", require("./controls/saturation"));
        this.registerControl("crop", "crop", require("./controls/crop"));
        this.registerControl("radial-blur", "radial-blur", require("./controls/radial-blur"));
        this.registerControl("tilt-shift", "tilt-shift", require("./controls/tilt-shift"));
        this.registerControl("frames", "frames", require("./controls/frames"));
        this.registerControl("stickers", "stickers", require("./controls/stickers"));
        this.registerControl("text", "text", require("./controls/text"));
      }
    },
    _handleOverview: {

      /**
       * Handles the overview button click events
       * @private
       */

      value: function _handleOverview() {
        var _this = this;

        var listItems = this._overviewControlsContainer.querySelectorAll(":scope > ul > li");

        // Turn NodeList into an Array
        listItems = Array.prototype.slice.call(listItems);

        // Add click events to all items
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = listItems[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            (function () {
              var listItem = _step.value;
              var identifier = listItem.dataset.identifier;

              listItem.addEventListener("click", function () {
                _this.switchToControl(identifier);
              });
            })();
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"]) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
    },
    _enableControls: {

      /**
       * Enables the overview controls
       * @private
       */

      value: function _enableControls() {
        var listItems = this._overviewControlsContainer.querySelectorAll(":scope > ul > li");

        // Turn NodeList into an Array
        listItems = Array.prototype.slice.call(listItems);

        // Add click events to all items
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = listItems[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var listItem = _step.value;

            listItem.removeAttribute("data-disabled");
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"]) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
    },
    switchToControl: {

      /**
       * Gets called when an overview button has been clicked
       * @private
       */

      value: function switchToControl(identifier) {
        if (this.context.controlsDisabled) {
          return;
        }this._overviewControlsContainer.style.display = "none";

        this._scrollbar.remove();

        if (this._currentControl) {
          this._currentControl.leave();
        }

        this._currentControl = this._registeredControls[identifier];
        this._currentControl.enter();
        this._currentControl.once("back", this._switchToOverview.bind(this));
      }
    },
    _switchToOverview: {

      /**
       * Switches back to the overview controls
       * @private
       */

      value: function _switchToOverview() {
        if (this._currentControl) {
          this._currentControl.leave();
        }

        this._currentControl = null;
        this._overviewControlsContainer.style.display = "";

        this._initScrollbar();
      }
    },
    registerControl: {

      /**
       * Registers the controls for an operation
       * @param {String} identifier
       * @param {String} operationIdentifier
       * @param {Control} ControlClass
       */

      value: function registerControl(identifier, operationIdentifier, ControlClass) {
        if (!this.isOperationSelected(operationIdentifier)) {
          return;
        }var instance = new ControlClass(this._kit, this);
        this._registeredControls[identifier] = instance;
      }
    },
    _initControls: {

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
    },
    _initScrollbar: {

      /**
       * Initializes the custom scrollbar
       * @private
       */

      value: function _initScrollbar() {
        var container = this._controlsContainer.querySelector(".imglykit-controls-list").parentNode;
        this._scrollbar = new Scrollbar(container);
      }
    },
    _handleCloseButton: {

      /**
       * Handles the click event on the close button, emits a `close` event
       * when clicking
       * @private
       */

      value: function _handleCloseButton() {
        var _this = this;

        var closeButton = this._options.container.querySelector(".imglykit-close-button");
        closeButton.addEventListener("click", function (e) {
          e.preventDefault();
          _this.emit("close");
        });
      }
    },
    render: {

      /**
       * Re-renders the canvas
       */

      value: function render() {
        if (this._canvas) {
          this._canvas.render();
        }
      }
    },
    operations: {

      /**
       * An object containing all active operations
       * @type {Object.<String,Operation>}
       */

      get: function () {
        return this._operationsMap;
      }
    },
    controls: {

      /**
       * An object containing all registered controls
       * @type {Object.<String,Control>}
       */

      get: function () {
        return this._registeredControls;
      }
    },
    context: {

      /**
       * The data that is passed to the template renderer
       * @type {Object}
       */

      get: function () {
        var context = _get(Object.getPrototypeOf(NightUI.prototype), "context", this);
        context.controls = this._registeredControls;
        context.renderDropArea = !this._options.image;
        context.controlsDisabled = !this._options.image;
        return context;
      }
    },
    pause: {

      /**
       * Pauses the UI. Operation updates will not cause a re-rendering
       * of the canvas.
       */

      value: function pause() {
        this._paused = true;
      }
    },
    resume: {

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
    },
    addHistory: {

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
    },
    hideZoom: {

      /**
       * Hides the zoom control
       */

      value: function hideZoom() {
        this._topControls.hideZoom();
      }
    },
    showZoom: {

      /**
       * Hides the zoom control
       */

      value: function showZoom() {
        this._topControls.showZoom();
      }
    },
    undo: {

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
    },
    history: {

      /**
       * The undo history
       * @type {Array.<Object>}
       */

      get: function () {
        return this._history;
      }
    },
    fileLoader: {

      /**
       * The file loader
       * @type {FileLoader}
       */

      get: function () {
        return this._fileLoader;
      }
    }
  });

  return NightUI;
})(UI);

NightUI.Control = require("./controls/control");

module.exports = NightUI;

},{"../base/ui":81,"./controls/brightness":82,"./controls/contrast":83,"./controls/control":84,"./controls/crop":85,"./controls/filters":86,"./controls/flip":87,"./controls/frames":88,"./controls/radial-blur":89,"./controls/rotation":90,"./controls/saturation":91,"./controls/stickers":92,"./controls/text":93,"./controls/tilt-shift":94,"./lib/canvas":95,"./lib/file-loader":97,"./lib/scrollbar":98,"./lib/top-controls":101,"lodash":"lodash"}],103:[function(require,module,exports){
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
  if (isNaN(radius) || radius < 1) {
    return;
  }radius |= 0;

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

},{}],"lodash":[function(require,module,exports){
(function (global){
/**
 * @license
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash include="defaults,extend"`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
"use strict";

;(function () {

  /** Used internally to indicate various things */
  var indicatorObject = {};

  /** Used to detected named functions */
  var reFuncName = /^\s*function[ \n\r\t]+\w/;

  /** Used to detect functions containing a `this` reference */
  var reThis = /\bthis\b/;

  /** Used to fix the JScript [[DontEnum]] bug */
  var shadowedProps = ["constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf"];

  /** `Object#toString` result shortcuts */
  var argsClass = "[object Arguments]",
      arrayClass = "[object Array]",
      boolClass = "[object Boolean]",
      dateClass = "[object Date]",
      errorClass = "[object Error]",
      funcClass = "[object Function]",
      numberClass = "[object Number]",
      objectClass = "[object Object]",
      regexpClass = "[object RegExp]",
      stringClass = "[object String]";

  /** Used as the property descriptor for `__bindData__` */
  var descriptor = {
    configurable: false,
    enumerable: false,
    value: null,
    writable: false
  };

  /** Used as the data object for `iteratorTemplate` */
  var iteratorData = {
    args: "",
    array: null,
    bottom: "",
    firstArg: "",
    init: "",
    keys: null,
    loop: "",
    shadowedProps: null,
    support: null,
    top: "",
    useHas: false
  };

  /** Used to determine if values are of the language type Object */
  var objectTypes = {
    boolean: false,
    "function": true,
    object: true,
    number: false,
    string: false,
    undefined: false
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
    if (typeof end == "undefined") {
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
  var reNative = RegExp("^" + String(toString).replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/toString| for [^\]]+/g, ".*?") + "$");

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
  nonEnumProps[arrayClass] = nonEnumProps[dateClass] = nonEnumProps[numberClass] = { constructor: true, toLocaleString: true, toString: true, valueOf: true };
  nonEnumProps[boolClass] = nonEnumProps[stringClass] = { constructor: true, toString: true, valueOf: true };
  nonEnumProps[errorClass] = nonEnumProps[funcClass] = nonEnumProps[regexpClass] = { constructor: true, toString: true };
  nonEnumProps[objectClass] = { constructor: true };

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
        object = { "0": 1, length: 1 },
        props = [];

    ctor.prototype = { valueOf: 1, y: 1 };
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
    support.enumErrorProps = propertyIsEnumerable.call(errorProto, "message") || propertyIsEnumerable.call(errorProto, "name");

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
    support.enumPrototypes = propertyIsEnumerable.call(ctor, "prototype");

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
    support.funcNames = typeof Function.name == "string";

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
    support.unindexedChars = "x"[0] + Object("x")[0] != "xx";
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

    var __p = "var index, iterable = " + obj.firstArg + ", result = " + obj.init + ";\nif (!iterable) return result;\n" + obj.top + ";";
    if (obj.array) {
      __p += "\nvar length = iterable.length; index = -1;\nif (" + obj.array + ") {  ";
      if (support.unindexedChars) {
        __p += "\n  if (isString(iterable)) {\n    iterable = iterable.split('')\n  }  ";
      }
      __p += "\n  while (++index < length) {\n    " + obj.loop + ";\n  }\n}\nelse {  ";
    } else if (support.nonEnumArgs) {
      __p += "\n  var length = iterable.length; index = -1;\n  if (length && isArguments(iterable)) {\n    while (++index < length) {\n      index += '';\n      " + obj.loop + ";\n    }\n  } else {  ";
    }

    if (support.enumPrototypes) {
      __p += "\n  var skipProto = typeof iterable == 'function';\n  ";
    }

    if (support.enumErrorProps) {
      __p += "\n  var skipErrorProps = iterable === errorProto || iterable instanceof Error;\n  ";
    }

    var conditions = [];if (support.enumPrototypes) {
      conditions.push("!(skipProto && index == \"prototype\")");
    }if (support.enumErrorProps) {
      conditions.push("!(skipErrorProps && (index == \"message\" || index == \"name\"))");
    }

    if (obj.useHas && obj.keys) {
      __p += "\n  var ownIndex = -1,\n      ownProps = objectTypes[typeof iterable] && keys(iterable),\n      length = ownProps ? ownProps.length : 0;\n\n  while (++ownIndex < length) {\n    index = ownProps[ownIndex];\n";
      if (conditions.length) {
        __p += "    if (" + conditions.join(" && ") + ") {\n  ";
      }
      __p += obj.loop + ";    ";
      if (conditions.length) {
        __p += "\n    }";
      }
      __p += "\n  }  ";
    } else {
      __p += "\n  for (index in iterable) {\n";
      if (obj.useHas) {
        conditions.push("hasOwnProperty.call(iterable, index)");
      }if (conditions.length) {
        __p += "    if (" + conditions.join(" && ") + ") {\n  ";
      }
      __p += obj.loop + ";    ";
      if (conditions.length) {
        __p += "\n    }";
      }
      __p += "\n  }    ";
      if (support.nonEnumShadows) {
        __p += "\n\n  if (iterable !== objectProto) {\n    var ctor = iterable.constructor,\n        isProto = iterable === (ctor && ctor.prototype),\n        className = iterable === stringProto ? stringClass : iterable === errorProto ? errorClass : toString.call(iterable),\n        nonEnum = nonEnumProps[className];\n      ";
        for (k = 0; k < 7; k++) {
          __p += "\n    index = '" + obj.shadowedProps[k] + "';\n    if ((!(isProto && nonEnum[index]) && hasOwnProperty.call(iterable, index))";
          if (!obj.useHas) {
            __p += " || (!nonEnum[index] && iterable[index] !== objectProto[index])";
          }
          __p += ") {\n      " + obj.loop + ";\n    }      ";
        }
        __p += "\n  }    ";
      }
    }

    if (obj.array || support.nonEnumArgs) {
      __p += "\n}";
    }
    __p += obj.bottom + ";\nreturn result";

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
    if (typeof func != "function") {
      return identity;
    }
    // exit early for no `thisArg` or already bound by `Function#bind`
    if (typeof thisArg == "undefined" || !("prototype" in func)) {
      return func;
    }
    var bindData = func.__bindData__;
    if (typeof bindData == "undefined") {
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
    var _arguments;

    var _again = true;

    _function: while (_again) {
      _again = false;
      var func = _x,
          bitmask = _x2,
          partialArgs = _x3,
          partialRightArgs = _x4,
          thisArg = _x5,
          arity = _x6;
      isBind = isBindKey = isCurry = isCurryBound = isPartial = isPartialRight = bindData = creater = undefined;

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
    iteratorData.array = iteratorData.bottom = iteratorData.loop = iteratorData.top = "";
    iteratorData.init = "iterable";
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
    var factory = Function("baseCreateCallback, errorClass, errorProto, hasOwnProperty, " + "indicatorObject, isArguments, isArray, isString, keys, objectProto, " + "objectTypes, nonEnumProps, stringClass, stringProto, toString", "return function(" + args + ") {\n" + iteratorTemplate(iteratorData) + "\n}");

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
    return typeof value == "function" && reNative.test(value);
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
    defineProperty(func, "__bindData__", descriptor);
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
    return value && typeof value == "object" && typeof value.length == "number" && toString.call(value) == argsClass || false;
  }
  // fallback for browsers that can't detect `arguments` objects by [[Class]]
  if (!support.argsClass) {
    isArguments = function (value) {
      return value && typeof value == "object" && typeof value.length == "number" && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee") || false;
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
    return value && typeof value == "object" && typeof value.length == "number" && toString.call(value) == arrayClass || false;
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
    args: "object",
    init: "[]",
    top: "if (!(objectTypes[typeof object])) return result",
    loop: "result.push(index)"
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
    if (support.enumPrototypes && typeof object == "function" || support.nonEnumArgs && object.length && isArguments(object)) {
      return shimKeys(object);
    }
    return nativeKeys(object);
  };

  /** Reusable iterator options for `assign` and `defaults` */
  var defaultsIteratorOptions = {
    args: "object, source, guard",
    top: "var args = arguments,\n" + "    argsIndex = 0,\n" + "    argsLength = typeof guard == 'number' ? 2 : args.length;\n" + "while (++argsIndex < argsLength) {\n" + "  iterable = args[argsIndex];\n" + "  if (iterable && objectTypes[typeof iterable]) {",
    keys: keys,
    loop: "if (typeof result[index] == 'undefined') result[index] = iterable[index]",
    bottom: "  }\n}"
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
    top: defaultsIteratorOptions.top.replace(";", ";\n" + "if (argsLength > 3 && typeof args[argsLength - 2] == 'function') {\n" + "  var callback = baseCreateCallback(args[--argsLength - 1], args[argsLength--], 2);\n" + "} else if (argsLength > 2 && typeof args[argsLength - 1] == 'function') {\n" + "  callback = args[--argsLength];\n" + "}"),
    loop: "result[index] = callback ? callback(result[index], iterable[index]) : iterable[index]"
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
    return typeof value == "function";
  }
  // fallback for older versions of Chrome and Safari
  if (isFunction(/x/)) {
    isFunction = function (value) {
      return typeof value == "function" && toString.call(value) == funcClass;
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
    return typeof value == "string" || value && typeof value == "object" && toString.call(value) == stringClass || false;
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
  lodash.VERSION = "2.4.1";

  /*--------------------------------------------------------------------------*/

  // some AMD build optimizers like r.js check for condition patterns like the following:
  if (typeof define == "function" && typeof define.amd == "object" && define.amd) {
    // Expose Lo-Dash to the global object even when an AMD loader is present in
    // case Lo-Dash is loaded with a RequireJS shim config.
    // See http://requirejs.org/docs/api.html#config-shim
    root._ = lodash;

    // define as an anonymous module so, through path mapping, it can be
    // referenced as the "underscore" module
    define(function () {
      return lodash;
    });
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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1]);

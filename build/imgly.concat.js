/*!
 * jQuery JavaScript Library v1.10.1
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2005, 2013 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2013-05-30T21:49Z
 */
(function( window, undefined ) {

// Can't do this because several apps including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
// Support: Firefox 18+
//"use strict";
var
  // The deferred used on DOM ready
  readyList,

  // A central reference to the root jQuery(document)
  rootjQuery,

  // Support: IE<10
  // For `typeof xmlNode.method` instead of `xmlNode.method !== undefined`
  core_strundefined = typeof undefined,

  // Use the correct document accordingly with window argument (sandbox)
  location = window.location,
  document = window.document,
  docElem = document.documentElement,

  // Map over jQuery in case of overwrite
  _jQuery = window.jQuery,

  // Map over the $ in case of overwrite
  _$ = window.$,

  // [[Class]] -> type pairs
  class2type = {},

  // List of deleted data cache ids, so we can reuse them
  core_deletedIds = [],

  core_version = "1.10.1",

  // Save a reference to some core methods
  core_concat = core_deletedIds.concat,
  core_push = core_deletedIds.push,
  core_slice = core_deletedIds.slice,
  core_indexOf = core_deletedIds.indexOf,
  core_toString = class2type.toString,
  core_hasOwn = class2type.hasOwnProperty,
  core_trim = core_version.trim,

  // Define a local copy of jQuery
  jQuery = function( selector, context ) {
    // The jQuery object is actually just the init constructor 'enhanced'
    return new jQuery.fn.init( selector, context, rootjQuery );
  },

  // Used for matching numbers
  core_pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,

  // Used for splitting on whitespace
  core_rnotwhite = /\S+/g,

  // Make sure we trim BOM and NBSP (here's looking at you, Safari 5.0 and IE)
  rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

  // A simple way to check for HTML strings
  // Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
  // Strict HTML recognition (#11290: must start with <)
  rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

  // Match a standalone tag
  rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,

  // JSON RegExp
  rvalidchars = /^[\],:{}\s]*$/,
  rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
  rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
  rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g,

  // Matches dashed string for camelizing
  rmsPrefix = /^-ms-/,
  rdashAlpha = /-([\da-z])/gi,

  // Used by jQuery.camelCase as callback to replace()
  fcamelCase = function( all, letter ) {
    return letter.toUpperCase();
  },

  // The ready event handler
  completed = function( event ) {

    // readyState === "complete" is good enough for us to call the dom ready in oldIE
    if ( document.addEventListener || event.type === "load" || document.readyState === "complete" ) {
      detach();
      jQuery.ready();
    }
  },
  // Clean-up method for dom ready events
  detach = function() {
    if ( document.addEventListener ) {
      document.removeEventListener( "DOMContentLoaded", completed, false );
      window.removeEventListener( "load", completed, false );

    } else {
      document.detachEvent( "onreadystatechange", completed );
      window.detachEvent( "onload", completed );
    }
  };

jQuery.fn = jQuery.prototype = {
  // The current version of jQuery being used
  jquery: core_version,

  constructor: jQuery,
  init: function( selector, context, rootjQuery ) {
    var match, elem;

    // HANDLE: $(""), $(null), $(undefined), $(false)
    if ( !selector ) {
      return this;
    }

    // Handle HTML strings
    if ( typeof selector === "string" ) {
      if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
        // Assume that strings that start and end with <> are HTML and skip the regex check
        match = [ null, selector, null ];

      } else {
        match = rquickExpr.exec( selector );
      }

      // Match html or make sure no context is specified for #id
      if ( match && (match[1] || !context) ) {

        // HANDLE: $(html) -> $(array)
        if ( match[1] ) {
          context = context instanceof jQuery ? context[0] : context;

          // scripts is true for back-compat
          jQuery.merge( this, jQuery.parseHTML(
            match[1],
            context && context.nodeType ? context.ownerDocument || context : document,
            true
          ) );

          // HANDLE: $(html, props)
          if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
            for ( match in context ) {
              // Properties of context are called as methods if possible
              if ( jQuery.isFunction( this[ match ] ) ) {
                this[ match ]( context[ match ] );

              // ...and otherwise set as attributes
              } else {
                this.attr( match, context[ match ] );
              }
            }
          }

          return this;

        // HANDLE: $(#id)
        } else {
          elem = document.getElementById( match[2] );

          // Check parentNode to catch when Blackberry 4.6 returns
          // nodes that are no longer in the document #6963
          if ( elem && elem.parentNode ) {
            // Handle the case where IE and Opera return items
            // by name instead of ID
            if ( elem.id !== match[2] ) {
              return rootjQuery.find( selector );
            }

            // Otherwise, we inject the element directly into the jQuery object
            this.length = 1;
            this[0] = elem;
          }

          this.context = document;
          this.selector = selector;
          return this;
        }

      // HANDLE: $(expr, $(...))
      } else if ( !context || context.jquery ) {
        return ( context || rootjQuery ).find( selector );

      // HANDLE: $(expr, context)
      // (which is just equivalent to: $(context).find(expr)
      } else {
        return this.constructor( context ).find( selector );
      }

    // HANDLE: $(DOMElement)
    } else if ( selector.nodeType ) {
      this.context = this[0] = selector;
      this.length = 1;
      return this;

    // HANDLE: $(function)
    // Shortcut for document ready
    } else if ( jQuery.isFunction( selector ) ) {
      return rootjQuery.ready( selector );
    }

    if ( selector.selector !== undefined ) {
      this.selector = selector.selector;
      this.context = selector.context;
    }

    return jQuery.makeArray( selector, this );
  },

  // Start with an empty selector
  selector: "",

  // The default length of a jQuery object is 0
  length: 0,

  toArray: function() {
    return core_slice.call( this );
  },

  // Get the Nth element in the matched element set OR
  // Get the whole matched element set as a clean array
  get: function( num ) {
    return num == null ?

      // Return a 'clean' array
      this.toArray() :

      // Return just the object
      ( num < 0 ? this[ this.length + num ] : this[ num ] );
  },

  // Take an array of elements and push it onto the stack
  // (returning the new matched element set)
  pushStack: function( elems ) {

    // Build a new jQuery matched element set
    var ret = jQuery.merge( this.constructor(), elems );

    // Add the old object onto the stack (as a reference)
    ret.prevObject = this;
    ret.context = this.context;

    // Return the newly-formed element set
    return ret;
  },

  // Execute a callback for every element in the matched set.
  // (You can seed the arguments with an array of args, but this is
  // only used internally.)
  each: function( callback, args ) {
    return jQuery.each( this, callback, args );
  },

  ready: function( fn ) {
    // Add the callback
    jQuery.ready.promise().done( fn );

    return this;
  },

  slice: function() {
    return this.pushStack( core_slice.apply( this, arguments ) );
  },

  first: function() {
    return this.eq( 0 );
  },

  last: function() {
    return this.eq( -1 );
  },

  eq: function( i ) {
    var len = this.length,
      j = +i + ( i < 0 ? len : 0 );
    return this.pushStack( j >= 0 && j < len ? [ this[j] ] : [] );
  },

  map: function( callback ) {
    return this.pushStack( jQuery.map(this, function( elem, i ) {
      return callback.call( elem, i, elem );
    }));
  },

  end: function() {
    return this.prevObject || this.constructor(null);
  },

  // For internal use only.
  // Behaves like an Array's method, not like a jQuery method.
  push: core_push,
  sort: [].sort,
  splice: [].splice
};

// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;

jQuery.extend = jQuery.fn.extend = function() {
  var src, copyIsArray, copy, name, options, clone,
    target = arguments[0] || {},
    i = 1,
    length = arguments.length,
    deep = false;

  // Handle a deep copy situation
  if ( typeof target === "boolean" ) {
    deep = target;
    target = arguments[1] || {};
    // skip the boolean and the target
    i = 2;
  }

  // Handle case when target is a string or something (possible in deep copy)
  if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
    target = {};
  }

  // extend jQuery itself if only one argument is passed
  if ( length === i ) {
    target = this;
    --i;
  }

  for ( ; i < length; i++ ) {
    // Only deal with non-null/undefined values
    if ( (options = arguments[ i ]) != null ) {
      // Extend the base object
      for ( name in options ) {
        src = target[ name ];
        copy = options[ name ];

        // Prevent never-ending loop
        if ( target === copy ) {
          continue;
        }

        // Recurse if we're merging plain objects or arrays
        if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
          if ( copyIsArray ) {
            copyIsArray = false;
            clone = src && jQuery.isArray(src) ? src : [];

          } else {
            clone = src && jQuery.isPlainObject(src) ? src : {};
          }

          // Never move original objects, clone them
          target[ name ] = jQuery.extend( deep, clone, copy );

        // Don't bring in undefined values
        } else if ( copy !== undefined ) {
          target[ name ] = copy;
        }
      }
    }
  }

  // Return the modified object
  return target;
};

jQuery.extend({
  // Unique for each copy of jQuery on the page
  // Non-digits removed to match rinlinejQuery
  expando: "jQuery" + ( core_version + Math.random() ).replace( /\D/g, "" ),

  noConflict: function( deep ) {
    if ( window.$ === jQuery ) {
      window.$ = _$;
    }

    if ( deep && window.jQuery === jQuery ) {
      window.jQuery = _jQuery;
    }

    return jQuery;
  },

  // Is the DOM ready to be used? Set to true once it occurs.
  isReady: false,

  // A counter to track how many items to wait for before
  // the ready event fires. See #6781
  readyWait: 1,

  // Hold (or release) the ready event
  holdReady: function( hold ) {
    if ( hold ) {
      jQuery.readyWait++;
    } else {
      jQuery.ready( true );
    }
  },

  // Handle when the DOM is ready
  ready: function( wait ) {

    // Abort if there are pending holds or we're already ready
    if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
      return;
    }

    // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
    if ( !document.body ) {
      return setTimeout( jQuery.ready );
    }

    // Remember that the DOM is ready
    jQuery.isReady = true;

    // If a normal DOM Ready event fired, decrement, and wait if need be
    if ( wait !== true && --jQuery.readyWait > 0 ) {
      return;
    }

    // If there are functions bound, to execute
    readyList.resolveWith( document, [ jQuery ] );

    // Trigger any bound ready events
    if ( jQuery.fn.trigger ) {
      jQuery( document ).trigger("ready").off("ready");
    }
  },

  // See test/unit/core.js for details concerning isFunction.
  // Since version 1.3, DOM methods and functions like alert
  // aren't supported. They return false on IE (#2968).
  isFunction: function( obj ) {
    return jQuery.type(obj) === "function";
  },

  isArray: Array.isArray || function( obj ) {
    return jQuery.type(obj) === "array";
  },

  isWindow: function( obj ) {
    /* jshint eqeqeq: false */
    return obj != null && obj == obj.window;
  },

  isNumeric: function( obj ) {
    return !isNaN( parseFloat(obj) ) && isFinite( obj );
  },

  type: function( obj ) {
    if ( obj == null ) {
      return String( obj );
    }
    return typeof obj === "object" || typeof obj === "function" ?
      class2type[ core_toString.call(obj) ] || "object" :
      typeof obj;
  },

  isPlainObject: function( obj ) {
    var key;

    // Must be an Object.
    // Because of IE, we also have to check the presence of the constructor property.
    // Make sure that DOM nodes and window objects don't pass through, as well
    if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
      return false;
    }

    try {
      // Not own constructor property must be Object
      if ( obj.constructor &&
        !core_hasOwn.call(obj, "constructor") &&
        !core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
        return false;
      }
    } catch ( e ) {
      // IE8,9 Will throw exceptions on certain host objects #9897
      return false;
    }

    // Support: IE<9
    // Handle iteration over inherited properties before own properties.
    if ( jQuery.support.ownLast ) {
      for ( key in obj ) {
        return core_hasOwn.call( obj, key );
      }
    }

    // Own properties are enumerated firstly, so to speed up,
    // if last one is own, then all properties are own.
    for ( key in obj ) {}

    return key === undefined || core_hasOwn.call( obj, key );
  },

  isEmptyObject: function( obj ) {
    var name;
    for ( name in obj ) {
      return false;
    }
    return true;
  },

  error: function( msg ) {
    throw new Error( msg );
  },

  // data: string of html
  // context (optional): If specified, the fragment will be created in this context, defaults to document
  // keepScripts (optional): If true, will include scripts passed in the html string
  parseHTML: function( data, context, keepScripts ) {
    if ( !data || typeof data !== "string" ) {
      return null;
    }
    if ( typeof context === "boolean" ) {
      keepScripts = context;
      context = false;
    }
    context = context || document;

    var parsed = rsingleTag.exec( data ),
      scripts = !keepScripts && [];

    // Single tag
    if ( parsed ) {
      return [ context.createElement( parsed[1] ) ];
    }

    parsed = jQuery.buildFragment( [ data ], context, scripts );
    if ( scripts ) {
      jQuery( scripts ).remove();
    }
    return jQuery.merge( [], parsed.childNodes );
  },

  parseJSON: function( data ) {
    // Attempt to parse using the native JSON parser first
    if ( window.JSON && window.JSON.parse ) {
      return window.JSON.parse( data );
    }

    if ( data === null ) {
      return data;
    }

    if ( typeof data === "string" ) {

      // Make sure leading/trailing whitespace is removed (IE can't handle it)
      data = jQuery.trim( data );

      if ( data ) {
        // Make sure the incoming data is actual JSON
        // Logic borrowed from http://json.org/json2.js
        if ( rvalidchars.test( data.replace( rvalidescape, "@" )
          .replace( rvalidtokens, "]" )
          .replace( rvalidbraces, "")) ) {

          return ( new Function( "return " + data ) )();
        }
      }
    }

    jQuery.error( "Invalid JSON: " + data );
  },

  // Cross-browser xml parsing
  parseXML: function( data ) {
    var xml, tmp;
    if ( !data || typeof data !== "string" ) {
      return null;
    }
    try {
      if ( window.DOMParser ) { // Standard
        tmp = new DOMParser();
        xml = tmp.parseFromString( data , "text/xml" );
      } else { // IE
        xml = new ActiveXObject( "Microsoft.XMLDOM" );
        xml.async = "false";
        xml.loadXML( data );
      }
    } catch( e ) {
      xml = undefined;
    }
    if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
      jQuery.error( "Invalid XML: " + data );
    }
    return xml;
  },

  noop: function() {},

  // Evaluates a script in a global context
  // Workarounds based on findings by Jim Driscoll
  // http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
  globalEval: function( data ) {
    if ( data && jQuery.trim( data ) ) {
      // We use execScript on Internet Explorer
      // We use an anonymous function so that context is window
      // rather than jQuery in Firefox
      ( window.execScript || function( data ) {
        window[ "eval" ].call( window, data );
      } )( data );
    }
  },

  // Convert dashed to camelCase; used by the css and data modules
  // Microsoft forgot to hump their vendor prefix (#9572)
  camelCase: function( string ) {
    return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
  },

  nodeName: function( elem, name ) {
    return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
  },

  // args is for internal usage only
  each: function( obj, callback, args ) {
    var value,
      i = 0,
      length = obj.length,
      isArray = isArraylike( obj );

    if ( args ) {
      if ( isArray ) {
        for ( ; i < length; i++ ) {
          value = callback.apply( obj[ i ], args );

          if ( value === false ) {
            break;
          }
        }
      } else {
        for ( i in obj ) {
          value = callback.apply( obj[ i ], args );

          if ( value === false ) {
            break;
          }
        }
      }

    // A special, fast, case for the most common use of each
    } else {
      if ( isArray ) {
        for ( ; i < length; i++ ) {
          value = callback.call( obj[ i ], i, obj[ i ] );

          if ( value === false ) {
            break;
          }
        }
      } else {
        for ( i in obj ) {
          value = callback.call( obj[ i ], i, obj[ i ] );

          if ( value === false ) {
            break;
          }
        }
      }
    }

    return obj;
  },

  // Use native String.trim function wherever possible
  trim: core_trim && !core_trim.call("\uFEFF\xA0") ?
    function( text ) {
      return text == null ?
        "" :
        core_trim.call( text );
    } :

    // Otherwise use our own trimming functionality
    function( text ) {
      return text == null ?
        "" :
        ( text + "" ).replace( rtrim, "" );
    },

  // results is for internal usage only
  makeArray: function( arr, results ) {
    var ret = results || [];

    if ( arr != null ) {
      if ( isArraylike( Object(arr) ) ) {
        jQuery.merge( ret,
          typeof arr === "string" ?
          [ arr ] : arr
        );
      } else {
        core_push.call( ret, arr );
      }
    }

    return ret;
  },

  inArray: function( elem, arr, i ) {
    var len;

    if ( arr ) {
      if ( core_indexOf ) {
        return core_indexOf.call( arr, elem, i );
      }

      len = arr.length;
      i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

      for ( ; i < len; i++ ) {
        // Skip accessing in sparse arrays
        if ( i in arr && arr[ i ] === elem ) {
          return i;
        }
      }
    }

    return -1;
  },

  merge: function( first, second ) {
    var l = second.length,
      i = first.length,
      j = 0;

    if ( typeof l === "number" ) {
      for ( ; j < l; j++ ) {
        first[ i++ ] = second[ j ];
      }
    } else {
      while ( second[j] !== undefined ) {
        first[ i++ ] = second[ j++ ];
      }
    }

    first.length = i;

    return first;
  },

  grep: function( elems, callback, inv ) {
    var retVal,
      ret = [],
      i = 0,
      length = elems.length;
    inv = !!inv;

    // Go through the array, only saving the items
    // that pass the validator function
    for ( ; i < length; i++ ) {
      retVal = !!callback( elems[ i ], i );
      if ( inv !== retVal ) {
        ret.push( elems[ i ] );
      }
    }

    return ret;
  },

  // arg is for internal usage only
  map: function( elems, callback, arg ) {
    var value,
      i = 0,
      length = elems.length,
      isArray = isArraylike( elems ),
      ret = [];

    // Go through the array, translating each of the items to their
    if ( isArray ) {
      for ( ; i < length; i++ ) {
        value = callback( elems[ i ], i, arg );

        if ( value != null ) {
          ret[ ret.length ] = value;
        }
      }

    // Go through every key on the object,
    } else {
      for ( i in elems ) {
        value = callback( elems[ i ], i, arg );

        if ( value != null ) {
          ret[ ret.length ] = value;
        }
      }
    }

    // Flatten any nested arrays
    return core_concat.apply( [], ret );
  },

  // A global GUID counter for objects
  guid: 1,

  // Bind a function to a context, optionally partially applying any
  // arguments.
  proxy: function( fn, context ) {
    var args, proxy, tmp;

    if ( typeof context === "string" ) {
      tmp = fn[ context ];
      context = fn;
      fn = tmp;
    }

    // Quick check to determine if target is callable, in the spec
    // this throws a TypeError, but we will just return undefined.
    if ( !jQuery.isFunction( fn ) ) {
      return undefined;
    }

    // Simulated bind
    args = core_slice.call( arguments, 2 );
    proxy = function() {
      return fn.apply( context || this, args.concat( core_slice.call( arguments ) ) );
    };

    // Set the guid of unique handler to the same of original handler, so it can be removed
    proxy.guid = fn.guid = fn.guid || jQuery.guid++;

    return proxy;
  },

  // Multifunctional method to get and set values of a collection
  // The value/s can optionally be executed if it's a function
  access: function( elems, fn, key, value, chainable, emptyGet, raw ) {
    var i = 0,
      length = elems.length,
      bulk = key == null;

    // Sets many values
    if ( jQuery.type( key ) === "object" ) {
      chainable = true;
      for ( i in key ) {
        jQuery.access( elems, fn, i, key[i], true, emptyGet, raw );
      }

    // Sets one value
    } else if ( value !== undefined ) {
      chainable = true;

      if ( !jQuery.isFunction( value ) ) {
        raw = true;
      }

      if ( bulk ) {
        // Bulk operations run against the entire set
        if ( raw ) {
          fn.call( elems, value );
          fn = null;

        // ...except when executing function values
        } else {
          bulk = fn;
          fn = function( elem, key, value ) {
            return bulk.call( jQuery( elem ), value );
          };
        }
      }

      if ( fn ) {
        for ( ; i < length; i++ ) {
          fn( elems[i], key, raw ? value : value.call( elems[i], i, fn( elems[i], key ) ) );
        }
      }
    }

    return chainable ?
      elems :

      // Gets
      bulk ?
        fn.call( elems ) :
        length ? fn( elems[0], key ) : emptyGet;
  },

  now: function() {
    return ( new Date() ).getTime();
  },

  // A method for quickly swapping in/out CSS properties to get correct calculations.
  // Note: this method belongs to the css module but it's needed here for the support module.
  // If support gets modularized, this method should be moved back to the css module.
  swap: function( elem, options, callback, args ) {
    var ret, name,
      old = {};

    // Remember the old values, and insert the new ones
    for ( name in options ) {
      old[ name ] = elem.style[ name ];
      elem.style[ name ] = options[ name ];
    }

    ret = callback.apply( elem, args || [] );

    // Revert the old values
    for ( name in options ) {
      elem.style[ name ] = old[ name ];
    }

    return ret;
  }
});

jQuery.ready.promise = function( obj ) {
  if ( !readyList ) {

    readyList = jQuery.Deferred();

    // Catch cases where $(document).ready() is called after the browser event has already occurred.
    // we once tried to use readyState "interactive" here, but it caused issues like the one
    // discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
    if ( document.readyState === "complete" ) {
      // Handle it asynchronously to allow scripts the opportunity to delay ready
      setTimeout( jQuery.ready );

    // Standards-based browsers support DOMContentLoaded
    } else if ( document.addEventListener ) {
      // Use the handy event callback
      document.addEventListener( "DOMContentLoaded", completed, false );

      // A fallback to window.onload, that will always work
      window.addEventListener( "load", completed, false );

    // If IE event model is used
    } else {
      // Ensure firing before onload, maybe late but safe also for iframes
      document.attachEvent( "onreadystatechange", completed );

      // A fallback to window.onload, that will always work
      window.attachEvent( "onload", completed );

      // If IE and not a frame
      // continually check to see if the document is ready
      var top = false;

      try {
        top = window.frameElement == null && document.documentElement;
      } catch(e) {}

      if ( top && top.doScroll ) {
        (function doScrollCheck() {
          if ( !jQuery.isReady ) {

            try {
              // Use the trick by Diego Perini
              // http://javascript.nwbox.com/IEContentLoaded/
              top.doScroll("left");
            } catch(e) {
              return setTimeout( doScrollCheck, 50 );
            }

            // detach all dom ready events
            detach();

            // and execute any waiting functions
            jQuery.ready();
          }
        })();
      }
    }
  }
  return readyList.promise( obj );
};

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
  class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

function isArraylike( obj ) {
  var length = obj.length,
    type = jQuery.type( obj );

  if ( jQuery.isWindow( obj ) ) {
    return false;
  }

  if ( obj.nodeType === 1 && length ) {
    return true;
  }

  return type === "array" || type !== "function" &&
    ( length === 0 ||
    typeof length === "number" && length > 0 && ( length - 1 ) in obj );
}

// All jQuery objects should point back to these
rootjQuery = jQuery(document);
/*!
 * Sizzle CSS Selector Engine v1.9.4-pre
 * http://sizzlejs.com/
 *
 * Copyright 2013 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2013-05-27
 */
(function( window, undefined ) {

var i,
  support,
  cachedruns,
  Expr,
  getText,
  isXML,
  compile,
  outermostContext,
  sortInput,

  // Local document vars
  setDocument,
  document,
  docElem,
  documentIsHTML,
  rbuggyQSA,
  rbuggyMatches,
  matches,
  contains,

  // Instance-specific data
  expando = "sizzle" + -(new Date()),
  preferredDoc = window.document,
  dirruns = 0,
  done = 0,
  classCache = createCache(),
  tokenCache = createCache(),
  compilerCache = createCache(),
  hasDuplicate = false,
  sortOrder = function() { return 0; },

  // General-purpose constants
  strundefined = typeof undefined,
  MAX_NEGATIVE = 1 << 31,

  // Instance methods
  hasOwn = ({}).hasOwnProperty,
  arr = [],
  pop = arr.pop,
  push_native = arr.push,
  push = arr.push,
  slice = arr.slice,
  // Use a stripped-down indexOf if we can't use a native one
  indexOf = arr.indexOf || function( elem ) {
    var i = 0,
      len = this.length;
    for ( ; i < len; i++ ) {
      if ( this[i] === elem ) {
        return i;
      }
    }
    return -1;
  },

  booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

  // Regular expressions

  // Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
  whitespace = "[\\x20\\t\\r\\n\\f]",
  // http://www.w3.org/TR/css3-syntax/#characters
  characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

  // Loosely modeled on CSS identifier characters
  // An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
  // Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
  identifier = characterEncoding.replace( "w", "w#" ),

  // Acceptable operators http://www.w3.org/TR/selectors/#attribute-selectors
  attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace +
    "*(?:([*^$|!~]?=)" + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]",

  // Prefer arguments quoted,
  //   then not containing pseudos/brackets,
  //   then attribute selectors/non-parenthetical expressions,
  //   then anything else
  // These preferences are here to reduce the number of selectors
  //   needing tokenize in the PSEUDO preFilter
  pseudos = ":(" + characterEncoding + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + attributes.replace( 3, 8 ) + ")*)|.*)\\)|)",

  // Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
  rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

  rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
  rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

  rsibling = new RegExp( whitespace + "*[+~]" ),
  rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*)" + whitespace + "*\\]", "g" ),

  rpseudo = new RegExp( pseudos ),
  ridentifier = new RegExp( "^" + identifier + "$" ),

  matchExpr = {
    "ID": new RegExp( "^#(" + characterEncoding + ")" ),
    "CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
    "TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
    "ATTR": new RegExp( "^" + attributes ),
    "PSEUDO": new RegExp( "^" + pseudos ),
    "CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
      "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
      "*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
    "bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
    // For use in libraries implementing .is()
    // We use this for POS matching in `select`
    "needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
      whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
  },

  rnative = /^[^{]+\{\s*\[native \w/,

  // Easily-parseable/retrievable ID or TAG or CLASS selectors
  rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

  rinputs = /^(?:input|select|textarea|button)$/i,
  rheader = /^h\d$/i,

  rescape = /'|\\/g,

  // CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
  runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
  funescape = function( _, escaped, escapedWhitespace ) {
    var high = "0x" + escaped - 0x10000;
    // NaN means non-codepoint
    // Support: Firefox
    // Workaround erroneous numeric interpretation of +"0x"
    return high !== high || escapedWhitespace ?
      escaped :
      // BMP codepoint
      high < 0 ?
        String.fromCharCode( high + 0x10000 ) :
        // Supplemental Plane codepoint (surrogate pair)
        String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
  };

// Optimize for push.apply( _, NodeList )
try {
  push.apply(
    (arr = slice.call( preferredDoc.childNodes )),
    preferredDoc.childNodes
  );
  // Support: Android<4.0
  // Detect silently failing push.apply
  arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
  push = { apply: arr.length ?

    // Leverage slice if possible
    function( target, els ) {
      push_native.apply( target, slice.call(els) );
    } :

    // Support: IE<9
    // Otherwise append directly
    function( target, els ) {
      var j = target.length,
        i = 0;
      // Can't trust NodeList.length
      while ( (target[j++] = els[i++]) ) {}
      target.length = j - 1;
    }
  };
}

function Sizzle( selector, context, results, seed ) {
  var match, elem, m, nodeType,
    // QSA vars
    i, groups, old, nid, newContext, newSelector;

  if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
    setDocument( context );
  }

  context = context || document;
  results = results || [];

  if ( !selector || typeof selector !== "string" ) {
    return results;
  }

  if ( (nodeType = context.nodeType) !== 1 && nodeType !== 9 ) {
    return [];
  }

  if ( documentIsHTML && !seed ) {

    // Shortcuts
    if ( (match = rquickExpr.exec( selector )) ) {
      // Speed-up: Sizzle("#ID")
      if ( (m = match[1]) ) {
        if ( nodeType === 9 ) {
          elem = context.getElementById( m );
          // Check parentNode to catch when Blackberry 4.6 returns
          // nodes that are no longer in the document #6963
          if ( elem && elem.parentNode ) {
            // Handle the case where IE, Opera, and Webkit return items
            // by name instead of ID
            if ( elem.id === m ) {
              results.push( elem );
              return results;
            }
          } else {
            return results;
          }
        } else {
          // Context is not a document
          if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
            contains( context, elem ) && elem.id === m ) {
            results.push( elem );
            return results;
          }
        }

      // Speed-up: Sizzle("TAG")
      } else if ( match[2] ) {
        push.apply( results, context.getElementsByTagName( selector ) );
        return results;

      // Speed-up: Sizzle(".CLASS")
      } else if ( (m = match[3]) && support.getElementsByClassName && context.getElementsByClassName ) {
        push.apply( results, context.getElementsByClassName( m ) );
        return results;
      }
    }

    // QSA path
    if ( support.qsa && (!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
      nid = old = expando;
      newContext = context;
      newSelector = nodeType === 9 && selector;

      // qSA works strangely on Element-rooted queries
      // We can work around this by specifying an extra ID on the root
      // and working up from there (Thanks to Andrew Dupont for the technique)
      // IE 8 doesn't work on object elements
      if ( nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
        groups = tokenize( selector );

        if ( (old = context.getAttribute("id")) ) {
          nid = old.replace( rescape, "\\$&" );
        } else {
          context.setAttribute( "id", nid );
        }
        nid = "[id='" + nid + "'] ";

        i = groups.length;
        while ( i-- ) {
          groups[i] = nid + toSelector( groups[i] );
        }
        newContext = rsibling.test( selector ) && context.parentNode || context;
        newSelector = groups.join(",");
      }

      if ( newSelector ) {
        try {
          push.apply( results,
            newContext.querySelectorAll( newSelector )
          );
          return results;
        } catch(qsaError) {
        } finally {
          if ( !old ) {
            context.removeAttribute("id");
          }
        }
      }
    }
  }

  // All others
  return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * For feature detection
 * @param {Function} fn The function to test for native support
 */
function isNative( fn ) {
  return rnative.test( fn + "" );
}

/**
 * Create key-value caches of limited size
 * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
 *  property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *  deleting the oldest entry
 */
function createCache() {
  var keys = [];

  function cache( key, value ) {
    // Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
    if ( keys.push( key += " " ) > Expr.cacheLength ) {
      // Only keep the most recent entries
      delete cache[ keys.shift() ];
    }
    return (cache[ key ] = value);
  }
  return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
  fn[ expando ] = true;
  return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
function assert( fn ) {
  var div = document.createElement("div");

  try {
    return !!fn( div );
  } catch (e) {
    return false;
  } finally {
    // Remove from its parent by default
    if ( div.parentNode ) {
      div.parentNode.removeChild( div );
    }
    // release memory in IE
    div = null;
  }
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied if the test fails
 * @param {Boolean} test The result of a test. If true, null will be set as the handler in leiu of the specified handler
 */
function addHandle( attrs, handler, test ) {
  attrs = attrs.split("|");
  var current,
    i = attrs.length,
    setHandle = test ? null : handler;

  while ( i-- ) {
    // Don't override a user's handler
    if ( !(current = Expr.attrHandle[ attrs[i] ]) || current === handler ) {
      Expr.attrHandle[ attrs[i] ] = setHandle;
    }
  }
}

/**
 * Fetches boolean attributes by node
 * @param {Element} elem
 * @param {String} name
 */
function boolHandler( elem, name ) {
  // XML does not need to be checked as this will not be assigned for XML documents
  var val = elem.getAttributeNode( name );
  return val && val.specified ?
    val.value :
    elem[ name ] === true ? name.toLowerCase() : null;
}

/**
 * Fetches attributes without interpolation
 * http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
 * @param {Element} elem
 * @param {String} name
 */
function interpolationHandler( elem, name ) {
  // XML does not need to be checked as this will not be assigned for XML documents
  return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
}

/**
 * Uses defaultValue to retrieve value in IE6/7
 * @param {Element} elem
 * @param {String} name
 */
function valueHandler( elem ) {
  // Ignore the value *property* on inputs by using defaultValue
  // Fallback to Sizzle.attr by returning undefined where appropriate
  // XML does not need to be checked as this will not be assigned for XML documents
  if ( elem.nodeName.toLowerCase() === "input" ) {
    return elem.defaultValue;
  }
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns Returns -1 if a precedes b, 1 if a follows b
 */
function siblingCheck( a, b ) {
  var cur = b && a,
    diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
      ( ~b.sourceIndex || MAX_NEGATIVE ) -
      ( ~a.sourceIndex || MAX_NEGATIVE );

  // Use IE sourceIndex if available on both nodes
  if ( diff ) {
    return diff;
  }

  // Check if b follows a
  if ( cur ) {
    while ( (cur = cur.nextSibling) ) {
      if ( cur === b ) {
        return -1;
      }
    }
  }

  return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
  return function( elem ) {
    var name = elem.nodeName.toLowerCase();
    return name === "input" && elem.type === type;
  };
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
  return function( elem ) {
    var name = elem.nodeName.toLowerCase();
    return (name === "input" || name === "button") && elem.type === type;
  };
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
  return markFunction(function( argument ) {
    argument = +argument;
    return markFunction(function( seed, matches ) {
      var j,
        matchIndexes = fn( [], seed.length, argument ),
        i = matchIndexes.length;

      // Match elements found at the specified indexes
      while ( i-- ) {
        if ( seed[ (j = matchIndexes[i]) ] ) {
          seed[j] = !(matches[j] = seed[j]);
        }
      }
    });
  });
}

/**
 * Detect xml
 * @param {Element|Object} elem An element or a document
 */
isXML = Sizzle.isXML = function( elem ) {
  // documentElement is verified for cases where it doesn't yet exist
  // (such as loading iframes in IE - #4833)
  var documentElement = elem && (elem.ownerDocument || elem).documentElement;
  return documentElement ? documentElement.nodeName !== "HTML" : false;
};

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
  var doc = node ? node.ownerDocument || node : preferredDoc,
    parent = doc.parentWindow;

  // If no document and documentElement is available, return
  if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
    return document;
  }

  // Set our document
  document = doc;
  docElem = doc.documentElement;

  // Support tests
  documentIsHTML = !isXML( doc );

  // Support: IE>8
  // If iframe document is assigned to "document" variable and if iframe has been reloaded,
  // IE will throw "permission denied" error when accessing "document" variable, see jQuery #13936
  if ( parent && parent.frameElement ) {
    parent.attachEvent( "onbeforeunload", function() {
      setDocument();
    });
  }

  /* Attributes
  ---------------------------------------------------------------------- */

  // Support: IE<8
  // Verify that getAttribute really returns attributes and not properties (excepting IE8 booleans)
  support.attributes = assert(function( div ) {

    // Support: IE<8
    // Prevent attribute/property "interpolation"
    div.innerHTML = "<a href='#'></a>";
    addHandle( "type|href|height|width", interpolationHandler, div.firstChild.getAttribute("href") === "#" );

    // Support: IE<9
    // Use getAttributeNode to fetch booleans when getAttribute lies
    addHandle( booleans, boolHandler, div.getAttribute("disabled") == null );

    div.className = "i";
    return !div.getAttribute("className");
  });

  // Support: IE<9
  // Retrieving value should defer to defaultValue
  support.input = assert(function( div ) {
    div.innerHTML = "<input>";
    div.firstChild.setAttribute( "value", "" );
    return div.firstChild.getAttribute( "value" ) === "";
  });

  // IE6/7 still return empty string for value,
  // but are actually retrieving the property
  addHandle( "value", valueHandler, support.attributes && support.input );

  /* getElement(s)By*
  ---------------------------------------------------------------------- */

  // Check if getElementsByTagName("*") returns only elements
  support.getElementsByTagName = assert(function( div ) {
    div.appendChild( doc.createComment("") );
    return !div.getElementsByTagName("*").length;
  });

  // Check if getElementsByClassName can be trusted
  support.getElementsByClassName = assert(function( div ) {
    div.innerHTML = "<div class='a'></div><div class='a i'></div>";

    // Support: Safari<4
    // Catch class over-caching
    div.firstChild.className = "i";
    // Support: Opera<10
    // Catch gEBCN failure to find non-leading classes
    return div.getElementsByClassName("i").length === 2;
  });

  // Support: IE<10
  // Check if getElementById returns elements by name
  // The broken getElementById methods don't pick up programatically-set names,
  // so use a roundabout getElementsByName test
  support.getById = assert(function( div ) {
    docElem.appendChild( div ).id = expando;
    return !doc.getElementsByName || !doc.getElementsByName( expando ).length;
  });

  // ID find and filter
  if ( support.getById ) {
    Expr.find["ID"] = function( id, context ) {
      if ( typeof context.getElementById !== strundefined && documentIsHTML ) {
        var m = context.getElementById( id );
        // Check parentNode to catch when Blackberry 4.6 returns
        // nodes that are no longer in the document #6963
        return m && m.parentNode ? [m] : [];
      }
    };
    Expr.filter["ID"] = function( id ) {
      var attrId = id.replace( runescape, funescape );
      return function( elem ) {
        return elem.getAttribute("id") === attrId;
      };
    };
  } else {
    // Support: IE6/7
    // getElementById is not reliable as a find shortcut
    delete Expr.find["ID"];

    Expr.filter["ID"] =  function( id ) {
      var attrId = id.replace( runescape, funescape );
      return function( elem ) {
        var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
        return node && node.value === attrId;
      };
    };
  }

  // Tag
  Expr.find["TAG"] = support.getElementsByTagName ?
    function( tag, context ) {
      if ( typeof context.getElementsByTagName !== strundefined ) {
        return context.getElementsByTagName( tag );
      }
    } :
    function( tag, context ) {
      var elem,
        tmp = [],
        i = 0,
        results = context.getElementsByTagName( tag );

      // Filter out possible comments
      if ( tag === "*" ) {
        while ( (elem = results[i++]) ) {
          if ( elem.nodeType === 1 ) {
            tmp.push( elem );
          }
        }

        return tmp;
      }
      return results;
    };

  // Class
  Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
    if ( typeof context.getElementsByClassName !== strundefined && documentIsHTML ) {
      return context.getElementsByClassName( className );
    }
  };

  /* QSA/matchesSelector
  ---------------------------------------------------------------------- */

  // QSA and matchesSelector support

  // matchesSelector(:active) reports false when true (IE9/Opera 11.5)
  rbuggyMatches = [];

  // qSa(:focus) reports false when true (Chrome 21)
  // We allow this because of a bug in IE8/9 that throws an error
  // whenever `document.activeElement` is accessed on an iframe
  // So, we allow :focus to pass through QSA all the time to avoid the IE error
  // See http://bugs.jquery.com/ticket/13378
  rbuggyQSA = [];

  if ( (support.qsa = isNative(doc.querySelectorAll)) ) {
    // Build QSA regex
    // Regex strategy adopted from Diego Perini
    assert(function( div ) {
      // Select is set to empty string on purpose
      // This is to test IE's treatment of not explicitly
      // setting a boolean content attribute,
      // since its presence should be enough
      // http://bugs.jquery.com/ticket/12359
      div.innerHTML = "<select><option selected=''></option></select>";

      // Support: IE8
      // Boolean attributes and "value" are not treated correctly
      if ( !div.querySelectorAll("[selected]").length ) {
        rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
      }

      // Webkit/Opera - :checked should return selected option elements
      // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
      // IE8 throws error here and will not see later tests
      if ( !div.querySelectorAll(":checked").length ) {
        rbuggyQSA.push(":checked");
      }
    });

    assert(function( div ) {

      // Support: Opera 10-12/IE8
      // ^= $= *= and empty values
      // Should not select anything
      // Support: Windows 8 Native Apps
      // The type attribute is restricted during .innerHTML assignment
      var input = doc.createElement("input");
      input.setAttribute( "type", "hidden" );
      div.appendChild( input ).setAttribute( "t", "" );

      if ( div.querySelectorAll("[t^='']").length ) {
        rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
      }

      // FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
      // IE8 throws error here and will not see later tests
      if ( !div.querySelectorAll(":enabled").length ) {
        rbuggyQSA.push( ":enabled", ":disabled" );
      }

      // Opera 10-11 does not throw on post-comma invalid pseudos
      div.querySelectorAll("*,:x");
      rbuggyQSA.push(",.*:");
    });
  }

  if ( (support.matchesSelector = isNative( (matches = docElem.webkitMatchesSelector ||
    docElem.mozMatchesSelector ||
    docElem.oMatchesSelector ||
    docElem.msMatchesSelector) )) ) {

    assert(function( div ) {
      // Check to see if it's possible to do matchesSelector
      // on a disconnected node (IE 9)
      support.disconnectedMatch = matches.call( div, "div" );

      // This should fail with an exception
      // Gecko does not error, returns false instead
      matches.call( div, "[s!='']:x" );
      rbuggyMatches.push( "!=", pseudos );
    });
  }

  rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
  rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

  /* Contains
  ---------------------------------------------------------------------- */

  // Element contains another
  // Purposefully does not implement inclusive descendent
  // As in, an element does not contain itself
  contains = isNative(docElem.contains) || docElem.compareDocumentPosition ?
    function( a, b ) {
      var adown = a.nodeType === 9 ? a.documentElement : a,
        bup = b && b.parentNode;
      return a === bup || !!( bup && bup.nodeType === 1 && (
        adown.contains ?
          adown.contains( bup ) :
          a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
      ));
    } :
    function( a, b ) {
      if ( b ) {
        while ( (b = b.parentNode) ) {
          if ( b === a ) {
            return true;
          }
        }
      }
      return false;
    };

  /* Sorting
  ---------------------------------------------------------------------- */

  // Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
  // Detached nodes confoundingly follow *each other*
  support.sortDetached = assert(function( div1 ) {
    // Should return 1, but returns 4 (following)
    return div1.compareDocumentPosition( doc.createElement("div") ) & 1;
  });

  // Document order sorting
  sortOrder = docElem.compareDocumentPosition ?
  function( a, b ) {

    // Flag for duplicate removal
    if ( a === b ) {
      hasDuplicate = true;
      return 0;
    }

    var compare = b.compareDocumentPosition && a.compareDocumentPosition && a.compareDocumentPosition( b );

    if ( compare ) {
      // Disconnected nodes
      if ( compare & 1 ||
        (!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

        // Choose the first element that is related to our preferred document
        if ( a === doc || contains(preferredDoc, a) ) {
          return -1;
        }
        if ( b === doc || contains(preferredDoc, b) ) {
          return 1;
        }

        // Maintain original order
        return sortInput ?
          ( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
          0;
      }

      return compare & 4 ? -1 : 1;
    }

    // Not directly comparable, sort on existence of method
    return a.compareDocumentPosition ? -1 : 1;
  } :
  function( a, b ) {
    var cur,
      i = 0,
      aup = a.parentNode,
      bup = b.parentNode,
      ap = [ a ],
      bp = [ b ];

    // Exit early if the nodes are identical
    if ( a === b ) {
      hasDuplicate = true;
      return 0;

    // Parentless nodes are either documents or disconnected
    } else if ( !aup || !bup ) {
      return a === doc ? -1 :
        b === doc ? 1 :
        aup ? -1 :
        bup ? 1 :
        sortInput ?
        ( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
        0;

    // If the nodes are siblings, we can do a quick check
    } else if ( aup === bup ) {
      return siblingCheck( a, b );
    }

    // Otherwise we need full lists of their ancestors for comparison
    cur = a;
    while ( (cur = cur.parentNode) ) {
      ap.unshift( cur );
    }
    cur = b;
    while ( (cur = cur.parentNode) ) {
      bp.unshift( cur );
    }

    // Walk down the tree looking for a discrepancy
    while ( ap[i] === bp[i] ) {
      i++;
    }

    return i ?
      // Do a sibling check if the nodes have a common ancestor
      siblingCheck( ap[i], bp[i] ) :

      // Otherwise nodes in our document sort first
      ap[i] === preferredDoc ? -1 :
      bp[i] === preferredDoc ? 1 :
      0;
  };

  return doc;
};

Sizzle.matches = function( expr, elements ) {
  return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
  // Set document vars if needed
  if ( ( elem.ownerDocument || elem ) !== document ) {
    setDocument( elem );
  }

  // Make sure that attribute selectors are quoted
  expr = expr.replace( rattributeQuotes, "='$1']" );

  if ( support.matchesSelector && documentIsHTML &&
    ( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
    ( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

    try {
      var ret = matches.call( elem, expr );

      // IE 9's matchesSelector returns false on disconnected nodes
      if ( ret || support.disconnectedMatch ||
          // As well, disconnected nodes are said to be in a document
          // fragment in IE 9
          elem.document && elem.document.nodeType !== 11 ) {
        return ret;
      }
    } catch(e) {}
  }

  return Sizzle( expr, document, null, [elem] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
  // Set document vars if needed
  if ( ( context.ownerDocument || context ) !== document ) {
    setDocument( context );
  }
  return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
  // Set document vars if needed
  if ( ( elem.ownerDocument || elem ) !== document ) {
    setDocument( elem );
  }

  var fn = Expr.attrHandle[ name.toLowerCase() ],
    // Don't get fooled by Object.prototype properties (jQuery #13807)
    val = ( fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
      fn( elem, name, !documentIsHTML ) :
      undefined );

  return val === undefined ?
    support.attributes || !documentIsHTML ?
      elem.getAttribute( name ) :
      (val = elem.getAttributeNode(name)) && val.specified ?
        val.value :
        null :
    val;
};

Sizzle.error = function( msg ) {
  throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
  var elem,
    duplicates = [],
    j = 0,
    i = 0;

  // Unless we *know* we can detect duplicates, assume their presence
  hasDuplicate = !support.detectDuplicates;
  sortInput = !support.sortStable && results.slice( 0 );
  results.sort( sortOrder );

  if ( hasDuplicate ) {
    while ( (elem = results[i++]) ) {
      if ( elem === results[ i ] ) {
        j = duplicates.push( i );
      }
    }
    while ( j-- ) {
      results.splice( duplicates[ j ], 1 );
    }
  }

  return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
  var node,
    ret = "",
    i = 0,
    nodeType = elem.nodeType;

  if ( !nodeType ) {
    // If no nodeType, this is expected to be an array
    for ( ; (node = elem[i]); i++ ) {
      // Do not traverse comment nodes
      ret += getText( node );
    }
  } else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
    // Use textContent for elements
    // innerText usage removed for consistency of new lines (see #11153)
    if ( typeof elem.textContent === "string" ) {
      return elem.textContent;
    } else {
      // Traverse its children
      for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
        ret += getText( elem );
      }
    }
  } else if ( nodeType === 3 || nodeType === 4 ) {
    return elem.nodeValue;
  }
  // Do not include comment or processing instruction nodes

  return ret;
};

Expr = Sizzle.selectors = {

  // Can be adjusted by the user
  cacheLength: 50,

  createPseudo: markFunction,

  match: matchExpr,

  attrHandle: {},

  find: {},

  relative: {
    ">": { dir: "parentNode", first: true },
    " ": { dir: "parentNode" },
    "+": { dir: "previousSibling", first: true },
    "~": { dir: "previousSibling" }
  },

  preFilter: {
    "ATTR": function( match ) {
      match[1] = match[1].replace( runescape, funescape );

      // Move the given value to match[3] whether quoted or unquoted
      match[3] = ( match[4] || match[5] || "" ).replace( runescape, funescape );

      if ( match[2] === "~=" ) {
        match[3] = " " + match[3] + " ";
      }

      return match.slice( 0, 4 );
    },

    "CHILD": function( match ) {
      /* matches from matchExpr["CHILD"]
        1 type (only|nth|...)
        2 what (child|of-type)
        3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
        4 xn-component of xn+y argument ([+-]?\d*n|)
        5 sign of xn-component
        6 x of xn-component
        7 sign of y-component
        8 y of y-component
      */
      match[1] = match[1].toLowerCase();

      if ( match[1].slice( 0, 3 ) === "nth" ) {
        // nth-* requires argument
        if ( !match[3] ) {
          Sizzle.error( match[0] );
        }

        // numeric x and y parameters for Expr.filter.CHILD
        // remember that false/true cast respectively to 0/1
        match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
        match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

      // other types prohibit arguments
      } else if ( match[3] ) {
        Sizzle.error( match[0] );
      }

      return match;
    },

    "PSEUDO": function( match ) {
      var excess,
        unquoted = !match[5] && match[2];

      if ( matchExpr["CHILD"].test( match[0] ) ) {
        return null;
      }

      // Accept quoted arguments as-is
      if ( match[3] && match[4] !== undefined ) {
        match[2] = match[4];

      // Strip excess characters from unquoted arguments
      } else if ( unquoted && rpseudo.test( unquoted ) &&
        // Get excess from tokenize (recursively)
        (excess = tokenize( unquoted, true )) &&
        // advance to the next closing parenthesis
        (excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

        // excess is a negative index
        match[0] = match[0].slice( 0, excess );
        match[2] = unquoted.slice( 0, excess );
      }

      // Return only captures needed by the pseudo filter method (type and argument)
      return match.slice( 0, 3 );
    }
  },

  filter: {

    "TAG": function( nodeNameSelector ) {
      var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
      return nodeNameSelector === "*" ?
        function() { return true; } :
        function( elem ) {
          return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
        };
    },

    "CLASS": function( className ) {
      var pattern = classCache[ className + " " ];

      return pattern ||
        (pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
        classCache( className, function( elem ) {
          return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== strundefined && elem.getAttribute("class") || "" );
        });
    },

    "ATTR": function( name, operator, check ) {
      return function( elem ) {
        var result = Sizzle.attr( elem, name );

        if ( result == null ) {
          return operator === "!=";
        }
        if ( !operator ) {
          return true;
        }

        result += "";

        return operator === "=" ? result === check :
          operator === "!=" ? result !== check :
          operator === "^=" ? check && result.indexOf( check ) === 0 :
          operator === "*=" ? check && result.indexOf( check ) > -1 :
          operator === "$=" ? check && result.slice( -check.length ) === check :
          operator === "~=" ? ( " " + result + " " ).indexOf( check ) > -1 :
          operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
          false;
      };
    },

    "CHILD": function( type, what, argument, first, last ) {
      var simple = type.slice( 0, 3 ) !== "nth",
        forward = type.slice( -4 ) !== "last",
        ofType = what === "of-type";

      return first === 1 && last === 0 ?

        // Shortcut for :nth-*(n)
        function( elem ) {
          return !!elem.parentNode;
        } :

        function( elem, context, xml ) {
          var cache, outerCache, node, diff, nodeIndex, start,
            dir = simple !== forward ? "nextSibling" : "previousSibling",
            parent = elem.parentNode,
            name = ofType && elem.nodeName.toLowerCase(),
            useCache = !xml && !ofType;

          if ( parent ) {

            // :(first|last|only)-(child|of-type)
            if ( simple ) {
              while ( dir ) {
                node = elem;
                while ( (node = node[ dir ]) ) {
                  if ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) {
                    return false;
                  }
                }
                // Reverse direction for :only-* (if we haven't yet done so)
                start = dir = type === "only" && !start && "nextSibling";
              }
              return true;
            }

            start = [ forward ? parent.firstChild : parent.lastChild ];

            // non-xml :nth-child(...) stores cache data on `parent`
            if ( forward && useCache ) {
              // Seek `elem` from a previously-cached index
              outerCache = parent[ expando ] || (parent[ expando ] = {});
              cache = outerCache[ type ] || [];
              nodeIndex = cache[0] === dirruns && cache[1];
              diff = cache[0] === dirruns && cache[2];
              node = nodeIndex && parent.childNodes[ nodeIndex ];

              while ( (node = ++nodeIndex && node && node[ dir ] ||

                // Fallback to seeking `elem` from the start
                (diff = nodeIndex = 0) || start.pop()) ) {

                // When found, cache indexes on `parent` and break
                if ( node.nodeType === 1 && ++diff && node === elem ) {
                  outerCache[ type ] = [ dirruns, nodeIndex, diff ];
                  break;
                }
              }

            // Use previously-cached element index if available
            } else if ( useCache && (cache = (elem[ expando ] || (elem[ expando ] = {}))[ type ]) && cache[0] === dirruns ) {
              diff = cache[1];

            // xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
            } else {
              // Use the same loop as above to seek `elem` from the start
              while ( (node = ++nodeIndex && node && node[ dir ] ||
                (diff = nodeIndex = 0) || start.pop()) ) {

                if ( ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) && ++diff ) {
                  // Cache the index of each encountered element
                  if ( useCache ) {
                    (node[ expando ] || (node[ expando ] = {}))[ type ] = [ dirruns, diff ];
                  }

                  if ( node === elem ) {
                    break;
                  }
                }
              }
            }

            // Incorporate the offset, then check against cycle size
            diff -= last;
            return diff === first || ( diff % first === 0 && diff / first >= 0 );
          }
        };
    },

    "PSEUDO": function( pseudo, argument ) {
      // pseudo-class names are case-insensitive
      // http://www.w3.org/TR/selectors/#pseudo-classes
      // Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
      // Remember that setFilters inherits from pseudos
      var args,
        fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
          Sizzle.error( "unsupported pseudo: " + pseudo );

      // The user may use createPseudo to indicate that
      // arguments are needed to create the filter function
      // just as Sizzle does
      if ( fn[ expando ] ) {
        return fn( argument );
      }

      // But maintain support for old signatures
      if ( fn.length > 1 ) {
        args = [ pseudo, pseudo, "", argument ];
        return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
          markFunction(function( seed, matches ) {
            var idx,
              matched = fn( seed, argument ),
              i = matched.length;
            while ( i-- ) {
              idx = indexOf.call( seed, matched[i] );
              seed[ idx ] = !( matches[ idx ] = matched[i] );
            }
          }) :
          function( elem ) {
            return fn( elem, 0, args );
          };
      }

      return fn;
    }
  },

  pseudos: {
    // Potentially complex pseudos
    "not": markFunction(function( selector ) {
      // Trim the selector passed to compile
      // to avoid treating leading and trailing
      // spaces as combinators
      var input = [],
        results = [],
        matcher = compile( selector.replace( rtrim, "$1" ) );

      return matcher[ expando ] ?
        markFunction(function( seed, matches, context, xml ) {
          var elem,
            unmatched = matcher( seed, null, xml, [] ),
            i = seed.length;

          // Match elements unmatched by `matcher`
          while ( i-- ) {
            if ( (elem = unmatched[i]) ) {
              seed[i] = !(matches[i] = elem);
            }
          }
        }) :
        function( elem, context, xml ) {
          input[0] = elem;
          matcher( input, null, xml, results );
          return !results.pop();
        };
    }),

    "has": markFunction(function( selector ) {
      return function( elem ) {
        return Sizzle( selector, elem ).length > 0;
      };
    }),

    "contains": markFunction(function( text ) {
      return function( elem ) {
        return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
      };
    }),

    // "Whether an element is represented by a :lang() selector
    // is based solely on the element's language value
    // being equal to the identifier C,
    // or beginning with the identifier C immediately followed by "-".
    // The matching of C against the element's language value is performed case-insensitively.
    // The identifier C does not have to be a valid language name."
    // http://www.w3.org/TR/selectors/#lang-pseudo
    "lang": markFunction( function( lang ) {
      // lang value must be a valid identifier
      if ( !ridentifier.test(lang || "") ) {
        Sizzle.error( "unsupported lang: " + lang );
      }
      lang = lang.replace( runescape, funescape ).toLowerCase();
      return function( elem ) {
        var elemLang;
        do {
          if ( (elemLang = documentIsHTML ?
            elem.lang :
            elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

            elemLang = elemLang.toLowerCase();
            return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
          }
        } while ( (elem = elem.parentNode) && elem.nodeType === 1 );
        return false;
      };
    }),

    // Miscellaneous
    "target": function( elem ) {
      var hash = window.location && window.location.hash;
      return hash && hash.slice( 1 ) === elem.id;
    },

    "root": function( elem ) {
      return elem === docElem;
    },

    "focus": function( elem ) {
      return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
    },

    // Boolean properties
    "enabled": function( elem ) {
      return elem.disabled === false;
    },

    "disabled": function( elem ) {
      return elem.disabled === true;
    },

    "checked": function( elem ) {
      // In CSS3, :checked should return both checked and selected elements
      // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
      var nodeName = elem.nodeName.toLowerCase();
      return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
    },

    "selected": function( elem ) {
      // Accessing this property makes selected-by-default
      // options in Safari work properly
      if ( elem.parentNode ) {
        elem.parentNode.selectedIndex;
      }

      return elem.selected === true;
    },

    // Contents
    "empty": function( elem ) {
      // http://www.w3.org/TR/selectors/#empty-pseudo
      // :empty is only affected by element nodes and content nodes(including text(3), cdata(4)),
      //   not comment, processing instructions, or others
      // Thanks to Diego Perini for the nodeName shortcut
      //   Greater than "@" means alpha characters (specifically not starting with "#" or "?")
      for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
        if ( elem.nodeName > "@" || elem.nodeType === 3 || elem.nodeType === 4 ) {
          return false;
        }
      }
      return true;
    },

    "parent": function( elem ) {
      return !Expr.pseudos["empty"]( elem );
    },

    // Element/input types
    "header": function( elem ) {
      return rheader.test( elem.nodeName );
    },

    "input": function( elem ) {
      return rinputs.test( elem.nodeName );
    },

    "button": function( elem ) {
      var name = elem.nodeName.toLowerCase();
      return name === "input" && elem.type === "button" || name === "button";
    },

    "text": function( elem ) {
      var attr;
      // IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
      // use getAttribute instead to test this case
      return elem.nodeName.toLowerCase() === "input" &&
        elem.type === "text" &&
        ( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === elem.type );
    },

    // Position-in-collection
    "first": createPositionalPseudo(function() {
      return [ 0 ];
    }),

    "last": createPositionalPseudo(function( matchIndexes, length ) {
      return [ length - 1 ];
    }),

    "eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
      return [ argument < 0 ? argument + length : argument ];
    }),

    "even": createPositionalPseudo(function( matchIndexes, length ) {
      var i = 0;
      for ( ; i < length; i += 2 ) {
        matchIndexes.push( i );
      }
      return matchIndexes;
    }),

    "odd": createPositionalPseudo(function( matchIndexes, length ) {
      var i = 1;
      for ( ; i < length; i += 2 ) {
        matchIndexes.push( i );
      }
      return matchIndexes;
    }),

    "lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
      var i = argument < 0 ? argument + length : argument;
      for ( ; --i >= 0; ) {
        matchIndexes.push( i );
      }
      return matchIndexes;
    }),

    "gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
      var i = argument < 0 ? argument + length : argument;
      for ( ; ++i < length; ) {
        matchIndexes.push( i );
      }
      return matchIndexes;
    })
  }
};

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
  Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
  Expr.pseudos[ i ] = createButtonPseudo( i );
}

function tokenize( selector, parseOnly ) {
  var matched, match, tokens, type,
    soFar, groups, preFilters,
    cached = tokenCache[ selector + " " ];

  if ( cached ) {
    return parseOnly ? 0 : cached.slice( 0 );
  }

  soFar = selector;
  groups = [];
  preFilters = Expr.preFilter;

  while ( soFar ) {

    // Comma and first run
    if ( !matched || (match = rcomma.exec( soFar )) ) {
      if ( match ) {
        // Don't consume trailing commas as valid
        soFar = soFar.slice( match[0].length ) || soFar;
      }
      groups.push( tokens = [] );
    }

    matched = false;

    // Combinators
    if ( (match = rcombinators.exec( soFar )) ) {
      matched = match.shift();
      tokens.push({
        value: matched,
        // Cast descendant combinators to space
        type: match[0].replace( rtrim, " " )
      });
      soFar = soFar.slice( matched.length );
    }

    // Filters
    for ( type in Expr.filter ) {
      if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
        (match = preFilters[ type ]( match ))) ) {
        matched = match.shift();
        tokens.push({
          value: matched,
          type: type,
          matches: match
        });
        soFar = soFar.slice( matched.length );
      }
    }

    if ( !matched ) {
      break;
    }
  }

  // Return the length of the invalid excess
  // if we're just parsing
  // Otherwise, throw an error or return tokens
  return parseOnly ?
    soFar.length :
    soFar ?
      Sizzle.error( selector ) :
      // Cache the tokens
      tokenCache( selector, groups ).slice( 0 );
}

function toSelector( tokens ) {
  var i = 0,
    len = tokens.length,
    selector = "";
  for ( ; i < len; i++ ) {
    selector += tokens[i].value;
  }
  return selector;
}

function addCombinator( matcher, combinator, base ) {
  var dir = combinator.dir,
    checkNonElements = base && dir === "parentNode",
    doneName = done++;

  return combinator.first ?
    // Check against closest ancestor/preceding element
    function( elem, context, xml ) {
      while ( (elem = elem[ dir ]) ) {
        if ( elem.nodeType === 1 || checkNonElements ) {
          return matcher( elem, context, xml );
        }
      }
    } :

    // Check against all ancestor/preceding elements
    function( elem, context, xml ) {
      var data, cache, outerCache,
        dirkey = dirruns + " " + doneName;

      // We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
      if ( xml ) {
        while ( (elem = elem[ dir ]) ) {
          if ( elem.nodeType === 1 || checkNonElements ) {
            if ( matcher( elem, context, xml ) ) {
              return true;
            }
          }
        }
      } else {
        while ( (elem = elem[ dir ]) ) {
          if ( elem.nodeType === 1 || checkNonElements ) {
            outerCache = elem[ expando ] || (elem[ expando ] = {});
            if ( (cache = outerCache[ dir ]) && cache[0] === dirkey ) {
              if ( (data = cache[1]) === true || data === cachedruns ) {
                return data === true;
              }
            } else {
              cache = outerCache[ dir ] = [ dirkey ];
              cache[1] = matcher( elem, context, xml ) || cachedruns;
              if ( cache[1] === true ) {
                return true;
              }
            }
          }
        }
      }
    };
}

function elementMatcher( matchers ) {
  return matchers.length > 1 ?
    function( elem, context, xml ) {
      var i = matchers.length;
      while ( i-- ) {
        if ( !matchers[i]( elem, context, xml ) ) {
          return false;
        }
      }
      return true;
    } :
    matchers[0];
}

function condense( unmatched, map, filter, context, xml ) {
  var elem,
    newUnmatched = [],
    i = 0,
    len = unmatched.length,
    mapped = map != null;

  for ( ; i < len; i++ ) {
    if ( (elem = unmatched[i]) ) {
      if ( !filter || filter( elem, context, xml ) ) {
        newUnmatched.push( elem );
        if ( mapped ) {
          map.push( i );
        }
      }
    }
  }

  return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
  if ( postFilter && !postFilter[ expando ] ) {
    postFilter = setMatcher( postFilter );
  }
  if ( postFinder && !postFinder[ expando ] ) {
    postFinder = setMatcher( postFinder, postSelector );
  }
  return markFunction(function( seed, results, context, xml ) {
    var temp, i, elem,
      preMap = [],
      postMap = [],
      preexisting = results.length,

      // Get initial elements from seed or context
      elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

      // Prefilter to get matcher input, preserving a map for seed-results synchronization
      matcherIn = preFilter && ( seed || !selector ) ?
        condense( elems, preMap, preFilter, context, xml ) :
        elems,

      matcherOut = matcher ?
        // If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
        postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

          // ...intermediate processing is necessary
          [] :

          // ...otherwise use results directly
          results :
        matcherIn;

    // Find primary matches
    if ( matcher ) {
      matcher( matcherIn, matcherOut, context, xml );
    }

    // Apply postFilter
    if ( postFilter ) {
      temp = condense( matcherOut, postMap );
      postFilter( temp, [], context, xml );

      // Un-match failing elements by moving them back to matcherIn
      i = temp.length;
      while ( i-- ) {
        if ( (elem = temp[i]) ) {
          matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
        }
      }
    }

    if ( seed ) {
      if ( postFinder || preFilter ) {
        if ( postFinder ) {
          // Get the final matcherOut by condensing this intermediate into postFinder contexts
          temp = [];
          i = matcherOut.length;
          while ( i-- ) {
            if ( (elem = matcherOut[i]) ) {
              // Restore matcherIn since elem is not yet a final match
              temp.push( (matcherIn[i] = elem) );
            }
          }
          postFinder( null, (matcherOut = []), temp, xml );
        }

        // Move matched elements from seed to results to keep them synchronized
        i = matcherOut.length;
        while ( i-- ) {
          if ( (elem = matcherOut[i]) &&
            (temp = postFinder ? indexOf.call( seed, elem ) : preMap[i]) > -1 ) {

            seed[temp] = !(results[temp] = elem);
          }
        }
      }

    // Add elements to results, through postFinder if defined
    } else {
      matcherOut = condense(
        matcherOut === results ?
          matcherOut.splice( preexisting, matcherOut.length ) :
          matcherOut
      );
      if ( postFinder ) {
        postFinder( null, results, matcherOut, xml );
      } else {
        push.apply( results, matcherOut );
      }
    }
  });
}

function matcherFromTokens( tokens ) {
  var checkContext, matcher, j,
    len = tokens.length,
    leadingRelative = Expr.relative[ tokens[0].type ],
    implicitRelative = leadingRelative || Expr.relative[" "],
    i = leadingRelative ? 1 : 0,

    // The foundational matcher ensures that elements are reachable from top-level context(s)
    matchContext = addCombinator( function( elem ) {
      return elem === checkContext;
    }, implicitRelative, true ),
    matchAnyContext = addCombinator( function( elem ) {
      return indexOf.call( checkContext, elem ) > -1;
    }, implicitRelative, true ),
    matchers = [ function( elem, context, xml ) {
      return ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
        (checkContext = context).nodeType ?
          matchContext( elem, context, xml ) :
          matchAnyContext( elem, context, xml ) );
    } ];

  for ( ; i < len; i++ ) {
    if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
      matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
    } else {
      matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

      // Return special upon seeing a positional matcher
      if ( matcher[ expando ] ) {
        // Find the next relative operator (if any) for proper handling
        j = ++i;
        for ( ; j < len; j++ ) {
          if ( Expr.relative[ tokens[j].type ] ) {
            break;
          }
        }
        return setMatcher(
          i > 1 && elementMatcher( matchers ),
          i > 1 && toSelector(
            // If the preceding token was a descendant combinator, insert an implicit any-element `*`
            tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
          ).replace( rtrim, "$1" ),
          matcher,
          i < j && matcherFromTokens( tokens.slice( i, j ) ),
          j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
          j < len && toSelector( tokens )
        );
      }
      matchers.push( matcher );
    }
  }

  return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
  // A counter to specify which element is currently being matched
  var matcherCachedRuns = 0,
    bySet = setMatchers.length > 0,
    byElement = elementMatchers.length > 0,
    superMatcher = function( seed, context, xml, results, expandContext ) {
      var elem, j, matcher,
        setMatched = [],
        matchedCount = 0,
        i = "0",
        unmatched = seed && [],
        outermost = expandContext != null,
        contextBackup = outermostContext,
        // We must always have either seed elements or context
        elems = seed || byElement && Expr.find["TAG"]( "*", expandContext && context.parentNode || context ),
        // Use integer dirruns iff this is the outermost matcher
        dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1);

      if ( outermost ) {
        outermostContext = context !== document && context;
        cachedruns = matcherCachedRuns;
      }

      // Add elements passing elementMatchers directly to results
      // Keep `i` a string if there are no elements so `matchedCount` will be "00" below
      for ( ; (elem = elems[i]) != null; i++ ) {
        if ( byElement && elem ) {
          j = 0;
          while ( (matcher = elementMatchers[j++]) ) {
            if ( matcher( elem, context, xml ) ) {
              results.push( elem );
              break;
            }
          }
          if ( outermost ) {
            dirruns = dirrunsUnique;
            cachedruns = ++matcherCachedRuns;
          }
        }

        // Track unmatched elements for set filters
        if ( bySet ) {
          // They will have gone through all possible matchers
          if ( (elem = !matcher && elem) ) {
            matchedCount--;
          }

          // Lengthen the array for every element, matched or not
          if ( seed ) {
            unmatched.push( elem );
          }
        }
      }

      // Apply set filters to unmatched elements
      matchedCount += i;
      if ( bySet && i !== matchedCount ) {
        j = 0;
        while ( (matcher = setMatchers[j++]) ) {
          matcher( unmatched, setMatched, context, xml );
        }

        if ( seed ) {
          // Reintegrate element matches to eliminate the need for sorting
          if ( matchedCount > 0 ) {
            while ( i-- ) {
              if ( !(unmatched[i] || setMatched[i]) ) {
                setMatched[i] = pop.call( results );
              }
            }
          }

          // Discard index placeholder values to get only actual matches
          setMatched = condense( setMatched );
        }

        // Add matches to results
        push.apply( results, setMatched );

        // Seedless set matches succeeding multiple successful matchers stipulate sorting
        if ( outermost && !seed && setMatched.length > 0 &&
          ( matchedCount + setMatchers.length ) > 1 ) {

          Sizzle.uniqueSort( results );
        }
      }

      // Override manipulation of globals by nested matchers
      if ( outermost ) {
        dirruns = dirrunsUnique;
        outermostContext = contextBackup;
      }

      return unmatched;
    };

  return bySet ?
    markFunction( superMatcher ) :
    superMatcher;
}

compile = Sizzle.compile = function( selector, group /* Internal Use Only */ ) {
  var i,
    setMatchers = [],
    elementMatchers = [],
    cached = compilerCache[ selector + " " ];

  if ( !cached ) {
    // Generate a function of recursive functions that can be used to check each element
    if ( !group ) {
      group = tokenize( selector );
    }
    i = group.length;
    while ( i-- ) {
      cached = matcherFromTokens( group[i] );
      if ( cached[ expando ] ) {
        setMatchers.push( cached );
      } else {
        elementMatchers.push( cached );
      }
    }

    // Cache the compiled function
    cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );
  }
  return cached;
};

function multipleContexts( selector, contexts, results ) {
  var i = 0,
    len = contexts.length;
  for ( ; i < len; i++ ) {
    Sizzle( selector, contexts[i], results );
  }
  return results;
}

function select( selector, context, results, seed ) {
  var i, tokens, token, type, find,
    match = tokenize( selector );

  if ( !seed ) {
    // Try to minimize operations if there is only one group
    if ( match.length === 1 ) {

      // Take a shortcut and set the context if the root selector is an ID
      tokens = match[0] = match[0].slice( 0 );
      if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
          support.getById && context.nodeType === 9 && documentIsHTML &&
          Expr.relative[ tokens[1].type ] ) {

        context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
        if ( !context ) {
          return results;
        }
        selector = selector.slice( tokens.shift().value.length );
      }

      // Fetch a seed set for right-to-left matching
      i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
      while ( i-- ) {
        token = tokens[i];

        // Abort if we hit a combinator
        if ( Expr.relative[ (type = token.type) ] ) {
          break;
        }
        if ( (find = Expr.find[ type ]) ) {
          // Search, expanding context for leading sibling combinators
          if ( (seed = find(
            token.matches[0].replace( runescape, funescape ),
            rsibling.test( tokens[0].type ) && context.parentNode || context
          )) ) {

            // If seed is empty or no tokens remain, we can return early
            tokens.splice( i, 1 );
            selector = seed.length && toSelector( tokens );
            if ( !selector ) {
              push.apply( results, seed );
              return results;
            }

            break;
          }
        }
      }
    }
  }

  // Compile and execute a filtering function
  // Provide `match` to avoid retokenization if we modified the selector above
  compile( selector, match )(
    seed,
    context,
    !documentIsHTML,
    results,
    rsibling.test( selector )
  );
  return results;
}

// Deprecated
Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Initialize against the default document
setDocument();

// Support: Chrome<<14
// Always assume duplicates if they aren't passed to the comparison function
[0, 0].sort( sortOrder );
support.detectDuplicates = hasDuplicate;

jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.pseudos;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;


})( window );
// String to Object options format cache
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
function createOptions( options ) {
  var object = optionsCache[ options ] = {};
  jQuery.each( options.match( core_rnotwhite ) || [], function( _, flag ) {
    object[ flag ] = true;
  });
  return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *  options: an optional list of space-separated options that will change how
 *      the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *  once:     will ensure the callback list can only be fired once (like a Deferred)
 *
 *  memory:     will keep track of previous values and will call any callback added
 *          after the list has been fired right away with the latest "memorized"
 *          values (like a Deferred)
 *
 *  unique:     will ensure a callback can only be added once (no duplicate in the list)
 *
 *  stopOnFalse:  interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

  // Convert options from String-formatted to Object-formatted if needed
  // (we check in cache first)
  options = typeof options === "string" ?
    ( optionsCache[ options ] || createOptions( options ) ) :
    jQuery.extend( {}, options );

  var // Flag to know if list is currently firing
    firing,
    // Last fire value (for non-forgettable lists)
    memory,
    // Flag to know if list was already fired
    fired,
    // End of the loop when firing
    firingLength,
    // Index of currently firing callback (modified by remove if needed)
    firingIndex,
    // First callback to fire (used internally by add and fireWith)
    firingStart,
    // Actual callback list
    list = [],
    // Stack of fire calls for repeatable lists
    stack = !options.once && [],
    // Fire callbacks
    fire = function( data ) {
      memory = options.memory && data;
      fired = true;
      firingIndex = firingStart || 0;
      firingStart = 0;
      firingLength = list.length;
      firing = true;
      for ( ; list && firingIndex < firingLength; firingIndex++ ) {
        if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
          memory = false; // To prevent further calls using add
          break;
        }
      }
      firing = false;
      if ( list ) {
        if ( stack ) {
          if ( stack.length ) {
            fire( stack.shift() );
          }
        } else if ( memory ) {
          list = [];
        } else {
          self.disable();
        }
      }
    },
    // Actual Callbacks object
    self = {
      // Add a callback or a collection of callbacks to the list
      add: function() {
        if ( list ) {
          // First, we save the current length
          var start = list.length;
          (function add( args ) {
            jQuery.each( args, function( _, arg ) {
              var type = jQuery.type( arg );
              if ( type === "function" ) {
                if ( !options.unique || !self.has( arg ) ) {
                  list.push( arg );
                }
              } else if ( arg && arg.length && type !== "string" ) {
                // Inspect recursively
                add( arg );
              }
            });
          })( arguments );
          // Do we need to add the callbacks to the
          // current firing batch?
          if ( firing ) {
            firingLength = list.length;
          // With memory, if we're not firing then
          // we should call right away
          } else if ( memory ) {
            firingStart = start;
            fire( memory );
          }
        }
        return this;
      },
      // Remove a callback from the list
      remove: function() {
        if ( list ) {
          jQuery.each( arguments, function( _, arg ) {
            var index;
            while( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
              list.splice( index, 1 );
              // Handle firing indexes
              if ( firing ) {
                if ( index <= firingLength ) {
                  firingLength--;
                }
                if ( index <= firingIndex ) {
                  firingIndex--;
                }
              }
            }
          });
        }
        return this;
      },
      // Check if a given callback is in the list.
      // If no argument is given, return whether or not list has callbacks attached.
      has: function( fn ) {
        return fn ? jQuery.inArray( fn, list ) > -1 : !!( list && list.length );
      },
      // Remove all callbacks from the list
      empty: function() {
        list = [];
        firingLength = 0;
        return this;
      },
      // Have the list do nothing anymore
      disable: function() {
        list = stack = memory = undefined;
        return this;
      },
      // Is it disabled?
      disabled: function() {
        return !list;
      },
      // Lock the list in its current state
      lock: function() {
        stack = undefined;
        if ( !memory ) {
          self.disable();
        }
        return this;
      },
      // Is it locked?
      locked: function() {
        return !stack;
      },
      // Call all callbacks with the given context and arguments
      fireWith: function( context, args ) {
        args = args || [];
        args = [ context, args.slice ? args.slice() : args ];
        if ( list && ( !fired || stack ) ) {
          if ( firing ) {
            stack.push( args );
          } else {
            fire( args );
          }
        }
        return this;
      },
      // Call all the callbacks with the given arguments
      fire: function() {
        self.fireWith( this, arguments );
        return this;
      },
      // To know if the callbacks have already been called at least once
      fired: function() {
        return !!fired;
      }
    };

  return self;
};
jQuery.extend({

  Deferred: function( func ) {
    var tuples = [
        // action, add listener, listener list, final state
        [ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
        [ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
        [ "notify", "progress", jQuery.Callbacks("memory") ]
      ],
      state = "pending",
      promise = {
        state: function() {
          return state;
        },
        always: function() {
          deferred.done( arguments ).fail( arguments );
          return this;
        },
        then: function( /* fnDone, fnFail, fnProgress */ ) {
          var fns = arguments;
          return jQuery.Deferred(function( newDefer ) {
            jQuery.each( tuples, function( i, tuple ) {
              var action = tuple[ 0 ],
                fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];
              // deferred[ done | fail | progress ] for forwarding actions to newDefer
              deferred[ tuple[1] ](function() {
                var returned = fn && fn.apply( this, arguments );
                if ( returned && jQuery.isFunction( returned.promise ) ) {
                  returned.promise()
                    .done( newDefer.resolve )
                    .fail( newDefer.reject )
                    .progress( newDefer.notify );
                } else {
                  newDefer[ action + "With" ]( this === promise ? newDefer.promise() : this, fn ? [ returned ] : arguments );
                }
              });
            });
            fns = null;
          }).promise();
        },
        // Get a promise for this deferred
        // If obj is provided, the promise aspect is added to the object
        promise: function( obj ) {
          return obj != null ? jQuery.extend( obj, promise ) : promise;
        }
      },
      deferred = {};

    // Keep pipe for back-compat
    promise.pipe = promise.then;

    // Add list-specific methods
    jQuery.each( tuples, function( i, tuple ) {
      var list = tuple[ 2 ],
        stateString = tuple[ 3 ];

      // promise[ done | fail | progress ] = list.add
      promise[ tuple[1] ] = list.add;

      // Handle state
      if ( stateString ) {
        list.add(function() {
          // state = [ resolved | rejected ]
          state = stateString;

        // [ reject_list | resolve_list ].disable; progress_list.lock
        }, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
      }

      // deferred[ resolve | reject | notify ]
      deferred[ tuple[0] ] = function() {
        deferred[ tuple[0] + "With" ]( this === deferred ? promise : this, arguments );
        return this;
      };
      deferred[ tuple[0] + "With" ] = list.fireWith;
    });

    // Make the deferred a promise
    promise.promise( deferred );

    // Call given func if any
    if ( func ) {
      func.call( deferred, deferred );
    }

    // All done!
    return deferred;
  },

  // Deferred helper
  when: function( subordinate /* , ..., subordinateN */ ) {
    var i = 0,
      resolveValues = core_slice.call( arguments ),
      length = resolveValues.length,

      // the count of uncompleted subordinates
      remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

      // the master Deferred. If resolveValues consist of only a single Deferred, just use that.
      deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

      // Update function for both resolve and progress values
      updateFunc = function( i, contexts, values ) {
        return function( value ) {
          contexts[ i ] = this;
          values[ i ] = arguments.length > 1 ? core_slice.call( arguments ) : value;
          if( values === progressValues ) {
            deferred.notifyWith( contexts, values );
          } else if ( !( --remaining ) ) {
            deferred.resolveWith( contexts, values );
          }
        };
      },

      progressValues, progressContexts, resolveContexts;

    // add listeners to Deferred subordinates; treat others as resolved
    if ( length > 1 ) {
      progressValues = new Array( length );
      progressContexts = new Array( length );
      resolveContexts = new Array( length );
      for ( ; i < length; i++ ) {
        if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
          resolveValues[ i ].promise()
            .done( updateFunc( i, resolveContexts, resolveValues ) )
            .fail( deferred.reject )
            .progress( updateFunc( i, progressContexts, progressValues ) );
        } else {
          --remaining;
        }
      }
    }

    // if we're not waiting on anything, resolve the master
    if ( !remaining ) {
      deferred.resolveWith( resolveContexts, resolveValues );
    }

    return deferred.promise();
  }
});
jQuery.support = (function( support ) {

  var all, a, input, select, fragment, opt, eventName, isSupported, i,
    div = document.createElement("div");

  // Setup
  div.setAttribute( "className", "t" );
  div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";

  // Finish early in limited (non-browser) environments
  all = div.getElementsByTagName("*") || [];
  a = div.getElementsByTagName("a")[ 0 ];
  if ( !a || !a.style || !all.length ) {
    return support;
  }

  // First batch of tests
  select = document.createElement("select");
  opt = select.appendChild( document.createElement("option") );
  input = div.getElementsByTagName("input")[ 0 ];

  a.style.cssText = "top:1px;float:left;opacity:.5";

  // Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
  support.getSetAttribute = div.className !== "t";

  // IE strips leading whitespace when .innerHTML is used
  support.leadingWhitespace = div.firstChild.nodeType === 3;

  // Make sure that tbody elements aren't automatically inserted
  // IE will insert them into empty tables
  support.tbody = !div.getElementsByTagName("tbody").length;

  // Make sure that link elements get serialized correctly by innerHTML
  // This requires a wrapper element in IE
  support.htmlSerialize = !!div.getElementsByTagName("link").length;

  // Get the style information from getAttribute
  // (IE uses .cssText instead)
  support.style = /top/.test( a.getAttribute("style") );

  // Make sure that URLs aren't manipulated
  // (IE normalizes it by default)
  support.hrefNormalized = a.getAttribute("href") === "/a";

  // Make sure that element opacity exists
  // (IE uses filter instead)
  // Use a regex to work around a WebKit issue. See #5145
  support.opacity = /^0.5/.test( a.style.opacity );

  // Verify style float existence
  // (IE uses styleFloat instead of cssFloat)
  support.cssFloat = !!a.style.cssFloat;

  // Check the default checkbox/radio value ("" on WebKit; "on" elsewhere)
  support.checkOn = !!input.value;

  // Make sure that a selected-by-default option has a working selected property.
  // (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
  support.optSelected = opt.selected;

  // Tests for enctype support on a form (#6743)
  support.enctype = !!document.createElement("form").enctype;

  // Makes sure cloning an html5 element does not cause problems
  // Where outerHTML is undefined, this still works
  support.html5Clone = document.createElement("nav").cloneNode( true ).outerHTML !== "<:nav></:nav>";

  // Will be defined later
  support.inlineBlockNeedsLayout = false;
  support.shrinkWrapBlocks = false;
  support.pixelPosition = false;
  support.deleteExpando = true;
  support.noCloneEvent = true;
  support.reliableMarginRight = true;
  support.boxSizingReliable = true;

  // Make sure checked status is properly cloned
  input.checked = true;
  support.noCloneChecked = input.cloneNode( true ).checked;

  // Make sure that the options inside disabled selects aren't marked as disabled
  // (WebKit marks them as disabled)
  select.disabled = true;
  support.optDisabled = !opt.disabled;

  // Support: IE<9
  try {
    delete div.test;
  } catch( e ) {
    support.deleteExpando = false;
  }

  // Check if we can trust getAttribute("value")
  input = document.createElement("input");
  input.setAttribute( "value", "" );
  support.input = input.getAttribute( "value" ) === "";

  // Check if an input maintains its value after becoming a radio
  input.value = "t";
  input.setAttribute( "type", "radio" );
  support.radioValue = input.value === "t";

  // #11217 - WebKit loses check when the name is after the checked attribute
  input.setAttribute( "checked", "t" );
  input.setAttribute( "name", "t" );

  fragment = document.createDocumentFragment();
  fragment.appendChild( input );

  // Check if a disconnected checkbox will retain its checked
  // value of true after appended to the DOM (IE6/7)
  support.appendChecked = input.checked;

  // WebKit doesn't clone checked state correctly in fragments
  support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;

  // Support: IE<9
  // Opera does not clone events (and typeof div.attachEvent === undefined).
  // IE9-10 clones events bound via attachEvent, but they don't trigger with .click()
  if ( div.attachEvent ) {
    div.attachEvent( "onclick", function() {
      support.noCloneEvent = false;
    });

    div.cloneNode( true ).click();
  }

  // Support: IE<9 (lack submit/change bubble), Firefox 17+ (lack focusin event)
  // Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP)
  for ( i in { submit: true, change: true, focusin: true }) {
    div.setAttribute( eventName = "on" + i, "t" );

    support[ i + "Bubbles" ] = eventName in window || div.attributes[ eventName ].expando === false;
  }

  div.style.backgroundClip = "content-box";
  div.cloneNode( true ).style.backgroundClip = "";
  support.clearCloneStyle = div.style.backgroundClip === "content-box";

  // Support: IE<9
  // Iteration over object's inherited properties before its own.
  for ( i in jQuery( support ) ) {
    break;
  }
  support.ownLast = i !== "0";

  // Run tests that need a body at doc ready
  jQuery(function() {
    var container, marginDiv, tds,
      divReset = "padding:0;margin:0;border:0;display:block;box-sizing:content-box;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;",
      body = document.getElementsByTagName("body")[0];

    if ( !body ) {
      // Return for frameset docs that don't have a body
      return;
    }

    container = document.createElement("div");
    container.style.cssText = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px";

    body.appendChild( container ).appendChild( div );

    // Support: IE8
    // Check if table cells still have offsetWidth/Height when they are set
    // to display:none and there are still other visible table cells in a
    // table row; if so, offsetWidth/Height are not reliable for use when
    // determining if an element has been hidden directly using
    // display:none (it is still safe to use offsets if a parent element is
    // hidden; don safety goggles and see bug #4512 for more information).
    div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
    tds = div.getElementsByTagName("td");
    tds[ 0 ].style.cssText = "padding:0;margin:0;border:0;display:none";
    isSupported = ( tds[ 0 ].offsetHeight === 0 );

    tds[ 0 ].style.display = "";
    tds[ 1 ].style.display = "none";

    // Support: IE8
    // Check if empty table cells still have offsetWidth/Height
    support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );

    // Check box-sizing and margin behavior.
    div.innerHTML = "";
    div.style.cssText = "box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;";

    // Workaround failing boxSizing test due to offsetWidth returning wrong value
    // with some non-1 values of body zoom, ticket #13543
    jQuery.swap( body, body.style.zoom != null ? { zoom: 1 } : {}, function() {
      support.boxSizing = div.offsetWidth === 4;
    });

    // Use window.getComputedStyle because jsdom on node.js will break without it.
    if ( window.getComputedStyle ) {
      support.pixelPosition = ( window.getComputedStyle( div, null ) || {} ).top !== "1%";
      support.boxSizingReliable = ( window.getComputedStyle( div, null ) || { width: "4px" } ).width === "4px";

      // Check if div with explicit width and no margin-right incorrectly
      // gets computed margin-right based on width of container. (#3333)
      // Fails in WebKit before Feb 2011 nightlies
      // WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
      marginDiv = div.appendChild( document.createElement("div") );
      marginDiv.style.cssText = div.style.cssText = divReset;
      marginDiv.style.marginRight = marginDiv.style.width = "0";
      div.style.width = "1px";

      support.reliableMarginRight =
        !parseFloat( ( window.getComputedStyle( marginDiv, null ) || {} ).marginRight );
    }

    if ( typeof div.style.zoom !== core_strundefined ) {
      // Support: IE<8
      // Check if natively block-level elements act like inline-block
      // elements when setting their display to 'inline' and giving
      // them layout
      div.innerHTML = "";
      div.style.cssText = divReset + "width:1px;padding:1px;display:inline;zoom:1";
      support.inlineBlockNeedsLayout = ( div.offsetWidth === 3 );

      // Support: IE6
      // Check if elements with layout shrink-wrap their children
      div.style.display = "block";
      div.innerHTML = "<div></div>";
      div.firstChild.style.width = "5px";
      support.shrinkWrapBlocks = ( div.offsetWidth !== 3 );

      if ( support.inlineBlockNeedsLayout ) {
        // Prevent IE 6 from affecting layout for positioned elements #11048
        // Prevent IE from shrinking the body in IE 7 mode #12869
        // Support: IE<8
        body.style.zoom = 1;
      }
    }

    body.removeChild( container );

    // Null elements to avoid leaks in IE
    container = div = tds = marginDiv = null;
  });

  // Null elements to avoid leaks in IE
  all = select = fragment = opt = a = input = null;

  return support;
})({});

var rbrace = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
  rmultiDash = /([A-Z])/g;

function internalData( elem, name, data, pvt /* Internal Use Only */ ){
  if ( !jQuery.acceptData( elem ) ) {
    return;
  }

  var ret, thisCache,
    internalKey = jQuery.expando,

    // We have to handle DOM nodes and JS objects differently because IE6-7
    // can't GC object references properly across the DOM-JS boundary
    isNode = elem.nodeType,

    // Only DOM nodes need the global jQuery cache; JS object data is
    // attached directly to the object so GC can occur automatically
    cache = isNode ? jQuery.cache : elem,

    // Only defining an ID for JS objects if its cache already exists allows
    // the code to shortcut on the same path as a DOM node with no cache
    id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey;

  // Avoid doing any more work than we need to when trying to get data on an
  // object that has no data at all
  if ( (!id || !cache[id] || (!pvt && !cache[id].data)) && data === undefined && typeof name === "string" ) {
    return;
  }

  if ( !id ) {
    // Only DOM nodes need a new unique ID for each element since their data
    // ends up in the global cache
    if ( isNode ) {
      id = elem[ internalKey ] = core_deletedIds.pop() || jQuery.guid++;
    } else {
      id = internalKey;
    }
  }

  if ( !cache[ id ] ) {
    // Avoid exposing jQuery metadata on plain JS objects when the object
    // is serialized using JSON.stringify
    cache[ id ] = isNode ? {} : { toJSON: jQuery.noop };
  }

  // An object can be passed to jQuery.data instead of a key/value pair; this gets
  // shallow copied over onto the existing cache
  if ( typeof name === "object" || typeof name === "function" ) {
    if ( pvt ) {
      cache[ id ] = jQuery.extend( cache[ id ], name );
    } else {
      cache[ id ].data = jQuery.extend( cache[ id ].data, name );
    }
  }

  thisCache = cache[ id ];

  // jQuery data() is stored in a separate object inside the object's internal data
  // cache in order to avoid key collisions between internal data and user-defined
  // data.
  if ( !pvt ) {
    if ( !thisCache.data ) {
      thisCache.data = {};
    }

    thisCache = thisCache.data;
  }

  if ( data !== undefined ) {
    thisCache[ jQuery.camelCase( name ) ] = data;
  }

  // Check for both converted-to-camel and non-converted data property names
  // If a data property was specified
  if ( typeof name === "string" ) {

    // First Try to find as-is property data
    ret = thisCache[ name ];

    // Test for null|undefined property data
    if ( ret == null ) {

      // Try to find the camelCased property
      ret = thisCache[ jQuery.camelCase( name ) ];
    }
  } else {
    ret = thisCache;
  }

  return ret;
}

function internalRemoveData( elem, name, pvt ) {
  if ( !jQuery.acceptData( elem ) ) {
    return;
  }

  var thisCache, i,
    isNode = elem.nodeType,

    // See jQuery.data for more information
    cache = isNode ? jQuery.cache : elem,
    id = isNode ? elem[ jQuery.expando ] : jQuery.expando;

  // If there is already no cache entry for this object, there is no
  // purpose in continuing
  if ( !cache[ id ] ) {
    return;
  }

  if ( name ) {

    thisCache = pvt ? cache[ id ] : cache[ id ].data;

    if ( thisCache ) {

      // Support array or space separated string names for data keys
      if ( !jQuery.isArray( name ) ) {

        // try the string as a key before any manipulation
        if ( name in thisCache ) {
          name = [ name ];
        } else {

          // split the camel cased version by spaces unless a key with the spaces exists
          name = jQuery.camelCase( name );
          if ( name in thisCache ) {
            name = [ name ];
          } else {
            name = name.split(" ");
          }
        }
      } else {
        // If "name" is an array of keys...
        // When data is initially created, via ("key", "val") signature,
        // keys will be converted to camelCase.
        // Since there is no way to tell _how_ a key was added, remove
        // both plain key and camelCase key. #12786
        // This will only penalize the array argument path.
        name = name.concat( jQuery.map( name, jQuery.camelCase ) );
      }

      i = name.length;
      while ( i-- ) {
        delete thisCache[ name[i] ];
      }

      // If there is no data left in the cache, we want to continue
      // and let the cache object itself get destroyed
      if ( pvt ? !isEmptyDataObject(thisCache) : !jQuery.isEmptyObject(thisCache) ) {
        return;
      }
    }
  }

  // See jQuery.data for more information
  if ( !pvt ) {
    delete cache[ id ].data;

    // Don't destroy the parent cache unless the internal data object
    // had been the only thing left in it
    if ( !isEmptyDataObject( cache[ id ] ) ) {
      return;
    }
  }

  // Destroy the cache
  if ( isNode ) {
    jQuery.cleanData( [ elem ], true );

  // Use delete when supported for expandos or `cache` is not a window per isWindow (#10080)
  /* jshint eqeqeq: false */
  } else if ( jQuery.support.deleteExpando || cache != cache.window ) {
    /* jshint eqeqeq: true */
    delete cache[ id ];

  // When all else fails, null
  } else {
    cache[ id ] = null;
  }
}

jQuery.extend({
  cache: {},

  // The following elements throw uncatchable exceptions if you
  // attempt to add expando properties to them.
  noData: {
    "applet": true,
    "embed": true,
    // Ban all objects except for Flash (which handle expandos)
    "object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
  },

  hasData: function( elem ) {
    elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];
    return !!elem && !isEmptyDataObject( elem );
  },

  data: function( elem, name, data ) {
    return internalData( elem, name, data );
  },

  removeData: function( elem, name ) {
    return internalRemoveData( elem, name );
  },

  // For internal use only.
  _data: function( elem, name, data ) {
    return internalData( elem, name, data, true );
  },

  _removeData: function( elem, name ) {
    return internalRemoveData( elem, name, true );
  },

  // A method for determining if a DOM node can handle the data expando
  acceptData: function( elem ) {
    // Do not set data on non-element because it will not be cleared (#8335).
    if ( elem.nodeType && elem.nodeType !== 1 && elem.nodeType !== 9 ) {
      return false;
    }

    var noData = elem.nodeName && jQuery.noData[ elem.nodeName.toLowerCase() ];

    // nodes accept data unless otherwise specified; rejection can be conditional
    return !noData || noData !== true && elem.getAttribute("classid") === noData;
  }
});

jQuery.fn.extend({
  data: function( key, value ) {
    var attrs, name,
      data = null,
      i = 0,
      elem = this[0];

    // Special expections of .data basically thwart jQuery.access,
    // so implement the relevant behavior ourselves

    // Gets all values
    if ( key === undefined ) {
      if ( this.length ) {
        data = jQuery.data( elem );

        if ( elem.nodeType === 1 && !jQuery._data( elem, "parsedAttrs" ) ) {
          attrs = elem.attributes;
          for ( ; i < attrs.length; i++ ) {
            name = attrs[i].name;

            if ( name.indexOf("data-") === 0 ) {
              name = jQuery.camelCase( name.slice(5) );

              dataAttr( elem, name, data[ name ] );
            }
          }
          jQuery._data( elem, "parsedAttrs", true );
        }
      }

      return data;
    }

    // Sets multiple values
    if ( typeof key === "object" ) {
      return this.each(function() {
        jQuery.data( this, key );
      });
    }

    return arguments.length > 1 ?

      // Sets one value
      this.each(function() {
        jQuery.data( this, key, value );
      }) :

      // Gets one value
      // Try to fetch any internally stored data first
      elem ? dataAttr( elem, key, jQuery.data( elem, key ) ) : null;
  },

  removeData: function( key ) {
    return this.each(function() {
      jQuery.removeData( this, key );
    });
  }
});

function dataAttr( elem, key, data ) {
  // If nothing was found internally, try to fetch any
  // data from the HTML5 data-* attribute
  if ( data === undefined && elem.nodeType === 1 ) {

    var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();

    data = elem.getAttribute( name );

    if ( typeof data === "string" ) {
      try {
        data = data === "true" ? true :
          data === "false" ? false :
          data === "null" ? null :
          // Only convert to a number if it doesn't change the string
          +data + "" === data ? +data :
          rbrace.test( data ) ? jQuery.parseJSON( data ) :
            data;
      } catch( e ) {}

      // Make sure we set the data so it isn't changed later
      jQuery.data( elem, key, data );

    } else {
      data = undefined;
    }
  }

  return data;
}

// checks a cache object for emptiness
function isEmptyDataObject( obj ) {
  var name;
  for ( name in obj ) {

    // if the public data object is empty, the private is still empty
    if ( name === "data" && jQuery.isEmptyObject( obj[name] ) ) {
      continue;
    }
    if ( name !== "toJSON" ) {
      return false;
    }
  }

  return true;
}
jQuery.extend({
  queue: function( elem, type, data ) {
    var queue;

    if ( elem ) {
      type = ( type || "fx" ) + "queue";
      queue = jQuery._data( elem, type );

      // Speed up dequeue by getting out quickly if this is just a lookup
      if ( data ) {
        if ( !queue || jQuery.isArray(data) ) {
          queue = jQuery._data( elem, type, jQuery.makeArray(data) );
        } else {
          queue.push( data );
        }
      }
      return queue || [];
    }
  },

  dequeue: function( elem, type ) {
    type = type || "fx";

    var queue = jQuery.queue( elem, type ),
      startLength = queue.length,
      fn = queue.shift(),
      hooks = jQuery._queueHooks( elem, type ),
      next = function() {
        jQuery.dequeue( elem, type );
      };

    // If the fx queue is dequeued, always remove the progress sentinel
    if ( fn === "inprogress" ) {
      fn = queue.shift();
      startLength--;
    }

    if ( fn ) {

      // Add a progress sentinel to prevent the fx queue from being
      // automatically dequeued
      if ( type === "fx" ) {
        queue.unshift( "inprogress" );
      }

      // clear up the last queue stop function
      delete hooks.stop;
      fn.call( elem, next, hooks );
    }

    if ( !startLength && hooks ) {
      hooks.empty.fire();
    }
  },

  // not intended for public consumption - generates a queueHooks object, or returns the current one
  _queueHooks: function( elem, type ) {
    var key = type + "queueHooks";
    return jQuery._data( elem, key ) || jQuery._data( elem, key, {
      empty: jQuery.Callbacks("once memory").add(function() {
        jQuery._removeData( elem, type + "queue" );
        jQuery._removeData( elem, key );
      })
    });
  }
});

jQuery.fn.extend({
  queue: function( type, data ) {
    var setter = 2;

    if ( typeof type !== "string" ) {
      data = type;
      type = "fx";
      setter--;
    }

    if ( arguments.length < setter ) {
      return jQuery.queue( this[0], type );
    }

    return data === undefined ?
      this :
      this.each(function() {
        var queue = jQuery.queue( this, type, data );

        // ensure a hooks for this queue
        jQuery._queueHooks( this, type );

        if ( type === "fx" && queue[0] !== "inprogress" ) {
          jQuery.dequeue( this, type );
        }
      });
  },
  dequeue: function( type ) {
    return this.each(function() {
      jQuery.dequeue( this, type );
    });
  },
  // Based off of the plugin by Clint Helfers, with permission.
  // http://blindsignals.com/index.php/2009/07/jquery-delay/
  delay: function( time, type ) {
    time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
    type = type || "fx";

    return this.queue( type, function( next, hooks ) {
      var timeout = setTimeout( next, time );
      hooks.stop = function() {
        clearTimeout( timeout );
      };
    });
  },
  clearQueue: function( type ) {
    return this.queue( type || "fx", [] );
  },
  // Get a promise resolved when queues of a certain type
  // are emptied (fx is the type by default)
  promise: function( type, obj ) {
    var tmp,
      count = 1,
      defer = jQuery.Deferred(),
      elements = this,
      i = this.length,
      resolve = function() {
        if ( !( --count ) ) {
          defer.resolveWith( elements, [ elements ] );
        }
      };

    if ( typeof type !== "string" ) {
      obj = type;
      type = undefined;
    }
    type = type || "fx";

    while( i-- ) {
      tmp = jQuery._data( elements[ i ], type + "queueHooks" );
      if ( tmp && tmp.empty ) {
        count++;
        tmp.empty.add( resolve );
      }
    }
    resolve();
    return defer.promise( obj );
  }
});
var nodeHook, boolHook,
  rclass = /[\t\r\n\f]/g,
  rreturn = /\r/g,
  rfocusable = /^(?:input|select|textarea|button|object)$/i,
  rclickable = /^(?:a|area)$/i,
  ruseDefault = /^(?:checked|selected)$/i,
  getSetAttribute = jQuery.support.getSetAttribute,
  getSetInput = jQuery.support.input;

jQuery.fn.extend({
  attr: function( name, value ) {
    return jQuery.access( this, jQuery.attr, name, value, arguments.length > 1 );
  },

  removeAttr: function( name ) {
    return this.each(function() {
      jQuery.removeAttr( this, name );
    });
  },

  prop: function( name, value ) {
    return jQuery.access( this, jQuery.prop, name, value, arguments.length > 1 );
  },

  removeProp: function( name ) {
    name = jQuery.propFix[ name ] || name;
    return this.each(function() {
      // try/catch handles cases where IE balks (such as removing a property on window)
      try {
        this[ name ] = undefined;
        delete this[ name ];
      } catch( e ) {}
    });
  },

  addClass: function( value ) {
    var classes, elem, cur, clazz, j,
      i = 0,
      len = this.length,
      proceed = typeof value === "string" && value;

    if ( jQuery.isFunction( value ) ) {
      return this.each(function( j ) {
        jQuery( this ).addClass( value.call( this, j, this.className ) );
      });
    }

    if ( proceed ) {
      // The disjunction here is for better compressibility (see removeClass)
      classes = ( value || "" ).match( core_rnotwhite ) || [];

      for ( ; i < len; i++ ) {
        elem = this[ i ];
        cur = elem.nodeType === 1 && ( elem.className ?
          ( " " + elem.className + " " ).replace( rclass, " " ) :
          " "
        );

        if ( cur ) {
          j = 0;
          while ( (clazz = classes[j++]) ) {
            if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
              cur += clazz + " ";
            }
          }
          elem.className = jQuery.trim( cur );

        }
      }
    }

    return this;
  },

  removeClass: function( value ) {
    var classes, elem, cur, clazz, j,
      i = 0,
      len = this.length,
      proceed = arguments.length === 0 || typeof value === "string" && value;

    if ( jQuery.isFunction( value ) ) {
      return this.each(function( j ) {
        jQuery( this ).removeClass( value.call( this, j, this.className ) );
      });
    }
    if ( proceed ) {
      classes = ( value || "" ).match( core_rnotwhite ) || [];

      for ( ; i < len; i++ ) {
        elem = this[ i ];
        // This expression is here for better compressibility (see addClass)
        cur = elem.nodeType === 1 && ( elem.className ?
          ( " " + elem.className + " " ).replace( rclass, " " ) :
          ""
        );

        if ( cur ) {
          j = 0;
          while ( (clazz = classes[j++]) ) {
            // Remove *all* instances
            while ( cur.indexOf( " " + clazz + " " ) >= 0 ) {
              cur = cur.replace( " " + clazz + " ", " " );
            }
          }
          elem.className = value ? jQuery.trim( cur ) : "";
        }
      }
    }

    return this;
  },

  toggleClass: function( value, stateVal ) {
    var type = typeof value,
      isBool = typeof stateVal === "boolean";

    if ( jQuery.isFunction( value ) ) {
      return this.each(function( i ) {
        jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
      });
    }

    return this.each(function() {
      if ( type === "string" ) {
        // toggle individual class names
        var className,
          i = 0,
          self = jQuery( this ),
          state = stateVal,
          classNames = value.match( core_rnotwhite ) || [];

        while ( (className = classNames[ i++ ]) ) {
          // check each className given, space separated list
          state = isBool ? state : !self.hasClass( className );
          self[ state ? "addClass" : "removeClass" ]( className );
        }

      // Toggle whole class name
      } else if ( type === core_strundefined || type === "boolean" ) {
        if ( this.className ) {
          // store className if set
          jQuery._data( this, "__className__", this.className );
        }

        // If the element has a class name or if we're passed "false",
        // then remove the whole classname (if there was one, the above saved it).
        // Otherwise bring back whatever was previously saved (if anything),
        // falling back to the empty string if nothing was stored.
        this.className = this.className || value === false ? "" : jQuery._data( this, "__className__" ) || "";
      }
    });
  },

  hasClass: function( selector ) {
    var className = " " + selector + " ",
      i = 0,
      l = this.length;
    for ( ; i < l; i++ ) {
      if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) >= 0 ) {
        return true;
      }
    }

    return false;
  },

  val: function( value ) {
    var ret, hooks, isFunction,
      elem = this[0];

    if ( !arguments.length ) {
      if ( elem ) {
        hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];

        if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
          return ret;
        }

        ret = elem.value;

        return typeof ret === "string" ?
          // handle most common string cases
          ret.replace(rreturn, "") :
          // handle cases where value is null/undef or number
          ret == null ? "" : ret;
      }

      return;
    }

    isFunction = jQuery.isFunction( value );

    return this.each(function( i ) {
      var val;

      if ( this.nodeType !== 1 ) {
        return;
      }

      if ( isFunction ) {
        val = value.call( this, i, jQuery( this ).val() );
      } else {
        val = value;
      }

      // Treat null/undefined as ""; convert numbers to string
      if ( val == null ) {
        val = "";
      } else if ( typeof val === "number" ) {
        val += "";
      } else if ( jQuery.isArray( val ) ) {
        val = jQuery.map(val, function ( value ) {
          return value == null ? "" : value + "";
        });
      }

      hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

      // If set returns undefined, fall back to normal setting
      if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
        this.value = val;
      }
    });
  }
});

jQuery.extend({
  valHooks: {
    option: {
      get: function( elem ) {
        // Use proper attribute retrieval(#6932, #12072)
        var val = jQuery.find.attr( elem, "value" );
        return val != null ?
          val :
          elem.text;
      }
    },
    select: {
      get: function( elem ) {
        var value, option,
          options = elem.options,
          index = elem.selectedIndex,
          one = elem.type === "select-one" || index < 0,
          values = one ? null : [],
          max = one ? index + 1 : options.length,
          i = index < 0 ?
            max :
            one ? index : 0;

        // Loop through all the selected options
        for ( ; i < max; i++ ) {
          option = options[ i ];

          // oldIE doesn't update selected after form reset (#2551)
          if ( ( option.selected || i === index ) &&
              // Don't return options that are disabled or in a disabled optgroup
              ( jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null ) &&
              ( !option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

            // Get the specific value for the option
            value = jQuery( option ).val();

            // We don't need an array for one selects
            if ( one ) {
              return value;
            }

            // Multi-Selects return an array
            values.push( value );
          }
        }

        return values;
      },

      set: function( elem, value ) {
        var optionSet, option,
          options = elem.options,
          values = jQuery.makeArray( value ),
          i = options.length;

        while ( i-- ) {
          option = options[ i ];
          if ( (option.selected = jQuery.inArray( jQuery(option).val(), values ) >= 0) ) {
            optionSet = true;
          }
        }

        // force browsers to behave consistently when non-matching value is set
        if ( !optionSet ) {
          elem.selectedIndex = -1;
        }
        return values;
      }
    }
  },

  attr: function( elem, name, value ) {
    var hooks, ret,
      nType = elem.nodeType;

    // don't get/set attributes on text, comment and attribute nodes
    if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
      return;
    }

    // Fallback to prop when attributes are not supported
    if ( typeof elem.getAttribute === core_strundefined ) {
      return jQuery.prop( elem, name, value );
    }

    // All attributes are lowercase
    // Grab necessary hook if one is defined
    if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
      name = name.toLowerCase();
      hooks = jQuery.attrHooks[ name ] ||
        ( jQuery.expr.match.bool.test( name ) ? boolHook : nodeHook );
    }

    if ( value !== undefined ) {

      if ( value === null ) {
        jQuery.removeAttr( elem, name );

      } else if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
        return ret;

      } else {
        elem.setAttribute( name, value + "" );
        return value;
      }

    } else if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
      return ret;

    } else {
      ret = jQuery.find.attr( elem, name );

      // Non-existent attributes return null, we normalize to undefined
      return ret == null ?
        undefined :
        ret;
    }
  },

  removeAttr: function( elem, value ) {
    var name, propName,
      i = 0,
      attrNames = value && value.match( core_rnotwhite );

    if ( attrNames && elem.nodeType === 1 ) {
      while ( (name = attrNames[i++]) ) {
        propName = jQuery.propFix[ name ] || name;

        // Boolean attributes get special treatment (#10870)
        if ( jQuery.expr.match.bool.test( name ) ) {
          // Set corresponding property to false
          if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {
            elem[ propName ] = false;
          // Support: IE<9
          // Also clear defaultChecked/defaultSelected (if appropriate)
          } else {
            elem[ jQuery.camelCase( "default-" + name ) ] =
              elem[ propName ] = false;
          }

        // See #9699 for explanation of this approach (setting first, then removal)
        } else {
          jQuery.attr( elem, name, "" );
        }

        elem.removeAttribute( getSetAttribute ? name : propName );
      }
    }
  },

  attrHooks: {
    type: {
      set: function( elem, value ) {
        if ( !jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
          // Setting the type on a radio button after the value resets the value in IE6-9
          // Reset value to default in case type is set after value during creation
          var val = elem.value;
          elem.setAttribute( "type", value );
          if ( val ) {
            elem.value = val;
          }
          return value;
        }
      }
    }
  },

  propFix: {
    "for": "htmlFor",
    "class": "className"
  },

  prop: function( elem, name, value ) {
    var ret, hooks, notxml,
      nType = elem.nodeType;

    // don't get/set properties on text, comment and attribute nodes
    if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
      return;
    }

    notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

    if ( notxml ) {
      // Fix name and attach hooks
      name = jQuery.propFix[ name ] || name;
      hooks = jQuery.propHooks[ name ];
    }

    if ( value !== undefined ) {
      return hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ?
        ret :
        ( elem[ name ] = value );

    } else {
      return hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ?
        ret :
        elem[ name ];
    }
  },

  propHooks: {
    tabIndex: {
      get: function( elem ) {
        // elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
        // http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
        // Use proper attribute retrieval(#12072)
        var tabindex = jQuery.find.attr( elem, "tabindex" );

        return tabindex ?
          parseInt( tabindex, 10 ) :
          rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
            0 :
            -1;
      }
    }
  }
});

// Hooks for boolean attributes
boolHook = {
  set: function( elem, value, name ) {
    if ( value === false ) {
      // Remove boolean attributes when set to false
      jQuery.removeAttr( elem, name );
    } else if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {
      // IE<8 needs the *property* name
      elem.setAttribute( !getSetAttribute && jQuery.propFix[ name ] || name, name );

    // Use defaultChecked and defaultSelected for oldIE
    } else {
      elem[ jQuery.camelCase( "default-" + name ) ] = elem[ name ] = true;
    }

    return name;
  }
};
jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
  var getter = jQuery.expr.attrHandle[ name ] || jQuery.find.attr;

  jQuery.expr.attrHandle[ name ] = getSetInput && getSetAttribute || !ruseDefault.test( name ) ?
    function( elem, name, isXML ) {
      var fn = jQuery.expr.attrHandle[ name ],
        ret = isXML ?
          undefined :
          /* jshint eqeqeq: false */
          (jQuery.expr.attrHandle[ name ] = undefined) !=
            getter( elem, name, isXML ) ?

            name.toLowerCase() :
            null;
      jQuery.expr.attrHandle[ name ] = fn;
      return ret;
    } :
    function( elem, name, isXML ) {
      return isXML ?
        undefined :
        elem[ jQuery.camelCase( "default-" + name ) ] ?
          name.toLowerCase() :
          null;
    };
});

// fix oldIE attroperties
if ( !getSetInput || !getSetAttribute ) {
  jQuery.attrHooks.value = {
    set: function( elem, value, name ) {
      if ( jQuery.nodeName( elem, "input" ) ) {
        // Does not return so that setAttribute is also used
        elem.defaultValue = value;
      } else {
        // Use nodeHook if defined (#1954); otherwise setAttribute is fine
        return nodeHook && nodeHook.set( elem, value, name );
      }
    }
  };
}

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !getSetAttribute ) {

  // Use this for any attribute in IE6/7
  // This fixes almost every IE6/7 issue
  nodeHook = {
    set: function( elem, value, name ) {
      // Set the existing or create a new attribute node
      var ret = elem.getAttributeNode( name );
      if ( !ret ) {
        elem.setAttributeNode(
          (ret = elem.ownerDocument.createAttribute( name ))
        );
      }

      ret.value = value += "";

      // Break association with cloned elements by also using setAttribute (#9646)
      return name === "value" || value === elem.getAttribute( name ) ?
        value :
        undefined;
    }
  };
  jQuery.expr.attrHandle.id = jQuery.expr.attrHandle.name = jQuery.expr.attrHandle.coords =
    // Some attributes are constructed with empty-string values when not defined
    function( elem, name, isXML ) {
      var ret;
      return isXML ?
        undefined :
        (ret = elem.getAttributeNode( name )) && ret.value !== "" ?
          ret.value :
          null;
    };
  jQuery.valHooks.button = {
    get: function( elem, name ) {
      var ret = elem.getAttributeNode( name );
      return ret && ret.specified ?
        ret.value :
        undefined;
    },
    set: nodeHook.set
  };

  // Set contenteditable to false on removals(#10429)
  // Setting to empty string throws an error as an invalid value
  jQuery.attrHooks.contenteditable = {
    set: function( elem, value, name ) {
      nodeHook.set( elem, value === "" ? false : value, name );
    }
  };

  // Set width and height to auto instead of 0 on empty string( Bug #8150 )
  // This is for removals
  jQuery.each([ "width", "height" ], function( i, name ) {
    jQuery.attrHooks[ name ] = {
      set: function( elem, value ) {
        if ( value === "" ) {
          elem.setAttribute( name, "auto" );
          return value;
        }
      }
    };
  });
}


// Some attributes require a special call on IE
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !jQuery.support.hrefNormalized ) {
  // href/src property should get the full normalized URL (#10299/#12915)
  jQuery.each([ "href", "src" ], function( i, name ) {
    jQuery.propHooks[ name ] = {
      get: function( elem ) {
        return elem.getAttribute( name, 4 );
      }
    };
  });
}

if ( !jQuery.support.style ) {
  jQuery.attrHooks.style = {
    get: function( elem ) {
      // Return undefined in the case of empty string
      // Note: IE uppercases css property names, but if we were to .toLowerCase()
      // .cssText, that would destroy case senstitivity in URL's, like in "background"
      return elem.style.cssText || undefined;
    },
    set: function( elem, value ) {
      return ( elem.style.cssText = value + "" );
    }
  };
}

// Safari mis-reports the default selected property of an option
// Accessing the parent's selectedIndex property fixes it
if ( !jQuery.support.optSelected ) {
  jQuery.propHooks.selected = {
    get: function( elem ) {
      var parent = elem.parentNode;

      if ( parent ) {
        parent.selectedIndex;

        // Make sure that it also works with optgroups, see #5701
        if ( parent.parentNode ) {
          parent.parentNode.selectedIndex;
        }
      }
      return null;
    }
  };
}

jQuery.each([
  "tabIndex",
  "readOnly",
  "maxLength",
  "cellSpacing",
  "cellPadding",
  "rowSpan",
  "colSpan",
  "useMap",
  "frameBorder",
  "contentEditable"
], function() {
  jQuery.propFix[ this.toLowerCase() ] = this;
});

// IE6/7 call enctype encoding
if ( !jQuery.support.enctype ) {
  jQuery.propFix.enctype = "encoding";
}

// Radios and checkboxes getter/setter
jQuery.each([ "radio", "checkbox" ], function() {
  jQuery.valHooks[ this ] = {
    set: function( elem, value ) {
      if ( jQuery.isArray( value ) ) {
        return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
      }
    }
  };
  if ( !jQuery.support.checkOn ) {
    jQuery.valHooks[ this ].get = function( elem ) {
      // Support: Webkit
      // "" is returned instead of "on" if a value isn't specified
      return elem.getAttribute("value") === null ? "on" : elem.value;
    };
  }
});
var rformElems = /^(?:input|select|textarea)$/i,
  rkeyEvent = /^key/,
  rmouseEvent = /^(?:mouse|contextmenu)|click/,
  rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
  rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;

function returnTrue() {
  return true;
}

function returnFalse() {
  return false;
}

function safeActiveElement() {
  try {
    return document.activeElement;
  } catch ( err ) { }
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

  global: {},

  add: function( elem, types, handler, data, selector ) {
    var tmp, events, t, handleObjIn,
      special, eventHandle, handleObj,
      handlers, type, namespaces, origType,
      elemData = jQuery._data( elem );

    // Don't attach events to noData or text/comment nodes (but allow plain objects)
    if ( !elemData ) {
      return;
    }

    // Caller can pass in an object of custom data in lieu of the handler
    if ( handler.handler ) {
      handleObjIn = handler;
      handler = handleObjIn.handler;
      selector = handleObjIn.selector;
    }

    // Make sure that the handler has a unique ID, used to find/remove it later
    if ( !handler.guid ) {
      handler.guid = jQuery.guid++;
    }

    // Init the element's event structure and main handler, if this is the first
    if ( !(events = elemData.events) ) {
      events = elemData.events = {};
    }
    if ( !(eventHandle = elemData.handle) ) {
      eventHandle = elemData.handle = function( e ) {
        // Discard the second event of a jQuery.event.trigger() and
        // when an event is called after a page has unloaded
        return typeof jQuery !== core_strundefined && (!e || jQuery.event.triggered !== e.type) ?
          jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
          undefined;
      };
      // Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
      eventHandle.elem = elem;
    }

    // Handle multiple events separated by a space
    types = ( types || "" ).match( core_rnotwhite ) || [""];
    t = types.length;
    while ( t-- ) {
      tmp = rtypenamespace.exec( types[t] ) || [];
      type = origType = tmp[1];
      namespaces = ( tmp[2] || "" ).split( "." ).sort();

      // There *must* be a type, no attaching namespace-only handlers
      if ( !type ) {
        continue;
      }

      // If event changes its type, use the special event handlers for the changed type
      special = jQuery.event.special[ type ] || {};

      // If selector defined, determine special event api type, otherwise given type
      type = ( selector ? special.delegateType : special.bindType ) || type;

      // Update special based on newly reset type
      special = jQuery.event.special[ type ] || {};

      // handleObj is passed to all event handlers
      handleObj = jQuery.extend({
        type: type,
        origType: origType,
        data: data,
        handler: handler,
        guid: handler.guid,
        selector: selector,
        needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
        namespace: namespaces.join(".")
      }, handleObjIn );

      // Init the event handler queue if we're the first
      if ( !(handlers = events[ type ]) ) {
        handlers = events[ type ] = [];
        handlers.delegateCount = 0;

        // Only use addEventListener/attachEvent if the special events handler returns false
        if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
          // Bind the global event handler to the element
          if ( elem.addEventListener ) {
            elem.addEventListener( type, eventHandle, false );

          } else if ( elem.attachEvent ) {
            elem.attachEvent( "on" + type, eventHandle );
          }
        }
      }

      if ( special.add ) {
        special.add.call( elem, handleObj );

        if ( !handleObj.handler.guid ) {
          handleObj.handler.guid = handler.guid;
        }
      }

      // Add to the element's handler list, delegates in front
      if ( selector ) {
        handlers.splice( handlers.delegateCount++, 0, handleObj );
      } else {
        handlers.push( handleObj );
      }

      // Keep track of which events have ever been used, for event optimization
      jQuery.event.global[ type ] = true;
    }

    // Nullify elem to prevent memory leaks in IE
    elem = null;
  },

  // Detach an event or set of events from an element
  remove: function( elem, types, handler, selector, mappedTypes ) {
    var j, handleObj, tmp,
      origCount, t, events,
      special, handlers, type,
      namespaces, origType,
      elemData = jQuery.hasData( elem ) && jQuery._data( elem );

    if ( !elemData || !(events = elemData.events) ) {
      return;
    }

    // Once for each type.namespace in types; type may be omitted
    types = ( types || "" ).match( core_rnotwhite ) || [""];
    t = types.length;
    while ( t-- ) {
      tmp = rtypenamespace.exec( types[t] ) || [];
      type = origType = tmp[1];
      namespaces = ( tmp[2] || "" ).split( "." ).sort();

      // Unbind all events (on this namespace, if provided) for the element
      if ( !type ) {
        for ( type in events ) {
          jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
        }
        continue;
      }

      special = jQuery.event.special[ type ] || {};
      type = ( selector ? special.delegateType : special.bindType ) || type;
      handlers = events[ type ] || [];
      tmp = tmp[2] && new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" );

      // Remove matching events
      origCount = j = handlers.length;
      while ( j-- ) {
        handleObj = handlers[ j ];

        if ( ( mappedTypes || origType === handleObj.origType ) &&
          ( !handler || handler.guid === handleObj.guid ) &&
          ( !tmp || tmp.test( handleObj.namespace ) ) &&
          ( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
          handlers.splice( j, 1 );

          if ( handleObj.selector ) {
            handlers.delegateCount--;
          }
          if ( special.remove ) {
            special.remove.call( elem, handleObj );
          }
        }
      }

      // Remove generic event handler if we removed something and no more handlers exist
      // (avoids potential for endless recursion during removal of special event handlers)
      if ( origCount && !handlers.length ) {
        if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
          jQuery.removeEvent( elem, type, elemData.handle );
        }

        delete events[ type ];
      }
    }

    // Remove the expando if it's no longer used
    if ( jQuery.isEmptyObject( events ) ) {
      delete elemData.handle;

      // removeData also checks for emptiness and clears the expando if empty
      // so use it instead of delete
      jQuery._removeData( elem, "events" );
    }
  },

  trigger: function( event, data, elem, onlyHandlers ) {
    var handle, ontype, cur,
      bubbleType, special, tmp, i,
      eventPath = [ elem || document ],
      type = core_hasOwn.call( event, "type" ) ? event.type : event,
      namespaces = core_hasOwn.call( event, "namespace" ) ? event.namespace.split(".") : [];

    cur = tmp = elem = elem || document;

    // Don't do events on text and comment nodes
    if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
      return;
    }

    // focus/blur morphs to focusin/out; ensure we're not firing them right now
    if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
      return;
    }

    if ( type.indexOf(".") >= 0 ) {
      // Namespaced trigger; create a regexp to match event type in handle()
      namespaces = type.split(".");
      type = namespaces.shift();
      namespaces.sort();
    }
    ontype = type.indexOf(":") < 0 && "on" + type;

    // Caller can pass in a jQuery.Event object, Object, or just an event type string
    event = event[ jQuery.expando ] ?
      event :
      new jQuery.Event( type, typeof event === "object" && event );

    // Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
    event.isTrigger = onlyHandlers ? 2 : 3;
    event.namespace = namespaces.join(".");
    event.namespace_re = event.namespace ?
      new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" ) :
      null;

    // Clean up the event in case it is being reused
    event.result = undefined;
    if ( !event.target ) {
      event.target = elem;
    }

    // Clone any incoming data and prepend the event, creating the handler arg list
    data = data == null ?
      [ event ] :
      jQuery.makeArray( data, [ event ] );

    // Allow special events to draw outside the lines
    special = jQuery.event.special[ type ] || {};
    if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
      return;
    }

    // Determine event propagation path in advance, per W3C events spec (#9951)
    // Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
    if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

      bubbleType = special.delegateType || type;
      if ( !rfocusMorph.test( bubbleType + type ) ) {
        cur = cur.parentNode;
      }
      for ( ; cur; cur = cur.parentNode ) {
        eventPath.push( cur );
        tmp = cur;
      }

      // Only add window if we got to document (e.g., not plain obj or detached DOM)
      if ( tmp === (elem.ownerDocument || document) ) {
        eventPath.push( tmp.defaultView || tmp.parentWindow || window );
      }
    }

    // Fire handlers on the event path
    i = 0;
    while ( (cur = eventPath[i++]) && !event.isPropagationStopped() ) {

      event.type = i > 1 ?
        bubbleType :
        special.bindType || type;

      // jQuery handler
      handle = ( jQuery._data( cur, "events" ) || {} )[ event.type ] && jQuery._data( cur, "handle" );
      if ( handle ) {
        handle.apply( cur, data );
      }

      // Native handler
      handle = ontype && cur[ ontype ];
      if ( handle && jQuery.acceptData( cur ) && handle.apply && handle.apply( cur, data ) === false ) {
        event.preventDefault();
      }
    }
    event.type = type;

    // If nobody prevented the default action, do it now
    if ( !onlyHandlers && !event.isDefaultPrevented() ) {

      if ( (!special._default || special._default.apply( eventPath.pop(), data ) === false) &&
        jQuery.acceptData( elem ) ) {

        // Call a native DOM method on the target with the same name name as the event.
        // Can't use an .isFunction() check here because IE6/7 fails that test.
        // Don't do default actions on window, that's where global variables be (#6170)
        if ( ontype && elem[ type ] && !jQuery.isWindow( elem ) ) {

          // Don't re-trigger an onFOO event when we call its FOO() method
          tmp = elem[ ontype ];

          if ( tmp ) {
            elem[ ontype ] = null;
          }

          // Prevent re-triggering of the same event, since we already bubbled it above
          jQuery.event.triggered = type;
          try {
            elem[ type ]();
          } catch ( e ) {
            // IE<9 dies on focus/blur to hidden element (#1486,#12518)
            // only reproducible on winXP IE8 native, not IE9 in IE8 mode
          }
          jQuery.event.triggered = undefined;

          if ( tmp ) {
            elem[ ontype ] = tmp;
          }
        }
      }
    }

    return event.result;
  },

  dispatch: function( event ) {

    // Make a writable jQuery.Event from the native event object
    event = jQuery.event.fix( event );

    var i, ret, handleObj, matched, j,
      handlerQueue = [],
      args = core_slice.call( arguments ),
      handlers = ( jQuery._data( this, "events" ) || {} )[ event.type ] || [],
      special = jQuery.event.special[ event.type ] || {};

    // Use the fix-ed jQuery.Event rather than the (read-only) native event
    args[0] = event;
    event.delegateTarget = this;

    // Call the preDispatch hook for the mapped type, and let it bail if desired
    if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
      return;
    }

    // Determine handlers
    handlerQueue = jQuery.event.handlers.call( this, event, handlers );

    // Run delegates first; they may want to stop propagation beneath us
    i = 0;
    while ( (matched = handlerQueue[ i++ ]) && !event.isPropagationStopped() ) {
      event.currentTarget = matched.elem;

      j = 0;
      while ( (handleObj = matched.handlers[ j++ ]) && !event.isImmediatePropagationStopped() ) {

        // Triggered event must either 1) have no namespace, or
        // 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
        if ( !event.namespace_re || event.namespace_re.test( handleObj.namespace ) ) {

          event.handleObj = handleObj;
          event.data = handleObj.data;

          ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
              .apply( matched.elem, args );

          if ( ret !== undefined ) {
            if ( (event.result = ret) === false ) {
              event.preventDefault();
              event.stopPropagation();
            }
          }
        }
      }
    }

    // Call the postDispatch hook for the mapped type
    if ( special.postDispatch ) {
      special.postDispatch.call( this, event );
    }

    return event.result;
  },

  handlers: function( event, handlers ) {
    var sel, handleObj, matches, i,
      handlerQueue = [],
      delegateCount = handlers.delegateCount,
      cur = event.target;

    // Find delegate handlers
    // Black-hole SVG <use> instance trees (#13180)
    // Avoid non-left-click bubbling in Firefox (#3861)
    if ( delegateCount && cur.nodeType && (!event.button || event.type !== "click") ) {

      /* jshint eqeqeq: false */
      for ( ; cur != this; cur = cur.parentNode || this ) {
        /* jshint eqeqeq: true */

        // Don't check non-elements (#13208)
        // Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
        if ( cur.nodeType === 1 && (cur.disabled !== true || event.type !== "click") ) {
          matches = [];
          for ( i = 0; i < delegateCount; i++ ) {
            handleObj = handlers[ i ];

            // Don't conflict with Object.prototype properties (#13203)
            sel = handleObj.selector + " ";

            if ( matches[ sel ] === undefined ) {
              matches[ sel ] = handleObj.needsContext ?
                jQuery( sel, this ).index( cur ) >= 0 :
                jQuery.find( sel, this, null, [ cur ] ).length;
            }
            if ( matches[ sel ] ) {
              matches.push( handleObj );
            }
          }
          if ( matches.length ) {
            handlerQueue.push({ elem: cur, handlers: matches });
          }
        }
      }
    }

    // Add the remaining (directly-bound) handlers
    if ( delegateCount < handlers.length ) {
      handlerQueue.push({ elem: this, handlers: handlers.slice( delegateCount ) });
    }

    return handlerQueue;
  },

  fix: function( event ) {
    if ( event[ jQuery.expando ] ) {
      return event;
    }

    // Create a writable copy of the event object and normalize some properties
    var i, prop, copy,
      type = event.type,
      originalEvent = event,
      fixHook = this.fixHooks[ type ];

    if ( !fixHook ) {
      this.fixHooks[ type ] = fixHook =
        rmouseEvent.test( type ) ? this.mouseHooks :
        rkeyEvent.test( type ) ? this.keyHooks :
        {};
    }
    copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

    event = new jQuery.Event( originalEvent );

    i = copy.length;
    while ( i-- ) {
      prop = copy[ i ];
      event[ prop ] = originalEvent[ prop ];
    }

    // Support: IE<9
    // Fix target property (#1925)
    if ( !event.target ) {
      event.target = originalEvent.srcElement || document;
    }

    // Support: Chrome 23+, Safari?
    // Target should not be a text node (#504, #13143)
    if ( event.target.nodeType === 3 ) {
      event.target = event.target.parentNode;
    }

    // Support: IE<9
    // For mouse/key events, metaKey==false if it's undefined (#3368, #11328)
    event.metaKey = !!event.metaKey;

    return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
  },

  // Includes some event props shared by KeyEvent and MouseEvent
  props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

  fixHooks: {},

  keyHooks: {
    props: "char charCode key keyCode".split(" "),
    filter: function( event, original ) {

      // Add which for key events
      if ( event.which == null ) {
        event.which = original.charCode != null ? original.charCode : original.keyCode;
      }

      return event;
    }
  },

  mouseHooks: {
    props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
    filter: function( event, original ) {
      var body, eventDoc, doc,
        button = original.button,
        fromElement = original.fromElement;

      // Calculate pageX/Y if missing and clientX/Y available
      if ( event.pageX == null && original.clientX != null ) {
        eventDoc = event.target.ownerDocument || document;
        doc = eventDoc.documentElement;
        body = eventDoc.body;

        event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
        event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
      }

      // Add relatedTarget, if necessary
      if ( !event.relatedTarget && fromElement ) {
        event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
      }

      // Add which for click: 1 === left; 2 === middle; 3 === right
      // Note: button is not normalized, so don't use it
      if ( !event.which && button !== undefined ) {
        event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
      }

      return event;
    }
  },

  special: {
    load: {
      // Prevent triggered image.load events from bubbling to window.load
      noBubble: true
    },
    focus: {
      // Fire native event if possible so blur/focus sequence is correct
      trigger: function() {
        if ( this !== safeActiveElement() && this.focus ) {
          try {
            this.focus();
            return false;
          } catch ( e ) {
            // Support: IE<9
            // If we error on focus to hidden element (#1486, #12518),
            // let .trigger() run the handlers
          }
        }
      },
      delegateType: "focusin"
    },
    blur: {
      trigger: function() {
        if ( this === safeActiveElement() && this.blur ) {
          this.blur();
          return false;
        }
      },
      delegateType: "focusout"
    },
    click: {
      // For checkbox, fire native event so checked state will be right
      trigger: function() {
        if ( jQuery.nodeName( this, "input" ) && this.type === "checkbox" && this.click ) {
          this.click();
          return false;
        }
      },

      // For cross-browser consistency, don't fire native .click() on links
      _default: function( event ) {
        return jQuery.nodeName( event.target, "a" );
      }
    },

    beforeunload: {
      postDispatch: function( event ) {

        // Even when returnValue equals to undefined Firefox will still show alert
        if ( event.result !== undefined ) {
          event.originalEvent.returnValue = event.result;
        }
      }
    }
  },

  simulate: function( type, elem, event, bubble ) {
    // Piggyback on a donor event to simulate a different one.
    // Fake originalEvent to avoid donor's stopPropagation, but if the
    // simulated event prevents default then we do the same on the donor.
    var e = jQuery.extend(
      new jQuery.Event(),
      event,
      {
        type: type,
        isSimulated: true,
        originalEvent: {}
      }
    );
    if ( bubble ) {
      jQuery.event.trigger( e, null, elem );
    } else {
      jQuery.event.dispatch.call( elem, e );
    }
    if ( e.isDefaultPrevented() ) {
      event.preventDefault();
    }
  }
};

jQuery.removeEvent = document.removeEventListener ?
  function( elem, type, handle ) {
    if ( elem.removeEventListener ) {
      elem.removeEventListener( type, handle, false );
    }
  } :
  function( elem, type, handle ) {
    var name = "on" + type;

    if ( elem.detachEvent ) {

      // #8545, #7054, preventing memory leaks for custom events in IE6-8
      // detachEvent needed property on element, by name of that event, to properly expose it to GC
      if ( typeof elem[ name ] === core_strundefined ) {
        elem[ name ] = null;
      }

      elem.detachEvent( name, handle );
    }
  };

jQuery.Event = function( src, props ) {
  // Allow instantiation without the 'new' keyword
  if ( !(this instanceof jQuery.Event) ) {
    return new jQuery.Event( src, props );
  }

  // Event object
  if ( src && src.type ) {
    this.originalEvent = src;
    this.type = src.type;

    // Events bubbling up the document may have been marked as prevented
    // by a handler lower down the tree; reflect the correct value.
    this.isDefaultPrevented = ( src.defaultPrevented || src.returnValue === false ||
      src.getPreventDefault && src.getPreventDefault() ) ? returnTrue : returnFalse;

  // Event type
  } else {
    this.type = src;
  }

  // Put explicitly provided properties onto the event object
  if ( props ) {
    jQuery.extend( this, props );
  }

  // Create a timestamp if incoming event doesn't have one
  this.timeStamp = src && src.timeStamp || jQuery.now();

  // Mark it as fixed
  this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
  isDefaultPrevented: returnFalse,
  isPropagationStopped: returnFalse,
  isImmediatePropagationStopped: returnFalse,

  preventDefault: function() {
    var e = this.originalEvent;

    this.isDefaultPrevented = returnTrue;
    if ( !e ) {
      return;
    }

    // If preventDefault exists, run it on the original event
    if ( e.preventDefault ) {
      e.preventDefault();

    // Support: IE
    // Otherwise set the returnValue property of the original event to false
    } else {
      e.returnValue = false;
    }
  },
  stopPropagation: function() {
    var e = this.originalEvent;

    this.isPropagationStopped = returnTrue;
    if ( !e ) {
      return;
    }
    // If stopPropagation exists, run it on the original event
    if ( e.stopPropagation ) {
      e.stopPropagation();
    }

    // Support: IE
    // Set the cancelBubble property of the original event to true
    e.cancelBubble = true;
  },
  stopImmediatePropagation: function() {
    this.isImmediatePropagationStopped = returnTrue;
    this.stopPropagation();
  }
};

// Create mouseenter/leave events using mouseover/out and event-time checks
jQuery.each({
  mouseenter: "mouseover",
  mouseleave: "mouseout"
}, function( orig, fix ) {
  jQuery.event.special[ orig ] = {
    delegateType: fix,
    bindType: fix,

    handle: function( event ) {
      var ret,
        target = this,
        related = event.relatedTarget,
        handleObj = event.handleObj;

      // For mousenter/leave call the handler if related is outside the target.
      // NB: No relatedTarget if the mouse left/entered the browser window
      if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
        event.type = handleObj.origType;
        ret = handleObj.handler.apply( this, arguments );
        event.type = fix;
      }
      return ret;
    }
  };
});

// IE submit delegation
if ( !jQuery.support.submitBubbles ) {

  jQuery.event.special.submit = {
    setup: function() {
      // Only need this for delegated form submit events
      if ( jQuery.nodeName( this, "form" ) ) {
        return false;
      }

      // Lazy-add a submit handler when a descendant form may potentially be submitted
      jQuery.event.add( this, "click._submit keypress._submit", function( e ) {
        // Node name check avoids a VML-related crash in IE (#9807)
        var elem = e.target,
          form = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ? elem.form : undefined;
        if ( form && !jQuery._data( form, "submitBubbles" ) ) {
          jQuery.event.add( form, "submit._submit", function( event ) {
            event._submit_bubble = true;
          });
          jQuery._data( form, "submitBubbles", true );
        }
      });
      // return undefined since we don't need an event listener
    },

    postDispatch: function( event ) {
      // If form was submitted by the user, bubble the event up the tree
      if ( event._submit_bubble ) {
        delete event._submit_bubble;
        if ( this.parentNode && !event.isTrigger ) {
          jQuery.event.simulate( "submit", this.parentNode, event, true );
        }
      }
    },

    teardown: function() {
      // Only need this for delegated form submit events
      if ( jQuery.nodeName( this, "form" ) ) {
        return false;
      }

      // Remove delegated handlers; cleanData eventually reaps submit handlers attached above
      jQuery.event.remove( this, "._submit" );
    }
  };
}

// IE change delegation and checkbox/radio fix
if ( !jQuery.support.changeBubbles ) {

  jQuery.event.special.change = {

    setup: function() {

      if ( rformElems.test( this.nodeName ) ) {
        // IE doesn't fire change on a check/radio until blur; trigger it on click
        // after a propertychange. Eat the blur-change in special.change.handle.
        // This still fires onchange a second time for check/radio after blur.
        if ( this.type === "checkbox" || this.type === "radio" ) {
          jQuery.event.add( this, "propertychange._change", function( event ) {
            if ( event.originalEvent.propertyName === "checked" ) {
              this._just_changed = true;
            }
          });
          jQuery.event.add( this, "click._change", function( event ) {
            if ( this._just_changed && !event.isTrigger ) {
              this._just_changed = false;
            }
            // Allow triggered, simulated change events (#11500)
            jQuery.event.simulate( "change", this, event, true );
          });
        }
        return false;
      }
      // Delegated event; lazy-add a change handler on descendant inputs
      jQuery.event.add( this, "beforeactivate._change", function( e ) {
        var elem = e.target;

        if ( rformElems.test( elem.nodeName ) && !jQuery._data( elem, "changeBubbles" ) ) {
          jQuery.event.add( elem, "change._change", function( event ) {
            if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
              jQuery.event.simulate( "change", this.parentNode, event, true );
            }
          });
          jQuery._data( elem, "changeBubbles", true );
        }
      });
    },

    handle: function( event ) {
      var elem = event.target;

      // Swallow native change events from checkbox/radio, we already triggered them above
      if ( this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox") ) {
        return event.handleObj.handler.apply( this, arguments );
      }
    },

    teardown: function() {
      jQuery.event.remove( this, "._change" );

      return !rformElems.test( this.nodeName );
    }
  };
}

// Create "bubbling" focus and blur events
if ( !jQuery.support.focusinBubbles ) {
  jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

    // Attach a single capturing handler while someone wants focusin/focusout
    var attaches = 0,
      handler = function( event ) {
        jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
      };

    jQuery.event.special[ fix ] = {
      setup: function() {
        if ( attaches++ === 0 ) {
          document.addEventListener( orig, handler, true );
        }
      },
      teardown: function() {
        if ( --attaches === 0 ) {
          document.removeEventListener( orig, handler, true );
        }
      }
    };
  });
}

jQuery.fn.extend({

  on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
    var type, origFn;

    // Types can be a map of types/handlers
    if ( typeof types === "object" ) {
      // ( types-Object, selector, data )
      if ( typeof selector !== "string" ) {
        // ( types-Object, data )
        data = data || selector;
        selector = undefined;
      }
      for ( type in types ) {
        this.on( type, selector, data, types[ type ], one );
      }
      return this;
    }

    if ( data == null && fn == null ) {
      // ( types, fn )
      fn = selector;
      data = selector = undefined;
    } else if ( fn == null ) {
      if ( typeof selector === "string" ) {
        // ( types, selector, fn )
        fn = data;
        data = undefined;
      } else {
        // ( types, data, fn )
        fn = data;
        data = selector;
        selector = undefined;
      }
    }
    if ( fn === false ) {
      fn = returnFalse;
    } else if ( !fn ) {
      return this;
    }

    if ( one === 1 ) {
      origFn = fn;
      fn = function( event ) {
        // Can use an empty set, since event contains the info
        jQuery().off( event );
        return origFn.apply( this, arguments );
      };
      // Use same guid so caller can remove using origFn
      fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
    }
    return this.each( function() {
      jQuery.event.add( this, types, fn, data, selector );
    });
  },
  one: function( types, selector, data, fn ) {
    return this.on( types, selector, data, fn, 1 );
  },
  off: function( types, selector, fn ) {
    var handleObj, type;
    if ( types && types.preventDefault && types.handleObj ) {
      // ( event )  dispatched jQuery.Event
      handleObj = types.handleObj;
      jQuery( types.delegateTarget ).off(
        handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
        handleObj.selector,
        handleObj.handler
      );
      return this;
    }
    if ( typeof types === "object" ) {
      // ( types-object [, selector] )
      for ( type in types ) {
        this.off( type, selector, types[ type ] );
      }
      return this;
    }
    if ( selector === false || typeof selector === "function" ) {
      // ( types [, fn] )
      fn = selector;
      selector = undefined;
    }
    if ( fn === false ) {
      fn = returnFalse;
    }
    return this.each(function() {
      jQuery.event.remove( this, types, fn, selector );
    });
  },

  trigger: function( type, data ) {
    return this.each(function() {
      jQuery.event.trigger( type, data, this );
    });
  },
  triggerHandler: function( type, data ) {
    var elem = this[0];
    if ( elem ) {
      return jQuery.event.trigger( type, data, elem, true );
    }
  }
});
var isSimple = /^.[^:#\[\.,]*$/,
  rparentsprev = /^(?:parents|prev(?:Until|All))/,
  rneedsContext = jQuery.expr.match.needsContext,
  // methods guaranteed to produce a unique set when starting from a unique set
  guaranteedUnique = {
    children: true,
    contents: true,
    next: true,
    prev: true
  };

jQuery.fn.extend({
  find: function( selector ) {
    var i,
      ret = [],
      self = this,
      len = self.length;

    if ( typeof selector !== "string" ) {
      return this.pushStack( jQuery( selector ).filter(function() {
        for ( i = 0; i < len; i++ ) {
          if ( jQuery.contains( self[ i ], this ) ) {
            return true;
          }
        }
      }) );
    }

    for ( i = 0; i < len; i++ ) {
      jQuery.find( selector, self[ i ], ret );
    }

    // Needed because $( selector, context ) becomes $( context ).find( selector )
    ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
    ret.selector = this.selector ? this.selector + " " + selector : selector;
    return ret;
  },

  has: function( target ) {
    var i,
      targets = jQuery( target, this ),
      len = targets.length;

    return this.filter(function() {
      for ( i = 0; i < len; i++ ) {
        if ( jQuery.contains( this, targets[i] ) ) {
          return true;
        }
      }
    });
  },

  not: function( selector ) {
    return this.pushStack( winnow(this, selector || [], true) );
  },

  filter: function( selector ) {
    return this.pushStack( winnow(this, selector || [], false) );
  },

  is: function( selector ) {
    return !!winnow(
      this,

      // If this is a positional/relative selector, check membership in the returned set
      // so $("p:first").is("p:last") won't return true for a doc with two "p".
      typeof selector === "string" && rneedsContext.test( selector ) ?
        jQuery( selector ) :
        selector || [],
      false
    ).length;
  },

  closest: function( selectors, context ) {
    var cur,
      i = 0,
      l = this.length,
      ret = [],
      pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
        jQuery( selectors, context || this.context ) :
        0;

    for ( ; i < l; i++ ) {
      for ( cur = this[i]; cur && cur !== context; cur = cur.parentNode ) {
        // Always skip document fragments
        if ( cur.nodeType < 11 && (pos ?
          pos.index(cur) > -1 :

          // Don't pass non-elements to Sizzle
          cur.nodeType === 1 &&
            jQuery.find.matchesSelector(cur, selectors)) ) {

          cur = ret.push( cur );
          break;
        }
      }
    }

    return this.pushStack( ret.length > 1 ? jQuery.unique( ret ) : ret );
  },

  // Determine the position of an element within
  // the matched set of elements
  index: function( elem ) {

    // No argument, return index in parent
    if ( !elem ) {
      return ( this[0] && this[0].parentNode ) ? this.first().prevAll().length : -1;
    }

    // index in selector
    if ( typeof elem === "string" ) {
      return jQuery.inArray( this[0], jQuery( elem ) );
    }

    // Locate the position of the desired element
    return jQuery.inArray(
      // If it receives a jQuery object, the first element is used
      elem.jquery ? elem[0] : elem, this );
  },

  add: function( selector, context ) {
    var set = typeof selector === "string" ?
        jQuery( selector, context ) :
        jQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),
      all = jQuery.merge( this.get(), set );

    return this.pushStack( jQuery.unique(all) );
  },

  addBack: function( selector ) {
    return this.add( selector == null ?
      this.prevObject : this.prevObject.filter(selector)
    );
  }
});

function sibling( cur, dir ) {
  do {
    cur = cur[ dir ];
  } while ( cur && cur.nodeType !== 1 );

  return cur;
}

jQuery.each({
  parent: function( elem ) {
    var parent = elem.parentNode;
    return parent && parent.nodeType !== 11 ? parent : null;
  },
  parents: function( elem ) {
    return jQuery.dir( elem, "parentNode" );
  },
  parentsUntil: function( elem, i, until ) {
    return jQuery.dir( elem, "parentNode", until );
  },
  next: function( elem ) {
    return sibling( elem, "nextSibling" );
  },
  prev: function( elem ) {
    return sibling( elem, "previousSibling" );
  },
  nextAll: function( elem ) {
    return jQuery.dir( elem, "nextSibling" );
  },
  prevAll: function( elem ) {
    return jQuery.dir( elem, "previousSibling" );
  },
  nextUntil: function( elem, i, until ) {
    return jQuery.dir( elem, "nextSibling", until );
  },
  prevUntil: function( elem, i, until ) {
    return jQuery.dir( elem, "previousSibling", until );
  },
  siblings: function( elem ) {
    return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );
  },
  children: function( elem ) {
    return jQuery.sibling( elem.firstChild );
  },
  contents: function( elem ) {
    return jQuery.nodeName( elem, "iframe" ) ?
      elem.contentDocument || elem.contentWindow.document :
      jQuery.merge( [], elem.childNodes );
  }
}, function( name, fn ) {
  jQuery.fn[ name ] = function( until, selector ) {
    var ret = jQuery.map( this, fn, until );

    if ( name.slice( -5 ) !== "Until" ) {
      selector = until;
    }

    if ( selector && typeof selector === "string" ) {
      ret = jQuery.filter( selector, ret );
    }

    if ( this.length > 1 ) {
      // Remove duplicates
      if ( !guaranteedUnique[ name ] ) {
        ret = jQuery.unique( ret );
      }

      // Reverse order for parents* and prev-derivatives
      if ( rparentsprev.test( name ) ) {
        ret = ret.reverse();
      }
    }

    return this.pushStack( ret );
  };
});

jQuery.extend({
  filter: function( expr, elems, not ) {
    var elem = elems[ 0 ];

    if ( not ) {
      expr = ":not(" + expr + ")";
    }

    return elems.length === 1 && elem.nodeType === 1 ?
      jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :
      jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
        return elem.nodeType === 1;
      }));
  },

  dir: function( elem, dir, until ) {
    var matched = [],
      cur = elem[ dir ];

    while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
      if ( cur.nodeType === 1 ) {
        matched.push( cur );
      }
      cur = cur[dir];
    }
    return matched;
  },

  sibling: function( n, elem ) {
    var r = [];

    for ( ; n; n = n.nextSibling ) {
      if ( n.nodeType === 1 && n !== elem ) {
        r.push( n );
      }
    }

    return r;
  }
});

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
  if ( jQuery.isFunction( qualifier ) ) {
    return jQuery.grep( elements, function( elem, i ) {
      /* jshint -W018 */
      return !!qualifier.call( elem, i, elem ) !== not;
    });

  }

  if ( qualifier.nodeType ) {
    return jQuery.grep( elements, function( elem ) {
      return ( elem === qualifier ) !== not;
    });

  }

  if ( typeof qualifier === "string" ) {
    if ( isSimple.test( qualifier ) ) {
      return jQuery.filter( qualifier, elements, not );
    }

    qualifier = jQuery.filter( qualifier, elements );
  }

  return jQuery.grep( elements, function( elem ) {
    return ( jQuery.inArray( elem, qualifier ) >= 0 ) !== not;
  });
}
function createSafeFragment( document ) {
  var list = nodeNames.split( "|" ),
    safeFrag = document.createDocumentFragment();

  if ( safeFrag.createElement ) {
    while ( list.length ) {
      safeFrag.createElement(
        list.pop()
      );
    }
  }
  return safeFrag;
}

var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|" +
    "header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
  rinlinejQuery = / jQuery\d+="(?:null|\d+)"/g,
  rnoshimcache = new RegExp("<(?:" + nodeNames + ")[\\s/>]", "i"),
  rleadingWhitespace = /^\s+/,
  rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
  rtagName = /<([\w:]+)/,
  rtbody = /<tbody/i,
  rhtml = /<|&#?\w+;/,
  rnoInnerhtml = /<(?:script|style|link)/i,
  manipulation_rcheckableType = /^(?:checkbox|radio)$/i,
  // checked="checked" or checked
  rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
  rscriptType = /^$|\/(?:java|ecma)script/i,
  rscriptTypeMasked = /^true\/(.*)/,
  rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,

  // We have to close these tags to support XHTML (#13200)
  wrapMap = {
    option: [ 1, "<select multiple='multiple'>", "</select>" ],
    legend: [ 1, "<fieldset>", "</fieldset>" ],
    area: [ 1, "<map>", "</map>" ],
    param: [ 1, "<object>", "</object>" ],
    thead: [ 1, "<table>", "</table>" ],
    tr: [ 2, "<table><tbody>", "</tbody></table>" ],
    col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
    td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

    // IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
    // unless wrapped in a div with non-breaking characters in front of it.
    _default: jQuery.support.htmlSerialize ? [ 0, "", "" ] : [ 1, "X<div>", "</div>"  ]
  },
  safeFragment = createSafeFragment( document ),
  fragmentDiv = safeFragment.appendChild( document.createElement("div") );

wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

jQuery.fn.extend({
  text: function( value ) {
    return jQuery.access( this, function( value ) {
      return value === undefined ?
        jQuery.text( this ) :
        this.empty().append( ( this[0] && this[0].ownerDocument || document ).createTextNode( value ) );
    }, null, value, arguments.length );
  },

  append: function() {
    return this.domManip( arguments, function( elem ) {
      if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
        var target = manipulationTarget( this, elem );
        target.appendChild( elem );
      }
    });
  },

  prepend: function() {
    return this.domManip( arguments, function( elem ) {
      if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
        var target = manipulationTarget( this, elem );
        target.insertBefore( elem, target.firstChild );
      }
    });
  },

  before: function() {
    return this.domManip( arguments, function( elem ) {
      if ( this.parentNode ) {
        this.parentNode.insertBefore( elem, this );
      }
    });
  },

  after: function() {
    return this.domManip( arguments, function( elem ) {
      if ( this.parentNode ) {
        this.parentNode.insertBefore( elem, this.nextSibling );
      }
    });
  },

  // keepData is for internal use only--do not document
  remove: function( selector, keepData ) {
    var elem,
      elems = selector ? jQuery.filter( selector, this ) : this,
      i = 0;

    for ( ; (elem = elems[i]) != null; i++ ) {

      if ( !keepData && elem.nodeType === 1 ) {
        jQuery.cleanData( getAll( elem ) );
      }

      if ( elem.parentNode ) {
        if ( keepData && jQuery.contains( elem.ownerDocument, elem ) ) {
          setGlobalEval( getAll( elem, "script" ) );
        }
        elem.parentNode.removeChild( elem );
      }
    }

    return this;
  },

  empty: function() {
    var elem,
      i = 0;

    for ( ; (elem = this[i]) != null; i++ ) {
      // Remove element nodes and prevent memory leaks
      if ( elem.nodeType === 1 ) {
        jQuery.cleanData( getAll( elem, false ) );
      }

      // Remove any remaining nodes
      while ( elem.firstChild ) {
        elem.removeChild( elem.firstChild );
      }

      // If this is a select, ensure that it displays empty (#12336)
      // Support: IE<9
      if ( elem.options && jQuery.nodeName( elem, "select" ) ) {
        elem.options.length = 0;
      }
    }

    return this;
  },

  clone: function( dataAndEvents, deepDataAndEvents ) {
    dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
    deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

    return this.map( function () {
      return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
    });
  },

  html: function( value ) {
    return jQuery.access( this, function( value ) {
      var elem = this[0] || {},
        i = 0,
        l = this.length;

      if ( value === undefined ) {
        return elem.nodeType === 1 ?
          elem.innerHTML.replace( rinlinejQuery, "" ) :
          undefined;
      }

      // See if we can take a shortcut and just use innerHTML
      if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
        ( jQuery.support.htmlSerialize || !rnoshimcache.test( value )  ) &&
        ( jQuery.support.leadingWhitespace || !rleadingWhitespace.test( value ) ) &&
        !wrapMap[ ( rtagName.exec( value ) || ["", ""] )[1].toLowerCase() ] ) {

        value = value.replace( rxhtmlTag, "<$1></$2>" );

        try {
          for (; i < l; i++ ) {
            // Remove element nodes and prevent memory leaks
            elem = this[i] || {};
            if ( elem.nodeType === 1 ) {
              jQuery.cleanData( getAll( elem, false ) );
              elem.innerHTML = value;
            }
          }

          elem = 0;

        // If using innerHTML throws an exception, use the fallback method
        } catch(e) {}
      }

      if ( elem ) {
        this.empty().append( value );
      }
    }, null, value, arguments.length );
  },

  replaceWith: function() {
    var
      // Snapshot the DOM in case .domManip sweeps something relevant into its fragment
      args = jQuery.map( this, function( elem ) {
        return [ elem.nextSibling, elem.parentNode ];
      }),
      i = 0;

    // Make the changes, replacing each context element with the new content
    this.domManip( arguments, function( elem ) {
      var next = args[ i++ ],
        parent = args[ i++ ];

      if ( parent ) {
        // Don't use the snapshot next if it has moved (#13810)
        if ( next && next.parentNode !== parent ) {
          next = this.nextSibling;
        }
        jQuery( this ).remove();
        parent.insertBefore( elem, next );
      }
    // Allow new content to include elements from the context set
    }, true );

    // Force removal if there was no new content (e.g., from empty arguments)
    return i ? this : this.remove();
  },

  detach: function( selector ) {
    return this.remove( selector, true );
  },

  domManip: function( args, callback, allowIntersection ) {

    // Flatten any nested arrays
    args = core_concat.apply( [], args );

    var first, node, hasScripts,
      scripts, doc, fragment,
      i = 0,
      l = this.length,
      set = this,
      iNoClone = l - 1,
      value = args[0],
      isFunction = jQuery.isFunction( value );

    // We can't cloneNode fragments that contain checked, in WebKit
    if ( isFunction || !( l <= 1 || typeof value !== "string" || jQuery.support.checkClone || !rchecked.test( value ) ) ) {
      return this.each(function( index ) {
        var self = set.eq( index );
        if ( isFunction ) {
          args[0] = value.call( this, index, self.html() );
        }
        self.domManip( args, callback, allowIntersection );
      });
    }

    if ( l ) {
      fragment = jQuery.buildFragment( args, this[ 0 ].ownerDocument, false, !allowIntersection && this );
      first = fragment.firstChild;

      if ( fragment.childNodes.length === 1 ) {
        fragment = first;
      }

      if ( first ) {
        scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
        hasScripts = scripts.length;

        // Use the original fragment for the last item instead of the first because it can end up
        // being emptied incorrectly in certain situations (#8070).
        for ( ; i < l; i++ ) {
          node = fragment;

          if ( i !== iNoClone ) {
            node = jQuery.clone( node, true, true );

            // Keep references to cloned scripts for later restoration
            if ( hasScripts ) {
              jQuery.merge( scripts, getAll( node, "script" ) );
            }
          }

          callback.call( this[i], node, i );
        }

        if ( hasScripts ) {
          doc = scripts[ scripts.length - 1 ].ownerDocument;

          // Reenable scripts
          jQuery.map( scripts, restoreScript );

          // Evaluate executable scripts on first document insertion
          for ( i = 0; i < hasScripts; i++ ) {
            node = scripts[ i ];
            if ( rscriptType.test( node.type || "" ) &&
              !jQuery._data( node, "globalEval" ) && jQuery.contains( doc, node ) ) {

              if ( node.src ) {
                // Hope ajax is available...
                jQuery._evalUrl( node.src );
              } else {
                jQuery.globalEval( ( node.text || node.textContent || node.innerHTML || "" ).replace( rcleanScript, "" ) );
              }
            }
          }
        }

        // Fix #11809: Avoid leaking memory
        fragment = first = null;
      }
    }

    return this;
  }
});

// Support: IE<8
// Manipulating tables requires a tbody
function manipulationTarget( elem, content ) {
  return jQuery.nodeName( elem, "table" ) &&
    jQuery.nodeName( content.nodeType === 1 ? content : content.firstChild, "tr" ) ?

    elem.getElementsByTagName("tbody")[0] ||
      elem.appendChild( elem.ownerDocument.createElement("tbody") ) :
    elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
  elem.type = (jQuery.find.attr( elem, "type" ) !== null) + "/" + elem.type;
  return elem;
}
function restoreScript( elem ) {
  var match = rscriptTypeMasked.exec( elem.type );
  if ( match ) {
    elem.type = match[1];
  } else {
    elem.removeAttribute("type");
  }
  return elem;
}

// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
  var elem,
    i = 0;
  for ( ; (elem = elems[i]) != null; i++ ) {
    jQuery._data( elem, "globalEval", !refElements || jQuery._data( refElements[i], "globalEval" ) );
  }
}

function cloneCopyEvent( src, dest ) {

  if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
    return;
  }

  var type, i, l,
    oldData = jQuery._data( src ),
    curData = jQuery._data( dest, oldData ),
    events = oldData.events;

  if ( events ) {
    delete curData.handle;
    curData.events = {};

    for ( type in events ) {
      for ( i = 0, l = events[ type ].length; i < l; i++ ) {
        jQuery.event.add( dest, type, events[ type ][ i ] );
      }
    }
  }

  // make the cloned public data object a copy from the original
  if ( curData.data ) {
    curData.data = jQuery.extend( {}, curData.data );
  }
}

function fixCloneNodeIssues( src, dest ) {
  var nodeName, e, data;

  // We do not need to do anything for non-Elements
  if ( dest.nodeType !== 1 ) {
    return;
  }

  nodeName = dest.nodeName.toLowerCase();

  // IE6-8 copies events bound via attachEvent when using cloneNode.
  if ( !jQuery.support.noCloneEvent && dest[ jQuery.expando ] ) {
    data = jQuery._data( dest );

    for ( e in data.events ) {
      jQuery.removeEvent( dest, e, data.handle );
    }

    // Event data gets referenced instead of copied if the expando gets copied too
    dest.removeAttribute( jQuery.expando );
  }

  // IE blanks contents when cloning scripts, and tries to evaluate newly-set text
  if ( nodeName === "script" && dest.text !== src.text ) {
    disableScript( dest ).text = src.text;
    restoreScript( dest );

  // IE6-10 improperly clones children of object elements using classid.
  // IE10 throws NoModificationAllowedError if parent is null, #12132.
  } else if ( nodeName === "object" ) {
    if ( dest.parentNode ) {
      dest.outerHTML = src.outerHTML;
    }

    // This path appears unavoidable for IE9. When cloning an object
    // element in IE9, the outerHTML strategy above is not sufficient.
    // If the src has innerHTML and the destination does not,
    // copy the src.innerHTML into the dest.innerHTML. #10324
    if ( jQuery.support.html5Clone && ( src.innerHTML && !jQuery.trim(dest.innerHTML) ) ) {
      dest.innerHTML = src.innerHTML;
    }

  } else if ( nodeName === "input" && manipulation_rcheckableType.test( src.type ) ) {
    // IE6-8 fails to persist the checked state of a cloned checkbox
    // or radio button. Worse, IE6-7 fail to give the cloned element
    // a checked appearance if the defaultChecked value isn't also set

    dest.defaultChecked = dest.checked = src.checked;

    // IE6-7 get confused and end up setting the value of a cloned
    // checkbox/radio button to an empty string instead of "on"
    if ( dest.value !== src.value ) {
      dest.value = src.value;
    }

  // IE6-8 fails to return the selected option to the default selected
  // state when cloning options
  } else if ( nodeName === "option" ) {
    dest.defaultSelected = dest.selected = src.defaultSelected;

  // IE6-8 fails to set the defaultValue to the correct value when
  // cloning other types of input fields
  } else if ( nodeName === "input" || nodeName === "textarea" ) {
    dest.defaultValue = src.defaultValue;
  }
}

jQuery.each({
  appendTo: "append",
  prependTo: "prepend",
  insertBefore: "before",
  insertAfter: "after",
  replaceAll: "replaceWith"
}, function( name, original ) {
  jQuery.fn[ name ] = function( selector ) {
    var elems,
      i = 0,
      ret = [],
      insert = jQuery( selector ),
      last = insert.length - 1;

    for ( ; i <= last; i++ ) {
      elems = i === last ? this : this.clone(true);
      jQuery( insert[i] )[ original ]( elems );

      // Modern browsers can apply jQuery collections as arrays, but oldIE needs a .get()
      core_push.apply( ret, elems.get() );
    }

    return this.pushStack( ret );
  };
});

function getAll( context, tag ) {
  var elems, elem,
    i = 0,
    found = typeof context.getElementsByTagName !== core_strundefined ? context.getElementsByTagName( tag || "*" ) :
      typeof context.querySelectorAll !== core_strundefined ? context.querySelectorAll( tag || "*" ) :
      undefined;

  if ( !found ) {
    for ( found = [], elems = context.childNodes || context; (elem = elems[i]) != null; i++ ) {
      if ( !tag || jQuery.nodeName( elem, tag ) ) {
        found.push( elem );
      } else {
        jQuery.merge( found, getAll( elem, tag ) );
      }
    }
  }

  return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
    jQuery.merge( [ context ], found ) :
    found;
}

// Used in buildFragment, fixes the defaultChecked property
function fixDefaultChecked( elem ) {
  if ( manipulation_rcheckableType.test( elem.type ) ) {
    elem.defaultChecked = elem.checked;
  }
}

jQuery.extend({
  clone: function( elem, dataAndEvents, deepDataAndEvents ) {
    var destElements, node, clone, i, srcElements,
      inPage = jQuery.contains( elem.ownerDocument, elem );

    if ( jQuery.support.html5Clone || jQuery.isXMLDoc(elem) || !rnoshimcache.test( "<" + elem.nodeName + ">" ) ) {
      clone = elem.cloneNode( true );

    // IE<=8 does not properly clone detached, unknown element nodes
    } else {
      fragmentDiv.innerHTML = elem.outerHTML;
      fragmentDiv.removeChild( clone = fragmentDiv.firstChild );
    }

    if ( (!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) &&
        (elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem) ) {

      // We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
      destElements = getAll( clone );
      srcElements = getAll( elem );

      // Fix all IE cloning issues
      for ( i = 0; (node = srcElements[i]) != null; ++i ) {
        // Ensure that the destination node is not null; Fixes #9587
        if ( destElements[i] ) {
          fixCloneNodeIssues( node, destElements[i] );
        }
      }
    }

    // Copy the events from the original to the clone
    if ( dataAndEvents ) {
      if ( deepDataAndEvents ) {
        srcElements = srcElements || getAll( elem );
        destElements = destElements || getAll( clone );

        for ( i = 0; (node = srcElements[i]) != null; i++ ) {
          cloneCopyEvent( node, destElements[i] );
        }
      } else {
        cloneCopyEvent( elem, clone );
      }
    }

    // Preserve script evaluation history
    destElements = getAll( clone, "script" );
    if ( destElements.length > 0 ) {
      setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
    }

    destElements = srcElements = node = null;

    // Return the cloned set
    return clone;
  },

  buildFragment: function( elems, context, scripts, selection ) {
    var j, elem, contains,
      tmp, tag, tbody, wrap,
      l = elems.length,

      // Ensure a safe fragment
      safe = createSafeFragment( context ),

      nodes = [],
      i = 0;

    for ( ; i < l; i++ ) {
      elem = elems[ i ];

      if ( elem || elem === 0 ) {

        // Add nodes directly
        if ( jQuery.type( elem ) === "object" ) {
          jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

        // Convert non-html into a text node
        } else if ( !rhtml.test( elem ) ) {
          nodes.push( context.createTextNode( elem ) );

        // Convert html into DOM nodes
        } else {
          tmp = tmp || safe.appendChild( context.createElement("div") );

          // Deserialize a standard representation
          tag = ( rtagName.exec( elem ) || ["", ""] )[1].toLowerCase();
          wrap = wrapMap[ tag ] || wrapMap._default;

          tmp.innerHTML = wrap[1] + elem.replace( rxhtmlTag, "<$1></$2>" ) + wrap[2];

          // Descend through wrappers to the right content
          j = wrap[0];
          while ( j-- ) {
            tmp = tmp.lastChild;
          }

          // Manually add leading whitespace removed by IE
          if ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
            nodes.push( context.createTextNode( rleadingWhitespace.exec( elem )[0] ) );
          }

          // Remove IE's autoinserted <tbody> from table fragments
          if ( !jQuery.support.tbody ) {

            // String was a <table>, *may* have spurious <tbody>
            elem = tag === "table" && !rtbody.test( elem ) ?
              tmp.firstChild :

              // String was a bare <thead> or <tfoot>
              wrap[1] === "<table>" && !rtbody.test( elem ) ?
                tmp :
                0;

            j = elem && elem.childNodes.length;
            while ( j-- ) {
              if ( jQuery.nodeName( (tbody = elem.childNodes[j]), "tbody" ) && !tbody.childNodes.length ) {
                elem.removeChild( tbody );
              }
            }
          }

          jQuery.merge( nodes, tmp.childNodes );

          // Fix #12392 for WebKit and IE > 9
          tmp.textContent = "";

          // Fix #12392 for oldIE
          while ( tmp.firstChild ) {
            tmp.removeChild( tmp.firstChild );
          }

          // Remember the top-level container for proper cleanup
          tmp = safe.lastChild;
        }
      }
    }

    // Fix #11356: Clear elements from fragment
    if ( tmp ) {
      safe.removeChild( tmp );
    }

    // Reset defaultChecked for any radios and checkboxes
    // about to be appended to the DOM in IE 6/7 (#8060)
    if ( !jQuery.support.appendChecked ) {
      jQuery.grep( getAll( nodes, "input" ), fixDefaultChecked );
    }

    i = 0;
    while ( (elem = nodes[ i++ ]) ) {

      // #4087 - If origin and destination elements are the same, and this is
      // that element, do not do anything
      if ( selection && jQuery.inArray( elem, selection ) !== -1 ) {
        continue;
      }

      contains = jQuery.contains( elem.ownerDocument, elem );

      // Append to fragment
      tmp = getAll( safe.appendChild( elem ), "script" );

      // Preserve script evaluation history
      if ( contains ) {
        setGlobalEval( tmp );
      }

      // Capture executables
      if ( scripts ) {
        j = 0;
        while ( (elem = tmp[ j++ ]) ) {
          if ( rscriptType.test( elem.type || "" ) ) {
            scripts.push( elem );
          }
        }
      }
    }

    tmp = null;

    return safe;
  },

  cleanData: function( elems, /* internal */ acceptData ) {
    var elem, type, id, data,
      i = 0,
      internalKey = jQuery.expando,
      cache = jQuery.cache,
      deleteExpando = jQuery.support.deleteExpando,
      special = jQuery.event.special;

    for ( ; (elem = elems[i]) != null; i++ ) {

      if ( acceptData || jQuery.acceptData( elem ) ) {

        id = elem[ internalKey ];
        data = id && cache[ id ];

        if ( data ) {
          if ( data.events ) {
            for ( type in data.events ) {
              if ( special[ type ] ) {
                jQuery.event.remove( elem, type );

              // This is a shortcut to avoid jQuery.event.remove's overhead
              } else {
                jQuery.removeEvent( elem, type, data.handle );
              }
            }
          }

          // Remove cache only if it was not already removed by jQuery.event.remove
          if ( cache[ id ] ) {

            delete cache[ id ];

            // IE does not allow us to delete expando properties from nodes,
            // nor does it have a removeAttribute function on Document nodes;
            // we must handle all of these cases
            if ( deleteExpando ) {
              delete elem[ internalKey ];

            } else if ( typeof elem.removeAttribute !== core_strundefined ) {
              elem.removeAttribute( internalKey );

            } else {
              elem[ internalKey ] = null;
            }

            core_deletedIds.push( id );
          }
        }
      }
    }
  },

  _evalUrl: function( url ) {
    return jQuery.ajax({
      url: url,
      type: "GET",
      dataType: "script",
      async: false,
      global: false,
      "throws": true
    });
  }
});
jQuery.fn.extend({
  wrapAll: function( html ) {
    if ( jQuery.isFunction( html ) ) {
      return this.each(function(i) {
        jQuery(this).wrapAll( html.call(this, i) );
      });
    }

    if ( this[0] ) {
      // The elements to wrap the target around
      var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);

      if ( this[0].parentNode ) {
        wrap.insertBefore( this[0] );
      }

      wrap.map(function() {
        var elem = this;

        while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
          elem = elem.firstChild;
        }

        return elem;
      }).append( this );
    }

    return this;
  },

  wrapInner: function( html ) {
    if ( jQuery.isFunction( html ) ) {
      return this.each(function(i) {
        jQuery(this).wrapInner( html.call(this, i) );
      });
    }

    return this.each(function() {
      var self = jQuery( this ),
        contents = self.contents();

      if ( contents.length ) {
        contents.wrapAll( html );

      } else {
        self.append( html );
      }
    });
  },

  wrap: function( html ) {
    var isFunction = jQuery.isFunction( html );

    return this.each(function(i) {
      jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
    });
  },

  unwrap: function() {
    return this.parent().each(function() {
      if ( !jQuery.nodeName( this, "body" ) ) {
        jQuery( this ).replaceWith( this.childNodes );
      }
    }).end();
  }
});
var iframe, getStyles, curCSS,
  ralpha = /alpha\([^)]*\)/i,
  ropacity = /opacity\s*=\s*([^)]*)/,
  rposition = /^(top|right|bottom|left)$/,
  // swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
  // see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
  rdisplayswap = /^(none|table(?!-c[ea]).+)/,
  rmargin = /^margin/,
  rnumsplit = new RegExp( "^(" + core_pnum + ")(.*)$", "i" ),
  rnumnonpx = new RegExp( "^(" + core_pnum + ")(?!px)[a-z%]+$", "i" ),
  rrelNum = new RegExp( "^([+-])=(" + core_pnum + ")", "i" ),
  elemdisplay = { BODY: "block" },

  cssShow = { position: "absolute", visibility: "hidden", display: "block" },
  cssNormalTransform = {
    letterSpacing: 0,
    fontWeight: 400
  },

  cssExpand = [ "Top", "Right", "Bottom", "Left" ],
  cssPrefixes = [ "Webkit", "O", "Moz", "ms" ];

// return a css property mapped to a potentially vendor prefixed property
function vendorPropName( style, name ) {

  // shortcut for names that are not vendor prefixed
  if ( name in style ) {
    return name;
  }

  // check for vendor prefixed names
  var capName = name.charAt(0).toUpperCase() + name.slice(1),
    origName = name,
    i = cssPrefixes.length;

  while ( i-- ) {
    name = cssPrefixes[ i ] + capName;
    if ( name in style ) {
      return name;
    }
  }

  return origName;
}

function isHidden( elem, el ) {
  // isHidden might be called from jQuery#filter function;
  // in that case, element will be second argument
  elem = el || elem;
  return jQuery.css( elem, "display" ) === "none" || !jQuery.contains( elem.ownerDocument, elem );
}

function showHide( elements, show ) {
  var display, elem, hidden,
    values = [],
    index = 0,
    length = elements.length;

  for ( ; index < length; index++ ) {
    elem = elements[ index ];
    if ( !elem.style ) {
      continue;
    }

    values[ index ] = jQuery._data( elem, "olddisplay" );
    display = elem.style.display;
    if ( show ) {
      // Reset the inline display of this element to learn if it is
      // being hidden by cascaded rules or not
      if ( !values[ index ] && display === "none" ) {
        elem.style.display = "";
      }

      // Set elements which have been overridden with display: none
      // in a stylesheet to whatever the default browser style is
      // for such an element
      if ( elem.style.display === "" && isHidden( elem ) ) {
        values[ index ] = jQuery._data( elem, "olddisplay", css_defaultDisplay(elem.nodeName) );
      }
    } else {

      if ( !values[ index ] ) {
        hidden = isHidden( elem );

        if ( display && display !== "none" || !hidden ) {
          jQuery._data( elem, "olddisplay", hidden ? display : jQuery.css( elem, "display" ) );
        }
      }
    }
  }

  // Set the display of most of the elements in a second loop
  // to avoid the constant reflow
  for ( index = 0; index < length; index++ ) {
    elem = elements[ index ];
    if ( !elem.style ) {
      continue;
    }
    if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
      elem.style.display = show ? values[ index ] || "" : "none";
    }
  }

  return elements;
}

jQuery.fn.extend({
  css: function( name, value ) {
    return jQuery.access( this, function( elem, name, value ) {
      var len, styles,
        map = {},
        i = 0;

      if ( jQuery.isArray( name ) ) {
        styles = getStyles( elem );
        len = name.length;

        for ( ; i < len; i++ ) {
          map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
        }

        return map;
      }

      return value !== undefined ?
        jQuery.style( elem, name, value ) :
        jQuery.css( elem, name );
    }, name, value, arguments.length > 1 );
  },
  show: function() {
    return showHide( this, true );
  },
  hide: function() {
    return showHide( this );
  },
  toggle: function( state ) {
    var bool = typeof state === "boolean";

    return this.each(function() {
      if ( bool ? state : isHidden( this ) ) {
        jQuery( this ).show();
      } else {
        jQuery( this ).hide();
      }
    });
  }
});

jQuery.extend({
  // Add in style property hooks for overriding the default
  // behavior of getting and setting a style property
  cssHooks: {
    opacity: {
      get: function( elem, computed ) {
        if ( computed ) {
          // We should always get a number back from opacity
          var ret = curCSS( elem, "opacity" );
          return ret === "" ? "1" : ret;
        }
      }
    }
  },

  // Don't automatically add "px" to these possibly-unitless properties
  cssNumber: {
    "columnCount": true,
    "fillOpacity": true,
    "fontWeight": true,
    "lineHeight": true,
    "opacity": true,
    "orphans": true,
    "widows": true,
    "zIndex": true,
    "zoom": true
  },

  // Add in properties whose names you wish to fix before
  // setting or getting the value
  cssProps: {
    // normalize float css property
    "float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
  },

  // Get and set the style property on a DOM Node
  style: function( elem, name, value, extra ) {
    // Don't set styles on text and comment nodes
    if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
      return;
    }

    // Make sure that we're working with the right name
    var ret, type, hooks,
      origName = jQuery.camelCase( name ),
      style = elem.style;

    name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( style, origName ) );

    // gets hook for the prefixed version
    // followed by the unprefixed version
    hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

    // Check if we're setting a value
    if ( value !== undefined ) {
      type = typeof value;

      // convert relative number strings (+= or -=) to relative numbers. #7345
      if ( type === "string" && (ret = rrelNum.exec( value )) ) {
        value = ( ret[1] + 1 ) * ret[2] + parseFloat( jQuery.css( elem, name ) );
        // Fixes bug #9237
        type = "number";
      }

      // Make sure that NaN and null values aren't set. See: #7116
      if ( value == null || type === "number" && isNaN( value ) ) {
        return;
      }

      // If a number was passed in, add 'px' to the (except for certain CSS properties)
      if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
        value += "px";
      }

      // Fixes #8908, it can be done more correctly by specifing setters in cssHooks,
      // but it would mean to define eight (for every problematic property) identical functions
      if ( !jQuery.support.clearCloneStyle && value === "" && name.indexOf("background") === 0 ) {
        style[ name ] = "inherit";
      }

      // If a hook was provided, use that value, otherwise just set the specified value
      if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value, extra )) !== undefined ) {

        // Wrapped to prevent IE from throwing errors when 'invalid' values are provided
        // Fixes bug #5509
        try {
          style[ name ] = value;
        } catch(e) {}
      }

    } else {
      // If a hook was provided get the non-computed value from there
      if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
        return ret;
      }

      // Otherwise just get the value from the style object
      return style[ name ];
    }
  },

  css: function( elem, name, extra, styles ) {
    var num, val, hooks,
      origName = jQuery.camelCase( name );

    // Make sure that we're working with the right name
    name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( elem.style, origName ) );

    // gets hook for the prefixed version
    // followed by the unprefixed version
    hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

    // If a hook was provided get the computed value from there
    if ( hooks && "get" in hooks ) {
      val = hooks.get( elem, true, extra );
    }

    // Otherwise, if a way to get the computed value exists, use that
    if ( val === undefined ) {
      val = curCSS( elem, name, styles );
    }

    //convert "normal" to computed value
    if ( val === "normal" && name in cssNormalTransform ) {
      val = cssNormalTransform[ name ];
    }

    // Return, converting to number if forced or a qualifier was provided and val looks numeric
    if ( extra === "" || extra ) {
      num = parseFloat( val );
      return extra === true || jQuery.isNumeric( num ) ? num || 0 : val;
    }
    return val;
  }
});

// NOTE: we've included the "window" in window.getComputedStyle
// because jsdom on node.js will break without it.
if ( window.getComputedStyle ) {
  getStyles = function( elem ) {
    return window.getComputedStyle( elem, null );
  };

  curCSS = function( elem, name, _computed ) {
    var width, minWidth, maxWidth,
      computed = _computed || getStyles( elem ),

      // getPropertyValue is only needed for .css('filter') in IE9, see #12537
      ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined,
      style = elem.style;

    if ( computed ) {

      if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
        ret = jQuery.style( elem, name );
      }

      // A tribute to the "awesome hack by Dean Edwards"
      // Chrome < 17 and Safari 5.0 uses "computed value" instead of "used value" for margin-right
      // Safari 5.1.7 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
      // this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
      if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {

        // Remember the original values
        width = style.width;
        minWidth = style.minWidth;
        maxWidth = style.maxWidth;

        // Put in the new values to get a computed value out
        style.minWidth = style.maxWidth = style.width = ret;
        ret = computed.width;

        // Revert the changed values
        style.width = width;
        style.minWidth = minWidth;
        style.maxWidth = maxWidth;
      }
    }

    return ret;
  };
} else if ( document.documentElement.currentStyle ) {
  getStyles = function( elem ) {
    return elem.currentStyle;
  };

  curCSS = function( elem, name, _computed ) {
    var left, rs, rsLeft,
      computed = _computed || getStyles( elem ),
      ret = computed ? computed[ name ] : undefined,
      style = elem.style;

    // Avoid setting ret to empty string here
    // so we don't default to auto
    if ( ret == null && style && style[ name ] ) {
      ret = style[ name ];
    }

    // From the awesome hack by Dean Edwards
    // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

    // If we're not dealing with a regular pixel number
    // but a number that has a weird ending, we need to convert it to pixels
    // but not position css attributes, as those are proportional to the parent element instead
    // and we can't measure the parent instead because it might trigger a "stacking dolls" problem
    if ( rnumnonpx.test( ret ) && !rposition.test( name ) ) {

      // Remember the original values
      left = style.left;
      rs = elem.runtimeStyle;
      rsLeft = rs && rs.left;

      // Put in the new values to get a computed value out
      if ( rsLeft ) {
        rs.left = elem.currentStyle.left;
      }
      style.left = name === "fontSize" ? "1em" : ret;
      ret = style.pixelLeft + "px";

      // Revert the changed values
      style.left = left;
      if ( rsLeft ) {
        rs.left = rsLeft;
      }
    }

    return ret === "" ? "auto" : ret;
  };
}

function setPositiveNumber( elem, value, subtract ) {
  var matches = rnumsplit.exec( value );
  return matches ?
    // Guard against undefined "subtract", e.g., when used as in cssHooks
    Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
    value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
  var i = extra === ( isBorderBox ? "border" : "content" ) ?
    // If we already have the right measurement, avoid augmentation
    4 :
    // Otherwise initialize for horizontal or vertical properties
    name === "width" ? 1 : 0,

    val = 0;

  for ( ; i < 4; i += 2 ) {
    // both box models exclude margin, so add it if we want it
    if ( extra === "margin" ) {
      val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
    }

    if ( isBorderBox ) {
      // border-box includes padding, so remove it if we want content
      if ( extra === "content" ) {
        val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
      }

      // at this point, extra isn't border nor margin, so remove border
      if ( extra !== "margin" ) {
        val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
      }
    } else {
      // at this point, extra isn't content, so add padding
      val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

      // at this point, extra isn't content nor padding, so add border
      if ( extra !== "padding" ) {
        val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
      }
    }
  }

  return val;
}

function getWidthOrHeight( elem, name, extra ) {

  // Start with offset property, which is equivalent to the border-box value
  var valueIsBorderBox = true,
    val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
    styles = getStyles( elem ),
    isBorderBox = jQuery.support.boxSizing && jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

  // some non-html elements return undefined for offsetWidth, so check for null/undefined
  // svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
  // MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
  if ( val <= 0 || val == null ) {
    // Fall back to computed then uncomputed css if necessary
    val = curCSS( elem, name, styles );
    if ( val < 0 || val == null ) {
      val = elem.style[ name ];
    }

    // Computed unit is not pixels. Stop here and return.
    if ( rnumnonpx.test(val) ) {
      return val;
    }

    // we need the check for style in case a browser which returns unreliable values
    // for getComputedStyle silently falls back to the reliable elem.style
    valueIsBorderBox = isBorderBox && ( jQuery.support.boxSizingReliable || val === elem.style[ name ] );

    // Normalize "", auto, and prepare for extra
    val = parseFloat( val ) || 0;
  }

  // use the active box-sizing model to add/subtract irrelevant styles
  return ( val +
    augmentWidthOrHeight(
      elem,
      name,
      extra || ( isBorderBox ? "border" : "content" ),
      valueIsBorderBox,
      styles
    )
  ) + "px";
}

// Try to determine the default display value of an element
function css_defaultDisplay( nodeName ) {
  var doc = document,
    display = elemdisplay[ nodeName ];

  if ( !display ) {
    display = actualDisplay( nodeName, doc );

    // If the simple way fails, read from inside an iframe
    if ( display === "none" || !display ) {
      // Use the already-created iframe if possible
      iframe = ( iframe ||
        jQuery("<iframe frameborder='0' width='0' height='0'/>")
        .css( "cssText", "display:block !important" )
      ).appendTo( doc.documentElement );

      // Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
      doc = ( iframe[0].contentWindow || iframe[0].contentDocument ).document;
      doc.write("<!doctype html><html><body>");
      doc.close();

      display = actualDisplay( nodeName, doc );
      iframe.detach();
    }

    // Store the correct default display
    elemdisplay[ nodeName ] = display;
  }

  return display;
}

// Called ONLY from within css_defaultDisplay
function actualDisplay( name, doc ) {
  var elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),
    display = jQuery.css( elem[0], "display" );
  elem.remove();
  return display;
}

jQuery.each([ "height", "width" ], function( i, name ) {
  jQuery.cssHooks[ name ] = {
    get: function( elem, computed, extra ) {
      if ( computed ) {
        // certain elements can have dimension info if we invisibly show them
        // however, it must have a current display style that would benefit from this
        return elem.offsetWidth === 0 && rdisplayswap.test( jQuery.css( elem, "display" ) ) ?
          jQuery.swap( elem, cssShow, function() {
            return getWidthOrHeight( elem, name, extra );
          }) :
          getWidthOrHeight( elem, name, extra );
      }
    },

    set: function( elem, value, extra ) {
      var styles = extra && getStyles( elem );
      return setPositiveNumber( elem, value, extra ?
        augmentWidthOrHeight(
          elem,
          name,
          extra,
          jQuery.support.boxSizing && jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
          styles
        ) : 0
      );
    }
  };
});

if ( !jQuery.support.opacity ) {
  jQuery.cssHooks.opacity = {
    get: function( elem, computed ) {
      // IE uses filters for opacity
      return ropacity.test( (computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "" ) ?
        ( 0.01 * parseFloat( RegExp.$1 ) ) + "" :
        computed ? "1" : "";
    },

    set: function( elem, value ) {
      var style = elem.style,
        currentStyle = elem.currentStyle,
        opacity = jQuery.isNumeric( value ) ? "alpha(opacity=" + value * 100 + ")" : "",
        filter = currentStyle && currentStyle.filter || style.filter || "";

      // IE has trouble with opacity if it does not have layout
      // Force it by setting the zoom level
      style.zoom = 1;

      // if setting opacity to 1, and no other filters exist - attempt to remove filter attribute #6652
      // if value === "", then remove inline opacity #12685
      if ( ( value >= 1 || value === "" ) &&
          jQuery.trim( filter.replace( ralpha, "" ) ) === "" &&
          style.removeAttribute ) {

        // Setting style.filter to null, "" & " " still leave "filter:" in the cssText
        // if "filter:" is present at all, clearType is disabled, we want to avoid this
        // style.removeAttribute is IE Only, but so apparently is this code path...
        style.removeAttribute( "filter" );

        // if there is no filter style applied in a css rule or unset inline opacity, we are done
        if ( value === "" || currentStyle && !currentStyle.filter ) {
          return;
        }
      }

      // otherwise, set new filter values
      style.filter = ralpha.test( filter ) ?
        filter.replace( ralpha, opacity ) :
        filter + " " + opacity;
    }
  };
}

// These hooks cannot be added until DOM ready because the support test
// for it is not run until after DOM ready
jQuery(function() {
  if ( !jQuery.support.reliableMarginRight ) {
    jQuery.cssHooks.marginRight = {
      get: function( elem, computed ) {
        if ( computed ) {
          // WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
          // Work around by temporarily setting element display to inline-block
          return jQuery.swap( elem, { "display": "inline-block" },
            curCSS, [ elem, "marginRight" ] );
        }
      }
    };
  }

  // Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
  // getComputedStyle returns percent when specified for top/left/bottom/right
  // rather than make the css module depend on the offset module, we just check for it here
  if ( !jQuery.support.pixelPosition && jQuery.fn.position ) {
    jQuery.each( [ "top", "left" ], function( i, prop ) {
      jQuery.cssHooks[ prop ] = {
        get: function( elem, computed ) {
          if ( computed ) {
            computed = curCSS( elem, prop );
            // if curCSS returns percentage, fallback to offset
            return rnumnonpx.test( computed ) ?
              jQuery( elem ).position()[ prop ] + "px" :
              computed;
          }
        }
      };
    });
  }

});

if ( jQuery.expr && jQuery.expr.filters ) {
  jQuery.expr.filters.hidden = function( elem ) {
    // Support: Opera <= 12.12
    // Opera reports offsetWidths and offsetHeights less than zero on some elements
    return elem.offsetWidth <= 0 && elem.offsetHeight <= 0 ||
      (!jQuery.support.reliableHiddenOffsets && ((elem.style && elem.style.display) || jQuery.css( elem, "display" )) === "none");
  };

  jQuery.expr.filters.visible = function( elem ) {
    return !jQuery.expr.filters.hidden( elem );
  };
}

// These hooks are used by animate to expand properties
jQuery.each({
  margin: "",
  padding: "",
  border: "Width"
}, function( prefix, suffix ) {
  jQuery.cssHooks[ prefix + suffix ] = {
    expand: function( value ) {
      var i = 0,
        expanded = {},

        // assumes a single number if not a string
        parts = typeof value === "string" ? value.split(" ") : [ value ];

      for ( ; i < 4; i++ ) {
        expanded[ prefix + cssExpand[ i ] + suffix ] =
          parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
      }

      return expanded;
    }
  };

  if ( !rmargin.test( prefix ) ) {
    jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
  }
});
var r20 = /%20/g,
  rbracket = /\[\]$/,
  rCRLF = /\r?\n/g,
  rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
  rsubmittable = /^(?:input|select|textarea|keygen)/i;

jQuery.fn.extend({
  serialize: function() {
    return jQuery.param( this.serializeArray() );
  },
  serializeArray: function() {
    return this.map(function(){
      // Can add propHook for "elements" to filter or add form elements
      var elements = jQuery.prop( this, "elements" );
      return elements ? jQuery.makeArray( elements ) : this;
    })
    .filter(function(){
      var type = this.type;
      // Use .is(":disabled") so that fieldset[disabled] works
      return this.name && !jQuery( this ).is( ":disabled" ) &&
        rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
        ( this.checked || !manipulation_rcheckableType.test( type ) );
    })
    .map(function( i, elem ){
      var val = jQuery( this ).val();

      return val == null ?
        null :
        jQuery.isArray( val ) ?
          jQuery.map( val, function( val ){
            return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
          }) :
          { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
    }).get();
  }
});

//Serialize an array of form elements or a set of
//key/values into a query string
jQuery.param = function( a, traditional ) {
  var prefix,
    s = [],
    add = function( key, value ) {
      // If value is a function, invoke it and return its value
      value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
      s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
    };

  // Set traditional to true for jQuery <= 1.3.2 behavior.
  if ( traditional === undefined ) {
    traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
  }

  // If an array was passed in, assume that it is an array of form elements.
  if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
    // Serialize the form elements
    jQuery.each( a, function() {
      add( this.name, this.value );
    });

  } else {
    // If traditional, encode the "old" way (the way 1.3.2 or older
    // did it), otherwise encode params recursively.
    for ( prefix in a ) {
      buildParams( prefix, a[ prefix ], traditional, add );
    }
  }

  // Return the resulting serialization
  return s.join( "&" ).replace( r20, "+" );
};

function buildParams( prefix, obj, traditional, add ) {
  var name;

  if ( jQuery.isArray( obj ) ) {
    // Serialize array item.
    jQuery.each( obj, function( i, v ) {
      if ( traditional || rbracket.test( prefix ) ) {
        // Treat each array item as a scalar.
        add( prefix, v );

      } else {
        // Item is non-scalar (array or object), encode its numeric index.
        buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
      }
    });

  } else if ( !traditional && jQuery.type( obj ) === "object" ) {
    // Serialize object item.
    for ( name in obj ) {
      buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
    }

  } else {
    // Serialize scalar item.
    add( prefix, obj );
  }
}
jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
  "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
  "change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

  // Handle event binding
  jQuery.fn[ name ] = function( data, fn ) {
    return arguments.length > 0 ?
      this.on( name, null, data, fn ) :
      this.trigger( name );
  };
});

jQuery.fn.extend({
  hover: function( fnOver, fnOut ) {
    return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
  },

  bind: function( types, data, fn ) {
    return this.on( types, null, data, fn );
  },
  unbind: function( types, fn ) {
    return this.off( types, null, fn );
  },

  delegate: function( selector, types, data, fn ) {
    return this.on( types, selector, data, fn );
  },
  undelegate: function( selector, types, fn ) {
    // ( namespace ) or ( selector, types [, fn] )
    return arguments.length === 1 ? this.off( selector, "**" ) : this.off( types, selector || "**", fn );
  }
});
var
  // Document location
  ajaxLocParts,
  ajaxLocation,
  ajax_nonce = jQuery.now(),

  ajax_rquery = /\?/,
  rhash = /#.*$/,
  rts = /([?&])_=[^&]*/,
  rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
  // #7653, #8125, #8152: local protocol detection
  rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
  rnoContent = /^(?:GET|HEAD)$/,
  rprotocol = /^\/\//,
  rurl = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,

  // Keep a copy of the old load method
  _load = jQuery.fn.load,

  /* Prefilters
   * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
   * 2) These are called:
   *    - BEFORE asking for a transport
   *    - AFTER param serialization (s.data is a string if s.processData is true)
   * 3) key is the dataType
   * 4) the catchall symbol "*" can be used
   * 5) execution will start with transport dataType and THEN continue down to "*" if needed
   */
  prefilters = {},

  /* Transports bindings
   * 1) key is the dataType
   * 2) the catchall symbol "*" can be used
   * 3) selection will start with transport dataType and THEN go to "*" if needed
   */
  transports = {},

  // Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
  allTypes = "*/".concat("*");

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
try {
  ajaxLocation = location.href;
} catch( e ) {
  // Use the href attribute of an A element
  // since IE will modify it given document.location
  ajaxLocation = document.createElement( "a" );
  ajaxLocation.href = "";
  ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

  // dataTypeExpression is optional and defaults to "*"
  return function( dataTypeExpression, func ) {

    if ( typeof dataTypeExpression !== "string" ) {
      func = dataTypeExpression;
      dataTypeExpression = "*";
    }

    var dataType,
      i = 0,
      dataTypes = dataTypeExpression.toLowerCase().match( core_rnotwhite ) || [];

    if ( jQuery.isFunction( func ) ) {
      // For each dataType in the dataTypeExpression
      while ( (dataType = dataTypes[i++]) ) {
        // Prepend if requested
        if ( dataType[0] === "+" ) {
          dataType = dataType.slice( 1 ) || "*";
          (structure[ dataType ] = structure[ dataType ] || []).unshift( func );

        // Otherwise append
        } else {
          (structure[ dataType ] = structure[ dataType ] || []).push( func );
        }
      }
    }
  };
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

  var inspected = {},
    seekingTransport = ( structure === transports );

  function inspect( dataType ) {
    var selected;
    inspected[ dataType ] = true;
    jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
      var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
      if( typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[ dataTypeOrTransport ] ) {
        options.dataTypes.unshift( dataTypeOrTransport );
        inspect( dataTypeOrTransport );
        return false;
      } else if ( seekingTransport ) {
        return !( selected = dataTypeOrTransport );
      }
    });
    return selected;
  }

  return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
  var deep, key,
    flatOptions = jQuery.ajaxSettings.flatOptions || {};

  for ( key in src ) {
    if ( src[ key ] !== undefined ) {
      ( flatOptions[ key ] ? target : ( deep || (deep = {}) ) )[ key ] = src[ key ];
    }
  }
  if ( deep ) {
    jQuery.extend( true, target, deep );
  }

  return target;
}

jQuery.fn.load = function( url, params, callback ) {
  if ( typeof url !== "string" && _load ) {
    return _load.apply( this, arguments );
  }

  var selector, response, type,
    self = this,
    off = url.indexOf(" ");

  if ( off >= 0 ) {
    selector = url.slice( off, url.length );
    url = url.slice( 0, off );
  }

  // If it's a function
  if ( jQuery.isFunction( params ) ) {

    // We assume that it's the callback
    callback = params;
    params = undefined;

  // Otherwise, build a param string
  } else if ( params && typeof params === "object" ) {
    type = "POST";
  }

  // If we have elements to modify, make the request
  if ( self.length > 0 ) {
    jQuery.ajax({
      url: url,

      // if "type" variable is undefined, then "GET" method will be used
      type: type,
      dataType: "html",
      data: params
    }).done(function( responseText ) {

      // Save response for use in complete callback
      response = arguments;

      self.html( selector ?

        // If a selector was specified, locate the right elements in a dummy div
        // Exclude scripts to avoid IE 'Permission Denied' errors
        jQuery("<div>").append( jQuery.parseHTML( responseText ) ).find( selector ) :

        // Otherwise use the full result
        responseText );

    }).complete( callback && function( jqXHR, status ) {
      self.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );
    });
  }

  return this;
};

// Attach a bunch of functions for handling common AJAX events
jQuery.each( [ "ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend" ], function( i, type ){
  jQuery.fn[ type ] = function( fn ){
    return this.on( type, fn );
  };
});

jQuery.extend({

  // Counter for holding the number of active queries
  active: 0,

  // Last-Modified header cache for next request
  lastModified: {},
  etag: {},

  ajaxSettings: {
    url: ajaxLocation,
    type: "GET",
    isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
    global: true,
    processData: true,
    async: true,
    contentType: "application/x-www-form-urlencoded; charset=UTF-8",
    /*
    timeout: 0,
    data: null,
    dataType: null,
    username: null,
    password: null,
    cache: null,
    throws: false,
    traditional: false,
    headers: {},
    */

    accepts: {
      "*": allTypes,
      text: "text/plain",
      html: "text/html",
      xml: "application/xml, text/xml",
      json: "application/json, text/javascript"
    },

    contents: {
      xml: /xml/,
      html: /html/,
      json: /json/
    },

    responseFields: {
      xml: "responseXML",
      text: "responseText",
      json: "responseJSON"
    },

    // Data converters
    // Keys separate source (or catchall "*") and destination types with a single space
    converters: {

      // Convert anything to text
      "* text": String,

      // Text to html (true = no transformation)
      "text html": true,

      // Evaluate text as a json expression
      "text json": jQuery.parseJSON,

      // Parse text as xml
      "text xml": jQuery.parseXML
    },

    // For options that shouldn't be deep extended:
    // you can add your own custom options here if
    // and when you create one that shouldn't be
    // deep extended (see ajaxExtend)
    flatOptions: {
      url: true,
      context: true
    }
  },

  // Creates a full fledged settings object into target
  // with both ajaxSettings and settings fields.
  // If target is omitted, writes into ajaxSettings.
  ajaxSetup: function( target, settings ) {
    return settings ?

      // Building a settings object
      ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

      // Extending ajaxSettings
      ajaxExtend( jQuery.ajaxSettings, target );
  },

  ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
  ajaxTransport: addToPrefiltersOrTransports( transports ),

  // Main method
  ajax: function( url, options ) {

    // If url is an object, simulate pre-1.5 signature
    if ( typeof url === "object" ) {
      options = url;
      url = undefined;
    }

    // Force options to be an object
    options = options || {};

    var // Cross-domain detection vars
      parts,
      // Loop variable
      i,
      // URL without anti-cache param
      cacheURL,
      // Response headers as string
      responseHeadersString,
      // timeout handle
      timeoutTimer,

      // To know if global events are to be dispatched
      fireGlobals,

      transport,
      // Response headers
      responseHeaders,
      // Create the final options object
      s = jQuery.ajaxSetup( {}, options ),
      // Callbacks context
      callbackContext = s.context || s,
      // Context for global events is callbackContext if it is a DOM node or jQuery collection
      globalEventContext = s.context && ( callbackContext.nodeType || callbackContext.jquery ) ?
        jQuery( callbackContext ) :
        jQuery.event,
      // Deferreds
      deferred = jQuery.Deferred(),
      completeDeferred = jQuery.Callbacks("once memory"),
      // Status-dependent callbacks
      statusCode = s.statusCode || {},
      // Headers (they are sent all at once)
      requestHeaders = {},
      requestHeadersNames = {},
      // The jqXHR state
      state = 0,
      // Default abort message
      strAbort = "canceled",
      // Fake xhr
      jqXHR = {
        readyState: 0,

        // Builds headers hashtable if needed
        getResponseHeader: function( key ) {
          var match;
          if ( state === 2 ) {
            if ( !responseHeaders ) {
              responseHeaders = {};
              while ( (match = rheaders.exec( responseHeadersString )) ) {
                responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
              }
            }
            match = responseHeaders[ key.toLowerCase() ];
          }
          return match == null ? null : match;
        },

        // Raw string
        getAllResponseHeaders: function() {
          return state === 2 ? responseHeadersString : null;
        },

        // Caches the header
        setRequestHeader: function( name, value ) {
          var lname = name.toLowerCase();
          if ( !state ) {
            name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
            requestHeaders[ name ] = value;
          }
          return this;
        },

        // Overrides response content-type header
        overrideMimeType: function( type ) {
          if ( !state ) {
            s.mimeType = type;
          }
          return this;
        },

        // Status-dependent callbacks
        statusCode: function( map ) {
          var code;
          if ( map ) {
            if ( state < 2 ) {
              for ( code in map ) {
                // Lazy-add the new callback in a way that preserves old ones
                statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
              }
            } else {
              // Execute the appropriate callbacks
              jqXHR.always( map[ jqXHR.status ] );
            }
          }
          return this;
        },

        // Cancel the request
        abort: function( statusText ) {
          var finalText = statusText || strAbort;
          if ( transport ) {
            transport.abort( finalText );
          }
          done( 0, finalText );
          return this;
        }
      };

    // Attach deferreds
    deferred.promise( jqXHR ).complete = completeDeferred.add;
    jqXHR.success = jqXHR.done;
    jqXHR.error = jqXHR.fail;

    // Remove hash character (#7531: and string promotion)
    // Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
    // Handle falsy url in the settings object (#10093: consistency with old signature)
    // We also use the url parameter if available
    s.url = ( ( url || s.url || ajaxLocation ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

    // Alias method option to type as per ticket #12004
    s.type = options.method || options.type || s.method || s.type;

    // Extract dataTypes list
    s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( core_rnotwhite ) || [""];

    // A cross-domain request is in order when we have a protocol:host:port mismatch
    if ( s.crossDomain == null ) {
      parts = rurl.exec( s.url.toLowerCase() );
      s.crossDomain = !!( parts &&
        ( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
          ( parts[ 3 ] || ( parts[ 1 ] === "http:" ? "80" : "443" ) ) !==
            ( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? "80" : "443" ) ) )
      );
    }

    // Convert data if not already a string
    if ( s.data && s.processData && typeof s.data !== "string" ) {
      s.data = jQuery.param( s.data, s.traditional );
    }

    // Apply prefilters
    inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

    // If request was aborted inside a prefilter, stop there
    if ( state === 2 ) {
      return jqXHR;
    }

    // We can fire global events as of now if asked to
    fireGlobals = s.global;

    // Watch for a new set of requests
    if ( fireGlobals && jQuery.active++ === 0 ) {
      jQuery.event.trigger("ajaxStart");
    }

    // Uppercase the type
    s.type = s.type.toUpperCase();

    // Determine if request has content
    s.hasContent = !rnoContent.test( s.type );

    // Save the URL in case we're toying with the If-Modified-Since
    // and/or If-None-Match header later on
    cacheURL = s.url;

    // More options handling for requests with no content
    if ( !s.hasContent ) {

      // If data is available, append data to url
      if ( s.data ) {
        cacheURL = ( s.url += ( ajax_rquery.test( cacheURL ) ? "&" : "?" ) + s.data );
        // #9682: remove data so that it's not used in an eventual retry
        delete s.data;
      }

      // Add anti-cache in url if needed
      if ( s.cache === false ) {
        s.url = rts.test( cacheURL ) ?

          // If there is already a '_' parameter, set its value
          cacheURL.replace( rts, "$1_=" + ajax_nonce++ ) :

          // Otherwise add one to the end
          cacheURL + ( ajax_rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + ajax_nonce++;
      }
    }

    // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
    if ( s.ifModified ) {
      if ( jQuery.lastModified[ cacheURL ] ) {
        jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
      }
      if ( jQuery.etag[ cacheURL ] ) {
        jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
      }
    }

    // Set the correct header, if data is being sent
    if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
      jqXHR.setRequestHeader( "Content-Type", s.contentType );
    }

    // Set the Accepts header for the server, depending on the dataType
    jqXHR.setRequestHeader(
      "Accept",
      s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
        s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
        s.accepts[ "*" ]
    );

    // Check for headers option
    for ( i in s.headers ) {
      jqXHR.setRequestHeader( i, s.headers[ i ] );
    }

    // Allow custom headers/mimetypes and early abort
    if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
      // Abort if not done already and return
      return jqXHR.abort();
    }

    // aborting is no longer a cancellation
    strAbort = "abort";

    // Install callbacks on deferreds
    for ( i in { success: 1, error: 1, complete: 1 } ) {
      jqXHR[ i ]( s[ i ] );
    }

    // Get transport
    transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

    // If no transport, we auto-abort
    if ( !transport ) {
      done( -1, "No Transport" );
    } else {
      jqXHR.readyState = 1;

      // Send global event
      if ( fireGlobals ) {
        globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
      }
      // Timeout
      if ( s.async && s.timeout > 0 ) {
        timeoutTimer = setTimeout(function() {
          jqXHR.abort("timeout");
        }, s.timeout );
      }

      try {
        state = 1;
        transport.send( requestHeaders, done );
      } catch ( e ) {
        // Propagate exception as error if not done
        if ( state < 2 ) {
          done( -1, e );
        // Simply rethrow otherwise
        } else {
          throw e;
        }
      }
    }

    // Callback for when everything is done
    function done( status, nativeStatusText, responses, headers ) {
      var isSuccess, success, error, response, modified,
        statusText = nativeStatusText;

      // Called once
      if ( state === 2 ) {
        return;
      }

      // State is "done" now
      state = 2;

      // Clear timeout if it exists
      if ( timeoutTimer ) {
        clearTimeout( timeoutTimer );
      }

      // Dereference transport for early garbage collection
      // (no matter how long the jqXHR object will be used)
      transport = undefined;

      // Cache response headers
      responseHeadersString = headers || "";

      // Set readyState
      jqXHR.readyState = status > 0 ? 4 : 0;

      // Determine if successful
      isSuccess = status >= 200 && status < 300 || status === 304;

      // Get response data
      if ( responses ) {
        response = ajaxHandleResponses( s, jqXHR, responses );
      }

      // Convert no matter what (that way responseXXX fields are always set)
      response = ajaxConvert( s, response, jqXHR, isSuccess );

      // If successful, handle type chaining
      if ( isSuccess ) {

        // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
        if ( s.ifModified ) {
          modified = jqXHR.getResponseHeader("Last-Modified");
          if ( modified ) {
            jQuery.lastModified[ cacheURL ] = modified;
          }
          modified = jqXHR.getResponseHeader("etag");
          if ( modified ) {
            jQuery.etag[ cacheURL ] = modified;
          }
        }

        // if no content
        if ( status === 204 || s.type === "HEAD" ) {
          statusText = "nocontent";

        // if not modified
        } else if ( status === 304 ) {
          statusText = "notmodified";

        // If we have data, let's convert it
        } else {
          statusText = response.state;
          success = response.data;
          error = response.error;
          isSuccess = !error;
        }
      } else {
        // We extract error from statusText
        // then normalize statusText and status for non-aborts
        error = statusText;
        if ( status || !statusText ) {
          statusText = "error";
          if ( status < 0 ) {
            status = 0;
          }
        }
      }

      // Set data for the fake xhr object
      jqXHR.status = status;
      jqXHR.statusText = ( nativeStatusText || statusText ) + "";

      // Success/Error
      if ( isSuccess ) {
        deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
      } else {
        deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
      }

      // Status-dependent callbacks
      jqXHR.statusCode( statusCode );
      statusCode = undefined;

      if ( fireGlobals ) {
        globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
          [ jqXHR, s, isSuccess ? success : error ] );
      }

      // Complete
      completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

      if ( fireGlobals ) {
        globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
        // Handle the global AJAX counter
        if ( !( --jQuery.active ) ) {
          jQuery.event.trigger("ajaxStop");
        }
      }
    }

    return jqXHR;
  },

  getJSON: function( url, data, callback ) {
    return jQuery.get( url, data, callback, "json" );
  },

  getScript: function( url, callback ) {
    return jQuery.get( url, undefined, callback, "script" );
  }
});

jQuery.each( [ "get", "post" ], function( i, method ) {
  jQuery[ method ] = function( url, data, callback, type ) {
    // shift arguments if data argument was omitted
    if ( jQuery.isFunction( data ) ) {
      type = type || callback;
      callback = data;
      data = undefined;
    }

    return jQuery.ajax({
      url: url,
      type: method,
      dataType: type,
      data: data,
      success: callback
    });
  };
});

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {
  var firstDataType, ct, finalDataType, type,
    contents = s.contents,
    dataTypes = s.dataTypes;

  // Remove auto dataType and get content-type in the process
  while( dataTypes[ 0 ] === "*" ) {
    dataTypes.shift();
    if ( ct === undefined ) {
      ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
    }
  }

  // Check if we're dealing with a known content-type
  if ( ct ) {
    for ( type in contents ) {
      if ( contents[ type ] && contents[ type ].test( ct ) ) {
        dataTypes.unshift( type );
        break;
      }
    }
  }

  // Check to see if we have a response for the expected dataType
  if ( dataTypes[ 0 ] in responses ) {
    finalDataType = dataTypes[ 0 ];
  } else {
    // Try convertible dataTypes
    for ( type in responses ) {
      if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
        finalDataType = type;
        break;
      }
      if ( !firstDataType ) {
        firstDataType = type;
      }
    }
    // Or just use first one
    finalDataType = finalDataType || firstDataType;
  }

  // If we found a dataType
  // We add the dataType to the list if needed
  // and return the corresponding response
  if ( finalDataType ) {
    if ( finalDataType !== dataTypes[ 0 ] ) {
      dataTypes.unshift( finalDataType );
    }
    return responses[ finalDataType ];
  }
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
  var conv2, current, conv, tmp, prev,
    converters = {},
    // Work with a copy of dataTypes in case we need to modify it for conversion
    dataTypes = s.dataTypes.slice();

  // Create converters map with lowercased keys
  if ( dataTypes[ 1 ] ) {
    for ( conv in s.converters ) {
      converters[ conv.toLowerCase() ] = s.converters[ conv ];
    }
  }

  current = dataTypes.shift();

  // Convert to each sequential dataType
  while ( current ) {

    if ( s.responseFields[ current ] ) {
      jqXHR[ s.responseFields[ current ] ] = response;
    }

    // Apply the dataFilter if provided
    if ( !prev && isSuccess && s.dataFilter ) {
      response = s.dataFilter( response, s.dataType );
    }

    prev = current;
    current = dataTypes.shift();

    if ( current ) {

      // There's only work to do if current dataType is non-auto
      if ( current === "*" ) {

        current = prev;

      // Convert response if prev dataType is non-auto and differs from current
      } else if ( prev !== "*" && prev !== current ) {

        // Seek a direct converter
        conv = converters[ prev + " " + current ] || converters[ "* " + current ];

        // If none found, seek a pair
        if ( !conv ) {
          for ( conv2 in converters ) {

            // If conv2 outputs current
            tmp = conv2.split( " " );
            if ( tmp[ 1 ] === current ) {

              // If prev can be converted to accepted input
              conv = converters[ prev + " " + tmp[ 0 ] ] ||
                converters[ "* " + tmp[ 0 ] ];
              if ( conv ) {
                // Condense equivalence converters
                if ( conv === true ) {
                  conv = converters[ conv2 ];

                // Otherwise, insert the intermediate dataType
                } else if ( converters[ conv2 ] !== true ) {
                  current = tmp[ 0 ];
                  dataTypes.unshift( tmp[ 1 ] );
                }
                break;
              }
            }
          }
        }

        // Apply converter (if not an equivalence)
        if ( conv !== true ) {

          // Unless errors are allowed to bubble, catch and return them
          if ( conv && s[ "throws" ] ) {
            response = conv( response );
          } else {
            try {
              response = conv( response );
            } catch ( e ) {
              return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
            }
          }
        }
      }
    }
  }

  return { state: "success", data: response };
}
// Install script dataType
jQuery.ajaxSetup({
  accepts: {
    script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
  },
  contents: {
    script: /(?:java|ecma)script/
  },
  converters: {
    "text script": function( text ) {
      jQuery.globalEval( text );
      return text;
    }
  }
});

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
  if ( s.cache === undefined ) {
    s.cache = false;
  }
  if ( s.crossDomain ) {
    s.type = "GET";
    s.global = false;
  }
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function(s) {

  // This transport only deals with cross domain requests
  if ( s.crossDomain ) {

    var script,
      head = document.head || jQuery("head")[0] || document.documentElement;

    return {

      send: function( _, callback ) {

        script = document.createElement("script");

        script.async = true;

        if ( s.scriptCharset ) {
          script.charset = s.scriptCharset;
        }

        script.src = s.url;

        // Attach handlers for all browsers
        script.onload = script.onreadystatechange = function( _, isAbort ) {

          if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

            // Handle memory leak in IE
            script.onload = script.onreadystatechange = null;

            // Remove the script
            if ( script.parentNode ) {
              script.parentNode.removeChild( script );
            }

            // Dereference the script
            script = null;

            // Callback if not abort
            if ( !isAbort ) {
              callback( 200, "success" );
            }
          }
        };

        // Circumvent IE6 bugs with base elements (#2709 and #4378) by prepending
        // Use native DOM manipulation to avoid our domManip AJAX trickery
        head.insertBefore( script, head.firstChild );
      },

      abort: function() {
        if ( script ) {
          script.onload( undefined, true );
        }
      }
    };
  }
});
var oldCallbacks = [],
  rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup({
  jsonp: "callback",
  jsonpCallback: function() {
    var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( ajax_nonce++ ) );
    this[ callback ] = true;
    return callback;
  }
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

  var callbackName, overwritten, responseContainer,
    jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
      "url" :
      typeof s.data === "string" && !( s.contentType || "" ).indexOf("application/x-www-form-urlencoded") && rjsonp.test( s.data ) && "data"
    );

  // Handle iff the expected data type is "jsonp" or we have a parameter to set
  if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

    // Get callback name, remembering preexisting value associated with it
    callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
      s.jsonpCallback() :
      s.jsonpCallback;

    // Insert callback into url or form data
    if ( jsonProp ) {
      s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
    } else if ( s.jsonp !== false ) {
      s.url += ( ajax_rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
    }

    // Use data converter to retrieve json after script execution
    s.converters["script json"] = function() {
      if ( !responseContainer ) {
        jQuery.error( callbackName + " was not called" );
      }
      return responseContainer[ 0 ];
    };

    // force json dataType
    s.dataTypes[ 0 ] = "json";

    // Install callback
    overwritten = window[ callbackName ];
    window[ callbackName ] = function() {
      responseContainer = arguments;
    };

    // Clean-up function (fires after converters)
    jqXHR.always(function() {
      // Restore preexisting value
      window[ callbackName ] = overwritten;

      // Save back as free
      if ( s[ callbackName ] ) {
        // make sure that re-using the options doesn't screw things around
        s.jsonpCallback = originalSettings.jsonpCallback;

        // save the callback name for future use
        oldCallbacks.push( callbackName );
      }

      // Call if it was a function and we have a response
      if ( responseContainer && jQuery.isFunction( overwritten ) ) {
        overwritten( responseContainer[ 0 ] );
      }

      responseContainer = overwritten = undefined;
    });

    // Delegate to script
    return "script";
  }
});
var xhrCallbacks, xhrSupported,
  xhrId = 0,
  // #5280: Internet Explorer will keep connections alive if we don't abort on unload
  xhrOnUnloadAbort = window.ActiveXObject && function() {
    // Abort all pending requests
    var key;
    for ( key in xhrCallbacks ) {
      xhrCallbacks[ key ]( undefined, true );
    }
  };

// Functions to create xhrs
function createStandardXHR() {
  try {
    return new window.XMLHttpRequest();
  } catch( e ) {}
}

function createActiveXHR() {
  try {
    return new window.ActiveXObject("Microsoft.XMLHTTP");
  } catch( e ) {}
}

// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject ?
  /* Microsoft failed to properly
   * implement the XMLHttpRequest in IE7 (can't request local files),
   * so we use the ActiveXObject when it is available
   * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
   * we need a fallback.
   */
  function() {
    return !this.isLocal && createStandardXHR() || createActiveXHR();
  } :
  // For all other browsers, use the standard XMLHttpRequest object
  createStandardXHR;

// Determine support properties
xhrSupported = jQuery.ajaxSettings.xhr();
jQuery.support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
xhrSupported = jQuery.support.ajax = !!xhrSupported;

// Create transport if the browser can provide an xhr
if ( xhrSupported ) {

  jQuery.ajaxTransport(function( s ) {
    // Cross domain only allowed if supported through XMLHttpRequest
    if ( !s.crossDomain || jQuery.support.cors ) {

      var callback;

      return {
        send: function( headers, complete ) {

          // Get a new xhr
          var handle, i,
            xhr = s.xhr();

          // Open the socket
          // Passing null username, generates a login popup on Opera (#2865)
          if ( s.username ) {
            xhr.open( s.type, s.url, s.async, s.username, s.password );
          } else {
            xhr.open( s.type, s.url, s.async );
          }

          // Apply custom fields if provided
          if ( s.xhrFields ) {
            for ( i in s.xhrFields ) {
              xhr[ i ] = s.xhrFields[ i ];
            }
          }

          // Override mime type if needed
          if ( s.mimeType && xhr.overrideMimeType ) {
            xhr.overrideMimeType( s.mimeType );
          }

          // X-Requested-With header
          // For cross-domain requests, seeing as conditions for a preflight are
          // akin to a jigsaw puzzle, we simply never set it to be sure.
          // (it can always be set on a per-request basis or even using ajaxSetup)
          // For same-domain requests, won't change header if already provided.
          if ( !s.crossDomain && !headers["X-Requested-With"] ) {
            headers["X-Requested-With"] = "XMLHttpRequest";
          }

          // Need an extra try/catch for cross domain requests in Firefox 3
          try {
            for ( i in headers ) {
              xhr.setRequestHeader( i, headers[ i ] );
            }
          } catch( err ) {}

          // Do send the request
          // This may raise an exception which is actually
          // handled in jQuery.ajax (so no try/catch here)
          xhr.send( ( s.hasContent && s.data ) || null );

          // Listener
          callback = function( _, isAbort ) {
            var status, responseHeaders, statusText, responses;

            // Firefox throws exceptions when accessing properties
            // of an xhr when a network error occurred
            // http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
            try {

              // Was never called and is aborted or complete
              if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

                // Only called once
                callback = undefined;

                // Do not keep as active anymore
                if ( handle ) {
                  xhr.onreadystatechange = jQuery.noop;
                  if ( xhrOnUnloadAbort ) {
                    delete xhrCallbacks[ handle ];
                  }
                }

                // If it's an abort
                if ( isAbort ) {
                  // Abort it manually if needed
                  if ( xhr.readyState !== 4 ) {
                    xhr.abort();
                  }
                } else {
                  responses = {};
                  status = xhr.status;
                  responseHeaders = xhr.getAllResponseHeaders();

                  // When requesting binary data, IE6-9 will throw an exception
                  // on any attempt to access responseText (#11426)
                  if ( typeof xhr.responseText === "string" ) {
                    responses.text = xhr.responseText;
                  }

                  // Firefox throws an exception when accessing
                  // statusText for faulty cross-domain requests
                  try {
                    statusText = xhr.statusText;
                  } catch( e ) {
                    // We normalize with Webkit giving an empty statusText
                    statusText = "";
                  }

                  // Filter status for non standard behaviors

                  // If the request is local and we have data: assume a success
                  // (success with no data won't get notified, that's the best we
                  // can do given current implementations)
                  if ( !status && s.isLocal && !s.crossDomain ) {
                    status = responses.text ? 200 : 404;
                  // IE - #1450: sometimes returns 1223 when it should be 204
                  } else if ( status === 1223 ) {
                    status = 204;
                  }
                }
              }
            } catch( firefoxAccessException ) {
              if ( !isAbort ) {
                complete( -1, firefoxAccessException );
              }
            }

            // Call complete if needed
            if ( responses ) {
              complete( status, statusText, responses, responseHeaders );
            }
          };

          if ( !s.async ) {
            // if we're in sync mode we fire the callback
            callback();
          } else if ( xhr.readyState === 4 ) {
            // (IE6 & IE7) if it's in cache and has been
            // retrieved directly we need to fire the callback
            setTimeout( callback );
          } else {
            handle = ++xhrId;
            if ( xhrOnUnloadAbort ) {
              // Create the active xhrs callbacks list if needed
              // and attach the unload handler
              if ( !xhrCallbacks ) {
                xhrCallbacks = {};
                jQuery( window ).unload( xhrOnUnloadAbort );
              }
              // Add to list of active xhrs callbacks
              xhrCallbacks[ handle ] = callback;
            }
            xhr.onreadystatechange = callback;
          }
        },

        abort: function() {
          if ( callback ) {
            callback( undefined, true );
          }
        }
      };
    }
  });
}
var fxNow, timerId,
  rfxtypes = /^(?:toggle|show|hide)$/,
  rfxnum = new RegExp( "^(?:([+-])=|)(" + core_pnum + ")([a-z%]*)$", "i" ),
  rrun = /queueHooks$/,
  animationPrefilters = [ defaultPrefilter ],
  tweeners = {
    "*": [function( prop, value ) {
      var tween = this.createTween( prop, value ),
        target = tween.cur(),
        parts = rfxnum.exec( value ),
        unit = parts && parts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

        // Starting value computation is required for potential unit mismatches
        start = ( jQuery.cssNumber[ prop ] || unit !== "px" && +target ) &&
          rfxnum.exec( jQuery.css( tween.elem, prop ) ),
        scale = 1,
        maxIterations = 20;

      if ( start && start[ 3 ] !== unit ) {
        // Trust units reported by jQuery.css
        unit = unit || start[ 3 ];

        // Make sure we update the tween properties later on
        parts = parts || [];

        // Iteratively approximate from a nonzero starting point
        start = +target || 1;

        do {
          // If previous iteration zeroed out, double until we get *something*
          // Use a string for doubling factor so we don't accidentally see scale as unchanged below
          scale = scale || ".5";

          // Adjust and apply
          start = start / scale;
          jQuery.style( tween.elem, prop, start + unit );

        // Update scale, tolerating zero or NaN from tween.cur()
        // And breaking the loop if scale is unchanged or perfect, or if we've just had enough
        } while ( scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations );
      }

      // Update tween properties
      if ( parts ) {
        start = tween.start = +start || +target || 0;
        tween.unit = unit;
        // If a +=/-= token was provided, we're doing a relative animation
        tween.end = parts[ 1 ] ?
          start + ( parts[ 1 ] + 1 ) * parts[ 2 ] :
          +parts[ 2 ];
      }

      return tween;
    }]
  };

// Animations created synchronously will run synchronously
function createFxNow() {
  setTimeout(function() {
    fxNow = undefined;
  });
  return ( fxNow = jQuery.now() );
}

function createTween( value, prop, animation ) {
  var tween,
    collection = ( tweeners[ prop ] || [] ).concat( tweeners[ "*" ] ),
    index = 0,
    length = collection.length;
  for ( ; index < length; index++ ) {
    if ( (tween = collection[ index ].call( animation, prop, value )) ) {

      // we're done with this property
      return tween;
    }
  }
}

function Animation( elem, properties, options ) {
  var result,
    stopped,
    index = 0,
    length = animationPrefilters.length,
    deferred = jQuery.Deferred().always( function() {
      // don't match elem in the :animated selector
      delete tick.elem;
    }),
    tick = function() {
      if ( stopped ) {
        return false;
      }
      var currentTime = fxNow || createFxNow(),
        remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
        // archaic crash bug won't allow us to use 1 - ( 0.5 || 0 ) (#12497)
        temp = remaining / animation.duration || 0,
        percent = 1 - temp,
        index = 0,
        length = animation.tweens.length;

      for ( ; index < length ; index++ ) {
        animation.tweens[ index ].run( percent );
      }

      deferred.notifyWith( elem, [ animation, percent, remaining ]);

      if ( percent < 1 && length ) {
        return remaining;
      } else {
        deferred.resolveWith( elem, [ animation ] );
        return false;
      }
    },
    animation = deferred.promise({
      elem: elem,
      props: jQuery.extend( {}, properties ),
      opts: jQuery.extend( true, { specialEasing: {} }, options ),
      originalProperties: properties,
      originalOptions: options,
      startTime: fxNow || createFxNow(),
      duration: options.duration,
      tweens: [],
      createTween: function( prop, end ) {
        var tween = jQuery.Tween( elem, animation.opts, prop, end,
            animation.opts.specialEasing[ prop ] || animation.opts.easing );
        animation.tweens.push( tween );
        return tween;
      },
      stop: function( gotoEnd ) {
        var index = 0,
          // if we are going to the end, we want to run all the tweens
          // otherwise we skip this part
          length = gotoEnd ? animation.tweens.length : 0;
        if ( stopped ) {
          return this;
        }
        stopped = true;
        for ( ; index < length ; index++ ) {
          animation.tweens[ index ].run( 1 );
        }

        // resolve when we played the last frame
        // otherwise, reject
        if ( gotoEnd ) {
          deferred.resolveWith( elem, [ animation, gotoEnd ] );
        } else {
          deferred.rejectWith( elem, [ animation, gotoEnd ] );
        }
        return this;
      }
    }),
    props = animation.props;

  propFilter( props, animation.opts.specialEasing );

  for ( ; index < length ; index++ ) {
    result = animationPrefilters[ index ].call( animation, elem, props, animation.opts );
    if ( result ) {
      return result;
    }
  }

  jQuery.map( props, createTween, animation );

  if ( jQuery.isFunction( animation.opts.start ) ) {
    animation.opts.start.call( elem, animation );
  }

  jQuery.fx.timer(
    jQuery.extend( tick, {
      elem: elem,
      anim: animation,
      queue: animation.opts.queue
    })
  );

  // attach callbacks from options
  return animation.progress( animation.opts.progress )
    .done( animation.opts.done, animation.opts.complete )
    .fail( animation.opts.fail )
    .always( animation.opts.always );
}

function propFilter( props, specialEasing ) {
  var index, name, easing, value, hooks;

  // camelCase, specialEasing and expand cssHook pass
  for ( index in props ) {
    name = jQuery.camelCase( index );
    easing = specialEasing[ name ];
    value = props[ index ];
    if ( jQuery.isArray( value ) ) {
      easing = value[ 1 ];
      value = props[ index ] = value[ 0 ];
    }

    if ( index !== name ) {
      props[ name ] = value;
      delete props[ index ];
    }

    hooks = jQuery.cssHooks[ name ];
    if ( hooks && "expand" in hooks ) {
      value = hooks.expand( value );
      delete props[ name ];

      // not quite $.extend, this wont overwrite keys already present.
      // also - reusing 'index' from above because we have the correct "name"
      for ( index in value ) {
        if ( !( index in props ) ) {
          props[ index ] = value[ index ];
          specialEasing[ index ] = easing;
        }
      }
    } else {
      specialEasing[ name ] = easing;
    }
  }
}

jQuery.Animation = jQuery.extend( Animation, {

  tweener: function( props, callback ) {
    if ( jQuery.isFunction( props ) ) {
      callback = props;
      props = [ "*" ];
    } else {
      props = props.split(" ");
    }

    var prop,
      index = 0,
      length = props.length;

    for ( ; index < length ; index++ ) {
      prop = props[ index ];
      tweeners[ prop ] = tweeners[ prop ] || [];
      tweeners[ prop ].unshift( callback );
    }
  },

  prefilter: function( callback, prepend ) {
    if ( prepend ) {
      animationPrefilters.unshift( callback );
    } else {
      animationPrefilters.push( callback );
    }
  }
});

function defaultPrefilter( elem, props, opts ) {
  /* jshint validthis: true */
  var prop, value, toggle, tween, hooks, oldfire,
    anim = this,
    orig = {},
    style = elem.style,
    hidden = elem.nodeType && isHidden( elem ),
    dataShow = jQuery._data( elem, "fxshow" );

  // handle queue: false promises
  if ( !opts.queue ) {
    hooks = jQuery._queueHooks( elem, "fx" );
    if ( hooks.unqueued == null ) {
      hooks.unqueued = 0;
      oldfire = hooks.empty.fire;
      hooks.empty.fire = function() {
        if ( !hooks.unqueued ) {
          oldfire();
        }
      };
    }
    hooks.unqueued++;

    anim.always(function() {
      // doing this makes sure that the complete handler will be called
      // before this completes
      anim.always(function() {
        hooks.unqueued--;
        if ( !jQuery.queue( elem, "fx" ).length ) {
          hooks.empty.fire();
        }
      });
    });
  }

  // height/width overflow pass
  if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {
    // Make sure that nothing sneaks out
    // Record all 3 overflow attributes because IE does not
    // change the overflow attribute when overflowX and
    // overflowY are set to the same value
    opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

    // Set display property to inline-block for height/width
    // animations on inline elements that are having width/height animated
    if ( jQuery.css( elem, "display" ) === "inline" &&
        jQuery.css( elem, "float" ) === "none" ) {

      // inline-level elements accept inline-block;
      // block-level elements need to be inline with layout
      if ( !jQuery.support.inlineBlockNeedsLayout || css_defaultDisplay( elem.nodeName ) === "inline" ) {
        style.display = "inline-block";

      } else {
        style.zoom = 1;
      }
    }
  }

  if ( opts.overflow ) {
    style.overflow = "hidden";
    if ( !jQuery.support.shrinkWrapBlocks ) {
      anim.always(function() {
        style.overflow = opts.overflow[ 0 ];
        style.overflowX = opts.overflow[ 1 ];
        style.overflowY = opts.overflow[ 2 ];
      });
    }
  }


  // show/hide pass
  for ( prop in props ) {
    value = props[ prop ];
    if ( rfxtypes.exec( value ) ) {
      delete props[ prop ];
      toggle = toggle || value === "toggle";
      if ( value === ( hidden ? "hide" : "show" ) ) {
        continue;
      }
      orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );
    }
  }

  if ( !jQuery.isEmptyObject( orig ) ) {
    if ( dataShow ) {
      if ( "hidden" in dataShow ) {
        hidden = dataShow.hidden;
      }
    } else {
      dataShow = jQuery._data( elem, "fxshow", {} );
    }

    // store state if its toggle - enables .stop().toggle() to "reverse"
    if ( toggle ) {
      dataShow.hidden = !hidden;
    }
    if ( hidden ) {
      jQuery( elem ).show();
    } else {
      anim.done(function() {
        jQuery( elem ).hide();
      });
    }
    anim.done(function() {
      var prop;
      jQuery._removeData( elem, "fxshow" );
      for ( prop in orig ) {
        jQuery.style( elem, prop, orig[ prop ] );
      }
    });
    for ( prop in orig ) {
      tween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );

      if ( !( prop in dataShow ) ) {
        dataShow[ prop ] = tween.start;
        if ( hidden ) {
          tween.end = tween.start;
          tween.start = prop === "width" || prop === "height" ? 1 : 0;
        }
      }
    }
  }
}

function Tween( elem, options, prop, end, easing ) {
  return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
  constructor: Tween,
  init: function( elem, options, prop, end, easing, unit ) {
    this.elem = elem;
    this.prop = prop;
    this.easing = easing || "swing";
    this.options = options;
    this.start = this.now = this.cur();
    this.end = end;
    this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
  },
  cur: function() {
    var hooks = Tween.propHooks[ this.prop ];

    return hooks && hooks.get ?
      hooks.get( this ) :
      Tween.propHooks._default.get( this );
  },
  run: function( percent ) {
    var eased,
      hooks = Tween.propHooks[ this.prop ];

    if ( this.options.duration ) {
      this.pos = eased = jQuery.easing[ this.easing ](
        percent, this.options.duration * percent, 0, 1, this.options.duration
      );
    } else {
      this.pos = eased = percent;
    }
    this.now = ( this.end - this.start ) * eased + this.start;

    if ( this.options.step ) {
      this.options.step.call( this.elem, this.now, this );
    }

    if ( hooks && hooks.set ) {
      hooks.set( this );
    } else {
      Tween.propHooks._default.set( this );
    }
    return this;
  }
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
  _default: {
    get: function( tween ) {
      var result;

      if ( tween.elem[ tween.prop ] != null &&
        (!tween.elem.style || tween.elem.style[ tween.prop ] == null) ) {
        return tween.elem[ tween.prop ];
      }

      // passing an empty string as a 3rd parameter to .css will automatically
      // attempt a parseFloat and fallback to a string if the parse fails
      // so, simple values such as "10px" are parsed to Float.
      // complex values such as "rotate(1rad)" are returned as is.
      result = jQuery.css( tween.elem, tween.prop, "" );
      // Empty strings, null, undefined and "auto" are converted to 0.
      return !result || result === "auto" ? 0 : result;
    },
    set: function( tween ) {
      // use step hook for back compat - use cssHook if its there - use .style if its
      // available and use plain properties where available
      if ( jQuery.fx.step[ tween.prop ] ) {
        jQuery.fx.step[ tween.prop ]( tween );
      } else if ( tween.elem.style && ( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null || jQuery.cssHooks[ tween.prop ] ) ) {
        jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
      } else {
        tween.elem[ tween.prop ] = tween.now;
      }
    }
  }
};

// Support: IE <=9
// Panic based approach to setting things on disconnected nodes

Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
  set: function( tween ) {
    if ( tween.elem.nodeType && tween.elem.parentNode ) {
      tween.elem[ tween.prop ] = tween.now;
    }
  }
};

jQuery.each([ "toggle", "show", "hide" ], function( i, name ) {
  var cssFn = jQuery.fn[ name ];
  jQuery.fn[ name ] = function( speed, easing, callback ) {
    return speed == null || typeof speed === "boolean" ?
      cssFn.apply( this, arguments ) :
      this.animate( genFx( name, true ), speed, easing, callback );
  };
});

jQuery.fn.extend({
  fadeTo: function( speed, to, easing, callback ) {

    // show any hidden elements after setting opacity to 0
    return this.filter( isHidden ).css( "opacity", 0 ).show()

      // animate to the value specified
      .end().animate({ opacity: to }, speed, easing, callback );
  },
  animate: function( prop, speed, easing, callback ) {
    var empty = jQuery.isEmptyObject( prop ),
      optall = jQuery.speed( speed, easing, callback ),
      doAnimation = function() {
        // Operate on a copy of prop so per-property easing won't be lost
        var anim = Animation( this, jQuery.extend( {}, prop ), optall );

        // Empty animations, or finishing resolves immediately
        if ( empty || jQuery._data( this, "finish" ) ) {
          anim.stop( true );
        }
      };
      doAnimation.finish = doAnimation;

    return empty || optall.queue === false ?
      this.each( doAnimation ) :
      this.queue( optall.queue, doAnimation );
  },
  stop: function( type, clearQueue, gotoEnd ) {
    var stopQueue = function( hooks ) {
      var stop = hooks.stop;
      delete hooks.stop;
      stop( gotoEnd );
    };

    if ( typeof type !== "string" ) {
      gotoEnd = clearQueue;
      clearQueue = type;
      type = undefined;
    }
    if ( clearQueue && type !== false ) {
      this.queue( type || "fx", [] );
    }

    return this.each(function() {
      var dequeue = true,
        index = type != null && type + "queueHooks",
        timers = jQuery.timers,
        data = jQuery._data( this );

      if ( index ) {
        if ( data[ index ] && data[ index ].stop ) {
          stopQueue( data[ index ] );
        }
      } else {
        for ( index in data ) {
          if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
            stopQueue( data[ index ] );
          }
        }
      }

      for ( index = timers.length; index--; ) {
        if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
          timers[ index ].anim.stop( gotoEnd );
          dequeue = false;
          timers.splice( index, 1 );
        }
      }

      // start the next in the queue if the last step wasn't forced
      // timers currently will call their complete callbacks, which will dequeue
      // but only if they were gotoEnd
      if ( dequeue || !gotoEnd ) {
        jQuery.dequeue( this, type );
      }
    });
  },
  finish: function( type ) {
    if ( type !== false ) {
      type = type || "fx";
    }
    return this.each(function() {
      var index,
        data = jQuery._data( this ),
        queue = data[ type + "queue" ],
        hooks = data[ type + "queueHooks" ],
        timers = jQuery.timers,
        length = queue ? queue.length : 0;

      // enable finishing flag on private data
      data.finish = true;

      // empty the queue first
      jQuery.queue( this, type, [] );

      if ( hooks && hooks.stop ) {
        hooks.stop.call( this, true );
      }

      // look for any active animations, and finish them
      for ( index = timers.length; index--; ) {
        if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
          timers[ index ].anim.stop( true );
          timers.splice( index, 1 );
        }
      }

      // look for any animations in the old queue and finish them
      for ( index = 0; index < length; index++ ) {
        if ( queue[ index ] && queue[ index ].finish ) {
          queue[ index ].finish.call( this );
        }
      }

      // turn off finishing flag
      delete data.finish;
    });
  }
});

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
  var which,
    attrs = { height: type },
    i = 0;

  // if we include width, step value is 1 to do all cssExpand values,
  // if we don't include width, step value is 2 to skip over Left and Right
  includeWidth = includeWidth? 1 : 0;
  for( ; i < 4 ; i += 2 - includeWidth ) {
    which = cssExpand[ i ];
    attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
  }

  if ( includeWidth ) {
    attrs.opacity = attrs.width = type;
  }

  return attrs;
}

// Generate shortcuts for custom animations
jQuery.each({
  slideDown: genFx("show"),
  slideUp: genFx("hide"),
  slideToggle: genFx("toggle"),
  fadeIn: { opacity: "show" },
  fadeOut: { opacity: "hide" },
  fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
  jQuery.fn[ name ] = function( speed, easing, callback ) {
    return this.animate( props, speed, easing, callback );
  };
});

jQuery.speed = function( speed, easing, fn ) {
  var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
    complete: fn || !fn && easing ||
      jQuery.isFunction( speed ) && speed,
    duration: speed,
    easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
  };

  opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
    opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

  // normalize opt.queue - true/undefined/null -> "fx"
  if ( opt.queue == null || opt.queue === true ) {
    opt.queue = "fx";
  }

  // Queueing
  opt.old = opt.complete;

  opt.complete = function() {
    if ( jQuery.isFunction( opt.old ) ) {
      opt.old.call( this );
    }

    if ( opt.queue ) {
      jQuery.dequeue( this, opt.queue );
    }
  };

  return opt;
};

jQuery.easing = {
  linear: function( p ) {
    return p;
  },
  swing: function( p ) {
    return 0.5 - Math.cos( p*Math.PI ) / 2;
  }
};

jQuery.timers = [];
jQuery.fx = Tween.prototype.init;
jQuery.fx.tick = function() {
  var timer,
    timers = jQuery.timers,
    i = 0;

  fxNow = jQuery.now();

  for ( ; i < timers.length; i++ ) {
    timer = timers[ i ];
    // Checks the timer has not already been removed
    if ( !timer() && timers[ i ] === timer ) {
      timers.splice( i--, 1 );
    }
  }

  if ( !timers.length ) {
    jQuery.fx.stop();
  }
  fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
  if ( timer() && jQuery.timers.push( timer ) ) {
    jQuery.fx.start();
  }
};

jQuery.fx.interval = 13;

jQuery.fx.start = function() {
  if ( !timerId ) {
    timerId = setInterval( jQuery.fx.tick, jQuery.fx.interval );
  }
};

jQuery.fx.stop = function() {
  clearInterval( timerId );
  timerId = null;
};

jQuery.fx.speeds = {
  slow: 600,
  fast: 200,
  // Default speed
  _default: 400
};

// Back Compat <1.8 extension point
jQuery.fx.step = {};

if ( jQuery.expr && jQuery.expr.filters ) {
  jQuery.expr.filters.animated = function( elem ) {
    return jQuery.grep(jQuery.timers, function( fn ) {
      return elem === fn.elem;
    }).length;
  };
}
jQuery.fn.offset = function( options ) {
  if ( arguments.length ) {
    return options === undefined ?
      this :
      this.each(function( i ) {
        jQuery.offset.setOffset( this, options, i );
      });
  }

  var docElem, win,
    box = { top: 0, left: 0 },
    elem = this[ 0 ],
    doc = elem && elem.ownerDocument;

  if ( !doc ) {
    return;
  }

  docElem = doc.documentElement;

  // Make sure it's not a disconnected DOM node
  if ( !jQuery.contains( docElem, elem ) ) {
    return box;
  }

  // If we don't have gBCR, just use 0,0 rather than error
  // BlackBerry 5, iOS 3 (original iPhone)
  if ( typeof elem.getBoundingClientRect !== core_strundefined ) {
    box = elem.getBoundingClientRect();
  }
  win = getWindow( doc );
  return {
    top: box.top  + ( win.pageYOffset || docElem.scrollTop )  - ( docElem.clientTop  || 0 ),
    left: box.left + ( win.pageXOffset || docElem.scrollLeft ) - ( docElem.clientLeft || 0 )
  };
};

jQuery.offset = {

  setOffset: function( elem, options, i ) {
    var position = jQuery.css( elem, "position" );

    // set position first, in-case top/left are set even on static elem
    if ( position === "static" ) {
      elem.style.position = "relative";
    }

    var curElem = jQuery( elem ),
      curOffset = curElem.offset(),
      curCSSTop = jQuery.css( elem, "top" ),
      curCSSLeft = jQuery.css( elem, "left" ),
      calculatePosition = ( position === "absolute" || position === "fixed" ) && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1,
      props = {}, curPosition = {}, curTop, curLeft;

    // need to be able to calculate position if either top or left is auto and position is either absolute or fixed
    if ( calculatePosition ) {
      curPosition = curElem.position();
      curTop = curPosition.top;
      curLeft = curPosition.left;
    } else {
      curTop = parseFloat( curCSSTop ) || 0;
      curLeft = parseFloat( curCSSLeft ) || 0;
    }

    if ( jQuery.isFunction( options ) ) {
      options = options.call( elem, i, curOffset );
    }

    if ( options.top != null ) {
      props.top = ( options.top - curOffset.top ) + curTop;
    }
    if ( options.left != null ) {
      props.left = ( options.left - curOffset.left ) + curLeft;
    }

    if ( "using" in options ) {
      options.using.call( elem, props );
    } else {
      curElem.css( props );
    }
  }
};


jQuery.fn.extend({

  position: function() {
    if ( !this[ 0 ] ) {
      return;
    }

    var offsetParent, offset,
      parentOffset = { top: 0, left: 0 },
      elem = this[ 0 ];

    // fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is it's only offset parent
    if ( jQuery.css( elem, "position" ) === "fixed" ) {
      // we assume that getBoundingClientRect is available when computed position is fixed
      offset = elem.getBoundingClientRect();
    } else {
      // Get *real* offsetParent
      offsetParent = this.offsetParent();

      // Get correct offsets
      offset = this.offset();
      if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
        parentOffset = offsetParent.offset();
      }

      // Add offsetParent borders
      parentOffset.top  += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
      parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
    }

    // Subtract parent offsets and element margins
    // note: when an element has margin: auto the offsetLeft and marginLeft
    // are the same in Safari causing offset.left to incorrectly be 0
    return {
      top:  offset.top  - parentOffset.top - jQuery.css( elem, "marginTop", true ),
      left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true)
    };
  },

  offsetParent: function() {
    return this.map(function() {
      var offsetParent = this.offsetParent || docElem;
      while ( offsetParent && ( !jQuery.nodeName( offsetParent, "html" ) && jQuery.css( offsetParent, "position") === "static" ) ) {
        offsetParent = offsetParent.offsetParent;
      }
      return offsetParent || docElem;
    });
  }
});


// Create scrollLeft and scrollTop methods
jQuery.each( {scrollLeft: "pageXOffset", scrollTop: "pageYOffset"}, function( method, prop ) {
  var top = /Y/.test( prop );

  jQuery.fn[ method ] = function( val ) {
    return jQuery.access( this, function( elem, method, val ) {
      var win = getWindow( elem );

      if ( val === undefined ) {
        return win ? (prop in win) ? win[ prop ] :
          win.document.documentElement[ method ] :
          elem[ method ];
      }

      if ( win ) {
        win.scrollTo(
          !top ? val : jQuery( win ).scrollLeft(),
          top ? val : jQuery( win ).scrollTop()
        );

      } else {
        elem[ method ] = val;
      }
    }, method, val, arguments.length, null );
  };
});

function getWindow( elem ) {
  return jQuery.isWindow( elem ) ?
    elem :
    elem.nodeType === 9 ?
      elem.defaultView || elem.parentWindow :
      false;
}
// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
  jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name }, function( defaultExtra, funcName ) {
    // margin is only for outerHeight, outerWidth
    jQuery.fn[ funcName ] = function( margin, value ) {
      var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
        extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

      return jQuery.access( this, function( elem, type, value ) {
        var doc;

        if ( jQuery.isWindow( elem ) ) {
          // As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
          // isn't a whole lot we can do. See pull request at this URL for discussion:
          // https://github.com/jquery/jquery/pull/764
          return elem.document.documentElement[ "client" + name ];
        }

        // Get document width or height
        if ( elem.nodeType === 9 ) {
          doc = elem.documentElement;

          // Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height], whichever is greatest
          // unfortunately, this causes bug #3838 in IE6/8 only, but there is currently no good, small way to fix it.
          return Math.max(
            elem.body[ "scroll" + name ], doc[ "scroll" + name ],
            elem.body[ "offset" + name ], doc[ "offset" + name ],
            doc[ "client" + name ]
          );
        }

        return value === undefined ?
          // Get width or height on the element, requesting but not forcing parseFloat
          jQuery.css( elem, type, extra ) :

          // Set width or height on the element
          jQuery.style( elem, type, value, extra );
      }, type, chainable ? margin : undefined, chainable, null );
    };
  });
});
// Limit scope pollution from any deprecated API
// (function() {

// The number of elements contained in the matched element set
jQuery.fn.size = function() {
  return this.length;
};

jQuery.fn.andSelf = jQuery.fn.addBack;

// })();
if ( typeof module === "object" && module && typeof module.exports === "object" ) {
  // Expose jQuery as module.exports in loaders that implement the Node
  // module pattern (including browserify). Do not create the global, since
  // the user will be storing it themselves locally, and globals are frowned
  // upon in the Node module world.
  module.exports = jQuery;
} else {
  // Otherwise expose jQuery to the global object as usual
  window.jQuery = window.$ = jQuery;

  // Register as a named AMD module, since jQuery can be concatenated with other
  // files that may use define, but not via a proper concatenation script that
  // understands anonymous AMD modules. A named AMD is safest and most robust
  // way to register. Lowercase jquery is used because AMD module names are
  // derived from file names, and jQuery is normally delivered in a lowercase
  // file name. Do this after creating the global so that if an AMD module wants
  // to call noConflict to hide this version of jQuery, it will work.
  if ( typeof define === "function" && define.amd ) {
    define( "jquery", [], function () { return jQuery; } );
  }
}

})( window );

(function() {
  var Perf;

  Perf = (function() {
    function Perf(name, options) {
      var _base, _base1;
      this.name = name;
      this.options = options != null ? options : {};
      if ((_base = this.options).good == null) {
        _base.good = 100;
      }
      if ((_base1 = this.options).bad == null) {
        _base1.bad = 500;
      }
      this.started = false;
    }

    Perf.prototype.start = function() {
      if (this.started) {
        return;
      }
      this.start = +new Date();
      return this.started = true;
    };

    Perf.prototype.stop = function(printLine) {
      var background, color, duration, end, message;
      if (!this.started) {
        return;
      }
      end = +new Date();
      duration = end - this.start;
      if (this.name != null) {
        message = this.name + ' took';
      } else {
        message = 'Code execution time:';
      }
      if (typeof window !== "undefined" && window !== null) {
        if (duration < this.options.good) {
          background = 'darkgreen';
          color = 'white';
        } else if (duration > this.options.good && duration < this.options.bad) {
          background = 'orange';
          color = 'black';
        } else {
          background = 'darkred';
          color = 'white';
        }
        console.log('%c perf %c ' + message + ' %c ' + duration.toFixed(2) + 'ms ', 'background: #222; color: #bada55', '', 'background: ' + background + '; color: ' + color);
      } else {
        console.log('[perf] ' + message + ' ' + duration.toFixed(2) + 'ms');
      }
      this.started = false;
      if (printLine && (typeof window !== "undefined" && window !== null)) {
        return console.log('%c perf %c -- END --                                                                          ', 'background: #222; color: #bada55', 'background: #222; color: #ffffff');
      }
    };

    return Perf;

  })();

  if (typeof window !== "undefined" && window !== null) {
    window.Perf = Perf;
  } else if ((typeof module !== "undefined" && module !== null ? module.exports : void 0) != null) {
    module.exports = Perf;
  }

}).call(this);

(function () {
  //JavaScript Image Resizer (c) 2012 - Grant Galitz
  var scripts = document.getElementsByTagName("script");
  var sourceOfWorker = scripts[scripts.length-1].src;
  function Resize(widthOriginal, heightOriginal, targetWidth, targetHeight, blendAlpha, interpolationPass, useWebWorker, resizeCallback) {
    this.widthOriginal = Math.abs(parseInt(widthOriginal) || 0);
    this.heightOriginal = Math.abs(parseInt(heightOriginal) || 0);
    this.targetWidth = Math.abs(parseInt(targetWidth) || 0);
    this.targetHeight = Math.abs(parseInt(targetHeight) || 0);
    this.colorChannels = (!!blendAlpha) ? 4 : 3;
    this.interpolationPass = !!interpolationPass;
    this.useWebWorker = !!useWebWorker;
    this.resizeCallback = (typeof resizeCallback == "function") ? resizeCallback : function (returnedArray) {};
    this.targetWidthMultipliedByChannels = this.targetWidth * this.colorChannels;
    this.originalWidthMultipliedByChannels = this.widthOriginal * this.colorChannels;
    this.originalHeightMultipliedByChannels = this.heightOriginal * this.colorChannels;
    this.widthPassResultSize = this.targetWidthMultipliedByChannels * this.heightOriginal;
    this.finalResultSize = this.targetWidthMultipliedByChannels * this.targetHeight;
    this.initialize();
  }
  Resize.prototype.initialize = function () {
    //Perform some checks:
    if (this.widthOriginal > 0 && this.heightOriginal > 0 && this.targetWidth > 0 && this.targetHeight > 0) {
      if (this.useWebWorker) {
        this.useWebWorker = (this.widthOriginal != this.targetWidth || this.heightOriginal != this.targetHeight);
        if (this.useWebWorker) {
          this.configureWorker();
        }
      }
      if (!this.useWebWorker) {
        this.configurePasses();
      }
    }
    else {
      throw(new Error("Invalid settings specified for the resizer."));
    }
  }
  Resize.prototype.configureWorker = function () {
    try {
      var parentObj = this;
      this.worker = new Worker(sourceOfWorker.substring(0, sourceOfWorker.length - 3) + "Worker.js");
      this.worker.onmessage = function (event) {
        parentObj.heightBuffer = event.data;
        parentObj.resizeCallback(parentObj.heightBuffer);
      }
      this.worker.postMessage(["setup", this.widthOriginal, this.heightOriginal, this.targetWidth, this.targetHeight, this.colorChannels, this.interpolationPass]);
    }
    catch (error) {
      this.useWebWorker = false;
    }
  }
  Resize.prototype.configurePasses = function () {
    if (this.widthOriginal == this.targetWidth) {
      //Bypass the width resizer pass:
      this.resizeWidth = this.bypassResizer;
    }
    else {
      //Setup the width resizer pass:
      this.ratioWeightWidthPass = this.widthOriginal / this.targetWidth;
      if (this.ratioWeightWidthPass < 1 && this.interpolationPass) {
        this.initializeFirstPassBuffers(true);
        this.resizeWidth = (this.colorChannels == 4) ? this.resizeWidthInterpolatedRGBA : this.resizeWidthInterpolatedRGB;
      }
      else {
        this.initializeFirstPassBuffers(false);
        this.resizeWidth = (this.colorChannels == 4) ? this.resizeWidthRGBA : this.resizeWidthRGB;
      }
    }
    if (this.heightOriginal == this.targetHeight) {
      //Bypass the height resizer pass:
      this.resizeHeight = this.bypassResizer;
    }
    else {
      //Setup the height resizer pass:
      this.ratioWeightHeightPass = this.heightOriginal / this.targetHeight;
      if (this.ratioWeightHeightPass < 1 && this.interpolationPass) {
        this.initializeSecondPassBuffers(true);
        this.resizeHeight = this.resizeHeightInterpolated;
      }
      else {
        this.initializeSecondPassBuffers(false);
        this.resizeHeight = (this.colorChannels == 4) ? this.resizeHeightRGBA : this.resizeHeightRGB;
      }
    }
  }
  Resize.prototype.resizeWidthRGB = function (buffer) {
    var ratioWeight = this.ratioWeightWidthPass;
    var ratioWeightDivisor = 1 / ratioWeight;
    var weight = 0;
    var amountToNext = 0;
    var actualPosition = 0;
    var currentPosition = 0;
    var line = 0;
    var pixelOffset = 0;
    var outputOffset = 0;
    var nextLineOffsetOriginalWidth = this.originalWidthMultipliedByChannels - 2;
    var nextLineOffsetTargetWidth = this.targetWidthMultipliedByChannels - 2;
    var output = this.outputWidthWorkBench;
    var outputBuffer = this.widthBuffer;
    do {
      for (line = 0; line < this.originalHeightMultipliedByChannels;) {
        output[line++] = 0;
        output[line++] = 0;
        output[line++] = 0;
      }
      weight = ratioWeight;
      do {
        amountToNext = 1 + actualPosition - currentPosition;
        if (weight >= amountToNext) {
          for (line = 0, pixelOffset = actualPosition; line < this.originalHeightMultipliedByChannels; pixelOffset += nextLineOffsetOriginalWidth) {
            output[line++] += buffer[pixelOffset++] * amountToNext;
            output[line++] += buffer[pixelOffset++] * amountToNext;
            output[line++] += buffer[pixelOffset] * amountToNext;
          }
          currentPosition = actualPosition = actualPosition + 3;
          weight -= amountToNext;
        }
        else {
          for (line = 0, pixelOffset = actualPosition; line < this.originalHeightMultipliedByChannels; pixelOffset += nextLineOffsetOriginalWidth) {
            output[line++] += buffer[pixelOffset++] * weight;
            output[line++] += buffer[pixelOffset++] * weight;
            output[line++] += buffer[pixelOffset] * weight;
          }
          currentPosition += weight;
          break;
        }
      } while (weight > 0 && actualPosition < this.originalWidthMultipliedByChannels);
      for (line = 0, pixelOffset = outputOffset; line < this.originalHeightMultipliedByChannels; pixelOffset += nextLineOffsetTargetWidth) {
        outputBuffer[pixelOffset++] = output[line++] * ratioWeightDivisor;
        outputBuffer[pixelOffset++] = output[line++] * ratioWeightDivisor;
        outputBuffer[pixelOffset] = output[line++] * ratioWeightDivisor;
      }
      outputOffset += 3;
    } while (outputOffset < this.targetWidthMultipliedByChannels);
    return outputBuffer;
  }
  Resize.prototype.resizeWidthInterpolatedRGB = function (buffer) {
    var ratioWeight = this.ratioWeightWidthPass;
    var weight = 0;
    var finalOffset = 0;
    var pixelOffset = 0;
    var firstWeight = 0;
    var secondWeight = 0;
    var outputBuffer = this.widthBuffer;
    //Handle for only one interpolation input being valid for start calculation:
    for (var targetPosition = 0; weight < 1/3; targetPosition += 3, weight += ratioWeight) {
      for (finalOffset = targetPosition, pixelOffset = 0; finalOffset < this.widthPassResultSize; pixelOffset += this.originalWidthMultipliedByChannels, finalOffset += this.targetWidthMultipliedByChannels) {
        outputBuffer[finalOffset] = buffer[pixelOffset];
        outputBuffer[finalOffset + 1] = buffer[pixelOffset + 1];
        outputBuffer[finalOffset + 2] = buffer[pixelOffset + 2];
      }
    }
    //Adjust for overshoot of the last pass's counter:
    weight -= 1/3;
    for (var interpolationWidthSourceReadStop = this.widthOriginal - 1; weight < interpolationWidthSourceReadStop; targetPosition += 3, weight += ratioWeight) {
      //Calculate weightings:
      secondWeight = weight % 1;
      firstWeight = 1 - secondWeight;
      //Interpolate:
      for (finalOffset = targetPosition, pixelOffset = Math.floor(weight) * 3; finalOffset < this.widthPassResultSize; pixelOffset += this.originalWidthMultipliedByChannels, finalOffset += this.targetWidthMultipliedByChannels) {
        outputBuffer[finalOffset] = (buffer[pixelOffset] * firstWeight) + (buffer[pixelOffset + 3] * secondWeight);
        outputBuffer[finalOffset + 1] = (buffer[pixelOffset + 1] * firstWeight) + (buffer[pixelOffset + 4] * secondWeight);
        outputBuffer[finalOffset + 2] = (buffer[pixelOffset + 2] * firstWeight) + (buffer[pixelOffset + 5] * secondWeight);
      }
    }
    //Handle for only one interpolation input being valid for end calculation:
    for (interpolationWidthSourceReadStop = this.originalWidthMultipliedByChannels - 3; targetPosition < this.targetWidthMultipliedByChannels; targetPosition += 3) {
      for (finalOffset = targetPosition, pixelOffset = interpolationWidthSourceReadStop; finalOffset < this.widthPassResultSize; pixelOffset += this.originalWidthMultipliedByChannels, finalOffset += this.targetWidthMultipliedByChannels) {
        outputBuffer[finalOffset] = buffer[pixelOffset];
        outputBuffer[finalOffset + 1] = buffer[pixelOffset + 1];
        outputBuffer[finalOffset + 2] = buffer[pixelOffset + 2];
      }
    }
    return outputBuffer;
  }
  Resize.prototype.resizeWidthRGBA = function (buffer) {
    var ratioWeight = this.ratioWeightWidthPass;
    var ratioWeightDivisor = 1 / ratioWeight;
    var weight = 0;
    var amountToNext = 0;
    var actualPosition = 0;
    var currentPosition = 0;
    var line = 0;
    var pixelOffset = 0;
    var outputOffset = 0;
    var nextLineOffsetOriginalWidth = this.originalWidthMultipliedByChannels - 3;
    var nextLineOffsetTargetWidth = this.targetWidthMultipliedByChannels - 3;
    var output = this.outputWidthWorkBench;
    var outputBuffer = this.widthBuffer;
    do {
      for (line = 0; line < this.originalHeightMultipliedByChannels;) {
        output[line++] = 0;
        output[line++] = 0;
        output[line++] = 0;
        output[line++] = 0;
      }
      weight = ratioWeight;
      do {
        amountToNext = 1 + actualPosition - currentPosition;
        if (weight >= amountToNext) {
          for (line = 0, pixelOffset = actualPosition; line < this.originalHeightMultipliedByChannels; pixelOffset += nextLineOffsetOriginalWidth) {
            output[line++] += buffer[pixelOffset++] * amountToNext;
            output[line++] += buffer[pixelOffset++] * amountToNext;
            output[line++] += buffer[pixelOffset++] * amountToNext;
            output[line++] += buffer[pixelOffset] * amountToNext;
          }
          currentPosition = actualPosition = actualPosition + 4;
          weight -= amountToNext;
        }
        else {
          for (line = 0, pixelOffset = actualPosition; line < this.originalHeightMultipliedByChannels; pixelOffset += nextLineOffsetOriginalWidth) {
            output[line++] += buffer[pixelOffset++] * weight;
            output[line++] += buffer[pixelOffset++] * weight;
            output[line++] += buffer[pixelOffset++] * weight;
            output[line++] += buffer[pixelOffset] * weight;
          }
          currentPosition += weight;
          break;
        }
      } while (weight > 0 && actualPosition < this.originalWidthMultipliedByChannels);
      for (line = 0, pixelOffset = outputOffset; line < this.originalHeightMultipliedByChannels; pixelOffset += nextLineOffsetTargetWidth) {
        outputBuffer[pixelOffset++] = output[line++] * ratioWeightDivisor;
        outputBuffer[pixelOffset++] = output[line++] * ratioWeightDivisor;
        outputBuffer[pixelOffset++] = output[line++] * ratioWeightDivisor;
        outputBuffer[pixelOffset] = output[line++] * ratioWeightDivisor;
      }
      outputOffset += 4;
    } while (outputOffset < this.targetWidthMultipliedByChannels);
    return outputBuffer;
  }
  Resize.prototype.resizeWidthInterpolatedRGBA = function (buffer) {
    var ratioWeight = this.ratioWeightWidthPass;
    var weight = 0;
    var finalOffset = 0;
    var pixelOffset = 0;
    var firstWeight = 0;
    var secondWeight = 0;
    var outputBuffer = this.widthBuffer;
    //Handle for only one interpolation input being valid for start calculation:
    for (var targetPosition = 0; weight < 1/3; targetPosition += 4, weight += ratioWeight) {
      for (finalOffset = targetPosition, pixelOffset = 0; finalOffset < this.widthPassResultSize; pixelOffset += this.originalWidthMultipliedByChannels, finalOffset += this.targetWidthMultipliedByChannels) {
        outputBuffer[finalOffset] = buffer[pixelOffset];
        outputBuffer[finalOffset + 1] = buffer[pixelOffset + 1];
        outputBuffer[finalOffset + 2] = buffer[pixelOffset + 2];
        outputBuffer[finalOffset + 3] = buffer[pixelOffset + 3];
      }
    }
    //Adjust for overshoot of the last pass's counter:
    weight -= 1/3;
    for (var interpolationWidthSourceReadStop = this.widthOriginal - 1; weight < interpolationWidthSourceReadStop; targetPosition += 4, weight += ratioWeight) {
      //Calculate weightings:
      secondWeight = weight % 1;
      firstWeight = 1 - secondWeight;
      //Interpolate:
      for (finalOffset = targetPosition, pixelOffset = Math.floor(weight) * 4; finalOffset < this.widthPassResultSize; pixelOffset += this.originalWidthMultipliedByChannels, finalOffset += this.targetWidthMultipliedByChannels) {
        outputBuffer[finalOffset] = (buffer[pixelOffset] * firstWeight) + (buffer[pixelOffset + 4] * secondWeight);
        outputBuffer[finalOffset + 1] = (buffer[pixelOffset + 1] * firstWeight) + (buffer[pixelOffset + 5] * secondWeight);
        outputBuffer[finalOffset + 2] = (buffer[pixelOffset + 2] * firstWeight) + (buffer[pixelOffset + 6] * secondWeight);
        outputBuffer[finalOffset + 3] = (buffer[pixelOffset + 3] * firstWeight) + (buffer[pixelOffset + 7] * secondWeight);
      }
    }
    //Handle for only one interpolation input being valid for end calculation:
    for (interpolationWidthSourceReadStop = this.originalWidthMultipliedByChannels - 4; targetPosition < this.targetWidthMultipliedByChannels; targetPosition += 4) {
      for (finalOffset = targetPosition, pixelOffset = interpolationWidthSourceReadStop; finalOffset < this.widthPassResultSize; pixelOffset += this.originalWidthMultipliedByChannels, finalOffset += this.targetWidthMultipliedByChannels) {
        outputBuffer[finalOffset] = buffer[pixelOffset];
        outputBuffer[finalOffset + 1] = buffer[pixelOffset + 1];
        outputBuffer[finalOffset + 2] = buffer[pixelOffset + 2];
        outputBuffer[finalOffset + 3] = buffer[pixelOffset + 3];
      }
    }
    return outputBuffer;
  }
  Resize.prototype.resizeHeightRGB = function (buffer) {
    var ratioWeight = this.ratioWeightHeightPass;
    var ratioWeightDivisor = 1 / ratioWeight;
    var weight = 0;
    var amountToNext = 0;
    var actualPosition = 0;
    var currentPosition = 0;
    var pixelOffset = 0;
    var outputOffset = 0;
    var output = this.outputHeightWorkBench;
    var outputBuffer = this.heightBuffer;
    do {
      for (pixelOffset = 0; pixelOffset < this.targetWidthMultipliedByChannels;) {
        output[pixelOffset++] = 0;
        output[pixelOffset++] = 0;
        output[pixelOffset++] = 0;
      }
      weight = ratioWeight;
      do {
        amountToNext = 1 + actualPosition - currentPosition;
        if (weight >= amountToNext) {
          for (pixelOffset = 0; pixelOffset < this.targetWidthMultipliedByChannels;) {
            output[pixelOffset++] += buffer[actualPosition++] * amountToNext;
            output[pixelOffset++] += buffer[actualPosition++] * amountToNext;
            output[pixelOffset++] += buffer[actualPosition++] * amountToNext;
          }
          currentPosition = actualPosition;
          weight -= amountToNext;
        }
        else {
          for (pixelOffset = 0, amountToNext = actualPosition; pixelOffset < this.targetWidthMultipliedByChannels;) {
            output[pixelOffset++] += buffer[amountToNext++] * weight;
            output[pixelOffset++] += buffer[amountToNext++] * weight;
            output[pixelOffset++] += buffer[amountToNext++] * weight;
          }
          currentPosition += weight;
          break;
        }
      } while (weight > 0 && actualPosition < this.widthPassResultSize);
      for (pixelOffset = 0; pixelOffset < this.targetWidthMultipliedByChannels;) {
        outputBuffer[outputOffset++] = Math.round(output[pixelOffset++] * ratioWeightDivisor);
        outputBuffer[outputOffset++] = Math.round(output[pixelOffset++] * ratioWeightDivisor);
        outputBuffer[outputOffset++] = Math.round(output[pixelOffset++] * ratioWeightDivisor);
      }
    } while (outputOffset < this.finalResultSize);
    return outputBuffer;
  }
  Resize.prototype.resizeHeightInterpolated = function (buffer) {
    var ratioWeight = this.ratioWeightHeightPass;
    var weight = 0;
    var finalOffset = 0;
    var pixelOffset = 0;
    var pixelOffsetAccumulated = 0;
    var pixelOffsetAccumulated2 = 0;
    var firstWeight = 0;
    var secondWeight = 0;
    var outputBuffer = this.heightBuffer;
    //Handle for only one interpolation input being valid for start calculation:
    for (; weight < 1/3; weight += ratioWeight) {
      for (pixelOffset = 0; pixelOffset < this.targetWidthMultipliedByChannels;) {
        outputBuffer[finalOffset++] = Math.round(buffer[pixelOffset++]);
      }
    }
    //Adjust for overshoot of the last pass's counter:
    weight -= 1/3;
    for (var interpolationHeightSourceReadStop = this.heightOriginal - 1; weight < interpolationHeightSourceReadStop; weight += ratioWeight) {
      //Calculate weightings:
      secondWeight = weight % 1;
      firstWeight = 1 - secondWeight;
      //Interpolate:
      pixelOffsetAccumulated = Math.floor(weight) * this.targetWidthMultipliedByChannels;
      pixelOffsetAccumulated2 = pixelOffsetAccumulated + this.targetWidthMultipliedByChannels;
      for (pixelOffset = 0; pixelOffset < this.targetWidthMultipliedByChannels; ++pixelOffset) {
        outputBuffer[finalOffset++] = Math.round((buffer[pixelOffsetAccumulated++] * firstWeight) + (buffer[pixelOffsetAccumulated2++] * secondWeight));
      }
    }
    //Handle for only one interpolation input being valid for end calculation:
    while (finalOffset < this.finalResultSize) {
      for (pixelOffset = 0, pixelOffsetAccumulated = interpolationHeightSourceReadStop * this.targetWidthMultipliedByChannels; pixelOffset < this.targetWidthMultipliedByChannels; ++pixelOffset) {
        outputBuffer[finalOffset++] = Math.round(buffer[pixelOffsetAccumulated++]);
      }
    }
    return outputBuffer;
  }
  Resize.prototype.resizeHeightRGBA = function (buffer) {
    var ratioWeight = this.ratioWeightHeightPass;
    var ratioWeightDivisor = 1 / ratioWeight;
    var weight = 0;
    var amountToNext = 0;
    var actualPosition = 0;
    var currentPosition = 0;
    var pixelOffset = 0;
    var outputOffset = 0;
    var output = this.outputHeightWorkBench;
    var outputBuffer = this.heightBuffer;
    do {
      for (pixelOffset = 0; pixelOffset < this.targetWidthMultipliedByChannels;) {
        output[pixelOffset++] = 0;
        output[pixelOffset++] = 0;
        output[pixelOffset++] = 0;
        output[pixelOffset++] = 0;
      }
      weight = ratioWeight;
      do {
        amountToNext = 1 + actualPosition - currentPosition;
        if (weight >= amountToNext) {
          for (pixelOffset = 0; pixelOffset < this.targetWidthMultipliedByChannels;) {
            output[pixelOffset++] += buffer[actualPosition++] * amountToNext;
            output[pixelOffset++] += buffer[actualPosition++] * amountToNext;
            output[pixelOffset++] += buffer[actualPosition++] * amountToNext;
            output[pixelOffset++] += buffer[actualPosition++] * amountToNext;
          }
          currentPosition = actualPosition;
          weight -= amountToNext;
        }
        else {
          for (pixelOffset = 0, amountToNext = actualPosition; pixelOffset < this.targetWidthMultipliedByChannels;) {
            output[pixelOffset++] += buffer[amountToNext++] * weight;
            output[pixelOffset++] += buffer[amountToNext++] * weight;
            output[pixelOffset++] += buffer[amountToNext++] * weight;
            output[pixelOffset++] += buffer[amountToNext++] * weight;
          }
          currentPosition += weight;
          break;
        }
      } while (weight > 0 && actualPosition < this.widthPassResultSize);
      for (pixelOffset = 0; pixelOffset < this.targetWidthMultipliedByChannels;) {
        outputBuffer[outputOffset++] = Math.round(output[pixelOffset++] * ratioWeightDivisor);
        outputBuffer[outputOffset++] = Math.round(output[pixelOffset++] * ratioWeightDivisor);
        outputBuffer[outputOffset++] = Math.round(output[pixelOffset++] * ratioWeightDivisor);
        outputBuffer[outputOffset++] = Math.round(output[pixelOffset++] * ratioWeightDivisor);
      }
    } while (outputOffset < this.finalResultSize);
    return outputBuffer;
  }
  Resize.prototype.resize = function (buffer) {
    if (this.useWebWorker) {
      this.worker.postMessage(["resize", buffer]);
    }
    else {
      return this.resizeHeight(this.resizeWidth(buffer));
    }
  }
  Resize.prototype.bypassResizer = function (buffer) {
    //Just return the buffer passsed:
    return buffer;
  }
  Resize.prototype.initializeFirstPassBuffers = function (BILINEARAlgo) {
    //Initialize the internal width pass buffers:
    this.widthBuffer = this.generateFloatBuffer(this.widthPassResultSize);
    if (!BILINEARAlgo) {
      this.outputWidthWorkBench = this.generateFloatBuffer(this.originalHeightMultipliedByChannels);
    }
  }
  Resize.prototype.initializeSecondPassBuffers = function (BILINEARAlgo) {
    //Initialize the internal height pass buffers:
    this.heightBuffer = this.generateUint8Buffer(this.finalResultSize);
    if (!BILINEARAlgo) {
      this.outputHeightWorkBench = this.generateFloatBuffer(this.targetWidthMultipliedByChannels);
    }
  }
  Resize.prototype.generateFloatBuffer = function (bufferLength) {
    //Generate a float32 typed array buffer:
    try {
      return new Float32Array(bufferLength);
    }
    catch (error) {
      return [];
    }
  }
  Resize.prototype.generateUint8Buffer = function (bufferLength) {
    //Generate a uint8 typed array buffer:
    try {
      return new Uint8Array(bufferLength);
    }
    catch (error) {
      return [];
    }
  }
  window.Resize = Resize;
}).call(this);

/* Modernizr 2.6.2 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-canvas-canvastext
 */
;



window.Modernizr = (function( window, document, undefined ) {

    var version = '2.6.2',

    Modernizr = {},


    docElement = document.documentElement,

    mod = 'modernizr',
    modElem = document.createElement(mod),
    mStyle = modElem.style,

    inputElem  ,


    toString = {}.toString,    tests = {},
    inputs = {},
    attrs = {},

    classes = [],

    slice = classes.slice,

    featureName,



    _hasOwnProperty = ({}).hasOwnProperty, hasOwnProp;

    if ( !is(_hasOwnProperty, 'undefined') && !is(_hasOwnProperty.call, 'undefined') ) {
      hasOwnProp = function (object, property) {
        return _hasOwnProperty.call(object, property);
      };
    }
    else {
      hasOwnProp = function (object, property) {
        return ((property in object) && is(object.constructor.prototype[property], 'undefined'));
      };
    }


    if (!Function.prototype.bind) {
      Function.prototype.bind = function bind(that) {

        var target = this;

        if (typeof target != "function") {
            throw new TypeError();
        }

        var args = slice.call(arguments, 1),
            bound = function () {

            if (this instanceof bound) {

              var F = function(){};
              F.prototype = target.prototype;
              var self = new F();

              var result = target.apply(
                  self,
                  args.concat(slice.call(arguments))
              );
              if (Object(result) === result) {
                  return result;
              }
              return self;

            } else {

              return target.apply(
                  that,
                  args.concat(slice.call(arguments))
              );

            }

        };

        return bound;
      };
    }

    function setCss( str ) {
        mStyle.cssText = str;
    }

    function setCssAll( str1, str2 ) {
        return setCss(prefixes.join(str1 + ';') + ( str2 || '' ));
    }

    function is( obj, type ) {
        return typeof obj === type;
    }

    function contains( str, substr ) {
        return !!~('' + str).indexOf(substr);
    }


    function testDOMProps( props, obj, elem ) {
        for ( var i in props ) {
            var item = obj[props[i]];
            if ( item !== undefined) {

                            if (elem === false) return props[i];

                            if (is(item, 'function')){
                                return item.bind(elem || obj);
                }

                            return item;
            }
        }
        return false;
    }    tests['canvas'] = function() {
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    };

    tests['canvastext'] = function() {
        return !!(Modernizr['canvas'] && is(document.createElement('canvas').getContext('2d').fillText, 'function'));
    };
    for ( var feature in tests ) {
        if ( hasOwnProp(tests, feature) ) {
                                    featureName  = feature.toLowerCase();
            Modernizr[featureName] = tests[feature]();

            classes.push((Modernizr[featureName] ? '' : 'no-') + featureName);
        }
    }



     Modernizr.addTest = function ( feature, test ) {
       if ( typeof feature == 'object' ) {
         for ( var key in feature ) {
           if ( hasOwnProp( feature, key ) ) {
             Modernizr.addTest( key, feature[ key ] );
           }
         }
       } else {

         feature = feature.toLowerCase();

         if ( Modernizr[feature] !== undefined ) {
                                              return Modernizr;
         }

         test = typeof test == 'function' ? test() : test;

         if (typeof enableClasses !== "undefined" && enableClasses) {
           docElement.className += ' ' + (test ? '' : 'no-') + feature;
         }
         Modernizr[feature] = test;

       }

       return Modernizr;
     };


    setCss('');
    modElem = inputElem = null;


    Modernizr._version      = version;


    return Modernizr;

})(this, this.document);
;

;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
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

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],2:[function(require,module,exports){
require=(function(e,t,n,r){function i(r){if(!n[r]){if(!t[r]){if(e)return e(r);throw new Error("Cannot find module '"+r+"'")}var s=n[r]={exports:{}};t[r][0](function(e){var n=t[r][1][e];return i(n?n:e)},s,s.exports)}return n[r].exports}for(var s=0;s<r.length;s++)i(r[s]);return i})(typeof require!=="undefined"&&require,{1:[function(require,module,exports){
// UTILITY
var util = require('util');
var Buffer = require("buffer").Buffer;
var pSlice = Array.prototype.slice;

function objectKeys(object) {
  if (Object.keys) return Object.keys(object);
  var result = [];
  for (var name in object) {
    if (Object.prototype.hasOwnProperty.call(object, name)) {
      result.push(name);
    }
  }
  return result;
}

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.message = options.message;
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
};
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (value === undefined) {
    return '' + value;
  }
  if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (typeof value === 'function' || value instanceof RegExp) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (typeof s == 'string') {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

assert.AssertionError.prototype.toString = function() {
  if (this.message) {
    return [this.name + ':', this.message].join(' ');
  } else {
    return [
      this.name + ':',
      truncate(JSON.stringify(this.actual, replacer), 128),
      this.operator,
      truncate(JSON.stringify(this.expected, replacer), 128)
    ].join(' ');
  }
};

// assert.AssertionError instanceof Error

assert.AssertionError.__proto__ = Error.prototype;

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!!!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (Buffer.isBuffer(actual) && Buffer.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();

  // 7.3. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (typeof actual != 'object' && typeof expected != 'object') {
    return actual == expected;

  // 7.4. For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (expected instanceof RegExp) {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail('Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail('Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

},{"util":2,"buffer":3}],2:[function(require,module,exports){
var events = require('events');

exports.isArray = isArray;
exports.isDate = function(obj){return Object.prototype.toString.call(obj) === '[object Date]'};
exports.isRegExp = function(obj){return Object.prototype.toString.call(obj) === '[object RegExp]'};


exports.print = function () {};
exports.puts = function () {};
exports.debug = function() {};

exports.inspect = function(obj, showHidden, depth, colors) {
  var seen = [];

  var stylize = function(str, styleType) {
    // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
    var styles =
        { 'bold' : [1, 22],
          'italic' : [3, 23],
          'underline' : [4, 24],
          'inverse' : [7, 27],
          'white' : [37, 39],
          'grey' : [90, 39],
          'black' : [30, 39],
          'blue' : [34, 39],
          'cyan' : [36, 39],
          'green' : [32, 39],
          'magenta' : [35, 39],
          'red' : [31, 39],
          'yellow' : [33, 39] };

    var style =
        { 'special': 'cyan',
          'number': 'blue',
          'boolean': 'yellow',
          'undefined': 'grey',
          'null': 'bold',
          'string': 'green',
          'date': 'magenta',
          // "name": intentionally not styling
          'regexp': 'red' }[styleType];

    if (style) {
      return '\033[' + styles[style][0] + 'm' + str +
             '\033[' + styles[style][1] + 'm';
    } else {
      return str;
    }
  };
  if (! colors) {
    stylize = function(str, styleType) { return str; };
  }

  function format(value, recurseTimes) {
    // Provide a hook for user-specified inspect functions.
    // Check that value is an object with an inspect function on it
    if (value && typeof value.inspect === 'function' &&
        // Filter out the util module, it's inspect function is special
        value !== exports &&
        // Also filter out any prototype objects using the circular check.
        !(value.constructor && value.constructor.prototype === value)) {
      return value.inspect(recurseTimes);
    }

    // Primitive types cannot have properties
    switch (typeof value) {
      case 'undefined':
        return stylize('undefined', 'undefined');

      case 'string':
        var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                                 .replace(/'/g, "\\'")
                                                 .replace(/\\"/g, '"') + '\'';
        return stylize(simple, 'string');

      case 'number':
        return stylize('' + value, 'number');

      case 'boolean':
        return stylize('' + value, 'boolean');
    }
    // For some reason typeof null is "object", so special case here.
    if (value === null) {
      return stylize('null', 'null');
    }

    // Look up the keys of the object.
    var visible_keys = Object_keys(value);
    var keys = showHidden ? Object_getOwnPropertyNames(value) : visible_keys;

    // Functions without properties can be shortcutted.
    if (typeof value === 'function' && keys.length === 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        var name = value.name ? ': ' + value.name : '';
        return stylize('[Function' + name + ']', 'special');
      }
    }

    // Dates without properties can be shortcutted
    if (isDate(value) && keys.length === 0) {
      return stylize(value.toUTCString(), 'date');
    }

    var base, type, braces;
    // Determine the object type
    if (isArray(value)) {
      type = 'Array';
      braces = ['[', ']'];
    } else {
      type = 'Object';
      braces = ['{', '}'];
    }

    // Make functions say that they are functions
    if (typeof value === 'function') {
      var n = value.name ? ': ' + value.name : '';
      base = (isRegExp(value)) ? ' ' + value : ' [Function' + n + ']';
    } else {
      base = '';
    }

    // Make dates with properties first say the date
    if (isDate(value)) {
      base = ' ' + value.toUTCString();
    }

    if (keys.length === 0) {
      return braces[0] + base + braces[1];
    }

    if (recurseTimes < 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        return stylize('[Object]', 'special');
      }
    }

    seen.push(value);

    var output = keys.map(function(key) {
      var name, str;
      if (value.__lookupGetter__) {
        if (value.__lookupGetter__(key)) {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Getter/Setter]', 'special');
          } else {
            str = stylize('[Getter]', 'special');
          }
        } else {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Setter]', 'special');
          }
        }
      }
      if (visible_keys.indexOf(key) < 0) {
        name = '[' + key + ']';
      }
      if (!str) {
        if (seen.indexOf(value[key]) < 0) {
          if (recurseTimes === null) {
            str = format(value[key]);
          } else {
            str = format(value[key], recurseTimes - 1);
          }
          if (str.indexOf('\n') > -1) {
            if (isArray(value)) {
              str = str.split('\n').map(function(line) {
                return '  ' + line;
              }).join('\n').substr(2);
            } else {
              str = '\n' + str.split('\n').map(function(line) {
                return '   ' + line;
              }).join('\n');
            }
          }
        } else {
          str = stylize('[Circular]', 'special');
        }
      }
      if (typeof name === 'undefined') {
        if (type === 'Array' && key.match(/^\d+$/)) {
          return str;
        }
        name = JSON.stringify('' + key);
        if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
          name = name.substr(1, name.length - 2);
          name = stylize(name, 'name');
        } else {
          name = name.replace(/'/g, "\\'")
                     .replace(/\\"/g, '"')
                     .replace(/(^"|"$)/g, "'");
          name = stylize(name, 'string');
        }
      }

      return name + ': ' + str;
    });

    seen.pop();

    var numLinesEst = 0;
    var length = output.reduce(function(prev, cur) {
      numLinesEst++;
      if (cur.indexOf('\n') >= 0) numLinesEst++;
      return prev + cur.length + 1;
    }, 0);

    if (length > 50) {
      output = braces[0] +
               (base === '' ? '' : base + '\n ') +
               ' ' +
               output.join(',\n  ') +
               ' ' +
               braces[1];

    } else {
      output = braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
    }

    return output;
  }
  return format(obj, (typeof depth === 'undefined' ? 2 : depth));
};


function isArray(ar) {
  return ar instanceof Array ||
         Array.isArray(ar) ||
         (ar && ar !== Object.prototype && isArray(ar.__proto__));
}


function isRegExp(re) {
  return re instanceof RegExp ||
    (typeof re === 'object' && Object.prototype.toString.call(re) === '[object RegExp]');
}


function isDate(d) {
  if (d instanceof Date) return true;
  if (typeof d !== 'object') return false;
  var properties = Date.prototype && Object_getOwnPropertyNames(Date.prototype);
  var proto = d.__proto__ && Object_getOwnPropertyNames(d.__proto__);
  return JSON.stringify(proto) === JSON.stringify(properties);
}

function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}

exports.log = function (msg) {};

exports.pump = null;

var Object_keys = Object.keys || function (obj) {
    var res = [];
    for (var key in obj) res.push(key);
    return res;
};

var Object_getOwnPropertyNames = Object.getOwnPropertyNames || function (obj) {
    var res = [];
    for (var key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) res.push(key);
    }
    return res;
};

var Object_create = Object.create || function (prototype, properties) {
    // from es5-shim
    var object;
    if (prototype === null) {
        object = { '__proto__' : null };
    }
    else {
        if (typeof prototype !== 'object') {
            throw new TypeError(
                'typeof prototype[' + (typeof prototype) + '] != \'object\''
            );
        }
        var Type = function () {};
        Type.prototype = prototype;
        object = new Type();
        object.__proto__ = prototype;
    }
    if (typeof properties !== 'undefined' && Object.defineProperties) {
        Object.defineProperties(object, properties);
    }
    return object;
};

exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object_create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (typeof f !== 'string') {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(exports.inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j': return JSON.stringify(args[i++]);
      default:
        return x;
    }
  });
  for(var x = args[i]; i < len; x = args[++i]){
    if (x === null || typeof x !== 'object') {
      str += ' ' + x;
    } else {
      str += ' ' + exports.inspect(x);
    }
  }
  return str;
};

},{"events":4}],5:[function(require,module,exports){
exports.readIEEE754 = function(buffer, offset, isBE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isBE ? 0 : (nBytes - 1),
      d = isBE ? 1 : -1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.writeIEEE754 = function(buffer, value, offset, isBE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isBE ? (nBytes - 1) : 0,
      d = isBE ? -1 : 1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],6:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'process-tick') {
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

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],4:[function(require,module,exports){
(function(process){if (!process.EventEmitter) process.EventEmitter = function () {};

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = typeof Array.isArray === 'function'
    ? Array.isArray
    : function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]'
    }
;
function indexOf (xs, x) {
    if (xs.indexOf) return xs.indexOf(x);
    for (var i = 0; i < xs.length; i++) {
        if (x === xs[i]) return i;
    }
    return -1;
}

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  self.on(type, function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  });

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var i = indexOf(list, listener);
    if (i < 0) return this;
    list.splice(i, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (this._events[type] === listener) {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  if (arguments.length === 0) {
    this._events = {};
    return this;
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

})(require("__browserify_process"))
},{"__browserify_process":6}],"buffer-browserify":[function(require,module,exports){
module.exports=require('q9TxCC');
},{}],"q9TxCC":[function(require,module,exports){
function SlowBuffer (size) {
    this.length = size;
};

var assert = require('assert');

exports.INSPECT_MAX_BYTES = 50;


function toHex(n) {
  if (n < 16) return '0' + n.toString(16);
  return n.toString(16);
}

function utf8ToBytes(str) {
  var byteArray = [];
  for (var i = 0; i < str.length; i++)
    if (str.charCodeAt(i) <= 0x7F)
      byteArray.push(str.charCodeAt(i));
    else {
      var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16));
    }

  return byteArray;
}

function asciiToBytes(str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++ )
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push( str.charCodeAt(i) & 0xFF );

  return byteArray;
}

function base64ToBytes(str) {
  return require("base64-js").toByteArray(str);
}

SlowBuffer.byteLength = function (str, encoding) {
  switch (encoding || "utf8") {
    case 'hex':
      return str.length / 2;

    case 'utf8':
    case 'utf-8':
      return utf8ToBytes(str).length;

    case 'ascii':
    case 'binary':
      return str.length;

    case 'base64':
      return base64ToBytes(str).length;

    default:
      throw new Error('Unknown encoding');
  }
};

function blitBuffer(src, dst, offset, length) {
  var pos, i = 0;
  while (i < length) {
    if ((i+offset >= dst.length) || (i >= src.length))
      break;

    dst[i + offset] = src[i];
    i++;
  }
  return i;
}

SlowBuffer.prototype.utf8Write = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten =  blitBuffer(utf8ToBytes(string), this, offset, length);
};

SlowBuffer.prototype.asciiWrite = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten =  blitBuffer(asciiToBytes(string), this, offset, length);
};

SlowBuffer.prototype.binaryWrite = SlowBuffer.prototype.asciiWrite;

SlowBuffer.prototype.base64Write = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten = blitBuffer(base64ToBytes(string), this, offset, length);
};

SlowBuffer.prototype.base64Slice = function (start, end) {
  var bytes = Array.prototype.slice.apply(this, arguments)
  return require("base64-js").fromByteArray(bytes);
}

function decodeUtf8Char(str) {
  try {
    return decodeURIComponent(str);
  } catch (err) {
    return String.fromCharCode(0xFFFD); // UTF 8 invalid char
  }
}

SlowBuffer.prototype.utf8Slice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var res = "";
  var tmp = "";
  var i = 0;
  while (i < bytes.length) {
    if (bytes[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(bytes[i]);
      tmp = "";
    } else
      tmp += "%" + bytes[i].toString(16);

    i++;
  }

  return res + decodeUtf8Char(tmp);
}

SlowBuffer.prototype.asciiSlice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var ret = "";
  for (var i = 0; i < bytes.length; i++)
    ret += String.fromCharCode(bytes[i]);
  return ret;
}

SlowBuffer.prototype.binarySlice = SlowBuffer.prototype.asciiSlice;

SlowBuffer.prototype.inspect = function() {
  var out = [],
      len = this.length;
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }
  return '<SlowBuffer ' + out.join(' ') + '>';
};


SlowBuffer.prototype.hexSlice = function(start, end) {
  var len = this.length;

  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;

  var out = '';
  for (var i = start; i < end; i++) {
    out += toHex(this[i]);
  }
  return out;
};


SlowBuffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();
  start = +start || 0;
  if (typeof end == 'undefined') end = this.length;

  // Fastpath empty strings
  if (+end == start) {
    return '';
  }

  switch (encoding) {
    case 'hex':
      return this.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.utf8Slice(start, end);

    case 'ascii':
      return this.asciiSlice(start, end);

    case 'binary':
      return this.binarySlice(start, end);

    case 'base64':
      return this.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


SlowBuffer.prototype.hexWrite = function(string, offset, length) {
  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }

  // must be an even number of digits
  var strLen = string.length;
  if (strLen % 2) {
    throw new Error('Invalid hex string');
  }
  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(byte)) throw new Error('Invalid hex string');
    this[offset + i] = byte;
  }
  SlowBuffer._charsWritten = i * 2;
  return i;
};


SlowBuffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  switch (encoding) {
    case 'hex':
      return this.hexWrite(string, offset, length);

    case 'utf8':
    case 'utf-8':
      return this.utf8Write(string, offset, length);

    case 'ascii':
      return this.asciiWrite(string, offset, length);

    case 'binary':
      return this.binaryWrite(string, offset, length);

    case 'base64':
      return this.base64Write(string, offset, length);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Write(string, offset, length);

    default:
      throw new Error('Unknown encoding');
  }
};


// slice(start, end)
SlowBuffer.prototype.slice = function(start, end) {
  if (end === undefined) end = this.length;

  if (end > this.length) {
    throw new Error('oob');
  }
  if (start > end) {
    throw new Error('oob');
  }

  return new Buffer(this, end - start, +start);
};

SlowBuffer.prototype.copy = function(target, targetstart, sourcestart, sourceend) {
  var temp = [];
  for (var i=sourcestart; i<sourceend; i++) {
    assert.ok(typeof this[i] !== 'undefined', "copying undefined buffer bytes!");
    temp.push(this[i]);
  }

  for (var i=targetstart; i<targetstart+temp.length; i++) {
    target[i] = temp[i-targetstart];
  }
};

SlowBuffer.prototype.fill = function(value, start, end) {
  if (end > this.length) {
    throw new Error('oob');
  }
  if (start > end) {
    throw new Error('oob');
  }

  for (var i = start; i < end; i++) {
    this[i] = value;
  }
}

function coerce(length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length);
  return length < 0 ? 0 : length;
}


// Buffer

function Buffer(subject, encoding, offset) {
  if (!(this instanceof Buffer)) {
    return new Buffer(subject, encoding, offset);
  }

  var type;

  // Are we slicing?
  if (typeof offset === 'number') {
    this.length = coerce(encoding);
    this.parent = subject;
    this.offset = offset;
  } else {
    // Find the length
    switch (type = typeof subject) {
      case 'number':
        this.length = coerce(subject);
        break;

      case 'string':
        this.length = Buffer.byteLength(subject, encoding);
        break;

      case 'object': // Assume object is an array
        this.length = coerce(subject.length);
        break;

      default:
        throw new Error('First argument needs to be a number, ' +
                        'array or string.');
    }

    if (this.length > Buffer.poolSize) {
      // Big buffer, just alloc one.
      this.parent = new SlowBuffer(this.length);
      this.offset = 0;

    } else {
      // Small buffer.
      if (!pool || pool.length - pool.used < this.length) allocPool();
      this.parent = pool;
      this.offset = pool.used;
      pool.used += this.length;
    }

    // Treat array-ish objects as a byte array.
    if (isArrayIsh(subject)) {
      for (var i = 0; i < this.length; i++) {
        if (subject instanceof Buffer) {
          this.parent[i + this.offset] = subject.readUInt8(i);
        }
        else {
          this.parent[i + this.offset] = subject[i];
        }
      }
    } else if (type == 'string') {
      // We are a string
      this.length = this.write(subject, 0, encoding);
    }
  }

}

function isArrayIsh(subject) {
  return Array.isArray(subject) || Buffer.isBuffer(subject) ||
         subject && typeof subject === 'object' &&
         typeof subject.length === 'number';
}

exports.SlowBuffer = SlowBuffer;
exports.Buffer = Buffer;

Buffer.poolSize = 8 * 1024;
var pool;

function allocPool() {
  pool = new SlowBuffer(Buffer.poolSize);
  pool.used = 0;
}


// Static methods
Buffer.isBuffer = function isBuffer(b) {
  return b instanceof Buffer || b instanceof SlowBuffer;
};

Buffer.concat = function (list, totalLength) {
  if (!Array.isArray(list)) {
    throw new Error("Usage: Buffer.concat(list, [totalLength])\n \
      list should be an Array.");
  }

  if (list.length === 0) {
    return new Buffer(0);
  } else if (list.length === 1) {
    return list[0];
  }

  if (typeof totalLength !== 'number') {
    totalLength = 0;
    for (var i = 0; i < list.length; i++) {
      var buf = list[i];
      totalLength += buf.length;
    }
  }

  var buffer = new Buffer(totalLength);
  var pos = 0;
  for (var i = 0; i < list.length; i++) {
    var buf = list[i];
    buf.copy(buffer, pos);
    pos += buf.length;
  }
  return buffer;
};

// Inspect
Buffer.prototype.inspect = function inspect() {
  var out = [],
      len = this.length;

  for (var i = 0; i < len; i++) {
    out[i] = toHex(this.parent[i + this.offset]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }

  return '<Buffer ' + out.join(' ') + '>';
};


Buffer.prototype.get = function get(i) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this.parent[this.offset + i];
};


Buffer.prototype.set = function set(i, v) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this.parent[this.offset + i] = v;
};


// write(string, offset = 0, length = buffer.length-offset, encoding = 'utf8')
Buffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  var ret;
  switch (encoding) {
    case 'hex':
      ret = this.parent.hexWrite(string, this.offset + offset, length);
      break;

    case 'utf8':
    case 'utf-8':
      ret = this.parent.utf8Write(string, this.offset + offset, length);
      break;

    case 'ascii':
      ret = this.parent.asciiWrite(string, this.offset + offset, length);
      break;

    case 'binary':
      ret = this.parent.binaryWrite(string, this.offset + offset, length);
      break;

    case 'base64':
      // Warning: maxLength not taken into account in base64Write
      ret = this.parent.base64Write(string, this.offset + offset, length);
      break;

    case 'ucs2':
    case 'ucs-2':
      ret = this.parent.ucs2Write(string, this.offset + offset, length);
      break;

    default:
      throw new Error('Unknown encoding');
  }

  Buffer._charsWritten = SlowBuffer._charsWritten;

  return ret;
};


// toString(encoding, start=0, end=buffer.length)
Buffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();

  if (typeof start == 'undefined' || start < 0) {
    start = 0;
  } else if (start > this.length) {
    start = this.length;
  }

  if (typeof end == 'undefined' || end > this.length) {
    end = this.length;
  } else if (end < 0) {
    end = 0;
  }

  start = start + this.offset;
  end = end + this.offset;

  switch (encoding) {
    case 'hex':
      return this.parent.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.parent.utf8Slice(start, end);

    case 'ascii':
      return this.parent.asciiSlice(start, end);

    case 'binary':
      return this.parent.binarySlice(start, end);

    case 'base64':
      return this.parent.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.parent.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


// byteLength
Buffer.byteLength = SlowBuffer.byteLength;


// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill(value, start, end) {
  value || (value = 0);
  start || (start = 0);
  end || (end = this.length);

  if (typeof value === 'string') {
    value = value.charCodeAt(0);
  }
  if (!(typeof value === 'number') || isNaN(value)) {
    throw new Error('value is not a number');
  }

  if (end < start) throw new Error('end < start');

  // Fill 0 bytes; we're done
  if (end === start) return 0;
  if (this.length == 0) return 0;

  if (start < 0 || start >= this.length) {
    throw new Error('start out of bounds');
  }

  if (end < 0 || end > this.length) {
    throw new Error('end out of bounds');
  }

  return this.parent.fill(value,
                          start + this.offset,
                          end + this.offset);
};


// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function(target, target_start, start, end) {
  var source = this;
  start || (start = 0);
  end || (end = this.length);
  target_start || (target_start = 0);

  if (end < start) throw new Error('sourceEnd < sourceStart');

  // Copy 0 bytes; we're done
  if (end === start) return 0;
  if (target.length == 0 || source.length == 0) return 0;

  if (target_start < 0 || target_start >= target.length) {
    throw new Error('targetStart out of bounds');
  }

  if (start < 0 || start >= source.length) {
    throw new Error('sourceStart out of bounds');
  }

  if (end < 0 || end > source.length) {
    throw new Error('sourceEnd out of bounds');
  }

  // Are we oob?
  if (end > this.length) {
    end = this.length;
  }

  if (target.length - target_start < end - start) {
    end = target.length - target_start + start;
  }

  return this.parent.copy(target.parent,
                          target_start + target.offset,
                          start + this.offset,
                          end + this.offset);
};


// slice(start, end)
Buffer.prototype.slice = function(start, end) {
  if (end === undefined) end = this.length;
  if (end > this.length) throw new Error('oob');
  if (start > end) throw new Error('oob');

  return new Buffer(this.parent, end - start, +start + this.offset);
};


// Legacy methods for backwards compatibility.

Buffer.prototype.utf8Slice = function(start, end) {
  return this.toString('utf8', start, end);
};

Buffer.prototype.binarySlice = function(start, end) {
  return this.toString('binary', start, end);
};

Buffer.prototype.asciiSlice = function(start, end) {
  return this.toString('ascii', start, end);
};

Buffer.prototype.utf8Write = function(string, offset) {
  return this.write(string, offset, 'utf8');
};

Buffer.prototype.binaryWrite = function(string, offset) {
  return this.write(string, offset, 'binary');
};

Buffer.prototype.asciiWrite = function(string, offset) {
  return this.write(string, offset, 'ascii');
};

Buffer.prototype.readUInt8 = function(offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return;

  return buffer.parent[buffer.offset + offset];
};

function readUInt16(buffer, offset, isBigEndian, noAssert) {
  var val = 0;


  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return 0;

  if (isBigEndian) {
    val = buffer.parent[buffer.offset + offset] << 8;
    if (offset + 1 < buffer.length) {
      val |= buffer.parent[buffer.offset + offset + 1];
    }
  } else {
    val = buffer.parent[buffer.offset + offset];
    if (offset + 1 < buffer.length) {
      val |= buffer.parent[buffer.offset + offset + 1] << 8;
    }
  }

  return val;
}

Buffer.prototype.readUInt16LE = function(offset, noAssert) {
  return readUInt16(this, offset, false, noAssert);
};

Buffer.prototype.readUInt16BE = function(offset, noAssert) {
  return readUInt16(this, offset, true, noAssert);
};

function readUInt32(buffer, offset, isBigEndian, noAssert) {
  var val = 0;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return 0;

  if (isBigEndian) {
    if (offset + 1 < buffer.length)
      val = buffer.parent[buffer.offset + offset + 1] << 16;
    if (offset + 2 < buffer.length)
      val |= buffer.parent[buffer.offset + offset + 2] << 8;
    if (offset + 3 < buffer.length)
      val |= buffer.parent[buffer.offset + offset + 3];
    val = val + (buffer.parent[buffer.offset + offset] << 24 >>> 0);
  } else {
    if (offset + 2 < buffer.length)
      val = buffer.parent[buffer.offset + offset + 2] << 16;
    if (offset + 1 < buffer.length)
      val |= buffer.parent[buffer.offset + offset + 1] << 8;
    val |= buffer.parent[buffer.offset + offset];
    if (offset + 3 < buffer.length)
      val = val + (buffer.parent[buffer.offset + offset + 3] << 24 >>> 0);
  }

  return val;
}

Buffer.prototype.readUInt32LE = function(offset, noAssert) {
  return readUInt32(this, offset, false, noAssert);
};

Buffer.prototype.readUInt32BE = function(offset, noAssert) {
  return readUInt32(this, offset, true, noAssert);
};


/*
 * Signed integer types, yay team! A reminder on how two's complement actually
 * works. The first bit is the signed bit, i.e. tells us whether or not the
 * number should be positive or negative. If the two's complement value is
 * positive, then we're done, as it's equivalent to the unsigned representation.
 *
 * Now if the number is positive, you're pretty much done, you can just leverage
 * the unsigned translations and return those. Unfortunately, negative numbers
 * aren't quite that straightforward.
 *
 * At first glance, one might be inclined to use the traditional formula to
 * translate binary numbers between the positive and negative values in two's
 * complement. (Though it doesn't quite work for the most negative value)
 * Mainly:
 *  - invert all the bits
 *  - add one to the result
 *
 * Of course, this doesn't quite work in Javascript. Take for example the value
 * of -128. This could be represented in 16 bits (big-endian) as 0xff80. But of
 * course, Javascript will do the following:
 *
 * > ~0xff80
 * -65409
 *
 * Whoh there, Javascript, that's not quite right. But wait, according to
 * Javascript that's perfectly correct. When Javascript ends up seeing the
 * constant 0xff80, it has no notion that it is actually a signed number. It
 * assumes that we've input the unsigned value 0xff80. Thus, when it does the
 * binary negation, it casts it into a signed value, (positive 0xff80). Then
 * when you perform binary negation on that, it turns it into a negative number.
 *
 * Instead, we're going to have to use the following general formula, that works
 * in a rather Javascript friendly way. I'm glad we don't support this kind of
 * weird numbering scheme in the kernel.
 *
 * (BIT-MAX - (unsigned)val + 1) * -1
 *
 * The astute observer, may think that this doesn't make sense for 8-bit numbers
 * (really it isn't necessary for them). However, when you get 16-bit numbers,
 * you do. Let's go back to our prior example and see how this will look:
 *
 * (0xffff - 0xff80 + 1) * -1
 * (0x007f + 1) * -1
 * (0x0080) * -1
 */
Buffer.prototype.readInt8 = function(offset, noAssert) {
  var buffer = this;
  var neg;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return;

  neg = buffer.parent[buffer.offset + offset] & 0x80;
  if (!neg) {
    return (buffer.parent[buffer.offset + offset]);
  }

  return ((0xff - buffer.parent[buffer.offset + offset] + 1) * -1);
};

function readInt16(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt16(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x8000;
  if (!neg) {
    return val;
  }

  return (0xffff - val + 1) * -1;
}

Buffer.prototype.readInt16LE = function(offset, noAssert) {
  return readInt16(this, offset, false, noAssert);
};

Buffer.prototype.readInt16BE = function(offset, noAssert) {
  return readInt16(this, offset, true, noAssert);
};

function readInt32(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt32(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x80000000;
  if (!neg) {
    return (val);
  }

  return (0xffffffff - val + 1) * -1;
}

Buffer.prototype.readInt32LE = function(offset, noAssert) {
  return readInt32(this, offset, false, noAssert);
};

Buffer.prototype.readInt32BE = function(offset, noAssert) {
  return readInt32(this, offset, true, noAssert);
};

function readFloat(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.readFloatLE = function(offset, noAssert) {
  return readFloat(this, offset, false, noAssert);
};

Buffer.prototype.readFloatBE = function(offset, noAssert) {
  return readFloat(this, offset, true, noAssert);
};

function readDouble(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 7 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.readDoubleLE = function(offset, noAssert) {
  return readDouble(this, offset, false, noAssert);
};

Buffer.prototype.readDoubleBE = function(offset, noAssert) {
  return readDouble(this, offset, true, noAssert);
};


/*
 * We have to make sure that the value is a valid integer. This means that it is
 * non-negative. It has no fractional component and that it does not exceed the
 * maximum allowed value.
 *
 *      value           The number to check for validity
 *
 *      max             The maximum value
 */
function verifuint(value, max) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value >= 0,
      'specified a negative value for writing an unsigned value');

  assert.ok(value <= max, 'value is larger than maximum value for type');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

Buffer.prototype.writeUInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xff);
  }

  if (offset < buffer.length) {
    buffer.parent[buffer.offset + offset] = value;
  }
};

function writeUInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffff);
  }

  for (var i = 0; i < Math.min(buffer.length - offset, 2); i++) {
    buffer.parent[buffer.offset + offset + i] =
        (value & (0xff << (8 * (isBigEndian ? 1 - i : i)))) >>>
            (isBigEndian ? 1 - i : i) * 8;
  }

}

Buffer.prototype.writeUInt16LE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt16BE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, true, noAssert);
};

function writeUInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffffffff);
  }

  for (var i = 0; i < Math.min(buffer.length - offset, 4); i++) {
    buffer.parent[buffer.offset + offset + i] =
        (value >>> (isBigEndian ? 3 - i : i) * 8) & 0xff;
  }
}

Buffer.prototype.writeUInt32LE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt32BE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, true, noAssert);
};


/*
 * We now move onto our friends in the signed number category. Unlike unsigned
 * numbers, we're going to have to worry a bit more about how we put values into
 * arrays. Since we are only worrying about signed 32-bit values, we're in
 * slightly better shape. Unfortunately, we really can't do our favorite binary
 * & in this system. It really seems to do the wrong thing. For example:
 *
 * > -32 & 0xff
 * 224
 *
 * What's happening above is really: 0xe0 & 0xff = 0xe0. However, the results of
 * this aren't treated as a signed number. Ultimately a bad thing.
 *
 * What we're going to want to do is basically create the unsigned equivalent of
 * our representation and pass that off to the wuint* functions. To do that
 * we're going to do the following:
 *
 *  - if the value is positive
 *      we can pass it directly off to the equivalent wuint
 *  - if the value is negative
 *      we do the following computation:
 *         mb + val + 1, where
 *         mb   is the maximum unsigned value in that byte size
 *         val  is the Javascript negative integer
 *
 *
 * As a concrete value, take -128. In signed 16 bits this would be 0xff80. If
 * you do out the computations:
 *
 * 0xffff - 128 + 1
 * 0xffff - 127
 * 0xff80
 *
 * You can then encode this value as the signed version. This is really rather
 * hacky, but it should work and get the job done which is our goal here.
 */

/*
 * A series of checks to make sure we actually have a signed 32-bit number
 */
function verifsint(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

function verifIEEE754(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');
}

Buffer.prototype.writeInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7f, -0x80);
  }

  if (value >= 0) {
    buffer.writeUInt8(value, offset, noAssert);
  } else {
    buffer.writeUInt8(0xff + value + 1, offset, noAssert);
  }
};

function writeInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fff, -0x8000);
  }

  if (value >= 0) {
    writeUInt16(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt16(buffer, 0xffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt16LE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt16BE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, true, noAssert);
};

function writeInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fffffff, -0x80000000);
  }

  if (value >= 0) {
    writeUInt32(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt32(buffer, 0xffffffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt32LE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt32BE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, true, noAssert);
};

function writeFloat(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.writeFloatLE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, false, noAssert);
};

Buffer.prototype.writeFloatBE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, true, noAssert);
};

function writeDouble(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 7 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.writeDoubleLE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, false, noAssert);
};

Buffer.prototype.writeDoubleBE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, true, noAssert);
};

SlowBuffer.prototype.readUInt8 = Buffer.prototype.readUInt8;
SlowBuffer.prototype.readUInt16LE = Buffer.prototype.readUInt16LE;
SlowBuffer.prototype.readUInt16BE = Buffer.prototype.readUInt16BE;
SlowBuffer.prototype.readUInt32LE = Buffer.prototype.readUInt32LE;
SlowBuffer.prototype.readUInt32BE = Buffer.prototype.readUInt32BE;
SlowBuffer.prototype.readInt8 = Buffer.prototype.readInt8;
SlowBuffer.prototype.readInt16LE = Buffer.prototype.readInt16LE;
SlowBuffer.prototype.readInt16BE = Buffer.prototype.readInt16BE;
SlowBuffer.prototype.readInt32LE = Buffer.prototype.readInt32LE;
SlowBuffer.prototype.readInt32BE = Buffer.prototype.readInt32BE;
SlowBuffer.prototype.readFloatLE = Buffer.prototype.readFloatLE;
SlowBuffer.prototype.readFloatBE = Buffer.prototype.readFloatBE;
SlowBuffer.prototype.readDoubleLE = Buffer.prototype.readDoubleLE;
SlowBuffer.prototype.readDoubleBE = Buffer.prototype.readDoubleBE;
SlowBuffer.prototype.writeUInt8 = Buffer.prototype.writeUInt8;
SlowBuffer.prototype.writeUInt16LE = Buffer.prototype.writeUInt16LE;
SlowBuffer.prototype.writeUInt16BE = Buffer.prototype.writeUInt16BE;
SlowBuffer.prototype.writeUInt32LE = Buffer.prototype.writeUInt32LE;
SlowBuffer.prototype.writeUInt32BE = Buffer.prototype.writeUInt32BE;
SlowBuffer.prototype.writeInt8 = Buffer.prototype.writeInt8;
SlowBuffer.prototype.writeInt16LE = Buffer.prototype.writeInt16LE;
SlowBuffer.prototype.writeInt16BE = Buffer.prototype.writeInt16BE;
SlowBuffer.prototype.writeInt32LE = Buffer.prototype.writeInt32LE;
SlowBuffer.prototype.writeInt32BE = Buffer.prototype.writeInt32BE;
SlowBuffer.prototype.writeFloatLE = Buffer.prototype.writeFloatLE;
SlowBuffer.prototype.writeFloatBE = Buffer.prototype.writeFloatBE;
SlowBuffer.prototype.writeDoubleLE = Buffer.prototype.writeDoubleLE;
SlowBuffer.prototype.writeDoubleBE = Buffer.prototype.writeDoubleBE;

},{"assert":1,"./buffer_ieee754":5,"base64-js":7}],7:[function(require,module,exports){
(function (exports) {
	'use strict';

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	function b64ToByteArray(b64) {
		var i, j, l, tmp, placeHolders, arr;
	
		if (b64.length % 4 > 0) {
			throw 'Invalid string. Length must be a multiple of 4';
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		placeHolders = b64.indexOf('=');
		placeHolders = placeHolders > 0 ? b64.length - placeHolders : 0;

		// base64 is 4/3 + up to two characters of the original data
		arr = [];//new Uint8Array(b64.length * 3 / 4 - placeHolders);

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length;

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (lookup.indexOf(b64[i]) << 18) | (lookup.indexOf(b64[i + 1]) << 12) | (lookup.indexOf(b64[i + 2]) << 6) | lookup.indexOf(b64[i + 3]);
			arr.push((tmp & 0xFF0000) >> 16);
			arr.push((tmp & 0xFF00) >> 8);
			arr.push(tmp & 0xFF);
		}

		if (placeHolders === 2) {
			tmp = (lookup.indexOf(b64[i]) << 2) | (lookup.indexOf(b64[i + 1]) >> 4);
			arr.push(tmp & 0xFF);
		} else if (placeHolders === 1) {
			tmp = (lookup.indexOf(b64[i]) << 10) | (lookup.indexOf(b64[i + 1]) << 4) | (lookup.indexOf(b64[i + 2]) >> 2);
			arr.push((tmp >> 8) & 0xFF);
			arr.push(tmp & 0xFF);
		}

		return arr;
	}

	function uint8ToBase64(uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length;

		function tripletToBase64 (num) {
			return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
		};

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
			output += tripletToBase64(temp);
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1];
				output += lookup[temp >> 2];
				output += lookup[(temp << 4) & 0x3F];
				output += '==';
				break;
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
				output += lookup[temp >> 10];
				output += lookup[(temp >> 4) & 0x3F];
				output += lookup[(temp << 2) & 0x3F];
				output += '=';
				break;
		}

		return output;
	}

	module.exports.toByteArray = b64ToByteArray;
	module.exports.fromByteArray = uint8ToBase64;
}());

},{}],8:[function(require,module,exports){
exports.readIEEE754 = function(buffer, offset, isBE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isBE ? 0 : (nBytes - 1),
      d = isBE ? 1 : -1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.writeIEEE754 = function(buffer, value, offset, isBE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isBE ? (nBytes - 1) : 0,
      d = isBE ? -1 : 1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],3:[function(require,module,exports){
function SlowBuffer (size) {
    this.length = size;
};

var assert = require('assert');

exports.INSPECT_MAX_BYTES = 50;


function toHex(n) {
  if (n < 16) return '0' + n.toString(16);
  return n.toString(16);
}

function utf8ToBytes(str) {
  var byteArray = [];
  for (var i = 0; i < str.length; i++)
    if (str.charCodeAt(i) <= 0x7F)
      byteArray.push(str.charCodeAt(i));
    else {
      var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16));
    }

  return byteArray;
}

function asciiToBytes(str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++ )
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push( str.charCodeAt(i) & 0xFF );

  return byteArray;
}

function base64ToBytes(str) {
  return require("base64-js").toByteArray(str);
}

SlowBuffer.byteLength = function (str, encoding) {
  switch (encoding || "utf8") {
    case 'hex':
      return str.length / 2;

    case 'utf8':
    case 'utf-8':
      return utf8ToBytes(str).length;

    case 'ascii':
      return str.length;

    case 'base64':
      return base64ToBytes(str).length;

    default:
      throw new Error('Unknown encoding');
  }
};

function blitBuffer(src, dst, offset, length) {
  var pos, i = 0;
  while (i < length) {
    if ((i+offset >= dst.length) || (i >= src.length))
      break;

    dst[i + offset] = src[i];
    i++;
  }
  return i;
}

SlowBuffer.prototype.utf8Write = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten =  blitBuffer(utf8ToBytes(string), this, offset, length);
};

SlowBuffer.prototype.asciiWrite = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten =  blitBuffer(asciiToBytes(string), this, offset, length);
};

SlowBuffer.prototype.base64Write = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten = blitBuffer(base64ToBytes(string), this, offset, length);
};

SlowBuffer.prototype.base64Slice = function (start, end) {
  var bytes = Array.prototype.slice.apply(this, arguments)
  return require("base64-js").fromByteArray(bytes);
}

function decodeUtf8Char(str) {
  try {
    return decodeURIComponent(str);
  } catch (err) {
    return String.fromCharCode(0xFFFD); // UTF 8 invalid char
  }
}

SlowBuffer.prototype.utf8Slice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var res = "";
  var tmp = "";
  var i = 0;
  while (i < bytes.length) {
    if (bytes[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(bytes[i]);
      tmp = "";
    } else
      tmp += "%" + bytes[i].toString(16);

    i++;
  }

  return res + decodeUtf8Char(tmp);
}

SlowBuffer.prototype.asciiSlice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var ret = "";
  for (var i = 0; i < bytes.length; i++)
    ret += String.fromCharCode(bytes[i]);
  return ret;
}

SlowBuffer.prototype.inspect = function() {
  var out = [],
      len = this.length;
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }
  return '<SlowBuffer ' + out.join(' ') + '>';
};


SlowBuffer.prototype.hexSlice = function(start, end) {
  var len = this.length;

  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;

  var out = '';
  for (var i = start; i < end; i++) {
    out += toHex(this[i]);
  }
  return out;
};


SlowBuffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();
  start = +start || 0;
  if (typeof end == 'undefined') end = this.length;

  // Fastpath empty strings
  if (+end == start) {
    return '';
  }

  switch (encoding) {
    case 'hex':
      return this.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.utf8Slice(start, end);

    case 'ascii':
      return this.asciiSlice(start, end);

    case 'binary':
      return this.binarySlice(start, end);

    case 'base64':
      return this.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


SlowBuffer.prototype.hexWrite = function(string, offset, length) {
  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }

  // must be an even number of digits
  var strLen = string.length;
  if (strLen % 2) {
    throw new Error('Invalid hex string');
  }
  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(byte)) throw new Error('Invalid hex string');
    this[offset + i] = byte;
  }
  SlowBuffer._charsWritten = i * 2;
  return i;
};


SlowBuffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  switch (encoding) {
    case 'hex':
      return this.hexWrite(string, offset, length);

    case 'utf8':
    case 'utf-8':
      return this.utf8Write(string, offset, length);

    case 'ascii':
      return this.asciiWrite(string, offset, length);

    case 'binary':
      return this.binaryWrite(string, offset, length);

    case 'base64':
      return this.base64Write(string, offset, length);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Write(string, offset, length);

    default:
      throw new Error('Unknown encoding');
  }
};


// slice(start, end)
SlowBuffer.prototype.slice = function(start, end) {
  if (end === undefined) end = this.length;

  if (end > this.length) {
    throw new Error('oob');
  }
  if (start > end) {
    throw new Error('oob');
  }

  return new Buffer(this, end - start, +start);
};

SlowBuffer.prototype.copy = function(target, targetstart, sourcestart, sourceend) {
  var temp = [];
  for (var i=sourcestart; i<sourceend; i++) {
    assert.ok(typeof this[i] !== 'undefined', "copying undefined buffer bytes!");
    temp.push(this[i]);
  }

  for (var i=targetstart; i<targetstart+temp.length; i++) {
    target[i] = temp[i-targetstart];
  }
};

function coerce(length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length);
  return length < 0 ? 0 : length;
}


// Buffer

function Buffer(subject, encoding, offset) {
  if (!(this instanceof Buffer)) {
    return new Buffer(subject, encoding, offset);
  }

  var type;

  // Are we slicing?
  if (typeof offset === 'number') {
    this.length = coerce(encoding);
    this.parent = subject;
    this.offset = offset;
  } else {
    // Find the length
    switch (type = typeof subject) {
      case 'number':
        this.length = coerce(subject);
        break;

      case 'string':
        this.length = Buffer.byteLength(subject, encoding);
        break;

      case 'object': // Assume object is an array
        this.length = coerce(subject.length);
        break;

      default:
        throw new Error('First argument needs to be a number, ' +
                        'array or string.');
    }

    if (this.length > Buffer.poolSize) {
      // Big buffer, just alloc one.
      this.parent = new SlowBuffer(this.length);
      this.offset = 0;

    } else {
      // Small buffer.
      if (!pool || pool.length - pool.used < this.length) allocPool();
      this.parent = pool;
      this.offset = pool.used;
      pool.used += this.length;
    }

    // Treat array-ish objects as a byte array.
    if (isArrayIsh(subject)) {
      for (var i = 0; i < this.length; i++) {
        this.parent[i + this.offset] = subject[i];
      }
    } else if (type == 'string') {
      // We are a string
      this.length = this.write(subject, 0, encoding);
    }
  }

}

function isArrayIsh(subject) {
  return Array.isArray(subject) || Buffer.isBuffer(subject) ||
         subject && typeof subject === 'object' &&
         typeof subject.length === 'number';
}

exports.SlowBuffer = SlowBuffer;
exports.Buffer = Buffer;

Buffer.poolSize = 8 * 1024;
var pool;

function allocPool() {
  pool = new SlowBuffer(Buffer.poolSize);
  pool.used = 0;
}


// Static methods
Buffer.isBuffer = function isBuffer(b) {
  return b instanceof Buffer || b instanceof SlowBuffer;
};

Buffer.concat = function (list, totalLength) {
  if (!Array.isArray(list)) {
    throw new Error("Usage: Buffer.concat(list, [totalLength])\n \
      list should be an Array.");
  }

  if (list.length === 0) {
    return new Buffer(0);
  } else if (list.length === 1) {
    return list[0];
  }

  if (typeof totalLength !== 'number') {
    totalLength = 0;
    for (var i = 0; i < list.length; i++) {
      var buf = list[i];
      totalLength += buf.length;
    }
  }

  var buffer = new Buffer(totalLength);
  var pos = 0;
  for (var i = 0; i < list.length; i++) {
    var buf = list[i];
    buf.copy(buffer, pos);
    pos += buf.length;
  }
  return buffer;
};

// Inspect
Buffer.prototype.inspect = function inspect() {
  var out = [],
      len = this.length;

  for (var i = 0; i < len; i++) {
    out[i] = toHex(this.parent[i + this.offset]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }

  return '<Buffer ' + out.join(' ') + '>';
};


Buffer.prototype.get = function get(i) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this.parent[this.offset + i];
};


Buffer.prototype.set = function set(i, v) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this.parent[this.offset + i] = v;
};


// write(string, offset = 0, length = buffer.length-offset, encoding = 'utf8')
Buffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  var ret;
  switch (encoding) {
    case 'hex':
      ret = this.parent.hexWrite(string, this.offset + offset, length);
      break;

    case 'utf8':
    case 'utf-8':
      ret = this.parent.utf8Write(string, this.offset + offset, length);
      break;

    case 'ascii':
      ret = this.parent.asciiWrite(string, this.offset + offset, length);
      break;

    case 'binary':
      ret = this.parent.binaryWrite(string, this.offset + offset, length);
      break;

    case 'base64':
      // Warning: maxLength not taken into account in base64Write
      ret = this.parent.base64Write(string, this.offset + offset, length);
      break;

    case 'ucs2':
    case 'ucs-2':
      ret = this.parent.ucs2Write(string, this.offset + offset, length);
      break;

    default:
      throw new Error('Unknown encoding');
  }

  Buffer._charsWritten = SlowBuffer._charsWritten;

  return ret;
};


// toString(encoding, start=0, end=buffer.length)
Buffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();

  if (typeof start == 'undefined' || start < 0) {
    start = 0;
  } else if (start > this.length) {
    start = this.length;
  }

  if (typeof end == 'undefined' || end > this.length) {
    end = this.length;
  } else if (end < 0) {
    end = 0;
  }

  start = start + this.offset;
  end = end + this.offset;

  switch (encoding) {
    case 'hex':
      return this.parent.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.parent.utf8Slice(start, end);

    case 'ascii':
      return this.parent.asciiSlice(start, end);

    case 'binary':
      return this.parent.binarySlice(start, end);

    case 'base64':
      return this.parent.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.parent.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


// byteLength
Buffer.byteLength = SlowBuffer.byteLength;


// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill(value, start, end) {
  value || (value = 0);
  start || (start = 0);
  end || (end = this.length);

  if (typeof value === 'string') {
    value = value.charCodeAt(0);
  }
  if (!(typeof value === 'number') || isNaN(value)) {
    throw new Error('value is not a number');
  }

  if (end < start) throw new Error('end < start');

  // Fill 0 bytes; we're done
  if (end === start) return 0;
  if (this.length == 0) return 0;

  if (start < 0 || start >= this.length) {
    throw new Error('start out of bounds');
  }

  if (end < 0 || end > this.length) {
    throw new Error('end out of bounds');
  }

  return this.parent.fill(value,
                          start + this.offset,
                          end + this.offset);
};


// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function(target, target_start, start, end) {
  var source = this;
  start || (start = 0);
  end || (end = this.length);
  target_start || (target_start = 0);

  if (end < start) throw new Error('sourceEnd < sourceStart');

  // Copy 0 bytes; we're done
  if (end === start) return 0;
  if (target.length == 0 || source.length == 0) return 0;

  if (target_start < 0 || target_start >= target.length) {
    throw new Error('targetStart out of bounds');
  }

  if (start < 0 || start >= source.length) {
    throw new Error('sourceStart out of bounds');
  }

  if (end < 0 || end > source.length) {
    throw new Error('sourceEnd out of bounds');
  }

  // Are we oob?
  if (end > this.length) {
    end = this.length;
  }

  if (target.length - target_start < end - start) {
    end = target.length - target_start + start;
  }

  return this.parent.copy(target.parent,
                          target_start + target.offset,
                          start + this.offset,
                          end + this.offset);
};


// slice(start, end)
Buffer.prototype.slice = function(start, end) {
  if (end === undefined) end = this.length;
  if (end > this.length) throw new Error('oob');
  if (start > end) throw new Error('oob');

  return new Buffer(this.parent, end - start, +start + this.offset);
};


// Legacy methods for backwards compatibility.

Buffer.prototype.utf8Slice = function(start, end) {
  return this.toString('utf8', start, end);
};

Buffer.prototype.binarySlice = function(start, end) {
  return this.toString('binary', start, end);
};

Buffer.prototype.asciiSlice = function(start, end) {
  return this.toString('ascii', start, end);
};

Buffer.prototype.utf8Write = function(string, offset) {
  return this.write(string, offset, 'utf8');
};

Buffer.prototype.binaryWrite = function(string, offset) {
  return this.write(string, offset, 'binary');
};

Buffer.prototype.asciiWrite = function(string, offset) {
  return this.write(string, offset, 'ascii');
};

Buffer.prototype.readUInt8 = function(offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  return buffer.parent[buffer.offset + offset];
};

function readUInt16(buffer, offset, isBigEndian, noAssert) {
  var val = 0;


  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (isBigEndian) {
    val = buffer.parent[buffer.offset + offset] << 8;
    val |= buffer.parent[buffer.offset + offset + 1];
  } else {
    val = buffer.parent[buffer.offset + offset];
    val |= buffer.parent[buffer.offset + offset + 1] << 8;
  }

  return val;
}

Buffer.prototype.readUInt16LE = function(offset, noAssert) {
  return readUInt16(this, offset, false, noAssert);
};

Buffer.prototype.readUInt16BE = function(offset, noAssert) {
  return readUInt16(this, offset, true, noAssert);
};

function readUInt32(buffer, offset, isBigEndian, noAssert) {
  var val = 0;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (isBigEndian) {
    val = buffer.parent[buffer.offset + offset + 1] << 16;
    val |= buffer.parent[buffer.offset + offset + 2] << 8;
    val |= buffer.parent[buffer.offset + offset + 3];
    val = val + (buffer.parent[buffer.offset + offset] << 24 >>> 0);
  } else {
    val = buffer.parent[buffer.offset + offset + 2] << 16;
    val |= buffer.parent[buffer.offset + offset + 1] << 8;
    val |= buffer.parent[buffer.offset + offset];
    val = val + (buffer.parent[buffer.offset + offset + 3] << 24 >>> 0);
  }

  return val;
}

Buffer.prototype.readUInt32LE = function(offset, noAssert) {
  return readUInt32(this, offset, false, noAssert);
};

Buffer.prototype.readUInt32BE = function(offset, noAssert) {
  return readUInt32(this, offset, true, noAssert);
};


/*
 * Signed integer types, yay team! A reminder on how two's complement actually
 * works. The first bit is the signed bit, i.e. tells us whether or not the
 * number should be positive or negative. If the two's complement value is
 * positive, then we're done, as it's equivalent to the unsigned representation.
 *
 * Now if the number is positive, you're pretty much done, you can just leverage
 * the unsigned translations and return those. Unfortunately, negative numbers
 * aren't quite that straightforward.
 *
 * At first glance, one might be inclined to use the traditional formula to
 * translate binary numbers between the positive and negative values in two's
 * complement. (Though it doesn't quite work for the most negative value)
 * Mainly:
 *  - invert all the bits
 *  - add one to the result
 *
 * Of course, this doesn't quite work in Javascript. Take for example the value
 * of -128. This could be represented in 16 bits (big-endian) as 0xff80. But of
 * course, Javascript will do the following:
 *
 * > ~0xff80
 * -65409
 *
 * Whoh there, Javascript, that's not quite right. But wait, according to
 * Javascript that's perfectly correct. When Javascript ends up seeing the
 * constant 0xff80, it has no notion that it is actually a signed number. It
 * assumes that we've input the unsigned value 0xff80. Thus, when it does the
 * binary negation, it casts it into a signed value, (positive 0xff80). Then
 * when you perform binary negation on that, it turns it into a negative number.
 *
 * Instead, we're going to have to use the following general formula, that works
 * in a rather Javascript friendly way. I'm glad we don't support this kind of
 * weird numbering scheme in the kernel.
 *
 * (BIT-MAX - (unsigned)val + 1) * -1
 *
 * The astute observer, may think that this doesn't make sense for 8-bit numbers
 * (really it isn't necessary for them). However, when you get 16-bit numbers,
 * you do. Let's go back to our prior example and see how this will look:
 *
 * (0xffff - 0xff80 + 1) * -1
 * (0x007f + 1) * -1
 * (0x0080) * -1
 */
Buffer.prototype.readInt8 = function(offset, noAssert) {
  var buffer = this;
  var neg;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  neg = buffer.parent[buffer.offset + offset] & 0x80;
  if (!neg) {
    return (buffer.parent[buffer.offset + offset]);
  }

  return ((0xff - buffer.parent[buffer.offset + offset] + 1) * -1);
};

function readInt16(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt16(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x8000;
  if (!neg) {
    return val;
  }

  return (0xffff - val + 1) * -1;
}

Buffer.prototype.readInt16LE = function(offset, noAssert) {
  return readInt16(this, offset, false, noAssert);
};

Buffer.prototype.readInt16BE = function(offset, noAssert) {
  return readInt16(this, offset, true, noAssert);
};

function readInt32(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt32(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x80000000;
  if (!neg) {
    return (val);
  }

  return (0xffffffff - val + 1) * -1;
}

Buffer.prototype.readInt32LE = function(offset, noAssert) {
  return readInt32(this, offset, false, noAssert);
};

Buffer.prototype.readInt32BE = function(offset, noAssert) {
  return readInt32(this, offset, true, noAssert);
};

function readFloat(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.readFloatLE = function(offset, noAssert) {
  return readFloat(this, offset, false, noAssert);
};

Buffer.prototype.readFloatBE = function(offset, noAssert) {
  return readFloat(this, offset, true, noAssert);
};

function readDouble(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 7 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.readDoubleLE = function(offset, noAssert) {
  return readDouble(this, offset, false, noAssert);
};

Buffer.prototype.readDoubleBE = function(offset, noAssert) {
  return readDouble(this, offset, true, noAssert);
};


/*
 * We have to make sure that the value is a valid integer. This means that it is
 * non-negative. It has no fractional component and that it does not exceed the
 * maximum allowed value.
 *
 *      value           The number to check for validity
 *
 *      max             The maximum value
 */
function verifuint(value, max) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value >= 0,
      'specified a negative value for writing an unsigned value');

  assert.ok(value <= max, 'value is larger than maximum value for type');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

Buffer.prototype.writeUInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xff);
  }

  buffer.parent[buffer.offset + offset] = value;
};

function writeUInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffff);
  }

  if (isBigEndian) {
    buffer.parent[buffer.offset + offset] = (value & 0xff00) >>> 8;
    buffer.parent[buffer.offset + offset + 1] = value & 0x00ff;
  } else {
    buffer.parent[buffer.offset + offset + 1] = (value & 0xff00) >>> 8;
    buffer.parent[buffer.offset + offset] = value & 0x00ff;
  }
}

Buffer.prototype.writeUInt16LE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt16BE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, true, noAssert);
};

function writeUInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffffffff);
  }

  if (isBigEndian) {
    buffer.parent[buffer.offset + offset] = (value >>> 24) & 0xff;
    buffer.parent[buffer.offset + offset + 1] = (value >>> 16) & 0xff;
    buffer.parent[buffer.offset + offset + 2] = (value >>> 8) & 0xff;
    buffer.parent[buffer.offset + offset + 3] = value & 0xff;
  } else {
    buffer.parent[buffer.offset + offset + 3] = (value >>> 24) & 0xff;
    buffer.parent[buffer.offset + offset + 2] = (value >>> 16) & 0xff;
    buffer.parent[buffer.offset + offset + 1] = (value >>> 8) & 0xff;
    buffer.parent[buffer.offset + offset] = value & 0xff;
  }
}

Buffer.prototype.writeUInt32LE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt32BE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, true, noAssert);
};


/*
 * We now move onto our friends in the signed number category. Unlike unsigned
 * numbers, we're going to have to worry a bit more about how we put values into
 * arrays. Since we are only worrying about signed 32-bit values, we're in
 * slightly better shape. Unfortunately, we really can't do our favorite binary
 * & in this system. It really seems to do the wrong thing. For example:
 *
 * > -32 & 0xff
 * 224
 *
 * What's happening above is really: 0xe0 & 0xff = 0xe0. However, the results of
 * this aren't treated as a signed number. Ultimately a bad thing.
 *
 * What we're going to want to do is basically create the unsigned equivalent of
 * our representation and pass that off to the wuint* functions. To do that
 * we're going to do the following:
 *
 *  - if the value is positive
 *      we can pass it directly off to the equivalent wuint
 *  - if the value is negative
 *      we do the following computation:
 *         mb + val + 1, where
 *         mb   is the maximum unsigned value in that byte size
 *         val  is the Javascript negative integer
 *
 *
 * As a concrete value, take -128. In signed 16 bits this would be 0xff80. If
 * you do out the computations:
 *
 * 0xffff - 128 + 1
 * 0xffff - 127
 * 0xff80
 *
 * You can then encode this value as the signed version. This is really rather
 * hacky, but it should work and get the job done which is our goal here.
 */

/*
 * A series of checks to make sure we actually have a signed 32-bit number
 */
function verifsint(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

function verifIEEE754(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');
}

Buffer.prototype.writeInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7f, -0x80);
  }

  if (value >= 0) {
    buffer.writeUInt8(value, offset, noAssert);
  } else {
    buffer.writeUInt8(0xff + value + 1, offset, noAssert);
  }
};

function writeInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fff, -0x8000);
  }

  if (value >= 0) {
    writeUInt16(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt16(buffer, 0xffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt16LE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt16BE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, true, noAssert);
};

function writeInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fffffff, -0x80000000);
  }

  if (value >= 0) {
    writeUInt32(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt32(buffer, 0xffffffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt32LE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt32BE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, true, noAssert);
};

function writeFloat(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.writeFloatLE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, false, noAssert);
};

Buffer.prototype.writeFloatBE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, true, noAssert);
};

function writeDouble(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 7 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.writeDoubleLE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, false, noAssert);
};

Buffer.prototype.writeDoubleBE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, true, noAssert);
};

SlowBuffer.prototype.readUInt8 = Buffer.prototype.readUInt8;
SlowBuffer.prototype.readUInt16LE = Buffer.prototype.readUInt16LE;
SlowBuffer.prototype.readUInt16BE = Buffer.prototype.readUInt16BE;
SlowBuffer.prototype.readUInt32LE = Buffer.prototype.readUInt32LE;
SlowBuffer.prototype.readUInt32BE = Buffer.prototype.readUInt32BE;
SlowBuffer.prototype.readInt8 = Buffer.prototype.readInt8;
SlowBuffer.prototype.readInt16LE = Buffer.prototype.readInt16LE;
SlowBuffer.prototype.readInt16BE = Buffer.prototype.readInt16BE;
SlowBuffer.prototype.readInt32LE = Buffer.prototype.readInt32LE;
SlowBuffer.prototype.readInt32BE = Buffer.prototype.readInt32BE;
SlowBuffer.prototype.readFloatLE = Buffer.prototype.readFloatLE;
SlowBuffer.prototype.readFloatBE = Buffer.prototype.readFloatBE;
SlowBuffer.prototype.readDoubleLE = Buffer.prototype.readDoubleLE;
SlowBuffer.prototype.readDoubleBE = Buffer.prototype.readDoubleBE;
SlowBuffer.prototype.writeUInt8 = Buffer.prototype.writeUInt8;
SlowBuffer.prototype.writeUInt16LE = Buffer.prototype.writeUInt16LE;
SlowBuffer.prototype.writeUInt16BE = Buffer.prototype.writeUInt16BE;
SlowBuffer.prototype.writeUInt32LE = Buffer.prototype.writeUInt32LE;
SlowBuffer.prototype.writeUInt32BE = Buffer.prototype.writeUInt32BE;
SlowBuffer.prototype.writeInt8 = Buffer.prototype.writeInt8;
SlowBuffer.prototype.writeInt16LE = Buffer.prototype.writeInt16LE;
SlowBuffer.prototype.writeInt16BE = Buffer.prototype.writeInt16BE;
SlowBuffer.prototype.writeInt32LE = Buffer.prototype.writeInt32LE;
SlowBuffer.prototype.writeInt32BE = Buffer.prototype.writeInt32BE;
SlowBuffer.prototype.writeFloatLE = Buffer.prototype.writeFloatLE;
SlowBuffer.prototype.writeFloatBE = Buffer.prototype.writeFloatBE;
SlowBuffer.prototype.writeDoubleLE = Buffer.prototype.writeDoubleLE;
SlowBuffer.prototype.writeDoubleBE = Buffer.prototype.writeDoubleBE;

},{"assert":1,"./buffer_ieee754":8,"base64-js":9}],9:[function(require,module,exports){
(function (exports) {
	'use strict';

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	function b64ToByteArray(b64) {
		var i, j, l, tmp, placeHolders, arr;
	
		if (b64.length % 4 > 0) {
			throw 'Invalid string. Length must be a multiple of 4';
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		placeHolders = b64.indexOf('=');
		placeHolders = placeHolders > 0 ? b64.length - placeHolders : 0;

		// base64 is 4/3 + up to two characters of the original data
		arr = [];//new Uint8Array(b64.length * 3 / 4 - placeHolders);

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length;

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (lookup.indexOf(b64[i]) << 18) | (lookup.indexOf(b64[i + 1]) << 12) | (lookup.indexOf(b64[i + 2]) << 6) | lookup.indexOf(b64[i + 3]);
			arr.push((tmp & 0xFF0000) >> 16);
			arr.push((tmp & 0xFF00) >> 8);
			arr.push(tmp & 0xFF);
		}

		if (placeHolders === 2) {
			tmp = (lookup.indexOf(b64[i]) << 2) | (lookup.indexOf(b64[i + 1]) >> 4);
			arr.push(tmp & 0xFF);
		} else if (placeHolders === 1) {
			tmp = (lookup.indexOf(b64[i]) << 10) | (lookup.indexOf(b64[i + 1]) << 4) | (lookup.indexOf(b64[i + 2]) >> 2);
			arr.push((tmp >> 8) & 0xFF);
			arr.push(tmp & 0xFF);
		}

		return arr;
	}

	function uint8ToBase64(uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length;

		function tripletToBase64 (num) {
			return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
		};

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
			output += tripletToBase64(temp);
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1];
				output += lookup[temp >> 2];
				output += lookup[(temp << 4) & 0x3F];
				output += '==';
				break;
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
				output += lookup[temp >> 10];
				output += lookup[(temp >> 4) & 0x3F];
				output += lookup[(temp << 2) & 0x3F];
				output += '=';
				break;
		}

		return output;
	}

	module.exports.toByteArray = b64ToByteArray;
	module.exports.fromByteArray = uint8ToBase64;
}());

},{}]},{},[])
;;module.exports=require("buffer-browserify")

},{}],3:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="0",__dirname="/";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var PhotoProcessor, UI, Utils, imglyKit,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

PhotoProcessor = require("1");

UI = require("2");

Utils = require("3");

window.after = function(t, f) {
  return setTimeout(f, t);
};

window.every = function(t, f) {
  return setInterval(f, t);
};

imglyKit = (function() {
  imglyKit.classPrefix = "imgly-";

  imglyKit.canvasContainerPadding = 15;

  /*
    @param options.container The container we imglyKit will run in
  */


  function imglyKit(options) {
    var _base, _base1;
    this.options = options != null ? options : {};
    this.onImageLoaded = __bind(this.onImageLoaded, this);
    if ((_base = this.options).debug == null) {
      _base.debug = false;
    }
    if ((_base1 = this.options).assetsPath == null) {
      _base1.assetsPath = "/build/assets";
    }
    if (this.options.container == null) {
      throw new Error("No container given");
    }
    this.options.container = $(this.options.container);
    this.options.container.addClass(imglyKit.classPrefix + "container");
    this.photoProcessor = new PhotoProcessor(this);
    this.ui = new UI(this);
  }

  /*
    @returns {Boolean} Whether Canvas and Canvastext is supported or not
  */


  imglyKit.prototype.checkSupport = function() {
    var error;
    if (Modernizr.canvas && Modernizr.canvastext) {
      return true;
    }
    error = new Error("Canvas and / or Canvas Text drawing not supported");
    error.name = "NoSupportError";
    error.description = "No Canvas support";
    throw error;
  };

  /*
    @returns {jQuery.Object} The jQuery object for the app container
  */


  imglyKit.prototype.getContainer = function() {
    return this.options.container;
  };

  /*
    @returns {Integer} The height of the app container
  */


  imglyKit.prototype.getHeight = function() {
    return this.options.container.height();
  };

  /*
    @returns {imglyKit.PhotoProcessor}
  */


  imglyKit.prototype.getPhotoProcessor = function() {
    return this.photoProcessor;
  };

  /*
    @param {String} file path
    @returns {String} assets file path
  */


  imglyKit.prototype.buildAssetsPath = function(path) {
    return this.options.assetsPath + "/" + path;
  };

  /*
    @param {Image|String} image Data URL or Image object
  */


  imglyKit.prototype.run = function(image) {
    var dataUrl, error,
      _this = this;
    this.image = image;
    this.checkSupport();
    if (this.options.ratio != null) {
      this.options.initialControls = require("4");
      this.options.forceInitialControls = true;
      this.options.operationOptionsHook = function(operation) {
        return operation.setRatio(_this.options.ratio);
      };
    }
    if (!(typeof this.image === "string" || this.image instanceof Image)) {
      throw new Error("First parameter needs to be a String or an Image");
    }
    if (typeof this.image === "string") {
      if (this.image.slice(0, 10) !== "data:image") {
        error = new Error("First parameter is a string, but not an image data URL");
        error.name = "InvalidError";
        throw error;
      }
      dataUrl = this.image;
      this.image = new Image();
      this.image.src = dataUrl;
    }
    if (this.image.width > 0 && this.image.height > 0) {
      return this.onImageLoaded();
    } else {
      return this.image.onload = this.onImageLoaded;
    }
  };

  /*
    Gets called as soon as the image has been loaded
    and the image dimensions are available
  */


  imglyKit.prototype.onImageLoaded = function() {
    /*
      Set up the user interface
    */

    var _this = this;
    if (!this.ui.initialized) {
      this.ui.init();
      this.photoProcessor.setCanvas(this.ui.getCanvas());
      this.ui.on("preview_operation", function(operation) {
        var _ref;
        if ((_ref = _this.ui.getCurrentControls()) != null) {
          _ref.setOperation(operation);
        }
        return _this.photoProcessor.setPreviewOperation(operation);
      });
      this.ui.on("back", function() {
        _this.photoProcessor.unsetPreviewOperation();
        return _this.ui.resetControls();
      });
      this.ui.on("done", function() {
        _this.photoProcessor.acceptPreviewOperation();
        return _this.ui.resetControls();
      });
    } else {
      this.photoProcessor.reset();
      this.ui.resetControls();
    }
    /*
      Reset everything
    */

    this.reset();
    /*
      Set source image of the photo processor and tell
      it to render it
    */

    this.photoProcessor.setSourceImage(this.image);
    return this.photoProcessor.renderPreview(function(err) {
      /*
        Do we have controls that have to be shown
        on startup?
      */

      var controls;
      if (_this.options.initialControls) {
        controls = _this.ui.controls;
        controls.switchToControls(_this.options.initialControls, controls.getCurrentControls(), {
          backButton: !_this.options.forceInitialControls,
          showList: !_this.options.forceInitialControls
        });
        if (_this.options.operationOptionsHook != null) {
          return _this.options.operationOptionsHook(controls.getCurrentControls().operation);
        }
      }
    });
  };

  /*
    Resets everything
  */


  imglyKit.prototype.reset = function() {
    return this.photoProcessor.reset();
  };

  /*
    Renders the image and returns a data url
  */


  imglyKit.prototype.renderToDataURL = function(format, options, callback) {
    var _this = this;
    if (options == null) {
      options = {};
    }
    if (typeof options === "function") {
      callback = options;
      options = {};
    }
    return this.photoProcessor.renderImage(options, function(err, imageData) {
      var canvas;
      canvas = Utils.newCanvasFromImageData(imageData);
      return callback(null, canvas.toDataURL(format));
    });
  };

  return imglyKit;

})();

window.imglyKit = imglyKit;


},{"1":4,"4":7,"2":5,"3":6,"__browserify_Buffer":2,"__browserify_process":1}],6:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="5",__dirname="/";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Utils;

Utils = {};

Utils.sharedCanvas = document.createElement("canvas");

if (Modernizr.canvas) {
  Utils.sharedContext = Utils.sharedCanvas.getContext("2d");
}

/*
  @param options Options
  @param options.image Dimensions (width, height) of the image
  @param options.container Dimensions (width, height) of the container
  @returns {Object} An object containing the final canvas dimensions (width, height)
*/


Utils.calculateCanvasSize = function(options) {
  var result, scale;
  scale = Math.min(options.container.width / options.image.width, options.container.height / options.image.height);
  result = {
    width: options.image.width * scale,
    height: options.image.height * scale
  };
  return result;
};

/*
  Creates a number as a fingerprint for an array of numbers.

  Based on http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery.

  @param {Array} data
  @returns {Number}
*/


Utils.fingerprint = function(data) {
  var hash, point, _i, _len;
  hash = 0;
  if (!data.length) {
    return hash;
  }
  for (_i = 0, _len = data.length; _i < _len; _i++) {
    point = data[_i];
    hash = ((hash << 5) - hash) + point;
    hash |= 0;
  }
  return hash;
};

/*
  @param {Image} image
  @returns {ImageData}
*/


Utils.getImageDataForImage = function(image) {
  var canvas, context;
  canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  context = canvas.getContext("2d");
  context.drawImage(image, 0, 0);
  return context.getImageData(0, 0, image.width, image.height);
};

/*
  @param {Image} image
  @param {CanvasRenderingContext2d} context
*/


Utils.resizeImageSmooth = function(image, context) {
  var destHeight, destImageData, destPixels, destWidth, i, resized, resizedBuffer, resizedBufferLength, sourceImageData, sourcePixels, _i;
  sourceImageData = Utils.getImageDataForImage(image);
  destImageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
  sourcePixels = sourceImageData.data;
  destPixels = destImageData.data;
  destWidth = context.canvas.width;
  destHeight = context.canvas.height;
  resized = new Resize(image.width, image.height, destWidth, destHeight, true, true, false);
  resizedBuffer = resized.resize(sourcePixels);
  resizedBufferLength = resizedBuffer.length;
  for (i = _i = 0; 0 <= resizedBufferLength ? _i < resizedBufferLength : _i > resizedBufferLength; i = 0 <= resizedBufferLength ? ++_i : --_i) {
    destPixels[i] = resizedBuffer[i] & 0xFF;
  }
  return context.putImageData(destImageData, 0, 0);
};

/*
  @param {Image} image
  @param {} dimensions
  @returns {ImageData}
*/


Utils.getResizedImageDataForImage = function(image, dimensions, options) {
  var canvas, context;
  if (options == null) {
    options = {};
  }
  if (options.smooth == null) {
    options.smooth = false;
  }
  canvas = document.createElement("canvas");
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  context = canvas.getContext("2d");
  if (!options.smooth) {
    context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
  } else {
    Utils.resizeImageSmooth(image, context);
  }
  return context.getImageData(0, 0, canvas.width, canvas.height);
};

/*
  @param {ImageData} imageData
  @returns {ImageData}
*/


Utils.cloneImageData = function(imageData) {
  var i, newImageData, _i, _ref;
  newImageData = this.sharedContext.createImageData(imageData.width, imageData.height);
  for (i = _i = 0, _ref = imageData.data.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
    newImageData.data[i] = imageData.data[i];
  }
  return newImageData;
};

/*
  @param {Object} dimensions
  @param {Integer} dimensions.width
  @param {Integer} dimensions.height
  @returns {HTMLCanvasElement}
*/


Utils.newCanvasWithDimensions = function(dimensions) {
  var canvas;
  canvas = document.createElement("canvas");
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  return canvas;
};

/*
  @param {imageData} imageData
  @returns {HTMLCanvasElement}
*/


Utils.newCanvasFromImageData = function(imageData) {
  var canvas, context;
  canvas = document.createElement("canvas");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  context = canvas.getContext("2d");
  context.putImageData(imageData, 0, 0);
  return canvas;
};

/*
  @param {String} str Input String
  @returns {String} Output Stirng
*/


Utils.dasherize = function(str) {
  return str.toLowerCase().replace(/[^\w\s-]/g, ' ').replace(/[-_\s]+/g, '-');
};

/*
  @param {Integer} number
  @param {Integer} min
  @param {Integer} max
  @returns {Integer}
*/


Utils.clamp = function(number, min, max) {
  return Math.min(Math.max(number, min), max);
};

/*
  @param {Integer} number
  @param {Integer} min
  @param {Integer} max
  @returns {Integer}
*/


Utils.within = function(number, min, max) {
  return (min < number && number < max);
};

/*
  @param {Object} x/y coordinates
  @param [Object] minimum and maximum x/y coordinates
  @returns {Boolean}
*/


Utils.withinBoundaries = function(coords, boundaries) {
  if (boundaries == null) {
    boundaries = {
      x: {
        min: 0,
        max: 1
      },
      y: {
        min: 0,
        max: 1
      }
    };
  }
  return !(coords.x < boundaries.x.min || coords.x > boundaries.x.max || coords.y < boundaries.y.min || coords.y > boundaries.y.max);
};

/*
  @param {String} string
  @returns {String}
*/


Utils.truncate = function(string, length) {
  if (length == null) {
    length = 10;
  }
  if (string.length > length) {
    return string.substr(0, length - 3) + "...";
  } else {
    return string;
  }
};

module.exports = Utils;


},{"__browserify_Buffer":2,"__browserify_process":1}],4:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="6",__dirname="/";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var IdentityFilter, Perf, PhotoProcessor, Queue, Utils;

Perf = require("7");

Queue = require("8");

Utils = require("3");

IdentityFilter = require("9");

PhotoProcessor = (function() {
  /*
    @param {imglyUtil} app
  */

  function PhotoProcessor(app) {
    this.app = app;
    this.canvas = null;
    this.operationChain = new IdentityFilter;
    this.operationChainNeedsRender = true;
    this.cachedPreviewImageData = null;
    this.previewOperation = null;
    this.rendering = false;
  }

  PhotoProcessor.prototype.setCanvas = function(canvas) {
    this.canvas = canvas;
  };

  PhotoProcessor.prototype.setSourceImage = function(sourceImage) {
    this.sourceImage = sourceImage;
  };

  /*
    @params {imglyKit.Operations.Operation} operation
  */


  PhotoProcessor.prototype.setPreviewOperation = function(operation) {
    operation.setContext(this.canvas.getContext());
    this.previewOperation = operation;
    if (!operation.renderPreview) {
      return;
    }
    return this.renderPreview();
  };

  PhotoProcessor.prototype.unsetPreviewOperation = function() {
    this.previewOperation = null;
    return this.renderPreview();
  };

  PhotoProcessor.prototype.acceptPreviewOperation = function() {
    if (!this.previewOperation) {
      return;
    }
    this.operationChainNeedsRender = true;
    this.operationChain = this.operationChain.compose(this.previewOperation);
    this.previewOperation = null;
    return this.renderPreview();
  };

  /*
    Render the full size final image
  */


  PhotoProcessor.prototype.renderImage = function(options, callback) {
    var dimensions, height, imageData, p, scale, width, _ref, _ref1;
    p = new Perf("imglyPhotoProcessor#renderFullImage()", {
      debug: this.app.options.debug
    });
    p.start();
    if (!(options.maxSize || options.size)) {
      dimensions = {
        width: this.sourceImage.width,
        height: this.sourceImage.height
      };
      imageData = Utils.getImageDataForImage(this.sourceImage);
    } else if (options.maxSize) {
      _ref = options.maxSize.split("x"), width = _ref[0], height = _ref[1];
      options = {
        image: {
          width: this.sourceImage.width,
          height: this.sourceImage.height
        },
        container: {
          width: width - imglyKit.canvasContainerPadding * 2,
          height: height - imglyKit.canvasContainerPadding * 2
        }
      };
      dimensions = Utils.calculateCanvasSize(options);
      imageData = Utils.getResizedImageDataForImage(this.sourceImage, dimensions, {
        smooth: true
      });
    } else if (options.size) {
      _ref1 = options.size.split("x"), width = _ref1[0], height = _ref1[1];
      if (width && !height) {
        scale = this.sourceImage.height / this.sourceImage.width;
        height = width * scale;
      } else if (height && !width) {
        scale = this.sourceImage.width / this.sourceImage.height;
        width = height * scale;
      }
      dimensions = {
        width: parseInt(width),
        height: parseInt(height)
      };
      imageData = Utils.getResizedImageDataForImage(this.sourceImage, dimensions, {
        smooth: true
      });
    }
    return this.render(imageData, {
      preview: false
    }, callback);
  };

  /*
    Renders a preview
  */


  PhotoProcessor.prototype.renderPreview = function(callback) {
    return this.render(null, {
      preview: true
    }, callback);
  };

  /*
    Render preview or image
  */


  PhotoProcessor.prototype.render = function(imageData, options, callback) {
    /*
      Make sure we are not rendering multiple previews at a time
    */

    var p,
      _this = this;
    if (this.rendering) {
      return;
    }
    this.rendering = true;
    p = new Perf("imglyPhotoProcessor#render({ preview: " + options.preview + " })", {
      debug: this.app.options.debug
    });
    p.start();
    imageData = options.preview ? this.renderOperationChainPreview(imageData) : this.operationChain.apply(imageData);
    return Queue(imageData).then(function(imageData) {
      if (options.preview && _this.operationChainNeedsRender) {
        _this.cachedPreviewImageData = imageData;
        _this.operationChainNeedsRender = false;
      }
      if (_this.previewOperation && options.preview) {
        return _this.previewOperation.apply(imageData);
      } else {
        return imageData;
      }
    }).then(function(imageData) {
      if (options.preview) {
        _this.canvas.renderImageData(imageData);
      }
      if (typeof callback === "function") {
        callback(null, imageData);
      }
      _this.rendering = false;
      p.stop(true);
      return imageData;
    });
  };

  PhotoProcessor.prototype.renderOperationChainPreview = function(imageData) {
    var dimensions, imageDimensions;
    if (!this.operationChainNeedsRender) {
      return Utils.cloneImageData(this.cachedPreviewImageData);
    } else {
      dimensions = this.canvas.getDimensionsForImage(this.sourceImage);
      if (this.resizedPreviewImageData == null) {
        imageDimensions = {
          width: dimensions.width * (window.devicePixelRatio || 1),
          height: dimensions.height * (window.devicePixelRatio || 1)
        };
        this.resizedPreviewImageData = imageData = Utils.getResizedImageDataForImage(this.sourceImage, imageDimensions, {
          smooth: true
        });
      } else {
        imageData = Utils.cloneImageData(this.resizedPreviewImageData);
      }
      return this.operationChain.apply(imageData);
    }
  };

  /*
    Resets all UI elements
  */


  PhotoProcessor.prototype.reset = function() {
    this.operationChain = new IdentityFilter;
    this.previewOperation = null;
    this.rendering = false;
    this.operationChainNeedsRender = true;
    return this.resizedPreviewImageData = null;
  };

  return PhotoProcessor;

})();

module.exports = PhotoProcessor;


},{"9":10,"3":6,"7":8,"8":9,"__browserify_Buffer":2,"__browserify_process":1}],5:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="10",__dirname="/ui";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Canvas, Controls, EventEmitter, UI,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Controls = require("11");

Canvas = require("12");

EventEmitter = require("events").EventEmitter;

UI = (function(_super) {
  __extends(UI, _super);

  /*
    @param {imglyUtil} app
  */


  function UI(app) {
    this.app = app;
    this.initialized = false;
  }

  /*
    @returns {imglyKit.UI.Canvas}
  */


  UI.prototype.getCanvas = function() {
    return this.canvas;
  };

  /*
    @returns imglyKit.UI.Controls.Base
  */


  UI.prototype.getCurrentControls = function() {
    return this.controls.getCurrentControls();
  };

  /*
    Initializes all UI elements
  */


  UI.prototype.init = function() {
    var _this = this;
    this.controls = new Controls(this.app, this);
    this.controls.on("preview_operation", function(operation) {
      return _this.emit("preview_operation", operation);
    });
    this.controls.on("back", function() {
      return _this.emit("back");
    });
    this.controls.on("done", function() {
      return _this.emit("done");
    });
    this.canvas = new Canvas(this.app, this, {
      height: this.controls.getHeight()
    });
    return this.initialized = true;
  };

  /*
    Resets the controls
  */


  UI.prototype.resetControls = function() {
    return this.controls.reset();
  };

  return UI;

})(EventEmitter);

module.exports = UI;


},{"12":13,"11":12,"__browserify_Buffer":2,"__browserify_process":1,"events":11}],7:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="13",__dirname="/ui/controls";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var List, Rect, UIControlsCrop, Vector2,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

List = require("14");

Vector2 = require("15");

Rect = require("16");

UIControlsCrop = (function(_super) {
  __extends(UIControlsCrop, _super);

  UIControlsCrop.prototype.displayButtons = true;

  UIControlsCrop.prototype.minimumCropSize = 50;

  UIControlsCrop.prototype.singleOperation = true;

  /*
    @param {imglyKit} app
    @param {imglyKit.UI} ui
    @param {imglyKit.UI.Controls} controls
  */


  function UIControlsCrop(app, ui, controls) {
    this.app = app;
    this.ui = ui;
    this.controls = controls;
    UIControlsCrop.__super__.constructor.apply(this, arguments);
    this.operationClass = require("17");
    this.listItems = [
      {
        name: "Custom",
        cssClass: "custom",
        method: "setSize",
        "arguments": ["free"],
        "default": true,
        options: {
          size: "free"
        }
      }, {
        name: "Square",
        cssClass: "square",
        method: "setSize",
        "arguments": ["square"],
        options: {
          size: "square"
        }
      }, {
        name: "4:3",
        cssClass: "4-3",
        method: "setSize",
        "arguments": ["4:3"],
        options: {
          size: "4:3"
        }
      }, {
        name: "16:9",
        cssClass: "16-9",
        method: "setSize",
        "arguments": ["16:9"],
        options: {
          size: "16:9"
        }
      }
    ];
  }

  UIControlsCrop.prototype.updateOptions = function(operationOptions) {
    this.operationOptions = operationOptions;
    return this.resizeCanvasControls();
  };

  /*
    @param {jQuery.Object} canvasControlsContainer
  */


  UIControlsCrop.prototype.hasCanvasControls = true;

  UIControlsCrop.prototype.setupCanvasControls = function(canvasControlsContainer) {
    var div, position, _i, _j, _len, _len1, _ref, _ref1;
    this.canvasControlsContainer = canvasControlsContainer;
    /*
      Create the dark parts around the cropped area
    */

    this.spotlightDivs = {};
    _ref = ["tl", "tc", "tr", "lc", "rc", "bl", "bc", "br"];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      position = _ref[_i];
      div = $("<div>").addClass(imglyKit.classPrefix + "canvas-cropping-spotlight").addClass(imglyKit.classPrefix + "canvas-cropping-spotlight-" + position).appendTo(this.canvasControlsContainer);
      this.spotlightDivs[position] = div;
    }
    /*
      Create the center div (cropped area)
    */

    this.centerDiv = $("<div>").addClass(imglyKit.classPrefix + "canvas-cropping-center").appendTo(this.canvasControlsContainer);
    /*
      Create the knobs the user can use to resize the cropped area
    */

    this.knobs = {};
    _ref1 = ["tl", "tr", "bl", "br"];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      position = _ref1[_j];
      div = $("<div>").addClass(imglyKit.classPrefix + "canvas-knob").appendTo(this.canvasControlsContainer);
      this.knobs[position] = div;
    }
    this.handleCenterDragging();
    this.handleTopLeftKnob();
    this.handleBottomRightKnob();
    this.handleBottomLeftKnob();
    return this.handleTopRightKnob();
  };

  /*
    Handles the dragging of the upper right knob
  */


  UIControlsCrop.prototype.handleTopRightKnob = function() {
    var knob,
      _this = this;
    knob = this.knobs.tr;
    return knob.mousedown(function(e) {
      var canvasRect, initialEnd, initialMousePosition, initialStart, ratio;
      canvasRect = new Rect(0, 0, _this.canvasControlsContainer.width(), _this.canvasControlsContainer.height());
      initialMousePosition = new Vector2(e.clientX, e.clientY);
      initialStart = _this.operationOptions.start.clone();
      initialEnd = _this.operationOptions.end.clone();
      ratio = _this.operationOptions.ratio;
      $(document).mouseup(function(e) {
        $(document).off("mouseup");
        return $(document).off("mousemove");
      });
      return $(document).mousemove(function(e) {
        var diffMousePosition, endInPixels, heightInPixels, startInPixels, widthInPixels;
        diffMousePosition = new Vector2(e.clientX, e.clientY).substract(initialMousePosition);
        endInPixels = new Vector2().copy(initialEnd).multiplyWithRect(canvasRect);
        startInPixels = new Vector2().copy(initialStart).multiplyWithRect(canvasRect);
        if (_this.operationOptions.ratio === 0) {
          _this.operationOptions.start.copy(startInPixels);
          _this.operationOptions.start.y += diffMousePosition.y;
          _this.operationOptions.start.clamp(new Vector2(startInPixels.x, 1), new Vector2(startInPixels.x, endInPixels.y - 50)).divideByRect(canvasRect);
          _this.operationOptions.end.copy(endInPixels);
          _this.operationOptions.end.x += diffMousePosition.x;
          _this.operationOptions.end.clamp(new Vector2(startInPixels.x + 50, endInPixels.y), new Vector2(canvasRect.width - 1, endInPixels.y)).divideByRect(canvasRect);
        } else {
          endInPixels.x += (diffMousePosition.x - diffMousePosition.y) / 2;
          endInPixels.clamp(startInPixels.x + 50, canvasRect.width - 1);
          widthInPixels = endInPixels.x - startInPixels.x;
          heightInPixels = widthInPixels / _this.operationOptions.ratio;
          if (endInPixels.y - heightInPixels < 1) {
            heightInPixels = _this.operationOptions.end.y * canvasRect.height - 1;
            widthInPixels = heightInPixels * _this.operationOptions.ratio;
          }
          _this.operationOptions.end.x = (startInPixels.x + widthInPixels) / canvasRect.width;
          _this.operationOptions.start.y = (endInPixels.y - heightInPixels) / canvasRect.height;
        }
        return _this.resizeCanvasControls();
      });
    });
  };

  /*
    Handles the dragging of the lower left knob
  */


  UIControlsCrop.prototype.handleBottomLeftKnob = function() {
    var knob,
      _this = this;
    knob = this.knobs.bl;
    return knob.mousedown(function(e) {
      var canvasRect, initialEnd, initialMousePosition, initialStart, ratio;
      canvasRect = new Rect(0, 0, _this.canvasControlsContainer.width(), _this.canvasControlsContainer.height());
      initialMousePosition = new Vector2(e.clientX, e.clientY);
      initialStart = _this.operationOptions.start.clone();
      initialEnd = _this.operationOptions.end.clone();
      ratio = _this.operationOptions.ratio;
      $(document).mouseup(function(e) {
        $(document).off("mouseup");
        return $(document).off("mousemove");
      });
      return $(document).mousemove(function(e) {
        var diffMousePosition, endInPixels, heightInPixels, startInPixels, widthInPixels;
        diffMousePosition = new Vector2(e.clientX, e.clientY).substract(initialMousePosition);
        endInPixels = new Vector2().copy(initialEnd).multiplyWithRect(canvasRect);
        startInPixels = new Vector2().copy(initialStart).multiplyWithRect(canvasRect);
        if (_this.operationOptions.ratio === 0) {
          _this.operationOptions.end.copy(endInPixels);
          _this.operationOptions.end.y += diffMousePosition.y;
          _this.operationOptions.end.clamp(new Vector2(endInPixels.x, startInPixels.y + 50), new Vector2(endInPixels.x, canvasRect.height - 1)).divideByRect(canvasRect);
          _this.operationOptions.start.copy(startInPixels);
          _this.operationOptions.start.x += diffMousePosition.x;
          _this.operationOptions.start.clamp(new Vector2(1, 1), new Vector2(endInPixels.x - 50, endInPixels.y - 50)).divideByRect(canvasRect);
        } else {
          startInPixels.x += (diffMousePosition.x - diffMousePosition.y) / 2;
          startInPixels.clamp(1, endInPixels.x - 50);
          widthInPixels = endInPixels.x - startInPixels.x;
          heightInPixels = widthInPixels / _this.operationOptions.ratio;
          if (startInPixels.y + heightInPixels > canvasRect.height - 1) {
            heightInPixels = (1 - _this.operationOptions.start.y) * canvasRect.height - 1;
            widthInPixels = heightInPixels * _this.operationOptions.ratio;
          }
          _this.operationOptions.start.x = (endInPixels.x - widthInPixels) / canvasRect.width;
          _this.operationOptions.end.y = (startInPixels.y + heightInPixels) / canvasRect.height;
        }
        return _this.resizeCanvasControls();
      });
    });
  };

  /*
    Handles the dragging of the lower right knob
  */


  UIControlsCrop.prototype.handleBottomRightKnob = function() {
    var knob,
      _this = this;
    knob = this.knobs.br;
    return knob.mousedown(function(e) {
      var canvasRect, initialEnd, initialMousePosition, ratio;
      canvasRect = new Rect(0, 0, _this.canvasControlsContainer.width(), _this.canvasControlsContainer.height());
      initialMousePosition = new Vector2(e.clientX, e.clientY);
      initialEnd = new Vector2().copy(_this.operationOptions.end);
      ratio = _this.operationOptions.ratio;
      $(document).mouseup(function(e) {
        $(document).off("mouseup");
        return $(document).off("mousemove");
      });
      return $(document).mousemove(function(e) {
        var diffMousePosition, endInPixels, heightInPixels, startInPixels, widthInPixels;
        diffMousePosition = new Vector2(e.clientX, e.clientY).substract(initialMousePosition);
        endInPixels = new Vector2().copy(initialEnd).multiplyWithRect(canvasRect);
        startInPixels = new Vector2().copy(_this.operationOptions.start).multiplyWithRect(canvasRect);
        if (_this.operationOptions.ratio === 0) {
          _this.operationOptions.end.copy(endInPixels).add(diffMousePosition).clamp(new Vector2(startInPixels.x + 50, startInPixels.y + 50), new Vector2(canvasRect.width - 1, canvasRect.height - 1)).divideByRect(canvasRect);
        } else {
          endInPixels.x += (diffMousePosition.x + diffMousePosition.y) / 2;
          endInPixels.clamp(startInPixels.x + 50, canvasRect.width - 1);
          widthInPixels = endInPixels.x - startInPixels.x;
          heightInPixels = widthInPixels / _this.operationOptions.ratio;
          if (startInPixels.y + heightInPixels > canvasRect.height - 1) {
            heightInPixels = (1 - _this.operationOptions.start.y) * canvasRect.height - 1;
            widthInPixels = heightInPixels * _this.operationOptions.ratio;
          }
          _this.operationOptions.end.copy(_this.operationOptions.start).multiplyWithRect(canvasRect).add(new Vector2(widthInPixels, heightInPixels)).divideByRect(canvasRect);
        }
        return _this.resizeCanvasControls();
      });
    });
  };

  /*
    Handles the dragging of the upper left knob
  */


  UIControlsCrop.prototype.handleTopLeftKnob = function() {
    var knob,
      _this = this;
    knob = this.knobs.tl;
    return knob.mousedown(function(e) {
      var canvasRect, initialMousePosition, initialStart, ratio;
      canvasRect = new Rect(0, 0, _this.canvasControlsContainer.width(), _this.canvasControlsContainer.height());
      initialMousePosition = new Vector2(e.clientX, e.clientY);
      initialStart = new Vector2().copy(_this.operationOptions.start);
      ratio = _this.operationOptions.ratio;
      $(document).mouseup(function(e) {
        $(document).off("mouseup");
        return $(document).off("mousemove");
      });
      return $(document).mousemove(function(e) {
        var diffMousePosition, endInPixels, heightInPixels, startInPixels, widthInPixels;
        diffMousePosition = new Vector2(e.clientX, e.clientY).substract(initialMousePosition);
        if (_this.operationOptions.ratio === 0) {
          _this.operationOptions.start.copy(initialStart).multiplyWithRect(canvasRect).add(diffMousePosition).divideByRect(canvasRect);
        } else {
          endInPixels = new Vector2().copy(_this.operationOptions.end).multiplyWithRect(canvasRect);
          startInPixels = new Vector2().copy(initialStart).multiplyWithRect(canvasRect);
          startInPixels.x += (diffMousePosition.x + diffMousePosition.y) / 2;
          startInPixels.clamp(1, endInPixels.x - 50);
          widthInPixels = endInPixels.x - startInPixels.x;
          heightInPixels = widthInPixels / _this.operationOptions.ratio;
          if (endInPixels.y - heightInPixels < 1) {
            heightInPixels = _this.operationOptions.end.y * canvasRect.height - 1;
            widthInPixels = heightInPixels * _this.operationOptions.ratio;
          }
          _this.operationOptions.start.copy(_this.operationOptions.end).multiplyWithRect(canvasRect).substract(new Vector2(widthInPixels, heightInPixels)).divideByRect(canvasRect);
        }
        return _this.resizeCanvasControls();
      });
    });
  };

  /*
    Handles the dragging of the visible, cropped part
  */


  UIControlsCrop.prototype.handleCenterDragging = function() {
    var _this = this;
    return this.centerDiv.mousedown(function(e) {
      var canvasRect, centerRect, initialEnd, initialMousePosition, initialStart, max, min;
      canvasRect = new Rect(0, 0, _this.canvasControlsContainer.width(), _this.canvasControlsContainer.height());
      min = new Vector2(1, 1);
      max = new Vector2(canvasRect.width - _this.centerDiv.width() - 1, canvasRect.height - _this.centerDiv.height() - 1);
      initialMousePosition = new Vector2(e.clientX, e.clientY);
      initialStart = new Vector2().copy(_this.operationOptions.start);
      initialEnd = new Vector2().copy(_this.operationOptions.end);
      centerRect = new Rect(0, 0, _this.centerDiv.width(), _this.centerDiv.height());
      $(document).mouseup(function(e) {
        $(document).off("mouseup");
        return $(document).off("mousemove");
      });
      return $(document).mousemove(function(e) {
        var currentMousePosition, diffMousePosition;
        currentMousePosition = new Vector2(e.clientX, e.clientY);
        diffMousePosition = new Vector2().copy(currentMousePosition).substract(initialMousePosition);
        _this.operationOptions.start.copy(initialStart).multiplyWithRect(canvasRect).add(diffMousePosition).clamp(min, max).divideByRect(canvasRect);
        _this.operationOptions.end.copy(_this.operationOptions.start).multiplyWithRect(canvasRect).addRect(centerRect).divideByRect(canvasRect);
        return _this.resizeCanvasControls();
      });
    });
  };

  UIControlsCrop.prototype.updateOperationOptions = function() {
    var canvasHeight, canvasWidth;
    canvasWidth = this.canvasControlsContainer.width();
    canvasHeight = this.canvasControlsContainer.height();
    this.operation.setStart(this.operationOptions.start.x / canvasWidth, this.operationOptions.start.y / canvasHeight);
    return this.operation.setEnd(this.operationOptions.end.x / canvasWidth, this.operationOptions.end.y / canvasHeight);
  };

  UIControlsCrop.prototype.resizeCanvasControls = function() {
    var $el, bottomHeight, canvasRect, centerHeight, centerWidth, el, leftWidth, rightWidth, scaledEnd, scaledStart, topHeight, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
    canvasRect = new Rect(0, 0, this.canvasControlsContainer.width(), this.canvasControlsContainer.height());
    scaledStart = new Vector2().copy(this.operationOptions.start).multiplyWithRect(canvasRect);
    scaledEnd = new Vector2().copy(this.operationOptions.end).multiplyWithRect(canvasRect);
    /*
      Set fragment widths
    */

    leftWidth = scaledStart.x;
    _ref = ["tl", "lc", "bl"];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      el = _ref[_i];
      $el = this.spotlightDivs[el];
      $el.css({
        width: leftWidth,
        left: 0
      });
      if (this.knobs[el] != null) {
        this.knobs[el].css({
          left: leftWidth
        });
      }
    }
    centerWidth = scaledEnd.x - scaledStart.x;
    _ref1 = ["tc", "bc"];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      el = _ref1[_j];
      $el = this.spotlightDivs[el];
      $el.css({
        width: centerWidth,
        left: leftWidth
      });
    }
    rightWidth = canvasRect.width - centerWidth - leftWidth;
    _ref2 = ["tr", "rc", "br"];
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
      el = _ref2[_k];
      $el = this.spotlightDivs[el];
      $el.css({
        width: rightWidth,
        left: leftWidth + centerWidth
      });
      if (this.knobs[el] != null) {
        this.knobs[el].css({
          left: leftWidth + centerWidth
        });
      }
    }
    /*
      Set fragment heights
    */

    topHeight = scaledStart.y;
    _ref3 = ["tl", "tc", "tr"];
    for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
      el = _ref3[_l];
      $el = this.spotlightDivs[el];
      $el.css({
        height: topHeight,
        top: 0
      });
      if (this.knobs[el] != null) {
        this.knobs[el].css({
          top: topHeight
        });
      }
    }
    centerHeight = scaledEnd.y - scaledStart.y;
    _ref4 = ["lc", "rc"];
    for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
      el = _ref4[_m];
      $el = this.spotlightDivs[el];
      $el.css({
        height: centerHeight,
        top: topHeight
      });
    }
    bottomHeight = canvasRect.height - topHeight - centerHeight;
    _ref5 = ["bl", "bc", "br"];
    for (_n = 0, _len5 = _ref5.length; _n < _len5; _n++) {
      el = _ref5[_n];
      $el = this.spotlightDivs[el];
      $el.css({
        height: bottomHeight,
        top: topHeight + centerHeight
      });
      if (this.knobs[el] != null) {
        this.knobs[el].css({
          top: topHeight + centerHeight
        });
      }
    }
    /*
      Set center fragment dimensions and position
    */

    return this.centerDiv.css({
      height: centerHeight,
      width: centerWidth,
      left: leftWidth,
      top: topHeight
    });
  };

  return UIControlsCrop;

})(List);

module.exports = UIControlsCrop;


},{"16":16,"15":15,"17":17,"14":14,"__browserify_Buffer":2,"__browserify_process":1}],8:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="18",__dirname="/vendor";var Perf;

Perf = (function() {
  function Perf(name, options) {
    var _base, _base1, _base2;
    this.name = name;
    this.options = options != null ? options : {};
    if ((_base = this.options).good == null) {
      _base.good = 100;
    }
    if ((_base1 = this.options).bad == null) {
      _base1.bad = 500;
    }
    if ((_base2 = this.options).debug == null) {
      _base2.debug = true;
    }
    this.started = false;
  }

  Perf.prototype.start = function() {
    if (this.started || !this.options.debug) {
      return;
    }
    this.start = +new Date();
    return this.started = true;
  };

  Perf.prototype.stop = function(printLine) {
    var background, color, duration, end, message;
    if (!this.started || !this.options.debug) {
      return;
    }
    end = +new Date();
    duration = end - this.start;
    if (this.name != null) {
      message = this.name + ' took';
    } else {
      message = 'Code execution time:';
    }
    if (typeof window !== "undefined" && window !== null) {
      if (duration < this.options.good) {
        background = 'darkgreen';
        color = 'white';
      } else if (duration > this.options.good && duration < this.options.bad) {
        background = 'orange';
        color = 'black';
      } else {
        background = 'darkred';
        color = 'white';
      }
      console.log('%c perf %c ' + message + ' %c ' + duration.toFixed(2) + 'ms ', 'background: #222; color: #bada55', '', 'background: ' + background + '; color: ' + color);
    } else {
      console.log('[perf] ' + message + ' ' + duration.toFixed(2) + 'ms');
    }
    this.started = false;
    if (printLine && (typeof window !== "undefined" && window !== null)) {
      return console.log('%c perf %c -- END --                                                                          ', 'background: #222; color: #bada55', 'background: #222; color: #ffffff');
    }
  };

  return Perf;

})();

module.exports = Perf;


},{"__browserify_Buffer":2,"__browserify_process":1}],9:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="19",__dirname="/vendor";/*
  Common interface for promises.

  Use jQuery's Deferreds when in browser environment,
  otherwise assume node environment and load kriskowal's q.
*/

var Queue, provider;

provider = typeof window !== "undefined" ? window.jQuery : require("q");

/*
  Creates a thenable value from the given value.

  @param value
  @returns {Promise}
*/


Queue = function() {
  return provider.when.apply(provider, arguments);
};

/*
  Creates a new promise.

  Calls the resolver which takes as arguments three functions `resolve`,
  `reject` and `progress`.

  @param {function} resolver
  @returns {Promise}
*/


Queue.promise = (function() {
  if (typeof window !== "undefined") {
    return function(resolver) {
      var d;
      d = provider.Deferred();
      resolver(d.resolve, d.reject, d.progress);
      return d;
    };
  } else {
    return function() {
      return provider.promise.apply(provider, arguments);
    };
  }
})();

module.exports = Queue;


},{"__browserify_Buffer":2,"__browserify_process":1,"q":18}],11:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/../node_modules/grunt-watchify/node_modules/browserify/node_modules/browser-builtins/builtin/events.js",__dirname="/../node_modules/grunt-watchify/node_modules/browserify/node_modules/browser-builtins/builtin";if (!process.EventEmitter) process.EventEmitter = function () {};

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = typeof Array.isArray === 'function'
    ? Array.isArray
    : function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]'
    }
;
function indexOf (xs, x) {
    if (xs.indexOf) return xs.indexOf(x);
    for (var i = 0; i < xs.length; i++) {
        if (x === xs[i]) return i;
    }
    return -1;
}

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  self.on(type, function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  });

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var i = indexOf(list, listener);
    if (i < 0) return this;
    list.splice(i, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (this._events[type] === listener) {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  if (arguments.length === 0) {
    this._events = {};
    return this;
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (typeof emitter._events[type] === 'function')
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

},{"__browserify_Buffer":2,"__browserify_process":1}],15:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="20",__dirname="/math";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Vector2;

Vector2 = (function() {
  function Vector2(x, y) {
    this.x = x;
    this.y = y;
    if (this.x == null) {
      this.x = 0;
    }
    if (this.y == null) {
      this.y = 0;
    }
  }

  /*
    @param {Integer} x
    @param {Integer} y
  */


  Vector2.prototype.set = function(x, y) {
    this.x = x;
    this.y = y;
  };

  /*
    @returns {Vector2} A clone of this vector
  */


  Vector2.prototype.clone = function() {
    return new Vector2(this.x, this.y);
  };

  /*
    @param {imglyKit.Vector2} The vector we want to copy
  */


  Vector2.prototype.copy = function(other) {
    this.x = other.x;
    this.y = other.y;
    return this;
  };

  /*
    @param {Integer|Vector2} Minimum value
    @param {Integer|Vector2} Maximum value
  */


  Vector2.prototype.clamp = function(minimum, maximum) {
    if (!(minimum instanceof Vector2)) {
      minimum = new Vector2(minimum, minimum);
    }
    if (!(maximum instanceof Vector2)) {
      maximum = new Vector2(maximum, maximum);
    }
    this.x = Math.max(minimum.x, Math.min(maximum.x, this.x));
    this.y = Math.max(minimum.y, Math.min(maximum.y, this.y));
    return this;
  };

  /*
    @param {Object|Rect} The object to multiply with. Must have `width` and `height`
  */


  Vector2.prototype.multiplyWithRect = function(multiplier) {
    this.x *= multiplier.width;
    this.y *= multiplier.height;
    return this;
  };

  /*
    @param {Integer|Vector2}
  */


  Vector2.prototype.divide = function(divisor) {
    if (divisor instanceof Vector2) {
      this.x /= divisor.x;
      this.y /= divisor.y;
    } else {
      this.x /= divisor;
      this.y /= divisor;
    }
    return this;
  };

  /*
    @param {Object|Rect} The object to multiply with. Must have `width` and `height`
  */


  Vector2.prototype.divideByRect = function(divisor) {
    this.x /= divisor.width;
    this.y /= divisor.height;
    return this;
  };

  /*
    @param {Integer|Vector2}
  */


  Vector2.prototype.substract = function(subtrahend) {
    if (subtrahend instanceof Vector2) {
      this.x -= subtrahend.x;
      this.y -= subtrahend.y;
    } else {
      this.x -= subtrahend;
      this.y -= subtrahend;
    }
    return this;
  };

  /*
    @param {Rect} The object to substract
  */


  Vector2.prototype.substractRect = function(subtrahend) {
    this.x -= subtrahend.width;
    this.y -= subtrahend.height;
    return this;
  };

  /*
    @param {Rect} The object to add
  */


  Vector2.prototype.addRect = function(addend) {
    this.x += addend.width;
    this.y += addend.height;
    return this;
  };

  /*
    @param {Integer|Vector2}
  */


  Vector2.prototype.add = function(addend) {
    if (addend instanceof Vector2) {
      this.x += addend.x;
      this.y += addend.y;
    } else {
      this.x += addend;
      this.y += addend;
    }
    return this;
  };

  Vector2.prototype.toString = function() {
    return "Vector2({ x: " + this.x + ", y: " + this.y + " })";
  };

  return Vector2;

})();

module.exports = Vector2;


},{"__browserify_Buffer":2,"__browserify_process":1}],16:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="21",__dirname="/math";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Rect;

Rect = (function() {
  function Rect(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    if (this.x == null) {
      this.x = 0;
    }
    if (this.y == null) {
      this.y = 0;
    }
    if (this.width == null) {
      this.width = 0;
    }
    if (this.height == null) {
      this.height = 0;
    }
  }

  /*
    @param {Integer} x
    @param {Integer} y
    @param {Integer} width
    @param {Integer} height
  */


  Rect.prototype.set = function(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  };

  /*
    @param {Integer} x
    @param {Integer} y
  */


  Rect.prototype.setPosition = function(x, y) {
    this.x = x;
    this.y = y;
  };

  /*
    @param {Integer} width
    @param {Integer} height
  */


  Rect.prototype.setDimensions = function(width, height) {
    this.width = width;
    this.height = height;
  };

  /*
    @param {imglyKit.Rect} The vector we want to copy
  */


  Rect.prototype.copy = function(other) {
    this.x = other.x;
    this.y = other.y;
    this.width = other.width;
    this.height = other.height;
    return this;
  };

  Rect.prototype.toString = function() {
    return "Rect({ x: " + this.x + ", y: " + this.y + ", width: " + this.width + ", height: " + this.height + " })";
  };

  return Rect;

})();

module.exports = Rect;


},{"__browserify_Buffer":2,"__browserify_process":1}],18:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="/../node_modules/grunt-watchify/node_modules/browserify/_empty.js",__dirname="/../node_modules/grunt-watchify/node_modules/browserify";
},{"__browserify_Buffer":2,"__browserify_process":1}],12:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="22",__dirname="/ui";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var EventEmitter, Overview, UIControls,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Overview = require("23");

EventEmitter = require("events").EventEmitter;

UIControls = (function(_super) {
  __extends(UIControls, _super);

  /*
    @param {imglyUtil} app
    @param {imglyUtil.UI} ui
  */


  function UIControls(app, ui) {
    this.app = app;
    this.ui = ui;
    this.container = this.app.getContainer();
    this.init();
  }

  /*
    @returns {Integer} Height of the controls container
  */


  UIControls.prototype.getHeight = function() {
    return this.controlsContainer.height();
  };

  /*
    @returns {jQuery.Object} The controls container
  */


  UIControls.prototype.getContainer = function() {
    return this.controlsContainer;
  };

  /*
    @returns {imglyKit.UI.Controls.Base}
  */


  UIControls.prototype.getCurrentControls = function() {
    return this.currentControls;
  };

  /*
    Initializes the container
  */


  UIControls.prototype.init = function() {
    this.controlsContainer = $("<div>").addClass(imglyKit.classPrefix + "controls-container").appendTo(this.container);
    return this.initOverview();
  };

  /*
    Initialize the overview
  */


  UIControls.prototype.initOverview = function() {
    this.currentControls = this.overview = new Overview(this.app, this.ui, this);
    this.attachEvents(this.currentControls);
    this.overview.init();
    if (this.app.options.initialControls == null) {
      return this.overview.show();
    }
  };

  /*
    Attach select events
  */


  UIControls.prototype.attachEvents = function(controls) {
    var _this = this;
    controls.on("select", function(option) {
      if (option.controls != null) {
        _this.switchToControls(option.controls, controls);
      }
      if (option.operation != null) {
        return _this.emit("preview_operation", new option.operation(_this.app, option.options));
      }
    });
    controls.on("back", function() {
      return _this.emit("back");
    });
    controls.on("done", function() {
      return _this.emit("done");
    });
    return controls.on("renderPreview", function() {
      return _this.app.getPhotoProcessor().renderPreview();
    });
  };

  /*
    Switch to another controls instance
  */


  UIControls.prototype.switchToControls = function(controlsClass, oldControls, options) {
    var canvasControlsContainer, key, value,
      _this = this;
    if (options == null) {
      options = {};
    }
    this.currentControls = new controlsClass(this.app, this.ui, this);
    for (key in options) {
      value = options[key];
      this.currentControls.options[key] = value;
    }
    this.attachEvents(this.currentControls);
    if (this.currentControls.hasCanvasControls) {
      canvasControlsContainer = this.ui.getCanvas().getControlsContainer();
      this.currentControls.setupCanvasControls(canvasControlsContainer);
      canvasControlsContainer.fadeIn("slow");
    }
    this.currentControls.init();
    return oldControls.hide(function() {
      return _this.currentControls.show();
    });
  };

  /*
    Returns to the default view
  */


  UIControls.prototype.reset = function() {
    var _ref,
      _this = this;
    this.overview.reset();
    this.ui.getCanvas().getControlsContainer().hide().html("");
    return (_ref = this.currentControls) != null ? _ref.hide(function() {
      _this.currentControls.remove();
      return _this.overview.show();
    }) : void 0;
  };

  return UIControls;

})(EventEmitter);

module.exports = UIControls;


},{"23":19,"__browserify_Buffer":2,"__browserify_process":1,"events":11}],13:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="24",__dirname="/ui";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var UICanvas, Utils;

Utils = require("25");

UICanvas = (function() {
  /*
    @param {imglyUtil} app
    @param {imglyUtil.UI} ui
    @param {Integer} options.height Height of the controls
  
    @todo Get controls height from elsewhere. The options hash
          is probably not a good place for that.
  */

  function UICanvas(app, ui, options) {
    this.app = app;
    this.ui = ui;
    this.options = options;
    this.container = this.app.getContainer();
    this.init();
  }

  /*
    @returns {CanvasRenderingContext2d}
  */


  UICanvas.prototype.getContext = function() {
    return this.context;
  };

  /*
    @returns {ImageData}
  */


  UICanvas.prototype.getImageData = function() {
    return this.context.getImageData(0, 0, this.canvasDom.width, this.canvasDom.height);
  };

  /*
    Initializes the container, creates
    the canvas object
  */


  UICanvas.prototype.init = function() {
    this.canvasContainer = $("<div>").addClass(imglyKit.classPrefix + "canvas-container").css({
      height: this.app.getHeight() - this.options.height
    }).appendTo(this.container);
    this.canvas = $("<canvas>").addClass(imglyKit.classPrefix + "canvas").appendTo(this.canvasContainer);
    this.canvasDom = this.canvas.get(0);
    this.controlsContainer = $("<div>").addClass(imglyKit.classPrefix + "canvas-controls-container").appendTo(this.canvasContainer);
    return this.context = this.canvasDom.getContext("2d");
  };

  /*
    Resizes the canvas and renders the given imageData
  
    @param {ImageData} imageData
  */


  UICanvas.prototype.renderImageData = function(imageData) {
    var imageDataCanvas;
    this.resizeAndPositionCanvasToMatch(imageData);
    imageDataCanvas = Utils.newCanvasFromImageData(imageData);
    this.context.clearRect(0, 0, this.canvasDom.width, this.canvasDom.height);
    return this.context.drawImage(imageDataCanvas, 0, 0, imageData.width, imageData.height, 0, 0, this.canvasDom.width, this.canvasDom.height);
  };

  /*
    Resizes the canvas and renders the given image
  
    @param {Image} image
  */


  UICanvas.prototype.renderImage = function(image) {
    this.resizeAndPositionCanvasToMatch(image);
    this.context.clearRect(0, 0, this.canvasDom.width, this.canvasDom.height);
    return this.context.drawImage(image, 0, 0, image.width, image.height, 0, 0, this.canvasDom.width, this.canvasDom.height);
  };

  /*
    Takes an image and returns the new dimensions
    so that it fits into the UI
  
    @param {Image} image
    @returns {Object} dimensions
    @returns {Integer} dimensions.width
    @returns {Integer} dimensions.height
  */


  UICanvas.prototype.getDimensionsForImage = function(image) {
    var options;
    options = {
      image: {
        width: image.width,
        height: image.height
      },
      container: {
        width: this.canvasContainer.width() - imglyKit.canvasContainerPadding * 2,
        height: this.canvasContainer.height() - imglyKit.canvasContainerPadding * 2
      }
    };
    return Utils.calculateCanvasSize(options);
  };

  /*
    @returns {jQuery.Object}
  */


  UICanvas.prototype.getControlsContainer = function() {
    return this.controlsContainer;
  };

  /*
    @param {Mixed} object
    @param {Integer} object.height
    @param {Integer} object.width
  */


  UICanvas.prototype.resizeAndPositionCanvasToMatch = function(obj) {
    var newCanvasSize, options;
    options = {
      image: {
        width: obj.width,
        height: obj.height
      },
      container: {
        width: this.canvasContainer.width() - imglyKit.canvasContainerPadding * 2,
        height: this.canvasContainer.height() - imglyKit.canvasContainerPadding * 2
      }
    };
    newCanvasSize = Utils.calculateCanvasSize(options);
    this.canvas.css({
      width: newCanvasSize.width,
      height: newCanvasSize.height,
      top: Math.round((this.canvasContainer.height() - newCanvasSize.height) / 2),
      left: Math.round((this.canvasContainer.width() - newCanvasSize.width) / 2)
    });
    this.controlsContainer.css({
      width: newCanvasSize.width,
      height: newCanvasSize.height,
      top: this.canvas.position().top,
      left: this.canvas.position().left
    });
    this.canvasDom.width = newCanvasSize.width * (window.devicePixelRatio || 1);
    return this.canvasDom.height = newCanvasSize.height * (window.devicePixelRatio || 1);
  };

  /*
    Clears the context
  */


  UICanvas.prototype.reset = function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    return this.controlsContainer.html("");
  };

  return UICanvas;

})();

module.exports = UICanvas;


},{"25":6,"__browserify_Buffer":2,"__browserify_process":1}],10:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="26",__dirname="/operations/filters/primitives";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Filter, PrimitiveIdentityFilter, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("27");

PrimitiveIdentityFilter = (function(_super) {
  __extends(PrimitiveIdentityFilter, _super);

  function PrimitiveIdentityFilter() {
    _ref = PrimitiveIdentityFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  PrimitiveIdentityFilter.prototype.apply = function(imageData) {
    return imageData;
  };

  return PrimitiveIdentityFilter;

})(Filter);

module.exports = PrimitiveIdentityFilter;


},{"27":20,"__browserify_Buffer":2,"__browserify_process":1}],17:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="28",__dirname="/operations";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var CropOperation, Operation, Utils, Vector2,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Operation = require("29");

Utils = require("25");

Vector2 = require("30");

CropOperation = (function(_super) {
  __extends(CropOperation, _super);

  CropOperation.prototype.renderPreview = false;

  function CropOperation(app, options) {
    var _base, _base1, _base2;
    this.app = app;
    this.options = options != null ? options : {};
    this.setRatio = __bind(this.setRatio, this);
    CropOperation.__super__.constructor.apply(this, arguments);
    if ((_base = this.options).start == null) {
      _base.start = new Vector2(0.1, 0.1);
    }
    if ((_base1 = this.options).end == null) {
      _base1.end = new Vector2(0.9, 0.9);
    }
    if ((_base2 = this.options).ratio == null) {
      _base2.ratio = 0;
    }
  }

  CropOperation.prototype.setRatio = function(ratio) {
    this.options.ratio = ratio;
    return this.setSize("custom");
  };

  CropOperation.prototype.setSize = function(size) {
    var h, height, w, width, _ref;
    _ref = this.app.ui.getCanvas().getImageData(), width = _ref.width, height = _ref.height;
    this.options.size = size;
    this.options.start.set(0.1, 0.1);
    this.options.end.set(0.9, 0.9);
    switch (size) {
      case "square":
        this.options.ratio = 1;
        break;
      case "4:3":
        this.options.ratio = 4 / 3;
        break;
      case "16:9":
        this.options.ratio = 16 / 9;
        break;
      case "free":
        this.options.ratio = 0;
    }
    if (this.options.ratio) {
      if (width / height <= this.options.ratio) {
        this.options.start.x = 0.1;
        this.options.end.x = 0.9;
        h = 1 / height * (width / this.options.ratio * 0.8);
        this.options.start.y = (1 - h) / 2;
        this.options.end.y = 1 - this.options.start.y;
      } else {
        this.options.start.y = 0.1;
        this.options.end.y = 0.9;
        w = 1 / width * (this.options.ratio * height * 0.8);
        this.options.start.x = (1 - w) / 2;
        this.options.end.x = 1 - this.options.start.x;
      }
    }
    return this.emit("updateOptions", this.options);
  };

  CropOperation.prototype.setStart = function(x, y) {
    this.options.start.x = x;
    return this.options.start.y = y;
  };

  CropOperation.prototype.setEnd = function(x, y) {
    this.options.end.x = x;
    return this.options.end.y = y;
  };

  CropOperation.prototype.apply = function(imageData) {
    var canvas, context, h, height, w, width, x, y;
    width = imageData.width, height = imageData.height;
    canvas = Utils.newCanvasFromImageData(imageData);
    context = canvas.getContext("2d");
    x = width * this.options.start.x;
    y = height * this.options.start.y;
    w = width * (this.options.end.x - this.options.start.x);
    h = height * (this.options.end.y - this.options.start.y);
    return context.getImageData(x, y, w, h);
  };

  return CropOperation;

})(Operation);

module.exports = CropOperation;


},{"30":15,"25":6,"29":21,"__browserify_Buffer":2,"__browserify_process":1}],14:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="31",__dirname="/ui/controls/base";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Base, UIControlsBaseList, Utils, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Base = require("32");

Utils = require("33");

UIControlsBaseList = (function(_super) {
  __extends(UIControlsBaseList, _super);

  function UIControlsBaseList() {
    _ref = UIControlsBaseList.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  UIControlsBaseList.prototype.displayButtons = false;

  UIControlsBaseList.prototype.singleOperation = false;

  UIControlsBaseList.prototype.init = function() {
    var option, _i, _len, _ref1, _results,
      _this = this;
    this.createList();
    if (!this.allowMultipleClick) {
      this.optionSelected = false;
    }
    if (!this.options.showList) {
      this.list.hide();
    }
    /*
      Add the list elements
    */

    _ref1 = this.listItems;
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      option = _ref1[_i];
      _results.push((function(option) {
        var cssClass, item;
        if (option.name == null) {
          return $("<li>").addClass(imglyKit.classPrefix + "controls-item-space").appendTo(_this.list);
        }
        cssClass = option.cssClass || Utils.dasherize(option.name);
        item = $("<li>").addClass(imglyKit.classPrefix + "controls-item").addClass(imglyKit.classPrefix + "controls-item-" + cssClass).appendTo(_this.list);
        item.click(function(e) {
          if (!_this.allowMultipleClick) {
            if (_this.optionSelected) {
              return;
            }
            _this.optionSelected = true;
          }
          return _this.handleOptionSelect(option, item);
        });
        if (option["default"] != null) {
          return item.click();
        }
      })(option));
    }
    return _results;
  };

  /*
    @param {imglyKit.Operations.Operation}
  */


  UIControlsBaseList.prototype.setOperation = function(operation) {
    var _this = this;
    this.operation = operation;
    this.updateOptions(this.operation.options);
    return this.operation.on("updateOptions", function(o) {
      return _this.updateOptions(o);
    });
  };

  /*
    @params {Object} options
  */


  UIControlsBaseList.prototype.updateOptions = function(operationOptions) {
    this.operationOptions = operationOptions;
  };

  /*
    @param {Object} option
    @param {jQuery.Object} item
  */


  UIControlsBaseList.prototype.handleOptionSelect = function(option, item) {
    var activeClass;
    this.setAllItemsInactive();
    activeClass = imglyKit.classPrefix + "controls-list-item-active";
    item.addClass(activeClass);
    if (this.singleOperation) {
      option.operation = this.operationClass;
    }
    if (!this.singleOperation || (this.singleOperation && !this.sentSelected)) {
      this.emit("select", option);
      this.sentSelected = true;
    }
    if (option.method) {
      this.operation[option.method].apply(this.operation, option["arguments"]);
    }
    if ((this.operation != null) && this.operation.renderPreview) {
      return this.emit("renderPreview");
    }
  };

  /*
    Create controls DOM tree
  */


  UIControlsBaseList.prototype.createList = function() {
    this.wrapper = $("<div>").addClass(imglyKit.classPrefix + "controls-wrapper").attr("data-control", this.constructor.name).appendTo(this.controls.getContainer());
    this.list = $("<ul>").addClass(imglyKit.classPrefix + "controls-list").appendTo(this.wrapper);
    if (this.cssClassIdentifier != null) {
      this.list.addClass(imglyKit.classPrefix + "controls-list-" + this.cssClassIdentifier);
    }
    if (this.displayButtons) {
      this.list.addClass(imglyKit.classPrefix + "controls-list-with-buttons");
      this.list.width(this.controls.getContainer().width() - this.controls.getHeight() * 2);
      return this.createButtons();
    }
  };

  /*
    Reset active states
  */


  UIControlsBaseList.prototype.reset = function() {
    if (!this.allowMultipleClick) {
      this.optionSelected = false;
    }
    return this.setAllItemsInactive();
  };

  /*
    Sets all list items to inactive state
  */


  UIControlsBaseList.prototype.setAllItemsInactive = function() {
    var activeClass;
    activeClass = imglyKit.classPrefix + "controls-list-item-active";
    return this.list.find("li").removeClass(activeClass);
  };

  return UIControlsBaseList;

})(Base);

module.exports = UIControlsBaseList;


},{"33":6,"32":22,"__browserify_Buffer":2,"__browserify_process":1}],19:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="34",__dirname="/ui/controls";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var List, UIControlsOverview,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

List = require("14");

UIControlsOverview = (function(_super) {
  __extends(UIControlsOverview, _super);

  /*
    @param {imglyKit} app
    @param {imglyKit.UI} ui
    @param {imglyKit.UI.Controls} controls
  */


  UIControlsOverview.prototype.allowMultipleClick = false;

  function UIControlsOverview(app, ui, controls) {
    this.app = app;
    this.ui = ui;
    this.controls = controls;
    UIControlsOverview.__super__.constructor.apply(this, arguments);
    this.listItems = [
      {
        name: "Filters",
        cssClass: "filters",
        controls: require("35")
      }, {
        name: "Orientation",
        cssClass: "orientation",
        controls: require("36")
      }, {
        name: "Focus",
        cssClass: "focus",
        controls: require("37")
      }, {
        name: "Crop",
        cssClass: "crop",
        controls: require("38"),
        operation: require("17")
      }, {
        name: "Brightness",
        cssClass: "brightness",
        controls: require("39"),
        operation: require("40")
      }, {
        name: "Contrast",
        cssClass: "contrast",
        controls: require("41"),
        operation: require("42")
      }, {
        name: "Saturation",
        cssClass: "saturation",
        controls: require("43"),
        operation: require("44")
      }, {
        name: "Text",
        cssClass: "text",
        controls: require("45"),
        operation: require("46")
      }, {
        name: "Frames",
        cssClass: "frames",
        controls: require("47"),
        operation: require("48")
      }
    ];
  }

  return UIControlsOverview;

})(List);

module.exports = UIControlsOverview;


},{"40":27,"42":29,"17":17,"48":35,"44":31,"46":33,"14":14,"39":26,"41":28,"38":7,"35":23,"37":25,"47":34,"36":24,"43":30,"45":32,"__browserify_Buffer":2,"__browserify_process":1}],21:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="49",__dirname="/operations";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var EventEmitter, Operation, Queue,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

Queue = require("50");

EventEmitter = require("events").EventEmitter;

Operation = (function(_super) {
  var buildComposition;

  __extends(Operation, _super);

  Operation.prototype.renderPreview = true;

  /*
    @param {imglyKit} app
    @param {Object} options
  */


  function Operation(app, options) {
    var apply;
    this.app = app;
    this.options = options != null ? options : {};
    apply = this.apply;
    this.apply = function(dataOrPromise) {
      var _this = this;
      return Queue(dataOrPromise).then(function(imageData) {
        return apply.call(_this, imageData);
      });
    };
  }

  /*
    @param {CanvasRenderingContext2d} context
  */


  Operation.prototype.setContext = function(context) {
    this.context = context;
  };

  /*
    @param {Object} options
  */


  Operation.prototype.setOptions = function(options) {
    var key, val;
    for (key in options) {
      val = options[key];
      this.options[key] = val;
    }
    return this.emit("updateOptions", options);
  };

  /*
    @param {ImageData} imageData
    @param {Function} callback
    @returns {ImageData}
  */


  Operation.prototype.apply = function() {
    throw Error("Abstract: Filter#apply");
  };

  buildComposition = function(direction, filter, args) {
    var composition, self;
    if (args == null) {
      args = [];
    }
    self = this;
    if (filter.prototype instanceof Operation) {
      filter = (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(filter, [this.app].concat(__slice.call(args)), function(){});
    }
    composition = direction === "pre" ? function(imageData) {
      return self.apply(filter.apply(imageData || this));
    } : direction === "post" ? function(imageData) {
      return filter.apply(self.apply(imageData || this));
    } : void 0;
    composition.compose = Operation.prototype.compose;
    composition.precompose = Operation.prototype.precompose;
    return composition;
  };

  /*
    @param {Operation} filter
    @returns {Function}
  */


  Operation.prototype.compose = function() {
    var args, filter;
    filter = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return buildComposition.call(this, "post", filter, args);
  };

  /*
    @param {Operation} filter
    @returns {Function}
  */


  Operation.prototype.precompose = function() {
    var args, filter;
    filter = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return buildComposition.call(this, "pre", filter, args);
  };

  return Operation;

})(EventEmitter);

module.exports = Operation;


},{"50":9,"__browserify_Buffer":2,"__browserify_process":1,"events":11}],20:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="51",__dirname="/operations/filters";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Filter, Operation, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Operation = require("52");

Filter = (function(_super) {
  __extends(Filter, _super);

  function Filter() {
    _ref = Filter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Filter.preview = null;

  Filter.displayName = null;

  return Filter;

})(Operation);

module.exports = Filter;


},{"52":21,"__browserify_Buffer":2,"__browserify_process":1}],22:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="53",__dirname="/ui/controls/base";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var EventEmitter, UIControlsBase,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EventEmitter = require("events").EventEmitter;

UIControlsBase = (function(_super) {
  __extends(UIControlsBase, _super);

  UIControlsBase.prototype.allowMultipleClick = true;

  /*
    @param {imglyUtil} app
    @param {imglyUtil.UI} ui
  */


  function UIControlsBase(app, ui, controls) {
    var _base, _base1;
    this.app = app;
    this.ui = ui;
    this.controls = controls;
    this.domCreated = false;
    if (this.options == null) {
      this.options = {};
    }
    if ((_base = this.options).backButton == null) {
      _base.backButton = true;
    }
    if ((_base1 = this.options).showList == null) {
      _base1.showList = true;
    }
  }

  /*
    @param {imglyUtil.Operations.Operation}
  */


  UIControlsBase.prototype.setOperation = function(operation) {
    this.operation = operation;
  };

  /*
    @param {Object} options
  */


  UIControlsBase.prototype.init = function(options) {};

  /*
    Handle visibility
  */


  UIControlsBase.prototype.show = function(cb) {
    return this.wrapper.fadeIn("fast", cb);
  };

  UIControlsBase.prototype.hide = function(cb) {
    return this.wrapper.fadeOut("fast", cb);
  };

  /*
    Returns to the default view
  */


  UIControlsBase.prototype.reset = function() {};

  /*
    Create "Back" and "Done" buttons
  */


  UIControlsBase.prototype.createButtons = function() {
    var back, done,
      _this = this;
    if (this.buttons == null) {
      this.buttons = {};
    }
    /*
      "Back" Button
    */

    if (this.options.backButton) {
      back = $("<div>").addClass(imglyKit.classPrefix + "controls-button-back").appendTo(this.wrapper);
      back.click(function() {
        return _this.emit("back");
      });
      this.buttons.back = back;
    }
    /*
      "Done" Button
    */

    done = $("<div>").addClass(imglyKit.classPrefix + "controls-button-done").appendTo(this.wrapper);
    done.click(function() {
      return _this.emit("done");
    });
    return this.buttons.done = done;
  };

  UIControlsBase.prototype.remove = function() {
    return this.wrapper.remove();
  };

  return UIControlsBase;

})(EventEmitter);

module.exports = UIControlsBase;


},{"__browserify_Buffer":2,"__browserify_process":1,"events":11}],27:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="54",__dirname="/operations";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Brightness, BrightnessOperation, Filter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("55");

Brightness = require("56");

BrightnessOperation = (function(_super) {
  __extends(BrightnessOperation, _super);

  /*
    @param {imglyKit} app
    @param {Object} options
  */


  function BrightnessOperation(app, options) {
    var _base;
    this.app = app;
    this.options = options != null ? options : {};
    BrightnessOperation.__super__.constructor.apply(this, arguments);
    if ((_base = this.options).amount == null) {
      _base.amount = 0;
    }
    this.filter = new Brightness({
      brightness: this.options.amount
    });
  }

  BrightnessOperation.prototype.apply = function(imageData) {
    return this.filter.apply(imageData);
  };

  /*
    @param {Integer} brightness
  */


  BrightnessOperation.prototype.setBrightness = function(brightness) {
    this.options.amount = brightness;
    return this.filter.setBrightness(brightness);
  };

  return BrightnessOperation;

})(Filter);

module.exports = BrightnessOperation;


},{"55":20,"56":36,"__browserify_Buffer":2,"__browserify_process":1}],29:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="57",__dirname="/operations";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Contrast, ContrastOperation, Filter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("55");

Contrast = require("58");

ContrastOperation = (function(_super) {
  __extends(ContrastOperation, _super);

  /*
    @param {imglyKit} app
    @param {Object} options
  */


  function ContrastOperation(app, options) {
    var _base;
    this.app = app;
    this.options = options != null ? options : {};
    ContrastOperation.__super__.constructor.apply(this, arguments);
    if ((_base = this.options).amount == null) {
      _base.amount = 0;
    }
    this.filter = new Contrast(this.app, {
      contrast: this.options.amount
    });
  }

  ContrastOperation.prototype.apply = function(imageData) {
    return this.filter.apply(imageData);
  };

  /*
    @param {Integer} contrast
  */


  ContrastOperation.prototype.setContrast = function(contrast) {
    this.options.amount = contrast;
    return this.filter.setContrast(contrast);
  };

  return ContrastOperation;

})(Filter);

module.exports = ContrastOperation;


},{"55":20,"58":37,"__browserify_Buffer":2,"__browserify_process":1}],31:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="59",__dirname="/operations";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Filter, Saturation, SaturationOperation,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("55");

Saturation = require("60");

SaturationOperation = (function(_super) {
  __extends(SaturationOperation, _super);

  /*
    @param {imglyKit} app
    @param {Object} options
  */


  function SaturationOperation(app, options) {
    var _base;
    this.app = app;
    this.options = options != null ? options : {};
    SaturationOperation.__super__.constructor.apply(this, arguments);
    if ((_base = this.options).amount == null) {
      _base.amount = 0;
    }
    this.filter = new Saturation(this.app, {
      saturation: this.options.amount
    });
  }

  SaturationOperation.prototype.apply = function(imageData) {
    return this.filter.apply(imageData);
  };

  /*
    @param {Integer} saturation
  */


  SaturationOperation.prototype.setSaturation = function(saturation) {
    this.options.amount = saturation;
    return this.filter.setSaturation(saturation);
  };

  return SaturationOperation;

})(Filter);

module.exports = SaturationOperation;


},{"55":20,"60":38,"__browserify_Buffer":2,"__browserify_process":1}],33:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="61",__dirname="/operations";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var FontOperation, Operation, Rect, Utils, Vector2,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Operation = require("29");

Utils = require("25");

Vector2 = require("30");

Rect = require("62");

FontOperation = (function(_super) {
  __extends(FontOperation, _super);

  FontOperation.prototype.renderPreview = false;

  function FontOperation(app, options) {
    this.app = app;
    this.options = options != null ? options : {};
    FontOperation.__super__.constructor.apply(this, arguments);
    this.options.start = new Vector2(0.2, 0.2);
    this.options.width = 300;
    this.options.font = "Helvetica";
    this.options.text = "Text";
    this.options.color = "#ffffff";
    this.options.fontSize = 0.1;
    this.options.lineHeight = 1.1;
    this.options.paddingLeft = 0;
    this.options.paddingTop = 0;
  }

  /*
    @param {String} font
  */


  FontOperation.prototype.setFont = function(font) {
    this.options.font = font;
    return this.emit("updateOptions", this.options);
  };

  FontOperation.prototype.apply = function(imageData) {
    var canvas, context, line, lineHeight, lineNum, lineOffset, paddingVector, scaledFontSize, scaledStart, _i, _len, _ref;
    scaledFontSize = this.options.fontSize * imageData.height;
    paddingVector = new Vector2(this.options.paddingLeft, this.options.paddingTop);
    scaledStart = new Vector2().copy(this.options.start).add(paddingVector).multiplyWithRect(imageData);
    canvas = Utils.newCanvasFromImageData(imageData);
    context = canvas.getContext("2d");
    context.font = "normal " + scaledFontSize + "px " + this.options.font;
    context.fillStyle = this.options.color;
    context.textBaseline = "hanging";
    lineHeight = this.options.lineHeight;
    _ref = this.options.text.split("\n");
    for (lineNum = _i = 0, _len = _ref.length; _i < _len; lineNum = ++_i) {
      line = _ref[lineNum];
      lineOffset = lineNum * scaledFontSize * lineHeight;
      context.fillText(line, scaledStart.x, scaledStart.y + this.options.paddingLeft + lineOffset);
    }
    return context.getImageData(0, 0, imageData.width, imageData.height);
  };

  return FontOperation;

})(Operation);

module.exports = FontOperation;


},{"62":16,"30":15,"25":6,"29":21,"__browserify_Buffer":2,"__browserify_process":1}],35:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="63",__dirname="/operations";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var FramesOperation, Operation, Queue, Rect, Utils, Vector2,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Operation = require("29");

Utils = require("25");

Queue = require("50");

Vector2 = require("30");

Rect = require("62");

FramesOperation = (function(_super) {
  __extends(FramesOperation, _super);

  FramesOperation.prototype.renderPreview = true;

  function FramesOperation(app, options) {
    var _base, _base1;
    this.app = app;
    this.options = options != null ? options : {};
    FramesOperation.__super__.constructor.apply(this, arguments);
    if ((_base = this.options).frame == null) {
      _base.frame = "black";
    }
    if ((_base1 = this.options).scale == null) {
      _base1.scale = 0.1;
    }
  }

  /*
    @param {Integer} frame
    @param {Float} scale
  */


  FramesOperation.prototype.setFrameOptions = function(frame, scale) {
    this.options.frame = frame;
    return this.options.scale = scale;
  };

  /*
    @param {ImageData} imageData
    @returns {ImageData}
  */


  FramesOperation.prototype.apply = function(imageData) {
    var _this = this;
    return Queue.promise(function(resolve, reject) {
      var frameImage;
      frameImage = new Image();
      frameImage.onload = function() {
        return resolve(frameImage);
      };
      return frameImage.src = _this.app.buildAssetsPath("frames/" + _this.options.frame + ".png");
    }).then(function(frameImage) {
      var bottomHeight, canvas, context, frameCanvas, height, i, leftWidth, lowerHeight, maxHeight, originalHeight, originalWidth, repeatCount, rightWidth, scaledMaxHeight, topHeight, upperHeight, width, xRepeatAreaEnd, xRepeatAreaStart, xRepeatMode, yRepeatAreaEnd, yRepeatAreaStart, yRepeatMode, _i, _j, _ref;
      _ref = _this.analyzeFrameImage(frameImage), xRepeatAreaStart = _ref.xRepeatAreaStart, xRepeatAreaEnd = _ref.xRepeatAreaEnd, xRepeatMode = _ref.xRepeatMode, yRepeatAreaStart = _ref.yRepeatAreaStart, yRepeatAreaEnd = _ref.yRepeatAreaEnd, yRepeatMode = _ref.yRepeatMode, frameCanvas = _ref.frameCanvas;
      /*
        Create a canvas and a drawing context out of
        the image data
      */

      canvas = Utils.newCanvasFromImageData(imageData);
      context = canvas.getContext("2d");
      upperHeight = yRepeatAreaStart;
      lowerHeight = frameCanvas.height - yRepeatAreaEnd;
      maxHeight = Math.max(lowerHeight, upperHeight);
      scaledMaxHeight = imageData.height * _this.options.scale;
      leftWidth = Math.round(xRepeatAreaStart * (scaledMaxHeight / maxHeight));
      topHeight = Math.round(scaledMaxHeight * (maxHeight / upperHeight));
      rightWidth = Math.round((frameCanvas.width - xRepeatAreaEnd) * (scaledMaxHeight / maxHeight));
      bottomHeight = Math.round(scaledMaxHeight * (maxHeight / lowerHeight));
      /*
        Draw corners
      */

      context.drawImage(frameCanvas, 0, 0, xRepeatAreaStart, yRepeatAreaStart, 0, 0, leftWidth, topHeight);
      context.drawImage(frameCanvas, xRepeatAreaEnd, 0, frameCanvas.width - xRepeatAreaEnd, yRepeatAreaStart, imageData.width - rightWidth, 0, rightWidth, topHeight);
      context.drawImage(frameCanvas, 0, yRepeatAreaEnd, xRepeatAreaStart, frameCanvas.height - yRepeatAreaEnd, 0, imageData.height - bottomHeight, leftWidth, bottomHeight);
      context.drawImage(frameCanvas, xRepeatAreaEnd, yRepeatAreaEnd, frameCanvas.width - xRepeatAreaEnd, frameCanvas.height - yRepeatAreaEnd, imageData.width - rightWidth, imageData.height - bottomHeight, rightWidth, bottomHeight);
      /*
        Draw edges
      */

      if (xRepeatMode === "stretch") {
        context.drawImage(frameCanvas, xRepeatAreaStart, 0, xRepeatAreaEnd - xRepeatAreaStart, yRepeatAreaStart, leftWidth, 0, imageData.width - leftWidth - rightWidth, topHeight);
        context.drawImage(frameCanvas, xRepeatAreaStart, yRepeatAreaEnd, xRepeatAreaEnd - xRepeatAreaStart, frameCanvas.height - yRepeatAreaEnd, leftWidth, imageData.height - bottomHeight, imageData.width - leftWidth - rightWidth, bottomHeight);
      } else if (xRepeatMode === "repeat") {
        originalWidth = xRepeatAreaEnd - xRepeatAreaStart;
        originalHeight = yRepeatAreaStart;
        height = topHeight;
        width = Math.round(height * (originalWidth / originalHeight));
        repeatCount = Math.ceil(imageData.width / width);
        for (i = _i = 0; 0 <= repeatCount ? _i < repeatCount : _i > repeatCount; i = 0 <= repeatCount ? ++_i : --_i) {
          context.drawImage(frameCanvas, xRepeatAreaStart, 0, xRepeatAreaEnd - xRepeatAreaStart, yRepeatAreaStart, leftWidth + i * width, 0, width, height);
        }
        originalHeight = frameCanvas.height - yRepeatAreaEnd;
        height = bottomHeight;
        width = Math.round(bottomHeight * (originalWidth / originalHeight));
        for (i = _j = 0; 0 <= repeatCount ? _j < repeatCount : _j > repeatCount; i = 0 <= repeatCount ? ++_j : --_j) {
          context.drawImage(frameCanvas, xRepeatAreaStart, yRepeatAreaEnd, xRepeatAreaEnd - xRepeatAreaStart, frameCanvas.height - yRepeatAreaEnd, leftWidth + i * width, imageData.height - bottomHeight, width, height);
        }
      }
      if (yRepeatMode === "stretch") {
        context.drawImage(frameCanvas, 0, yRepeatAreaStart, xRepeatAreaStart, yRepeatAreaEnd - yRepeatAreaStart, 0, topHeight, leftWidth, imageData.height - topHeight - bottomHeight);
        context.drawImage(frameCanvas, xRepeatAreaEnd, yRepeatAreaStart, frameCanvas.width - xRepeatAreaEnd, yRepeatAreaEnd - yRepeatAreaStart, imageData.width - rightWidth, topHeight, rightWidth, imageData.height - topHeight - bottomHeight);
      }
      return context.getImageData(0, 0, imageData.width, imageData.height);
    });
  };

  FramesOperation.prototype.analyzeFrameImage = function(frameImage) {
    var a, b, canvas, context, frameImageData, g, index, r, x, xRepeatAreaEnd, xRepeatAreaStart, xRepeatMode, y, yRepeatAreaEnd, yRepeatAreaStart, yRepeatMode, _i, _j, _ref, _ref1;
    frameImageData = Utils.getImageDataForImage(frameImage);
    xRepeatAreaStart = null;
    xRepeatAreaEnd = null;
    xRepeatMode = null;
    for (x = _i = 0, _ref = frameImageData.width; 0 <= _ref ? _i < _ref : _i > _ref; x = 0 <= _ref ? ++_i : --_i) {
      index = x * 4;
      r = frameImageData.data[index];
      g = frameImageData.data[index + 1];
      b = frameImageData.data[index + 2];
      a = frameImageData.data[index + 3];
      if (r === 255 && g === 255 && b === 255 && a === 255) {
        if (xRepeatAreaStart == null) {
          xRepeatAreaStart = x - 1;
        }
        xRepeatMode = "stretch";
      }
      if (r === 0 && g === 0 && b === 0 && a === 255) {
        if (xRepeatAreaStart == null) {
          xRepeatAreaStart = x - 1;
        }
        xRepeatMode = "repeat";
      }
      if (a !== 255 && (xRepeatAreaStart != null) && (xRepeatAreaEnd == null)) {
        xRepeatAreaEnd = x - 1;
      }
    }
    yRepeatAreaStart = null;
    yRepeatAreaEnd = null;
    yRepeatMode = null;
    for (y = _j = 0, _ref1 = frameImageData.height; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; y = 0 <= _ref1 ? ++_j : --_j) {
      index = (frameImageData.width * y) * 4;
      r = frameImageData.data[index];
      g = frameImageData.data[index + 1];
      b = frameImageData.data[index + 2];
      a = frameImageData.data[index + 3];
      if (r === 255 && g === 255 && b === 255 && a === 255) {
        if (yRepeatAreaStart == null) {
          yRepeatAreaStart = y - 1;
        }
        yRepeatMode = "stretch";
      }
      if (r === 0 && g === 0 && b === 0 && a === 255) {
        if (yRepeatAreaStart == null) {
          yRepeatAreaStart = y - 1;
        }
        yRepeatMode = "repeat";
      }
      if (a !== 255 && (yRepeatAreaStart != null) && (yRepeatAreaEnd == null)) {
        yRepeatAreaEnd = y - 1;
      }
    }
    canvas = Utils.newCanvasWithDimensions({
      width: frameImage.width - 1,
      height: frameImage.height - 1
    });
    context = canvas.getContext("2d");
    context.putImageData(frameImageData, -1, -1);
    return {
      xRepeatAreaStart: xRepeatAreaStart,
      xRepeatAreaEnd: xRepeatAreaEnd,
      xRepeatMode: xRepeatMode,
      yRepeatAreaStart: yRepeatAreaStart,
      yRepeatAreaEnd: yRepeatAreaEnd,
      yRepeatMode: yRepeatMode,
      frameCanvas: canvas
    };
  };

  return FramesOperation;

})(Operation);

module.exports = FramesOperation;


},{"62":16,"30":15,"25":6,"50":9,"29":21,"__browserify_Buffer":2,"__browserify_process":1}],23:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="64",__dirname="/ui/controls";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var List, UIControlsFilters, Utils, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

List = require("14");

Utils = require("65");

UIControlsFilters = (function(_super) {
  __extends(UIControlsFilters, _super);

  function UIControlsFilters() {
    _ref = UIControlsFilters.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  UIControlsFilters.prototype.displayButtons = true;

  UIControlsFilters.prototype.cssClassIdentifier = "filters";

  /*
    Initializes the container
  */


  UIControlsFilters.prototype.init = function() {
    var filter, _i, _len, _ref1, _results,
      _this = this;
    this.createList();
    _ref1 = [require("66"), require("67"), require("68"), require("69"), require("70"), require("71"), require("72"), require("73"), require("74"), require("75"), require("76"), require("77"), require("78"), require("79"), require("80"), require("81"), require("82"), require("83"), require("84"), require("85"), require("86"), require("87"), require("88"), require("89"), require("90"), require("91"), require("92"), require("93"), require("94")];
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      filter = _ref1[_i];
      _results.push((function(filter) {
        var item, preview;
        item = $("<li>").addClass(imglyKit.classPrefix + "controls-item").appendTo(_this.list);
        preview = $("<div>").addClass(imglyKit.classPrefix + "controls-preview-" + Utils.dasherize(filter.displayName)).appendTo(item);
        return item.click(function(e) {
          var activeClass;
          _this.reset();
          activeClass = imglyKit.classPrefix + "controls-list-item-active";
          item.addClass(activeClass);
          return _this.emit("select", {
            operation: filter
          });
        });
      })(filter));
    }
    return _results;
  };

  return UIControlsFilters;

})(List);

module.exports = UIControlsFilters;


},{"93":66,"72":45,"78":51,"79":52,"86":59,"74":47,"66":39,"76":49,"84":57,"71":44,"75":48,"85":58,"90":63,"67":40,"68":41,"69":42,"70":43,"80":53,"89":62,"91":64,"88":61,"73":46,"83":56,"82":55,"81":54,"94":67,"92":65,"87":60,"77":50,"65":6,"14":14,"__browserify_Buffer":2,"__browserify_process":1}],24:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="95",__dirname="/ui/controls";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var List, UIControlsOrientation,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

List = require("14");

UIControlsOrientation = (function(_super) {
  __extends(UIControlsOrientation, _super);

  UIControlsOrientation.prototype.displayButtons = true;

  UIControlsOrientation.prototype.singleOperation = true;

  /*
    @param {imglyUtil} app
    @param {imglyUtil.UI} ui
  */


  function UIControlsOrientation(app, ui, controls) {
    this.app = app;
    this.ui = ui;
    this.controls = controls;
    UIControlsOrientation.__super__.constructor.apply(this, arguments);
    this.operationClass = require("96");
    this.listItems = [
      {
        name: "Rotate L",
        cssClass: "rotate-l",
        method: "rotateLeft"
      }, {
        name: "Rotate R",
        cssClass: "rotate-r",
        method: "rotateRight"
      }, {
        name: "Flip V",
        cssClass: "flip-v",
        method: "flipVertically"
      }, {
        name: "Flip H",
        cssClass: "flip-h",
        method: "flipHorizontally"
      }
    ];
  }

  return UIControlsOrientation;

})(List);

module.exports = UIControlsOrientation;


},{"96":68,"14":14,"__browserify_Buffer":2,"__browserify_process":1}],25:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="97",__dirname="/ui/controls";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var List, UIControlsFocus, Utils, Vector2, linearOperation, radialOperation,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

List = require("14");

Utils = require("65");

Vector2 = require("15");

radialOperation = require("98");

linearOperation = require("99");

UIControlsFocus = (function(_super) {
  __extends(UIControlsFocus, _super);

  UIControlsFocus.prototype.displayButtons = true;

  /*
    @param {imglyKit} app
    @param {imglyKit.UI} ui
    @param {imglyKit.UI.Controls} controls
  */


  function UIControlsFocus(app, ui, controls) {
    this.app = app;
    this.ui = ui;
    this.controls = controls;
    UIControlsFocus.__super__.constructor.apply(this, arguments);
    this.listItems = [
      {
        name: "Radial",
        cssClass: "radial",
        operation: radialOperation,
        "default": true
      }, {
        name: "Linear",
        cssClass: "linear",
        operation: linearOperation
      }
    ];
  }

  /*
    @params {Object} options
  */


  UIControlsFocus.prototype.updateOptions = function(operationOptions) {
    this.operationOptions = operationOptions;
    return this.rerenderCanvas();
  };

  /*
    We call this every time we change the options, e.g.
    when the user drags a knob or a crosshair
  */


  UIControlsFocus.prototype.onOptionsUpdated = function() {
    this.operation.setOptions(this.operationOptions);
    this.rerenderCanvas();
    this.repositionControls();
    return this.emit("renderPreview");
  };

  /*
    @param {jQuery.Object} canvasControlsContainer
  */


  UIControlsFocus.prototype.hasCanvasControls = true;

  UIControlsFocus.prototype.setupCanvasControls = function(canvasControlsContainer) {
    var height, width;
    this.canvasControlsContainer = canvasControlsContainer;
    width = this.canvasControlsContainer.width();
    height = this.canvasControlsContainer.height();
    this.canvas = $("<canvas>").css({
      width: width,
      height: height
    }).appendTo(this.canvasControlsContainer);
    this.canvas = this.canvas.get(0);
    this.canvas.width = $(this.canvas).width();
    this.canvas.height = $(this.canvas).height();
    this.context = this.canvas.getContext("2d");
    if (window.devicePixelRatio > 1) {
      this.canvas.width *= window.devicePixelRatio;
      return this.canvas.height *= window.devicePixelRatio;
    }
  };

  /*
    @param {Object} option
    @param {jQuery.Object} item
  */


  UIControlsFocus.prototype.handleOptionSelect = function(option, item) {
    UIControlsFocus.__super__.handleOptionSelect.apply(this, arguments);
    switch (option.operation) {
      case radialOperation:
        this.setControlsMode("radial");
        break;
      case linearOperation:
        this.setControlsMode("linear");
    }
    return this.onOptionsUpdated();
  };

  /*
    @param {String} mode
  */


  UIControlsFocus.prototype.setControlsMode = function(mode) {
    var i, knob, _i;
    this.controlsMode = mode;
    this.canvasControlsContainer.find("div").remove();
    this.knobs = [];
    for (i = _i = 0; _i <= 1; i = ++_i) {
      knob = $("<div>").addClass(imglyKit.classPrefix + "canvas-knob");
      knob.appendTo(this.canvasControlsContainer);
      this.knobs.push(knob);
    }
    this.crosshair = $("<div>").addClass(imglyKit.classPrefix + "canvas-crosshair");
    this.crosshair.appendTo(this.canvasControlsContainer);
    this.handleKnobControl();
    return this.handleCrosshairControl();
  };

  /*
    We call this everytime the user dragged a knob
    or a crosshair to reposition the controls
  */


  UIControlsFocus.prototype.repositionControls = function() {
    var canvasSize, controlPoint1, controlPoint2, diff, i, knob, position, _i;
    canvasSize = {
      width: this.canvasControlsContainer.width(),
      height: this.canvasControlsContainer.height()
    };
    for (i = _i = 0; _i <= 1; i = ++_i) {
      knob = this.knobs[i];
      position = this.operationOptions["controlPoint" + (i + 1) + "Position"];
      knob.css({
        left: canvasSize.width * position.x,
        top: canvasSize.height * position.y
      });
    }
    /*
      Multiply the control points with the canvas
      size to get real pixel information
    */

    controlPoint1 = new Vector2().copy(this.operationOptions.controlPoint1Position).multiplyWithRect(canvasSize);
    controlPoint2 = new Vector2().copy(this.operationOptions.controlPoint2Position).multiplyWithRect(canvasSize);
    diff = new Vector2().copy(controlPoint2).substract(controlPoint1).divide(2);
    return this.crosshair.css({
      left: controlPoint1.x + diff.x,
      top: controlPoint1.y + diff.y
    });
  };

  /*
    Handle dragging of the crosshair
  */


  UIControlsFocus.prototype.handleCrosshairControl = function() {
    var canvasSize,
      _this = this;
    canvasSize = new Vector2(this.canvasControlsContainer.width(), this.canvasControlsContainer.height());
    return this.crosshair.mousedown(function(e) {
      var lastPos;
      lastPos = new Vector2(e.clientX, e.clientY);
      $(document).mousemove(function(e) {
        var i, knobPositions, newKnobPositions, normalizedDiff, _i, _j;
        normalizedDiff = new Vector2(e.clientX, e.clientY).substract(lastPos).divide(canvasSize);
        newKnobPositions = {};
        knobPositions = {};
        for (i = _i = 1; _i <= 2; i = ++_i) {
          knobPositions[i] = _this.operationOptions["controlPoint" + i + "Position"];
          newKnobPositions[i] = new Vector2().copy(knobPositions[i]).add(normalizedDiff);
          if (!Utils.withinBoundaries(newKnobPositions[i])) {
            return;
          }
        }
        for (i = _j = 1; _j <= 2; i = ++_j) {
          knobPositions[i].copy(newKnobPositions[i]);
        }
        lastPos.set(e.clientX, e.clientY);
        return _this.onOptionsUpdated();
      });
      return $(document).mouseup(function(e) {
        $(document).off("mousemove");
        return $(document).off("mouseup");
      });
    });
  };

  /*
    Handle dragging of the knobs
  */


  UIControlsFocus.prototype.handleKnobControl = function() {
    var canvasSize, index, knob, _i, _len, _ref, _results,
      _this = this;
    canvasSize = new Vector2(this.canvasControlsContainer.width(), this.canvasControlsContainer.height());
    _ref = this.knobs;
    _results = [];
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      knob = _ref[index];
      _results.push((function(knob, index) {
        return knob.mousedown(function(e) {
          var lastPos;
          lastPos = new Vector2(e.clientX, e.clientY);
          $(document).mousemove(function(e) {
            var currentKnobIndex, currentKnobPosition, newKnobPosition, newOppositeKnobPosition, normalizedDiff, oppositeKnobIndex, oppositeKnobPosition;
            normalizedDiff = new Vector2(e.clientX, e.clientY).substract(lastPos).divide(canvasSize);
            currentKnobIndex = index + 1;
            currentKnobPosition = _this.operationOptions["controlPoint" + currentKnobIndex + "Position"];
            oppositeKnobIndex = index === 0 ? 2 : 1;
            oppositeKnobPosition = _this.operationOptions["controlPoint" + oppositeKnobIndex + "Position"];
            newKnobPosition = new Vector2().copy(currentKnobPosition).add(normalizedDiff);
            newOppositeKnobPosition = new Vector2().copy(oppositeKnobPosition).substract(normalizedDiff);
            if (!(Utils.withinBoundaries(newKnobPosition) && Utils.withinBoundaries(newOppositeKnobPosition))) {
              return;
            }
            currentKnobPosition.copy(newKnobPosition);
            oppositeKnobPosition.copy(newOppositeKnobPosition);
            _this.onOptionsUpdated();
            return lastPos.set(e.clientX, e.clientY);
          });
          return $(document).mouseup(function() {
            $(document).off("mouseup");
            return $(document).off("mousemove");
          });
        });
      })(knob, index));
    }
    return _results;
  };

  /*
    Re-renders the canvas controls
  */


  UIControlsFocus.prototype.rerenderCanvas = function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    switch (this.controlsMode) {
      case "radial":
        return this.drawRadialControl();
      case "linear":
        return this.drawLinearControl();
    }
  };

  /*
    Renders the radial indicator for the currently blurred area
  */


  UIControlsFocus.prototype.drawRadialControl = function() {
    var center, circle, circleProperties, controlPoint1, controlPoint2, halfDiff, radius, _i, _len, _results;
    controlPoint1 = new Vector2().copy(this.operationOptions.controlPoint1Position).multiplyWithRect(this.canvas);
    controlPoint2 = new Vector2().copy(this.operationOptions.controlPoint2Position).multiplyWithRect(this.canvas);
    halfDiff = new Vector2().copy(controlPoint2).substract(controlPoint1).divide(2);
    radius = Math.sqrt(Math.pow(halfDiff.x, 2) + Math.pow(halfDiff.y, 2));
    center = new Vector2().copy(controlPoint1).add(halfDiff);
    circleProperties = [["#FFFFFF", 2 * (window.devicePixelRatio || 1), 0], ["rgba(0, 0, 0, 0.35)", 2 * (window.devicePixelRatio || 1), 2], ["rgba(0, 0, 0, 0.35)", 2 * (window.devicePixelRatio || 1), -1]];
    _results = [];
    for (_i = 0, _len = circleProperties.length; _i < _len; _i++) {
      circle = circleProperties[_i];
      this.context.beginPath();
      this.context.arc(center.x, center.y, radius + circle[2], 0, 2 * Math.PI, false);
      this.context.lineWidth = circle[1];
      this.context.strokeStyle = circle[0];
      this.context.stroke();
      _results.push(this.context.closePath());
    }
    return _results;
  };

  /*
    Renders the line indicators for the currently blurred area
  */


  UIControlsFocus.prototype.drawLinearControl = function() {
    var controlPoint, controlPoint1, controlPoint2, controlPoints, diagonal, diff, line, lines, point, _i, _results;
    controlPoint1 = new Vector2().copy(this.operationOptions.controlPoint1Position).multiplyWithRect(this.canvas);
    controlPoint2 = new Vector2().copy(this.operationOptions.controlPoint2Position).multiplyWithRect(this.canvas);
    controlPoints = [controlPoint1, controlPoint2];
    diff = new Vector2().copy(controlPoint2).substract(controlPoint1);
    diagonal = Math.sqrt(Math.pow(this.canvas.width, 2) + Math.pow(this.canvas.height, 2));
    _results = [];
    for (point = _i = 0; _i <= 1; point = ++_i) {
      controlPoint = controlPoints[point];
      lines = [["#FFFFFF", 2 * (window.devicePixelRatio || 1), 0], ["rgba(0, 0, 0, 0.35)", 2 * (window.devicePixelRatio || 1), 2], ["rgba(0, 0, 0, 0.35)", 2 * (window.devicePixelRatio || 1), -1]];
      _results.push((function() {
        var _j, _len, _results1;
        _results1 = [];
        for (_j = 0, _len = lines.length; _j < _len; _j++) {
          line = lines[_j];
          this.context.beginPath();
          this.context.moveTo(controlPoint.x + diff.y * diagonal + line[2], controlPoint.y - diff.x * diagonal + line[2]);
          this.context.lineTo(controlPoint.x - diff.y * diagonal + line[2], controlPoint.y + diff.x * diagonal + line[2]);
          this.context.strokeStyle = line[0];
          this.context.lineWidth = line[1];
          this.context.stroke();
          _results1.push(this.context.closePath());
        }
        return _results1;
      }).call(this));
    }
    return _results;
  };

  return UIControlsFocus;

})(List);

module.exports = UIControlsFocus;


},{"15":15,"99":70,"98":69,"65":6,"14":14,"__browserify_Buffer":2,"__browserify_process":1}],26:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="100",__dirname="/ui/controls";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Slider, UIControlsBrightness, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Slider = require("101");

UIControlsBrightness = (function(_super) {
  __extends(UIControlsBrightness, _super);

  function UIControlsBrightness() {
    _ref = UIControlsBrightness.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  UIControlsBrightness.prototype.name = "Brightness";

  UIControlsBrightness.prototype.cssClass = "brightness";

  UIControlsBrightness.prototype.valueSetMethod = "setBrightness";

  UIControlsBrightness.prototype.displayButtons = true;

  return UIControlsBrightness;

})(Slider);

module.exports = UIControlsBrightness;


},{"101":71,"__browserify_Buffer":2,"__browserify_process":1}],28:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="102",__dirname="/ui/controls";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Slider, UIControlsContrast, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Slider = require("101");

UIControlsContrast = (function(_super) {
  __extends(UIControlsContrast, _super);

  function UIControlsContrast() {
    _ref = UIControlsContrast.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  UIControlsContrast.prototype.name = "Contrast";

  UIControlsContrast.prototype.cssClass = "contrast";

  UIControlsContrast.prototype.valueSetMethod = "setContrast";

  UIControlsContrast.prototype.displayButtons = true;

  return UIControlsContrast;

})(Slider);

module.exports = UIControlsContrast;


},{"101":71,"__browserify_Buffer":2,"__browserify_process":1}],30:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="103",__dirname="/ui/controls";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Slider, UIControlsSaturation, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Slider = require("101");

UIControlsSaturation = (function(_super) {
  __extends(UIControlsSaturation, _super);

  function UIControlsSaturation() {
    _ref = UIControlsSaturation.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  UIControlsSaturation.prototype.name = "Saturation";

  UIControlsSaturation.prototype.cssClass = "saturation";

  UIControlsSaturation.prototype.valueSetMethod = "setSaturation";

  UIControlsSaturation.prototype.displayButtons = true;

  return UIControlsSaturation;

})(Slider);

module.exports = UIControlsSaturation;


},{"101":71,"__browserify_Buffer":2,"__browserify_process":1}],32:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="104",__dirname="/ui/controls";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var List, Rect, UIControlsText, Vector2,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

List = require("14");

Vector2 = require("15");

Rect = require("16");

UIControlsText = (function(_super) {
  __extends(UIControlsText, _super);

  UIControlsText.prototype.displayButtons = true;

  UIControlsText.prototype.singleOperation = true;

  UIControlsText.prototype.hasCanvasControls = true;

  UIControlsText.prototype.cssClassIdentifier = "text";

  /*
    @param {imglyUtil} app
    @param {imglyUtil.UI} ui
  */


  function UIControlsText(app, ui, controls) {
    this.app = app;
    this.ui = ui;
    this.controls = controls;
    this.autoResizeTextInput = __bind(this.autoResizeTextInput, this);
    this.onFontsizeSmallerClick = __bind(this.onFontsizeSmallerClick, this);
    this.onFontsizeBiggerClick = __bind(this.onFontsizeBiggerClick, this);
    UIControlsText.__super__.constructor.apply(this, arguments);
    this.initialized = false;
    this.fontResizePerClick = 3;
    this.operationClass = require("46");
    this.listItems = [
      {
        name: "Helvetica",
        method: "setFont",
        cssClass: "helvetica",
        "arguments": ["Helvetica"],
        "default": true
      }, {
        name: "Lucida Grande",
        method: "setFont",
        cssClass: "lucida-grande",
        "arguments": ["Lucida Grande"]
      }, {
        name: "Times New Roman",
        method: "setFont",
        cssClass: "times-new-roman",
        "arguments": ["Times New Roman"]
      }
    ];
  }

  /*
    Create controls DOM tree
  */


  UIControlsText.prototype.createList = function() {
    UIControlsText.__super__.createList.apply(this, arguments);
    /*
      Color control
    */

    this.colorControl = $("<div>").addClass(imglyKit.classPrefix + "controls-text-color-button " + imglyKit.classPrefix + "controls-button-right").appendTo(this.wrapper);
    this.colorSelect = $("<div>").addClass(imglyKit.classPrefix + "controls-text-color").appendTo(this.colorControl);
    this.handleColorsControl();
    return this.buttons.color = this.colorControl;
  };

  /*
    Handle the colors control
  */


  UIControlsText.prototype.handleColorsControl = function() {
    var availableColors, color, colorsDropdown, _fn, _i, _len,
      _this = this;
    availableColors = ['#FFFFFF', '#000000', '#ec3713', '#fcc00b', '#0b6af9', '#a9e90e'];
    colorsDropdown = $("<div>").addClass(imglyKit.classPrefix + "controls-text-color-dropdown").appendTo(this.colorControl);
    _fn = function(color) {
      var colorDiv;
      colorDiv = $("<div>").addClass(imglyKit.classPrefix + "controls-text-color").css({
        backgroundColor: color
      }).appendTo(colorsDropdown);
      return colorDiv.click(function() {
        _this.operationOptions.color = color;
        _this.operation.setOptions(_this.operationOptions);
        return _this.colorSelect.css({
          backgroundColor: color
        });
      });
    };
    for (_i = 0, _len = availableColors.length; _i < _len; _i++) {
      color = availableColors[_i];
      _fn(color);
    }
    this.colorSelect.css({
      backgroundColor: availableColors[0]
    });
    return this.colorControl.click(function() {
      if (colorsDropdown.is(":visible")) {
        return colorsDropdown.stop().fadeOut("fast");
      } else {
        return colorsDropdown.stop().fadeIn("fast");
      }
    });
  };

  /*
    @param {jQuery.Object} canvasControlsContainer
  */


  UIControlsText.prototype.setupCanvasControls = function(canvasControlsContainer) {
    var control, _i, _len, _ref,
      _this = this;
    this.canvasControlsContainer = canvasControlsContainer;
    this.textContainer = $("<div>").addClass(imglyKit.classPrefix + "canvas-text-container").appendTo(this.canvasControlsContainer);
    this.fontsizeButtonsContainer = $("<div>").addClass(imglyKit.classPrefix + "canvas-text-size-container").appendTo(this.textContainer);
    _ref = ["Smaller", "Bigger"];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      control = _ref[_i];
      this["fontsize" + control + "Button"] = $("<div>").addClass(imglyKit.classPrefix + "canvas-text-size-" + control.toLowerCase()).appendTo(this.fontsizeButtonsContainer);
      this["fontsize" + control + "Button"].on("click", this["onFontsize" + control + "Click"]);
    }
    this.crosshair = $("<div>").addClass(imglyKit.classPrefix + "canvas-crosshair " + imglyKit.classPrefix + "canvas-text-crosshair").appendTo(this.textContainer);
    this.handleCrosshair();
    this.textInput = $("<textarea>").addClass(imglyKit.classPrefix + "canvas-text-input").appendTo(this.textContainer).attr({
      placeholder: "Text"
    }).focus();
    this.textInputDummy = $("<div>").addClass(imglyKit.classPrefix + "canvas-text-input-dummy").appendTo(this.canvasControlsContainer);
    this.textInput.keyup(function(e) {
      _this.operationOptions.text = _this.textInput.val();
      _this.operation.setOptions(_this.operationOptions);
      return _this.autoResizeTextInput();
    });
    return after(100, function() {
      return _this.autoResizeTextInput();
    });
  };

  /*
    Gets called as soon as the user clicks the button
    to increase font size
  */


  UIControlsText.prototype.onFontsizeBiggerClick = function(e) {
    var canvasHeight, newFontSize, resizeFactor;
    canvasHeight = this.canvasControlsContainer.height();
    resizeFactor = this.fontResizePerClick / canvasHeight;
    newFontSize = Math.min(this.operationOptions.fontSize + resizeFactor, 1);
    this.operationOptions.fontSize = newFontSize;
    this.operation.setOptions(this.operationOptions);
    return this.updateCanvasControls();
  };

  /*
    Gets called as soon as the user clicks the button
    to reduce font size
  */


  UIControlsText.prototype.onFontsizeSmallerClick = function(e) {
    var canvasHeight, newFontSize, resizeFactor;
    canvasHeight = this.canvasControlsContainer.height();
    resizeFactor = this.fontResizePerClick / canvasHeight;
    newFontSize = Math.max(this.operationOptions.fontSize - resizeFactor, 0.05);
    this.operationOptions.fontSize = newFontSize;
    this.operation.setOptions(this.operationOptions);
    return this.updateCanvasControls();
  };

  /*
    Update input position
  */


  UIControlsText.prototype.updateCanvasControls = function() {
    var canvasHeight, canvasWidth;
    canvasWidth = this.canvasControlsContainer.width();
    canvasHeight = this.canvasControlsContainer.height();
    this.textContainer.css({
      left: this.operationOptions.start.x * canvasWidth,
      top: this.operationOptions.start.y * canvasHeight
    });
    return this.autoResizeTextInput();
  };

  /*
    Move the text input around by dragging the crosshair
  */


  UIControlsText.prototype.handleCrosshair = function() {
    var canvasRect, maxContainerPosition, minContainerPosition, minimumHeight, minimumWidth,
      _this = this;
    canvasRect = new Rect(0, 0, this.canvasControlsContainer.width(), this.canvasControlsContainer.height());
    minimumWidth = 50;
    minimumHeight = 50;
    minContainerPosition = new Vector2(0, 0);
    maxContainerPosition = new Vector2(canvasRect.width - minimumWidth, canvasRect.height - minimumHeight);
    return this.crosshair.mousedown(function(e) {
      var currentContainerPosition, currentMousePosition, initialContainerPosition, initialMousePosition;
      initialMousePosition = new Vector2(e.clientX, e.clientY);
      currentMousePosition = new Vector2().copy(initialMousePosition);
      initialContainerPosition = new Vector2(_this.textContainer.position().left, _this.textContainer.position().top);
      currentContainerPosition = new Vector2().copy(initialContainerPosition);
      $(document).mousemove(function(e) {
        var mousePositionDifference;
        currentMousePosition.set(e.clientX, e.clientY);
        mousePositionDifference = new Vector2().copy(currentMousePosition).substract(initialMousePosition);
        currentContainerPosition.copy(initialContainerPosition).add(mousePositionDifference).clamp(minContainerPosition, maxContainerPosition);
        _this.textContainer.css({
          left: currentContainerPosition.x,
          top: currentContainerPosition.y
        });
        _this.operationOptions.start = new Vector2().copy(currentContainerPosition).divideByRect(canvasRect);
        _this.operation.setOptions(_this.operationOptions);
        return _this.updateCanvasControls();
      });
      return $(document).mouseup(function() {
        $(document).off("mousemove");
        return $(document).off("mouseup");
      });
    });
  };

  /*
    Automatically resizes the text input
  */


  UIControlsText.prototype.autoResizeTextInput = function() {
    var canvasHeight, canvasWidth, comfortZoneX, comfortZoneY, fontSize, inputWidth, maxHeight, maxWidth, paddingX, paddingY, text;
    canvasWidth = this.canvasControlsContainer.width();
    canvasHeight = this.canvasControlsContainer.height();
    inputWidth = this.textInput.width();
    fontSize = parseInt(this.textInput.css("font-size"));
    comfortZoneX = fontSize * 3;
    comfortZoneY = fontSize * 2;
    paddingX = parseInt(this.textInputDummy.css("padding-left")) + parseInt(this.textInputDummy.css("padding-right"));
    paddingY = parseInt(this.textInputDummy.css("padding-top")) + parseInt(this.textInputDummy.css("padding-bottom"));
    this.operationOptions.paddingLeft = (parseInt(this.textInputDummy.css("padding-left")) + parseInt(this.textContainer.css("border-left-width"))) / canvasWidth;
    this.operationOptions.paddingTop = (parseInt(this.textInputDummy.css("padding-top")) + parseInt(this.textContainer.css("border-top-width"))) / canvasHeight;
    maxWidth = canvasWidth - this.operationOptions.start.x * canvasWidth;
    maxHeight = canvasHeight - this.operationOptions.start.y * canvasHeight;
    text = this.textInput.val();
    if (text.match(/\n$/i)) {
      text = text + "&nbsp;";
    }
    text = text.replace(/\n/g, "<br />");
    if (!text) {
      text = "&nbsp;";
    }
    this.textInputDummy.css({
      width: "auto",
      height: "auto"
    }).html(text);
    if (this.textInputDummy.width() >= maxWidth) {
      this.textInputDummy.css({
        width: maxWidth
      });
      comfortZoneX = 0;
    }
    if (this.textInputDummy.height() >= maxHeight) {
      this.textInputDummy.css({
        height: maxHeight
      });
      comfortZoneY = 0;
    }
    return this.textInput.css({
      width: Math.min(this.textInputDummy.width() + comfortZoneX, maxWidth),
      height: Math.min(this.textInputDummy.height() + comfortZoneY, maxHeight)
    });
  };

  /*
    @params {Object} options
  */


  UIControlsText.prototype.updateOptions = function(operationOptions) {
    var canvasHeight;
    this.operationOptions = operationOptions;
    canvasHeight = this.canvasControlsContainer.height();
    $([this.textInput.get(0), this.textInputDummy.get(0)]).css({
      fontSize: this.operationOptions.fontSize * canvasHeight,
      color: this.operationOptions.color,
      fontFamily: this.operationOptions.font,
      lineHeight: this.operationOptions.lineHeight
    });
    return this.updateCanvasControls();
  };

  return UIControlsText;

})(List);

module.exports = UIControlsText;


},{"16":16,"15":15,"46":33,"14":14,"__browserify_Buffer":2,"__browserify_process":1}],34:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="105",__dirname="/ui/controls";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var List, Rect, UIControlsFrames, Utils, Vector2, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

List = require("14");

Utils = require("65");

Vector2 = require("15");

Rect = require("16");

UIControlsFrames = (function(_super) {
  __extends(UIControlsFrames, _super);

  function UIControlsFrames() {
    _ref = UIControlsFrames.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  UIControlsFrames.prototype.displayButtons = true;

  UIControlsFrames.prototype.singleOperation = true;

  UIControlsFrames.prototype.init = function() {
    var option, options, _i, _len, _results,
      _this = this;
    this.createList();
    this.operationClass = require("48");
    options = [
      {
        id: "black",
        name: "Black",
        cssClass: "black",
        method: "setFrameOptions",
        "arguments": ["black", 0.1],
        "default": true
      }, {
        id: "blackwood",
        name: "Black Wood",
        cssClass: "black-wood",
        method: "setFrameOptions",
        "arguments": ["blackwood", 0.1]
      }, {
        id: "dia",
        name: "Dia",
        cssClass: "dia",
        method: "setFrameOptions",
        "arguments": ["dia", 0.1]
      }
    ];
    _results = [];
    for (_i = 0, _len = options.length; _i < _len; _i++) {
      option = options[_i];
      _results.push((function(option) {
        var item, preview;
        item = $("<li>").addClass(imglyKit.classPrefix + "controls-item").appendTo(_this.list);
        preview = $("<div>").addClass(imglyKit.classPrefix + "controls-frame-preview-" + Utils.dasherize(option.id)).appendTo(item);
        item.click(function(e) {
          return _this.handleOptionSelect(option, item);
        });
        if (option["default"] != null) {
          return item.click();
        }
      })(option));
    }
    return _results;
  };

  return UIControlsFrames;

})(List);

module.exports = UIControlsFrames;


},{"16":16,"15":15,"48":35,"65":6,"14":14,"__browserify_Buffer":2,"__browserify_process":1}],68:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="106",__dirname="/operations";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Operation, OrientationOperation, Utils,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Operation = require("29");

Utils = require("25");

OrientationOperation = (function(_super) {
  __extends(OrientationOperation, _super);

  /*
    @param {imglyKit} app
    @param {Object} options
  */


  function OrientationOperation(app, options) {
    var _base, _base1, _base2;
    this.app = app;
    this.options = options != null ? options : {};
    OrientationOperation.__super__.constructor.apply(this, arguments);
    if ((_base = this.options).rotation == null) {
      _base.rotation = 0;
    }
    if ((_base1 = this.options).flipVertically == null) {
      _base1.flipVertically = false;
    }
    if ((_base2 = this.options).flipHorizontally == null) {
      _base2.flipHorizontally = false;
    }
  }

  OrientationOperation.prototype.flipVertically = function() {
    return this.options.flipVertically = !this.options.flipVertically;
  };

  OrientationOperation.prototype.flipHorizontally = function() {
    return this.options.flipHorizontally = !this.options.flipHorizontally;
  };

  OrientationOperation.prototype.rotateRight = function() {
    this.options.rotation += 90;
    if (this.options.rotation === 360) {
      this.options.rotation = 0;
    }
    if (this.options.flipHorizontally !== this.options.flipVertically) {
      this.options.flipHorizontally = !this.options.flipHorizontally;
      return this.options.flipVertically = !this.options.flipVertically;
    }
  };

  OrientationOperation.prototype.rotateLeft = function() {
    this.options.rotation -= 90;
    if (this.options.rotation === -360) {
      this.options.rotation = 0;
    }
    if (this.options.flipHorizontally !== this.options.flipVertically) {
      this.options.flipHorizontally = !this.options.flipHorizontally;
      return this.options.flipVertically = !this.options.flipVertically;
    }
  };

  OrientationOperation.prototype.apply = function(imageData) {
    var canvas, context, flipped, h, rotated, w;
    if (Math.abs(this.options.rotation) === 90 || Math.abs(this.options.rotation) === 270) {
      w = imageData.height;
      h = imageData.width;
    } else {
      w = imageData.width;
      h = imageData.height;
    }
    canvas = Utils.newCanvasWithDimensions({
      width: w,
      height: h
    });
    context = canvas.getContext("2d");
    rotated = false;
    flipped = false;
    if (this.options.rotation !== 0) {
      imageData = this.rotateImageData(context, imageData);
      rotated = true;
    }
    if (this.options.flipHorizontally || this.options.flipVertically) {
      imageData = this.flipImageData(context, imageData);
      flipped = true;
    }
    if (rotated || flipped) {
      return context.getImageData(0, 0, w, h);
    } else {
      return imageData;
    }
  };

  /*
    @param {CanvasRenderingContext2d}
    @param {ImageData}
    @returns {ImageData}
  */


  OrientationOperation.prototype.flipImageData = function(context, imageData) {
    var imageDataCanvas, scaleX, scaleY, translateX, translateY;
    context.save();
    scaleX = 1;
    scaleY = 1;
    translateX = 0;
    translateY = 0;
    if (this.options.flipHorizontally) {
      scaleX = -1;
      translateX = context.canvas.width;
    }
    if (this.options.flipVertically) {
      scaleY = -1;
      translateY = context.canvas.height;
    }
    context.translate(translateX, translateY);
    context.scale(scaleX, scaleY);
    imageDataCanvas = Utils.newCanvasFromImageData(imageData);
    context.drawImage(imageDataCanvas, 0, 0);
    context.restore();
    return context.getImageData(0, 0, context.canvas.width, context.canvas.height);
  };

  /*
    @param {CanvasRenderingContext2d}
    @param {ImageData}
    @returns {ImageData}
  */


  OrientationOperation.prototype.rotateImageData = function(context, imageData) {
    var imageDataCanvas;
    context.save();
    context.translate(context.canvas.width / 2, context.canvas.height / 2);
    context.rotate(this.options.rotation * (Math.PI / 180));
    imageDataCanvas = Utils.newCanvasFromImageData(imageData);
    context.drawImage(imageDataCanvas, -imageData.width / 2, -imageData.height / 2);
    context.restore();
    return context.getImageData(0, 0, context.canvas.width, context.canvas.height);
  };

  return OrientationOperation;

})(Operation);

module.exports = OrientationOperation;


},{"25":6,"29":21,"__browserify_Buffer":2,"__browserify_process":1}],39:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="107",__dirname="/operations/filters";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var DefaultFilter, IdentityFilter, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

IdentityFilter = require("108");

DefaultFilter = (function(_super) {
  __extends(DefaultFilter, _super);

  function DefaultFilter() {
    _ref = DefaultFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  DefaultFilter.preview = 'default.png';

  DefaultFilter.displayName = 'Default';

  return DefaultFilter;

})(IdentityFilter);

module.exports = DefaultFilter;


},{"108":10,"__browserify_Buffer":2,"__browserify_process":1}],40:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="109",__dirname="/operations/filters";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Filter, K1Filter, Saturation, ToneCurve, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("110");

ToneCurve = require("111");

Saturation = require("112");

K1Filter = (function(_super) {
  __extends(K1Filter, _super);

  function K1Filter() {
    _ref = K1Filter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  K1Filter.preview = 'k1.png';

  K1Filter.displayName = 'K1';

  K1Filter.prototype.apply = (new ToneCurve(K1Filter.app, {
    rgbControlPoints: [[0, 0], [53 / 255, 32 / 255], [91 / 255, 80 / 255], [176 / 255, 205 / 255], [1, 1]]
  })).compose(Saturation, {
    saturation: 0.9
  });

  return K1Filter;

})(Filter);

module.exports = K1Filter;


},{"110":20,"112":38,"111":72,"__browserify_Buffer":2,"__browserify_process":1}],41:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="113",__dirname="/operations/filters";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Filter, K2Filter, SoftColorOverlay, ToneCurve, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("110");

ToneCurve = require("111");

SoftColorOverlay = require("114");

K2Filter = (function(_super) {
  __extends(K2Filter, _super);

  function K2Filter() {
    _ref = K2Filter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  K2Filter.preview = "k2.png";

  K2Filter.displayName = "K2";

  K2Filter.prototype.apply = (new ToneCurve(K2Filter.app, {
    rgbControlPoints: [[0, 0], [54 / 255, 33 / 255], [77 / 255, 82 / 255], [94 / 255, 103 / 255], [122 / 255, 126 / 255], [177 / 255, 193 / 255], [229 / 255, 232 / 255], [1, 1]]
  })).compose(SoftColorOverlay, {
    r: 40,
    g: 40,
    b: 40
  });

  return K2Filter;

})(Filter);

module.exports = K2Filter;


},{"110":20,"114":73,"111":72,"__browserify_Buffer":2,"__browserify_process":1}],42:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="115",__dirname="/operations/filters";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var K6Filter, SaturationFilter, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

SaturationFilter = require("112");

K6Filter = (function(_super) {
  __extends(K6Filter, _super);

  function K6Filter() {
    _ref = K6Filter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  K6Filter.preview = "k6.png";

  K6Filter.displayName = "K6";

  K6Filter.prototype.saturation = 0.5;

  return K6Filter;

})(SaturationFilter);

module.exports = K6Filter;


},{"112":38,"__browserify_Buffer":2,"__browserify_process":1}],43:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="116",__dirname="/operations/filters";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Filter, KDynamicFilter, Saturation, ToneCurve, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("110");

ToneCurve = require("111");

Saturation = require("112");

KDynamicFilter = (function(_super) {
  __extends(KDynamicFilter, _super);

  function KDynamicFilter() {
    _ref = KDynamicFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  KDynamicFilter.preview = "kdynamic.png";

  KDynamicFilter.displayName = "KDynamic";

  KDynamicFilter.prototype.apply = (new ToneCurve(KDynamicFilter.app, {
    rgbControlPoints: [[0, 0], [17 / 255, 27 / 255], [46 / 255, 69 / 255], [90 / 255, 112 / 255], [156 / 255, 200 / 255], [203 / 255, 243 / 255], [1, 1]]
  })).compose(Saturation, {
    saturation: 0.7
  });

  return KDynamicFilter;

})(Filter);

module.exports = KDynamicFilter;


},{"110":20,"112":38,"111":72,"__browserify_Buffer":2,"__browserify_process":1}],44:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="117",__dirname="/operations/filters";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var FridgeFilter, ToneCurve, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ToneCurve = require("111");

FridgeFilter = (function(_super) {
  __extends(FridgeFilter, _super);

  function FridgeFilter() {
    _ref = FridgeFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  FridgeFilter.preview = "fridge.png";

  FridgeFilter.displayName = "Fridge";

  FridgeFilter.prototype.redControlPoints = [[0, 9 / 255], [21 / 255, 11 / 255], [45 / 255, 24 / 255], [1, 220 / 255]];

  FridgeFilter.prototype.greenControlPoints = [[0, 12 / 255], [21 / 255, 21 / 255], [42 / 255, 42 / 255], [150 / 255, 150 / 255], [170 / 255, 173 / 255], [1, 210 / 255]];

  FridgeFilter.prototype.blueControlPoints = [[0, 28 / 255], [43 / 255, 72 / 255], [128 / 255, 185 / 255], [1, 220 / 255]];

  return FridgeFilter;

})(ToneCurve);

module.exports = FridgeFilter;


},{"111":72,"__browserify_Buffer":2,"__browserify_process":1}],45:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="118",__dirname="/operations/filters";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var BreezeFilter, Desaturation, Filter, ToneCurveFilter, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("110");

ToneCurveFilter = require("111");

Desaturation = require("119");

BreezeFilter = (function(_super) {
  __extends(BreezeFilter, _super);

  function BreezeFilter() {
    _ref = BreezeFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  BreezeFilter.preview = "breeze.png";

  BreezeFilter.displayName = "Breeze";

  BreezeFilter.prototype.apply = (new Desaturation(BreezeFilter.app, {
    desaturation: 0.5
  })).compose(ToneCurveFilter, {
    redControlPoints: [[0, 0], [170 / 255, 170 / 255], [212 / 255, 219 / 255], [234 / 255, 242 / 255], [1, 1]],
    greenControlPoints: [[0, 0], [170 / 255, 168 / 255], [234 / 255, 231 / 255], [1, 1]],
    blueControlPoints: [[0, 0], [170 / 255, 170 / 255], [212 / 255, 208 / 255], [1, 1]]
  });

  return BreezeFilter;

})(Filter);

module.exports = BreezeFilter;


},{"110":20,"119":74,"111":72,"__browserify_Buffer":2,"__browserify_process":1}],46:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="120",__dirname="/operations/filters";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Desaturation, Filter, OrchidFilter, ToneCurve, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("110");

ToneCurve = require("111");

Desaturation = require("119");

OrchidFilter = (function(_super) {
  __extends(OrchidFilter, _super);

  function OrchidFilter() {
    _ref = OrchidFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  OrchidFilter.preview = "orchid.png";

  OrchidFilter.displayName = "Orchid";

  OrchidFilter.prototype.apply = (new ToneCurve(OrchidFilter.app, {
    redControlPoints: [[0, 0], [115 / 255, 130 / 255], [195 / 255, 215 / 255], [1, 1]],
    greenControlPoints: [[0, 0], [148 / 255, 153 / 255], [172 / 255, 215 / 255], [1, 1]],
    blueControlPoints: [[0, 46 / 255], [58 / 255, 75 / 255], [178 / 255, 205 / 255], [1, 1]]
  })).compose(ToneCurve, {
    rgbControlPoints: [[0, 0], [117 / 255, 151 / 255], [189 / 255, 217 / 255], [1, 1]]
  }).compose(Desaturation, {
    desaturation: 0.65
  });

  return OrchidFilter;

})(Filter);

module.exports = OrchidFilter;


},{"110":20,"119":74,"111":72,"__browserify_Buffer":2,"__browserify_process":1}],47:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="121",__dirname="/operations/filters";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var ChestFilter, ToneCurve, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ToneCurve = require("111");

ChestFilter = (function(_super) {
  __extends(ChestFilter, _super);

  function ChestFilter() {
    _ref = ChestFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  ChestFilter.preview = 'chest.png';

  ChestFilter.displayName = 'Chest';

  ChestFilter.prototype.redControlPoints = [[0, 0], [44 / 255, 44 / 255], [124 / 255, 143 / 255], [221 / 255, 204 / 255], [1, 1]];

  ChestFilter.prototype.greenControlPoints = [[0, 0], [130 / 255, 127 / 255], [213 / 255, 199 / 255], [1, 1]];

  ChestFilter.prototype.blueControlPoints = [[0, 0], [51 / 255, 52 / 255], [219 / 255, 204 / 255], [1, 1]];

  return ChestFilter;

})(ToneCurve);

module.exports = ChestFilter;


},{"111":72,"__browserify_Buffer":2,"__browserify_process":1}],48:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="122",__dirname="/operations/filters";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var FrontFilter, ToneCurve, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ToneCurve = require("111");

FrontFilter = (function(_super) {
  __extends(FrontFilter, _super);

  function FrontFilter() {
    _ref = FrontFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  FrontFilter.preview = 'front.png';

  FrontFilter.displayName = 'Front';

  FrontFilter.prototype.redControlPoints = [[0, 65 / 255], [28 / 255, 67 / 255], [67 / 255, 113 / 255], [125 / 255, 183 / 255], [187 / 255, 217 / 255], [1, 229 / 255]];

  FrontFilter.prototype.greenControlPoints = [[0, 52 / 255], [42 / 255, 59 / 255], [104 / 255, 134 / 255], [169 / 255, 209 / 255], [1, 240 / 255]];

  FrontFilter.prototype.blueControlPoints = [[0, 52 / 255], [65 / 255, 68 / 255], [93 / 255, 104 / 255], [150 / 255, 153 / 255], [1, 198 / 255]];

  return FrontFilter;

})(ToneCurve);

module.exports = FrontFilter;


},{"111":72,"__browserify_Buffer":2,"__browserify_process":1}],49:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="123",__dirname="/operations/filters";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var FixieFilter, ToneCurve, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ToneCurve = require("111");

FixieFilter = (function(_super) {
  __extends(FixieFilter, _super);

  function FixieFilter() {
    _ref = FixieFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  FixieFilter.preview = 'fixie.png';

  FixieFilter.displayName = 'Fixie';

  FixieFilter.prototype.redControlPoints = [[0, 0], [44 / 255, 28 / 255], [63 / 255, 48 / 255], [128 / 255, 132 / 255], [235 / 255, 248 / 255], [1, 1]];

  FixieFilter.prototype.greenControlPoints = [[0, 0], [20 / 255, 10 / 255], [60 / 255, 45 / 255], [190 / 255, 209 / 255], [211 / 255, 231 / 255], [1, 1]];

  FixieFilter.prototype.blueControlPoints = [[0, 31 / 255], [41 / 255, 62 / 255], [150 / 255, 142 / 255], [234 / 255, 212 / 255], [1, 224 / 255]];

  return FixieFilter;

})(ToneCurve);

module.exports = FixieFilter;


},{"111":72,"__browserify_Buffer":2,"__browserify_process":1}],50:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="124",__dirname="/operations/filters";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var X400Filter, x400, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

x400 = require("125");

X400Filter = (function(_super) {
  __extends(X400Filter, _super);

  function X400Filter() {
    _ref = X400Filter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  X400Filter.preview = 'x400.png';

  X400Filter.displayName = 'X400';

  return X400Filter;

})(x400);

module.exports = X400Filter;


},{"125":75,"__browserify_Buffer":2,"__browserify_process":1}],51:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="126",__dirname="/operations/filters";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var BWFilter, Grayscale, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Grayscale = require("127");

BWFilter = (function(_super) {
  __extends(BWFilter, _super);

  function BWFilter() {
    _ref = BWFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  BWFilter.preview = 'bw.png';

  BWFilter.displayName = 'B&W';

  return BWFilter;

})(Grayscale);

module.exports = BWFilter;


},{"127":76,"__browserify_Buffer":2,"__browserify_process":1}],52:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="128",__dirname="/operations/filters";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var BWHardFilter, Contrast, Filter, Grayscale, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("110");

Grayscale = require("127");

Contrast = require("129");

BWHardFilter = (function(_super) {
  __extends(BWHardFilter, _super);

  function BWHardFilter() {
    _ref = BWHardFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  BWHardFilter.preview = '1920.png';

  BWHardFilter.displayName = '1920';

  BWHardFilter.prototype.apply = (new Grayscale).compose(Contrast, {
    contrast: 0.5
  });

  return BWHardFilter;

})(Filter);

module.exports = BWHardFilter;


},{"110":20,"129":37,"127":76,"__browserify_Buffer":2,"__browserify_process":1}],53:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="130",__dirname="/operations/filters";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Desaturation, Filter, LeninFilter, ToneCurveFilter, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("110");

ToneCurveFilter = require("111");

Desaturation = require("119");

LeninFilter = (function(_super) {
  __extends(LeninFilter, _super);

  function LeninFilter() {
    _ref = LeninFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  LeninFilter.preview = "lenin.png";

  LeninFilter.displayName = "Lenin";

  LeninFilter.prototype.apply = (new Desaturation(LeninFilter.app, {
    desaturation: 0.4
  })).compose(ToneCurveFilter, {
    redControlPoints: [[0, 20 / 255], [40 / 255, 20 / 255], [106 / 255, 111 / 255], [129 / 255, 153 / 255], [190 / 255, 223 / 255], [1, 1]],
    greenControlPoints: [[0, 20 / 255], [40 / 255, 20 / 255], [62 / 255, 41 / 255], [106 / 255, 108 / 255], [132 / 255, 159 / 255], [203 / 255, 237 / 255], [1, 1]],
    blueControlPoints: [[0, 40 / 255], [40 / 255, 40 / 255], [73 / 255, 60 / 255], [133 / 255, 160 / 255], [191 / 255, 297 / 255], [203 / 255, 237 / 255], [237 / 255, 239 / 255], [1, 1]]
  });

  return LeninFilter;

})(Filter);

module.exports = LeninFilter;


},{"110":20,"119":74,"111":72,"__browserify_Buffer":2,"__browserify_process":1}],54:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="131",__dirname="/operations/filters";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Desaturation, Filter, QuoziFilter, ToneCurveFilter, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("110");

ToneCurveFilter = require("111");

Desaturation = require("119");

QuoziFilter = (function(_super) {
  __extends(QuoziFilter, _super);

  function QuoziFilter() {
    _ref = QuoziFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  QuoziFilter.preview = "breeze.png";

  QuoziFilter.displayName = "Breeze";

  QuoziFilter.prototype.apply = (new Desaturation(QuoziFilter.app, {
    desaturation: 0.65
  })).compose(ToneCurveFilter, {
    redControlPoints: [[0, 50 / 255], [40 / 255, 78 / 255], [118 / 255, 170 / 255], [181 / 255, 211 / 255], [1, 1]],
    greenControlPoints: [[0, 27 / 255], [28 / 255, 45 / 255], [109 / 255, 157 / 255], [157 / 255, 195 / 255], [179 / 255, 208 / 255], [206 / 255, 212 / 255], [1, 240 / 255]],
    blueControlPoints: [[0, 50 / 255], [12 / 255, 55 / 255], [46 / 255, 103 / 255], [103 / 255, 162 / 255], [194 / 255, 182 / 255], [241 / 255, 201 / 255], [1, 219 / 255]]
  });

  return QuoziFilter;

})(Filter);

module.exports = QuoziFilter;


},{"110":20,"119":74,"111":72,"__browserify_Buffer":2,"__browserify_process":1}],55:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="132",__dirname="/operations/filters";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Contrast, Filter, Pola669Filter, Saturation, ToneCurve, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("110");

ToneCurve = require("111");

Contrast = require("129");

Saturation = require("112");

Pola669Filter = (function(_super) {
  __extends(Pola669Filter, _super);

  function Pola669Filter() {
    _ref = Pola669Filter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Pola669Filter.preview = 'pola669.png';

  Pola669Filter.displayName = 'Pola 669';

  Pola669Filter.prototype.apply = (new ToneCurve(Pola669Filter.app, {
    redControlPoints: [[0, 0], [56 / 255, 18 / 255], [196 / 255, 209 / 255], [1, 1]],
    greenControlPoints: [[0, 38 / 255], [71 / 255, 84 / 255], [1, 1]],
    blueControlPoints: [[0, 0], [131 / 255, 133 / 255], [204 / 255, 211 / 255], [1, 1]]
  })).compose(Saturation, {
    saturation: -0.2
  }).compose(Contrast, {
    contrast: 0.5
  });

  return Pola669Filter;

})(Filter);

module.exports = Pola669Filter;


},{"110":20,"129":37,"112":38,"111":72,"__browserify_Buffer":2,"__browserify_process":1}],56:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="133",__dirname="/operations/filters";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Contrast, Filter, PolaFilter, Saturation, ToneCurve, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("110");

ToneCurve = require("111");

Contrast = require("129");

Saturation = require("112");

PolaFilter = (function(_super) {
  __extends(PolaFilter, _super);

  function PolaFilter() {
    _ref = PolaFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  PolaFilter.preview = 'pola.png';

  PolaFilter.displayName = 'Pola';

  PolaFilter.prototype.apply = (new ToneCurve(PolaFilter.app, {
    redControlPoints: [[0, 0], [94 / 255, 74 / 255], [181 / 255, 205 / 255], [1, 1]],
    greenControlPoints: [[0, 0], [34 / 255, 34 / 255], [99 / 255, 76 / 255], [176 / 255, 190 / 255], [1, 1]],
    blueControlPoints: [[0, 0], [102 / 255, 73 / 255], [227 / 255, 213 / 255], [1, 1]]
  })).compose(Saturation, {
    saturation: -0.2
  }).compose(Contrast, {
    contrast: 0.5
  });

  return PolaFilter;

})(Filter);

module.exports = PolaFilter;


},{"110":20,"129":37,"112":38,"111":72,"__browserify_Buffer":2,"__browserify_process":1}],57:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="134",__dirname="/operations/filters";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Contrast, Filter, FoodFilter, Saturation, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("110");

Saturation = require("112");

Contrast = require("129");

FoodFilter = (function(_super) {
  __extends(FoodFilter, _super);

  function FoodFilter() {
    _ref = FoodFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  FoodFilter.preview = 'food.png';

  FoodFilter.displayName = 'Food';

  FoodFilter.prototype.apply = (new Saturation(FoodFilter.app, {
    saturation: 0.35
  })).compose(Contrast, {
    contrast: 0.1
  });

  return FoodFilter;

})(Filter);

module.exports = FoodFilter;


},{"110":20,"129":37,"112":38,"__browserify_Buffer":2,"__browserify_process":1}],58:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="135",__dirname="/operations/filters";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Contrast, Filter, GlamFilter, Grayscale, ToneCurve, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("110");

Grayscale = require("127");

Contrast = require("129");

ToneCurve = require("111");

GlamFilter = (function(_super) {
  __extends(GlamFilter, _super);

  function GlamFilter() {
    _ref = GlamFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  GlamFilter.preview = 'glam.png';

  GlamFilter.displayName = 'Glam';

  GlamFilter.prototype.apply = (new Grayscale).compose(Contrast, {
    contrast: 0.1
  }).compose(ToneCurve, {
    redControlPoints: [[0, 0], [94 / 255, 74 / 255], [181 / 255, 205 / 255], [1, 1]],
    greenControlPoints: [[0, 0], [0.5, 0.5], [1, 1]],
    blueControlPoints: [[0, 0], [102 / 255, 73 / 255], [227 / 255, 213 / 255], [1, 1]]
  });

  return GlamFilter;

})(Filter);

module.exports = GlamFilter;


},{"110":20,"129":37,"127":76,"111":72,"__browserify_Buffer":2,"__browserify_process":1}],59:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="136",__dirname="/operations/filters";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var CelsiusFilter, ToneCurve, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ToneCurve = require("111");

CelsiusFilter = (function(_super) {
  __extends(CelsiusFilter, _super);

  function CelsiusFilter() {
    _ref = CelsiusFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  CelsiusFilter.preview = 'celsius.png';

  CelsiusFilter.displayName = 'Celsius';

  CelsiusFilter.prototype.redControlPoints = [[0, 69 / 255], [55 / 255, 110 / 255], [202 / 255, 230 / 255], [1, 1]];

  CelsiusFilter.prototype.greenControlPoints = [[0, 44 / 255], [89 / 255, 93 / 255], [185 / 255, 141 / 255], [1, 189 / 255]];

  CelsiusFilter.prototype.blueControlPoints = [[0, 76 / 255], [39 / 255, 82 / 255], [218 / 255, 138 / 255], [1, 171 / 255]];

  return CelsiusFilter;

})(ToneCurve);

module.exports = CelsiusFilter;


},{"111":72,"__browserify_Buffer":2,"__browserify_process":1}],60:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="137",__dirname="/operations/filters";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var TexasFilter, ToneCurve, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ToneCurve = require("111");

TexasFilter = (function(_super) {
  __extends(TexasFilter, _super);

  function TexasFilter() {
    _ref = TexasFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  TexasFilter.preview = 'texas.png';

  TexasFilter.displayName = 'Texas';

  TexasFilter.prototype.redControlPoints = [[0, 72 / 255], [89 / 255, 99 / 255], [176 / 255, 212 / 255], [1, 237 / 255]];

  TexasFilter.prototype.greenControlPoints = [[0, 49 / 255], [1, 192 / 255]];

  TexasFilter.prototype.blueControlPoints = [[0, 72 / 255], [1, 151 / 255]];

  return TexasFilter;

})(ToneCurve);

module.exports = TexasFilter;


},{"111":72,"__browserify_Buffer":2,"__browserify_process":1}],61:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="138",__dirname="/operations/filters";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Filter, Glow, MorningFilter, ToneCurve, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("110");

Glow = require("139");

ToneCurve = require("111");

MorningFilter = (function(_super) {
  __extends(MorningFilter, _super);

  function MorningFilter() {
    _ref = MorningFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  MorningFilter.preview = 'morning.png';

  MorningFilter.displayName = 'Morning';

  MorningFilter.prototype.apply = (new ToneCurve(MorningFilter.app, {
    redControlPoints: [[0, 40 / 255], [1, 230 / 255]],
    greenControlPoints: [[0, 10 / 255], [1, 225 / 255]],
    blueControlPoints: [[0, 20 / 255], [1, 181 / 255]]
  })).compose(Glow);

  return MorningFilter;

})(Filter);

module.exports = MorningFilter;


},{"110":20,"139":77,"111":72,"__browserify_Buffer":2,"__browserify_process":1}],62:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="140",__dirname="/operations/filters";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var LomoFilter, ToneCurve, controlPoints, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ToneCurve = require("111");

controlPoints = [[0, 0], [87 / 255, 20 / 255], [131 / 255, 156 / 255], [183 / 255, 205 / 255], [1, 183 / 208]];

LomoFilter = (function(_super) {
  __extends(LomoFilter, _super);

  function LomoFilter() {
    _ref = LomoFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  LomoFilter.preview = 'lomo.png';

  LomoFilter.displayName = 'Lomo';

  LomoFilter.prototype.redControlPoints = controlPoints;

  LomoFilter.prototype.greenControlPoints = controlPoints;

  LomoFilter.prototype.blueControlPoints = controlPoints;

  return LomoFilter;

})(ToneCurve);

module.exports = LomoFilter;


},{"111":72,"__browserify_Buffer":2,"__browserify_process":1}],63:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="141",__dirname="/operations/filters";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Gobblin, GobblinFilter, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Gobblin = require("142");

GobblinFilter = (function(_super) {
  __extends(GobblinFilter, _super);

  function GobblinFilter() {
    _ref = GobblinFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  GobblinFilter.preview = 'gobblin.png';

  GobblinFilter.displayName = 'Gobblin';

  return GobblinFilter;

})(Gobblin);

module.exports = GobblinFilter;


},{"142":78,"__browserify_Buffer":2,"__browserify_process":1}],64:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="143",__dirname="/operations/filters";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var MellowFilter, ToneCurve, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ToneCurve = require("111");

MellowFilter = (function(_super) {
  __extends(MellowFilter, _super);

  function MellowFilter() {
    _ref = MellowFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  MellowFilter.preview = 'mellow.png';

  MellowFilter.displayName = 'Mellow';

  MellowFilter.prototype.redControlPoints = [[0, 0], [41 / 255, 84 / 255], [87 / 255, 134 / 255], [1, 1]];

  MellowFilter.prototype.greenControlPoints = [[0, 0], [1, 216 / 255]];

  MellowFilter.prototype.blueControlPoints = [[0, 0], [1, 131 / 255]];

  return MellowFilter;

})(ToneCurve);

module.exports = MellowFilter;


},{"111":72,"__browserify_Buffer":2,"__browserify_process":1}],65:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="144",__dirname="/operations/filters";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Filter, SunnyFilter, ToneCurve, contrastPoints, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("110");

ToneCurve = require("111");

contrastPoints = [[0, 0], [55 / 255, 20 / 255], [158 / 255, 191 / 255], [1, 1]];

SunnyFilter = (function(_super) {
  __extends(SunnyFilter, _super);

  function SunnyFilter() {
    _ref = SunnyFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  SunnyFilter.preview = 'sunny.png';

  SunnyFilter.displayName = 'Sunny';

  SunnyFilter.prototype.apply = (new ToneCurve(SunnyFilter.app, {
    redControlPoints: [[0, 0], [62 / 255, 82 / 255], [141 / 255, 154 / 255], [1, 1]],
    greenControlPoints: [[0, 39 / 255], [56 / 255, 96 / 255], [192 / 255, 176 / 255], [1, 1]],
    blueControlPoints: [[0, 0], [174 / 255, 99 / 255], [1, 235 / 255]]
  })).compose(ToneCurve, {
    redControlPoints: contrastPoints,
    greenControlPoints: contrastPoints,
    blueControlPoints: contrastPoints
  });

  return SunnyFilter;

})(Filter);

module.exports = SunnyFilter;


},{"110":20,"111":72,"__browserify_Buffer":2,"__browserify_process":1}],66:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="145",__dirname="/operations/filters";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var A15Filter, Brightness, Contrast, Filter, ToneCurve, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("110");

Contrast = require("129");

Brightness = require("146");

ToneCurve = require("111");

A15Filter = (function(_super) {
  __extends(A15Filter, _super);

  function A15Filter() {
    _ref = A15Filter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  A15Filter.preview = '15.png';

  A15Filter.displayName = '15';

  A15Filter.prototype.apply = (new Contrast(A15Filter.app, {
    contrast: -0.37
  })).compose(Brightness, {
    brightness: 0.12
  }).compose(ToneCurve, {
    redControlPoints: [[0, 38 / 255], [94 / 255, 94 / 255], [148 / 255, 142 / 255], [175 / 255, 187 / 255], [1, 1]],
    greenControlPoints: [[0, 0], [77 / 255, 53 / 255], [171 / 255, 190 / 255], [1, 1]],
    blueControlPoints: [[0, 10 / 255], [48 / 255, 85 / 255], [174 / 255, 228 / 255], [1, 1]]
  });

  return A15Filter;

})(Filter);

module.exports = A15Filter;


},{"110":20,"146":36,"129":37,"111":72,"__browserify_Buffer":2,"__browserify_process":1}],67:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="147",__dirname="/operations/filters";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Filter, Glow, SemiRedFilter, ToneCurve, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("110");

Glow = require("139");

ToneCurve = require("111");

SemiRedFilter = (function(_super) {
  __extends(SemiRedFilter, _super);

  function SemiRedFilter() {
    _ref = SemiRedFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  SemiRedFilter.preview = 'semired.png';

  SemiRedFilter.displayName = 'SemiRed';

  SemiRedFilter.prototype.apply = (new ToneCurve(SemiRedFilter.app, {
    redControlPoints: [[0, 129 / 255], [75 / 255, 153 / 255], [181 / 255, 227 / 255], [1, 1]],
    greenControlPoints: [[0, 8 / 255], [111 / 255, 85 / 255], [212 / 255, 158 / 255], [1, 226 / 255]],
    blueControlPoints: [[0, 5 / 255], [75 / 255, 22 / 255], [193 / 255, 90 / 255], [1, 229 / 255]]
  })).compose(Glow);

  return SemiRedFilter;

})(Filter);

module.exports = SemiRedFilter;


},{"110":20,"139":77,"111":72,"__browserify_Buffer":2,"__browserify_process":1}],69:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="148",__dirname="/operations/focus";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Focus, RadialFocus, Vector2,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Focus = require("37");

Vector2 = require("15");

RadialFocus = (function(_super) {
  __extends(RadialFocus, _super);

  /*
    @param {imglyKit} app
    @param {CanvasRenderingContext2d} context
    @param {Object} options
  */


  function RadialFocus(app, options) {
    var _base, _base1, _base2;
    this.app = app;
    this.options = options != null ? options : {};
    RadialFocus.__super__.constructor.apply(this, arguments);
    if ((_base = this.options).radius == null) {
      _base.radius = 5;
    }
    if ((_base1 = this.options).controlPoint1Position == null) {
      _base1.controlPoint1Position = new Vector2(0.5, 0.4);
    }
    if ((_base2 = this.options).controlPoint2Position == null) {
      _base2.controlPoint2Position = new Vector2(0.5, 0.6);
    }
  }

  /*
    @param {HTMLCanvasElement} canvas
    @param {CanvasRenderingContext2d} context
  */


  RadialFocus.prototype.drawMask = function(canvas, context) {
    /*
      Multiply the control points with the canvas
      size to get real pixel information
    */

    var center, controlPoint1, controlPoint2, gradient, halfDiff, innerRadius, outerRadius;
    controlPoint1 = new Vector2().copy(this.options.controlPoint1Position).multiplyWithRect(canvas);
    controlPoint2 = new Vector2().copy(this.options.controlPoint2Position).multiplyWithRect(canvas);
    /*
      Calculate the difference between the two points
      and divide it by two
    */

    halfDiff = new Vector2().copy(controlPoint2).substract(controlPoint1).divide(2);
    /*
      The of the circle is the center of the two points
    */

    center = new Vector2().copy(controlPoint1).add(halfDiff);
    innerRadius = Math.sqrt(Math.pow(halfDiff.x, 2) + Math.pow(halfDiff.y, 2));
    outerRadius = innerRadius * 3 / 2;
    /*
      Finally draw the gradient
    */

    gradient = context.createRadialGradient(center.x, center.y, outerRadius, center.x, center.y, innerRadius);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(1, '#FFFFFF');
    context.fillStyle = gradient;
    return context.fillRect(0, 0, canvas.width, canvas.height);
  };

  return RadialFocus;

})(Focus);

module.exports = RadialFocus;


},{"15":15,"37":79,"__browserify_Buffer":2,"__browserify_process":1}],70:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="149",__dirname="/operations/focus";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Focus, LinearFocus, Vector2,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Focus = require("37");

Vector2 = require("15");

LinearFocus = (function(_super) {
  __extends(LinearFocus, _super);

  /*
    @param {imglyKit} app
    @param {CanvasRenderingContext2d} context
    @param {Object} options
  */


  function LinearFocus(app, options) {
    var _base, _base1, _base2;
    this.app = app;
    this.options = options != null ? options : {};
    LinearFocus.__super__.constructor.apply(this, arguments);
    if ((_base = this.options).radius == null) {
      _base.radius = 5;
    }
    if ((_base1 = this.options).controlPoint1Position == null) {
      _base1.controlPoint1Position = new Vector2(0.5, 0.4);
    }
    if ((_base2 = this.options).controlPoint2Position == null) {
      _base2.controlPoint2Position = new Vector2(0.5, 0.6);
    }
  }

  /*
    @param {HTMLCanvasElement} canvas
    @param {CanvasRenderingContext2d} context
  */


  LinearFocus.prototype.drawMask = function(canvas, context) {
    /*
      Multiply the control points with the canvas
      size to get real pixel information
    */

    var controlPoint1, controlPoint2, end, gradient, halfDiff, start;
    controlPoint1 = new Vector2().copy(this.options.controlPoint1Position).multiplyWithRect(canvas);
    controlPoint2 = new Vector2().copy(this.options.controlPoint2Position).multiplyWithRect(canvas);
    /*
      Calculate the difference between the two points
      and divide it by two
    */

    halfDiff = new Vector2().copy(controlPoint2).substract(controlPoint1).divide(2);
    /*
      Calculate start and end of the gradient
      We want the gradient to start 50% before
      and 50% after the control points, so that
      the gradient is outside of our control points
    */

    start = new Vector2().copy(controlPoint1).substract(halfDiff);
    end = new Vector2().copy(controlPoint2).add(halfDiff);
    /*
      Finally draw the gradient
    */

    gradient = context.createLinearGradient(start.x, start.y, end.x, end.y);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(0.25, '#FFFFFF');
    gradient.addColorStop(0.75, '#FFFFFF');
    gradient.addColorStop(1, '#000000');
    context.fillStyle = gradient;
    return context.fillRect(0, 0, canvas.width, canvas.height);
  };

  return LinearFocus;

})(Focus);

module.exports = LinearFocus;


},{"15":15,"37":79,"__browserify_Buffer":2,"__browserify_process":1}],36:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="150",__dirname="/operations/filters/primitives";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Filter, PrimitiveBrightnessFilter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("27");

PrimitiveBrightnessFilter = (function(_super) {
  __extends(PrimitiveBrightnessFilter, _super);

  function PrimitiveBrightnessFilter(options) {
    if (options == null) {
      options = {};
    }
    PrimitiveBrightnessFilter.__super__.constructor.apply(this, arguments);
    this.setBrightness(options.brightness);
  }

  PrimitiveBrightnessFilter.prototype.apply = function(imageData) {
    var h, index, w, x, y, _i, _j;
    w = imageData.width;
    h = imageData.height;
    for (x = _i = 0; 0 <= w ? _i < w : _i > w; x = 0 <= w ? ++_i : --_i) {
      for (y = _j = 0; 0 <= h ? _j < h : _j > h; y = 0 <= h ? ++_j : --_j) {
        index = (w * y + x) * 4;
        imageData.data[index] = Math.min(imageData.data[index] + this.brightness * 255, 255);
        imageData.data[index + 1] = Math.min(imageData.data[index + 1] + this.brightness * 255, 255);
        imageData.data[index + 2] = Math.min(imageData.data[index + 2] + this.brightness * 255, 255);
        imageData.data[index + 3] = 255;
      }
    }
    return imageData;
  };

  PrimitiveBrightnessFilter.prototype.setBrightness = function(brightness) {
    return this.brightness = typeof brightness === 'number' ? brightness : 0.0;
  };

  return PrimitiveBrightnessFilter;

})(Filter);

module.exports = PrimitiveBrightnessFilter;


},{"27":20,"__browserify_Buffer":2,"__browserify_process":1}],37:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="151",__dirname="/operations/filters/primitives";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Filter, PrimitiveContrastFilter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("27");

PrimitiveContrastFilter = (function(_super) {
  __extends(PrimitiveContrastFilter, _super);

  function PrimitiveContrastFilter(app, options) {
    this.app = app;
    if (options == null) {
      options = {};
    }
    PrimitiveContrastFilter.__super__.constructor.apply(this, arguments);
    this.setContrast(options.contrast);
  }

  PrimitiveContrastFilter.prototype.apply = function(imageData) {
    var h, index, w, x, y, _i, _j;
    w = imageData.width;
    h = imageData.height;
    for (x = _i = 0; 0 <= w ? _i < w : _i > w; x = 0 <= w ? ++_i : --_i) {
      for (y = _j = 0; 0 <= h ? _j < h : _j > h; y = 0 <= h ? ++_j : --_j) {
        index = (w * y + x) * 4;
        if (this.contrast > 0) {
          imageData.data[index] = (imageData.data[index] - 128) / (1 - this.contrast) + 128;
          imageData.data[index + 1] = (imageData.data[index + 1] - 128) / (1 - this.contrast) + 128;
          imageData.data[index + 2] = (imageData.data[index + 2] - 128) / (1 - this.contrast) + 128;
          imageData.data[index + 3] = 255;
        } else {
          imageData.data[index] = (imageData.data[index] - 128) * (1 + this.contrast) + 128;
          imageData.data[index + 1] = (imageData.data[index + 1] - 128) * (1 + this.contrast) + 128;
          imageData.data[index + 2] = (imageData.data[index + 2] - 128) * (1 + this.contrast) + 128;
          imageData.data[index + 3] = 255;
        }
      }
    }
    return imageData;
  };

  PrimitiveContrastFilter.prototype.setContrast = function(contrast) {
    return this.contrast = typeof contrast === 'number' ? contrast : 1.0;
  };

  return PrimitiveContrastFilter;

})(Filter);

module.exports = PrimitiveContrastFilter;


},{"27":20,"__browserify_Buffer":2,"__browserify_process":1}],38:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="152",__dirname="/operations/filters/primitives";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Filter, PrimitiveSaturationFilter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("27");

PrimitiveSaturationFilter = (function(_super) {
  __extends(PrimitiveSaturationFilter, _super);

  function PrimitiveSaturationFilter(app, options) {
    this.app = app;
    if (options == null) {
      options = {};
    }
    PrimitiveSaturationFilter.__super__.constructor.apply(this, arguments);
    if (options.saturation != null) {
      this.setSaturation(options.saturation);
    }
  }

  PrimitiveSaturationFilter.prototype.setSaturation = function(saturation) {
    return this.saturation = typeof saturation === 'number' ? saturation + 1 : 1;
  };

  PrimitiveSaturationFilter.prototype.apply = function(imageData) {
    var h, index, luminance, w, x, y, _i, _j;
    w = imageData.width;
    h = imageData.height;
    for (x = _i = 0; 0 <= w ? _i < w : _i > w; x = 0 <= w ? ++_i : --_i) {
      for (y = _j = 0; 0 <= h ? _j < h : _j > h; y = 0 <= h ? ++_j : --_j) {
        index = (w * y + x) * 4;
        luminance = imageData.data[index] * 0.2125 + imageData.data[index + 1] * 0.7154 + imageData.data[index + 2] * 0.0721;
        imageData.data[index] = luminance * (1 - this.saturation) + (imageData.data[index] * this.saturation);
        imageData.data[index + 1] = luminance * (1 - this.saturation) + (imageData.data[index + 1] * this.saturation);
        imageData.data[index + 2] = luminance * (1 - this.saturation) + (imageData.data[index + 2] * this.saturation);
        imageData.data[index + 3] = 255;
      }
    }
    return imageData;
  };

  return PrimitiveSaturationFilter;

})(Filter);

module.exports = PrimitiveSaturationFilter;


},{"27":20,"__browserify_Buffer":2,"__browserify_process":1}],71:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="153",__dirname="/ui/controls/base";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Base, UIControlsBaseSlider, _ref,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Base = require("32");

UIControlsBaseSlider = (function(_super) {
  __extends(UIControlsBaseSlider, _super);

  function UIControlsBaseSlider() {
    this.onMouseUp = __bind(this.onMouseUp, this);
    this.onMouseMove = __bind(this.onMouseMove, this);
    _ref = UIControlsBaseSlider.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  UIControlsBaseSlider.prototype.init = function() {
    var spaceForPlusAndMinus, width;
    spaceForPlusAndMinus = 60;
    width = this.controls.getContainer().width();
    width -= this.controls.getHeight() * 2;
    width -= spaceForPlusAndMinus;
    this.wrapper = $("<div>").addClass(imglyKit.classPrefix + "controls-wrapper").attr("data-control", this.constructor.name).appendTo(this.controls.getContainer());
    this.sliderWrapper = $("<div>").addClass(imglyKit.classPrefix + "controls-slider-wrapper").width(width).appendTo(this.wrapper);
    this.sliderCenterDot = $("<div>").addClass(imglyKit.classPrefix + "controls-slider-dot").appendTo(this.sliderWrapper);
    this.sliderBar = $("<div>").addClass(imglyKit.classPrefix + "controls-slider-bar").appendTo(this.sliderWrapper);
    this.slider = $("<div>").addClass(imglyKit.classPrefix + "controls-slider").css({
      left: width / 2
    }).appendTo(this.sliderWrapper);
    /*
      Plus / Minus images
    */

    $("<div>").addClass(imglyKit.classPrefix + "controls-slider-plus").appendTo(this.sliderWrapper);
    $("<div>").addClass(imglyKit.classPrefix + "controls-slider-minus").appendTo(this.sliderWrapper);
    this.handleSliderControl();
    return this.createButtons();
  };

  /*
    Handles slider dragging
  */


  UIControlsBaseSlider.prototype.handleSliderControl = function() {
    var _this = this;
    this.sliderWidth = this.sliderWrapper.width();
    return this.slider.mousedown(function(e) {
      _this.lastX = e.clientX;
      _this.currentSliderLeft = parseInt(_this.slider.css("left"));
      $(document).mousemove(_this.onMouseMove);
      return $(document).mouseup(_this.onMouseUp);
    });
  };

  /*
    Is called when the slider has been moved
  
    @param {Integer} left
  */


  UIControlsBaseSlider.prototype.setSliderLeft = function(left) {
    var barWidth, normalized;
    this.slider.css({
      left: left
    });
    if (left < this.sliderWidth / 2) {
      barWidth = this.sliderWidth / 2 - left;
      this.sliderBar.css({
        left: left,
        width: barWidth
      });
    } else {
      barWidth = left - this.sliderWidth / 2;
      this.sliderBar.css({
        left: this.sliderWidth / 2,
        width: barWidth
      });
    }
    normalized = (left - this.sliderWidth / 2) / this.sliderWidth * 2;
    this.operation[this.valueSetMethod].apply(this.operation, [normalized]);
    return this.app.getPhotoProcessor().renderPreview();
  };

  /*
    Is called when the slider has been pressed and is being dragged
  
    @param {MouseEvent} e
  */


  UIControlsBaseSlider.prototype.onMouseMove = function(e) {
    var curX, deltaX, sliderLeft;
    curX = e.clientX;
    deltaX = curX - this.lastX;
    sliderLeft = Math.min(Math.max(0, this.currentSliderLeft + deltaX), this.sliderWidth);
    if (sliderLeft < this.sliderWidth && sliderLeft > 0) {
      this.lastX = curX;
      this.currentSliderLeft = sliderLeft;
    }
    return this.setSliderLeft(sliderLeft);
  };

  /*
    Is called when the slider has been pressed and is being dragged
  
    @param {MouseEvent} e
  */


  UIControlsBaseSlider.prototype.onMouseUp = function(e) {
    $(document).off("mouseup", this.onMouseUp);
    return $(document).off("mousemove", this.onMouseMove);
  };

  return UIControlsBaseSlider;

})(Base);

module.exports = UIControlsBaseSlider;


},{"32":22,"__browserify_Buffer":2,"__browserify_process":1}],72:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="154",__dirname="/operations/filters/primitives";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Filter, PrimitiveToneCurveFilter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("27");

PrimitiveToneCurveFilter = (function(_super) {
  __extends(PrimitiveToneCurveFilter, _super);

  function PrimitiveToneCurveFilter(app, options) {
    var rgb;
    this.app = app;
    if (options == null) {
      options = {};
    }
    PrimitiveToneCurveFilter.__super__.constructor.apply(this, arguments);
    if (this.rgbControlPoints || (options.rgbControlPoints != null)) {
      rgb = this.rgbControlPoints || options.rgbControlPoints;
      if (this.redControlPoints == null) {
        this.redControlPoints = rgb;
      }
      if (this.greenControlPoints == null) {
        this.greenControlPoints = rgb;
      }
      if (this.blueControlPoints == null) {
        this.blueControlPoints = rgb;
      }
    } else {
      if (this.redControlPoints == null) {
        this.redControlPoints = options.redControlPoints;
      }
      if (this.greenControlPoints == null) {
        this.greenControlPoints = options.greenControlPoints;
      }
      if (this.blueControlPoints == null) {
        this.blueControlPoints = options.blueControlPoints;
      }
    }
    if (this.redControlPoints && this.greenControlPoints && this.blueControlPoints) {
      this.updateToneCurveTexture();
    }
  }

  PrimitiveToneCurveFilter.prototype.render = function(context, w, h) {
    return context.putImageData(this.apply(context.getImageData(0, 0, w, h)), 0, 0);
  };

  PrimitiveToneCurveFilter.prototype.apply = function(imageData) {
    var h, index, w, x, y, _i, _j;
    w = imageData.width;
    h = imageData.height;
    for (x = _i = 0; 0 <= w ? _i < w : _i > w; x = 0 <= w ? ++_i : --_i) {
      for (y = _j = 0; 0 <= h ? _j < h : _j > h; y = 0 <= h ? ++_j : --_j) {
        index = (w * y + x) * 4;
        imageData.data[index] = imageData.data[index] + this.preparedRed[imageData.data[index]];
        imageData.data[index + 1] = imageData.data[index + 1] + this.preparedGreen[imageData.data[index + 1]];
        imageData.data[index + 2] = imageData.data[index + 2] + this.preparedBlue[imageData.data[index + 2]];
        imageData.data[index + 3] = 255;
      }
    }
    return imageData;
  };

  PrimitiveToneCurveFilter.prototype.updateToneCurveTexture = function() {
    this.preparedRed = this.getPreparedSplineCurve(this.redControlPoints);
    this.preparedBlue = this.getPreparedSplineCurve(this.blueControlPoints);
    return this.preparedGreen = this.getPreparedSplineCurve(this.greenControlPoints);
  };

  PrimitiveToneCurveFilter.prototype.getPreparedSplineCurve = function(points) {
    var convertedPoints, distance, firstSplinePoint, i, newPoint, origPoint, point, preparedSplinePoints, sortedPoints, splinePoints, _i, _j, _k, _len, _ref, _ref1;
    sortedPoints = points.sort(function(a, b) {
      var x1, x2;
      x1 = a[0];
      x2 = b[0];
      return x1 > x2;
    });
    convertedPoints = [];
    for (_i = 0, _len = points.length; _i < _len; _i++) {
      point = points[_i];
      newPoint = [point[0] * 255, point[1] * 255];
      convertedPoints.push(newPoint);
    }
    splinePoints = this.splineCurve(convertedPoints);
    firstSplinePoint = splinePoints[0];
    if (firstSplinePoint[0] > 0) {
      for (i = _j = 0, _ref = firstSplinePoint[0]; 0 <= _ref ? _j < _ref : _j > _ref; i = 0 <= _ref ? ++_j : --_j) {
        splinePoints.unshift([0, 0]);
      }
    }
    preparedSplinePoints = [];
    for (i = _k = 0, _ref1 = splinePoints.length; 0 <= _ref1 ? _k < _ref1 : _k > _ref1; i = 0 <= _ref1 ? ++_k : --_k) {
      newPoint = splinePoints[i];
      origPoint = [newPoint[0], newPoint[0]];
      distance = Math.sqrt(Math.pow(origPoint[0] - newPoint[0], 2) + Math.pow(origPoint[1] - newPoint[1], 2));
      if (origPoint[1] > newPoint[1]) {
        distance = -distance;
      }
      preparedSplinePoints.push(distance);
    }
    return preparedSplinePoints;
  };

  PrimitiveToneCurveFilter.prototype.splineCurve = function(points) {
    var a, b, cur, h, i, n, next, output, sd, sdA, t, x, y, _i, _j, _k, _ref, _ref1, _ref2;
    sdA = this.secondDerivative(points);
    n = sdA.length;
    sd = [];
    for (i = _i = 0; 0 <= n ? _i < n : _i > n; i = 0 <= n ? ++_i : --_i) {
      sd[i] = sdA[i];
    }
    output = [];
    for (i = _j = 0, _ref = n - 1; 0 <= _ref ? _j < _ref : _j > _ref; i = 0 <= _ref ? ++_j : --_j) {
      cur = points[i];
      next = points[i + 1];
      for (x = _k = _ref1 = cur[0], _ref2 = next[0]; _ref1 <= _ref2 ? _k < _ref2 : _k > _ref2; x = _ref1 <= _ref2 ? ++_k : --_k) {
        t = (x - cur[0]) / (next[0] - cur[0]);
        a = 1 - t;
        b = t;
        h = next[0] - cur[0];
        y = a * cur[1] + b * next[1] + (h * h / 6) * ((a * a * a - a) * sd[i] + (b * b * b - b) * sd[i + 1]);
        if (y > 255) {
          y = 255;
        } else if (y < 0) {
          y = 0;
        }
        output.push([x, y]);
      }
    }
    if (output.length === 255) {
      output.push(points.pop());
    }
    return output;
  };

  PrimitiveToneCurveFilter.prototype.secondDerivative = function(points) {
    var P1, P2, P3, i, k, matrix, n, result, y2, _i, _j, _k, _l, _ref, _ref1;
    n = points.length;
    if (n <= 0 || n === 1) {
      return null;
    }
    matrix = [];
    result = [];
    matrix[0] = [0, 1, 0];
    for (i = _i = 1, _ref = n - 1; 1 <= _ref ? _i < _ref : _i > _ref; i = 1 <= _ref ? ++_i : --_i) {
      P1 = points[i - 1];
      P2 = points[i];
      P3 = points[i + 1];
      if (matrix[i] == null) {
        matrix[i] = [];
      }
      matrix[i][0] = (P2[0] - P1[0]) / 6;
      matrix[i][1] = (P3[0] - P1[0]) / 3;
      matrix[i][2] = (P3[0] - P2[0]) / 6;
      result[i] = (P3[1] - P2[1]) / (P3[0] - P2[0]) - (P2[1] - P1[1]) / (P2[0] - P1[0]);
    }
    result[0] = 0;
    result[n - 1] = 0;
    matrix[n - 1] = [0, 1, 0];
    for (i = _j = 1; 1 <= n ? _j < n : _j > n; i = 1 <= n ? ++_j : --_j) {
      k = matrix[1][0] / matrix[i - 1][1];
      matrix[i][1] -= k * matrix[i - 1][2];
      matrix[i][0] = 0;
      result[i] -= k * result[i - 1];
    }
    for (i = _k = _ref1 = n - 2; _ref1 <= 0 ? _k < 0 : _k > 0; i = _ref1 <= 0 ? ++_k : --_k) {
      k = matrix[i][2] / matrix[i + 1][1];
      matrix[i][1] -= k * matrix[i + 1][0];
      matrix[i][2] = 0;
      result[i] -= k * result[i + 1];
    }
    y2 = [];
    for (i = _l = 0; 0 <= n ? _l < n : _l > n; i = 0 <= n ? ++_l : --_l) {
      y2[i] = result[i] / matrix[i][1];
    }
    return y2;
  };

  PrimitiveToneCurveFilter.prototype.setRedControlPoints = function(controlPoints) {
    return this.redControlPoints = controlPoints;
  };

  PrimitiveToneCurveFilter.prototype.setGreenControlPoints = function(controlPoints) {
    return this.greenControlPoints = controlPoints;
  };

  PrimitiveToneCurveFilter.prototype.setBlueControlPoints = function(controlPoints) {
    return this.blueControlPoints = controlPoints;
  };

  return PrimitiveToneCurveFilter;

})(Filter);

module.exports = PrimitiveToneCurveFilter;


},{"27":20,"__browserify_Buffer":2,"__browserify_process":1}],79:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="155",__dirname="/operations/focus";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

/*
  Helpers for the Stack Blur
*/

var BlurStack, Focus, Operation, Utils, mul_table, shg_table,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BlurStack = (function() {
  function BlurStack() {}

  BlurStack.r = 0;

  BlurStack.g = 0;

  BlurStack.b = 0;

  BlurStack.a = 0;

  BlurStack.next = null;

  return BlurStack;

})();

mul_table = [512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292, 512, 454, 405, 364, 328, 298, 271, 496, 456, 420, 388, 360, 335, 312, 292, 273, 512, 482, 454, 428, 405, 383, 364, 345, 328, 312, 298, 284, 271, 259, 496, 475, 456, 437, 420, 404, 388, 374, 360, 347, 335, 323, 312, 302, 292, 282, 273, 265, 512, 497, 482, 468, 454, 441, 428, 417, 405, 394, 383, 373, 364, 354, 345, 337, 328, 320, 312, 305, 298, 291, 284, 278, 271, 265, 259, 507, 496, 485, 475, 465, 456, 446, 437, 428, 420, 412, 404, 396, 388, 381, 374, 367, 360, 354, 347, 341, 335, 329, 323, 318, 312, 307, 302, 297, 292, 287, 282, 278, 273, 269, 265, 261, 512, 505, 497, 489, 482, 475, 468, 461, 454, 447, 441, 435, 428, 422, 417, 411, 405, 399, 394, 389, 383, 378, 373, 368, 364, 359, 354, 350, 345, 341, 337, 332, 328, 324, 320, 316, 312, 309, 305, 301, 298, 294, 291, 287, 284, 281, 278, 274, 271, 268, 265, 262, 259, 257, 507, 501, 496, 491, 485, 480, 475, 470, 465, 460, 456, 451, 446, 442, 437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388, 385, 381, 377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335, 332, 329, 326, 323, 320, 318, 315, 312, 310, 307, 304, 302, 299, 297, 294, 292, 289, 287, 285, 282, 280, 278, 275, 273, 271, 269, 267, 265, 263, 261, 259];

shg_table = [9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24];

Operation = require("52");

Utils = require("65");

Focus = (function(_super) {
  __extends(Focus, _super);

  Focus.prototype.cache = null;

  Focus.prototype.fingerprint = null;

  /*
    @param {imglyKit} app
    @param {CanvasRenderingContext2d} context
    @param {Object} options
  */


  function Focus(app, options) {
    var _base;
    this.app = app;
    this.options = options != null ? options : {};
    Focus.__super__.constructor.apply(this, arguments);
    if ((_base = this.options).radius == null) {
      _base.radius = 1;
    }
  }

  Focus.prototype.apply = function(imageData) {
    var alpha, fingerprint, index, maskImageData, _i, _ref;
    fingerprint = Utils.fingerprint(imageData.data);
    if (fingerprint !== this.fingerprint) {
      this.cache = this.blur(Utils.cloneImageData(imageData));
      this.fingerprint = fingerprint;
    }
    maskImageData = this.createMaskImageData(imageData);
    for (index = _i = 0, _ref = imageData.data.length; _i < _ref; index = _i += 4) {
      alpha = maskImageData.data[index] / 255;
      imageData.data[index] = alpha * imageData.data[index] + (1 - alpha) * this.cache.data[index];
      imageData.data[index + 1] = alpha * imageData.data[index + 1] + (1 - alpha) * this.cache.data[index + 1];
      imageData.data[index + 2] = alpha * imageData.data[index + 2] + (1 - alpha) * this.cache.data[index + 2];
      imageData.data[index + 3] = 255;
    }
    return imageData;
  };

  /*
    @param {ImageData} originalImageData
    @returns {ImageData}
  */


  Focus.prototype.createMaskImageData = function(originalImageData) {
    var canvas, context;
    canvas = Utils.newCanvasWithDimensions({
      width: originalImageData.width,
      height: originalImageData.height
    });
    context = canvas.getContext("2d");
    this.drawMask(canvas, context);
    return context.getImageData(0, 0, canvas.width, canvas.height);
  };

  /*
    Uses quasimondo's StackBlur algorithm to blur
    the image
  
    @param {ImageData} imageData
    @returns {ImageData}
  */


  Focus.prototype.blur = function(imageData) {
    var b_in_sum, b_out_sum, b_sum, div, g_in_sum, g_out_sum, g_sum, height, heightMinus1, i, mul_sum, p, pb, pg, pixels, pr, r_in_sum, r_out_sum, r_sum, radius, radiusPlus1, rbs, shg_sum, stack, stackEnd, stackIn, stackOut, stackStart, sumFactor, w4, width, widthMinus1, x, y, yi, yp, yw, _i, _j, _k, _l, _m, _n, _o, _p, _q;
    radius = this.options.radius;
    width = imageData.width;
    height = imageData.height;
    pixels = imageData.data;
    div = radius + radius + 1;
    w4 = width << 2;
    widthMinus1 = width - 1;
    heightMinus1 = height - 1;
    radiusPlus1 = radius + 1;
    sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;
    stackStart = new BlurStack();
    stack = stackStart;
    for (i = _i = 1; 1 <= div ? _i < div : _i > div; i = 1 <= div ? ++_i : --_i) {
      stack = stack.next = new BlurStack();
      if (i === radiusPlus1) {
        stackEnd = stack;
      }
    }
    stack.next = stackStart;
    stackIn = null;
    stackOut = null;
    yw = yi = 0;
    mul_sum = mul_table[radius];
    shg_sum = shg_table[radius];
    for (y = _j = 0; 0 <= height ? _j < height : _j > height; y = 0 <= height ? ++_j : --_j) {
      r_in_sum = g_in_sum = b_in_sum = r_sum = g_sum = b_sum = 0;
      r_out_sum = radiusPlus1 * (pr = pixels[yi]);
      g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
      b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
      r_sum += sumFactor * pr;
      g_sum += sumFactor * pg;
      b_sum += sumFactor * pb;
      stack = stackStart;
      for (i = _k = 0; 0 <= radiusPlus1 ? _k < radiusPlus1 : _k > radiusPlus1; i = 0 <= radiusPlus1 ? ++_k : --_k) {
        stack.r = pr;
        stack.g = pg;
        stack.b = pb;
        stack = stack.next;
      }
      for (i = _l = 1; 1 <= radiusPlus1 ? _l < radiusPlus1 : _l > radiusPlus1; i = 1 <= radiusPlus1 ? ++_l : --_l) {
        p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
        r_sum += (stack.r = (pr = pixels[p])) * (rbs = radiusPlus1 - i);
        g_sum += (stack.g = (pg = pixels[p + 1])) * rbs;
        b_sum += (stack.b = (pb = pixels[p + 2])) * rbs;
        r_in_sum += pr;
        g_in_sum += pg;
        b_in_sum += pb;
        stack = stack.next;
      }
      stackIn = stackStart;
      stackOut = stackEnd;
      for (x = _m = 0; 0 <= width ? _m < width : _m > width; x = 0 <= width ? ++_m : --_m) {
        pixels[yi] = (r_sum * mul_sum) >> shg_sum;
        pixels[yi + 1] = (g_sum * mul_sum) >> shg_sum;
        pixels[yi + 2] = (b_sum * mul_sum) >> shg_sum;
        r_sum -= r_out_sum;
        g_sum -= g_out_sum;
        b_sum -= b_out_sum;
        r_out_sum -= stackIn.r;
        g_out_sum -= stackIn.g;
        b_out_sum -= stackIn.b;
        p = (yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1)) << 2;
        r_in_sum += (stackIn.r = pixels[p]);
        g_in_sum += (stackIn.g = pixels[p + 1]);
        b_in_sum += (stackIn.b = pixels[p + 2]);
        r_sum += r_in_sum;
        g_sum += g_in_sum;
        b_sum += b_in_sum;
        stackIn = stackIn.next;
        r_out_sum += (pr = stackOut.r);
        g_out_sum += (pg = stackOut.g);
        b_out_sum += (pb = stackOut.b);
        r_in_sum -= pr;
        g_in_sum -= pg;
        b_in_sum -= pb;
        stackOut = stackOut.next;
        yi += 4;
      }
      yw += width;
    }
    for (x = _n = 0; 0 <= width ? _n < width : _n > width; x = 0 <= width ? ++_n : --_n) {
      g_in_sum = b_in_sum = r_in_sum = g_sum = b_sum = r_sum = 0;
      yi = x << 2;
      r_out_sum = radiusPlus1 * (pr = pixels[yi]);
      g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
      b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
      r_sum += sumFactor * pr;
      g_sum += sumFactor * pg;
      b_sum += sumFactor * pb;
      stack = stackStart;
      for (i = _o = 0; 0 <= radiusPlus1 ? _o < radiusPlus1 : _o > radiusPlus1; i = 0 <= radiusPlus1 ? ++_o : --_o) {
        stack.r = pr;
        stack.g = pg;
        stack.b = pb;
        stack = stack.next;
      }
      yp = width;
      for (i = _p = 1; 1 <= radius ? _p <= radius : _p >= radius; i = 1 <= radius ? ++_p : --_p) {
        yi = (yp + x) << 2;
        r_sum += (stack.r = (pr = pixels[yi])) * (rbs = radiusPlus1 - i);
        g_sum += (stack.g = (pg = pixels[yi + 1])) * rbs;
        b_sum += (stack.b = (pb = pixels[yi + 2])) * rbs;
        r_in_sum += pr;
        g_in_sum += pg;
        b_in_sum += pb;
        stack = stack.next;
        if (i < heightMinus1) {
          yp += width;
        }
      }
      yi = x;
      stackIn = stackStart;
      stackOut = stackEnd;
      for (y = _q = 0; 0 <= height ? _q < height : _q > height; y = 0 <= height ? ++_q : --_q) {
        p = yi << 2;
        pixels[p] = (r_sum * mul_sum) >> shg_sum;
        pixels[p + 1] = (g_sum * mul_sum) >> shg_sum;
        pixels[p + 2] = (b_sum * mul_sum) >> shg_sum;
        r_sum -= r_out_sum;
        g_sum -= g_out_sum;
        b_sum -= b_out_sum;
        r_out_sum -= stackIn.r;
        g_out_sum -= stackIn.g;
        b_out_sum -= stackIn.b;
        p = (x + (((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width)) << 2;
        r_sum += (r_in_sum += (stackIn.r = pixels[p]));
        g_sum += (g_in_sum += (stackIn.g = pixels[p + 1]));
        b_sum += (b_in_sum += (stackIn.b = pixels[p + 2]));
        stackIn = stackIn.next;
        r_out_sum += (pr = stackOut.r);
        g_out_sum += (pg = stackOut.g);
        b_out_sum += (pb = stackOut.b);
        r_in_sum -= pr;
        g_in_sum -= pg;
        b_in_sum -= pb;
        stackOut = stackOut.next;
        yi += width;
      }
    }
    return imageData;
  };

  return Focus;

})(Operation);

module.exports = Focus;


},{"65":6,"52":21,"__browserify_Buffer":2,"__browserify_process":1}],73:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="156",__dirname="/operations/filters/primitives";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Filter, PrimitiveSoftColorOverlayFilter, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("27");

PrimitiveSoftColorOverlayFilter = (function(_super) {
  __extends(PrimitiveSoftColorOverlayFilter, _super);

  function PrimitiveSoftColorOverlayFilter() {
    _ref = PrimitiveSoftColorOverlayFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  PrimitiveSoftColorOverlayFilter.prototype.apply = function(imageData) {
    var h, index, w, x, y, _i, _j;
    w = imageData.width;
    h = imageData.height;
    for (x = _i = 0; 0 <= w ? _i < w : _i > w; x = 0 <= w ? ++_i : --_i) {
      for (y = _j = 0; 0 <= h ? _j < h : _j > h; y = 0 <= h ? ++_j : --_j) {
        index = (w * y + x) * 4;
        imageData.data[index] = Math.max(this.options.r, imageData.data[index]);
        imageData.data[index + 1] = Math.max(this.options.g, imageData.data[index + 1]);
        imageData.data[index + 2] = Math.max(this.options.b, imageData.data[index + 2]);
        imageData.data[index + 3] = 255;
      }
    }
    return imageData;
  };

  return PrimitiveSoftColorOverlayFilter;

})(Filter);

module.exports = PrimitiveSoftColorOverlayFilter;


},{"27":20,"__browserify_Buffer":2,"__browserify_process":1}],74:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="157",__dirname="/operations/filters/primitives";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Filter, PrimitiveDesaturationFilter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("27");

PrimitiveDesaturationFilter = (function(_super) {
  __extends(PrimitiveDesaturationFilter, _super);

  function PrimitiveDesaturationFilter(app, options) {
    this.app = app;
    if (options == null) {
      options = {};
    }
    PrimitiveDesaturationFilter.__super__.constructor.apply(this, arguments);
    if (this.desaturation == null) {
      this.desaturation = options != null ? options.desaturation : void 0;
    }
  }

  PrimitiveDesaturationFilter.prototype.apply = function(imageData) {
    var h, index, luminance, w, x, y, _i, _j;
    w = imageData.width;
    h = imageData.height;
    for (x = _i = 0; 0 <= w ? _i < w : _i > w; x = 0 <= w ? ++_i : --_i) {
      for (y = _j = 0; 0 <= h ? _j < h : _j > h; y = 0 <= h ? ++_j : --_j) {
        index = (w * y + x) * 4;
        luminance = imageData.data[index] * 0.3 + imageData.data[index + 1] * 0.59 + imageData.data[index + 2] * 0.11;
        imageData.data[index] = luminance * (1 - this.desaturation) + (imageData.data[index] * this.desaturation);
        imageData.data[index + 1] = luminance * (1 - this.desaturation) + (imageData.data[index + 1] * this.desaturation);
        imageData.data[index + 2] = luminance * (1 - this.desaturation) + (imageData.data[index + 2] * this.desaturation);
        imageData.data[index + 3] = 255;
      }
    }
    return imageData;
  };

  return PrimitiveDesaturationFilter;

})(Filter);

module.exports = PrimitiveDesaturationFilter;


},{"27":20,"__browserify_Buffer":2,"__browserify_process":1}],75:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="158",__dirname="/operations/filters/primitives";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Filter, PrimitiveX400Filter, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("27");

PrimitiveX400Filter = (function(_super) {
  __extends(PrimitiveX400Filter, _super);

  function PrimitiveX400Filter() {
    _ref = PrimitiveX400Filter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  PrimitiveX400Filter.prototype.apply = function(imageData) {
    var gray, h, index, w, x, y, _i, _j;
    w = imageData.width;
    h = imageData.height;
    for (x = _i = 0; 0 <= w ? _i < w : _i > w; x = 0 <= w ? ++_i : --_i) {
      for (y = _j = 0; 0 <= h ? _j < h : _j > h; y = 0 <= h ? ++_j : --_j) {
        index = (w * y + x) * 4;
        gray = imageData.data[index] / 255 * 0.3 + imageData.data[index + 1] / 255 * 0.3 + imageData.data[index + 2] / 255 * 0.3;
        gray -= 0.2;
        gray = Math.max(0.0, Math.min(1.0, gray));
        gray += 0.15;
        gray *= 1.4;
        gray *= 255;
        imageData.data[index] = gray;
        imageData.data[index + 1] = gray;
        imageData.data[index + 2] = gray;
        imageData.data[index + 3] = 255;
      }
    }
    return imageData;
  };

  return PrimitiveX400Filter;

})(Filter);

module.exports = PrimitiveX400Filter;


},{"27":20,"__browserify_Buffer":2,"__browserify_process":1}],76:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="159",__dirname="/operations/filters/primitives";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Filter, PrimtiveGrayscaleFilter, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("27");

PrimtiveGrayscaleFilter = (function(_super) {
  __extends(PrimtiveGrayscaleFilter, _super);

  function PrimtiveGrayscaleFilter() {
    _ref = PrimtiveGrayscaleFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  PrimtiveGrayscaleFilter.prototype.apply = function(imageData) {
    var h, index, luminance, w, x, y, _i, _j;
    w = imageData.width;
    h = imageData.height;
    for (x = _i = 0; 0 <= w ? _i < w : _i > w; x = 0 <= w ? ++_i : --_i) {
      for (y = _j = 0; 0 <= h ? _j < h : _j > h; y = 0 <= h ? ++_j : --_j) {
        index = (w * y + x) * 4;
        luminance = imageData.data[index] * 0.2125 + imageData.data[index + 1] * 0.7154 + imageData.data[index + 2] * 0.0721;
        imageData.data[index] = luminance;
        imageData.data[index + 1] = luminance;
        imageData.data[index + 2] = luminance;
        imageData.data[index + 3] = 255;
      }
    }
    return imageData;
  };

  return PrimtiveGrayscaleFilter;

})(Filter);

module.exports = PrimtiveGrayscaleFilter;


},{"27":20,"__browserify_Buffer":2,"__browserify_process":1}],77:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="160",__dirname="/operations/filters/primitives";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Filter, PrimitiveGlowFilter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("27");

PrimitiveGlowFilter = (function(_super) {
  __extends(PrimitiveGlowFilter, _super);

  function PrimitiveGlowFilter(options) {
    if (options == null) {
      options = {};
    }
    PrimitiveGlowFilter.__super__.constructor.apply(this, arguments);
    this.setColorToAdd(options.r, options.g, options.b);
  }

  PrimitiveGlowFilter.prototype.apply = function(imageData) {
    var d, h, index, nx, ny, scalarX, scalarY, w, x, x01, y, y01, _i, _j;
    w = imageData.width;
    h = imageData.height;
    for (x = _i = 0; 0 <= w ? _i < w : _i > w; x = 0 <= w ? ++_i : --_i) {
      for (y = _j = 0; 0 <= h ? _j < h : _j > h; y = 0 <= h ? ++_j : --_j) {
        index = (w * y + x) * 4;
        x01 = x / w;
        y01 = y / h;
        nx = (x01 - 0.5) / 0.75;
        ny = (y01 - 0.5) / 0.75;
        scalarX = nx * nx;
        scalarY = ny * ny;
        d = 1 - (scalarX + scalarY);
        d = Math.min(Math.max(d, 0.1), 1.0);
        imageData.data[index] = imageData.data[index] * (d * this.colorToAdd[0]);
        imageData.data[index + 1] = imageData.data[index + 1] * (d * this.colorToAdd[1]);
        imageData.data[index + 2] = imageData.data[index + 2] * (d * this.colorToAdd[2]);
        imageData.data[index + 3] = 255;
      }
    }
    return imageData;
  };

  PrimitiveGlowFilter.prototype.setColorToAdd = function(r, g, b) {
    return this.colorToAdd = [typeof r === 'number' ? r : 1.0, typeof g === 'number' ? g : 1.0, typeof b === 'number' ? b : 1.0];
  };

  return PrimitiveGlowFilter;

})(Filter);

module.exports = PrimitiveGlowFilter;


},{"27":20,"__browserify_Buffer":2,"__browserify_process":1}],78:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer,__filename="161",__dirname="/operations/filters/primitives";/*
  imglyKit
  Copyright (c) 2013 img.ly
*/

var Filter, PrimitiveGobblinFilter, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Filter = require("27");

PrimitiveGobblinFilter = (function(_super) {
  __extends(PrimitiveGobblinFilter, _super);

  function PrimitiveGobblinFilter() {
    _ref = PrimitiveGobblinFilter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  PrimitiveGobblinFilter.prototype.apply = function(imageData) {
    var h, index, w, x, y, _i, _j;
    w = imageData.width;
    h = imageData.height;
    for (x = _i = 0; 0 <= w ? _i < w : _i > w; x = 0 <= w ? ++_i : --_i) {
      for (y = _j = 0; 0 <= h ? _j < h : _j > h; y = 0 <= h ? ++_j : --_j) {
        index = (w * y + x) * 4;
        imageData.data[index + 2] = imageData.data[index + 1] * 0.33;
        imageData.data[index] = imageData.data[index] * 0.6;
        imageData.data[index + 2] += imageData.data[index] * 0.33;
        imageData.data[index + 1] = imageData.data[index + 1] * 0.7;
        imageData.data[index + 3] = 255;
      }
    }
    return imageData;
  };

  return PrimitiveGobblinFilter;

})(Filter);

module.exports = PrimitiveGobblinFilter;


},{"27":20,"__browserify_Buffer":2,"__browserify_process":1}]},{},[3])
;
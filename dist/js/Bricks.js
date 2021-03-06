/*
*  Bricks 1.0.1 30-07-2014 
*  Created by Giovanny Andres Gongora Granada 
*  License MIT 
*  bricksframework.github.io
*/


// We are going to build here some functions
// I need to document it. I promise for the
// next release.
// Att: Gioyik

(function (window, undefined) {

var document = window.document, 
  _bricks = window.bricks,
  _$ = window.$,
  idExp = /^#([\w\-]*)$/,
  classExp = /^\.([\w\-]*)$/,
  tagNameExp = /^[\w\-]+$/,
  tagExp = /^<([\w:]+)/,
  slice = [].slice,
  splice = [].splice,
  noop = function () {};

try {
  slice.call(document.childNodes);
} catch(e) {
  slice = function (i, e) {
    i = i || 0;
    var el, results = [];
    for (; (el = this[i]); i++) {
      if (i === e) break;
      results.push(el);
    }
    return results;
  };
}

var bricks = function (selector, context) {
  return new bricks.fn.find(selector, context);
};

bricks.fn = bricks.prototype = {

  length: 0,

  extend: function (o) {
    for (var k in o) {
      this[k] = o[k];
    }
  },

  find: function (selector, context) {
    var els = [], attrs;

    if (!selector) {
      return this;
    }

    if (bricks.isFunction(selector)) {
      return bricks.ready(selector);
    }

    if (selector.nodeType) {
      this.selector = '';
      this.context = selector;
      return this.set([selector]);
    }

    if (selector.length === 1 && selector[0].nodeType) {
      this.selector = this.context = selector[0];
      return this.set(selector);
    }

    context = this.context ? this.context : (context || document);

    if (bricks.isPlainObject(context)) {
      attrs = context;
      context = document;
    }

    if (context instanceof bricks) {
      context = context.context;
    }

    if (bricks.isString(selector)) {
      this.selector = selector;
      if (idExp.test(selector) && context.nodeType === context.DOCUMENT_NODE) {
        els = (els = context.getElementById(selector.substr(1))) ? [els] : [];
      } else if (context.nodeType !== 1 && context.nodeType !== 9) {
        els = [];
      } else if (tagExp.test(selector)) {
        bricks.each(normalize(selector), function () {
          els.push(this);
        });
      } else {
        els = slice.call(
          classExp.test(selector) && context.getElementsByClassName !== undefined ? context.getElementsByClassName(selector.substr(1)) :
          tagNameExp.test(selector) ? context.getElementsByTagName(selector) :
          context.querySelectorAll(selector)
        );
      }
    } else if (selector.nodeName || selector === window) {
      els = [selector];
    } else if (bricks.isArray(selector)) {
      els = selector;
    }

    if (selector.selector !== undefined) {
      this.selector = selector.selector;
      this.context = selector.context;
    } else if (this.context === undefined) {
      if (els[0] !== undefined && !bricks.isString(els[0])) {
        this.context = els[0];
      } else {
        this.context = document;
      }
    }

    return this.set(els).each(function () {
      return attrs && bricks(this).attr(attrs);
    });
  },

  pluck: function (prop) {
    var result = [];
    this.each(function () {
      if (this[prop]) result.push(this[prop]);
    });
    return result;
  },

  each: function(target, callback) {
    var i, key;

    if (typeof target === 'function') {
      callback = target;
      target = this;
    }

    if (target === this || target instanceof Array) {
      for (i = 0; i < target.length; ++i) {
        if (callback.call(target[i], i, target[i]) === false) break;
      }
    } else {
      if (target instanceof bricks) {
        return bricks.each(slice.call(target), callback);
      } else if (bricks.isObject(target)) {
        for (key in target) {
          if (target.hasOwnProperty(key) && callback.call(target[key], key, target[key]) === false) break;
        }
      }
    }

    return target;
  },

  set: function (elements) {
    var i = 0, set = bricks();
    set.selector = this.selector;
    set.context = this.context;
    for (; i < elements.length; i++) {
      set[i] = elements[i];
    }
    set.length = i;
    return set;
  }
};

bricks.extend = function () {
  var target = arguments[0] || {};

  if (typeof target !== 'object' && typeof target !== 'function') {
    target = {};
  }

  if (arguments.length === 1) target = this;

  bricks.fn.each(slice.call(arguments), function (i, value) {
    for (var key in value) {
      if (target[key] !== value[key]) target[key] = value[key];
    }
  });

  return target;
};

bricks.fn.find.prototype = bricks.fn;

bricks.extend({

  each: bricks.fn.each,

  trim: function (str) {
    return str === null ? '' : str.trim ? str.trim() : ('' + str).replace(/^\s+|\s+$/g, '');
  },

  contains: function (parent, node) {
    return parent.contains ? parent != node && parent.contains(node) : !!(parent.compareDocumentPosition(node) & 16);
  },

  matches: function (el, selector) {
    if (!el || el.nodeType !== 1) return false;

    var matchesSelector = el.webkitMatchesSelector || el.mozMatchesSelector || el.oMatchesSelector || el.matchesSelector;
    if (matchesSelector) {
      return matchesSelector.call(el, selector);
    }

    if (document.querySelectorAll !== undefined) {
      var nodes = el.parentNode.querySelectorAll(selector);

      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i] === el) return true;
      }
    }

    return false;
  },

  isFunction: function (obj) {
    return typeof obj === 'function';
  },

  isArray: function (obj) {
    return obj instanceof Array;
  },

  isString: function (obj) {
    return typeof obj === 'string';
  },

  isNumeric: function (obj) {
    return typeof obj === 'number';
  },

  isObject: function (obj) {
    return obj instanceof Object && !this.isArray(obj) && !this.isFunction(obj) && !this.isWindow(obj);
  },

  isPlainObject: function (obj) {
    if (!obj || !this.isObject(obj) || this.isWindow(obj) || obj.nodeType) {
      return false;
    } else if (Object.getPrototypeOf(obj) === Object.prototype) {
      return true;
    } else {
      var key;
      for (key in obj) {}
      return key === undefined || {}.hasOwnProperty.call(obj, key);
    }
  },

  isWindow: function (obj) {
    return obj !== null && obj !== undefined && (obj === obj.window || 'setInterval' in obj);
  },

  parseJSON: function (str) {
    if (!this.isString(str) || !str) {
      return null;
    }

    str = this.trim(str);

    if (window.JSON && window.JSON.parse) {
      return window.JSON.parse(str);
    }

    try { return (new Function('return ' + str))(); }
    catch (e) { return null; }
  },

  inArray: function (val, arr, i) {
    return Array.prototype.indexOf ? arr.indexOf(val, i) : function () {
        var l = arr.length;
        i = i ? i < 0 ? Math.max(0, l + i) : i : 0;
        for (; i < l; i++) if (i in arr && arr[i] === val) return true;
        return -1;
      }();
  },

  noConflict: function (name) {
    if (name) {
      window.bricks = _bricks;
    }

    window.$ = _$;
    return bricks;
  }
});

bricks.fn.extend({

  addClass: function (value) {
    if (value && bricks.isString(value)) {
      return this.each(function (index, el) {
        if (el.nodeType === 1) {
          var classNames = value.split(/\s+/);
          if (!el.className && classNames.length === 1) {
            el.className = value;
          } else {
            var className = el.className;

            for (var i = 0; i < classNames.length; i++) {
              if (className.indexOf(classNames[i]) === -1) {
                className += ' ' + classNames[i];
              }
            }

            el.className = bricks.trim(className);
          }
        }
      });
    }
  },

  removeClass: function (value) {
    return this.each(function (index, el) {
      if (value && bricks.isString(value)) {
        var classNames = value.split(/\s+/);
        if (el.nodeType === 1 && el.className) {
          if (classNames.length === 1) {
           el.className = el.className.replace(value, '');
          } else {
            for (var i = 0; i < classNames.length; i++) {
              el.className = el.className.replace(classNames[i], '');
            }
          }

          el.className = bricks.trim(el.className.replace(/\s{2}/g, ' '));

          if (el.className === '') {
            el.removeAttribute('class');
          }
        }
      }
    });
  },

  hasClass: function (value) {
    var classNames = (this[0] ? this[0] : this).className.split(/\s+/),
      values = value.split(/\s+/),
      i = 0;

    if (values.length > 1) {
      var hasClasses = false;
      for (i = 0; i < values.length; i++) {
        hasClasses = this.hasClass.call(this, values[i]);
      }
      return hasClasses;
    } else if (bricks.isString(value)) {
      for (i = 0; i < classNames.length; i++) {
        if (classNames[i] === value) return true;
      }
      return false;
    }
  },

  attr: function (name, value) {
    if (bricks.isObject(name)) {
      return this.each(function () {
        for (var key in name) {
          if (this.setAttribute) {
            // Firefox 3.5 fix "null + '';"
            this.setAttribute(key, name[key] === null ? name[key] + '' : name[key]);
          }
        }
      });
    } else if ((value || value === null || value === false) && bricks.isString(name)) {
      return this.each(function () {
        if (this.setAttribute) {
          // Firefox 3.5 fix "null + '';"
          this.setAttribute(name, value === null ? value + '' : value);
        }
      });
    } else if (bricks.isString(name)) {
      var attribute;
      for (var i = 0; i < this.length; i++) {
        if (this[i].getAttribute !== undefined && (attribute = this[i].getAttribute(name)) !== null) {
          break;
        } else {
          continue;
        }
      }
      return attribute || undefined;
    }
  },

  data: function (name, value) {
    value = this.attr('data-' + name, serializeValue(value));
    return value instanceof bricks ? value : deserializeValue(value);
  },

  removeAttr: function (name) {
    return this.each(function () {
      if (name && this.nodeType === 1) {
        var attrNames = name.split(/\s+/);
        for (var i = 0; i < attrNames.length; i++) {
          this.removeAttribute(attrNames[i]);
        }
      }
    });
  }
});

function serializeValue (value) {
  try {
    return value ? (bricks.isPlainObject(value) || bricks.isArray(value)) &&
    JSON.stringify ? JSON.stringify(value) : value : value;
  } catch (e) {
    return value;
  }
}

function deserializeValue (value) {
  var num;
  try {
    return value ? value === 'true' || (value === 'false' ? false :
    value === 'null' ? null : !isNaN(num = Number(value)) ? num :
    /^[\[\{]/.test(value) ? bricks.parseJSON(value) : value) : value;
  } catch (e) {
    return value;
  }
}

var domReady = (function () {
  var addEventListener = !!document.addEventListener,
      isReady = false,
      toplevel = false,
      testEl = document.documentElement,
      fns = [];

  if (addEventListener) {
    document.addEventListener('DOMContentLoaded', done, true);
    window.addEventListener('load', ready, false);
  } else {
    document.attachEvent('onreadystatechange', done);
    window.attachEvent('onload', ready);

    if (testEl.doScroll && window === window.top) {
      scrollCheck();
    }
  }

  function done () {
    if (addEventListener) {
      document.removeEventListener('DOMContentLoaded', done, false);
    } else {
      document.readyState === 'complete' && document.detachEvent('onreadystatechange', done);
    }
    ready();
  }

  function scrollCheck () {
    if (isReady) return;

    try {
      testEl.doScroll('left');
    } catch(e) {
      setTimeout(scrollCheck, 10);
    }

    ready();
  }

  function ready () {
    if (isReady) return;

    isReady = true;

    for (var i = 0; i < fns.length; i++) {
      fns[i].call(document, bricks);
    }
  }

  return function (callback) {
    return isReady ? callback.call(document, bricks) : fns.push(callback);
  };
})();

bricks.ready = bricks.fn.ready = domReady;

var _eventId = 1,
  c = window.c = {},
  returnTrue = function () { return true; },
  returnFalse = function () { return false; },
  ignoreProperties = /^([A-Z]|layer[XY]$)/,
  sepcialExp = /click|mouse/,
  mouse = {
      mouseenter: 'mouseover',
      mouseleave: 'mouseout'
  },
  eventMethods = {
      preventDefault: 'isDefaultPrevented',
      stopImmediatePropagation: 'isStopImmediatePropagation',
      stopPropagation: 'isPropagationStopped'
  },
  opcHandler,
  opcCache = {},
  createEvent = !!document.createEvent;

function getEventParts (event) {
  var parts = ('' + event).split('.');
  return { ev: parts[0], ns: parts.slice(1).sort().join(' ') };
}

function realEvent (event) {
  return mouse[event] || event;
}

function getEventId (el) {
  return el._eventId || (el._eventId = _eventId++);
}

function inHandlers (parts, handlers) {
  for (var i = 0; i < handlers.length; i++) {
    if (handlers[i].realEvent === realEvent(parts.ev) || handlers[i].ns === parts.ns) {
      return true;
    }
  }
  return false;
}

function getEventHandlers (id, event) {
  var parts = getEventParts(event),
    handlers = [],
    tmp,
    ns;

  event = realEvent(parts.ev);
  ns = parts.ns;

  if (!event.length && !parts.ns.length) {
    return handlers;
  }

  c[id] = c[id] || {};

  if (event.length) {
    handlers = c[id][event] = c[id][event] || [];
  }

  if (parts.ns.length) {
    for (event in c[id]) {
      tmp = c[id][event];
      for (var i = 0, l = tmp.length; i < l; i++) {
        if (tmp[i] && ns.length && tmp[i].ns.length && bricks.inArray(ns, tmp[i].ns.split(' ')) !== -1) {
          handlers.push(tmp[i]);
        }
      }
    }
  }

  return handlers;
}

function createEventHandler (el, event, callback, _callback) {
  var id = getEventId(el),
    handlers = getEventHandlers(id, event),
    parts = getEventParts(event),
    cb = callback || _callback;

  var fn = function (event) {
    if (!event.liveTarget) event.liveTarget = event.target || event.srcElement;
    var data = event.data;
    if (bricks.isString(data) && /^[\[\{]/.test(data)) data = bricks.parseJSON(event.data);
    var result = cb.apply(el, [event].concat(data));
    if (result === false) {
      if (event.stopPropagation) event.stopPropagation();
      if (event.preventDefault) event.preventDefault();
    }
    return result;
  };
  fn._i = cb._i = cb._i || ++_eventId;
  fn.realEvent = realEvent(parts.ev);
  fn.ns = parts.ns;
  handlers.push(fn);
  return fn;
}

function createProxy (event) {
  var proxy = { originalEvent: event };

  for (var key in event) {
    if (!ignoreProperties.test(key) && event[key] !== undefined) {
      proxy[key] = event[key];
    }
    for (var name in eventMethods) {
      proxy[name] = function () {
        this[eventMethods[name]] = returnTrue;
        return event[name].apply(event, arguments);
      };
      proxy[eventMethods[name]] = returnFalse;
    }
  }

  return proxy;
}

function addEvent (el, events, callback, selector) {
  var fn, _callback;

  if (bricks.isString(selector)) {
    _callback = callback;
    fn = function () {
      return (function (el, callback, selector) {
        return function (e) {
          var match = bricks(el).find(e.target || e.srcElement);
          match = match.get(0) === el ? match.find(selector) : match;
          if (match.is(selector)) {
            var event = bricks.extend(createProxy(e), {
              currentTarget: match.get(0)
            });

            return callback.apply(match, [event].concat(slice.call(arguments, 1)));
          }
        };
      }(el, callback, selector));
    };
  } else {
    callback = selector;
    selector = undefined;
  }

  bricks.each(events.split(/\s/), function (index, event) {
    var parts = getEventParts(event);

    if (_callback !== undefined && parts.ev in mouse) {
      var _fn = fn();
      fn = function () {
        return function (e) {
          var related = e.relatedTarget;
          if (!related || (related !== this && !bricks.contains(this, related))) {
            return _fn.apply(this, arguments);
          }
        };
      };
    }

    var handler = createEventHandler(el, event, fn && fn() || callback, _callback);

    event = realEvent(parts.ev);

    if (selector) handler.selector = selector;

    if (el.addEventListener) {
      el.addEventListener(event, handler, false);
    } else if (el.attachEvent) {
      el.attachEvent('on' + event, handler);
    }
  });
}

function testEventHandler (parts, callback, selector, handler) {
  return callback === undefined &&
    (handler.selector === selector ||
      handler.realEvent === parts.ev ||
      handler.ns === parts.ns) ||
      callback._i === handler._i;
}

function removeEvent (el, events, callback, selector) {
  var id = getEventId(el);

  if (callback === undefined && bricks.isFunction(selector)) {
    callback = selector;
    selector = undefined;
  }

  bricks.each(events.split(/\s/), function (index, event) {
    var handlers = getEventHandlers(id, event),
      parts = getEventParts(event);

    event = realEvent(parts.ev);

    for (var i = 0; i < handlers.length; i++) {
      if (testEventHandler(parts, callback, selector, handlers[i])) {
        event = (event || handlers[i].realEvent);
        if (el.removeEventListener) {
          el.removeEventListener(event, handlers[i], false);
        } else if (el.detachEvent) {
          var name = 'on' + event;
          if (bricks.isString(el[name])) el[name] = null;
          el.detachEvent(name, handlers[i]);
          if (opcCache[el.nodeName]) { 
            el.detachEvent('onpropertychange', opcHandler);
            delete opcCache[el.nodeName];
          }
        }
        c[id][event] = splice.call(c[id][event], i, 1);
        c[id][event].length = i < 0 ? c[id][event].length + 1 : i;
      }
    }
    if (c[id] && c[id][event] && !c[id][event].length) delete c[id][event];
  });
  for (var k in c[id]) return;
  delete c[id];
}

bricks.events = bricks.events || {};

bricks.fn.extend({

  on: function (events, selector, callback) {
    return this.each(function () {
      addEvent(this, events, callback, selector);
    });
  },

  off: function (events, selector, callback) {
    return this.each(function () {
      removeEvent(this, events, callback, selector);
    });
  },

  trigger: function (event, data, _el) {
    return this.each(function (i, el) {
      if (el === document && !el.dispatchEvent) el = document.documentElement;

      var parts = getEventParts(event.type || event);

      event = bricks.Event(event);
      event.data = data || {};

      if (bricks.isString(event.data) && !bricks.isString(data) && JSON.stringify) {
        event.data = JSON.stringify(data);
      }

      if (createEvent) {
        el.dispatchEvent(event);
      } else {
        if (el._eventId > 0) {
          try { 
            el.fireEvent('on' + event.type, event);
          } catch (e) { 
            if (!opcCache[el.nodeName]) {
              opcHandler = opcHandler || function (ev) {
                if (ev.eventName && ev.srcElement._eventId) {
                  var handlers = getEventHandlers(ev.srcElement._eventId, ev.eventName);
                  if (handlers.length) {
                    for (var i = 0, l = handlers.length; i < l; i++) {
                      if (bricks.isFunction(handlers[i])) handlers[i](ev);
                    }
                  }
                }
              };
              el.attachEvent('onpropertychange', opcHandler);
            }
            opcCache[el.nodeName] = opcCache[el.nodeName] || true;
            el.fireEvent('onpropertychange', event);
          }
        }
      }

      if (!event.isPropagationStopped()) {
        var parent = el.parentNode || el.ownerDocument;
        if (parent && parent._eventId > 0) {
          event.liveTarget = el;
          bricks(parent).trigger(event, data);
        } else {
          event.stopPropagation();
        }
      }
    });
  }

});

bricks.Event = function (type, props) {
  if (!bricks.isString(type)) {
    if (type.type) return type;
    props = type;
    type = props.type;
  }

  var event;

  if (createEvent) {
    event = document.createEvent((sepcialExp.test(type) ? 'Mouse' : '') + 'Events');
    event.initEvent(realEvent(type), true, true, null, null, null, null, null, null, null, null, null, null, null, null);
  } else {
    event = document.createEventObject();
    event.cancelBubble = true;
  }

  if (props !== undefined) {
    for (var name in props) {
      (name === 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name]);
    }
  }

  event.isPropagationStopped = returnFalse;
  event.stopPropagation = function () {
    this.isPropagationStopped = returnTrue;
    var e = this.originalEvent;
    if(!e) return;
    if (e.stopPropagation) e.stopPropagation();
    e.returnValue = false;
  };

  event.isDefaultPrevented = returnTrue;
  event.preventDefault = function () {
    this.isDefaultPrevented = returnTrue;
    var e = this.originalEvent;
    if(!e) return;
    if (e.preventDefault) e.preventDefault();
    e.returnValue = false;
  };

  if (!event.type.length) {
    event.type = realEvent(type);
  }

  event.eventName = event.type;

  return event;
};
var wrapTags = /^(select|fieldset|table|tbody|tfoot|td|tr|colgroup)$/i,
  wrapMap = {
      thead: ['<table>', '</table>', 1],
      col: ['<table><colgroup>', '</colgroup></table>', 2],
      tr: ['<table><tbody>', '</tbody></table>', 2],
      td: ['<table><tbody><tr>', '</tr></tbody></table>', 3]
    };

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

function isNode (node) {
  return node && node.nodeName && (node.nodeType === 1 || node.nodeType === 11);
}

function normalize (node) {
  if (node instanceof bricks) {
    var els = [];
    node.each(function (i, el) {
      el = normalize(el);
      el = el ? el[0] : '';
      els.push(el);
    });
    return els;
  }
  return bricks.isString(node) ? wrap(node) : isNode(node) ? [node] : node;
}

function wrap (node) {
  return typeof node === 'string' && node !== '' ? function () {
    var tag = tagExp.exec(node),
      el = document.createElement('div'),
      wrap = tag ? wrapMap[tag[1].toLowerCase()] : null,
      level = wrap ? wrap[2] + 1 : 1;
    el.innerHTML = wrap ? (wrap[0] + node + wrap[1]) : node;
    while (level--) el = el.firstChild;
    return [el];
  }() : isNode(node) ? [node.cloneNode(true)] : [];
}

function nodeName (el, name) {
  return el.nodeName.toLowerCase() === name.toLowerCase();
}

function target (el, html) {
  return nodeName(el, 'table') && tagExp.test(html) && tagExp.exec(html)[1] === 'tr' ?
    el.getElementsByTagName('tbody')[0] || el.appendChild(el.ownerDocument.createElement('tbody')) :
    el;
}

bricks.fn.extend({

  append: function (node) {
    return this.each(function (i, el) {
      bricks.each(normalize(node), function () {
        target(el, node).appendChild(this);
      });
    });
  },

  prepend: function (node) {
    return this.each(function (i, el) {
      var first = target(el, node).firstChild;
      bricks.each(normalize(node), function () {
        if (first) {
          first.parentNode.insertBefore(this, first);
        } else {
          target(el, node).appendChild(this);
        }
      });
    });
  },

  before: function (node) {
    return this.each(function (i, el) {
      bricks.each(normalize(node), function () {
        el.parentNode.insertBefore(this, el);
      });
    });
  },

  after: function (node) {
    return this.each(function (i, el) {
      bricks.each(normalize(node), function () {
        el.parentNode.insertBefore(this, el.nextSibling);
      });
    });
  },

  remove: function () {
    return this.each(function () {
      this.parentNode.removeChild(this);
    });
  },

  html: function (html) {
    if (html === undefined) {
      return this[0] ? this[0].innerHTML : undefined;
    }

    return this.each(function () {
      try {
        if ((bricks.isString(html) || bricks.isNumeric(html)) && !wrapTags.test(this.tagName)) {
          return this.innerHTML = html;
        }
      } catch (e) {}
      var el = this;
      bricks.each(normalize(this), function () {
        return el.appendChild(this);
      });
    });
  },

  is: function (selector) {
    return this[0] && bricks.matches(this[0], selector);
  },

  closest: function (selector, context) {
    var node = this[0];

    while (node && !bricks.matches(node, selector)) {
      node = node.parentNode;
      if (!node || !node.ownerDocument || node === context || node.nodeType === 11) break;
    }

    return bricks(node);
  },

  parent: function (selector) {
    var parent = this.pluck('parentNode');
    return selector === undefined ? bricks(parent) : bricks(parent).filter(selector);
  },

  children: function (selector) {
    var children = [];
    this.each(function () {
      bricks.each(slice.call(this.children), function (i, value) {
        children.push(value);
      });
    });
    return selector === undefined ? bricks(children) : bricks(children).filter(selector);
  },


  text: function (text) {
    if (text === undefined) {
      return this[0] ? this[0].textContent === undefined ? this[0].innerText : this[0].textContent : '';
    } else {
      return this.each(function () {
        this.textContent = text;
      });
    }
  },

  val: function (value) {
    if (!arguments.length) {
      if (this[0]) {
        return this[0].multiple ? this.find('option').filter(function () {
          return this.selected;
        }).pluck('value') : this[0].value;
      }

      return undefined;
    } else {
      return this.each(function () {
        if (this.nodeType !== 1) {
          return;
        } else if (value === null || value === undefined) {
          value = '';
        } else if (bricks.isNumeric(value)) {
          value += '';
        }
        this.value = value;
      });
    }
  },

  empty: function () {
    return this.each(function () {
      while (this.hasChildNodes()) {
        this.removeChild(this.childNodes[0]);
      }
    });
  }

});

bricks.each({
  appendTo: 'append',
  prependTo: 'prepend',
  insertBefore: 'before',
  insertAfter: 'after'
}, 

function (key, value) {
  bricks.fn[key] = function (selector) {
    return bricks(selector)[value](this);
  };
});
bricks.fn.extend({

  filter: function (obj) {
    if (bricks.isFunction(obj)) {
      var els = [];
      this.each(function (index, el) {
        if (obj.call(el, index)) {
          els.push(el);
        }
      });
      return bricks(els);
    } else {
      return this.filter(function () {
        return bricks.matches(this, obj);
      });
    }
  },

  not: function (selector) {
    return this.filter(function () {
      return !bricks.matches(this, selector);
    });
  },

  eq: function (index) {
    return index === -1 ? bricks(slice.call(this, this.length -1)) : bricks(slice.call(this, index, index + 1));
  },

  get: function (index) {
    return index === undefined ? slice.call(this) : this[index >= 0 ? index : index + this.length];
  },

  clone: function () {
    var els = [];
    this.each(function () {
      els.push(this.cloneNode(true));
    });
    return bricks(els);
  },

  toggle: function (state) {
    return this.each(function () {
      var el = $(this);
      el[(state === undefined ? el.css('display') === 'none' : state) ? 'show': 'hide']();
    });
  },

  toggleClass: function (name, state) {
    return this.each(function (i) {
      var el = $(this);
      name = bricks.isFunction(name) ? name.call(this, i, el.attr('class'), state) : bricks.isString(name) ? name : '';
      bricks.each(name.split(/\s+/g), function (i, klass) {
        el[(state === undefined ? !el.hasClass(klass) : state) ? 'addClass' : 'removeClass'](klass);
      });
    });
  }
});
bricks.fn.extend({

  css: function (prop, value) {
    if (bricks.isString(prop) && value === undefined) {
      return this.length > 0 ? getPropertyValue(this[0], prop) : undefined;
    }

    return this.each(function () {
      if (this.style !== undefined) {
        if (bricks.isString(prop)) {
          this.style[prop] = value;
        } else {
          for (var key in prop) {
            this.style[key] = prop[key];
          }
        }
      }
    });
  },

  hide: function () {
    return this.css('display', 'none');
  },

  show: function () {
    return this.each(function () {
      if (this.style !== undefined) {
        try {
          if (this.style.display === 'none') this.style.display = null;
        } catch (e) {}
        if (getPropertyValue(this, 'display') === 'none') this.style.display = 'block';
      }
    });
  }
});

function getPropertyValue(el, prop) {
  var value = '';
  if (document.defaultView && document.defaultView.getComputedStyle) {
    prop = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
    value = document.defaultView.getComputedStyle(el, '').getPropertyValue(prop);
  }

  if (!!value && value.length) {
    value = value;
  } else if (el.currentStyle) {
    value = el.currentStyle[prop] || el.style[prop];
  } else {
    value = el.style[prop];
  }

  return !!value ? value : '';
}

function ajaxJSONP (url, options) {
  var name = (name = /callback\=([A-Za-z0-9\-\.]+)/.exec(url)) ? name[1] : 'jsonp' + (+new Date()),
    el = document.createElement('script'),
    abortTimeout = null,

    cleanUp = function () {
        if (abortTimeout !== null) clearTimeout(abortTimeout);
        bricks(el).remove();
        try { delete window[name]; }
        catch (e) { window[name] = undefined; }
    },

    abort = function (error) {
        cleanUp();
        if (error === 'timeout') window[name] = noop;
        if (bricks.isFunction(options.error)) options.error(error, options);
    };

  el.onerror = function () {
    abort('error');
  };

  if (options.timeout > 0) {
    abortTimeout = setTimeout(function () {
      abort('timeout');
    }, options.timeout);
  }

  window[name] = function (data) {
    bricks(el).remove();
    try { delete window[name]; }
    catch (e) { window[name] = undefined; }
    bricks.ajaxSuccess(data, null, options);
  };

  options.data = bricks.param(options.data);
  el.src = url.replace(/\=\?/, '=' + name);
  bricks('head')[0].appendChild(el);
}

bricks.extend({

  ajax: function (url, options) {
    options = options || bricks.ajaxSettings;

    if (bricks.isObject(url)) {
      if (bricks.isFunction(options)) {
        url.success = url.success || options;
      }
      options = url;
      url = options.url;
    }

    if (bricks.isFunction(options)) options = { success: options };

    for (var opt in bricks.ajaxSettings) {
      if (!options.hasOwnProperty(opt)) {
        options[opt] = bricks.ajaxSettings[opt];
      }
    }

    if (!url) return options.xhr();

    var xhr = options.xhr(),
      error = 'error',
      abortTimeout = null,
      jsonp = options.dataType === 'jsonp',
      mime = {
          html: 'text/html',
          text: 'text/plain',
          xml: 'application/xml, text/xml',
          json: 'application/json'
        },
      params = bricks.param(options.data) !== '' ? bricks.param(options.data) : options.data;

    for (var k in mime) {
      if (url.indexOf('.' + k) !== -1 && !options.dataType) options.dataType = k;
    }

    if (jsonp || /\=\?|callback\=/.test(url)) {
      if (!/\=\?/.test(url)) url = (url + '&callback=?').replace(/[&?]{1,2}/, '?');
      return ajaxJSONP(url, options);
    }

    if (bricks.isFunction(options.beforeOpen)) {
      var bc = options.beforeOpen(xhr, options);
      if (!bc) {
        xhr.abort();
        return xhr;
      }
      xhr = bc;
    }

    if (xhr) {
      xhr.open(options.type, url, true);

      if ((mime = mime[options.dataType.toLowerCase()]) !== undefined) {
        xhr.setRequestHeader('Accept', mime);
        if (mime.indexOf(',') !== -1) mime = mime.split(',')[0];
        if (xhr.overrideMimeType) xhr.overrideMimeType(mime);
      }

      if (options.contentType || options.data && options.type !== 'GET') {
        xhr.setRequestHeader('Content-Type', (options.contentType || 'application/x-www-form-urlencoded'));
      }

      for (var key in options.headers) {
        if (options.headers.hasOwnProperty(key)) {
          xhr.setRequestHeader(key, options.headers[key]);
        }
      }

      if (options.timeout > 0) {
        abortTimeout = setTimeout(function () {
          error = 'timeout';
          xhr.abort();
        }, options.timeout);
      }

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
            if (options.success !== undefined) {
              bricks.ajaxSuccess(null, xhr, options);
            }
          } else if (options.error !== undefined) {
            if (abortTimeout !== null) clearTimeout(abortTimeout);
            options.error(error, options, xhr);
          }
        }
      };

      if (bricks.isFunction(options.beforeSend)) {
        var bs = options.beforeSend(xhr, options);
        if (bs !== false) {
          xhr.send(params);
        }
        xhr = bs;
      } else {
        xhr.send(params);
      }

      return xhr;
    }
  },

  ajaxSettings: {

    beforeOpen: null,
    beforeSend: null,
    contentType: 'application/x-www-form-urlencoded',
    data: {},
    dataType: '',
    error: noop,
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    },
    success: noop,
    timeout: 0,
    type: 'GET',
    url: '',

    xhr: function () {
      var xhr = null;
      if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
      } else if (window.ActiveXObject) { // < IE 9
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
      }
      return xhr;
    }
  },

  ajaxSuccess: function (data, xhr, options) {
    var res;
    if (xhr) {
      if ((options.dataType === 'json' || false) && (res = bricks.parseJSON(xhr.responseText)) === null) res = xhr.responseText;
      if (options.dataType === 'xml') res = xhr.responseXML;
      res = res || xhr.responseText;
    }
    if (!res && data) res = data;
    if (bricks.isFunction(options.success)) options.success(res);
  },

  param: function (obj, prefix) {
    var str = [];
    this.each(obj, function (p, v) {
      var k = prefix ? prefix + '[' + p + ']' : p;
      str.push(bricks.isObject(v) ? bricks.param(v, k) : encodeURIComponent(k) + '=' + encodeURIComponent(v));
    });
    return str.join('&').replace('%20', '+');
  }
});


  window.$ = window.bricks = window.bs = window._ = bricks;

})(window);
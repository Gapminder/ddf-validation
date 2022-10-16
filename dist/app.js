// output/Control.Apply/foreign.js
var arrayApply = function(fs) {
  return function(xs) {
    var l = fs.length;
    var k = xs.length;
    var result = new Array(l * k);
    var n = 0;
    for (var i = 0; i < l; i++) {
      var f = fs[i];
      for (var j = 0; j < k; j++) {
        result[n++] = f(xs[j]);
      }
    }
    return result;
  };
};

// output/Control.Semigroupoid/index.js
var semigroupoidFn = {
  compose: function(f) {
    return function(g) {
      return function(x) {
        return f(g(x));
      };
    };
  }
};

// output/Control.Category/index.js
var identity = function(dict) {
  return dict.identity;
};
var categoryFn = {
  identity: function(x) {
    return x;
  },
  Semigroupoid0: function() {
    return semigroupoidFn;
  }
};

// output/Data.Boolean/index.js
var otherwise = true;

// output/Data.Function/index.js
var flip = function(f) {
  return function(b) {
    return function(a) {
      return f(a)(b);
    };
  };
};
var $$const = function(a) {
  return function(v) {
    return a;
  };
};

// output/Data.Functor/foreign.js
var arrayMap = function(f) {
  return function(arr) {
    var l = arr.length;
    var result = new Array(l);
    for (var i = 0; i < l; i++) {
      result[i] = f(arr[i]);
    }
    return result;
  };
};

// output/Data.Unit/foreign.js
var unit = void 0;

// output/Type.Proxy/index.js
var $$Proxy = /* @__PURE__ */ function() {
  function $$Proxy2() {
  }
  ;
  $$Proxy2.value = new $$Proxy2();
  return $$Proxy2;
}();

// output/Data.Functor/index.js
var map = function(dict) {
  return dict.map;
};
var mapFlipped = function(dictFunctor) {
  var map111 = map(dictFunctor);
  return function(fa) {
    return function(f) {
      return map111(f)(fa);
    };
  };
};
var $$void = function(dictFunctor) {
  return map(dictFunctor)($$const(unit));
};
var functorArray = {
  map: arrayMap
};

// output/Control.Apply/index.js
var identity2 = /* @__PURE__ */ identity(categoryFn);
var applyArray = {
  apply: arrayApply,
  Functor0: function() {
    return functorArray;
  }
};
var apply = function(dict) {
  return dict.apply;
};
var applyFirst = function(dictApply) {
  var apply1 = apply(dictApply);
  var map24 = map(dictApply.Functor0());
  return function(a) {
    return function(b) {
      return apply1(map24($$const)(a))(b);
    };
  };
};
var applySecond = function(dictApply) {
  var apply1 = apply(dictApply);
  var map24 = map(dictApply.Functor0());
  return function(a) {
    return function(b) {
      return apply1(map24($$const(identity2))(a))(b);
    };
  };
};
var lift2 = function(dictApply) {
  var apply1 = apply(dictApply);
  var map24 = map(dictApply.Functor0());
  return function(f) {
    return function(a) {
      return function(b) {
        return apply1(map24(f)(a))(b);
      };
    };
  };
};

// output/Control.Applicative/index.js
var pure = function(dict) {
  return dict.pure;
};
var when = function(dictApplicative) {
  var pure19 = pure(dictApplicative);
  return function(v) {
    return function(v1) {
      if (v) {
        return v1;
      }
      ;
      if (!v) {
        return pure19(unit);
      }
      ;
      throw new Error("Failed pattern match at Control.Applicative (line 63, column 1 - line 63, column 63): " + [v.constructor.name, v1.constructor.name]);
    };
  };
};
var liftA1 = function(dictApplicative) {
  var apply8 = apply(dictApplicative.Apply0());
  var pure19 = pure(dictApplicative);
  return function(f) {
    return function(a) {
      return apply8(pure19(f))(a);
    };
  };
};

// output/Control.Bind/foreign.js
var arrayBind = function(arr) {
  return function(f) {
    var result = [];
    for (var i = 0, l = arr.length; i < l; i++) {
      Array.prototype.push.apply(result, f(arr[i]));
    }
    return result;
  };
};

// output/Control.Bind/index.js
var identity3 = /* @__PURE__ */ identity(categoryFn);
var discard = function(dict) {
  return dict.discard;
};
var bindArray = {
  bind: arrayBind,
  Apply0: function() {
    return applyArray;
  }
};
var bind = function(dict) {
  return dict.bind;
};
var bindFlipped = function(dictBind) {
  return flip(bind(dictBind));
};
var composeKleisliFlipped = function(dictBind) {
  var bindFlipped1 = bindFlipped(dictBind);
  return function(f) {
    return function(g) {
      return function(a) {
        return bindFlipped1(f)(g(a));
      };
    };
  };
};
var discardUnit = {
  discard: function(dictBind) {
    return bind(dictBind);
  }
};
var join = function(dictBind) {
  var bind12 = bind(dictBind);
  return function(m) {
    return bind12(m)(identity3);
  };
};

// output/Control.Monad.Trans.Class/index.js
var lift = function(dict) {
  return dict.lift;
};

// output/Data.Array/foreign.js
var range = function(start) {
  return function(end) {
    var step2 = start > end ? -1 : 1;
    var result = new Array(step2 * (end - start) + 1);
    var i = start, n = 0;
    while (i !== end) {
      result[n++] = i;
      i += step2;
    }
    result[n] = i;
    return result;
  };
};
var replicateFill = function(count) {
  return function(value2) {
    if (count < 1) {
      return [];
    }
    var result = new Array(count);
    return result.fill(value2);
  };
};
var replicatePolyfill = function(count) {
  return function(value2) {
    var result = [];
    var n = 0;
    for (var i = 0; i < count; i++) {
      result[n++] = value2;
    }
    return result;
  };
};
var replicate = typeof Array.prototype.fill === "function" ? replicateFill : replicatePolyfill;
var fromFoldableImpl = function() {
  function Cons3(head4, tail2) {
    this.head = head4;
    this.tail = tail2;
  }
  var emptyList = {};
  function curryCons(head4) {
    return function(tail2) {
      return new Cons3(head4, tail2);
    };
  }
  function listToArray(list) {
    var result = [];
    var count = 0;
    var xs = list;
    while (xs !== emptyList) {
      result[count++] = xs.head;
      xs = xs.tail;
    }
    return result;
  }
  return function(foldr5) {
    return function(xs) {
      return listToArray(foldr5(curryCons)(emptyList)(xs));
    };
  };
}();
var length = function(xs) {
  return xs.length;
};
var unconsImpl = function(empty6) {
  return function(next) {
    return function(xs) {
      return xs.length === 0 ? empty6({}) : next(xs[0])(xs.slice(1));
    };
  };
};
var indexImpl = function(just) {
  return function(nothing) {
    return function(xs) {
      return function(i) {
        return i < 0 || i >= xs.length ? nothing : just(xs[i]);
      };
    };
  };
};
var findIndexImpl = function(just) {
  return function(nothing) {
    return function(f) {
      return function(xs) {
        for (var i = 0, l = xs.length; i < l; i++) {
          if (f(xs[i]))
            return just(i);
        }
        return nothing;
      };
    };
  };
};
var concat = function(xss) {
  if (xss.length <= 1e4) {
    return Array.prototype.concat.apply([], xss);
  }
  var result = [];
  for (var i = 0, l = xss.length; i < l; i++) {
    var xs = xss[i];
    for (var j = 0, m = xs.length; j < m; j++) {
      result.push(xs[j]);
    }
  }
  return result;
};
var filter = function(f) {
  return function(xs) {
    return xs.filter(f);
  };
};
var sortByImpl = function() {
  function mergeFromTo(compare5, fromOrdering, xs1, xs2, from2, to) {
    var mid;
    var i;
    var j;
    var k;
    var x;
    var y;
    var c;
    mid = from2 + (to - from2 >> 1);
    if (mid - from2 > 1)
      mergeFromTo(compare5, fromOrdering, xs2, xs1, from2, mid);
    if (to - mid > 1)
      mergeFromTo(compare5, fromOrdering, xs2, xs1, mid, to);
    i = from2;
    j = mid;
    k = from2;
    while (i < mid && j < to) {
      x = xs2[i];
      y = xs2[j];
      c = fromOrdering(compare5(x)(y));
      if (c > 0) {
        xs1[k++] = y;
        ++j;
      } else {
        xs1[k++] = x;
        ++i;
      }
    }
    while (i < mid) {
      xs1[k++] = xs2[i++];
    }
    while (j < to) {
      xs1[k++] = xs2[j++];
    }
  }
  return function(compare5) {
    return function(fromOrdering) {
      return function(xs) {
        var out;
        if (xs.length < 2)
          return xs;
        out = xs.slice(0);
        mergeFromTo(compare5, fromOrdering, out, xs.slice(0), 0, xs.length);
        return out;
      };
    };
  };
}();
var zipWith = function(f) {
  return function(xs) {
    return function(ys) {
      var l = xs.length < ys.length ? xs.length : ys.length;
      var result = new Array(l);
      for (var i = 0; i < l; i++) {
        result[i] = f(xs[i])(ys[i]);
      }
      return result;
    };
  };
};
var unsafeIndexImpl = function(xs) {
  return function(n) {
    return xs[n];
  };
};

// output/Data.Semigroup/foreign.js
var concatString = function(s1) {
  return function(s2) {
    return s1 + s2;
  };
};
var concatArray = function(xs) {
  return function(ys) {
    if (xs.length === 0)
      return ys;
    if (ys.length === 0)
      return xs;
    return xs.concat(ys);
  };
};

// output/Data.Symbol/index.js
var reflectSymbol = function(dict) {
  return dict.reflectSymbol;
};

// output/Record.Unsafe/foreign.js
var unsafeGet = function(label) {
  return function(rec) {
    return rec[label];
  };
};

// output/Data.Semigroup/index.js
var semigroupString = {
  append: concatString
};
var semigroupArray = {
  append: concatArray
};
var append = function(dict) {
  return dict.append;
};

// output/Control.Alt/index.js
var alt = function(dict) {
  return dict.alt;
};

// output/Control.Monad/index.js
var ap = function(dictMonad) {
  var bind7 = bind(dictMonad.Bind1());
  var pure19 = pure(dictMonad.Applicative0());
  return function(f) {
    return function(a) {
      return bind7(f)(function(f$prime) {
        return bind7(a)(function(a$prime) {
          return pure19(f$prime(a$prime));
        });
      });
    };
  };
};

// output/Data.Bounded/foreign.js
var topChar = String.fromCharCode(65535);
var bottomChar = String.fromCharCode(0);
var topNumber = Number.POSITIVE_INFINITY;
var bottomNumber = Number.NEGATIVE_INFINITY;

// output/Data.Ord/foreign.js
var unsafeCompareImpl = function(lt) {
  return function(eq6) {
    return function(gt) {
      return function(x) {
        return function(y) {
          return x < y ? lt : x === y ? eq6 : gt;
        };
      };
    };
  };
};
var ordIntImpl = unsafeCompareImpl;
var ordStringImpl = unsafeCompareImpl;
var ordCharImpl = unsafeCompareImpl;

// output/Data.Eq/foreign.js
var refEq = function(r1) {
  return function(r2) {
    return r1 === r2;
  };
};
var eqIntImpl = refEq;
var eqCharImpl = refEq;
var eqStringImpl = refEq;

// output/Data.Eq/index.js
var eqString = {
  eq: eqStringImpl
};
var eqInt = {
  eq: eqIntImpl
};
var eqChar = {
  eq: eqCharImpl
};
var eq = function(dict) {
  return dict.eq;
};

// output/Data.Ordering/index.js
var LT = /* @__PURE__ */ function() {
  function LT2() {
  }
  ;
  LT2.value = new LT2();
  return LT2;
}();
var GT = /* @__PURE__ */ function() {
  function GT2() {
  }
  ;
  GT2.value = new GT2();
  return GT2;
}();
var EQ = /* @__PURE__ */ function() {
  function EQ2() {
  }
  ;
  EQ2.value = new EQ2();
  return EQ2;
}();

// output/Data.Ring/foreign.js
var intSub = function(x) {
  return function(y) {
    return x - y | 0;
  };
};

// output/Data.Semiring/foreign.js
var intAdd = function(x) {
  return function(y) {
    return x + y | 0;
  };
};
var intMul = function(x) {
  return function(y) {
    return x * y | 0;
  };
};

// output/Data.Semiring/index.js
var semiringInt = {
  add: intAdd,
  zero: 0,
  mul: intMul,
  one: 1
};

// output/Data.Ring/index.js
var ringInt = {
  sub: intSub,
  Semiring0: function() {
    return semiringInt;
  }
};

// output/Data.Ord/index.js
var ordString = /* @__PURE__ */ function() {
  return {
    compare: ordStringImpl(LT.value)(EQ.value)(GT.value),
    Eq0: function() {
      return eqString;
    }
  };
}();
var ordInt = /* @__PURE__ */ function() {
  return {
    compare: ordIntImpl(LT.value)(EQ.value)(GT.value),
    Eq0: function() {
      return eqInt;
    }
  };
}();
var ordChar = /* @__PURE__ */ function() {
  return {
    compare: ordCharImpl(LT.value)(EQ.value)(GT.value),
    Eq0: function() {
      return eqChar;
    }
  };
}();
var compare = function(dict) {
  return dict.compare;
};

// output/Data.Bounded/index.js
var top = function(dict) {
  return dict.top;
};
var boundedChar = {
  top: topChar,
  bottom: bottomChar,
  Ord0: function() {
    return ordChar;
  }
};
var bottom = function(dict) {
  return dict.bottom;
};

// output/Data.Show/foreign.js
var showIntImpl = function(n) {
  return n.toString();
};
var showCharImpl = function(c) {
  var code = c.charCodeAt(0);
  if (code < 32 || code === 127) {
    switch (c) {
      case "\x07":
        return "'\\a'";
      case "\b":
        return "'\\b'";
      case "\f":
        return "'\\f'";
      case "\n":
        return "'\\n'";
      case "\r":
        return "'\\r'";
      case "	":
        return "'\\t'";
      case "\v":
        return "'\\v'";
    }
    return "'\\" + code.toString(10) + "'";
  }
  return c === "'" || c === "\\" ? "'\\" + c + "'" : "'" + c + "'";
};
var showStringImpl = function(s) {
  var l = s.length;
  return '"' + s.replace(
    /[\0-\x1F\x7F"\\]/g,
    function(c, i) {
      switch (c) {
        case '"':
        case "\\":
          return "\\" + c;
        case "\x07":
          return "\\a";
        case "\b":
          return "\\b";
        case "\f":
          return "\\f";
        case "\n":
          return "\\n";
        case "\r":
          return "\\r";
        case "	":
          return "\\t";
        case "\v":
          return "\\v";
      }
      var k = i + 1;
      var empty6 = k < l && s[k] >= "0" && s[k] <= "9" ? "\\&" : "";
      return "\\" + c.charCodeAt(0).toString(10) + empty6;
    }
  ) + '"';
};
var showArrayImpl = function(f) {
  return function(xs) {
    var ss = [];
    for (var i = 0, l = xs.length; i < l; i++) {
      ss[i] = f(xs[i]);
    }
    return "[" + ss.join(",") + "]";
  };
};

// output/Data.Show/index.js
var showString = {
  show: showStringImpl
};
var showRecordFields = function(dict) {
  return dict.showRecordFields;
};
var showRecord = function() {
  return function() {
    return function(dictShowRecordFields) {
      var showRecordFields1 = showRecordFields(dictShowRecordFields);
      return {
        show: function(record) {
          return "{" + (showRecordFields1($$Proxy.value)(record) + "}");
        }
      };
    };
  };
};
var showInt = {
  show: showIntImpl
};
var showChar = {
  show: showCharImpl
};
var showBoolean = {
  show: function(v) {
    if (v) {
      return "true";
    }
    ;
    if (!v) {
      return "false";
    }
    ;
    throw new Error("Failed pattern match at Data.Show (line 29, column 1 - line 31, column 23): " + [v.constructor.name]);
  }
};
var show = function(dict) {
  return dict.show;
};
var showArray = function(dictShow) {
  return {
    show: showArrayImpl(show(dictShow))
  };
};
var showRecordFieldsCons = function(dictIsSymbol) {
  var reflectSymbol2 = reflectSymbol(dictIsSymbol);
  return function(dictShowRecordFields) {
    var showRecordFields1 = showRecordFields(dictShowRecordFields);
    return function(dictShow) {
      var show12 = show(dictShow);
      return {
        showRecordFields: function(v) {
          return function(record) {
            var tail2 = showRecordFields1($$Proxy.value)(record);
            var key = reflectSymbol2($$Proxy.value);
            var focus = unsafeGet(key)(record);
            return " " + (key + (": " + (show12(focus) + ("," + tail2))));
          };
        }
      };
    };
  };
};
var showRecordFieldsConsNil = function(dictIsSymbol) {
  var reflectSymbol2 = reflectSymbol(dictIsSymbol);
  return function(dictShow) {
    var show12 = show(dictShow);
    return {
      showRecordFields: function(v) {
        return function(record) {
          var key = reflectSymbol2($$Proxy.value);
          var focus = unsafeGet(key)(record);
          return " " + (key + (": " + (show12(focus) + " ")));
        };
      }
    };
  };
};

// output/Data.Maybe/index.js
var Nothing = /* @__PURE__ */ function() {
  function Nothing2() {
  }
  ;
  Nothing2.value = new Nothing2();
  return Nothing2;
}();
var Just = /* @__PURE__ */ function() {
  function Just2(value0) {
    this.value0 = value0;
  }
  ;
  Just2.create = function(value0) {
    return new Just2(value0);
  };
  return Just2;
}();
var maybe = function(v) {
  return function(v1) {
    return function(v2) {
      if (v2 instanceof Nothing) {
        return v;
      }
      ;
      if (v2 instanceof Just) {
        return v1(v2.value0);
      }
      ;
      throw new Error("Failed pattern match at Data.Maybe (line 237, column 1 - line 237, column 51): " + [v.constructor.name, v1.constructor.name, v2.constructor.name]);
    };
  };
};
var isNothing = /* @__PURE__ */ maybe(true)(/* @__PURE__ */ $$const(false));
var isJust = /* @__PURE__ */ maybe(false)(/* @__PURE__ */ $$const(true));
var functorMaybe = {
  map: function(v) {
    return function(v1) {
      if (v1 instanceof Just) {
        return new Just(v(v1.value0));
      }
      ;
      return Nothing.value;
    };
  }
};
var map2 = /* @__PURE__ */ map(functorMaybe);
var fromJust = function() {
  return function(v) {
    if (v instanceof Just) {
      return v.value0;
    }
    ;
    throw new Error("Failed pattern match at Data.Maybe (line 288, column 1 - line 288, column 46): " + [v.constructor.name]);
  };
};
var applyMaybe = {
  apply: function(v) {
    return function(v1) {
      if (v instanceof Just) {
        return map2(v.value0)(v1);
      }
      ;
      if (v instanceof Nothing) {
        return Nothing.value;
      }
      ;
      throw new Error("Failed pattern match at Data.Maybe (line 67, column 1 - line 69, column 30): " + [v.constructor.name, v1.constructor.name]);
    };
  },
  Functor0: function() {
    return functorMaybe;
  }
};
var bindMaybe = {
  bind: function(v) {
    return function(v1) {
      if (v instanceof Just) {
        return v1(v.value0);
      }
      ;
      if (v instanceof Nothing) {
        return Nothing.value;
      }
      ;
      throw new Error("Failed pattern match at Data.Maybe (line 125, column 1 - line 127, column 28): " + [v.constructor.name, v1.constructor.name]);
    };
  },
  Apply0: function() {
    return applyMaybe;
  }
};

// output/Data.Either/index.js
var Left = /* @__PURE__ */ function() {
  function Left2(value0) {
    this.value0 = value0;
  }
  ;
  Left2.create = function(value0) {
    return new Left2(value0);
  };
  return Left2;
}();
var Right = /* @__PURE__ */ function() {
  function Right2(value0) {
    this.value0 = value0;
  }
  ;
  Right2.create = function(value0) {
    return new Right2(value0);
  };
  return Right2;
}();
var functorEither = {
  map: function(f) {
    return function(m) {
      if (m instanceof Left) {
        return new Left(m.value0);
      }
      ;
      if (m instanceof Right) {
        return new Right(f(m.value0));
      }
      ;
      throw new Error("Failed pattern match at Data.Either (line 0, column 0 - line 0, column 0): " + [m.constructor.name]);
    };
  }
};
var map3 = /* @__PURE__ */ map(functorEither);
var either = function(v) {
  return function(v1) {
    return function(v2) {
      if (v2 instanceof Left) {
        return v(v2.value0);
      }
      ;
      if (v2 instanceof Right) {
        return v1(v2.value0);
      }
      ;
      throw new Error("Failed pattern match at Data.Either (line 208, column 1 - line 208, column 64): " + [v.constructor.name, v1.constructor.name, v2.constructor.name]);
    };
  };
};
var applyEither = {
  apply: function(v) {
    return function(v1) {
      if (v instanceof Left) {
        return new Left(v.value0);
      }
      ;
      if (v instanceof Right) {
        return map3(v.value0)(v1);
      }
      ;
      throw new Error("Failed pattern match at Data.Either (line 70, column 1 - line 72, column 30): " + [v.constructor.name, v1.constructor.name]);
    };
  },
  Functor0: function() {
    return functorEither;
  }
};
var bindEither = {
  bind: /* @__PURE__ */ either(function(e) {
    return function(v) {
      return new Left(e);
    };
  })(function(a) {
    return function(f) {
      return f(a);
    };
  }),
  Apply0: function() {
    return applyEither;
  }
};
var applicativeEither = /* @__PURE__ */ function() {
  return {
    pure: Right.create,
    Apply0: function() {
      return applyEither;
    }
  };
}();
var monadEither = {
  Applicative0: function() {
    return applicativeEither;
  },
  Bind1: function() {
    return bindEither;
  }
};

// output/Data.EuclideanRing/foreign.js
var intDegree = function(x) {
  return Math.min(Math.abs(x), 2147483647);
};
var intDiv = function(x) {
  return function(y) {
    if (y === 0)
      return 0;
    return y > 0 ? Math.floor(x / y) : -Math.floor(x / -y);
  };
};
var intMod = function(x) {
  return function(y) {
    if (y === 0)
      return 0;
    var yy = Math.abs(y);
    return (x % yy + yy) % yy;
  };
};

// output/Data.CommutativeRing/index.js
var commutativeRingInt = {
  Ring0: function() {
    return ringInt;
  }
};

// output/Data.EuclideanRing/index.js
var mod = function(dict) {
  return dict.mod;
};
var euclideanRingInt = {
  degree: intDegree,
  div: intDiv,
  mod: intMod,
  CommutativeRing0: function() {
    return commutativeRingInt;
  }
};
var div = function(dict) {
  return dict.div;
};

// output/Data.Monoid/index.js
var monoidArray = {
  mempty: [],
  Semigroup0: function() {
    return semigroupArray;
  }
};
var mempty = function(dict) {
  return dict.mempty;
};

// output/Effect/foreign.js
var pureE = function(a) {
  return function() {
    return a;
  };
};
var bindE = function(a) {
  return function(f) {
    return function() {
      return f(a())();
    };
  };
};

// output/Effect/index.js
var $runtime_lazy = function(name2, moduleName, init3) {
  var state2 = 0;
  var val;
  return function(lineNumber) {
    if (state2 === 2)
      return val;
    if (state2 === 1)
      throw new ReferenceError(name2 + " was needed before it finished initializing (module " + moduleName + ", line " + lineNumber + ")", moduleName, lineNumber);
    state2 = 1;
    val = init3();
    state2 = 2;
    return val;
  };
};
var monadEffect = {
  Applicative0: function() {
    return applicativeEffect;
  },
  Bind1: function() {
    return bindEffect;
  }
};
var bindEffect = {
  bind: bindE,
  Apply0: function() {
    return $lazy_applyEffect(0);
  }
};
var applicativeEffect = {
  pure: pureE,
  Apply0: function() {
    return $lazy_applyEffect(0);
  }
};
var $lazy_functorEffect = /* @__PURE__ */ $runtime_lazy("functorEffect", "Effect", function() {
  return {
    map: liftA1(applicativeEffect)
  };
});
var $lazy_applyEffect = /* @__PURE__ */ $runtime_lazy("applyEffect", "Effect", function() {
  return {
    apply: ap(monadEffect),
    Functor0: function() {
      return $lazy_functorEffect(0);
    }
  };
});
var functorEffect = /* @__PURE__ */ $lazy_functorEffect(20);
var applyEffect = /* @__PURE__ */ $lazy_applyEffect(23);

// output/Control.Monad.Rec.Class/index.js
var Loop = /* @__PURE__ */ function() {
  function Loop2(value0) {
    this.value0 = value0;
  }
  ;
  Loop2.create = function(value0) {
    return new Loop2(value0);
  };
  return Loop2;
}();
var Done = /* @__PURE__ */ function() {
  function Done2(value0) {
    this.value0 = value0;
  }
  ;
  Done2.create = function(value0) {
    return new Done2(value0);
  };
  return Done2;
}();
var tailRecM = function(dict) {
  return dict.tailRecM;
};
var tailRec = function(f) {
  var go = function($copy_v) {
    var $tco_done = false;
    var $tco_result;
    function $tco_loop(v) {
      if (v instanceof Loop) {
        $copy_v = f(v.value0);
        return;
      }
      ;
      if (v instanceof Done) {
        $tco_done = true;
        return v.value0;
      }
      ;
      throw new Error("Failed pattern match at Control.Monad.Rec.Class (line 103, column 3 - line 103, column 25): " + [v.constructor.name]);
    }
    ;
    while (!$tco_done) {
      $tco_result = $tco_loop($copy_v);
    }
    ;
    return $tco_result;
  };
  return function($85) {
    return go(f($85));
  };
};
var monadRecEither = {
  tailRecM: function(f) {
    return function(a0) {
      var g = function(v) {
        if (v instanceof Left) {
          return new Done(new Left(v.value0));
        }
        ;
        if (v instanceof Right && v.value0 instanceof Loop) {
          return new Loop(f(v.value0.value0));
        }
        ;
        if (v instanceof Right && v.value0 instanceof Done) {
          return new Done(new Right(v.value0.value0));
        }
        ;
        throw new Error("Failed pattern match at Control.Monad.Rec.Class (line 145, column 7 - line 145, column 33): " + [v.constructor.name]);
      };
      return tailRec(g)(f(a0));
    };
  },
  Monad0: function() {
    return monadEither;
  }
};
var bifunctorStep = {
  bimap: function(v) {
    return function(v1) {
      return function(v2) {
        if (v2 instanceof Loop) {
          return new Loop(v(v2.value0));
        }
        ;
        if (v2 instanceof Done) {
          return new Done(v1(v2.value0));
        }
        ;
        throw new Error("Failed pattern match at Control.Monad.Rec.Class (line 33, column 1 - line 35, column 34): " + [v.constructor.name, v1.constructor.name, v2.constructor.name]);
      };
    };
  }
};

// output/Data.Array.ST/foreign.js
var sortByImpl2 = function() {
  function mergeFromTo(compare5, fromOrdering, xs1, xs2, from2, to) {
    var mid;
    var i;
    var j;
    var k;
    var x;
    var y;
    var c;
    mid = from2 + (to - from2 >> 1);
    if (mid - from2 > 1)
      mergeFromTo(compare5, fromOrdering, xs2, xs1, from2, mid);
    if (to - mid > 1)
      mergeFromTo(compare5, fromOrdering, xs2, xs1, mid, to);
    i = from2;
    j = mid;
    k = from2;
    while (i < mid && j < to) {
      x = xs2[i];
      y = xs2[j];
      c = fromOrdering(compare5(x)(y));
      if (c > 0) {
        xs1[k++] = y;
        ++j;
      } else {
        xs1[k++] = x;
        ++i;
      }
    }
    while (i < mid) {
      xs1[k++] = xs2[i++];
    }
    while (j < to) {
      xs1[k++] = xs2[j++];
    }
  }
  return function(compare5) {
    return function(fromOrdering) {
      return function(xs) {
        return function() {
          if (xs.length < 2)
            return xs;
          mergeFromTo(compare5, fromOrdering, xs, xs.slice(0), 0, xs.length);
          return xs;
        };
      };
    };
  };
}();

// output/Data.HeytingAlgebra/foreign.js
var boolConj = function(b1) {
  return function(b2) {
    return b1 && b2;
  };
};
var boolDisj = function(b1) {
  return function(b2) {
    return b1 || b2;
  };
};
var boolNot = function(b) {
  return !b;
};

// output/Data.HeytingAlgebra/index.js
var not = function(dict) {
  return dict.not;
};
var ff = function(dict) {
  return dict.ff;
};
var disj = function(dict) {
  return dict.disj;
};
var heytingAlgebraBoolean = {
  ff: false,
  tt: true,
  implies: function(a) {
    return function(b) {
      return disj(heytingAlgebraBoolean)(not(heytingAlgebraBoolean)(a))(b);
    };
  },
  conj: boolConj,
  disj: boolDisj,
  not: boolNot
};
var conj = function(dict) {
  return dict.conj;
};

// output/Data.Foldable/foreign.js
var foldrArray = function(f) {
  return function(init3) {
    return function(xs) {
      var acc = init3;
      var len = xs.length;
      for (var i = len - 1; i >= 0; i--) {
        acc = f(xs[i])(acc);
      }
      return acc;
    };
  };
};
var foldlArray = function(f) {
  return function(init3) {
    return function(xs) {
      var acc = init3;
      var len = xs.length;
      for (var i = 0; i < len; i++) {
        acc = f(acc)(xs[i]);
      }
      return acc;
    };
  };
};

// output/Data.Tuple/index.js
var Tuple = /* @__PURE__ */ function() {
  function Tuple2(value0, value1) {
    this.value0 = value0;
    this.value1 = value1;
  }
  ;
  Tuple2.create = function(value0) {
    return function(value1) {
      return new Tuple2(value0, value1);
    };
  };
  return Tuple2;
}();
var snd = function(v) {
  return v.value1;
};
var fst = function(v) {
  return v.value0;
};

// output/Data.Bifunctor/index.js
var bimap = function(dict) {
  return dict.bimap;
};

// output/Data.Monoid.Disj/index.js
var Disj = function(x) {
  return x;
};
var semigroupDisj = function(dictHeytingAlgebra) {
  var disj2 = disj(dictHeytingAlgebra);
  return {
    append: function(v) {
      return function(v1) {
        return disj2(v)(v1);
      };
    }
  };
};
var monoidDisj = function(dictHeytingAlgebra) {
  var semigroupDisj1 = semigroupDisj(dictHeytingAlgebra);
  return {
    mempty: ff(dictHeytingAlgebra),
    Semigroup0: function() {
      return semigroupDisj1;
    }
  };
};

// output/Unsafe.Coerce/foreign.js
var unsafeCoerce2 = function(x) {
  return x;
};

// output/Safe.Coerce/index.js
var coerce = function() {
  return unsafeCoerce2;
};

// output/Data.Newtype/index.js
var coerce2 = /* @__PURE__ */ coerce();
var unwrap = function() {
  return coerce2;
};
var alaF = function() {
  return function() {
    return function() {
      return function() {
        return function(v) {
          return coerce2;
        };
      };
    };
  };
};

// output/Data.Foldable/index.js
var alaF2 = /* @__PURE__ */ alaF()()()();
var foldr = function(dict) {
  return dict.foldr;
};
var foldl = function(dict) {
  return dict.foldl;
};
var foldMapDefaultR = function(dictFoldable) {
  var foldr22 = foldr(dictFoldable);
  return function(dictMonoid) {
    var append3 = append(dictMonoid.Semigroup0());
    var mempty2 = mempty(dictMonoid);
    return function(f) {
      return foldr22(function(x) {
        return function(acc) {
          return append3(f(x))(acc);
        };
      })(mempty2);
    };
  };
};
var foldableArray = {
  foldr: foldrArray,
  foldl: foldlArray,
  foldMap: function(dictMonoid) {
    return foldMapDefaultR(foldableArray)(dictMonoid);
  }
};
var foldMap = function(dict) {
  return dict.foldMap;
};
var any = function(dictFoldable) {
  var foldMap2 = foldMap(dictFoldable);
  return function(dictHeytingAlgebra) {
    return alaF2(Disj)(foldMap2(monoidDisj(dictHeytingAlgebra)));
  };
};
var elem = function(dictFoldable) {
  var any1 = any(dictFoldable)(heytingAlgebraBoolean);
  return function(dictEq) {
    var $457 = eq(dictEq);
    return function($458) {
      return any1($457($458));
    };
  };
};

// output/Data.Traversable/foreign.js
var traverseArrayImpl = function() {
  function array1(a) {
    return [a];
  }
  function array2(a) {
    return function(b) {
      return [a, b];
    };
  }
  function array3(a) {
    return function(b) {
      return function(c) {
        return [a, b, c];
      };
    };
  }
  function concat22(xs) {
    return function(ys) {
      return xs.concat(ys);
    };
  }
  return function(apply8) {
    return function(map24) {
      return function(pure19) {
        return function(f) {
          return function(array) {
            function go(bot, top2) {
              switch (top2 - bot) {
                case 0:
                  return pure19([]);
                case 1:
                  return map24(array1)(f(array[bot]));
                case 2:
                  return apply8(map24(array2)(f(array[bot])))(f(array[bot + 1]));
                case 3:
                  return apply8(apply8(map24(array3)(f(array[bot])))(f(array[bot + 1])))(f(array[bot + 2]));
                default:
                  var pivot = bot + Math.floor((top2 - bot) / 4) * 2;
                  return apply8(map24(concat22)(go(bot, pivot)))(go(pivot, top2));
              }
            }
            return go(0, array.length);
          };
        };
      };
    };
  };
}();

// output/Data.Traversable/index.js
var identity4 = /* @__PURE__ */ identity(categoryFn);
var traverse = function(dict) {
  return dict.traverse;
};
var sequenceDefault = function(dictTraversable) {
  var traverse22 = traverse(dictTraversable);
  return function(dictApplicative) {
    return traverse22(dictApplicative)(identity4);
  };
};
var traversableArray = {
  traverse: function(dictApplicative) {
    var Apply0 = dictApplicative.Apply0();
    return traverseArrayImpl(apply(Apply0))(map(Apply0.Functor0()))(pure(dictApplicative));
  },
  sequence: function(dictApplicative) {
    return sequenceDefault(traversableArray)(dictApplicative);
  },
  Functor0: function() {
    return functorArray;
  },
  Foldable1: function() {
    return foldableArray;
  }
};
var sequence = function(dict) {
  return dict.sequence;
};
var $$for = function(dictApplicative) {
  return function(dictTraversable) {
    var traverse22 = traverse(dictTraversable)(dictApplicative);
    return function(x) {
      return function(f) {
        return traverse22(f)(x);
      };
    };
  };
};

// output/Data.Unfoldable/foreign.js
var unfoldrArrayImpl = function(isNothing2) {
  return function(fromJust7) {
    return function(fst2) {
      return function(snd2) {
        return function(f) {
          return function(b) {
            var result = [];
            var value2 = b;
            while (true) {
              var maybe2 = f(value2);
              if (isNothing2(maybe2))
                return result;
              var tuple = fromJust7(maybe2);
              result.push(fst2(tuple));
              value2 = snd2(tuple);
            }
          };
        };
      };
    };
  };
};

// output/Data.Unfoldable1/foreign.js
var unfoldr1ArrayImpl = function(isNothing2) {
  return function(fromJust7) {
    return function(fst2) {
      return function(snd2) {
        return function(f) {
          return function(b) {
            var result = [];
            var value2 = b;
            while (true) {
              var tuple = f(value2);
              result.push(fst2(tuple));
              var maybe2 = snd2(tuple);
              if (isNothing2(maybe2))
                return result;
              value2 = fromJust7(maybe2);
            }
          };
        };
      };
    };
  };
};

// output/Data.Unfoldable1/index.js
var fromJust2 = /* @__PURE__ */ fromJust();
var unfoldable1Array = {
  unfoldr1: /* @__PURE__ */ unfoldr1ArrayImpl(isNothing)(fromJust2)(fst)(snd)
};

// output/Data.Unfoldable/index.js
var fromJust3 = /* @__PURE__ */ fromJust();
var unfoldr = function(dict) {
  return dict.unfoldr;
};
var unfoldableArray = {
  unfoldr: /* @__PURE__ */ unfoldrArrayImpl(isNothing)(fromJust3)(fst)(snd),
  Unfoldable10: function() {
    return unfoldable1Array;
  }
};

// output/Data.Array/index.js
var map1 = /* @__PURE__ */ map(functorMaybe);
var traverse2 = /* @__PURE__ */ traverse(traversableArray);
var zip = /* @__PURE__ */ function() {
  return zipWith(Tuple.create);
}();
var unsafeIndex = function() {
  return unsafeIndexImpl;
};
var unsafeIndex1 = /* @__PURE__ */ unsafeIndex();
var tail = /* @__PURE__ */ function() {
  return unconsImpl($$const(Nothing.value))(function(v) {
    return function(xs) {
      return new Just(xs);
    };
  });
}();
var singleton2 = function(a) {
  return [a];
};
var index = /* @__PURE__ */ function() {
  return indexImpl(Just.create)(Nothing.value);
}();
var head = function(xs) {
  return index(xs)(0);
};
var fromFoldable = function(dictFoldable) {
  return fromFoldableImpl(foldr(dictFoldable));
};
var foldr2 = /* @__PURE__ */ foldr(foldableArray);
var foldM = function(dictMonad) {
  var pure19 = pure(dictMonad.Applicative0());
  var bind12 = bind(dictMonad.Bind1());
  return function(f) {
    return function(b) {
      return unconsImpl(function(v) {
        return pure19(b);
      })(function(a) {
        return function(as) {
          return bind12(f(b)(a))(function(b$prime) {
            return foldM(dictMonad)(f)(b$prime)(as);
          });
        };
      });
    };
  };
};
var findIndex = /* @__PURE__ */ function() {
  return findIndexImpl(Just.create)(Nothing.value);
}();
var find2 = function(f) {
  return function(xs) {
    return map1(unsafeIndex1(xs))(findIndex(f)(xs));
  };
};
var elemIndex = function(dictEq) {
  var eq22 = eq(dictEq);
  return function(x) {
    return findIndex(function(v) {
      return eq22(v)(x);
    });
  };
};
var elem2 = function(dictEq) {
  var elemIndex1 = elemIndex(dictEq);
  return function(a) {
    return function(arr) {
      return isJust(elemIndex1(a)(arr));
    };
  };
};
var concatMap = /* @__PURE__ */ flip(/* @__PURE__ */ bind(bindArray));
var mapMaybe = function(f) {
  return concatMap(function() {
    var $188 = maybe([])(singleton2);
    return function($189) {
      return $188(f($189));
    };
  }());
};
var filterA = function(dictApplicative) {
  var traverse12 = traverse2(dictApplicative);
  var map32 = map(dictApplicative.Apply0().Functor0());
  return function(p) {
    var $190 = map32(mapMaybe(function(v) {
      if (v.value1) {
        return new Just(v.value0);
      }
      ;
      return Nothing.value;
    }));
    var $191 = traverse12(function(x) {
      return map32(Tuple.create(x))(p(x));
    });
    return function($192) {
      return $190($191($192));
    };
  };
};

// node_modules/csv-parse/lib/api/CsvError.js
var CsvError = class extends Error {
  constructor(code, message2, options, ...contexts) {
    if (Array.isArray(message2))
      message2 = message2.join(" ");
    super(message2);
    if (Error.captureStackTrace !== void 0) {
      Error.captureStackTrace(this, CsvError);
    }
    this.code = code;
    for (const context of contexts) {
      for (const key in context) {
        const value2 = context[key];
        this[key] = Buffer.isBuffer(value2) ? value2.toString(options.encoding) : value2 == null ? value2 : JSON.parse(JSON.stringify(value2));
      }
    }
  }
};

// node_modules/csv-parse/lib/utils/is_object.js
var is_object = function(obj) {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj);
};

// node_modules/csv-parse/lib/api/normalize_columns_array.js
var normalize_columns_array = function(columns) {
  const normalizedColumns = [];
  for (let i = 0, l = columns.length; i < l; i++) {
    const column = columns[i];
    if (column === void 0 || column === null || column === false) {
      normalizedColumns[i] = { disabled: true };
    } else if (typeof column === "string") {
      normalizedColumns[i] = { name: column };
    } else if (is_object(column)) {
      if (typeof column.name !== "string") {
        throw new CsvError("CSV_OPTION_COLUMNS_MISSING_NAME", [
          "Option columns missing name:",
          `property "name" is required at position ${i}`,
          "when column is an object literal"
        ]);
      }
      normalizedColumns[i] = column;
    } else {
      throw new CsvError("CSV_INVALID_COLUMN_DEFINITION", [
        "Invalid column definition:",
        "expect a string or a literal object,",
        `got ${JSON.stringify(column)} at position ${i}`
      ]);
    }
  }
  return normalizedColumns;
};

// node_modules/csv-parse/lib/utils/ResizeableBuffer.js
var ResizeableBuffer = class {
  constructor(size6 = 100) {
    this.size = size6;
    this.length = 0;
    this.buf = Buffer.allocUnsafe(size6);
  }
  prepend(val) {
    if (Buffer.isBuffer(val)) {
      const length6 = this.length + val.length;
      if (length6 >= this.size) {
        this.resize();
        if (length6 >= this.size) {
          throw Error("INVALID_BUFFER_STATE");
        }
      }
      const buf = this.buf;
      this.buf = Buffer.allocUnsafe(this.size);
      val.copy(this.buf, 0);
      buf.copy(this.buf, val.length);
      this.length += val.length;
    } else {
      const length6 = this.length++;
      if (length6 === this.size) {
        this.resize();
      }
      const buf = this.clone();
      this.buf[0] = val;
      buf.copy(this.buf, 1, 0, length6);
    }
  }
  append(val) {
    const length6 = this.length++;
    if (length6 === this.size) {
      this.resize();
    }
    this.buf[length6] = val;
  }
  clone() {
    return Buffer.from(this.buf.slice(0, this.length));
  }
  resize() {
    const length6 = this.length;
    this.size = this.size * 2;
    const buf = Buffer.allocUnsafe(this.size);
    this.buf.copy(buf, 0, 0, length6);
    this.buf = buf;
  }
  toString(encoding) {
    if (encoding) {
      return this.buf.slice(0, this.length).toString(encoding);
    } else {
      return Uint8Array.prototype.slice.call(this.buf.slice(0, this.length));
    }
  }
  toJSON() {
    return this.toString("utf8");
  }
  reset() {
    this.length = 0;
  }
};
var ResizeableBuffer_default = ResizeableBuffer;

// node_modules/csv-parse/lib/api/init_state.js
var np = 12;
var cr = 13;
var nl = 10;
var space = 32;
var tab = 9;
var init_state = function(options) {
  return {
    bomSkipped: false,
    bufBytesStart: 0,
    castField: options.cast_function,
    commenting: false,
    error: void 0,
    enabled: options.from_line === 1,
    escaping: false,
    escapeIsQuote: Buffer.isBuffer(options.escape) && Buffer.isBuffer(options.quote) && Buffer.compare(options.escape, options.quote) === 0,
    expectedRecordLength: Array.isArray(options.columns) ? options.columns.length : void 0,
    field: new ResizeableBuffer_default(20),
    firstLineToHeaders: options.cast_first_line_to_header,
    needMoreDataSize: Math.max(
      options.comment !== null ? options.comment.length : 0,
      ...options.delimiter.map((delimiter2) => delimiter2.length),
      options.quote !== null ? options.quote.length : 0
    ),
    previousBuf: void 0,
    quoting: false,
    stop: false,
    rawBuffer: new ResizeableBuffer_default(100),
    record: [],
    recordHasError: false,
    record_length: 0,
    recordDelimiterMaxLength: options.record_delimiter.length === 0 ? 2 : Math.max(...options.record_delimiter.map((v) => v.length)),
    trimChars: [Buffer.from(" ", options.encoding)[0], Buffer.from("	", options.encoding)[0]],
    wasQuoting: false,
    wasRowDelimiter: false,
    timchars: [
      Buffer.from(Buffer.from([cr], "utf8").toString(), options.encoding),
      Buffer.from(Buffer.from([nl], "utf8").toString(), options.encoding),
      Buffer.from(Buffer.from([np], "utf8").toString(), options.encoding),
      Buffer.from(Buffer.from([space], "utf8").toString(), options.encoding),
      Buffer.from(Buffer.from([tab], "utf8").toString(), options.encoding)
    ]
  };
};

// node_modules/csv-parse/lib/utils/underscore.js
var underscore = function(str) {
  return str.replace(/([A-Z])/g, function(_, match2) {
    return "_" + match2.toLowerCase();
  });
};

// node_modules/csv-parse/lib/api/normalize_options.js
var normalize_options = function(opts) {
  const options = {};
  for (const opt in opts) {
    options[underscore(opt)] = opts[opt];
  }
  if (options.encoding === void 0 || options.encoding === true) {
    options.encoding = "utf8";
  } else if (options.encoding === null || options.encoding === false) {
    options.encoding = null;
  } else if (typeof options.encoding !== "string" && options.encoding !== null) {
    throw new CsvError("CSV_INVALID_OPTION_ENCODING", [
      "Invalid option encoding:",
      "encoding must be a string or null to return a buffer,",
      `got ${JSON.stringify(options.encoding)}`
    ], options);
  }
  if (options.bom === void 0 || options.bom === null || options.bom === false) {
    options.bom = false;
  } else if (options.bom !== true) {
    throw new CsvError("CSV_INVALID_OPTION_BOM", [
      "Invalid option bom:",
      "bom must be true,",
      `got ${JSON.stringify(options.bom)}`
    ], options);
  }
  options.cast_function = null;
  if (options.cast === void 0 || options.cast === null || options.cast === false || options.cast === "") {
    options.cast = void 0;
  } else if (typeof options.cast === "function") {
    options.cast_function = options.cast;
    options.cast = true;
  } else if (options.cast !== true) {
    throw new CsvError("CSV_INVALID_OPTION_CAST", [
      "Invalid option cast:",
      "cast must be true or a function,",
      `got ${JSON.stringify(options.cast)}`
    ], options);
  }
  if (options.cast_date === void 0 || options.cast_date === null || options.cast_date === false || options.cast_date === "") {
    options.cast_date = false;
  } else if (options.cast_date === true) {
    options.cast_date = function(value2) {
      const date2 = Date.parse(value2);
      return !isNaN(date2) ? new Date(date2) : value2;
    };
  } else if (typeof options.cast_date !== "function") {
    throw new CsvError("CSV_INVALID_OPTION_CAST_DATE", [
      "Invalid option cast_date:",
      "cast_date must be true or a function,",
      `got ${JSON.stringify(options.cast_date)}`
    ], options);
  }
  options.cast_first_line_to_header = null;
  if (options.columns === true) {
    options.cast_first_line_to_header = void 0;
  } else if (typeof options.columns === "function") {
    options.cast_first_line_to_header = options.columns;
    options.columns = true;
  } else if (Array.isArray(options.columns)) {
    options.columns = normalize_columns_array(options.columns);
  } else if (options.columns === void 0 || options.columns === null || options.columns === false) {
    options.columns = false;
  } else {
    throw new CsvError("CSV_INVALID_OPTION_COLUMNS", [
      "Invalid option columns:",
      "expect an array, a function or true,",
      `got ${JSON.stringify(options.columns)}`
    ], options);
  }
  if (options.group_columns_by_name === void 0 || options.group_columns_by_name === null || options.group_columns_by_name === false) {
    options.group_columns_by_name = false;
  } else if (options.group_columns_by_name !== true) {
    throw new CsvError("CSV_INVALID_OPTION_GROUP_COLUMNS_BY_NAME", [
      "Invalid option group_columns_by_name:",
      "expect an boolean,",
      `got ${JSON.stringify(options.group_columns_by_name)}`
    ], options);
  } else if (options.columns === false) {
    throw new CsvError("CSV_INVALID_OPTION_GROUP_COLUMNS_BY_NAME", [
      "Invalid option group_columns_by_name:",
      "the `columns` mode must be activated."
    ], options);
  }
  if (options.comment === void 0 || options.comment === null || options.comment === false || options.comment === "") {
    options.comment = null;
  } else {
    if (typeof options.comment === "string") {
      options.comment = Buffer.from(options.comment, options.encoding);
    }
    if (!Buffer.isBuffer(options.comment)) {
      throw new CsvError("CSV_INVALID_OPTION_COMMENT", [
        "Invalid option comment:",
        "comment must be a buffer or a string,",
        `got ${JSON.stringify(options.comment)}`
      ], options);
    }
  }
  const delimiter_json = JSON.stringify(options.delimiter);
  if (!Array.isArray(options.delimiter))
    options.delimiter = [options.delimiter];
  if (options.delimiter.length === 0) {
    throw new CsvError("CSV_INVALID_OPTION_DELIMITER", [
      "Invalid option delimiter:",
      "delimiter must be a non empty string or buffer or array of string|buffer,",
      `got ${delimiter_json}`
    ], options);
  }
  options.delimiter = options.delimiter.map(function(delimiter2) {
    if (delimiter2 === void 0 || delimiter2 === null || delimiter2 === false) {
      return Buffer.from(",", options.encoding);
    }
    if (typeof delimiter2 === "string") {
      delimiter2 = Buffer.from(delimiter2, options.encoding);
    }
    if (!Buffer.isBuffer(delimiter2) || delimiter2.length === 0) {
      throw new CsvError("CSV_INVALID_OPTION_DELIMITER", [
        "Invalid option delimiter:",
        "delimiter must be a non empty string or buffer or array of string|buffer,",
        `got ${delimiter_json}`
      ], options);
    }
    return delimiter2;
  });
  if (options.escape === void 0 || options.escape === true) {
    options.escape = Buffer.from('"', options.encoding);
  } else if (typeof options.escape === "string") {
    options.escape = Buffer.from(options.escape, options.encoding);
  } else if (options.escape === null || options.escape === false) {
    options.escape = null;
  }
  if (options.escape !== null) {
    if (!Buffer.isBuffer(options.escape)) {
      throw new Error(`Invalid Option: escape must be a buffer, a string or a boolean, got ${JSON.stringify(options.escape)}`);
    }
  }
  if (options.from === void 0 || options.from === null) {
    options.from = 1;
  } else {
    if (typeof options.from === "string" && /\d+/.test(options.from)) {
      options.from = parseInt(options.from);
    }
    if (Number.isInteger(options.from)) {
      if (options.from < 0) {
        throw new Error(`Invalid Option: from must be a positive integer, got ${JSON.stringify(opts.from)}`);
      }
    } else {
      throw new Error(`Invalid Option: from must be an integer, got ${JSON.stringify(options.from)}`);
    }
  }
  if (options.from_line === void 0 || options.from_line === null) {
    options.from_line = 1;
  } else {
    if (typeof options.from_line === "string" && /\d+/.test(options.from_line)) {
      options.from_line = parseInt(options.from_line);
    }
    if (Number.isInteger(options.from_line)) {
      if (options.from_line <= 0) {
        throw new Error(`Invalid Option: from_line must be a positive integer greater than 0, got ${JSON.stringify(opts.from_line)}`);
      }
    } else {
      throw new Error(`Invalid Option: from_line must be an integer, got ${JSON.stringify(opts.from_line)}`);
    }
  }
  if (options.ignore_last_delimiters === void 0 || options.ignore_last_delimiters === null) {
    options.ignore_last_delimiters = false;
  } else if (typeof options.ignore_last_delimiters === "number") {
    options.ignore_last_delimiters = Math.floor(options.ignore_last_delimiters);
    if (options.ignore_last_delimiters === 0) {
      options.ignore_last_delimiters = false;
    }
  } else if (typeof options.ignore_last_delimiters !== "boolean") {
    throw new CsvError("CSV_INVALID_OPTION_IGNORE_LAST_DELIMITERS", [
      "Invalid option `ignore_last_delimiters`:",
      "the value must be a boolean value or an integer,",
      `got ${JSON.stringify(options.ignore_last_delimiters)}`
    ], options);
  }
  if (options.ignore_last_delimiters === true && options.columns === false) {
    throw new CsvError("CSV_IGNORE_LAST_DELIMITERS_REQUIRES_COLUMNS", [
      "The option `ignore_last_delimiters`",
      "requires the activation of the `columns` option"
    ], options);
  }
  if (options.info === void 0 || options.info === null || options.info === false) {
    options.info = false;
  } else if (options.info !== true) {
    throw new Error(`Invalid Option: info must be true, got ${JSON.stringify(options.info)}`);
  }
  if (options.max_record_size === void 0 || options.max_record_size === null || options.max_record_size === false) {
    options.max_record_size = 0;
  } else if (Number.isInteger(options.max_record_size) && options.max_record_size >= 0) {
  } else if (typeof options.max_record_size === "string" && /\d+/.test(options.max_record_size)) {
    options.max_record_size = parseInt(options.max_record_size);
  } else {
    throw new Error(`Invalid Option: max_record_size must be a positive integer, got ${JSON.stringify(options.max_record_size)}`);
  }
  if (options.objname === void 0 || options.objname === null || options.objname === false) {
    options.objname = void 0;
  } else if (Buffer.isBuffer(options.objname)) {
    if (options.objname.length === 0) {
      throw new Error(`Invalid Option: objname must be a non empty buffer`);
    }
    if (options.encoding === null) {
    } else {
      options.objname = options.objname.toString(options.encoding);
    }
  } else if (typeof options.objname === "string") {
    if (options.objname.length === 0) {
      throw new Error(`Invalid Option: objname must be a non empty string`);
    }
  } else if (typeof options.objname === "number") {
  } else {
    throw new Error(`Invalid Option: objname must be a string or a buffer, got ${options.objname}`);
  }
  if (options.objname !== void 0) {
    if (typeof options.objname === "number") {
      if (options.columns !== false) {
        throw Error("Invalid Option: objname index cannot be combined with columns or be defined as a field");
      }
    } else {
      if (options.columns === false) {
        throw Error("Invalid Option: objname field must be combined with columns or be defined as an index");
      }
    }
  }
  if (options.on_record === void 0 || options.on_record === null) {
    options.on_record = void 0;
  } else if (typeof options.on_record !== "function") {
    throw new CsvError("CSV_INVALID_OPTION_ON_RECORD", [
      "Invalid option `on_record`:",
      "expect a function,",
      `got ${JSON.stringify(options.on_record)}`
    ], options);
  }
  if (options.quote === null || options.quote === false || options.quote === "") {
    options.quote = null;
  } else {
    if (options.quote === void 0 || options.quote === true) {
      options.quote = Buffer.from('"', options.encoding);
    } else if (typeof options.quote === "string") {
      options.quote = Buffer.from(options.quote, options.encoding);
    }
    if (!Buffer.isBuffer(options.quote)) {
      throw new Error(`Invalid Option: quote must be a buffer or a string, got ${JSON.stringify(options.quote)}`);
    }
  }
  if (options.raw === void 0 || options.raw === null || options.raw === false) {
    options.raw = false;
  } else if (options.raw !== true) {
    throw new Error(`Invalid Option: raw must be true, got ${JSON.stringify(options.raw)}`);
  }
  if (options.record_delimiter === void 0) {
    options.record_delimiter = [];
  } else if (typeof options.record_delimiter === "string" || Buffer.isBuffer(options.record_delimiter)) {
    if (options.record_delimiter.length === 0) {
      throw new CsvError("CSV_INVALID_OPTION_RECORD_DELIMITER", [
        "Invalid option `record_delimiter`:",
        "value must be a non empty string or buffer,",
        `got ${JSON.stringify(options.record_delimiter)}`
      ], options);
    }
    options.record_delimiter = [options.record_delimiter];
  } else if (!Array.isArray(options.record_delimiter)) {
    throw new CsvError("CSV_INVALID_OPTION_RECORD_DELIMITER", [
      "Invalid option `record_delimiter`:",
      "value must be a string, a buffer or array of string|buffer,",
      `got ${JSON.stringify(options.record_delimiter)}`
    ], options);
  }
  options.record_delimiter = options.record_delimiter.map(function(rd, i) {
    if (typeof rd !== "string" && !Buffer.isBuffer(rd)) {
      throw new CsvError("CSV_INVALID_OPTION_RECORD_DELIMITER", [
        "Invalid option `record_delimiter`:",
        "value must be a string, a buffer or array of string|buffer",
        `at index ${i},`,
        `got ${JSON.stringify(rd)}`
      ], options);
    } else if (rd.length === 0) {
      throw new CsvError("CSV_INVALID_OPTION_RECORD_DELIMITER", [
        "Invalid option `record_delimiter`:",
        "value must be a non empty string or buffer",
        `at index ${i},`,
        `got ${JSON.stringify(rd)}`
      ], options);
    }
    if (typeof rd === "string") {
      rd = Buffer.from(rd, options.encoding);
    }
    return rd;
  });
  if (typeof options.relax_column_count === "boolean") {
  } else if (options.relax_column_count === void 0 || options.relax_column_count === null) {
    options.relax_column_count = false;
  } else {
    throw new Error(`Invalid Option: relax_column_count must be a boolean, got ${JSON.stringify(options.relax_column_count)}`);
  }
  if (typeof options.relax_column_count_less === "boolean") {
  } else if (options.relax_column_count_less === void 0 || options.relax_column_count_less === null) {
    options.relax_column_count_less = false;
  } else {
    throw new Error(`Invalid Option: relax_column_count_less must be a boolean, got ${JSON.stringify(options.relax_column_count_less)}`);
  }
  if (typeof options.relax_column_count_more === "boolean") {
  } else if (options.relax_column_count_more === void 0 || options.relax_column_count_more === null) {
    options.relax_column_count_more = false;
  } else {
    throw new Error(`Invalid Option: relax_column_count_more must be a boolean, got ${JSON.stringify(options.relax_column_count_more)}`);
  }
  if (typeof options.relax_quotes === "boolean") {
  } else if (options.relax_quotes === void 0 || options.relax_quotes === null) {
    options.relax_quotes = false;
  } else {
    throw new Error(`Invalid Option: relax_quotes must be a boolean, got ${JSON.stringify(options.relax_quotes)}`);
  }
  if (typeof options.skip_empty_lines === "boolean") {
  } else if (options.skip_empty_lines === void 0 || options.skip_empty_lines === null) {
    options.skip_empty_lines = false;
  } else {
    throw new Error(`Invalid Option: skip_empty_lines must be a boolean, got ${JSON.stringify(options.skip_empty_lines)}`);
  }
  if (typeof options.skip_records_with_empty_values === "boolean") {
  } else if (options.skip_records_with_empty_values === void 0 || options.skip_records_with_empty_values === null) {
    options.skip_records_with_empty_values = false;
  } else {
    throw new Error(`Invalid Option: skip_records_with_empty_values must be a boolean, got ${JSON.stringify(options.skip_records_with_empty_values)}`);
  }
  if (typeof options.skip_records_with_error === "boolean") {
  } else if (options.skip_records_with_error === void 0 || options.skip_records_with_error === null) {
    options.skip_records_with_error = false;
  } else {
    throw new Error(`Invalid Option: skip_records_with_error must be a boolean, got ${JSON.stringify(options.skip_records_with_error)}`);
  }
  if (options.rtrim === void 0 || options.rtrim === null || options.rtrim === false) {
    options.rtrim = false;
  } else if (options.rtrim !== true) {
    throw new Error(`Invalid Option: rtrim must be a boolean, got ${JSON.stringify(options.rtrim)}`);
  }
  if (options.ltrim === void 0 || options.ltrim === null || options.ltrim === false) {
    options.ltrim = false;
  } else if (options.ltrim !== true) {
    throw new Error(`Invalid Option: ltrim must be a boolean, got ${JSON.stringify(options.ltrim)}`);
  }
  if (options.trim === void 0 || options.trim === null || options.trim === false) {
    options.trim = false;
  } else if (options.trim !== true) {
    throw new Error(`Invalid Option: trim must be a boolean, got ${JSON.stringify(options.trim)}`);
  }
  if (options.trim === true && opts.ltrim !== false) {
    options.ltrim = true;
  } else if (options.ltrim !== true) {
    options.ltrim = false;
  }
  if (options.trim === true && opts.rtrim !== false) {
    options.rtrim = true;
  } else if (options.rtrim !== true) {
    options.rtrim = false;
  }
  if (options.to === void 0 || options.to === null) {
    options.to = -1;
  } else {
    if (typeof options.to === "string" && /\d+/.test(options.to)) {
      options.to = parseInt(options.to);
    }
    if (Number.isInteger(options.to)) {
      if (options.to <= 0) {
        throw new Error(`Invalid Option: to must be a positive integer greater than 0, got ${JSON.stringify(opts.to)}`);
      }
    } else {
      throw new Error(`Invalid Option: to must be an integer, got ${JSON.stringify(opts.to)}`);
    }
  }
  if (options.to_line === void 0 || options.to_line === null) {
    options.to_line = -1;
  } else {
    if (typeof options.to_line === "string" && /\d+/.test(options.to_line)) {
      options.to_line = parseInt(options.to_line);
    }
    if (Number.isInteger(options.to_line)) {
      if (options.to_line <= 0) {
        throw new Error(`Invalid Option: to_line must be a positive integer greater than 0, got ${JSON.stringify(opts.to_line)}`);
      }
    } else {
      throw new Error(`Invalid Option: to_line must be an integer, got ${JSON.stringify(opts.to_line)}`);
    }
  }
  return options;
};

// node_modules/csv-parse/lib/api/index.js
var isRecordEmpty = function(record) {
  return record.every((field) => field == null || field.toString && field.toString().trim() === "");
};
var cr2 = 13;
var nl2 = 10;
var boms = {
  "utf8": Buffer.from([239, 187, 191]),
  "utf16le": Buffer.from([255, 254])
};
var transform = function(original_options = {}) {
  const info2 = {
    bytes: 0,
    comment_lines: 0,
    empty_lines: 0,
    invalid_field_length: 0,
    lines: 1,
    records: 0
  };
  const options = normalize_options(original_options);
  return {
    info: info2,
    original_options,
    options,
    state: init_state(options),
    __needMoreData: function(i, bufLen, end) {
      if (end)
        return false;
      const { quote } = this.options;
      const { quoting, needMoreDataSize, recordDelimiterMaxLength } = this.state;
      const numOfCharLeft = bufLen - i - 1;
      const requiredLength = Math.max(
        needMoreDataSize,
        recordDelimiterMaxLength,
        quoting ? quote.length + recordDelimiterMaxLength : 0
      );
      return numOfCharLeft < requiredLength;
    },
    parse: function(nextBuf, end, push2, close) {
      const { bom, from_line, ltrim, max_record_size, raw, relax_quotes, rtrim, skip_empty_lines, to, to_line } = this.options;
      let { comment, escape, quote, record_delimiter } = this.options;
      const { bomSkipped, previousBuf, rawBuffer, escapeIsQuote } = this.state;
      let buf;
      if (previousBuf === void 0) {
        if (nextBuf === void 0) {
          close();
          return;
        } else {
          buf = nextBuf;
        }
      } else if (previousBuf !== void 0 && nextBuf === void 0) {
        buf = previousBuf;
      } else {
        buf = Buffer.concat([previousBuf, nextBuf]);
      }
      if (bomSkipped === false) {
        if (bom === false) {
          this.state.bomSkipped = true;
        } else if (buf.length < 3) {
          if (end === false) {
            this.state.previousBuf = buf;
            return;
          }
        } else {
          for (const encoding in boms) {
            if (boms[encoding].compare(buf, 0, boms[encoding].length) === 0) {
              const bomLength = boms[encoding].length;
              this.state.bufBytesStart += bomLength;
              buf = buf.slice(bomLength);
              this.options = normalize_options({ ...this.original_options, encoding });
              ({ comment, escape, quote } = this.options);
              break;
            }
          }
          this.state.bomSkipped = true;
        }
      }
      const bufLen = buf.length;
      let pos;
      for (pos = 0; pos < bufLen; pos++) {
        if (this.__needMoreData(pos, bufLen, end)) {
          break;
        }
        if (this.state.wasRowDelimiter === true) {
          this.info.lines++;
          this.state.wasRowDelimiter = false;
        }
        if (to_line !== -1 && this.info.lines > to_line) {
          this.state.stop = true;
          close();
          return;
        }
        if (this.state.quoting === false && record_delimiter.length === 0) {
          const record_delimiterCount = this.__autoDiscoverRecordDelimiter(buf, pos);
          if (record_delimiterCount) {
            record_delimiter = this.options.record_delimiter;
          }
        }
        const chr = buf[pos];
        if (raw === true) {
          rawBuffer.append(chr);
        }
        if ((chr === cr2 || chr === nl2) && this.state.wasRowDelimiter === false) {
          this.state.wasRowDelimiter = true;
        }
        if (this.state.escaping === true) {
          this.state.escaping = false;
        } else {
          if (escape !== null && this.state.quoting === true && this.__isEscape(buf, pos, chr) && pos + escape.length < bufLen) {
            if (escapeIsQuote) {
              if (this.__isQuote(buf, pos + escape.length)) {
                this.state.escaping = true;
                pos += escape.length - 1;
                continue;
              }
            } else {
              this.state.escaping = true;
              pos += escape.length - 1;
              continue;
            }
          }
          if (this.state.commenting === false && this.__isQuote(buf, pos)) {
            if (this.state.quoting === true) {
              const nextChr = buf[pos + quote.length];
              const isNextChrTrimable = rtrim && this.__isCharTrimable(buf, pos + quote.length);
              const isNextChrComment = comment !== null && this.__compareBytes(comment, buf, pos + quote.length, nextChr);
              const isNextChrDelimiter = this.__isDelimiter(buf, pos + quote.length, nextChr);
              const isNextChrRecordDelimiter = record_delimiter.length === 0 ? this.__autoDiscoverRecordDelimiter(buf, pos + quote.length) : this.__isRecordDelimiter(nextChr, buf, pos + quote.length);
              if (escape !== null && this.__isEscape(buf, pos, chr) && this.__isQuote(buf, pos + escape.length)) {
                pos += escape.length - 1;
              } else if (!nextChr || isNextChrDelimiter || isNextChrRecordDelimiter || isNextChrComment || isNextChrTrimable) {
                this.state.quoting = false;
                this.state.wasQuoting = true;
                pos += quote.length - 1;
                continue;
              } else if (relax_quotes === false) {
                const err = this.__error(
                  new CsvError("CSV_INVALID_CLOSING_QUOTE", [
                    "Invalid Closing Quote:",
                    `got "${String.fromCharCode(nextChr)}"`,
                    `at line ${this.info.lines}`,
                    "instead of delimiter, record delimiter, trimable character",
                    "(if activated) or comment"
                  ], this.options, this.__infoField())
                );
                if (err !== void 0)
                  return err;
              } else {
                this.state.quoting = false;
                this.state.wasQuoting = true;
                this.state.field.prepend(quote);
                pos += quote.length - 1;
              }
            } else {
              if (this.state.field.length !== 0) {
                if (relax_quotes === false) {
                  const err = this.__error(
                    new CsvError("INVALID_OPENING_QUOTE", [
                      "Invalid Opening Quote:",
                      `a quote is found inside a field at line ${this.info.lines}`
                    ], this.options, this.__infoField(), {
                      field: this.state.field
                    })
                  );
                  if (err !== void 0)
                    return err;
                }
              } else {
                this.state.quoting = true;
                pos += quote.length - 1;
                continue;
              }
            }
          }
          if (this.state.quoting === false) {
            const recordDelimiterLength = this.__isRecordDelimiter(chr, buf, pos);
            if (recordDelimiterLength !== 0) {
              const skipCommentLine = this.state.commenting && (this.state.wasQuoting === false && this.state.record.length === 0 && this.state.field.length === 0);
              if (skipCommentLine) {
                this.info.comment_lines++;
              } else {
                if (this.state.enabled === false && this.info.lines + (this.state.wasRowDelimiter === true ? 1 : 0) >= from_line) {
                  this.state.enabled = true;
                  this.__resetField();
                  this.__resetRecord();
                  pos += recordDelimiterLength - 1;
                  continue;
                }
                if (skip_empty_lines === true && this.state.wasQuoting === false && this.state.record.length === 0 && this.state.field.length === 0) {
                  this.info.empty_lines++;
                  pos += recordDelimiterLength - 1;
                  continue;
                }
                this.info.bytes = this.state.bufBytesStart + pos;
                const errField = this.__onField();
                if (errField !== void 0)
                  return errField;
                this.info.bytes = this.state.bufBytesStart + pos + recordDelimiterLength;
                const errRecord = this.__onRecord(push2);
                if (errRecord !== void 0)
                  return errRecord;
                if (to !== -1 && this.info.records >= to) {
                  this.state.stop = true;
                  close();
                  return;
                }
              }
              this.state.commenting = false;
              pos += recordDelimiterLength - 1;
              continue;
            }
            if (this.state.commenting) {
              continue;
            }
            const commentCount = comment === null ? 0 : this.__compareBytes(comment, buf, pos, chr);
            if (commentCount !== 0) {
              this.state.commenting = true;
              continue;
            }
            const delimiterLength = this.__isDelimiter(buf, pos, chr);
            if (delimiterLength !== 0) {
              this.info.bytes = this.state.bufBytesStart + pos;
              const errField = this.__onField();
              if (errField !== void 0)
                return errField;
              pos += delimiterLength - 1;
              continue;
            }
          }
        }
        if (this.state.commenting === false) {
          if (max_record_size !== 0 && this.state.record_length + this.state.field.length > max_record_size) {
            return this.__error(
              new CsvError("CSV_MAX_RECORD_SIZE", [
                "Max Record Size:",
                "record exceed the maximum number of tolerated bytes",
                `of ${max_record_size}`,
                `at line ${this.info.lines}`
              ], this.options, this.__infoField())
            );
          }
        }
        const lappend = ltrim === false || this.state.quoting === true || this.state.field.length !== 0 || !this.__isCharTrimable(buf, pos);
        const rappend = rtrim === false || this.state.wasQuoting === false;
        if (lappend === true && rappend === true) {
          this.state.field.append(chr);
        } else if (rtrim === true && !this.__isCharTrimable(buf, pos)) {
          return this.__error(
            new CsvError("CSV_NON_TRIMABLE_CHAR_AFTER_CLOSING_QUOTE", [
              "Invalid Closing Quote:",
              "found non trimable byte after quote",
              `at line ${this.info.lines}`
            ], this.options, this.__infoField())
          );
        } else {
          if (lappend === false) {
            pos += this.__isCharTrimable(buf, pos) - 1;
          }
          continue;
        }
      }
      if (end === true) {
        if (this.state.quoting === true) {
          const err = this.__error(
            new CsvError("CSV_QUOTE_NOT_CLOSED", [
              "Quote Not Closed:",
              `the parsing is finished with an opening quote at line ${this.info.lines}`
            ], this.options, this.__infoField())
          );
          if (err !== void 0)
            return err;
        } else {
          if (this.state.wasQuoting === true || this.state.record.length !== 0 || this.state.field.length !== 0) {
            this.info.bytes = this.state.bufBytesStart + pos;
            const errField = this.__onField();
            if (errField !== void 0)
              return errField;
            const errRecord = this.__onRecord(push2);
            if (errRecord !== void 0)
              return errRecord;
          } else if (this.state.wasRowDelimiter === true) {
            this.info.empty_lines++;
          } else if (this.state.commenting === true) {
            this.info.comment_lines++;
          }
        }
      } else {
        this.state.bufBytesStart += pos;
        this.state.previousBuf = buf.slice(pos);
      }
      if (this.state.wasRowDelimiter === true) {
        this.info.lines++;
        this.state.wasRowDelimiter = false;
      }
    },
    __onRecord: function(push2) {
      const { columns, group_columns_by_name, encoding, info: info3, from: from2, relax_column_count, relax_column_count_less, relax_column_count_more, raw, skip_records_with_empty_values } = this.options;
      const { enabled, record } = this.state;
      if (enabled === false) {
        return this.__resetRecord();
      }
      const recordLength = record.length;
      if (columns === true) {
        if (skip_records_with_empty_values === true && isRecordEmpty(record)) {
          this.__resetRecord();
          return;
        }
        return this.__firstLineToColumns(record);
      }
      if (columns === false && this.info.records === 0) {
        this.state.expectedRecordLength = recordLength;
      }
      if (recordLength !== this.state.expectedRecordLength) {
        const err = columns === false ? new CsvError("CSV_RECORD_INCONSISTENT_FIELDS_LENGTH", [
          "Invalid Record Length:",
          `expect ${this.state.expectedRecordLength},`,
          `got ${recordLength} on line ${this.info.lines}`
        ], this.options, this.__infoField(), {
          record
        }) : new CsvError("CSV_RECORD_INCONSISTENT_COLUMNS", [
          "Invalid Record Length:",
          `columns length is ${columns.length},`,
          `got ${recordLength} on line ${this.info.lines}`
        ], this.options, this.__infoField(), {
          record
        });
        if (relax_column_count === true || relax_column_count_less === true && recordLength < this.state.expectedRecordLength || relax_column_count_more === true && recordLength > this.state.expectedRecordLength) {
          this.info.invalid_field_length++;
          this.state.error = err;
        } else {
          const finalErr = this.__error(err);
          if (finalErr)
            return finalErr;
        }
      }
      if (skip_records_with_empty_values === true && isRecordEmpty(record)) {
        this.__resetRecord();
        return;
      }
      if (this.state.recordHasError === true) {
        this.__resetRecord();
        this.state.recordHasError = false;
        return;
      }
      this.info.records++;
      if (from2 === 1 || this.info.records >= from2) {
        const { objname } = this.options;
        if (columns !== false) {
          const obj = {};
          for (let i = 0, l = record.length; i < l; i++) {
            if (columns[i] === void 0 || columns[i].disabled)
              continue;
            if (group_columns_by_name === true && obj[columns[i].name] !== void 0) {
              if (Array.isArray(obj[columns[i].name])) {
                obj[columns[i].name] = obj[columns[i].name].concat(record[i]);
              } else {
                obj[columns[i].name] = [obj[columns[i].name], record[i]];
              }
            } else {
              obj[columns[i].name] = record[i];
            }
          }
          if (raw === true || info3 === true) {
            const extRecord = Object.assign(
              { record: obj },
              raw === true ? { raw: this.state.rawBuffer.toString(encoding) } : {},
              info3 === true ? { info: this.__infoRecord() } : {}
            );
            const err = this.__push(
              objname === void 0 ? extRecord : [obj[objname], extRecord],
              push2
            );
            if (err) {
              return err;
            }
          } else {
            const err = this.__push(
              objname === void 0 ? obj : [obj[objname], obj],
              push2
            );
            if (err) {
              return err;
            }
          }
        } else {
          if (raw === true || info3 === true) {
            const extRecord = Object.assign(
              { record },
              raw === true ? { raw: this.state.rawBuffer.toString(encoding) } : {},
              info3 === true ? { info: this.__infoRecord() } : {}
            );
            const err = this.__push(
              objname === void 0 ? extRecord : [record[objname], extRecord],
              push2
            );
            if (err) {
              return err;
            }
          } else {
            const err = this.__push(
              objname === void 0 ? record : [record[objname], record],
              push2
            );
            if (err) {
              return err;
            }
          }
        }
      }
      this.__resetRecord();
    },
    __firstLineToColumns: function(record) {
      const { firstLineToHeaders } = this.state;
      try {
        const headers = firstLineToHeaders === void 0 ? record : firstLineToHeaders.call(null, record);
        if (!Array.isArray(headers)) {
          return this.__error(
            new CsvError("CSV_INVALID_COLUMN_MAPPING", [
              "Invalid Column Mapping:",
              "expect an array from column function,",
              `got ${JSON.stringify(headers)}`
            ], this.options, this.__infoField(), {
              headers
            })
          );
        }
        const normalizedHeaders = normalize_columns_array(headers);
        this.state.expectedRecordLength = normalizedHeaders.length;
        this.options.columns = normalizedHeaders;
        this.__resetRecord();
        return;
      } catch (err) {
        return err;
      }
    },
    __resetRecord: function() {
      if (this.options.raw === true) {
        this.state.rawBuffer.reset();
      }
      this.state.error = void 0;
      this.state.record = [];
      this.state.record_length = 0;
    },
    __onField: function() {
      const { cast, encoding, rtrim, max_record_size } = this.options;
      const { enabled, wasQuoting } = this.state;
      if (enabled === false) {
        return this.__resetField();
      }
      let field = this.state.field.toString(encoding);
      if (rtrim === true && wasQuoting === false) {
        field = field.trimRight();
      }
      if (cast === true) {
        const [err, f] = this.__cast(field);
        if (err !== void 0)
          return err;
        field = f;
      }
      this.state.record.push(field);
      if (max_record_size !== 0 && typeof field === "string") {
        this.state.record_length += field.length;
      }
      this.__resetField();
    },
    __resetField: function() {
      this.state.field.reset();
      this.state.wasQuoting = false;
    },
    __push: function(record, push2) {
      const { on_record } = this.options;
      if (on_record !== void 0) {
        const info3 = this.__infoRecord();
        try {
          record = on_record.call(null, record, info3);
        } catch (err) {
          return err;
        }
        if (record === void 0 || record === null) {
          return;
        }
      }
      push2(record);
    },
    __cast: function(field) {
      const { columns, relax_column_count } = this.options;
      const isColumns = Array.isArray(columns);
      if (isColumns === true && relax_column_count && this.options.columns.length <= this.state.record.length) {
        return [void 0, void 0];
      }
      if (this.state.castField !== null) {
        try {
          const info3 = this.__infoField();
          return [void 0, this.state.castField.call(null, field, info3)];
        } catch (err) {
          return [err];
        }
      }
      if (this.__isFloat(field)) {
        return [void 0, parseFloat(field)];
      } else if (this.options.cast_date !== false) {
        const info3 = this.__infoField();
        return [void 0, this.options.cast_date.call(null, field, info3)];
      }
      return [void 0, field];
    },
    __isCharTrimable: function(buf, pos) {
      const isTrim = (buf2, pos2) => {
        const { timchars } = this.state;
        loop1:
          for (let i = 0; i < timchars.length; i++) {
            const timchar = timchars[i];
            for (let j = 0; j < timchar.length; j++) {
              if (timchar[j] !== buf2[pos2 + j])
                continue loop1;
            }
            return timchar.length;
          }
        return 0;
      };
      return isTrim(buf, pos);
    },
    __isFloat: function(value2) {
      return value2 - parseFloat(value2) + 1 >= 0;
    },
    __compareBytes: function(sourceBuf, targetBuf, targetPos, firstByte) {
      if (sourceBuf[0] !== firstByte)
        return 0;
      const sourceLength = sourceBuf.length;
      for (let i = 1; i < sourceLength; i++) {
        if (sourceBuf[i] !== targetBuf[targetPos + i])
          return 0;
      }
      return sourceLength;
    },
    __isDelimiter: function(buf, pos, chr) {
      const { delimiter: delimiter2, ignore_last_delimiters } = this.options;
      if (ignore_last_delimiters === true && this.state.record.length === this.options.columns.length - 1) {
        return 0;
      } else if (ignore_last_delimiters !== false && typeof ignore_last_delimiters === "number" && this.state.record.length === ignore_last_delimiters - 1) {
        return 0;
      }
      loop1:
        for (let i = 0; i < delimiter2.length; i++) {
          const del = delimiter2[i];
          if (del[0] === chr) {
            for (let j = 1; j < del.length; j++) {
              if (del[j] !== buf[pos + j])
                continue loop1;
            }
            return del.length;
          }
        }
      return 0;
    },
    __isRecordDelimiter: function(chr, buf, pos) {
      const { record_delimiter } = this.options;
      const recordDelimiterLength = record_delimiter.length;
      loop1:
        for (let i = 0; i < recordDelimiterLength; i++) {
          const rd = record_delimiter[i];
          const rdLength = rd.length;
          if (rd[0] !== chr) {
            continue;
          }
          for (let j = 1; j < rdLength; j++) {
            if (rd[j] !== buf[pos + j]) {
              continue loop1;
            }
          }
          return rd.length;
        }
      return 0;
    },
    __isEscape: function(buf, pos, chr) {
      const { escape } = this.options;
      if (escape === null)
        return false;
      const l = escape.length;
      if (escape[0] === chr) {
        for (let i = 0; i < l; i++) {
          if (escape[i] !== buf[pos + i]) {
            return false;
          }
        }
        return true;
      }
      return false;
    },
    __isQuote: function(buf, pos) {
      const { quote } = this.options;
      if (quote === null)
        return false;
      const l = quote.length;
      for (let i = 0; i < l; i++) {
        if (quote[i] !== buf[pos + i]) {
          return false;
        }
      }
      return true;
    },
    __autoDiscoverRecordDelimiter: function(buf, pos) {
      const { encoding } = this.options;
      const chr = buf[pos];
      if (chr === cr2) {
        if (buf[pos + 1] === nl2) {
          this.options.record_delimiter.push(Buffer.from("\r\n", encoding));
          this.state.recordDelimiterMaxLength = 2;
          return 2;
        } else {
          this.options.record_delimiter.push(Buffer.from("\r", encoding));
          this.state.recordDelimiterMaxLength = 1;
          return 1;
        }
      } else if (chr === nl2) {
        this.options.record_delimiter.push(Buffer.from("\n", encoding));
        this.state.recordDelimiterMaxLength = 1;
        return 1;
      }
      return 0;
    },
    __error: function(msg) {
      const { encoding, raw, skip_records_with_error } = this.options;
      const err = typeof msg === "string" ? new Error(msg) : msg;
      if (skip_records_with_error) {
        this.state.recordHasError = true;
        if (this.options.on_skip !== void 0) {
          this.options.on_skip(err, raw ? this.state.rawBuffer.toString(encoding) : void 0);
        }
        return void 0;
      } else {
        return err;
      }
    },
    __infoDataSet: function() {
      return {
        ...this.info,
        columns: this.options.columns
      };
    },
    __infoRecord: function() {
      const { columns, raw, encoding } = this.options;
      return {
        ...this.__infoDataSet(),
        error: this.state.error,
        header: columns === true,
        index: this.state.record.length,
        raw: raw ? this.state.rawBuffer.toString(encoding) : void 0
      };
    },
    __infoField: function() {
      const { columns } = this.options;
      const isColumns = Array.isArray(columns);
      return {
        ...this.__infoRecord(),
        column: isColumns === true ? columns.length > this.state.record.length ? columns[this.state.record.length].name : null : this.state.record.length,
        quoting: this.state.wasQuoting
      };
    }
  };
};

// node_modules/csv-parse/lib/sync.js
var parse = function(data, opts = {}) {
  if (typeof data === "string") {
    data = Buffer.from(data);
  }
  const records = opts && opts.objname ? {} : [];
  const parser = transform(opts);
  const push2 = (record) => {
    if (parser.options.objname === void 0)
      records.push(record);
    else {
      records[record[0]] = record[1];
    }
  };
  const close = () => {
  };
  const err1 = parser.parse(data, false, push2, close);
  if (err1 !== void 0)
    throw err1;
  const err2 = parser.parse(void 0, true, push2, close);
  if (err2 !== void 0)
    throw err2;
  return records;
};

// output/Data.Csv/foreign.js
import { readFileSync } from "node:fs";
function readCsvImpl(filepath2) {
  let csvLine = readFileSync(filepath2, { encoding: "utf-8" });
  return parse(csvLine, {
    bom: true,
    quote: '"',
    columns: false,
    relax_column_count: true
  });
}

// output/Data.Csv/index.js
var map4 = /* @__PURE__ */ map(functorArray);
var pure2 = /* @__PURE__ */ pure(applicativeEffect);
var map12 = /* @__PURE__ */ map(functorMaybe);
var map22 = /* @__PURE__ */ map(functorEffect);
var toCsvRow = function(v) {
  if (v.length === 0) {
    return [];
  }
  ;
  var mkRow = function(tpls) {
    return tpls;
  };
  var idxs = range(1)(length(v));
  var tuples = zip(idxs)(v);
  return map4(mkRow)(tuples);
};
var readCsv = function(x) {
  return pure2(readCsvImpl(x));
};
var create = function(recs) {
  var rows = map12(toCsvRow)(tail(recs));
  var headers = head(recs);
  return {
    headers,
    rows
  };
};
var readCsvs = /* @__PURE__ */ traverse(traversableArray)(applicativeEffect)(function(f) {
  return map22(create)(readCsv(f));
});

// output/Data.Array.NonEmpty.Internal/foreign.js
var traverse1Impl = function() {
  function Cont(fn) {
    this.fn = fn;
  }
  var emptyList = {};
  var ConsCell = function(head4, tail2) {
    this.head = head4;
    this.tail = tail2;
  };
  function finalCell(head4) {
    return new ConsCell(head4, emptyList);
  }
  function consList(x) {
    return function(xs) {
      return new ConsCell(x, xs);
    };
  }
  function listToArray(list) {
    var arr = [];
    var xs = list;
    while (xs !== emptyList) {
      arr.push(xs.head);
      xs = xs.tail;
    }
    return arr;
  }
  return function(apply8) {
    return function(map24) {
      return function(f) {
        var buildFrom = function(x, ys) {
          return apply8(map24(consList)(f(x)))(ys);
        };
        var go = function(acc, currentLen, xs) {
          if (currentLen === 0) {
            return acc;
          } else {
            var last3 = xs[currentLen - 1];
            return new Cont(function() {
              var built = go(buildFrom(last3, acc), currentLen - 1, xs);
              return built;
            });
          }
        };
        return function(array) {
          var acc = map24(finalCell)(f(array[array.length - 1]));
          var result = go(acc, array.length - 1, array);
          while (result instanceof Cont) {
            result = result.fn();
          }
          return map24(listToArray)(result);
        };
      };
    };
  };
}();

// output/Data.FoldableWithIndex/index.js
var foldrWithIndex = function(dict) {
  return dict.foldrWithIndex;
};
var foldlWithIndex = function(dict) {
  return dict.foldlWithIndex;
};
var foldMapWithIndex = function(dict) {
  return dict.foldMapWithIndex;
};

// output/Data.Array.NonEmpty.Internal/index.js
var NonEmptyArray = function(x) {
  return x;
};
var traversableNonEmptyArray = traversableArray;
var functorNonEmptyArray = functorArray;
var foldableNonEmptyArray = foldableArray;

// output/Data.NonEmpty/index.js
var NonEmpty = /* @__PURE__ */ function() {
  function NonEmpty2(value0, value1) {
    this.value0 = value0;
    this.value1 = value1;
  }
  ;
  NonEmpty2.create = function(value0) {
    return function(value1) {
      return new NonEmpty2(value0, value1);
    };
  };
  return NonEmpty2;
}();
var functorNonEmpty = function(dictFunctor) {
  var map24 = map(dictFunctor);
  return {
    map: function(f) {
      return function(m) {
        return new NonEmpty(f(m.value0), map24(f)(m.value1));
      };
    }
  };
};
var foldableNonEmpty = function(dictFoldable) {
  var foldMap2 = foldMap(dictFoldable);
  var foldl5 = foldl(dictFoldable);
  var foldr5 = foldr(dictFoldable);
  return {
    foldMap: function(dictMonoid) {
      var append13 = append(dictMonoid.Semigroup0());
      var foldMap12 = foldMap2(dictMonoid);
      return function(f) {
        return function(v) {
          return append13(f(v.value0))(foldMap12(f)(v.value1));
        };
      };
    },
    foldl: function(f) {
      return function(b) {
        return function(v) {
          return foldl5(f)(f(b)(v.value0))(v.value1);
        };
      };
    },
    foldr: function(f) {
      return function(b) {
        return function(v) {
          return f(v.value0)(foldr5(f)(b)(v.value1));
        };
      };
    }
  };
};
var foldable1NonEmpty = function(dictFoldable) {
  var foldl5 = foldl(dictFoldable);
  var foldr5 = foldr(dictFoldable);
  var foldableNonEmpty1 = foldableNonEmpty(dictFoldable);
  return {
    foldMap1: function(dictSemigroup) {
      var append13 = append(dictSemigroup);
      return function(f) {
        return function(v) {
          return foldl5(function(s) {
            return function(a1) {
              return append13(s)(f(a1));
            };
          })(f(v.value0))(v.value1);
        };
      };
    },
    foldr1: function(f) {
      return function(v) {
        return maybe(v.value0)(f(v.value0))(foldr5(function(a1) {
          var $250 = maybe(a1)(f(a1));
          return function($251) {
            return Just.create($250($251));
          };
        })(Nothing.value)(v.value1));
      };
    },
    foldl1: function(f) {
      return function(v) {
        return foldl5(f)(v.value0)(v.value1);
      };
    },
    Foldable0: function() {
      return foldableNonEmpty1;
    }
  };
};

// output/Data.Array.NonEmpty/index.js
var unsafeFromArray = NonEmptyArray;
var toArray = function(v) {
  return v;
};
var zip2 = function(xs) {
  return function(ys) {
    return unsafeFromArray(zip(toArray(xs))(toArray(ys)));
  };
};
var fromFoldable1 = function(dictFoldable1) {
  var $117 = fromFoldable(dictFoldable1.Foldable0());
  return function($118) {
    return unsafeFromArray($117($118));
  };
};
var fromArray = function(xs) {
  if (length(xs) > 0) {
    return new Just(unsafeFromArray(xs));
  }
  ;
  if (otherwise) {
    return Nothing.value;
  }
  ;
  throw new Error("Failed pattern match at Data.Array.NonEmpty (line 160, column 1 - line 160, column 58): " + [xs.constructor.name]);
};
var adaptAny = function(f) {
  return function($128) {
    return f(toArray($128));
  };
};
var elem3 = function(dictEq) {
  var elem1 = elem2(dictEq);
  return function(x) {
    return adaptAny(elem1(x));
  };
};
var filter2 = function(f) {
  return adaptAny(filter(f));
};
var length2 = /* @__PURE__ */ adaptAny(length);

// output/Data.List.Types/index.js
var identity5 = /* @__PURE__ */ identity(categoryFn);
var Nil = /* @__PURE__ */ function() {
  function Nil3() {
  }
  ;
  Nil3.value = new Nil3();
  return Nil3;
}();
var Cons = /* @__PURE__ */ function() {
  function Cons3(value0, value1) {
    this.value0 = value0;
    this.value1 = value1;
  }
  ;
  Cons3.create = function(value0) {
    return function(value1) {
      return new Cons3(value0, value1);
    };
  };
  return Cons3;
}();
var listMap = function(f) {
  var chunkedRevMap = function($copy_chunksAcc) {
    return function($copy_v) {
      var $tco_var_chunksAcc = $copy_chunksAcc;
      var $tco_done = false;
      var $tco_result;
      function $tco_loop(chunksAcc, v) {
        if (v instanceof Cons && (v.value1 instanceof Cons && v.value1.value1 instanceof Cons)) {
          $tco_var_chunksAcc = new Cons(v, chunksAcc);
          $copy_v = v.value1.value1.value1;
          return;
        }
        ;
        var unrolledMap = function(v1) {
          if (v1 instanceof Cons && (v1.value1 instanceof Cons && v1.value1.value1 instanceof Nil)) {
            return new Cons(f(v1.value0), new Cons(f(v1.value1.value0), Nil.value));
          }
          ;
          if (v1 instanceof Cons && v1.value1 instanceof Nil) {
            return new Cons(f(v1.value0), Nil.value);
          }
          ;
          return Nil.value;
        };
        var reverseUnrolledMap = function($copy_v1) {
          return function($copy_acc) {
            var $tco_var_v1 = $copy_v1;
            var $tco_done1 = false;
            var $tco_result2;
            function $tco_loop2(v1, acc) {
              if (v1 instanceof Cons && (v1.value0 instanceof Cons && (v1.value0.value1 instanceof Cons && v1.value0.value1.value1 instanceof Cons))) {
                $tco_var_v1 = v1.value1;
                $copy_acc = new Cons(f(v1.value0.value0), new Cons(f(v1.value0.value1.value0), new Cons(f(v1.value0.value1.value1.value0), acc)));
                return;
              }
              ;
              $tco_done1 = true;
              return acc;
            }
            ;
            while (!$tco_done1) {
              $tco_result2 = $tco_loop2($tco_var_v1, $copy_acc);
            }
            ;
            return $tco_result2;
          };
        };
        $tco_done = true;
        return reverseUnrolledMap(chunksAcc)(unrolledMap(v));
      }
      ;
      while (!$tco_done) {
        $tco_result = $tco_loop($tco_var_chunksAcc, $copy_v);
      }
      ;
      return $tco_result;
    };
  };
  return chunkedRevMap(Nil.value);
};
var functorList = {
  map: listMap
};
var functorNonEmptyList = /* @__PURE__ */ functorNonEmpty(functorList);
var foldableList = {
  foldr: function(f) {
    return function(b) {
      var rev = function() {
        var go = function($copy_acc) {
          return function($copy_v) {
            var $tco_var_acc = $copy_acc;
            var $tco_done = false;
            var $tco_result;
            function $tco_loop(acc, v) {
              if (v instanceof Nil) {
                $tco_done = true;
                return acc;
              }
              ;
              if (v instanceof Cons) {
                $tco_var_acc = new Cons(v.value0, acc);
                $copy_v = v.value1;
                return;
              }
              ;
              throw new Error("Failed pattern match at Data.List.Types (line 107, column 7 - line 107, column 23): " + [acc.constructor.name, v.constructor.name]);
            }
            ;
            while (!$tco_done) {
              $tco_result = $tco_loop($tco_var_acc, $copy_v);
            }
            ;
            return $tco_result;
          };
        };
        return go(Nil.value);
      }();
      var $281 = foldl(foldableList)(flip(f))(b);
      return function($282) {
        return $281(rev($282));
      };
    };
  },
  foldl: function(f) {
    var go = function($copy_b) {
      return function($copy_v) {
        var $tco_var_b = $copy_b;
        var $tco_done1 = false;
        var $tco_result;
        function $tco_loop(b, v) {
          if (v instanceof Nil) {
            $tco_done1 = true;
            return b;
          }
          ;
          if (v instanceof Cons) {
            $tco_var_b = f(b)(v.value0);
            $copy_v = v.value1;
            return;
          }
          ;
          throw new Error("Failed pattern match at Data.List.Types (line 111, column 12 - line 113, column 30): " + [v.constructor.name]);
        }
        ;
        while (!$tco_done1) {
          $tco_result = $tco_loop($tco_var_b, $copy_v);
        }
        ;
        return $tco_result;
      };
    };
    return go;
  },
  foldMap: function(dictMonoid) {
    var append22 = append(dictMonoid.Semigroup0());
    var mempty2 = mempty(dictMonoid);
    return function(f) {
      return foldl(foldableList)(function(acc) {
        var $283 = append22(acc);
        return function($284) {
          return $283(f($284));
        };
      })(mempty2);
    };
  }
};
var foldl2 = /* @__PURE__ */ foldl(foldableList);
var foldr3 = /* @__PURE__ */ foldr(foldableList);
var semigroupList = {
  append: function(xs) {
    return function(ys) {
      return foldr3(Cons.create)(ys)(xs);
    };
  }
};
var traversableList = {
  traverse: function(dictApplicative) {
    var Apply0 = dictApplicative.Apply0();
    var map111 = map(Apply0.Functor0());
    var lift22 = lift2(Apply0);
    var pure19 = pure(dictApplicative);
    return function(f) {
      var $298 = map111(foldl2(flip(Cons.create))(Nil.value));
      var $299 = foldl2(function(acc) {
        var $301 = lift22(flip(Cons.create))(acc);
        return function($302) {
          return $301(f($302));
        };
      })(pure19(Nil.value));
      return function($300) {
        return $298($299($300));
      };
    };
  },
  sequence: function(dictApplicative) {
    return traverse(traversableList)(dictApplicative)(identity5);
  },
  Functor0: function() {
    return functorList;
  },
  Foldable1: function() {
    return foldableList;
  }
};
var unfoldable1List = {
  unfoldr1: function(f) {
    return function(b) {
      var go = function($copy_source) {
        return function($copy_memo) {
          var $tco_var_source = $copy_source;
          var $tco_done = false;
          var $tco_result;
          function $tco_loop(source2, memo) {
            var v = f(source2);
            if (v.value1 instanceof Just) {
              $tco_var_source = v.value1.value0;
              $copy_memo = new Cons(v.value0, memo);
              return;
            }
            ;
            if (v.value1 instanceof Nothing) {
              $tco_done = true;
              return foldl2(flip(Cons.create))(Nil.value)(new Cons(v.value0, memo));
            }
            ;
            throw new Error("Failed pattern match at Data.List.Types (line 135, column 22 - line 137, column 61): " + [v.constructor.name]);
          }
          ;
          while (!$tco_done) {
            $tco_result = $tco_loop($tco_var_source, $copy_memo);
          }
          ;
          return $tco_result;
        };
      };
      return go(b)(Nil.value);
    };
  }
};
var unfoldableList = {
  unfoldr: function(f) {
    return function(b) {
      var go = function($copy_source) {
        return function($copy_memo) {
          var $tco_var_source = $copy_source;
          var $tco_done = false;
          var $tco_result;
          function $tco_loop(source2, memo) {
            var v = f(source2);
            if (v instanceof Nothing) {
              $tco_done = true;
              return foldl2(flip(Cons.create))(Nil.value)(memo);
            }
            ;
            if (v instanceof Just) {
              $tco_var_source = v.value0.value1;
              $copy_memo = new Cons(v.value0.value0, memo);
              return;
            }
            ;
            throw new Error("Failed pattern match at Data.List.Types (line 142, column 22 - line 144, column 52): " + [v.constructor.name]);
          }
          ;
          while (!$tco_done) {
            $tco_result = $tco_loop($tco_var_source, $copy_memo);
          }
          ;
          return $tco_result;
        };
      };
      return go(b)(Nil.value);
    };
  },
  Unfoldable10: function() {
    return unfoldable1List;
  }
};
var foldable1NonEmptyList = /* @__PURE__ */ foldable1NonEmpty(foldableList);

// output/Data.String.CodeUnits/foreign.js
var fromCharArray = function(a) {
  return a.join("");
};
var singleton4 = function(c) {
  return c;
};
var _charAt = function(just) {
  return function(nothing) {
    return function(i) {
      return function(s) {
        return i >= 0 && i < s.length ? just(s.charAt(i)) : nothing;
      };
    };
  };
};
var length3 = function(s) {
  return s.length;
};
var drop2 = function(n) {
  return function(s) {
    return s.substring(n);
  };
};
var splitAt2 = function(i) {
  return function(s) {
    return { before: s.substring(0, i), after: s.substring(i) };
  };
};

// output/Data.String.Unsafe/foreign.js
var charAt = function(i) {
  return function(s) {
    if (i >= 0 && i < s.length)
      return s.charAt(i);
    throw new Error("Data.String.Unsafe.charAt: Invalid index.");
  };
};

// output/Data.String.CodeUnits/index.js
var stripSuffix = function(v) {
  return function(str) {
    var v1 = splitAt2(length3(str) - length3(v) | 0)(str);
    var $14 = v1.after === v;
    if ($14) {
      return new Just(v1.before);
    }
    ;
    return Nothing.value;
  };
};
var stripPrefix = function(v) {
  return function(str) {
    var v1 = splitAt2(length3(v))(str);
    var $20 = v1.before === v;
    if ($20) {
      return new Just(v1.after);
    }
    ;
    return Nothing.value;
  };
};
var charAt2 = /* @__PURE__ */ function() {
  return _charAt(Just.create)(Nothing.value);
}();

// output/Data.String.Common/foreign.js
var joinWith = function(s) {
  return function(xs) {
    return xs.join(s);
  };
};

// output/Data.String.Common/index.js
var $$null = function(s) {
  return s === "";
};

// output/Data.String.NonEmpty.Internal/index.js
var show2 = /* @__PURE__ */ show(showString);
var composeKleisliFlipped2 = /* @__PURE__ */ composeKleisliFlipped(bindMaybe);
var NonEmptyString = function(x) {
  return x;
};
var toString = function(v) {
  return v;
};
var showNonEmptyString = {
  show: function(v) {
    return "(NonEmptyString.unsafeFromString " + (show2(v) + ")");
  }
};
var semigroupNonEmptyString = semigroupString;
var ordNonEmptyString = ordString;
var liftS = function(f) {
  return function(v) {
    return f(v);
  };
};
var fromString = function(v) {
  if (v === "") {
    return Nothing.value;
  }
  ;
  return new Just(v);
};
var stripPrefix2 = function(pat) {
  return composeKleisliFlipped2(fromString)(liftS(stripPrefix(pat)));
};
var eqNonEmptyString = eqString;

// output/Data.String.NonEmpty.CodeUnits/index.js
var fromJust4 = /* @__PURE__ */ fromJust();
var toNonEmptyString = NonEmptyString;
var liftS2 = function(f) {
  return function(v) {
    return f(v);
  };
};
var fromCharArray2 = function(v) {
  if (v.length === 0) {
    return Nothing.value;
  }
  ;
  return new Just(toNonEmptyString(fromCharArray(v)));
};
var fromNonEmptyCharArray = function($40) {
  return fromJust4(fromCharArray2(toArray($40)));
};
var charAt3 = function($44) {
  return liftS2(charAt2($44));
};

// output/Data.Validation.Semigroup/index.js
var V = function(x) {
  return x;
};
var validation = function(v) {
  return function(v1) {
    return function(v2) {
      if (v2 instanceof Left) {
        return v(v2.value0);
      }
      ;
      if (v2 instanceof Right) {
        return v1(v2.value0);
      }
      ;
      throw new Error("Failed pattern match at Data.Validation.Semigroup (line 48, column 1 - line 48, column 84): " + [v.constructor.name, v1.constructor.name, v2.constructor.name]);
    };
  };
};
var toEither = function(v) {
  return v;
};
var isValid = function(v) {
  if (v instanceof Right) {
    return true;
  }
  ;
  return false;
};
var invalid = function($100) {
  return V(Left.create($100));
};
var functorV = functorEither;
var applyV = function(dictSemigroup) {
  var append13 = append(dictSemigroup);
  return {
    apply: function(v) {
      return function(v1) {
        if (v instanceof Left && v1 instanceof Left) {
          return new Left(append13(v.value0)(v1.value0));
        }
        ;
        if (v instanceof Left) {
          return new Left(v.value0);
        }
        ;
        if (v1 instanceof Left) {
          return new Left(v1.value0);
        }
        ;
        if (v instanceof Right && v1 instanceof Right) {
          return new Right(v.value0(v1.value0));
        }
        ;
        throw new Error("Failed pattern match at Data.Validation.Semigroup (line 89, column 1 - line 93, column 54): " + [v.constructor.name, v1.constructor.name]);
      };
    },
    Functor0: function() {
      return functorV;
    }
  };
};
var applicativeV = function(dictSemigroup) {
  var applyV1 = applyV(dictSemigroup);
  return {
    pure: function($108) {
      return V(Right.create($108));
    },
    Apply0: function() {
      return applyV1;
    }
  };
};
var andThen = function(v1) {
  return function(f) {
    return validation(invalid)(f)(v1);
  };
};

// output/Data.Enum/foreign.js
function toCharCode(c) {
  return c.charCodeAt(0);
}
function fromCharCode(c) {
  return String.fromCharCode(c);
}

// output/Data.Enum/index.js
var bottom1 = /* @__PURE__ */ bottom(boundedChar);
var top1 = /* @__PURE__ */ top(boundedChar);
var toEnum = function(dict) {
  return dict.toEnum;
};
var fromEnum = function(dict) {
  return dict.fromEnum;
};
var toEnumWithDefaults = function(dictBoundedEnum) {
  var toEnum1 = toEnum(dictBoundedEnum);
  var fromEnum1 = fromEnum(dictBoundedEnum);
  var bottom2 = bottom(dictBoundedEnum.Bounded0());
  return function(low) {
    return function(high) {
      return function(x) {
        var v = toEnum1(x);
        if (v instanceof Just) {
          return v.value0;
        }
        ;
        if (v instanceof Nothing) {
          var $140 = x < fromEnum1(bottom2);
          if ($140) {
            return low;
          }
          ;
          return high;
        }
        ;
        throw new Error("Failed pattern match at Data.Enum (line 158, column 33 - line 160, column 62): " + [v.constructor.name]);
      };
    };
  };
};
var defaultSucc = function(toEnum$prime) {
  return function(fromEnum$prime) {
    return function(a) {
      return toEnum$prime(fromEnum$prime(a) + 1 | 0);
    };
  };
};
var defaultPred = function(toEnum$prime) {
  return function(fromEnum$prime) {
    return function(a) {
      return toEnum$prime(fromEnum$prime(a) - 1 | 0);
    };
  };
};
var charToEnum = function(v) {
  if (v >= toCharCode(bottom1) && v <= toCharCode(top1)) {
    return new Just(fromCharCode(v));
  }
  ;
  return Nothing.value;
};
var enumChar = {
  succ: /* @__PURE__ */ defaultSucc(charToEnum)(toCharCode),
  pred: /* @__PURE__ */ defaultPred(charToEnum)(toCharCode),
  Ord0: function() {
    return ordChar;
  }
};
var boundedEnumChar = /* @__PURE__ */ function() {
  return {
    cardinality: toCharCode(top1) - toCharCode(bottom1) | 0,
    toEnum: charToEnum,
    fromEnum: toCharCode,
    Bounded0: function() {
      return boundedChar;
    },
    Enum1: function() {
      return enumChar;
    }
  };
}();

// output/Data.Char/index.js
var toCharCode2 = /* @__PURE__ */ fromEnum(boundedEnumChar);
var fromCharCode2 = /* @__PURE__ */ toEnum(boundedEnumChar);

// output/Data.String.CodePoints/foreign.js
var hasArrayFrom = typeof Array.from === "function";
var hasStringIterator = typeof Symbol !== "undefined" && Symbol != null && typeof Symbol.iterator !== "undefined" && typeof String.prototype[Symbol.iterator] === "function";
var hasFromCodePoint = typeof String.prototype.fromCodePoint === "function";
var hasCodePointAt = typeof String.prototype.codePointAt === "function";
var _unsafeCodePointAt0 = function(fallback) {
  return hasCodePointAt ? function(str) {
    return str.codePointAt(0);
  } : fallback;
};
var _singleton = function(fallback) {
  return hasFromCodePoint ? String.fromCodePoint : fallback;
};
var _take = function(fallback) {
  return function(n) {
    if (hasStringIterator) {
      return function(str) {
        var accum = "";
        var iter = str[Symbol.iterator]();
        for (var i = 0; i < n; ++i) {
          var o = iter.next();
          if (o.done)
            return accum;
          accum += o.value;
        }
        return accum;
      };
    }
    return fallback(n);
  };
};
var _toCodePointArray = function(fallback) {
  return function(unsafeCodePointAt02) {
    if (hasArrayFrom) {
      return function(str) {
        return Array.from(str, unsafeCodePointAt02);
      };
    }
    return fallback;
  };
};

// output/Data.String.CodePoints/index.js
var $runtime_lazy2 = function(name2, moduleName, init3) {
  var state2 = 0;
  var val;
  return function(lineNumber) {
    if (state2 === 2)
      return val;
    if (state2 === 1)
      throw new ReferenceError(name2 + " was needed before it finished initializing (module " + moduleName + ", line " + lineNumber + ")", moduleName, lineNumber);
    state2 = 1;
    val = init3();
    state2 = 2;
    return val;
  };
};
var fromEnum2 = /* @__PURE__ */ fromEnum(boundedEnumChar);
var map5 = /* @__PURE__ */ map(functorMaybe);
var unfoldr2 = /* @__PURE__ */ unfoldr(unfoldableArray);
var div2 = /* @__PURE__ */ div(euclideanRingInt);
var mod2 = /* @__PURE__ */ mod(euclideanRingInt);
var compare2 = /* @__PURE__ */ compare(ordInt);
var unsurrogate = function(lead) {
  return function(trail) {
    return (((lead - 55296 | 0) * 1024 | 0) + (trail - 56320 | 0) | 0) + 65536 | 0;
  };
};
var isTrail = function(cu) {
  return 56320 <= cu && cu <= 57343;
};
var isLead = function(cu) {
  return 55296 <= cu && cu <= 56319;
};
var uncons2 = function(s) {
  var v = length3(s);
  if (v === 0) {
    return Nothing.value;
  }
  ;
  if (v === 1) {
    return new Just({
      head: fromEnum2(charAt(0)(s)),
      tail: ""
    });
  }
  ;
  var cu1 = fromEnum2(charAt(1)(s));
  var cu0 = fromEnum2(charAt(0)(s));
  var $42 = isLead(cu0) && isTrail(cu1);
  if ($42) {
    return new Just({
      head: unsurrogate(cu0)(cu1),
      tail: drop2(2)(s)
    });
  }
  ;
  return new Just({
    head: cu0,
    tail: drop2(1)(s)
  });
};
var unconsButWithTuple = function(s) {
  return map5(function(v) {
    return new Tuple(v.head, v.tail);
  })(uncons2(s));
};
var toCodePointArrayFallback = function(s) {
  return unfoldr2(unconsButWithTuple)(s);
};
var unsafeCodePointAt0Fallback = function(s) {
  var cu0 = fromEnum2(charAt(0)(s));
  var $46 = isLead(cu0) && length3(s) > 1;
  if ($46) {
    var cu1 = fromEnum2(charAt(1)(s));
    var $47 = isTrail(cu1);
    if ($47) {
      return unsurrogate(cu0)(cu1);
    }
    ;
    return cu0;
  }
  ;
  return cu0;
};
var unsafeCodePointAt0 = /* @__PURE__ */ _unsafeCodePointAt0(unsafeCodePointAt0Fallback);
var toCodePointArray = /* @__PURE__ */ _toCodePointArray(toCodePointArrayFallback)(unsafeCodePointAt0);
var length4 = function($73) {
  return length(toCodePointArray($73));
};
var fromCharCode3 = /* @__PURE__ */ function() {
  var $74 = toEnumWithDefaults(boundedEnumChar)(bottom(boundedChar))(top(boundedChar));
  return function($75) {
    return singleton4($74($75));
  };
}();
var singletonFallback = function(v) {
  if (v <= 65535) {
    return fromCharCode3(v);
  }
  ;
  var lead = div2(v - 65536 | 0)(1024) + 55296 | 0;
  var trail = mod2(v - 65536 | 0)(1024) + 56320 | 0;
  return fromCharCode3(lead) + fromCharCode3(trail);
};
var singleton5 = /* @__PURE__ */ _singleton(singletonFallback);
var takeFallback = function(n) {
  return function(v) {
    if (n < 1) {
      return "";
    }
    ;
    var v1 = uncons2(v);
    if (v1 instanceof Just) {
      return singleton5(v1.value0.head) + takeFallback(n - 1 | 0)(v1.value0.tail);
    }
    ;
    return v;
  };
};
var take3 = /* @__PURE__ */ _take(takeFallback);
var splitAt3 = function(i) {
  return function(s) {
    var before = take3(i)(s);
    return {
      before,
      after: drop2(length3(before))(s)
    };
  };
};
var eqCodePoint = {
  eq: function(x) {
    return function(y) {
      return x === y;
    };
  }
};
var ordCodePoint = {
  compare: function(x) {
    return function(y) {
      return compare2(x)(y);
    };
  },
  Eq0: function() {
    return eqCodePoint;
  }
};
var drop3 = function(n) {
  return function(s) {
    return drop2(length3(take3(n)(s)))(s);
  };
};
var boundedCodePoint = {
  bottom: 0,
  top: 1114111,
  Ord0: function() {
    return ordCodePoint;
  }
};
var boundedEnumCodePoint = /* @__PURE__ */ function() {
  return {
    cardinality: 1114111 + 1 | 0,
    fromEnum: function(v) {
      return v;
    },
    toEnum: function(n) {
      if (n >= 0 && n <= 1114111) {
        return new Just(n);
      }
      ;
      if (otherwise) {
        return Nothing.value;
      }
      ;
      throw new Error("Failed pattern match at Data.String.CodePoints (line 63, column 1 - line 68, column 26): " + [n.constructor.name]);
    },
    Bounded0: function() {
      return boundedCodePoint;
    },
    Enum1: function() {
      return $lazy_enumCodePoint(0);
    }
  };
}();
var $lazy_enumCodePoint = /* @__PURE__ */ $runtime_lazy2("enumCodePoint", "Data.String.CodePoints", function() {
  return {
    succ: defaultSucc(toEnum(boundedEnumCodePoint))(fromEnum(boundedEnumCodePoint)),
    pred: defaultPred(toEnum(boundedEnumCodePoint))(fromEnum(boundedEnumCodePoint)),
    Ord0: function() {
      return ordCodePoint;
    }
  };
});

// output/Data.List/index.js
var foldr4 = /* @__PURE__ */ foldr(foldableList);
var bimap2 = /* @__PURE__ */ bimap(bifunctorStep);
var foldl3 = /* @__PURE__ */ foldl(foldableList);
var any3 = /* @__PURE__ */ any(foldableList)(heytingAlgebraBoolean);
var reverse2 = /* @__PURE__ */ function() {
  var go = function($copy_acc) {
    return function($copy_v) {
      var $tco_var_acc = $copy_acc;
      var $tco_done = false;
      var $tco_result;
      function $tco_loop(acc, v) {
        if (v instanceof Nil) {
          $tco_done = true;
          return acc;
        }
        ;
        if (v instanceof Cons) {
          $tco_var_acc = new Cons(v.value0, acc);
          $copy_v = v.value1;
          return;
        }
        ;
        throw new Error("Failed pattern match at Data.List (line 368, column 3 - line 368, column 19): " + [acc.constructor.name, v.constructor.name]);
      }
      ;
      while (!$tco_done) {
        $tco_result = $tco_loop($tco_var_acc, $copy_v);
      }
      ;
      return $tco_result;
    };
  };
  return go(Nil.value);
}();
var partition2 = function(p) {
  return function(xs) {
    var select = function(x) {
      return function(v) {
        var $315 = p(x);
        if ($315) {
          return {
            no: v.no,
            yes: new Cons(x, v.yes)
          };
        }
        ;
        return {
          no: new Cons(x, v.no),
          yes: v.yes
        };
      };
    };
    return foldr4(select)({
      no: Nil.value,
      yes: Nil.value
    })(xs);
  };
};
var manyRec = function(dictMonadRec) {
  var bind12 = bind(dictMonadRec.Monad0().Bind1());
  var tailRecM4 = tailRecM(dictMonadRec);
  return function(dictAlternative) {
    var Alt0 = dictAlternative.Plus1().Alt0();
    var alt5 = alt(Alt0);
    var map111 = map(Alt0.Functor0());
    var pure19 = pure(dictAlternative.Applicative0());
    return function(p) {
      var go = function(acc) {
        return bind12(alt5(map111(Loop.create)(p))(pure19(new Done(unit))))(function(aa) {
          return pure19(bimap2(function(v) {
            return new Cons(v, acc);
          })(function(v) {
            return reverse2(acc);
          })(aa));
        });
      };
      return tailRecM4(go)(Nil.value);
    };
  };
};
var length5 = /* @__PURE__ */ foldl3(function(acc) {
  return function(v) {
    return acc + 1 | 0;
  };
})(0);
var filter3 = function(p) {
  var go = function($copy_acc) {
    return function($copy_v) {
      var $tco_var_acc = $copy_acc;
      var $tco_done = false;
      var $tco_result;
      function $tco_loop(acc, v) {
        if (v instanceof Nil) {
          $tco_done = true;
          return reverse2(acc);
        }
        ;
        if (v instanceof Cons) {
          if (p(v.value0)) {
            $tco_var_acc = new Cons(v.value0, acc);
            $copy_v = v.value1;
            return;
          }
          ;
          if (otherwise) {
            $tco_var_acc = acc;
            $copy_v = v.value1;
            return;
          }
          ;
        }
        ;
        throw new Error("Failed pattern match at Data.List (line 390, column 3 - line 390, column 27): " + [acc.constructor.name, v.constructor.name]);
      }
      ;
      while (!$tco_done) {
        $tco_result = $tco_loop($tco_var_acc, $copy_v);
      }
      ;
      return $tco_result;
    };
  };
  return go(Nil.value);
};
var intersectBy2 = function(v) {
  return function(v1) {
    return function(v2) {
      if (v1 instanceof Nil) {
        return Nil.value;
      }
      ;
      if (v2 instanceof Nil) {
        return Nil.value;
      }
      ;
      return filter3(function(x) {
        return any3(v(x))(v2);
      })(v1);
    };
  };
};
var intersect = function(dictEq) {
  return intersectBy2(eq(dictEq));
};

// output/Partial.Unsafe/foreign.js
var _unsafePartial = function(f) {
  return f();
};

// output/Partial/foreign.js
var _crashWith = function(msg) {
  throw new Error(msg);
};

// output/Partial/index.js
var crashWith = function() {
  return _crashWith;
};

// output/Partial.Unsafe/index.js
var crashWith2 = /* @__PURE__ */ crashWith();
var unsafePartial = _unsafePartial;
var unsafeCrashWith = function(msg) {
  return unsafePartial(function() {
    return crashWith2(msg);
  });
};

// output/StringParser.Parser/index.js
var map6 = /* @__PURE__ */ map(functorEither);
var bind2 = /* @__PURE__ */ bind(bindEither);
var pure3 = /* @__PURE__ */ pure(applicativeEither);
var tailRecM3 = /* @__PURE__ */ tailRecM(monadRecEither);
var unParser = function(v) {
  return v;
};
var runParser = function(v) {
  return function(s) {
    return map6(function(v1) {
      return v1.result;
    })(v({
      substring: s,
      position: 0
    }));
  };
};
var functorParser = {
  map: function(f) {
    return function(v) {
      var $69 = map6(function(v1) {
        return {
          result: f(v1.result),
          suffix: v1.suffix
        };
      });
      return function($70) {
        return $69(v($70));
      };
    };
  }
};
var fail = function(error3) {
  return function(v) {
    return new Left({
      pos: v.position,
      error: error3
    });
  };
};
var applyParser = {
  apply: function(v) {
    return function(v1) {
      return function(s) {
        return bind2(v(s))(function(v2) {
          return bind2(v1(v2.suffix))(function(v3) {
            return pure3({
              result: v2.result(v3.result),
              suffix: v3.suffix
            });
          });
        });
      };
    };
  },
  Functor0: function() {
    return functorParser;
  }
};
var bindParser = {
  bind: function(v) {
    return function(f) {
      return function(s) {
        return bind2(v(s))(function(v1) {
          return unParser(f(v1.result))(v1.suffix);
        });
      };
    };
  },
  Apply0: function() {
    return applyParser;
  }
};
var applicativeParser = {
  pure: function(a) {
    return function(s) {
      return new Right({
        result: a,
        suffix: s
      });
    };
  },
  Apply0: function() {
    return applyParser;
  }
};
var monadParser = {
  Applicative0: function() {
    return applicativeParser;
  },
  Bind1: function() {
    return bindParser;
  }
};
var monadRecParser = {
  tailRecM: function(f) {
    return function(a) {
      var split3 = function(v) {
        if (v.result instanceof Loop) {
          return new Loop({
            state: v.result.value0,
            str: v.suffix
          });
        }
        ;
        if (v.result instanceof Done) {
          return new Done({
            result: v.result.value0,
            suffix: v.suffix
          });
        }
        ;
        throw new Error("Failed pattern match at StringParser.Parser (line 87, column 5 - line 87, column 68): " + [v.constructor.name]);
      };
      return function(str) {
        return tailRecM3(function(st) {
          return map6(split3)(unParser(f(st.state))(st.str));
        })({
          state: a,
          str
        });
      };
    };
  },
  Monad0: function() {
    return monadParser;
  }
};
var altParser = {
  alt: function(v) {
    return function(v1) {
      return function(s) {
        var v2 = v(s);
        if (v2 instanceof Left) {
          if (s.position === v2.value0.pos) {
            return v1(s);
          }
          ;
          if (otherwise) {
            return new Left({
              error: v2.value0.error,
              pos: v2.value0.pos
            });
          }
          ;
        }
        ;
        return v2;
      };
    };
  },
  Functor0: function() {
    return functorParser;
  }
};
var plusParser = {
  empty: /* @__PURE__ */ fail("No alternative"),
  Alt0: function() {
    return altParser;
  }
};
var alternativeParser = {
  Applicative0: function() {
    return applicativeParser;
  },
  Plus1: function() {
    return plusParser;
  }
};

// output/StringParser.Combinators/index.js
var alt2 = /* @__PURE__ */ alt(altParser);
var bind3 = /* @__PURE__ */ bind(bindParser);
var pure4 = /* @__PURE__ */ pure(applicativeParser);
var map7 = /* @__PURE__ */ map(functorParser);
var applySecond2 = /* @__PURE__ */ applySecond(applyParser);
var apply2 = /* @__PURE__ */ apply(applyParser);
var withError = function(p) {
  return function(msg) {
    return alt2(p)(fail(msg));
  };
};
var $$try = function(v) {
  return function(s) {
    var v1 = v(s);
    if (v1 instanceof Left) {
      return new Left({
        pos: s.position,
        error: v1.value0.error
      });
    }
    ;
    return v1;
  };
};
var cons$prime = function(h) {
  return function(t) {
    return new NonEmpty(h, t);
  };
};
var choice = function(dictFoldable) {
  return foldl(dictFoldable)(alt2)(fail("Nothing to parse"));
};
var assertConsume = function(v) {
  return function(s) {
    var v1 = v(s);
    if (v1 instanceof Right) {
      var $34 = s.position < v1.value0.suffix.position;
      if ($34) {
        return new Right(v1.value0);
      }
      ;
      return new Left({
        pos: s.position,
        error: "Consumed no input."
      });
    }
    ;
    return v1;
  };
};
var many = /* @__PURE__ */ function() {
  var $37 = manyRec(monadRecParser)(alternativeParser);
  return function($38) {
    return $37(assertConsume($38));
  };
}();
var many1 = function(p) {
  return apply2(map7(cons$prime)(p))(many(p));
};
var sepBy1 = function(p) {
  return function(sep2) {
    return bind3(p)(function(a) {
      return bind3(many(applySecond2(sep2)(p)))(function(as) {
        return pure4(cons$prime(a)(as));
      });
    });
  };
};

// output/StringParser.CodeUnits/index.js
var anyChar = function(v) {
  var v1 = charAt2(0)(v.substring);
  if (v1 instanceof Just) {
    return new Right({
      result: v1.value0,
      suffix: {
        substring: drop2(1)(v.substring),
        position: v.position + 1 | 0
      }
    });
  }
  ;
  if (v1 instanceof Nothing) {
    return new Left({
      pos: v.position,
      error: "Unexpected EOF"
    });
  }
  ;
  throw new Error("Failed pattern match at StringParser.CodeUnits (line 50, column 3 - line 52, column 63): " + [v1.constructor.name]);
};

// output/StringParser.CodePoints/index.js
var bind4 = /* @__PURE__ */ bind(bindParser);
var elem4 = /* @__PURE__ */ elem(foldableArray)(eqInt);
var pure5 = /* @__PURE__ */ pure(applicativeParser);
var show3 = /* @__PURE__ */ show(showChar);
var show22 = /* @__PURE__ */ show(showInt);
var string = function(pattern) {
  return function(v) {
    var length6 = length4(pattern);
    var v1 = splitAt3(length6)(v.substring);
    var $45 = v1.before === pattern;
    if ($45) {
      return new Right({
        result: pattern,
        suffix: {
          substring: v1.after,
          position: v.position + length6 | 0
        }
      });
    }
    ;
    return new Left({
      pos: v.position,
      error: "Expected '" + (pattern + "'.")
    });
  };
};
var lowerCaseChar = /* @__PURE__ */ $$try(/* @__PURE__ */ bind4(anyChar)(function(c) {
  var $59 = elem4(toCharCode2(c))(range(97)(122));
  if ($59) {
    return pure5(c);
  }
  ;
  return fail("Expected a lower case character but found " + show3(c));
}));
var eof = function(s) {
  if (0 < length4(s.substring)) {
    return new Left({
      pos: s.position,
      error: "Expected EOF"
    });
  }
  ;
  return new Right({
    result: unit,
    suffix: s
  });
};
var anyDigit = /* @__PURE__ */ $$try(/* @__PURE__ */ bind4(anyChar)(function(c) {
  var $63 = c >= "0" && c <= "9";
  if ($63) {
    return pure5(c);
  }
  ;
  return fail("Character " + (show3(c) + " is not a digit"));
}));
var anyCodePoint = function(v) {
  var v1 = uncons2(v.substring);
  if (v1 instanceof Nothing) {
    return new Left({
      pos: v.position,
      error: "Unexpected EOF"
    });
  }
  ;
  if (v1 instanceof Just) {
    return new Right({
      result: v1.value0.head,
      suffix: {
        substring: v1.value0.tail,
        position: v.position + 1 | 0
      }
    });
  }
  ;
  throw new Error("Failed pattern match at StringParser.CodePoints (line 72, column 3 - line 74, column 103): " + [v1.constructor.name]);
};
var anyChar2 = /* @__PURE__ */ function() {
  var notAChar = function(cc) {
    return fail("Code point " + (show22(cc) + " is not a character"));
  };
  return bind4(mapFlipped(functorParser)(anyCodePoint)(fromEnum(boundedEnumCodePoint)))(function(cc) {
    var v = fromCharCode2(cc);
    if (v instanceof Just) {
      var $73 = cc > 65535;
      if ($73) {
        return notAChar(cc);
      }
      ;
      return pure5(v.value0);
    }
    ;
    if (v instanceof Nothing) {
      return notAChar(cc);
    }
    ;
    throw new Error("Failed pattern match at StringParser.CodePoints (line 57, column 3 - line 65, column 27): " + [v.constructor.name]);
  });
}();
var satisfy = function(f) {
  return $$try(bind4(anyChar2)(function(c) {
    var $75 = f(c);
    if ($75) {
      return pure5(c);
    }
    ;
    return fail("Character " + (show3(c) + " did not satisfy predicate"));
  }));
};
var $$char = function(c) {
  return withError(satisfy(function(v) {
    return v === c;
  }))("Could not match character " + show3(c));
};

// output/Data.DDF.Identifier/index.js
var unwrap2 = /* @__PURE__ */ unwrap();
var pure6 = /* @__PURE__ */ pure(/* @__PURE__ */ applicativeV(semigroupArray));
var eq2 = /* @__PURE__ */ eq(eqNonEmptyString);
var compare3 = /* @__PURE__ */ compare(ordNonEmptyString);
var alt3 = /* @__PURE__ */ alt(altParser);
var pure1 = /* @__PURE__ */ pure(applicativeParser);
var show4 = /* @__PURE__ */ show(showInt);
var value = function(v) {
  return toString(v);
};
var unsafeCreate = function(x) {
  var v = fromString(x);
  if (v instanceof Just) {
    return v.value0;
  }
  ;
  if (v instanceof Nothing) {
    return "undefined_id";
  }
  ;
  throw new Error("Failed pattern match at Data.DDF.Identifier (line 91, column 18 - line 93, column 48): " + [v.constructor.name]);
};
var isLongerThan64Chars = function(a) {
  var str = unwrap2(a);
  var v = charAt3(64)(str);
  if (v instanceof Nothing) {
    return pure6(a);
  }
  ;
  if (v instanceof Just) {
    return invalid([toString(str) + " longer than 64 chars"]);
  }
  ;
  throw new Error("Failed pattern match at Data.DDF.Identifier (line 80, column 5 - line 82, column 76): " + [v.constructor.name]);
};
var eqId = {
  eq: function(x) {
    return function(y) {
      return eq2(x)(y);
    };
  }
};
var ordId = {
  compare: function(x) {
    return function(y) {
      return compare3(x)(y);
    };
  },
  Eq0: function() {
    return eqId;
  }
};
var alphaNumLower = /* @__PURE__ */ alt3(lowerCaseChar)(/* @__PURE__ */ withError(anyDigit)("expect lowercase alphanumeric value"));
var alphaNumAnd_ = /* @__PURE__ */ alt3(alphaNumLower)(/* @__PURE__ */ withError(/* @__PURE__ */ $$char("_"))("expect lowercase alphanumeric and underscore _"));
var identifier = /* @__PURE__ */ function() {
  var stringFromChars = function() {
    var $47 = fromFoldable1(foldable1NonEmptyList);
    return function($48) {
      return fromNonEmptyCharArray($47($48));
    };
  }();
  return bind(bindParser)(many1(alphaNumAnd_))(function(chars) {
    return pure1(stringFromChars(chars));
  });
}();
var identifier$prime = /* @__PURE__ */ applyFirst(applyParser)(identifier)(eof);
var parseId = function(x) {
  var v = runParser(identifier$prime)(x);
  if (v instanceof Right) {
    return pure6(v.value0);
  }
  ;
  if (v instanceof Left) {
    var pos = show4(v.value0.pos);
    var msg = "invalid id: " + (x + (", " + (v.value0.error + ("at pos " + pos))));
    return invalid([msg]);
  }
  ;
  throw new Error("Failed pattern match at Data.DDF.Identifier (line 63, column 13 - line 71, column 20): " + [v.constructor.name]);
};

// output/Data.Map.Internal/index.js
var Leaf = /* @__PURE__ */ function() {
  function Leaf2() {
  }
  ;
  Leaf2.value = new Leaf2();
  return Leaf2;
}();
var Two = /* @__PURE__ */ function() {
  function Two2(value0, value1, value2, value3) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
    this.value3 = value3;
  }
  ;
  Two2.create = function(value0) {
    return function(value1) {
      return function(value2) {
        return function(value3) {
          return new Two2(value0, value1, value2, value3);
        };
      };
    };
  };
  return Two2;
}();
var Three = /* @__PURE__ */ function() {
  function Three2(value0, value1, value2, value3, value4, value5, value6) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
    this.value3 = value3;
    this.value4 = value4;
    this.value5 = value5;
    this.value6 = value6;
  }
  ;
  Three2.create = function(value0) {
    return function(value1) {
      return function(value2) {
        return function(value3) {
          return function(value4) {
            return function(value5) {
              return function(value6) {
                return new Three2(value0, value1, value2, value3, value4, value5, value6);
              };
            };
          };
        };
      };
    };
  };
  return Three2;
}();
var TwoLeft = /* @__PURE__ */ function() {
  function TwoLeft2(value0, value1, value2) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
  }
  ;
  TwoLeft2.create = function(value0) {
    return function(value1) {
      return function(value2) {
        return new TwoLeft2(value0, value1, value2);
      };
    };
  };
  return TwoLeft2;
}();
var TwoRight = /* @__PURE__ */ function() {
  function TwoRight2(value0, value1, value2) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
  }
  ;
  TwoRight2.create = function(value0) {
    return function(value1) {
      return function(value2) {
        return new TwoRight2(value0, value1, value2);
      };
    };
  };
  return TwoRight2;
}();
var ThreeLeft = /* @__PURE__ */ function() {
  function ThreeLeft2(value0, value1, value2, value3, value4, value5) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
    this.value3 = value3;
    this.value4 = value4;
    this.value5 = value5;
  }
  ;
  ThreeLeft2.create = function(value0) {
    return function(value1) {
      return function(value2) {
        return function(value3) {
          return function(value4) {
            return function(value5) {
              return new ThreeLeft2(value0, value1, value2, value3, value4, value5);
            };
          };
        };
      };
    };
  };
  return ThreeLeft2;
}();
var ThreeMiddle = /* @__PURE__ */ function() {
  function ThreeMiddle2(value0, value1, value2, value3, value4, value5) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
    this.value3 = value3;
    this.value4 = value4;
    this.value5 = value5;
  }
  ;
  ThreeMiddle2.create = function(value0) {
    return function(value1) {
      return function(value2) {
        return function(value3) {
          return function(value4) {
            return function(value5) {
              return new ThreeMiddle2(value0, value1, value2, value3, value4, value5);
            };
          };
        };
      };
    };
  };
  return ThreeMiddle2;
}();
var ThreeRight = /* @__PURE__ */ function() {
  function ThreeRight2(value0, value1, value2, value3, value4, value5) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
    this.value3 = value3;
    this.value4 = value4;
    this.value5 = value5;
  }
  ;
  ThreeRight2.create = function(value0) {
    return function(value1) {
      return function(value2) {
        return function(value3) {
          return function(value4) {
            return function(value5) {
              return new ThreeRight2(value0, value1, value2, value3, value4, value5);
            };
          };
        };
      };
    };
  };
  return ThreeRight2;
}();
var KickUp = /* @__PURE__ */ function() {
  function KickUp2(value0, value1, value2, value3) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
    this.value3 = value3;
  }
  ;
  KickUp2.create = function(value0) {
    return function(value1) {
      return function(value2) {
        return function(value3) {
          return new KickUp2(value0, value1, value2, value3);
        };
      };
    };
  };
  return KickUp2;
}();
var singleton7 = function(k) {
  return function(v) {
    return new Two(Leaf.value, k, v, Leaf.value);
  };
};
var toUnfoldableUnordered = function(dictUnfoldable) {
  var unfoldr3 = unfoldr(dictUnfoldable);
  return function(m) {
    var go = function($copy_v) {
      var $tco_done = false;
      var $tco_result;
      function $tco_loop(v) {
        if (v instanceof Nil) {
          $tco_done = true;
          return Nothing.value;
        }
        ;
        if (v instanceof Cons) {
          if (v.value0 instanceof Leaf) {
            $copy_v = v.value1;
            return;
          }
          ;
          if (v.value0 instanceof Two) {
            $tco_done = true;
            return new Just(new Tuple(new Tuple(v.value0.value1, v.value0.value2), new Cons(v.value0.value0, new Cons(v.value0.value3, v.value1))));
          }
          ;
          if (v.value0 instanceof Three) {
            $tco_done = true;
            return new Just(new Tuple(new Tuple(v.value0.value1, v.value0.value2), new Cons(singleton7(v.value0.value4)(v.value0.value5), new Cons(v.value0.value0, new Cons(v.value0.value3, new Cons(v.value0.value6, v.value1))))));
          }
          ;
          throw new Error("Failed pattern match at Data.Map.Internal (line 645, column 18 - line 650, column 77): " + [v.value0.constructor.name]);
        }
        ;
        throw new Error("Failed pattern match at Data.Map.Internal (line 644, column 3 - line 644, column 19): " + [v.constructor.name]);
      }
      ;
      while (!$tco_done) {
        $tco_result = $tco_loop($copy_v);
      }
      ;
      return $tco_result;
    };
    return unfoldr3(go)(new Cons(m, Nil.value));
  };
};
var lookup = function(dictOrd) {
  var compare5 = compare(dictOrd);
  return function(k) {
    var go = function($copy_v) {
      var $tco_done = false;
      var $tco_result;
      function $tco_loop(v) {
        if (v instanceof Leaf) {
          $tco_done = true;
          return Nothing.value;
        }
        ;
        if (v instanceof Two) {
          var v2 = compare5(k)(v.value1);
          if (v2 instanceof EQ) {
            $tco_done = true;
            return new Just(v.value2);
          }
          ;
          if (v2 instanceof LT) {
            $copy_v = v.value0;
            return;
          }
          ;
          $copy_v = v.value3;
          return;
        }
        ;
        if (v instanceof Three) {
          var v3 = compare5(k)(v.value1);
          if (v3 instanceof EQ) {
            $tco_done = true;
            return new Just(v.value2);
          }
          ;
          var v4 = compare5(k)(v.value4);
          if (v4 instanceof EQ) {
            $tco_done = true;
            return new Just(v.value5);
          }
          ;
          if (v3 instanceof LT) {
            $copy_v = v.value0;
            return;
          }
          ;
          if (v4 instanceof GT) {
            $copy_v = v.value6;
            return;
          }
          ;
          $copy_v = v.value3;
          return;
        }
        ;
        throw new Error("Failed pattern match at Data.Map.Internal (line 241, column 5 - line 241, column 22): " + [v.constructor.name]);
      }
      ;
      while (!$tco_done) {
        $tco_result = $tco_loop($copy_v);
      }
      ;
      return $tco_result;
    };
    return go;
  };
};
var member = function(dictOrd) {
  var lookup1 = lookup(dictOrd);
  return function(k) {
    return function(m) {
      return isJust(lookup1(k)(m));
    };
  };
};
var isEmpty = function(v) {
  if (v instanceof Leaf) {
    return true;
  }
  ;
  return false;
};
var fromZipper = function($copy_dictOrd) {
  return function($copy_v) {
    return function($copy_tree) {
      var $tco_var_dictOrd = $copy_dictOrd;
      var $tco_var_v = $copy_v;
      var $tco_done = false;
      var $tco_result;
      function $tco_loop(dictOrd, v, tree) {
        if (v instanceof Nil) {
          $tco_done = true;
          return tree;
        }
        ;
        if (v instanceof Cons) {
          if (v.value0 instanceof TwoLeft) {
            $tco_var_dictOrd = dictOrd;
            $tco_var_v = v.value1;
            $copy_tree = new Two(tree, v.value0.value0, v.value0.value1, v.value0.value2);
            return;
          }
          ;
          if (v.value0 instanceof TwoRight) {
            $tco_var_dictOrd = dictOrd;
            $tco_var_v = v.value1;
            $copy_tree = new Two(v.value0.value0, v.value0.value1, v.value0.value2, tree);
            return;
          }
          ;
          if (v.value0 instanceof ThreeLeft) {
            $tco_var_dictOrd = dictOrd;
            $tco_var_v = v.value1;
            $copy_tree = new Three(tree, v.value0.value0, v.value0.value1, v.value0.value2, v.value0.value3, v.value0.value4, v.value0.value5);
            return;
          }
          ;
          if (v.value0 instanceof ThreeMiddle) {
            $tco_var_dictOrd = dictOrd;
            $tco_var_v = v.value1;
            $copy_tree = new Three(v.value0.value0, v.value0.value1, v.value0.value2, tree, v.value0.value3, v.value0.value4, v.value0.value5);
            return;
          }
          ;
          if (v.value0 instanceof ThreeRight) {
            $tco_var_dictOrd = dictOrd;
            $tco_var_v = v.value1;
            $copy_tree = new Three(v.value0.value0, v.value0.value1, v.value0.value2, v.value0.value3, v.value0.value4, v.value0.value5, tree);
            return;
          }
          ;
          throw new Error("Failed pattern match at Data.Map.Internal (line 462, column 3 - line 467, column 88): " + [v.value0.constructor.name]);
        }
        ;
        throw new Error("Failed pattern match at Data.Map.Internal (line 459, column 1 - line 459, column 80): " + [v.constructor.name, tree.constructor.name]);
      }
      ;
      while (!$tco_done) {
        $tco_result = $tco_loop($tco_var_dictOrd, $tco_var_v, $copy_tree);
      }
      ;
      return $tco_result;
    };
  };
};
var insert2 = function(dictOrd) {
  var fromZipper1 = fromZipper(dictOrd);
  var compare5 = compare(dictOrd);
  return function(k) {
    return function(v) {
      var up = function($copy_v1) {
        return function($copy_v2) {
          var $tco_var_v1 = $copy_v1;
          var $tco_done = false;
          var $tco_result;
          function $tco_loop(v1, v2) {
            if (v1 instanceof Nil) {
              $tco_done = true;
              return new Two(v2.value0, v2.value1, v2.value2, v2.value3);
            }
            ;
            if (v1 instanceof Cons) {
              if (v1.value0 instanceof TwoLeft) {
                $tco_done = true;
                return fromZipper1(v1.value1)(new Three(v2.value0, v2.value1, v2.value2, v2.value3, v1.value0.value0, v1.value0.value1, v1.value0.value2));
              }
              ;
              if (v1.value0 instanceof TwoRight) {
                $tco_done = true;
                return fromZipper1(v1.value1)(new Three(v1.value0.value0, v1.value0.value1, v1.value0.value2, v2.value0, v2.value1, v2.value2, v2.value3));
              }
              ;
              if (v1.value0 instanceof ThreeLeft) {
                $tco_var_v1 = v1.value1;
                $copy_v2 = new KickUp(new Two(v2.value0, v2.value1, v2.value2, v2.value3), v1.value0.value0, v1.value0.value1, new Two(v1.value0.value2, v1.value0.value3, v1.value0.value4, v1.value0.value5));
                return;
              }
              ;
              if (v1.value0 instanceof ThreeMiddle) {
                $tco_var_v1 = v1.value1;
                $copy_v2 = new KickUp(new Two(v1.value0.value0, v1.value0.value1, v1.value0.value2, v2.value0), v2.value1, v2.value2, new Two(v2.value3, v1.value0.value3, v1.value0.value4, v1.value0.value5));
                return;
              }
              ;
              if (v1.value0 instanceof ThreeRight) {
                $tco_var_v1 = v1.value1;
                $copy_v2 = new KickUp(new Two(v1.value0.value0, v1.value0.value1, v1.value0.value2, v1.value0.value3), v1.value0.value4, v1.value0.value5, new Two(v2.value0, v2.value1, v2.value2, v2.value3));
                return;
              }
              ;
              throw new Error("Failed pattern match at Data.Map.Internal (line 498, column 5 - line 503, column 108): " + [v1.value0.constructor.name, v2.constructor.name]);
            }
            ;
            throw new Error("Failed pattern match at Data.Map.Internal (line 495, column 3 - line 495, column 56): " + [v1.constructor.name, v2.constructor.name]);
          }
          ;
          while (!$tco_done) {
            $tco_result = $tco_loop($tco_var_v1, $copy_v2);
          }
          ;
          return $tco_result;
        };
      };
      var down = function($copy_ctx) {
        return function($copy_v1) {
          var $tco_var_ctx = $copy_ctx;
          var $tco_done1 = false;
          var $tco_result;
          function $tco_loop(ctx, v1) {
            if (v1 instanceof Leaf) {
              $tco_done1 = true;
              return up(ctx)(new KickUp(Leaf.value, k, v, Leaf.value));
            }
            ;
            if (v1 instanceof Two) {
              var v2 = compare5(k)(v1.value1);
              if (v2 instanceof EQ) {
                $tco_done1 = true;
                return fromZipper1(ctx)(new Two(v1.value0, k, v, v1.value3));
              }
              ;
              if (v2 instanceof LT) {
                $tco_var_ctx = new Cons(new TwoLeft(v1.value1, v1.value2, v1.value3), ctx);
                $copy_v1 = v1.value0;
                return;
              }
              ;
              $tco_var_ctx = new Cons(new TwoRight(v1.value0, v1.value1, v1.value2), ctx);
              $copy_v1 = v1.value3;
              return;
            }
            ;
            if (v1 instanceof Three) {
              var v3 = compare5(k)(v1.value1);
              if (v3 instanceof EQ) {
                $tco_done1 = true;
                return fromZipper1(ctx)(new Three(v1.value0, k, v, v1.value3, v1.value4, v1.value5, v1.value6));
              }
              ;
              var v4 = compare5(k)(v1.value4);
              if (v4 instanceof EQ) {
                $tco_done1 = true;
                return fromZipper1(ctx)(new Three(v1.value0, v1.value1, v1.value2, v1.value3, k, v, v1.value6));
              }
              ;
              if (v3 instanceof LT) {
                $tco_var_ctx = new Cons(new ThreeLeft(v1.value1, v1.value2, v1.value3, v1.value4, v1.value5, v1.value6), ctx);
                $copy_v1 = v1.value0;
                return;
              }
              ;
              if (v3 instanceof GT && v4 instanceof LT) {
                $tco_var_ctx = new Cons(new ThreeMiddle(v1.value0, v1.value1, v1.value2, v1.value4, v1.value5, v1.value6), ctx);
                $copy_v1 = v1.value3;
                return;
              }
              ;
              $tco_var_ctx = new Cons(new ThreeRight(v1.value0, v1.value1, v1.value2, v1.value3, v1.value4, v1.value5), ctx);
              $copy_v1 = v1.value6;
              return;
            }
            ;
            throw new Error("Failed pattern match at Data.Map.Internal (line 478, column 3 - line 478, column 55): " + [ctx.constructor.name, v1.constructor.name]);
          }
          ;
          while (!$tco_done1) {
            $tco_result = $tco_loop($tco_var_ctx, $copy_v1);
          }
          ;
          return $tco_result;
        };
      };
      return down(Nil.value);
    };
  };
};
var pop = function(dictOrd) {
  var fromZipper1 = fromZipper(dictOrd);
  var compare5 = compare(dictOrd);
  return function(k) {
    var up = function($copy_ctxs) {
      return function($copy_tree) {
        var $tco_var_ctxs = $copy_ctxs;
        var $tco_done = false;
        var $tco_result;
        function $tco_loop(ctxs, tree) {
          if (ctxs instanceof Nil) {
            $tco_done = true;
            return tree;
          }
          ;
          if (ctxs instanceof Cons) {
            if (ctxs.value0 instanceof TwoLeft && (ctxs.value0.value2 instanceof Leaf && tree instanceof Leaf)) {
              $tco_done = true;
              return fromZipper1(ctxs.value1)(new Two(Leaf.value, ctxs.value0.value0, ctxs.value0.value1, Leaf.value));
            }
            ;
            if (ctxs.value0 instanceof TwoRight && (ctxs.value0.value0 instanceof Leaf && tree instanceof Leaf)) {
              $tco_done = true;
              return fromZipper1(ctxs.value1)(new Two(Leaf.value, ctxs.value0.value1, ctxs.value0.value2, Leaf.value));
            }
            ;
            if (ctxs.value0 instanceof TwoLeft && ctxs.value0.value2 instanceof Two) {
              $tco_var_ctxs = ctxs.value1;
              $copy_tree = new Three(tree, ctxs.value0.value0, ctxs.value0.value1, ctxs.value0.value2.value0, ctxs.value0.value2.value1, ctxs.value0.value2.value2, ctxs.value0.value2.value3);
              return;
            }
            ;
            if (ctxs.value0 instanceof TwoRight && ctxs.value0.value0 instanceof Two) {
              $tco_var_ctxs = ctxs.value1;
              $copy_tree = new Three(ctxs.value0.value0.value0, ctxs.value0.value0.value1, ctxs.value0.value0.value2, ctxs.value0.value0.value3, ctxs.value0.value1, ctxs.value0.value2, tree);
              return;
            }
            ;
            if (ctxs.value0 instanceof TwoLeft && ctxs.value0.value2 instanceof Three) {
              $tco_done = true;
              return fromZipper1(ctxs.value1)(new Two(new Two(tree, ctxs.value0.value0, ctxs.value0.value1, ctxs.value0.value2.value0), ctxs.value0.value2.value1, ctxs.value0.value2.value2, new Two(ctxs.value0.value2.value3, ctxs.value0.value2.value4, ctxs.value0.value2.value5, ctxs.value0.value2.value6)));
            }
            ;
            if (ctxs.value0 instanceof TwoRight && ctxs.value0.value0 instanceof Three) {
              $tco_done = true;
              return fromZipper1(ctxs.value1)(new Two(new Two(ctxs.value0.value0.value0, ctxs.value0.value0.value1, ctxs.value0.value0.value2, ctxs.value0.value0.value3), ctxs.value0.value0.value4, ctxs.value0.value0.value5, new Two(ctxs.value0.value0.value6, ctxs.value0.value1, ctxs.value0.value2, tree)));
            }
            ;
            if (ctxs.value0 instanceof ThreeLeft && (ctxs.value0.value2 instanceof Leaf && (ctxs.value0.value5 instanceof Leaf && tree instanceof Leaf))) {
              $tco_done = true;
              return fromZipper1(ctxs.value1)(new Three(Leaf.value, ctxs.value0.value0, ctxs.value0.value1, Leaf.value, ctxs.value0.value3, ctxs.value0.value4, Leaf.value));
            }
            ;
            if (ctxs.value0 instanceof ThreeMiddle && (ctxs.value0.value0 instanceof Leaf && (ctxs.value0.value5 instanceof Leaf && tree instanceof Leaf))) {
              $tco_done = true;
              return fromZipper1(ctxs.value1)(new Three(Leaf.value, ctxs.value0.value1, ctxs.value0.value2, Leaf.value, ctxs.value0.value3, ctxs.value0.value4, Leaf.value));
            }
            ;
            if (ctxs.value0 instanceof ThreeRight && (ctxs.value0.value0 instanceof Leaf && (ctxs.value0.value3 instanceof Leaf && tree instanceof Leaf))) {
              $tco_done = true;
              return fromZipper1(ctxs.value1)(new Three(Leaf.value, ctxs.value0.value1, ctxs.value0.value2, Leaf.value, ctxs.value0.value4, ctxs.value0.value5, Leaf.value));
            }
            ;
            if (ctxs.value0 instanceof ThreeLeft && ctxs.value0.value2 instanceof Two) {
              $tco_done = true;
              return fromZipper1(ctxs.value1)(new Two(new Three(tree, ctxs.value0.value0, ctxs.value0.value1, ctxs.value0.value2.value0, ctxs.value0.value2.value1, ctxs.value0.value2.value2, ctxs.value0.value2.value3), ctxs.value0.value3, ctxs.value0.value4, ctxs.value0.value5));
            }
            ;
            if (ctxs.value0 instanceof ThreeMiddle && ctxs.value0.value0 instanceof Two) {
              $tco_done = true;
              return fromZipper1(ctxs.value1)(new Two(new Three(ctxs.value0.value0.value0, ctxs.value0.value0.value1, ctxs.value0.value0.value2, ctxs.value0.value0.value3, ctxs.value0.value1, ctxs.value0.value2, tree), ctxs.value0.value3, ctxs.value0.value4, ctxs.value0.value5));
            }
            ;
            if (ctxs.value0 instanceof ThreeMiddle && ctxs.value0.value5 instanceof Two) {
              $tco_done = true;
              return fromZipper1(ctxs.value1)(new Two(ctxs.value0.value0, ctxs.value0.value1, ctxs.value0.value2, new Three(tree, ctxs.value0.value3, ctxs.value0.value4, ctxs.value0.value5.value0, ctxs.value0.value5.value1, ctxs.value0.value5.value2, ctxs.value0.value5.value3)));
            }
            ;
            if (ctxs.value0 instanceof ThreeRight && ctxs.value0.value3 instanceof Two) {
              $tco_done = true;
              return fromZipper1(ctxs.value1)(new Two(ctxs.value0.value0, ctxs.value0.value1, ctxs.value0.value2, new Three(ctxs.value0.value3.value0, ctxs.value0.value3.value1, ctxs.value0.value3.value2, ctxs.value0.value3.value3, ctxs.value0.value4, ctxs.value0.value5, tree)));
            }
            ;
            if (ctxs.value0 instanceof ThreeLeft && ctxs.value0.value2 instanceof Three) {
              $tco_done = true;
              return fromZipper1(ctxs.value1)(new Three(new Two(tree, ctxs.value0.value0, ctxs.value0.value1, ctxs.value0.value2.value0), ctxs.value0.value2.value1, ctxs.value0.value2.value2, new Two(ctxs.value0.value2.value3, ctxs.value0.value2.value4, ctxs.value0.value2.value5, ctxs.value0.value2.value6), ctxs.value0.value3, ctxs.value0.value4, ctxs.value0.value5));
            }
            ;
            if (ctxs.value0 instanceof ThreeMiddle && ctxs.value0.value0 instanceof Three) {
              $tco_done = true;
              return fromZipper1(ctxs.value1)(new Three(new Two(ctxs.value0.value0.value0, ctxs.value0.value0.value1, ctxs.value0.value0.value2, ctxs.value0.value0.value3), ctxs.value0.value0.value4, ctxs.value0.value0.value5, new Two(ctxs.value0.value0.value6, ctxs.value0.value1, ctxs.value0.value2, tree), ctxs.value0.value3, ctxs.value0.value4, ctxs.value0.value5));
            }
            ;
            if (ctxs.value0 instanceof ThreeMiddle && ctxs.value0.value5 instanceof Three) {
              $tco_done = true;
              return fromZipper1(ctxs.value1)(new Three(ctxs.value0.value0, ctxs.value0.value1, ctxs.value0.value2, new Two(tree, ctxs.value0.value3, ctxs.value0.value4, ctxs.value0.value5.value0), ctxs.value0.value5.value1, ctxs.value0.value5.value2, new Two(ctxs.value0.value5.value3, ctxs.value0.value5.value4, ctxs.value0.value5.value5, ctxs.value0.value5.value6)));
            }
            ;
            if (ctxs.value0 instanceof ThreeRight && ctxs.value0.value3 instanceof Three) {
              $tco_done = true;
              return fromZipper1(ctxs.value1)(new Three(ctxs.value0.value0, ctxs.value0.value1, ctxs.value0.value2, new Two(ctxs.value0.value3.value0, ctxs.value0.value3.value1, ctxs.value0.value3.value2, ctxs.value0.value3.value3), ctxs.value0.value3.value4, ctxs.value0.value3.value5, new Two(ctxs.value0.value3.value6, ctxs.value0.value4, ctxs.value0.value5, tree)));
            }
            ;
            $tco_done = true;
            return unsafeCrashWith("The impossible happened in partial function `up`.");
          }
          ;
          throw new Error("Failed pattern match at Data.Map.Internal (line 552, column 5 - line 573, column 86): " + [ctxs.constructor.name]);
        }
        ;
        while (!$tco_done) {
          $tco_result = $tco_loop($tco_var_ctxs, $copy_tree);
        }
        ;
        return $tco_result;
      };
    };
    var removeMaxNode = function($copy_ctx) {
      return function($copy_m) {
        var $tco_var_ctx = $copy_ctx;
        var $tco_done1 = false;
        var $tco_result;
        function $tco_loop(ctx, m) {
          if (m instanceof Two && (m.value0 instanceof Leaf && m.value3 instanceof Leaf)) {
            $tco_done1 = true;
            return up(ctx)(Leaf.value);
          }
          ;
          if (m instanceof Two) {
            $tco_var_ctx = new Cons(new TwoRight(m.value0, m.value1, m.value2), ctx);
            $copy_m = m.value3;
            return;
          }
          ;
          if (m instanceof Three && (m.value0 instanceof Leaf && (m.value3 instanceof Leaf && m.value6 instanceof Leaf))) {
            $tco_done1 = true;
            return up(new Cons(new TwoRight(Leaf.value, m.value1, m.value2), ctx))(Leaf.value);
          }
          ;
          if (m instanceof Three) {
            $tco_var_ctx = new Cons(new ThreeRight(m.value0, m.value1, m.value2, m.value3, m.value4, m.value5), ctx);
            $copy_m = m.value6;
            return;
          }
          ;
          $tco_done1 = true;
          return unsafeCrashWith("The impossible happened in partial function `removeMaxNode`.");
        }
        ;
        while (!$tco_done1) {
          $tco_result = $tco_loop($tco_var_ctx, $copy_m);
        }
        ;
        return $tco_result;
      };
    };
    var maxNode = function($copy_m) {
      var $tco_done2 = false;
      var $tco_result;
      function $tco_loop(m) {
        if (m instanceof Two && m.value3 instanceof Leaf) {
          $tco_done2 = true;
          return {
            key: m.value1,
            value: m.value2
          };
        }
        ;
        if (m instanceof Two) {
          $copy_m = m.value3;
          return;
        }
        ;
        if (m instanceof Three && m.value6 instanceof Leaf) {
          $tco_done2 = true;
          return {
            key: m.value4,
            value: m.value5
          };
        }
        ;
        if (m instanceof Three) {
          $copy_m = m.value6;
          return;
        }
        ;
        $tco_done2 = true;
        return unsafeCrashWith("The impossible happened in partial function `maxNode`.");
      }
      ;
      while (!$tco_done2) {
        $tco_result = $tco_loop($copy_m);
      }
      ;
      return $tco_result;
    };
    var down = function($copy_ctx) {
      return function($copy_m) {
        var $tco_var_ctx = $copy_ctx;
        var $tco_done3 = false;
        var $tco_result;
        function $tco_loop(ctx, m) {
          if (m instanceof Leaf) {
            $tco_done3 = true;
            return Nothing.value;
          }
          ;
          if (m instanceof Two) {
            var v = compare5(k)(m.value1);
            if (m.value3 instanceof Leaf && v instanceof EQ) {
              $tco_done3 = true;
              return new Just(new Tuple(m.value2, up(ctx)(Leaf.value)));
            }
            ;
            if (v instanceof EQ) {
              var max3 = maxNode(m.value0);
              $tco_done3 = true;
              return new Just(new Tuple(m.value2, removeMaxNode(new Cons(new TwoLeft(max3.key, max3.value, m.value3), ctx))(m.value0)));
            }
            ;
            if (v instanceof LT) {
              $tco_var_ctx = new Cons(new TwoLeft(m.value1, m.value2, m.value3), ctx);
              $copy_m = m.value0;
              return;
            }
            ;
            $tco_var_ctx = new Cons(new TwoRight(m.value0, m.value1, m.value2), ctx);
            $copy_m = m.value3;
            return;
          }
          ;
          if (m instanceof Three) {
            var leaves = function() {
              if (m.value0 instanceof Leaf && (m.value3 instanceof Leaf && m.value6 instanceof Leaf)) {
                return true;
              }
              ;
              return false;
            }();
            var v = compare5(k)(m.value4);
            var v3 = compare5(k)(m.value1);
            if (leaves && v3 instanceof EQ) {
              $tco_done3 = true;
              return new Just(new Tuple(m.value2, fromZipper1(ctx)(new Two(Leaf.value, m.value4, m.value5, Leaf.value))));
            }
            ;
            if (leaves && v instanceof EQ) {
              $tco_done3 = true;
              return new Just(new Tuple(m.value5, fromZipper1(ctx)(new Two(Leaf.value, m.value1, m.value2, Leaf.value))));
            }
            ;
            if (v3 instanceof EQ) {
              var max3 = maxNode(m.value0);
              $tco_done3 = true;
              return new Just(new Tuple(m.value2, removeMaxNode(new Cons(new ThreeLeft(max3.key, max3.value, m.value3, m.value4, m.value5, m.value6), ctx))(m.value0)));
            }
            ;
            if (v instanceof EQ) {
              var max3 = maxNode(m.value3);
              $tco_done3 = true;
              return new Just(new Tuple(m.value5, removeMaxNode(new Cons(new ThreeMiddle(m.value0, m.value1, m.value2, max3.key, max3.value, m.value6), ctx))(m.value3)));
            }
            ;
            if (v3 instanceof LT) {
              $tco_var_ctx = new Cons(new ThreeLeft(m.value1, m.value2, m.value3, m.value4, m.value5, m.value6), ctx);
              $copy_m = m.value0;
              return;
            }
            ;
            if (v3 instanceof GT && v instanceof LT) {
              $tco_var_ctx = new Cons(new ThreeMiddle(m.value0, m.value1, m.value2, m.value4, m.value5, m.value6), ctx);
              $copy_m = m.value3;
              return;
            }
            ;
            $tco_var_ctx = new Cons(new ThreeRight(m.value0, m.value1, m.value2, m.value3, m.value4, m.value5), ctx);
            $copy_m = m.value6;
            return;
          }
          ;
          throw new Error("Failed pattern match at Data.Map.Internal (line 525, column 16 - line 548, column 80): " + [m.constructor.name]);
        }
        ;
        while (!$tco_done3) {
          $tco_result = $tco_loop($tco_var_ctx, $copy_m);
        }
        ;
        return $tco_result;
      };
    };
    return down(Nil.value);
  };
};
var foldableMap = {
  foldr: function(f) {
    return function(z) {
      return function(m) {
        if (m instanceof Leaf) {
          return z;
        }
        ;
        if (m instanceof Two) {
          return foldr(foldableMap)(f)(f(m.value2)(foldr(foldableMap)(f)(z)(m.value3)))(m.value0);
        }
        ;
        if (m instanceof Three) {
          return foldr(foldableMap)(f)(f(m.value2)(foldr(foldableMap)(f)(f(m.value5)(foldr(foldableMap)(f)(z)(m.value6)))(m.value3)))(m.value0);
        }
        ;
        throw new Error("Failed pattern match at Data.Map.Internal (line 133, column 17 - line 136, column 85): " + [m.constructor.name]);
      };
    };
  },
  foldl: function(f) {
    return function(z) {
      return function(m) {
        if (m instanceof Leaf) {
          return z;
        }
        ;
        if (m instanceof Two) {
          return foldl(foldableMap)(f)(f(foldl(foldableMap)(f)(z)(m.value0))(m.value2))(m.value3);
        }
        ;
        if (m instanceof Three) {
          return foldl(foldableMap)(f)(f(foldl(foldableMap)(f)(f(foldl(foldableMap)(f)(z)(m.value0))(m.value2))(m.value3))(m.value5))(m.value6);
        }
        ;
        throw new Error("Failed pattern match at Data.Map.Internal (line 137, column 17 - line 140, column 85): " + [m.constructor.name]);
      };
    };
  },
  foldMap: function(dictMonoid) {
    var mempty2 = mempty(dictMonoid);
    var append22 = append(dictMonoid.Semigroup0());
    return function(f) {
      return function(m) {
        if (m instanceof Leaf) {
          return mempty2;
        }
        ;
        if (m instanceof Two) {
          return append22(foldMap(foldableMap)(dictMonoid)(f)(m.value0))(append22(f(m.value2))(foldMap(foldableMap)(dictMonoid)(f)(m.value3)));
        }
        ;
        if (m instanceof Three) {
          return append22(foldMap(foldableMap)(dictMonoid)(f)(m.value0))(append22(f(m.value2))(append22(foldMap(foldableMap)(dictMonoid)(f)(m.value3))(append22(f(m.value5))(foldMap(foldableMap)(dictMonoid)(f)(m.value6)))));
        }
        ;
        throw new Error("Failed pattern match at Data.Map.Internal (line 141, column 17 - line 144, column 93): " + [m.constructor.name]);
      };
    };
  }
};
var foldableWithIndexMap = {
  foldrWithIndex: function(f) {
    return function(z) {
      return function(m) {
        if (m instanceof Leaf) {
          return z;
        }
        ;
        if (m instanceof Two) {
          return foldrWithIndex(foldableWithIndexMap)(f)(f(m.value1)(m.value2)(foldrWithIndex(foldableWithIndexMap)(f)(z)(m.value3)))(m.value0);
        }
        ;
        if (m instanceof Three) {
          return foldrWithIndex(foldableWithIndexMap)(f)(f(m.value1)(m.value2)(foldrWithIndex(foldableWithIndexMap)(f)(f(m.value4)(m.value5)(foldrWithIndex(foldableWithIndexMap)(f)(z)(m.value6)))(m.value3)))(m.value0);
        }
        ;
        throw new Error("Failed pattern match at Data.Map.Internal (line 147, column 26 - line 150, column 120): " + [m.constructor.name]);
      };
    };
  },
  foldlWithIndex: function(f) {
    return function(z) {
      return function(m) {
        if (m instanceof Leaf) {
          return z;
        }
        ;
        if (m instanceof Two) {
          return foldlWithIndex(foldableWithIndexMap)(f)(f(m.value1)(foldlWithIndex(foldableWithIndexMap)(f)(z)(m.value0))(m.value2))(m.value3);
        }
        ;
        if (m instanceof Three) {
          return foldlWithIndex(foldableWithIndexMap)(f)(f(m.value4)(foldlWithIndex(foldableWithIndexMap)(f)(f(m.value1)(foldlWithIndex(foldableWithIndexMap)(f)(z)(m.value0))(m.value2))(m.value3))(m.value5))(m.value6);
        }
        ;
        throw new Error("Failed pattern match at Data.Map.Internal (line 151, column 26 - line 154, column 120): " + [m.constructor.name]);
      };
    };
  },
  foldMapWithIndex: function(dictMonoid) {
    var mempty2 = mempty(dictMonoid);
    var append22 = append(dictMonoid.Semigroup0());
    return function(f) {
      return function(m) {
        if (m instanceof Leaf) {
          return mempty2;
        }
        ;
        if (m instanceof Two) {
          return append22(foldMapWithIndex(foldableWithIndexMap)(dictMonoid)(f)(m.value0))(append22(f(m.value1)(m.value2))(foldMapWithIndex(foldableWithIndexMap)(dictMonoid)(f)(m.value3)));
        }
        ;
        if (m instanceof Three) {
          return append22(foldMapWithIndex(foldableWithIndexMap)(dictMonoid)(f)(m.value0))(append22(f(m.value1)(m.value2))(append22(foldMapWithIndex(foldableWithIndexMap)(dictMonoid)(f)(m.value3))(append22(f(m.value4)(m.value5))(foldMapWithIndex(foldableWithIndexMap)(dictMonoid)(f)(m.value6)))));
        }
        ;
        throw new Error("Failed pattern match at Data.Map.Internal (line 155, column 26 - line 158, column 128): " + [m.constructor.name]);
      };
    };
  },
  Foldable0: function() {
    return foldableMap;
  }
};
var foldrWithIndex2 = /* @__PURE__ */ foldrWithIndex(foldableWithIndexMap);
var keys = /* @__PURE__ */ function() {
  return foldrWithIndex2(function(k) {
    return function(v) {
      return function(acc) {
        return new Cons(k, acc);
      };
    };
  })(Nil.value);
}();
var values = /* @__PURE__ */ function() {
  return foldr(foldableMap)(Cons.create)(Nil.value);
}();
var empty2 = /* @__PURE__ */ function() {
  return Leaf.value;
}();
var fromFoldable3 = function(dictOrd) {
  var insert1 = insert2(dictOrd);
  return function(dictFoldable) {
    return foldl(dictFoldable)(function(m) {
      return function(v) {
        return insert1(v.value0)(v.value1)(m);
      };
    })(empty2);
  };
};
var $$delete2 = function(dictOrd) {
  var pop1 = pop(dictOrd);
  return function(k) {
    return function(m) {
      return maybe(m)(snd)(pop1(k)(m));
    };
  };
};

// output/Data.DDF.Concept/index.js
var map8 = /* @__PURE__ */ map(functorV);
var unwrap3 = /* @__PURE__ */ unwrap();
var pure7 = /* @__PURE__ */ pure(/* @__PURE__ */ applicativeV(semigroupArray));
var lookup2 = /* @__PURE__ */ lookup(ordId);
var eq3 = /* @__PURE__ */ eq(eqId);
var map13 = /* @__PURE__ */ map(functorNonEmptyArray);
var coerce3 = /* @__PURE__ */ coerce();
var fromFoldable4 = /* @__PURE__ */ fromFoldable3(ordId)(foldableNonEmptyArray);
var $$delete3 = /* @__PURE__ */ $$delete2(ordId);
var apply3 = /* @__PURE__ */ apply(/* @__PURE__ */ applyV(semigroupArray));
var StringC = /* @__PURE__ */ function() {
  function StringC2() {
  }
  ;
  StringC2.value = new StringC2();
  return StringC2;
}();
var MeasureC = /* @__PURE__ */ function() {
  function MeasureC2() {
  }
  ;
  MeasureC2.value = new MeasureC2();
  return MeasureC2;
}();
var BooleanC = /* @__PURE__ */ function() {
  function BooleanC2() {
  }
  ;
  BooleanC2.value = new BooleanC2();
  return BooleanC2;
}();
var IntervalC = /* @__PURE__ */ function() {
  function IntervalC2() {
  }
  ;
  IntervalC2.value = new IntervalC2();
  return IntervalC2;
}();
var EntityDomainC = /* @__PURE__ */ function() {
  function EntityDomainC2() {
  }
  ;
  EntityDomainC2.value = new EntityDomainC2();
  return EntityDomainC2;
}();
var EntitySetC = /* @__PURE__ */ function() {
  function EntitySetC2() {
  }
  ;
  EntitySetC2.value = new EntitySetC2();
  return EntitySetC2;
}();
var RoleC = /* @__PURE__ */ function() {
  function RoleC2() {
  }
  ;
  RoleC2.value = new RoleC2();
  return RoleC2;
}();
var CompositeC = /* @__PURE__ */ function() {
  function CompositeC2() {
  }
  ;
  CompositeC2.value = new CompositeC2();
  return CompositeC2;
}();
var TimeC = /* @__PURE__ */ function() {
  function TimeC2() {
  }
  ;
  TimeC2.value = new TimeC2();
  return TimeC2;
}();
var CustomC = /* @__PURE__ */ function() {
  function CustomC2(value0) {
    this.value0 = value0;
  }
  ;
  CustomC2.create = function(value0) {
    return new CustomC2(value0);
  };
  return CustomC2;
}();
var Concept = /* @__PURE__ */ function() {
  function Concept2(value0) {
    this.value0 = value0;
  }
  ;
  Concept2.create = function(value0) {
    return new Concept2(value0);
  };
  return Concept2;
}();
var parseConceptType = function(x) {
  return map8(function(v) {
    var res = function() {
      var v1 = toString(unwrap3(v));
      if (v1 === "string") {
        return StringC.value;
      }
      ;
      if (v1 === "meaeure") {
        return MeasureC.value;
      }
      ;
      if (v1 === "bollean") {
        return BooleanC.value;
      }
      ;
      if (v1 === "interval") {
        return IntervalC.value;
      }
      ;
      if (v1 === "entity_domain") {
        return EntityDomainC.value;
      }
      ;
      if (v1 === "entity_set") {
        return EntitySetC.value;
      }
      ;
      if (v1 === "role") {
        return RoleC.value;
      }
      ;
      if (v1 === "composite") {
        return CompositeC.value;
      }
      ;
      if (v1 === "time") {
        return TimeC.value;
      }
      ;
      return new CustomC(v);
    }();
    return res;
  })(parseId(x));
};
var nonEmptyField = function(field) {
  return function(input) {
    var $57 = $$null(input);
    if ($57) {
      return invalid(["field " + (field + " MUST not be empty")]);
    }
    ;
    return pure7(input);
  };
};
var hasFieldAndGetValue = function(field) {
  return function(input) {
    var v = lookup2(unsafeCreate(field))(input);
    if (v instanceof Nothing) {
      return invalid(["field " + (field + "MUST exist for concept")]);
    }
    ;
    if (v instanceof Just) {
      return pure7(v.value0);
    }
    ;
    throw new Error("Failed pattern match at Data.DDF.Concept (line 113, column 35 - line 115, column 19): " + [v.constructor.name]);
  };
};
var getId = function(v) {
  return v.value0.conceptId;
};
var eqConceptType = {
  eq: function(x) {
    return function(y) {
      if (x instanceof StringC && y instanceof StringC) {
        return true;
      }
      ;
      if (x instanceof MeasureC && y instanceof MeasureC) {
        return true;
      }
      ;
      if (x instanceof BooleanC && y instanceof BooleanC) {
        return true;
      }
      ;
      if (x instanceof IntervalC && y instanceof IntervalC) {
        return true;
      }
      ;
      if (x instanceof EntityDomainC && y instanceof EntityDomainC) {
        return true;
      }
      ;
      if (x instanceof EntitySetC && y instanceof EntitySetC) {
        return true;
      }
      ;
      if (x instanceof RoleC && y instanceof RoleC) {
        return true;
      }
      ;
      if (x instanceof CompositeC && y instanceof CompositeC) {
        return true;
      }
      ;
      if (x instanceof TimeC && y instanceof TimeC) {
        return true;
      }
      ;
      if (x instanceof CustomC && y instanceof CustomC) {
        return eq3(x.value0)(y.value0);
      }
      ;
      return false;
    };
  }
};
var conceptInputFromCsvRec = function(v) {
  var headersL = map13(coerce3)(v.value0);
  var rowAsMap = function(r) {
    return fromFoldable4(zip2(headersL)(r));
  };
  return rowAsMap(v.value1);
};
var conceptIdTooLong = function(v) {
  return map8(function(v1) {
    return v;
  })(isLongerThan64Chars(v.value0.conceptId));
};
var concept = function(conceptId) {
  return function(conceptType) {
    return function(props) {
      return new Concept({
        conceptId,
        conceptType,
        props
      });
    };
  };
};
var checkMandatoryField = function(v) {
  if (v.value0.conceptType instanceof EntitySetC) {
    return map8(function(v1) {
      return v;
    })(andThen(hasFieldAndGetValue("domain")(v.value0.props))(nonEmptyField("domain")));
  }
  ;
  return pure7(v);
};
var parseConcept = function(input) {
  var props = $$delete3(unsafeCreate("concept_type"))($$delete3(unsafeCreate("concept"))(input));
  var conceptType = andThen(andThen(hasFieldAndGetValue("concept_type")(input))(nonEmptyField("concept_type")))(parseConceptType);
  var conceptId = andThen(andThen(hasFieldAndGetValue("concept")(input))(nonEmptyField("concept")))(parseId);
  return andThen(apply3(apply3(map8(concept)(conceptId))(conceptType))(pure7(props)))(checkMandatoryField);
};

// output/Node.Path/foreign.js
import path from "path";
var normalize = path.normalize;
function concat2(segments) {
  return path.join.apply(this, segments);
}
var basename = path.basename;
var extname = path.extname;
var sep = path.sep;
var delimiter = path.delimiter;
var parse2 = path.parse;
var isAbsolute = path.isAbsolute;

// output/Data.DDF.FileInfo/index.js
var bind5 = /* @__PURE__ */ bind(bindParser);
var discard2 = /* @__PURE__ */ discard(discardUnit)(bindParser);
var $$void2 = /* @__PURE__ */ $$void(functorParser);
var pure8 = /* @__PURE__ */ pure(applicativeParser);
var choice2 = /* @__PURE__ */ choice(foldableArray);
var map9 = /* @__PURE__ */ map(functorNonEmptyList);
var alt4 = /* @__PURE__ */ alt(altParser);
var pure12 = /* @__PURE__ */ pure(/* @__PURE__ */ applicativeV(semigroupArray));
var Concepts = /* @__PURE__ */ function() {
  function Concepts2() {
  }
  ;
  Concepts2.value = new Concepts2();
  return Concepts2;
}();
var Entities = /* @__PURE__ */ function() {
  function Entities2(value0) {
    this.value0 = value0;
  }
  ;
  Entities2.create = function(value0) {
    return new Entities2(value0);
  };
  return Entities2;
}();
var DataPoints = /* @__PURE__ */ function() {
  function DataPoints2(value0) {
    this.value0 = value0;
  }
  ;
  DataPoints2.create = function(value0) {
    return new DataPoints2(value0);
  };
  return DataPoints2;
}();
var FileInfo = /* @__PURE__ */ function() {
  function FileInfo2(value0, value1, value2) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
  }
  ;
  FileInfo2.create = function(value0) {
    return function(value1) {
      return function(value2) {
        return new FileInfo2(value0, value1, value2);
      };
    };
  };
  return FileInfo2;
}();
var pkeyWithConstrain = /* @__PURE__ */ bind5(identifier)(function(key) {
  return discard2($$void2(string("-")))(function() {
    return bind5(identifier)(function(constrain) {
      return pure8(new Tuple(key, new Just(constrain)));
    });
  });
});
var pkeyNoConstrain = /* @__PURE__ */ bind5(identifier)(function(key) {
  return pure8(new Tuple(key, Nothing.value));
});
var pkey = /* @__PURE__ */ choice2([/* @__PURE__ */ $$try(pkeyWithConstrain), /* @__PURE__ */ $$try(pkeyNoConstrain)]);
var isEntitiesFile = function(v) {
  if (v.value1 instanceof Entities) {
    return true;
  }
  ;
  return false;
};
var isDataPointsFile = function(v) {
  if (v.value1 instanceof DataPoints) {
    return true;
  }
  ;
  return false;
};
var isConceptFile = function(v) {
  if (v.value1 instanceof Concepts) {
    return true;
  }
  ;
  return false;
};
var getName = /* @__PURE__ */ stripSuffix(".csv");
var getCollectionFiles = function(v) {
  if (v === "concepts") {
    return filter(isConceptFile);
  }
  ;
  if (v === "entities") {
    return filter(isEntitiesFile);
  }
  ;
  if (v === "datapoints") {
    return filter(isDataPointsFile);
  }
  ;
  return function(v1) {
    return [];
  };
};
var filepath = function(v) {
  return v.value0;
};
var ddfFileBegin = /* @__PURE__ */ $$void2(/* @__PURE__ */ string("ddf--"));
var e1 = /* @__PURE__ */ discard2(ddfFileBegin)(function() {
  return discard2($$void2(string("entities--")))(function() {
    return bind5(identifier)(function(domain) {
      return discard2(eof)(function() {
        return pure8(new Entities({
          domain,
          set: Nothing.value
        }));
      });
    });
  });
});
var e2 = /* @__PURE__ */ discard2(ddfFileBegin)(function() {
  return discard2($$void2(string("entities--")))(function() {
    return bind5(identifier)(function(domain) {
      return discard2($$void2(string("--")))(function() {
        return bind5(identifier)(function(eset) {
          return discard2(eof)(function() {
            return pure8(new Entities({
              domain,
              set: new Just(eset)
            }));
          });
        });
      });
    });
  });
});
var entityFile = /* @__PURE__ */ choice2([/* @__PURE__ */ $$try(e2), /* @__PURE__ */ $$try(e1)]);
var datapointFile = /* @__PURE__ */ discard2(ddfFileBegin)(function() {
  return discard2($$void2(string("datapoints--")))(function() {
    return bind5(identifier)(function(indicator) {
      return discard2($$void2(string("--by--")))(function() {
        return bind5(sepBy1(pkey)(string("--")))(function(dims) {
          var pkeys = map9(fst)(dims);
          var constrains = map9(snd)(dims);
          return pure8(new DataPoints({
            indicator,
            pkeys,
            constrains
          }));
        });
      });
    });
  });
});
var collection = function(v) {
  return v.value1;
};
var c2 = /* @__PURE__ */ bind5(/* @__PURE__ */ string("ddf--concepts--"))(function(p1) {
  return bind5(alt4(string("discrete"))(string("continuous")))(function(p2) {
    return discard2($$void2(eof))(function() {
      return pure8(p1 + p2);
    });
  });
});
var c1 = /* @__PURE__ */ applyFirst(applyParser)(/* @__PURE__ */ string("ddf--concepts"))(eof);
var conceptFile = /* @__PURE__ */ function() {
  return applySecond(applyParser)(choice2([$$try(c1), $$try(c2)]))(pure8(Concepts.value));
}();
var validateFileInfo = function(fp) {
  var v = getName(basename(fp));
  if (v instanceof Nothing) {
    return invalid([fp + " is not a csv file"]);
  }
  ;
  if (v instanceof Just) {
    var fileParser = alt4(conceptFile)(alt4(entityFile)(datapointFile));
    var v1 = runParser(fileParser)(v.value0);
    if (v1 instanceof Right) {
      return pure12(new FileInfo(fp, v1.value0, v.value0));
    }
    ;
    if (v1 instanceof Left) {
      return invalid([fp + (" is not correct ddf file: " + v1.value0.error)]);
    }
    ;
    throw new Error("Failed pattern match at Data.DDF.FileInfo (line 178, column 7 - line 180, column 88): " + [v1.constructor.name]);
  }
  ;
  throw new Error("Failed pattern match at Data.DDF.FileInfo (line 172, column 23 - line 180, column 88): " + [v.constructor.name]);
};

// output/Control.Monad.Error.Class/index.js
var throwError = function(dict) {
  return dict.throwError;
};

// output/Control.Monad.State.Class/index.js
var state = function(dict) {
  return dict.state;
};
var modify_ = function(dictMonadState) {
  var state1 = state(dictMonadState);
  return function(f) {
    return state1(function(s) {
      return new Tuple(unit, f(s));
    });
  };
};

// output/Control.Monad.Except.Trans/index.js
var map10 = /* @__PURE__ */ map(functorEither);
var ExceptT = function(x) {
  return x;
};
var runExceptT = function(v) {
  return v;
};
var monadTransExceptT = {
  lift: function(dictMonad) {
    var bind7 = bind(dictMonad.Bind1());
    var pure19 = pure(dictMonad.Applicative0());
    return function(m) {
      return bind7(m)(function(a) {
        return pure19(new Right(a));
      });
    };
  }
};
var lift3 = /* @__PURE__ */ lift(monadTransExceptT);
var mapExceptT = function(f) {
  return function(v) {
    return f(v);
  };
};
var functorExceptT = function(dictFunctor) {
  var map111 = map(dictFunctor);
  return {
    map: function(f) {
      return mapExceptT(map111(map10(f)));
    }
  };
};
var monadExceptT = function(dictMonad) {
  return {
    Applicative0: function() {
      return applicativeExceptT(dictMonad);
    },
    Bind1: function() {
      return bindExceptT(dictMonad);
    }
  };
};
var bindExceptT = function(dictMonad) {
  var bind7 = bind(dictMonad.Bind1());
  var pure19 = pure(dictMonad.Applicative0());
  return {
    bind: function(v) {
      return function(k) {
        return bind7(v)(either(function($187) {
          return pure19(Left.create($187));
        })(function(a) {
          var v1 = k(a);
          return v1;
        }));
      };
    },
    Apply0: function() {
      return applyExceptT(dictMonad);
    }
  };
};
var applyExceptT = function(dictMonad) {
  var functorExceptT1 = functorExceptT(dictMonad.Bind1().Apply0().Functor0());
  return {
    apply: ap(monadExceptT(dictMonad)),
    Functor0: function() {
      return functorExceptT1;
    }
  };
};
var applicativeExceptT = function(dictMonad) {
  return {
    pure: function() {
      var $188 = pure(dictMonad.Applicative0());
      return function($189) {
        return ExceptT($188(Right.create($189)));
      };
    }(),
    Apply0: function() {
      return applyExceptT(dictMonad);
    }
  };
};
var monadStateExceptT = function(dictMonadState) {
  var Monad0 = dictMonadState.Monad0();
  var lift12 = lift3(Monad0);
  var state2 = state(dictMonadState);
  var monadExceptT1 = monadExceptT(Monad0);
  return {
    state: function(f) {
      return lift12(state2(f));
    },
    Monad0: function() {
      return monadExceptT1;
    }
  };
};
var monadThrowExceptT = function(dictMonad) {
  var monadExceptT1 = monadExceptT(dictMonad);
  return {
    throwError: function() {
      var $198 = pure(dictMonad.Applicative0());
      return function($199) {
        return ExceptT($198(Left.create($199)));
      };
    }(),
    Monad0: function() {
      return monadExceptT1;
    }
  };
};

// output/Control.Monad.State.Trans/index.js
var runStateT = function(v) {
  return v;
};
var monadTransStateT = {
  lift: function(dictMonad) {
    var bind7 = bind(dictMonad.Bind1());
    var pure19 = pure(dictMonad.Applicative0());
    return function(m) {
      return function(s) {
        return bind7(m)(function(x) {
          return pure19(new Tuple(x, s));
        });
      };
    };
  }
};
var functorStateT = function(dictFunctor) {
  var map24 = map(dictFunctor);
  return {
    map: function(f) {
      return function(v) {
        return function(s) {
          return map24(function(v1) {
            return new Tuple(f(v1.value0), v1.value1);
          })(v(s));
        };
      };
    }
  };
};
var monadStateT = function(dictMonad) {
  return {
    Applicative0: function() {
      return applicativeStateT(dictMonad);
    },
    Bind1: function() {
      return bindStateT(dictMonad);
    }
  };
};
var bindStateT = function(dictMonad) {
  var bind7 = bind(dictMonad.Bind1());
  return {
    bind: function(v) {
      return function(f) {
        return function(s) {
          return bind7(v(s))(function(v1) {
            var v3 = f(v1.value0);
            return v3(v1.value1);
          });
        };
      };
    },
    Apply0: function() {
      return applyStateT(dictMonad);
    }
  };
};
var applyStateT = function(dictMonad) {
  var functorStateT1 = functorStateT(dictMonad.Bind1().Apply0().Functor0());
  return {
    apply: ap(monadStateT(dictMonad)),
    Functor0: function() {
      return functorStateT1;
    }
  };
};
var applicativeStateT = function(dictMonad) {
  var pure19 = pure(dictMonad.Applicative0());
  return {
    pure: function(a) {
      return function(s) {
        return pure19(new Tuple(a, s));
      };
    },
    Apply0: function() {
      return applyStateT(dictMonad);
    }
  };
};
var monadStateStateT = function(dictMonad) {
  var pure19 = pure(dictMonad.Applicative0());
  var monadStateT1 = monadStateT(dictMonad);
  return {
    state: function(f) {
      return function($200) {
        return pure19(f($200));
      };
    },
    Monad0: function() {
      return monadStateT1;
    }
  };
};

// output/Data.DDF.Validation.ValidationT/index.js
var lift4 = /* @__PURE__ */ lift(monadTransExceptT);
var lift1 = /* @__PURE__ */ lift(monadTransStateT);
var ValidationT = function(x) {
  return x;
};
var vWarning = function(dictMonad) {
  var modify_2 = modify_(monadStateExceptT(monadStateStateT(dictMonad)));
  return function(dictMonoid) {
    var append3 = append(dictMonoid.Semigroup0());
    return function(e) {
      return modify_2(function(x) {
        return append3(x)(e);
      });
    };
  };
};
var vError = function(dictMonad) {
  var throwError2 = throwError(monadThrowExceptT(monadStateT(dictMonad)));
  return function(e) {
    return throwError2(e);
  };
};
var runValidationT = function(dictMonad) {
  var bind7 = bind(dictMonad.Bind1());
  var pure19 = pure(dictMonad.Applicative0());
  return function(dictMonoid) {
    var mempty2 = mempty(dictMonoid);
    var append3 = append(dictMonoid.Semigroup0());
    return function(v) {
      return bind7(runStateT(runExceptT(v))(mempty2))(function(v1) {
        return pure19(function() {
          if (v1.value0 instanceof Left) {
            return new Tuple(append3(v1.value0.value0)(v1.value1), Nothing.value);
          }
          ;
          if (v1.value0 instanceof Right) {
            return new Tuple(v1.value1, new Just(v1.value0.value0));
          }
          ;
          throw new Error("Failed pattern match at Data.DDF.Validation.ValidationT (line 46, column 7 - line 48, column 43): " + [v1.value0.constructor.name]);
        }());
      });
    };
  };
};
var monadtransV = {
  lift: function(dictMonad) {
    var $68 = lift4(monadStateT(dictMonad));
    var $69 = lift1(dictMonad);
    return function($70) {
      return ValidationT($68($69($70)));
    };
  }
};
var monadV = function(dictMonad) {
  return monadExceptT(monadStateT(dictMonad));
};
var bindV = function(dictMonad) {
  return bindExceptT(monadStateT(dictMonad));
};
var applicativeV2 = function(dictMonad) {
  return applicativeExceptT(monadStateT(dictMonad));
};

// output/Data.Set/index.js
var foldl4 = /* @__PURE__ */ foldl(foldableList);
var toList2 = function(v) {
  return keys(v);
};
var isEmpty2 = function(v) {
  return isEmpty(v);
};
var insert3 = function(dictOrd) {
  var insert1 = insert2(dictOrd);
  return function(a) {
    return function(v) {
      return insert1(a)(unit)(v);
    };
  };
};
var empty3 = empty2;
var fromFoldable5 = function(dictFoldable) {
  var foldl22 = foldl(dictFoldable);
  return function(dictOrd) {
    var insert1 = insert3(dictOrd);
    return foldl22(function(m) {
      return function(a) {
        return insert1(a)(m);
      };
    })(empty3);
  };
};
var $$delete4 = function(dictOrd) {
  var delete1 = $$delete2(dictOrd);
  return function(a) {
    return function(v) {
      return delete1(a)(v);
    };
  };
};
var difference2 = function(dictOrd) {
  var delete1 = $$delete4(dictOrd);
  return function(s1) {
    return function(s2) {
      return foldl4(flip(delete1))(s1)(toList2(s2));
    };
  };
};
var subset = function(dictOrd) {
  var difference1 = difference2(dictOrd);
  return function(s1) {
    return function(s2) {
      return isEmpty2(difference1(s1)(s2));
    };
  };
};

// output/Data.String.Utils/foreign.js
function startsWithImpl(searchString, s) {
  return s.startsWith(searchString);
}

// output/Data.String.Utils/index.js
var startsWith = function(searchString) {
  return function(s) {
    return startsWithImpl(searchString, s);
  };
};

// output/Data.DDF.CsvFile/index.js
var applicativeV3 = /* @__PURE__ */ applicativeV(semigroupArray);
var pure9 = /* @__PURE__ */ pure(applicativeV3);
var fromFoldable6 = /* @__PURE__ */ fromFoldable(foldableNonEmptyArray);
var elem5 = /* @__PURE__ */ elem2(eqString);
var show5 = /* @__PURE__ */ show(/* @__PURE__ */ showArray(showString));
var join2 = /* @__PURE__ */ join(bindMaybe);
var map11 = /* @__PURE__ */ map(functorMaybe);
var bind6 = /* @__PURE__ */ bind(bindParser);
var pure13 = /* @__PURE__ */ pure(applicativeParser);
var append1 = /* @__PURE__ */ append(semigroupNonEmptyString);
var discard3 = /* @__PURE__ */ discard(discardUnit);
var discard1 = /* @__PURE__ */ discard3(bindParser);
var $$void3 = /* @__PURE__ */ $$void(functorParser);
var show1 = /* @__PURE__ */ show(showInt);
var eq4 = /* @__PURE__ */ eq(eqNonEmptyString);
var compare4 = /* @__PURE__ */ compare(ordNonEmptyString);
var map14 = /* @__PURE__ */ map(functorNonEmptyArray);
var sequence2 = /* @__PURE__ */ sequence(traversableNonEmptyArray)(applicativeV3);
var show23 = /* @__PURE__ */ show(/* @__PURE__ */ showArray(showNonEmptyString));
var apply4 = /* @__PURE__ */ apply(/* @__PURE__ */ applyV(semigroupArray));
var map23 = /* @__PURE__ */ map(functorV);
var CsvFile = /* @__PURE__ */ function() {
  function CsvFile2(value0) {
    this.value0 = value0;
  }
  ;
  CsvFile2.create = function(value0) {
    return new CsvFile2(value0);
  };
  return CsvFile2;
}();
var validCsvRec = function(headers) {
  return function(v) {
    var $108 = length2(headers) !== length(v.value1);
    if ($108) {
      return invalid(["bad csv row"]);
    }
    ;
    return pure9(new Tuple(headers, v.value1));
  };
};
var oneOfHeaderExists = function(expected) {
  return function(csvcontent) {
    var xor = function(v) {
      return function(v1) {
        if (v && !v1) {
          return true;
        }
        ;
        if (!v && v1) {
          return true;
        }
        ;
        return false;
      };
    };
    var actual = fromFoldable6(csvcontent.headers);
    var res = foldr2(function(x) {
      return function(acc) {
        return xor(elem5(x)(actual))(acc);
      };
    })(false)(expected);
    if (res) {
      return pure9(csvcontent);
    }
    ;
    return invalid(["file MUST have one and only one of follwoing field: " + show5(expected)]);
  };
};
var notEmptyCsv = function(input) {
  var v = join2(map11(fromArray)(input.headers));
  if (v instanceof Nothing) {
    return invalid(["no headers"]);
  }
  ;
  if (v instanceof Just) {
    if (input.rows instanceof Nothing) {
      return pure9({
        headers: v.value0,
        rows: []
      });
    }
    ;
    if (input.rows instanceof Just) {
      return pure9({
        headers: v.value0,
        rows: input.rows.value0
      });
    }
    ;
    throw new Error("Failed pattern match at Data.DDF.CsvFile (line 131, column 14 - line 133, column 48): " + [input.rows.constructor.name]);
  }
  ;
  throw new Error("Failed pattern match at Data.DDF.CsvFile (line 129, column 21 - line 133, column 48): " + [v.constructor.name]);
};
var mkCsvFile = function(fi) {
  return function(csv) {
    return new CsvFile({
      fileInfo: fi,
      csvContent: csv
    });
  };
};
var is_header = /* @__PURE__ */ bind6(/* @__PURE__ */ string("is--"))(function(begin) {
  return bind6(identifier)(function(val) {
    return pure13(append1(begin)(val));
  });
});
var headerVal = /* @__PURE__ */ unwrap();
var header = /* @__PURE__ */ bind6(/* @__PURE__ */ alt(altParser)(is_header)(identifier))(function(h) {
  return discard1($$void3(eof))(function() {
    return pure13(h);
  });
});
var parseHeader = function(x) {
  var v = runParser(header)(x);
  if (v instanceof Right) {
    return pure9(v.value0);
  }
  ;
  if (v instanceof Left) {
    var pos = show1(v.value0.pos);
    var msg = "invalid header: " + (x + (", " + (v.value0.error + ("at pos " + pos))));
    return invalid([msg]);
  }
  ;
  throw new Error("Failed pattern match at Data.DDF.CsvFile (line 64, column 17 - line 72, column 20): " + [v.constructor.name]);
};
var hasCols = function(dictFoldable) {
  var fromFoldable13 = fromFoldable5(dictFoldable);
  return function(dictOrd) {
    var fromFoldable22 = fromFoldable13(dictOrd);
    var subset2 = subset(dictOrd);
    return function(dictEq) {
      return function(expected) {
        return function(actual) {
          var expectedSet = fromFoldable22(expected);
          var actualSet = fromFoldable22(actual);
          return subset2(expectedSet)(actualSet);
        };
      };
    };
  };
};
var hasCols1 = /* @__PURE__ */ hasCols(foldableArray)(ordString)(eqString);
var headersExists = function(expected) {
  return function(csvcontent) {
    var actual = fromFoldable6(csvcontent.headers);
    var $121 = hasCols1(expected)(actual);
    if ($121) {
      return pure9(csvcontent);
    }
    ;
    return invalid(["file MUST have following field: " + show5(expected)]);
  };
};
var getFileInfo = function(v) {
  return v.value0.fileInfo;
};
var getCsvContent = function(v) {
  return v.value0.csvContent;
};
var eqHeader = {
  eq: function(x) {
    return function(y) {
      return eq4(x)(y);
    };
  }
};
var ordHeader = {
  compare: function(x) {
    return function(y) {
      return compare4(x)(y);
    };
  },
  Eq0: function() {
    return eqHeader;
  }
};
var colsAreValidIds = function(input) {
  var res = sequence2(map14(parseHeader)(input.headers));
  var v = toEither(res);
  if (v instanceof Right) {
    var headerValues = map14(headerVal)(v.value0);
    var is_headers = filter2(function() {
      var $155 = startsWith("is--");
      return function($156) {
        return $155(toString($156));
      };
    }())(headerValues);
    if (is_headers.length === 0) {
      return pure9({
        headers: v.value0,
        rows: input.rows
      });
    }
    ;
    return invalid(["these headers are not valid Ids: " + show23(is_headers)]);
  }
  ;
  if (v instanceof Left) {
    return invalid(v.value0);
  }
  ;
  throw new Error("Failed pattern match at Data.DDF.CsvFile (line 141, column 5 - line 151, column 32): " + [v.constructor.name]);
};
var colsAreValidHeaders = function(input) {
  var res = sequence2(map14(parseHeader)(input.headers));
  var v = toEither(res);
  if (v instanceof Right) {
    return pure9({
      headers: v.value0,
      rows: input.rows
    });
  }
  ;
  if (v instanceof Left) {
    return invalid(v.value0);
  }
  ;
  throw new Error("Failed pattern match at Data.DDF.CsvFile (line 159, column 5 - line 161, column 32): " + [v.constructor.name]);
};
var validCsvFile = function(v) {
  return function(csvcontent) {
    if (v.value1 instanceof Concepts) {
      var required = ["concept", "concept_type"];
      var vc = andThen(andThen(notEmptyCsv(csvcontent))(headersExists(required)))(colsAreValidIds);
      return apply4(map23(mkCsvFile)(pure9(v)))(vc);
    }
    ;
    if (v.value1 instanceof Entities) {
      var required = function() {
        if (v.value1.value0.set instanceof Just) {
          return [toString(v.value1.value0.set.value0), toString(v.value1.value0.domain)];
        }
        ;
        if (v.value1.value0.set instanceof Nothing) {
          return [toString(v.value1.value0.domain)];
        }
        ;
        throw new Error("Failed pattern match at Data.DDF.CsvFile (line 228, column 18 - line 230, column 39): " + [v.value1.value0.set.constructor.name]);
      }();
      var vc = andThen(andThen(notEmptyCsv(csvcontent))(oneOfHeaderExists(required)))(colsAreValidHeaders);
      return apply4(map23(mkCsvFile)(pure9(v)))(vc);
    }
    ;
    return invalid(["not implemented"]);
  };
};

// output/Data.DDF.Boolean/index.js
var pure10 = /* @__PURE__ */ pure(/* @__PURE__ */ applicativeV(semigroupArray));
var isBoolean = function(x) {
  if (x === "TRUE") {
    return pure10(true);
  }
  ;
  if (x === "FALSE") {
    return pure10(false);
  }
  ;
  if (otherwise) {
    return invalid([x + " is not boolean value"]);
  }
  ;
  throw new Error("Failed pattern match at Data.DDF.Boolean (line 8, column 1 - line 8, column 40): " + [x.constructor.name]);
};

// output/Data.DDF.Entity/index.js
var coerce4 = /* @__PURE__ */ coerce();
var toUnfoldableUnordered2 = /* @__PURE__ */ toUnfoldableUnordered(unfoldableList);
var map15 = /* @__PURE__ */ map(functorList);
var unwrap4 = /* @__PURE__ */ unwrap();
var applicativeV4 = /* @__PURE__ */ applicativeV(semigroupArray);
var pure11 = /* @__PURE__ */ pure(applicativeV4);
var sequence3 = /* @__PURE__ */ sequence(traversableList)(applicativeV4);
var fromFoldable7 = /* @__PURE__ */ fromFoldable3(ordHeader)(foldableNonEmptyArray);
var elem6 = /* @__PURE__ */ elem3(eqHeader);
var fromJust5 = /* @__PURE__ */ fromJust();
var pop2 = /* @__PURE__ */ pop(ordHeader);
var fromFoldable12 = /* @__PURE__ */ fromFoldable3(ordId)(foldableList);
var apply5 = /* @__PURE__ */ apply(/* @__PURE__ */ applyV(semigroupArray));
var map16 = /* @__PURE__ */ map(functorV);
var Entity = /* @__PURE__ */ function() {
  function Entity2(value0) {
    this.value0 = value0;
  }
  ;
  Entity2.create = function(value0) {
    return new Entity2(value0);
  };
  return Entity2;
}();
var validEntityId = function(s) {
  return parseId(s);
};
var validEntityDomainId = coerce4;
var splitEntAndProps = function(props) {
  var isIsHeader = function(v2) {
    var headerStr = headerVal(v2.value0);
    var v1 = stripPrefix2("is--")(headerStr);
    if (v1 instanceof Nothing) {
      return false;
    }
    ;
    if (v1 instanceof Just) {
      return true;
    }
    ;
    throw new Error("Failed pattern match at Data.DDF.Entity (line 75, column 9 - line 77, column 25): " + [v1.constructor.name]);
  };
  var isHeaderToIdentifier = function(header2) {
    return unsafeCreate(drop3(4)(toString(headerVal(header2))));
  };
  var headerToIdentifier = function(header2) {
    return unsafeCreate(toString(headerVal(header2)));
  };
  var v = partition2(isIsHeader)(toUnfoldableUnordered2(props));
  var yes_ = map15(function(v1) {
    return new Tuple(isHeaderToIdentifier(v1.value0), v1.value1);
  })(v.yes);
  var no_ = map15(function(v1) {
    return new Tuple(headerToIdentifier(v1.value0), v1.value1);
  })(v.no);
  return new Tuple(yes_, no_);
};
var getEntitySets = function(lst) {
  var collectTrueItem = function(v) {
    var headerStr = toString(unwrap4(v.value0));
    var boolValue = isBoolean(v.value1);
    var $77 = isValid(boolValue);
    if ($77) {
      return pure11(v.value0);
    }
    ;
    return invalid(["invalid boolean value for " + (headerStr + (": " + v.value1))]);
  };
  var entitySetWithTureValue = sequence3(map15(collectTrueItem)(lst));
  return entitySetWithTureValue;
};
var entityInputFromCsvRecAndFileInfo = function(v) {
  return function(v1) {
    var propsMap = fromFoldable7(zip2(v1.value0)(v1.value1));
    var entityCol = function() {
      if (v.set instanceof Nothing) {
        return v.domain;
      }
      ;
      if (v.set instanceof Just) {
        var $87 = elem6(v.set.value0)(v1.value0);
        if ($87) {
          return v.set.value0;
        }
        ;
        return v.domain;
      }
      ;
      throw new Error("Failed pattern match at Data.DDF.Entity (line 132, column 17 - line 138, column 24): " + [v.set.constructor.name]);
    }();
    var v2 = fromJust5(pop2(entityCol)(propsMap));
    return pure11({
      entityId: v2.value0,
      entityDomain: v.domain,
      entitySet: v.set,
      props: v2.value1
    });
  };
};
var entity = function(entityId) {
  return function(entityDomain) {
    return function(entitySets) {
      return function(props) {
        return new Entity({
          entityId,
          entityDomain,
          entitySets,
          props
        });
      };
    };
  };
};
var parseEntity = function(v) {
  var $97 = $$null(v.entityId);
  if ($97) {
    return invalid(["entity MUST have an entity id"]);
  }
  ;
  var validEid = validEntityId(v.entityId);
  var validEdomain = validEntityDomainId(v.entityDomain);
  var v1 = splitEntAndProps(v.props);
  var validEsets = getEntitySets(v1.value0);
  var propsMinusIsHeaders = fromFoldable12(v1.value1);
  return apply5(apply5(apply5(map16(entity)(validEid))(pure11(validEdomain)))(validEsets))(pure11(propsMinusIsHeaders));
};

// output/Data.DDF.DataSet/index.js
var member2 = /* @__PURE__ */ member(ordId);
var lookup3 = /* @__PURE__ */ lookup(ordId);
var eq5 = /* @__PURE__ */ eq(eqConceptType);
var applicativeV5 = /* @__PURE__ */ applicativeV(semigroupArray);
var pure14 = /* @__PURE__ */ pure(applicativeV5);
var map17 = /* @__PURE__ */ map(functorV);
var sequence4 = /* @__PURE__ */ sequence(traversableList)(applicativeV5);
var map18 = /* @__PURE__ */ map(functorList);
var fromJust6 = /* @__PURE__ */ fromJust();
var intersect2 = /* @__PURE__ */ intersect(eqId);
var append12 = /* @__PURE__ */ append(semigroupList);
var insert4 = /* @__PURE__ */ insert2(ordId);
var apply6 = /* @__PURE__ */ apply(/* @__PURE__ */ applyV(semigroupArray));
var DataSet = /* @__PURE__ */ function() {
  function DataSet2(value0) {
    this.value0 = value0;
  }
  ;
  DataSet2.create = function(value0) {
    return new DataSet2(value0);
  };
  return DataSet2;
}();
var hasConcept = function(v) {
  return function(conc) {
    return member2(conc)(v.value0.concepts);
  };
};
var getEntitiesFromDomain = function(id) {
  return function(v) {
    var v1 = lookup3(id)(v.value0.entities);
    if (v1 instanceof Just) {
      return v1.value0;
    }
    ;
    if (v1 instanceof Nothing) {
      return empty2;
    }
    ;
    throw new Error("Failed pattern match at Data.DDF.DataSet (line 121, column 41 - line 123, column 21): " + [v1.constructor.name]);
  };
};
var empty4 = /* @__PURE__ */ function() {
  return new DataSet({
    concepts: empty2,
    entities: empty2
  });
}();
var checkConceptExist = function(id) {
  return function(v) {
    var $75 = !hasConcept(v)(id);
    if ($75) {
      return invalid(["concept " + (value(id) + " not exists in dataset")]);
    }
    ;
    return pure14(unit);
  };
};
var checkDomainForEntitySets = function(v) {
  var isEntityConcept = function(v1) {
    if (eq5(v1.value0.conceptType)(EntitySetC.value)) {
      return true;
    }
    ;
    if (otherwise) {
      return false;
    }
    ;
    throw new Error("Failed pattern match at Data.DDF.DataSet (line 106, column 5 - line 108, column 26): " + [v1.constructor.name]);
  };
  var getDomain = function(v1) {
    return fromJust6(lookup3(unsafeCreate("domain"))(v1.value0.props));
  };
  var entitysetConcepts = filter3(isEntityConcept)(values(v.value0.concepts));
  var check = function(e) {
    return andThen(parseId(getDomain(e)))(function(cid) {
      return checkConceptExist(cid)(v);
    });
  };
  return map17(function(v1) {
    return v;
  })(sequence4(map18(function(e) {
    return check(e);
  })(entitysetConcepts)));
};
var appendEntityToList = function(v) {
  return function(es) {
    var v1 = lookup3(v.value0.entityId)(es);
    if (v1 instanceof Just) {
      var $86 = length5(intersect2(v.value0.entitySets)(v1.value0.value0.entitySets)) > 0;
      if ($86) {
        return invalid(["duplicated defeintion of " + (value(v.value0.entityId) + (" in domain " + value(v.value0.entityDomain)))]);
      }
      ;
      var newSets = append12(v.value0.entitySets)(v1.value0.value0.entitySets);
      var newE = new Entity({
        entityId: v1.value0.value0.entityId,
        entityDomain: v1.value0.value0.entityDomain,
        entitySets: newSets,
        props: v1.value0.value0.props
      });
      return pure14(insert4(v.value0.entityId)(newE)(es));
    }
    ;
    if (v1 instanceof Nothing) {
      return pure14(insert4(v.value0.entityId)(v)(es));
    }
    ;
    throw new Error("Failed pattern match at Data.DDF.DataSet (line 126, column 40 - line 137, column 47): " + [v1.constructor.name]);
  };
};
var addEntity = function(v) {
  return function(v1) {
    var ents = getEntitiesFromDomain(v.value0.entityDomain)(v1);
    return apply6(apply6(map17(function(v2) {
      return function(v3) {
        return function(v4) {
          return new DataSet({
            concepts: v1.value0.concepts,
            entities: insert4(v.value0.entityDomain)(v4)(v1.value0.entities)
          });
        };
      };
    })(checkConceptExist(v.value0.entityDomain)(v1)))(sequence4(map18(function(s) {
      return checkConceptExist(s)(v1);
    })(v.value0.entitySets))))(appendEntityToList(v)(ents));
  };
};
var addConcept = function(conc) {
  return function(v) {
    var cid = getId(conc);
    var concExisted = member2(cid)(v.value0.concepts);
    if (concExisted) {
      return invalid(["concept " + (value(cid) + " existed in dataset")]);
    }
    ;
    if (!concExisted) {
      var newconcepts = insert4(cid)(conc)(v.value0.concepts);
      var newds = new DataSet({
        concepts: newconcepts,
        entities: v.value0.entities
      });
      return pure14(newds);
    }
    ;
    throw new Error("Failed pattern match at Data.DDF.DataSet (line 72, column 32 - line 78, column 48): " + [concExisted.constructor.name]);
  };
};

// output/Data.DDF.Validation.Result/index.js
var setLineNo = function(i) {
  return function(m) {
    return {
      message: m.message,
      file: m.file,
      lineNo: i,
      suggestions: m.suggestions,
      isWarning: m.isWarning
    };
  };
};
var setFile = function(f) {
  return function(m) {
    return {
      message: m.message,
      file: f,
      lineNo: m.lineNo,
      suggestions: m.suggestions,
      isWarning: m.isWarning
    };
  };
};
var setError = function(m) {
  return {
    message: m.message,
    file: m.file,
    lineNo: m.lineNo,
    suggestions: m.suggestions,
    isWarning: false
  };
};
var messageFromError = function(v) {
  return {
    message: v,
    file: "",
    lineNo: 0,
    suggestions: "",
    isWarning: true
  };
};
var hasError = function(msgs) {
  var v = find2(function(msg) {
    return !msg.isWarning;
  })(msgs);
  if (v instanceof Nothing) {
    return false;
  }
  ;
  if (v instanceof Just) {
    return true;
  }
  ;
  throw new Error("Failed pattern match at Data.DDF.Validation.Result (line 71, column 3 - line 73, column 19): " + [v.constructor.name]);
};

// output/Node.FS.Sync/foreign.js
import {
  renameSync,
  truncateSync,
  chownSync,
  chmodSync,
  statSync,
  lstatSync,
  linkSync,
  symlinkSync,
  readlinkSync,
  realpathSync,
  unlinkSync,
  rmdirSync,
  rmSync,
  mkdirSync,
  readdirSync,
  utimesSync,
  readFileSync as readFileSync2,
  writeFileSync,
  appendFileSync,
  existsSync,
  openSync,
  readSync,
  writeSync,
  fsyncSync,
  closeSync
} from "fs";

// output/Node.FS.Internal/index.js
var mkEffect = unsafeCoerce2;

// output/Node.FS.Stats/foreign.js
function statsMethod(m, s) {
  return s[m]();
}

// output/Foreign/foreign.js
var isArray = Array.isArray || function(value2) {
  return Object.prototype.toString.call(value2) === "[object Array]";
};

// output/Node.FS.Stats/index.js
var Stats = /* @__PURE__ */ function() {
  function Stats2(value0) {
    this.value0 = value0;
  }
  ;
  Stats2.create = function(value0) {
    return new Stats2(value0);
  };
  return Stats2;
}();
var isFile = function(v) {
  return statsMethod("isFile", v.value0);
};
var isDirectory = function(v) {
  return statsMethod("isDirectory", v.value0);
};

// output/Node.FS.Sync/index.js
var map19 = /* @__PURE__ */ map(functorEffect);
var stat = function(file) {
  return map19(Stats.create)(mkEffect(function(v) {
    return statSync(file);
  }));
};
var readdir = function(file) {
  return mkEffect(function(v) {
    return readdirSync(file);
  });
};
var exists = function(file) {
  return mkEffect(function(v) {
    return existsSync(file);
  });
};

// output/Data.JSON.DataPackage/index.js
var pure15 = /* @__PURE__ */ pure(/* @__PURE__ */ applicativeV(semigroupArray));
var datapackageExists = function(path2) {
  var v = function(v1) {
    if (v1) {
      return pure15(path2);
    }
    ;
    if (!v1) {
      return invalid(["no datapackage in this folder"]);
    }
    ;
    throw new Error("Failed pattern match at Data.JSON.DataPackage (line 45, column 5 - line 45, column 23): " + [v1.constructor.name]);
  };
  var datapackagePath = concat2([path2, "datapackage.json"]);
  return function __do2() {
    var dpExisted = exists(datapackagePath)();
    return v(dpExisted);
  };
};

// output/Effect.Console/foreign.js
var log2 = function(s) {
  return function() {
    console.log(s);
  };
};

// output/Node.Process/foreign.js
import process from "process";
function copyArray(xs) {
  return () => xs.slice();
}

// output/Foreign.Object/foreign.js
function toArrayWithKey(f) {
  return function(m) {
    var r = [];
    for (var k in m) {
      if (hasOwnProperty.call(m, k)) {
        r.push(f(k)(m[k]));
      }
    }
    return r;
  };
}
var keys3 = Object.keys || toArrayWithKey(function(k) {
  return function() {
    return k;
  };
});

// output/Node.Process/index.js
var argv = /* @__PURE__ */ function() {
  return copyArray(process.argv);
}();

// output/Utils/index.js
var elem7 = /* @__PURE__ */ elem2(eqString);
var map20 = /* @__PURE__ */ map(functorArray);
var filterA2 = /* @__PURE__ */ filterA(applicativeEffect);
var apply7 = /* @__PURE__ */ apply(applyEffect);
var map110 = /* @__PURE__ */ map(functorEffect);
var conj2 = /* @__PURE__ */ conj(heytingAlgebraBoolean);
var pure16 = /* @__PURE__ */ pure(applicativeEffect);
var traverse3 = /* @__PURE__ */ traverse(traversableArray)(applicativeEffect);
var append2 = /* @__PURE__ */ append(semigroupArray);
var getFiles = function(x) {
  return function(excludes) {
    return function __do2() {
      var fs = readdir(x)();
      var folderFilter = function(f) {
        return !elem7(f)(excludes);
      };
      var fsMinusExcludes = filter(folderFilter)(fs);
      var fsFullPath = map20(function(f) {
        return concat2([x, f]);
      })(fsMinusExcludes);
      var files = filterA2(function(f) {
        return apply7(map110(conj2)(map110(isFile)(stat(f))))(pure16(extname(basename(f)) === ".csv"));
      })(fsFullPath)();
      var dirs = filterA2(function(f) {
        return map110(isDirectory)(stat(f));
      })(fsFullPath)();
      var fsInDirs = map110(concat)(traverse3(function(d) {
        return getFiles(d)([]);
      })(dirs))();
      return append2(files)(fsInDirs);
    };
  };
};

// output/Main/index.js
var map21 = /* @__PURE__ */ map(functorArray);
var discard4 = /* @__PURE__ */ discard(discardUnit);
var pure17 = /* @__PURE__ */ pure(/* @__PURE__ */ applicativeV(semigroupArray));
var show6 = /* @__PURE__ */ show(/* @__PURE__ */ showRecord()()(/* @__PURE__ */ showRecordFieldsCons({
  reflectSymbol: function() {
    return "file";
  }
})(/* @__PURE__ */ showRecordFieldsCons({
  reflectSymbol: function() {
    return "isWarning";
  }
})(/* @__PURE__ */ showRecordFieldsCons({
  reflectSymbol: function() {
    return "lineNo";
  }
})(/* @__PURE__ */ showRecordFieldsCons({
  reflectSymbol: function() {
    return "message";
  }
})(/* @__PURE__ */ showRecordFieldsConsNil({
  reflectSymbol: function() {
    return "suggestions";
  }
})(showString))(showString))(showInt))(showBoolean))(showString)));
var runValidationT2 = /* @__PURE__ */ runValidationT(monadEffect)(monoidArray);
var bindV2 = /* @__PURE__ */ bindV(monadEffect);
var bind1 = /* @__PURE__ */ bind(bindV2);
var discard22 = /* @__PURE__ */ discard4(bindV2);
var applicativeV6 = /* @__PURE__ */ applicativeV2(monadEffect);
var when2 = /* @__PURE__ */ when(applicativeV6);
var vError2 = /* @__PURE__ */ vError(monadEffect);
var lift5 = /* @__PURE__ */ lift(monadtransV)(monadEffect);
var foldM3 = /* @__PURE__ */ foldM(/* @__PURE__ */ monadV(monadEffect));
var pure18 = /* @__PURE__ */ pure(applicativeV6);
var parseFileInfos = function(fps) {
  return function(dictMonad) {
    var bindV1 = bindV(dictMonad);
    var applicativeV1 = applicativeV2(dictMonad);
    var pure32 = pure(applicativeV1);
    var discard32 = discard4(bindV1);
    var vWarning2 = vWarning(dictMonad)(monoidArray);
    return bind(bindV1)($$for(applicativeV1)(traversableArray)(fps)(function(fp) {
      var res = toEither(validateFileInfo(fp));
      if (res instanceof Right) {
        return pure32([res.value0]);
      }
      ;
      if (res instanceof Left) {
        var msgs = map21(function() {
          var $171 = setFile(fp);
          return function($172) {
            return $171(messageFromError($172));
          };
        }())(res.value0);
        return discard32(vWarning2(msgs))(function() {
          return pure32([]);
        });
      }
      ;
      throw new Error("Failed pattern match at Main (line 51, column 11 - line 57, column 22): " + [res.constructor.name]);
    }))(function(fis) {
      return pure32(concat(fis));
    });
  };
};
var parseCsvFiles = function(inputs) {
  return function(dictMonad) {
    var bindV1 = bindV(dictMonad);
    var applicativeV1 = applicativeV2(dictMonad);
    var pure32 = pure(applicativeV1);
    var discard32 = discard4(bindV1);
    var vWarning2 = vWarning(dictMonad)(monoidArray);
    return bind(bindV1)($$for(applicativeV1)(traversableArray)(inputs)(function(v) {
      var fp = filepath(v.value0);
      var v1 = toEither(validCsvFile(v.value0)(v.value1));
      if (v1 instanceof Right) {
        return pure32([v1.value0]);
      }
      ;
      if (v1 instanceof Left) {
        var msgs = map21(function() {
          var $173 = setFile(fp);
          return function($174) {
            return $173(messageFromError($174));
          };
        }())(v1.value0);
        return discard32(vWarning2(msgs))(function() {
          return pure32([]);
        });
      }
      ;
      throw new Error("Failed pattern match at Main (line 69, column 11 - line 75, column 22): " + [v1.constructor.name]);
    }))(function(fs) {
      return pure32(concat(fs));
    });
  };
};
var checkDataSetConceptErrors = function(ds) {
  return function(dictMonad) {
    var pure32 = pure(applicativeV2(dictMonad));
    var res = checkDomainForEntitySets(ds);
    var v = toEither(res);
    if (v instanceof Left) {
      var msgs = map21(function($175) {
        return setError(messageFromError($175));
      })(v.value0);
      return discard4(bindV(dictMonad))(vWarning(dictMonad)(monoidArray)(msgs))(function() {
        return pure32(ds);
      });
    }
    ;
    if (v instanceof Right) {
      return pure32(ds);
    }
    ;
    throw new Error("Failed pattern match at Main (line 158, column 3 - line 167, column 23): " + [v.constructor.name]);
  };
};
var appendEntityCsv = function(v) {
  return function(csv) {
    return function(dataset) {
      return function(dictMonad) {
        var discard32 = discard4(bindV(dictMonad));
        var vWarning2 = vWarning(dictMonad)(monoidArray);
        var pure32 = pure(applicativeV2(dictMonad));
        var v1 = getCsvContent(csv);
        var fp = filepath(getFileInfo(csv));
        var run3 = function(hs) {
          return function(ds) {
            return function(v2) {
              var entity2 = andThen(andThen(validCsvRec(hs)(v2))(entityInputFromCsvRecAndFileInfo({
                domain: v.domain,
                set: v.set
              })))(parseEntity);
              var v3 = toEither(entity2);
              if (v3 instanceof Left) {
                var msgs = map21(function() {
                  var $176 = setFile(fp);
                  var $177 = setLineNo(v2.value0 + 1 | 0);
                  return function($178) {
                    return setError($176($177(messageFromError($178))));
                  };
                }())(v3.value0);
                return discard32(vWarning2(msgs))(function() {
                  return pure32(ds);
                });
              }
              ;
              if (v3 instanceof Right) {
                var v4 = toEither(addEntity(v3.value0)(ds));
                if (v4 instanceof Left) {
                  var msgs = map21(function() {
                    var $179 = setFile(fp);
                    var $180 = setLineNo(v2.value0 + 1 | 0);
                    return function($181) {
                      return setError($179($180(messageFromError($181))));
                    };
                  }())(v4.value0);
                  return discard32(vWarning2(msgs))(function() {
                    return pure32(ds);
                  });
                }
                ;
                if (v4 instanceof Right) {
                  return pure32(v4.value0);
                }
                ;
                throw new Error("Failed pattern match at Main (line 146, column 9 - line 152, column 36): " + [v4.constructor.name]);
              }
              ;
              throw new Error("Failed pattern match at Main (line 139, column 5 - line 152, column 36): " + [v3.constructor.name]);
            };
          };
        };
        return foldM(monadV(dictMonad))(function(d) {
          return function(r) {
            return run3(v1.headers)(d)(r);
          };
        })(dataset)(v1.rows);
      };
    };
  };
};
var appendConceptsCsv = function(csv) {
  return function(dataset) {
    return function(dictMonad) {
      var discard32 = discard4(bindV(dictMonad));
      var vWarning2 = vWarning(dictMonad)(monoidArray);
      var pure32 = pure(applicativeV2(dictMonad));
      var v = getCsvContent(csv);
      var validateConceptCsvErrors = function(hs) {
        return function(csvrow) {
          return andThen(andThen(validCsvRec(hs)(csvrow))(function($182) {
            return pure17(conceptInputFromCsvRec($182));
          }))(parseConcept);
        };
      };
      var fp = filepath(getFileInfo(csv));
      var run3 = function(hs) {
        return function(ds) {
          return function(v1) {
            var mkMessage = function() {
              var $183 = setFile(fp);
              var $184 = setLineNo(v1.value0 + 1 | 0);
              return function($185) {
                return $183($184(messageFromError($185)));
              };
            }();
            var concept2 = validateConceptCsvErrors(hs)(v1);
            var v2 = toEither(concept2);
            if (v2 instanceof Left) {
              var msgs = map21(function($186) {
                return setError(mkMessage($186));
              })(v2.value0);
              return discard32(vWarning2(msgs))(function() {
                return pure32(ds);
              });
            }
            ;
            if (v2 instanceof Right) {
              return discard32(function() {
                var v3 = toEither(conceptIdTooLong(v2.value0));
                if (v3 instanceof Left) {
                  var msgs2 = map21(mkMessage)(v3.value0);
                  return vWarning2(msgs2);
                }
                ;
                if (v3 instanceof Right) {
                  return pure32(unit);
                }
                ;
                throw new Error("Failed pattern match at Main (line 110, column 9 - line 115, column 31): " + [v3.constructor.name]);
              }())(function() {
                var v3 = toEither(addConcept(v2.value0)(ds));
                if (v3 instanceof Left) {
                  var msgs2 = map21(function($187) {
                    return setError(mkMessage($187));
                  })(v3.value0);
                  return discard32(vWarning2(msgs2))(function() {
                    return pure32(ds);
                  });
                }
                ;
                if (v3 instanceof Right) {
                  return pure32(v3.value0);
                }
                ;
                throw new Error("Failed pattern match at Main (line 116, column 9 - line 122, column 36): " + [v3.constructor.name]);
              });
            }
            ;
            throw new Error("Failed pattern match at Main (line 103, column 5 - line 122, column 36): " + [v2.constructor.name]);
          };
        };
      };
      return foldM(monadV(dictMonad))(function(d) {
        return function(r) {
          return run3(v.headers)(d)(r);
        };
      })(dataset)(v.rows);
    };
  };
};
var appendCsv = function(csv) {
  return function(dataset) {
    return function(dictMonad) {
      var v = collection(getFileInfo(csv));
      if (v instanceof Concepts) {
        return appendConceptsCsv(csv)(dataset)(dictMonad);
      }
      ;
      if (v instanceof Entities) {
        return appendEntityCsv(v.value0)(csv)(dataset)(dictMonad);
      }
      ;
      return vError(dictMonad)(map21(messageFromError)(["not implemented"]));
    };
  };
};
var runMain = function(fp) {
  return function __do2() {
    var datapackageFile = datapackageExists(fp)();
    var v = toEither(datapackageFile);
    if (v instanceof Left) {
      var msgs = map21(function() {
        var $188 = setFile(fp);
        return function($189) {
          return $188(messageFromError($189));
        };
      }())(v.value0);
      log2(joinWith("\n")(map21(show6)(msgs)))();
      return log2("\u274C Dataset is invalid")();
    }
    ;
    if (v instanceof Right) {
      var files = getFiles(fp)([".git", "etl", "lang", "assets"])();
      var v1 = runValidationT2(bind1(parseFileInfos(files)(monadEffect))(function(fileInfos) {
        return discard22(when2(length(fileInfos) === 0)(vError2([messageFromError("No csv files in this folder. Please begin with a ddf--concepts.csv file.")])))(function() {
          var conceptFiles = getCollectionFiles("concepts")(fileInfos);
          return discard22(when2(length(conceptFiles) === 0)(vError2([messageFromError("No concepts csv files in this folder. Dataset must at least have a ddf--concepts.csv file.")])))(function() {
            return bind1(lift5(readCsvs(map21(filepath)(conceptFiles))))(function(conceptCsvContents) {
              var conceptInputs = zip(conceptFiles)(conceptCsvContents);
              return bind1(parseCsvFiles(conceptInputs)(monadEffect))(function(conceptCsvFiles) {
                return bind1(foldM3(function(d) {
                  return function(f) {
                    return appendCsv(f)(d)(monadEffect);
                  };
                })(empty4)(conceptCsvFiles))(function(ds) {
                  return bind1(checkDataSetConceptErrors(ds)(monadEffect))(function(dsWithConc) {
                    var entityFiles = getCollectionFiles("entities")(fileInfos);
                    return bind1(lift5(readCsvs(map21(filepath)(entityFiles))))(function(entityCsvContents) {
                      var entityInputs = zip(entityFiles)(entityCsvContents);
                      return bind1(parseCsvFiles(entityInputs)(monadEffect))(function(entityCsvFiles) {
                        return bind1(foldM3(function(d) {
                          return function(f) {
                            return appendCsv(f)(d)(monadEffect);
                          };
                        })(dsWithConc)(entityCsvFiles))(function(dsWithEnt) {
                          return pure18(dsWithEnt);
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      }))();
      log2(joinWith("\n")(map21(show6)(v1.value0)))();
      (function() {
        if (v1.value1 instanceof Just) {
          var $164 = hasError(v1.value0);
          if ($164) {
            return log2("\u274C Dataset is invalid")();
          }
          ;
          return log2("\u2705 Dataset is valid")();
        }
        ;
        if (v1.value1 instanceof Nothing) {
          return log2("\u274C Dataset is invalid")();
        }
        ;
        throw new Error("Failed pattern match at Main (line 214, column 7 - line 220, column 46): " + [v1.value1.constructor.name]);
      })();
      return unit;
    }
    ;
    throw new Error("Failed pattern match at Main (line 173, column 3 - line 221, column 16): " + [v.constructor.name]);
  };
};
var main = function __do() {
  var path2 = argv();
  var v = index(path2)(2);
  if (v instanceof Nothing) {
    return runMain("./")();
  }
  ;
  if (v instanceof Just) {
    return runMain(v.value0)();
  }
  ;
  throw new Error("Failed pattern match at Main (line 228, column 3 - line 230, column 26): " + [v.constructor.name]);
};

// <stdin>
main();

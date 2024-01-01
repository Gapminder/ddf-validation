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
  var map112 = map(dictFunctor);
  return function(fa) {
    return function(f) {
      return map112(f)(fa);
    };
  };
};
var $$void = function(dictFunctor) {
  return map(dictFunctor)($$const(unit));
};
var voidLeft = function(dictFunctor) {
  var map112 = map(dictFunctor);
  return function(f) {
    return function(x) {
      return map112($$const(x))(f);
    };
  };
};
var functorArray = {
  map: arrayMap
};

// output/Control.Apply/index.js
var identity2 = /* @__PURE__ */ identity(categoryFn);
var apply = function(dict) {
  return dict.apply;
};
var applyFirst = function(dictApply) {
  var apply1 = apply(dictApply);
  var map25 = map(dictApply.Functor0());
  return function(a) {
    return function(b) {
      return apply1(map25($$const)(a))(b);
    };
  };
};
var applySecond = function(dictApply) {
  var apply1 = apply(dictApply);
  var map25 = map(dictApply.Functor0());
  return function(a) {
    return function(b) {
      return apply1(map25($$const(identity2))(a))(b);
    };
  };
};
var lift2 = function(dictApply) {
  var apply1 = apply(dictApply);
  var map25 = map(dictApply.Functor0());
  return function(f) {
    return function(a) {
      return function(b) {
        return apply1(map25(f)(a))(b);
      };
    };
  };
};

// output/Control.Applicative/index.js
var pure = function(dict) {
  return dict.pure;
};
var when = function(dictApplicative) {
  var pure111 = pure(dictApplicative);
  return function(v) {
    return function(v1) {
      if (v) {
        return v1;
      }
      ;
      if (!v) {
        return pure111(unit);
      }
      ;
      throw new Error("Failed pattern match at Control.Applicative (line 63, column 1 - line 63, column 63): " + [v.constructor.name, v1.constructor.name]);
    };
  };
};
var liftA1 = function(dictApplicative) {
  var apply7 = apply(dictApplicative.Apply0());
  var pure111 = pure(dictApplicative);
  return function(f) {
    return function(a) {
      return apply7(pure111(f))(a);
    };
  };
};

// output/Control.Bind/index.js
var identity3 = /* @__PURE__ */ identity(categoryFn);
var discard = function(dict) {
  return dict.discard;
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
  var bind14 = bind(dictBind);
  return function(m) {
    return bind14(m)(identity3);
  };
};

// output/Control.Monad/index.js
var whenM = function(dictMonad) {
  var bind9 = bind(dictMonad.Bind1());
  var when3 = when(dictMonad.Applicative0());
  return function(mb) {
    return function(m) {
      return bind9(mb)(function(b) {
        return when3(b)(m);
      });
    };
  };
};
var ap = function(dictMonad) {
  var bind9 = bind(dictMonad.Bind1());
  var pure20 = pure(dictMonad.Applicative0());
  return function(f) {
    return function(a) {
      return bind9(f)(function(f$prime) {
        return bind9(a)(function(a$prime) {
          return pure20(f$prime(a$prime));
        });
      });
    };
  };
};

// output/Control.Monad.Trans.Class/index.js
var lift = function(dict) {
  return dict.lift;
};

// output/Data.Array/foreign.js
var rangeImpl = function(start, end) {
  var step = start > end ? -1 : 1;
  var result = new Array(step * (end - start) + 1);
  var i = start, n = 0;
  while (i !== end) {
    result[n++] = i;
    i += step;
  }
  result[n] = i;
  return result;
};
var replicateFill = function(count, value) {
  if (count < 1) {
    return [];
  }
  var result = new Array(count);
  return result.fill(value);
};
var replicatePolyfill = function(count, value) {
  var result = [];
  var n = 0;
  for (var i = 0; i < count; i++) {
    result[n++] = value;
  }
  return result;
};
var replicateImpl = typeof Array.prototype.fill === "function" ? replicateFill : replicatePolyfill;
var fromFoldableImpl = function() {
  function Cons2(head6, tail2) {
    this.head = head6;
    this.tail = tail2;
  }
  var emptyList = {};
  function curryCons(head6) {
    return function(tail2) {
      return new Cons2(head6, tail2);
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
  return function(foldr4, xs) {
    return listToArray(foldr4(curryCons)(emptyList)(xs));
  };
}();
var length = function(xs) {
  return xs.length;
};
var unconsImpl = function(empty5, next2, xs) {
  return xs.length === 0 ? empty5({}) : next2(xs[0])(xs.slice(1));
};
var indexImpl = function(just, nothing, xs, i) {
  return i < 0 || i >= xs.length ? nothing : just(xs[i]);
};
var findIndexImpl = function(just, nothing, f, xs) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (f(xs[i]))
      return just(i);
  }
  return nothing;
};
var filterImpl = function(f, xs) {
  return xs.filter(f);
};
var sortByImpl = function() {
  function mergeFromTo(compare5, fromOrdering, xs1, xs2, from3, to) {
    var mid;
    var i;
    var j;
    var k;
    var x;
    var y;
    var c;
    mid = from3 + (to - from3 >> 1);
    if (mid - from3 > 1)
      mergeFromTo(compare5, fromOrdering, xs2, xs1, from3, mid);
    if (to - mid > 1)
      mergeFromTo(compare5, fromOrdering, xs2, xs1, mid, to);
    i = from3;
    j = mid;
    k = from3;
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
  return function(compare5, fromOrdering, xs) {
    var out;
    if (xs.length < 2)
      return xs;
    out = xs.slice(0);
    mergeFromTo(compare5, fromOrdering, out, xs.slice(0), 0, xs.length);
    return out;
  };
}();
var zipWithImpl = function(f, xs, ys) {
  var l = xs.length < ys.length ? xs.length : ys.length;
  var result = new Array(l);
  for (var i = 0; i < l; i++) {
    result[i] = f(xs[i])(ys[i]);
  }
  return result;
};
var unsafeIndexImpl = function(xs, n) {
  return xs[n];
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

// output/Data.Bounded/foreign.js
var topChar = String.fromCharCode(65535);
var bottomChar = String.fromCharCode(0);
var topNumber = Number.POSITIVE_INFINITY;
var bottomNumber = Number.NEGATIVE_INFINITY;

// output/Data.Ord/foreign.js
var unsafeCompareImpl = function(lt) {
  return function(eq5) {
    return function(gt) {
      return function(x) {
        return function(y) {
          return x < y ? lt : x === y ? eq5 : gt;
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
      var empty5 = k < l && s[k] >= "0" && s[k] <= "9" ? "\\&" : "";
      return "\\" + c.charCodeAt(0).toString(10) + empty5;
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
      var show14 = show(dictShow);
      return {
        showRecordFields: function(v) {
          return function(record) {
            var tail2 = showRecordFields1($$Proxy.value)(record);
            var key = reflectSymbol2($$Proxy.value);
            var focus = unsafeGet(key)(record);
            return " " + (key + (": " + (show14(focus) + ("," + tail2))));
          };
        }
      };
    };
  };
};
var showRecordFieldsConsNil = function(dictIsSymbol) {
  var reflectSymbol2 = reflectSymbol(dictIsSymbol);
  return function(dictShow) {
    var show14 = show(dictShow);
    return {
      showRecordFields: function(v) {
        return function(record) {
          var key = reflectSymbol2($$Proxy.value);
          var focus = unsafeGet(key)(record);
          return " " + (key + (": " + (show14(focus) + " ")));
        };
      }
    };
  };
};

// output/Data.Generic.Rep/index.js
var Inl = /* @__PURE__ */ function() {
  function Inl2(value0) {
    this.value0 = value0;
  }
  ;
  Inl2.create = function(value0) {
    return new Inl2(value0);
  };
  return Inl2;
}();
var Inr = /* @__PURE__ */ function() {
  function Inr2(value0) {
    this.value0 = value0;
  }
  ;
  Inr2.create = function(value0) {
    return new Inr2(value0);
  };
  return Inr2;
}();
var Product = /* @__PURE__ */ function() {
  function Product2(value0, value1) {
    this.value0 = value0;
    this.value1 = value1;
  }
  ;
  Product2.create = function(value0) {
    return function(value1) {
      return new Product2(value0, value1);
    };
  };
  return Product2;
}();
var NoArguments = /* @__PURE__ */ function() {
  function NoArguments2() {
  }
  ;
  NoArguments2.value = new NoArguments2();
  return NoArguments2;
}();
var from = function(dict) {
  return dict.from;
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
var monoidString = {
  mempty: "",
  Semigroup0: function() {
    return semigroupString;
  }
};
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
  function mergeFromTo(compare5, fromOrdering, xs1, xs2, from3, to) {
    var mid;
    var i;
    var j;
    var k;
    var x;
    var y;
    var c;
    mid = from3 + (to - from3 >> 1);
    if (mid - from3 > 1)
      mergeFromTo(compare5, fromOrdering, xs2, xs1, from3, mid);
    if (to - mid > 1)
      mergeFromTo(compare5, fromOrdering, xs2, xs1, mid, to);
    i = from3;
    j = mid;
    k = from3;
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
  return function(compare5, fromOrdering, xs) {
    if (xs.length < 2)
      return xs;
    mergeFromTo(compare5, fromOrdering, xs, xs.slice(0), 0, xs.length);
    return xs;
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
var showTuple = function(dictShow) {
  var show11 = show(dictShow);
  return function(dictShow1) {
    var show14 = show(dictShow1);
    return {
      show: function(v) {
        return "(Tuple " + (show11(v.value0) + (" " + (show14(v.value1) + ")")));
      }
    };
  };
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
var intercalate = function(dictFoldable) {
  var foldl22 = foldl(dictFoldable);
  return function(dictMonoid) {
    var append4 = append(dictMonoid.Semigroup0());
    var mempty2 = mempty(dictMonoid);
    return function(sep2) {
      return function(xs) {
        var go = function(v) {
          return function(v1) {
            if (v.init) {
              return {
                init: false,
                acc: v1
              };
            }
            ;
            return {
              init: false,
              acc: append4(v.acc)(append4(sep2)(v1))
            };
          };
        };
        return foldl22(go)({
          init: true,
          acc: mempty2
        })(xs).acc;
      };
    };
  };
};
var foldMapDefaultR = function(dictFoldable) {
  var foldr22 = foldr(dictFoldable);
  return function(dictMonoid) {
    var append4 = append(dictMonoid.Semigroup0());
    var mempty2 = mempty(dictMonoid);
    return function(f) {
      return foldr22(function(x) {
        return function(acc) {
          return append4(f(x))(acc);
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
    var $462 = eq(dictEq);
    return function($463) {
      return any1($462($463));
    };
  };
};

// output/Data.Function.Uncurried/foreign.js
var runFn2 = function(fn) {
  return function(a) {
    return function(b) {
      return fn(a, b);
    };
  };
};
var runFn3 = function(fn) {
  return function(a) {
    return function(b) {
      return function(c) {
        return fn(a, b, c);
      };
    };
  };
};
var runFn4 = function(fn) {
  return function(a) {
    return function(b) {
      return function(c) {
        return function(d) {
          return fn(a, b, c, d);
        };
      };
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
  return function(apply7) {
    return function(map25) {
      return function(pure20) {
        return function(f) {
          return function(array) {
            function go(bot, top2) {
              switch (top2 - bot) {
                case 0:
                  return pure20([]);
                case 1:
                  return map25(array1)(f(array[bot]));
                case 2:
                  return apply7(map25(array2)(f(array[bot])))(f(array[bot + 1]));
                case 3:
                  return apply7(apply7(map25(array3)(f(array[bot])))(f(array[bot + 1])))(f(array[bot + 2]));
                default:
                  var pivot = bot + Math.floor((top2 - bot) / 4) * 2;
                  return apply7(map25(concat22)(go(bot, pivot)))(go(pivot, top2));
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
  var traverse2 = traverse(dictTraversable);
  return function(dictApplicative) {
    return traverse2(dictApplicative)(identity4);
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

// output/Data.Unfoldable/foreign.js
var unfoldrArrayImpl = function(isNothing2) {
  return function(fromJust6) {
    return function(fst2) {
      return function(snd2) {
        return function(f) {
          return function(b) {
            var result = [];
            var value = b;
            while (true) {
              var maybe2 = f(value);
              if (isNothing2(maybe2))
                return result;
              var tuple = fromJust6(maybe2);
              result.push(fst2(tuple));
              value = snd2(tuple);
            }
          };
        };
      };
    };
  };
};

// output/Data.Unfoldable1/foreign.js
var unfoldr1ArrayImpl = function(isNothing2) {
  return function(fromJust6) {
    return function(fst2) {
      return function(snd2) {
        return function(f) {
          return function(b) {
            var result = [];
            var value = b;
            while (true) {
              var tuple = f(value);
              result.push(fst2(tuple));
              var maybe2 = snd2(tuple);
              if (isNothing2(maybe2))
                return result;
              value = fromJust6(maybe2);
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
var map4 = /* @__PURE__ */ map(functorMaybe);
var zipWith = /* @__PURE__ */ runFn3(zipWithImpl);
var zip = /* @__PURE__ */ function() {
  return zipWith(Tuple.create);
}();
var unsafeIndex = function() {
  return runFn2(unsafeIndexImpl);
};
var unsafeIndex1 = /* @__PURE__ */ unsafeIndex();
var tail = /* @__PURE__ */ function() {
  return runFn3(unconsImpl)($$const(Nothing.value))(function(v) {
    return function(xs) {
      return new Just(xs);
    };
  });
}();
var range2 = /* @__PURE__ */ runFn2(rangeImpl);
var index = /* @__PURE__ */ function() {
  return runFn4(indexImpl)(Just.create)(Nothing.value);
}();
var head = function(xs) {
  return index(xs)(0);
};
var fromFoldable = function(dictFoldable) {
  return runFn2(fromFoldableImpl)(foldr(dictFoldable));
};
var foldr2 = /* @__PURE__ */ foldr(foldableArray);
var findIndex = /* @__PURE__ */ function() {
  return runFn4(findIndexImpl)(Just.create)(Nothing.value);
}();
var find2 = function(f) {
  return function(xs) {
    return map4(unsafeIndex1(xs))(findIndex(f)(xs));
  };
};
var filter = /* @__PURE__ */ runFn2(filterImpl);
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

// node_modules/csv-parse/lib/api/CsvError.js
var CsvError = class extends Error {
  constructor(code, message2, options, ...contexts) {
    if (Array.isArray(message2))
      message2 = message2.join(" ").trim();
    super(message2);
    if (Error.captureStackTrace !== void 0) {
      Error.captureStackTrace(this, CsvError);
    }
    this.code = code;
    for (const context of contexts) {
      for (const key in context) {
        const value = context[key];
        this[key] = Buffer.isBuffer(value) ? value.toString(options.encoding) : value == null ? value : JSON.parse(JSON.stringify(value));
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
  constructor(size5 = 100) {
    this.size = size5;
    this.length = 0;
    this.buf = Buffer.allocUnsafe(size5);
  }
  prepend(val) {
    if (Buffer.isBuffer(val)) {
      const length7 = this.length + val.length;
      if (length7 >= this.size) {
        this.resize();
        if (length7 >= this.size) {
          throw Error("INVALID_BUFFER_STATE");
        }
      }
      const buf = this.buf;
      this.buf = Buffer.allocUnsafe(this.size);
      val.copy(this.buf, 0);
      buf.copy(this.buf, val.length);
      this.length += val.length;
    } else {
      const length7 = this.length++;
      if (length7 === this.size) {
        this.resize();
      }
      const buf = this.clone();
      this.buf[0] = val;
      buf.copy(this.buf, 1, 0, length7);
    }
  }
  append(val) {
    const length7 = this.length++;
    if (length7 === this.size) {
      this.resize();
    }
    this.buf[length7] = val;
  }
  clone() {
    return Buffer.from(this.buf.slice(0, this.length));
  }
  resize() {
    const length7 = this.length;
    this.size = this.size * 2;
    const buf = Buffer.allocUnsafe(this.size);
    this.buf.copy(buf, 0, 0, length7);
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
    recordDelimiterMaxLength: options.record_delimiter.length === 0 ? 0 : Math.max(...options.record_delimiter.map((v) => v.length)),
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
    options.cast_date = function(value) {
      const date2 = Date.parse(value);
      return !isNaN(date2) ? new Date(date2) : value;
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
  if (options.comment_no_infix === void 0 || options.comment_no_infix === null || options.comment_no_infix === false) {
    options.comment_no_infix = false;
  } else if (options.comment_no_infix !== true) {
    throw new CsvError("CSV_INVALID_OPTION_COMMENT", [
      "Invalid option comment_no_infix:",
      "value must be a boolean,",
      `got ${JSON.stringify(options.comment_no_infix)}`
    ], options);
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
      const { encoding, escape, quote } = this.options;
      const { quoting, needMoreDataSize, recordDelimiterMaxLength } = this.state;
      const numOfCharLeft = bufLen - i - 1;
      const requiredLength = Math.max(
        needMoreDataSize,
        recordDelimiterMaxLength === 0 ? Buffer.from("\r\n", encoding).length : recordDelimiterMaxLength,
        quoting ? (escape === null ? 0 : escape.length) + quote.length : 0,
        quoting ? quote.length + recordDelimiterMaxLength : 0
      );
      return numOfCharLeft < requiredLength;
    },
    parse: function(nextBuf, end, push2, close2) {
      const { bom, comment_no_infix, encoding, from_line, ltrim, max_record_size, raw, relax_quotes, rtrim, skip_empty_lines, to, to_line } = this.options;
      let { comment, escape, quote, record_delimiter } = this.options;
      const { bomSkipped, previousBuf, rawBuffer, escapeIsQuote } = this.state;
      let buf;
      if (previousBuf === void 0) {
        if (nextBuf === void 0) {
          close2();
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
          for (const encoding2 in boms) {
            if (boms[encoding2].compare(buf, 0, boms[encoding2].length) === 0) {
              const bomLength = boms[encoding2].length;
              this.state.bufBytesStart += bomLength;
              buf = buf.slice(bomLength);
              this.options = normalize_options({ ...this.original_options, encoding: encoding2 });
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
          close2();
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
                  const info3 = this.__infoField();
                  const bom2 = Object.keys(boms).map((b) => boms[b].equals(this.state.field.toString()) ? b : false).filter(Boolean)[0];
                  const err = this.__error(
                    new CsvError("INVALID_OPENING_QUOTE", [
                      "Invalid Opening Quote:",
                      `a quote is found on field ${JSON.stringify(info3.column)} at line ${info3.lines}, value is ${JSON.stringify(this.state.field.toString(encoding))}`,
                      bom2 ? `(${bom2} bom)` : void 0
                    ], this.options, info3, {
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
                  close2();
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
            if (commentCount !== 0 && (comment_no_infix === false || this.state.field.length === 0)) {
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
      const { columns, group_columns_by_name, encoding, info: info3, from: from3, relax_column_count, relax_column_count_less, relax_column_count_more, raw, skip_records_with_empty_values } = this.options;
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
      if (from3 === 1 || this.info.records >= from3) {
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
    __isFloat: function(value) {
      return value - parseFloat(value) + 1 >= 0;
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
      const rds = [
        Buffer.from("\r\n", encoding),
        Buffer.from("\n", encoding),
        Buffer.from("\r", encoding)
      ];
      loop:
        for (let i = 0; i < rds.length; i++) {
          const l = rds[i].length;
          for (let j = 0; j < l; j++) {
            if (rds[i][j] !== buf[pos + j]) {
              continue loop;
            }
          }
          this.options.record_delimiter.push(rds[i]);
          this.state.recordDelimiterMaxLength = rds[i].length;
          return rds[i].length;
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
  const close2 = () => {
  };
  const err1 = parser.parse(data, false, push2, close2);
  if (err1 !== void 0)
    throw err1;
  const err2 = parser.parse(void 0, true, push2, close2);
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

// output/Effect.Aff/foreign.js
var Aff = function() {
  var EMPTY = {};
  var PURE = "Pure";
  var THROW = "Throw";
  var CATCH = "Catch";
  var SYNC = "Sync";
  var ASYNC = "Async";
  var BIND = "Bind";
  var BRACKET = "Bracket";
  var FORK = "Fork";
  var SEQ = "Sequential";
  var MAP = "Map";
  var APPLY = "Apply";
  var ALT = "Alt";
  var CONS = "Cons";
  var RESUME = "Resume";
  var RELEASE = "Release";
  var FINALIZER = "Finalizer";
  var FINALIZED = "Finalized";
  var FORKED = "Forked";
  var FIBER = "Fiber";
  var THUNK = "Thunk";
  function Aff2(tag, _1, _2, _3) {
    this.tag = tag;
    this._1 = _1;
    this._2 = _2;
    this._3 = _3;
  }
  function AffCtr(tag) {
    var fn = function(_1, _2, _3) {
      return new Aff2(tag, _1, _2, _3);
    };
    fn.tag = tag;
    return fn;
  }
  function nonCanceler2(error3) {
    return new Aff2(PURE, void 0);
  }
  function runEff(eff) {
    try {
      eff();
    } catch (error3) {
      setTimeout(function() {
        throw error3;
      }, 0);
    }
  }
  function runSync(left, right, eff) {
    try {
      return right(eff());
    } catch (error3) {
      return left(error3);
    }
  }
  function runAsync(left, eff, k) {
    try {
      return eff(k)();
    } catch (error3) {
      k(left(error3))();
      return nonCanceler2;
    }
  }
  var Scheduler = function() {
    var limit = 1024;
    var size5 = 0;
    var ix = 0;
    var queue = new Array(limit);
    var draining = false;
    function drain() {
      var thunk;
      draining = true;
      while (size5 !== 0) {
        size5--;
        thunk = queue[ix];
        queue[ix] = void 0;
        ix = (ix + 1) % limit;
        thunk();
      }
      draining = false;
    }
    return {
      isDraining: function() {
        return draining;
      },
      enqueue: function(cb) {
        var i, tmp;
        if (size5 === limit) {
          tmp = draining;
          drain();
          draining = tmp;
        }
        queue[(ix + size5) % limit] = cb;
        size5++;
        if (!draining) {
          drain();
        }
      }
    };
  }();
  function Supervisor(util) {
    var fibers = {};
    var fiberId = 0;
    var count = 0;
    return {
      register: function(fiber) {
        var fid = fiberId++;
        fiber.onComplete({
          rethrow: true,
          handler: function(result) {
            return function() {
              count--;
              delete fibers[fid];
            };
          }
        })();
        fibers[fid] = fiber;
        count++;
      },
      isEmpty: function() {
        return count === 0;
      },
      killAll: function(killError, cb) {
        return function() {
          if (count === 0) {
            return cb();
          }
          var killCount = 0;
          var kills = {};
          function kill(fid) {
            kills[fid] = fibers[fid].kill(killError, function(result) {
              return function() {
                delete kills[fid];
                killCount--;
                if (util.isLeft(result) && util.fromLeft(result)) {
                  setTimeout(function() {
                    throw util.fromLeft(result);
                  }, 0);
                }
                if (killCount === 0) {
                  cb();
                }
              };
            })();
          }
          for (var k in fibers) {
            if (fibers.hasOwnProperty(k)) {
              killCount++;
              kill(k);
            }
          }
          fibers = {};
          fiberId = 0;
          count = 0;
          return function(error3) {
            return new Aff2(SYNC, function() {
              for (var k2 in kills) {
                if (kills.hasOwnProperty(k2)) {
                  kills[k2]();
                }
              }
            });
          };
        };
      }
    };
  }
  var SUSPENDED = 0;
  var CONTINUE = 1;
  var STEP_BIND = 2;
  var STEP_RESULT = 3;
  var PENDING = 4;
  var RETURN = 5;
  var COMPLETED = 6;
  function Fiber(util, supervisor, aff) {
    var runTick = 0;
    var status = SUSPENDED;
    var step = aff;
    var fail2 = null;
    var interrupt = null;
    var bhead = null;
    var btail = null;
    var attempts = null;
    var bracketCount = 0;
    var joinId = 0;
    var joins = null;
    var rethrow = true;
    function run3(localRunTick) {
      var tmp, result, attempt2;
      while (true) {
        tmp = null;
        result = null;
        attempt2 = null;
        switch (status) {
          case STEP_BIND:
            status = CONTINUE;
            try {
              step = bhead(step);
              if (btail === null) {
                bhead = null;
              } else {
                bhead = btail._1;
                btail = btail._2;
              }
            } catch (e) {
              status = RETURN;
              fail2 = util.left(e);
              step = null;
            }
            break;
          case STEP_RESULT:
            if (util.isLeft(step)) {
              status = RETURN;
              fail2 = step;
              step = null;
            } else if (bhead === null) {
              status = RETURN;
            } else {
              status = STEP_BIND;
              step = util.fromRight(step);
            }
            break;
          case CONTINUE:
            switch (step.tag) {
              case BIND:
                if (bhead) {
                  btail = new Aff2(CONS, bhead, btail);
                }
                bhead = step._2;
                status = CONTINUE;
                step = step._1;
                break;
              case PURE:
                if (bhead === null) {
                  status = RETURN;
                  step = util.right(step._1);
                } else {
                  status = STEP_BIND;
                  step = step._1;
                }
                break;
              case SYNC:
                status = STEP_RESULT;
                step = runSync(util.left, util.right, step._1);
                break;
              case ASYNC:
                status = PENDING;
                step = runAsync(util.left, step._1, function(result2) {
                  return function() {
                    if (runTick !== localRunTick) {
                      return;
                    }
                    runTick++;
                    Scheduler.enqueue(function() {
                      if (runTick !== localRunTick + 1) {
                        return;
                      }
                      status = STEP_RESULT;
                      step = result2;
                      run3(runTick);
                    });
                  };
                });
                return;
              case THROW:
                status = RETURN;
                fail2 = util.left(step._1);
                step = null;
                break;
              case CATCH:
                if (bhead === null) {
                  attempts = new Aff2(CONS, step, attempts, interrupt);
                } else {
                  attempts = new Aff2(CONS, step, new Aff2(CONS, new Aff2(RESUME, bhead, btail), attempts, interrupt), interrupt);
                }
                bhead = null;
                btail = null;
                status = CONTINUE;
                step = step._1;
                break;
              case BRACKET:
                bracketCount++;
                if (bhead === null) {
                  attempts = new Aff2(CONS, step, attempts, interrupt);
                } else {
                  attempts = new Aff2(CONS, step, new Aff2(CONS, new Aff2(RESUME, bhead, btail), attempts, interrupt), interrupt);
                }
                bhead = null;
                btail = null;
                status = CONTINUE;
                step = step._1;
                break;
              case FORK:
                status = STEP_RESULT;
                tmp = Fiber(util, supervisor, step._2);
                if (supervisor) {
                  supervisor.register(tmp);
                }
                if (step._1) {
                  tmp.run();
                }
                step = util.right(tmp);
                break;
              case SEQ:
                status = CONTINUE;
                step = sequential2(util, supervisor, step._1);
                break;
            }
            break;
          case RETURN:
            bhead = null;
            btail = null;
            if (attempts === null) {
              status = COMPLETED;
              step = interrupt || fail2 || step;
            } else {
              tmp = attempts._3;
              attempt2 = attempts._1;
              attempts = attempts._2;
              switch (attempt2.tag) {
                case CATCH:
                  if (interrupt && interrupt !== tmp && bracketCount === 0) {
                    status = RETURN;
                  } else if (fail2) {
                    status = CONTINUE;
                    step = attempt2._2(util.fromLeft(fail2));
                    fail2 = null;
                  }
                  break;
                case RESUME:
                  if (interrupt && interrupt !== tmp && bracketCount === 0 || fail2) {
                    status = RETURN;
                  } else {
                    bhead = attempt2._1;
                    btail = attempt2._2;
                    status = STEP_BIND;
                    step = util.fromRight(step);
                  }
                  break;
                case BRACKET:
                  bracketCount--;
                  if (fail2 === null) {
                    result = util.fromRight(step);
                    attempts = new Aff2(CONS, new Aff2(RELEASE, attempt2._2, result), attempts, tmp);
                    if (interrupt === tmp || bracketCount > 0) {
                      status = CONTINUE;
                      step = attempt2._3(result);
                    }
                  }
                  break;
                case RELEASE:
                  attempts = new Aff2(CONS, new Aff2(FINALIZED, step, fail2), attempts, interrupt);
                  status = CONTINUE;
                  if (interrupt && interrupt !== tmp && bracketCount === 0) {
                    step = attempt2._1.killed(util.fromLeft(interrupt))(attempt2._2);
                  } else if (fail2) {
                    step = attempt2._1.failed(util.fromLeft(fail2))(attempt2._2);
                  } else {
                    step = attempt2._1.completed(util.fromRight(step))(attempt2._2);
                  }
                  fail2 = null;
                  bracketCount++;
                  break;
                case FINALIZER:
                  bracketCount++;
                  attempts = new Aff2(CONS, new Aff2(FINALIZED, step, fail2), attempts, interrupt);
                  status = CONTINUE;
                  step = attempt2._1;
                  break;
                case FINALIZED:
                  bracketCount--;
                  status = RETURN;
                  step = attempt2._1;
                  fail2 = attempt2._2;
                  break;
              }
            }
            break;
          case COMPLETED:
            for (var k in joins) {
              if (joins.hasOwnProperty(k)) {
                rethrow = rethrow && joins[k].rethrow;
                runEff(joins[k].handler(step));
              }
            }
            joins = null;
            if (interrupt && fail2) {
              setTimeout(function() {
                throw util.fromLeft(fail2);
              }, 0);
            } else if (util.isLeft(step) && rethrow) {
              setTimeout(function() {
                if (rethrow) {
                  throw util.fromLeft(step);
                }
              }, 0);
            }
            return;
          case SUSPENDED:
            status = CONTINUE;
            break;
          case PENDING:
            return;
        }
      }
    }
    function onComplete(join4) {
      return function() {
        if (status === COMPLETED) {
          rethrow = rethrow && join4.rethrow;
          join4.handler(step)();
          return function() {
          };
        }
        var jid = joinId++;
        joins = joins || {};
        joins[jid] = join4;
        return function() {
          if (joins !== null) {
            delete joins[jid];
          }
        };
      };
    }
    function kill(error3, cb) {
      return function() {
        if (status === COMPLETED) {
          cb(util.right(void 0))();
          return function() {
          };
        }
        var canceler = onComplete({
          rethrow: false,
          handler: function() {
            return cb(util.right(void 0));
          }
        })();
        switch (status) {
          case SUSPENDED:
            interrupt = util.left(error3);
            status = COMPLETED;
            step = interrupt;
            run3(runTick);
            break;
          case PENDING:
            if (interrupt === null) {
              interrupt = util.left(error3);
            }
            if (bracketCount === 0) {
              if (status === PENDING) {
                attempts = new Aff2(CONS, new Aff2(FINALIZER, step(error3)), attempts, interrupt);
              }
              status = RETURN;
              step = null;
              fail2 = null;
              run3(++runTick);
            }
            break;
          default:
            if (interrupt === null) {
              interrupt = util.left(error3);
            }
            if (bracketCount === 0) {
              status = RETURN;
              step = null;
              fail2 = null;
            }
        }
        return canceler;
      };
    }
    function join3(cb) {
      return function() {
        var canceler = onComplete({
          rethrow: false,
          handler: cb
        })();
        if (status === SUSPENDED) {
          run3(runTick);
        }
        return canceler;
      };
    }
    return {
      kill,
      join: join3,
      onComplete,
      isSuspended: function() {
        return status === SUSPENDED;
      },
      run: function() {
        if (status === SUSPENDED) {
          if (!Scheduler.isDraining()) {
            Scheduler.enqueue(function() {
              run3(runTick);
            });
          } else {
            run3(runTick);
          }
        }
      }
    };
  }
  function runPar(util, supervisor, par, cb) {
    var fiberId = 0;
    var fibers = {};
    var killId = 0;
    var kills = {};
    var early = new Error("[ParAff] Early exit");
    var interrupt = null;
    var root = EMPTY;
    function kill(error3, par2, cb2) {
      var step = par2;
      var head6 = null;
      var tail2 = null;
      var count = 0;
      var kills2 = {};
      var tmp, kid;
      loop:
        while (true) {
          tmp = null;
          switch (step.tag) {
            case FORKED:
              if (step._3 === EMPTY) {
                tmp = fibers[step._1];
                kills2[count++] = tmp.kill(error3, function(result) {
                  return function() {
                    count--;
                    if (count === 0) {
                      cb2(result)();
                    }
                  };
                });
              }
              if (head6 === null) {
                break loop;
              }
              step = head6._2;
              if (tail2 === null) {
                head6 = null;
              } else {
                head6 = tail2._1;
                tail2 = tail2._2;
              }
              break;
            case MAP:
              step = step._2;
              break;
            case APPLY:
            case ALT:
              if (head6) {
                tail2 = new Aff2(CONS, head6, tail2);
              }
              head6 = step;
              step = step._1;
              break;
          }
        }
      if (count === 0) {
        cb2(util.right(void 0))();
      } else {
        kid = 0;
        tmp = count;
        for (; kid < tmp; kid++) {
          kills2[kid] = kills2[kid]();
        }
      }
      return kills2;
    }
    function join3(result, head6, tail2) {
      var fail2, step, lhs, rhs, tmp, kid;
      if (util.isLeft(result)) {
        fail2 = result;
        step = null;
      } else {
        step = result;
        fail2 = null;
      }
      loop:
        while (true) {
          lhs = null;
          rhs = null;
          tmp = null;
          kid = null;
          if (interrupt !== null) {
            return;
          }
          if (head6 === null) {
            cb(fail2 || step)();
            return;
          }
          if (head6._3 !== EMPTY) {
            return;
          }
          switch (head6.tag) {
            case MAP:
              if (fail2 === null) {
                head6._3 = util.right(head6._1(util.fromRight(step)));
                step = head6._3;
              } else {
                head6._3 = fail2;
              }
              break;
            case APPLY:
              lhs = head6._1._3;
              rhs = head6._2._3;
              if (fail2) {
                head6._3 = fail2;
                tmp = true;
                kid = killId++;
                kills[kid] = kill(early, fail2 === lhs ? head6._2 : head6._1, function() {
                  return function() {
                    delete kills[kid];
                    if (tmp) {
                      tmp = false;
                    } else if (tail2 === null) {
                      join3(fail2, null, null);
                    } else {
                      join3(fail2, tail2._1, tail2._2);
                    }
                  };
                });
                if (tmp) {
                  tmp = false;
                  return;
                }
              } else if (lhs === EMPTY || rhs === EMPTY) {
                return;
              } else {
                step = util.right(util.fromRight(lhs)(util.fromRight(rhs)));
                head6._3 = step;
              }
              break;
            case ALT:
              lhs = head6._1._3;
              rhs = head6._2._3;
              if (lhs === EMPTY && util.isLeft(rhs) || rhs === EMPTY && util.isLeft(lhs)) {
                return;
              }
              if (lhs !== EMPTY && util.isLeft(lhs) && rhs !== EMPTY && util.isLeft(rhs)) {
                fail2 = step === lhs ? rhs : lhs;
                step = null;
                head6._3 = fail2;
              } else {
                head6._3 = step;
                tmp = true;
                kid = killId++;
                kills[kid] = kill(early, step === lhs ? head6._2 : head6._1, function() {
                  return function() {
                    delete kills[kid];
                    if (tmp) {
                      tmp = false;
                    } else if (tail2 === null) {
                      join3(step, null, null);
                    } else {
                      join3(step, tail2._1, tail2._2);
                    }
                  };
                });
                if (tmp) {
                  tmp = false;
                  return;
                }
              }
              break;
          }
          if (tail2 === null) {
            head6 = null;
          } else {
            head6 = tail2._1;
            tail2 = tail2._2;
          }
        }
    }
    function resolve2(fiber) {
      return function(result) {
        return function() {
          delete fibers[fiber._1];
          fiber._3 = result;
          join3(result, fiber._2._1, fiber._2._2);
        };
      };
    }
    function run3() {
      var status = CONTINUE;
      var step = par;
      var head6 = null;
      var tail2 = null;
      var tmp, fid;
      loop:
        while (true) {
          tmp = null;
          fid = null;
          switch (status) {
            case CONTINUE:
              switch (step.tag) {
                case MAP:
                  if (head6) {
                    tail2 = new Aff2(CONS, head6, tail2);
                  }
                  head6 = new Aff2(MAP, step._1, EMPTY, EMPTY);
                  step = step._2;
                  break;
                case APPLY:
                  if (head6) {
                    tail2 = new Aff2(CONS, head6, tail2);
                  }
                  head6 = new Aff2(APPLY, EMPTY, step._2, EMPTY);
                  step = step._1;
                  break;
                case ALT:
                  if (head6) {
                    tail2 = new Aff2(CONS, head6, tail2);
                  }
                  head6 = new Aff2(ALT, EMPTY, step._2, EMPTY);
                  step = step._1;
                  break;
                default:
                  fid = fiberId++;
                  status = RETURN;
                  tmp = step;
                  step = new Aff2(FORKED, fid, new Aff2(CONS, head6, tail2), EMPTY);
                  tmp = Fiber(util, supervisor, tmp);
                  tmp.onComplete({
                    rethrow: false,
                    handler: resolve2(step)
                  })();
                  fibers[fid] = tmp;
                  if (supervisor) {
                    supervisor.register(tmp);
                  }
              }
              break;
            case RETURN:
              if (head6 === null) {
                break loop;
              }
              if (head6._1 === EMPTY) {
                head6._1 = step;
                status = CONTINUE;
                step = head6._2;
                head6._2 = EMPTY;
              } else {
                head6._2 = step;
                step = head6;
                if (tail2 === null) {
                  head6 = null;
                } else {
                  head6 = tail2._1;
                  tail2 = tail2._2;
                }
              }
          }
        }
      root = step;
      for (fid = 0; fid < fiberId; fid++) {
        fibers[fid].run();
      }
    }
    function cancel(error3, cb2) {
      interrupt = util.left(error3);
      var innerKills;
      for (var kid in kills) {
        if (kills.hasOwnProperty(kid)) {
          innerKills = kills[kid];
          for (kid in innerKills) {
            if (innerKills.hasOwnProperty(kid)) {
              innerKills[kid]();
            }
          }
        }
      }
      kills = null;
      var newKills = kill(error3, root, cb2);
      return function(killError) {
        return new Aff2(ASYNC, function(killCb) {
          return function() {
            for (var kid2 in newKills) {
              if (newKills.hasOwnProperty(kid2)) {
                newKills[kid2]();
              }
            }
            return nonCanceler2;
          };
        });
      };
    }
    run3();
    return function(killError) {
      return new Aff2(ASYNC, function(killCb) {
        return function() {
          return cancel(killError, killCb);
        };
      });
    };
  }
  function sequential2(util, supervisor, par) {
    return new Aff2(ASYNC, function(cb) {
      return function() {
        return runPar(util, supervisor, par, cb);
      };
    });
  }
  Aff2.EMPTY = EMPTY;
  Aff2.Pure = AffCtr(PURE);
  Aff2.Throw = AffCtr(THROW);
  Aff2.Catch = AffCtr(CATCH);
  Aff2.Sync = AffCtr(SYNC);
  Aff2.Async = AffCtr(ASYNC);
  Aff2.Bind = AffCtr(BIND);
  Aff2.Bracket = AffCtr(BRACKET);
  Aff2.Fork = AffCtr(FORK);
  Aff2.Seq = AffCtr(SEQ);
  Aff2.ParMap = AffCtr(MAP);
  Aff2.ParApply = AffCtr(APPLY);
  Aff2.ParAlt = AffCtr(ALT);
  Aff2.Fiber = Fiber;
  Aff2.Supervisor = Supervisor;
  Aff2.Scheduler = Scheduler;
  Aff2.nonCanceler = nonCanceler2;
  return Aff2;
}();
var _pure = Aff.Pure;
var _throwError = Aff.Throw;
function _catchError(aff) {
  return function(k) {
    return Aff.Catch(aff, k);
  };
}
function _map(f) {
  return function(aff) {
    if (aff.tag === Aff.Pure.tag) {
      return Aff.Pure(f(aff._1));
    } else {
      return Aff.Bind(aff, function(value) {
        return Aff.Pure(f(value));
      });
    }
  };
}
function _bind(aff) {
  return function(k) {
    return Aff.Bind(aff, k);
  };
}
var _liftEffect = Aff.Sync;
var makeAff = Aff.Async;
function _makeFiber(util, aff) {
  return function() {
    return Aff.Fiber(util, null, aff);
  };
}
var _delay = function() {
  function setDelay(n, k) {
    if (n === 0 && typeof setImmediate !== "undefined") {
      return setImmediate(k);
    } else {
      return setTimeout(k, n);
    }
  }
  function clearDelay(n, t) {
    if (n === 0 && typeof clearImmediate !== "undefined") {
      return clearImmediate(t);
    } else {
      return clearTimeout(t);
    }
  }
  return function(right, ms) {
    return Aff.Async(function(cb) {
      return function() {
        var timer = setDelay(ms, cb(right()));
        return function() {
          return Aff.Sync(function() {
            return right(clearDelay(ms, timer));
          });
        };
      };
    });
  };
}();
var _sequential = Aff.Seq;

// output/Effect.Exception/foreign.js
function message(e) {
  return e.message;
}

// output/Control.Monad.Error.Class/index.js
var throwError = function(dict) {
  return dict.throwError;
};
var catchError = function(dict) {
  return dict.catchError;
};
var $$try = function(dictMonadError) {
  var catchError1 = catchError(dictMonadError);
  var Monad0 = dictMonadError.MonadThrow0().Monad0();
  var map25 = map(Monad0.Bind1().Apply0().Functor0());
  var pure20 = pure(Monad0.Applicative0());
  return function(a) {
    return catchError1(map25(Right.create)(a))(function($52) {
      return pure20(Left.create($52));
    });
  };
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

// output/Effect.Class/index.js
var liftEffect = function(dict) {
  return dict.liftEffect;
};

// output/Control.Monad.Except.Trans/index.js
var map5 = /* @__PURE__ */ map(functorEither);
var ExceptT = function(x) {
  return x;
};
var runExceptT = function(v) {
  return v;
};
var monadTransExceptT = {
  lift: function(dictMonad) {
    var bind9 = bind(dictMonad.Bind1());
    var pure20 = pure(dictMonad.Applicative0());
    return function(m) {
      return bind9(m)(function(a) {
        return pure20(new Right(a));
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
  var map112 = map(dictFunctor);
  return {
    map: function(f) {
      return mapExceptT(map112(map5(f)));
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
  var bind9 = bind(dictMonad.Bind1());
  var pure20 = pure(dictMonad.Applicative0());
  return {
    bind: function(v) {
      return function(k) {
        return bind9(v)(either(function($187) {
          return pure20(Left.create($187));
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
var monadEffectExceptT = function(dictMonadEffect) {
  var Monad0 = dictMonadEffect.Monad0();
  var monadExceptT1 = monadExceptT(Monad0);
  return {
    liftEffect: function() {
      var $190 = lift3(Monad0);
      var $191 = liftEffect(dictMonadEffect);
      return function($192) {
        return $190($191($192));
      };
    }(),
    Monad0: function() {
      return monadExceptT1;
    }
  };
};
var monadStateExceptT = function(dictMonadState) {
  var Monad0 = dictMonadState.Monad0();
  var lift1 = lift3(Monad0);
  var state2 = state(dictMonadState);
  var monadExceptT1 = monadExceptT(Monad0);
  return {
    state: function(f) {
      return lift1(state2(f));
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

// output/Effect.Aff/index.js
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
var $$void2 = /* @__PURE__ */ $$void(functorEffect);
var functorAff = {
  map: _map
};
var ffiUtil = /* @__PURE__ */ function() {
  var unsafeFromRight = function(v) {
    if (v instanceof Right) {
      return v.value0;
    }
    ;
    if (v instanceof Left) {
      return unsafeCrashWith("unsafeFromRight: Left");
    }
    ;
    throw new Error("Failed pattern match at Effect.Aff (line 412, column 21 - line 414, column 54): " + [v.constructor.name]);
  };
  var unsafeFromLeft = function(v) {
    if (v instanceof Left) {
      return v.value0;
    }
    ;
    if (v instanceof Right) {
      return unsafeCrashWith("unsafeFromLeft: Right");
    }
    ;
    throw new Error("Failed pattern match at Effect.Aff (line 407, column 20 - line 409, column 55): " + [v.constructor.name]);
  };
  var isLeft = function(v) {
    if (v instanceof Left) {
      return true;
    }
    ;
    if (v instanceof Right) {
      return false;
    }
    ;
    throw new Error("Failed pattern match at Effect.Aff (line 402, column 12 - line 404, column 21): " + [v.constructor.name]);
  };
  return {
    isLeft,
    fromLeft: unsafeFromLeft,
    fromRight: unsafeFromRight,
    left: Left.create,
    right: Right.create
  };
}();
var makeFiber = function(aff) {
  return _makeFiber(ffiUtil, aff);
};
var launchAff = function(aff) {
  return function __do2() {
    var fiber = makeFiber(aff)();
    fiber.run();
    return fiber;
  };
};
var launchAff_ = function($75) {
  return $$void2(launchAff($75));
};
var monadAff = {
  Applicative0: function() {
    return applicativeAff;
  },
  Bind1: function() {
    return bindAff;
  }
};
var bindAff = {
  bind: _bind,
  Apply0: function() {
    return $lazy_applyAff(0);
  }
};
var applicativeAff = {
  pure: _pure,
  Apply0: function() {
    return $lazy_applyAff(0);
  }
};
var $lazy_applyAff = /* @__PURE__ */ $runtime_lazy2("applyAff", "Effect.Aff", function() {
  return {
    apply: ap(monadAff),
    Functor0: function() {
      return functorAff;
    }
  };
});
var pure2 = /* @__PURE__ */ pure(applicativeAff);
var monadEffectAff = {
  liftEffect: _liftEffect,
  Monad0: function() {
    return monadAff;
  }
};
var monadThrowAff = {
  throwError: _throwError,
  Monad0: function() {
    return monadAff;
  }
};
var monadErrorAff = {
  catchError: _catchError,
  MonadThrow0: function() {
    return monadThrowAff;
  }
};
var $$try2 = /* @__PURE__ */ $$try(monadErrorAff);
var attempt = $$try2;
var nonCanceler = /* @__PURE__ */ $$const(/* @__PURE__ */ pure2(unit));

// output/Data.Csv/index.js
var map6 = /* @__PURE__ */ map(functorArray);
var pure3 = /* @__PURE__ */ pure(applicativeEffect);
var map1 = /* @__PURE__ */ map(functorMaybe);
var toCsvRow = function(v) {
  if (v.length === 0) {
    return [];
  }
  ;
  var mkRow = function(tpls) {
    return tpls;
  };
  var idxs = range2(2)(length(v) + 1 | 0);
  var tuples = zip(idxs)(v);
  return map6(mkRow)(tuples);
};
var readCsv = function(x) {
  return pure3(readCsvImpl(x));
};
var getLineNo = function(v) {
  return fst(v);
};
var create = function(recs) {
  var rows = map1(toCsvRow)(tail(recs));
  var headers = head(recs);
  return {
    headers,
    rows
  };
};

// output/Data.Array.NonEmpty.Internal/foreign.js
var traverse1Impl = function() {
  function Cont(fn) {
    this.fn = fn;
  }
  var emptyList = {};
  var ConsCell = function(head6, tail2) {
    this.head = head6;
    this.tail = tail2;
  };
  function finalCell(head6) {
    return new ConsCell(head6, emptyList);
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
  return function(apply7, map25, f) {
    var buildFrom = function(x, ys) {
      return apply7(map25(consList)(f(x)))(ys);
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
      var acc = map25(finalCell)(f(array[array.length - 1]));
      var result = go(acc, array.length - 1, array);
      while (result instanceof Cont) {
        result = result.fn();
      }
      return map25(listToArray)(result);
    };
  };
}();

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
  var map25 = map(dictFunctor);
  return {
    map: function(f) {
      return function(m) {
        return new NonEmpty(f(m.value0), map25(f)(m.value1));
      };
    }
  };
};
var foldableNonEmpty = function(dictFoldable) {
  var foldMap2 = foldMap(dictFoldable);
  var foldl3 = foldl(dictFoldable);
  var foldr4 = foldr(dictFoldable);
  return {
    foldMap: function(dictMonoid) {
      var append1 = append(dictMonoid.Semigroup0());
      var foldMap12 = foldMap2(dictMonoid);
      return function(f) {
        return function(v) {
          return append1(f(v.value0))(foldMap12(f)(v.value1));
        };
      };
    },
    foldl: function(f) {
      return function(b) {
        return function(v) {
          return foldl3(f)(f(b)(v.value0))(v.value1);
        };
      };
    },
    foldr: function(f) {
      return function(b) {
        return function(v) {
          return f(v.value0)(foldr4(f)(b)(v.value1));
        };
      };
    }
  };
};
var foldable1NonEmpty = function(dictFoldable) {
  var foldl3 = foldl(dictFoldable);
  var foldr4 = foldr(dictFoldable);
  var foldableNonEmpty1 = foldableNonEmpty(dictFoldable);
  return {
    foldMap1: function(dictSemigroup) {
      var append1 = append(dictSemigroup);
      return function(f) {
        return function(v) {
          return foldl3(function(s) {
            return function(a1) {
              return append1(s)(f(a1));
            };
          })(f(v.value0))(v.value1);
        };
      };
    },
    foldr1: function(f) {
      return function(v) {
        return maybe(v.value0)(f(v.value0))(foldr4(function(a1) {
          var $250 = maybe(a1)(f(a1));
          return function($251) {
            return Just.create($250($251));
          };
        })(Nothing.value)(v.value1));
      };
    },
    foldl1: function(f) {
      return function(v) {
        return foldl3(f)(v.value0)(v.value1);
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
  throw new Error("Failed pattern match at Data.Array.NonEmpty (line 161, column 1 - line 161, column 58): " + [xs.constructor.name]);
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
  function Nil2() {
  }
  ;
  Nil2.value = new Nil2();
  return Nil2;
}();
var Cons = /* @__PURE__ */ function() {
  function Cons2(value0, value1) {
    this.value0 = value0;
    this.value1 = value1;
  }
  ;
  Cons2.create = function(value0) {
    return function(value1) {
      return new Cons2(value0, value1);
    };
  };
  return Cons2;
}();
var listMap = function(f) {
  var chunkedRevMap = function($copy_v) {
    return function($copy_v1) {
      var $tco_var_v = $copy_v;
      var $tco_done = false;
      var $tco_result;
      function $tco_loop(v, v1) {
        if (v1 instanceof Cons && (v1.value1 instanceof Cons && v1.value1.value1 instanceof Cons)) {
          $tco_var_v = new Cons(v1, v);
          $copy_v1 = v1.value1.value1.value1;
          return;
        }
        ;
        var unrolledMap = function(v2) {
          if (v2 instanceof Cons && (v2.value1 instanceof Cons && v2.value1.value1 instanceof Nil)) {
            return new Cons(f(v2.value0), new Cons(f(v2.value1.value0), Nil.value));
          }
          ;
          if (v2 instanceof Cons && v2.value1 instanceof Nil) {
            return new Cons(f(v2.value0), Nil.value);
          }
          ;
          return Nil.value;
        };
        var reverseUnrolledMap = function($copy_v2) {
          return function($copy_v3) {
            var $tco_var_v2 = $copy_v2;
            var $tco_done1 = false;
            var $tco_result2;
            function $tco_loop2(v2, v3) {
              if (v2 instanceof Cons && (v2.value0 instanceof Cons && (v2.value0.value1 instanceof Cons && v2.value0.value1.value1 instanceof Cons))) {
                $tco_var_v2 = v2.value1;
                $copy_v3 = new Cons(f(v2.value0.value0), new Cons(f(v2.value0.value1.value0), new Cons(f(v2.value0.value1.value1.value0), v3)));
                return;
              }
              ;
              $tco_done1 = true;
              return v3;
            }
            ;
            while (!$tco_done1) {
              $tco_result2 = $tco_loop2($tco_var_v2, $copy_v3);
            }
            ;
            return $tco_result2;
          };
        };
        $tco_done = true;
        return reverseUnrolledMap(v)(unrolledMap(v1));
      }
      ;
      while (!$tco_done) {
        $tco_result = $tco_loop($tco_var_v, $copy_v1);
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
var map7 = /* @__PURE__ */ map(functorList);
var functorNonEmptyList = /* @__PURE__ */ functorNonEmpty(functorList);
var foldableList = {
  foldr: function(f) {
    return function(b) {
      var rev = function() {
        var go = function($copy_v) {
          return function($copy_v1) {
            var $tco_var_v = $copy_v;
            var $tco_done = false;
            var $tco_result;
            function $tco_loop(v, v1) {
              if (v1 instanceof Nil) {
                $tco_done = true;
                return v;
              }
              ;
              if (v1 instanceof Cons) {
                $tco_var_v = new Cons(v1.value0, v);
                $copy_v1 = v1.value1;
                return;
              }
              ;
              throw new Error("Failed pattern match at Data.List.Types (line 107, column 7 - line 107, column 23): " + [v.constructor.name, v1.constructor.name]);
            }
            ;
            while (!$tco_done) {
              $tco_result = $tco_loop($tco_var_v, $copy_v1);
            }
            ;
            return $tco_result;
          };
        };
        return go(Nil.value);
      }();
      var $284 = foldl(foldableList)(flip(f))(b);
      return function($285) {
        return $284(rev($285));
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
        var $286 = append22(acc);
        return function($287) {
          return $286(f($287));
        };
      })(mempty2);
    };
  }
};
var foldl2 = /* @__PURE__ */ foldl(foldableList);
var intercalate3 = /* @__PURE__ */ intercalate(foldableList)(monoidString);
var foldableNonEmptyList = /* @__PURE__ */ foldableNonEmpty(foldableList);
var showList = function(dictShow) {
  var show11 = show(dictShow);
  return {
    show: function(v) {
      if (v instanceof Nil) {
        return "Nil";
      }
      ;
      return "(" + (intercalate3(" : ")(map7(show11)(v)) + " : Nil)");
    }
  };
};
var traversableList = {
  traverse: function(dictApplicative) {
    var Apply0 = dictApplicative.Apply0();
    var map112 = map(Apply0.Functor0());
    var lift22 = lift2(Apply0);
    var pure111 = pure(dictApplicative);
    return function(f) {
      var $301 = map112(foldl2(flip(Cons.create))(Nil.value));
      var $302 = foldl2(function(acc) {
        var $304 = lift22(flip(Cons.create))(acc);
        return function($305) {
          return $304(f($305));
        };
      })(pure111(Nil.value));
      return function($303) {
        return $301($302($303));
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

// output/Data.Show.Generic/foreign.js
var intercalate4 = function(separator) {
  return function(xs) {
    return xs.join(separator);
  };
};

// output/Data.Show.Generic/index.js
var append2 = /* @__PURE__ */ append(semigroupArray);
var genericShowArgsNoArguments = {
  genericShowArgs: function(v) {
    return [];
  }
};
var genericShowArgsArgument = function(dictShow) {
  var show11 = show(dictShow);
  return {
    genericShowArgs: function(v) {
      return [show11(v)];
    }
  };
};
var genericShowArgs = function(dict) {
  return dict.genericShowArgs;
};
var genericShowArgsProduct = function(dictGenericShowArgs) {
  var genericShowArgs1 = genericShowArgs(dictGenericShowArgs);
  return function(dictGenericShowArgs1) {
    var genericShowArgs2 = genericShowArgs(dictGenericShowArgs1);
    return {
      genericShowArgs: function(v) {
        return append2(genericShowArgs1(v.value0))(genericShowArgs2(v.value1));
      }
    };
  };
};
var genericShowConstructor = function(dictGenericShowArgs) {
  var genericShowArgs1 = genericShowArgs(dictGenericShowArgs);
  return function(dictIsSymbol) {
    var reflectSymbol2 = reflectSymbol(dictIsSymbol);
    return {
      "genericShow'": function(v) {
        var ctor = reflectSymbol2($$Proxy.value);
        var v1 = genericShowArgs1(v);
        if (v1.length === 0) {
          return ctor;
        }
        ;
        return "(" + (intercalate4(" ")(append2([ctor])(v1)) + ")");
      }
    };
  };
};
var genericShow$prime = function(dict) {
  return dict["genericShow'"];
};
var genericShowSum = function(dictGenericShow) {
  var genericShow$prime1 = genericShow$prime(dictGenericShow);
  return function(dictGenericShow1) {
    var genericShow$prime2 = genericShow$prime(dictGenericShow1);
    return {
      "genericShow'": function(v) {
        if (v instanceof Inl) {
          return genericShow$prime1(v.value0);
        }
        ;
        if (v instanceof Inr) {
          return genericShow$prime2(v.value0);
        }
        ;
        throw new Error("Failed pattern match at Data.Show.Generic (line 26, column 1 - line 28, column 40): " + [v.constructor.name]);
      }
    };
  };
};
var genericShow = function(dictGeneric) {
  var from3 = from(dictGeneric);
  return function(dictGenericShow) {
    var genericShow$prime1 = genericShow$prime(dictGenericShow);
    return function(x) {
      return genericShow$prime1(from3(x));
    };
  };
};

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

// output/Data.Validation.Issue/index.js
var genericShowArgsArgument2 = /* @__PURE__ */ genericShowArgsArgument(showString);
var genericShowConstructor2 = /* @__PURE__ */ genericShowConstructor(genericShowArgsArgument2);
var genericShowConstructor1 = /* @__PURE__ */ genericShowConstructor(/* @__PURE__ */ genericShowArgsProduct(genericShowArgsArgument2)(genericShowArgsArgument2));
var NotImplemented = /* @__PURE__ */ function() {
  function NotImplemented2() {
  }
  ;
  NotImplemented2.value = new NotImplemented2();
  return NotImplemented2;
}();
var Issue = /* @__PURE__ */ function() {
  function Issue2(value0) {
    this.value0 = value0;
  }
  ;
  Issue2.create = function(value0) {
    return new Issue2(value0);
  };
  return Issue2;
}();
var InvalidValue = /* @__PURE__ */ function() {
  function InvalidValue2(value0, value1) {
    this.value0 = value0;
    this.value1 = value1;
  }
  ;
  InvalidValue2.create = function(value0) {
    return function(value1) {
      return new InvalidValue2(value0, value1);
    };
  };
  return InvalidValue2;
}();
var IdLongerThan64Chars = /* @__PURE__ */ function() {
  function IdLongerThan64Chars2(value0) {
    this.value0 = value0;
  }
  ;
  IdLongerThan64Chars2.create = function(value0) {
    return new IdLongerThan64Chars2(value0);
  };
  return IdLongerThan64Chars2;
}();
var InvalidCSV = /* @__PURE__ */ function() {
  function InvalidCSV2(value0) {
    this.value0 = value0;
  }
  ;
  InvalidCSV2.create = function(value0) {
    return new InvalidCSV2(value0);
  };
  return InvalidCSV2;
}();
var InvalidDDFCSV = /* @__PURE__ */ function() {
  function InvalidDDFCSV2(value0, value1) {
    this.value0 = value0;
    this.value1 = value1;
  }
  ;
  InvalidDDFCSV2.create = function(value0) {
    return function(value1) {
      return new InvalidDDFCSV2(value0, value1);
    };
  };
  return InvalidDDFCSV2;
}();
var genericIssue = {
  to: function(x) {
    if (x instanceof Inl) {
      return NotImplemented.value;
    }
    ;
    if (x instanceof Inr && x.value0 instanceof Inl) {
      return new Issue(x.value0.value0);
    }
    ;
    if (x instanceof Inr && (x.value0 instanceof Inr && x.value0.value0 instanceof Inl)) {
      return new InvalidValue(x.value0.value0.value0.value0, x.value0.value0.value0.value1);
    }
    ;
    if (x instanceof Inr && (x.value0 instanceof Inr && (x.value0.value0 instanceof Inr && x.value0.value0.value0 instanceof Inl))) {
      return new IdLongerThan64Chars(x.value0.value0.value0.value0);
    }
    ;
    if (x instanceof Inr && (x.value0 instanceof Inr && (x.value0.value0 instanceof Inr && (x.value0.value0.value0 instanceof Inr && x.value0.value0.value0.value0 instanceof Inl)))) {
      return new InvalidCSV(x.value0.value0.value0.value0.value0);
    }
    ;
    if (x instanceof Inr && (x.value0 instanceof Inr && (x.value0.value0 instanceof Inr && (x.value0.value0.value0 instanceof Inr && x.value0.value0.value0.value0 instanceof Inr)))) {
      return new InvalidDDFCSV(x.value0.value0.value0.value0.value0.value0, x.value0.value0.value0.value0.value0.value1);
    }
    ;
    throw new Error("Failed pattern match at Data.Validation.Issue (line 24, column 1 - line 24, column 48): " + [x.constructor.name]);
  },
  from: function(x) {
    if (x instanceof NotImplemented) {
      return new Inl(NoArguments.value);
    }
    ;
    if (x instanceof Issue) {
      return new Inr(new Inl(x.value0));
    }
    ;
    if (x instanceof InvalidValue) {
      return new Inr(new Inr(new Inl(new Product(x.value0, x.value1))));
    }
    ;
    if (x instanceof IdLongerThan64Chars) {
      return new Inr(new Inr(new Inr(new Inl(x.value0))));
    }
    ;
    if (x instanceof InvalidCSV) {
      return new Inr(new Inr(new Inr(new Inr(new Inl(x.value0)))));
    }
    ;
    if (x instanceof InvalidDDFCSV) {
      return new Inr(new Inr(new Inr(new Inr(new Inr(new Product(x.value0, x.value1))))));
    }
    ;
    throw new Error("Failed pattern match at Data.Validation.Issue (line 24, column 1 - line 24, column 48): " + [x.constructor.name]);
  }
};
var showId = {
  show: /* @__PURE__ */ genericShow(genericIssue)(/* @__PURE__ */ genericShowSum(/* @__PURE__ */ genericShowConstructor(genericShowArgsNoArguments)({
    reflectSymbol: function() {
      return "NotImplemented";
    }
  }))(/* @__PURE__ */ genericShowSum(/* @__PURE__ */ genericShowConstructor2({
    reflectSymbol: function() {
      return "Issue";
    }
  }))(/* @__PURE__ */ genericShowSum(/* @__PURE__ */ genericShowConstructor1({
    reflectSymbol: function() {
      return "InvalidValue";
    }
  }))(/* @__PURE__ */ genericShowSum(/* @__PURE__ */ genericShowConstructor2({
    reflectSymbol: function() {
      return "IdLongerThan64Chars";
    }
  }))(/* @__PURE__ */ genericShowSum(/* @__PURE__ */ genericShowConstructor2({
    reflectSymbol: function() {
      return "InvalidCSV";
    }
  }))(/* @__PURE__ */ genericShowConstructor1({
    reflectSymbol: function() {
      return "InvalidDDFCSV";
    }
  })))))))
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
  var append1 = append(dictSemigroup);
  return {
    apply: function(v) {
      return function(v1) {
        if (v instanceof Left && v1 instanceof Left) {
          return new Left(append1(v.value0)(v1.value0));
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
var $runtime_lazy3 = function(name2, moduleName, init3) {
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
var map8 = /* @__PURE__ */ map(functorMaybe);
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
  var $43 = isLead(cu0) && isTrail(cu1);
  if ($43) {
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
  return map8(function(v) {
    return new Tuple(v.head, v.tail);
  })(uncons2(s));
};
var toCodePointArrayFallback = function(s) {
  return unfoldr2(unconsButWithTuple)(s);
};
var unsafeCodePointAt0Fallback = function(s) {
  var cu0 = fromEnum2(charAt(0)(s));
  var $47 = isLead(cu0) && length3(s) > 1;
  if ($47) {
    var cu1 = fromEnum2(charAt(1)(s));
    var $48 = isTrail(cu1);
    if ($48) {
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
var length4 = function($74) {
  return length(toCodePointArray($74));
};
var fromCharCode3 = /* @__PURE__ */ function() {
  var $75 = toEnumWithDefaults(boundedEnumChar)(bottom(boundedChar))(top(boundedChar));
  return function($76) {
    return singleton4($75($76));
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
var takeFallback = function(v) {
  return function(v1) {
    if (v < 1) {
      return "";
    }
    ;
    var v2 = uncons2(v1);
    if (v2 instanceof Just) {
      return singleton5(v2.value0.head) + takeFallback(v - 1 | 0)(v2.value0.tail);
    }
    ;
    return v1;
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
var $lazy_enumCodePoint = /* @__PURE__ */ $runtime_lazy3("enumCodePoint", "Data.String.CodePoints", function() {
  return {
    succ: defaultSucc(toEnum(boundedEnumCodePoint))(fromEnum(boundedEnumCodePoint)),
    pred: defaultPred(toEnum(boundedEnumCodePoint))(fromEnum(boundedEnumCodePoint)),
    Ord0: function() {
      return ordCodePoint;
    }
  };
});

// output/Data.List/index.js
var foldr3 = /* @__PURE__ */ foldr(foldableList);
var bimap2 = /* @__PURE__ */ bimap(bifunctorStep);
var span2 = function(v) {
  return function(v1) {
    if (v1 instanceof Cons && v(v1.value0)) {
      var v2 = span2(v)(v1.value1);
      return {
        init: new Cons(v1.value0, v2.init),
        rest: v2.rest
      };
    }
    ;
    return {
      init: Nil.value,
      rest: v1
    };
  };
};
var reverse2 = /* @__PURE__ */ function() {
  var go = function($copy_v) {
    return function($copy_v1) {
      var $tco_var_v = $copy_v;
      var $tco_done = false;
      var $tco_result;
      function $tco_loop(v, v1) {
        if (v1 instanceof Nil) {
          $tco_done = true;
          return v;
        }
        ;
        if (v1 instanceof Cons) {
          $tco_var_v = new Cons(v1.value0, v);
          $copy_v1 = v1.value1;
          return;
        }
        ;
        throw new Error("Failed pattern match at Data.List (line 368, column 3 - line 368, column 19): " + [v.constructor.name, v1.constructor.name]);
      }
      ;
      while (!$tco_done) {
        $tco_result = $tco_loop($tco_var_v, $copy_v1);
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
        var $328 = p(x);
        if ($328) {
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
    return foldr3(select)({
      no: Nil.value,
      yes: Nil.value
    })(xs);
  };
};
var manyRec = function(dictMonadRec) {
  var bind14 = bind(dictMonadRec.Monad0().Bind1());
  var tailRecM4 = tailRecM(dictMonadRec);
  return function(dictAlternative) {
    var Alt0 = dictAlternative.Plus1().Alt0();
    var alt5 = alt(Alt0);
    var map112 = map(Alt0.Functor0());
    var pure20 = pure(dictAlternative.Applicative0());
    return function(p) {
      var go = function(acc) {
        return bind14(alt5(map112(Loop.create)(p))(pure20(new Done(unit))))(function(aa) {
          return pure20(bimap2(function(v) {
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
var groupBy2 = function(v) {
  return function(v1) {
    if (v1 instanceof Nil) {
      return Nil.value;
    }
    ;
    if (v1 instanceof Cons) {
      var v2 = span2(v(v1.value0))(v1.value1);
      return new Cons(new NonEmpty(v1.value0, v2.init), groupBy2(v)(v2.rest));
    }
    ;
    throw new Error("Failed pattern match at Data.List (line 609, column 1 - line 609, column 80): " + [v.constructor.name, v1.constructor.name]);
  };
};

// output/Data.List.NonEmpty/index.js
var head2 = function(v) {
  return v.value0;
};

// output/StringParser.Parser/index.js
var map9 = /* @__PURE__ */ map(functorEither);
var bind2 = /* @__PURE__ */ bind(bindEither);
var pure4 = /* @__PURE__ */ pure(applicativeEither);
var tailRecM3 = /* @__PURE__ */ tailRecM(monadRecEither);
var unParser = function(v) {
  return v;
};
var runParser = function(v) {
  return function(s) {
    return map9(function(v1) {
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
      var $69 = map9(function(v1) {
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
            return pure4({
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
          return map9(split3)(unParser(f(st.state))(st.str));
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
var pure5 = /* @__PURE__ */ pure(applicativeParser);
var map10 = /* @__PURE__ */ map(functorParser);
var applySecond2 = /* @__PURE__ */ applySecond(applyParser);
var apply2 = /* @__PURE__ */ apply(applyParser);
var withError = function(p) {
  return function(msg) {
    return alt2(p)(fail(msg));
  };
};
var $$try3 = function(v) {
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
  return apply2(map10(cons$prime)(p))(many(p));
};
var sepBy1 = function(p) {
  return function(sep2) {
    return bind3(p)(function(a) {
      return bind3(many(applySecond2(sep2)(p)))(function(as) {
        return pure5(cons$prime(a)(as));
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
var pure6 = /* @__PURE__ */ pure(applicativeParser);
var show3 = /* @__PURE__ */ show(showChar);
var show22 = /* @__PURE__ */ show(showInt);
var string = function(pattern) {
  return function(v) {
    var length7 = length4(pattern);
    var v1 = splitAt3(length7)(v.substring);
    var $45 = v1.before === pattern;
    if ($45) {
      return new Right({
        result: pattern,
        suffix: {
          substring: v1.after,
          position: v.position + length7 | 0
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
var lowerCaseChar = /* @__PURE__ */ $$try3(/* @__PURE__ */ bind4(anyChar)(function(c) {
  var $59 = elem4(toCharCode2(c))(range2(97)(122));
  if ($59) {
    return pure6(c);
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
var anyDigit = /* @__PURE__ */ $$try3(/* @__PURE__ */ bind4(anyChar)(function(c) {
  var $63 = c >= "0" && c <= "9";
  if ($63) {
    return pure6(c);
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
      return pure6(v.value0);
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
  return $$try3(bind4(anyChar2)(function(c) {
    var $75 = f(c);
    if ($75) {
      return pure6(c);
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

// output/Data.DDF.Atoms.Identifier/index.js
var pure7 = /* @__PURE__ */ pure(/* @__PURE__ */ applicativeV(semigroupArray));
var eq2 = /* @__PURE__ */ eq(eqNonEmptyString);
var compare3 = /* @__PURE__ */ compare(ordNonEmptyString);
var alt3 = /* @__PURE__ */ alt(altParser);
var pure1 = /* @__PURE__ */ pure(applicativeParser);
var show4 = /* @__PURE__ */ show(showInt);
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
  throw new Error("Failed pattern match at Data.DDF.Atoms.Identifier (line 91, column 18 - line 93, column 48): " + [v.constructor.name]);
};
var genericId = {
  to: function(x) {
    return x;
  },
  from: function(x) {
    return x;
  }
};
var showId2 = {
  show: /* @__PURE__ */ genericShow(genericId)(/* @__PURE__ */ genericShowConstructor(/* @__PURE__ */ genericShowArgsArgument(showNonEmptyString))({
    reflectSymbol: function() {
      return "Id";
    }
  }))
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
    return pure7(v.value0);
  }
  ;
  if (v instanceof Left) {
    var pos = show4(v.value0.pos);
    var msg = "invalid id: " + (x + (", " + (v.value0.error + ("at pos " + pos))));
    var err = new InvalidValue(x, msg);
    return invalid([err]);
  }
  ;
  throw new Error("Failed pattern match at Data.DDF.Atoms.Identifier (line 63, column 13 - line 71, column 29): " + [v.constructor.name]);
};

// output/Data.DDF.Atoms.Header/index.js
var bind5 = /* @__PURE__ */ bind(bindParser);
var pure8 = /* @__PURE__ */ pure(applicativeParser);
var append3 = /* @__PURE__ */ append(semigroupNonEmptyString);
var discard2 = /* @__PURE__ */ discard(discardUnit)(bindParser);
var $$void3 = /* @__PURE__ */ $$void(functorParser);
var pure12 = /* @__PURE__ */ pure(/* @__PURE__ */ applicativeV(semigroupArray));
var show5 = /* @__PURE__ */ show(showInt);
var eq3 = /* @__PURE__ */ eq(eqNonEmptyString);
var compare4 = /* @__PURE__ */ compare(ordNonEmptyString);
var is_header = /* @__PURE__ */ bind5(/* @__PURE__ */ string("is--"))(function(begin) {
  return bind5(identifier)(function(val) {
    return pure8(append3(begin)(val));
  });
});
var headerVal = /* @__PURE__ */ unwrap();
var header = /* @__PURE__ */ bind5(/* @__PURE__ */ alt(altParser)(is_header)(identifier))(function(h) {
  return discard2($$void3(eof))(function() {
    return pure8(h);
  });
});
var parseHeader = function(x) {
  var v = runParser(header)(x);
  if (v instanceof Right) {
    return pure12(v.value0);
  }
  ;
  if (v instanceof Left) {
    var pos = show5(v.value0.pos);
    var msg = "invalid header: " + (x + (", " + (v.value0.error + ("at pos " + pos))));
    var err = new InvalidCSV(msg);
    return invalid([err]);
  }
  ;
  throw new Error("Failed pattern match at Data.DDF.Atoms.Header (line 54, column 17 - line 62, column 25): " + [v.constructor.name]);
};
var eqHeader = {
  eq: function(x) {
    return function(y) {
      return eq3(x)(y);
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

// output/Data.DDF.Csv.FileInfo/index.js
var bind6 = /* @__PURE__ */ bind(bindParser);
var discard3 = /* @__PURE__ */ discard(discardUnit)(bindParser);
var $$void4 = /* @__PURE__ */ $$void(functorParser);
var pure9 = /* @__PURE__ */ pure(applicativeParser);
var choice2 = /* @__PURE__ */ choice(foldableArray);
var map11 = /* @__PURE__ */ map(functorNonEmptyList);
var alt4 = /* @__PURE__ */ alt(altParser);
var pure13 = /* @__PURE__ */ pure(/* @__PURE__ */ applicativeV(semigroupArray));
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
var pkeyWithConstrain = /* @__PURE__ */ bind6(identifier)(function(key) {
  return discard3($$void4(string("-")))(function() {
    return bind6(identifier)(function(constrain) {
      return pure9(new Tuple(key, new Just(constrain)));
    });
  });
});
var pkeyNoConstrain = /* @__PURE__ */ bind6(identifier)(function(key) {
  return pure9(new Tuple(key, Nothing.value));
});
var pkey = /* @__PURE__ */ choice2([/* @__PURE__ */ $$try3(pkeyWithConstrain), /* @__PURE__ */ $$try3(pkeyNoConstrain)]);
var isEntitiesFile = function(v) {
  if (v.value1 instanceof Entities) {
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
var filepath = function(v) {
  return v.value0;
};
var ddfFileBegin = /* @__PURE__ */ $$void4(/* @__PURE__ */ string("ddf--"));
var e1 = /* @__PURE__ */ discard3(ddfFileBegin)(function() {
  return discard3($$void4(string("entities--")))(function() {
    return bind6(identifier)(function(domain) {
      return discard3(eof)(function() {
        return pure9(new Entities({
          domain,
          set: Nothing.value
        }));
      });
    });
  });
});
var e2 = /* @__PURE__ */ discard3(ddfFileBegin)(function() {
  return discard3($$void4(string("entities--")))(function() {
    return bind6(identifier)(function(domain) {
      return discard3($$void4(string("--")))(function() {
        return bind6(identifier)(function(eset) {
          return discard3(eof)(function() {
            return pure9(new Entities({
              domain,
              set: new Just(eset)
            }));
          });
        });
      });
    });
  });
});
var entityFile = /* @__PURE__ */ choice2([/* @__PURE__ */ $$try3(e2), /* @__PURE__ */ $$try3(e1)]);
var datapointFile = /* @__PURE__ */ discard3(ddfFileBegin)(function() {
  return discard3($$void4(string("datapoints--")))(function() {
    return bind6(identifier)(function(indicator) {
      return discard3($$void4(string("--by--")))(function() {
        return bind6(sepBy1(pkey)(string("--")))(function(dims) {
          var pkeys = map11(fst)(dims);
          var constrains = map11(snd)(dims);
          return pure9(new DataPoints({
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
var c2 = /* @__PURE__ */ bind6(/* @__PURE__ */ string("ddf--concepts--"))(function(p1) {
  return bind6(alt4(string("discrete"))(string("continuous")))(function(p2) {
    return discard3($$void4(eof))(function() {
      return pure9(p1 + p2);
    });
  });
});
var c1 = /* @__PURE__ */ applyFirst(applyParser)(/* @__PURE__ */ string("ddf--concepts"))(eof);
var conceptFile = /* @__PURE__ */ function() {
  return applySecond(applyParser)(choice2([$$try3(c1), $$try3(c2)]))(pure9(Concepts.value));
}();
var validateFileInfo = function(fp) {
  var v = getName(basename(fp));
  if (v instanceof Nothing) {
    return invalid([new InvalidCSV(fp)]);
  }
  ;
  if (v instanceof Just) {
    var fileParser = alt4(conceptFile)(alt4(entityFile)(datapointFile));
    var v1 = runParser(fileParser)(v.value0);
    if (v1 instanceof Right) {
      return pure13(new FileInfo(fp, v1.value0, v.value0));
    }
    ;
    if (v1 instanceof Left) {
      return invalid([new InvalidDDFCSV(fp, v1.value0.error)]);
    }
    ;
    throw new Error("Failed pattern match at Data.DDF.Csv.FileInfo (line 180, column 7 - line 182, column 59): " + [v1.constructor.name]);
  }
  ;
  throw new Error("Failed pattern match at Data.DDF.Csv.FileInfo (line 174, column 23 - line 182, column 59): " + [v.constructor.name]);
};
var fromFilePath = function($68) {
  return toEither(validateFileInfo($68));
};

// output/Data.Map.Internal/index.js
var $runtime_lazy4 = function(name2, moduleName, init3) {
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
var map12 = /* @__PURE__ */ map(functorMaybe);
var Leaf = /* @__PURE__ */ function() {
  function Leaf2() {
  }
  ;
  Leaf2.value = new Leaf2();
  return Leaf2;
}();
var Node = /* @__PURE__ */ function() {
  function Node2(value0, value1, value2, value3, value4, value5) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
    this.value3 = value3;
    this.value4 = value4;
    this.value5 = value5;
  }
  ;
  Node2.create = function(value0) {
    return function(value1) {
      return function(value2) {
        return function(value3) {
          return function(value4) {
            return function(value5) {
              return new Node2(value0, value1, value2, value3, value4, value5);
            };
          };
        };
      };
    };
  };
  return Node2;
}();
var IterLeaf = /* @__PURE__ */ function() {
  function IterLeaf2() {
  }
  ;
  IterLeaf2.value = new IterLeaf2();
  return IterLeaf2;
}();
var IterEmit = /* @__PURE__ */ function() {
  function IterEmit2(value0, value1, value2) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
  }
  ;
  IterEmit2.create = function(value0) {
    return function(value1) {
      return function(value2) {
        return new IterEmit2(value0, value1, value2);
      };
    };
  };
  return IterEmit2;
}();
var IterNode = /* @__PURE__ */ function() {
  function IterNode2(value0, value1) {
    this.value0 = value0;
    this.value1 = value1;
  }
  ;
  IterNode2.create = function(value0) {
    return function(value1) {
      return new IterNode2(value0, value1);
    };
  };
  return IterNode2;
}();
var Split = /* @__PURE__ */ function() {
  function Split2(value0, value1, value2) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
  }
  ;
  Split2.create = function(value0) {
    return function(value1) {
      return function(value2) {
        return new Split2(value0, value1, value2);
      };
    };
  };
  return Split2;
}();
var SplitLast = /* @__PURE__ */ function() {
  function SplitLast2(value0, value1, value2) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
  }
  ;
  SplitLast2.create = function(value0) {
    return function(value1) {
      return function(value2) {
        return new SplitLast2(value0, value1, value2);
      };
    };
  };
  return SplitLast2;
}();
var unsafeNode = function(k, v, l, r) {
  if (l instanceof Leaf) {
    if (r instanceof Leaf) {
      return new Node(1, 1, k, v, l, r);
    }
    ;
    if (r instanceof Node) {
      return new Node(1 + r.value0 | 0, 1 + r.value1 | 0, k, v, l, r);
    }
    ;
    throw new Error("Failed pattern match at Data.Map.Internal (line 680, column 5 - line 684, column 39): " + [r.constructor.name]);
  }
  ;
  if (l instanceof Node) {
    if (r instanceof Leaf) {
      return new Node(1 + l.value0 | 0, 1 + l.value1 | 0, k, v, l, r);
    }
    ;
    if (r instanceof Node) {
      return new Node(1 + function() {
        var $277 = l.value0 > r.value0;
        if ($277) {
          return l.value0;
        }
        ;
        return r.value0;
      }() | 0, (1 + l.value1 | 0) + r.value1 | 0, k, v, l, r);
    }
    ;
    throw new Error("Failed pattern match at Data.Map.Internal (line 686, column 5 - line 690, column 68): " + [r.constructor.name]);
  }
  ;
  throw new Error("Failed pattern match at Data.Map.Internal (line 678, column 32 - line 690, column 68): " + [l.constructor.name]);
};
var toMapIter = /* @__PURE__ */ function() {
  return flip(IterNode.create)(IterLeaf.value);
}();
var stepWith = function(f) {
  return function(next2) {
    return function(done) {
      var go = function($copy_v) {
        var $tco_done = false;
        var $tco_result;
        function $tco_loop(v) {
          if (v instanceof IterLeaf) {
            $tco_done = true;
            return done(unit);
          }
          ;
          if (v instanceof IterEmit) {
            $tco_done = true;
            return next2(v.value0, v.value1, v.value2);
          }
          ;
          if (v instanceof IterNode) {
            $copy_v = f(v.value1)(v.value0);
            return;
          }
          ;
          throw new Error("Failed pattern match at Data.Map.Internal (line 918, column 8 - line 924, column 20): " + [v.constructor.name]);
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
};
var singleton7 = function(k) {
  return function(v) {
    return new Node(1, 1, k, v, Leaf.value, Leaf.value);
  };
};
var unsafeBalancedNode = /* @__PURE__ */ function() {
  var height = function(v) {
    if (v instanceof Leaf) {
      return 0;
    }
    ;
    if (v instanceof Node) {
      return v.value0;
    }
    ;
    throw new Error("Failed pattern match at Data.Map.Internal (line 735, column 12 - line 737, column 26): " + [v.constructor.name]);
  };
  var rotateLeft = function(k, v, l, rk, rv, rl, rr) {
    if (rl instanceof Node && rl.value0 > height(rr)) {
      return unsafeNode(rl.value2, rl.value3, unsafeNode(k, v, l, rl.value4), unsafeNode(rk, rv, rl.value5, rr));
    }
    ;
    return unsafeNode(rk, rv, unsafeNode(k, v, l, rl), rr);
  };
  var rotateRight = function(k, v, lk, lv, ll, lr, r) {
    if (lr instanceof Node && height(ll) <= lr.value0) {
      return unsafeNode(lr.value2, lr.value3, unsafeNode(lk, lv, ll, lr.value4), unsafeNode(k, v, lr.value5, r));
    }
    ;
    return unsafeNode(lk, lv, ll, unsafeNode(k, v, lr, r));
  };
  return function(k, v, l, r) {
    if (l instanceof Leaf) {
      if (r instanceof Leaf) {
        return singleton7(k)(v);
      }
      ;
      if (r instanceof Node && r.value0 > 1) {
        return rotateLeft(k, v, l, r.value2, r.value3, r.value4, r.value5);
      }
      ;
      return unsafeNode(k, v, l, r);
    }
    ;
    if (l instanceof Node) {
      if (r instanceof Node) {
        if (r.value0 > (l.value0 + 1 | 0)) {
          return rotateLeft(k, v, l, r.value2, r.value3, r.value4, r.value5);
        }
        ;
        if (l.value0 > (r.value0 + 1 | 0)) {
          return rotateRight(k, v, l.value2, l.value3, l.value4, l.value5, r);
        }
        ;
      }
      ;
      if (r instanceof Leaf && l.value0 > 1) {
        return rotateRight(k, v, l.value2, l.value3, l.value4, l.value5, r);
      }
      ;
      return unsafeNode(k, v, l, r);
    }
    ;
    throw new Error("Failed pattern match at Data.Map.Internal (line 695, column 40 - line 716, column 34): " + [l.constructor.name]);
  };
}();
var $lazy_unsafeSplit = /* @__PURE__ */ $runtime_lazy4("unsafeSplit", "Data.Map.Internal", function() {
  return function(comp, k, m) {
    if (m instanceof Leaf) {
      return new Split(Nothing.value, Leaf.value, Leaf.value);
    }
    ;
    if (m instanceof Node) {
      var v = comp(k)(m.value2);
      if (v instanceof LT) {
        var v1 = $lazy_unsafeSplit(771)(comp, k, m.value4);
        return new Split(v1.value0, v1.value1, unsafeBalancedNode(m.value2, m.value3, v1.value2, m.value5));
      }
      ;
      if (v instanceof GT) {
        var v1 = $lazy_unsafeSplit(774)(comp, k, m.value5);
        return new Split(v1.value0, unsafeBalancedNode(m.value2, m.value3, m.value4, v1.value1), v1.value2);
      }
      ;
      if (v instanceof EQ) {
        return new Split(new Just(m.value3), m.value4, m.value5);
      }
      ;
      throw new Error("Failed pattern match at Data.Map.Internal (line 769, column 5 - line 777, column 30): " + [v.constructor.name]);
    }
    ;
    throw new Error("Failed pattern match at Data.Map.Internal (line 765, column 34 - line 777, column 30): " + [m.constructor.name]);
  };
});
var unsafeSplit = /* @__PURE__ */ $lazy_unsafeSplit(764);
var $lazy_unsafeSplitLast = /* @__PURE__ */ $runtime_lazy4("unsafeSplitLast", "Data.Map.Internal", function() {
  return function(k, v, l, r) {
    if (r instanceof Leaf) {
      return new SplitLast(k, v, l);
    }
    ;
    if (r instanceof Node) {
      var v1 = $lazy_unsafeSplitLast(757)(r.value2, r.value3, r.value4, r.value5);
      return new SplitLast(v1.value0, v1.value1, unsafeBalancedNode(k, v, l, v1.value2));
    }
    ;
    throw new Error("Failed pattern match at Data.Map.Internal (line 754, column 37 - line 758, column 57): " + [r.constructor.name]);
  };
});
var unsafeSplitLast = /* @__PURE__ */ $lazy_unsafeSplitLast(753);
var unsafeJoinNodes = function(v, v1) {
  if (v instanceof Leaf) {
    return v1;
  }
  ;
  if (v instanceof Node) {
    var v2 = unsafeSplitLast(v.value2, v.value3, v.value4, v.value5);
    return unsafeBalancedNode(v2.value0, v2.value1, v2.value2, v1);
  }
  ;
  throw new Error("Failed pattern match at Data.Map.Internal (line 742, column 25 - line 746, column 38): " + [v.constructor.name, v1.constructor.name]);
};
var $lazy_unsafeDifference = /* @__PURE__ */ $runtime_lazy4("unsafeDifference", "Data.Map.Internal", function() {
  return function(comp, l, r) {
    if (l instanceof Leaf) {
      return Leaf.value;
    }
    ;
    if (r instanceof Leaf) {
      return l;
    }
    ;
    if (r instanceof Node) {
      var v = unsafeSplit(comp, r.value2, l);
      var l$prime = $lazy_unsafeDifference(819)(comp, v.value1, r.value4);
      var r$prime = $lazy_unsafeDifference(820)(comp, v.value2, r.value5);
      return unsafeJoinNodes(l$prime, r$prime);
    }
    ;
    throw new Error("Failed pattern match at Data.Map.Internal (line 814, column 39 - line 821, column 33): " + [l.constructor.name, r.constructor.name]);
  };
});
var unsafeDifference = /* @__PURE__ */ $lazy_unsafeDifference(813);
var pop = function(dictOrd) {
  var compare5 = compare(dictOrd);
  return function(k) {
    return function(m) {
      var v = unsafeSplit(compare5, k, m);
      return map12(function(a) {
        return new Tuple(a, unsafeJoinNodes(v.value1, v.value2));
      })(v.value0);
    };
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
        if (v instanceof Node) {
          var v1 = compare5(k)(v.value2);
          if (v1 instanceof LT) {
            $copy_v = v.value4;
            return;
          }
          ;
          if (v1 instanceof GT) {
            $copy_v = v.value5;
            return;
          }
          ;
          if (v1 instanceof EQ) {
            $tco_done = true;
            return new Just(v.value3);
          }
          ;
          throw new Error("Failed pattern match at Data.Map.Internal (line 281, column 7 - line 284, column 22): " + [v1.constructor.name]);
        }
        ;
        throw new Error("Failed pattern match at Data.Map.Internal (line 278, column 8 - line 284, column 22): " + [v.constructor.name]);
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
var iterMapU = function(iter) {
  return function(v) {
    if (v instanceof Leaf) {
      return iter;
    }
    ;
    if (v instanceof Node) {
      if (v.value4 instanceof Leaf) {
        if (v.value5 instanceof Leaf) {
          return new IterEmit(v.value2, v.value3, iter);
        }
        ;
        return new IterEmit(v.value2, v.value3, new IterNode(v.value5, iter));
      }
      ;
      if (v.value5 instanceof Leaf) {
        return new IterEmit(v.value2, v.value3, new IterNode(v.value4, iter));
      }
      ;
      return new IterEmit(v.value2, v.value3, new IterNode(v.value4, new IterNode(v.value5, iter)));
    }
    ;
    throw new Error("Failed pattern match at Data.Map.Internal (line 951, column 17 - line 966, column 56): " + [v.constructor.name]);
  };
};
var stepUnorderedCps = /* @__PURE__ */ stepWith(iterMapU);
var stepUnfoldrUnordered = /* @__PURE__ */ function() {
  var step = function(k, v, next2) {
    return new Just(new Tuple(new Tuple(k, v), next2));
  };
  return stepUnorderedCps(step)(function(v) {
    return Nothing.value;
  });
}();
var toUnfoldableUnordered = function(dictUnfoldable) {
  var $765 = unfoldr(dictUnfoldable)(stepUnfoldrUnordered);
  return function($766) {
    return $765(toMapIter($766));
  };
};
var iterMapL = /* @__PURE__ */ function() {
  var go = function($copy_iter) {
    return function($copy_v) {
      var $tco_var_iter = $copy_iter;
      var $tco_done = false;
      var $tco_result;
      function $tco_loop(iter, v) {
        if (v instanceof Leaf) {
          $tco_done = true;
          return iter;
        }
        ;
        if (v instanceof Node) {
          if (v.value5 instanceof Leaf) {
            $tco_var_iter = new IterEmit(v.value2, v.value3, iter);
            $copy_v = v.value4;
            return;
          }
          ;
          $tco_var_iter = new IterEmit(v.value2, v.value3, new IterNode(v.value5, iter));
          $copy_v = v.value4;
          return;
        }
        ;
        throw new Error("Failed pattern match at Data.Map.Internal (line 929, column 13 - line 936, column 48): " + [v.constructor.name]);
      }
      ;
      while (!$tco_done) {
        $tco_result = $tco_loop($tco_var_iter, $copy_v);
      }
      ;
      return $tco_result;
    };
  };
  return go;
}();
var stepAscCps = /* @__PURE__ */ stepWith(iterMapL);
var stepUnfoldr = /* @__PURE__ */ function() {
  var step = function(k, v, next2) {
    return new Just(new Tuple(new Tuple(k, v), next2));
  };
  return stepAscCps(step)(function(v) {
    return Nothing.value;
  });
}();
var toUnfoldable2 = function(dictUnfoldable) {
  var $767 = unfoldr(dictUnfoldable)(stepUnfoldr);
  return function($768) {
    return $767(toMapIter($768));
  };
};
var toUnfoldable1 = /* @__PURE__ */ toUnfoldable2(unfoldableArray);
var showMap = function(dictShow) {
  var showTuple2 = showTuple(dictShow);
  return function(dictShow1) {
    var show14 = show(showArray(showTuple2(dictShow1)));
    return {
      show: function(as) {
        return "(fromFoldable " + (show14(toUnfoldable1(as)) + ")");
      }
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
var insert2 = function(dictOrd) {
  var compare5 = compare(dictOrd);
  return function(k) {
    return function(v) {
      var go = function(v1) {
        if (v1 instanceof Leaf) {
          return singleton7(k)(v);
        }
        ;
        if (v1 instanceof Node) {
          var v2 = compare5(k)(v1.value2);
          if (v2 instanceof LT) {
            return unsafeBalancedNode(v1.value2, v1.value3, go(v1.value4), v1.value5);
          }
          ;
          if (v2 instanceof GT) {
            return unsafeBalancedNode(v1.value2, v1.value3, v1.value4, go(v1.value5));
          }
          ;
          if (v2 instanceof EQ) {
            return new Node(v1.value0, v1.value1, k, v, v1.value4, v1.value5);
          }
          ;
          throw new Error("Failed pattern match at Data.Map.Internal (line 469, column 7 - line 472, column 35): " + [v2.constructor.name]);
        }
        ;
        throw new Error("Failed pattern match at Data.Map.Internal (line 466, column 8 - line 472, column 35): " + [v1.constructor.name]);
      };
      return go;
    };
  };
};
var functorMap = {
  map: function(f) {
    var go = function(v) {
      if (v instanceof Leaf) {
        return Leaf.value;
      }
      ;
      if (v instanceof Node) {
        return new Node(v.value0, v.value1, v.value2, f(v.value3), go(v.value4), go(v.value5));
      }
      ;
      throw new Error("Failed pattern match at Data.Map.Internal (line 145, column 10 - line 148, column 39): " + [v.constructor.name]);
    };
    return go;
  }
};
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
var difference2 = function(dictOrd) {
  var compare5 = compare(dictOrd);
  return function(m1) {
    return function(m2) {
      return unsafeDifference(compare5, m1, m2);
    };
  };
};
var $$delete2 = function(dictOrd) {
  var compare5 = compare(dictOrd);
  return function(k) {
    var go = function(v) {
      if (v instanceof Leaf) {
        return Leaf.value;
      }
      ;
      if (v instanceof Node) {
        var v1 = compare5(k)(v.value2);
        if (v1 instanceof LT) {
          return unsafeBalancedNode(v.value2, v.value3, go(v.value4), v.value5);
        }
        ;
        if (v1 instanceof GT) {
          return unsafeBalancedNode(v.value2, v.value3, v.value4, go(v.value5));
        }
        ;
        if (v1 instanceof EQ) {
          return unsafeJoinNodes(v.value4, v.value5);
        }
        ;
        throw new Error("Failed pattern match at Data.Map.Internal (line 496, column 7 - line 499, column 43): " + [v1.constructor.name]);
      }
      ;
      throw new Error("Failed pattern match at Data.Map.Internal (line 493, column 8 - line 499, column 43): " + [v.constructor.name]);
    };
    return go;
  };
};

// output/Data.Set/index.js
var coerce3 = /* @__PURE__ */ coerce();
var isEmpty2 = /* @__PURE__ */ coerce3(isEmpty);
var insert3 = function(dictOrd) {
  var insert1 = insert2(dictOrd);
  return function(a) {
    return function(v) {
      return insert1(a)(unit)(v);
    };
  };
};
var empty3 = empty2;
var fromFoldable4 = function(dictFoldable) {
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
var difference3 = function(dictOrd) {
  return coerce3(difference2(dictOrd));
};
var subset = function(dictOrd) {
  var difference1 = difference3(dictOrd);
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

// output/Data.DDF.Csv.CsvFile/index.js
var applicativeV2 = /* @__PURE__ */ applicativeV(semigroupArray);
var pure10 = /* @__PURE__ */ pure(applicativeV2);
var fromFoldable5 = /* @__PURE__ */ fromFoldable(foldableNonEmptyArray);
var elem5 = /* @__PURE__ */ elem2(eqString);
var show1 = /* @__PURE__ */ show(/* @__PURE__ */ showArray(showString));
var join2 = /* @__PURE__ */ join(bindMaybe);
var map13 = /* @__PURE__ */ map(functorMaybe);
var map14 = /* @__PURE__ */ map(functorNonEmptyArray);
var sequence2 = /* @__PURE__ */ sequence(traversableNonEmptyArray)(applicativeV2);
var show32 = /* @__PURE__ */ show(/* @__PURE__ */ showArray(showNonEmptyString));
var apply3 = /* @__PURE__ */ apply(/* @__PURE__ */ applyV(semigroupArray));
var map22 = /* @__PURE__ */ map(functorV);
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
var parseCsvRowRec = function(headers) {
  return function(v) {
    var $76 = length2(headers) !== length(v.value1);
    if ($76) {
      return invalid([new InvalidCSV("bad csv row")]);
    }
    ;
    return pure10(new Tuple(headers, v.value1));
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
    var actual = fromFoldable5(csvcontent.headers);
    var res = foldr2(function(x) {
      return function(acc) {
        return xor(elem5(x)(actual))(acc);
      };
    })(false)(expected);
    if (res) {
      return pure10(csvcontent);
    }
    ;
    return invalid([new InvalidCSV("file MUST have one and only one of follwoing field: " + show1(expected))]);
  };
};
var notEmptyCsv = function(input) {
  var v = join2(map13(fromArray)(input.headers));
  if (v instanceof Nothing) {
    return invalid([new InvalidCSV("no headers")]);
  }
  ;
  if (v instanceof Just) {
    if (input.rows instanceof Nothing) {
      return pure10({
        headers: v.value0,
        rows: []
      });
    }
    ;
    if (input.rows instanceof Just) {
      return pure10({
        headers: v.value0,
        rows: input.rows.value0
      });
    }
    ;
    throw new Error("Failed pattern match at Data.DDF.Csv.CsvFile (line 95, column 14 - line 97, column 48): " + [input.rows.constructor.name]);
  }
  ;
  throw new Error("Failed pattern match at Data.DDF.Csv.CsvFile (line 93, column 21 - line 97, column 48): " + [v.constructor.name]);
};
var mkCsvFile = function(fi) {
  return function(csv) {
    return new CsvFile({
      fileInfo: fi,
      csvContent: csv
    });
  };
};
var hasCols = function(dictFoldable) {
  var fromFoldable14 = fromFoldable4(dictFoldable);
  return function(dictOrd) {
    var fromFoldable23 = fromFoldable14(dictOrd);
    var subset2 = subset(dictOrd);
    return function(dictEq) {
      return function(expected) {
        return function(actual) {
          var expectedSet = fromFoldable23(expected);
          var actualSet = fromFoldable23(actual);
          return subset2(expectedSet)(actualSet);
        };
      };
    };
  };
};
var hasCols1 = /* @__PURE__ */ hasCols(foldableArray)(ordString)(eqString);
var headersExists = function(expected) {
  return function(csvcontent) {
    var actual = fromFoldable5(csvcontent.headers);
    var $87 = hasCols1(expected)(actual);
    if ($87) {
      return pure10(csvcontent);
    }
    ;
    return invalid([new InvalidCSV("file MUST have following field: " + show1(expected))]);
  };
};
var getFileInfo = function(v) {
  return v.value0.fileInfo;
};
var getCsvContent = function(v) {
  return v.value0.csvContent;
};
var colsAreValidIds = function(input) {
  var res = sequence2(map14(parseHeader)(input.headers));
  var v = toEither(res);
  if (v instanceof Right) {
    var headerValues = map14(headerVal)(v.value0);
    var is_headers = filter2(function() {
      var $110 = startsWith("is--");
      return function($111) {
        return $110(toString($111));
      };
    }())(headerValues);
    if (is_headers.length === 0) {
      return pure10({
        rows: input.rows,
        headers: v.value0
      });
    }
    ;
    return invalid([new InvalidCSV("these headers are not valid Ids: " + show32(is_headers))]);
  }
  ;
  if (v instanceof Left) {
    return invalid(v.value0);
  }
  ;
  throw new Error("Failed pattern match at Data.DDF.Csv.CsvFile (line 106, column 5 - line 116, column 32): " + [v.constructor.name]);
};
var colsAreValidHeaders = function(input) {
  var res = sequence2(map14(parseHeader)(input.headers));
  var v = toEither(res);
  if (v instanceof Right) {
    return pure10({
      rows: input.rows,
      headers: v.value0
    });
  }
  ;
  if (v instanceof Left) {
    return invalid(v.value0);
  }
  ;
  throw new Error("Failed pattern match at Data.DDF.Csv.CsvFile (line 125, column 5 - line 127, column 32): " + [v.constructor.name]);
};
var parseCsvFile = function(v) {
  var v1 = collection(v.fileInfo);
  if (v1 instanceof Concepts) {
    var required = ["concept", "concept_type"];
    var vc = andThen(andThen(notEmptyCsv(v.csvContent))(headersExists(required)))(colsAreValidIds);
    return apply3(map22(mkCsvFile)(pure10(v.fileInfo)))(vc);
  }
  ;
  if (v1 instanceof Entities) {
    var required = function() {
      if (v1.value0.set instanceof Just) {
        return [toString(v1.value0.set.value0), toString(v1.value0.domain)];
      }
      ;
      if (v1.value0.set instanceof Nothing) {
        return [toString(v1.value0.domain)];
      }
      ;
      throw new Error("Failed pattern match at Data.DDF.Csv.CsvFile (line 180, column 20 - line 182, column 41): " + [v1.value0.set.constructor.name]);
    }();
    var vc = andThen(andThen(notEmptyCsv(v.csvContent))(oneOfHeaderExists(required)))(colsAreValidHeaders);
    return apply3(map22(mkCsvFile)(pure10(v.fileInfo)))(vc);
  }
  ;
  return invalid([NotImplemented.value]);
};

// output/Data.DDF.Concept/index.js
var show6 = /* @__PURE__ */ show(showId2);
var map15 = /* @__PURE__ */ map(functorV);
var unwrap2 = /* @__PURE__ */ unwrap();
var pure11 = /* @__PURE__ */ pure(/* @__PURE__ */ applicativeV(semigroupArray));
var lookup2 = /* @__PURE__ */ lookup(ordId);
var map16 = /* @__PURE__ */ map(functorNonEmptyArray);
var coerce4 = /* @__PURE__ */ coerce();
var fromFoldable6 = /* @__PURE__ */ fromFoldable3(ordId)(foldableNonEmptyArray);
var $$delete3 = /* @__PURE__ */ $$delete2(ordId);
var apply4 = /* @__PURE__ */ apply(/* @__PURE__ */ applyV(semigroupArray));
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
var showConceptType = {
  show: function(v) {
    if (v instanceof StringC) {
      return "string";
    }
    ;
    if (v instanceof MeasureC) {
      return "measure";
    }
    ;
    if (v instanceof BooleanC) {
      return "boolean";
    }
    ;
    if (v instanceof IntervalC) {
      return "interval";
    }
    ;
    if (v instanceof EntityDomainC) {
      return "entity_domain";
    }
    ;
    if (v instanceof EntitySetC) {
      return "enitty_set";
    }
    ;
    if (v instanceof RoleC) {
      return "role";
    }
    ;
    if (v instanceof CompositeC) {
      return "composite";
    }
    ;
    if (v instanceof TimeC) {
      return "time";
    }
    ;
    if (v instanceof CustomC) {
      return show6(v.value0);
    }
    ;
    throw new Error("Failed pattern match at Data.DDF.Concept (line 61, column 1 - line 71, column 28): " + [v.constructor.name]);
  }
};
var show12 = /* @__PURE__ */ show(/* @__PURE__ */ showRecord()()(/* @__PURE__ */ showRecordFieldsCons({
  reflectSymbol: function() {
    return "_info";
  }
})(/* @__PURE__ */ showRecordFieldsCons({
  reflectSymbol: function() {
    return "conceptId";
  }
})(/* @__PURE__ */ showRecordFieldsCons({
  reflectSymbol: function() {
    return "conceptType";
  }
})(/* @__PURE__ */ showRecordFieldsConsNil({
  reflectSymbol: function() {
    return "props";
  }
})(/* @__PURE__ */ showMap(showId2)(showString)))(showConceptType))(showId2))(/* @__PURE__ */ showMap(showString)(showString))));
var showConcept = {
  show: function(v) {
    return show12(v.value0);
  }
};
var parseConceptType = function(x) {
  return map15(function(v) {
    var res = function() {
      var v1 = toString(unwrap2(v));
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
    var $65 = $$null(input);
    if ($65) {
      return invalid([new Issue("field " + (field + " MUST not be empty"))]);
    }
    ;
    return pure11(input);
  };
};
var hasFieldAndGetValue = function(field) {
  return function(input) {
    var v = lookup2(unsafeCreate(field))(input);
    if (v instanceof Nothing) {
      return invalid([new Issue("field " + (field + " MUST exist for concept"))]);
    }
    ;
    if (v instanceof Just) {
      return pure11(v.value0);
    }
    ;
    throw new Error("Failed pattern match at Data.DDF.Concept (line 124, column 35 - line 126, column 19): " + [v.constructor.name]);
  };
};
var getId = function(v) {
  return v.value0.conceptId;
};
var conceptInputFromCsvRec = function(v) {
  var headersL = map16(coerce4)(v.value0);
  var rowAsMap = function(r) {
    return fromFoldable6(zip2(headersL)(r));
  };
  return rowAsMap(v.value1);
};
var concept = function(conceptId) {
  return function(conceptType) {
    return function(props) {
      return new Concept({
        conceptId,
        conceptType,
        props,
        "_info": empty2
      });
    };
  };
};
var checkMandatoryField = function(v) {
  if (v.value0.conceptType instanceof EntitySetC) {
    return map15(function(v1) {
      return v;
    })(andThen(hasFieldAndGetValue("domain")(v.value0.props))(nonEmptyField("domain")));
  }
  ;
  return pure11(v);
};
var parseConcept = function(input) {
  var props = $$delete3(unsafeCreate("concept_type"))($$delete3(unsafeCreate("concept"))(input));
  var conceptType = andThen(andThen(hasFieldAndGetValue("concept_type")(input))(nonEmptyField("concept_type")))(parseConceptType);
  var conceptId = andThen(andThen(hasFieldAndGetValue("concept")(input))(nonEmptyField("concept")))(parseId);
  return andThen(apply4(apply4(map15(concept)(conceptId))(conceptType))(pure11(props)))(checkMandatoryField);
};

// output/Data.DDF.Atoms.Boolean/index.js
var pure14 = /* @__PURE__ */ pure(/* @__PURE__ */ applicativeV(semigroupArray));
var parseBoolean = function(x) {
  if (x === "TRUE") {
    return pure14(true);
  }
  ;
  if (x === "FALSE") {
    return pure14(false);
  }
  ;
  if (otherwise) {
    return invalid([new InvalidValue(x, "not a boolean value")]);
  }
  ;
  throw new Error("Failed pattern match at Data.DDF.Atoms.Boolean (line 8, column 1 - line 8, column 43): " + [x.constructor.name]);
};

// output/Data.DDF.Entity/index.js
var applicativeV3 = /* @__PURE__ */ applicativeV(semigroupArray);
var pure15 = /* @__PURE__ */ pure(applicativeV3);
var coerce5 = /* @__PURE__ */ coerce();
var toUnfoldableUnordered2 = /* @__PURE__ */ toUnfoldableUnordered(unfoldableList);
var map17 = /* @__PURE__ */ map(functorList);
var show7 = /* @__PURE__ */ show(/* @__PURE__ */ showRecord()()(/* @__PURE__ */ showRecordFieldsCons({
  reflectSymbol: function() {
    return "_info";
  }
})(/* @__PURE__ */ showRecordFieldsCons({
  reflectSymbol: function() {
    return "entityDomain";
  }
})(/* @__PURE__ */ showRecordFieldsCons({
  reflectSymbol: function() {
    return "entityId";
  }
})(/* @__PURE__ */ showRecordFieldsCons({
  reflectSymbol: function() {
    return "entitySets";
  }
})(/* @__PURE__ */ showRecordFieldsConsNil({
  reflectSymbol: function() {
    return "props";
  }
})(/* @__PURE__ */ showMap(showId2)(showString)))(/* @__PURE__ */ showList(showId2)))(showId2))(showId2))(/* @__PURE__ */ showMap(showString)(showString))));
var unwrap3 = /* @__PURE__ */ unwrap();
var sequence3 = /* @__PURE__ */ sequence(traversableList)(applicativeV3);
var fromFoldable7 = /* @__PURE__ */ fromFoldable3(ordHeader)(foldableNonEmptyArray);
var elem6 = /* @__PURE__ */ elem3(eqHeader);
var fromJust5 = /* @__PURE__ */ fromJust();
var pop2 = /* @__PURE__ */ pop(ordHeader);
var fromFoldable12 = /* @__PURE__ */ fromFoldable3(ordId)(foldableList);
var apply5 = /* @__PURE__ */ apply(/* @__PURE__ */ applyV(semigroupArray));
var map18 = /* @__PURE__ */ map(functorV);
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
var validEntityDomainId = function($119) {
  return pure15(coerce5($119));
};
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
    throw new Error("Failed pattern match at Data.DDF.Entity (line 94, column 9 - line 96, column 25): " + [v1.constructor.name]);
  };
  var isHeaderToIdentifier = function(header2) {
    return unsafeCreate(drop3(4)(toString(headerVal(header2))));
  };
  var headerToIdentifier = function(header2) {
    return unsafeCreate(toString(headerVal(header2)));
  };
  var v = partition2(isIsHeader)(toUnfoldableUnordered2(props));
  var yes_ = map17(function(v1) {
    return new Tuple(isHeaderToIdentifier(v1.value0), v1.value1);
  })(v.yes);
  var no_ = map17(function(v1) {
    return new Tuple(headerToIdentifier(v1.value0), v1.value1);
  })(v.no);
  return new Tuple(yes_, no_);
};
var showEntity = {
  show: function(v) {
    return show7(v.value0);
  }
};
var getId2 = function(v) {
  return v.value0.entityId;
};
var getEntitySets = function(lst) {
  var collectTrueItem = function(v) {
    var headerStr = toString(unwrap3(v.value0));
    var boolValue = parseBoolean(v.value1);
    var $86 = isValid(boolValue);
    if ($86) {
      return pure15(v.value0);
    }
    ;
    return invalid([new Issue("invalid boolean value for " + (headerStr + (": " + v.value1)))]);
  };
  var entitySetWithTureValue = sequence3(map17(collectTrueItem)(lst));
  return entitySetWithTureValue;
};
var getDomain = function(v) {
  return v.value0.entityDomain;
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
        var $100 = elem6(v.set.value0)(v1.value0);
        if ($100) {
          return v.set.value0;
        }
        ;
        return v.domain;
      }
      ;
      throw new Error("Failed pattern match at Data.DDF.Entity (line 151, column 17 - line 157, column 24): " + [v.set.constructor.name]);
    }();
    var v2 = fromJust5(pop2(entityCol)(propsMap));
    return pure15({
      entityId: v2.value0,
      entityDomain: v.domain,
      entitySet: v.set,
      props: v2.value1,
      "_info": empty2
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
          props,
          "_info": empty2
        });
      };
    };
  };
};
var parseEntity = function(v) {
  var $110 = $$null(v.entityId);
  if ($110) {
    return invalid([new Issue("entity MUST have an entity id")]);
  }
  ;
  var validEid = validEntityId(v.entityId);
  var validEdomain = validEntityDomainId(v.entityDomain);
  var v1 = splitEntAndProps(v.props);
  var validEsets = getEntitySets(v1.value0);
  var propsMinusIsHeaders = fromFoldable12(v1.value1);
  return apply5(apply5(apply5(map18(entity)(validEid))(validEdomain))(validEsets))(pure15(propsMinusIsHeaders));
};

// output/Control.Monad.State.Trans/index.js
var runStateT = function(v) {
  return v;
};
var monadTransStateT = {
  lift: function(dictMonad) {
    var bind9 = bind(dictMonad.Bind1());
    var pure20 = pure(dictMonad.Applicative0());
    return function(m) {
      return function(s) {
        return bind9(m)(function(x) {
          return pure20(new Tuple(x, s));
        });
      };
    };
  }
};
var lift4 = /* @__PURE__ */ lift(monadTransStateT);
var functorStateT = function(dictFunctor) {
  var map25 = map(dictFunctor);
  return {
    map: function(f) {
      return function(v) {
        return function(s) {
          return map25(function(v1) {
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
  var bind9 = bind(dictMonad.Bind1());
  return {
    bind: function(v) {
      return function(f) {
        return function(s) {
          return bind9(v(s))(function(v1) {
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
  var pure20 = pure(dictMonad.Applicative0());
  return {
    pure: function(a) {
      return function(s) {
        return pure20(new Tuple(a, s));
      };
    },
    Apply0: function() {
      return applyStateT(dictMonad);
    }
  };
};
var monadEffectState = function(dictMonadEffect) {
  var Monad0 = dictMonadEffect.Monad0();
  var monadStateT1 = monadStateT(Monad0);
  return {
    liftEffect: function() {
      var $197 = lift4(Monad0);
      var $198 = liftEffect(dictMonadEffect);
      return function($199) {
        return $197($198($199));
      };
    }(),
    Monad0: function() {
      return monadStateT1;
    }
  };
};
var monadStateStateT = function(dictMonad) {
  var pure20 = pure(dictMonad.Applicative0());
  var monadStateT1 = monadStateT(dictMonad);
  return {
    state: function(f) {
      return function($200) {
        return pure20(f($200));
      };
    },
    Monad0: function() {
      return monadStateT1;
    }
  };
};

// output/Effect.Aff.Class/index.js
var monadAffAff = {
  liftAff: /* @__PURE__ */ identity(categoryFn),
  MonadEffect0: function() {
    return monadEffectAff;
  }
};
var liftAff = function(dict) {
  return dict.liftAff;
};

// output/Effect.Console/foreign.js
var log2 = function(s) {
  return function() {
    console.log(s);
  };
};

// output/Effect.Console/index.js
var logShow = function(dictShow) {
  var show11 = show(dictShow);
  return function(a) {
    return log2(show11(a));
  };
};

// output/Effect.Class.Console/index.js
var log3 = function(dictMonadEffect) {
  var $67 = liftEffect(dictMonadEffect);
  return function($68) {
    return $67(log2($68));
  };
};

// output/Node.FS.Async/foreign.js
import {
  access,
  copyFile,
  mkdtemp,
  rename,
  truncate,
  chown,
  chmod,
  stat,
  lstat,
  link,
  symlink,
  readlink,
  realpath,
  unlink,
  rmdir,
  rm,
  mkdir,
  readdir,
  utimes,
  readFile,
  writeFile,
  appendFile,
  open,
  read as read3,
  write as write3,
  close
} from "node:fs";

// output/Data.Nullable/foreign.js
function nullable(a, r, f) {
  return a == null ? r : f(a);
}

// output/Data.Nullable/index.js
var toMaybe = function(n) {
  return nullable(n, Nothing.value, Just.create);
};

// output/Node.FS.Constants/foreign.js
import { constants } from "node:fs";
var f_OK = constants.F_OK;
var r_OK = constants.R_OK;
var w_OK = constants.W_OK;
var x_OK = constants.X_OK;
var copyFile_EXCL = constants.COPYFILE_EXCL;
var copyFile_FICLONE = constants.COPYFILE_FICLONE;
var copyFile_FICLONE_FORCE = constants.COPYFILE_FICLONE_FORCE;

// output/Node.FS.Async/index.js
var handleCallback = function(cb) {
  return function(err, a) {
    var v = toMaybe(err);
    if (v instanceof Nothing) {
      return cb(new Right(a))();
    }
    ;
    if (v instanceof Just) {
      return cb(new Left(v.value0))();
    }
    ;
    throw new Error("Failed pattern match at Node.FS.Async (line 66, column 43 - line 68, column 30): " + [v.constructor.name]);
  };
};
var readdir2 = function(file) {
  return function(cb) {
    return function() {
      return readdir(file, handleCallback(cb));
    };
  };
};
var stat2 = function(file) {
  return function(cb) {
    return function() {
      return stat(file, handleCallback(cb));
    };
  };
};

// output/Node.FS.Aff/index.js
var voidLeft2 = /* @__PURE__ */ voidLeft(functorEffect);
var toAff = function(p) {
  return makeAff(function(k) {
    return voidLeft2(p(k))(nonCanceler);
  });
};
var toAff1 = function(f) {
  return function(a) {
    return toAff(f(a));
  };
};
var stat3 = /* @__PURE__ */ toAff1(stat2);
var readdir3 = /* @__PURE__ */ toAff1(readdir2);

// output/Node.FS.Stats/foreign.js
var isDirectoryImpl = (s) => s.isDirectory();
var isFileImpl = (s) => s.isFile();

// output/Foreign/foreign.js
var isArray = Array.isArray || function(value) {
  return Object.prototype.toString.call(value) === "[object Array]";
};

// output/Node.FS.Stats/index.js
var isFile = function(s) {
  return isFileImpl(s);
};
var isDirectory = function(s) {
  return isDirectoryImpl(s);
};

// output/Pipes.Internal/index.js
var bind1 = /* @__PURE__ */ bind(bindAff);
var pure16 = /* @__PURE__ */ pure(applicativeAff);
var Request = /* @__PURE__ */ function() {
  function Request2(value0, value1) {
    this.value0 = value0;
    this.value1 = value1;
  }
  ;
  Request2.create = function(value0) {
    return function(value1) {
      return new Request2(value0, value1);
    };
  };
  return Request2;
}();
var Respond = /* @__PURE__ */ function() {
  function Respond2(value0, value1) {
    this.value0 = value0;
    this.value1 = value1;
  }
  ;
  Respond2.create = function(value0) {
    return function(value1) {
      return new Respond2(value0, value1);
    };
  };
  return Respond2;
}();
var M = /* @__PURE__ */ function() {
  function M2(value0) {
    this.value0 = value0;
  }
  ;
  M2.create = function(value0) {
    return new M2(value0);
  };
  return M2;
}();
var Pure = /* @__PURE__ */ function() {
  function Pure2(value0) {
    this.value0 = value0;
  }
  ;
  Pure2.create = function(value0) {
    return new Pure2(value0);
  };
  return Pure2;
}();
var monadTransProxy = {
  lift: function(dictMonad) {
    var map25 = map(dictMonad.Bind1().Apply0().Functor0());
    return function(m) {
      return new M(map25(Pure.create)(m));
    };
  }
};
var functorProxy2 = function(dictMonad) {
  var bind22 = bind(dictMonad.Bind1());
  var pure22 = pure(dictMonad.Applicative0());
  return {
    map: function(f) {
      return function(p0) {
        var go = function(p) {
          if (p instanceof Request) {
            return new Request(p.value0, function(x) {
              return go(p.value1(x));
            });
          }
          ;
          if (p instanceof Respond) {
            return new Respond(p.value0, function(x) {
              return go(p.value1(x));
            });
          }
          ;
          if (p instanceof M) {
            return new M(bind22(p.value0)(function(v) {
              return pure22(go(v));
            }));
          }
          ;
          if (p instanceof Pure) {
            return new Pure(f(p.value0));
          }
          ;
          throw new Error("Failed pattern match at Pipes.Internal (line 28, column 12 - line 32, column 41): " + [p.constructor.name]);
        };
        return go(p0);
      };
    }
  };
};
var closed = function($copy_v) {
  var $tco_result;
  function $tco_loop(v) {
    $copy_v = v;
    return;
  }
  ;
  while (true) {
    $tco_result = $tco_loop($copy_v);
  }
  ;
  return $tco_result;
};
var applyProxy2 = function(dictMonad) {
  var bind22 = bind(dictMonad.Bind1());
  var pure22 = pure(dictMonad.Applicative0());
  var functorProxy1 = functorProxy2(dictMonad);
  var map25 = map(functorProxy1);
  return {
    apply: function(pf0) {
      return function(px) {
        var go = function(pf) {
          if (pf instanceof Request) {
            return new Request(pf.value0, function(x) {
              return go(pf.value1(x));
            });
          }
          ;
          if (pf instanceof Respond) {
            return new Respond(pf.value0, function(x) {
              return go(pf.value1(x));
            });
          }
          ;
          if (pf instanceof M) {
            return new M(bind22(pf.value0)(function(v) {
              return pure22(go(v));
            }));
          }
          ;
          if (pf instanceof Pure) {
            return map25(pf.value0)(px);
          }
          ;
          throw new Error("Failed pattern match at Pipes.Internal (line 36, column 13 - line 40, column 33): " + [pf.constructor.name]);
        };
        return go(pf0);
      };
    },
    Functor0: function() {
      return functorProxy1;
    }
  };
};
var bindProxy2 = function(dictMonad) {
  var bind22 = bind(dictMonad.Bind1());
  var pure22 = pure(dictMonad.Applicative0());
  var applyProxy1 = applyProxy2(dictMonad);
  return {
    bind: function(p0) {
      return function(f) {
        var go = function(p) {
          if (p instanceof Request) {
            return new Request(p.value0, function(x) {
              return go(p.value1(x));
            });
          }
          ;
          if (p instanceof Respond) {
            return new Respond(p.value0, function(x) {
              return go(p.value1(x));
            });
          }
          ;
          if (p instanceof M) {
            return new M(bind22(p.value0)(function(v) {
              return pure22(go(v));
            }));
          }
          ;
          if (p instanceof Pure) {
            return f(p.value0);
          }
          ;
          throw new Error("Failed pattern match at Pipes.Internal (line 47, column 12 - line 51, column 28): " + [p.constructor.name]);
        };
        return go(p0);
      };
    },
    Apply0: function() {
      return applyProxy1;
    }
  };
};
var applicativeProxy2 = function(dictMonad) {
  var applyProxy1 = applyProxy2(dictMonad);
  return {
    pure: Pure.create,
    Apply0: function() {
      return applyProxy1;
    }
  };
};
var monadProxy = function(dictMonad) {
  var applicativeProxy1 = applicativeProxy2(dictMonad);
  var bindProxy1 = bindProxy2(dictMonad);
  return {
    Applicative0: function() {
      return applicativeProxy1;
    },
    Bind1: function() {
      return bindProxy1;
    }
  };
};
var proxyMonadEffect = function(dictMonadEffect) {
  var liftEffect3 = liftEffect(dictMonadEffect);
  var monadProxy1 = monadProxy(dictMonadEffect.Monad0());
  return {
    liftEffect: function(m) {
      return new M(liftEffect3(function __do2() {
        var r = m();
        return new Pure(r);
      }));
    },
    Monad0: function() {
      return monadProxy1;
    }
  };
};
var proxyMonadAff = function(dictMonadAff) {
  var liftAff3 = liftAff(dictMonadAff);
  var proxyMonadEffect1 = proxyMonadEffect(dictMonadAff.MonadEffect0());
  return {
    liftAff: function(m) {
      return new M(liftAff3(bind1(m)(function(r) {
        return pure16(new Pure(r));
      })));
    },
    MonadEffect0: function() {
      return proxyMonadEffect1;
    }
  };
};

// output/Pipes.Core/index.js
var respond = function(dictMonad) {
  return function(a) {
    return new Respond(a, Pure.create);
  };
};
var request = function(dictMonad) {
  return function(a$prime) {
    return new Request(a$prime, Pure.create);
  };
};
var pull = function(dictMonad) {
  var go = function(a$prime) {
    return new Request(a$prime, function(a) {
      return new Respond(a, go);
    });
  };
  return go;
};
var composeResponse = function(dictMonad) {
  var bind9 = bind(bindProxy2(dictMonad));
  var map25 = map(dictMonad.Bind1().Apply0().Functor0());
  return function(p0) {
    return function(fb) {
      var go = function(p) {
        if (p instanceof Request) {
          return new Request(p.value0, function($126) {
            return go(p.value1($126));
          });
        }
        ;
        if (p instanceof Respond) {
          return bind9(fb(p.value0))(function($127) {
            return go(p.value1($127));
          });
        }
        ;
        if (p instanceof M) {
          return new M(map25(go)(p.value0));
        }
        ;
        if (p instanceof Pure) {
          return new Pure(p.value0);
        }
        ;
        throw new Error("Failed pattern match at Pipes.Core (line 137, column 12 - line 141, column 33): " + [p.constructor.name]);
      };
      return go(p0);
    };
  };
};
var composePush$prime = function(dictMonad) {
  var bind9 = bind(dictMonad.Bind1());
  var pure20 = pure(dictMonad.Applicative0());
  return function(p) {
    return function(fb) {
      if (p instanceof Request) {
        return new Request(p.value0, function(a) {
          return composePush$prime(dictMonad)(p.value1(a))(fb);
        });
      }
      ;
      if (p instanceof Respond) {
        return composePull$prime(dictMonad)(p.value1)(fb(p.value0));
      }
      ;
      if (p instanceof M) {
        return new M(bind9(p.value0)(function(p$prime) {
          return pure20(composePush$prime(dictMonad)(p$prime)(fb));
        }));
      }
      ;
      if (p instanceof Pure) {
        return new Pure(p.value0);
      }
      ;
      throw new Error("Failed pattern match at Pipes.Core (line 222, column 21 - line 226, column 29): " + [p.constructor.name]);
    };
  };
};
var composePull$prime = function(dictMonad) {
  var map25 = map(dictMonad.Bind1().Apply0().Functor0());
  return function(fb$prime) {
    return function(p) {
      if (p instanceof Request) {
        return composePush$prime(dictMonad)(fb$prime(p.value0))(p.value1);
      }
      ;
      if (p instanceof Respond) {
        return new Respond(p.value0, function($130) {
          return function(v) {
            return composePull$prime(dictMonad)(fb$prime)(v);
          }(p.value1($130));
        });
      }
      ;
      if (p instanceof M) {
        return new M(map25(function(v) {
          return composePull$prime(dictMonad)(fb$prime)(v);
        })(p.value0));
      }
      ;
      if (p instanceof Pure) {
        return new Pure(p.value0);
      }
      ;
      throw new Error("Failed pattern match at Pipes.Core (line 197, column 22 - line 201, column 29): " + [p.constructor.name]);
    };
  };
};

// output/Pipes/index.js
var $$yield = function(dictMonad) {
  return respond(dictMonad);
};
var next = function(dictMonad) {
  var pure20 = pure(dictMonad.Applicative0());
  var bind9 = bind(dictMonad.Bind1());
  var go = function(p) {
    if (p instanceof Request) {
      return closed(p.value0);
    }
    ;
    if (p instanceof Respond) {
      return pure20(new Right(new Tuple(p.value0, p.value1(unit))));
    }
    ;
    if (p instanceof M) {
      return bind9(p.value0)(go);
    }
    ;
    if (p instanceof Pure) {
      return pure20(new Left(p.value0));
    }
    ;
    throw new Error("Failed pattern match at Pipes (line 96, column 12 - line 100, column 38): " + [p.constructor.name]);
  };
  return go;
};
var $$for = function(dictMonad) {
  return composeResponse(dictMonad);
};
var each = function(dictMonad) {
  var applySecond3 = applySecond(applyProxy2(dictMonad));
  var yield1 = $$yield(dictMonad);
  var pure20 = pure(applicativeProxy2(dictMonad));
  return function(dictFoldable) {
    var foldr4 = foldr(dictFoldable);
    return function(xs) {
      return foldr4(function(a) {
        return function(p) {
          return applySecond3(yield1(a))(p);
        };
      })(pure20(unit))(xs);
    };
  };
};
var composePipes = function(dictMonad) {
  var composePull$prime2 = composePull$prime(dictMonad);
  return function(p1) {
    return function(p2) {
      return composePull$prime2($$const(p1))(p2);
    };
  };
};
var cat = function(dictMonad) {
  return pull(dictMonad)(unit);
};
var $$await = function(dictMonad) {
  return request(dictMonad)(unit);
};

// output/Pipes.Prelude/index.js
var lift5 = /* @__PURE__ */ lift(monadTransProxy);
var mapM = function(dictMonad) {
  var $$for4 = $$for(dictMonad);
  var cat2 = cat(dictMonad);
  var bind9 = bind(bindProxy2(dictMonad));
  var lift1 = lift5(dictMonad);
  var $$yield4 = $$yield(dictMonad);
  return function(f) {
    return $$for4(cat2)(function(a) {
      return bind9(lift1(f(a)))(function(b) {
        return $$yield4(b);
      });
    });
  };
};
var map19 = function(dictMonad) {
  var $$for4 = $$for(dictMonad);
  var cat2 = cat(dictMonad);
  var $$yield4 = $$yield(dictMonad);
  return function(f) {
    return $$for4(cat2)(function(a) {
      return $$yield4(f(a));
    });
  };
};
var head4 = function(dictMonad) {
  var bind9 = bind(dictMonad.Bind1());
  var next2 = next(dictMonad);
  var pure20 = pure(dictMonad.Applicative0());
  return function(p) {
    return bind9(next2(p))(function(x) {
      return pure20(function() {
        if (x instanceof Left) {
          return Nothing.value;
        }
        ;
        if (x instanceof Right) {
          return new Just(x.value0.value0);
        }
        ;
        throw new Error("Failed pattern match at Pipes.Prelude (line 295, column 12 - line 297, column 36): " + [x.constructor.name]);
      }());
    });
  };
};
var fold2 = function(dictMonad) {
  var bind9 = bind(dictMonad.Bind1());
  var pure20 = pure(dictMonad.Applicative0());
  return function(step) {
    return function(begin) {
      return function(done) {
        return function(p0) {
          var go = function(p) {
            return function(x) {
              if (p instanceof Request) {
                return closed(p.value0);
              }
              ;
              if (p instanceof Respond) {
                return go(p.value1(unit))(step(x)(p.value0));
              }
              ;
              if (p instanceof M) {
                return bind9(p.value0)(function(p$prime) {
                  return go(p$prime)(x);
                });
              }
              ;
              if (p instanceof Pure) {
                return pure20(done(x));
              }
              ;
              throw new Error("Failed pattern match at Pipes.Prelude (line 202, column 14 - line 206, column 39): " + [p.constructor.name]);
            };
          };
          return go(p0)(begin);
        };
      };
    };
  };
};
var toListM = function(dictMonad) {
  var step = function(x) {
    return function(a) {
      return function($292) {
        return x(function(v) {
          return new Cons(a, v);
        }($292));
      };
    };
  };
  var done = function(x) {
    return x(Nil.value);
  };
  return fold2(dictMonad)(step)(identity(categoryFn))(done);
};
var filter4 = function(dictMonad) {
  var $$for4 = $$for(dictMonad);
  var cat2 = cat(dictMonad);
  var when3 = when(applicativeProxy2(dictMonad));
  var $$yield4 = $$yield(dictMonad);
  return function(predicate) {
    return $$for4(cat2)(function(a) {
      return when3(predicate(a))($$yield4(a));
    });
  };
};
var concat4 = function(dictMonad) {
  var $$for4 = $$for(dictMonad);
  var cat2 = cat(dictMonad);
  var each4 = each(dictMonad);
  return function(dictFoldable) {
    return $$for4(cat2)(each4(dictFoldable));
  };
};

// output/Utils/index.js
var bindProxy3 = /* @__PURE__ */ bindProxy2(monadAff);
var bind7 = /* @__PURE__ */ bind(bindProxy3);
var liftAff2 = /* @__PURE__ */ liftAff(/* @__PURE__ */ proxyMonadAff(monadAffAff));
var each2 = /* @__PURE__ */ each(monadAff)(foldableArray);
var filter5 = /* @__PURE__ */ filter4(monadAff);
var elem7 = /* @__PURE__ */ elem2(eqString);
var composePipes2 = /* @__PURE__ */ composePipes(monadAff);
var map20 = /* @__PURE__ */ map19(monadAff);
var $$for2 = /* @__PURE__ */ $$for(monadAff);
var discard5 = /* @__PURE__ */ discard(discardUnit);
var discard1 = /* @__PURE__ */ discard5(bindProxy3);
var when2 = /* @__PURE__ */ when(/* @__PURE__ */ applicativeProxy2(monadAff));
var $$yield2 = /* @__PURE__ */ $$yield(monadAff);
var bind12 = /* @__PURE__ */ bind(bindAff);
var toListM2 = /* @__PURE__ */ toListM(monadAff);
var discard22 = /* @__PURE__ */ discard5(bindAff);
var log4 = /* @__PURE__ */ log3(monadEffectAff);
var pure17 = /* @__PURE__ */ pure(applicativeAff);
var fromFoldable8 = /* @__PURE__ */ fromFoldable(foldableList);
var readdirStream = function(x) {
  return bind7(liftAff2(readdir3(x)))(function(fs) {
    return each2(fs);
  });
};
var getFiles_ = function(x) {
  return function(excl) {
    var isCsvFile = function(path2) {
      return extname(basename(path2)) === ".csv";
    };
    var excludePaths = function(ps) {
      return filter5(function(x1) {
        return !elem7(x1)(ps);
      });
    };
    var fs = composePipes2(composePipes2(readdirStream(x))(excludePaths(excl)))(map20(function(f) {
      return concat2([x, f]);
    }));
    return $$for2(fs)(function(entry) {
      return bind7(liftAff2(stat3(entry)))(function(status) {
        return discard1(when2(isFile(status) && isCsvFile(entry))($$yield2(entry)))(function() {
          return when2(isDirectory(status))(getFiles_(entry)([]));
        });
      });
    });
  };
};
var getFiles = function(x) {
  return function(excl) {
    return bind12(attempt(toListM2(getFiles_(x)(excl))))(function(fib) {
      if (fib instanceof Left) {
        return discard22(log4("ERROR: " + message(fib.value0)))(function() {
          return pure17([]);
        });
      }
      ;
      if (fib instanceof Right) {
        return pure17(fromFoldable8(fib.value0));
      }
      ;
      throw new Error("Failed pattern match at Utils (line 60, column 3 - line 64, column 45): " + [fib.constructor.name]);
    });
  };
};
var arrayOfRight = function(v) {
  if (v instanceof Right) {
    return [v.value0];
  }
  ;
  return [];
};

// output/Data.DDF.BaseDataSet/index.js
var showMap2 = /* @__PURE__ */ showMap(showId2);
var show8 = /* @__PURE__ */ show(/* @__PURE__ */ showMap2(showConcept));
var show13 = /* @__PURE__ */ show(/* @__PURE__ */ showMap2(/* @__PURE__ */ showMap2(showEntity)));
var pure18 = /* @__PURE__ */ pure(/* @__PURE__ */ applicativeV(semigroupArray));
var eq4 = /* @__PURE__ */ eq(eqId);
var fromFoldable9 = /* @__PURE__ */ fromFoldable3(ordId);
var fromFoldable13 = /* @__PURE__ */ fromFoldable9(foldableList);
var map21 = /* @__PURE__ */ map(functorList);
var map110 = /* @__PURE__ */ map(functorMap);
var map23 = /* @__PURE__ */ map(functorNonEmptyList);
var fromFoldable22 = /* @__PURE__ */ fromFoldable9(foldableNonEmptyList);
var apply6 = /* @__PURE__ */ apply(/* @__PURE__ */ applyV(semigroupArray));
var map32 = /* @__PURE__ */ map(functorV);
var BaseDataSet = /* @__PURE__ */ function() {
  function BaseDataSet2(value0) {
    this.value0 = value0;
  }
  ;
  BaseDataSet2.create = function(value0) {
    return new BaseDataSet2(value0);
  };
  return BaseDataSet2;
}();
var showBaseDataSet = {
  show: function(v) {
    return "concepts: \n" + (show8(v.value0.concepts) + ("\nentities: \n" + show13(v.value0.entities)));
  }
};
var create2 = function(concepts) {
  return function(entities) {
    return new BaseDataSet({
      concepts,
      entities
    });
  };
};
var convertEntityInput = function(lst) {
  var groupToTuple = function(g) {
    return new Tuple(getDomain(head2(g)), g);
  };
  var entToTuple = function(e) {
    return new Tuple(getId2(e), e);
  };
  var compareEntity = function(a) {
    return function(b) {
      return eq4(getDomain(a))(getDomain(b));
    };
  };
  var groups = groupBy2(compareEntity)(lst);
  var groupsMap = fromFoldable13(map21(groupToTuple)(groups));
  var groupsMapWithTuple = map110(function(es) {
    return map23(entToTuple)(es);
  })(groupsMap);
  return map110(fromFoldable22)(groupsMapWithTuple);
};
var convertConceptInput = function(lst) {
  return fromFoldable13(map21(function(c) {
    return new Tuple(getId(c), c);
  })(lst));
};
var parseBaseDataSet = function(input) {
  var entityDict = convertEntityInput(input.entities);
  var conceptDict = convertConceptInput(input.concepts);
  return apply6(map32(create2)(pure18(conceptDict)))(pure18(entityDict));
};

// output/Data.Validation.Result/index.js
var show9 = /* @__PURE__ */ show(showId);
var setLineNo = function(i) {
  return function(m) {
    return {
      message: m.message,
      file: m.file,
      isWarning: m.isWarning,
      lineNo: i
    };
  };
};
var setFile = function(f) {
  return function(m) {
    return {
      message: m.message,
      lineNo: m.lineNo,
      isWarning: m.isWarning,
      file: f
    };
  };
};
var setError = function(m) {
  return {
    message: m.message,
    file: m.file,
    lineNo: m.lineNo,
    isWarning: false
  };
};
var messageFromError = function(issue) {
  return {
    message: show9(issue),
    file: "",
    lineNo: 0,
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
  throw new Error("Failed pattern match at Data.Validation.Result (line 59, column 3 - line 61, column 19): " + [v.constructor.name]);
};

// output/Data.Validation.ValidationT/index.js
var vWarning = function(dictMonad) {
  var modify_2 = modify_(monadStateExceptT(monadStateStateT(dictMonad)));
  return function(dictMonoid) {
    var append4 = append(dictMonoid.Semigroup0());
    return function(e) {
      return modify_2(function(x) {
        return append4(x)(e);
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
  var bind9 = bind(dictMonad.Bind1());
  var pure20 = pure(dictMonad.Applicative0());
  return function(dictMonoid) {
    var mempty2 = mempty(dictMonoid);
    var append4 = append(dictMonoid.Semigroup0());
    return function(v) {
      return bind9(runStateT(runExceptT(v))(mempty2))(function(v1) {
        return pure20(function() {
          if (v1.value0 instanceof Left) {
            return new Tuple(append4(v1.value0.value0)(v1.value1), Nothing.value);
          }
          ;
          if (v1.value0 instanceof Right) {
            return new Tuple(v1.value1, new Just(v1.value0.value0));
          }
          ;
          throw new Error("Failed pattern match at Data.Validation.ValidationT (line 65, column 7 - line 67, column 43): " + [v1.value0.constructor.name]);
        }());
      });
    };
  };
};
var monadVT = function(dictMonad) {
  return monadExceptT(monadStateT(dictMonad));
};
var monadEffectVT = function(dictMonadEffect) {
  return monadEffectExceptT(monadEffectState(dictMonadEffect));
};
var functorVT = function(dictFunctor) {
  return functorExceptT(functorStateT(dictFunctor));
};
var bindVT = function(dictMonad) {
  return bindExceptT(monadStateT(dictMonad));
};
var applicativeVT = function(dictMonad) {
  return applicativeExceptT(monadStateT(dictMonad));
};

// output/Node.Process/foreign.js
import process from "process";
var abortImpl = process.abort ? () => process.abort() : null;
var argv = () => process.argv.slice();
var channelRefImpl = process.channel && process.channel.ref ? () => process.channel.ref() : null;
var channelUnrefImpl = process.channel && process.channel.unref ? () => process.channel.unref() : null;
var debugPort = process.debugPort;
var disconnectImpl = process.disconnect ? () => process.disconnect() : null;
var pid = process.pid;
var platformStr = process.platform;
var ppid = process.ppid;
var stdin = process.stdin;
var stdout = process.stdout;
var stderr = process.stderr;
var stdinIsTTY = process.stdinIsTTY;
var stdoutIsTTY = process.stdoutIsTTY;
var stderrIsTTY = process.stderrIsTTY;
var version = process.version;

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
var keys2 = Object.keys || toArrayWithKey(function(k) {
  return function() {
    return k;
  };
});

// output/Main/index.js
var map24 = /* @__PURE__ */ map(functorArray);
var lift6 = /* @__PURE__ */ lift(monadTransProxy);
var pure19 = /* @__PURE__ */ pure(/* @__PURE__ */ applicativeV(semigroupArray));
var bind8 = /* @__PURE__ */ bind(bindAff);
var runValidationT2 = /* @__PURE__ */ runValidationT(monadAff)(monoidArray);
var monadVT2 = /* @__PURE__ */ monadVT(monadAff);
var composePipes3 = /* @__PURE__ */ composePipes(monadVT2);
var $$for3 = /* @__PURE__ */ $$for(monadVT2);
var each3 = /* @__PURE__ */ each(monadVT2)(foldableArray);
var $$yield3 = /* @__PURE__ */ $$yield(monadVT2);
var concat5 = /* @__PURE__ */ concat4(monadVT2)(foldableArray);
var discard6 = /* @__PURE__ */ discard(discardUnit);
var bindVT2 = /* @__PURE__ */ bindVT(monadAff);
var discard12 = /* @__PURE__ */ discard6(bindVT2);
var whenM2 = /* @__PURE__ */ whenM(monadVT2);
var map111 = /* @__PURE__ */ map(/* @__PURE__ */ functorVT(functorAff));
var head5 = /* @__PURE__ */ head4(monadVT2);
var vError2 = /* @__PURE__ */ vError(monadAff);
var filter6 = /* @__PURE__ */ filter4(monadVT2);
var mapM2 = /* @__PURE__ */ mapM(monadVT2);
var bind13 = /* @__PURE__ */ bind(bindVT2);
var liftEffect2 = /* @__PURE__ */ liftEffect(/* @__PURE__ */ monadEffectVT(monadEffectAff));
var pure110 = /* @__PURE__ */ pure(/* @__PURE__ */ applicativeVT(monadAff));
var toListM3 = /* @__PURE__ */ toListM(monadVT2);
var show10 = /* @__PURE__ */ show(/* @__PURE__ */ showRecord()()(/* @__PURE__ */ showRecordFieldsCons({
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
})(/* @__PURE__ */ showRecordFieldsConsNil({
  reflectSymbol: function() {
    return "message";
  }
})(showString))(showInt))(showBoolean))(showString)));
var discard23 = /* @__PURE__ */ discard6(bindAff);
var liftEffect1 = /* @__PURE__ */ liftEffect(monadEffectAff);
var logShow2 = /* @__PURE__ */ logShow(showBaseDataSet);
var validateEntities = function(dictMonad) {
  var monadVT1 = monadVT(dictMonad);
  var bind22 = bind(bindProxy2(monadVT1));
  var for1 = $$for(monadVT1);
  var each1 = each(monadVT1)(foldableArray);
  var lift1 = lift6(monadVT1);
  var vWarning2 = vWarning(dictMonad)(monoidArray);
  var pure22 = pure(applicativeProxy2(monadVT1));
  var yield1 = $$yield(monadVT1);
  return bind22($$await(monadVT1))(function(csvfile) {
    var fileInfo = getFileInfo(csvfile);
    var fp = filepath(fileInfo);
    var csvContent = getCsvContent(csvfile);
    var v = collection(fileInfo);
    if (v instanceof Entities) {
      return for1(each1(csvContent.rows))(function(row) {
        var entity2 = andThen(andThen(parseCsvRowRec(csvContent.headers)(row))(entityInputFromCsvRecAndFileInfo(v.value0)))(parseEntity);
        var v1 = toEither(entity2);
        if (v1 instanceof Left) {
          var msgs = map24(function() {
            var $130 = setLineNo(getLineNo(row));
            var $131 = setFile(fp);
            return function($132) {
              return $130($131(messageFromError($132)));
            };
          }())(v1.value0);
          return bind22(lift1(vWarning2(msgs)))(function() {
            return pure22(unit);
          });
        }
        ;
        if (v1 instanceof Right) {
          return yield1(v1.value0);
        }
        ;
        throw new Error("Failed pattern match at Main (line 108, column 13 - line 114, column 39): " + [v1.constructor.name]);
      });
    }
    ;
    return pure22(unit);
  });
};
var validateEntities1 = /* @__PURE__ */ validateEntities(monadAff);
var validateCsvFile = function(dictMonad) {
  var monadVT1 = monadVT(dictMonad);
  var bind22 = bind(bindProxy2(monadVT1));
  var yield1 = $$yield(monadVT1);
  var lift1 = lift6(monadVT1);
  var vWarning2 = vWarning(dictMonad)(monoidArray);
  var pure22 = pure(applicativeProxy2(monadVT1));
  return bind22($$await(monadVT1))(function(v) {
    var rawCsvContent = create(v.value1);
    var input = {
      fileInfo: v.value0,
      csvContent: rawCsvContent
    };
    var fp = filepath(v.value0);
    var v1 = toEither(parseCsvFile(input));
    if (v1 instanceof Right) {
      return yield1(v1.value0);
    }
    ;
    if (v1 instanceof Left) {
      var msgs = map24(function() {
        var $133 = setFile(fp);
        return function($134) {
          return $133(messageFromError($134));
        };
      }())(v1.value0);
      return bind22(lift1(vWarning2(msgs)))(function() {
        return pure22(unit);
      });
    }
    ;
    throw new Error("Failed pattern match at Main (line 131, column 3 - line 137, column 56): " + [v1.constructor.name]);
  });
};
var validateCsvFile1 = /* @__PURE__ */ validateCsvFile(monadAff);
var validateConcepts = function(dictMonad) {
  var monadVT1 = monadVT(dictMonad);
  var bind22 = bind(bindProxy2(monadVT1));
  var for1 = $$for(monadVT1);
  var each1 = each(monadVT1)(foldableArray);
  var lift1 = lift6(monadVT1);
  var vWarning2 = vWarning(dictMonad)(monoidArray);
  var pure22 = pure(applicativeProxy2(monadVT1));
  var yield1 = $$yield(monadVT1);
  return bind22($$await(monadVT1))(function(csvfile) {
    var fileInfo = getFileInfo(csvfile);
    var fp = filepath(fileInfo);
    var csvContent = getCsvContent(csvfile);
    return for1(each1(csvContent.rows))(function(row) {
      var concept2 = andThen(andThen(parseCsvRowRec(csvContent.headers)(row))(function(x) {
        return pure19(conceptInputFromCsvRec(x));
      }))(parseConcept);
      var v = toEither(concept2);
      if (v instanceof Left) {
        var msgs = map24(function() {
          var $135 = setLineNo(getLineNo(row));
          var $136 = setFile(fp);
          return function($137) {
            return $135($136(messageFromError($137)));
          };
        }())(v.value0);
        return bind22(lift1(vWarning2(msgs)))(function() {
          return pure22(unit);
        });
      }
      ;
      if (v instanceof Right) {
        return yield1(v.value0);
      }
      ;
      throw new Error("Failed pattern match at Main (line 79, column 9 - line 85, column 37): " + [v.constructor.name]);
    });
  });
};
var validateConcepts1 = /* @__PURE__ */ validateConcepts(monadAff);
var validate = function(path2) {
  return bind8(getFiles(path2)([".git", "etl", "lang", "assets"]))(function(fs) {
    return runValidationT2(function() {
      var ddfFiles = composePipes3($$for3(each3(fs))(function(f) {
        return $$yield3(arrayOfRight(fromFilePath(f)));
      }))(concat5);
      return discard12(whenM2(map111(isNothing)(head5(ddfFiles)))(vError2([messageFromError(new Issue("No csv files in this folder. Please begin with a ddf--concepts.csv file."))])))(function() {
        var entityFiles = composePipes3(ddfFiles)(filter6(isEntitiesFile));
        var validEntities = composePipes3(composePipes3(composePipes3(entityFiles)(mapM2(function(fi) {
          return bind13(liftEffect2(readCsv(filepath(fi))))(function(csvRows) {
            return pure110(new Tuple(fi, csvRows));
          });
        })))(validateCsvFile1))(validateEntities1);
        var conceptFiles = composePipes3(ddfFiles)(filter6(isConceptFile));
        var validConcepts = composePipes3(composePipes3(composePipes3(conceptFiles)(mapM2(function(fi) {
          return bind13(liftEffect2(readCsv(filepath(fi))))(function(csvRows) {
            return pure110(new Tuple(fi, csvRows));
          });
        })))(validateCsvFile1))(validateConcepts1);
        return bind13(toListM3(validConcepts))(function(conceptList) {
          return bind13(toListM3(validEntities))(function(entityList) {
            var baseDataSetV = parseBaseDataSet({
              concepts: conceptList,
              entities: entityList
            });
            var v = toEither(baseDataSetV);
            if (v instanceof Right) {
              return pure110(v.value0);
            }
            ;
            if (v instanceof Left) {
              return vError2(map24(function($138) {
                return setError(messageFromError($138));
              })(v.value0));
            }
            ;
            throw new Error("Failed pattern match at Main (line 193, column 5 - line 195, column 69): " + [v.constructor.name]);
          });
        });
      });
    }());
  });
};
var runMain = function(path2) {
  return launchAff_(bind8(validate(path2))(function(v) {
    var allmsgs = joinWith("\n")(map24(show10)(v.value0));
    return discard23(liftEffect1(log2(allmsgs)))(function() {
      if (v.value1 instanceof Just) {
        return discard23(liftEffect1(logShow2(v.value1.value0)))(function() {
          var $124 = hasError(v.value0);
          if ($124) {
            return liftEffect1(log2("\u274C Dataset is invalid"));
          }
          ;
          return liftEffect1(log2("\u2705 Dataset is valid"));
        });
      }
      ;
      if (v.value1 instanceof Nothing) {
        return liftEffect1(log2("\u274C Dataset is invalid"));
      }
      ;
      throw new Error("Failed pattern match at Main (line 205, column 3 - line 212, column 55): " + [v.value1.constructor.name]);
    });
  }));
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
  throw new Error("Failed pattern match at Main (line 219, column 3 - line 221, column 26): " + [v.constructor.name]);
};
export {
  main,
  runMain,
  validate,
  validateConcepts,
  validateCsvFile,
  validateEntities
};

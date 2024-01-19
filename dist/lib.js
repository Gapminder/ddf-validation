// output-es/runtime.js
function fail() {
  throw new Error("Failed pattern match");
}
function intDiv(x, y) {
  if (y > 0)
    return Math.floor(x / y);
  if (y < 0)
    return -Math.floor(x / -y);
  return 0;
}

// output-es/Data.Function/index.js
var $$const = (a) => (v) => a;

// output-es/Type.Proxy/index.js
var $$$Proxy = () => ({ tag: "Proxy" });
var $$Proxy = /* @__PURE__ */ $$$Proxy();

// output-es/Data.Functor/foreign.js
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

// output-es/Data.Functor/index.js
var functorArray = { map: arrayMap };

// output-es/Control.Apply/index.js
var identity = (x) => x;

// output-es/Control.Bind/foreign.js
var arrayBind = function(arr) {
  return function(f) {
    var result = [];
    for (var i = 0, l = arr.length; i < l; i++) {
      Array.prototype.push.apply(result, f(arr[i]));
    }
    return result;
  };
};

// output-es/Data.Show/foreign.js
var showIntImpl = function(n) {
  return n.toString();
};
var showNumberImpl = function(n) {
  var str = n.toString();
  return isNaN(str + ".0") ? str : str + ".0";
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
      var empty3 = k < l && s[k] >= "0" && s[k] <= "9" ? "\\&" : "";
      return "\\" + c.charCodeAt(0).toString(10) + empty3;
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

// output-es/Data.Ordering/index.js
var $Ordering = (tag) => tag;
var LT = /* @__PURE__ */ $Ordering("LT");
var GT = /* @__PURE__ */ $Ordering("GT");
var EQ = /* @__PURE__ */ $Ordering("EQ");

// output-es/Data.Maybe/index.js
var $Maybe = (tag, _1) => ({ tag, _1 });
var Nothing = /* @__PURE__ */ $Maybe("Nothing");
var Just = (value0) => $Maybe("Just", value0);
var isNothing = (v2) => {
  if (v2.tag === "Nothing") {
    return true;
  }
  if (v2.tag === "Just") {
    return false;
  }
  fail();
};

// output-es/Data.Either/index.js
var $Either = (tag, _1) => ({ tag, _1 });
var Left = (value0) => $Either("Left", value0);
var Right = (value0) => $Either("Right", value0);
var functorEither = {
  map: (f) => (m) => {
    if (m.tag === "Left") {
      return $Either("Left", m._1);
    }
    if (m.tag === "Right") {
      return $Either("Right", f(m._1));
    }
    fail();
  }
};

// output-es/Control.Monad.Rec.Class/index.js
var $Step = (tag, _1) => ({ tag, _1 });
var Loop = (value0) => $Step("Loop", value0);

// output-es/Data.Tuple/index.js
var $Tuple = (_1, _2) => ({ tag: "Tuple", _1, _2 });
var Tuple = (value0) => (value1) => $Tuple(value0, value1);
var snd = (v) => v._2;
var fst = (v) => v._1;

// output-es/Control.Monad.Except.Trans/index.js
var bindExceptT = (dictMonad) => ({
  bind: (v) => (k) => dictMonad.Bind1().bind(v)((v2) => {
    if (v2.tag === "Left") {
      return dictMonad.Applicative0().pure($Either("Left", v2._1));
    }
    if (v2.tag === "Right") {
      return k(v2._1);
    }
    fail();
  }),
  Apply0: () => applyExceptT(dictMonad)
});
var applyExceptT = (dictMonad) => {
  const $0 = dictMonad.Bind1().Apply0().Functor0();
  const functorExceptT1 = {
    map: (f) => $0.map((m) => {
      if (m.tag === "Left") {
        return $Either("Left", m._1);
      }
      if (m.tag === "Right") {
        return $Either("Right", f(m._1));
      }
      fail();
    })
  };
  return {
    apply: (() => {
      const $1 = bindExceptT(dictMonad);
      return (f) => (a) => $1.bind(f)((f$p) => $1.bind(a)((a$p) => applicativeExceptT(dictMonad).pure(f$p(a$p))));
    })(),
    Functor0: () => functorExceptT1
  };
};
var applicativeExceptT = (dictMonad) => ({ pure: (x) => dictMonad.Applicative0().pure($Either("Right", x)), Apply0: () => applyExceptT(dictMonad) });
var monadStateExceptT = (dictMonadState) => {
  const Monad0 = dictMonadState.Monad0();
  const monadExceptT1 = { Applicative0: () => applicativeExceptT(Monad0), Bind1: () => bindExceptT(Monad0) };
  return { state: (f) => Monad0.Bind1().bind(dictMonadState.state(f))((a) => Monad0.Applicative0().pure($Either("Right", a))), Monad0: () => monadExceptT1 };
};
var monadThrowExceptT = (dictMonad) => {
  const monadExceptT1 = { Applicative0: () => applicativeExceptT(dictMonad), Bind1: () => bindExceptT(dictMonad) };
  return { throwError: (x) => dictMonad.Applicative0().pure($Either("Left", x)), Monad0: () => monadExceptT1 };
};

// output-es/Control.Monad.State.Trans/index.js
var bindStateT = (dictMonad) => ({ bind: (v) => (f) => (s) => dictMonad.Bind1().bind(v(s))((v1) => f(v1._1)(v1._2)), Apply0: () => applyStateT(dictMonad) });
var applyStateT = (dictMonad) => {
  const $0 = dictMonad.Bind1().Apply0().Functor0();
  const functorStateT1 = { map: (f) => (v) => (s) => $0.map((v1) => $Tuple(f(v1._1), v1._2))(v(s)) };
  return {
    apply: (() => {
      const $1 = bindStateT(dictMonad);
      return (f) => (a) => $1.bind(f)((f$p) => $1.bind(a)((a$p) => applicativeStateT(dictMonad).pure(f$p(a$p))));
    })(),
    Functor0: () => functorStateT1
  };
};
var applicativeStateT = (dictMonad) => ({ pure: (a) => (s) => dictMonad.Applicative0().pure($Tuple(a, s)), Apply0: () => applyStateT(dictMonad) });
var monadStateStateT = (dictMonad) => {
  const monadStateT1 = { Applicative0: () => applicativeStateT(dictMonad), Bind1: () => bindStateT(dictMonad) };
  return { state: (f) => (x) => dictMonad.Applicative0().pure(f(x)), Monad0: () => monadStateT1 };
};

// output-es/Data.Array.ST/foreign.js
var sortByImpl = function() {
  function mergeFromTo(compare2, fromOrdering, xs1, xs2, from, to) {
    var mid;
    var i;
    var j;
    var k;
    var x;
    var y;
    var c;
    mid = from + (to - from >> 1);
    if (mid - from > 1)
      mergeFromTo(compare2, fromOrdering, xs2, xs1, from, mid);
    if (to - mid > 1)
      mergeFromTo(compare2, fromOrdering, xs2, xs1, mid, to);
    i = from;
    j = mid;
    k = from;
    while (i < mid && j < to) {
      x = xs2[i];
      y = xs2[j];
      c = fromOrdering(compare2(x)(y));
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
  return function(compare2, fromOrdering, xs) {
    if (xs.length < 2)
      return xs;
    mergeFromTo(compare2, fromOrdering, xs, xs.slice(0), 0, xs.length);
    return xs;
  };
}();

// output-es/Data.Array.ST.Iterator/index.js
var $Iterator = (_1, _2) => ({ tag: "Iterator", _1, _2 });
var pushWhile = (p) => (iter) => (array) => () => {
  let $$break = false;
  const $0 = iter._2;
  while ((() => {
    const $1 = $$break;
    return !$1;
  })()) {
    const i = $0.value;
    const mx = iter._1(i);
    if (mx.tag === "Just" && p(mx._1)) {
      array.push(mx._1);
      iter._2.value;
      const $1 = iter._2.value;
      iter._2.value = $1 + 1 | 0;
      continue;
    }
    $$break = true;
  }
};
var iterate = (iter) => (f) => () => {
  let $$break = false;
  const $0 = iter._2;
  while ((() => {
    const $1 = $$break;
    return !$1;
  })()) {
    const i = $0.value;
    const $1 = $0.value;
    $0.value = $1 + 1 | 0;
    const mx = iter._1(i);
    if (mx.tag === "Just") {
      f(mx._1)();
      continue;
    }
    if (mx.tag === "Nothing") {
      $$break = true;
      continue;
    }
    fail();
  }
};

// output-es/Data.Foldable/foreign.js
var foldrArray = function(f) {
  return function(init) {
    return function(xs) {
      var acc = init;
      var len = xs.length;
      for (var i = len - 1; i >= 0; i--) {
        acc = f(xs[i])(acc);
      }
      return acc;
    };
  };
};
var foldlArray = function(f) {
  return function(init) {
    return function(xs) {
      var acc = init;
      var len = xs.length;
      for (var i = 0; i < len; i++) {
        acc = f(acc)(xs[i]);
      }
      return acc;
    };
  };
};

// output-es/Data.Foldable/index.js
var monoidEndo = /* @__PURE__ */ (() => {
  const semigroupEndo1 = { append: (v) => (v1) => (x) => v(v1(x)) };
  return { mempty: (x) => x, Semigroup0: () => semigroupEndo1 };
})();
var monoidDual = /* @__PURE__ */ (() => {
  const $0 = monoidEndo.Semigroup0();
  const semigroupDual1 = { append: (v) => (v1) => $0.append(v1)(v) };
  return { mempty: monoidEndo.mempty, Semigroup0: () => semigroupDual1 };
})();
var foldableArray = {
  foldr: foldrArray,
  foldl: foldlArray,
  foldMap: (dictMonoid) => {
    const mempty = dictMonoid.mempty;
    return (f) => foldableArray.foldr((x) => (acc) => dictMonoid.Semigroup0().append(f(x))(acc))(mempty);
  }
};
var foldlDefault = (dictFoldable) => {
  const foldMap2 = dictFoldable.foldMap(monoidDual);
  return (c) => (u) => (xs) => foldMap2((x) => (a) => c(a)(x))(xs)(u);
};
var foldrDefault = (dictFoldable) => {
  const foldMap2 = dictFoldable.foldMap(monoidEndo);
  return (c) => (u) => (xs) => foldMap2((x) => c(x))(xs)(u);
};

// output-es/Data.FunctorWithIndex/foreign.js
var mapWithIndexArray = function(f) {
  return function(xs) {
    var l = xs.length;
    var result = Array(l);
    for (var i = 0; i < l; i++) {
      result[i] = f(i)(xs[i]);
    }
    return result;
  };
};

// output-es/Data.Eq/foreign.js
var refEq = function(r1) {
  return function(r2) {
    return r1 === r2;
  };
};
var eqBooleanImpl = refEq;
var eqIntImpl = refEq;
var eqNumberImpl = refEq;
var eqStringImpl = refEq;
var eqArrayImpl = function(f) {
  return function(xs) {
    return function(ys) {
      if (xs.length !== ys.length)
        return false;
      for (var i = 0; i < xs.length; i++) {
        if (!f(xs[i])(ys[i]))
          return false;
      }
      return true;
    };
  };
};

// output-es/Data.Eq/index.js
var eqString = { eq: eqStringImpl };
var eqNumber = { eq: eqNumberImpl };
var eqInt = { eq: eqIntImpl };
var eqBoolean = { eq: eqBooleanImpl };

// output-es/Data.Ord/foreign.js
var unsafeCompareImpl = function(lt) {
  return function(eq2) {
    return function(gt) {
      return function(x) {
        return function(y) {
          return x < y ? lt : x === y ? eq2 : gt;
        };
      };
    };
  };
};
var ordBooleanImpl = unsafeCompareImpl;
var ordIntImpl = unsafeCompareImpl;
var ordNumberImpl = unsafeCompareImpl;
var ordStringImpl = unsafeCompareImpl;

// output-es/Data.Ord/index.js
var ordString = { compare: /* @__PURE__ */ ordStringImpl(LT)(EQ)(GT), Eq0: () => eqString };
var ordNumber = { compare: /* @__PURE__ */ ordNumberImpl(LT)(EQ)(GT), Eq0: () => eqNumber };
var ordInt = { compare: /* @__PURE__ */ ordIntImpl(LT)(EQ)(GT), Eq0: () => eqInt };
var ordBoolean = { compare: /* @__PURE__ */ ordBooleanImpl(LT)(EQ)(GT), Eq0: () => eqBoolean };

// output-es/Unsafe.Coerce/foreign.js
var unsafeCoerce = function(x) {
  return x;
};

// output-es/Data.Traversable/foreign.js
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
  return function(apply4) {
    return function(map3) {
      return function(pure) {
        return function(f) {
          return function(array) {
            function go(bot, top) {
              switch (top - bot) {
                case 0:
                  return pure([]);
                case 1:
                  return map3(array1)(f(array[bot]));
                case 2:
                  return apply4(map3(array2)(f(array[bot])))(f(array[bot + 1]));
                case 3:
                  return apply4(apply4(map3(array3)(f(array[bot])))(f(array[bot + 1])))(f(array[bot + 2]));
                default:
                  var pivot = bot + Math.floor((top - bot) / 4) * 2;
                  return apply4(map3(concat22)(go(bot, pivot)))(go(pivot, top));
              }
            }
            return go(0, array.length);
          };
        };
      };
    };
  };
}();

// output-es/Data.Traversable/index.js
var identity2 = (x) => x;
var traversableArray = {
  traverse: (dictApplicative) => {
    const Apply0 = dictApplicative.Apply0();
    return traverseArrayImpl(Apply0.apply)(Apply0.Functor0().map)(dictApplicative.pure);
  },
  sequence: (dictApplicative) => traversableArray.traverse(dictApplicative)(identity2),
  Functor0: () => functorArray,
  Foldable1: () => foldableArray
};

// output-es/Data.Array/foreign.js
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
var replicateFill = function(count, value2) {
  if (count < 1) {
    return [];
  }
  var result = new Array(count);
  return result.fill(value2);
};
var replicatePolyfill = function(count, value2) {
  var result = [];
  var n = 0;
  for (var i = 0; i < count; i++) {
    result[n++] = value2;
  }
  return result;
};
var replicateImpl = typeof Array.prototype.fill === "function" ? replicateFill : replicatePolyfill;
var fromFoldableImpl = function() {
  function Cons2(head, tail) {
    this.head = head;
    this.tail = tail;
  }
  var emptyList = {};
  function curryCons(head) {
    return function(tail) {
      return new Cons2(head, tail);
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
  return function(foldr, xs) {
    return listToArray(foldr(curryCons)(emptyList)(xs));
  };
}();
var unconsImpl = function(empty3, next, xs) {
  return xs.length === 0 ? empty3({}) : next(xs[0])(xs.slice(1));
};
var findIndexImpl = function(just, nothing, f, xs) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (f(xs[i]))
      return just(i);
  }
  return nothing;
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
var filterImpl = function(f, xs) {
  return xs.filter(f);
};
var sortByImpl2 = function() {
  function mergeFromTo(compare2, fromOrdering, xs1, xs2, from, to) {
    var mid;
    var i;
    var j;
    var k;
    var x;
    var y;
    var c;
    mid = from + (to - from >> 1);
    if (mid - from > 1)
      mergeFromTo(compare2, fromOrdering, xs2, xs1, from, mid);
    if (to - mid > 1)
      mergeFromTo(compare2, fromOrdering, xs2, xs1, mid, to);
    i = from;
    j = mid;
    k = from;
    while (i < mid && j < to) {
      x = xs2[i];
      y = xs2[j];
      c = fromOrdering(compare2(x)(y));
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
  return function(compare2, fromOrdering, xs) {
    var out;
    if (xs.length < 2)
      return xs;
    out = xs.slice(0);
    mergeFromTo(compare2, fromOrdering, out, xs.slice(0), 0, xs.length);
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

// output-es/Data.Array/index.js
var sortBy = (comp) => ($0) => sortByImpl2(
  comp,
  (v) => {
    if (v === "GT") {
      return 1;
    }
    if (v === "EQ") {
      return 0;
    }
    if (v === "LT") {
      return -1;
    }
    fail();
  },
  $0
);
var sortWith = (dictOrd) => (f) => sortBy((x) => (y) => dictOrd.compare(f(x))(f(y)));
var last = (xs) => {
  const $0 = xs.length - 1 | 0;
  if ($0 >= 0 && $0 < xs.length) {
    return $Maybe("Just", xs[$0]);
  }
  return Nothing;
};
var nubBy = (comp) => (xs) => {
  const indexedAndSorted = sortBy((x) => (y) => comp(x._2)(y._2))(mapWithIndexArray(Tuple)(xs));
  if (0 < indexedAndSorted.length) {
    return arrayMap(snd)(sortWith(ordInt)(fst)((() => {
      const result = [indexedAndSorted[0]];
      for (const v1 of indexedAndSorted) {
        const $0 = comp((() => {
          const $02 = last(result);
          if ($02.tag === "Just") {
            return $02._1._2;
          }
          fail();
        })())(v1._2);
        if ($0 === "LT" || $0 === "GT" || $0 !== "EQ") {
          result.push(v1);
        }
      }
      return result;
    })()));
  }
  return [];
};
var groupBy = (op) => (xs) => {
  const result = [];
  const $0 = { value: 0 };
  const iter = $Iterator(
    (v) => {
      if (v >= 0 && v < xs.length) {
        return $Maybe("Just", xs[v]);
      }
      return Nothing;
    },
    $0
  );
  iterate(iter)((x) => () => {
    const sub1 = [];
    sub1.push(x);
    pushWhile(op(x))(iter)(sub1)();
    result.push(sub1);
  })();
  return result;
};
var groupAllBy = (cmp) => {
  const $0 = groupBy((x) => (y) => cmp(x)(y) === "EQ");
  return (x) => $0(sortBy(cmp)(x));
};
var foldM = (dictMonad) => (f) => (b) => ($0) => unconsImpl((v) => dictMonad.Applicative0().pure(b), (a) => (as) => dictMonad.Bind1().bind(f(b)(a))((b$p) => foldM(dictMonad)(f)(b$p)(as)), $0);
var find = (f) => (xs) => {
  const $0 = findIndexImpl(Just, Nothing, f, xs);
  if ($0.tag === "Just") {
    return $Maybe("Just", xs[$0._1]);
  }
  return Nothing;
};
var elem = (dictEq) => (a) => (arr) => {
  const $0 = findIndexImpl(Just, Nothing, (v) => dictEq.eq(v)(a), arr);
  if ($0.tag === "Nothing") {
    return false;
  }
  if ($0.tag === "Just") {
    return true;
  }
  fail();
};
var concatMap = (b) => (a) => arrayBind(a)(b);
var mapMaybe = (f) => concatMap((x) => {
  const $0 = f(x);
  if ($0.tag === "Nothing") {
    return [];
  }
  if ($0.tag === "Just") {
    return [$0._1];
  }
  fail();
});

// output-es/Partial/foreign.js
var _crashWith = function(msg) {
  throw new Error(msg);
};

// output-es/Effect.Aff/foreign.js
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
    var size4 = 0;
    var ix = 0;
    var queue = new Array(limit);
    var draining = false;
    function drain() {
      var thunk;
      draining = true;
      while (size4 !== 0) {
        size4--;
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
        if (size4 === limit) {
          tmp = draining;
          drain();
          draining = tmp;
        }
        queue[(ix + size4) % limit] = cb;
        size4++;
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
    function run2(localRunTick) {
      var tmp, result, attempt;
      while (true) {
        tmp = null;
        result = null;
        attempt = null;
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
                      run2(runTick);
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
                step = sequential(util, supervisor, step._1);
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
              attempt = attempts._1;
              attempts = attempts._2;
              switch (attempt.tag) {
                case CATCH:
                  if (interrupt && interrupt !== tmp && bracketCount === 0) {
                    status = RETURN;
                  } else if (fail2) {
                    status = CONTINUE;
                    step = attempt._2(util.fromLeft(fail2));
                    fail2 = null;
                  }
                  break;
                case RESUME:
                  if (interrupt && interrupt !== tmp && bracketCount === 0 || fail2) {
                    status = RETURN;
                  } else {
                    bhead = attempt._1;
                    btail = attempt._2;
                    status = STEP_BIND;
                    step = util.fromRight(step);
                  }
                  break;
                case BRACKET:
                  bracketCount--;
                  if (fail2 === null) {
                    result = util.fromRight(step);
                    attempts = new Aff2(CONS, new Aff2(RELEASE, attempt._2, result), attempts, tmp);
                    if (interrupt === tmp || bracketCount > 0) {
                      status = CONTINUE;
                      step = attempt._3(result);
                    }
                  }
                  break;
                case RELEASE:
                  attempts = new Aff2(CONS, new Aff2(FINALIZED, step, fail2), attempts, interrupt);
                  status = CONTINUE;
                  if (interrupt && interrupt !== tmp && bracketCount === 0) {
                    step = attempt._1.killed(util.fromLeft(interrupt))(attempt._2);
                  } else if (fail2) {
                    step = attempt._1.failed(util.fromLeft(fail2))(attempt._2);
                  } else {
                    step = attempt._1.completed(util.fromRight(step))(attempt._2);
                  }
                  fail2 = null;
                  bracketCount++;
                  break;
                case FINALIZER:
                  bracketCount++;
                  attempts = new Aff2(CONS, new Aff2(FINALIZED, step, fail2), attempts, interrupt);
                  status = CONTINUE;
                  step = attempt._1;
                  break;
                case FINALIZED:
                  bracketCount--;
                  status = RETURN;
                  step = attempt._1;
                  fail2 = attempt._2;
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
    function onComplete(join2) {
      return function() {
        if (status === COMPLETED) {
          rethrow = rethrow && join2.rethrow;
          join2.handler(step)();
          return function() {
          };
        }
        var jid = joinId++;
        joins = joins || {};
        joins[jid] = join2;
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
            run2(runTick);
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
              run2(++runTick);
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
    function join(cb) {
      return function() {
        var canceler = onComplete({
          rethrow: false,
          handler: cb
        })();
        if (status === SUSPENDED) {
          run2(runTick);
        }
        return canceler;
      };
    }
    return {
      kill,
      join,
      onComplete,
      isSuspended: function() {
        return status === SUSPENDED;
      },
      run: function() {
        if (status === SUSPENDED) {
          if (!Scheduler.isDraining()) {
            Scheduler.enqueue(function() {
              run2(runTick);
            });
          } else {
            run2(runTick);
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
      var head = null;
      var tail = null;
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
              if (head === null) {
                break loop;
              }
              step = head._2;
              if (tail === null) {
                head = null;
              } else {
                head = tail._1;
                tail = tail._2;
              }
              break;
            case MAP:
              step = step._2;
              break;
            case APPLY:
            case ALT:
              if (head) {
                tail = new Aff2(CONS, head, tail);
              }
              head = step;
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
    function join(result, head, tail) {
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
          if (head === null) {
            cb(fail2 || step)();
            return;
          }
          if (head._3 !== EMPTY) {
            return;
          }
          switch (head.tag) {
            case MAP:
              if (fail2 === null) {
                head._3 = util.right(head._1(util.fromRight(step)));
                step = head._3;
              } else {
                head._3 = fail2;
              }
              break;
            case APPLY:
              lhs = head._1._3;
              rhs = head._2._3;
              if (fail2) {
                head._3 = fail2;
                tmp = true;
                kid = killId++;
                kills[kid] = kill(early, fail2 === lhs ? head._2 : head._1, function() {
                  return function() {
                    delete kills[kid];
                    if (tmp) {
                      tmp = false;
                    } else if (tail === null) {
                      join(fail2, null, null);
                    } else {
                      join(fail2, tail._1, tail._2);
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
                head._3 = step;
              }
              break;
            case ALT:
              lhs = head._1._3;
              rhs = head._2._3;
              if (lhs === EMPTY && util.isLeft(rhs) || rhs === EMPTY && util.isLeft(lhs)) {
                return;
              }
              if (lhs !== EMPTY && util.isLeft(lhs) && rhs !== EMPTY && util.isLeft(rhs)) {
                fail2 = step === lhs ? rhs : lhs;
                step = null;
                head._3 = fail2;
              } else {
                head._3 = step;
                tmp = true;
                kid = killId++;
                kills[kid] = kill(early, step === lhs ? head._2 : head._1, function() {
                  return function() {
                    delete kills[kid];
                    if (tmp) {
                      tmp = false;
                    } else if (tail === null) {
                      join(step, null, null);
                    } else {
                      join(step, tail._1, tail._2);
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
          if (tail === null) {
            head = null;
          } else {
            head = tail._1;
            tail = tail._2;
          }
        }
    }
    function resolve2(fiber) {
      return function(result) {
        return function() {
          delete fibers[fiber._1];
          fiber._3 = result;
          join(result, fiber._2._1, fiber._2._2);
        };
      };
    }
    function run2() {
      var status = CONTINUE;
      var step = par;
      var head = null;
      var tail = null;
      var tmp, fid;
      loop:
        while (true) {
          tmp = null;
          fid = null;
          switch (status) {
            case CONTINUE:
              switch (step.tag) {
                case MAP:
                  if (head) {
                    tail = new Aff2(CONS, head, tail);
                  }
                  head = new Aff2(MAP, step._1, EMPTY, EMPTY);
                  step = step._2;
                  break;
                case APPLY:
                  if (head) {
                    tail = new Aff2(CONS, head, tail);
                  }
                  head = new Aff2(APPLY, EMPTY, step._2, EMPTY);
                  step = step._1;
                  break;
                case ALT:
                  if (head) {
                    tail = new Aff2(CONS, head, tail);
                  }
                  head = new Aff2(ALT, EMPTY, step._2, EMPTY);
                  step = step._1;
                  break;
                default:
                  fid = fiberId++;
                  status = RETURN;
                  tmp = step;
                  step = new Aff2(FORKED, fid, new Aff2(CONS, head, tail), EMPTY);
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
              if (head === null) {
                break loop;
              }
              if (head._1 === EMPTY) {
                head._1 = step;
                status = CONTINUE;
                step = head._2;
                head._2 = EMPTY;
              } else {
                head._2 = step;
                step = head;
                if (tail === null) {
                  head = null;
                } else {
                  head = tail._1;
                  tail = tail._2;
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
    run2();
    return function(killError) {
      return new Aff2(ASYNC, function(killCb) {
        return function() {
          return cancel(killError, killCb);
        };
      });
    };
  }
  function sequential(util, supervisor, par) {
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
function _map(f) {
  return function(aff) {
    if (aff.tag === Aff.Pure.tag) {
      return Aff.Pure(f(aff._1));
    } else {
      return Aff.Bind(aff, function(value2) {
        return Aff.Pure(f(value2));
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

// output-es/Effect.Aff/index.js
var functorAff = { map: _map };
var ffiUtil = {
  isLeft: (v) => {
    if (v.tag === "Left") {
      return true;
    }
    if (v.tag === "Right") {
      return false;
    }
    fail();
  },
  fromLeft: (v) => {
    if (v.tag === "Left") {
      return v._1;
    }
    if (v.tag === "Right") {
      return _crashWith("unsafeFromLeft: Right");
    }
    fail();
  },
  fromRight: (v) => {
    if (v.tag === "Right") {
      return v._1;
    }
    if (v.tag === "Left") {
      return _crashWith("unsafeFromRight: Left");
    }
    fail();
  },
  left: Left,
  right: Right
};
var monadAff = { Applicative0: () => applicativeAff, Bind1: () => bindAff };
var bindAff = { bind: _bind, Apply0: () => applyAff };
var applyAff = { apply: (f) => (a) => _bind(f)((f$p) => _bind(a)((a$p) => applicativeAff.pure(f$p(a$p)))), Functor0: () => functorAff };
var applicativeAff = { pure: _pure, Apply0: () => applyAff };
var nonCanceler = /* @__PURE__ */ (() => {
  const $0 = _pure();
  return (v) => $0;
})();

// output-es/Node.Encoding/index.js
var $Encoding = (tag) => tag;
var UTF8 = /* @__PURE__ */ $Encoding("UTF8");

// output-es/Data.Nullable/foreign.js
function nullable(a, r, f) {
  return a == null ? r : f(a);
}

// output-es/Data.EuclideanRing/foreign.js
var intMod = function(x) {
  return function(y) {
    if (y === 0)
      return 0;
    var yy = Math.abs(y);
    return (x % yy + yy) % yy;
  };
};

// output-es/Data.Number/foreign.js
var isFiniteImpl = isFinite;
function fromStringImpl(str, isFinite2, just, nothing) {
  var num = parseFloat(str);
  if (isFinite2(num)) {
    return just(num);
  } else {
    return nothing;
  }
}

// output-es/Data.Int/foreign.js
var fromStringAsImpl = function(just) {
  return function(nothing) {
    return function(radix) {
      var digits;
      if (radix < 11) {
        digits = "[0-" + (radix - 1).toString() + "]";
      } else if (radix === 11) {
        digits = "[0-9a]";
      } else {
        digits = "[0-9a-" + String.fromCharCode(86 + radix) + "]";
      }
      var pattern = new RegExp("^[\\+\\-]?" + digits + "+$", "i");
      return function(s) {
        if (pattern.test(s)) {
          var i = parseInt(s, radix);
          return (i | 0) === i ? just(i) : nothing;
        } else {
          return nothing;
        }
      };
    };
  };
};

// output-es/Data.Int/index.js
var fromStringAs = /* @__PURE__ */ fromStringAsImpl(Just)(Nothing);
var fromString = /* @__PURE__ */ fromStringAs(10);

// output-es/Node.FS.Constants/foreign.js
import { constants } from "node:fs";
var f_OK = constants.F_OK;
var r_OK = constants.R_OK;
var w_OK = constants.W_OK;
var x_OK = constants.X_OK;
var copyFile_EXCL = constants.COPYFILE_EXCL;
var copyFile_FICLONE = constants.COPYFILE_FICLONE;
var copyFile_FICLONE_FORCE = constants.COPYFILE_FICLONE_FORCE;

// output-es/Data.Bounded/foreign.js
var topChar = String.fromCharCode(65535);
var bottomChar = String.fromCharCode(0);
var topNumber = Number.POSITIVE_INFINITY;
var bottomNumber = Number.NEGATIVE_INFINITY;

// output-es/Data.Unfoldable1/foreign.js
var unfoldr1ArrayImpl = function(isNothing2) {
  return function(fromJust3) {
    return function(fst2) {
      return function(snd2) {
        return function(f) {
          return function(b) {
            var result = [];
            var value2 = b;
            while (true) {
              var tuple = f(value2);
              result.push(fst2(tuple));
              var maybe = snd2(tuple);
              if (isNothing2(maybe))
                return result;
              value2 = fromJust3(maybe);
            }
          };
        };
      };
    };
  };
};

// output-es/Data.Unfoldable1/index.js
var fromJust = (v) => {
  if (v.tag === "Just") {
    return v._1;
  }
  fail();
};
var unfoldable1Array = { unfoldr1: /* @__PURE__ */ unfoldr1ArrayImpl(isNothing)(fromJust)(fst)(snd) };

// output-es/Data.Enum/foreign.js
function toCharCode(c) {
  return c.charCodeAt(0);
}
function fromCharCode(c) {
  return String.fromCharCode(c);
}

// output-es/Data.String.Unsafe/foreign.js
var charAt = function(i) {
  return function(s) {
    if (i >= 0 && i < s.length)
      return s.charAt(i);
    throw new Error("Data.String.Unsafe.charAt: Invalid index.");
  };
};

// output-es/Data.String.CodeUnits/foreign.js
var fromCharArray = function(a) {
  return a.join("");
};
var singleton = function(c) {
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
var length2 = function(s) {
  return s.length;
};
var drop = function(n) {
  return function(s) {
    return s.substring(n);
  };
};
var splitAt = function(i) {
  return function(s) {
    return { before: s.substring(0, i), after: s.substring(i) };
  };
};

// output-es/Data.String.CodeUnits/index.js
var stripSuffix = (v) => (str) => {
  const v1 = splitAt(length2(str) - length2(v) | 0)(str);
  if (v1.after === v) {
    return $Maybe("Just", v1.before);
  }
  return Nothing;
};
var stripPrefix = (v) => (str) => {
  const v1 = splitAt(length2(v))(str);
  if (v1.before === v) {
    return $Maybe("Just", v1.after);
  }
  return Nothing;
};
var charAt2 = /* @__PURE__ */ _charAt(Just)(Nothing);

// output-es/Data.String.Common/foreign.js
var joinWith = function(s) {
  return function(xs) {
    return xs.join(s);
  };
};

// output-es/Data.Unfoldable/foreign.js
var unfoldrArrayImpl = function(isNothing2) {
  return function(fromJust3) {
    return function(fst2) {
      return function(snd2) {
        return function(f) {
          return function(b) {
            var result = [];
            var value2 = b;
            while (true) {
              var maybe = f(value2);
              if (isNothing2(maybe))
                return result;
              var tuple = fromJust3(maybe);
              result.push(fst2(tuple));
              value2 = snd2(tuple);
            }
          };
        };
      };
    };
  };
};

// output-es/Data.Unfoldable/index.js
var fromJust2 = (v) => {
  if (v.tag === "Just") {
    return v._1;
  }
  fail();
};
var unfoldableArray = {
  unfoldr: /* @__PURE__ */ unfoldrArrayImpl(isNothing)(fromJust2)(fst)(snd),
  Unfoldable10: () => unfoldable1Array
};

// output-es/Data.String.CodePoints/foreign.js
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

// output-es/Data.String.CodePoints/index.js
var uncons = (s) => {
  const v = length2(s);
  if (v === 0) {
    return Nothing;
  }
  if (v === 1) {
    return $Maybe("Just", { head: toCharCode(charAt(0)(s)), tail: "" });
  }
  const cu1 = toCharCode(charAt(1)(s));
  const cu0 = toCharCode(charAt(0)(s));
  if (55296 <= cu0 && cu0 <= 56319 && 56320 <= cu1 && cu1 <= 57343) {
    return $Maybe("Just", { head: (((cu0 - 55296 | 0) * 1024 | 0) + (cu1 - 56320 | 0) | 0) + 65536 | 0, tail: drop(2)(s) });
  }
  return $Maybe("Just", { head: cu0, tail: drop(1)(s) });
};
var unconsButWithTuple = (s) => {
  const $0 = uncons(s);
  if ($0.tag === "Just") {
    return $Maybe("Just", $Tuple($0._1.head, $0._1.tail));
  }
  return Nothing;
};
var toCodePointArrayFallback = (s) => unfoldableArray.unfoldr(unconsButWithTuple)(s);
var unsafeCodePointAt0Fallback = (s) => {
  const cu0 = toCharCode(charAt(0)(s));
  if (55296 <= cu0 && cu0 <= 56319 && length2(s) > 1) {
    const cu1 = toCharCode(charAt(1)(s));
    if (56320 <= cu1 && cu1 <= 57343) {
      return (((cu0 - 55296 | 0) * 1024 | 0) + (cu1 - 56320 | 0) | 0) + 65536 | 0;
    }
  }
  return cu0;
};
var unsafeCodePointAt0 = /* @__PURE__ */ _unsafeCodePointAt0(unsafeCodePointAt0Fallback);
var toCodePointArray = /* @__PURE__ */ _toCodePointArray(toCodePointArrayFallback)(unsafeCodePointAt0);
var fromCharCode2 = (x) => singleton((() => {
  if (x >= 0 && x <= 65535) {
    return fromCharCode(x);
  }
  if (x < 0) {
    return "\0";
  }
  return "\uFFFF";
})());
var singletonFallback = (v) => {
  if (v <= 65535) {
    return fromCharCode2(v);
  }
  return fromCharCode2(intDiv(v - 65536 | 0, 1024) + 55296 | 0) + fromCharCode2(intMod(v - 65536 | 0)(1024) + 56320 | 0);
};
var singleton2 = /* @__PURE__ */ _singleton(singletonFallback);
var takeFallback = (v) => (v1) => {
  if (v < 1) {
    return "";
  }
  const v2 = uncons(v1);
  if (v2.tag === "Just") {
    return singleton2(v2._1.head) + takeFallback(v - 1 | 0)(v2._1.tail);
  }
  return v1;
};
var take2 = /* @__PURE__ */ _take(takeFallback);
var splitAt2 = (i) => (s) => {
  const before = take2(i)(s);
  return { before, after: drop(length2(before))(s) };
};

// output-es/Node.FS.Async/foreign.js
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
  read as read2,
  write as write2,
  close
} from "node:fs";

// output-es/Node.FS.Async/index.js
var handleCallback = (cb) => (err, a) => {
  const v = nullable(err, Nothing, Just);
  if (v.tag === "Nothing") {
    return cb($Either("Right", a))();
  }
  if (v.tag === "Just") {
    return cb($Either("Left", v._1))();
  }
  fail();
};
var readTextFile = (encoding) => (file) => (cb) => {
  const $0 = {
    encoding: (() => {
      if (encoding === "ASCII") {
        return "ASCII";
      }
      if (encoding === "UTF8") {
        return "UTF8";
      }
      if (encoding === "UTF16LE") {
        return "UTF16LE";
      }
      if (encoding === "UCS2") {
        return "UCS2";
      }
      if (encoding === "Base64") {
        return "Base64";
      }
      if (encoding === "Base64Url") {
        return "Base64Url";
      }
      if (encoding === "Latin1") {
        return "Latin1";
      }
      if (encoding === "Binary") {
        return "Binary";
      }
      if (encoding === "Hex") {
        return "Hex";
      }
      fail();
    })()
  };
  return () => readFile(file, $0, handleCallback(cb));
};
var readdir2 = (file) => (cb) => () => readdir(file, handleCallback(cb));
var stat2 = (file) => (cb) => () => stat(file, handleCallback(cb));

// output-es/Node.FS.Aff/index.js
var toAff1 = (f) => (a) => {
  const $0 = f(a);
  return makeAff((k) => {
    const $1 = $0(k);
    return () => {
      $1();
      return nonCanceler;
    };
  });
};
var toAff2 = (f) => (a) => (b) => {
  const $0 = f(a)(b);
  return makeAff((k) => {
    const $1 = $0(k);
    return () => {
      $1();
      return nonCanceler;
    };
  });
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
  constructor(size4 = 100) {
    this.size = size4;
    this.length = 0;
    this.buf = Buffer.allocUnsafe(size4);
  }
  prepend(val) {
    if (Buffer.isBuffer(val)) {
      const length3 = this.length + val.length;
      if (length3 >= this.size) {
        this.resize();
        if (length3 >= this.size) {
          throw Error("INVALID_BUFFER_STATE");
        }
      }
      const buf = this.buf;
      this.buf = Buffer.allocUnsafe(this.size);
      val.copy(this.buf, 0);
      buf.copy(this.buf, val.length);
      this.length += val.length;
    } else {
      const length3 = this.length++;
      if (length3 === this.size) {
        this.resize();
      }
      const buf = this.clone();
      this.buf[0] = val;
      buf.copy(this.buf, 1, 0, length3);
    }
  }
  append(val) {
    const length3 = this.length++;
    if (length3 === this.size) {
      this.resize();
    }
    this.buf[length3] = val;
  }
  clone() {
    return Buffer.from(this.buf.slice(0, this.length));
  }
  resize() {
    const length3 = this.length;
    this.size = this.size * 2;
    const buf = Buffer.allocUnsafe(this.size);
    this.buf.copy(buf, 0, 0, length3);
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
    options.cast_date = function(value2) {
      const date = Date.parse(value2);
      return !isNaN(date) ? new Date(date) : value2;
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
      const { columns, group_columns_by_name, encoding, info: info3, from, relax_column_count, relax_column_count_less, relax_column_count_more, raw, skip_records_with_empty_values } = this.options;
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
      if (from === 1 || this.info.records >= from) {
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

// output-es/Data.Csv/foreign.js
function readCsvImpl(csvLine) {
  return parse(csvLine, {
    bom: true,
    quote: '"',
    columns: false,
    relax_column_count: true
  });
}

// output-es/Data.Csv/index.js
var toCsvRow = (v) => {
  if (v.length === 0) {
    return [];
  }
  return arrayMap((tpls) => tpls)(zipWithImpl(Tuple, rangeImpl(2, v.length + 1 | 0), v));
};
var readCsv = (x) => _bind(toAff2(readTextFile)(UTF8)(x))((csvContent) => _pure(readCsvImpl(csvContent)));
var create = (recs) => ({
  headers: 0 < recs.length ? $Maybe("Just", recs[0]) : Nothing,
  rows: (() => {
    const $0 = unconsImpl((v) => Nothing, (v) => (xs) => $Maybe("Just", xs), recs);
    if ($0.tag === "Just") {
      return $Maybe("Just", toCsvRow($0._1));
    }
    return Nothing;
  })()
});

// output-es/Data.Hashable/foreign.js
function hashString(s) {
  var h = 0;
  for (var i = 0; i < s.length; i++) {
    h = 31 * h + s.charCodeAt(i) | 0;
  }
  return h;
}

// output-es/Data.Hashable/index.js
var hashableString = { hash: hashString, Eq0: () => eqString };

// output-es/Data.NonEmpty/index.js
var $NonEmpty = (_1, _2) => ({ tag: "NonEmpty", _1, _2 });
var NonEmpty = (value0) => (value1) => $NonEmpty(value0, value1);
var traversableNonEmpty = (dictTraversable) => {
  const $0 = dictTraversable.Functor0();
  const functorNonEmpty1 = { map: (f) => (m) => $NonEmpty(f(m._1), $0.map(f)(m._2)) };
  const $1 = dictTraversable.Foldable1();
  const foldableNonEmpty1 = {
    foldMap: (dictMonoid) => {
      const foldMap1 = $1.foldMap(dictMonoid);
      return (f) => (v) => dictMonoid.Semigroup0().append(f(v._1))(foldMap1(f)(v._2));
    },
    foldl: (f) => (b) => (v) => $1.foldl(f)(f(b)(v._1))(v._2),
    foldr: (f) => (b) => (v) => f(v._1)($1.foldr(f)(b)(v._2))
  };
  return {
    sequence: (dictApplicative) => {
      const Apply0 = dictApplicative.Apply0();
      const sequence15 = dictTraversable.sequence(dictApplicative);
      return (v) => Apply0.apply(Apply0.Functor0().map(NonEmpty)(v._1))(sequence15(v._2));
    },
    traverse: (dictApplicative) => {
      const Apply0 = dictApplicative.Apply0();
      const traverse1 = dictTraversable.traverse(dictApplicative);
      return (f) => (v) => Apply0.apply(Apply0.Functor0().map(NonEmpty)(f(v._1)))(traverse1(f)(v._2));
    },
    Functor0: () => functorNonEmpty1,
    Foldable1: () => foldableNonEmpty1
  };
};
var foldable1NonEmpty = (dictFoldable) => {
  const foldableNonEmpty1 = {
    foldMap: (dictMonoid) => {
      const foldMap1 = dictFoldable.foldMap(dictMonoid);
      return (f) => (v) => dictMonoid.Semigroup0().append(f(v._1))(foldMap1(f)(v._2));
    },
    foldl: (f) => (b) => (v) => dictFoldable.foldl(f)(f(b)(v._1))(v._2),
    foldr: (f) => (b) => (v) => f(v._1)(dictFoldable.foldr(f)(b)(v._2))
  };
  return {
    foldMap1: (dictSemigroup) => (f) => (v) => dictFoldable.foldl((s) => (a1) => dictSemigroup.append(s)(f(a1)))(f(v._1))(v._2),
    foldr1: (f) => (v) => {
      const $0 = f(v._1);
      const $1 = dictFoldable.foldr((a1) => {
        const $12 = f(a1);
        return (x) => $Maybe(
          "Just",
          (() => {
            if (x.tag === "Nothing") {
              return a1;
            }
            if (x.tag === "Just") {
              return $12(x._1);
            }
            fail();
          })()
        );
      })(Nothing)(v._2);
      if ($1.tag === "Nothing") {
        return v._1;
      }
      if ($1.tag === "Just") {
        return $0($1._1);
      }
      fail();
    },
    foldl1: (f) => (v) => dictFoldable.foldl(f)(v._1)(v._2),
    Foldable0: () => foldableNonEmpty1
  };
};
var ordNonEmpty = (dictOrd1) => {
  const $0 = dictOrd1.Eq10();
  return (dictOrd) => {
    const compare11 = dictOrd1.compare1(dictOrd);
    const $1 = dictOrd.Eq0();
    const eq11 = $0.eq1($1);
    const eqNonEmpty2 = { eq: (x) => (y) => $1.eq(x._1)(y._1) && eq11(x._2)(y._2) };
    return {
      compare: (x) => (y) => {
        const v = dictOrd.compare(x._1)(y._1);
        if (v === "LT") {
          return LT;
        }
        if (v === "GT") {
          return GT;
        }
        return compare11(x._2)(y._2);
      },
      Eq0: () => eqNonEmpty2
    };
  };
};

// output-es/Data.List.Types/index.js
var $List = (tag, _1, _2) => ({ tag, _1, _2 });
var identity5 = (x) => x;
var Nil = /* @__PURE__ */ $List("Nil");
var Cons = (value0) => (value1) => $List("Cons", value0, value1);
var listMap = (f) => {
  const chunkedRevMap = (chunkedRevMap$a0$copy) => (chunkedRevMap$a1$copy) => {
    let chunkedRevMap$a0 = chunkedRevMap$a0$copy, chunkedRevMap$a1 = chunkedRevMap$a1$copy, chunkedRevMap$c = true, chunkedRevMap$r;
    while (chunkedRevMap$c) {
      const v = chunkedRevMap$a0, v1 = chunkedRevMap$a1;
      if (v1.tag === "Cons" && v1._2.tag === "Cons" && v1._2._2.tag === "Cons") {
        chunkedRevMap$a0 = $List("Cons", v1, v);
        chunkedRevMap$a1 = v1._2._2._2;
        continue;
      }
      const reverseUnrolledMap = (reverseUnrolledMap$a0$copy) => (reverseUnrolledMap$a1$copy) => {
        let reverseUnrolledMap$a0 = reverseUnrolledMap$a0$copy, reverseUnrolledMap$a1 = reverseUnrolledMap$a1$copy, reverseUnrolledMap$c = true, reverseUnrolledMap$r;
        while (reverseUnrolledMap$c) {
          const v2 = reverseUnrolledMap$a0, v3 = reverseUnrolledMap$a1;
          if (v2.tag === "Cons" && v2._1.tag === "Cons" && v2._1._2.tag === "Cons" && v2._1._2._2.tag === "Cons") {
            reverseUnrolledMap$a0 = v2._2;
            reverseUnrolledMap$a1 = $List("Cons", f(v2._1._1), $List("Cons", f(v2._1._2._1), $List("Cons", f(v2._1._2._2._1), v3)));
            continue;
          }
          reverseUnrolledMap$c = false;
          reverseUnrolledMap$r = v3;
        }
        return reverseUnrolledMap$r;
      };
      chunkedRevMap$c = false;
      chunkedRevMap$r = reverseUnrolledMap(v)((() => {
        if (v1.tag === "Cons") {
          if (v1._2.tag === "Cons") {
            if (v1._2._2.tag === "Nil") {
              return $List("Cons", f(v1._1), $List("Cons", f(v1._2._1), Nil));
            }
            return Nil;
          }
          if (v1._2.tag === "Nil") {
            return $List("Cons", f(v1._1), Nil);
          }
        }
        return Nil;
      })());
    }
    return chunkedRevMap$r;
  };
  return chunkedRevMap(Nil);
};
var functorList = { map: listMap };
var functorNonEmptyList = { map: (f) => (m) => $NonEmpty(f(m._1), listMap(f)(m._2)) };
var foldableList = {
  foldr: (f) => (b) => {
    const $0 = foldableList.foldl((b$1) => (a) => f(a)(b$1))(b);
    const go = (go$a0$copy) => (go$a1$copy) => {
      let go$a0 = go$a0$copy, go$a1 = go$a1$copy, go$c = true, go$r;
      while (go$c) {
        const v = go$a0, v1 = go$a1;
        if (v1.tag === "Nil") {
          go$c = false;
          go$r = v;
          continue;
        }
        if (v1.tag === "Cons") {
          go$a0 = $List("Cons", v1._1, v);
          go$a1 = v1._2;
          continue;
        }
        fail();
      }
      return go$r;
    };
    const $1 = go(Nil);
    return (x) => $0($1(x));
  },
  foldl: (f) => {
    const go = (go$a0$copy) => (go$a1$copy) => {
      let go$a0 = go$a0$copy, go$a1 = go$a1$copy, go$c = true, go$r;
      while (go$c) {
        const b = go$a0, v = go$a1;
        if (v.tag === "Nil") {
          go$c = false;
          go$r = b;
          continue;
        }
        if (v.tag === "Cons") {
          go$a0 = f(b)(v._1);
          go$a1 = v._2;
          continue;
        }
        fail();
      }
      return go$r;
    };
    return go;
  },
  foldMap: (dictMonoid) => {
    const mempty = dictMonoid.mempty;
    return (f) => foldableList.foldl((acc) => {
      const $0 = dictMonoid.Semigroup0().append(acc);
      return (x) => $0(f(x));
    })(mempty);
  }
};
var foldableNonEmptyList = {
  foldMap: (dictMonoid) => {
    const foldMap1 = foldableList.foldMap(dictMonoid);
    return (f) => (v) => dictMonoid.Semigroup0().append(f(v._1))(foldMap1(f)(v._2));
  },
  foldl: (f) => (b) => (v) => {
    const go = (go$a0$copy) => (go$a1$copy) => {
      let go$a0 = go$a0$copy, go$a1 = go$a1$copy, go$c = true, go$r;
      while (go$c) {
        const b$1 = go$a0, v$1 = go$a1;
        if (v$1.tag === "Nil") {
          go$c = false;
          go$r = b$1;
          continue;
        }
        if (v$1.tag === "Cons") {
          go$a0 = f(b$1)(v$1._1);
          go$a1 = v$1._2;
          continue;
        }
        fail();
      }
      return go$r;
    };
    return go(f(b)(v._1))(v._2);
  },
  foldr: (f) => (b) => (v) => f(v._1)(foldableList.foldr(f)(b)(v._2))
};
var showList = (dictShow) => {
  const show3 = dictShow.show;
  return {
    show: (v) => {
      if (v.tag === "Nil") {
        return "Nil";
      }
      const go = (go$a0$copy) => (go$a1$copy) => {
        let go$a0 = go$a0$copy, go$a1 = go$a1$copy, go$c = true, go$r;
        while (go$c) {
          const b = go$a0, v$1 = go$a1;
          if (v$1.tag === "Nil") {
            go$c = false;
            go$r = b;
            continue;
          }
          if (v$1.tag === "Cons") {
            go$a0 = b.init ? { init: false, acc: v$1._1 } : { init: false, acc: b.acc + " : " + v$1._1 };
            go$a1 = v$1._2;
            continue;
          }
          fail();
        }
        return go$r;
      };
      return "(" + go({ init: true, acc: "" })(listMap(show3)(v)).acc + " : Nil)";
    }
  };
};
var showNonEmptyList = (dictShow) => {
  const $0 = showList(dictShow);
  return { show: (v) => "(NonEmptyList (NonEmpty " + dictShow.show(v._1) + " " + $0.show(v._2) + "))" };
};
var traversableList = {
  traverse: (dictApplicative) => {
    const Apply0 = dictApplicative.Apply0();
    return (f) => {
      const $0 = Apply0.Functor0().map((() => {
        const go2 = (go$a0$copy) => (go$a1$copy) => {
          let go$a0 = go$a0$copy, go$a1 = go$a1$copy, go$c = true, go$r;
          while (go$c) {
            const b = go$a0, v = go$a1;
            if (v.tag === "Nil") {
              go$c = false;
              go$r = b;
              continue;
            }
            if (v.tag === "Cons") {
              go$a0 = $List("Cons", v._1, b);
              go$a1 = v._2;
              continue;
            }
            fail();
          }
          return go$r;
        };
        return go2(Nil);
      })());
      const go = (go$a0$copy) => (go$a1$copy) => {
        let go$a0 = go$a0$copy, go$a1 = go$a1$copy, go$c = true, go$r;
        while (go$c) {
          const b = go$a0, v = go$a1;
          if (v.tag === "Nil") {
            go$c = false;
            go$r = b;
            continue;
          }
          if (v.tag === "Cons") {
            go$a0 = Apply0.apply(Apply0.Functor0().map((b$1) => (a) => $List("Cons", a, b$1))(b))(f(v._1));
            go$a1 = v._2;
            continue;
          }
          fail();
        }
        return go$r;
      };
      const $1 = go(dictApplicative.pure(Nil));
      return (x) => $0($1(x));
    };
  },
  sequence: (dictApplicative) => traversableList.traverse(dictApplicative)(identity5),
  Functor0: () => functorList,
  Foldable1: () => foldableList
};
var traversableNonEmptyList = /* @__PURE__ */ traversableNonEmpty(traversableList);
var unfoldable1List = {
  unfoldr1: (f) => (b) => {
    const go = (go$a0$copy) => (go$a1$copy) => {
      let go$a0 = go$a0$copy, go$a1 = go$a1$copy, go$c = true, go$r;
      while (go$c) {
        const source2 = go$a0, memo = go$a1;
        const v = f(source2);
        if (v._2.tag === "Just") {
          go$a0 = v._2._1;
          go$a1 = $List("Cons", v._1, memo);
          continue;
        }
        if (v._2.tag === "Nothing") {
          const go$1 = (go$1$a0$copy) => (go$1$a1$copy) => {
            let go$1$a0 = go$1$a0$copy, go$1$a1 = go$1$a1$copy, go$1$c = true, go$1$r;
            while (go$1$c) {
              const b$1 = go$1$a0, v$1 = go$1$a1;
              if (v$1.tag === "Nil") {
                go$1$c = false;
                go$1$r = b$1;
                continue;
              }
              if (v$1.tag === "Cons") {
                go$1$a0 = $List("Cons", v$1._1, b$1);
                go$1$a1 = v$1._2;
                continue;
              }
              fail();
            }
            return go$1$r;
          };
          go$c = false;
          go$r = go$1(Nil)($List("Cons", v._1, memo));
          continue;
        }
        fail();
      }
      return go$r;
    };
    return go(b)(Nil);
  }
};
var unfoldableList = {
  unfoldr: (f) => (b) => {
    const go = (go$a0$copy) => (go$a1$copy) => {
      let go$a0 = go$a0$copy, go$a1 = go$a1$copy, go$c = true, go$r;
      while (go$c) {
        const source2 = go$a0, memo = go$a1;
        const v = f(source2);
        if (v.tag === "Nothing") {
          const go$1 = (go$1$a0$copy) => (go$1$a1$copy) => {
            let go$1$a0 = go$1$a0$copy, go$1$a1 = go$1$a1$copy, go$1$c = true, go$1$r;
            while (go$1$c) {
              const b$1 = go$1$a0, v$1 = go$1$a1;
              if (v$1.tag === "Nil") {
                go$1$c = false;
                go$1$r = b$1;
                continue;
              }
              if (v$1.tag === "Cons") {
                go$1$a0 = $List("Cons", v$1._1, b$1);
                go$1$a1 = v$1._2;
                continue;
              }
              fail();
            }
            return go$1$r;
          };
          go$c = false;
          go$r = go$1(Nil)(memo);
          continue;
        }
        if (v.tag === "Just") {
          go$a0 = v._1._2;
          go$a1 = $List("Cons", v._1._1, memo);
          continue;
        }
        fail();
      }
      return go$r;
    };
    return go(b)(Nil);
  },
  Unfoldable10: () => unfoldable1List
};
var foldable1NonEmptyList = /* @__PURE__ */ foldable1NonEmpty(foldableList);
var eq1List = {
  eq1: (dictEq) => (xs) => (ys) => {
    const go = (v) => (v1) => (v2) => {
      if (!v2) {
        return false;
      }
      if (v.tag === "Nil") {
        return v1.tag === "Nil" && v2;
      }
      return v.tag === "Cons" && v1.tag === "Cons" && go(v._2)(v1._2)(v2 && dictEq.eq(v1._1)(v._1));
    };
    return go(xs)(ys)(true);
  }
};
var ord1List = {
  compare1: (dictOrd) => (xs) => (ys) => {
    const go = (go$a0$copy) => (go$a1$copy) => {
      let go$a0 = go$a0$copy, go$a1 = go$a1$copy, go$c = true, go$r;
      while (go$c) {
        const v = go$a0, v1 = go$a1;
        if (v.tag === "Nil") {
          if (v1.tag === "Nil") {
            go$c = false;
            go$r = EQ;
            continue;
          }
          go$c = false;
          go$r = LT;
          continue;
        }
        if (v1.tag === "Nil") {
          go$c = false;
          go$r = GT;
          continue;
        }
        if (v.tag === "Cons" && v1.tag === "Cons") {
          const v2 = dictOrd.compare(v._1)(v1._1);
          if (v2 === "EQ") {
            go$a0 = v._2;
            go$a1 = v1._2;
            continue;
          }
          go$c = false;
          go$r = v2;
          continue;
        }
        fail();
      }
      return go$r;
    };
    return go(xs)(ys);
  },
  Eq10: () => eq1List
};
var ordNonEmpty2 = /* @__PURE__ */ ordNonEmpty(ord1List);
var applyList = {
  apply: (v) => (v1) => {
    if (v.tag === "Nil") {
      return Nil;
    }
    if (v.tag === "Cons") {
      return foldableList.foldr(Cons)(applyList.apply(v._2)(v1))(listMap(v._1)(v1));
    }
    fail();
  },
  Functor0: () => functorList
};
var applyNonEmptyList = {
  apply: (v) => (v1) => $NonEmpty(
    v._1(v1._1),
    foldableList.foldr(Cons)(applyList.apply($List("Cons", v._1, v._2))(v1._2))(applyList.apply(v._2)($List("Cons", v1._1, Nil)))
  ),
  Functor0: () => functorNonEmptyList
};
var applicativeNonEmptyList = { pure: (x) => $NonEmpty(x, Nil), Apply0: () => applyNonEmptyList };
var traversable1NonEmptyList = {
  traverse1: (dictApply) => {
    const Functor0 = dictApply.Functor0();
    return (f) => (v) => Functor0.map((v1) => {
      const go = (go$a0$copy) => (go$a1$copy) => {
        let go$a0 = go$a0$copy, go$a1 = go$a1$copy, go$c = true, go$r;
        while (go$c) {
          const b = go$a0, v$1 = go$a1;
          if (v$1.tag === "Nil") {
            go$c = false;
            go$r = b;
            continue;
          }
          if (v$1.tag === "Cons") {
            go$a0 = $NonEmpty(v$1._1, $List("Cons", b._1, b._2));
            go$a1 = v$1._2;
            continue;
          }
          fail();
        }
        return go$r;
      };
      return go($NonEmpty(v1._1, Nil))(v1._2);
    })((() => {
      const go = (go$a0$copy) => (go$a1$copy) => {
        let go$a0 = go$a0$copy, go$a1 = go$a1$copy, go$c = true, go$r;
        while (go$c) {
          const b = go$a0, v$1 = go$a1;
          if (v$1.tag === "Nil") {
            go$c = false;
            go$r = b;
            continue;
          }
          if (v$1.tag === "Cons") {
            go$a0 = dictApply.apply(dictApply.Functor0().map((b$1) => (a) => $NonEmpty(a, $List("Cons", b$1._1, b$1._2)))(b))(f(v$1._1));
            go$a1 = v$1._2;
            continue;
          }
          fail();
        }
        return go$r;
      };
      return go(Functor0.map(applicativeNonEmptyList.pure)(f(v._1)))(v._2);
    })());
  },
  sequence1: (dictApply) => traversable1NonEmptyList.traverse1(dictApply)(identity5),
  Foldable10: () => foldable1NonEmptyList,
  Traversable1: () => traversableNonEmptyList
};

// output-es/Data.Validation.Issue/index.js
var $Issue = (tag, _1, _2, _3) => ({ tag, _1, _2, _3 });
var NotImplemented = /* @__PURE__ */ $Issue("NotImplemented");
var showId = {
  show: (v) => {
    if (v.tag === "NotImplemented") {
      return "Not Implemented";
    }
    if (v.tag === "Issue") {
      return v._1;
    }
    if (v.tag === "InvalidValue") {
      return "invalid value " + showStringImpl(v._1) + ": " + v._2;
    }
    if (v.tag === "InvalidCSV") {
      return v._1;
    }
    if (v.tag === "InvalidItem") {
      return v._3;
    }
    fail();
  }
};
var toInvaildItem = (v) => (v1) => (v2) => {
  if (v2.tag === "NotImplemented") {
    return NotImplemented;
  }
  return $Issue("InvalidItem", v, v1, showId.show(v2));
};
var withRowInfo = (fp) => (row) => (v2) => {
  if (v2.tag === "Left") {
    return $Either("Left", arrayMap(toInvaildItem(fp)(row))(v2._1));
  }
  if (v2.tag === "Right") {
    return $Either("Right", v2._1);
  }
  fail();
};

// output-es/Data.Semigroup/foreign.js
var concatArray = function(xs) {
  return function(ys) {
    if (xs.length === 0)
      return ys;
    if (ys.length === 0)
      return xs;
    return xs.concat(ys);
  };
};

// output-es/Data.Semigroup/index.js
var semigroupArray = { append: concatArray };

// output-es/Data.Monoid/index.js
var monoidArray = { mempty: [], Semigroup0: () => semigroupArray };

// output-es/Data.List/index.js
var reverse2 = /* @__PURE__ */ (() => {
  const go = (go$a0$copy) => (go$a1$copy) => {
    let go$a0 = go$a0$copy, go$a1 = go$a1$copy, go$c = true, go$r;
    while (go$c) {
      const v = go$a0, v1 = go$a1;
      if (v1.tag === "Nil") {
        go$c = false;
        go$r = v;
        continue;
      }
      if (v1.tag === "Cons") {
        go$a0 = $List("Cons", v1._1, v);
        go$a1 = v1._2;
        continue;
      }
      fail();
    }
    return go$r;
  };
  return go(Nil);
})();
var zipWith = (f) => (xs) => (ys) => {
  const go = (go$a0$copy) => (go$a1$copy) => (go$a2$copy) => {
    let go$a0 = go$a0$copy, go$a1 = go$a1$copy, go$a2 = go$a2$copy, go$c = true, go$r;
    while (go$c) {
      const v = go$a0, v1 = go$a1, v2 = go$a2;
      if (v.tag === "Nil") {
        go$c = false;
        go$r = v2;
        continue;
      }
      if (v1.tag === "Nil") {
        go$c = false;
        go$r = v2;
        continue;
      }
      if (v.tag === "Cons" && v1.tag === "Cons") {
        go$a0 = v._2;
        go$a1 = v1._2;
        go$a2 = $List("Cons", f(v._1)(v1._1), v2);
        continue;
      }
      fail();
    }
    return go$r;
  };
  return reverse2(go(xs)(ys)(Nil));
};
var partition = (p) => (xs) => foldableList.foldr((x) => (v) => {
  if (p(x)) {
    return { no: v.no, yes: $List("Cons", x, v.yes) };
  }
  return { no: $List("Cons", x, v.no), yes: v.yes };
})({ no: Nil, yes: Nil })(xs);
var manyRec = (dictMonadRec) => (dictAlternative) => {
  const Alt0 = dictAlternative.Plus1().Alt0();
  const $0 = dictAlternative.Applicative0();
  return (p) => dictMonadRec.tailRecM((acc) => dictMonadRec.Monad0().Bind1().bind(Alt0.alt(Alt0.Functor0().map(Loop)(p))($0.pure($Step(
    "Done",
    void 0
  ))))((aa) => $0.pure((() => {
    if (aa.tag === "Loop") {
      return $Step("Loop", $List("Cons", aa._1, acc));
    }
    if (aa.tag === "Done") {
      return $Step("Done", reverse2(acc));
    }
    fail();
  })())))(Nil);
};

// output-es/Data.List.NonEmpty/index.js
var zipWith2 = (f) => (v) => (v1) => $NonEmpty(f(v._1)(v1._1), zipWith(f)(v._2)(v1._2));

// output-es/StringParser.Parser/index.js
var functorParser = {
  map: (f) => (v) => (x) => {
    const $0 = v(x);
    if ($0.tag === "Left") {
      return $Either("Left", $0._1);
    }
    if ($0.tag === "Right") {
      return $Either("Right", { result: f($0._1.result), suffix: $0._1.suffix });
    }
    fail();
  }
};
var applyParser = {
  apply: (v) => (v1) => (s) => {
    const $0 = v(s);
    return (() => {
      if ($0.tag === "Left") {
        const $1 = $0._1;
        return (v$1) => $Either("Left", $1);
      }
      if ($0.tag === "Right") {
        const $1 = $0._1;
        return (f) => f($1);
      }
      fail();
    })()((v2) => {
      const $1 = v1(v2.suffix);
      return (() => {
        if ($1.tag === "Left") {
          const $2 = $1._1;
          return (v$1) => $Either("Left", $2);
        }
        if ($1.tag === "Right") {
          const $2 = $1._1;
          return (f) => f($2);
        }
        fail();
      })()((v3) => $Either("Right", { result: v2.result(v3.result), suffix: v3.suffix }));
    });
  },
  Functor0: () => functorParser
};
var bindParser = {
  bind: (v) => (f) => (s) => {
    const $0 = v(s);
    return (() => {
      if ($0.tag === "Left") {
        const $1 = $0._1;
        return (v$1) => $Either("Left", $1);
      }
      if ($0.tag === "Right") {
        const $1 = $0._1;
        return (f$1) => f$1($1);
      }
      fail();
    })()((v1) => f(v1.result)(v1.suffix));
  },
  Apply0: () => applyParser
};
var applicativeParser = { pure: (a) => (s) => $Either("Right", { result: a, suffix: s }), Apply0: () => applyParser };
var monadParser = { Applicative0: () => applicativeParser, Bind1: () => bindParser };
var monadRecParser = {
  tailRecM: (f) => (a) => (str) => {
    const $0 = (st) => {
      const $02 = f(st.state)(st.str);
      if ($02.tag === "Left") {
        return $Either("Left", $02._1);
      }
      if ($02.tag === "Right") {
        return $Either(
          "Right",
          (() => {
            if ($02._1.result.tag === "Loop") {
              return $Step("Loop", { state: $02._1.result._1, str: $02._1.suffix });
            }
            if ($02._1.result.tag === "Done") {
              return $Step("Done", { result: $02._1.result._1, suffix: $02._1.suffix });
            }
            fail();
          })()
        );
      }
      fail();
    };
    const $1 = (v) => {
      if (v.tag === "Left") {
        return $Step("Done", $Either("Left", v._1));
      }
      if (v.tag === "Right") {
        if (v._1.tag === "Loop") {
          return $Step("Loop", $0(v._1._1));
        }
        if (v._1.tag === "Done") {
          return $Step("Done", $Either("Right", v._1._1));
        }
      }
      fail();
    };
    const go = (go$a0$copy) => {
      let go$a0 = go$a0$copy, go$c = true, go$r;
      while (go$c) {
        const v = go$a0;
        if (v.tag === "Loop") {
          go$a0 = $1(v._1);
          continue;
        }
        if (v.tag === "Done") {
          go$c = false;
          go$r = v._1;
          continue;
        }
        fail();
      }
      return go$r;
    };
    return go($1($0({ state: a, str })));
  },
  Monad0: () => monadParser
};
var altParser = {
  alt: (v) => (v1) => (s) => {
    const v2 = v(s);
    if (v2.tag === "Left") {
      if (s.position === v2._1.pos) {
        return v1(s);
      }
      return $Either("Left", { error: v2._1.error, pos: v2._1.pos });
    }
    return v2;
  },
  Functor0: () => functorParser
};
var plusParser = { empty: (v) => $Either("Left", { pos: v.position, error: "No alternative" }), Alt0: () => altParser };
var alternativeParser = { Applicative0: () => applicativeParser, Plus1: () => plusParser };

// output-es/StringParser.Combinators/index.js
var many = /* @__PURE__ */ (() => {
  const $0 = manyRec(monadRecParser)(alternativeParser);
  return (x) => $0((s) => {
    const v1 = x(s);
    if (v1.tag === "Right") {
      if (s.position < v1._1.suffix.position) {
        return $Either("Right", v1._1);
      }
      return $Either("Left", { pos: s.position, error: "Consumed no input." });
    }
    return v1;
  });
})();
var many1 = (p) => applyParser.apply((x) => {
  const $0 = p(x);
  if ($0.tag === "Left") {
    return $Either("Left", $0._1);
  }
  if ($0.tag === "Right") {
    return $Either(
      "Right",
      {
        result: (() => {
          const $1 = $0._1.result;
          return (t) => $NonEmpty($1, t);
        })(),
        suffix: $0._1.suffix
      }
    );
  }
  fail();
})(many(p));
var sepBy1 = (p) => (sep2) => (s) => {
  const $0 = p(s);
  return (() => {
    if ($0.tag === "Left") {
      const $1 = $0._1;
      return (v) => $Either("Left", $1);
    }
    if ($0.tag === "Right") {
      const $1 = $0._1;
      return (f) => f($1);
    }
    fail();
  })()((v1) => {
    const $1 = v1.result;
    const $2 = many(applyParser.apply((x) => {
      const $22 = sep2(x);
      if ($22.tag === "Left") {
        return $Either("Left", $22._1);
      }
      if ($22.tag === "Right") {
        return $Either("Right", { result: identity, suffix: $22._1.suffix });
      }
      fail();
    })(p))(v1.suffix);
    return (() => {
      if ($2.tag === "Left") {
        const $3 = $2._1;
        return (v) => $Either("Left", $3);
      }
      if ($2.tag === "Right") {
        const $3 = $2._1;
        return (f) => f($3);
      }
      fail();
    })()((v1$1) => $Either("Right", { result: $NonEmpty($1, v1$1.result), suffix: v1$1.suffix }));
  });
};

// output-es/StringParser.CodeUnits/index.js
var anyChar = (v) => {
  const v1 = charAt2(0)(v.substring);
  if (v1.tag === "Just") {
    return $Either("Right", { result: v1._1, suffix: { substring: drop(1)(v.substring), position: v.position + 1 | 0 } });
  }
  if (v1.tag === "Nothing") {
    return $Either("Left", { pos: v.position, error: "Unexpected EOF" });
  }
  fail();
};

// output-es/StringParser.CodePoints/index.js
var elem2 = /* @__PURE__ */ (() => {
  const any1 = foldableArray.foldMap((() => {
    const semigroupDisj1 = { append: (v) => (v1) => v || v1 };
    return { mempty: false, Semigroup0: () => semigroupDisj1 };
  })());
  return (x) => any1(($0) => x === $0);
})();
var string = (pattern) => (v) => {
  const length3 = toCodePointArray(pattern).length;
  const v1 = splitAt2(length3)(v.substring);
  if (v1.before === pattern) {
    return $Either("Right", { result: pattern, suffix: { substring: v1.after, position: v.position + length3 | 0 } });
  }
  return $Either("Left", { pos: v.position, error: "Expected '" + pattern + "'." });
};
var lowerCaseChar = (s) => {
  const $0 = anyChar(s);
  const v1 = (() => {
    if ($0.tag === "Left") {
      const $1 = $0._1;
      return (v) => $Either("Left", $1);
    }
    if ($0.tag === "Right") {
      const $1 = $0._1;
      return (f) => f($1);
    }
    fail();
  })()((v12) => {
    if (elem2(toCharCode(v12.result))(rangeImpl(97, 122))) {
      return $Either("Right", { result: v12.result, suffix: v12.suffix });
    }
    return $Either("Left", { pos: v12.suffix.position, error: "Expected a lower case character but found " + showCharImpl(v12.result) });
  });
  if (v1.tag === "Left") {
    return $Either("Left", { pos: s.position, error: v1._1.error });
  }
  return v1;
};
var eof = (s) => {
  if (0 < toCodePointArray(s.substring).length) {
    return $Either("Left", { pos: s.position, error: "Expected EOF" });
  }
  return $Either("Right", { result: void 0, suffix: s });
};
var anyDigit = (s) => {
  const $0 = anyChar(s);
  const v1 = (() => {
    if ($0.tag === "Left") {
      const $1 = $0._1;
      return (v) => $Either("Left", $1);
    }
    if ($0.tag === "Right") {
      const $1 = $0._1;
      return (f) => f($1);
    }
    fail();
  })()((v12) => {
    if (v12.result >= "0" && v12.result <= "9") {
      return $Either("Right", { result: v12.result, suffix: v12.suffix });
    }
    return $Either("Left", { pos: v12.suffix.position, error: "Character " + showCharImpl(v12.result) + " is not a digit" });
  });
  if (v1.tag === "Left") {
    return $Either("Left", { pos: s.position, error: v1._1.error });
  }
  return v1;
};
var anyCodePoint = (v) => {
  const v1 = uncons(v.substring);
  if (v1.tag === "Nothing") {
    return $Either("Left", { pos: v.position, error: "Unexpected EOF" });
  }
  if (v1.tag === "Just") {
    return $Either("Right", { result: v1._1.head, suffix: { substring: v1._1.tail, position: v.position + 1 | 0 } });
  }
  fail();
};
var anyChar2 = (s) => {
  const $0 = anyCodePoint(s);
  if ($0.tag === "Left") {
    return $Either("Left", $0._1);
  }
  if ($0.tag === "Right") {
    if ($0._1.result >= 0 && $0._1.result <= 65535) {
      if ($0._1.result > 65535) {
        return $Either("Left", { pos: $0._1.suffix.position, error: "Code point " + showIntImpl($0._1.result) + " is not a character" });
      }
      return $Either("Right", { result: fromCharCode($0._1.result), suffix: $0._1.suffix });
    }
    return $Either("Left", { pos: $0._1.suffix.position, error: "Code point " + showIntImpl($0._1.result) + " is not a character" });
  }
  fail();
};
var satisfy = (f) => (s) => {
  const $0 = anyChar2(s);
  const v1 = (() => {
    if ($0.tag === "Left") {
      const $1 = $0._1;
      return (v) => $Either("Left", $1);
    }
    if ($0.tag === "Right") {
      const $1 = $0._1;
      return (f$1) => f$1($1);
    }
    fail();
  })()((v12) => {
    if (f(v12.result)) {
      return $Either("Right", { result: v12.result, suffix: v12.suffix });
    }
    return $Either("Left", { pos: v12.suffix.position, error: "Character " + showCharImpl(v12.result) + " did not satisfy predicate" });
  });
  if (v1.tag === "Left") {
    return $Either("Left", { pos: s.position, error: v1._1.error });
  }
  return v1;
};
var $$char = (c) => {
  const $0 = satisfy((v) => v === c);
  const $1 = "Could not match character " + showCharImpl(c);
  return (s) => {
    const v2 = $0(s);
    if (v2.tag === "Left") {
      if (s.position === v2._1.pos) {
        return $Either("Left", { pos: s.position, error: $1 });
      }
      return $Either("Left", { error: v2._1.error, pos: v2._1.pos });
    }
    return v2;
  };
};

// output-es/Data.DDF.Atoms.Identifier/index.js
var value = (v) => v;
var unsafeCreate = (x) => {
  if (x === "") {
    return "undefined_id";
  }
  return x;
};
var showId2 = { show: (v) => "(Id " + showStringImpl(v) + ")" };
var isLongerThan64Chars = (a) => {
  const v = charAt2(64)(a);
  if (v.tag === "Nothing") {
    return $Either("Right", a);
  }
  if (v.tag === "Just") {
    return $Either("Left", [$Issue("InvalidValue", take2(15)(a) + "...", "longer than 64 chars")]);
  }
  fail();
};
var eqId = { eq: (x) => (y) => x === y };
var hashableId = { hash: (v) => hashString(v), Eq0: () => eqId };
var ordId = { compare: (x) => (y) => ordString.compare(x)(y), Eq0: () => eqId };
var alphaNumLower = (s) => {
  const v2 = lowerCaseChar(s);
  if (v2.tag === "Left") {
    if (s.position === v2._1.pos) {
      const v2$1 = anyDigit(s);
      if (v2$1.tag === "Left") {
        if (s.position === v2$1._1.pos) {
          return $Either("Left", { pos: s.position, error: "expect lowercase alphanumeric value" });
        }
        return $Either("Left", { error: v2$1._1.error, pos: v2$1._1.pos });
      }
      return v2$1;
    }
    return $Either("Left", { error: v2._1.error, pos: v2._1.pos });
  }
  return v2;
};
var alphaNumAnd_ = /* @__PURE__ */ (() => {
  const $0 = $$char("_");
  return (s) => {
    const v2 = alphaNumLower(s);
    if (v2.tag === "Left") {
      if (s.position === v2._1.pos) {
        const v2$1 = $0(s);
        if (v2$1.tag === "Left") {
          if (s.position === v2$1._1.pos) {
            return $Either("Left", { pos: s.position, error: "expect lowercase alphanumeric and underscore _" });
          }
          return $Either("Left", { error: v2$1._1.error, pos: v2$1._1.pos });
        }
        return v2$1;
      }
      return $Either("Left", { error: v2._1.error, pos: v2._1.pos });
    }
    return v2;
  };
})();
var identifier = /* @__PURE__ */ (() => {
  const $0 = foldable1NonEmptyList.Foldable0().foldr;
  return (s) => {
    const $1 = many1(alphaNumAnd_)(s);
    return (() => {
      if ($1.tag === "Left") {
        const $2 = $1._1;
        return (v) => $Either("Left", $2);
      }
      if ($1.tag === "Right") {
        const $2 = $1._1;
        return (f) => f($2);
      }
      fail();
    })()((v1) => {
      const $2 = fromFoldableImpl($0, v1.result);
      return $Either(
        "Right",
        {
          result: (() => {
            if ($2.length === 0) {
              fail();
            }
            return fromCharArray($2);
          })(),
          suffix: v1.suffix
        }
      );
    });
  };
})();
var identifier$p = /* @__PURE__ */ (() => applyParser.apply((x) => {
  const $0 = identifier(x);
  if ($0.tag === "Left") {
    return $Either("Left", $0._1);
  }
  if ($0.tag === "Right") {
    return $Either(
      "Right",
      {
        result: (() => {
          const $1 = $0._1.result;
          return (v) => $1;
        })(),
        suffix: $0._1.suffix
      }
    );
  }
  fail();
})(eof))();
var parseId = (x) => {
  const $0 = identifier$p({ substring: x, position: 0 });
  if ($0.tag === "Left") {
    return $Either("Left", [$Issue("InvalidValue", x, $0._1.error + "at pos " + showIntImpl($0._1.pos))]);
  }
  if ($0.tag === "Right") {
    return $Either("Right", $0._1.result);
  }
  fail();
};
var parseId$p = (x) => parseId(x);

// output-es/Data.FoldableWithIndex/index.js
var monoidEndo2 = /* @__PURE__ */ (() => {
  const semigroupEndo1 = { append: (v) => (v1) => (x) => v(v1(x)) };
  return { mempty: (x) => x, Semigroup0: () => semigroupEndo1 };
})();
var monoidDual2 = /* @__PURE__ */ (() => {
  const $0 = monoidEndo2.Semigroup0();
  const semigroupDual1 = { append: (v) => (v1) => $0.append(v1)(v) };
  return { mempty: monoidEndo2.mempty, Semigroup0: () => semigroupDual1 };
})();
var foldlWithIndexDefault = (dictFoldableWithIndex) => {
  const foldMapWithIndex1 = dictFoldableWithIndex.foldMapWithIndex(monoidDual2);
  return (c) => (u) => (xs) => foldMapWithIndex1((i) => {
    const $0 = c(i);
    return (x) => (a) => $0(a)(x);
  })(xs)(u);
};
var foldrWithIndexDefault = (dictFoldableWithIndex) => {
  const foldMapWithIndex1 = dictFoldableWithIndex.foldMapWithIndex(monoidEndo2);
  return (c) => (u) => (xs) => foldMapWithIndex1((i) => c(i))(xs)(u);
};

// output-es/Data.HashMap/foreign.js
function MapNode(datamap, nodemap, content) {
  this.datamap = datamap;
  this.nodemap = nodemap;
  this.content = content;
}
MapNode.prototype.lookup = function lookup(Nothing2, Just2, keyEquals, key, keyHash, shift) {
  var bit = mask(keyHash, shift);
  if ((this.datamap & bit) !== 0) {
    var i = index2(this.datamap, bit);
    if (keyEquals(key)(this.content[i * 2]))
      return Just2(this.content[i * 2 + 1]);
    return Nothing2;
  }
  if ((this.nodemap & bit) !== 0) {
    return this.content[this.content.length - 1 - index2(this.nodemap, bit)].lookup(Nothing2, Just2, keyEquals, key, keyHash, shift + 5);
  }
  return Nothing2;
};
function remove2insert1Mut(a, removeIndex, insertIndex, v1) {
  for (var i = removeIndex; i < insertIndex; i++)
    a[i] = a[i + 2];
  a[i++] = v1;
  for (; i < a.length - 1; i++)
    a[i] = a[i + 1];
  a.length = a.length - 1;
}
MapNode.prototype.insertMut = function insertMut(keyEquals, hashFunction, key, keyHash, value2, shift) {
  var bit = mask(keyHash, shift);
  var i = index2(this.datamap, bit);
  if ((this.datamap & bit) !== 0) {
    var k = this.content[i * 2];
    if (keyEquals(k)(key)) {
      this.content[i * 2 + 1] = value2;
    } else {
      var newNode = binaryNode(k, hashFunction(k), this.content[i * 2 + 1], key, keyHash, value2, shift + 5);
      this.datamap = this.datamap ^ bit;
      this.nodemap = this.nodemap | bit;
      remove2insert1Mut(this.content, i * 2, this.content.length - index2(this.nodemap, bit) - 2, newNode);
    }
  } else if ((this.nodemap & bit) !== 0) {
    var n = this.content.length - 1 - index2(this.nodemap, bit);
    this.content[n].insertMut(keyEquals, hashFunction, key, keyHash, value2, shift + 5);
  } else {
    this.datamap = this.datamap | bit;
    this.content.splice(i * 2, 0, key, value2);
  }
};
MapNode.prototype.insert = function insert(keyEquals, hashFunction, key, keyHash, value2, shift) {
  var bit = mask(keyHash, shift);
  var i = index2(this.datamap, bit);
  if ((this.datamap & bit) !== 0) {
    var k = this.content[i * 2];
    if (keyEquals(k)(key))
      return new MapNode(this.datamap, this.nodemap, overwriteTwoElements(this.content, i * 2, key, value2));
    var newNode = binaryNode(k, hashFunction(k), this.content[i * 2 + 1], key, keyHash, value2, shift + 5);
    return new MapNode(this.datamap ^ bit, this.nodemap | bit, remove2insert1(this.content, i * 2, this.content.length - index2(this.nodemap, bit) - 2, newNode));
  }
  if ((this.nodemap & bit) !== 0) {
    var n = this.content.length - 1 - index2(this.nodemap, bit);
    return new MapNode(
      this.datamap,
      this.nodemap,
      copyAndOverwriteOrExtend1(
        this.content,
        n,
        this.content[n].insert(keyEquals, hashFunction, key, keyHash, value2, shift + 5)
      )
    );
  }
  return new MapNode(this.datamap | bit, this.nodemap, insert2(this.content, i * 2, key, value2));
};
MapNode.prototype.insertWith = function insertWith(keyEquals, hashFunction, f, key, keyHash, value2, shift) {
  var bit = mask(keyHash, shift);
  var i = index2(this.datamap, bit);
  if ((this.datamap & bit) !== 0) {
    var k = this.content[i * 2];
    if (keyEquals(k)(key))
      return new MapNode(this.datamap, this.nodemap, overwriteTwoElements(this.content, i * 2, key, f(this.content[i * 2 + 1])(value2)));
    var newNode = binaryNode(k, hashFunction(k), this.content[i * 2 + 1], key, keyHash, value2, shift + 5);
    return new MapNode(this.datamap ^ bit, this.nodemap | bit, remove2insert1(this.content, i * 2, this.content.length - index2(this.nodemap, bit) - 2, newNode));
  }
  if ((this.nodemap & bit) !== 0) {
    var n = this.content.length - 1 - index2(this.nodemap, bit);
    return new MapNode(
      this.datamap,
      this.nodemap,
      copyAndOverwriteOrExtend1(
        this.content,
        n,
        this.content[n].insertWith(keyEquals, hashFunction, f, key, keyHash, value2, shift + 5)
      )
    );
  }
  return new MapNode(this.datamap | bit, this.nodemap, insert2(this.content, i * 2, key, value2));
};
MapNode.prototype.delet = function delet(keyEquals, key, keyHash, shift) {
  var bit = mask(keyHash, shift);
  if ((this.datamap & bit) !== 0) {
    var dataIndex = index2(this.datamap, bit);
    if (keyEquals(this.content[dataIndex * 2])(key)) {
      if (this.nodemap === 0 && this.content.length === 2)
        return empty;
      return new MapNode(this.datamap ^ bit, this.nodemap, remove2(this.content, dataIndex * 2));
    }
    return this;
  }
  if ((this.nodemap & bit) !== 0) {
    var nodeIndex = index2(this.nodemap, bit);
    var recNode = this.content[this.content.length - 1 - nodeIndex];
    var recRes = recNode.delet(keyEquals, key, keyHash, shift + 5);
    if (recNode === recRes)
      return this;
    if (recRes.isSingleton()) {
      if (this.content.length === 1) {
        recRes.datamap = this.nodemap;
        return recRes;
      }
      return new MapNode(
        this.datamap | bit,
        this.nodemap ^ bit,
        insert2remove1(this.content, 2 * index2(this.datamap, bit), recRes.content[0], recRes.content[1], this.content.length - 1 - nodeIndex)
      );
    }
    return new MapNode(this.datamap, this.nodemap, copyAndOverwriteOrExtend1(this.content, this.content.length - 1 - nodeIndex, recRes));
  }
  return this;
};
MapNode.prototype.toArrayBy = function(f, res) {
  for (var i = 0; i < popCount(this.datamap) * 2; ) {
    var k = this.content[i++];
    var v = this.content[i++];
    res.push(f(k)(v));
  }
  for (; i < this.content.length; i++)
    this.content[i].toArrayBy(f, res);
};
MapNode.prototype.isSingleton = function() {
  return this.nodemap === 0 && this.content.length === 2;
};
MapNode.prototype.eq = function(kf, vf, that) {
  if (this === that)
    return true;
  if (this.constructor !== that.constructor || this.nodemap !== that.nodemap || this.datamap !== that.datamap)
    return false;
  for (var i = 0; i < popCount(this.datamap) * 2; ) {
    if (kf(this.content[i])(that.content[i]))
      i++;
    else
      return false;
    if (vf(this.content[i])(that.content[i]))
      i++;
    else
      return false;
  }
  for (; i < this.content.length; i++)
    if (!this.content[i].eq(kf, vf, that.content[i]))
      return false;
  return true;
};
MapNode.prototype.hash = function(vhash) {
  var h = this.datamap;
  for (var i = 0; i < popCount(this.datamap); i++)
    h = h * 31 + vhash(this.content[i * 2 + 1]) | 0;
  for (var j = 0; j < popCount(this.nodemap); j++)
    h = h * 31 + this.content[this.content.length - j - 1].hash(vhash) | 0;
  return h;
};
MapNode.prototype.size = function() {
  var res = popCount(this.datamap);
  for (var i = res * 2; i < this.content.length; i++)
    res += this.content[i].size();
  return res;
};
MapNode.prototype.imap = function(f) {
  var newContent = this.content.slice();
  for (var i = 0; i < popCount(this.datamap) * 2; ) {
    var k = this.content[i++];
    var v = this.content[i++];
    newContent[i - 2] = k;
    newContent[i - 1] = f(k)(v);
  }
  for (; i < this.content.length; i++)
    newContent[i] = this.content[i].imap(f);
  return new MapNode(this.datamap, this.nodemap, newContent);
};
MapNode.prototype.ifoldMap = function(m, mappend, f) {
  for (var i = 0; i < popCount(this.datamap) * 2; ) {
    var k = this.content[i++];
    var v = this.content[i++];
    m = mappend(m)(f(k)(v));
  }
  for (; i < this.content.length; i++)
    m = this.content[i].ifoldMap(m, mappend, f);
  return m;
};
function lowestBit(n) {
  return n & -n;
}
function mergeState(bit, thisnode, thisdata, thatnode, thatdata) {
  var state = 0;
  state |= (bit & thisnode) !== 0 ? 1 : 0;
  state |= (bit & thisdata) !== 0 ? 2 : 0;
  state |= (bit & thatnode) !== 0 ? 4 : 0;
  state |= (bit & thatdata) !== 0 ? 8 : 0;
  return state;
}
MapNode.prototype.unionWith = function(eq2, hash, f, that, shift) {
  if (this.constructor !== that.constructor)
    throw "Trying to union a MapNode with something else";
  var thisDataIndex, thatDataIndex, thisNodeIndex, thatNodeIndex;
  var datamap = 0;
  var nodemap = 0;
  var data = [];
  var nodes = [];
  var skipmap = this.datamap | this.nodemap | that.datamap | that.nodemap;
  while (skipmap !== 0) {
    var bit = lowestBit(skipmap);
    skipmap &= ~bit;
    switch (mergeState(bit, this.nodemap, this.datamap, that.nodemap, that.datamap)) {
      case 1:
        thisNodeIndex = index2(this.nodemap, bit);
        nodemap |= bit;
        nodes.push(this.content[this.content.length - thisNodeIndex - 1]);
        break;
      case 2:
        thisDataIndex = index2(this.datamap, bit);
        datamap |= bit;
        data.push(this.content[thisDataIndex * 2], this.content[thisDataIndex * 2 + 1]);
        break;
      case 4:
        thatNodeIndex = index2(that.nodemap, bit);
        nodemap |= bit;
        nodes.push(that.content[that.content.length - thatNodeIndex - 1]);
        break;
      case 5:
        thisNodeIndex = index2(this.nodemap, bit);
        thatNodeIndex = index2(that.nodemap, bit);
        nodemap |= bit;
        nodes.push(
          this.content[this.content.length - thisNodeIndex - 1].unionWith(eq2, hash, f, that.content[that.content.length - thatNodeIndex - 1], shift + 5)
        );
        break;
      case 6:
        thisDataIndex = index2(this.datamap, bit);
        thatNodeIndex = index2(that.nodemap, bit);
        var k = this.content[thisDataIndex * 2];
        var v = this.content[thisDataIndex * 2 + 1];
        var hk = hash(k);
        var flippedF = function(a) {
          return function(b) {
            return f(b)(a);
          };
        };
        nodemap |= bit;
        nodes.push(that.content[that.content.length - thatNodeIndex - 1].insertWith(eq2, hash, flippedF, k, hk, v, shift + 5));
        break;
      case 8:
        thatDataIndex = index2(that.datamap, bit);
        datamap |= bit;
        data.push(that.content[thatDataIndex * 2], that.content[thatDataIndex * 2 + 1]);
        break;
      case 9:
        thatDataIndex = index2(that.datamap, bit);
        thisNodeIndex = index2(this.nodemap, bit);
        var k = that.content[thatDataIndex * 2];
        var v = that.content[thatDataIndex * 2 + 1];
        var hk = hash(k);
        nodemap |= bit;
        nodes.push(this.content[this.content.length - thisNodeIndex - 1].insertWith(eq2, hash, f, k, hk, v, shift + 5));
        break;
      case 10:
        thisDataIndex = index2(this.datamap, bit);
        thatDataIndex = index2(that.datamap, bit);
        if (eq2(this.content[thisDataIndex * 2])(that.content[thatDataIndex * 2])) {
          datamap |= bit;
          data.push(this.content[thisDataIndex * 2], f(this.content[thisDataIndex * 2 + 1])(that.content[thatDataIndex * 2 + 1]));
        } else {
          nodemap |= bit;
          nodes.push(binaryNode(
            this.content[thisDataIndex * 2],
            hash(this.content[thisDataIndex * 2]),
            this.content[thisDataIndex * 2 + 1],
            that.content[thatDataIndex * 2],
            hash(that.content[thatDataIndex * 2]),
            that.content[thatDataIndex * 2 + 1],
            shift + 5
          ));
        }
        break;
    }
  }
  return new MapNode(datamap, nodemap, data.concat(nodes.reverse()));
};
MapNode.prototype.intersectionWith = function(Nothing2, Just2, eq2, hash, f, that, shift) {
  if (this.constructor !== that.constructor)
    throw "Trying to intersect a MapNode with something else";
  var thisDataIndex, thatDataIndex, thisNodeIndex, thatNodeIndex;
  var datamap = 0;
  var nodemap = 0;
  var data = [];
  var nodes = [];
  var skipmap = (this.datamap | this.nodemap) & (that.datamap | that.nodemap);
  while (skipmap !== 0) {
    var bit = lowestBit(skipmap);
    skipmap &= ~bit;
    switch (mergeState(bit, this.nodemap, this.datamap, that.nodemap, that.datamap)) {
      case 5:
        thisNodeIndex = index2(this.nodemap, bit);
        thatNodeIndex = index2(that.nodemap, bit);
        var recRes = this.content[this.content.length - thisNodeIndex - 1].intersectionWith(Nothing2, Just2, eq2, hash, f, that.content[that.content.length - thatNodeIndex - 1], shift + 5);
        if (isEmpty(recRes))
          continue;
        if (recRes.isSingleton()) {
          datamap |= bit;
          data.push(recRes.content[0], recRes.content[1]);
        } else {
          nodemap |= bit;
          nodes.push(recRes);
        }
        break;
      case 6:
        thisDataIndex = index2(this.datamap, bit);
        thatNodeIndex = index2(that.nodemap, bit);
        var k = this.content[thisDataIndex * 2];
        var v = this.content[thisDataIndex * 2 + 1];
        var hk = hash(k);
        var res = that.content[that.content.length - thatNodeIndex - 1].lookup(Nothing2, Just2, eq2, k, hk, shift + 5);
        if (res !== Nothing2) {
          datamap |= bit;
          data.push(k, f(v)(res.value0));
        }
        break;
      case 9:
        thatDataIndex = index2(that.datamap, bit);
        thisNodeIndex = index2(this.nodemap, bit);
        var k = that.content[thatDataIndex * 2];
        var v = that.content[thatDataIndex * 2 + 1];
        var hk = hash(k);
        var res = this.content[this.content.length - thisNodeIndex - 1].lookup(Nothing2, Just2, eq2, k, hk, shift + 5);
        if (res !== Nothing2) {
          datamap |= bit;
          data.push(k, f(res.value0)(v));
        }
        break;
      case 10:
        thisDataIndex = index2(this.datamap, bit);
        thatDataIndex = index2(that.datamap, bit);
        if (eq2(this.content[thisDataIndex * 2])(that.content[thatDataIndex * 2])) {
          datamap |= bit;
          data.push(this.content[thisDataIndex * 2], f(this.content[thisDataIndex * 2 + 1])(that.content[thatDataIndex * 2 + 1]));
        }
        break;
    }
  }
  return new MapNode(datamap, nodemap, data.concat(nodes.reverse()));
};
MapNode.prototype.filterWithKey = function filterWithKey(f) {
  var datamap = 0;
  var nodemap = 0;
  var data = [];
  var nodes = [];
  var skipmap = this.datamap | this.nodemap;
  while (skipmap !== 0) {
    var bit = lowestBit(skipmap);
    skipmap &= ~bit;
    if ((this.datamap & bit) !== 0) {
      var dataIndex = index2(this.datamap, bit);
      var k = this.content[dataIndex * 2];
      var v = this.content[dataIndex * 2 + 1];
      if (f(k)(v)) {
        datamap |= bit;
        data.push(k, v);
      }
    } else {
      var nodeIndex = index2(this.nodemap, bit);
      var node = this.content[this.content.length - nodeIndex - 1].filterWithKey(f);
      if (isEmpty(node))
        continue;
      if (node.isSingleton()) {
        datamap |= bit;
        data.push(node.content[0], node.content[1]);
      } else {
        nodemap |= bit;
        nodes.push(node);
      }
    }
  }
  return new MapNode(datamap, nodemap, data.concat(nodes.reverse()));
};
MapNode.prototype.travHelper = function() {
  function go(vi, vm2, ni, nm, copy) {
    if (vi < vm2)
      return function(v) {
        return go(vi + 1, vm2, ni, nm, function() {
          var res = copy();
          res.content[vi * 2 + 1] = v;
          return res;
        });
      };
    if (ni < nm)
      return function(n) {
        return go(vi, vm2, ni + 1, nm, function() {
          var res = copy();
          res.content[vm2 * 2 + ni] = n;
          return res;
        });
      };
    return copy();
  }
  var vm = popCount(this.datamap);
  var self = this;
  return go(0, vm, 0, this.content.length - vm * 2, function() {
    return new MapNode(self.datamap, self.nodemap, self.content.slice());
  });
};
MapNode.prototype.ifoldMap = function(m, mappend, f) {
  for (var i = 0; i < popCount(this.datamap) * 2; ) {
    var k = this.content[i++];
    var v = this.content[i++];
    m = mappend(m)(f(k)(v));
  }
  for (; i < this.content.length; i++)
    m = this.content[i].ifoldMap(m, mappend, f);
  return m;
};
MapNode.prototype.itraverse = function(pure, apply4, f) {
  var m = pure(this.travHelper());
  for (var i = 0; i < popCount(this.datamap) * 2; ) {
    var k = this.content[i++];
    var v = this.content[i++];
    m = apply4(m)(f(k)(v));
  }
  for (; i < this.content.length; i++)
    m = apply4(m)(this.content[i].itraverse(pure, apply4, f));
  return m;
};
function Collision(keys3, values2) {
  this.keys = keys3;
  this.values = values2;
}
Collision.prototype.lookup = function collisionLookup(Nothing2, Just2, keyEquals, key, keyHash, shift) {
  for (var i = 0; i < this.keys.length; i++)
    if (keyEquals(key)(this.keys[i]))
      return Just2(this.values[i]);
  return Nothing2;
};
Collision.prototype.insert = function collisionInsert(keyEquals, hashFunction, key, keyHash, value2, shift) {
  var i = 0;
  for (; i < this.keys.length; i++)
    if (keyEquals(key)(this.keys[i]))
      break;
  return new Collision(
    copyAndOverwriteOrExtend1(this.keys, i, key),
    copyAndOverwriteOrExtend1(this.values, i, value2)
  );
};
Collision.prototype.insertMut = function collisionInsertMut(keyEquals, hashFunction, key, keyHash, value2, shift) {
  var i = 0;
  for (; i < this.keys.length; i++)
    if (keyEquals(key)(this.keys[i]))
      break;
  this.keys[i] = key;
  this.values[i] = value2;
};
Collision.prototype.insertWith = function collisionInsert2(keyEquals, hashFunction, f, key, keyHash, value2, shift) {
  var i = 0;
  for (; i < this.keys.length; i++)
    if (keyEquals(key)(this.keys[i]))
      return new Collision(
        copyAndOverwriteOrExtend1(this.keys, i, key),
        copyAndOverwriteOrExtend1(this.values, i, f(this.values[i])(value2))
      );
  return new Collision(
    copyAndOverwriteOrExtend1(this.keys, i, key),
    copyAndOverwriteOrExtend1(this.values, i, value2)
  );
};
Collision.prototype.delet = function collisionDelete(keyEquals, key, keyHash, shift) {
  var i = 0;
  for (; i < this.keys.length; i++)
    if (keyEquals(key)(this.keys[i]))
      break;
  if (i === this.keys.length)
    return this;
  if (this.keys.length === 2)
    return new MapNode(1 << (keyHash & 31), 0, [this.keys[1 - i], this.values[1 - i]]);
  return new Collision(remove1(this.keys, i), remove1(this.values, i));
};
Collision.prototype.toArrayBy = function(f, res) {
  for (var i = 0; i < this.keys.length; i++)
    res.push(f(this.keys[i])(this.values[i]));
};
Collision.prototype.isSingleton = function() {
  return false;
};
Collision.prototype.eq = function(kf, vf, that) {
  if (this.constructor !== that.constructor || this.keys.length !== that.keys.length)
    return false;
  outer:
    for (var i = 0; i < this.keys.length; i++) {
      for (var j = 0; j < that.keys.length; j++) {
        if (kf(this.keys[i])(that.keys[j])) {
          if (vf(this.values[i])(that.values[j]))
            continue outer;
          else
            return false;
        }
      }
    }
  return true;
};
Collision.prototype.hash = function(vhash) {
  var h = 0;
  for (var i = 0; i < this.values.length; i++)
    h += vhash(this.values[i]);
  return h;
};
Collision.prototype.size = function() {
  return this.keys.length;
};
Collision.prototype.imap = function(f) {
  var newValues = this.values.slice();
  for (var i = 0; i < this.values.length; i++)
    newValues[i] = f(this.keys[i])(this.values[i]);
  return new Collision(this.keys, newValues);
};
Collision.prototype.ifoldMap = function(m, mappend, f) {
  for (var i = 0; i < this.keys.length; i++)
    m = mappend(m)(f(this.keys[i])(this.values[i]));
  return m;
};
Collision.prototype.travHelper = function() {
  function go(i, m, copy) {
    if (i < m)
      return function(v) {
        return go(i + 1, m, function() {
          var res = copy();
          res.values[i] = v;
          return res;
        });
      };
    return copy();
  }
  var self = this;
  return go(0, this.keys.length, function() {
    return new Collision(self.keys, self.values.slice());
  });
};
Collision.prototype.itraverse = function(pure, apply4, f) {
  var m = pure(this.travHelper());
  for (var i = 0; i < this.keys.length; i++)
    m = apply4(m)(f(this.keys[i])(this.values[i]));
  return m;
};
Collision.prototype.unionWith = function(eq2, hash, f, that, shift) {
  if (that.constructor !== Collision)
    throw "Trying to union a Collision with something else";
  var keys3 = [];
  var values2 = [];
  var added = Array(that.keys.length).fill(false);
  outer:
    for (var i = 0; i < this.keys.length; i++) {
      for (var j = 0; j < that.keys.length; j++) {
        if (eq2(this.keys[i])(that.keys[j])) {
          keys3.push(this.keys[i]);
          values2.push(f(this.values[i])(that.values[j]));
          added[j] = true;
          continue outer;
        }
      }
      keys3.push(this.keys[i]);
      values2.push(this.values[i]);
      added[j] = true;
    }
  for (var k = 0; k < that.keys.length; k++) {
    if (!added[k]) {
      keys3.push(that.keys[k]);
      values2.push(that.values[k]);
    }
  }
  return new Collision(keys3, values2);
};
Collision.prototype.intersectionWith = function(Nothing2, Just2, eq2, hash, f, that, shift) {
  if (that.constructor !== Collision)
    throw "Trying to intersect a Collision with something else";
  var keys3 = [];
  var values2 = [];
  outer:
    for (var i = 0; i < this.keys.length; i++) {
      for (var j = 0; j < that.keys.length; j++) {
        if (eq2(this.keys[i])(that.keys[j])) {
          keys3.push(this.keys[i]);
          values2.push(f(this.values[i])(that.values[j]));
          continue outer;
        }
      }
    }
  if (keys3.length === 0)
    return empty;
  if (keys3.length === 1)
    return new MapNode(1, 0, [keys3[0], values2[0]]);
  return new Collision(keys3, values2);
};
Collision.prototype.filterWithKey = function collisionFilterWithKey(f) {
  var keys3 = [];
  var values2 = [];
  for (var i = 0; i < this.keys.length; i++) {
    var k = this.keys[i];
    var v = this.values[i];
    if (f(k)(v)) {
      keys3.push(k);
      values2.push(v);
    }
  }
  if (keys3.length === 0)
    return empty;
  if (keys3.length === 1)
    return new MapNode(1, 0, [keys3[0], values2[0]]);
  return new Collision(keys3, values2);
};
function mask(keyHash, shift) {
  return 1 << (keyHash >>> shift & 31);
}
function index2(map3, bit) {
  return popCount(map3 & bit - 1);
}
function popCount(n) {
  n = n - (n >> 1 & 1431655765);
  n = (n & 858993459) + (n >> 2 & 858993459);
  return (n + (n >> 4) & 252645135) * 16843009 >> 24;
}
function binaryNode(k1, kh1, v1, k2, kh2, v2, s) {
  if (s >= 32)
    return new Collision([k1, k2], [v1, v2]);
  var b1 = kh1 >>> s & 31;
  var b2 = kh2 >>> s & 31;
  if (b1 !== b2)
    return new MapNode(1 << b1 | 1 << b2, 0, b1 >>> 0 < b2 >>> 0 ? [k1, v1, k2, v2] : [k2, v2, k1, v1]);
  return new MapNode(0, 1 << b1, [binaryNode(k1, kh1, v1, k2, kh2, v2, s + 5)]);
}
function overwriteTwoElements(a, index4, v1, v2) {
  var res = a.slice();
  res[index4] = v1;
  res[index4 + 1] = v2;
  return res;
}
function remove2(a, index4) {
  var res = a.slice();
  res.splice(index4, 2);
  return res;
}
function remove1(a, index4) {
  var res = a.slice();
  res.splice(index4, 1);
  return res;
}
function copyAndOverwriteOrExtend1(a, index4, v) {
  var res = a.slice();
  res[index4] = v;
  return res;
}
function remove2insert1(a, removeIndex, insertIndex, v1) {
  var res = new Array(a.length - 1);
  for (var i = 0; i < removeIndex; i++)
    res[i] = a[i];
  for (; i < insertIndex; i++)
    res[i] = a[i + 2];
  res[i++] = v1;
  for (; i < res.length; i++)
    res[i] = a[i + 1];
  return res;
}
function insert2(a, index4, v1, v2) {
  var res = new Array(a.length + 2);
  for (var i = 0; i < index4; i++)
    res[i] = a[i];
  res[i++] = v1;
  res[i++] = v2;
  for (; i < res.length; i++)
    res[i] = a[i - 2];
  return res;
}
function insert2remove1(a, insertIndex, v1, v2, removeIndex) {
  var res = new Array(a.length + 1);
  for (var i = 0; i < insertIndex; i++)
    res[i] = a[i];
  res[i++] = v1;
  res[i++] = v2;
  for (; i < removeIndex + 2; i++)
    res[i] = a[i - 2];
  for (; i < res.length; i++)
    res[i] = a[i - 1];
  return res;
}
var empty = new MapNode(0, 0, []);
function lookupPurs(Nothing2, Just2, keyEquals, key, keyHash) {
  return function(m) {
    return m.lookup(Nothing2, Just2, keyEquals, key, keyHash, 0);
  };
}
function fromArrayPurs(keyEquals, hashFunction) {
  return function(kf) {
    return function(vf) {
      return function(a) {
        var m = new MapNode(0, 0, []);
        for (var i = 0; i < a.length; i++) {
          var x = a[i];
          var k = kf(x);
          m.insertMut(keyEquals, hashFunction, k, hashFunction(k), vf(x), 0);
        }
        return m;
      };
    };
  };
}
function insertPurs(keyEquals, hashFunction) {
  return function(key) {
    return function(value2) {
      return function(m) {
        return m.insert(keyEquals, hashFunction, key, hashFunction(key), value2, 0);
      };
    };
  };
}
function toArrayBy(f) {
  return function(m) {
    var res = [];
    m.toArrayBy(f, res);
    return res;
  };
}
function singletonPurs(k) {
  return function(keyHash) {
    return function(v) {
      return new MapNode(1 << (keyHash & 31), 0, [k, v]);
    };
  };
}
function isEmpty(m) {
  return m.datamap === 0 && m.nodemap === 0;
}
function foldMapWithIndexPurs(mempty) {
  return function(mappend) {
    return function(f) {
      return function(m) {
        return m.ifoldMap(mempty, mappend, f);
      };
    };
  };
}

// output-es/Data.HashMap/index.js
var values = /* @__PURE__ */ toArrayBy((v) => (v1) => v1);
var lookup2 = (dictHashable) => {
  const eq2 = dictHashable.Eq0().eq;
  return (k) => lookupPurs(Nothing, Just, eq2, k, dictHashable.hash(k));
};
var member = (dictHashable) => {
  const lookup1 = lookup2(dictHashable);
  return (k) => {
    const $0 = lookup1(k);
    return (x) => {
      const $1 = $0(x);
      if ($1.tag === "Nothing") {
        return false;
      }
      if ($1.tag === "Just") {
        return true;
      }
      fail();
    };
  };
};
var keys = /* @__PURE__ */ toArrayBy($$const);
var foldableWithIndexHashMap = {
  foldMapWithIndex: (dictMonoid) => foldMapWithIndexPurs(dictMonoid.mempty)(dictMonoid.Semigroup0().append),
  foldrWithIndex: (f) => foldrWithIndexDefault(foldableWithIndexHashMap)(f),
  foldlWithIndex: (f) => foldlWithIndexDefault(foldableWithIndexHashMap)(f),
  Foldable0: () => foldableHashMap
};
var foldableHashMap = {
  foldMap: (dictMonoid) => (f) => foldMapWithIndexPurs(dictMonoid.mempty)(dictMonoid.Semigroup0().append)((v) => f),
  foldr: (f) => foldrDefault(foldableHashMap)(f),
  foldl: (f) => foldlDefault(foldableHashMap)(f)
};

// output-es/Data.DDF.Atoms.Value/index.js
var $Value = (tag, _1) => ({ tag, _1 });
var member2 = /* @__PURE__ */ member(hashableString);
var StrVal = (value0) => $Value("StrVal", value0);
var showValue = {
  show: (v) => {
    if (v.tag === "DomainVal") {
      return "(NonEmptyString.unsafeFromString " + showStringImpl(v._1) + ")";
    }
    if (v.tag === "StrVal") {
      return showStringImpl(v._1);
    }
    if (v.tag === "NumVal") {
      return showNumberImpl(v._1);
    }
    if (v.tag === "BoolVal") {
      if (v._1) {
        return "true";
      }
      return "false";
    }
    if (v.tag === "TimeVal") {
      return showStringImpl(v._1);
    }
    if (v.tag === "ListVal") {
      return showStringImpl(v._1);
    }
    if (v.tag === "JsonVal") {
      return showStringImpl(v._1);
    }
    fail();
  }
};
var parseTimeVal = (input) => {
  const inputlen = toCodePointArray(input).length;
  if (inputlen <= 4 && (() => {
    const $0 = fromString(input);
    return inputlen >= 3 && (() => {
      if ($0.tag === "Nothing") {
        return false;
      }
      if ($0.tag === "Just") {
        return true;
      }
      fail();
    })();
  })()) {
    return $Either("Right", $Value("TimeVal", input));
  }
  return $Either("Left", [$Issue("Issue", showStringImpl(input) + " is not a valid time value.")]);
};
var parseStrVal = (x) => $Either("Right", $Value("StrVal", x));
var parseNumVal = (input) => {
  const v = fromStringImpl(input, isFiniteImpl, Just, Nothing);
  if (v.tag === "Nothing") {
    return $Either("Left", [$Issue("Issue", input + " is not a number.")]);
  }
  if (v.tag === "Just") {
    return $Either("Right", $Value("NumVal", v._1));
  }
  fail();
};
var parseDomainVal = (domainName) => (domain) => (input) => {
  if (input === "") {
    return $Either("Left", [$Issue("Issue", showStringImpl(input) + " is not a valid value in " + domainName + " domain.")]);
  }
  if (member2(input)(domain)) {
    return $Either("Right", $Value("DomainVal", input));
  }
  return $Either("Left", [$Issue("Issue", showStringImpl(input) + " is not a valid value in " + domainName + " domain.")]);
};
var parseConstrainedDomainVal = (constrain) => (input) => {
  if (input === "") {
    return $Either("Left", [$Issue("Issue", showStringImpl(input) + " is not a valid value in the constrains set by filename.")]);
  }
  if (member2(input)(constrain)) {
    return $Either("Right", $Value("DomainVal", input));
  }
  return $Either("Left", [$Issue("Issue", showStringImpl(input) + " is not a valid value in the constrains set by filename.")]);
};
var parseBoolVal = (v) => {
  if (v === "TRUE") {
    return $Either("Right", $Value("BoolVal", true));
  }
  if (v === "true") {
    return $Either("Right", $Value("BoolVal", true));
  }
  if (v === "FALSE") {
    return $Either("Right", $Value("BoolVal", false));
  }
  if (v === "false") {
    return $Either("Right", $Value("BoolVal", false));
  }
  return $Either("Left", [$Issue("Issue", "not a boolean value: " + showStringImpl(v))]);
};
var eqValue = {
  eq: (x) => (y) => {
    if (x.tag === "DomainVal") {
      return y.tag === "DomainVal" && x._1 === y._1;
    }
    if (x.tag === "StrVal") {
      return y.tag === "StrVal" && x._1 === y._1;
    }
    if (x.tag === "NumVal") {
      return y.tag === "NumVal" && x._1 === y._1;
    }
    if (x.tag === "BoolVal") {
      return y.tag === "BoolVal" && x._1 === y._1;
    }
    if (x.tag === "TimeVal") {
      return y.tag === "TimeVal" && x._1 === y._1;
    }
    if (x.tag === "ListVal") {
      return y.tag === "ListVal" && x._1 === y._1;
    }
    return x.tag === "JsonVal" && y.tag === "JsonVal" && x._1 === y._1;
  }
};
var ordValue = {
  compare: (v) => (v1) => {
    if (v.tag === "DomainVal") {
      if (v1.tag === "DomainVal") {
        return ordString.compare(v._1)(v1._1);
      }
      return _crashWith("the comparsion failed because we are comparing different types of value");
    }
    if (v.tag === "StrVal") {
      if (v1.tag === "StrVal") {
        return ordString.compare(v._1)(v1._1);
      }
      return _crashWith("the comparsion failed because we are comparing different types of value");
    }
    if (v.tag === "NumVal") {
      if (v1.tag === "NumVal") {
        return ordNumber.compare(v._1)(v1._1);
      }
      return _crashWith("the comparsion failed because we are comparing different types of value");
    }
    if (v.tag === "BoolVal") {
      if (v1.tag === "BoolVal") {
        return ordBoolean.compare(v._1)(v1._1);
      }
      return _crashWith("the comparsion failed because we are comparing different types of value");
    }
    if (v.tag === "TimeVal") {
      if (v1.tag === "TimeVal") {
        return ordString.compare(v._1)(v1._1);
      }
      return _crashWith("the comparsion failed because we are comparing different types of value");
    }
    if (v.tag === "ListVal") {
      if (v1.tag === "ListVal") {
        return ordString.compare(v._1)(v1._1);
      }
      return _crashWith("the comparsion failed because we are comparing different types of value");
    }
    if (v.tag === "JsonVal" && v1.tag === "JsonVal") {
      return ordString.compare(v._1)(v1._1);
    }
    return _crashWith("the comparsion failed because we are comparing different types of value");
  },
  Eq0: () => eqValue
};

// output-es/Data.Map.Internal/index.js
var $$$Map = (tag, _1, _2, _3, _4, _5, _6) => ({ tag, _1, _2, _3, _4, _5, _6 });
var $MapIter = (tag, _1, _2, _3) => ({ tag, _1, _2, _3 });
var $Split = (_1, _2, _3) => ({ tag: "Split", _1, _2, _3 });
var $SplitLast = (_1, _2, _3) => ({ tag: "SplitLast", _1, _2, _3 });
var Leaf2 = /* @__PURE__ */ $$$Map("Leaf");
var IterLeaf = /* @__PURE__ */ $MapIter("IterLeaf");
var unsafeNode = (k, v, l, r) => {
  if (l.tag === "Leaf") {
    if (r.tag === "Leaf") {
      return $$$Map("Node", 1, 1, k, v, l, r);
    }
    if (r.tag === "Node") {
      return $$$Map("Node", 1 + r._1 | 0, 1 + r._2 | 0, k, v, l, r);
    }
    fail();
  }
  if (l.tag === "Node") {
    if (r.tag === "Leaf") {
      return $$$Map("Node", 1 + l._1 | 0, 1 + l._2 | 0, k, v, l, r);
    }
    if (r.tag === "Node") {
      return $$$Map("Node", l._1 > r._1 ? 1 + l._1 | 0 : 1 + r._1 | 0, (1 + l._2 | 0) + r._2 | 0, k, v, l, r);
    }
  }
  fail();
};
var unsafeBalancedNode = (k, v, l, r) => {
  if (l.tag === "Leaf") {
    if (r.tag === "Leaf") {
      return $$$Map("Node", 1, 1, k, v, Leaf2, Leaf2);
    }
    if (r.tag === "Node" && r._1 > 1) {
      if (r._5.tag === "Node" && (() => {
        if (r._6.tag === "Leaf") {
          return r._5._1 > 0;
        }
        if (r._6.tag === "Node") {
          return r._5._1 > r._6._1;
        }
        fail();
      })()) {
        return unsafeNode(r._5._3, r._5._4, unsafeNode(k, v, l, r._5._5), unsafeNode(r._3, r._4, r._5._6, r._6));
      }
      return unsafeNode(r._3, r._4, unsafeNode(k, v, l, r._5), r._6);
    }
    return unsafeNode(k, v, l, r);
  }
  if (l.tag === "Node") {
    if (r.tag === "Node") {
      if (r._1 > (l._1 + 1 | 0)) {
        if (r._5.tag === "Node" && (() => {
          if (r._6.tag === "Leaf") {
            return r._5._1 > 0;
          }
          if (r._6.tag === "Node") {
            return r._5._1 > r._6._1;
          }
          fail();
        })()) {
          return unsafeNode(r._5._3, r._5._4, unsafeNode(k, v, l, r._5._5), unsafeNode(r._3, r._4, r._5._6, r._6));
        }
        return unsafeNode(r._3, r._4, unsafeNode(k, v, l, r._5), r._6);
      }
      if (l._1 > (r._1 + 1 | 0)) {
        if (l._6.tag === "Node" && (() => {
          if (l._5.tag === "Leaf") {
            return 0 <= l._6._1;
          }
          if (l._5.tag === "Node") {
            return l._5._1 <= l._6._1;
          }
          fail();
        })()) {
          return unsafeNode(l._6._3, l._6._4, unsafeNode(l._3, l._4, l._5, l._6._5), unsafeNode(k, v, l._6._6, r));
        }
        return unsafeNode(l._3, l._4, l._5, unsafeNode(k, v, l._6, r));
      }
      return unsafeNode(k, v, l, r);
    }
    if (r.tag === "Leaf" && l._1 > 1) {
      if (l._6.tag === "Node" && (() => {
        if (l._5.tag === "Leaf") {
          return 0 <= l._6._1;
        }
        if (l._5.tag === "Node") {
          return l._5._1 <= l._6._1;
        }
        fail();
      })()) {
        return unsafeNode(l._6._3, l._6._4, unsafeNode(l._3, l._4, l._5, l._6._5), unsafeNode(k, v, l._6._6, r));
      }
      return unsafeNode(l._3, l._4, l._5, unsafeNode(k, v, l._6, r));
    }
    return unsafeNode(k, v, l, r);
  }
  fail();
};
var unsafeSplit = (comp, k, m) => {
  if (m.tag === "Leaf") {
    return $Split(Nothing, Leaf2, Leaf2);
  }
  if (m.tag === "Node") {
    const v = comp(k)(m._3);
    if (v === "LT") {
      const v1 = unsafeSplit(comp, k, m._5);
      return $Split(v1._1, v1._2, unsafeBalancedNode(m._3, m._4, v1._3, m._6));
    }
    if (v === "GT") {
      const v1 = unsafeSplit(comp, k, m._6);
      return $Split(v1._1, unsafeBalancedNode(m._3, m._4, m._5, v1._2), v1._3);
    }
    if (v === "EQ") {
      return $Split($Maybe("Just", m._4), m._5, m._6);
    }
  }
  fail();
};
var unsafeSplitLast = (k, v, l, r) => {
  if (r.tag === "Leaf") {
    return $SplitLast(k, v, l);
  }
  if (r.tag === "Node") {
    const v1 = unsafeSplitLast(r._3, r._4, r._5, r._6);
    return $SplitLast(v1._1, v1._2, unsafeBalancedNode(k, v, l, v1._3));
  }
  fail();
};
var unsafeJoinNodes = (v, v1) => {
  if (v.tag === "Leaf") {
    return v1;
  }
  if (v.tag === "Node") {
    const v2 = unsafeSplitLast(v._3, v._4, v._5, v._6);
    return unsafeBalancedNode(v2._1, v2._2, v2._3, v1);
  }
  fail();
};
var unsafeDifference = (comp, l, r) => {
  if (l.tag === "Leaf") {
    return Leaf2;
  }
  if (r.tag === "Leaf") {
    return l;
  }
  if (r.tag === "Node") {
    const v = unsafeSplit(comp, r._3, l);
    return unsafeJoinNodes(unsafeDifference(comp, v._2, r._5), unsafeDifference(comp, v._3, r._6));
  }
  fail();
};
var pop = (dictOrd) => {
  const compare2 = dictOrd.compare;
  return (k) => (m) => {
    const v = unsafeSplit(compare2, k, m);
    if (v._1.tag === "Just") {
      return $Maybe("Just", $Tuple(v._1._1, unsafeJoinNodes(v._2, v._3)));
    }
    return Nothing;
  };
};
var lookup3 = (dictOrd) => (k) => {
  const go = (go$a0$copy) => {
    let go$a0 = go$a0$copy, go$c = true, go$r;
    while (go$c) {
      const v = go$a0;
      if (v.tag === "Leaf") {
        go$c = false;
        go$r = Nothing;
        continue;
      }
      if (v.tag === "Node") {
        const v1 = dictOrd.compare(k)(v._3);
        if (v1 === "LT") {
          go$a0 = v._5;
          continue;
        }
        if (v1 === "GT") {
          go$a0 = v._6;
          continue;
        }
        if (v1 === "EQ") {
          go$c = false;
          go$r = $Maybe("Just", v._4);
          continue;
        }
      }
      fail();
    }
    return go$r;
  };
  return go;
};
var stepUnorderedCps = (next) => (done) => {
  const go = (go$a0$copy) => {
    let go$a0 = go$a0$copy, go$c = true, go$r;
    while (go$c) {
      const v = go$a0;
      if (v.tag === "IterLeaf") {
        go$c = false;
        go$r = done();
        continue;
      }
      if (v.tag === "IterEmit") {
        go$c = false;
        go$r = next(v._1, v._2, v._3);
        continue;
      }
      if (v.tag === "IterNode") {
        go$a0 = (() => {
          if (v._1.tag === "Leaf") {
            return v._2;
          }
          if (v._1.tag === "Node") {
            if (v._1._5.tag === "Leaf") {
              if (v._1._6.tag === "Leaf") {
                return $MapIter("IterEmit", v._1._3, v._1._4, v._2);
              }
              return $MapIter("IterEmit", v._1._3, v._1._4, $MapIter("IterNode", v._1._6, v._2));
            }
            if (v._1._6.tag === "Leaf") {
              return $MapIter("IterEmit", v._1._3, v._1._4, $MapIter("IterNode", v._1._5, v._2));
            }
            return $MapIter("IterEmit", v._1._3, v._1._4, $MapIter("IterNode", v._1._5, $MapIter("IterNode", v._1._6, v._2)));
          }
          fail();
        })();
        continue;
      }
      fail();
    }
    return go$r;
  };
  return go;
};
var stepUnfoldrUnordered = /* @__PURE__ */ stepUnorderedCps((k, v, next) => $Maybe("Just", $Tuple($Tuple(k, v), next)))((v) => Nothing);
var insert3 = (dictOrd) => (k) => (v) => {
  const go = (v1) => {
    if (v1.tag === "Leaf") {
      return $$$Map("Node", 1, 1, k, v, Leaf2, Leaf2);
    }
    if (v1.tag === "Node") {
      const v2 = dictOrd.compare(k)(v1._3);
      if (v2 === "LT") {
        return unsafeBalancedNode(v1._3, v1._4, go(v1._5), v1._6);
      }
      if (v2 === "GT") {
        return unsafeBalancedNode(v1._3, v1._4, v1._5, go(v1._6));
      }
      if (v2 === "EQ") {
        return $$$Map("Node", v1._1, v1._2, k, v, v1._5, v1._6);
      }
    }
    fail();
  };
  return go;
};
var functorMap = {
  map: (f) => {
    const go = (v) => {
      if (v.tag === "Leaf") {
        return Leaf2;
      }
      if (v.tag === "Node") {
        return $$$Map("Node", v._1, v._2, v._3, f(v._4), go(v._5), go(v._6));
      }
      fail();
    };
    return go;
  }
};
var fromFoldable = (dictOrd) => (dictFoldable) => dictFoldable.foldl((m) => (v) => insert3(dictOrd)(v._1)(v._2)(m))(Leaf2);
var $$delete = (dictOrd) => (k) => {
  const go = (v) => {
    if (v.tag === "Leaf") {
      return Leaf2;
    }
    if (v.tag === "Node") {
      const v1 = dictOrd.compare(k)(v._3);
      if (v1 === "LT") {
        return unsafeBalancedNode(v._3, v._4, go(v._5), v._6);
      }
      if (v1 === "GT") {
        return unsafeBalancedNode(v._3, v._4, v._5, go(v._6));
      }
      if (v1 === "EQ") {
        return unsafeJoinNodes(v._5, v._6);
      }
    }
    fail();
  };
  return go;
};

// output-es/Data.Map.Extra/index.js
var lookupV = (dictShow) => (dictOrd) => (key) => (m) => {
  const v = lookup3(dictOrd)(key)(m);
  if (v.tag === "Just") {
    return $Either("Right", v._1);
  }
  if (v.tag === "Nothing") {
    return $Either("Left", [$Issue("Issue", "key not found: " + dictShow.show(key))]);
  }
  fail();
};

// output-es/Data.Validation.Semigroup/index.js
var applyV = (dictSemigroup) => ({
  apply: (v) => (v1) => {
    if (v.tag === "Left") {
      if (v1.tag === "Left") {
        return $Either("Left", dictSemigroup.append(v._1)(v1._1));
      }
      return $Either("Left", v._1);
    }
    if (v1.tag === "Left") {
      return $Either("Left", v1._1);
    }
    if (v.tag === "Right" && v1.tag === "Right") {
      return $Either("Right", v._1(v1._1));
    }
    fail();
  },
  Functor0: () => functorEither
});

// output-es/Data.DDF.Concept/index.js
var $ConceptType = (tag, _1) => ({ tag, _1 });
var elem3 = /* @__PURE__ */ (() => {
  const any1 = foldableArray.foldMap((() => {
    const semigroupDisj1 = { append: (v) => (v1) => v || v1 };
    return { mempty: false, Semigroup0: () => semigroupDisj1 };
  })());
  return (x) => any1(($0) => x === $0);
})();
var apply = /* @__PURE__ */ (() => applyV(semigroupArray).apply)();
var StringC = /* @__PURE__ */ $ConceptType("StringC");
var MeasureC = /* @__PURE__ */ $ConceptType("MeasureC");
var BooleanC = /* @__PURE__ */ $ConceptType("BooleanC");
var IntervalC = /* @__PURE__ */ $ConceptType("IntervalC");
var EntityDomainC = /* @__PURE__ */ $ConceptType("EntityDomainC");
var EntitySetC = /* @__PURE__ */ $ConceptType("EntitySetC");
var RoleC = /* @__PURE__ */ $ConceptType("RoleC");
var CompositeC = /* @__PURE__ */ $ConceptType("CompositeC");
var TimeC = /* @__PURE__ */ $ConceptType("TimeC");
var reservedConcepts = /* @__PURE__ */ arrayMap(unsafeCreate)(["concept", "concept_type"]);
var parseConceptType = (x) => {
  const $0 = parseId(x);
  if ($0.tag === "Left") {
    return $Either("Left", $0._1);
  }
  if ($0.tag === "Right") {
    return $Either(
      "Right",
      (() => {
        if ($0._1 === "string") {
          return StringC;
        }
        if ($0._1 === "measure") {
          return MeasureC;
        }
        if ($0._1 === "boolean") {
          return BooleanC;
        }
        if ($0._1 === "interval") {
          return IntervalC;
        }
        if ($0._1 === "entity_domain") {
          return EntityDomainC;
        }
        if ($0._1 === "entity_set") {
          return EntitySetC;
        }
        if ($0._1 === "role") {
          return RoleC;
        }
        if ($0._1 === "composite") {
          return CompositeC;
        }
        if ($0._1 === "time") {
          return TimeC;
        }
        return $ConceptType("CustomC", $0._1);
      })()
    );
  }
  fail();
};
var notReserved = (conceptId) => {
  if (elem3(conceptId)(arrayMap(value)(reservedConcepts))) {
    return $Either("Left", [$Issue("Issue", conceptId + " can not be use as concept Id")]);
  }
  return $Either("Right", conceptId);
};
var hasFieldAndGetValue = (field) => (input) => {
  const v = lookup3(ordId)(field === "" ? "undefined_id" : field)(input);
  if (v.tag === "Nothing") {
    return $Either("Left", [$Issue("Issue", "field " + field + " MUST exist for concept")]);
  }
  if (v.tag === "Just") {
    return $Either("Right", v._1);
  }
  fail();
};
var concept = (conceptId) => (conceptType) => (props) => ({ conceptId, conceptType, props, _info: Nothing });
var checkMandatoryField = (v) => {
  if (v.conceptType.tag === "EntitySetC") {
    const $0 = hasFieldAndGetValue("domain")(v.props);
    if ($0.tag === "Left") {
      return $Either("Left", $0._1);
    }
    if ($0.tag === "Right") {
      if ((() => {
        if ($0._1.tag === "DomainVal") {
          return true;
        }
        if ($0._1.tag === "StrVal") {
          return $0._1._1 === "";
        }
        if ($0._1.tag === "NumVal") {
          return true;
        }
        if ($0._1.tag === "BoolVal") {
          return true;
        }
        if ($0._1.tag === "TimeVal") {
          return $0._1._1 === "";
        }
        if ($0._1.tag === "ListVal") {
          return $0._1._1 === "";
        }
        if ($0._1.tag === "JsonVal") {
          return $0._1._1 === "";
        }
        fail();
      })()) {
        return $Either("Left", [$Issue("Issue", "field domain MUST not be empty")]);
      }
      return $Either("Right", v);
    }
    fail();
  }
  return $Either("Right", v);
};
var parseConcept = (input) => {
  const $0 = apply(apply((() => {
    const $02 = notReserved(input.conceptId);
    const $12 = (() => {
      if ($02.tag === "Left") {
        return $Either("Left", $02._1);
      }
      if ($02.tag === "Right") {
        return parseId($02._1);
      }
      fail();
    })();
    if ($12.tag === "Left") {
      return $Either("Left", $12._1);
    }
    if ($12.tag === "Right") {
      return $Either("Right", concept($12._1));
    }
    fail();
  })())(parseConceptType(input.conceptType)))($Either("Right", functorMap.map(StrVal)(input.props)));
  const $1 = (() => {
    if ($0.tag === "Left") {
      return $Either("Left", $0._1);
    }
    if ($0.tag === "Right") {
      return checkMandatoryField($0._1);
    }
    fail();
  })();
  if ($1.tag === "Left") {
    return $Either("Left", $1._1);
  }
  if ($1.tag === "Right") {
    return $Either("Right", { ...$1._1, _info: input._info });
  }
  fail();
};

// output-es/Data.HashSet/index.js
var identity6 = (x) => x;
var insert4 = (dictHashable) => {
  const insert12 = insertPurs(dictHashable.Eq0().eq, dictHashable.hash);
  return (a) => (v) => insert12(a)()(v);
};
var fromArray2 = (dictHashable) => fromArrayPurs(dictHashable.Eq0().eq, dictHashable.hash)(identity6)((v) => {
});
var foldableHashSet = {
  foldr: (f) => (a) => (v) => foldrWithIndexDefault(foldableWithIndexHashMap)((k) => (v1) => f(k))(a)(v),
  foldl: (f) => (a) => (v) => foldlWithIndexDefault(foldableWithIndexHashMap)((k) => (b) => (v1) => f(b)(k))(a)(v),
  foldMap: (dictMonoid) => {
    const foldMapWithIndex1 = foldMapWithIndexPurs(dictMonoid.mempty)(dictMonoid.Semigroup0().append);
    return (f) => (v) => foldMapWithIndex1((k) => (v1) => f(k))(v);
  }
};
var map = (dictHashable) => {
  const insert12 = insert4(dictHashable);
  return (f) => foldableHashSet.foldr((x) => insert12(f(x)))(empty);
};

// output-es/Data.Array.NonEmpty.Internal/foreign.js
var traverse1Impl = function() {
  function Cont(fn) {
    this.fn = fn;
  }
  var emptyList = {};
  var ConsCell = function(head, tail) {
    this.head = head;
    this.tail = tail;
  };
  function finalCell(head) {
    return new ConsCell(head, emptyList);
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
  return function(apply4, map3, f) {
    var buildFrom = function(x, ys) {
      return apply4(map3(consList)(f(x)))(ys);
    };
    var go = function(acc, currentLen, xs) {
      if (currentLen === 0) {
        return acc;
      } else {
        var last5 = xs[currentLen - 1];
        return new Cont(function() {
          var built = go(buildFrom(last5, acc), currentLen - 1, xs);
          return built;
        });
      }
    };
    return function(array) {
      var acc = map3(finalCell)(f(array[array.length - 1]));
      var result = go(acc, array.length - 1, array);
      while (result instanceof Cont) {
        result = result.fn();
      }
      return map3(listToArray)(result);
    };
  };
}();

// output-es/Data.Array.NonEmpty/index.js
var toArray2 = (v) => v;
var last3 = (x) => {
  const $0 = last(x);
  if ($0.tag === "Just") {
    return $0._1;
  }
  fail();
};

// output-es/Foreign/foreign.js
var isArray = Array.isArray || function(value2) {
  return Object.prototype.toString.call(value2) === "[object Array]";
};

// output-es/Node.FS.Stats/foreign.js
var isDirectoryImpl = (s) => s.isDirectory();
var isFileImpl = (s) => s.isFile();

// output-es/Node.Path/foreign.js
import path from "path";
var normalize = path.normalize;
function concat3(segments) {
  return path.join.apply(this, segments);
}
var basename = path.basename;
var extname = path.extname;
var sep = path.sep;
var delimiter = path.delimiter;
var parse3 = path.parse;
var isAbsolute = path.isAbsolute;

// output-es/Utils/index.js
var getFiles = (x) => (excl) => _bind(toAff1(readdir2)(x))((allFiles) => foldM(monadAff)((acc) => (f) => _bind(toAff1(stat2)(f))((st) => {
  if (isFileImpl(st) && extname(basename(f)) === ".csv") {
    return _pure([f, ...acc]);
  }
  if (isDirectoryImpl(st)) {
    return _bind(getFiles(f)([]))((dirfs) => _pure([...acc, ...dirfs]));
  }
  return _pure(acc);
}))([])(arrayMap((f) => concat3([x, f]))(filterImpl((f) => !elem(eqString)(f)(excl), allFiles))));
var dupsBy = (func) => (lst) => arrayMap(last3)(filterImpl((g) => g.length > 1, groupAllBy(func)(lst)));

// output-es/Data.DDF.BaseDataSet/index.js
var fromArray3 = /* @__PURE__ */ fromArray2(hashableString);
var lookup4 = /* @__PURE__ */ lookup2(hashableId);
var map2 = /* @__PURE__ */ map(hashableString);
var fromArray1 = /* @__PURE__ */ (() => fromArrayPurs(eqId.eq, hashableId.hash)(fst)(snd))();
var insert5 = /* @__PURE__ */ (() => insertPurs(eqId.eq, hashableId.hash))();
var insert1 = /* @__PURE__ */ insert4(hashableId);
var updateValueParserWithConstrain = (v) => (v1) => {
  if (v1.tag === "DataPoints") {
    return zipWith2((vp) => (con) => {
      if (con.tag === "Nothing") {
        return vp;
      }
      if (con.tag === "Just") {
        return parseConstrainedDomainVal(fromArray3([con._1]));
      }
      fail();
    })(v)(v1._1.constrains);
  }
  return v;
};
var getDomainSetValues = (v) => (c) => {
  const v1 = lookup4(c)(v.entityDomains);
  if (v1.tag === "Just") {
    return map2(value)(v1._1);
  }
  if (v1.tag === "Nothing") {
    return empty;
  }
  fail();
};
var getConcept = (v) => (c) => {
  const v1 = lookup4(c)(v.concepts);
  if (v1.tag === "Just") {
    return $Either("Right", v1._1);
  }
  if (v1.tag === "Nothing") {
    return $Either("Left", [$Issue("Issue", "concept not found: " + c)]);
  }
  fail();
};
var getValueParser = (d) => (c) => {
  const $0 = getConcept(d)(c);
  if ($0.tag === "Left") {
    return $Either("Left", $0._1);
  }
  if ($0.tag === "Right") {
    if ($0._1.conceptType.tag === "StringC") {
      return $Either("Right", parseStrVal);
    }
    if ($0._1.conceptType.tag === "MeasureC") {
      return $Either("Right", parseNumVal);
    }
    if ($0._1.conceptType.tag === "BooleanC") {
      return $Either("Right", parseBoolVal);
    }
    if ($0._1.conceptType.tag === "IntervalC") {
      return $Either("Right", parseStrVal);
    }
    if ($0._1.conceptType.tag === "EntityDomainC") {
      return $Either("Right", parseDomainVal(c)(getDomainSetValues(d)(c)));
    }
    if ($0._1.conceptType.tag === "EntitySetC") {
      return $Either("Right", parseDomainVal(c)(getDomainSetValues(d)(c)));
    }
    if ($0._1.conceptType.tag === "RoleC") {
      return $Either("Right", parseStrVal);
    }
    if ($0._1.conceptType.tag === "CompositeC") {
      return $Either("Right", parseStrVal);
    }
    if ($0._1.conceptType.tag === "TimeC") {
      return $Either("Right", parseTimeVal);
    }
    if ($0._1.conceptType.tag === "CustomC") {
      return $Either("Right", parseStrVal);
    }
  }
  fail();
};
var fromConcepts = (lst) => {
  const dups = dupsBy((x) => (y) => ordString.compare(x.conceptId)(y.conceptId))(lst);
  if (dups.length === 0) {
    return $Either("Right", { concepts: fromArray1(arrayMap((x) => $Tuple(x.conceptId, x))(lst)), entityDomains: empty });
  }
  return $Either(
    "Left",
    fromFoldableImpl(
      foldrArray,
      arrayMap((v) => {
        if (v._info.tag === "Nothing") {
          return $Issue("InvalidItem", "", -1, "multiple definition found for " + v.conceptId);
        }
        if (v._info.tag === "Just") {
          return $Issue("InvalidItem", v._info._1.filepath, v._info._1.row, "multiple definition found for " + v.conceptId);
        }
        fail();
      })(dups)
    )
  );
};
var appendEntity = (v) => (v1) => {
  const eid = v.entityId;
  return {
    ...v1,
    entityDomains: (() => {
      const $0 = (domain, domainMap) => {
        const v2 = lookup4(domain)(domainMap);
        if (v2.tag === "Nothing") {
          return insert5(domain)(singletonPurs(eid)(hashString(eid))())(domainMap);
        }
        if (v2.tag === "Just") {
          return insert5(domain)(insert1(eid)(v2._1))(domainMap);
        }
        fail();
      };
      return $0(v.entityDomain, foldableList.foldr(($1) => ($2) => $0($1, $2))(v1.entityDomains)(v.entitySets));
    })()
  };
};
var parseBaseDataSet = (v) => {
  if (v.concepts.length === 0) {
    return $Either("Left", [$Issue("Issue", "Data set must have concepts")]);
  }
  if (fromConcepts(v.concepts).tag === "Left") {
    return $Either("Left", fromConcepts(v.concepts)._1);
  }
  if (fromConcepts(v.concepts).tag === "Right") {
    return $Either("Right", foldrArray(appendEntity)(fromConcepts(v.concepts)._1)(v.entities));
  }
  fail();
};

// output-es/Data.Show.Generic/foreign.js
var intercalate = function(separator) {
  return function(xs) {
    return xs.join(separator);
  };
};

// output-es/Data.Show.Generic/index.js
var genericShowConstructor = (dictGenericShowArgs) => (dictIsSymbol) => ({
  "genericShow'": (v) => {
    const ctor = dictIsSymbol.reflectSymbol($$Proxy);
    const v1 = dictGenericShowArgs.genericShowArgs(v);
    if (v1.length === 0) {
      return ctor;
    }
    return "(" + intercalate(" ")([ctor, ...v1]) + ")";
  }
});

// output-es/Data.DDF.Atoms.Header/index.js
var is_header = (s) => {
  const $0 = string("is--")(s);
  return (() => {
    if ($0.tag === "Left") {
      const $1 = $0._1;
      return (v) => $Either("Left", $1);
    }
    if ($0.tag === "Right") {
      const $1 = $0._1;
      return (f) => f($1);
    }
    fail();
  })()((v1) => {
    const $1 = v1.result;
    const $2 = identifier(v1.suffix);
    return (() => {
      if ($2.tag === "Left") {
        const $3 = $2._1;
        return (v) => $Either("Left", $3);
      }
      if ($2.tag === "Right") {
        const $3 = $2._1;
        return (f) => f($3);
      }
      fail();
    })()((v1$1) => $Either("Right", { result: $1 + v1$1.result, suffix: v1$1.suffix }));
  });
};
var header = (s) => {
  const v2 = is_header(s);
  const $0 = (() => {
    if (v2.tag === "Left") {
      if (s.position === v2._1.pos) {
        return identifier(s);
      }
      return $Either("Left", { error: v2._1.error, pos: v2._1.pos });
    }
    return v2;
  })();
  return (() => {
    if ($0.tag === "Left") {
      const $1 = $0._1;
      return (v) => $Either("Left", $1);
    }
    if ($0.tag === "Right") {
      const $1 = $0._1;
      return (f) => f($1);
    }
    fail();
  })()((v1) => {
    const $1 = eof(v1.suffix);
    if ($1.tag === "Left") {
      return $Either("Left", $1._1);
    }
    if ($1.tag === "Right") {
      return $Either("Right", { result: v1.result, suffix: $1._1.suffix });
    }
    fail();
  });
};
var parseHeader = (x) => {
  const $0 = header({ substring: x, position: 0 });
  if ($0.tag === "Left") {
    return $Either("Left", [$Issue("InvalidCSV", "invalid header: " + x + ", " + $0._1.error + "at pos " + showIntImpl($0._1.pos))]);
  }
  if ($0.tag === "Right") {
    return $Either("Right", $0._1.result);
  }
  fail();
};
var showHeader = {
  show: /* @__PURE__ */ (() => {
    const $0 = genericShowConstructor({ genericShowArgs: (v) => ["(NonEmptyString.unsafeFromString " + showStringImpl(v) + ")"] })({
      reflectSymbol: () => "Header"
    });
    return (x) => $0["genericShow'"](x);
  })()
};
var eqHeader = { eq: (x) => (y) => x === y };
var ordHeader = { compare: (x) => (y) => ordString.compare(x)(y), Eq0: () => eqHeader };

// output-es/Data.String.NonEmpty.Internal/index.js
var toString = (v) => v;
var showNonEmptyString = { show: (v) => "(NonEmptyString.unsafeFromString " + showStringImpl(v) + ")" };
var stripPrefix2 = (pat) => (a) => {
  const $0 = stripPrefix(pat)(a);
  if ($0.tag === "Just") {
    if ($0._1 === "") {
      return Nothing;
    }
    return $Maybe("Just", $0._1);
  }
  if ($0.tag === "Nothing") {
    return Nothing;
  }
  fail();
};

// output-es/Data.String.Utils/foreign.js
function startsWithImpl(searchString, s) {
  return s.startsWith(searchString);
}

// output-es/Data.DDF.Csv.CsvFile/index.js
var applicativeV = /* @__PURE__ */ (() => {
  const applyV1 = applyV(semigroupArray);
  return { pure: (x) => $Either("Right", x), Apply0: () => applyV1 };
})();
var show = /* @__PURE__ */ showArrayImpl(showStringImpl);
var eq = /* @__PURE__ */ eqArrayImpl(eqStringImpl);
var show1 = /* @__PURE__ */ showArrayImpl((v) => "(Tuple " + showStringImpl(v._1) + " " + showIntImpl(v._2) + ")");
var sequence = /* @__PURE__ */ (() => traversableArray.traverse(applicativeV)(identity2))();
var show2 = /* @__PURE__ */ (() => showArrayImpl(showNonEmptyString.show))();
var apply2 = /* @__PURE__ */ (() => applyV(semigroupArray).apply)();
var oneOfHeaderExists = (expected) => (csvcontent) => {
  const actual = fromFoldableImpl(foldrArray, csvcontent.headers);
  if (foldrArray((x) => (acc) => {
    const $0 = elem(eqString)(x)(actual);
    if ($0) {
      return !acc;
    }
    return !$0 && acc;
  })(false)(expected)) {
    return applicativeV.pure(csvcontent);
  }
  return $Either("Left", [$Issue("InvalidCSV", "file MUST have one and only one of follwoing field: " + show(expected))]);
};
var notEmptyCsv = (input) => {
  if (input.headers.tag === "Just" && input.headers._1.length > 0) {
    if (input.rows.tag === "Nothing") {
      return applicativeV.pure({ headers: input.headers._1, rows: [] });
    }
    if (input.rows.tag === "Just") {
      return applicativeV.pure({ headers: input.headers._1, rows: input.rows._1 });
    }
    fail();
  }
  return $Either("Left", [$Issue("InvalidCSV", "no headers")]);
};
var noDupCols = (input) => {
  const dups = filterImpl(
    (x) => x._2 > 1,
    arrayMap((x) => $Tuple(
      (() => {
        if (0 < x.length) {
          return x[0];
        }
        fail();
      })(),
      x.length
    ))(groupBy(eqStringImpl)(sortBy(ordString.compare)(input.headers)))
  );
  if (eq(nubBy(ordString.compare)(input.headers))(input.headers)) {
    return applicativeV.pure(input);
  }
  return $Either("Left", [$Issue("InvalidCSV", "duplicated headers: " + show1(dups))]);
};
var hasCols = (dictFoldable) => (dictOrd) => {
  const fromFoldable32 = dictFoldable.foldl((m) => (a) => insert3(dictOrd)(a)()(m))(Leaf2);
  const compare2 = dictOrd.compare;
  return (dictEq) => (expected) => (actual) => unsafeDifference(compare2, fromFoldable32(expected), fromFoldable32(actual)).tag === "Leaf";
};
var hasCols1 = /* @__PURE__ */ hasCols(foldableArray)(ordString)(eqString);
var headersExists = (expected) => (csvcontent) => {
  if (hasCols1(expected)(fromFoldableImpl(foldrArray, csvcontent.headers))) {
    return applicativeV.pure(csvcontent);
  }
  return $Either("Left", [$Issue("InvalidCSV", "file MUST have following field: " + show(expected))]);
};
var colsAreValidIds = (input) => {
  const $0 = sequence(arrayMap(parseHeader)(input.headers));
  if ($0.tag === "Right") {
    const is_headers = filterImpl((x) => startsWithImpl("is--", x), arrayMap(unsafeCoerce)($0._1));
    if (is_headers.length === 0) {
      return applicativeV.pure({ ...input, headers: $0._1 });
    }
    return $Either("Left", [$Issue("InvalidCSV", "these headers are not valid Ids: " + show2(is_headers))]);
  }
  if ($0.tag === "Left") {
    return $Either("Left", $0._1);
  }
  fail();
};
var colsAreValidHeaders = (input) => {
  const $0 = sequence(arrayMap(parseHeader)(input.headers));
  if ($0.tag === "Right") {
    return applicativeV.pure({ ...input, headers: $0._1 });
  }
  if ($0.tag === "Left") {
    return $Either("Left", $0._1);
  }
  fail();
};
var parseCsvFile = (v) => {
  const $0 = notEmptyCsv(v.csvContent);
  const goodCsvContent = (() => {
    if ($0.tag === "Left") {
      return $Either("Left", $0._1);
    }
    if ($0.tag === "Right") {
      return noDupCols($0._1);
    }
    fail();
  })();
  if (v.fileInfo._2.tag === "Concepts") {
    return apply2((() => {
      const $1 = applicativeV.pure(v.fileInfo);
      if ($1.tag === "Left") {
        return $Either("Left", $1._1);
      }
      if ($1.tag === "Right") {
        return $Either(
          "Right",
          (() => {
            const $2 = $1._1;
            return (csv) => ({ fileInfo: $2, csvContent: csv });
          })()
        );
      }
      fail();
    })())((() => {
      const $1 = (() => {
        if (goodCsvContent.tag === "Left") {
          return $Either("Left", goodCsvContent._1);
        }
        if (goodCsvContent.tag === "Right") {
          return headersExists(["concept", "concept_type"])(goodCsvContent._1);
        }
        fail();
      })();
      if ($1.tag === "Left") {
        return $Either("Left", $1._1);
      }
      if ($1.tag === "Right") {
        return colsAreValidIds($1._1);
      }
      fail();
    })());
  }
  if (v.fileInfo._2.tag === "Entities") {
    return apply2((() => {
      const $1 = applicativeV.pure(v.fileInfo);
      if ($1.tag === "Left") {
        return $Either("Left", $1._1);
      }
      if ($1.tag === "Right") {
        return $Either(
          "Right",
          (() => {
            const $2 = $1._1;
            return (csv) => ({ fileInfo: $2, csvContent: csv });
          })()
        );
      }
      fail();
    })())((() => {
      const $1 = oneOfHeaderExists((() => {
        if (v.fileInfo._2._1.set.tag === "Just") {
          return [v.fileInfo._2._1.set._1, v.fileInfo._2._1.domain];
        }
        if (v.fileInfo._2._1.set.tag === "Nothing") {
          return [v.fileInfo._2._1.domain];
        }
        fail();
      })());
      const $2 = (() => {
        if (goodCsvContent.tag === "Left") {
          return $Either("Left", goodCsvContent._1);
        }
        if (goodCsvContent.tag === "Right") {
          return $1(goodCsvContent._1);
        }
        fail();
      })();
      if ($2.tag === "Left") {
        return $Either("Left", $2._1);
      }
      if ($2.tag === "Right") {
        return colsAreValidHeaders($2._1);
      }
      fail();
    })());
  }
  if (v.fileInfo._2.tag === "DataPoints") {
    return apply2((() => {
      const $1 = applicativeV.pure(v.fileInfo);
      if ($1.tag === "Left") {
        return $Either("Left", $1._1);
      }
      if ($1.tag === "Right") {
        return $Either(
          "Right",
          (() => {
            const $2 = $1._1;
            return (csv) => ({ fileInfo: $2, csvContent: csv });
          })()
        );
      }
      fail();
    })())((() => {
      const $1 = headersExists([
        v.fileInfo._2._1.indicator,
        ...fromFoldableImpl(
          foldableNonEmptyList.foldr,
          $NonEmpty(v.fileInfo._2._1.pkeys._1, listMap(toString)(v.fileInfo._2._1.pkeys._2))
        )
      ]);
      const $2 = (() => {
        if (goodCsvContent.tag === "Left") {
          return $Either("Left", goodCsvContent._1);
        }
        if (goodCsvContent.tag === "Right") {
          return $1(goodCsvContent._1);
        }
        fail();
      })();
      if ($2.tag === "Left") {
        return $Either("Left", $2._1);
      }
      if ($2.tag === "Right") {
        return colsAreValidIds($2._1);
      }
      fail();
    })());
  }
  return $Either("Left", [NotImplemented]);
};

// output-es/Data.DDF.Csv.Utils/index.js
var fromFoldable2 = /* @__PURE__ */ fromFoldable(ordHeader)(foldableArray);
var applyV2 = /* @__PURE__ */ applyV(semigroupArray);
var sequence1 = /* @__PURE__ */ (() => traversable1NonEmptyList.traverse1(applyV2)(identity5))();
var pop2 = /* @__PURE__ */ pop(ordHeader);
var fromFoldable1 = /* @__PURE__ */ fromFoldable(ordId)(foldableArray);
var createPointInput = (fp) => (indicator) => (pkeys) => (headers) => (v) => {
  const rowMap = fromFoldable2(zipWithImpl(Tuple, headers, v._2));
  return applyV2.apply(applyV2.apply(headers.length !== v._2.length ? $Either("Left", [$Issue("InvalidCSV", "bad csv row")]) : $Either("Right", (v2) => (v3) => ({ key: v2, value: v3, _info: $Maybe("Just", { filepath: fp, row: v._1 }) })))(sequence1($NonEmpty(
    lookupV(showHeader)(ordHeader)(pkeys._1)(rowMap),
    listMap((k) => lookupV(showHeader)(ordHeader)(k)(rowMap))(pkeys._2)
  ))))(lookupV(showHeader)(ordHeader)(indicator)(rowMap));
};
var createEntityInput = (fp) => (v) => (headers) => (v1) => {
  const $0 = pop2((() => {
    if (v.set.tag === "Nothing") {
      return v.domain;
    }
    if (v.set.tag === "Just") {
      if (elem(eqHeader)(v.set._1)(headers)) {
        return v.set._1;
      }
      return v.domain;
    }
    fail();
  })())(fromFoldable2(zipWithImpl(Tuple, headers, v1._2)));
  const v2 = (() => {
    if ($0.tag === "Just") {
      return $0._1;
    }
    fail();
  })();
  if (headers.length !== v1._2.length) {
    return $Either("Left", [$Issue("InvalidCSV", "bad csv row")]);
  }
  return applyV2.apply(applyV2.apply(applyV2.apply(applyV2.apply($Either(
    "Right",
    (() => {
      const $1 = v2._1;
      return (v3) => (v4) => (v5) => (v6) => ({ entityId: $1, entityDomain: v3, entitySet: v4, props: v5, _info: v6 });
    })()
  ))($Either("Right", v.domain)))($Either("Right", v.set)))($Either("Right", v2._2)))($Either(
    "Right",
    $Maybe("Just", { filepath: fp, row: v1._1 })
  ));
};
var createConceptInput = (fp) => (headers) => (v) => {
  const rowMap = fromFoldable1(zipWithImpl(Tuple, arrayMap(unsafeCoerce)(headers), v._2));
  const props = $$delete(ordId)("concept_type")($$delete(ordId)("concept")(rowMap));
  if (headers.length !== v._2.length) {
    return $Either("Left", [$Issue("InvalidCSV", "bad csv row")]);
  }
  return applyV2.apply(applyV2.apply(applyV2.apply((() => {
    const $0 = lookupV(showId2)(ordId)("concept")(rowMap);
    if ($0.tag === "Left") {
      return $Either("Left", $0._1);
    }
    if ($0.tag === "Right") {
      return $Either(
        "Right",
        (() => {
          const $1 = $0._1;
          return (v2) => (v3) => (v4) => ({ conceptId: $1, conceptType: v2, props: v3, _info: v4 });
        })()
      );
    }
    fail();
  })())(lookupV(showId2)(ordId)("concept_type")(rowMap)))($Either("Right", props)))($Either(
    "Right",
    $Maybe("Just", { filepath: fp, row: v._1 })
  ));
};

// output-es/Data.DDF.DataPoint/index.js
var applyV3 = /* @__PURE__ */ applyV(semigroupArray);
var sequence12 = /* @__PURE__ */ (() => traversable1NonEmptyList.traverse1(applyV3)(identity5))();
var applicativeV2 = /* @__PURE__ */ (() => {
  const applyV1 = applyV(semigroupArray);
  return { pure: (x) => $Either("Right", x), Apply0: () => applyV1 };
})();
var compare = /* @__PURE__ */ (() => ordNonEmpty2(ordValue).compare)();
var show12 = /* @__PURE__ */ (() => {
  const $0 = showNonEmptyList(showValue);
  return (record) => (() => {
    if (record._info.tag === "Just") {
      return "{ _info: (Just { filepath: " + showStringImpl(record._info._1.filepath) + ", row: " + showIntImpl(record._info._1.row) + " }), key: ";
    }
    if (record._info.tag === "Nothing") {
      return "{ _info: Nothing, key: ";
    }
    fail();
  })() + $0.show(record.key) + ", value: " + showValue.show(record.value) + " }";
})();
var parseDataPointWithValueParser = (keyParsers) => (valParser) => (input) => applyV3.apply((() => {
  const $0 = valParser(input.value);
  if ($0.tag === "Left") {
    return $Either("Left", $0._1);
  }
  if ($0.tag === "Right") {
    return $Either(
      "Right",
      (() => {
        const $1 = $0._1;
        return (v1) => ({ key: v1, value: $1, _info: input._info });
      })()
    );
  }
  fail();
})())(sequence12(zipWith2((f) => (x) => f(x))(keyParsers)(input.key)));
var checkDuplicatedPoints = (pts) => {
  const dups = dupsBy((x) => (y) => compare(x.key)(y.key))(pts);
  if (0 < dups.length) {
    return $Either(
      "Left",
      arrayMap((p) => {
        if (p._info.tag === "Just") {
          return $Issue("InvalidItem", p._info._1.filepath, p._info._1.row, "duplicated datapoints");
        }
        if (p._info.tag === "Nothing") {
          return $Issue("Issue", "duplicated datapoints: " + show12(p));
        }
        fail();
      })(dups)
    );
  }
  return applicativeV2.pure(pts);
};
var parseDataPointList = (v) => applyV3.apply(applyV3.apply((() => {
  const $0 = applicativeV2.pure(v.indicatorId);
  if ($0.tag === "Left") {
    return $Either("Left", $0._1);
  }
  if ($0.tag === "Right") {
    return $Either(
      "Right",
      (() => {
        const $1 = $0._1;
        return (primaryKeys) => (datapoints) => ({ indicatorId: $1, primaryKeys, datapoints });
      })()
    );
  }
  fail();
})())(applicativeV2.pure(v.primaryKeys)))(checkDuplicatedPoints(v.datapoints));

// output-es/Data.DDF.Entity/index.js
var applicativeV3 = /* @__PURE__ */ (() => {
  const applyV1 = applyV(semigroupArray);
  return { pure: (x) => $Either("Right", x), Apply0: () => applyV1 };
})();
var sequence2 = /* @__PURE__ */ (() => traversableList.traverse(applicativeV3)(identity5))();
var fromFoldable3 = /* @__PURE__ */ fromFoldable(ordId)(foldableList);
var apply3 = /* @__PURE__ */ (() => applyV(semigroupArray).apply)();
var splitEntAndProps = (props) => {
  const v = partition((v2) => {
    const v1 = stripPrefix2("is--")(v2._1);
    if (v1.tag === "Nothing") {
      return false;
    }
    if (v1.tag === "Just") {
      return true;
    }
    fail();
  })(unfoldableList.unfoldr(stepUnfoldrUnordered)($MapIter("IterNode", props, IterLeaf)));
  return $Tuple(
    listMap((v1) => $Tuple(
      (() => {
        const $0 = drop(length2(take2(4)(v1._1)))(v1._1);
        if ($0 === "") {
          return "undefined_id";
        }
        return $0;
      })(),
      v1._2
    ))(v.yes),
    listMap((v1) => $Tuple(v1._1 === "" ? "undefined_id" : v1._1, v1._2))(v.no)
  );
};
var getEntitySets = (lst) => sequence2(listMap((v) => {
  if (v._2 === "TRUE" || v._2 === "true" || v._2 === "FALSE" || v._2 === "false") {
    return applicativeV3.pure(v._1);
  }
  return $Either("Left", [$Issue("Issue", "invalid boolean value for " + v._1 + ": " + v._2)]);
})(lst));
var entity = (entityId) => (entityDomain) => (entitySets) => (props) => ({ entityId, entityDomain, entitySets, props, _info: Nothing });
var compareEntSets = (setsFromHeader) => (setsFromFileName) => {
  if (setsFromFileName.tag === "Nothing") {
    return applicativeV3.pure(setsFromHeader);
  }
  if (setsFromFileName.tag === "Just") {
    if (setsFromHeader.tag === "Nil") {
      return $Either("Left", [$Issue("Issue", "there should be a header is--" + setsFromFileName._1)]);
    }
    if (setsFromHeader.tag === "Cons") {
      if (setsFromHeader._1 === setsFromFileName._1) {
        return applicativeV3.pure(setsFromHeader);
      }
      return $Either("Left", [$Issue("Issue", "there should be only one is--entity header: is--" + setsFromHeader._1)]);
    }
  }
  fail();
};
var parseEntity = (v) => {
  if (v.entityId === "") {
    return $Either("Left", [$Issue("Issue", "entity MUST have an entity id")]);
  }
  const v1 = splitEntAndProps(v.props);
  const $0 = apply3(apply3(apply3((() => {
    const $02 = parseId(v.entityId);
    if ($02.tag === "Left") {
      return $Either("Left", $02._1);
    }
    if ($02.tag === "Right") {
      return $Either("Right", entity($02._1));
    }
    fail();
  })())(applicativeV3.pure(v.entityDomain)))((() => {
    const $02 = getEntitySets(v1._1);
    if ($02.tag === "Left") {
      return $Either("Left", $02._1);
    }
    if ($02.tag === "Right") {
      return compareEntSets($02._1)(v.entitySet);
    }
    fail();
  })()))(applicativeV3.pure(functorMap.map(StrVal)(fromFoldable3(v1._2))));
  if ($0.tag === "Left") {
    return $Either("Left", $0._1);
  }
  if ($0.tag === "Right") {
    return applicativeV3.pure({ ...$0._1, _info: v._info });
  }
  fail();
};

// output-es/Data.Validation.Result/index.js
var showMessage = (v) => {
  const statstr = v.isWarning ? "[WARN] " : "[ERR] ";
  const linestr = v.lineNo === -1 ? "" : showIntImpl(v.lineNo) + ":";
  const filestr = v.file === "" ? "" : v.file + ":";
  if (filestr === "" && linestr === "") {
    return statstr + v.message;
  }
  return statstr + filestr + linestr + " " + v.message;
};
var messageFromIssue = (v) => {
  if (v.tag === "InvalidItem") {
    return { message: v._3, file: v._1, lineNo: v._2, isWarning: true };
  }
  return { message: showId.show(v), file: "", lineNo: -1, isWarning: true };
};
var hasError = (msgs) => {
  const v = find((msg) => !msg.isWarning)(msgs);
  if (v.tag === "Nothing") {
    return false;
  }
  if (v.tag === "Just") {
    return true;
  }
  fail();
};

// output-es/Data.Validation.ValidationT/index.js
var vWarning = (dictMonad) => {
  const $0 = monadStateExceptT(monadStateStateT(dictMonad));
  return (dictMonoid) => (e) => $0.state((s) => $Tuple(void 0, dictMonoid.Semigroup0().append(s)(e)));
};
var vError = (dictMonad) => monadThrowExceptT({
  Applicative0: () => applicativeStateT(dictMonad),
  Bind1: () => bindStateT(dictMonad)
}).throwError;
var runValidationT = (dictMonad) => (dictMonoid) => {
  const mempty = dictMonoid.mempty;
  return (v) => dictMonad.Bind1().bind(v(mempty))((v1) => dictMonad.Applicative0().pure((() => {
    if (v1._1.tag === "Left") {
      return $Tuple(dictMonoid.Semigroup0().append(v1._1._1)(v1._2), Nothing);
    }
    if (v1._1.tag === "Right") {
      return $Tuple(v1._2, $Maybe("Just", v1._1._1));
    }
    fail();
  })()));
};
var monadtransVT = {
  lift: (dictMonad) => (x) => bindStateT(dictMonad).bind((s) => dictMonad.Bind1().bind(x)((x$1) => dictMonad.Applicative0().pure($Tuple(x$1, s))))((a) => applicativeStateT(dictMonad).pure($Either(
    "Right",
    a
  )))
};
var monadVT = (dictMonad) => {
  const $0 = { Applicative0: () => applicativeStateT(dictMonad), Bind1: () => bindStateT(dictMonad) };
  return { Applicative0: () => applicativeExceptT($0), Bind1: () => bindExceptT($0) };
};

// output-es/App.Validations/index.js
var applicativeV4 = /* @__PURE__ */ (() => {
  const applyV1 = applyV(semigroupArray);
  return { pure: (x) => $Either("Right", x), Apply0: () => applyV1 };
})();
var applyV4 = /* @__PURE__ */ applyV(semigroupArray);
var sequence3 = /* @__PURE__ */ (() => traversableArray.traverse(applicativeV4)(identity2))();
var sequence13 = /* @__PURE__ */ (() => traversable1NonEmptyList.traverse1(applyV4)(identity5))();
var sequence22 = /* @__PURE__ */ (() => traversableNonEmptyList.sequence(applicativeV4))();
var validateOneDataPointFile = (headers) => (indicatorId) => (pKeys) => (keyParsers) => (valueParser) => (csvfile) => {
  const $0 = applyV4.apply(applyV4.apply(applyV4.apply((() => {
    if (indicatorId.tag === "Left") {
      return $Either("Left", indicatorId._1);
    }
    if (indicatorId.tag === "Right") {
      return $Either(
        "Right",
        (() => {
          const $02 = indicatorId._1;
          return (pk) => (kp) => (vp) => (row) => {
            const $1 = createPointInput(csvfile.fileInfo._1)($02)(pk)(headers)(row);
            if ($1.tag === "Left") {
              return $Either("Left", $1._1);
            }
            if ($1.tag === "Right") {
              if ($1._1._info.tag === "Nothing") {
                return parseDataPointWithValueParser(kp)(vp)($1._1);
              }
              if ($1._1._info.tag === "Just") {
                return withRowInfo($1._1._info._1.filepath)($1._1._info._1.row)(parseDataPointWithValueParser(kp)(vp)($1._1));
              }
            }
            fail();
          };
        })()
      );
    }
    fail();
  })())(pKeys))((() => {
    if (keyParsers.tag === "Left") {
      return $Either("Left", keyParsers._1);
    }
    if (keyParsers.tag === "Right") {
      return applicativeV4.pure(updateValueParserWithConstrain(keyParsers._1)(csvfile.fileInfo._2));
    }
    fail();
  })()))(valueParser);
  if ($0.tag === "Right") {
    return sequence3(arrayMap($0._1)(csvfile.csvContent.rows));
  }
  if ($0.tag === "Left") {
    return $Either("Left", $0._1);
  }
  fail();
};
var validateEntities = (csvfile) => (dictMonad) => {
  const vWarning2 = vWarning(dictMonad)(monoidArray);
  const $0 = applicativeExceptT({
    Applicative0: () => applicativeStateT(dictMonad),
    Bind1: () => bindStateT(dictMonad)
  });
  if (csvfile.fileInfo._2.tag === "Entities") {
    const $1 = csvfile.fileInfo._2._1;
    return foldM(monadVT(dictMonad))((acc) => (row) => {
      const $2 = createEntityInput(csvfile.fileInfo._1)($1)(csvfile.csvContent.headers)(row);
      const v1 = (() => {
        if ($2.tag === "Left") {
          return $Either("Left", $2._1);
        }
        if ($2.tag === "Right") {
          return parseEntity($2._1);
        }
        fail();
      })();
      if (v1.tag === "Left") {
        return bindExceptT({
          Applicative0: () => applicativeStateT(dictMonad),
          Bind1: () => bindStateT(dictMonad)
        }).bind(vWarning2(arrayMap((() => {
          const $3 = row._1;
          return (x) => ({ ...messageFromIssue(x), file: csvfile.fileInfo._1, isWarning: false, lineNo: $3 });
        })())(v1._1)))(() => $0.pure(acc));
      }
      if (v1.tag === "Right") {
        return $0.pure([v1._1, ...acc]);
      }
      fail();
    })([])(csvfile.csvContent.rows);
  }
  return $0.pure([]);
};
var validateDataPoints = (dataset) => (csvfiles) => (dictMonad) => {
  const bindVT2 = bindExceptT({
    Applicative0: () => applicativeStateT(dictMonad),
    Bind1: () => bindStateT(dictMonad)
  });
  const applicativeVT2 = applicativeExceptT({
    Applicative0: () => applicativeStateT(dictMonad),
    Bind1: () => bindStateT(dictMonad)
  });
  const vWarning2 = vWarning(dictMonad)(monoidArray);
  const csvfile = (() => {
    if (0 < csvfiles.length) {
      return csvfiles[0];
    }
    fail();
  })();
  if (csvfile.fileInfo._2.tag === "DataPoints") {
    const vpkeys = sequence13($NonEmpty(
      parseId(csvfile.fileInfo._2._1.pkeys._1),
      listMap(parseId$p)(csvfile.fileInfo._2._1.pkeys._2)
    ));
    const vid = parseId(csvfile.fileInfo._2._1.indicator);
    const valueParser = (() => {
      if (vid.tag === "Left") {
        return $Either("Left", vid._1);
      }
      if (vid.tag === "Right") {
        return getValueParser(dataset)(vid._1);
      }
      fail();
    })();
    const keyParsers = (() => {
      if (vpkeys.tag === "Left") {
        return $Either("Left", vpkeys._1);
      }
      if (vpkeys.tag === "Right") {
        return sequence22($NonEmpty(
          getValueParser(dataset)(vpkeys._1._1),
          listMap(getValueParser(dataset))(vpkeys._1._2)
        ));
      }
      fail();
    })();
    return bindVT2.bind(traversableArray.traverse(applicativeVT2)((f) => {
      const $0 = validateOneDataPointFile(csvfile.csvContent.headers)(vid)(vpkeys)(keyParsers)(valueParser)(f);
      if ($0.tag === "Right") {
        return applicativeVT2.pure($0._1);
      }
      if ($0.tag === "Left") {
        return bindVT2.bind(vWarning2(arrayMap((x) => ({ ...messageFromIssue(x), isWarning: false }))($0._1)))(() => applicativeVT2.pure([]));
      }
      fail();
    })(csvfiles))((points) => {
      const $0 = applyV4.apply(applyV4.apply((() => {
        if (vid.tag === "Left") {
          return $Either("Left", vid._1);
        }
        if (vid.tag === "Right") {
          return $Either(
            "Right",
            (() => {
              const $02 = vid._1;
              return (v2) => (v3) => ({ indicatorId: $02, primaryKeys: v2, datapoints: v3 });
            })()
          );
        }
        fail();
      })())(vpkeys))(applicativeV4.pure(concat(points)));
      const v1 = (() => {
        if ($0.tag === "Left") {
          return $Either("Left", $0._1);
        }
        if ($0.tag === "Right") {
          return parseDataPointList($0._1);
        }
        fail();
      })();
      if (v1.tag === "Right") {
        return applicativeVT2.pure([v1._1]);
      }
      if (v1.tag === "Left") {
        return bindVT2.bind(vWarning2(arrayMap((x) => ({ ...messageFromIssue(x), isWarning: false }))(v1._1)))(() => applicativeVT2.pure([]));
      }
      fail();
    });
  }
  return applicativeVT2.pure([]);
};
var validateCsvHeaders = (v) => (v1) => (dictMonad) => {
  const applicativeVT2 = applicativeExceptT({
    Applicative0: () => applicativeStateT(dictMonad),
    Bind1: () => bindStateT(dictMonad)
  });
  const vWarning2 = vWarning(dictMonad)(monoidArray);
  const reserved = arrayMap(unsafeCoerce)(reservedConcepts);
  const filepath = v1.fileInfo._1;
  const concepts = arrayMap(unsafeCoerce)(keys(v.concepts));
  return bindExceptT({
    Applicative0: () => applicativeStateT(dictMonad),
    Bind1: () => bindStateT(dictMonad)
  }).bind(traversableArray.traverse(applicativeVT2)((h) => {
    const $0 = vWarning2([
      { ...messageFromIssue($Issue("Issue", h + " is not in concept list but it's in the header.")), file: filepath }
    ]);
    if (!(take2(4)(h) === "is--" || elem(eqString)(h)(reserved) || elem(eqString)(h)(concepts))) {
      return $0;
    }
    return applicativeVT2.pure();
  })(arrayMap(unsafeCoerce)(v1.csvContent.headers)))(() => applicativeVT2.pure());
};
var validateCsvFile = (v) => (dictMonad) => {
  const $0 = applicativeExceptT({
    Applicative0: () => applicativeStateT(dictMonad),
    Bind1: () => bindStateT(dictMonad)
  });
  const $1 = parseCsvFile({ fileInfo: v._1, csvContent: create(v._2) });
  if ($1.tag === "Right") {
    return $0.pure([$1._1]);
  }
  if ($1.tag === "Left") {
    return bindExceptT({
      Applicative0: () => applicativeStateT(dictMonad),
      Bind1: () => bindStateT(dictMonad)
    }).bind(vWarning(dictMonad)(monoidArray)(arrayMap((x) => ({ ...messageFromIssue(x), file: v._1._1 }))($1._1)))(() => $0.pure([]));
  }
  fail();
};
var validateCsvFiles = (xs) => (dictMonad) => {
  const applicativeVT2 = applicativeExceptT({
    Applicative0: () => applicativeStateT(dictMonad),
    Bind1: () => bindStateT(dictMonad)
  });
  return bindExceptT({
    Applicative0: () => applicativeStateT(dictMonad),
    Bind1: () => bindStateT(dictMonad)
  }).bind(traversableArray.traverse(applicativeVT2)((x) => validateCsvFile(x)(dictMonad))(xs))((rs) => applicativeVT2.pure(concat(rs)));
};
var validateConcepts = (csvfile) => (dictMonad) => {
  const vWarning2 = vWarning(dictMonad)(monoidArray);
  const $0 = applicativeExceptT({
    Applicative0: () => applicativeStateT(dictMonad),
    Bind1: () => bindStateT(dictMonad)
  });
  if (csvfile.fileInfo._2.tag === "Concepts") {
    return foldM(monadVT(dictMonad))((acc) => (row) => {
      const $1 = createConceptInput(csvfile.fileInfo._1)(csvfile.csvContent.headers)(row);
      const v1 = (() => {
        if ($1.tag === "Left") {
          return $Either("Left", $1._1);
        }
        if ($1.tag === "Right") {
          return parseConcept($1._1);
        }
        fail();
      })();
      if (v1.tag === "Left") {
        return bindExceptT({
          Applicative0: () => applicativeStateT(dictMonad),
          Bind1: () => bindStateT(dictMonad)
        }).bind(vWarning2(arrayMap((() => {
          const $2 = row._1;
          return (x) => ({ ...messageFromIssue(x), file: csvfile.fileInfo._1, isWarning: false, lineNo: $2 });
        })())(v1._1)))(() => $0.pure(acc));
      }
      if (v1.tag === "Right") {
        return $0.pure([v1._1, ...acc]);
      }
      fail();
    })([])(csvfile.csvContent.rows);
  }
  return $0.pure([]);
};
var validateConceptLength = (v) => (dictMonad) => {
  const $0 = sequence3(arrayMap((concept2) => {
    if (concept2._info.tag === "Just") {
      return withRowInfo(concept2._info._1.filepath)(concept2._info._1.row)(isLongerThan64Chars(concept2.conceptId));
    }
    if (concept2._info.tag === "Nothing") {
      return isLongerThan64Chars(concept2.conceptId);
    }
    fail();
  })(values(v.concepts)));
  if ($0.tag === "Left") {
    return vWarning(dictMonad)(monoidArray)(arrayMap(messageFromIssue)($0._1));
  }
  if ($0.tag === "Right") {
    return applicativeExceptT({
      Applicative0: () => applicativeStateT(dictMonad),
      Bind1: () => bindStateT(dictMonad)
    }).pure();
  }
  fail();
};
var createCsvFileInput = (fi) => _bind(readCsv(fi._1))((csvRows) => _pure($Tuple(fi, csvRows)));
var checkNonEmptyArray = (name2) => (xs) => (dictMonad) => {
  if (xs.length > 0) {
    return applicativeExceptT({
      Applicative0: () => applicativeStateT(dictMonad),
      Bind1: () => bindStateT(dictMonad)
    }).pure(xs);
  }
  return vError(dictMonad)([
    messageFromIssue($Issue("Issue", "expect " + name2 + " has at least one item"))
  ]);
};

// output-es/Data.DDF.Csv.FileInfo/index.js
var $CollectionInfo = (tag, _1) => ({ tag, _1 });
var $FileInfo = (_1, _2, _3) => ({ tag: "FileInfo", _1, _2, _3 });
var choice = /* @__PURE__ */ (() => foldlArray(altParser.alt)((v) => $Either("Left", { pos: v.position, error: "Nothing to parse" })))();
var compare1 = /* @__PURE__ */ (() => ordNonEmpty2(ordString).compare)();
var Concepts = /* @__PURE__ */ $CollectionInfo("Concepts");
var pkeyWithConstrain = (s) => {
  const $0 = identifier(s);
  return (() => {
    if ($0.tag === "Left") {
      const $1 = $0._1;
      return (v) => $Either("Left", $1);
    }
    if ($0.tag === "Right") {
      const $1 = $0._1;
      return (f) => f($1);
    }
    fail();
  })()((v1) => {
    const $1 = string("-")(v1.suffix);
    if ($1.tag === "Left") {
      return $Either("Left", $1._1);
    }
    if ($1.tag === "Right") {
      const $2 = identifier($1._1.suffix);
      return (() => {
        if ($2.tag === "Left") {
          const $3 = $2._1;
          return (v) => $Either("Left", $3);
        }
        if ($2.tag === "Right") {
          const $3 = $2._1;
          return (f) => f($3);
        }
        fail();
      })()((v1$1) => $Either("Right", { result: $Tuple(v1.result, $Maybe("Just", v1$1.result)), suffix: v1$1.suffix }));
    }
    fail();
  });
};
var pkeyNoConstrain = (s) => {
  const $0 = identifier(s);
  return (() => {
    if ($0.tag === "Left") {
      const $1 = $0._1;
      return (v) => $Either("Left", $1);
    }
    if ($0.tag === "Right") {
      const $1 = $0._1;
      return (f) => f($1);
    }
    fail();
  })()((v1) => $Either("Right", { result: $Tuple(v1.result, Nothing), suffix: v1.suffix }));
};
var pkey = /* @__PURE__ */ choice([
  (s) => {
    const v1 = pkeyWithConstrain(s);
    if (v1.tag === "Left") {
      return $Either("Left", { pos: s.position, error: v1._1.error });
    }
    return v1;
  },
  (s) => {
    const v1 = pkeyNoConstrain(s);
    if (v1.tag === "Left") {
      return $Either("Left", { pos: s.position, error: v1._1.error });
    }
    return v1;
  }
]);
var eqCollection = {
  eq: (v) => (v1) => {
    if (v.tag === "Concepts") {
      return v1.tag === "Concepts";
    }
    if (v.tag === "Entities") {
      return v1.tag === "Entities";
    }
    if (v.tag === "DataPoints") {
      return v1.tag === "DataPoints";
    }
    return v.tag === "Other" && v1.tag === "Other" && v._1 === v1._1;
  }
};
var ordCollection = {
  compare: (v) => (v1) => {
    if (v.tag === "Concepts") {
      if (v1.tag === "Concepts") {
        return EQ;
      }
      return GT;
    }
    if (v.tag === "Entities") {
      if (v1.tag === "Concepts") {
        return LT;
      }
      if (v1.tag === "Entities") {
        return EQ;
      }
      return GT;
    }
    if (v.tag === "DataPoints") {
      if (v1.tag === "DataPoints") {
        return EQ;
      }
      if (v1.tag === "Concepts") {
        return LT;
      }
      if (v1.tag === "Entities") {
        return LT;
      }
      return GT;
    }
    if (v.tag === "Other") {
      if (v1.tag === "Other") {
        return ordString.compare(v._1)(v1._1);
      }
      return LT;
    }
    fail();
  },
  Eq0: () => eqCollection
};
var ddfFileBegin = (x) => {
  const $0 = string("ddf--")(x);
  if ($0.tag === "Left") {
    return $Either("Left", $0._1);
  }
  if ($0.tag === "Right") {
    return $Either("Right", { result: void 0, suffix: $0._1.suffix });
  }
  fail();
};
var e1 = (s) => {
  const $0 = ddfFileBegin(s);
  return (() => {
    if ($0.tag === "Left") {
      const $1 = $0._1;
      return (v) => $Either("Left", $1);
    }
    if ($0.tag === "Right") {
      const $1 = $0._1;
      return (f) => f($1);
    }
    fail();
  })()((v1) => {
    const $1 = string("entities--")(v1.suffix);
    if ($1.tag === "Left") {
      return $Either("Left", $1._1);
    }
    if ($1.tag === "Right") {
      const $2 = identifier($1._1.suffix);
      return (() => {
        if ($2.tag === "Left") {
          const $3 = $2._1;
          return (v) => $Either("Left", $3);
        }
        if ($2.tag === "Right") {
          const $3 = $2._1;
          return (f) => f($3);
        }
        fail();
      })()((v1$1) => {
        const $3 = v1$1.result;
        const $4 = eof(v1$1.suffix);
        return (() => {
          if ($4.tag === "Left") {
            const $5 = $4._1;
            return (v) => $Either("Left", $5);
          }
          if ($4.tag === "Right") {
            const $5 = $4._1;
            return (f) => f($5);
          }
          fail();
        })()((v1$2) => $Either("Right", { result: $CollectionInfo("Entities", { domain: $3, set: Nothing }), suffix: v1$2.suffix }));
      });
    }
    fail();
  });
};
var e2 = (s) => {
  const $0 = ddfFileBegin(s);
  return (() => {
    if ($0.tag === "Left") {
      const $1 = $0._1;
      return (v) => $Either("Left", $1);
    }
    if ($0.tag === "Right") {
      const $1 = $0._1;
      return (f) => f($1);
    }
    fail();
  })()((v1) => {
    const $1 = string("entities--")(v1.suffix);
    const $2 = (() => {
      if ($1.tag === "Left") {
        return $Either("Left", $1._1);
      }
      if ($1.tag === "Right") {
        return $Either("Right", { result: void 0, suffix: $1._1.suffix });
      }
      fail();
    })();
    return (() => {
      if ($2.tag === "Left") {
        const $3 = $2._1;
        return (v) => $Either("Left", $3);
      }
      if ($2.tag === "Right") {
        const $3 = $2._1;
        return (f) => f($3);
      }
      fail();
    })()((v1$1) => {
      const $3 = identifier(v1$1.suffix);
      return (() => {
        if ($3.tag === "Left") {
          const $4 = $3._1;
          return (v) => $Either("Left", $4);
        }
        if ($3.tag === "Right") {
          const $4 = $3._1;
          return (f) => f($4);
        }
        fail();
      })()((v1$2) => {
        const $4 = string("--")(v1$2.suffix);
        if ($4.tag === "Left") {
          return $Either("Left", $4._1);
        }
        if ($4.tag === "Right") {
          const $5 = identifier($4._1.suffix);
          return (() => {
            if ($5.tag === "Left") {
              const $6 = $5._1;
              return (v) => $Either("Left", $6);
            }
            if ($5.tag === "Right") {
              const $6 = $5._1;
              return (f) => f($6);
            }
            fail();
          })()((v1$3) => {
            const $6 = v1$3.result;
            const $7 = eof(v1$3.suffix);
            return (() => {
              if ($7.tag === "Left") {
                const $8 = $7._1;
                return (v) => $Either("Left", $8);
              }
              if ($7.tag === "Right") {
                const $8 = $7._1;
                return (f) => f($8);
              }
              fail();
            })()((v1$4) => $Either("Right", { result: $CollectionInfo("Entities", { domain: v1$2.result, set: $Maybe("Just", $6) }), suffix: v1$4.suffix }));
          });
        }
        fail();
      });
    });
  });
};
var entityFile = /* @__PURE__ */ choice([
  (s) => {
    const v1 = e2(s);
    if (v1.tag === "Left") {
      return $Either("Left", { pos: s.position, error: v1._1.error });
    }
    return v1;
  },
  (s) => {
    const v1 = e1(s);
    if (v1.tag === "Left") {
      return $Either("Left", { pos: s.position, error: v1._1.error });
    }
    return v1;
  }
]);
var datapointFile = (s) => {
  const $0 = ddfFileBegin(s);
  return (() => {
    if ($0.tag === "Left") {
      const $1 = $0._1;
      return (v) => $Either("Left", $1);
    }
    if ($0.tag === "Right") {
      const $1 = $0._1;
      return (f) => f($1);
    }
    fail();
  })()((v1) => {
    const $1 = string("datapoints--")(v1.suffix);
    const $2 = (() => {
      if ($1.tag === "Left") {
        return $Either("Left", $1._1);
      }
      if ($1.tag === "Right") {
        return $Either("Right", { result: void 0, suffix: $1._1.suffix });
      }
      fail();
    })();
    return (() => {
      if ($2.tag === "Left") {
        const $3 = $2._1;
        return (v) => $Either("Left", $3);
      }
      if ($2.tag === "Right") {
        const $3 = $2._1;
        return (f) => f($3);
      }
      fail();
    })()((v1$1) => {
      const $3 = identifier(v1$1.suffix);
      return (() => {
        if ($3.tag === "Left") {
          const $4 = $3._1;
          return (v) => $Either("Left", $4);
        }
        if ($3.tag === "Right") {
          const $4 = $3._1;
          return (f) => f($4);
        }
        fail();
      })()((v1$2) => {
        const $4 = string("--by--")(v1$2.suffix);
        if ($4.tag === "Left") {
          return $Either("Left", $4._1);
        }
        if ($4.tag === "Right") {
          const $5 = sepBy1(pkey)(string("--"))($4._1.suffix);
          return (() => {
            if ($5.tag === "Left") {
              const $6 = $5._1;
              return (v) => $Either("Left", $6);
            }
            if ($5.tag === "Right") {
              const $6 = $5._1;
              return (f) => f($6);
            }
            fail();
          })()((v1$3) => $Either(
            "Right",
            {
              result: $CollectionInfo(
                "DataPoints",
                {
                  indicator: v1$2.result,
                  pkeys: $NonEmpty(v1$3.result._1._1, listMap(fst)(v1$3.result._2)),
                  constrains: $NonEmpty(v1$3.result._1._2, listMap(snd)(v1$3.result._2))
                }
              ),
              suffix: v1$3.suffix
            }
          ));
        }
        fail();
      });
    });
  });
};
var compareDP = (v) => (v1) => {
  if (v.tag === "DataPoints" && v1.tag === "DataPoints") {
    if (v._1.indicator === v1._1.indicator) {
      return compare1(v._1.pkeys)(v1._1.pkeys);
    }
    return ordString.compare(v._1.indicator)(v1._1.indicator);
  }
  return EQ;
};
var c2 = (s) => {
  const $0 = string("ddf--concepts--")(s);
  return (() => {
    if ($0.tag === "Left") {
      const $1 = $0._1;
      return (v) => $Either("Left", $1);
    }
    if ($0.tag === "Right") {
      const $1 = $0._1;
      return (f) => f($1);
    }
    fail();
  })()((v1) => {
    const $1 = v1.result;
    const v2 = string("discrete")(v1.suffix);
    const $2 = (() => {
      if (v2.tag === "Left") {
        if (v1.suffix.position === v2._1.pos) {
          return string("continuous")(v1.suffix);
        }
        return $Either("Left", { error: v2._1.error, pos: v2._1.pos });
      }
      return v2;
    })();
    return (() => {
      if ($2.tag === "Left") {
        const $3 = $2._1;
        return (v) => $Either("Left", $3);
      }
      if ($2.tag === "Right") {
        const $3 = $2._1;
        return (f) => f($3);
      }
      fail();
    })()((v1$1) => {
      const $3 = eof(v1$1.suffix);
      if ($3.tag === "Left") {
        return $Either("Left", $3._1);
      }
      if ($3.tag === "Right") {
        return $Either("Right", { result: $1 + v1$1.result, suffix: $3._1.suffix });
      }
      fail();
    });
  });
};
var c1 = /* @__PURE__ */ (() => applyParser.apply((x) => {
  const $0 = string("ddf--concepts")(x);
  if ($0.tag === "Left") {
    return $Either("Left", $0._1);
  }
  if ($0.tag === "Right") {
    return $Either(
      "Right",
      {
        result: (() => {
          const $1 = $0._1.result;
          return (v) => $1;
        })(),
        suffix: $0._1.suffix
      }
    );
  }
  fail();
})(eof))();
var conceptFile = /* @__PURE__ */ (() => applyParser.apply((() => {
  const $0 = choice([
    (s) => {
      const v1 = c1(s);
      if (v1.tag === "Left") {
        return $Either("Left", { pos: s.position, error: v1._1.error });
      }
      return v1;
    },
    (s) => {
      const v1 = c2(s);
      if (v1.tag === "Left") {
        return $Either("Left", { pos: s.position, error: v1._1.error });
      }
      return v1;
    }
  ]);
  return (x) => {
    const $1 = $0(x);
    if ($1.tag === "Left") {
      return $Either("Left", $1._1);
    }
    if ($1.tag === "Right") {
      return $Either("Right", { result: identity, suffix: $1._1.suffix });
    }
    fail();
  };
})())((s) => $Either("Right", { result: Concepts, suffix: s })))();
var validateFileInfo = (fp) => {
  const v = stripSuffix(".csv")(basename(fp));
  if (v.tag === "Nothing") {
    return $Either("Left", [$Issue("InvalidCSV", "not a csv file")]);
  }
  if (v.tag === "Just") {
    const $0 = { substring: v._1, position: 0 };
    const v1 = (() => {
      const v2 = conceptFile($0);
      const $1 = (() => {
        if (v2.tag === "Left") {
          if ($0.position === v2._1.pos) {
            const v2$1 = entityFile($0);
            if (v2$1.tag === "Left") {
              if ($0.position === v2$1._1.pos) {
                return datapointFile($0);
              }
              return $Either("Left", { error: v2$1._1.error, pos: v2$1._1.pos });
            }
            return v2$1;
          }
          return $Either("Left", { error: v2._1.error, pos: v2._1.pos });
        }
        return v2;
      })();
      if ($1.tag === "Left") {
        return $Either("Left", $1._1);
      }
      if ($1.tag === "Right") {
        return $Either("Right", $1._1.result);
      }
      fail();
    })();
    if (v1.tag === "Right") {
      return $Either("Right", $FileInfo(fp, v1._1, v._1));
    }
    if (v1.tag === "Left") {
      return $Either("Left", [$Issue("InvalidCSV", "error parsing file: " + v1._1.error)]);
    }
  }
  fail();
};

// output-es/Effect.Console/foreign.js
var log2 = function(s) {
  return function() {
    console.log(s);
  };
};

// output-es/Foreign.Object/foreign.js
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

// output-es/Node.Process/foreign.js
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

// output-es/Main/index.js
var bindVT = /* @__PURE__ */ bindExceptT({
  Applicative0: () => applicativeStateT(monadAff),
  Bind1: () => bindStateT(monadAff)
});
var applicativeVT = /* @__PURE__ */ applicativeExceptT({
  Applicative0: () => applicativeStateT(monadAff),
  Bind1: () => bindStateT(monadAff)
});
var vError2 = /* @__PURE__ */ vError(monadAff);
var sequence4 = /* @__PURE__ */ (() => traversableArray.traverse(applicativeAff)(identity2))();
var $$for = /* @__PURE__ */ (() => {
  const traverse2 = traversableArray.traverse(applicativeVT);
  return (x) => (f) => traverse2(f)(x);
})();
var sequence14 = /* @__PURE__ */ (() => traversableArray.traverse(applicativeAff)(identity2))();
var runValidationT2 = /* @__PURE__ */ runValidationT(monadAff)(monoidArray);
var validate = (path2) => bindVT.bind(monadtransVT.lift(monadAff)(_liftEffect(log2("reading file list..."))))(() => bindVT.bind(monadtransVT.lift(monadAff)(getFiles(path2)([
  ".git",
  "etl",
  "lang",
  "assets"
])))((fs) => {
  const ddfFiles = mapMaybe((x) => x)(arrayMap((f) => {
    const $0 = validateFileInfo(f);
    if ($0.tag === "Left") {
      return Nothing;
    }
    if ($0.tag === "Right") {
      return $Maybe("Just", $0._1);
    }
    fail();
  })(fs));
  return bindVT.bind(0 < ddfFiles.length ? applicativeVT.pure() : vError2([messageFromIssue($Issue("Issue", "No csv files in this folder. Please begin with a ddf--concepts.csv file."))]))(() => bindVT.bind(monadtransVT.lift(monadAff)(_liftEffect(log2("loading concepts and entities..."))))(() => {
    const fileGroups = groupAllBy((a) => (b) => ordCollection.compare(a._2)(b._2))(ddfFiles);
    return bindVT.bind(checkNonEmptyArray("concept csvs")(filterImpl(
      (x) => {
        if (0 < x.length) {
          return x[0]._2.tag === "Concepts";
        }
        fail();
      },
      fileGroups
    ))(monadAff))((conceptFiles_) => bindVT.bind(monadtransVT.lift(monadAff)(sequence4(arrayMap(createCsvFileInput)((() => {
      if (0 < conceptFiles_.length) {
        return conceptFiles_[0];
      }
      fail();
    })()))))((conceptInputs) => bindVT.bind(validateCsvFiles(conceptInputs)(monadAff))((conceptCsvFiles) => bindVT.bind($$for(conceptCsvFiles)((x) => validateConcepts(x)(monadAff)))((concepts) => bindVT.bind(monadtransVT.lift(monadAff)(sequence4(arrayMap(createCsvFileInput)(arrayBind(filterImpl(
      (x) => {
        if (0 < x.length) {
          return x[0]._2.tag === "Entities";
        }
        fail();
      },
      fileGroups
    ))(toArray2)))))((entityInputs) => bindVT.bind(validateCsvFiles(entityInputs)(monadAff))((entityCsvFiles) => bindVT.bind($$for(entityCsvFiles)((x) => validateEntities(x)(monadAff)))((entities) => {
      const $0 = parseBaseDataSet({ concepts: concat(concepts), entities: concat(entities) });
      if ($0.tag === "Left") {
        return vError2(arrayMap(messageFromIssue)($0._1));
      }
      if ($0.tag === "Right") {
        const $1 = $0._1;
        return bindVT.bind(monadtransVT.lift(monadAff)(_liftEffect(log2("validating concepts and entities..."))))(() => bindVT.bind($$for(conceptCsvFiles)((x) => validateCsvHeaders($1)(x)(monadAff)))(() => bindVT.bind($$for(entityCsvFiles)((x) => validateCsvHeaders($1)(x)(monadAff)))(() => bindVT.bind(validateConceptLength($1)(monadAff))(() => bindVT.bind(monadtransVT.lift(monadAff)(_liftEffect(log2("validating datapoints..."))))(() => bindVT.bind($$for(groupAllBy((a) => (b) => compareDP(a._2)(b._2))(arrayBind(filterImpl(
          (x) => {
            if (0 < x.length) {
              return x[0]._2.tag === "DataPoints";
            }
            fail();
          },
          fileGroups
        ))(toArray2)))((files) => bindVT.bind(monadtransVT.lift(monadAff)(sequence14(arrayMap(createCsvFileInput)(files))))((csvfileinputs) => bindVT.bind(validateCsvFiles(csvfileinputs)(monadAff))((csvfiles) => {
          if (csvfiles.length > 0) {
            return bindVT.bind(validateDataPoints($1)(csvfiles)(monadAff))((dpl) => applicativeVT.pure());
          }
          return applicativeVT.pure();
        }))))(() => applicativeVT.pure($1)))))));
      }
      fail();
    })))))));
  }));
}));
var runMain = (path2) => {
  const $0 = _makeFiber(
    ffiUtil,
    _bind(_liftEffect(log2("v0.0.6")))(() => _bind(runValidationT2(validate(path2)))((v) => {
      const $02 = v._2;
      const $1 = v._1;
      return _bind(_liftEffect(log2(joinWith("\n")(arrayMap(showMessage)($1)))))(() => {
        if ($02.tag === "Just") {
          if (hasError($1)) {
            return _liftEffect(log2("\u274C Dataset is invalid"));
          }
          return _liftEffect(log2("\u2705 Dataset is valid"));
        }
        if ($02.tag === "Nothing") {
          return _liftEffect(log2("\u274C Dataset is invalid"));
        }
        fail();
      });
    }))
  );
  return () => {
    const fiber = $0();
    fiber.run();
  };
};
var main = () => {
  const path2 = argv();
  if (2 < path2.length) {
    return runMain(path2[2])();
  }
  return runMain("./")();
};
export {
  applicativeVT,
  bindVT,
  $$for as for,
  main,
  runMain,
  runValidationT2 as runValidationT,
  sequence4 as sequence,
  sequence14 as sequence1,
  vError2 as vError,
  validate
};

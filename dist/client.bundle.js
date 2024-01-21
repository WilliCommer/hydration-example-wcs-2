(() => {
  // node_modules/vanjs-core/src/van.js
  var Obj = Object;
  var _undefined;
  var protoOf = Obj.getPrototypeOf;
  var doc = document;
  var changedStates;
  var curDeps;
  var curNewDerives;
  var alwaysConnectedDom = { isConnected: 1 };
  var gcCycleInMs = 1e3;
  var statesToGc;
  var propSetterCache = {};
  var objProto = protoOf(alwaysConnectedDom);
  var funcProto = protoOf(protoOf);
  var addAndScheduleOnFirst = (set, s, f, waitMs) => (set ?? (setTimeout(f, waitMs), /* @__PURE__ */ new Set())).add(s);
  var runAndCaptureDeps = (f, deps, arg) => {
    let prevDeps = curDeps;
    curDeps = deps;
    try {
      return f(arg);
    } catch (e) {
      console.error(e);
      return arg;
    } finally {
      curDeps = prevDeps;
    }
  };
  var keepConnected = (l) => l.filter((b) => b._dom?.isConnected);
  var addStatesToGc = (d) => statesToGc = addAndScheduleOnFirst(statesToGc, d, () => {
    for (let s of statesToGc)
      s._bindings = keepConnected(s._bindings), s._listeners = keepConnected(s._listeners);
    statesToGc = _undefined;
  }, gcCycleInMs);
  var stateProto = {
    get val() {
      curDeps?.add(this);
      return this._val;
    },
    get oldVal() {
      curDeps?.add(this);
      return this._oldVal;
    },
    set val(v) {
      let s = this;
      if (v !== s._val) {
        s._val = v;
        let listeners = [...s._listeners = keepConnected(s._listeners)];
        for (let l of listeners)
          derive(l.f, l.s, l._dom), l._dom = _undefined;
        s._bindings.length ? changedStates = addAndScheduleOnFirst(changedStates, s, updateDoms) : s._oldVal = v;
      }
    }
  };
  var state = (initVal) => ({
    __proto__: stateProto,
    _val: initVal,
    _oldVal: initVal,
    _bindings: [],
    _listeners: []
  });
  var isState = (s) => protoOf(s ?? 0) === stateProto;
  var val = (s) => isState(s) ? s.val : s;
  var oldVal = (s) => isState(s) ? s.oldVal : s;
  var bind = (f, dom) => {
    let deps = /* @__PURE__ */ new Set(), binding = { f }, prevNewDerives = curNewDerives;
    curNewDerives = [];
    let newDom = runAndCaptureDeps(f, deps, dom);
    newDom = (newDom ?? doc).nodeType ? newDom : new Text(newDom);
    for (let d of deps)
      addStatesToGc(d), d._bindings.push(binding);
    for (let l of curNewDerives)
      l._dom = newDom;
    curNewDerives = prevNewDerives;
    return binding._dom = newDom;
  };
  var derive = (f, s = state(), dom) => {
    let deps = /* @__PURE__ */ new Set(), listener = { f, s };
    listener._dom = dom ?? curNewDerives?.push(listener) ?? alwaysConnectedDom;
    s.val = runAndCaptureDeps(f, deps);
    for (let d of deps)
      addStatesToGc(d), d._listeners.push(listener);
    return s;
  };
  var add = (dom, ...children) => {
    for (let c of children.flat(Infinity)) {
      let protoOfC = protoOf(c ?? 0);
      let child = protoOfC === stateProto ? bind(() => c.val) : protoOfC === funcProto ? bind(c) : c;
      if (child != _undefined)
        dom.append(child);
    }
    return dom;
  };
  var _ = (f) => (f._isBindingFunc = 1, f);
  var tagsNS = (ns) => new Proxy((name, ...args) => {
    let [props, ...children] = protoOf(args[0] ?? 0) === objProto ? args : [{}, ...args];
    let dom = ns ? doc.createElementNS(ns, name) : doc.createElement(name);
    for (let [k, v] of Obj.entries(props)) {
      let getPropDescriptor = (proto) => proto ? Obj.getOwnPropertyDescriptor(proto, k) ?? getPropDescriptor(protoOf(proto)) : _undefined;
      let cacheKey = name + "," + k;
      let propSetter = propSetterCache[cacheKey] ?? (propSetterCache[cacheKey] = getPropDescriptor(protoOf(dom))?.set ?? 0);
      let setter = propSetter ? propSetter.bind(dom) : dom.setAttribute.bind(dom, k);
      let protoOfV = protoOf(v ?? 0);
      if (protoOfV === stateProto)
        bind(() => (setter(v.val), dom));
      else if (protoOfV === funcProto && (!k.startsWith("on") || v._isBindingFunc))
        bind(() => (setter(v()), dom));
      else
        setter(v);
    }
    return add(dom, ...children);
  }, { get: (tag, name) => tag.bind(_undefined, name) });
  var update = (dom, newDom) => newDom ? newDom !== dom && dom.replaceWith(newDom) : dom.remove();
  var updateDoms = () => {
    let changedStatesArray = [...changedStates].filter((s) => s._val !== s._oldVal);
    changedStates = _undefined;
    for (let b of new Set(changedStatesArray.flatMap((s) => s._bindings = keepConnected(s._bindings))))
      update(b._dom, bind(b.f, b._dom)), b._dom = _undefined;
    for (let s of changedStatesArray)
      s._oldVal = s._val;
  };
  var hydrate = (dom, f) => update(dom, bind(f, dom));
  var van_default = { add, _, tags: tagsNS(), tagsNS, state, val, oldVal, derive, hydrate };

  // src/components/hello.js
  var hello_default = () => {
    const { a, div, li, p: p2, ul } = van_default.tags;
    const fromServer = typeof window === "undefined";
    return div(
      p2(() => `\u{1F44B}Hello (from ${fromServer ? "server" : "client"})`),
      ul(
        li("\u{1F5FA}\uFE0FWorld"),
        li(a({ href: "https://vanjs.org/" }, "\u{1F366}VanJS"))
      )
    );
  };

  // src/components/counter.js
  var counter_default = ({ id, init = 0, buttonStyle = "\u{1F44D}\u{1F44E}" }) => {
    const { button: button2, div } = van_default.tags;
    const counter = van_default.state(init);
    const upChar = () => [...van_default.val(buttonStyle)][0];
    const downChar = () => [...van_default.val(buttonStyle)][1];
    return div(
      { ...id ? { id } : {}, "data-counter": counter },
      "\u2764\uFE0F ",
      counter,
      " ",
      button2({ onclick: () => ++counter.val }, upChar),
      button2({ onclick: () => --counter.val }, downChar)
    );
  };

  // src/components/styled-counter.js
  function StyledCounter(props = {}) {
    const { p: p2, select, option } = van_default.tags;
    const buttonStyle = van_default.state(van_default.val(props.buttonStyle) || "\u{1F446}\u{1F447}");
    const Option = (val2) => option({ selected: val2 === buttonStyle.val }, val2);
    return p2(
      "Select the button style: ",
      select(
        { id: "button-style", oninput: (e) => buttonStyle.val = e.target.value },
        Option("\u{1F446}\u{1F447}"),
        Option("\u{1F44D}\u{1F44E}"),
        Option("\u{1F53C}\u{1F53D}"),
        Option("\u23EB\u23EC"),
        Option("\u{1F4C8}\u{1F4C9}")
      ),
      counter_default({ ...props, buttonStyle })
    );
  }

  // src/client.js
  var { button, p } = van_default.tags;
  var nameOf = { Counter: counter_default, Hello: hello_default, StyledCounter };
  function hydrate2() {
    var list = document.querySelectorAll("[data-hydrate-name]");
    list.forEach((el) => {
      var func = el.getAttribute("data-hydrate-name");
      var args = decodeURIComponent(el.getAttribute("data-hydrate-args"));
      if (!nameOf[func]) {
        console.error(`function "${func}" is not in hydration namespace`);
        return;
      }
      try {
        var args = JSON.parse(args);
      } catch (err) {
        console.error("while parse hydration args", String(err));
        return;
      }
      let newDom = nameOf[func](...args);
      van_default.hydrate(el, () => newDom);
    });
  }
  addEventListener("DOMContentLoaded", hydrate2);
})();

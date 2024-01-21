# VanJs Hydration Example

> just a different approach

I looked at the [Fullstack Rendering](https://vanjs.org/ssr) example and am excited about the idea of working with VanJs in both the frontend and backend. Quite apart from the fact that this is a demonstration, I wonder whether it makes sense to install components in the backend that are then replaced in the frontend.

This gave me the idea of adding placeholders in the backend that would be replaced with the dynamic components in the frontend.

A placeholder looks something like this

```javascript
...
div({id: "counter-container"},
  h2("Basic Counter"),
  vanComp('Counter', {id: "basic-counter", init: counterInit}),
  h2("Styled Counter"),
  vanComp('StyledCounter', {id: "styled-counter", init: counterInit, buttonStyle: "🔼🔽"}),
),
...
```

And this is vanComp

```javascript
function vanComp(fun, ...args) {
  var sargs = JSON.stringify(args);
  return van.tags.div({
    "data-hydrate-name": fun, 
    "data-hydrate-args": encodeURIComponent(sargs),
  })
}
```

Simple components are used in the client, shared components are not necessary. Hydration is also done with a general function.

```javascript
import van from "vanjs-core"
import Hello from "./components/hello"
import Counter from "./components/counter"
import StyledCounter from "./components/styled-counter"

// required to get the namespace from bundle
const nameOf = { Counter, Hello, StyledCounter };

function hydrate() {
  var list = document.querySelectorAll("[data-hydrate-name]");
  list.forEach( el => {
    var func = el.getAttribute('data-hydrate-name');
    var args = decodeURIComponent(el.getAttribute('data-hydrate-args'));
    if(!nameOf[func]) {
      console.error(`function "${func}" is not in hydration namespace`); 
      return
    }
    try { 
      var args = JSON.parse(args); 
    } catch(err) {
      console.error('while parse hydration args', String(err))
      return
    }
    let newDom = nameOf[func](...args);
    van.hydrate(el, ()=>newDom)
  })
}

addEventListener("DOMContentLoaded", hydrate);
```

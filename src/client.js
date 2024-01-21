import van from "vanjs-core"
import Hello from "./components/hello"
import Counter from "./components/counter"
import StyledCounter from "./components/styled-counter"

const {button,p} = van.tags;

// required to get the namespace from bundle
const nameOf = { Counter, Hello, StyledCounter };

// console.log('nameOf', nameOf);

function hydrate() {
  var list = document.querySelectorAll("[data-hydrate-name]");
  list.forEach( el => {
    var func = el.getAttribute('data-hydrate-name');
    var args = decodeURIComponent(el.getAttribute('data-hydrate-args'));
    // console.log(`func: "${func}",  args: "${args}"`);
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

// van.add(document.getElementById("counter-container"), p(button({onclick: hydrate}, "Hydrate")))

addEventListener("DOMContentLoaded", hydrate);

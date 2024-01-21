import van from 'vanjs-core';

export default ({id, init = 0, buttonStyle = "👍👎"}) => {
  const {button, div} = van.tags
  const counter = van.state(init)
  const upChar = () => [...van.val(buttonStyle)][0];
  const downChar = () => [...van.val(buttonStyle)][1];
  return div({...(id ? {id} : {}), "data-counter": counter},
    "❤️ ", counter, " ",
    button({onclick: () => ++counter.val}, upChar),
    button({onclick: () => --counter.val}, downChar),
  )
}

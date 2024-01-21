import { createServer } from "node:http"
import { parse } from "node:url"
import serveStatic from "serve-static"
import finalhandler from "finalhandler"
import van from "mini-van-plate/van-plate"


function vanComp(fun, ...args) {
  var sargs = JSON.stringify(args);
  return van.tags.div({
    "data-hydrate-name": fun, 
    "data-hydrate-args": encodeURIComponent(sargs),
  })
}

const {body, div, h1, h2, head, link, meta, script, title} = van.tags

const [env, port = 8080] = process.argv.slice(2);


const serveFile = serveStatic(".")

createServer((req, res) => {
  if (req.url?.endsWith(".js")) return serveFile(req, res, finalhandler(req, res))
  const counterInit = Number(parse(req.url, true).query["counter-init"] ?? 0)
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.end(van.html(
    head(
      link({rel: "icon", href: "logo.svg"}),
      title("SSR and Hydration Example"),
      meta({name: "viewport", content: "width=device-width, initial-scale=1"}),
    ),
    body(
      script({type: "text/javascript", src: `dist/client.bundle${env === "dev" ? "" : ".min"}.js`, defer: true}),
      h1("Hello Components"),
      div({id: "hello-container"},
        vanComp('Hello'),
      ),
      h1("Counter Components"),
      div({id: "counter-container"},
        h2("Basic Counter"),
        vanComp('Counter', {id: "basic-counter", init: counterInit}),
        h2("Styled Counter"),
        vanComp('StyledCounter', {id: "styled-counter", init: counterInit, buttonStyle: "🔼🔽"}),
      ),
    )
  ))
}).listen(Number(port), () => console.log(`Try visiting the server via http://localhost:${port}.
Also try http://localhost:${port}?counter-init=5 to set the initial value of the counters.`))

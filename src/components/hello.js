import van from 'vanjs-core';

export default () => {
  const {a, div, li, p, ul} = van.tags
  const fromServer = typeof window === "undefined"
  return div(
    p(() => `👋Hello (from ${fromServer ? "server" : "client"})`),
    ul(
      li("🗺️World"),
      li(a({href: "https://vanjs.org/"}, "🍦VanJS")),
    ),
  )
}

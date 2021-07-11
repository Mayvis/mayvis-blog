import React from "react"
import { Link } from "gatsby"
// import Toggle from "./toggle"

const Layout = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`
  const isRootPath = location.pathname === rootPath
  let header

  if (isRootPath) {
    header = (
      <h1 className="main-heading">
        <Link to="/">{title}</Link>
      </h1>
    )
  } else {
    header = (
      <Link className="header-link-home" to="/">
        {title}
      </Link>
    )
  }

  return (
    <div className="global-wrapper" data-is-root-path={isRootPath}>
      <header className="global-header">
        {header}
        {/* <Toggle /> */}
      </header>
      <main>{children}</main>
      <footer>
        <a href="https://github.com/Mayvis">github</a>
        {` `}•{` `}
        <a href="https://www.cakeresume.com/wen-po-chen">resume</a>
        {` `}• and a cup of coffee ☕ 
      </footer>
    </div>
  )
}

export default Layout

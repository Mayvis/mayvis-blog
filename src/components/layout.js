import React from "react"
import Toggle from "./toggle"
import { Link } from "gatsby"

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
        <Toggle />
      </header>
      <main>{children}</main>
      <footer>
        <a href="https://github.com/Mayvis" rel="noreferrer" target="_blank">
          github
        </a>
        {` `}•{` `}
        <a href="mailto:kevin73911@gmail.com" rel="noreferrer" target="_blank">
          mail
        </a>
        {` `}•{` `}
        <a
          href="https://www.cakeresume.com/wen-po-chen"
          rel="noreferrer"
          target="_blank"
        >
          resume
        </a>
        {` `}• and a cup of coffee ☕
      </footer>
    </div>
  )
}

export default Layout

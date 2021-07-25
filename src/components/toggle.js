import React, { useEffect, useRef } from "react"
import "./toggle.css"
import moon from "../assets/moon.png"
import sun from "../assets/sun.png"

function Toggle() {
  const toggleRef = useRef(null)

  useEffect(() => {
    const body = document.getElementsByTagName("body")[0]
    toggleRef.current.checked = !body.classList.contains("dark-theme")
  }, [])

  const handleChange = () => {
    const body = document.getElementsByTagName("body")[0]

    if (!body.classList.contains("dark-theme")) {
      body.classList.add("dark-theme")
    } else {
      body.classList.remove("dark-theme")
    }
  }

  const handleKeyDown = e => {
    const keyD = e.key !== undefined ? e.key : e.keyCode
    if (
      keyD === "Enter" ||
      keyD === 13 ||
      ["Spacebar", " "].indexOf(keyD) >= 0 ||
      keyD === 32
    ) {
      e.preventDefault()
      e.target.click()
    }
  }

  return (
    <div className="theme-toggle">
      <input
        ref={toggleRef}
        type="checkbox"
        id="toggle-checkbox"
        name="toggle-checkbox"
        aria-labelledby="toggle-checkbox-label"
        aria-label="toggle-checkbox-label"
        onChange={handleChange}
      />
      <label htmlFor="toggle-checkbox" id="toggle-checkbox-label">
        <img src={moon} alt="moon-icon" className="icon" />
        <img src={sun} alt="sun-icon" className="icon" />
        <div
          className="ball"
          role="button"
          aria-pressed="true"
          aria-label="toggle"
          tabIndex="0"
          onKeyDown={handleKeyDown}
        ></div>
      </label>
    </div>
  )
}

export default Toggle

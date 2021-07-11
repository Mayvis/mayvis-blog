/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/use-static-query/
 */

import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"

const Bio = () => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      site {
        siteMetadata {
          author {
            name
            summary
          }
          social {
            gmail
          }
        }
      }
    }
  `)

  // Set these values by editing "siteMetadata" in gatsby-config.js
  const author = data.site.siteMetadata?.author
  // const social = data.site.siteMetadata?.social

  return (
    <div className="bio">
      <StaticImage
        className="bio-avatar"
        layout="fixed"
        formats={["AUTO", "WEBP", "AVIF"]}
        src="../assets/profile-pic.jpeg"
        width={50}
        height={50}
        quality={95}
        alt="Mayvis Chen"
      />
      {author?.name && (
        <div className="bio-intro">
          你好，我是 <a href="https://github.com/Mayvis">{author.name}</a>
          <br />
          {author?.summary || null}
        </div>
      )}
    </div>
  )
}

export default Bio

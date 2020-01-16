import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import { StaticQuery, graphql } from 'gatsby'

import screenshot from '../../assets/images/screenshot.png'

function SEO({ description, lang, meta }) {
  return (
    <StaticQuery
      query={detailsQuery}
      render={data => {
        const metaDescription =
          description || data.site.siteMetadata.description
        return (
          <Helmet
            htmlAttributes={{
              lang,
            }}
            title={data.site.siteMetadata.title}
          >
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
            />
            <meta name="description" content={metaDescription} />
            <meta name="og:description" content={metaDescription} />
            <meta
              name="keywords"
              content={data.site.siteMetadata.keywords.join(', ')}
            />
            <meta property="og:url" content="https://oasa.live" />
            <meta property="og:type" content="website" />
            <meta property="og:title" content={data.site.siteMetadata.title} />
            <meta property="og:image" content={screenshot} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:creator" content="@__vasilis" />
            <meta name="twitter:title" content={data.site.siteMetadata.title} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={screenshot} />
            <link rel="canonical" href="https://oasa.live/" />
          </Helmet>
        )
      }}
    />
  )
}

SEO.defaultProps = {
  lang: `en`,
  meta: [],
  keywords: [],
}

SEO.propTypes = {
  description: PropTypes.string,
  lang: PropTypes.string,
  meta: PropTypes.array,
  keywords: PropTypes.arrayOf(PropTypes.string),
  title: PropTypes.string,
}

export default SEO

const detailsQuery = graphql`
  query DefaultSEOQuery {
    site {
      siteMetadata {
        title
        description
        author
        keywords
      }
    }
  }
`

module.exports = {
  siteMetadata: {
    title: 'Athens live bus map',
    description: `An interactive map of real-time bus information of Athens,
    Greece. Data are taken from OASA API.`,
    keywords: [
      'oasa',
      'map',
      'telematics',
      'δρομολόγια',
      'Athens',
      'Αθήνα',
      'χάρτης',
      'bus',
      'traffic',
      'live',
      'real-time',
      'mapbox',
      'react',
      'τηλεματική',
      'λεωφορεία',
      'ΟΑΣΑ',
    ],
    author: 'https://github.com/chatzipan',
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    {
      resolve: 'gatsby-plugin-react-svg',
      options: {
        rule: {
          include: `${__dirname}/src/assets/svgs`,
        },
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'images',
        path: `${__dirname}/src/assets/images`,
      },
    },
    'gatsby-transformer-sharp',
    'gatsby-plugin-sharp',
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'Oasa.Live',
        short_name: 'Oasa.live',
        start_url: '/',
        background_color: '#FFF',
        theme_color: '#F0008C',
        display: 'standalone',
        icon: 'src/assets/images/favicon.png',
      },
    },
    {
      resolve: 'gatsby-plugin-postcss',
      options: {
        postCssPlugins: [require('postcss-preset-env')({ stage: 0 })],
      },
    },
    {
      resolve: 'gatsby-plugin-sentry',
      options: {
        dsn: 'https://2c40bea4fa1b409c939a059cb6722bb7@sentry.io/1420468',
        // Optional settings, see https://docs.sentry.io/clients/node/config/#optional-settings
        enabled: (() =>
          ['production', 'stage'].indexOf(process.env.NODE_ENV) !== -1)(),
      },
    },
    {
      resolve: 'gatsby-plugin-google-gtag',
      options: {
        trackingIds: ['UA-136581091-1'],
      },
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.app/offline
    {
      resolve: `gatsby-plugin-offline`,
      options: {
        runtimeCaching: [
          {
            urlPattern: /^https?:.*amazon.*\.json$/,
            handler: `networkOnly`,
          },
        ],
      },
    },
  ],
}

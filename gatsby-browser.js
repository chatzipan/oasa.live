/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 */

import wrapWithProvider from './src/redux/wrap-with-provider'
export const wrapRootElement = wrapWithProvider

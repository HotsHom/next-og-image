import { ServerResponse } from 'http'
import ApiRequest from '../types/api-request'
import getBaseUrl from './get-base-url'
import getCleanPath from './get-clean-path'
import getImage from './get-image'
import chrome from "chrome-aws-lambda";

const YEAR_SECONDS = 31536000

export default function createHandler(): (
  req: ApiRequest,
  res: ServerResponse,
) => Promise<void> {
  return async function handler(req, res) {
    try {
      const { path: rawPath, ...props } = req.query
      const { path, extension } = getCleanPath(rawPath)
      const baseUrl = getBaseUrl()

      if (extension !== '.png') {
        res.statusCode = 404
        res.setHeader('Content-Type', 'text/html')
        res.end('<h1>Not Found</h1>')
        return
      }

      if (!baseUrl) {
        throw new Error(
          'No `OG_IMAGE_BASE_URL` or `VERCEL_URL` environment variable found.',
        )
      }

      const image = await getImage(baseUrl, path, props)
      res.statusCode = 200
      res.setHeader('Content-Type', 'image/png')

      res.setHeader(
        'Cache-Control',
        `public, immutable, no-transform, s-maxage=${YEAR_SECONDS}, max-age=${YEAR_SECONDS}`,
      )

      res.end(image)
    } catch (error) {
      let c = await chrome.executablePath
      res.setHeader('Content-Type', 'text/html')
      res.end('<h1>Internal Error</h1><p>Sorry, there was a problem.</p>' + error + `<p>${c}</p>`)
      console.error(error)
    }
  }
}

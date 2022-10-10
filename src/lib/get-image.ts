import chrome from 'chrome-aws-lambda'
import puppeteer from 'puppeteer-core'
import Props from '../types/props'
import propsToSearchParams from './props-to-search-params'

const width = 1200

export default async function getImage(
  baseUrl: string,
  path: string[],
  props: Props,
): Promise<Buffer | String | void> {
  const browser = await puppeteer.launch({
    args: chrome.args,
    executablePath: await chrome.executablePath,
    ignoreDefaultArgs: ['--disable-extensions']
  })

  const page = await browser.newPage()
  page.setViewport({ width, height: width / 2 })
  await page.goto(
    `${[baseUrl, ...path].join('/')}?${propsToSearchParams(props)}`,
  )
  const screenshot = await page.screenshot()
  await browser.close()
  return screenshot
}

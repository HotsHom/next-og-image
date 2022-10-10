var path = require('path');
var chrome = require('chrome-aws-lambda');
var puppeteer = require('puppeteer-core');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var chrome__default = /*#__PURE__*/_interopDefaultLegacy(chrome);
var puppeteer__default = /*#__PURE__*/_interopDefaultLegacy(puppeteer);

function getBaseUrl() {
  if (process.env.OG_IMAGE_BASE_URL) {
    return process.env.OG_IMAGE_BASE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
}

function getCleanPath(path$1) {
  const cleanPath = [...path$1];
  const finalElement = path$1[path$1.length - 1];
  const extension = path.extname(finalElement);
  cleanPath.splice(-1, 1, path.basename(finalElement, extension));
  return {
    path: cleanPath,
    extension
  };
}

function propsToSearchParams(props) {
  const searchParams = new URLSearchParams();
  Object.entries(props).forEach(([propName, values]) => {
    [].concat(values).forEach(value => {
      searchParams.append(propName, value);
    });
  });
  return searchParams;
}

const width = 1200;
async function getImage(baseUrl, path, props) {
  const browser = await puppeteer__default['default'].launch({
    args: chrome__default['default'].args,
    executablePath: process.env.OG_IMAGE_CHROME_EXECUTABLE_PATH ?? (await chrome__default['default'].executablePath),
    ignoreDefaultArgs: ['--disable-extensions']
  });
  const page = await browser.newPage();
  page.setViewport({
    width,
    height: width / 2
  });
  await page.goto(`${[baseUrl, ...path].join('/')}?${propsToSearchParams(props)}`);
  const screenshot = await page.screenshot();
  await browser.close();
  return screenshot;
}

const YEAR_SECONDS = 31536000;
function createHandler() {
  return async function handler(req, res) {
    try {
      const {
        path: rawPath,
        ...props
      } = req.query;
      const {
        path,
        extension
      } = getCleanPath(rawPath);
      const baseUrl = getBaseUrl();

      if (extension !== '.png') {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/html');
        res.end('<h1>Not Found</h1>');
        return;
      }

      if (!baseUrl) {
        throw new Error('No `OG_IMAGE_BASE_URL` or `VERCEL_URL` environment variable found.');
      }

      const image = await getImage(baseUrl, path, props);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', `public, immutable, no-transform, s-maxage=${YEAR_SECONDS}, max-age=${YEAR_SECONDS}`);
      res.end(image);
    } catch (error) {
      let c = await chrome__default['default'].executablePath;
      res.setHeader('Content-Type', 'text/html');
      res.end('<h1>Internal Error</h1><p>Sorry, there was a problem.</p>' + error + `<p>${c}</p>`);
      console.error(error);
    }
  };
}

exports.createHandler = createHandler;
//# sourceMappingURL=index.js.map

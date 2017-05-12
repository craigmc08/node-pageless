const whiskers = require('whiskers')
const express = require('express')
const fs = require('fs-promise')
const path = require('path')
const app = express()

let PRODUCTION = false

let getMainTemplate = async (req) => ''
let appRoutes = []

let templateRendered = false
let renderedTemplate = undefined
let scripts = ['src/client/loadTemplate.js', 'src/client/intralink.js']

/**
 * Reads scripts from disk and tapes them togehter
 * @return {string} The script elements
 */
async function getScripts() {
  let loadedScripts = ''
  for (let i = 0; i < scripts.length; i++) {
    const script = await fs.readFile(path.join(__dirname, scripts[i]))
    loadedScripts += `<script>${script}</script>`
  }
  return loadedScripts
}

/**
 * Builds the html page
 * @param {object} req - Express request object
 * @return {string} Built page
 */
async function buildPage(req) {
  let content = await getMainTemplate(req)
  // Render page
  let templates = ''
  for (let i = 0; i < appRoutes.length; i++) {
    const templateContent = await appRoutes[i].getter(req)
    const header = `<script type="text/template" role="template" route="${appRoutes[i].url}" name="${appRoutes[i].name}" title-prefix="${appRoutes[i].titlePrefix}">`
    const footer = `</script>`
    const template = header + templateContent + footer
    templates += template
  }
  const loadedScripts = await getScripts()
  content = content.replace('{{head-end}}', loadedScripts)
  content = content.replace('{{body-begin}}', templates)
  content = content.replace('{{body-end}}', '')
  return content
}

/**
 * Processes requests (any requests called by exports.use will take priority over this)
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
async function requestHandler(req, res) {
  let content
  if (PRODUCTION) {
    if (renderedTemplate === undefined) {
      renderedTemplate = await buildPage(req)
    }
    content = renderedTemplate
  } else {
    content = await buildPage(req)
  }
  res.send(content)
}

/**
 * Start the server on a port
 * @param {number} port - Port to listen on
 * @param {function} callback - Called when server starts
 * @return {object} This module (for chaining)
 */
exports.start = (port, callback) => {
  app.use('/', requestHandler)
  app.listen(port, callback)
  return exports
}
/**
 * Set the template to be rendered on any page (see example/templates/main.html for what this requires)
 * @param {string|function} contentOrAsyncFunction - Content of main template. May be string or async function (returns promise)
 * @return {object} This module (for chaining)
 */
exports.setMainTemplate = (contentOrAsyncFunction) => {
  if (typeof contentOrAsyncFunction === 'string') {
    getMainTemplate = async (req) => contentOrAsyncFunction
  } else if (typeof contentOrAsyncFunction === 'function') {
    getMainTemplate = contentOrAsyncFunction
  }
}
/**
 * Adds the route to the templater
 * @param {AppRoute} route - The route to add
 * @return {object} This module (for chaining)
 */
exports.addRoute = (route) => {
  if (!route.url || typeof route.url !== 'string') {
    throw new TypeError('Route must have string as url')
  }
  if (!route.getter || (typeof route.getter !== 'string' && typeof route.getter !== 'function')) {
    throw new TypeError('Route getter must be string or function')
  }
  for (let i = 0; i < appRoutes.length; i++) {
    if (route.url === appRoutes[i].url) throw new TypeError(`Route url must be unique (collision with url ${route.url})`)
  }
  if (typeof route.getter === 'string') {
    const tmp = route.getter
    route.getter = async (req) => tmp
  }
  appRoutes.push(route)
  return exports
}
/**
 * Adds the array of routes to the templater. Convenience method for adding lots of routes
 * @param {AppRoute[]} routes - The routes to add
 * @return {object} This module (for chaining)
 */
exports.addRoutes = (routes) => {
  for (let i = 0; i < routes.length; i++) {
    exports.addRoute(routes[i])
  }
  return exports
}
/**
 * Adds the route to the server (priority over / root)
 * @param {string} path - Path or handler
 * @param {function} handler - Not required if there is no path
 */
exports.use = (path, handler) => {
  app.use(path, handler)
}
/**
 * Sets the app to be in production mode (prerenders)
 */
exports.production = () => {
  PRODUCTION = true
}
/**
 * @typedef AppRoute
 * @type {object}
 * @property {string} url - The path of the route
 * @property {string} name - The name of the route
 * @property {string} titlePrefix - The prefix to add on the title on the page
 * @property {string|function} getter - The content of the url. May be string or async function (returns promise)
 */

const titleSuffix = 'Example'
const titleGlue = ' - '

function loadTemplate(templateName) {
  const templateEl = getTemplateEl(templateName)
  if (!templateEl) throw new Error('Tried to load a template that doesn\'t exist')

  // Update history
  history.pushState({}, '', templateEl.getAttribute('route'))
  loadCurrentPage(templateEl.getAttribute('name'))
}

function getTemplateEl(templateName) {
  const templateEl = document.querySelector(`[role=template][name=${templateName}]`)
  return templateEl || false
}
function getTemplateObject(templateName, _template) {
  let template
  if (!templateName && _template) {
    template = _template
  } else {
    template = getTemplateEl(templateName)
  }
  const route = template.getAttribute('route')
  const name = template.getAttribute('name')
  const titlePrefix = template.getAttribute('title-prefix')
  const content = template.innerHTML
  return {
    route: route,
    name: name,
    titlePrefix: titlePrefix,
    content: content,
  }
}
function getAllTemplateEls() {
  return document.querySelectorAll('[role=template]')
}
function getTemplateObjects() {
  const objs = []
  const templates = getAllTemplateEls()
  for (let i = 0; i < templates.length; i++) {
    objs.push(getTemplateObject(null, templates[i]))
  }
  return objs
}

// Load the correct template for this page
function loadCurrentPage(name) {
  const page = location.pathname
  const templates = getTemplateObjects()
  let found = -1
  for (let i = 0; i < templates.length; i++) {
    // This is weird, but get skip over this loop if name given
    if (typeof name !== 'undefined') break

    const template = templates[i]
    if (template.route === page) {
      found = i
      break
    }
  }
  // No template found, check for name
  let template = undefined
  if (found === -1) {
    if (typeof name == 'undefined') return
    template = getTemplateObject(name)
  } else {
    template = templates[found]
  }
  const contentEl = document.querySelector('[role=content]')
  if (!contentEl) throw new Error('Page has no content element (THIS IS A REALLY BIG PROBLEM)')
  // Set page title
  const titleEl = document.querySelector('title')
  titleEl.innerText = template.titlePrefix + titleGlue + titleSuffix
  // Set page content
  contentEl.innerHTML = template.content
}

document.addEventListener('DOMContentLoaded', () => {
  loadCurrentPage()
})

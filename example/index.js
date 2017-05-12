const pageless = require('../index')
const fs = require('fs')
const express = require('express')

// Helper function to create function to load a file
function fileGetter(file) {
  return async () => {
    return new Promise((resolve, reject) => {
      fs.readFile(file, (err, data) => {
        if (err) throw err
        resolve(data.toString())
      })
    })
  }
}

// Set the main template
pageless.setMainTemplate(fileGetter('example/templates/template.html'))
// Add some pages
pageless.addRoutes([
  {
    url: '/about',
    name: 'about',
    titlePrefix: 'About',
    getter: fileGetter('example/templates/about.html'),
  },
  {
    url: '/contact',
    name: 'contact',
    titlePrefix: 'Contact',
    getter: fileGetter('example/templates/contact.html'),
  },
  {
    url: '/hello',
    name: 'hello-world',
    titlePrefix: 'Hello',
    // Example of static page that isn't loaded from a file
    getter: 'Hello World!'
  },
])

// Add a static directory
pageless.use('/', express.static('example/static'))
// Start the server (the order of these last 2 calls are important)
pageless.start(80)

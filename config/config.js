'use babel'
/* global atom */
const fs = require('fs')
const thisDir = __dirname
const grammarsFile = thisDir + '/grammars.json'
let props = {}
// let grammarsDescription = 'Configure the colors for all installed grammars here. For files do not have a recognized grammar, set the "Null Grammar" color.'
if (!fs.existsSync(grammarsFile)) {
  fs.writeFile(grammarsFile, '{}', () => {
    const pattern = 'config$'
    const utilFile = thisDir.replace(new RegExp(pattern), 'lib/grammar-tab-colors-utils')
    let gtcUtils = require(utilFile)
    gtcUtils.setGrammarConfig((grammarsConfig) => {
      props = grammarsConfig
      atom.config.setSchema('grammar-tab-colors.grammars', {type: 'object', properties: grammarsConfig})
      gtcUtils.setLessStyles(() => {
        atom.packages.reloadActivePackageStyleSheets()
      })
    })
  })
} else {
  props = JSON.parse(fs.readFileSync(grammarsFile))
}

module.exports = {
  enable: {
    title: 'Enable tab decorations',
    default: true,
    type: 'boolean',
    order: 0
  },
  activeOpacity: {
    title: 'Active tab decoration opacity',
    description: 'Opacity is automatically lowered a little if using solid-background or gradient-background decoration types.',
    default: 1.0,
    type: 'number',
    minimum: 0.0,
    maximum: 1.0,
    order: 1
  },
  inactiveOpacity: {
    title: 'Inactive tab decoration opacity',
    description: 'Opacity is automatically lowered a little if using solid-background or gradient-background decoration types.',
    default: 0.5,
    type: 'number',
    minimum: 0.0,
    maximum: 1.0,
    order: 2
  },
  decorationType: {
    title: 'Tab decoration type',
    default: 'line',
    type: 'string',
    enum: ['line', 'circle', 'square', 'solid-background', 'gradient-background'],
    order: 3
  },
  decorationLocation: {
    title: 'Tab decoration location',
    default: 'bottom',
    type: 'string',
    enum: ['left', 'top', 'right', 'bottom'],
    order: 4
  },
  decorationSize: {
    title: 'Tab decoration size (Not applicable for solid-background or gradient-background)',
    description: 'The size will determine the diamater of the circle, width of the border or width of the square, and may be specified in any of the following units: em, rem, px, %',
    default: '0.5em',
    type: 'string',
    order: 5
  },
  grammars: {
    type: 'object',
    title: 'Grammars',
    properties: props,
    order: 6
  }
}

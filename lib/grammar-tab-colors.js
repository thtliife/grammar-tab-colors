'use babel'
/* global atom */

import { CompositeDisposable } from 'atom'
const path = require('path')
const fs = require('fs')
const thisDir = path.resolve(__dirname)

const grammarsFile = path.resolve(thisDir, '..', 'config', 'grammars.json')
const utilFile = path.resolve(thisDir, '..', 'lib', 'grammar-tab-colors-utils.js')
let configSchema = require(path.resolve(thisDir, '..', 'config', 'config.js'))

export default {
  subscriptions: null,
  config: configSchema,

  activate (state) {
    // Events subscribed to in atom's system can be easily cleaned
    // up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable()
    this.grammarHandler = new CompositeDisposable()
    this.subscriptions.add(this.grammarHandler)

    // Registar handler for each new text editor
    this.subscriptions.add(atom.workspace.onDidAddTextEditor((editorObject) => {
      let editor = editorObject.textEditor
      setTimeout(() => {
        let gtcUtils = require(utilFile)
        gtcUtils.decorateThisTabDiv(atom.config.get('grammar-tab-colors.enable'), editor)
        this.grammarHandler.add(gtcUtils.handleGrammarChange(editor))
      }, 10)
    }))

    // Register handler for late loaded grammars...
    this.subscriptions.add(atom.grammars.onDidAddGrammar((grammar) => {
      fs.exists(grammarsFile, (exists) => {
        let existingGrammars = exists ? require(grammarsFile) : {}
        let existingGrammarsArray = Object.keys(existingGrammars)

        if (existingGrammarsArray.indexOf(grammar.name) === -1) {
          let gtcUtils = require(utilFile)
          gtcUtils.setGrammarConfig((grammarsConfig) => {
            atom.config.setSchema('grammar-tab-colors.grammars', {type: 'object', properties: grammarsConfig})
            gtcUtils.setLessStyles(() => {
              atom.packages.reloadActivePackageStyleSheets()
            })
          })
        }
      })
    }))

    // Make sure the 'tabs' package is activated, and add a handler for
    // grammar change to each editor
    const editors = atom.workspace.getTextEditors()
    let editorCount = editors.length
    if (atom.packages.isPackageActive('tabs')) {
      let gtcUtils = require(utilFile)
      gtcUtils.decorateTabDivs(atom.config.get('grammar-tab-colors.enable'))
      for (let j = 0; j < editorCount; j++) {
        let editor = editors[j]
        this.grammarHandler.add(gtcUtils.handleGrammarChange(editor))
      }
    } else {
      this.onceActivated = atom.packages.onDidActivatePackage((activatedPackage) => {
        if (activatedPackage.name === 'tabs') {
          let gtcUtils = require(utilFile)
          gtcUtils.decorateTabDivs(atom.config.get('grammar-tab-colors.enable'))
          for (let j = 0; j < editorCount; j++) {
            let editor = editors[j]
            this.grammarHandler.add(gtcUtils.handleGrammarChange(editor))
          }
          return this.onceActivated.dispose()
        }
      })
    }
    // Watch the enable setting for this package, and either decorate or
    // undecorate the tabs accordingly
    atom.packages.onDidActivateInitialPackages(() => {
      atom.config.onDidChange('grammar-tab-colors.enable', () => {
        let enableValue = atom.config.get('grammar-tab-colors.enable')
        let gtcUtils = require(utilFile)
        gtcUtils.decorateTabDivs(enableValue)
      })
      atom.config.onDidChange('grammar-tab-colors.decorationType', () => {
        let enableValue = atom.config.get('grammar-tab-colors.enable')
        let gtcUtils = require(utilFile)
        gtcUtils.decorateTabDivs(enableValue)
      })
      atom.config.onDidChange('grammar-tab-colors.decorationLocation', () => {
        let enableValue = atom.config.get('grammar-tab-colors.enable')
        let gtcUtils = require(utilFile)
        gtcUtils.decorateTabDivs(enableValue)
      })
      atom.config.onDidChange('grammar-tab-colors.grammars', () => {
        let gtcUtils = require(utilFile)
        gtcUtils.setLessStyles(() => {
          atom.packages.reloadActivePackageStyleSheets()
        })
      })
      atom.config.onDidChange('grammar-tab-colors.decorationSize', () => {
        let gtcUtils = require(utilFile)
        gtcUtils.setLessStyles(() => {
          atom.packages.reloadActivePackageStyleSheets()
        })
      })
      atom.config.onDidChange('grammar-tab-colors.activeOpacity', () => {
        let gtcUtils = require(utilFile)
        gtcUtils.setLessStyles(() => {
          atom.packages.reloadActivePackageStyleSheets()
        })
      })
      atom.config.onDidChange('grammar-tab-colors.inactiveOpacity', () => {
        let gtcUtils = require(utilFile)
        gtcUtils.setLessStyles(() => {
          atom.packages.reloadActivePackageStyleSheets()
        })
      })
    })
  },

  deactivate () {
    this.subscriptions = null
    this.grammarHandler = null
  },

  serialize () {
    return
  }
}

'use babel'
/* global atom */

import { CompositeDisposable } from 'atom'

let configSchema = require('../config/config')
// require('../config/config-schema-wip')
// let configSchema = require('../config/config-schema')

export default {
  grammarTabColorsView: null,
  modalPanel: null,
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
        let gtcUtils = require('./grammar-tab-colors-utils')
        gtcUtils.decorateThisTabDiv(atom.config.get('grammar-tab-colors.enable'), editor)
        this.grammarHandler.add(gtcUtils.handleGrammarChange(editor))
      }, 10)
    }))

    // Make sure the 'tabs' package is activated, and add a handler for
    // grammar change to each editor
    const editors = atom.workspace.getTextEditors()
    let editorCount = editors.length
    if (atom.packages.isPackageActive('tabs')) {
      let gtcUtils = require('./grammar-tab-colors-utils')
      gtcUtils.decorateTabDivs(atom.config.get('grammar-tab-colors.enable'))
      for (let j = 0; j < editorCount; j++) {
        let editor = editors[j]
        this.grammarHandler.add(gtcUtils.handleGrammarChange(editor))
      }
    } else {
      this.onceActivated = atom.packages.onDidActivatePackage((activatedPackage) => {
        if (activatedPackage.name === 'tabs') {
          let gtcUtils = require('./grammar-tab-colors-utils')
          gtcUtils.decorateTabDivs(atom.config.get('grammar-tab-colors.enable'))
          for (let j = 0; j < editorCount; j++) {
            let editor = editors[j]
            this.grammarHandler.add(gtcUtils.handleGrammarChange(editor))
          }
          return this.onceActivated.dispose()
        }
      })
    }
    // Watch the enable setting for this package, and either decorat or
    // undecorate the tabs accordingly
    atom.packages.onDidActivateInitialPackages(() => {
      atom.config.onDidChange('grammar-tab-colors.enable', () => {
        let enableValue = atom.config.get('grammar-tab-colors.enable')
        let gtcUtils = require('./grammar-tab-colors-utils')
        gtcUtils.decorateTabDivs(enableValue)
      })
      atom.config.onDidChange('grammar-tab-colors.decorationType', () => {
        let enableValue = atom.config.get('grammar-tab-colors.enable')
        let gtcUtils = require('./grammar-tab-colors-utils')
        gtcUtils.decorateTabDivs(enableValue)
      })
      atom.config.onDidChange('grammar-tab-colors.decorationLocation', () => {
        let enableValue = atom.config.get('grammar-tab-colors.enable')
        let gtcUtils = require('./grammar-tab-colors-utils')
        gtcUtils.decorateTabDivs(enableValue)
      })
      atom.config.onDidChange('grammar-tab-colors.grammars', () => {
        let gtcUtils = require('./grammar-tab-colors-utils')
        gtcUtils.setLessStyles(() => {
          atom.packages.reloadActivePackageStyleSheets()
        })
      })
      atom.config.onDidChange('grammar-tab-colors.decorationSize', () => {
        let gtcUtils = require('./grammar-tab-colors-utils')
        gtcUtils.setLessStyles(() => {
          atom.packages.reloadActivePackageStyleSheets()
        })
      })
      atom.config.onDidChange('grammar-tab-colors.activeOpacity', () => {
        let gtcUtils = require('./grammar-tab-colors-utils')
        gtcUtils.setLessStyles(() => {
          atom.packages.reloadActivePackageStyleSheets()
        })
      })
      atom.config.onDidChange('grammar-tab-colors.inactiveOpacity', () => {
        let gtcUtils = require('./grammar-tab-colors-utils')
        gtcUtils.setLessStyles(() => {
          atom.packages.reloadActivePackageStyleSheets()
        })
      })
    })
  },

  deactivate () {
    this.subscriptions.dispose()
  },

  serialize () {
    return
  }
}

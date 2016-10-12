'use babel'

import { CompositeDisposable } from 'atom'
import path from 'path'
const grammarsFile = path.resolve( __dirname, '..', 'config', 'grammars.json' )
const utilFile = path.resolve( __dirname, '..', 'lib', 'grammar-tab-colors-utils.js' )
const configSchema = require(path.resolve( __dirname, '..', 'config', 'config.js' ))

const gtcUtils = require( utilFile )

export default {

  subscriptions : null,
  config : configSchema,

  activate( ) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable( )

    var i = atom.workspace.grammarRegistry.getGrammars( ).length - 1
    do {
      var thisGrammar = atom.workspace.grammarRegistry.getGrammars( )[ i ]
      gtcUtils.buildGrammarConfig(thisGrammar, ( grammarConfig ) => {
        atom.config.setSchema('grammar-tab-colors.grammars', {
          type: 'object',
          properties: grammarConfig
        })
      })
    } while ( i-- )

    // Register any grammars which don't exist at initial load
    this.subscriptions.add(atom.grammars.onDidAddGrammar(( grammar ) => {
      let existingGrammars = require( grammarsFile )
      let existingGrammarsArray = Object.keys( existingGrammars )
      if ( existingGrammarsArray.indexOf( grammar.name ) === -1 ) {
        gtcUtils.buildGrammarConfig(grammar, ( grammarConfig ) => {
          atom.config.setSchema('grammar-tab-colors.grammars', {
            type: 'object',
            properties: grammarConfig
          })
        })
      }
    }))

    // Observe all current and future text editors for Events
    this.subscriptions.add(atom.workspace.observeTextEditors(( editor ) => {
      if (atom.packages.isPackageActive( 'tabs' )) {
        gtcUtils.handleEvents(editor)
      } else {
        this.onceActivated = atom.packages.onDidActivatePackage(( activatedPackage ) => {
          if ( activatedPackage.name === 'tabs' ) {
            gtcUtils.handleEvents(editor)
            return this.onceActivated.dispose( )
          }
        })
      }
    }))

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'grammar-tab-colors:test': ( ) => {
        console.info( 'Testing!' )
      }
    }))
    
    // Watch the enable setting for this package, and either decorate or
    // undecorate the tabs accordingly
    atom.packages.onDidActivateInitialPackages(() => {
      gtcUtils.setLessStyles(() => {
        atom.packages.reloadActivePackageStyleSheets()
      })
      atom.config.onDidChange('grammar-tab-colors.enable', () => {
        gtcUtils.decorateTabDivs(atom.config.get('grammar-tab-colors.enable'))
      })
      atom.config.onDidChange('grammar-tab-colors.decorationType', () => {
        gtcUtils.decorateTabDivs(atom.config.get('grammar-tab-colors.enable'))
      })
      atom.config.onDidChange('grammar-tab-colors.decorationLocation', () => {
        gtcUtils.decorateTabDivs(atom.config.get('grammar-tab-colors.enable'))
      })
      atom.config.onDidChange('grammar-tab-colors.grammars', () => {
        gtcUtils.setLessStyles(() => {
          atom.packages.reloadActivePackageStyleSheets()
        })
      })
      atom.config.onDidChange('grammar-tab-colors.decorationSize', () => {
        gtcUtils.setLessStyles(() => {
          atom.packages.reloadActivePackageStyleSheets()
        })
      })
      atom.config.onDidChange('grammar-tab-colors.activeOpacity', () => {
        gtcUtils.setLessStyles(() => {
          atom.packages.reloadActivePackageStyleSheets()
        })
      })
      atom.config.onDidChange('grammar-tab-colors.inactiveOpacity', () => {
        gtcUtils.setLessStyles(() => {
          atom.packages.reloadActivePackageStyleSheets()
        })
      })
    })
  },

  deactivate( ) {
    this.subscriptions.dispose( )
  },

  serialize( ) {}
}

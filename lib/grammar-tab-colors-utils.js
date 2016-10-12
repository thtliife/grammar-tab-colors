'use babel'
import fs from 'fs'
import path from 'path'

const gtcUtils = {
  grammarsFile: path.resolve( __dirname, '..', 'config', 'grammars.json' ),
  lessFile: path.resolve( __dirname, '..', 'styles', 'grammar-tab-colors.less' ),
  buildGrammarConfig: ( grammar, callback ) => {
    if ( grammar.name ) {
      const fs = require( 'fs' )
      let grammarConfig = require( gtcUtils.grammarsFile )

      const grammarObject = {
        type: 'color',
        title: grammar.name,
        default: 'rgba(0,0,0,0)'
      }
      grammarConfig[grammar.name] = grammarObject
      fs.writeFile(gtcUtils.grammarsFile, JSON.stringify( grammarConfig ), ( ) => {
        if ( typeof callback === 'function' ) {
          callback( grammarConfig )
        }
      })
    }
  },
  handleEvents: ( editor, callback ) => {
    editor.observeGrammar(( ) => {
      gtcUtils.decorateThisTabDiv(atom.config.get('grammar-tab-colors.enable'), editor)
      if ( typeof callback === 'function' ) {
        callback( editor )
      }
    })
  },
  decorateTabDivs: ( packageIsEnabled ) => {
    const editors = atom.workspace.getTextEditors( )
    let editorCount = editors.length
    for ( let i = 0; i < editorCount; i++ ) {
      let editor = editors[i]
      gtcUtils.decorateThisTabDiv( packageIsEnabled, editor )
    }
  },
  decorateThisTabDiv: ( packageIsEnabled, editor ) => {
    const tabDivSelector = 'ul.tab-bar>li.tab[data-type=\'TextEditor\']>div.title'
    const tabDivs = atom.views.getView( atom.workspace ).querySelectorAll( tabDivSelector )
    let decorationType = atom.config.get( 'grammar-tab-colors.decorationType' )
    let decorationLocation = atom.config.get( 'grammar-tab-colors.decorationLocation' )
    let tabDiv = tabDivs[atom.workspace.getTextEditors( ).indexOf( editor )]
    let grammar = editor.getGrammar( )
    if ( grammar ) {
      if ( packageIsEnabled ) {
        tabDiv.parentElement.setAttribute( 'data-grammar', grammar.name )
      } else {
        tabDiv.parentElement.removeAttribute( 'data-grammar' )
      }
      let decorationDiv = tabDiv.parentElement.querySelector( '.grammar-tab-colors-decoration' )
      if ( decorationDiv == null ) {
        if ( packageIsEnabled ) {
          decorationDiv = document.createElement( 'div' )
          decorationDiv.className = 'grammar-tab-colors-decoration'
          decorationDiv.classList.add(decorationType, decorationLocation, 'index' + atom.workspace.getTextEditors( ).indexOf( editor ).toString( ))
          tabDiv.parentElement.appendChild( decorationDiv )
        }
      } else {
        if ( !packageIsEnabled ) {
          tabDiv.parentElement.removeChild( decorationDiv )
        } else {
          decorationDiv.className = 'grammar-tab-colors-decoration'
          decorationDiv.classList.add( decorationType, decorationLocation )
        }
      }
    }
  },
  setLessStyles: ( callback ) => {
    let grammarConfig = atom.config.get( 'grammar-tab-colors.grammars' )
    let styleContents = [ ]

    for ( let grammar in grammarConfig ) {
      let activeColor = 'rgba(' + grammarConfig[grammar].red + ', ' + grammarConfig[grammar].green + ', ' + grammarConfig[grammar].blue + ', ' + atom.config.get( 'grammar-tab-colors.activeOpacity' ) + ')'
      let inactiveColor = 'rgba(' + grammarConfig[grammar].red + ', ' + grammarConfig[grammar].green + ', ' + grammarConfig[grammar].blue + ', ' + atom.config.get( 'grammar-tab-colors.inactiveOpacity' ) + ')'
      let listItem = '\t\'' + grammar + '\' ' + activeColor + ' ' + inactiveColor
      styleContents.push( listItem )
    }
    let lessContent = '@filetype-list:\n' + styleContents.join( ',\n' )
    let decorationSize = atom.config.get( 'grammar-tab-colors.decorationSize' )
    lessContent += `;

    .loop(@index) when (@index > 0){
      @file-type: extract(@filetype-list, @index);
      @grammar: extract(@file-type, 1);
      @active-color: extract(@file-type, 2);
      @inactive-color: extract(@file-type, 3);

      ul.tab-bar {
        .tab::before {
          background: none;
        }
        li.tab[is='tabs-tab'][data-grammar$=@{grammar}] {
          border-image: none;
          .title {
            background: none;
          }
          .grammar-tab-colors-decoration {
            background-color: @inactive-color;
            position: absolute;
            // z-index: 99;
          }
          .grammar-tab-colors-decoration.circle {
            size: ${ decorationSize };
            border-radius: 50%;
            height: ${ decorationSize };
            width: ${ decorationSize };
          }
          .grammar-tab-colors-decoration.square {
            size: ${ decorationSize };
            border-radius: 15%;
            height: ${ decorationSize };
            width: ${ decorationSize };
          }
          .grammar-tab-colors-decoration.circle.right,
          .grammar-tab-colors-decoration.square.right{
            right: 0.5em;
            top: 0.5em;
          }
          .grammar-tab-colors-decoration.circle.left,
          .grammar-tab-colors-decoration.square.left{
            left: 0.5em;
            top: 0.5em;
          }
          .grammar-tab-colors-decoration.circle.top,
          .grammar-tab-colors-decoration.square.top{
            left: calc(50%-0.5em);
            top: 0.5em;
          }
          .grammar-tab-colors-decoration.circle.bottom,
          .grammar-tab-colors-decoration.square.bottom{
            left: calc(50%-0.5em);
            bottom: 0.5em;
          }
          .grammar-tab-colors-decoration.line.top,
          .grammar-tab-colors-decoration.line.bottom {
            height: ${ decorationSize };
            width: 100%;
            left: 0;
          }
          .grammar-tab-colors-decoration.line.top {
            top: 0;
          }
          .grammar-tab-colors-decoration.line.bottom {
            bottom: 0;
          }
          .grammar-tab-colors-decoration.line.left,
          .grammar-tab-colors-decoration.line.right {
            height: 100%;
            width: ${ decorationSize };
            top: 0;
          }
          .grammar-tab-colors-decoration.line.left {
            left: 0;
          }
          .grammar-tab-colors-decoration.line.right {
            right: 0;
          }
          .grammar-tab-colors-decoration.solid-background {
            background: fade(@inactive-color, 30%);
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
          }
          .grammar-tab-colors-decoration.gradient-background {
            background-color: transparent;
            background-image: linear-gradient(180deg, @inactive-color, transparent);
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
          }
        }
        li.tab[is='tabs-tab'][data-grammar$=@{grammar}].active  {
          .grammar-tab-colors-decoration {
            background-color: @active-color;
          }
          .grammar-tab-colors-decoration.solid-background {
            background-color: fade(@active-color, 60%);
          }
          .grammar-tab-colors-decoration.gradient-background {
            background-color: transparent;
            background-image: linear-gradient(180deg, @active-color, transparent);
          }
        }
      }
      .loop(@index - 1);
    }
    .loop(length(@filetype-list));
    `

    fs.writeFile(gtcUtils.lessFile, lessContent, ( ) => {
      // Check that callback exists and is a funciton
      if ( typeof callback === 'function' ) {
        // If so, then call it
        callback( )
      }
    })
  }
}

export default gtcUtils

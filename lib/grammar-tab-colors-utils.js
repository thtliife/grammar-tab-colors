'use babel'
/* global atom */

module.exports.setGrammarConfig = (callback) => {
  // Get all the available grammars, and save them to grammars.json
  let fs = require('fs')
  const thisDir = __dirname
  const pattern = 'lib$'
  const grammarsFile = thisDir.replace(new RegExp(pattern), 'config/grammars.json')
  const grammarObjects = {}

  fs.exists(grammarsFile, (exists) => {
    const grammars = atom.workspace.grammarRegistry.getGrammars()
    let grammarsCount = grammars.length

    for (let i = 0; i < grammarsCount; i++) {
      let thisGrammar = grammars[i]
      let thisGrammarName = thisGrammar.name.toString()
      let thisGrammarObject = {}
      if (exists) {
        var grammarConfig = JSON.parse(fs.readFileSync(grammarsFile))
        if (!grammarConfig[thisGrammarName]) {
          thisGrammarObject = {
            type: 'color',
            title: thisGrammarName.toString(),
            default: 'transparent'
          }
        } else {
          thisGrammarObject = grammarConfig[thisGrammarName]
        }
      } else {
        thisGrammarObject = {
          type: 'color',
          title: thisGrammarName.toString(),
          default: 'transparent'
        }
      }
      grammarObjects[thisGrammarName] = thisGrammarObject
    }

    // if (!exists) {
    fs.writeFile(grammarsFile, JSON.stringify(grammarObjects), () => {
      // Check that callback exists and is a funciton
      if (typeof callback === 'function') {
        // If so, then call it
        callback(JSON.parse(fs.readFileSync(grammarsFile)))
      }
    })
  })
}

module.exports.setLessStyles = (callback) => {
  let grammarConfig = atom.config.get('grammar-tab-colors.grammars')
  let styleContents = []

  for (let grammar in grammarConfig) {
    let activeColor = 'rgba(' +
      grammarConfig[grammar].red + ', ' +
      grammarConfig[grammar].green + ', ' +
      grammarConfig[grammar].blue + ', ' +
      atom.config.get('grammar-tab-colors.activeOpacity') +
      ')'
    let inactiveColor = 'rgba(' +
      grammarConfig[grammar].red + ', ' +
      grammarConfig[grammar].green + ', ' +
      grammarConfig[grammar].blue + ', ' +
      atom.config.get('grammar-tab-colors.inactiveOpacity') +
      ')'
    let listItem = '\t\'' + grammar + '\' ' + activeColor + ' ' + inactiveColor
    styleContents.push(listItem)
  }
  let lessContent = '@filetype-list:\n' + styleContents.join(',\n')
  // let decorationType = atom.config.get('grammar-tab-colors.decorationType')
  // let decorationLocation = atom.config.get('grammar-tab-colors.decorationLocation')
  let decorationSize = atom.config.get('grammar-tab-colors.decorationSize')
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
          size: ${decorationSize};
          border-radius: 50%;
          height: ${decorationSize};
          width: ${decorationSize};
        }
        .grammar-tab-colors-decoration.square {
          size: ${decorationSize};
          border-radius: 15%;
          height: ${decorationSize};
          width: ${decorationSize};
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
          height: ${decorationSize};
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
          width: ${decorationSize};
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

  let fs = require('fs')
  const thisDir = __dirname
  const pattern = 'lib$'
  const lessFile = thisDir.replace(new RegExp(pattern), 'styles/grammar-tab-colors.less')
  const styleFolder = thisDir.replace(new RegExp(pattern), 'styles')
  fs.exists(styleFolder, (exists) => {
    if (!exists) {
      fs.mkdirSync(styleFolder, (err) => {
        if (err) {
          console.log(err)
        }
      })
      fs.writeFile(lessFile, lessContent, () => {
        // Check that callback exists and is a funciton
        if (typeof callback === 'function') {
          // If so, then call it
          callback()
        }
      })
    }
  })
}

module.exports.decorateTabDivs = (packageIsEnabled) => {
  const editors = atom.workspace.getTextEditors()
  let editorCount = editors.length
  const tabDivSelector = "ul.tab-bar>li.tab[data-type='TextEditor']>div.title"
  const tabDivs = atom.views.getView(atom.workspace).querySelectorAll(tabDivSelector)
  let tabDivCount = tabDivs.length
  let decorationType = atom.config.get('grammar-tab-colors.decorationType')
  let decorationLocation = atom.config.get('grammar-tab-colors.decorationLocation')
  for (let i = 0; i < tabDivCount; i++) {
    let tabDiv = tabDivs[i]
    let grammar = void 0
    let path = tabDiv.getAttribute('data-path')
    if (path !== void 0) {
      if (path === null) {
        path = void 0
      }
      for (let j = 0; j < editorCount; j++) {
        let editor = editors[j]
        let editorPath = editor.getPath()
        if (editorPath === path) {
          grammar = editor.getGrammar()
          if (grammar) {
            if (packageIsEnabled) {
              tabDiv.parentElement.setAttribute('data-grammar', grammar.name)
            } else {
              tabDiv.parentElement.removeAttribute('data-grammar')
            }
            let decorationDiv = tabDiv.parentElement.querySelector('.grammar-tab-colors-decoration')
            if (decorationDiv == null) {
              if (packageIsEnabled) {
                decorationDiv = document.createElement('div')
                decorationDiv.className = 'grammar-tab-colors-decoration'
                decorationDiv.classList.add(decorationType, decorationLocation)
                tabDiv.parentElement.appendChild(decorationDiv)
              }
            } else {
              if (!packageIsEnabled) {
                tabDiv.parentElement.removeChild(decorationDiv)
              } else {
                decorationDiv.className = 'grammar-tab-colors-decoration'
                decorationDiv.classList.add(decorationType, decorationLocation)
              }
            }
          }
        }
      }
    }
  }
}

module.exports.decorateThisTabDiv = (packageIsEnabled, editor) => {
  const tabDivSelector = "ul.tab-bar>li.tab[data-type='TextEditor']>div.title"
  const tabDivs = atom.views.getView(atom.workspace).querySelectorAll(tabDivSelector)
  let tabDivCount = tabDivs.length
  let decorationType = atom.config.get('grammar-tab-colors.decorationType')
  let decorationLocation = atom.config.get('grammar-tab-colors.decorationLocation')
  for (let i = 0; i < tabDivCount; i++) {
    let tabDiv = tabDivs[i]
    let grammar = void 0
    let path = tabDiv.getAttribute('data-path')
    if (path !== void 0) {
      if (path === null) {
        path = void 0
      }
      let editorPath = editor.getPath()
      if (editorPath === path) {
        grammar = editor.getGrammar()
        if (grammar) {
          if (packageIsEnabled) {
            tabDiv.parentElement.setAttribute('data-grammar', grammar.name)
          } else {
            tabDiv.parentElement.removeAttribute('data-grammar')
          }
          let decorationDiv = tabDiv.parentElement.querySelector('.grammar-tab-colors-decoration')
          if (decorationDiv == null) {
            if (packageIsEnabled) {
              decorationDiv = document.createElement('div')
              decorationDiv.className = 'grammar-tab-colors-decoration'
              decorationDiv.classList.add(decorationType, decorationLocation)
              tabDiv.parentElement.appendChild(decorationDiv)
            }
          } else {
            if (!packageIsEnabled) {
              tabDiv.parentElement.removeChild(decorationDiv)
            } else {
              decorationDiv.className = 'grammar-tab-colors-decoration'
              decorationDiv.classList.add(decorationType, decorationLocation)
            }
          }
        }
      }
    }
  }
}

module.exports.handleGrammarChange = (editor) => {
  editor.onDidChangeGrammar(() => {
    this.decorateThisTabDiv(atom.config.get('grammar-tab-colors.enable'), editor)
  })
}
// module.exports.setGrammarConfig = setGrammarConfig()

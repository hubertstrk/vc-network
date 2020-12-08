const fs = require('fs-extra')
const path = require('path')
const compiler = require('vue-template-compiler')
let acorn = require('acorn')
const {flatten} = require('lodash')

const rootPath = 'C:\\Sources\\novelc19'

/**
 * Returns all file with extension .vue
 * @param {*} dirPath
 * @param {*} arrayOfFiles
 */
const getVueFiles = (dirPath, arrayOfFiles) => {
  const files = fs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

  files.forEach(function(file) {
    if (file === 'node_modules' || file === '.git') return

    if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
      arrayOfFiles = getVueFiles(path.join(dirPath, file), arrayOfFiles)
    } else {
      if (path.extname(file) === '.vue') {
        arrayOfFiles.push(path.join(dirPath, file))
      }
    }
  })

  return arrayOfFiles
}

/**
 * Asynchronously reads a file
 * @param {*} path
 */
const readFile = (path) => fs.readFileSync(path, 'utf8')

const components = getVueFiles(rootPath).reduce((acc, path) => {
  const sfc = readFile(path)
  const compiled = compiler.parseComponent(sfc)
  if (compiled.script) {
    acc.push({path, content: compiled.script.content})
  }
  return acc
}, [])


const sfcImports = components.reduce((acc, curr) => {
  const parsed = acorn.parse(curr.content.toString(), {ecmaVersion: 2020, sourceType: 'module'})
  const is = parsed.body
    .filter(x => x.type === 'ImportDeclaration')
    .reduce((acc, curr) => {
      if (curr.specifiers && curr.specifiers.length > 0) {
        acc.push(curr.specifiers[0].local.name)
      }
      return acc
    },[])

  if (is.length > 0) {
    //acc[curr.path] = parsedImports
    const source = path.parse(curr.path).name
    acc.push({source, is})
  }
  return acc
}, [])

let links = sfcImports.map(sfcImport => {
  return sfcImport.is.map(x => ({source: sfcImport.source, target: x}))
})
links = flatten(links)

let nodes = sfcImports.map(sfcImport => {
  return [sfcImport.source, ...sfcImport.is]
})
nodes = flatten(nodes)
nodes = new Set(nodes)

const network = {
  nodes: [...nodes].map(node => ({id: node, name: node})),
  links: links
}

// { "nodes": [
//   { "id": 1, "name": "A" },
//   { "id": 2, "name": "B" }
// ],
// "links": [
//   { "source": 1, "target": 2 }
// ]}

console.info(JSON.stringify(network))

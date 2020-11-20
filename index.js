const fs = require('fs-extra')
const path = require('path')
const compiler = require('vue-template-compiler')

const rootPath = 'C:\\Sources\\notes2.bootstrap\\'

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

const components = getVueFiles(rootPath).map((path) => {
  const sfc = readFile(path)
  const compiled = compiler.parseComponent(sfc)
  return {path, content: compiled.script.content}
})


const imports = components.reduce((acc, curr) => {
  const matches = curr.content.toString().match(/import.*/g)
  if (matches && matches.length > 0) {
    acc[curr.path] = matches
  }
  return acc
}, [])
console.info(imports)

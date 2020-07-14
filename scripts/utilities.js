const YAML = require('yamljs')
const fs = require('fs-extra')
const path = require('path')
module.exports = {
  copyPublicFolder: function(paths) {
    fs.copySync(paths.appPublic, paths.appBuildDefault)
  },

  generateManifest: function(paths) {
    const manifest = YAML.load(paths.appManifest)
    
    fs.writeFileSync(
      path.join(paths.appBuildDefault, 'manifest.json'),
      JSON.stringify(manifest, null, 4)  
    )
  }
}
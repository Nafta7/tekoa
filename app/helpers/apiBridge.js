const AppMode = require('../../appconfig').mode
import AppConstants from '../constants/AppConstants'

let apiBridge = (function() {
  return (AppMode === AppConstants.DEV_MODE)
    ? require('../../test/helpers/apiFixture')
    : require('../api')
})()

module.exports = apiBridge

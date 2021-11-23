import 'babel-polyfill'

import './../scss/laraberg.scss'

import './gutenberg/imports'
import init from './gutenberg/init'
import { getContent, setContent } from './lib/content'
import { registerBlock, registerCategory, registerStyle, unregisterStyle } from './lib/custom-blocks'

const Laraberg = {
  init: init,
  initGutenberg: init,
  getContent: getContent,
  setContent: setContent,
  editor: null,
  registerCategory: registerCategory,
  registerBlock: registerBlock,
  registerStyle: registerStyle,
  unregisterStyle: unregisterStyle,
}

window.Laraberg = Laraberg

export default Laraberg

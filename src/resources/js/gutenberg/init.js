import {editorSettings, overridePost} from './settings'
import {configureAPI} from '../api/api-fetch'
import configureEditor from '../lib/configure-editor'
import {elementReady} from '../lib/element-ready'

const {blocks, data, domReady, editPost, plugins} = window.wp
const {unregisterBlockType, registerBlockType, getBlockType} = blocks

/**
 * Initialize the Gutenberg editor
 * @param {string} target the element ID to render the gutenberg editor in
 */
export default function init(target, options = {}) {
    configureAPI(options);

    window._wpLoadGutenbergEditor = new Promise(function (resolve) {
        domReady(async () => {
            const larabergEditor = createEditorElement(target)
            try {
                resolve(editPost.initializeEditor(larabergEditor.id, 'page', 1, getEditorSettings(), overridePost));
                fixReusableBlocks();

                // Toggle features
                const {isFeatureActive} = data.select('core/edit-post');
                const {toggleFeature} = data.dispatch('core/edit-post');

                if (isFeatureActive('welcomeGuide')) {
                    toggleFeature('welcomeGuide');
                }

                if (isFeatureActive('fullscreenMode')) {
                    toggleFeature('fullscreenMode');
                }

                // Disable block patterns
                plugins.unregisterPlugin('edit-post')
            } catch (error) {
                console.error(error)
            }
            await elementReady('.edit-post-layout')
            configureEditor(options)
        })
    });

    // Disable warnings on content save/close by faking there are no changes
    // on the page.
    window.addEventListener('beforeunload', () => {
        const records = data.select('core').__experimentalGetDirtyEntityRecords();

        if (! records.length) {
            return;
        }

        const {kind, name, key} = records.shift();
        data.dispatch('core').saveEditedEntityRecord(
            kind,
            name,
            key
        );
    });
}

/**
 * Creates the element to render the Gutenberg editor inside of
 * @param {string} target the id of the textarea to render the Editor instead of
 * @return {element}
 */
function createEditorElement(target) {
    const element = document.getElementById(target)
    const editor = document.createElement('DIV')
    editor.id = 'laraberg__editor'
    editor.classList.add('laraberg__editor', 'gutenberg__editor', 'block-editor__container', 'wp-embed-responsive')
    element.parentNode.insertBefore(editor, element)
    element.hidden = true

    editorSettings.target = target
    window.Laraberg.editor = editor

    return editor
}

function fixReusableBlocks() {
    const coreBlock = getBlockType('core/block')
    unregisterBlockType('core/block')
    coreBlock.attributes = {
        ref: {
            type: 'number'
        }
    }
    registerBlockType('core/block', coreBlock)
}

function getEditorSettings() {
    const targetElement = document.getElementById(editorSettings.target)

    if (targetElement && targetElement.placeholder) {
        editorSettings.bodyPlaceholder = targetElement.placeholder
    }

    return editorSettings
}

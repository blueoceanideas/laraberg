import {editorSettings, overridePost} from './settings'
import {configureAPI} from '../api/api-fetch'
import configureEditor from '../lib/configure-editor'
import {elementReady} from '../lib/element-ready'

const {blocks, data, domReady, editPost, plugins} = window.wp
const {unregisterBlockType, registerBlockType, getBlockType} = blocks

/**
 * Initialize the Gutenberg editor
 * @param {string|HTMLElement} target the element ID or the element itself to render the gutenberg editor in
 * @param {Object} options configuration options for the editor
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
 * @param {string|HTMLElement} target the id of the textarea or the textarea element itself to render the Editor instead of
 * @return {element}
 */
function createEditorElement(target) {
    // Handle both string ID and HTMLElement
    const element = target instanceof HTMLElement ? target : document.getElementById(target)
    
    if (!element) {
        throw new Error(`Laraberg: Could not find target element. Expected a valid element ID string or HTMLElement, received: ${target}`)
    }
    
    const editor = document.createElement('DIV')
    editor.id = 'laraberg__editor'
    editor.classList.add('laraberg__editor', 'gutenberg__editor', 'block-editor__container', 'wp-embed-responsive')
    element.parentNode.insertBefore(editor, element)
    element.hidden = true

    // Store the element's ID for later use, or generate one if it doesn't have an ID
    editorSettings.target = element.id || null
    editorSettings.targetElement = element
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
    // Use stored targetElement, or fall back to looking up by ID
    const targetElement = editorSettings.targetElement || document.getElementById(editorSettings.target)

    if (targetElement && targetElement.placeholder) {
        editorSettings.bodyPlaceholder = targetElement.placeholder
    }

    return editorSettings
}

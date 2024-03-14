// ==UserScript==
// @name         Anilist: Activity-Feed Filter
// @namespace    https://github.com/SeyTi01/
// @version      1.8.2b
// @description  Control the content displayed in your activity feeds
// @author       SeyTi01
// @match        https://anilist.co/*
// @grant        none
// @license      MIT
// ==/UserScript==

const config = {
    remove: {
        images: false, // Remove activities with images
        videos: false, // Remove activities with videos
        text: false, // Remove activities with only text
        uncommented: false, // Remove activities without comments
        unliked: false, // Remove activities without likes
        containsStrings: [], // Remove activities containing user-defined strings
    },
    options: {
        targetLoadCount: 2, // Minimum number of activities to display per "Load More" button click
        caseSensitive: false, // Use case-sensitive matching for string-based removal
        reverseConditions: false, // Display only posts that meet the specified removal conditions
        linkedConditions: [], // Groups of conditions to be checked together
    },
    runOn: {
        home: true, // Run the script on the home feed
        social: true, // Run the script on the 'Recent Activity' of anime/manga entries
        profile: false, // Run the script on user profile feeds
        guestHome: false, // Run the script on the home feed for non-user visitors
    },
};

class MainApp {
    constructor(activityHandler, uiHandler, config) {
        this.ac = activityHandler;
        this.ui = uiHandler;
        this.config = config;
    }

    observeMutations = (mutations) => {
        if (this.isAllowedUrl()) {
            mutations.forEach(mutation => mutation.addedNodes.forEach(node => this.handleAddedNode(node)));
            this.loadMoreOrReset();
        }
    }

    handleAddedNode = (node) => {
        if (node instanceof HTMLElement) {
            if (node.matches(selectors.DIV.ACTIVITY)) {
                this.ac.processNode(node);
            } else if (node.matches(selectors.DIV.BUTTON)) {
                this.ui.assignLoadMore(node);
            }
        }
    }

    loadMoreOrReset = () => {
        if (this.ac.currentLoadCount < this.config.options.targetLoadCount && this.ui.userPressed) {
            this.ui.clickLoadMore();
        } else {
            this.ac.resetLoadCount();
            this.ui.resetState();
        }
    }

    isAllowedUrl = () => {
        const allowedPatterns = Object.keys(this.URLS).filter(pattern => this.config.runOn[pattern]);

        return allowedPatterns.some(pattern => {
            const regex = new RegExp(this.URLS[pattern].replace('*', '.*'));
            return regex.test(window.location.href);
        });
    }

    initializeObserver = () => {
        this.observer = new MutationObserver(this.observeMutations);
        this.observer.observe(document.body, { childList: true, subtree: true });
    }

    URLS = {
        home: 'https://anilist.co/home',
        social: 'https://anilist.co/*/social',
        profile: 'https://anilist.co/user/*/',
        guestHome: 'https://anilist.co/social',
    };
}

class ActivityHandler {
    constructor(config) {
        this.currentLoadCount = 0;
        this.config = config;
        this.linked = {
            TRUE: 1,
            FALSE: 0,
            NONE: -1,
        };
    }

    CONDITIONS_MAP = new Map([
        ['uncommented', (node, reverse) => reverse ? !this.evaluateUncommentedRemoval(node) : this.evaluateUncommentedRemoval(node)],
        ['unliked', (node, reverse) => reverse ? !this.evaluateUnlikedRemoval(node) : this.evaluateUnlikedRemoval(node)],
        ['text', (node, reverse) => reverse ? !this.evaluateTextRemoval(node) : this.evaluateTextRemoval(node)],
        ['images', (node, reverse) => reverse ? !this.evaluateImageRemoval(node) : this.evaluateImageRemoval(node)],
        ['videos', (node, reverse) => reverse ? !this.evaluateVideoRemoval(node) : this.evaluateVideoRemoval(node)],
        ['containsStrings', (node, reverse) => this.evaluateStringRemoval(node, reverse)],
    ]);

    processNode(node) {
        const { options: { reverseConditions } } = this.config;
        const linkedResult = this.evaluateLinkedConditions(node);

        const shouldRemoveNode = reverseConditions
            ? this.evaluateReverseConditions(node, linkedResult)
            : this.evaluateNormalConditions(node, linkedResult);

        shouldRemoveNode ? node.remove() : this.currentLoadCount++;
    }

    evaluateLinkedConditions(node) {
        const { options: { linkedConditions } } = this.config;
        this.linkedConditionsFlat = linkedConditions.flat();

        if (this.linkedConditionsFlat.length === 0) {
            return this.linked.NONE;
        }

        const conditions = this.extractLinkedConditions(linkedConditions);
        const checkResult = conditions.map(c => this.evaluateConditionList(node, c));

        return (checkResult.includes(true) && (!this.config.options.reverseConditions || !checkResult.includes(false)))
            ? this.linked.TRUE
            : this.linked.FALSE;
    }

    evaluateReverseConditions(node, linkedResult) {
        const { remove, options: { reverseConditions } } = this.config;

        const checkedConditions = Array.from(this.CONDITIONS_MAP)
            .filter(([name]) => !this.isConditionInLinked(name) && (remove[name] === true || remove[name].length > 0))
            .map(([, predicate]) => predicate(node, reverseConditions));

        return linkedResult !== this.linked.FALSE && !checkedConditions.includes(false)
            && (linkedResult === this.linked.TRUE || checkedConditions.includes(true));
    }

    evaluateNormalConditions(node, linkedResult) {
        const { remove, options: { reverseConditions } } = this.config;

        return linkedResult === this.linked.TRUE || [...this.CONDITIONS_MAP].some(([name, predicate]) =>
            !this.isConditionInLinked(name) && remove[name] && predicate(node, reverseConditions),
        );
    }

    evaluateConditionList(node, conditionList) {
        const { options: { reverseConditions } } = this.config;

        return reverseConditions
            ? conditionList.some(condition => this.CONDITIONS_MAP.get(condition)(node, reverseConditions))
            : conditionList.every(condition => this.CONDITIONS_MAP.get(condition)(node, reverseConditions));
    }

    extractLinkedConditions(linkedConditions) {
        return linkedConditions.every(condition => typeof condition === 'string')
        && !linkedConditions.some(condition => Array.isArray(condition))
            ? [linkedConditions]
            : linkedConditions.map(condition => Array.isArray(condition)
                ? condition
                : [condition]);
    }

    isConditionInLinked(condition) {
        return this.linkedConditionsFlat.includes(condition);
    }

    evaluateStringRemoval = (node, reversed) => {
        const { remove: { containsStrings }, options: { caseSensitive } } = this.config;

        if (containsStrings.flat().length === 0) {
            return false;
        }

        const containsString = (nodeText, strings) => !caseSensitive
            ? nodeText.toLowerCase().includes(strings.toLowerCase())
            : nodeText.includes(strings);

        const checkStrings = (strings) => Array.isArray(strings)
            ? strings.every(str => containsString(node.textContent, str))
            : containsString(node.textContent, strings);

        return reversed
            ? !containsStrings.some(checkStrings)
            : containsStrings.some(checkStrings);
    };

    evaluateTextRemoval = (node) =>
        (node.classList.contains(selectors.ACTIVITY.TEXT) || node.classList.contains(selectors.ACTIVITY.MESSAGE))
        && !(this.evaluateImageRemoval(node) || this.evaluateVideoRemoval(node));

    evaluateVideoRemoval = (node) => node?.querySelector(selectors.CLASS.VIDEO)
        || node?.querySelector(selectors.SPAN.YOUTUBE);

    evaluateImageRemoval = (node) => node?.querySelector(selectors.CLASS.IMAGE);

    evaluateUncommentedRemoval = (node) => !node.querySelector(selectors.DIV.REPLIES)?.querySelector(selectors.SPAN.COUNT);

    evaluateUnlikedRemoval = (node) => !node.querySelector(selectors.DIV.LIKES)?.querySelector(selectors.SPAN.COUNT);

    resetLoadCount = () => this.currentLoadCount = 0;
}

class UIHandler {
    constructor() {
        this.userPressed = true;
        this.cancel = null;
        this.loadMore = null;
        this.options = null;
        this.createOptions();
    }

    assignLoadMore = (button) => {
        this.loadMore = button;
        this.loadMore.addEventListener('click', () => {
            this.userPressed = true;
            this.triggerScrollEvents();
            this.displayCancel();
        });
    };

    clickLoadMore = () => this.loadMore?.click() ?? null;

    clickOptionsButton = () => this.options?.click() ?? null;

    resetState = () => {
        this.userPressed = false;
        this.hideCancel();
    };

    displayCancel = () => {
        this.cancel ? this.cancel.style.display = 'block' : this.createCancel();
    }

    hideCancel = () => {
        if (this.cancel) {
            this.cancel.style.display = 'none';
        }
    };

    triggerScrollEvents = () => {
        const domEvent = new Event('scroll', { bubbles: true });
        const intervalId = setInterval(() => this.userPressed
            ? window.dispatchEvent(domEvent)
            : clearInterval(intervalId), 100);
    };

    createOptions = () => {
        const BUTTON_STYLE = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            z-index: 9999;
            line-height: 1.3;
            background-color: rgb(var(--color-background-blue-dark));
            color: rgb(var(--color-text-bright));
            font: 1.6rem 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            -webkit-font-smoothing: antialiased;
            box-sizing: border-box;
            --button-color: rgb(var(--color-blue));
            `;

        this.options = Object.assign(document.createElement('button'), {
            textContent: 'Options',
            className: 'options-button',
            style: BUTTON_STYLE,
            onclick: () => {
                this.openPopup();
            },
        });

        document.body.appendChild(this.options);
    };

    openPopup = () => {
        const popup = document.createElement('div');
        popup.style = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 9999;
            background-color: rgb(var(--color-background-blue-dark));
            color: rgb(var(--color-text-bright));
            font: 1.6rem 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            -webkit-font-smoothing: antialiased;
            box-sizing: border-box;
            --button-color: rgb(var(--color-blue));
        `;
        popup.innerHTML = `
            <h1>Options</h1>
            <form>
                <label for="targetLoadCount">Minimum number of activities to display per "Load More" button click:</label>
                <input type="number" id="targetLoadCount" name="targetLoadCount" min="1" value="${config.options.targetLoadCount}">
                <br>
                <label for="caseSensitive">Use case-sensitive matching for string-based removal:</label>
                <input type="checkbox" id="caseSensitive" name="caseSensitive" ${config.options.caseSensitive ? 'checked' : ''}>
                <br>
                <label for="reverseConditions">Display only posts that meet the specified removal conditions:</label>
                <input type="checkbox" id="reverseConditions" name="reverseConditions" ${config.options.reverseConditions ? 'checked' : ''}>
                <br>
                <label for="linkedConditions">Groups of conditions to be checked together:</label>
                <input type="text" id="linkedConditions" name="linkedConditions" value="${config.options.linkedConditions.join(', ')}">
                <br>
                <label for="runOnHome">Run the script on the home feed:</label>
                <input type="checkbox" id="runOnHome" name="runOnHome" ${config.runOn.home ? 'checked' : ''}>
                <br>
                <label for="runOnSocial">Run the script on the 'Recent Activity' of anime/manga entries:</label>
                <input type="checkbox" id="runOnSocial" name="runOnSocial" ${config.runOn.social ? 'checked' : ''}>
                <br>
                <label for="runOnProfile">Run the script on user profile feeds:</label>
                <input type="checkbox" id="runOnProfile" name="runOnProfile" ${config.runOn.profile ? 'checked' : ''}>
                <br>
                <label for="runOnGuestHome">Run the script on the home feed for non-user visitors:</label>
                <input type="checkbox" id="runOnGuestHome" name="runOnGuestHome" ${config.runOn.guestHome ? 'checked' : ''}>
                <br>
                <label for="removeImages">Remove activities with images:</label>
                <input type="checkbox" id="removeImages" name="removeImages" ${config.remove.images ? 'checked' : ''}>
                <br>
                <label for="removeVideos">Remove activities with videos:</label>
                <input type="checkbox" id="removeVideos" name="removeVideos" ${config.remove.videos ? 'checked' : ''}>
                <br>
                <label for="removeText">Remove activities with only text:</label>
                <input type="checkbox" id="removeText" name="removeText" ${config.remove.text ? 'checked' : ''}>
                <br>
                <label for="removeContainsStrings">Remove activities containing user-defined strings:</label>
                <input type="text" id="removeContainsStrings" name="removeContainsStrings" value="${config.remove.containsStrings.join(', ')}">
                <br>
                <label for="removeUncommented">Remove activities without comments:</label>
                <input type="checkbox" id="removeUncommented" name="removeUncommented" ${config.remove.uncommented ? 'checked' : ''}>
                <br>
                <label for="removeUnliked">Remove activities without likes:</label>
                <input type="checkbox" id="removeUnliked" name="removeUnliked" ${config.remove.unliked ? 'checked' : ''}>
                <br>
            `;
        const submitButton = document.createElement('button');
        submitButton.textContent = 'Save';
        submitButton.onclick = () => {
            this.saveOptions(popup);
        };
        popup.appendChild(submitButton);
        document.body.appendChild(popup);
    };

    saveOptions(popup) {
        const form = popup.querySelector('form');
        const formData = new FormData(form);
        const options = {};

        for (const [key, value] of formData.entries()) {
            if (key === 'linkedConditions') {
                options[key] = value.split(',').map(condition => condition.trim().split(' '));
            } else if (key === 'removeContainsStrings') {
                options[key] = value.split(',').map(str => str.trim());
            } else {
                options[key] = key === 'targetLoadCount' ? parseInt(value) : value === 'on' ? true : value === 'off' ? false : value;
            }
        }

        Object.assign(config, options);
        popup.remove();
    }

    createCancel = () => {
        const BUTTON_STYLE = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            z-index: 9999;
            line-height: 1.3;
            background-color: rgb(var(--color-background-blue-dark));
            color: rgb(var(--color-text-bright));
            font: 1.6rem 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            -webkit-font-smoothing: antialiased;
            box-sizing: border-box;
            --button-color: rgb(var(--color-blue));
            `;

        this.cancel = Object.assign(document.createElement('button'), {
            textContent: 'Cancel',
            className: 'cancel-button',
            style: BUTTON_STYLE,
            onclick: () => {
                this.userPressed = false;
                this.cancel.style.display = 'none';
            },
        });

        document.body.appendChild(this.cancel);
    };
}

class ConfigValidator {
    constructor(config) {
        this.config = config;
        this.errors = [];
    }

    validate() {
        this.validatePositiveNonZeroInteger('options.targetLoadCount', 'options.targetLoadCount');
        this.validateLinkedConditions('options.linkedConditions');
        this.validateStringArrays(['remove.containsStrings', 'options.linkedConditions']);
        this.validateBooleans(['remove.uncommented', 'remove.unliked', 'remove.text', 'remove.images',
            'remove.videos', 'options.caseSensitive', 'options.reverseConditions', 'runOn.home', 'runOn.social',
            'runOn.profile', 'runOn.guestHome']);

        if (this.errors.length > 0) {
            throw new Error(`Script disabled due to configuration errors: ${this.errors.join(', ')}`);
        }
    }

    validateBooleans(keys) {
        keys.forEach(key => {
            const value = this.getConfigValue(key);
            typeof value !== 'boolean' ? this.errors.push(`${key} should be a boolean`) : null;
        });
    }

    validatePositiveNonZeroInteger(key, configKey) {
        const value = this.getConfigValue(configKey);
        if (!(value > 0 && Number.isInteger(value))) {
            this.errors.push(`${key} should be a positive non-zero integer`);
        }
    }

    validateStringArrays(keys) {
        for (const key of keys) {
            const value = this.getConfigValue(key);
            if (!Array.isArray(value)) {
                this.errors.push(`${key} should be an array`);
            } else if (!this.validateArrayContents(value)) {
                this.errors.push(`${key} should only contain strings`);
            }
        }
    }

    validateArrayContents(arr) {
        return arr.every(element => {
            if (Array.isArray(element)) {
                return this.validateArrayContents(element);
            }
            return typeof element === 'string';
        });
    }

    validateLinkedConditions(configKey) {
        const linkedConditions = this.getConfigValue(configKey).flat();
        const allowedConditions = ['uncommented', 'unliked', 'text', 'images', 'videos', 'containsStrings'];

        if (linkedConditions.some(condition => !allowedConditions.includes(condition))) {
            this.errors.push(`${configKey} should only contain the following strings: ${allowedConditions.join(', ')}`);
        }
    }

    getConfigValue(key) {
        return key.split('.').reduce((value, k) => value[k], this.config);
    }
}

const selectors = {
    DIV: {
        BUTTON: 'div.load-more',
        ACTIVITY: 'div.activity-entry',
        REPLIES: 'div.action.replies',
        LIKES: 'div.action.likes',
    },
    SPAN: {
        COUNT: 'span.count',
        YOUTUBE: 'span.youtube',
    },
    ACTIVITY: {
        TEXT: 'activity-text',
        MESSAGE: 'activity-message',
    },
    CLASS: {
        IMAGE: 'img',
        VIDEO: 'video',
    },
};

function main() {
    try {
        new ConfigValidator(config).validate();
    } catch (error) {
        console.error(error.message);
        return;
    }

    const uiHandler = new UIHandler();
    const activityHandler = new ActivityHandler(config);
    const mainApp = new MainApp(activityHandler, uiHandler, config);

    mainApp.ui.createOptions();
    mainApp.initializeObserver();
}

if (require.main === module) {
    main();
}

module.exports = { MainApp, ActivityHandler, UIHandler, ConfigValidator, SELECTORS: selectors };

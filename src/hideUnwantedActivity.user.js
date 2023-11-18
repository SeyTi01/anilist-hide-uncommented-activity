// ==UserScript==
// @name         Anilist: Hide Unwanted Activity
// @namespace    https://github.com/SeyTi01/
// @version      1.8
// @description  Customize activity feeds by removing unwanted entries
// @author       SeyTi01
// @match        https://anilist.co/*
// @grant        none
// @license      MIT
// ==/UserScript==

const config = {
    remove: {
        uncommented: true, // Remove activities that have no comments
        unliked: false, // Remove activities that have no likes
        text: false, // Remove activities containing only text
        images: false, // Remove activities containing images
        videos: false, // Remove activities containing videos
        containsStrings: [], // Remove activities containing user-defined strings
    },
    options: {
        targetLoadCount: 2, // Minimum number of activities to show per click on the "Load More" button
        caseSensitive: false, // Whether string-based removal should be case-sensitive
        reverseConditions: false, // Only keep posts that would be removed by the conditions
        linkedConditions: [], // Groups of conditions to be checked together
    },
    runOn: {
        home: true, // Run the script on the home feed
        social: true, // Run the script on social feeds
        profile: false, // Run the script on user profile feeds
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
            if (node.matches(SELECTORS.div.activity)) {
                this.ac.removeEntry(node);
            } else if (node.matches(SELECTORS.div.button)) {
                this.ui.setLoadMore(node);
            }
        }
    }

    loadMoreOrReset = () => {
        if (this.ac.currentLoadCount < this.config.options.targetLoadCount && this.ui.userPressed) {
            this.ui.clickLoadMore();
        } else {
            this.ac.resetState();
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
        profile: 'https://anilist.co/user/*/',
        social: 'https://anilist.co/*/social',
    };
}

class ActivityHandler {
    constructor(config) {
        this.currentLoadCount = 0;
        this.config = config;
    }

    conditionsMap = new Map([
        ['uncommented', (node, reverse) => reverse ? !this.shouldRemoveUncommented(node) : this.shouldRemoveUncommented(node)],
        ['unliked', (node, reverse) => reverse ? !this.shouldRemoveUnliked(node) : this.shouldRemoveUnliked(node)],
        ['text', (node, reverse) => reverse ? !this.shouldRemoveText(node) : this.shouldRemoveText(node)],
        ['images', (node, reverse) => reverse ? !this.shouldRemoveImage(node) : this.shouldRemoveImage(node)],
        ['videos', (node, reverse) => reverse ? !this.shouldRemoveVideo(node) : this.shouldRemoveVideo(node)],
        ['containsStrings', (node, reverse) => this.shouldRemoveStrings(node, reverse)],
    ]);

    resetState = () => this.currentLoadCount = 0;

    removeEntry = (node) => {
        const { remove, options: { linkedConditions, reverseConditions } } = this.config;
        const linkedConditionsFlat = linkedConditions.flat();
        const shouldSkipChecking = (condition) => linkedConditionsFlat.includes(condition);

        const checkConditions = (node, conditionList, reverseConditions) => reverseConditions
            ? conditionList.some(condition => this.conditionsMap.get(condition)(node, reverseConditions))
            : conditionList.every(condition => this.conditionsMap.get(condition)(node, reverseConditions));

        const shouldRemoveByLinkedConditions = () => {
            if (linkedConditionsFlat.length === 0) return false;

            const conditions = Array.isArray(linkedConditions[0]) ? linkedConditions : [linkedConditions];
            return conditions.some(condition => checkConditions(node, condition, reverseConditions));
        };

        const shouldRemoveNode = () => {
            if (shouldRemoveByLinkedConditions()) return true;

            if (!reverseConditions) {
                return [...this.conditionsMap].some(([name, conditionPredicate]) =>
                    remove[name] && !shouldSkipChecking(name) && conditionPredicate(node, reverseConditions)
                );
            } else {
                const conditionsRev = Array.from(this.conditionsMap)
                    .filter(([name]) => remove[name] === true || remove[name].length > 0)
                    .map(([, conditionPredicate]) => conditionPredicate(node, reverseConditions));

                return conditionsRev.includes(true) && !conditionsRev.includes(false);
            }
        };

        shouldRemoveNode() ? node.remove() : this.currentLoadCount++;
    };

    shouldRemoveStrings = (node, reversed) => {
        const { remove: { containsStrings }, options: { caseSensitive } } = this.config;

        if (containsStrings.flat().length === 0) return false;

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

    shouldRemoveText = (node) =>
        (node.classList.contains(SELECTORS.activity.text) || node.classList.contains(SELECTORS.activity.message))
        && !(this.shouldRemoveImage(node) || this.shouldRemoveVideo(node));

    shouldRemoveVideo = (node) => node?.querySelector(SELECTORS.class.video)
        || node?.querySelector(SELECTORS.span.youTube);

    shouldRemoveUncommented = (node) => !node.querySelector(SELECTORS.div.replies)?.querySelector(SELECTORS.span.count);

    shouldRemoveUnliked = (node) => !node.querySelector(SELECTORS.div.likes)?.querySelector(SELECTORS.span.count);

    shouldRemoveImage = (node) => node?.querySelector(SELECTORS.class.image);
}

class UIHandler {
    constructor() {
        this.userPressed = true;
        this.cancel = null;
        this.loadMore = null;
    }

    setLoadMore = (button) => {
        this.loadMore = button;
        this.loadMore.addEventListener('click', () => {
            this.userPressed = true;
            this.simulateDomEvents();
            this.showCancel();
        });
    };

    clickLoadMore = () => this.loadMore?.click() ?? null;

    resetState = () => {
        this.userPressed = false;
        this.hideCancel();
    };

    showCancel = () => {
        this.cancel ? this.cancel.style.display = 'block' : this.createCancel();
    }

    hideCancel = () => {
        if (this.cancel) {
            this.cancel.style.display = 'none';
        }
    };

    simulateDomEvents = () => {
        const domEvent = new Event('scroll', { bubbles: true });
        const intervalId = setInterval(() => this.userPressed
            ? window.dispatchEvent(domEvent)
            : clearInterval(intervalId), 100);
    };

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
            'remove.videos', 'options.caseSensitive', 'options.reverseConditions', 'runOn.home', 'runOn.social', 'runOn.profile']);

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

const SELECTORS = {
    div: {
        button: 'div.load-more',
        activity: 'div.activity-entry',
        replies: 'div.action.replies',
        likes: 'div.action.likes',
    },
    span: {
        count: 'span.count',
        youTube: 'span.youtube',
    },
    activity: {
        text: 'activity-text',
        message: 'activity-message',
    },
    class: {
        image: 'img',
        video: 'video',
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

    mainApp.initializeObserver();
}

if (require.main === module) {
    main();
}

module.exports = { MainApp, ActivityHandler, UIHandler, ConfigValidator, SELECTORS };
// ==UserScript==
// @name         Anilist: Activity-Feed Filter
// @namespace    https://github.com/SeyTi01/
// @version      1.8.2
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
        homeNoUser: false, // Run the script on the home feed for non-user visitors
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
        homeNoUser: 'https://anilist.co/social',
    };
}

class ActivityHandler {
    CONDITIONS_MAP = new Map([
        ['uncommented', (node, reverse) => reverse ? !this.shouldRemoveUncommented(node) : this.shouldRemoveUncommented(node)],
        ['unliked', (node, reverse) => reverse ? !this.shouldRemoveUnliked(node) : this.shouldRemoveUnliked(node)],
        ['text', (node, reverse) => reverse ? !this.shouldRemoveText(node) : this.shouldRemoveText(node)],
        ['images', (node, reverse) => reverse ? !this.shouldRemoveImage(node) : this.shouldRemoveImage(node)],
        ['videos', (node, reverse) => reverse ? !this.shouldRemoveVideo(node) : this.shouldRemoveVideo(node)],
        ['containsStrings', (node, reverse) => this.shouldRemoveStrings(node, reverse)],
    ]);

    constructor(config) {
        this.currentLoadCount = 0;
        this.config = config;
    }

    removeEntry(node) {
        const { remove, options: { linkedConditions, reverseConditions } } = this.config;
        const linkedConditionsFlat = linkedConditions.flat();

        const linkedResult = this.shouldRemoveByLinkedConditions(node, linkedConditionsFlat, linkedConditions, reverseConditions);

        const shouldRemoveNode = reverseConditions
            ? this.evaluateReverseConditions(node, linkedResult, remove, reverseConditions, linkedConditionsFlat)
            : this.evaluateNormalConditions(node, linkedResult, remove, reverseConditions, linkedConditionsFlat);

        shouldRemoveNode ? node.remove() : this.currentLoadCount++;
    }

    shouldRemoveByLinkedConditions(node, linkedConditionsFlat, linkedConditions, reverseConditions) {
        if (linkedConditionsFlat.length === 0) {
            return this.linked.NONE;
        }

        const conditions = this.getLinkedConditions(linkedConditions);
        const checkResult = conditions.map(c => this.checkLinkedConditions(node, c, reverseConditions));

        return (checkResult.includes(true) && (!reverseConditions || !checkResult.includes(false)))
            ? this.linked.TRUE
            : this.linked.FALSE;
    }

    evaluateReverseConditions(node, linkedResult, remove, reverseConditions, linkedConditionsFlat) {
        const checkedConditions = Array.from(this.CONDITIONS_MAP)
            .filter(([name]) => !this.shouldSkip(name, linkedConditionsFlat) && (remove[name] === true || remove[name].length > 0))
            .map(([, predicate]) => predicate(node, reverseConditions));

        return linkedResult !== this.linked.FALSE && !checkedConditions.includes(false)
            && (linkedResult === this.linked.TRUE || checkedConditions.includes(true));
    }

    evaluateNormalConditions(node, linkedResult, remove, reverseConditions, linkedConditionsFlat) {
        return linkedResult === this.linked.TRUE || [...this.CONDITIONS_MAP].some(([name, predicate]) =>
            !this.shouldSkip(name, linkedConditionsFlat) && remove[name] && predicate(node, reverseConditions),
        );
    }

    checkLinkedConditions(node, conditionList, reverseConditions) {
        return reverseConditions
            ? conditionList.some(condition => this.CONDITIONS_MAP.get(condition)(node, reverseConditions))
            : conditionList.every(condition => this.CONDITIONS_MAP.get(condition)(node, reverseConditions));
    }

    getLinkedConditions(linkedConditions) {
        return linkedConditions.every(condition => typeof condition === 'string')
        && !linkedConditions.some(condition => Array.isArray(condition))
            ? [linkedConditions]
            : linkedConditions.map(condition => Array.isArray(condition) ? condition : [condition]);
    }

    shouldSkip(condition, linkedConditionsFlat) {
        return linkedConditionsFlat.includes(condition);
    }

    shouldRemoveStrings = (node, reversed) => {
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

    shouldRemoveText = (node) =>
        (node.classList.contains(SELECTORS.activity.text) || node.classList.contains(SELECTORS.activity.message))
        && !(this.shouldRemoveImage(node) || this.shouldRemoveVideo(node));

    shouldRemoveVideo = (node) => node?.querySelector(SELECTORS.class.video)
        || node?.querySelector(SELECTORS.span.youTube);

    shouldRemoveImage = (node) => node?.querySelector(SELECTORS.class.image);

    shouldRemoveUncommented = (node) => !node.querySelector(SELECTORS.div.replies)?.querySelector(SELECTORS.span.count);

    shouldRemoveUnliked = (node) => !node.querySelector(SELECTORS.div.likes)?.querySelector(SELECTORS.span.count);

    resetState = () => this.currentLoadCount = 0;

    linked = {
        TRUE: 1,
        FALSE: 0,
        NONE: -1,
    };
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
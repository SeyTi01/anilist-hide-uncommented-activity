import {SELECTORS, ActivityManager} from "./ActivityManager";

export class MutationObserverManager {

    constructor(config) {
        this.config = config;
        this.activityManager = new ActivityManager(config);
        this.currentLoadCount = 0;
        this.userPressedButton = true;
        this.initializeObserver();
    }

    observeMutations(mutations) {
        if (this.isAllowedUrl()) {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(this.handleAddedNode.bind(this));
                }
            }
        }

        if (this.currentLoadCount < this.config.targetLoadCount && this.userPressedButton) {
            this.activityManager.clickLoadMoreButton();
        } else {
            this.activityManager.resetState();
        }
    }

    handleAddedNode(node) {
        if (!(node instanceof HTMLElement)) {
            return;
        }

        if (node.matches(SELECTORS.activity)) {
            if (!this.activityManager.removeEntry(node)) {
                this.currentLoadCount++;
            }

        } else if (node.matches(SELECTORS.button)) {
            this.activityManager.handleLoadMoreButton(node);
        }
    }

    isAllowedUrl() {
        const currentUrl = window.location.href;
        return (
            (this.config.runOn.home && new RegExp(URLS.home.replace('*', '.*')).test(currentUrl)) ||
            (this.config.runOn.profile && new RegExp(URLS.profile.replace('*', '.*')).test(currentUrl)) ||
            (this.config.runOn.social && new RegExp(URLS.social.replace('*', '.*')).test(currentUrl))
        );
    }

    initializeObserver() {
        const observer = new MutationObserver(this.observeMutations.bind(this));
        observer.observe(document.body, {childList: true, subtree: true});
    }
}

const URLS = {
    home: 'https://anilist.co/home',
    profile: 'https://anilist.co/user/*/',
    social: 'https://anilist.co/*/social',
};
// ==UserScript==
// @name         Anilist: Hide Uncommented Activity
// @namespace    https://github.com/SeyTi01/
// @version      1.5
// @description  Hides uncommented/unliked activity on Anilist's activity feeds
// @author       SeyTi01
// @match        https://anilist.co/*
// @grant        none
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    const config = {
        targetLoadCount: 2, // Number of activities to show per click on the "Load More" button
        remove: {
            uncommented: true, // Remove activities that have no comments
            unliked: false // Remove activities that have no likes
        },
        runOn: {
            home: true, // Run the script on the home feed
            profile: true, // Run the script on user profile feeds
            social: true // Run the script on social feeds
        }
    };

    const SELECTORS = {
        button: 'div.load-more',
        activity: 'div.activity-entry',
        replies: 'div.action.replies',
        likes: 'div.action.likes'
    };

    const URLS = {
        home: 'https://anilist.co/home',
        profile: 'https://anilist.co/user/*/',
        social: 'https://anilist.co/*/social'
    };

    let currentLoadCount = 0;
    let userPressedButton = true;
    let loadMoreButton;
    let cancelButton;

    initializeObserver();

    function initializeObserver() {
        if (!validateConfig(config)) {
            console.error('Script disabled due to configuration errors.');
        } else {
            const observer = new MutationObserver(observeMutations);
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }

    function observeMutations(mutations) {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(handleAddedNode);
            }
        }

        if (currentLoadCount < config.targetLoadCount && userPressedButton) {
            clickLoadMoreButton();
        } else {
            resetState();
        }
    }

    function handleAddedNode(node) {
        if (!(node instanceof HTMLElement)) {
            return;
        }

        if (node.matches(SELECTORS.activity)) {
            if (!removeEntry(node)) {
                currentLoadCount++;
            }

        } else if (node.matches(SELECTORS.button)) {
            handleLoadMoreButton(node);
        }
    }

    function removeEntry(node) {
        if (isAllowedUrl()) {
            const repliesDiv = node.querySelector(SELECTORS.replies);
            const likesDiv = node.querySelector(SELECTORS.likes);

            if ((config.remove.uncommented && !hasCountSpan(repliesDiv)) || (config.remove.unliked && !hasCountSpan(likesDiv))) {
                node.remove();
                return true;
            }
        }

        return false;
    }

    function handleLoadMoreButton(button) {
        loadMoreButton = button;
        loadMoreButton.addEventListener('click', function() {
            userPressedButton = true;
            simulateDomEvents();
            showCancelButton();
        });
    }

    function showCancelButton() {
        if (!cancelButton) {
            createCancelButton();
        } else {
            cancelButton.style.display = 'block';
        }
    }

    function hasCountSpan(node) {
        return node?.querySelector('span.count');
    }


    function isAllowedUrl() {
        const currentUrl = window.location.href;
        return (config.runOn.home && new RegExp(URLS.home.replace('*', '.*')).test(currentUrl))
            || (config.runOn.profile && new RegExp(URLS.profile.replace('*', '.*')).test(currentUrl))
            || (config.runOn.social && new RegExp(URLS.social.replace('*', '.*')).test(currentUrl));
    }

    function simulateDomEvents() {
        const domEvent = new Event('scroll', {bubbles: true});
        const intervalId = setInterval(function() {
            if (userPressedButton) {
                window.dispatchEvent(domEvent);
            } else {
                clearInterval(intervalId);
            }
        }, 100);
    }

    function clickLoadMoreButton() {
        if (loadMoreButton) {
            loadMoreButton.click();
            loadMoreButton = null;
        }
    }

    function resetState() {
        currentLoadCount = 0;
        userPressedButton = false;
        if (cancelButton) {
            cancelButton.style.display = 'none';
        }
    }

    function createCancelButton() {
        const buttonStyles = `
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
            `;

        cancelButton = Object.assign(document.createElement('button'), {
            textContent: 'Cancel',
            className: 'cancel-button',
            style: `--button-color: rgb(var(--color-blue)); ${buttonStyles}`,
            onclick: () => {
                userPressedButton = false;
                cancelButton.style.display = 'none';
            },
        });

        document.body.appendChild(cancelButton);
    }

    function validateConfig(config) {
        const errors = [
            typeof config.remove.uncommented !== 'boolean' && 'removeUncommented must be a boolean',
            typeof config.remove.unliked !== 'boolean' && 'removeUnliked must be a boolean',
            (!Number.isInteger(config.targetLoadCount) || config.targetLoadCount < 1) && 'targetLoadCount must be a positive non-zero integer',
            typeof config.runOn.home !== 'boolean' && 'runOnHome must be a boolean',
            typeof config.runOn.profile !== 'boolean' && 'runOnProfile must be a boolean',
            typeof config.runOn.social !== 'boolean' && 'runOnSocial must be a boolean',
        ].filter(Boolean);

        if (errors.length > 0) {
            console.error('Script configuration errors:');
            errors.forEach(error => console.error(error));
            return false;
        }

        return true;
    }
})();
// ==UserScript==
// @name         Anilist: Hide Uncommented Activity
// @namespace    https://github.com/SeyTi01/
// @version      1.3
// @description  Hides uncommented/unliked activity on any Anilist activity-feed
// @author       SeyTi01
// @match        https://anilist.co/*
// @grant        none
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    const config = {
        removeUncommented: true,
        removeUnliked: false,
        targetLoadCount: 2
    };

    const SELECTORS = {
        activity: 'activity-entry',
        button: 'load-more',
        replies: 'div.action.replies',
        likes: 'div.action.likes',
        cancel: 'cancel-load'
    };

    const observer = new MutationObserver(observeMutations);
    let currentLoadCount = 0;
    let userPressedButton = true;
    let loadMoreButton;
    let cancelButton;

    observer.observe(document.body, {childList: true, subtree: true});

    function removeEntry(node) {
        let removed = false;
        if (node.classList.contains(SELECTORS.activity)) {
            const repliesDiv = node.querySelector(SELECTORS.replies);
            const likesDiv = node.querySelector(SELECTORS.likes);

            if ((config.removeUncommented && !hasCount(repliesDiv)) || (config.removeUnliked && !hasCount(likesDiv))) {
                node.remove();
                removed = true;
            }
        }

        return removed;
    }

    function observeMutations(mutations) {
        for (const mutation of mutations) {
            const nodeList = mutation.addedNodes;
            if (nodeList.length > 0) {
                nodeList.forEach(handleAddedNode);
            }
        }

        if (currentLoadCount < config.targetLoadCount && userPressedButton) {
            clickLoadMoreButton();
        } else {
            resetState();
        }
    }

    function handleAddedNode(node) {
        if (node instanceof HTMLElement) {
            if (node.matches('div.activity-entry')) {
                if (!removeEntry(node)) {
                    currentLoadCount++;
                }

            } else if (node.matches('div.load-more')) {
                loadMoreButton = node;
                loadMoreButton.addEventListener('click', function() {
                    userPressedButton = true;
                    simulateDomEvents();
                    createCancelButton();
                });
            }
        }
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

    function hasCount(element) {
        return element?.querySelector('span.count');
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
            cancelButton.remove();
            cancelButton = null;
        }
    }

    function createCancelButton() {
        if (!cancelButton) {
            const buttonStyles = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            z-index: 9999;
            line-height: 1.3;
            background-color: rgb(var(--color-background-blue-dark));
            color: rgb(var(--color-text-bright));
            font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            font-size: 1.6rem;
            -webkit-font-smoothing: antialiased;
            box-sizing: border-box;
        `;
            cancelButton = document.createElement('button');
            cancelButton.textContent = 'Cancel';
            cancelButton.classList.add('cancel-button');
            cancelButton.style.cssText = buttonStyles;
            cancelButton.style.setProperty('--button-color', 'rgb(var(--color-blue))');
            cancelButton.addEventListener('click', function() {
                userPressedButton = false;
                cancelButton.remove();
            });

            document.body.appendChild(cancelButton);
        }
    }
})();
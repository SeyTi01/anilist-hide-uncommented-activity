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
        button: 'div.load-more',
        activity: 'div.activity-entry',
        replies: 'div.action.replies',
        likes: 'div.action.likes',
    };

    const observer = new MutationObserver(observeMutations);
    let currentLoadCount = 0;
    let userPressedButton = true;
    let cancelButton = null;
    let loadMoreButton;

    observer.observe(document.body, {childList: true, subtree: true});

    function removeEntry(node) {
        let removed = false;
        const repliesDiv = node.querySelector(SELECTORS.replies);
        const likesDiv = node.querySelector(SELECTORS.likes);

        if ((config.removeUncommented && !hasCount(repliesDiv)) || (config.removeUnliked && !hasCount(likesDiv))) {
            node.remove();
            removed = true;
        }

        return removed;
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
        if (node instanceof HTMLElement) {
            if (node.matches(SELECTORS.activity)) {
                if (!removeEntry(node)) {
                    currentLoadCount++;
                }

            } else if (node.matches(SELECTORS.button)) {
                loadMoreButton = node;
                loadMoreButton.addEventListener('click', function() {
                    userPressedButton = true;
                    simulateDomEvents();
                    showCancelButton();
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

    function hasCount(node) {
        return node?.querySelector('span.count');
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
        cancelButton.style.display = 'none';
    }

    function showCancelButton() {
        if (!cancelButton) {
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
        } else {
            cancelButton.style.display = 'block';
        }
    }
})();
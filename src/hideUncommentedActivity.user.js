// ==UserScript==
// @name         Anilist: Hide Uncommented Activity
// @namespace    https://github.com/SeyTi01/
// @version      1.2
// @description  Hides uncommented/unliked activity on the Anilist "Social" tab
// @author       SeyTi01
// @match        https://anilist.co/*
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    const config = {
        removeUncommented: true, // Remove activities with no comments
        removeUnliked: false, // Remove activities with no likes
        targetLoadCount: 2 // Minimum number of activities to show per click on the "Load More"-button
    };

    const SELECTORS = {
        activity: 'activity-entry',
        button: 'load-more',
        replies: 'div.action.replies',
        likes: 'div.action.likes'
    };

    const observer = new MutationObserver(observeMutations);
    let currentLoadCount = 0;
    let userPressedButton = true;
    let loadMoreButton;

    observer.observe(document.body, {childList: true, subtree: true});

    function removeEntry(element) {
        let removed = false;
        if (element instanceof HTMLElement && element.classList.contains(SELECTORS.activity)) {
            const repliesDiv = element.querySelector(SELECTORS.replies);
            const likesDiv = element.querySelector(SELECTORS.likes);

            if ((config.removeUncommented && !hasCount(repliesDiv)) || (config.removeUnliked && !hasCount(likesDiv))) {
                element.remove();
                removed = true;
            }
        }

        return removed;
    }

    function observeMutations(mutations) {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length !== 0) {
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
            if (node.classList.contains(SELECTORS.activity)) {
                if (!removeEntry(node)) {
                    currentLoadCount++;
                }

            } else if (node.classList.contains(SELECTORS.button)) {
                loadMoreButton = node;
                loadMoreButton.addEventListener('click', function() {
                    userPressedButton = true;
                    simulateDomEvents();
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
    }
})();
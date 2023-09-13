// ==UserScript==
// @name         Anilist: Hide Uncommented Activity
// @namespace    https://github.com/SeyTi01/
// @version      1.0
// @description  Hides uncommented activity on home- or social feed
// @author       SeyTi01
// @match        https://anilist.co/*
// @grant        none
// @run-at       document-start
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    const config = {
        removeUncommented: false, // Remove activities with no comments
        removeUnliked: true, // Remove activities with no likes
        targetLoadCount: 2 // Minimum number of activities to show per load
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

            if (config.removeUncommented && !hasCount(repliesDiv)) {
                element.remove();
                removed = true;
            }

            if (config.removeUnliked && !hasCount(likesDiv)) {
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
        if (node instanceof HTMLElement && node.classList.contains(SELECTORS.activity)) {
            if (!removeEntry(node)) {
                currentLoadCount++;
            }
        }

        if (node instanceof HTMLElement && node.classList.contains(SELECTORS.button)) {
            loadMoreButton = node;
            loadMoreButton.addEventListener('click', function() {
                userPressedButton = true;
            });
        }
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
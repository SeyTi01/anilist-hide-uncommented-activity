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

    const ACTIVITY_SELECTOR = 'activity-entry';
    const BUTTON_SELECTOR = 'load-more';
    const REPLIES_SELECTOR = 'div.action.replies';
    const LIKES_SELECTOR = 'div.action.likes';

    const observer = new MutationObserver(observeMutations);
    let currentLoadCount = 0;
    let userPressedButton = true;
    let loadMoreButton;

    observer.observe(document.body, {childList: true, subtree: true});

    function removeEntry(element) {
        let removed = false;
        if (element instanceof HTMLElement && element.classList.contains(ACTIVITY_SELECTOR)) {
            const repliesDiv = element.querySelector(REPLIES_SELECTOR);
            const likesDiv = element.querySelector(LIKES_SELECTOR);

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
        if (node instanceof HTMLElement && node.classList.contains(ACTIVITY_SELECTOR)) {
            if (removeEntry(node) === false) {
                currentLoadCount++;
            }
        }

        if (node instanceof HTMLElement && node.classList.contains(BUTTON_SELECTOR)) {
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
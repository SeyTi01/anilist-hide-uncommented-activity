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

    function createCancelButton() {
        if (!cancelButton) {
            cancelButton = document.createElement('button');
            cancelButton.textContent = 'Cancel';
            cancelButton.classList.add(SELECTORS.cancel);
            cancelButton.style.position = 'fixed';
            cancelButton.style.bottom = '10px';
            cancelButton.style.right = '10px';
            cancelButton.style.zIndex = '9999';
            cancelButton.addEventListener('click', function() {
                userPressedButton = false;
                cancelButton.remove();
                cancelButton = null;
            });

            document.body.appendChild(cancelButton);
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
        if (cancelButton) {
            cancelButton.remove();
            cancelButton = null;
        }
    }
})();
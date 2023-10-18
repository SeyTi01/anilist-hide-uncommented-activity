const fs = require('fs');
const jsdom = require('jsdom');
const { expect } = require('chai');
const { ActivityHandler } = require('../src/hideUnwantedActivity.user');
const { restore, spy } = require("sinon");

const TEST_DATA_PATH = './tests/data/';
const UNLIKED = `${TEST_DATA_PATH}activity-unliked.html`;
const UNCOMMENTED = `${TEST_DATA_PATH}activity-uncommented.html`;
const TEXT = `${TEST_DATA_PATH}activity-text.html`;
const MESSAGE = `${TEST_DATA_PATH}activity-message.html`;
const IMAGES = `${TEST_DATA_PATH}activity-images.html`;
const VIDEOS = `${TEST_DATA_PATH}activity-videos.html`;
const VIDEOS_YOUTUBE = `${TEST_DATA_PATH}activity-videosYoutube.html`;
const CONTAINS_STRING_1 = `${TEST_DATA_PATH}activity-containsString1.html`
const CONTAINS_STRING_2 = `${TEST_DATA_PATH}activity-containsString2.html`
const CONTAINS_STRINGS = `${TEST_DATA_PATH}activity-containsStrings.html`
const LINKED_CONDITIONS = `${TEST_DATA_PATH}activity-linkedConditions.html`;

describe('ActivityHandler', () => {
    let activityHandler;

    beforeEach(function() {
        const config = { remove: {}, options: {} };
        activityHandler = new ActivityHandler(config);
    });

    afterEach(function() {
        restore();
    });

    function runTestCases(testCases) {
        testCases.forEach((testCase) => {
            const { htmlPath, configOptions, expectedRemove } = testCase;
            const nodeType = htmlPath.split('-')[1].split('.')[0];

            it(`should ${expectedRemove ? '' : 'not '}remove ${nodeType} node with config: ${JSON.stringify(configOptions)}`,
                function(done) {
                    fs.readFile(htmlPath, 'utf8',
                        function(err, htmlContent) {
                            if (err) throw err;

                            Object.assign(activityHandler.config, configOptions);
                            const dom = new jsdom.JSDOM(htmlContent);
                            const node = dom.window.document.body.firstChild;
                            const removeSpy = spy(node, 'remove');
                            activityHandler.removeEntry(node);

                            expect(removeSpy.calledOnce).to.equal(expectedRemove);
                            done();
                        });
                });
        });
    }

    const testCases = [
        // Tests for unliked
        { htmlPath: UNLIKED, configOptions: { remove: { unliked: true } }, expectedRemove: true },
        { htmlPath: UNCOMMENTED, configOptions: { remove: { unliked: true } }, expectedRemove: false },
        { htmlPath: TEXT, configOptions: { remove: { unliked: true } }, expectedRemove: false },
        { htmlPath: MESSAGE, configOptions: { remove: { unliked: true } }, expectedRemove: false },
        { htmlPath: IMAGES, configOptions: { remove: { unliked: true } }, expectedRemove: false },
        { htmlPath: VIDEOS, configOptions: { remove: { unliked: true } }, expectedRemove: false },
        { htmlPath: CONTAINS_STRING_1, configOptions: { remove: { unliked: true } }, expectedRemove: false },
        { htmlPath: LINKED_CONDITIONS, configOptions: { remove: { unliked: true } }, expectedRemove: true },

        // Tests for uncommented
        { htmlPath: UNLIKED, configOptions: { remove: { uncommented: true } }, expectedRemove: false },
        { htmlPath: UNCOMMENTED, configOptions: { remove: { uncommented: true } }, expectedRemove: true },
        { htmlPath: TEXT, configOptions: { remove: { uncommented: true } }, expectedRemove: false },
        { htmlPath: MESSAGE, configOptions: { remove: { uncommented: true } }, expectedRemove: false },
        { htmlPath: IMAGES, configOptions: { remove: { uncommented: true } }, expectedRemove: false },
        { htmlPath: VIDEOS, configOptions: { remove: { uncommented: true } }, expectedRemove: false },
        { htmlPath: CONTAINS_STRING_1, configOptions: { remove: { uncommented: true } }, expectedRemove: false },
        { htmlPath: LINKED_CONDITIONS, configOptions: { remove: { uncommented: true } }, expectedRemove: false },

        // Tests for text
        { htmlPath: UNLIKED, configOptions: { remove: { text: true } }, expectedRemove: false },
        { htmlPath: UNCOMMENTED, configOptions: { remove: { text: true } }, expectedRemove: false },
        { htmlPath: TEXT, configOptions: { remove: { text: true } }, expectedRemove: true },
        { htmlPath: MESSAGE, configOptions: { remove: { text: true } }, expectedRemove: true },
        { htmlPath: IMAGES, configOptions: { remove: { text: true } }, expectedRemove: false },
        { htmlPath: VIDEOS, configOptions: { remove: { text: true } }, expectedRemove: false },
        { htmlPath: CONTAINS_STRING_1, configOptions: { remove: { text: true } }, expectedRemove: false },
        { htmlPath: LINKED_CONDITIONS, configOptions: { remove: { text: true } }, expectedRemove: false },

        // Tests for images
        { htmlPath: UNLIKED, configOptions: { remove: { images: true } }, expectedRemove: false },
        { htmlPath: UNCOMMENTED, configOptions: { remove: { images: true } }, expectedRemove: false },
        { htmlPath: TEXT, configOptions: { remove: { images: true } }, expectedRemove: false },
        { htmlPath: MESSAGE, configOptions: { remove: { images: true } }, expectedRemove: false },
        { htmlPath: IMAGES, configOptions: { remove: { images: true } }, expectedRemove: true },
        { htmlPath: VIDEOS, configOptions: { remove: { images: true } }, expectedRemove: false },
        { htmlPath: CONTAINS_STRING_1, configOptions: { remove: { images: true } }, expectedRemove: false },
        { htmlPath: LINKED_CONDITIONS, configOptions: { remove: { images: true } }, expectedRemove: true },

        // Tests for videos
        { htmlPath: UNLIKED, configOptions: { remove: { videos: true } }, expectedRemove: false },
        { htmlPath: UNCOMMENTED, configOptions: { remove: { videos: true } }, expectedRemove: false },
        { htmlPath: TEXT, configOptions: { remove: { videos: true } }, expectedRemove: false },
        { htmlPath: MESSAGE, configOptions: { remove: { videos: true } }, expectedRemove: false },
        { htmlPath: IMAGES, configOptions: { remove: { videos: true } }, expectedRemove: false },
        { htmlPath: VIDEOS, configOptions: { remove: { videos: true } }, expectedRemove: true },
        { htmlPath: VIDEOS_YOUTUBE, configOptions: { remove: { videos: true } }, expectedRemove: true },
        { htmlPath: CONTAINS_STRING_1, configOptions: { remove: { videos: true } }, expectedRemove: false },
        { htmlPath: LINKED_CONDITIONS, configOptions: { remove: { videos: true } }, expectedRemove: false },

        // Tests for containsStrings
        { htmlPath: UNLIKED, configOptions: { remove: { containsStrings: ['string1'] } }, expectedRemove: false },
        { htmlPath: UNCOMMENTED, configOptions: { remove: { containsStrings: ['string1'] } }, expectedRemove: false },
        { htmlPath: TEXT, configOptions: { remove: { containsStrings: ['string1'] } }, expectedRemove: false },
        { htmlPath: MESSAGE, configOptions: { remove: { containsStrings: ['string1'] } }, expectedRemove: false },
        { htmlPath: IMAGES, configOptions: { remove: { containsStrings: ['string1'] } }, expectedRemove: false },
        { htmlPath: VIDEOS, configOptions: { remove: { containsStrings: ['string1'] } }, expectedRemove: false },
        { htmlPath: CONTAINS_STRING_1, configOptions: { remove: { containsStrings: ['string1'] } }, expectedRemove: true },
        { htmlPath: CONTAINS_STRING_1, configOptions: { remove: { containsStrings: ['string1'] }, options: { caseSensitive: true } }, expectedRemove: false },
        { htmlPath: CONTAINS_STRING_1, configOptions: { remove: { containsStrings: ['String1'] }, options: { caseSensitive: true } }, expectedRemove: true },
        { htmlPath: CONTAINS_STRING_1, configOptions: { remove: { containsStrings: [['string1']] } }, expectedRemove: true },
        { htmlPath: CONTAINS_STRING_1, configOptions: { remove: { containsStrings: [['string1', 'string2']] } }, expectedRemove: false },
        { htmlPath: CONTAINS_STRING_1, configOptions: { remove: { containsStrings: [['string1'], ['string2']] } }, expectedRemove: true },
        { htmlPath: CONTAINS_STRING_1, configOptions: { remove: { containsStrings: [['string1', 'string2'], ['string2']] } }, expectedRemove: false },
        { htmlPath: CONTAINS_STRING_2, configOptions: { remove: { containsStrings: ['string1'] } }, expectedRemove: false },
        { htmlPath: CONTAINS_STRINGS, configOptions: { remove: { containsStrings: ['string1'] } }, expectedRemove: true },
        { htmlPath: CONTAINS_STRINGS, configOptions: { remove: { containsStrings: [['string1', 'string2']] } }, expectedRemove: true },
        { htmlPath: LINKED_CONDITIONS, configOptions: { remove: { containsStrings: ['string1'] } }, expectedRemove: false },

        // Tests for notContainsStrings
        { htmlPath: UNLIKED, configOptions: { remove: { notContainsStrings: ['string1'] } }, expectedRemove: true },
        { htmlPath: UNCOMMENTED, configOptions: { remove: { notContainsStrings: ['string1'] } }, expectedRemove: true },
        { htmlPath: TEXT, configOptions: { remove: { notContainsStrings: ['string1'] } }, expectedRemove: true },
        { htmlPath: MESSAGE, configOptions: { remove: { notContainsStrings: ['string1'] } }, expectedRemove: true },
        { htmlPath: IMAGES, configOptions: { remove: { notContainsStrings: ['string1'] } }, expectedRemove: true },
        { htmlPath: VIDEOS, configOptions: { remove: { notContainsStrings: ['string1'] } }, expectedRemove: true },
        { htmlPath: CONTAINS_STRING_1, configOptions: { remove: { notContainsStrings: ['string1'] } }, expectedRemove: false },
        { htmlPath: CONTAINS_STRING_1, configOptions: { remove: { notContainsStrings: ['string1'] }, options: { caseSensitive: true } }, expectedRemove: true },
        { htmlPath: CONTAINS_STRING_1, configOptions: { remove: { notContainsStrings: ['String1'] }, options: { caseSensitive: true } }, expectedRemove: false },
        { htmlPath: CONTAINS_STRING_2, configOptions: { remove: { notContainsStrings: ['string1'] } }, expectedRemove: true },
        { htmlPath: CONTAINS_STRING_2, configOptions: { remove: { notContainsStrings: [['string1']] } }, expectedRemove: true },
        { htmlPath: CONTAINS_STRING_2, configOptions: { remove: { notContainsStrings: [['string1', 'string2']] } }, expectedRemove: true },
        { htmlPath: CONTAINS_STRING_2, configOptions: { remove: { notContainsStrings: [['string1'], ['string2']] } }, expectedRemove: false },
        { htmlPath: CONTAINS_STRING_2, configOptions: { remove: { notContainsStrings: [['string1', 'string2'], ['string1']] } }, expectedRemove: true },
        { htmlPath: CONTAINS_STRINGS, configOptions: { remove: { notContainsStrings: ['string1'] } }, expectedRemove: false },
        { htmlPath: CONTAINS_STRINGS, configOptions: { remove: { notContainsStrings: [['string1', 'string2']] } }, expectedRemove: false },
        { htmlPath: LINKED_CONDITIONS, configOptions: { remove: { notContainsStrings: ['string1'] } }, expectedRemove: true },

        // Tests for linkedConditions
        { htmlPath: UNLIKED, configOptions: { options: { linkedConditions: [['images', 'unliked']] } }, expectedRemove: false },
        { htmlPath: UNCOMMENTED, configOptions: { options: { linkedConditions: [['images', 'unliked']] } }, expectedRemove: false },
        { htmlPath: TEXT, configOptions: { options: { linkedConditions: [['images', 'unliked']] } }, expectedRemove: false },
        { htmlPath: MESSAGE, configOptions: { options: { linkedConditions: [['images', 'unliked']] } }, expectedRemove: false },
        { htmlPath: IMAGES, configOptions: { options: { linkedConditions: [['images', 'unliked']] } }, expectedRemove: false },
        { htmlPath: VIDEOS, configOptions: { options: { linkedConditions: [['images', 'unliked']] } }, expectedRemove: false },
        { htmlPath: CONTAINS_STRING_1, configOptions: { options: { linkedConditions: [['images', 'unliked']] } }, expectedRemove: false },
        { htmlPath: CONTAINS_STRING_1, configOptions: { options: { linkedConditions: ['images', 'unliked'] } }, expectedRemove: false },
        { htmlPath: LINKED_CONDITIONS, configOptions: { options: { linkedConditions: [['images', 'unliked']] } }, expectedRemove: true },
        { htmlPath: LINKED_CONDITIONS, configOptions: { options: { linkedConditions: ['images', 'unliked'] } }, expectedRemove: true },
    ];

    runTestCases(testCases);
});
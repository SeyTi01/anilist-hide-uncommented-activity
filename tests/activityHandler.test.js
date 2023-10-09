const fs = require('fs');
const jsdom = require('jsdom');
const { expect } = require('chai');
const { ActivityHandler, config } = require('../src/hideUnwantedActivity.user');
const { restore, spy } = require("sinon");

const TEST_DATA_PATH = './tests/data/';
const UNLIKED = `${TEST_DATA_PATH}activity-unliked.html`;
const UNCOMMENTED = `${TEST_DATA_PATH}activity-uncommented.html`;
const IMAGES = `${TEST_DATA_PATH}activity-images.html`;
const VIDEOS = `${TEST_DATA_PATH}activity-videos.html`;
const CUSTOM_STRINGS = `${TEST_DATA_PATH}activity-customStrings.html`;
const LINKED_CONDITIONS = `${TEST_DATA_PATH}activity-linkedConditions.html`;

describe('removeEntry', function () {
    let activityHandler;

    beforeEach(function () {
        activityHandler = new ActivityHandler();
        Object.assign(config, {
            remove: {
                uncommented: false,
                unliked: false,
                images: false,
                videos: false,
                customStrings: [],
                caseSensitive: false,
            },
            linkedConditions: [[]]
        });
    });

    function runTestCases(testCases) {
        testCases.forEach((testCase) => {
            const { htmlPath, configOptions, expectedRemove } = testCase;
            let nodeType = '';

            if (htmlPath.includes('unliked')) {
                nodeType = 'unliked';
            } else if (htmlPath.includes('uncommented')) {
                nodeType = 'uncommented';
            } else if (htmlPath.includes('images')) {
                nodeType = 'images';
            } else if (htmlPath.includes('videos')) {
                nodeType = 'videos';
            } else if (htmlPath.includes('customStrings')) {
                nodeType = 'customStrings';
            } else if (htmlPath.includes('linkedConditions')) {
                nodeType = 'linkedConditions';
            }

            it(`should ${expectedRemove ? '' : 'not '}remove ${nodeType} node with config: ${JSON.stringify(configOptions)}`, function (done) {
                fs.readFile(htmlPath, 'utf8', function (err, htmlContent) {
                    if (err) throw err;

                    const mergedConfig = Object.assign({}, config, configOptions);
                    Object.assign(config, mergedConfig);
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
        { htmlPath: IMAGES, configOptions: { remove: { unliked: true } }, expectedRemove: false },
        { htmlPath: VIDEOS, configOptions: { remove: { unliked: true } }, expectedRemove: false },
        { htmlPath: CUSTOM_STRINGS, configOptions: { remove: { unliked: true } }, expectedRemove: false },
        { htmlPath: LINKED_CONDITIONS, configOptions: { remove: { unliked: true } }, expectedRemove: true },

        // Tests for uncommented
        { htmlPath: UNLIKED, configOptions: { remove: { uncommented: true } }, expectedRemove: false },
        { htmlPath: UNCOMMENTED, configOptions: { remove: { uncommented: true } }, expectedRemove: true },
        { htmlPath: IMAGES, configOptions: { remove: { uncommented: true } }, expectedRemove: false },
        { htmlPath: VIDEOS, configOptions: { remove: { uncommented: true } }, expectedRemove: false },
        { htmlPath: CUSTOM_STRINGS, configOptions: { remove: { uncommented: true } }, expectedRemove: false },
        { htmlPath: LINKED_CONDITIONS, configOptions: { remove: { uncommented: true } }, expectedRemove: false },

        // Tests for images
        { htmlPath: UNLIKED, configOptions: { remove: { images: true } }, expectedRemove: false },
        { htmlPath: UNCOMMENTED, configOptions: { remove: { images: true } }, expectedRemove: false },
        { htmlPath: IMAGES, configOptions: { remove: { images: true } }, expectedRemove: true },
        { htmlPath: VIDEOS, configOptions: { remove: { images: true } }, expectedRemove: false },
        { htmlPath: CUSTOM_STRINGS, configOptions: { remove: { images: true } }, expectedRemove: false },
        { htmlPath: LINKED_CONDITIONS, configOptions: { remove: { images: true } }, expectedRemove: true },

        // Tests for videos
        { htmlPath: UNLIKED, configOptions: { remove: { videos: true } }, expectedRemove: false },
        { htmlPath: UNCOMMENTED, configOptions: { remove: { videos: true } }, expectedRemove: false },
        { htmlPath: IMAGES, configOptions: { remove: { videos: true } }, expectedRemove: false },
        { htmlPath: VIDEOS, configOptions: { remove: { videos: true } }, expectedRemove: true },
        { htmlPath: CUSTOM_STRINGS, configOptions: { remove: { videos: true } }, expectedRemove: false },
        { htmlPath: LINKED_CONDITIONS, configOptions: { remove: { videos: true } }, expectedRemove: false },

        // Tests for customStrings
        { htmlPath: UNLIKED, configOptions: { remove: { customStrings: ['custom string'] } }, expectedRemove: false },
        { htmlPath: UNCOMMENTED, configOptions: { remove: { customStrings: ['custom string'] } }, expectedRemove: false },
        { htmlPath: IMAGES, configOptions: { remove: { customStrings: ['custom string'] } }, expectedRemove: false },
        { htmlPath: VIDEOS, configOptions: { remove: { customStrings: ['custom string'] } }, expectedRemove: false },
        { htmlPath: CUSTOM_STRINGS, configOptions: { remove: { customStrings: ['custom string'] } }, expectedRemove: true },
        { htmlPath: CUSTOM_STRINGS, configOptions: { remove: { customStrings: ['custom string'], caseSensitive: true } }, expectedRemove: false },
        { htmlPath: CUSTOM_STRINGS, configOptions: { remove: { customStrings: ['Custom String'], caseSensitive: true } }, expectedRemove: true },
        { htmlPath: LINKED_CONDITIONS, configOptions: { remove: { customStrings: ['custom string'] } }, expectedRemove: false },

        // Tests for linkedConditions
        { htmlPath: UNLIKED, configOptions: { linkedConditions: [['images', 'unliked']] }, expectedRemove: false },
        { htmlPath: UNCOMMENTED, configOptions: { linkedConditions: [['images', 'unliked']] }, expectedRemove: false },
        { htmlPath: IMAGES, configOptions: { linkedConditions: [['images', 'unliked']] }, expectedRemove: false },
        { htmlPath: VIDEOS, configOptions: { linkedConditions: [['images', 'unliked']] }, expectedRemove: false },
        { htmlPath: CUSTOM_STRINGS, configOptions: { linkedConditions: [['images', 'unliked']] }, expectedRemove: false },
        { htmlPath: LINKED_CONDITIONS, configOptions: { linkedConditions: [['images', 'unliked']] }, expectedRemove: true },
    ];

    runTestCases(testCases);

    afterEach(function () {
        activityHandler.resetState();
        restore();
    });
});
const fs = require('fs');
const jsdom = require('jsdom');
const { expect } = require('chai');
const { ActivityHandler, config } = require('../src/hideUnwantedActivity.user');
const { restore, spy } = require("sinon");

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

            it(`should ${expectedRemove ? '' : 'not '}remove node with config: ${JSON.stringify(configOptions)}`, function (done) {
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
        { htmlPath: './tests/data/activity-unliked.html', configOptions: { remove: { unliked: true } }, expectedRemove: true },
        { htmlPath: './tests/data/activity-uncommented.html', configOptions: { remove: { unliked: true } }, expectedRemove: false },
        { htmlPath: './tests/data/activity-images.html', configOptions: { remove: { unliked: true } }, expectedRemove: false },
        { htmlPath: './tests/data/activity-videos.html', configOptions: { remove: { unliked: true } }, expectedRemove: false },
        { htmlPath: './tests/data/activity-customStrings.html', configOptions: { remove: { unliked: true } }, expectedRemove: false },
        { htmlPath: './tests/data/activity-linkedConditions.html', configOptions: { remove: { unliked: true } }, expectedRemove: true },

        // Tests for uncommented
        { htmlPath: './tests/data/activity-unliked.html', configOptions: { remove: { uncommented: true } }, expectedRemove: false },
        { htmlPath: './tests/data/activity-uncommented.html', configOptions: { remove: { uncommented: true } }, expectedRemove: true },
        { htmlPath: './tests/data/activity-images.html', configOptions: { remove: { uncommented: true } }, expectedRemove: false },
        { htmlPath: './tests/data/activity-videos.html', configOptions: { remove: { uncommented: true } }, expectedRemove: false },
        { htmlPath: './tests/data/activity-customStrings.html', configOptions: { remove: { uncommented: true } }, expectedRemove: false },
        { htmlPath: './tests/data/activity-linkedConditions.html', configOptions: { remove: { uncommented: true } }, expectedRemove: false },

        // Tests for images
        { htmlPath: './tests/data/activity-unliked.html', configOptions: { remove: { images: true } }, expectedRemove: false },
        { htmlPath: './tests/data/activity-uncommented.html', configOptions: { remove: { images: true } }, expectedRemove: false },
        { htmlPath: './tests/data/activity-images.html', configOptions: { remove: { images: true } }, expectedRemove: true },
        { htmlPath: './tests/data/activity-videos.html', configOptions: { remove: { images: true } }, expectedRemove: false },
        { htmlPath: './tests/data/activity-customStrings.html', configOptions: { remove: { images: true } }, expectedRemove: false },
        { htmlPath: './tests/data/activity-linkedConditions.html', configOptions: { remove: { images: true } }, expectedRemove: true },

        // Tests for videos
        { htmlPath: './tests/data/activity-unliked.html', configOptions: { remove: { videos: true } }, expectedRemove: false },
        { htmlPath: './tests/data/activity-uncommented.html', configOptions: { remove: { videos: true } }, expectedRemove: false },
        { htmlPath: './tests/data/activity-images.html', configOptions: { remove: { videos: true } }, expectedRemove: false },
        { htmlPath: './tests/data/activity-videos.html', configOptions: { remove: { videos: true } }, expectedRemove: true },
        { htmlPath: './tests/data/activity-customStrings.html', configOptions: { remove: { videos: true } }, expectedRemove: false },
        { htmlPath: './tests/data/activity-linkedConditions.html', configOptions: { remove: { videos: true } }, expectedRemove: false },

        // Tests for customStrings
        { htmlPath: './tests/data/activity-unliked.html', configOptions: { remove: { customStrings: ['custom string'] } }, expectedRemove: false },
        { htmlPath: './tests/data/activity-uncommented.html', configOptions: { remove: { customStrings: ['custom string'] } }, expectedRemove: false },
        { htmlPath: './tests/data/activity-images.html', configOptions: { remove: { customStrings: ['custom string'] } }, expectedRemove: false },
        { htmlPath: './tests/data/activity-videos.html', configOptions: { remove: { customStrings: ['custom string'] } }, expectedRemove: false },
        { htmlPath: './tests/data/activity-customStrings.html', configOptions: { remove: { customStrings: ['custom string'] } }, expectedRemove: true },
        { htmlPath: './tests/data/activity-customStrings.html', configOptions: { remove: { customStrings: ['custom string'] } }, expectedRemove: true },
        { htmlPath: './tests/data/activity-linkedConditions.html', configOptions: { remove: { customStrings: ['custom string'] } }, expectedRemove: false },

        // Tests for linkedConditions
        { htmlPath: './tests/data/activity-unliked.html', configOptions: { linkedConditions: [['images', 'unliked']] }, expectedRemove: false },
        { htmlPath: './tests/data/activity-uncommented.html', configOptions: { linkedConditions: [['images', 'unliked']] }, expectedRemove: false },
        { htmlPath: './tests/data/activity-images.html', configOptions: { linkedConditions: [['images', 'unliked']] }, expectedRemove: false },
        { htmlPath: './tests/data/activity-videos.html', configOptions: { linkedConditions: [['images', 'unliked']] }, expectedRemove: false },
        { htmlPath: './tests/data/activity-customStrings.html', configOptions: { linkedConditions: [['images', 'unliked']] }, expectedRemove: false },
        { htmlPath: './tests/data/activity-linkedConditions.html', configOptions: { linkedConditions: [['images', 'unliked']] }, expectedRemove: true },
    ];

    runTestCases(testCases);

    afterEach(function () {
        activityHandler.resetState();
        restore();
    });
});
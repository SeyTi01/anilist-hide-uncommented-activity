const fs = require('fs');
const jsdom = require('jsdom');
const { expect } = require('chai');
const { ActivityHandler, config } = require('../src/hideUnwantedActivity.user');
const { restore, spy } = require("sinon");

describe('removeEntry', function () {
    let activityHandler;

    beforeEach(function () {
        activityHandler = new ActivityHandler();
    });

    function runTestCases(testCases) {
        testCases.forEach((testCase) => {
            const { htmlPath, configOptions, expectedRemoveCalled } = testCase;

            it(`should ${expectedRemoveCalled ? '' : 'not '}remove node with config: ${JSON.stringify(configOptions)}`, function (done) {
                fs.readFile(htmlPath, 'utf8', function (err, htmlContent) {
                    if (err) throw err;

                    Object.assign(config, configOptions);
                    const dom = new jsdom.JSDOM(htmlContent);
                    const node = dom.window.document.body.firstChild;
                    const removeSpy = spy(node, 'remove');
                    activityHandler.removeEntry(node);

                    expect(removeSpy.calledOnce).to.equal(expectedRemoveCalled);
                    done();
                });
            });
        });
    }

    const testCases = [
        // Tests for unliked
        { htmlPath: './tests/data/activity-unliked.html', configOptions: { remove: { unliked: true, uncommented: false } }, expectedRemoveCalled: true },
        { htmlPath: './tests/data/activity-uncommented.html', configOptions: { remove: { unliked: true, uncommented: false } }, expectedRemoveCalled: false },
        { htmlPath: './tests/data/activity-images.html', configOptions: { remove: { unliked: true, uncommented: false } }, expectedRemoveCalled: false },
        { htmlPath: './tests/data/activity-videos.html', configOptions: { remove: { unliked: true, uncommented: false } }, expectedRemoveCalled: false },
        { htmlPath: './tests/data/activity-customStrings.html', configOptions: { remove: { unliked: true, uncommented: false } }, expectedRemoveCalled: false },
        { htmlPath: './tests/data/activity-linkedConditions.html', configOptions: { remove: { unliked: true, uncommented: false } }, expectedRemoveCalled: true },

        // Tests for uncommented
        { htmlPath: './tests/data/activity-unliked.html', configOptions: { remove: { uncommented: true } }, expectedRemoveCalled: false },
        { htmlPath: './tests/data/activity-uncommented.html', configOptions: { remove: { uncommented: true } }, expectedRemoveCalled: true },
        { htmlPath: './tests/data/activity-images.html', configOptions: { remove: { uncommented: true } }, expectedRemoveCalled: false },
        { htmlPath: './tests/data/activity-videos.html', configOptions: { remove: { uncommented: true } }, expectedRemoveCalled: false },
        { htmlPath: './tests/data/activity-customStrings.html', configOptions: { remove: { uncommented: true } }, expectedRemoveCalled: false },
        { htmlPath: './tests/data/activity-linkedConditions.html', configOptions: { remove: { uncommented: true } }, expectedRemoveCalled: false },

        // Tests for images
        { htmlPath: './tests/data/activity-unliked.html', configOptions: { remove: { images: true, uncommented: false } }, expectedRemoveCalled: false },
        { htmlPath: './tests/data/activity-uncommented.html', configOptions: { remove: { images: true, uncommented: false } }, expectedRemoveCalled: false },
        { htmlPath: './tests/data/activity-images.html', configOptions: { remove: { images: true, uncommented: false } }, expectedRemoveCalled: true },
        { htmlPath: './tests/data/activity-videos.html', configOptions: { remove: { images: true, uncommented: false } }, expectedRemoveCalled: false },
        { htmlPath: './tests/data/activity-customStrings.html', configOptions: { remove: { images: true, uncommented: false } }, expectedRemoveCalled: false },
        { htmlPath: './tests/data/activity-linkedConditions.html', configOptions: { remove: { images: true, uncommented: false } }, expectedRemoveCalled: true },

        // Tests for videos
        { htmlPath: './tests/data/activity-unliked.html', configOptions: { remove: { videos: true, uncommented: false } }, expectedRemoveCalled: false },
        { htmlPath: './tests/data/activity-uncommented.html', configOptions: { remove: { videos: true, uncommented: false } }, expectedRemoveCalled: false },
        { htmlPath: './tests/data/activity-images.html', configOptions: { remove: { videos: true, uncommented: false } }, expectedRemoveCalled: false },
        { htmlPath: './tests/data/activity-videos.html', configOptions: { remove: { videos: true, uncommented: false } }, expectedRemoveCalled: true },
        { htmlPath: './tests/data/activity-customStrings.html', configOptions: { remove: { videos: true, uncommented: false } }, expectedRemoveCalled: false },
        { htmlPath: './tests/data/activity-linkedConditions.html', configOptions: { remove: { videos: true, uncommented: false } }, expectedRemoveCalled: false },

        // Tests for customStrings
        { htmlPath: './tests/data/activity-unliked.html', configOptions: { remove: { customStrings: ['custom string'], uncommented: false } }, expectedRemoveCalled: false },
        { htmlPath: './tests/data/activity-uncommented.html', configOptions: { remove: { customStrings: ['custom string'], uncommented: false } }, expectedRemoveCalled: false },
        { htmlPath: './tests/data/activity-images.html', configOptions: { remove: { customStrings: ['custom string'], uncommented: false } }, expectedRemoveCalled: false },
        { htmlPath: './tests/data/activity-videos.html', configOptions: { remove: { customStrings: ['custom string'], uncommented: false } }, expectedRemoveCalled: false },
        { htmlPath: './tests/data/activity-customStrings.html', configOptions: { remove: { customStrings: ['custom string'], uncommented: false } }, expectedRemoveCalled: true },
        { htmlPath: './tests/data/activity-linkedConditions.html', configOptions: { remove: { customStrings: ['custom string'], uncommented: false } }, expectedRemoveCalled: false },

        // Tests for linkedConditions
        { htmlPath: './tests/data/activity-unliked.html', configOptions: { remove: { uncommented: false }, linkedConditions: [['images', 'unliked']] }, expectedRemoveCalled: false },
        { htmlPath: './tests/data/activity-uncommented.html', configOptions: { remove: { uncommented: false }, linkedConditions: [['images', 'unliked']] }, expectedRemoveCalled: false },
        { htmlPath: './tests/data/activity-images.html', configOptions: { remove: { uncommented: false }, linkedConditions: [['images', 'unliked']] }, expectedRemoveCalled: false },
        { htmlPath: './tests/data/activity-videos.html', configOptions: { remove: { uncommented: false }, linkedConditions: [['images', 'unliked']] }, expectedRemoveCalled: false },
        { htmlPath: './tests/data/activity-customStrings.html', configOptions: { remove: { uncommented: false }, linkedConditions: [['images', 'unliked']] }, expectedRemoveCalled: false },
        { htmlPath: './tests/data/activity-linkedConditions.html', configOptions: { remove: { uncommented: false }, linkedConditions: [['images', 'unliked']] }, expectedRemoveCalled: true },
    ];

    runTestCases(testCases);

    afterEach(function () {
        activityHandler.resetState();
        restore();
    });
});
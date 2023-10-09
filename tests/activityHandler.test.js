const fs = require('fs');
const jsdom = require('jsdom');
const { expect} = require('chai');
const { ActivityHandler, config } = require('../src/hideUnwantedActivity.user');
const {restore, spy} = require("sinon");

describe('removeEntry', function() {
    let activityHandler;

    beforeEach(function() {
        activityHandler = new ActivityHandler();
    });

    it('should remove node if it is unliked and remove.unliked is true', function(done) {
        fs.readFile('./tests/data/activity-unliked.html', 'utf8', function(err, htmlContent) {
            if (err) throw err;
            config.remove.unliked = true;
            const dom = new jsdom.JSDOM(htmlContent);
            const node = dom.window.document.body.firstChild;
            const removeSpy = spy(node, 'remove');
            activityHandler.removeEntry(node);

            expect(removeSpy.calledOnce).to.be.true;
            expect(activityHandler.currentLoadCount).to.equal(0);
            done();
        });
    });

    afterEach(function() {
        activityHandler.resetState();
        restore();
    });
});
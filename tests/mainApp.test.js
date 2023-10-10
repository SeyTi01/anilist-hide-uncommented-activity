const { MainApp, SELECTORS } = require("../src/hideUnwantedActivity.user");
const sinon = require('sinon');
const expect = require('chai').expect;
const { JSDOM } = require('jsdom');
const { document } = new JSDOM('<!doctype html><html><body></body></html>').window;

global.window = new JSDOM('<!doctype html><html><body></body></html>').window;
global.HTMLElement = document.defaultView.HTMLElement;

describe('MainApp', () => {
    let mainApp;
    let activityHandler;
    let uiHandler;

    beforeEach(() => {
        activityHandler = {
            removeEntry: () => {},
            resetState: () => {}
        };
        uiHandler = { setLoadMore: () => {}, clickLoadMore: () => {}, userPressed: true, resetState: () => {} };
        mainApp = new MainApp(activityHandler, uiHandler);
    });

    describe('observeMutations', () => {
        it('should call handleAddedNode and loadMoreOrReset if URL is allowed', () => {
            const mutations = [{ addedNodes: [document.createElement('div')] }];
            const handleAddedNodeSpy = sinon.spy(mainApp, 'handleAddedNode');
            const loadMoreOrResetSpy = sinon.spy(mainApp, 'loadMoreOrReset');
            const isAllowedUrlStub = sinon.stub(mainApp, 'isAllowedUrl').returns(true);

            mainApp.observeMutations(mutations);

            expect(handleAddedNodeSpy.calledOnce).to.be.true;
            expect(loadMoreOrResetSpy.calledOnce).to.be.true;
            expect(isAllowedUrlStub.calledOnce).to.be.true;

            sinon.restore();
        });

        it('should not call handleAddedNode and loadMoreOrReset if URL is not allowed', () => {
            const mutations = [{ addedNodes: [document.createElement('div')] }];
            const handleAddedNodeSpy = sinon.spy(mainApp, 'handleAddedNode');
            const loadMoreOrResetSpy = sinon.spy(mainApp, 'loadMoreOrReset');
            const isAllowedUrlStub = sinon.stub(mainApp, 'isAllowedUrl').returns(false);

            mainApp.observeMutations(mutations);

            expect(handleAddedNodeSpy.called).to.be.false;
            expect(loadMoreOrResetSpy.called).to.be.false;
            expect(isAllowedUrlStub.calledOnce).to.be.true;

            sinon.restore();
        });
    });

    describe('handleAddedNode', () => {
        it('should call activityHandler.removeEntry if node matches SELECTORS.div.activity', () => {
            const node = document.createElement('div');
            node.classList.add(SELECTORS.div.activity);
            const removeEntrySpy = sinon.spy(activityHandler, 'removeEntry');

            mainApp.handleAddedNode(node);

            expect(removeEntrySpy.calledOnce).to.be.true;

            sinon.restore();
        });

        it('should call uiHandler.setLoadMore if node matches SELECTORS.div.button', () => {
            const node = document.createElement('div');
            node.classList.add(SELECTORS.div.button);
            const setLoadMoreSpy = sinon.spy(uiHandler, 'setLoadMore');

            mainApp.handleAddedNode(node);

            expect(setLoadMoreSpy.calledOnce).to.be.true;

            sinon.restore();
        });
    });

    describe('loadMoreOrReset', () => {
        it('should call ui.clickLoadMore if currentLoadCount < config.targetLoadCount and userPressed is true', () => {
            uiHandler.currentLoadCount = 0;
            uiHandler.targetLoadCount = 10;

            const clickLoadMoreSpy = sinon.spy(uiHandler, 'clickLoadMore');

            mainApp.loadMoreOrReset();

            expect(clickLoadMoreSpy.calledOnce).to.be.true;

            sinon.restore();
        });

        it('should call ac.resetState and ui.resetState if currentLoadCount >= config.targetLoadCount or userPressed is false', () => {
            uiHandler.currentLoadCount = 10;
            uiHandler.targetLoadCount = 10;
            uiHandler.userPressed = false;

            const resetStateMock = sinon.stub();

            mainApp.ac.resetState = resetStateMock;
            mainApp.ui.resetState = resetStateMock;

            mainApp.loadMoreOrReset();

            expect(resetStateMock.calledTwice).to.be.true;

            sinon.restore();
        });
    });

    /*describe('isAllowedUrl', () => {
        it('should return true if window.location.href matches any of the allowed patterns in URLS object', () => {
            window.history.pushState({}, '', '/home');
            expect(mainApp.isAllowedUrl()).to.equal(true);

            window.history.pushState({}, '', '/user/12345/');
            expect(mainApp.isAllowedUrl()).to.equal(true);

            window.history.pushState({}, '', '/username/social');
            expect(mainApp.isAllowedUrl()).to.equal(true);
        });

        it('should return false if window.location.href does not match any of the allowed patterns in URLS object', () => {
            window.history.pushState({}, '', '/anime/12345/');
            expect(mainApp.isAllowedUrl()).to.equal(false);
        });
    });*/
});
const { MainApp, SELECTORS } = require("../src/hideUnwantedActivity.user");
const sinon = require('sinon');
const expect = require('chai').expect;
const { JSDOM } = require('jsdom');
const jsdom = new JSDOM('<!doctype html><html lang="en"><body></body></html>');
global.window = jsdom.window;
global.document = jsdom.window.document;
global.HTMLElement = jsdom.window.HTMLElement;

describe('MainApp', () => {
    let mainApp;
    let activityHandler;
    let uiHandler;

    beforeEach(() => {
        activityHandler = {
            removeEntry: () => {},
            resetState: () => {}
        };

        uiHandler = {
            setLoadMore: () => {},
            clickLoadMore: () => {},
            userPressed: true,
            resetState: () => {} };

        const testConfig = {
            targetLoadCount: 10,
            runOn: {
                home: false,
                social: false,
                profile: false,
            },
        };

        mainApp = new MainApp(activityHandler, uiHandler, testConfig);
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
        it('should call ac.removeEntry when an activity node is added', () => {
            const activityNode = document.createElement('div');
            activityNode.classList.add('activity-entry');
            const removeEntrySpy = sinon.spy(mainApp.ac, 'removeEntry');

            mainApp.handleAddedNode(activityNode);

            expect(removeEntrySpy.calledOnce).to.be.true;

            sinon.restore();
        });

        it('should call ui.setLoadMore when a button node is added', () => {
            const buttonNode = document.createElement('div');
            buttonNode.classList.add('load-more');
            const setLoadMoreSpy = sinon.spy(mainApp.ui, 'setLoadMore');

            mainApp.handleAddedNode(buttonNode);

            expect(setLoadMoreSpy.calledOnce).to.be.true;

            sinon.restore();
        });

        it('should not call ac.removeEntry or ui.setLoadMore for other node types', () => {
            const otherNode = document.createElement('div');
            const removeEntrySpy = sinon.spy(mainApp.ac, 'removeEntry');
            const setLoadMoreSpy = sinon.spy(mainApp.ui, 'setLoadMore');

            mainApp.handleAddedNode(otherNode);

            expect(removeEntrySpy.called).to.be.false;
            expect(setLoadMoreSpy.called).to.be.false;

            sinon.restore();
        });
    });

    describe('loadMoreOrReset', () => {
        it('should call ui.clickLoadMore if currentLoadCount < targetLoadCount and userPressed is true', () => {
            mainApp.ac.currentLoadCount = 5;
            uiHandler.userPressed = true;

            const clickLoadMoreSpy = sinon.spy(mainApp.ui, 'clickLoadMore');

            mainApp.loadMoreOrReset();

            expect(clickLoadMoreSpy.calledOnce).to.be.true;

            sinon.restore();
        });

        it('should call ac.resetState and ui.resetState if currentLoadCount is equal to targetLoadCount and userPressed is true', () => {
            activityHandler.currentLoadCount = 10;
            uiHandler.userPressed = true;

            const resetStateSpy = sinon.spy(mainApp.ac, 'resetState');
            const uiResetStateSpy = sinon.spy(mainApp.ui, 'resetState');

            mainApp.loadMoreOrReset();

            expect(resetStateSpy.calledOnce).to.be.true;
            expect(uiResetStateSpy.calledOnce).to.be.true;

            sinon.restore();
        });

        it('should call ac.resetState and ui.resetState if currentLoadCount >= config.targetLoadCount or userPressed is false', () => {
            activityHandler.currentLoadCount = 10;
            uiHandler.userPressed = false;

            const resetStateMock = sinon.stub();

            mainApp.ac.resetState = resetStateMock;
            mainApp.ui.resetState = resetStateMock;

            mainApp.loadMoreOrReset();

            expect(resetStateMock.calledTwice).to.be.true;

            sinon.restore();
        });

        it('should call ac.resetState and ui.resetState if userPressed is false, regardless of currentLoadCount', () => {
            activityHandler.currentLoadCount = 5;
            uiHandler.userPressed = false;

            const resetStateSpy = sinon.spy(mainApp.ac, 'resetState');
            const uiResetStateSpy = sinon.spy(mainApp.ui, 'resetState');

            mainApp.loadMoreOrReset();

            expect(resetStateSpy.calledOnce).to.be.true;
            expect(uiResetStateSpy.calledOnce).to.be.true;

            sinon.restore();
        });
    });
});
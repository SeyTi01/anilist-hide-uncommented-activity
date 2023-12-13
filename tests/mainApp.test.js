const MainApp = require("../src/activityFeedFilter.user").MainApp;
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
            removeEntry: sinon.spy(),
            resetState: sinon.spy(),
            currentLoadCount: 0,
        };

        uiHandler = {
            setLoadMore: sinon.spy(),
            clickLoadMore: sinon.spy(),
            userPressed: true,
            resetState: sinon.spy(),
        };

        mainApp = new MainApp(activityHandler, uiHandler, {
            options: {
                targetLoadCount: 10,
            },
            runOn: {
                home: false,
                social: false,
                profile: false,
                homeNoUser: false,
            },
        });
    });

    describe('observeMutations', () => {
        it('should call handleAddedNode and loadMoreOrReset if URL is allowed', () => {
            const mutations = [{ addedNodes: [document.createElement('div')] }];
            const isAllowedUrlStub = sinon.stub(mainApp, 'isAllowedUrl').returns(true);
            const handleAddedNodeSpy = sinon.spy(mainApp, 'handleAddedNode');
            const loadMoreOrResetSpy = sinon.spy(mainApp, 'loadMoreOrReset');

            mainApp.observeMutations(mutations);

            expect(isAllowedUrlStub.calledOnce).to.be.true;
            expect(handleAddedNodeSpy.calledOnce).to.be.true;
            expect(loadMoreOrResetSpy.calledOnce).to.be.true;

            isAllowedUrlStub.restore();
            handleAddedNodeSpy.restore();
            loadMoreOrResetSpy.restore();
        });

        it('should not call handleAddedNode and loadMoreOrReset if URL is not allowed', () => {
            const mutations = [{ addedNodes: [document.createElement('div')] }];
            const isAllowedUrlStub = sinon.stub(mainApp, 'isAllowedUrl').returns(false);
            const handleAddedNodeSpy = sinon.spy(mainApp, 'handleAddedNode');
            const loadMoreOrResetSpy = sinon.spy(mainApp, 'loadMoreOrReset');

            mainApp.observeMutations(mutations);

            expect(isAllowedUrlStub.calledOnce).to.be.true;
            expect(handleAddedNodeSpy.called).to.be.false;
            expect(loadMoreOrResetSpy.called).to.be.false;

            isAllowedUrlStub.restore();
            handleAddedNodeSpy.restore();
            loadMoreOrResetSpy.restore();
        });
    });

    describe('handleAddedNode', () => {
        it('should call ac.removeEntry when an activity node is added', () => {
            const activityNode = document.createElement('div');
            activityNode.classList.add('activity-entry');

            mainApp.handleAddedNode(activityNode);

            expect(activityHandler.removeEntry.calledOnce).to.be.true;
        });

        it('should call ui.setLoadMore when a button node is added', () => {
            const buttonNode = document.createElement('div');
            buttonNode.classList.add('load-more');

            mainApp.handleAddedNode(buttonNode);

            expect(uiHandler.setLoadMore.calledOnce).to.be.true;
        });

        it('should not call ac.removeEntry or ui.setLoadMore for other node types', () => {
            const otherNode = document.createElement('div');

            mainApp.handleAddedNode(otherNode);

            expect(activityHandler.removeEntry.called).to.be.false;
            expect(uiHandler.setLoadMore.called).to.be.false;
        });
    });

    describe('loadMoreOrReset', () => {
        it('should call ui.clickLoadMore if currentLoadCount < targetLoadCount and userPressed is true', () => {
            activityHandler.currentLoadCount = 5;
            uiHandler.userPressed = true;

            mainApp.loadMoreOrReset();

            expect(uiHandler.clickLoadMore.calledOnce).to.be.true;
        });

        it('should call ac.resetState and ui.resetState if currentLoadCount is equal to targetLoadCount and userPressed is true', () => {
            activityHandler.currentLoadCount = 10;
            uiHandler.userPressed = true;

            mainApp.loadMoreOrReset();

            expect(activityHandler.resetState.calledOnce).to.be.true;
            expect(uiHandler.resetState.calledOnce).to.be.true;
        });

        it('should call ac.resetState and ui.resetState if currentLoadCount >= config.targetLoadCount or userPressed is false', () => {
            activityHandler.currentLoadCount = 10;
            uiHandler.userPressed = false;

            mainApp.loadMoreOrReset();

            expect(activityHandler.resetState.calledOnce).to.be.true;
            expect(uiHandler.resetState.calledOnce).to.be.true;
        });
    });

    describe('isAllowedUrl', () => {
        const testUrls = [
            'https://anilist.co/home',
            'https://anilist.co/user/username/',
            'https://anilist.co/anime/social',
            'https://anilist.co/social',
        ];

        it('should return false for all URLs when all config values are false', () => {
            Object.keys(mainApp.config.runOn).forEach(key => {
                mainApp.config.runOn[key] = false;
            });

            testUrls.forEach(url => {
                global.window = { location: { href: url } };
                expect(mainApp.isAllowedUrl()).to.be.false;
            });
        });

        it('should return true for corresponding URLs when all config values are true', () => {
            Object.keys(mainApp.config.runOn).forEach(key => {
                mainApp.config.runOn[key] = true;
            });

            testUrls.forEach(url => {
                global.window = { location: { href: url } };
                expect(mainApp.isAllowedUrl()).to.be.true;
            });
        });
    });
});
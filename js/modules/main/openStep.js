define(function (require) {
    var $ = require("jquery");
    var stepOneView = require("text!../../../template/openStep/stepOne.html");
    var stepTwoView = require("text!../../../template/openStep/stepTwo.html");
    var stepThreeView = require("text!../../../template/openStep/stepThree.html");
    var stepFourView = require("text!../../../template/openStep/stepFour.html");
    var router = require("../service/minrouter");
    var initView = require("./stepRender");

    //var b_stepOneDom=$(".banner .e-step1");
    //var b_stepTwoDom=$(".banner .e-step2");
    //var b_stepThreeDom=$(".banner .e-step3");
    //var b_stepFourDom=$(".banner .e-step4");
    var contentBox = $(".s-contentBox");

    var stepObj={
        stepOneView:stepOneView,
        stepTwoView:stepTwoView,
        stepThreeView:stepThreeView,
        stepFourView:stepFourView,
        rootDom: contentBox
        //bannerStepDom:{
        //    stepOne:b_stepOneDom,
        //    stepTwo:b_stepTwoDom,
        //    stepThree:b_stepThreeDom,
        //    stepFour:b_stepFourDom
        //}
    };
    var renderView = new initView.render(stepObj);

    router.call(renderView,{
        routes: {
            '/stepOne': "stepOne",
            '/stepTwo': "stepTwo",
            '/stepThree': "stepThree",
            '/stepFour': "stepFour"
        },
        stepOne:function () {
            renderView.step = 1;
            renderView.init();
        },
        stepTwo:function () {
            renderView.step = 2;
            renderView.init();
        },
        stepThree:function () {
            renderView.step = 3;
            renderView.init();
        },
        stepFour:function () {
            renderView.step = 4;
            renderView.init();
        }
    });

        renderView.start();
});


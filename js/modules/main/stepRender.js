define(function (require) {
    var $ = require("jquery");
    var handlebars= require("../util/helpers");
    var globalService = require("../service/globalService");
    var translate = require ("../util/translate");
    var router = require("../service/minrouter");
    var service = require("../service/xhr");
    var WebUploader = require("webuploader");
    var errorDialog = require("../util/dialog");
    var uploadErrorTable = require("text!../../../template/components/uploadErrorTable.html");
    require("jquery.serializejson");


    var render=function (options) {
        this.stepOneView=options.stepOneView;
        this.stepTwoView=options.stepTwoView;
        this.stepThreeView=options.stepThreeView;
        this.stepFourView=options.stepFourView;
        this.template = this.stepOneView;
        this.rootDom =options.rootDom;
        //this.bannerStepDom = options.bannerStepDom;
        this.orgId = globalService.searchURL("orgId") ||"";
        this.sid = globalService.searchURL("sid") ||"";
        this.migrationAgain = globalService.searchURL("migrationAgain") ||"";
        this.paramDomainName = globalService.searchURL("paramDomainName") ||"";
        // this.allowStep=1;
        this.cache={
            //pageStatus: {
              migrationConfig:JSON.parse(globalService.getLocalStorage("migrationConfig"))||{}
            //}
        };
        if(globalService.isEmptyObject(this.cache.migrationConfig) || !this.cache.migrationConfig[this.orgId]){
            this.cache.migrationConfig[this.orgId] ={
                stepTwo:{},
                stepOne:{},
                stepThree:{},
                configStatus:{}
                //userList:[]
            }
        }
        //this.allowStep = this.cache.allowStep || 1;
        this.step =  1;

        this.formData = {};
        this.formData[this.orgId] ={
            stepTwo:{},
            stepThree:{},
            configStatus:{}
            //userList:[]
        };
        var configStatus =globalService.isEmptyObject(this.cache.migrationConfig[this.orgId].configStatus) ?{} : this.cache.migrationConfig[this.orgId].configStatus

        this.pageStatus = {
            stepTwo : null,
            stepThree : null,
            configStatus : configStatus
        };
        this.pageRenderData ={
            stepTwo:{},
            stepThree:{}
        };

        this.protocol =  this.cache.migrationConfig[this.orgId].stepTwo.protocol || "IMAP";
        this.domainlist ={
            domainNames : this.cache.migrationConfig[this.orgId].stepTwo.domainNames || []
        };

        // this.init();
        // this.initBannerEvents(this.bannerStepDom);
    };
    render.prototype={
        constructor: render,
        init:function () {
            var self =this;
            if(this.migrationAgain){
                self.pageRenderData.stepTwo.domainNames=[];
                self.pageRenderData.stepTwo.domainNames.push(self.paramDomainName);
                self.domainlist.domainNames = self.pageRenderData.stepTwo.domainNames;
                self.getOperatorList();
            }else{
                if(self.pageRenderData.stepTwo.domainNames && self.pageRenderData.stepTwo.operatorList){
                    self.initView();
                  }else{
                    service.call({
                        url:"/getDomainsByOrgId.do",
                        data:{
                            orgId: self.orgId
                        }
                    }).then(function (data) {
                        if(data.code === 0){
                            self.pageRenderData.stepTwo.domainNames= data.data.list;
                            self.getOperatorList();
                        }
                    });
                }
            }

        },
        getOperatorList:function(){
            var self = this;
            service.call({
                url:"/getOperatorList.do"
            }).then(function(data){
                if(data.code === 0){
                    self.pageRenderData.stepTwo.operatorList= data.data.operators;
                    self.initView();
                }
            });
        },
        initView:function () {
            this.switchTemplate();
            $(".e-bannerTxt").html(handlebars.compile($("#bannerTxtTpl").html()));
            $(".o-logoTxt").html(handlebars.compile($("#logoTxtTpl").html()));
            var template = handlebars.compile(this.template);
            this.rootDom.html(template(this.pageRenderData.stepTwo));
            this.switchBgStep();
            if(this.step === 2 || this.step === 3) {
                this.step === 3 && this.initUpload();
                this.initInput();

            }
            this.initEvents();
            this.initData();
            if(this.step === 2 || this.step === 3) {
                this.initMigrationAgainData();
            }
        },
        initMigrationAgainData:function(){
            var self =this;
            if(self.migrationAgain){

                if( self.migrationAgain.stepTwo  &&  self.migrationAgain.stepThree){

                }
                else{
                    service.call({
                        url:"/getOpenedParams.do",
                        data:{
                            domainName: self.paramDomainName,
                            orgId: self.orgId
                        }
                    }).then(function(res){
                        if(res.code === 0){
                            self.initData(res.data.data);
                        }
                    })
                }
            }
        },
        initData:function (againData) {
            var self= this;
            var  stepData;
            self.step == 2 &&  (function () {
                   stepData = self.pageStatus.stepTwo || self.cache.migrationConfig[self.orgId].stepTwo || againData || {};
                   self.initDomAssist();
             if( self.pageRenderData.stepTwo.domainNames.length===1){
                 var tmpArr = [],domain0 = $("input[name='domain_0']");
                  domain0.prop("checked",true).siblings(".check-box").addClass("checked");
                  tmpArr.push(domain0.val());
                  self.domainlist.domainNames= tmpArr;
             }
                if(self.migrationAgain && againData){
                    self.migrationAgain.stepTwo =true;
                    var operator =$("input[name='operator'][data-"+againData.protocol+"*='"+againData.serverAddr+"']");
                    if(operator.length !== 0){
                        operator.trigger("click")
                    }else{
                        $("[data-action='otherOperator']").find("input").trigger("click");
                        $("input[name='serverAddr']").val(againData.serverAddr);
                    }

                    //$.each(operator,function(k,v){
                    //  var againDataTmp=$(v).data((againData.protocol).toLowerCase());
                    //    if(againDataTmp){
                    //        againDataTmp = againDataTmp.split(",")[0];
                    //        if(againData.serverAddr === againDataTmp){
                    //            $(v).closest("label").trigger("click");
                    //            return false;
                    //        }
                    //    }
                    //    if(k==operator.length-1){
                    //        $("[data-action='otherOperator']").trigger("click");
                    //        $("input[name='serverAddr']").val(againData.serverAddr);
                    //    }
                    //})
                }
            })();
            self.step == 3 &&  (function () {
                stepData = self.pageStatus.stepThree || self.cache.migrationConfig[self.orgId].stepThree || againData || {};
                if(!stepData.migrationType && !stepData.batchType){
                    $("label[data-action='independent']").find("input").trigger("click");
                }
                if(!stepData.customizeFolder){
                    $("label[data-action='diy']").find("input").trigger("click");
                }else if(stepData.customizeFolder === "false"){
                    $("label[data-action='box']").find("input").trigger("click");
                }

                if(self.migrationAgain){
                    self.migrationAgain.stepThree =true;
                }
                if(self.cache.migrationConfig[self.orgId].stepThree.uploadFileName){
                    $("#fileName").text(self.cache.migrationConfig[self.orgId].stepThree.uploadFileName);
                }
            })();
            //if(self.migrationAgain){
            //
            //}
            self.initDomAssist();
            if(stepData){
                for(var a in stepData){
                    if(stepData[a]){
                        var tmp =$("input[name="+a+"]");
                        tmp = tmp.length === 0 ? $("select[name="+a+"]") : tmp;
                        if(tmp.length !==0) {
                            switch (tmp.attr("type")) {
                                case "text":
                                    tmp.val(stepData[a]);
                                    break;
                                case "checkbox":
                                    tmp.prop("checked", true).siblings(".check-box").addClass("checked");
                                    break;
                                case "radio":
                                    if (self.step === 2) {
                                        $("[data-operator=" + stepData[a] + "]").prop("checked", true).siblings(".radio-box").addClass("checked");
                                    }
                                    else if (self.step === 3) {
                                        $.each(tmp, function (k, v) {
                                            if ($(v).val() === stepData[a]) {
                                                $(v).prop("checked", true).siblings(".radio-box").addClass("checked");
                                            }
                                        })
                                    }
                                    break;
                                case "password":
                                    tmp.val(stepData[a]);
                                    break;
                                default :
                                    tmp.val(stepData[a]);
                                    break;
                            }
                        }
                    }
                }
                if(self.step == 2){
                    var   account= $("input[name='email']"),password = $("input[name='password']"),testBtn = $(".btn.testBtn");
                    if( account.val() && password.val()) {
                        testBtn.attr("disabled",false)
                    }
                }

            }

        },
        initUpload:function () {
            var self =this;
            self.isSupportUpload = WebUploader.Uploader.support();
            if(!self.isSupportUpload){
                errorDialog.alert(translate("notSupportUpload"),true,function(){
                },null,{buttonText:translate("sure")});
                return false;
            }
            if(self.checkUploadForIE()){
                self.uploader = WebUploader.create({
                    swf:  './js/components/upload/Uploader.swf',
                    server: "/migration/resolveCsvFile.do?sid="+self.sid+"&orgId="+self.orgId,
                    auto: true,
                    resize: false,
                    pick: {
                        id: '#f-picker',
                        multiple: true
                    },
                    fileNumLimit: 1,
                    //fileSizeLimit: 400 * 1024 * 1024,
                    fileVal: "file",
                    duplicate:true,
                    accept:{
                        extensions:"csv"
                    }
                });
            }else{
                self.uploader = WebUploader.create({
                    server: "/migration/resolveCsvFile.do?sid="+self.sid+"&orgId="+self.orgId,
                    auto: true,
                    resize: false,
                    pick: {
                        id: '#f-picker',
                        multiple: true
                    },
                    fileNumLimit: 1,
                    //fileSizeLimit: 400 * 1024 * 1024,
                    fileVal: "file",
                    duplicate:true,
                    accept:{
                        extensions:"csv"
                    }
                });
            }

                 this.uploader.on('uploadBeforeSend', function(object,data,headers){
                     $.extend(headers, {
                         "Accept" :  "application/json"
                     });
                 });
                self.uploader.on('uploadStart', function (file) {
                    $("#fileName").text(file.name);
                });

                self.uploader.on('uploadSuccess', function(file,res){
                    if(res.code === 0){
                        if(res.data.errorMsgList.length > 0){
                         $(".errorNumber").text(res.data.errorMsgList.length);
                            $(".uploadErrortxt").show();
                            self.renderUploadErrorTable(res.data.errorMsgList);
                        }
                        else{
                            $(".uploadErrortxt").hide();
                        }

                        if(res.data.successList.length >0){
                            self.formData[self.orgId].stepThree.userList = res.data.successList;
                            self.formData[self.orgId].stepThree.uploadFileName = file.name;
                            //self.pageStatus.uploadFileName = file.name;
                        }
                    }else{
                        errorDialog.alert(res.msg,true,function(){
                        },null,{buttonText:translate("sure")});
                    }
                });
                self.uploader.on('uploadError', function (file,reason) {
                    self.uploader.reset();
                    $(".u-otherError").text(translate("u-networkError"))
                });
            self.uploader.on('error', function (type) {
                self.uploader.reset();
                switch (type){
                    case "Q_TYPE_DENIED":
                        $(".u-otherError").text(translate("typeError"));
                        break;
                }
            });
        },
        checkUploadForIE:function(){
            if(WebUploader.browser.ie<= 9){
                return true
            }else{
                return false;
            }
        },
        switchTemplate:function () {
            switch (this.step){
                case 1:
                    this.template= this.stepOneView;
                    break;
                case 2:
                    this.template= this.stepTwoView;
                    break;
                case 3:
                    this.template= this.stepThreeView;
                    break;
                case 4:
                    this.template= this.stepFourView;
                    break;
            }
        },
        switchBgStep:function () {
            var stepBg= $(".e-step-bg .step-bg");
            switch (this.step){
                case 1:
                    stepBg.addClass("step1");
                    stepBg.removeClass("step2 step3 step4");
                    break;
                case 2:
                    stepBg.addClass("step2");
                    stepBg.removeClass("step1 step3 step4");
                    break;
                case 3:
                    stepBg.addClass("step3");
                    stepBg.removeClass("step2 step1 step4");
                    break;
                case 4:
                    stepBg.addClass("step4");
                    stepBg.removeClass("step2 step3 step1");
                    break;
            }
        },
        initInput:function () {
            var self =this;
                var port = $("input[name='serverPort']"),protocolType = $("select[name='protocol']"),
                    folderName=$("input[name='folderName']");
            if(self.step === 2){
                protocolType.change(function () {
                    var  serverAddr=$("input[name='serverAddr']");
                    if($(this).val()=== "POP"){
                        self.protocol ="POP";
                        if(self.supportSSL == "true"){
                            port.val("995");
                        }else{
                            port.val("110");
                        }
                    }
                    else{
                        self.protocol ="IMAP";
                        if(self.supportSSL == "true"){
                            port.val("993");
                        }else{
                            port.val("143");
                        }
                    }
                    self.changeServerAddr();
                });

                if(!port.val() && port.val()!==0){
                    port.val("143");
                }
            }

           $("label input").each(function () {
               $(this).click(function (e) {
                   e.stopPropagation();
                  var check=$(this).siblings(".check-box");
                   var radio =$(this).siblings(".radio-box");
                   if(check.length!==0){
                       var checkAction = $(this).closest("label").data("action") || "";
                       if(check.hasClass("checked")){
                           if(checkAction ==="SSL" ){
                                   self.supportSSL = "false";
                                  $("input[name='acceptAllCerts']").val("false");
                                   if(self.protocol =="IMAP"){
                                       port.val("143");
                                   }else if(self.protocol =="POP"){
                                       port.val("110");
                                   }
                           }else{
                               var check_index = self.domainlist.domainNames.indexOf($(this).val());
                               self.domainlist.domainNames.splice(check_index,1);
                           }
                           check.removeClass("checked");
                       }else{
                           check.addClass("checked");
                           if(checkAction ==="SSL" ){
                               self.supportSSL = "true";
                               $("input[name='acceptAllCerts']").val("true");
                               if(self.protocol =="POP"){
                                   port.val("995");
                               }else{
                                   port.val("993");
                               }
                           }else{
                               self.domainlist.domainNames.push($(this).val());
                           }
                       }
                   }
                   if(radio.length !== 0){
                       if(radio.hasClass("checked")){
                       }else{
                           var action = $(this).closest("label").data("action") || "";
                           // if(action){
                               switch (action){
                                   case "n-operatorList":
                                       self.pageStatus.configStatus.otherOperator = "false";
                                       break;
                                   case "batchMigration":
                                       self.pageStatus.configStatus.showMigrationType = 1;
                                       $("label[data-action='independent']").find("input").prop("checked",false);
                                       break;
                                   case "independent":
                                       self.pageStatus.configStatus.showMigrationType = 2;
                                       $("input[name='batchType']:checked").prop("checked",false);
                                       break;
                                   case "otherOperator":
                                       self.pageStatus.configStatus.otherOperator = "true";
                                       $("input[name='serverAddr']").val("");
                                       break;
                                   case "batchTypePwd" :
                                       self.pageStatus.configStatus.batchTypePwd = "true";
                                        break;
                                   case "importUser":
                                       self.pageStatus.configStatus.batchTypePwd = "false";
                                       $("input[name='unifiedPwd']").val("");
                                       break;
                                   case "box":
                                       folderName.attr("disabled",true);
                                       break;
                                   case "diy":
                                       folderName.attr("disabled",false);
                                       break;
                                   default :

                                       break;
                               }
                               self.initDomAssist();
                           if(self.step ===2){
                               self.changeServerAddr($(this));
                           }

                           // }
                           // else{
                           //
                           // }
                           $(this).closest("div").siblings("div").find(".radio-box").removeClass("checked");
                           radio.addClass("checked");
                       }
                   }
               })
           })
        },
        initDomAssist:function () {
            var batchType =  $(".m-batchType"),independent = $(".independent-txt"),
                otherServer = $(".b-other-server"),unifiedPwdBox=$(".unifiedPwdBox"),
                showMigrationType = this.pageStatus.configStatus.showMigrationType || this.cache.migrationConfig[this.orgId].configStatus.showMigrationType,
                otherOperator = this.pageStatus.configStatus.otherOperator || this.cache.migrationConfig[this.orgId].configStatus.otherOperator,
                batchTypePwd = this.pageStatus.configStatus.batchTypePwd || this.cache.migrationConfig[this.orgId].configStatus.batchTypePwd;

          if(this.step == 3){
              if(showMigrationType == 2){
                  batchType.hide();
                  independent.fadeIn();
              } else if(showMigrationType == 1){
                  independent.hide();
                  batchType.fadeIn();
                  if(this.isSupportUpload){
                      this.uploader.refresh();
                  }
              }

              if(batchTypePwd === "true"){
                  unifiedPwdBox.show();
              }else{
                  unifiedPwdBox.hide();
              }

          }

         if(this.step ==2){
             if(otherOperator === "true"){
                 otherServer.show();
             }else{
                 otherServer.hide();
             }
         }
        },
        changeServerAddr:function (dom) {
            var serverAddr = $("input[name='serverAddr']");
            dom = dom ? dom : $("input[name='operator']:checked");
            if(this.pageStatus.configStatus.otherOperator === "false") {
                if (this.protocol === "IMAP") {
                    serverAddr.val(dom.data("imap").split(",")[0]);
                }
                else if (this.protocol === "POP") {
                    serverAddr.val(dom.data("pop").split(",")[0]);
                }
            }else{
                    //serverAddr.val("");
            }
        },
        //initBannerEvents:function (dom) {
        //    var self = this;
        //   $.each(dom,function (n,v) {
        //       $(v).off("click").on("click",function (e) {
        //           e.stopPropagation();
        //          var step=$(this).data("step");
        //           if(step > self.allowStep){
        //             return false
        //           }
        //           else{
        //              self.step = step;
        //              self.initGoRouteView(self.step);
        //           }
        //       })
        //   })
        //},
        //initGoRouteView:function(step){
        //    step == 1 && this.go("/stepOne");
        //    step == 2 && this.go("/stepTwo");
        //    step == 3 && this.go("/stepThree");
        //    step == 4 && this.go("/stepFour");
        //},
        initEvents:function () {
            this.step == 1 && this.addEvents("1");
            this.step == 2 && this.addEvents("2");
            this.step == 3 && this.addEvents("3");
            this.step == 4 && this.addEvents("4");
        },
        addEvents:function (type) {
            var self=this;
            switch (type){
                case "1":
                    self.stepOneEvents();
                    break;
                case "2":
                    self.stepTwoEvents();
                    break;
                case "3":
                    self.stepThreeEvents();
                    break;
                case "4":
                    self.stepFourEvents();
                    break;
            }

        },
        stepOneEvents:function () {
            var self=this;
            $(".goStepTwo").click(function () {
                self.go("/stepTwo");
            });
            var url ="/webadmin/~"+self.sid+"/~/main/index.jsp?toSystem=webadm&showPage=usr/mod_importuser.jsp";
            $(".importUser").click(function(){
                window.open(url,"_blank");
            })
        },
        stepTwoEvents:function () {
            var self=this,account= $("input[name='email']"),password =  $("input[name='password']"),testBtn =$(".btn.testBtn"),error =$(".errorTip");
            $(".goStepThree").click(function () {
                self.pageStatus.stepTwo = $("form").serializeJSON();
                $.extend(self.pageStatus.stepTwo,self.domainlist);
              if(self.verification("stepTwo",self.pageStatus.stepTwo)){
                 self.testMigration(true,error)
              }

            });
            $(".goStepOne").click(function () {
                self.pageStatus.stepTwo = $("form").serializeJSON();
                $.extend(self.pageStatus.stepTwo,self.domainlist);
                    self.saveStepStatus("stepTwo");
                    self.go("/stepOne");

            });

            account.keyup(function () {
               if( account.val() && password.val()) {
                   testBtn.attr("disabled",false)
               }
               else{
                   testBtn.attr("disabled",true)
               }
            });
            password.keyup(function () {
                if( account.val() && password.val()) {
                    testBtn.attr("disabled",false)
                }else{
                    testBtn.attr("disabled",true)
                }
            });
            testBtn.click(function(){
                self.pageStatus.stepTwo = $("form").serializeJSON();
                $.extend(self.pageStatus.stepTwo,self.domainlist);
                self.testMigration(null,error);
            })
        },
        testMigration:function(opt,error){
            var self =this;
            error.text("");
            service.call({
                url:"/testMigrationServer.do",
                data:self.pageStatus.stepTwo
            }).then(function(data){
                if(data.code === 0){
                    if(opt === true){
                        self.saveStepStatus("stepTwo");
                        self.go("/stepThree");
                    }else{
                        error.text(translate("testSuccess"))
                    }
                }
                else{
                    error.text(data.msg)
                }
            },function(jqXHR, textStatus, errorThrown){
                //error.text(jqXHR.responseJSON.msg)
            });
        },
        renderUploadErrorTable:function(data){
           var errorTable= handlebars.compile(uploadErrorTable);
            $(".errorTable").html(errorTable(data));
             $(".viewUploadError").click(function(){
                 $(".maskBg").show();
                 $(".mask-content").show();
             });
            $(".closeError-mask").click(function(){
                $(".maskBg").hide();
                $(".mask-content").hide();
            })
        },
        stepThreeEvents:function () {
            var self=this,closeExplain=$(".closeExplain"),csvExplain = $(".csvExplain");
            $(".goStepTwo").click(function () {
                    self.pageStatus.stepThree = $("form").serializeJSON();
                    self.saveStepStatus("stepThree");
                    self.go("/stepTwo");


            });

            $(".goStepFour").click(function () {
                self.pageStatus.stepThree = $("form").serializeJSON();
                    if(self.verification("stepThree", self.pageStatus.stepThree)){
                        self.saveStepStatus("stepThree");
                        self.go("/stepFour");
                    }
            });
            $(".viewExplain").click(function () {
                csvExplain.show();
            });
            closeExplain.click(function () {
                csvExplain.hide();
            });
        },
        
        stepFourEvents:function () {
            var self=this;
            var formdata ={};
            $.extend(formdata, self.formData[self.orgId].stepTwo, self.formData[self.orgId].stepThree);
            if(globalService.isEmptyObject(formdata)){
                $.extend(formdata,self.cache.migrationConfig[self.orgId].stepTwo,self.cache.migrationConfig[self.orgId].stepThree);
            }
            formdata.orgId = self.orgId;
            $(".goStepThree").click(function () {
                self.go("/stepThree");
            });

            $(".openMigrationBtn").click(function(){
                service.call({
                    url:"/openMigration.do",
                    data:formdata
                }).then(function(data){
                    if(data.code === 0){
                        globalService.removeLoaclStorage("migrationConfig");
                        window.location.href = "./openMove.html?sid="+self.sid+"&orgId="+self.orgId
                    }
                })
            });
        },
        saveStepStatus:function(step){
            var self = this;
            if(globalService.isEmptyObject(self.formData[this.orgId].configStatus)){
                self.formData[this.orgId].configStatus = self.cache.migrationConfig[self.orgId].configStatus;
            }
            switch (step){
                case "stepTwo":
                    $.extend(self.formData[this.orgId].stepTwo,self.pageStatus.stepTwo);
                    $.extend(self.formData[this.orgId].configStatus,self.pageStatus.configStatus);
                    if(globalService.isEmptyObject(self.formData[this.orgId].stepThree)){
                        self.formData[this.orgId].stepThree = self.cache.migrationConfig[self.orgId].stepThree;
                    }
                    break;
                case "stepThree":
                    $.extend(self.formData[this.orgId].stepThree,self.pageStatus.stepThree);
                    $.extend(self.formData[this.orgId].configStatus,self.pageStatus.configStatus);

                    if(globalService.isEmptyObject(self.formData[this.orgId].stepTwo)){
                        self.formData[this.orgId].stepTwo = self.cache.migrationConfig[self.orgId].stepTwo;
                    }
                    break;
            }
            if(!self.formData[self.orgId].stepThree.userList){
                self.formData[self.orgId].stepThree.userList = self.cache.migrationConfig[self.orgId].stepThree.userList
            }
            if(!self.formData[self.orgId].stepThree.uploadFileName){
                self.formData[self.orgId].stepThree.uploadFileName = self.cache.migrationConfig[self.orgId].stepThree.uploadFileName
            }
                    globalService.setLocalStorage("migrationConfig",JSON.stringify(self.formData));
        },
        verification:function (step,data) {
            var error =$(".errorTip");
            var reg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
            switch (step){
                case "stepTwo":
                    if(!data.email){
                        error.text(translate("emptyAccount"));
                        return false;
                    }
                    //if(!reg.test(data.email)){
                    //    error.text(translate("wrongAccount"));
                    //    return false;
                    //}
                    if(!data.password){
                        error.text(translate("emptyPassword"));
                        return false;
                    }
                    if(!data.serverPort){
                        error.text(translate("emptyPort"));
                        return false;
                    }
                    if(data.domainNames.length === 0){
                        error.text(translate("emptyDomainName"));
                        return false;
                    }
                    if(!data.serverAddr){
                        error.text(translate("emptyServerAddr"));
                        return false;
                    }
                    return true;
                    break;
                case "stepThree":
                    if(!data.migrationType){
                        error.text(translate("emptyMigrationType"));
                        return false;
                    }else if(data.migrationType == 2){
                        if(!data.unifiedPwd){
                            error.text(translate("emptyUnifiedPwd"));
                            return false;
                        }
                    }else if(data.migrationType == 1){
                        var userListData = this.formData[this.orgId].stepThree.userList || this.cache.migrationConfig[this.orgId].stepThree.userList;
                        if(!userListData  || userListData.length === 0){
                            error.text(translate("emptyCsv"));
                            return false;
                        }
                    }
                    if(!data.customizeFolder){
                        error.text(translate("emptyCustomizeFolder"));
                        return false;
                    }
                    else if(data.customizeFolder == "true"){
                        if(!data.folderName){
                            error.text(translate("emptyFolderName"));
                            return false;
                        }
                    }
                    return true;
                    break;
            }
        }
    };
    $.extend(render.prototype, router.prototype);
    return {
        render:render
    };
});

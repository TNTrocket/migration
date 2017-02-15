define(function (require) {
    var $ = require("jquery");
    var handlebars= require("../util/helpers");
    var globalService = require("../service/globalService");
    var translate = require ("../util/translate");
    var service = require("../service/xhr");
    var errorDialog = require("../util/dialog");
    var uploadErrorTable = require("text!../../../template/components/uploadErrorTable.html");
    var WebUploader = require("webuploader");

    function move(opts) {
        this.moduleDom = opts.moduleDom;
        this.rootDom = opts.rootDom;
        this.page = 1;
        this.pageSize =20;
        this.total = 0;
        this.orgId = globalService.searchURL("orgId") ||"";
        this.sid = globalService.searchURL("sid") ||"";
        this.searchTableList ={};
        this.init();
    }
    move.prototype={
        constructor: move,
        init:function () {
            this.initView();
            this.initTableEvents();
            this.initUpload();
            this.initMoveEvents();
        },
        initView:function () {
            this.mainRender();
            this.renderProessTable();
            this.queryUser("all",true);
            this.migrationAgainEvents();
            //this.searchTableRender();
        },
        mainRender:function () {
         var mainView =handlebars.compile(this.moduleDom.main);
            this.rootDom.html(mainView);
        },
        renderProessTable:function(){
            var self =this;
            service.call({
                url:"/summaryMigrationUserProgress.do?orgId="+self.orgId
            }).then(function(data){
                if(data.code === 0){
                    var result = data.data;
                    var progressData={};
                    progressData.totalNumber=0;

                    for(var a in result){
                        progressData.totalNumber+=result[a];
                        progressData[a] = result[a];
                    }
                    if(progressData.totalNumber === 0){
                        progressData.totalNumber = 0.3
                    }
                    progressData.toMoveCountPercentage = Math.round(progressData.migrationToMoveCount/progressData.totalNumber*100) +"%";
                    progressData.movingCountPercentage = Math.round(progressData.migrationMovingCount/progressData.totalNumber*100) +"%";
                    progressData.finishCount = progressData.migrationFinishCount+progressData.migrationShutDownCount;
                    progressData.failCountPercentage = Math.round(progressData.migrationFailCount/progressData.totalNumber*100) +"%";
                    progressData.finishCountPercentage = Math.round(progressData.finishCount/progressData.totalNumber*100) +"%";
                    progressData.totalNumber = Math.round(progressData.totalNumber);
                    var progress =handlebars.compile(self.moduleDom.migrationProess);
                    $(".m-Progress").html(progress(progressData));
                }
            })

        },
        searchTableRender:function () {
            var  tableView =handlebars.compile(this.moduleDom.table);
           $(".o-i-table").html(tableView(this.searchTableList));
            if(this.searchTableList.length === 0){
                $(".no-data").show();
            }
        },
        renderTablePageNav:function(opt){
            if(opt === true){
                 this.pageTotal =Math.ceil(this.total/this.pageSize);
                var tableNav = {
                    nav:[],
                    pageTotal: this.pageTotal
                };
                $(".pageText").text(tableNav.pageTotal);
                for(var a=0;a<tableNav.pageTotal;a++){
                    tableNav.nav.push(a+1);
                }
                var navView= handlebars.compile(this.moduleDom.tableNav);
                $(".tablePageNav").html(navView($.extend(tableNav,{type:1})));
                $(".tablePageNavTwo").html(navView($.extend(tableNav,{type:2})));
                this.page =1
            }

        },
        initCheckbox:function(){
            var closeMigration =  $(".closeMigration");
            $("table label input").off("click").click(function (e) {
                e.stopPropagation();
                var check=$(this).siblings(".check-box");
                if(check.length!==0){
                    if(check.hasClass("checked")){
                        check.removeClass("checked");
                        setTimeout(function(){
                            var tem=[];
                            $.each($(".o-i-table").find("input:checked"),function(k,v){
                                tem.push($(v).data("progress"))
                            });
                            if(tem.indexOf("0")===-1){
                                closeMigration.attr("disabled",true)
                            }
                        },50)
                    }else{
                        check.addClass("checked");
                        if($(this).data("progress") ===0){
                            closeMigration.attr("disabled",false)
                        }
                    }
                }
            })
        },
        migrationAgainEvents:function(){
            var self = this;
            var dom ={
                batchType:$(".m-a-batchType"),
                independent:$(".a-independent-txt"),
                unifiedPwdBox:$(".a-unifiedPwdBox"),
                csvExplain:$(".csvExplain")
            },unifiedPwd =$("input[name='unifiedPwd']"),
                againTips = $(".m-a-tips");

        $(".migrationAgain .moreAgain label").click(function(){
            var radio =$(this).children(".radio-box");
                if(radio.hasClass("checked")){
                }else{
                    var action = $(this).data("action") || "";
                    // if(action){
                    switch (action){
                        case "batchMigration":
                            $("label[data-action='independent']").find("input").prop("checked",false);
                            self.batchType =true;
                            break;
                        case "independent":
                            $("input[name='batchType']:checked").prop("checked",false);
                            self.batchType =false;
                            self.batchTypePwd= false;
                            self.csvExplain = false;
                            unifiedPwd.val("");
                            break;
                        case "batchTypePwd" :
                            self.batchTypePwd= true;
                            self.importUser = false;
                            self.csvExplain = false;
                            break;
                        case "importUser":
                            self.importUser = true;
                            self.batchTypePwd= false;
                            unifiedPwd.val("");
                            break;
                        default :
                            unifiedPwd.val("");
                            break;
                    }
                    self.initAgainMigrationInput(dom);
                    $(this).closest("div").siblings("div").find(".radio-box").removeClass("checked");
                    radio.addClass("checked");
                }
        });
            $("[data-againMigration]").click(function(){
               var againMigration=$(this).data("againmigration");
               switch (againMigration){
                   case "viewExplain":
                       self.csvExplain = true;
                       self.initAgainMigrationInput(dom);
                       break;
                   case "s_migration":
                       self.migrationType = $("input[name='migrationType']:checked").val();
                       self.unifiedPwd = $("input[name='unifiedPwd']").val();

                       if(self.verifyAgainMigration()){
                           service.call({
                               url:"/openMigrationAgain.do",
                               data:{
                                   orgId:self.orgId,
                                   migrationType: self.migrationType,
                                   userList:self.userList,
                                   unifiedPwd:self.unifiedPwd
                               }
                           }).then(function(){
                               $(".moreAgain").slideUp();
                               againTips.show();
                               $(".a-m-close").hide();
                               $(".csvExplain").hide();
                               againTips.text(translate("againTips"));
                               setTimeout(function(){
                                   againTips.fadeOut();
                               },2000)
                           });
                       }

                       //}

                       break;
               }
            })
        },
        verifyAgainMigration:function(){
          var  migrationAgainError = $(".s_migration_error");
            if(!this.migrationType){
                migrationAgainError.text(translate("m_again_tipOne"));
                return false;
            }
            if(this.migrationType == "2"){
                if(!this.unifiedPwd){
                    migrationAgainError.text(translate("emptyUnifiedPwd"));
                    return false
                }
            }
            if(this.migrationType == "1"){
                if(!this.userList || this.userList.length === 0){
                    migrationAgainError.text(translate("emptyCsv"));
                    return false
                }
            }
            return true

        },
        initAgainMigrationInput:function(obj){
          if(this.batchType === true){
              obj.batchType.show();
              obj.independent.hide();
              if(this.isSupportUpload){
                  this.uploader.refresh();
              }
          }else{
              obj.batchType.hide();
              obj.independent.show();
          }

            if(this.batchTypePwd === true){
                obj.unifiedPwdBox.show();
            }else{
                obj.unifiedPwdBox.hide();
            }
            if(this.csvExplain === true){
                obj.csvExplain.show();
            }else{
                obj.csvExplain.hide();
            }
        },
        initTableEvents:function () {
            var self= this,searchTableAllClick =$(".o-i-table label"),closeMigration=$(".closeMigration");
            $(".o-i-table [data-table]").click(function(){
               var status =$(this).data("table");
                switch (status){
                    case "all":
                        if(!$(this).data("cancel")){
                            $(this).text(translate("t-cancel"));
                            searchTableAllClick.find("input").prop("checked",true);
                            searchTableAllClick.find(".check-box").addClass("checked");
                            $(this).data("cancel",true);
                            setTimeout(function(){
                                $.each($(".o-i-table").find("input"),function(k,v){
                                    if($(v).data("progress") === 0){
                                        closeMigration.attr("disabled",false);
                                        return false;
                                    }
                                });
                            },100);

                        }else{
                            $(this).text(translate("t-AllChoose"));
                            $(this).data("cancel",false);
                            searchTableAllClick.find("input").prop("checked",false);
                            searchTableAllClick.find(".check-box").removeClass("checked");
                            closeMigration.attr("disabled",true);
                        }
                        break;
                }
            });
            $("select[name^=page_]").change(function(){
                $("select[name^=page_]").val($(this).val());
                self.queryUser();
            });
            this.initCheckbox();
        },
        initMoveEvents:function(){
            var self = this;
            var moreAgain= $(".moreAgain"),closeTip = $(".a-m-close"),csvExplain =$(".csvExplain"),
                pageSizeSelect = $("select[name='pageSize']"),pageSizeSelectTwo= $("select[name='pageSizeTwo']"),
                ChoosepageSizeSelect = $("select[name='n-pageSize']"),ChoosepageSizeSelectTwo= $("select[name='n-pageSizeTwo']");
            $("[data-action]").click(function(){
                var action =$(this).data("action");
                switch (action){
                    case "againMigration":
                        moreAgain.show();
                        closeTip.show();
                        break;
                    case "closeAgain":
                        moreAgain.hide();
                        closeTip.hide();
                        break;
                    case "viewExplain":
                        csvExplain.show();
                        break;
                    case "closeExplain":
                        self.csvExplain = false;
                        csvExplain.hide();
                        break;
                    case "queryDomain":
                        self.page =1;
                        self.queryUser("",true,self.page);
                        break;
                    case "refreshTable":
                        self.page = 1;
                        self.queryUser("",true,self.page);
                        break;
                    case "closeMigration":
                        var closeEmail = [];
                        $.each($(".o-i-table input[data-progress=0]:checked"),function(k,v){
                            closeEmail.push($(v).data("domain"));
                        });
                       if(closeEmail.length>0){
                           service.call({
                               url:"/closeMigration.do",
                               data:{
                                   orgId:self.orgId,
                                   emails:closeEmail
                               }
                           }).then(function(res){
                               self.queryUser();
                               self.renderProessTable();
                           })
                       }
                        break;
                }
            });
            $("[data-select]").change(function(){
                var select = $(this).data("select");
                  switch (select){
                      case "status":
                          self.page =1;
                          self.queryUser("",true,self.page);
                          break;
                      case "pageSize":
                          pageSizeSelectTwo.val($(this).val());
                          self.page =1;
                          self.queryUser("",true,self.page);
                          break;
                      case "pageSizeTwo":
                          pageSizeSelect.val($(this).val());
                          self.page =1;
                          self.queryUser("",true,self.page);
                          break;
                      case "n-pageSize" :
                          ChoosepageSizeSelectTwo.val($(this).val());
                          break;
                      case "n-pageSizeTwo" :
                          ChoosepageSizeSelect.val($(this).val());
                          break;
                  }
            });

            $(".lastPage").click(function(){
                   self.page = self.page - 1< 1 ? 1:self.page -1 ;
                 $("select[name^=page_]").val(self.page);
                   self.queryUser("","",self.page)
                });
            $(".nextPage").click(function(){
                self.page = self.page + 1 > self.pageTotal? self.pageTotal : self.page+1;
                $("select[name^=page_]").val(self.page);
                self.queryUser("","",self.page)
            });

            var  modifyBg= $(".m_modifyBg"), modifycontent = $(".m_modifycontent");
            $(".m_modification").click(function(){
                modifyBg.show();
                modifycontent.show();
            });
            //function newWin(url, id) {
            //    var a = document.createElement('a');
            //    a.setAttribute('href', url);
            //    a.setAttribute('target', '_blank');
            //    a.setAttribute('id', id);
            //    // 防止反复添加
            //    if(!document.getElementById(id)) document.body.appendChild(a);
            //    a.click();
            //}
            $("[data-modify]").click(function(){
              var status = $(this).data("modify");
                switch (status){
                    case "cancel":
                        modifyBg.hide();
                        modifycontent.hide();
                        break;
                    case "modify":
                        modifyBg.hide();
                        modifycontent.hide();
                        var url="./orgSelect.html?sid="+self.sid+"&orgId="+self.orgId+"&migrationAgain=true";
                         window.open(url,"_blank");
                        //var newWin = window.open("_blank");
                        //service.call({
                        //    url:"getDomainsByOrgId.do",
                        //    data:{
                        //        withOpenStatus:true,
                        //        orgId: self.orgId
                        //    }
                        //}).then(function(data){
                        //  if(data.data.list.length>1){
                        //
                        //  }else{
                             //var gourl="./openSelect.html?sid="+self.sid+"&orgId="+self.orgId+"&migrationAgain=true#stepTwo";
                             // window.location.href = url;
                             // window.open(url,"_blank")
                             // newWin(url,"org");
                             // newWin.location.href=url;
                          //}
                        //});
                        break;
                }
            });
        },
        queryUser:function(type,opt,page){
            var self = this;
            var userAtDomain = $("input[name='domainName']").val(),migrationProgress =$("select[name='migrationProgress']").val();
            self.page = page || Number($("select[name='page_1']").val());
            self.pageSize =Number($("select[name='pageSize']").val());
            if(type === "all"){
                userAtDomain ="";
            }
            $(".closeMigration").attr("disabled",true);
             service.call({
                 url:"/listMigrationUsers.do",
                 data:{
                     userAtDomain:userAtDomain,
                     migrationProgress:migrationProgress,
                     page: self.page,
                     pageSize:self.pageSize,
                     orgId:self.orgId
                 }
             }).then(function(data){
                if(data.code === 0){
                    self.total =data.data.total;
                    self.searchTableList = data.data.list;
                    self.searchTableRender();
                    self.renderTablePageNav(opt);
                    self.initTableEvents();
                }
             })
        },
        initUpload:function () {
            var self =this;
            self.isSupportUpload = WebUploader.Uploader.support();
            if(!self.isSupportUpload){
                errorDialog.alert(translate("notSupportUpload"),true,function(){
                },null,{buttonText:translate("sure")});
                return false;
            }
            if(WebUploader.browser.ie<= 9){
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

            // this.uploader.on('beforeFileQueued', this.beforeQueued)
            this.uploader.on('uploadBeforeSend', function(object,data,headers){
                $.extend(headers, {
                    "Accept" :  "application/json"
                });
            });
            self.uploader.on('uploadStart', function (file) {
                $("#fileName").text(file.name);
            });
            // this.uploader.on('uploadProgress', this.uploadProgress)
            self.uploader.on('uploadSuccess', function(file,res){
                if(res.code === 0){
                    if(res.data.errorMsgList.length > 0){
                        $(".errorNumber").text(res.data.errorMsgList.length);
                        $(".upload-a-Error").show();
                        self.renderUploadErrorTable(res.data.errorMsgList);
                    }
                    else{
                        $(".upload-a-Error").hide();
                    }

                    if(res.data.successList.length >0){
                      self.userList = res.data.successList;
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
        renderUploadErrorTable:function(data){
            var errorTable= handlebars.compile(uploadErrorTable);
            $(".errorTable").html(errorTable(data));
            $(".viewUploadError").click(function(){
                $(".error-maskBg").show();
                $(".error-mask").show();
            });
            $(".closeError-mask").click(function(){
                $(".error-maskBg").hide();
                $(".error-mask").hide();
            })
        },
    };
    return move
});

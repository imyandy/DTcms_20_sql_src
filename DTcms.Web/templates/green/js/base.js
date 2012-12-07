/* 
*作者：一些事情
*时间：2012-6-28
*需要结合jquery和jquery.form和liger ui一起使用
----------------------------------------------------------*/
/*搜索查询*/
function SiteSearch(send_url, divTgs) {
	var str = $.trim($(divTgs).val());
	if (str.length > 0 && str != "输入关健字") {
		window.location.href = send_url + "?keyword=" + encodeURI($(divTgs).val());
	}
	return false;
}
/*切换验证码*/
function ToggleCode(obj, codeurl) {
    $(obj).children("img").eq(0).attr("src", codeurl + "?time=" + Math.random());
	return false;
}
//复制文本
function copyText(txt){
	window.clipboardData.setData("Text",txt); 
	$.ligerDialog.success("复制成功，现在您可以通过粘贴来发送啦！");
} 
//全选取消按钮函数，调用样式如：
function checkAll(chkobj){
	if($(chkobj).text()=="全选"){
	    $(chkobj).text("取消");
		$(".checkall").attr("checked", true);
	}else{
    	$(chkobj).text("全选");
		$(".checkall").attr("checked", false);
	}
}
/*PROPS选择卡特效*/
function ToggleProps(obj, cssname){
	$(obj).parent().children("li").removeClass(cssname);
	$(obj).addClass(cssname);
}
//Tab控制选项卡
function tabs(tabId, event) {
    //绑定事件
	var tabItem = $(tabId + " .itemnav ul li a");
	tabItem.bind(event,function(){
		//设置点击后的切换样式
		tabItem.removeClass("current");
		$(this).addClass("current");
		//设置点击后的切换内容
		var tabNum = tabItem.parent().index($(this).parent());
		$(tabId + " .itembox").hide();
        $(tabId + " .itembox").eq(tabNum).show();
	});
}
//显示浮动窗口
function showWindow(objId){
	var box = '<div>' + $('#' + objId).html() + '</div>';
	var tit = $('#' + objId).attr("title");
    var m = $.ligerDialog.open({
		type: "",
		title: tit,
		content: $(box),
		width: 480,
		buttons: [
		{ text: '确认', onclick: function () {
			m.close();
			}
        }],
		isResize: true
	});
}

//执行删除操作
function ExecDelete(sendUrl, checkValue, urlId){
	var urlObj = $('#' + urlId);
	//检查传输的值
	if (!checkValue) {
		$.ligerDialog.warn("对不起，请选中您要操作的记录！");
        return false;
	}
	$.ligerDialog.confirm("删除记录后不可恢复，您确定吗？", "提示信息", function (result) {
		if (result) {
			$.ajax({
				type: "POST",
				url: sendUrl,
				dataType: "json",
				data: {
					checkId: function() {
						return checkValue;
					}
				},
				timeout: 20000,
				success: function(data, textStatus) {
					if (data.msg == 1){
						$.ligerDialog.success(data.msgbox,function(){
							if(urlObj){
								location.href = urlObj.val();
							}else{
								location.reload();
							}
						});
					} else {
                    	$.ligerDialog.warn(data.msgbox);
					}
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					$.ligerDialog.error("状态：" + textStatus + "；出错提示：" + errorThrown);
				}
			});
		}
	});
}

//单击执行AJAX请求操作
function clickSubmit(sendUrl){
	$.ajax({
		type: "POST",
		url: sendUrl,
		dataType: "json",
		timeout: 20000,
		success: function(data, textStatus) {
			if (data.msg == 1){
				$.ligerDialog.success(data.msgbox,function(){
					location.reload();
				});
			} else {
				$.ligerDialog.warn(data.msgbox);
			}
		},
		error: function (XMLHttpRequest, textStatus, errorThrown) {
			$.ligerDialog.error("状态：" + textStatus + "；出错提示：" + errorThrown);
		}
	});
}

/*表单AJAX提交封装(包含验证)*/
function AjaxInitForm(formId, btnId, isDialog, urlId){
    var formObj = $('#' + formId);
	var btnObj = $("#" + btnId);
	var urlObj = $("#" + urlId);
	formObj.validate({
		errorElement: "span",
		success: function(label) {
            label.text(" ").addClass("success");
        },
		submitHandler: function(form) {
			//AJAX提交表单
            $(form).ajaxSubmit({
                beforeSubmit: formRequest,
                success: formResponse,
                error: formError,
                url: formObj.attr("url"),
                type: "post",
                dataType: "json",
                timeout: 60000
            });
            return false;
		}
	});
    
    //表单提交前
    function formRequest(formData, jqForm, options) {
        btnObj.attr("disabled", "disabled");
        btnObj.val("提交中...");
    }

    //表单提交后
    function formResponse(data, textStatus) {
        if (data.msg == 1) {
            btnObj.val("提交成功");
			//是否提示，默认不提示
			if(isDialog == 1){
				$.ligerDialog.success(data.msgbox,function(){
					if(data.url){
						location.href = data.url;
					}else if(urlObj.length > 0 && urlObj.val() != ""){
						location.href = urlObj.val();
					}else{
						location.reload();
					}
				});
			}else{
				if(data.url){
					location.href = data.url;
				}else if(urlObj){
					location.href = urlObj.val();
				}else{
					location.reload();
				}
			}
        } else {
            $.ligerDialog.warn(data.msgbox);
            btnObj.attr("disabled", "");
            btnObj.val("再次提交");
        }
    }
    //表单提交出错
    function formError(XMLHttpRequest, textStatus, errorThrown) {
        $.ligerDialog.error("状态：" + textStatus + "；出错提示：" + errorThrown);
        btnObj.attr("disabled", "");
        btnObj.val("再次提交");
    }
}

/*显示AJAX分页列表*/
function AjaxPageList(listDiv, pageDiv, pageSize, pageCount, sendUrl) {
    //pageIndex -页面索引初始值
    //pageSize -每页显示条数初始化
    //pageCount -取得总页数
	InitComment(0);//初始化评论数据
	$(pageDiv).pagination(pageCount, {
		callback: pageselectCallback,
		prev_text: "« 上一页",
		next_text: "下一页 »",
		items_per_page:pageSize,
		num_display_entries:3,
		current_page:0,
		num_edge_entries:5,
		link_to:"javascript:;"
	});
	
    //分页点击事件
    function pageselectCallback(page_id, jq) {
        InitComment(page_id);
    }
    //请求评论数据
    function InitComment(page_id) {                                
        page_id++;
		$.ajax({ 
            type: "POST",
            dataType: "text",
            url: sendUrl + "&page_size=" + pageSize + "&page_index=" + page_id,
            success: function(data) {
                $(listDiv).html(data);
            }
        });
    }
}
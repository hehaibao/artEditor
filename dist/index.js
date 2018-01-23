/**
 * 移动端富文本编辑器
 * @author ganzw@gmail.com
 * @url    https://github.com/baixuexiyang/artEditor
 */

;(function($) {
    $.extend($.fn, {
        _opt: {
            imgTar: '#uploadfile', //图片上传按钮
            placeholader: "请输入内容", //富文本编辑器holder
            validHtml: ["<br/>"], //粘贴时，去除不合法的html标签
            limitSize: 5, //图片最大限制，默认5兆
            showServer: !1, //显示从服务端返回的图片，默认是显示本地资源的图片
            uploadUrl: '', //图片上传路径
            breaks: false, //换行符，非Firefox默认为div，如果该值为true，则换行符替换为br
            compressSize: 2, //图片超过大小会被压缩，单位（兆）
            data: {}, //上传图片其他参数，例如：{type: 1}
            uploadField: 'file', //上传图片字段, file
            formInputId: 'target', //表单隐藏域id，如果设置，则编辑器内容会储存到该元素value值
            beforeUpload: {}, //图片上传之前的回调（function）,参数图片base64数据
            uploadSuccess: {}, //图片上传成功回调
            uploadError: {}, //图片上传失败回调
        },
        artEditor: function (e) {
            var t = this,
                a = {
                    "-webkit-user-select": "text",
                    "user-select": "text",
                    "overflow-y": "auto",
                    "text-break": "brak-all",
                    outline: "none",
                    cursor: "text"
                };
            $(this).css(a).attr("contenteditable", !0), t._opt = $.extend(t._opt, e);
            try {
                $(t._opt.imgTar).on("change", function (e) {
                    var a = e.target.files[0];
                    if (e.target.value = "", Math.ceil(a.size / 1024 / 1024) > t._opt.limitSize) {
                        return t._opt.uploadError("文件太大，上传失败");
                    }  else {
                        var o = new FileReader;
                        o.readAsDataURL(a), o.onload = function (e) {
                            var o = e.target.result,
                                r = new Image;
                            if (r.src = e.target.result, t._opt.compressSize && Math.ceil(a.size / 1024 / 1024) > t._opt.compressSize &&
                                setTimeout(function () {
                                o = t.compressHandler(r)
                            }, 10), t._opt.beforeUpload && "function" == typeof t._opt.beforeUpload && (o = t._opt.beforeUpload(
                                o)), t._opt.showServer) return void t.upload(o);
                            var i = '<img src="' + o + '" style="max-width:100%;" />';
                            t.insertImage(i)
                        }
                    }
                }), t.placeholderHandler(), t.pasteHandler()
            } catch (e) {
                console.log(e)
            }
            t._opt.formInputId && $("#" + t._opt.formInputId)[0] && $(t).on("input", function() {
                $("#" + t._opt.formInputId).val(t.getValue())
            }), $(this).on("input click", function () {
                return setTimeout(function () {
                    var e = window.getSelection ? window.getSelection() : document.selection;
                    t.range = e.createRange ? e.createRange() : e.getRangeAt(0)
                }, 10), !1
            }), !/firefox/.test(navigator.userAgent.toLowerCase()) && this._opt.breaks && $(this).keydown(function (e) {
                if (13 === e.keyCode) return document.execCommand("insertHTML", !1, "<br/><br/>"), !1
            })
        },
        compressHandler: function (e) {
            var t, a = document.createElement("canvas"),
                o = a.getContext("2d"),
                r = document.createElement("canvas"),
                i = r.getContext("2d"),
                n = (e.src.length, e.width),
                l = e.height;
            (t = n * l / 4e6) > 1 ? (t = Math.sqrt(t), n /= t, l /= t) : t = 1, a.width = n, a.height = l, o.fillStyle =
                "#fff", o.fillRect(0, 0, a.width, a.height);
            var s;
            if ((s = n * l / 1e6) > 1) {
                s = ~~ (Math.sqrt(s) + 1);
                var c = ~~ (n / s),
                    p = ~~ (l / s);
                r.width = c, r.height = p;
                for (var d = 0; d < s; d++) for (var g = 0; g < s; g++) i.drawImage(e, d * c * t, g * p * t, c * t, p * t,
                            0, 0, c, p), o.drawImage(r, d * c, g * p, c, p)
            } else o.drawImage(e, 0, 0, n, l);
            var h = a.toDataURL("image/jpeg", .1);
            return r.width = r.height = a.width = a.height = 0, h
        },
        upload: function (e) {
            var t = this,
                a = t._opt.uploadField || "uploadfile",
                o = $.extend(t._opt.data, {});
            o[a] = e, $.ajax({
                url: t._opt.uploadUrl,
                type: "post",
                data: o,
                cache: !1,
                success: function(result) {
                    var imgPath = t._opt.uploadSuccess(result);
                    if(imgPath) {
                        var o = '<img src="' + imgPath + '" style="max-width:100%;" />';
                        t.insertImage(o);
                    } else {
                        t._opt.uploadError(result.status);
                    }
                },
                error: function(e) {
                    t._opt.uploadError(e.status)
                }
            })
        },
        insertImage: function (e) {
            $(this).focus();
            var t, a = window.getSelection ? window.getSelection() : document.selection;
            if (this.range ? (t = this.range, this.range = null) : t = a.createRange ? a.createRange() : a.getRangeAt(0),
                window.getSelection) {
                t.collapse(!1);
                for (var o = t.createContextualFragment(e), r = o.lastChild; r && "br" == r.nodeName.toLowerCase() && r.previousSibling &&
                    "br" == r.previousSibling.nodeName.toLowerCase();) {
                    var i = r;
                    r = r.previousSibling, o.removeChild(i)
                }
                t.insertNode(t.createContextualFragment("<br/>")), t.insertNode(o), r && (t.setEndAfter(r), t.setStartAfter(
                    r)), a.removeAllRanges(), a.addRange(t)
            } else t.pasteHTML(e), t.collapse(!1), t.select();
            this._opt.formInputId && $("#" + this._opt.formInputId)[0] && $("#" + this._opt.formInputId).val(this.getValue())
        },
        pasteHandler: function () {
            var e = this;
            $(this).on("paste", function (t) {
                console.log(t.clipboardData.items);
                var a = $(this).html();
                console.log(a), valiHTML = e._opt.validHtml, a = a.replace(/_moz_dirty=""/gi, "").replace(/\[/g, "[[-").replace(
                    /\]/g, "-]]").replace(/<\/ ?tr[^>]*>/gi, "[br]").replace(/<\/ ?td[^>]*>/gi, "  ").replace(
                    /<(ul|dl|ol)[^>]*>/gi, "[br]").replace(/<(li|dd)[^>]*>/gi, "[br]").replace(/<p [^>]*>/gi, "[br]").replace(
                    new RegExp("<(/?(?:" + valiHTML.join("|") + ")[^>]*)>", "gi"), "[$1]").replace(new RegExp(
                    '<span([^>]*class="?at"?[^>]*)>', "gi"), "[span$1]").replace(/<[^>]*>/g, "").replace(/\[\[\-/g, "[").replace(
                    /\-\]\]/g, "]").replace(new RegExp("\\[(/?(?:" + valiHTML.join("|") + "|img|span)[^\\]]*)\\]", "gi"),
                    "<$1>"), /firefox/.test(navigator.userAgent.toLowerCase()) || (a = a.replace(/\r?\n/gi, "<br>")), $(
                    this).html(a)
            })
        },
        placeholderHandler: function () {
            var e = this,
                t = /<img\s*([\w]+=(\"|\')([^\"\']*)(\"|\')\s*)*\/?>/;
            $(this).on("focus", function () {
                $.trim($(this).text()) === e._opt.placeholader && $(this).html("")
            }).on("blur", function () {
                $.trim($(this).text()) || t.test($(this).html()) || $(this).html(
                    '<div class="placeholader" style="pointer-events: none;">' + e._opt.placeholader + "</div>")
            }), $.trim($(this).text()) || t.test($(this).html()) || $(this).html(
                '<div class="placeholader" style="pointer-events: none;">' + e._opt.placeholader + "</div>")
        },
        getValue: function () {
            return $(this).html()
        },
        setValue: function (e) {
            $(this).html(e)
        }
    });
})(window.Zepto || window.jQuery);

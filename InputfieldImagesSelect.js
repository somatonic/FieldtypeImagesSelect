
;(function($, config, document){

    $(document).ready(function() {

        /**
         * Setup a live change event for the delete links
         *
         */

        if($.browser.msie && $.browser.version < 9) {

            // $(".InputfieldFileDelete span.ui-icon").live("click", function() {
            $(".InputfieldImagesSelectDelete").on("click", "span.ui-icon", function() {

                var input = $(this).prev('input');
                if(input.is(":checked")){
                    input.removeAttr("checked");
                } else {
                    input.attr({"checked":"checked"});
                }

                setInputfieldFileStatus(input);

            });

        } else {
            // not IE < 9
            // $(this).find(".InputfieldFileDelete input").live('change', function() {
            $(document).on('change', '.InputfieldImagesSelectDelete input', function() {
                // alert("test");
                setInputfieldFileStatus($(this));

            }).on('dblclick', '.InputfieldImagesSelectDelete', function() {
                // enable double-click to delete all
                var $input = $(this).find('input');
                var $items = $(this).parents('.InputfieldImagesSelectList').find('.InputfieldImagesSelectDelete input');
                if($input.is(":checked")) $items.removeAttr('checked').change();
                    else $items.attr('checked', 'checked').change();
                return false;
            });

        }

        function setInputfieldFileStatus($t) {
            if($t.is(":checked")) {
                // not an error, but we want to highlight it in the same manner
                $t.parents(".InputfieldImagesSelectInfo").addClass("ui-state-error")
                    .siblings(".InputfieldImagesSelectData").slideUp("fast");

            } else {
                $t.parents(".InputfieldImagesSelectInfo").removeClass("ui-state-error")
                    .siblings(".InputfieldImagesSelectData").slideDown("fast");
            }
        }


        if(typeof config.LanguageSupport != "undefined") {
            $(".InputfieldImagesSelectLanguageSupport").each(function() {
                var $item = $(this).find('.InputfieldImagesSelectDescription:eq(0)');
                if($item.width() <= 250) $(this).addClass('stacked');
            });
        }


        $(document).on('click', '.InputfieldImagesSelect .InputfieldImagesSelectMove', function() {

            var $li = $(this).parent('p').parent('li');
            var $ul = $li.parent();

            if($(this).is('.InputfieldImagesSelectMoveTop')) $ul.prepend($li);
                else $ul.append($li);

            $ul.children('li').each(function(n) {
                $(this).find('.InputfieldImagesSelectSort').val(n);
            });

            return false;
        });

    });

    /**
     * Make the lists sortable and hoverable
     *
     */
    function initSortable($fileLists) {

        // console.log("imagesSelect sortable init");

        $fileLists.each(function() {

            var $this = $(this);
            var qty = $this.children("li").size();

            var $inputfield = $this.closest('.Inputfield');

            if(qty < 2) {
                // added to support additional controls when multiple items are present
                // and to hide them when not present
                if(qty == 0) $inputfield.addClass('InputfieldImagesSelectEmpty').removeClass('InputfieldImagesSelectMultiple InputfieldImagesSelectSingle');
                    else $inputfield.addClass('InputfieldImagesSelectSingle').removeClass('InputfieldImagesSelectEmpty InputfieldImagesSelectMultiple');
                // if we're dealing with a single item list, then don't continue with making it sortable
                return;
            } else {
                $this.closest('.Inputfield').removeClass('InputfieldImagesSelectSingle InputfieldImagesSelectEmpty').addClass('InputfieldImagesSelectMultiple');
            }

            $this.sortable({
                //axis: 'y',
                start: function(e, ui) {
                    ui.item.children(".InputfieldImagesSelectInfo").addClass("ui-state-highlight");
                },
                stop: function(e, ui) {
                    $(this).children("li:not(.template)").each(function(n) {
                        $(this).find(".InputfieldImagesSelectSort").val(n);
                    });
                    ui.item.children(".InputfieldImagesSelectInfo").removeClass("ui-state-highlight");
                    // Firefox has a habit of opening a lightbox popup after a lightbox trigger was used as a sort handle
                    // so we keep a 500ms class here to keep a handle on what was a lightbox trigger and what was a sort
                    $inputfield.addClass('InputfieldImagesSelectJustSorted');
                    setTimeout(function() { $inputfield.removeClass('InputfieldImagesSelectJustSorted'); }, 500);
                }
            });


        }).find(".ui-widget-header, .ui-state-default").hover(function() {
            // $(this).addClass('ui-state-hover');
        }, function() {
            // $(this).removeClass('ui-state-hover');
        });
    }


    function ImagesSelectSearch(){

    // var ImagesSelectSearch = {

        this.init = function(name, url) {

            var that = this;

            that.name = name;
            that.url = url;

            // that.searchInput= $('#Inputfield_' + name + '_queryImagesSelect');
            that.resultsMarkupField = $('#Inputfield_' + name + '_resultsMarkupField');
            that.resultsOutput = $('#' + name + '_resultsOutput');
            that.spinner = $("<span id='"+name+"_ImagesSearchSpinner'> <i class='fa fa-lg fa-spin fa-spinner'></i></span>");
            that.resultsMarkupField.find("label").append(that.spinner.hide());

            $("#Inputfield_" + that.name + "_selectorImagesSelect").on("change", function(){
                // console.log("search: " + $(this).val());
                that.search($(this).val());
            });

            // clone add an new image to the list
            that.resultsOutput.on("click", "button.ImagesSearch_resultAdd", function(e){

                e.preventDefault();
                var count = $(".Inputfield_"+name).find(".InputfieldImagesSelectItem").length - 1;

                var $template = $(".Inputfield_"+name).find(".InputfieldImagesSelectItem.template").eq(0);
                var $inputfields = $(".Inputfield_"+name).find("ul.InputfieldImagesSelectList");
                var $clone = $template.clone();

                var id = $(this).data("id");
                var nameID = name + "_" + id;

                $clone.find(".InputfieldImagesSelectRemoteImage").attr("name", "remoteimage_" + nameID);
                $clone.find(".InputfieldImagesSelectRemoteImage").val(id);

                $clone.find(".InputfieldImagesSelectSort").attr("name", "sort_" + nameID);
                $clone.find(".InputfieldImagesSelectSort").attr("value", count);

                $clone.find(".InputfieldImagesSelectLink").attr("href", $(this).data("url"));
                $clone.find(".InputfieldImagesSelectLink img").attr("src", $(this).closest('tr').find('img').attr("src"));

                $clone.find(".InputfieldImagesSelectEdit a").attr("href", config.urls.admin + "page/edit/?id="+id);

                $clone.find(".InputfieldImagesSelectName").html($(this).data("basename"));

                $clone.find(".InputfieldImagesSelectDescription textarea").html($(this).data("descr"));
                $clone.find(".InputfieldImagesSelectDescription label").attr("for", "description_" + nameID);
                $clone.find(".InputfieldImagesSelectDescription textarea").attr("id", "description_" + nameID);
                $clone.find(".InputfieldImagesSelectDescription textarea").attr("name", "description_" + nameID);

                $clone.find(".InputfieldImagesSelectDelete input").attr("name", "delete_" + nameID);

                $clone.removeClass("template").appendTo($inputfields);
                $inputfields.parent().effect("highlight", 500);


                var ids = '';
                $inputfields.find("li.InputfieldImagesSelectItem:not(.template)").each(function(i){
                    var $item = $(this).find("input.InputfieldImagesSelectRemoteImage");
                    ids += $item.val() + ",";
                });
                // console.log(ids);

                ids = ids.substr(0, ids.length - 1);
                var $field = $inputfields.closest("div").find(".InputfieldImagesIds");
                $field.val(ids);
                $field.trigger("change");

                initSortable($(".InputfieldImagesSelectList"));

                return false;
            });


        };

        this.search = function(selector){
            // console.log(selector);
            // console.log(this.name);
            var that = this;
            // console.log("..searching");
            $.ajax({
                url: that.url,
                type: "post",
                data: {selector: selector},
                beforeSend: function(){
                    if(selector) { // trigger showIf dependencies only if a selector is present
                        that.spinner.show();
                        $("input#Inputfield_" + that.name + "_filterImagesIsSearching").attr("value", 1);
                        $("input#Inputfield_" + that.name + "_filterImagesIsSearching").trigger("change");
                    }
                },
                success: function(data){
                    // console.log(data);
                    if(data){
                        that.resultsOutput.html(data);
                    } else {
                        that.resultsOutput.html();
                    }
                    that.spinner.hide();
                }

            });
        };

    };


    var magnificOptions = {
        type: 'image',
        closeOnContentClick: true,
        closeBtnInside: true,
        image: {
            titleSrc: function(item) {
                return item.el.find('img').attr('alt');
            }
        },
        callbacks: {
            open: function() {
                // for firefox, which launches Magnific after a sort
                if($(".InputfieldImagesSelectJustSorted").size() > 0) this.close();
            }
        }
    };


    $(document).ready(function() {
        // inital init for normal non ajax non repeater inputfields
        initScripts();

        // event scope on pseudo dummy .InputfieldImagesSelectLoader as it contains no .Inputfield
        // otherwise this gets triggered for each containing .Inputfield
        $(document).on('reloaded', ".InputfieldImagesSelectLoader", function(event, source) {
            initScripts();
        }).on('wiretabclick', function(e, $newTab, $oldTab) {

        }).on('opened', '.InputfieldImagesSelect', function() {
            //console.log('InputfieldImage opened');

        });

        function initScripts(){
            $(".imagesmanager-button:not(.isloaded)").each(function(){
                var $im_link_container = $(this);
                var href = $(this).find('a').attr('href');
                var $link = $(this).find('a');
                var $button = $(this).find('button');
                $button.unbind("click");
                $link.addClass("isloaded");
                $im_link_container.closest(".InputfieldContent").find(".langTabs").append($im_link_container);
            });

            initSortable($(".InputfieldImagesSelectList:not(.ui-sortable)"));

            $("a.InputfieldImagesSelectLink").magnificPopup(magnificOptions);

            var ImagesSelectInstances = [];

            $(".InputfieldImagesSelect:not(.islodaded)").each(function(){
                var url = $(this).find(".ImagesSelectSearch").data("ajax-url");
                var name = $(this).find(".InputfieldImagesSelectList").data("inputfield-name");
                ImagesSelectInstances[name] = new ImagesSelectSearch();
                ImagesSelectInstances[name].init(name, url);
                $(this).addClass("islodaded");
            });
        }

    });

})(jQuery, config, document);








$(document).ready(function() {

    /**
     * Setup a live change event for the delete links
     *
     */

    if($.browser.msie && $.browser.version < 9) {

        // $(".InputfieldFileDelete span.ui-icon").live("click", function() {
        $(".InputfieldFileDelete").on("click", "span.ui-icon", function() {

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
        $(document).on('change', '.InputfieldFileDelete input', function() {
            setInputfieldFileStatus($(this));

        }).on('dblclick', '.InputfieldFileDelete', function() {
            // enable double-click to delete all
            var $input = $(this).find('input');
            var $items = $(this).parents('.InputfieldImagesSelectList').find('.InputfieldFileDelete input');
            if($input.is(":checked")) $items.removeAttr('checked').change();
                else $items.attr('checked', 'checked').change();
            return false;
        });

    }

    function setInputfieldFileStatus($t) {
        if($t.is(":checked")) {
            // not an error, but we want to highlight it in the same manner
            $t.parents(".InputfieldFileInfo").addClass("ui-state-error")
                .siblings(".InputfieldFileData").slideUp("fast");

        } else {
            $t.parents(".InputfieldFileInfo").removeClass("ui-state-error")
                .siblings(".InputfieldFileData").slideDown("fast");
        }
    }

    /**
     * Make the lists sortable and hoverable
     *
     */
    function initSortable($fileLists) {

        $fileLists.each(function() {

            var $this = $(this);
            var qty = $this.children("li").size();

            var $inputfield = $this.closest('.Inputfield')

            if(qty < 2) {
                // added to support additional controls when multiple items are present
                // and to hide them when not present
                if(qty == 0) $inputfield.addClass('InputfieldFileEmpty').removeClass('InputfieldFileMultiple InputfieldFileSingle');
                    else $inputfield.addClass('InputfieldFileSingle').removeClass('InputfieldFileEmpty InputfieldFileMultiple');
                // if we're dealing with a single item list, then don't continue with making it sortable
                return;
            } else {
                $this.closest('.Inputfield').removeClass('InputfieldFileSingle InputfieldFileEmpty').addClass('InputfieldFileMultiple');
            }

            $this.sortable({
                //axis: 'y',
                start: function(e, ui) {
                    ui.item.children(".InputfieldFileInfo").addClass("ui-state-highlight");
                },
                stop: function(e, ui) {
                    $(this).children("li:not(.template)").each(function(n) {
                        $(this).find(".InputfieldFileSort").val(n);
                    });
                    ui.item.children(".InputfieldFileInfo").removeClass("ui-state-highlight");
                    // Firefox has a habit of opening a lightbox popup after a lightbox trigger was used as a sort handle
                    // so we keep a 500ms class here to keep a handle on what was a lightbox trigger and what was a sort
                    $inputfield.addClass('InputfieldFileJustSorted');
                    setTimeout(function() { $inputfield.removeClass('InputfieldFileJustSorted'); }, 500);
                }
            });

        }).find(".ui-widget-header, .ui-state-default").hover(function() {
            $(this).addClass('ui-state-hover');
        }, function() {
            $(this).removeClass('ui-state-hover');
        });
    }



    /**
     * MAIN
     *
     */

    initSortable($(".InputfieldImagesSelectList"));


    if(typeof config.LanguageSupport != "undefined") {
        $(".InputfieldFileLanguageSupport").each(function() {
            var $item = $(this).find('.InputfieldFileDescription:eq(0)');
            if($item.width() <= 250) $(this).addClass('stacked');
        });
    }

});



// inputfield image

$(document).ready(function() {

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
                if($(".InputfieldFileJustSorted").size() > 0) this.close();
            }
        }
    };

    $("a.InputfieldFileLink").magnificPopup(magnificOptions);

    $(document).on('click', '.InputfieldImage .InputfieldFileMove', function() {

        var $li = $(this).parent('p').parent('li');
        var $ul = $li.parent();

        if($(this).is('.InputfieldFileMoveTop')) $ul.prepend($li);
            else $ul.append($li);

        $ul.children('li').each(function(n) {
            $(this).find('.InputfieldFileSort').val(n);
        });

        return false;
    });



    // var $listToggle = $("<a class='InputfieldImageListToggle HideIfEmpty' href='#'></a>")
    //     .append("<i class='fa fa-th'></i>");
    // $(".InputfieldImage .InputfieldHeader").append($listToggle);
    // $(document).on('click', '.InputfieldImageListToggle', function() {
    //     var $parent = $(this).parents(".InputfieldImage");
    //     if($parent.hasClass('InputfieldImageGrid')) unsetGridMode($parent);
    //         else setGridMode($parent);
    //     return false;
    // });

    // $(".InputfieldImage").find(".InputfieldImageDefaultGrid").each(function() {
    //     setGridMode($(this).parents(".InputfieldImage"));
    // });




});


var ImagesSelectSearch = {

    init: function(name, url) {
        var that = this;

        that.name = name;
        that.url = url;

        that.searchInput= $('#Inputfield_' + name + '_queryImagesSelect');
        that.resultsMarkupField = $('#Inputfield_' + name + '_resultsMarkupField');
        that.resultsOutput = $('#' + name + '_resultsOutput');
        that.spinner = $("<span id='"+name+"_ImagesSearchSpinner'> <i class='fa fa-lg fa-spin fa-spinner'></i></span>");
        that.resultsMarkupField.find("label").append(that.spinner.hide());

        console.log(that.url);

        // capture enter key
        that.searchInput.on("keydown", function(e) {
            if(e.keyCode == 13) {
                e.preventDefault();
                return false;
            }

        });


        that.searchInput.on("keyup", function(e) {
            e.preventDefault();
            var parent = $("[name='" + that.name + "_categoryFilterImagesSelect']").val();
            parent = parent ? parent : "1";
            var term = $(this).val();
            if(term.length > 1) {
                that.search(term, parent);
            }
            return false;
        });

        $("#Inputfield_" + that.name + "_selectorImagesSelect").on("change", function(){
            // console.log($(this));
            that.search($(this).val());
        });

        // $("select, input", "#" + that.name + "_filterFormImagesSelect").each(function(){
        //     console.log($(this));
        // });


        // clone add an new image to the list
        that.resultsOutput.on("click", "button.ImagesSearch_resultAdd", function(e){

            e.preventDefault();
            var count = $(".Inputfield_"+name).find(".InputfieldFileItem").length - 1;

            var $template = $(".Inputfield_"+name).find(".InputfieldFileItem.template").eq(0);
            var $inputfields = $(".Inputfield_"+name).find("ul.InputfieldImagesSelectList");
            var $clone = $template.clone();

            var id = $(this).data("id");
            var nameID = name + "_" + id;

            $clone.find(".InputfieldFileRemoteImage").attr("name", "remoteimage_" + nameID);
            $clone.find(".InputfieldFileRemoteImage").val(id);

            $clone.find(".InputfieldFileSort").attr("name", "sort_" + nameID);
            $clone.find(".InputfieldFileSort").attr("value", count);

            $clone.find(".InputfieldFileLink").attr("href", $(this).data("url"));
            $clone.find(".InputfieldFileLink img").attr("src", $(this).closest('tr').find('img').attr("src"));

            $clone.find(".InputfieldFileEdit a").attr("href", config.urls.admin + "page/edit/?id="+id);

            $clone.find(".InputfieldFileName").html($(this).data("basename"));

            $clone.find(".InputfieldFileDescription textarea").html($(this).data("descr"));
            $clone.find(".InputfieldFileDescription label").attr("for", "description_" + nameID);
            $clone.find(".InputfieldFileDescription textarea").attr("id", "description_" + nameID);
            $clone.find(".InputfieldFileDescription textarea").attr("name", "description_" + nameID);

            $clone.find(".InputfieldFileDelete input").attr("name", "delete_" + nameID);

            $clone.removeClass("template").appendTo($inputfields);
            $inputfields.parent().effect("highlight", 500);


            var ids = '';
            $inputfields.find("li.InputfieldFileItem:not(.template)").each(function(i){
                var $item = $(this).find("input.InputfieldFileRemoteImage");
                ids += $item.val() + ",";
            });
            // console.log(ids);

            ids = ids.substr(0, ids.length - 1);
            var $field = $inputfields.closest("div").find(".InputfieldImagesIds");
            $field.val(ids);
            $field.trigger("change");

            return false;
        });


    },

    search: function(selector){
        console.log(selector);
        var that = this;
        // console.log("..searching");
        $.ajax({
            url: that.url,
            type: "post",
            data: {selector: selector},
            beforeSend: function(){
                that.spinner.show();
                $("input#Inputfield_" + that.name + "_filterImagesIsSearching").attr("value", 1);
                $("input#Inputfield_" + that.name + "_filterImagesIsSearching").trigger("change");
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
    }

};

$(document).ready(function() {



    // $(".ImagesSelectSearch").each(function(i){
    //     var $search = $(this).find('input[name*="_queryImagesSelect"]');

    //     $search.on("keydown", function(e){
    //         if(e.keyCode == 13) {
    //             e.preventDefault();
    //             return false;
    //         }

    //     });
    //     $search.on("keyup", function(e){
    //         e.preventDefault();
    //         var term = $(this).val();
    //         if(term.length > 2){
    //             ImagesSelectSearch(term);
    //         }

    //         // do search
    //         // alert($(this).val());
    //         return false;
    //     });
    // });




});














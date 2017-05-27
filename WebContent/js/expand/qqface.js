/**
 * Created by PrincessofUtopia on 2016/4/7.
 */

jQuery.extend({
    unselectContents: function(){
        if(window.getSelection)
            window.getSelection().removeAllRanges();
        else if(document.selection)
            document.selection.empty();
    }
});
jQuery.fn.extend({
    selectContents: function(){
        $(this).each(function(i){
            var node = this;
            var selection, range, doc, win;
            if ((doc = node.ownerDocument) && (win = doc.defaultView) && typeof win.getSelection != 'undefined' && typeof doc.createRange != 'undefined' && (selection = window.getSelection()) && typeof selection.removeAllRanges != 'undefined'){
                range = doc.createRange();
                range.selectNode(node);
                if(i == 0){
                    selection.removeAllRanges();
                }
                selection.addRange(range);
            } else if (document.body && typeof document.body.createTextRange != 'undefined' && (range = document.body.createTextRange())){
                range.moveToElementText(node);
                range.select();
            }
        });
    },

    setCaret: function(){
        if(!$.browser.msie) return;
        var initSetCaret = function(){
            var textObj = $(this).get(0);
            textObj.caretPos = document.selection.createRange().duplicate();
        };
        $(this).click(initSetCaret).select(initSetCaret).keyup(initSetCaret);
    },
    /*textFeildValue*/
    insertAtHtml: function(html){

        document.getElementById('editArea').focus();

        var sel, range;
        if (window.getSelection) {
            // IE9 and non-IE
            sel = window.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                range = sel.getRangeAt(0);
                //range.deleteContents();
                var el = document.createElement("pre");
                //var ele = document.getElementById('editArea');
                html = html.replace(/\</g,'&lt;');
                html = html.replace(/\>/g,'&gt;');
                html = html.replace(/\n/g,'<br/>');
                html = html.replace(/\[em_([0-9]*)\]/g,'<img src="face/$1.png" width="24px" height="24px" >');
                el.innerHTML = html;
                var frag = document.createDocumentFragment(), node, lastNode;
                while ( (node = el.firstChild) ) {
                    lastNode = frag.appendChild(node);
                }
                range.insertNode(frag);
                // Preserve the selection
                if (lastNode) {
                    range = range.cloneRange();
                    range.setStartAfter(lastNode);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        } else if (document.selection && document.selection.type != "Control") {
            // IE < 9
            document.selection.createRange().pasteHTML(html);
        }
    }
});

// ft-adjustment: this file has all the JavaScript necessary for code blocks

// The scripts on this page add the following functionalities :
//    1. showing code copy buttons
//    2. handling expand/collapse of collapsible code blocks


///////////////// 1. JavaScript code to add code copy buttons to every code block ///////////////////////

(function () {
    "use strict";
  
    if (!document.queryCommandSupported("copy")) {
      return;
    }
  
    function flashCopyMessage(el, msg) {
      el.textContent = msg;
      setTimeout(function () {
        el.textContent = "Copy";
      }, 1000);
    }
  
    function selectText(node) {
      var selection = window.getSelection();
      var range = document.createRange();
      range.selectNodeContents(node);
      selection.removeAllRanges();
      selection.addRange(range);
      return selection;
    }
  
    function addCopyButton(containerEl) {
      var copyBtn = document.createElement("button");
      copyBtn.className = "highlight-copy-btn";
      copyBtn.textContent = "Copy";
  
      var codeEl = containerEl.firstElementChild;
      copyBtn.addEventListener("click", function () {
        try {
          var selection = selectText(codeEl);
          document.execCommand("copy");
          selection.removeAllRanges();
  
          flashCopyMessage(copyBtn, "Copied!");
        } catch (e) {
          console && console.log(e);
          flashCopyMessage(copyBtn, "Failed :'(");
        }
      });
  
      containerEl.appendChild(copyBtn);
    }
  
    // Add copy button to code blocks
    var highlightBlocks = document.getElementsByClassName("highlight");
    Array.prototype.forEach.call(highlightBlocks, addCopyButton);
  })();

///////////////// 2. JavaScript code to handle collapsible code blocks ///////////////////////

  var coll = document.getElementsByClassName("collapsible");
  var i;
  
  for (i = 0; i < coll.length; i++) {
    // get value of isCollapsed attribute
    var isCollapsed = coll[i].getAttribute("isCollapsed");
  
    // get the svg present in the collapsible element
    var svg = coll[i].getElementsByTagName("svg")[0];
  
    // if isCollapsed is true, then hide the content
    if (isCollapsed == "true") {
      coll[i].nextElementSibling.style.visibility = "collapse";
      // change the svg class to show the arrow pointing down
      svg.setAttribute("class", "dn");
    }
    // if isCollapsed is false, then show the content
    else if (isCollapsed == "false") {
      coll[i].nextElementSibling.style.visibility = "visible";
      // change the svg class to show the arrow pointing up
      svg.setAttribute("class", "up");
    }
    // if isCollapsed is not defined, then show the content
    else {
      coll[i].nextElementSibling.style.visibility = "collapse";
      // change the svg class to show the arrow pointing up
      svg.setAttribute("class", "up");
    }
  
    coll[i].addEventListener("click", function () {
      this.classList.toggle("active");
      var content = this.nextElementSibling;
      
      if (content.style.visibility == "collapse") {
        // if the content is collapsed, then show the content
        content.style.visibility = "visible";
  
        // change the svg class to show the arrow pointing up
        svg.setAttribute("class", "up");
      } else {
        // if the content is visible, then hide the content
        content.style.visibility = "collapse";
  
        // change the svg class to show the arrow pointing down
        svg.setAttribute("class", "dn");
      }
    });
  }
  
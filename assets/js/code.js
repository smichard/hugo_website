// ft-adjustment: this file has all the JavaScript necessary for code blocks

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

    // Single-line blocks: centre the button vertically instead of pinning it to the top
    if (codeEl.textContent.trim().indexOf("\n") === -1) {
      containerEl.classList.add("highlight--single-line");
    }

    containerEl.appendChild(copyBtn);
  }

  // Add copy button to code blocks
  var highlightBlocks = document.getElementsByClassName("highlight");
  Array.prototype.forEach.call(highlightBlocks, addCopyButton);
})();

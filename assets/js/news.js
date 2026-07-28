(function () {
  "use strict";

  var MAX_ITEMS = 18;
  var MAX_DESC = 120;
  var grid = document.getElementById("feed-grid");
  var loading = document.getElementById("feed-loading");
  var error = document.getElementById("feed-error");

  if (!grid || !loading || !error) return;

  var feedUrl = grid.dataset.feedUrl;

  function getText(element, tag, namespace) {
    var node = namespace
      ? element.getElementsByTagNameNS(namespace, tag)[0]
      : element.getElementsByTagName(tag)[0];
    return node ? (node.textContent || "").trim() : "";
  }

  function getThumbnail(item) {
    var mediaContent = item.getElementsByTagNameNS(
      "http://search.yahoo.com/mrss/",
      "content"
    )[0];
    if (mediaContent && mediaContent.getAttribute("url")) {
      return mediaContent.getAttribute("url");
    }

    var enclosure = item.getElementsByTagName("enclosure")[0];
    if (
      enclosure &&
      (enclosure.getAttribute("type") || "").startsWith("image/")
    ) {
      return enclosure.getAttribute("url");
    }
    return null;
  }

  function stripHtml(html) {
    var container = document.createElement("div");
    container.innerHTML = html;
    return container.textContent || container.innerText || "";
  }

  function truncate(text, max) {
    text = text.trim();
    return text.length > max
      ? text.slice(0, max).replace(/\s+\S*$/, "") + "…"
      : text;
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function getDomain(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch (exception) {
      return "";
    }
  }

  function makePlaceholder(link) {
    var domain = getDomain(link);
    var placeholder = document.createElement("div");
    placeholder.className = "feed-card-image-placeholder";

    if (domain) {
      var favicon = document.createElement("img");
      favicon.className = "feed-card-favicon";
      favicon.src =
        "https://www.google.com/s2/favicons?domain=" +
        encodeURIComponent(domain) +
        "&sz=128";
      favicon.alt = domain;

      var label = document.createElement("span");
      label.className = "feed-card-domain";
      label.textContent = domain;

      placeholder.appendChild(favicon);
      placeholder.appendChild(label);
    }

    return placeholder;
  }

  function renderCard(data) {
    var card = document.createElement("div");
    card.className = "feed-card";

    var media = document.createElement("div");
    media.className = "feed-card-media";

    if (data.thumbnail) {
      var image = document.createElement("img");
      image.className = "feed-card-image";
      image.src = data.thumbnail;
      image.alt = data.title;
      image.loading = "lazy";
      image.decoding = "async";
      image.onerror = function () {
        media.replaceChild(makePlaceholder(data.link), image);
      };
      media.appendChild(image);
    } else {
      media.appendChild(makePlaceholder(data.link));
    }

    card.appendChild(media);

    var body = document.createElement("div");
    body.className = "feed-card-body";

    var date = document.createElement("div");
    date.className = "feed-card-date";
    date.textContent = formatDate(data.pubDate);

    var title = document.createElement("h3");
    title.className = "feed-card-title";
    var titleLink = document.createElement("a");
    titleLink.href = data.link;
    titleLink.target = "_blank";
    titleLink.rel = "noopener noreferrer";
    titleLink.textContent = data.title;
    title.appendChild(titleLink);

    var description = document.createElement("p");
    description.className = "feed-card-desc";
    description.textContent = truncate(stripHtml(data.description), MAX_DESC);

    var link = document.createElement("a");
    link.className = "feed-card-link";
    link.href = data.link;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Read more →";

    body.appendChild(date);
    body.appendChild(title);
    body.appendChild(description);
    body.appendChild(link);
    card.appendChild(body);

    return card;
  }

  function showError(message) {
    loading.remove();
    error.hidden = false;
    error.textContent = message;
  }

  if (!feedUrl) {
    showError("No news feed configured.");
    return;
  }

  fetch(feedUrl)
    .then(function (response) {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.text();
    })
    .then(function (xmlText) {
      var documentNode = new DOMParser().parseFromString(
        xmlText,
        "application/xml"
      );
      if (documentNode.querySelector("parsererror")) {
        throw new Error("Invalid RSS feed");
      }

      var items = Array.prototype.slice.call(
        documentNode.getElementsByTagName("item"),
        0,
        MAX_ITEMS
      );
      loading.remove();

      if (items.length === 0) {
        error.hidden = false;
        error.textContent = "No posts found.";
        return;
      }

      items.forEach(function (item) {
        grid.appendChild(
          renderCard({
            title: getText(item, "title"),
            link: getText(item, "link"),
            pubDate: getText(item, "pubDate"),
            description: getText(item, "description"),
            thumbnail: getThumbnail(item),
          })
        );
      });
    })
    .catch(function (exception) {
      showError("Failed to load posts: " + exception.message);
    });
})();

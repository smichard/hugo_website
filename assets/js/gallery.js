// Shared client-side photo gallery: fetches the public GCS JSON API for the
// hugo_website_pictures bucket, shuffles, and renders a grid. No images are
// stored in this repo -- upload to the bucket and they show up automatically.
// Used by the homepage photo teaser and the full /photos/ gallery page.
window.initPhotoGallery = function (options) {
  var BUCKET = "hugo_website_pictures";
  var API_URL = "https://storage.googleapis.com/storage/v1/b/" + BUCKET + "/o?maxResults=1000";
  var IMAGE_EXTS = /\.(jpe?g|png|gif|webp|avif)$/i;

  var grid = document.getElementById(options.gridId);
  var loading = options.loadingId ? document.getElementById(options.loadingId) : null;
  var max = options.max || 30;
  var lightbox = options.lightboxId ? document.getElementById(options.lightboxId) : null;
  var lbImg = options.lightboxImgId ? document.getElementById(options.lightboxImgId) : null;
  var linkTo = options.linkTo || null;
  var closeBtn = null;
  var openTrigger = null;

  if (!grid) return;

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  function publicUrl(name) {
    return "https://storage.googleapis.com/" + BUCKET + "/" +
      name.split("/").map(function (part) { return encodeURIComponent(part); }).join("/");
  }

  if (lightbox && lbImg) {
    closeBtn = options.lightboxCloseId ? document.getElementById(options.lightboxCloseId) : null;
    var close = function () {
      if (!lightbox.classList.contains("active")) return;
      lightbox.classList.remove("active");
      lightbox.setAttribute("aria-hidden", "true");
      lightbox.hidden = true;
      lbImg.removeAttribute("src");
      lbImg.alt = "";
      document.body.style.overflow = "";
      if (openTrigger) openTrigger.focus();
      openTrigger = null;
    };
    if (closeBtn) closeBtn.addEventListener("click", close);
    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) close();
    });
    document.addEventListener("keydown", function (event) {
      if (!lightbox.classList.contains("active")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      } else if (event.key === "Tab" && closeBtn) {
        event.preventDefault();
        closeBtn.focus();
      }
    });
  }

  fetch(API_URL)
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (data) {
      var all = data.items || [];
      var imgs = all.filter(function (item) { return IMAGE_EXTS.test(item.name); });

      if (imgs.length === 0) {
        grid.setAttribute("aria-busy", "false");
        if (loading) loading.textContent = "No photos found.";
        return;
      }

      var selected = shuffle(imgs).slice(0, max);
      if (loading) loading.remove();
      grid.setAttribute("aria-busy", "false");

      selected.forEach(function (item) {
        var src = publicUrl(item.name);
        var alt = item.name.split("/").pop().replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ");
        var wrap = document.createElement(linkTo ? "a" : (lightbox ? "button" : "div"));
        wrap.className = "photo-grid-item";
        if (linkTo) {
          wrap.href = linkTo;
          wrap.setAttribute("aria-label", "View photo in full gallery: " + alt);
        } else if (lightbox) {
          wrap.type = "button";
          wrap.setAttribute("aria-label", "Open photo: " + alt);
        }

        if (lightbox && lbImg && !linkTo) {
          wrap.addEventListener("click", function () {
            openTrigger = wrap;
            lbImg.src = src;
            lbImg.alt = alt;
            lightbox.hidden = false;
            lightbox.setAttribute("aria-hidden", "false");
            lightbox.classList.add("active");
            document.body.style.overflow = "hidden";
            if (closeBtn) closeBtn.focus();
          });
        }

        var img = document.createElement("img");
        img.alt = alt;
        img.loading = "lazy";
        img.decoding = "async";
        img.onerror = function () { wrap.style.display = "none"; };
        img.src = src;

        wrap.appendChild(img);
        grid.appendChild(wrap);
      });
    })
    .catch(function (err) {
      grid.setAttribute("aria-busy", "false");
      if (loading) loading.textContent = "Failed to load photos: " + err.message;
    });
};

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
    var closeBtn = options.lightboxCloseId ? document.getElementById(options.lightboxCloseId) : null;
    var close = function () {
      lightbox.classList.remove("active");
      lbImg.src = "";
      document.body.style.overflow = "";
    };
    if (closeBtn) closeBtn.onclick = close;
    lightbox.onclick = function (e) { if (e.target === lightbox) close(); };
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
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
        if (loading) loading.textContent = "No photos found.";
        return;
      }

      var selected = shuffle(imgs).slice(0, max);
      if (loading) loading.remove();

      selected.forEach(function (item) {
        var src = publicUrl(item.name);
        var wrap = document.createElement(linkTo ? "a" : "div");
        wrap.className = "photo-grid-item";
        if (linkTo) wrap.href = linkTo;

        if (lightbox && lbImg && !linkTo) {
          wrap.onclick = function () {
            lbImg.src = src;
            lightbox.classList.add("active");
            document.body.style.overflow = "hidden";
          };
        }

        var img = document.createElement("img");
        img.alt = item.name.split("/").pop().replace(/\.[^.]+$/, "");
        img.loading = "lazy";
        img.onerror = function () { wrap.style.display = "none"; };
        img.src = src;

        wrap.appendChild(img);
        grid.appendChild(wrap);
      });
    })
    .catch(function (err) {
      if (loading) loading.textContent = "Failed to load photos: " + err.message;
    });
};

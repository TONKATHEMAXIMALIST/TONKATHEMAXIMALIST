/* Engineering pages: build privacy-enhanced YouTube embeds from videos.js.
   Markup: <figure class="video" data-code="T3" data-title="...">
   No link yet: a "coming soon" box keeps the slot. */
(function () {
    "use strict";
    var links = window.ENGINEERING_VIDEOS || {};

    function parse(link) {
        link = (link || "").trim();
        var m = link.match(/(?:shorts\/|youtu\.be\/|[?&]v=|embed\/)([A-Za-z0-9_-]{11})/) ||
                link.match(/^([A-Za-z0-9_-]{11})$/);
        return m ? { id: m[1], vertical: link.indexOf("/shorts/") !== -1 } : null;
    }

    Array.prototype.forEach.call(document.querySelectorAll(".video[data-code]"), function (fig) {
        var video = parse(links[fig.getAttribute("data-code")]);
        var frame = document.createElement("div");
        frame.className = "video-frame";

        if (!video) {
            frame.className += " video-placeholder";
            frame.innerHTML = "<span>Video coming soon</span>";
            fig.insertBefore(frame, fig.firstChild);
            return;
        }
        if (video.vertical) fig.classList.add("vertical");

        var iframe = document.createElement("iframe");
        iframe.src = "https://www.youtube-nocookie.com/embed/" + video.id + "?rel=0";
        iframe.title = fig.getAttribute("data-title") || "Prototype video";
        iframe.loading = "lazy";
        iframe.allow = "accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen";
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        iframe.allowFullscreen = true;
        frame.appendChild(iframe);
        fig.insertBefore(frame, fig.firstChild);
    });
})();

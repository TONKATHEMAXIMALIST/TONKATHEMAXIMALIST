/* =========================================================
   Rizvanov Creation — shared carousel
   Native scroll-snap for swipe; JS adds arrows, dots,
   keyboard control, a counter, and optional autoplay.
   Markup:
     <div class="carousel" data-carousel data-autoplay="6000">
       <div class="carousel-viewport">
         <ul class="carousel-track">
           <li class="carousel-slide">...</li>
         </ul>
       </div>
     </div>
   ========================================================= */

(function () {
    "use strict";

    var reduceMotion = window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function initCarousel(root) {
        var viewport = root.querySelector(".carousel-viewport");
        var slides = Array.prototype.slice.call(root.querySelectorAll(".carousel-slide"));
        if (!viewport || slides.length === 0) return;

        var index = 0;

        // --- Single slide: no controls needed ---
        if (slides.length < 2) return;

        // --- Build controls ---
        var prev = document.createElement("button");
        prev.type = "button";
        prev.className = "carousel-btn prev";
        prev.setAttribute("aria-label", "Previous image");
        prev.innerHTML = "&#8249;";

        var next = document.createElement("button");
        next.type = "button";
        next.className = "carousel-btn next";
        next.setAttribute("aria-label", "Next image");
        next.innerHTML = "&#8250;";

        var dots = document.createElement("div");
        dots.className = "carousel-dots";

        var count = document.createElement("p");
        count.className = "carousel-count";

        var dotButtons = slides.map(function (slide, i) {
            var dot = document.createElement("button");
            dot.type = "button";
            dot.setAttribute("aria-label", "Go to image " + (i + 1));
            dot.addEventListener("click", function () {
                stopAuto();
                goTo(i);
            });
            dots.appendChild(dot);
            return dot;
        });

        root.appendChild(prev);
        root.appendChild(next);
        root.appendChild(dots);
        root.appendChild(count);

        viewport.setAttribute("tabindex", "0");
        viewport.setAttribute("role", "group");
        viewport.setAttribute("aria-roledescription", "carousel");
        if (!viewport.hasAttribute("aria-label")) {
            viewport.setAttribute("aria-label", "Image gallery");
        }

        // --- Movement ---
        function goTo(i, behavior) {
            index = Math.max(0, Math.min(slides.length - 1, i));
            viewport.scrollTo({
                left: slides[index].offsetLeft - viewport.offsetLeft,
                behavior: behavior || (reduceMotion ? "auto" : "smooth")
            });
            sync();
        }

        function nearestIndex() {
            var center = viewport.scrollLeft + viewport.clientWidth / 2;
            var best = 0;
            var bestDist = Infinity;
            slides.forEach(function (slide, i) {
                var slideCenter = slide.offsetLeft - viewport.offsetLeft + slide.offsetWidth / 2;
                var dist = Math.abs(slideCenter - center);
                if (dist < bestDist) {
                    bestDist = dist;
                    best = i;
                }
            });
            return best;
        }

        function sync() {
            dotButtons.forEach(function (dot, i) {
                if (i === index) {
                    dot.setAttribute("aria-current", "true");
                } else {
                    dot.removeAttribute("aria-current");
                }
            });
            slides.forEach(function (slide, i) {
                slide.setAttribute("aria-hidden", i === index ? "false" : "true");
            });
            count.textContent = (index + 1) + " / " + slides.length;

            if (!looping) {
                prev.disabled = index === 0;
                next.disabled = index === slides.length - 1;
            }
        }

        prev.addEventListener("click", function () {
            stopAuto();
            goTo(looping && index === 0 ? slides.length - 1 : index - 1);
        });

        next.addEventListener("click", function () {
            stopAuto();
            goTo(looping && index === slides.length - 1 ? 0 : index + 1);
        });

        viewport.addEventListener("keydown", function (e) {
            if (e.key === "ArrowRight") {
                e.preventDefault();
                stopAuto();
                goTo(index + 1);
            } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                stopAuto();
                goTo(index - 1);
            }
        });

        // Keep dots/counter honest when the user swipes or scrolls directly.
        var scrollTimer;
        viewport.addEventListener("scroll", function () {
            window.clearTimeout(scrollTimer);
            scrollTimer = window.setTimeout(function () {
                index = nearestIndex();
                sync();
            }, 90);
        }, { passive: true });

        window.addEventListener("resize", function () {
            goTo(index, "auto");
        });

        // --- Autoplay (opt-in per carousel) ---
        var delay = parseInt(root.getAttribute("data-autoplay"), 10);
        var looping = !isNaN(delay) && delay > 0;
        var timer = null;
        var stopped = false;

        function tick() {
            if (document.hidden) return;
            goTo(index >= slides.length - 1 ? 0 : index + 1);
        }

        function startAuto() {
            if (!looping || stopped || reduceMotion || timer) return;
            timer = window.setInterval(tick, delay);
        }

        function pauseAuto() {
            window.clearInterval(timer);
            timer = null;
        }

        // A deliberate interaction ends autoplay for good — the visitor is driving now.
        function stopAuto() {
            stopped = true;
            pauseAuto();
        }

        if (looping) {
            root.addEventListener("mouseenter", pauseAuto);
            root.addEventListener("mouseleave", startAuto);
            root.addEventListener("focusin", stopAuto);
            viewport.addEventListener("touchstart", stopAuto, { passive: true });
            document.addEventListener("visibilitychange", function () {
                if (document.hidden) { pauseAuto(); } else { startAuto(); }
            });
            startAuto();
        }

        sync();
    }

    document.addEventListener("DOMContentLoaded", function () {
        var carousels = document.querySelectorAll("[data-carousel]");
        Array.prototype.forEach.call(carousels, initCarousel);
    });
})();

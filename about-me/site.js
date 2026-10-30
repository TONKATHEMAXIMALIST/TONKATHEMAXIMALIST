/* =========================================================
   Rizvanov Creation: small site behaviours
   1. Contact forms open the visitor's email app, pre-filled.
   2. The landing-page logo row fades as the page scrolls.
   ========================================================= */
(function () {
    "use strict";

    var EMAIL = "anthony@rizvanovcreation.com";

    Array.prototype.forEach.call(document.querySelectorAll("form[data-mailto]"), function (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            var name = (form.elements.name.value || "").trim();
            var from = (form.elements.email.value || "").trim();
            var message = (form.elements.message.value || "").trim();
            var subject = "Website inquiry" + (name ? " from " + name : "");
            var body = message + "\n\n" + name + (from ? "\n" + from : "");
            window.location.href = "mailto:" + EMAIL +
                "?subject=" + encodeURIComponent(subject) +
                "&body=" + encodeURIComponent(body);
        });
    });

    var brand = document.getElementById("brand-header");
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (brand && !reduce) {
        var ticking = false;
        var update = function () {
            var distance = brand.offsetHeight + window.innerHeight * 0.2;
            var p = Math.min(1, Math.max(0, window.scrollY / distance));
            var eased = p * p;
            brand.style.opacity = String(1 - eased);
            brand.style.transform = "translateY(" + (-eased * 60) + "px)";
            ticking = false;
        };
        window.addEventListener("scroll", function () {
            if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
        }, { passive: true });
        update();
    }
})();

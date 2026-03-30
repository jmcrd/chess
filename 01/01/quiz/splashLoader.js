// Progress animation
function startLoading() {
    let progress = 0;
    const bar = document.getElementById("progress-bar");

    const interval = setInterval(() => {
        progress += 5;
        bar.style.width = progress + "%";

        if (progress >= 100) {
            clearInterval(interval);

            // Fade out splash
            const splash = document.getElementById("splash");
            splash.style.opacity = "0";

            setTimeout(() => {
                splash.style.display = "none";
            }, 500);
        }

    }, 120);
}
// splashLoader.js

function startLoading() {
    let progress = 0;
    const bar = document.getElementById("progress-bar");
    const startBtnContainer = document.getElementById("start-btn-container");
    const splash = document.getElementById("splash");

    const interval = setInterval(() => {
        progress += 5;
        bar.style.width = progress + "%";

        if (progress >= 100) {
            clearInterval(interval);

            // Slightly fade the progress bar
            bar.style.opacity = "0.3";

            // Show Start button
            startBtnContainer.style.display = "block";

            // Optional: animate Start button appearance
            startBtnContainer.style.opacity = "0";
            setTimeout(() => {
                startBtnContainer.style.transition = "opacity 0.5s ease";
                startBtnContainer.style.opacity = "1";
            }, 50);
        }

    }, 120);
}
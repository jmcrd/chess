function startLoading() {
    let progress = 0;
    const bar = document.getElementById("progress-bar");
    const splash = document.getElementById("splash");
    const gameInterface = document.getElementById("game-interface");

    const interval = setInterval(() => {
        progress += 5;
        bar.style.width = progress + "%";

        if (progress >= 100) {
            clearInterval(interval);

            // 1. Start fading the splash screen
            splash.style.transition = "opacity 0.5s ease";
            splash.style.opacity = "0";

            // 2. Reveal the game UI immediately as splash fades
            gameInterface.style.opacity = "1";

            setTimeout(() => {
                splash.style.display = "none";
            }, 500);
        }
    }, 120);
}

window.onload = startLoading;
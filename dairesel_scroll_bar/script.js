document.addEventListener('DOMContentLoaded', () => {
    const scrollTopButton = document.getElementById('scrollTopButton');

    function getScrollProgress() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

        if (maxScroll <= 0) {
            return 0;
        }

        return Math.min(1, Math.max(0, scrollTop / maxScroll));
    }

    function updateProgress() {
        const progress = getScrollProgress();
        const degrees = progress * 360;

        document.documentElement.style.setProperty('--progress', `${degrees}deg`);
        scrollTopButton.setAttribute('aria-label', `Sayfanin en ustune git. Scroll ilerlemesi yuzde ${Math.round(progress * 100)}`);
    }

    scrollTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
});

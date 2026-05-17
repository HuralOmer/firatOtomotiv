document.addEventListener('DOMContentLoaded', () => {
    const scrollbarThumb = document.getElementById('customScrollbarThumb');
    let scrollHideTimer;
    let scrollIntentTimer;
    let hasScrollIntent = false;

    function markScrollIntent() {
        hasScrollIntent = true;
        window.clearTimeout(scrollIntentTimer);
        scrollIntentTimer = window.setTimeout(() => {
            hasScrollIntent = false;
        }, 1200);
    }

    function hideScrollIndicators() {
        window.clearTimeout(scrollHideTimer);
        document.body.classList.remove('is-scrolling');
    }

    function showScrollbarWhileScrolling() {
        if (!hasScrollIntent || window.scrollY <= 0) {
            hideScrollIndicators();
            return;
        }

        document.body.classList.add('is-scrolling');
        window.clearTimeout(scrollHideTimer);
        scrollHideTimer = window.setTimeout(() => {
            document.body.classList.remove('is-scrolling');
        }, 850);
    }

    function updateScrollState() {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const scrollRatio = maxScroll > 0 ? window.scrollY / maxScroll : 0;
        const thumbHeight = Math.max((window.innerHeight / document.documentElement.scrollHeight) * window.innerHeight, 32);
        const maxThumbTop = window.innerHeight - thumbHeight;

        scrollbarThumb.style.height = `${thumbHeight}px`;
        scrollbarThumb.style.transform = `translateY(${maxThumbTop * scrollRatio}px)`;

        document.body.classList.toggle('is-scrolled', window.scrollY > 10);
    }

    updateScrollState();
    hideScrollIndicators();
    window.addEventListener('wheel', markScrollIntent, { passive: true });
    window.addEventListener('touchmove', markScrollIntent, { passive: true });
    window.addEventListener('keydown', (event) => {
        if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) {
            markScrollIntent();
        }
    });
    window.addEventListener('scroll', () => {
        showScrollbarWhileScrolling();
        updateScrollState();
    }, { passive: true });
    window.addEventListener('resize', () => {
        updateScrollState();
        if (window.scrollY <= 0) {
            hideScrollIndicators();
        }
    });
});

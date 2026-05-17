document.addEventListener('DOMContentLoaded', () => {
    const scrollbarThumb = document.getElementById('customScrollbarThumb');
    let scrollHideTimer;

    function showScrollbarWhileScrolling() {
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
    window.addEventListener('scroll', () => {
        showScrollbarWhileScrolling();
        updateScrollState();
    }, { passive: true });
    window.addEventListener('resize', updateScrollState);
});

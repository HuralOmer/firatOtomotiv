document.addEventListener('DOMContentLoaded', () => {
    const scrollbarThumb = document.getElementById('customScrollbarThumb');
    const customScrollbar = scrollbarThumb ? scrollbarThumb.closest('.custom-scrollbar') : null;
    let scrollHideTimer;
    let scrollIntentTimer;
    let hasScrollIntent = false;
    let isDraggingScrollbar = false;
    let dragThumbOffsetY = 0;
    let previousScrollBehavior = '';

    if (!scrollbarThumb || !customScrollbar) {
        return;
    }

    function getScrollMetrics() {
        const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
        const thumbHeight = Math.min(window.innerHeight, Math.max((window.innerHeight / document.documentElement.scrollHeight) * window.innerHeight, 32));
        const maxThumbTop = Math.max(window.innerHeight - thumbHeight, 0);

        return { maxScroll, thumbHeight, maxThumbTop };
    }

    function enableInstantDragScroll() {
        previousScrollBehavior = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = 'auto';
    }

    function restorePageScrollBehavior() {
        document.documentElement.style.scrollBehavior = previousScrollBehavior;
    }

    function markScrollIntent() {
        hasScrollIntent = true;
        window.clearTimeout(scrollIntentTimer);
        scrollIntentTimer = window.setTimeout(() => {
            hasScrollIntent = false;
        }, 1200);
    }

    function hideScrollIndicators() {
        if (isDraggingScrollbar) {
            return;
        }

        window.clearTimeout(scrollHideTimer);
        document.body.classList.remove('is-scrolling');
    }

    function showScrollbarWhileScrolling() {
        if (isDraggingScrollbar) {
            document.body.classList.add('is-scrolling');
            return;
        }

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
        const { maxScroll, thumbHeight, maxThumbTop } = getScrollMetrics();
        const scrollRatio = maxScroll > 0 ? window.scrollY / maxScroll : 0;

        scrollbarThumb.style.height = `${thumbHeight}px`;
        scrollbarThumb.style.transform = `translateY(${maxThumbTop * scrollRatio}px)`;

        document.body.classList.toggle('is-scrolled', window.scrollY > 10);
    }

    function scrollToThumbTop(nextThumbTop) {
        const { maxScroll, maxThumbTop } = getScrollMetrics();

        if (maxScroll <= 0 || maxThumbTop <= 0) {
            return;
        }

        const clampedThumbTop = Math.min(Math.max(nextThumbTop, 0), maxThumbTop);
        const scrollRatio = clampedThumbTop / maxThumbTop;
        const nextScrollTop = maxScroll * scrollRatio;

        document.documentElement.scrollTop = nextScrollTop;
        document.body.scrollTop = nextScrollTop;
    }

    function scrollToPointerPosition(clientY) {
        const scrollbarRect = customScrollbar.getBoundingClientRect();

        scrollToThumbTop(clientY - scrollbarRect.top - dragThumbOffsetY);
    }

    customScrollbar.addEventListener('pointerdown', (event) => {
        if (event.button !== 0) {
            return;
        }

        event.preventDefault();
        markScrollIntent();
        enableInstantDragScroll();

        const { thumbHeight } = getScrollMetrics();
        const thumbRect = scrollbarThumb.getBoundingClientRect();
        const isThumbTarget = scrollbarThumb.contains(event.target);

        dragThumbOffsetY = isThumbTarget ? event.clientY - thumbRect.top : thumbHeight / 2;
        scrollToPointerPosition(event.clientY);
        updateScrollState();

        isDraggingScrollbar = true;
        document.body.classList.add('is-scrollbar-dragging', 'is-scrolling');
        customScrollbar.setPointerCapture(event.pointerId);
    });

    customScrollbar.addEventListener('pointermove', (event) => {
        if (!isDraggingScrollbar) {
            return;
        }

        scrollToPointerPosition(event.clientY);
        updateScrollState();
    });

    function stopScrollbarDrag(event) {
        if (!isDraggingScrollbar) {
            return;
        }

        isDraggingScrollbar = false;
        document.body.classList.remove('is-scrollbar-dragging');
        restorePageScrollBehavior();

        if (customScrollbar.hasPointerCapture(event.pointerId)) {
            customScrollbar.releasePointerCapture(event.pointerId);
        }

        showScrollbarWhileScrolling();
    }

    customScrollbar.addEventListener('pointerup', stopScrollbarDrag);
    customScrollbar.addEventListener('pointercancel', stopScrollbarDrag);

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

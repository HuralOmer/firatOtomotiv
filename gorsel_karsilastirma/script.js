document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('slider');
    const beforeImage = document.querySelector('.image-before');
    const sliderButton = document.querySelector('.slider-button');
    const container = document.querySelector('.comparison-container');
    const animationTrigger = document.querySelector('.about-image') || container;
    let hasPlayedInitialAnimation = false;

    if (!slider || !beforeImage || !sliderButton || !container || !animationTrigger) {
        return;
    }

    function setSliderPosition(val) {
        slider.value = val;
        beforeImage.style.width = `${val}%`;
        sliderButton.style.left = `${val}%`;
    }

    slider.addEventListener('input', (e) => {
        hasPlayedInitialAnimation = true;
        container.classList.remove('animating');
        setSliderPosition(e.target.value);
    });

    async function playInitialAnimation() {
        if (hasPlayedInitialAnimation) return;
        hasPlayedInitialAnimation = true;

        container.classList.add('animating');

        const delay = (ms) => new Promise(res => setTimeout(res, ms));

        await delay(500);
        setSliderPosition(80);
        await delay(800);
        setSliderPosition(20);
        await delay(800);
        setSliderPosition(80);
        await delay(800);
        setSliderPosition(50);

        await delay(800);
        container.classList.remove('animating');
    }

    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                playInitialAnimation();
                animationObserver.unobserve(entry.target);
            }
        });
    }, { threshold: [0, 0.5] });

    animationObserver.observe(animationTrigger);
});

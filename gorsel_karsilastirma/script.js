document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('slider');
    const beforeImage = document.querySelector('.image-before');
    const sliderButton = document.querySelector('.slider-button');

    const container = document.querySelector('.comparison-container');

    // Pozisyonu ayarlayan yardımcı fonksiyon
    function setSliderPosition(val) {
        slider.value = val;
        beforeImage.style.width = `${val}%`;
        sliderButton.style.left = `${val}%`;
    }

    // Range input değiştikçe tetiklenir
    slider.addEventListener('input', (e) => {
        // Kullanıcı müdahale ettiğinde CSS transition'ı kapat
        container.classList.remove('animating');
        setSliderPosition(e.target.value);
    });

    // Tanıtım animasyonunu oynatan fonksiyon
    async function playInitialAnimation() {
        // Animasyon için transition sınıfını ekle
        container.classList.add('animating');
        
        const delay = (ms) => new Promise(res => setTimeout(res, ms));

        await delay(500); // Başlangıçta biraz bekle
        setSliderPosition(80); // Sağa kay
        await delay(800);
        setSliderPosition(20); // Sola kay
        await delay(800);
        setSliderPosition(80); // Tekrar sağa kay
        await delay(800);
        setSliderPosition(50); // Ortaya dön
        
        // Animasyon bittikten sonra kullanıcının pürüzsüzce sürükleyebilmesi için sınıfı kaldır
        await delay(800);
        container.classList.remove('animating');
    }

    // Sayfa yüklendiğinde animasyonu başlat
    playInitialAnimation();
});

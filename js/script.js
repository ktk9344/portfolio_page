gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

document.addEventListener('DOMContentLoaded', () => {
    initIntro();
    initAbout();
    initDecks();
    initSkills();
    initModal();
});

function initIntro() {
    const tl = gsap.timeline();

    tl.to('.hero-title .line', {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
        delay: 0.5
    })
        .to('.scroll-indicator', {
            opacity: 1,
            duration: 1
        }, '-=0.5');
}

function initAbout() {
    const texts = document.querySelectorAll('.about-content > *');

    texts.forEach(text => {
        gsap.from(text, {
            scrollTrigger: {
                trigger: text,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            y: 50,
            opacity: 0,
            duration: 1,
            ease: 'power2.out'
        });
    });
}

function initDecks() {
    // Game Graphics Deck
    animateDeck('#game-graphics', '#game-deck .card');

    // AR Deck
    animateDeck('#ar-interactive', '#ar-deck .card');

    // Metaverse Deck
    animateDeck('#metaverse', '#meta-deck .card');

    // Video Hover Logic (Global for all decks)
    const videoCards = document.querySelectorAll('.video-card');
    videoCards.forEach(card => {
        const video = card.querySelector('video');

        card.addEventListener('mouseenter', () => {
            if (video) video.play();
            gsap.to(card, { zIndex: 100, scale: 1.1, duration: 0.3 });
        });

        card.addEventListener('mouseleave', () => {
            if (video) {
                video.pause();
                video.currentTime = 0;
            }
            gsap.to(card, { zIndex: 1, scale: 1, duration: 0.3 });
        });
    });

    // Image Hover Logic (Global for all decks)
    const imageCards = document.querySelectorAll('.image-card');
    imageCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, { zIndex: 100, scale: 1.1, duration: 0.3 });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(card, { zIndex: 1, scale: 1, duration: 0.3 });
        });
    });
}

function animateDeck(sectionId, cardSelector) {
    if (window.innerWidth <= 768) return; // Skip fan effect on mobile

    const section = document.querySelector(sectionId);
    const cards = document.querySelectorAll(cardSelector);
    const totalCards = cards.length;

    // Initial State: Stacked
    gsap.set(cards, {
        position: 'absolute',
        left: '50%',
        top: '50%',
        xPercent: -50,
        yPercent: -50,
        rotation: 0
    });

    // Fan Out Animation
    ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=1000', // Pin duration
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
            const progress = self.progress;

            // Fan out based on progress
            const spread = 15 * totalCards * progress; // Total angle spread
            const startAngle = -spread / 2;

            cards.forEach((card, index) => {
                // Calculate angle for this card
                // Map index 0..total-1 to a range
                const normalizedIndex = index / (totalCards - 1); // 0 to 1
                const angle = startAngle + (spread * normalizedIndex);

                // Calculate translation to separate them slightly
                const xOffset = (index - (totalCards - 1) / 2) * (100 * progress);

                gsap.to(card, {
                    rotation: angle,
                    x: xOffset,
                    duration: 0.1, // Quick update for scrub
                    overwrite: 'auto'
                });
            });

            // Fade in titles
            gsap.to(`${sectionId} .section-title, ${sectionId} .section-subtitle`, {
                opacity: progress > 0.1 ? 1 : 0,
                y: progress > 0.1 ? 0 : 30,
                duration: 0.3
            });
        }
    });
}

function initSkills() {
    gsap.from('.skill-card', {
        scrollTrigger: {
            trigger: '#skills',
            start: 'top 70%'
        },
        y: 50,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: 'back.out(1.7)'
    });
}

function initModal() {
    const modal = document.getElementById('video-modal');
    const modalVideo = modal.querySelector('video');
    const closeBtn = modal.querySelector('.close-modal');
    const modalContent = modal.querySelector('.modal-content');

    // Handle Video Cards
    const videoCards = document.querySelectorAll('.video-card');
    videoCards.forEach(card => {
        card.addEventListener('click', () => {
            const videoSrc = card.getAttribute('data-video');
            if (videoSrc) {
                // Clear any existing image
                const existingImg = modal.querySelector('.modal-image');
                if (existingImg) existingImg.remove();

                modalVideo.style.display = 'block';
                modalVideo.src = videoSrc;
                modal.style.display = 'flex';
                modalVideo.play();
            }
        });
    });

    // Handle Image Cards
    const imageCards = document.querySelectorAll('.image-card');
    imageCards.forEach(card => {
        card.addEventListener('click', () => {
            const imageSrc = card.getAttribute('data-image');
            if (imageSrc) {
                modalVideo.pause();
                modalVideo.style.display = 'none';

                // Check if image element exists, else create
                let img = modal.querySelector('.modal-image');
                if (!img) {
                    img = document.createElement('img');
                    img.className = 'modal-image';
                    modalContent.appendChild(img);
                }
                img.src = imageSrc;
                modal.style.display = 'flex';
            }
        });
    });

    const closeModal = () => {
        modal.style.display = 'none';
        modalVideo.pause();
        modalVideo.src = '';
        const img = modal.querySelector('.modal-image');
        if (img) img.src = '';
    };

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

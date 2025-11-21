gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
    initIntro();
    initAbout();
    initDecks();
    initSkills();
    initModal();
});

// 1. Intro Animation
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
        y: 0,
        duration: 1
    }, '-=0.5');
}

// 2. About Animation
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

// 3. Card Decks Logic (Responsive Fan Effect)
function initDecks() {
    animateDeck('#game-graphics', '#game-deck .card');
    animateDeck('#ar-interactive', '#ar-deck .card');
    animateDeck('#metaverse', '#meta-deck .card');
    initCardHoverEffects();
}

function animateDeck(sectionId, cardSelector) {
    const section = document.querySelector(sectionId);
    const cards = document.querySelectorAll(cardSelector);
    const totalCards = cards.length;

    // 초기 상태 설정 (중앙 정렬)
    gsap.set(cards, {
        position: 'absolute',
        left: '0',
        top: '0',
        x: 0, 
        y: 0,
        rotation: 0
    });

    ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=1000', 
        pin: true,     
        scrub: 1,      
        onUpdate: (self) => {
            const progress = self.progress;
            const isMobile = window.innerWidth <= 768;

            // [핵심] 모바일 최적화 수치 조절
            // 모바일에서는 부채꼴이 화면 밖으로 나가지 않도록 
            // spread(회전각)와 xDistance(이동거리)를 대폭 줄임
            
            const spreadFactor = isMobile ? 8 : 15;      // 모바일은 회전 각도를 작게
            const xDistanceFactor = isMobile ? 30 : 100; // 모바일은 옆으로 퍼지는 거리도 짧게
            const yArchFactor = isMobile ? 10 : 20;      // 아치 높이

            const spread = spreadFactor * totalCards * progress;
            const startAngle = -spread / 2;

            cards.forEach((card, index) => {
                const normalizedIndex = index / (totalCards - 1); 
                const angle = startAngle + (spread * normalizedIndex);
                
                // 중심점 기준 이동 거리 계산
                const xOffset = (index - (totalCards - 1) / 2) * (xDistanceFactor * progress);
                const centerOffset = Math.abs(index - (totalCards - 1) / 2);
                const yOffset = centerOffset * yArchFactor * progress;

                gsap.to(card, {
                    rotation: angle,
                    x: xOffset,
                    y: yOffset, 
                    duration: 0.1,
                    overwrite: 'auto'
                });
            });

            // 타이틀 페이드 인
            gsap.to(`${sectionId} .section-title, ${sectionId} .section-subtitle`, {
                opacity: progress > 0.1 ? 1 : 0,
                y: progress > 0.1 ? 0 : 30,
                duration: 0.3
            });
        }
    });
}

function initCardHoverEffects() {
    // Video Hover
    document.querySelectorAll('.video-card').forEach(card => {
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

    // Image Hover
    document.querySelectorAll('.image-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, { zIndex: 100, scale: 1.1, duration: 0.3 });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(card, { zIndex: 1, scale: 1, duration: 0.3 });
        });
    });
}

// 4. Skills Animation
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

// 5. Modal Logic (Scroll & Back Button Support)
function initModal() {
    const modal = document.getElementById('media-modal'); // ID 변경됨 주의 (html도 변경 필요)
    if (!modal) return;

    const modalImg = modal.querySelector('.modal-image');
    const modalVideo = modal.querySelector('.modal-video');
    const closeBtn = modal.querySelector('.close-modal');
    const scrollArea = modal.querySelector('.modal-scroll-area');

    function openModal(type, src) {
        modal.style.display = "block";
        setTimeout(() => modal.style.opacity = "1", 10);
        scrollArea.scrollTop = 0; // 스크롤 맨 위로

        if (type === 'image') {
            if(modalImg) {
                modalImg.style.display = "block";
                modalImg.src = src;
            }
            if(modalVideo) {
                modalVideo.style.display = "none";
                modalVideo.pause();
            }
        } else {
            if(modalImg) modalImg.style.display = "none";
            if(modalVideo) {
                modalVideo.style.display = "block";
                modalVideo.src = src;
                modalVideo.play();
            }
        }
        
        // 뒤로가기 히스토리 추가
        history.pushState({modalOpen: true}, "", "#view");
        document.body.style.overflow = "hidden"; 
    }

    function closeModal() {
        modal.style.opacity = "0";
        setTimeout(() => {
            modal.style.display = "none";
            if(modalImg) modalImg.src = "";
            if(modalVideo) {
                modalVideo.pause();
                modalVideo.src = "";
            }
        }, 300);
        document.body.style.overflow = "auto";
        
        if (window.location.hash === "#view") {
            history.replaceState(null, null, ' ');
        }
    }

    // Click Events
    document.querySelectorAll('.image-card').forEach(card => {
        card.addEventListener('click', () => {
            const imgUrl = card.getAttribute('data-image');
            // 배경 이미지 URL 추출 (data-image 없을 경우 대비)
            const style = window.getComputedStyle(card);
            const bgImage = style.backgroundImage.slice(5, -2).replace(/"/g, "");
            const finalSrc = imgUrl || bgImage;
            
            if (finalSrc) openModal('image', finalSrc);
        });
    });

    document.querySelectorAll('.video-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            const videoSrc = card.getAttribute('data-video');
            if (videoSrc) openModal('video', videoSrc);
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            history.back(); 
        });
    }

    if (scrollArea) {
        scrollArea.addEventListener("click", (e) => {
            if (e.target === scrollArea || e.target.classList.contains('modal-content')) {
                history.back();
            }
        });
    }

    window.addEventListener("popstate", () => {
        closeModal();
    });
}
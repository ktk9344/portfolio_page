gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
    initIntro();
    initAbout();
    initDecks();
    initSkills();
    initModal();
});

// 1. Intro Text Animation (텍스트 복구)
function initIntro() {
    const tl = gsap.timeline();

    // 0.5초 딜레이 후 텍스트가 아래에서 위로(y:0) 투명도(opacity:1) 생기며 등장
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

// 2. Card Decks Logic (웹 vs 모바일 분기 처리)
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

    // 카드 초기화: 화면 중앙에 겹쳐두기
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
        end: '+=1000', // 스크롤 길이
        pin: true,     // 화면 고정
        scrub: 1,      // 부드러운 애니메이션
        onUpdate: (self) => {
            const progress = self.progress;
            
            // [중요] 모바일 감지 (768px 이하)
            const isMobile = window.innerWidth <= 768;

            // 화면 크기에 따른 부채꼴 퍼짐 정도 설정
            // PC: 넓게 퍼짐 (spread 15, xFactor 100)
            // Mobile: 좁게 퍼짐 (spread 8, xFactor 30)
            const spreadFactor = isMobile ? 8 : 15; 
            const xDistanceFactor = isMobile ? 35 : 100; 
            const yArchFactor = isMobile ? 5 : 20; // 아치형 높이 조절

            // 전체 각도 계산
            const spread = spreadFactor * totalCards * progress;
            const startAngle = -spread / 2;

            cards.forEach((card, index) => {
                // 0 ~ 1 사이 정규화 값
                const normalizedIndex = index / (totalCards - 1); 
                
                // 각도 계산
                const angle = startAngle + (spread * normalizedIndex);

                // X축 이동 거리 계산 (중심 기준)
                // Mobile에서는 xDistanceFactor가 작아서 조금만 옆으로 이동함
                const xOffset = (index - (totalCards - 1) / 2) * (xDistanceFactor * progress);
                
                // Y축 (아치형) 계산
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

            // 섹션 타이틀 페이드 인
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
    if (!modal) return; // 모달이 없으면 종료

    const modalVideo = modal.querySelector('.modal-video');
    const closeBtn = modal.querySelector('.close-modal');
    const modalContent = modal.querySelector('.modal-content');

    // Video Click
    document.querySelectorAll('.video-card').forEach(card => {
        card.addEventListener('click', () => {
            const videoSrc = card.getAttribute('data-video');
            if (videoSrc) {
                // 이미지 제거
                const existingImg = modal.querySelector('.modal-image');
                if (existingImg) existingImg.style.display = 'none';

                modalVideo.style.display = 'block';
                modalVideo.src = videoSrc;
                modal.style.display = 'flex';
                modalVideo.play();
            }
        });
    });

    // Image Click
    document.querySelectorAll('.image-card').forEach(card => {
        card.addEventListener('click', () => {
            const imageSrc = card.getAttribute('data-image');
            if (imageSrc) {
                modalVideo.pause();
                modalVideo.style.display = 'none';

                let img = modal.querySelector('.modal-image');
                if (!img) {
                    img = document.createElement('img');
                    img.className = 'modal-image';
                    modalContent.appendChild(img);
                }
                img.src = imageSrc;
                img.style.display = 'block';
                modal.style.display = 'flex';
            }
        });
    });

    const closeModal = () => {
        modal.style.display = 'none';
        modalVideo.pause();
        modalVideo.src = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}
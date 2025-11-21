gsap.registerPlugin(ScrollTrigger);

// 1. Intro Text Animation
gsap.from(".hero-title .line", {
    y: 100,
    opacity: 0,
    duration: 1.5,
    stagger: 0.3,
    ease: "power4.out",
    delay: 0.5
});

// 2. About Text Floating Effect
gsap.utils.toArray(".about-content p").forEach(text => {
    gsap.from(text, {
        scrollTrigger: {
            trigger: text,
            start: "top 85%", // 모바일 고려하여 트리거 지점 조정
            toggleActions: "play none none reverse"
        },
        y: 50,
        opacity: 0,
        duration: 1
    });
});

// 3. Card Deck Fan Animation (Responsive Version)
function animateDeck(selector) {
    const deck = document.querySelector(selector);
    const cards = gsap.utils.toArray(`${selector} .card`);
    const totalCards = cards.length;
    
    // 모바일 감지 (768px 이하)
    const isMobile = window.innerWidth <= 768;

    // 모바일이면 부채꼴 간격을 좁게, PC면 넓게 설정
    const spreadDistance = isMobile ? 15 : 30; // x축 간격
    const rotationRange = isMobile ? 40 : 60;  // 회전 각도 범위
    
    // 초기 상태 설정
    gsap.set(cards, {
        position: "absolute",
        top: 0,
        left: 0,
        x: 0,
        y: 0,
        rotation: 0
    });

    // 애니메이션 트리거
    ScrollTrigger.create({
        trigger: selector,
        start: "top 75%", // 화면의 75% 지점에 오면 시작
        onEnter: () => {
            cards.forEach((card, i) => {
                // 부채꼴 각도 및 위치 계산
                const rotation = -rotationRange/2 + (rotationRange / (totalCards - 1)) * i;
                const xPos = (i - (totalCards/2)) * spreadDistance; 
                
                gsap.to(card, {
                    rotation: rotation,
                    x: xPos,
                    y: Math.abs(xPos) * (isMobile ? 0.2 : 0.1), // 양 끝 카드를 살짝 아래로 내림 (아치형)
                    duration: 1.2,
                    ease: "back.out(1.2)", // 탄성 효과
                    delay: i * 0.05
                });
            });
        }
    });
}

// Apply Animation
animateDeck("#game-deck");
animateDeck("#ar-deck");
animateDeck("#meta-deck");

// 4. Video Modal Interaction
const modal = document.getElementById("video-modal");
const modalVideo = document.querySelector(".modal-video");
const closeBtn = document.querySelector(".close-modal");
const videoCards = document.querySelectorAll(".video-card");

videoCards.forEach(card => {
    card.addEventListener("click", () => {
        const videoSrc = card.getAttribute("data-video");
        if (videoSrc) {
            modal.style.display = "flex";
            modalVideo.src = videoSrc;
            modalVideo.play();
        }
    });
});

closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
    modalVideo.pause();
});

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
        modalVideo.pause();
    }
}
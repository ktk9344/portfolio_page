gsap.registerPlugin(ScrollTrigger);

// 1. Intro & About Animation
gsap.from(".hero-title .line", {
    y: 100, opacity: 0, duration: 1.5, stagger: 0.3, ease: "power4.out", delay: 0.5
});

gsap.utils.toArray(".about-content p").forEach(text => {
    gsap.from(text, {
        scrollTrigger: { trigger: text, start: "top 85%", toggleActions: "play none none reverse" },
        y: 30, opacity: 0, duration: 1
    });
});

// 2. [핵심] 부채꼴 카드 애니메이션 (좌표 오류 수정됨)
function animateDeck(selector) {
    const cards = gsap.utils.toArray(`${selector} .card`);
    const totalCards = cards.length;
    
    // 카드 초기화 (중앙에 겹쳐두기)
    gsap.set(cards, { 
        x: 0, y: 0, rotation: 0, scale: 1 
    });

    ScrollTrigger.create({
        trigger: selector,
        start: "top 70%", // 화면에 70%쯤 보이면 시작
        onEnter: () => {
            // 화면 크기에 따라 펼쳐지는 정도 조절
            const isMobile = window.innerWidth <= 768;
            const spreadX = isMobile ? 20 : 40;    // X축 간격 (좁게/넓게)
            const rotationMax = isMobile ? 30 : 50; // 회전 각도
            
            cards.forEach((card, i) => {
                // 중앙(0)을 기준으로 좌우 대칭 계산
                // 예: 5장이면 -2, -1, 0, 1, 2 순서
                const centerOffset = i - (totalCards - 1) / 2;
                
                // 회전 및 이동 계산
                const rotation = centerOffset * (rotationMax / (totalCards/2));
                const xPos = centerOffset * spreadX;
                const yPos = Math.abs(centerOffset) * (isMobile ? 5 : 15); // 아치형 (양끝이 내려가게)

                gsap.to(card, {
                    x: xPos,
                    y: yPos,
                    rotation: rotation,
                    duration: 1.2,
                    ease: "back.out(1.5)", // 부드러운 탄성
                    delay: i * 0.05
                });
            });
        }
    });
}

// 섹션별 적용
animateDeck("#game-deck");
animateDeck("#ar-deck");
animateDeck("#meta-deck");


// 3. Modal Interaction
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

window.onclick = (e) => {
    if (e.target == modal) {
        modal.style.display = "none";
        modalVideo.pause();
    }
};
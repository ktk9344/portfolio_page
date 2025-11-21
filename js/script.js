gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
    // 모든 리소스 로드 후 실행
    window.onload = () => {
        initIntro();
        initAbout();
        initDecks();
        initSkills();
        initModal();
        initVRBackground();
        // [중요] 모든 레이아웃 배치 후 스크롤 위치 재계산
        ScrollTrigger.refresh();
    };
});

// 1. Intro
function initIntro() {
    const tl = gsap.timeline();
    tl.to('.hero-title .line', { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: 'power3.out', delay: 0.5 })
      .to('.scroll-indicator', { opacity: 1, y: 0, duration: 1 }, '-=0.5');
}

// 2. About
function initAbout() {
    document.querySelectorAll('.about-content > *').forEach(text => {
        gsap.from(text, {
            scrollTrigger: { trigger: text, start: 'top 85%', toggleActions: 'play none none reverse' },
            y: 50, opacity: 0, duration: 1, ease: 'power2.out'
        });
    });
}

// 3. Decks
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
    
    // 초기화
    gsap.set(cards, { position: 'absolute', left: '0', top: '0', x: 0, y: 0, rotation: 0 });

    ScrollTrigger.create({
        trigger: section, start: 'top top', end: '+=1500', pin: true, scrub: 1, // 스크롤 길이 늘림
        onUpdate: (self) => {
            const progress = self.progress;
            const isMobile = window.innerWidth <= 768;
            const spreadFactor = isMobile ? 8 : 15;
            const xDistanceFactor = isMobile ? 30 : 100;
            const yArchFactor = isMobile ? 10 : 20;
            const spread = spreadFactor * totalCards * progress;
            const startAngle = -spread / 2;

            cards.forEach((card, index) => {
                const normalizedIndex = index / (totalCards - 1);
                const angle = startAngle + (spread * normalizedIndex);
                const xOffset = (index - (totalCards - 1) / 2) * (xDistanceFactor * progress);
                const centerOffset = Math.abs(index - (totalCards - 1) / 2);
                const yOffset = centerOffset * yArchFactor * progress;
                gsap.to(card, { rotation: angle, x: xOffset, y: yOffset, duration: 0.1, overwrite: 'auto' });
            });
            
            // 타이틀 애니메이션
            gsap.to(`${sectionId} .section-title, ${sectionId} .section-subtitle`, {
                opacity: progress > 0.1 ? 1 : 0, y: progress > 0.1 ? 0 : 30, duration: 0.3
            });
        }
    });
}

function initCardHoverEffects() {
    document.querySelectorAll('.video-card').forEach(card => {
        const video = card.querySelector('video');
        card.addEventListener('mouseenter', () => { if(video) video.play(); gsap.to(card, { zIndex: 100, scale: 1.1, duration: 0.3 }); });
        card.addEventListener('mouseleave', () => { if(video) { video.pause(); video.currentTime = 0; } gsap.to(card, { zIndex: 1, scale: 1, duration: 0.3 }); });
    });
    document.querySelectorAll('.image-card').forEach(card => {
        card.addEventListener('mouseenter', () => gsap.to(card, { zIndex: 100, scale: 1.1, duration: 0.3 }));
        card.addEventListener('mouseleave', () => gsap.to(card, { zIndex: 1, scale: 1, duration: 0.3 }));
    });
}

// 4. Skills (수정됨: 확실하게 보이도록 트리거 조정)
function initSkills() {
    // 강제로 보이지 않는 문제 해결을 위해 set 사용
    gsap.set('.skill-card', { opacity: 0, y: 50 });
    
    ScrollTrigger.batch('.skill-card', {
        trigger: '#skills',
        start: 'top 80%', // 화면의 80% 지점에 오면 실행 (더 빨리 등장)
        onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.15, duration: 0.8, ease: 'back.out(1.7)' }),
        onLeaveBack: batch => gsap.to(batch, { opacity: 0, y: 50 }) // 다시 위로 올리면 사라짐
    });
}

// 5. Modal
function initModal() {
    const modal = document.getElementById('media-modal');
    if (!modal) return;
    const modalImg = modal.querySelector('.modal-image');
    const modalVideo = modal.querySelector('.modal-video');
    const closeBtn = modal.querySelector('.close-modal');
    const scrollArea = modal.querySelector('.modal-scroll-area');

    function openModal(type, src) {
        modal.style.display = "block";
        setTimeout(() => modal.style.opacity = "1", 10);
        scrollArea.scrollTop = 0;
        if (type === 'image') {
            if(modalImg) { modalImg.style.display = "block"; modalImg.src = src; }
            if(modalVideo) { modalVideo.style.display = "none"; modalVideo.pause(); }
        } else {
            if(modalImg) modalImg.style.display = "none";
            if(modalVideo) { modalVideo.style.display = "block"; modalVideo.src = src; modalVideo.play(); }
        }
        history.pushState({modalOpen: true}, "", "#view");
        document.body.style.overflow = "hidden"; 
    }

    function closeModal() {
        modal.style.opacity = "0";
        setTimeout(() => {
            modal.style.display = "none";
            if(modalImg) modalImg.src = "";
            if(modalVideo) { modalVideo.pause(); modalVideo.src = ""; }
        }, 300);
        document.body.style.overflow = "auto";
        if (window.location.hash === "#view") history.replaceState(null, null, ' ');
    }

    document.querySelectorAll('.image-card').forEach(card => {
        card.addEventListener('click', () => {
            const imgUrl = card.getAttribute('data-image');
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
    if (closeBtn) closeBtn.addEventListener("click", () => history.back());
    if (scrollArea) scrollArea.addEventListener("click", (e) => { if (e.target === scrollArea || e.target.classList.contains('modal-content')) history.back(); });
    window.addEventListener("popstate", () => closeModal());
}

// 6. VR Background (수정됨: 이미지 없으면 멋진 그리드 생성)
function initVRBackground() {
    const container = document.getElementById('vr-background');
    if (!container) return;

    const scene = new THREE.Scene();
    // 배경을 약간 어둡게 처리 (카드가 잘 보이도록)
    scene.fog = new THREE.FogExp2(0x000000, 0.001);

    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 0.1);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // 컨트롤 설정
    let controls;
    if (typeof THREE.OrbitControls === 'function') {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
        controls.rotateSpeed = -0.5;
    }

    // 구체 생성
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);

    const textureLoader = new THREE.TextureLoader();
    
    // [핵심] 이미지 로드 시도
    textureLoader.load(
        'assets/images/vr_bg.jpg', 
        (texture) => {
            // 성공 시: 이미지 매핑
            const material = new THREE.MeshBasicMaterial({ map: texture });
            const sphere = new THREE.Mesh(geometry, material);
            scene.add(sphere);
        },
        undefined,
        (err) => {
            console.log('VR Image not found, using Cyber Grid fallback.');
            // 실패 시: 멋진 사이버 그리드(와이어프레임) 생성
            const material = new THREE.MeshBasicMaterial({ 
                color: 0x4facfe, // 네온 블루
                wireframe: true,
                transparent: true,
                opacity: 0.15 // 은은하게
            });
            const sphere = new THREE.Mesh(geometry, material);
            scene.add(sphere);
            
            // 별똥별 효과 추가 (입자 시스템)
            const starsGeometry = new THREE.BufferGeometry();
            const starsCount = 1000;
            const posArray = new Float32Array(starsCount * 3);
            for(let i=0; i<starsCount * 3; i++) {
                posArray[i] = (Math.random() - 0.5) * 1000;
            }
            starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
            const starsMaterial = new THREE.PointsMaterial({ size: 2, color: 0xffffff });
            const starMesh = new THREE.Points(starsGeometry, starsMaterial);
            scene.add(starMesh);
        }
    );

    function animate() {
        requestAnimationFrame(animate);
        if (controls) controls.update();
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        if (container) {
            const width = container.clientWidth;
            const height = container.clientHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }
    });
}
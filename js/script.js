gsap.registerPlugin(ScrollTrigger);

// 네비게이션용 변수
let allGalleryItems = []; 
let currentItemIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    window.onload = () => {
        initIntro();
        initAbout();
        initDecks();
        initSkills();
        initModal();
        initVRBackground();
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
    gsap.set(cards, { position: 'absolute', left: '0', top: '0', x: 0, y: 0, rotation: 0 });

    ScrollTrigger.create({
        trigger: section, start: 'top top', end: '+=1500', pin: true, scrub: 1,
        onUpdate: (self) => {
            const progress = self.progress;
            // 모바일 여부 상관없이 데스크톱 설정(넓은 부채꼴) 사용
            const spreadFactor = 15; 
            const xDistanceFactor = 100;
            const yArchFactor = 20;
            const spread = spreadFactor * totalCards * progress;
            const startAngle = -spread / 2;

            cards.forEach((card, index) => {
                const normalizedIndex = index / (totalCards - 1);
                const angle = startAngle + (spread * normalizedIndex);
                const xOffset = (index - (totalCards - 1) / 2) * (xDistanceFactor * progress);
                const yOffset = Math.abs(index - (totalCards - 1) / 2) * yArchFactor * progress;
                gsap.to(card, { rotation: angle, x: xOffset, y: yOffset, duration: 0.1, overwrite: 'auto' });
            });
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

// 4. Skills
function initSkills() {
    gsap.set('.skill-card', { opacity: 0, y: 50 });
    ScrollTrigger.batch('.skill-card', {
        trigger: '#skills', start: 'top 80%',
        onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.15, duration: 0.8, ease: 'back.out(1.7)' }),
        onLeaveBack: batch => gsap.to(batch, { opacity: 0, y: 50 })
    });
}

// 5. Modal Logic (Arrows & Navigation)
function initModal() {
    const modal = document.getElementById('media-modal');
    const modalImg = modal.querySelector('.modal-image');
    const modalVideo = modal.querySelector('.modal-video');
    const closeBtn = modal.querySelector('.close-modal');
    const prevBtn = modal.querySelector('.prev-btn');
    const nextBtn = modal.querySelector('.next-btn');

    // 모든 카드 아이템 수집
    const allCards = document.querySelectorAll('.card');
    
    allCards.forEach((card, index) => {
        const isVideo = card.classList.contains('video-card');
        let src = '';
        if (isVideo) {
            src = card.getAttribute('data-video');
        } else {
            src = card.getAttribute('data-image');
            if (!src) {
                const style = window.getComputedStyle(card);
                src = style.backgroundImage.slice(5, -2).replace(/"/g, "");
            }
        }
        allGalleryItems.push({ type: isVideo ? 'video' : 'image', src: src });

        // 클릭 시 해당 인덱스로 열기
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            currentItemIndex = index;
            updateModalContent();
            openModal();
        });
    });

    // 모달 내용 업데이트
    function updateModalContent() {
        const item = allGalleryItems[currentItemIndex];
        if (item.type === 'image') {
            modalImg.style.display = 'block';
            modalVideo.style.display = 'none';
            modalImg.src = item.src;
            modalVideo.pause();
        } else {
            modalImg.style.display = 'none';
            modalVideo.style.display = 'block';
            modalVideo.src = item.src;
            modalVideo.play();
        }
    }

    // 화살표 클릭 이벤트
    function showNext(direction) {
        currentItemIndex += direction;
        // 순환 (Loop)
        if (currentItemIndex >= allGalleryItems.length) currentItemIndex = 0;
        if (currentItemIndex < 0) currentItemIndex = allGalleryItems.length - 1;
        updateModalContent();
    }

    prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showNext(-1); });
    nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showNext(1); });

    function openModal() {
        modal.style.display = "block";
        setTimeout(() => modal.style.opacity = "1", 10);
        history.pushState({modalOpen: true}, "", "#view");
        document.body.style.overflow = "hidden"; 
    }

    function closeModal() {
        modal.style.opacity = "0";
        setTimeout(() => {
            modal.style.display = "none";
            modalImg.src = "";
            modalVideo.pause();
            modalVideo.src = "";
        }, 300);
        document.body.style.overflow = "auto";
        if (window.location.hash === "#view") history.replaceState(null, null, ' ');
    }

    closeBtn.addEventListener("click", () => history.back());
    window.addEventListener("popstate", () => closeModal());
}

// 6. VR Background
function initVRBackground() {
    const container = document.getElementById('vr-background');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 0.1);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    let controls;
    if (typeof THREE.OrbitControls === 'function') {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; controls.dampingFactor = 0.05;
        controls.enableZoom = false; controls.enablePan = false;
        controls.autoRotate = true; controls.autoRotateSpeed = 0.5; controls.rotateSpeed = -0.5;
    }

    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);
    const textureLoader = new THREE.TextureLoader();
    
    textureLoader.load('assets/images/vr_bg.jpg', 
        (texture) => {
            const material = new THREE.MeshBasicMaterial({ map: texture });
            const sphere = new THREE.Mesh(geometry, material);
            scene.add(sphere);
        },
        undefined,
        () => {
            const material = new THREE.MeshBasicMaterial({ color: 0x4facfe, wireframe: true, transparent: true, opacity: 0.15 });
            const sphere = new THREE.Mesh(geometry, material);
            scene.add(sphere);
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
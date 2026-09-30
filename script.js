

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       SUPABASE
    ===================================================== */

    const SUPABASE_URL =
        "https://istbncxutptjguijzfqq.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_uZOo6VslQBSy5pn-RoK_pA_K6URSPSZ";


    /* =====================================================
       HELPER
    ===================================================== */

    const wait = ms =>
        new Promise(resolve => setTimeout(resolve, ms));


    /* =====================================================
       CORE + OUR CRAFT + FABRICS + GALLERY
       LOAD IMAGES FROM SUPABASE
    ===================================================== */

    async function loadDatabaseImages() {

        const coreImages =
            document.querySelectorAll(
                ".core-db-image"
            );

        const craftImages =
            document.querySelectorAll(
                ".create-db-image"
            );

        const fabricCards =
            document.querySelectorAll(
                ".fabric-card"
            );

        const fabricImages =
            document.querySelectorAll(
                ".fabric-db-image"
            );
const servicesHeroImage =
    document.querySelector(
        ".services-hero-db-image"
    );

        if (
            !coreImages.length &&
            !craftImages.length &&
            !fabricCards.length &&
            !fabricImages.length &&
            !servicesHeroImage &&
            !document.getElementById("homeGallery")
        ) {
            return;
        }


        try {

            /* =============================================
               LOAD GALLERY IMAGES
            ============================================= */

            const galleryResponse =
                await fetch(
                    `${SUPABASE_URL}/rest/v1/toluwani_gallery?select=image_url,title,category,featured,created_at&order=featured.desc,created_at.desc&limit=50`,
                    {
                        headers: {
                            apikey:
                                SUPABASE_KEY,

                            Authorization:
                                `Bearer ${SUPABASE_KEY}`
                        }
                    }
                );


            if (!galleryResponse.ok) {

                throw new Error(
                    "Could not load gallery images."
                );
            }


            const gallery =
                await galleryResponse.json();
                    const servicesHeroItem =
        gallery.find(
            item =>
            item.title ===
            "Services Hero" &&
            item.category ===
            "Services"
        );
    
    if (
        servicesHeroImage &&
        servicesHeroItem?.image_url
    ) {
        servicesHeroImage.src =
            servicesHeroItem.image_url;
        
        servicesHeroImage.alt =
            "Toluwani Couture Services";
        
        servicesHeroImage.loading =
            "eager";
    }


            /* =============================================
               LOAD FABRIC IMAGES + DETAILS
            ============================================= */

            const fabricResponse =
                await fetch(
                    `${SUPABASE_URL}/rest/v1/toluwani_fabrics?select=name,category,description,price,image_url,available,featured,created_at&order=featured.desc,created_at.desc&limit=20`,
                    {
                        headers: {
                            apikey:
                                SUPABASE_KEY,

                            Authorization:
                                `Bearer ${SUPABASE_KEY}`
                        }
                    }
                );


            if (!fabricResponse.ok) {

                throw new Error(
                    "Could not load fabric images."
                );
            }


            const fabrics =
                await fabricResponse.json();


            /* =================================================
               OUR WORK / GALLERY
            ================================================= */

            const homeGallery =
                document.getElementById(
                    "homeGallery"
                );


            if (homeGallery) {

                /* =========================================
                   ONLY USE THE NEW GALLERY RECORDS

                   These records were added specifically
                   for the Our Work section.
                ========================================= */

                const galleryItems =
                    gallery.filter(
                        item =>
                            item.category ===
                                "Our Work" &&
                            item.image_url
                    );


                /* =========================================
                   REMOVE DUPLICATE IMAGE URLS
                ========================================= */

                const uniqueGalleryItems = [];

                const seenGalleryImages =
                    new Set();


                galleryItems.forEach(
                    item => {

                        if (
                            seenGalleryImages.has(
                                item.image_url
                            )
                        ) {
                            return;
                        }


                        seenGalleryImages.add(
                            item.image_url
                        );


                        uniqueGalleryItems.push(
                            item
                        );
                    }
                );


                /* =========================================
                   INSERT GALLERY IMAGES

                   Maximum of four images.
                ========================================= */

                uniqueGalleryItems
                    .slice(0, 4)
                    .forEach(
                        item => {

                            const galleryItem =
                                document.createElement(
                                    "div"
                                );


                            galleryItem.className =
                                "gallery-item";


                            const image =
                                document.createElement(
                                    "img"
                                );


                            image.src =
                                item.image_url;


                            image.alt =
                                item.title ||
                                "Toluwani Couture";


                            image.loading =
                                "lazy";


                            galleryItem.appendChild(
                                image
                            );


                            homeGallery.appendChild(
                                galleryItem
                            );

                        }
                    );

            }


            /* =================================================
               CORE SECTION
            ================================================= */


            /* =============================================
               CUSTOM TAILORING

               Title: Tailoring Training
               Category: Training
            ============================================= */

            const tailoringItem =
                gallery.find(
                    item =>
                        item.title ===
                            "Tailoring Training" &&
                        item.category ===
                            "Training"
                );


            /* =============================================
               TAILORING TRAINING

               Title: Bridal Dress
               Category: Bridal Wear
            ============================================= */

            const trainingItem =
                gallery.find(
                    item =>
                        item.title ===
                            "Bridal Dress" &&
                        item.category ===
                            "Bridal Wear"
                );


            /* =============================================
               CORE IMAGE URLS
            ============================================= */

            const tailoringImage =
                tailoringItem?.image_url || "";


            const trainingImage =
                trainingItem?.image_url || "";


            /* =============================================
               CORE FABRIC

               Keep the original fabric separate
               from Fabric 01–04.
            ============================================= */

            const coreFabricItem =
                fabrics.find(
                    item =>
                        ![
                            "Fabric 01",
                            "Fabric 02",
                            "Fabric 03",
                            "Fabric 04"
                        ].includes(
                            item.name
                        )
                );


            const fabricImage =
                coreFabricItem?.image_url || "";


            /* =============================================
               CORE IMAGE MAP
            ============================================= */

            const coreImageMap = {

                tailoring:
                    tailoringImage,

                fabric:
                    fabricImage,

                training:
                    trainingImage
            };


            /* =============================================
               INSERT CORE DATABASE IMAGES
            ============================================= */

            coreImages.forEach(
                image => {

                    const imageType =
                        image.dataset.coreImage;


                    const imageUrl =
                        coreImageMap[imageType];


                    if (!imageUrl) {
                        return;
                    }


                    image.src =
                        imageUrl;


                    image.loading =
                        "lazy";
                }
            );


            /* =================================================
               OUR CRAFT SECTION
            ================================================= */


            /* =============================================
               NATIVE & TRADITIONAL
            ============================================= */

            const nativeItem =
                gallery.find(
                    item =>
                        item.title ===
                            "Native & Traditional"
                );


            /* =============================================
               CONTEMPORARY WOMENSWEAR
            ============================================= */

            const contemporaryItem =
                gallery.find(
                    item =>
                        item.title ===
                            "Contemporary Womenswear"
                );


            /* =============================================
               OCCASION & BRIDAL
            ============================================= */

            const occasionItem =
                gallery.find(
                    item =>
                        item.title ===
                            "Occasion & Bridal"
                );


            /* =============================================
               ENGLISH & READY-TO-WEAR
            ============================================= */

            const readyMadeItem =
                gallery.find(
                    item =>
                        item.title ===
                            "English & Ready-to-Wear"
                );


            /* =============================================
               CRAFT IMAGE URLS
            ============================================= */

            const nativeImage =
                nativeItem?.image_url || "";


            const contemporaryImage =
                contemporaryItem?.image_url || "";


            const occasionImage =
                occasionItem?.image_url || "";


            const readyMadeImage =
                readyMadeItem?.image_url || "";


            /* =============================================
               CRAFT IMAGE MAP
            ============================================= */

            const craftImageMap = {

                native:
                    nativeImage,

                contemporary:
                    contemporaryImage,

                occasion:
                    occasionImage,

                "ready-made":
                    readyMadeImage
            };


            /* =============================================
               INSERT CRAFT DATABASE IMAGES
            ============================================= */

            craftImages.forEach(
                image => {

                    const imageType =
                        image.dataset.createImage;


                    const imageUrl =
                        craftImageMap[imageType];


                    if (!imageUrl) {
                        return;
                    }


                    image.src =
                        imageUrl;


                    image.loading =
                        "lazy";
                }
            );


            /* =================================================
               FABRICS & MATERIALS SECTION
            ================================================= */


            /* =============================================
               GET THE FOUR NEW HOMEPAGE FABRICS

               These are specifically Fabric 01–04,
               so the Core fabric is never reused.
            ============================================= */

            const homepageFabrics =
                fabrics.filter(
                    item =>
                        [
                            "Fabric 01",
                            "Fabric 02",
                            "Fabric 03",
                            "Fabric 04"
                        ].includes(
                            item.name
                        )
                );


            /* =============================================
               INSERT FABRIC DATABASE DATA
            ============================================= */

            fabricCards.forEach(
                (card, index) => {

                    const fabric =
                        homepageFabrics[index];


                    if (!fabric) {
                        return;
                    }


                    const image =
                        card.querySelector(
                            ".fabric-db-image"
                        );


                    const category =
                        card.querySelector(
                            ".fabric-category"
                        );


                    const name =
                        card.querySelector(
                            ".fabric-name"
                        );


                    const price =
                        card.querySelector(
                            ".fabric-price"
                        );


                    /* =====================================
                       IMAGE
                    ===================================== */

                    if (
                        image &&
                        fabric.image_url
                    ) {

                        image.src =
                            fabric.image_url;

                        image.loading =
                            "lazy";

                        image.alt =
                            fabric.name;
                    }


                    /* =====================================
                       CATEGORY
                    ===================================== */

                    if (category) {

                        category.textContent =
                            fabric.category || "";
                    }


                    /* =====================================
                       NAME
                    ===================================== */

                    if (name) {

                        name.textContent =
                            fabric.name || "";
                    }


                    /* =====================================
                       PRICE
                    ===================================== */

                    if (price) {

                        if (
                            fabric.price !== null &&
                            fabric.price !== undefined &&
                            fabric.price !== ""
                        ) {

                            price.textContent =
                                `₦${Number(
                                    fabric.price
                                ).toLocaleString()}`;

                        } else {

                            price.textContent =
                                "";
                        }
                    }
                }
            );


        } catch (error) {

            console.error(
                "Toluwani Database Images Error:",
                error
            );
        }
    }


    loadDatabaseImages();


    /* =====================================================
       HERO
    ===================================================== */

    const hero =
        document.querySelector(".home-hero");


    if (hero) {

        const heroImage =
            hero.querySelector(".hero-image");


        const heroOverlay =
            hero.querySelector(".hero-overlay");


        const heroEyebrow =
            hero.querySelector(
                ".hero-content .eyebrow"
            );


        const heroTitle =
            hero.querySelector(
                ".hero-content h1"
            );


        const heroDescription =
            hero.querySelector(
                ".hero-description"
            );


        const heroActions =
            hero.querySelector(
                ".hero-actions"
            );


        const heroScroll =
            hero.querySelector(
                ".hero-scroll"
            );


        /* =================================================
           SAVE ORIGINAL TEXT
        ================================================= */

        const eyebrowText =
            heroEyebrow
                ? heroEyebrow.textContent.trim()
                : "";


        const descriptionText =
            heroDescription
                ? heroDescription.textContent.trim()
                : "";


        /* =================================================
           HERO IMAGE ENTRANCE
        ================================================= */

        if (heroImage) {

            heroImage.classList.add(
                "hero-image-enter"
            );


            setTimeout(() => {

                heroImage.classList.add(
                    "hero-image-active"
                );

            }, 100);
        }


        /* =================================================
           HERO OVERLAY ENTRANCE
        ================================================= */

        if (heroOverlay) {

            heroOverlay.classList.add(
                "hero-overlay-enter"
            );


            setTimeout(() => {

                heroOverlay.classList.add(
                    "hero-overlay-active"
                );

            }, 200);
        }


        /* =================================================
           INITIAL STATES
        ================================================= */

        if (heroEyebrow) {

            heroEyebrow.textContent = "";

            heroEyebrow.style.opacity =
                "1";

            heroEyebrow.style.visibility =
                "visible";
        }


        if (heroTitle) {

            heroTitle.style.opacity =
                "1";

            heroTitle.style.visibility =
                "visible";
        }


        if (heroDescription) {

            heroDescription.textContent =
                "";

            heroDescription.style.opacity =
                "1";

            heroDescription.style.visibility =
                "visible";
        }


        if (heroActions) {

            heroActions.style.opacity =
                "0";

            heroActions.style.transform =
                "translateY(14px)";

            heroActions.style.visibility =
                "visible";
        }


        if (heroScroll) {

            heroScroll.style.opacity =
                "0";

            heroScroll.style.visibility =
                "visible";
        }


        /* =================================================
           TYPEWRITER
        ================================================= */

        async function typeText(
            element,
            text,
            speed
        ) {

            if (!element) return;


            element.textContent = "";


            for (
                const character of text
            ) {

                element.textContent +=
                    character;


                let delay =
                    speed;


                if (
                    character === " "
                ) {

                    delay =
                        speed * 0.45;
                }


                if (
                    ",.!?;:".includes(
                        character
                    )
                ) {

                    delay =
                        speed * 2.2;
                }


                await wait(delay);
            }
        }


        /* =================================================
           PREPARE MAIN HEADING
           WORD-BY-WORD REVEAL
        ================================================= */

        function prepareHeroHeading() {

            if (!heroTitle) {
                return [];
            }


            const originalHTML =
                heroTitle.innerHTML;


            const originalText =
                originalHTML
                    .replace(
                        /<br\s*\/?>/gi,
                        "\n"
                    )
                    .replace(
                        /<[^>]*>/g,
                        ""
                    )
                    .trim();


            heroTitle.innerHTML = "";


            const words = [];


            const lines =
                originalText.split("\n");


            lines.forEach(
                (
                    line,
                    lineIndex
                ) => {

                    const lineWords =
                        line
                            .trim()
                            .split(/\s+/);


                    lineWords.forEach(
                        wordText => {

                            if (!wordText) {
                                return;
                            }


                            const word =
                                document.createElement(
                                    "span"
                                );


                            word.className =
                                "hero-title-word";


                            word.textContent =
                                wordText;


                            word.style.display =
                                "inline-block";


                            word.style.opacity =
                                "0";


                            word.style.transform =
                                "translateY(24px)";


                            word.style.transition =
                                "opacity .75s ease, transform .75s cubic-bezier(.22,1,.36,1)";


                            heroTitle.appendChild(
                                word
                            );


                            heroTitle.appendChild(
                                document.createTextNode(
                                    " "
                                )
                            );


                            words.push(
                                word
                            );
                        }
                    );


                    if (
                        lineIndex <
                        lines.length - 1
                    ) {

                        heroTitle.appendChild(
                            document.createElement(
                                "br"
                            )
                        );
                    }
                }
            );


            heroTitle.style.opacity =
                "1";


            heroTitle.style.visibility =
                "visible";


            heroTitle.style.display =
                "block";


            return words;
        }


        const heroWords =
            prepareHeroHeading();


        /* =================================================
           REVEAL HERO HEADING
        ================================================= */

        async function revealHeroHeading() {

            for (
                const word
                of heroWords
            ) {

                word.style.opacity =
                    "1";


                word.style.transform =
                    "translateY(0)";


                await wait(180);
            }
        }


        /* =================================================
           PREPARE HERO DESCRIPTION
           WORD-BY-WORD REVEAL
        ================================================= */

        function prepareHeroDescription() {

            if (
                !heroDescription ||
                !descriptionText
            ) {

                return [];
            }


            heroDescription.innerHTML =
                "";


            const words =
                descriptionText.split(
                    /\s+/
                );


            const elements = [];


            words.forEach(
                (
                    wordText,
                    index
                ) => {

                    const word =
                        document.createElement(
                            "span"
                        );


                    word.className =
                        "hero-description-word";


                    word.textContent =
                        wordText;


                    word.style.display =
                        "inline-block";


                    word.style.opacity =
                        "0";


                    word.style.transform =
                        "translateY(24px)";


                    word.style.transition =
                        "opacity .75s ease, transform .75s cubic-bezier(.22,1,.36,1)";


                    heroDescription.appendChild(
                        word
                    );


                    if (
                        index <
                        words.length - 1
                    ) {

                        heroDescription.appendChild(
                            document.createTextNode(
                                " "
                            )
                        );
                    }


                    elements.push(
                        word
                    );
                }
            );


            return elements;
        }


        const descriptionElements =
            prepareHeroDescription();


        /* =================================================
           REVEAL HERO DESCRIPTION
        ================================================= */

        async function revealHeroDescription() {

            for (
                const word
                of descriptionElements
            ) {

                word.style.opacity =
                    "1";


                word.style.transform =
                    "translateY(0)";


                await wait(90);
            }
        }


        /* =================================================
           BUTTONS
        ================================================= */

        function showHeroActions() {

            if (!heroActions) {
                return;
            }


            heroActions.style.transition =
                "opacity .8s ease, transform .8s cubic-bezier(.22,1,.36,1)";


            heroActions.style.opacity =
                "1";


            heroActions.style.transform =
                "translateY(0)";
        }


        /* =================================================
           SCROLL INDICATOR
        ================================================= */

        function showHeroScroll() {

            if (!heroScroll) {
                return;
            }


            heroScroll.style.transition =
                "opacity .8s ease";


            heroScroll.style.opacity =
                "1";
        }


        /* =================================================
           RUN HERO ANIMATION
        ================================================= */

        async function runHeroAnimation() {

            await wait(700);


            const eyebrowPromise =
                typeText(
                    heroEyebrow,
                    eyebrowText,
                    38
                );


            showHeroActions();


            await wait(420);


            const headingPromise =
                revealHeroHeading();


            await wait(420);


            const descriptionPromise =
                revealHeroDescription();


            await Promise.all([
                eyebrowPromise,
                headingPromise,
                descriptionPromise
            ]);


            await wait(500);


            showHeroScroll();
        }


        runHeroAnimation();
    }


    /* =====================================================
       HAMBURGER / MOBILE MENU
    ===================================================== */

    const menuToggle =
        document.getElementById(
            "menuToggle"
        );


    const mobileNav =
        document.getElementById(
            "mobileNav"
        );


    function closeMobileMenu() {

        if (
            !menuToggle ||
            !mobileNav
        ) {
            return;
        }


        menuToggle.classList.remove(
            "active"
        );


        mobileNav.classList.remove(
            "active"
        );


        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );


        menuToggle.setAttribute(
            "aria-label",
            "Open navigation"
        );


        document.body.classList.remove(
            "menu-open"
        );
    }


    function openMobileMenu() {

        if (
            !menuToggle ||
            !mobileNav
        ) {
            return;
        }


        menuToggle.classList.add(
            "active"
        );


        mobileNav.classList.add(
            "active"
        );


        menuToggle.setAttribute(
            "aria-expanded",
            "true"
        );


        menuToggle.setAttribute(
            "aria-label",
            "Close navigation"
        );


        document.body.classList.add(
            "menu-open"
        );
    }


    if (
        menuToggle &&
        mobileNav
    ) {

        menuToggle.addEventListener(
            "click",
            event => {

                event.stopPropagation();


                if (
                    mobileNav.classList.contains(
                        "active"
                    )
                ) {

                    closeMobileMenu();

                } else {

                    openMobileMenu();
                }
            }
        );


        mobileNav
            .querySelectorAll("a")
            .forEach(
                link => {

                    link.addEventListener(
                        "click",
                        () => {

                            closeMobileMenu();
                        }
                    );
                }
            );


        document.addEventListener(
            "click",
            event => {

                if (
                    mobileNav.classList.contains(
                        "active"
                    ) &&
                    !mobileNav.contains(
                        event.target
                    ) &&
                    !menuToggle.contains(
                        event.target
                    )
                ) {

                    closeMobileMenu();
                }
            }
        );


        window.addEventListener(
            "scroll",
            () => {

                if (
                    mobileNav.classList.contains(
                        "active"
                    )
                ) {

                    closeMobileMenu();
                }
            },
            {
                passive: true
            }
        );
    }


    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeMobileMenu();
            }
        }
    );


    /* =====================================================
       SCROLL REVEAL
    ===================================================== */

    const revealElements =
        document.querySelectorAll(
            ".intro-inner, " +
            ".why-section .section-heading, " +
            ".why-item, " +
            ".services-section .section-heading, " +
            ".service-card, " +
            ".process-heading, " +
            ".process-item, " +
            ".featured-image, " +
            ".featured-content, " +
            ".gallery-section .section-heading, " +
            ".gallery-item, " +
            ".gallery-button, " +
            ".appointment-content"
        );


    revealElements.forEach(
        element => {

            element.classList.add(
                "scroll-reveal"
            );
        }
    );


    /* =====================================================
       STAGGER WHY CARDS
    ===================================================== */

    document
        .querySelectorAll(
            ".why-item"
        )
        .forEach(
            (card, index) => {

                card.style.setProperty(
                    "--reveal-delay",
                    `${index * 90}ms`
                );
            }
        );


    /* =====================================================
       STAGGER SERVICE CARDS
    ===================================================== */

    document
        .querySelectorAll(
            ".service-card"
        )
        .forEach(
            (card, index) => {

                card.style.setProperty(
                    "--reveal-delay",
                    `${index * 90}ms`
                );
            }
        );


    /* =====================================================
       STAGGER PROCESS
    ===================================================== */

    document
        .querySelectorAll(
            ".process-item"
        )
        .forEach(
            (item, index) => {

                item.style.setProperty(
                    "--reveal-delay",
                    `${index * 80}ms`
                );
            }
        );


    /* =====================================================
       STAGGER GALLERY
    ===================================================== */

    document
        .querySelectorAll(
            ".gallery-item"
        )
        .forEach(
            (item, index) => {

                item.style.setProperty(
                    "--reveal-delay",
                    `${index * 100}ms`
                );
            }
        );


    /* =====================================================
       INTERSECTION OBSERVER
    ===================================================== */

    if (
        "IntersectionObserver" in window
    ) {

        const revealObserver =
            new IntersectionObserver(
                (
                    entries,
                    observer
                ) => {

                    entries.forEach(
                        entry => {

                            if (
                                entry.isIntersecting
                            ) {

                                entry.target.classList.add(
                                    "is-visible"
                                );


                                observer.unobserve(
                                    entry.target
                                );
                            }
                        }
                    );
                },
                {
                    threshold: 0.12,

                    rootMargin:
                        "0px 0px -60px 0px"
                }
            );


        revealElements.forEach(
            element => {

                revealObserver.observe(
                    element
                );
            }
        );

    } else {

        revealElements.forEach(
            element => {

                element.classList.add(
                    "is-visible"
                );
            }
        );
    }


    /* =====================================================
       HEADER SCROLL EFFECT
    ===================================================== */

    const header =
        document.getElementById(
            "siteHeader"
        );


    if (header) {

        const updateHeader =
            () => {

                if (
                    window.scrollY > 30
                ) {

                    header.classList.add(
                        "header-scrolled"
                    );

                } else {

                    header.classList.remove(
                        "header-scrolled"
                    );
                }
            };


        updateHeader();


        window.addEventListener(
            "scroll",
            updateHeader,
            {
                passive: true
            }
        );
    }


    /* =====================================================
       SCROLL TO TOP
    ===================================================== */

    const scrollTopBtn =
        document.getElementById(
            "scrollTopBtn"
        );


    if (scrollTopBtn) {

        const updateScrollButton =
            () => {

                if (
                    window.scrollY > 500
                ) {

                    scrollTopBtn.classList.add(
                        "show"
                    );

                } else {

                    scrollTopBtn.classList.remove(
                        "show"
                    );
                }
            };


        updateScrollButton();


        window.addEventListener(
            "scroll",
            updateScrollButton,
            {
                passive: true
            }
        );


        scrollTopBtn.addEventListener(
            "click",
            event => {

                event.preventDefault();


                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            }
        );
    }


    /* =====================================================
       SMOOTH INTERNAL LINKS
    ===================================================== */

    document
        .querySelectorAll(
            'a[href^="#"]'
        )
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    event => {

                        const targetId =
                            link.getAttribute(
                                "href"
                            );


                        if (
                            !targetId ||
                            targetId === "#"
                        ) {

                            return;
                        }


                        const target =
                            document.querySelector(
                                targetId
                            );


                        if (target) {

                            event.preventDefault();


                            target.scrollIntoView({
                                behavior:
                                    "smooth",

                                block:
                                    "start"
                            });
                        }
                    }
                );
            }
        );


    /* =====================================================
       INTRO
       BRAND + HEADING = STATIC
       DESCRIPTION = TYPEWRITER
       HEIGHT REMAINS STABLE
    ===================================================== */

    const introBrand =
        document.querySelector(
            ".intro-inner .eyebrow"
        );


    const introHeading =
        document.querySelector(
            ".intro-inner h2"
        );


    const introDescription =
        document.querySelector(
            ".intro-inner .intro-text"
        );


    /* =====================================================
       SAVE ORIGINAL INTRO DESCRIPTION
    ===================================================== */

    const introDescriptionText =
        introDescription
            ? introDescription.textContent.trim()
            : "";


    /* =====================================================
       KEEP BRAND STATIC
    ===================================================== */

    if (introBrand) {

        introBrand.style.opacity =
            "1";


        introBrand.style.visibility =
            "visible";
    }


    /* =====================================================
       KEEP HEADING STATIC
    ===================================================== */

    if (introHeading) {

        introHeading.style.opacity =
            "1";


        introHeading.style.visibility =
            "visible";
    }


    /* =====================================================
       RESERVE INTRO DESCRIPTION SPACE
    ===================================================== */

    if (
        introDescription &&
        introDescriptionText
    ) {

        introDescription.textContent =
            introDescriptionText;


        const measuredHeight =
            introDescription.scrollHeight;


        introDescription.style.minHeight =
            `${measuredHeight}px`;


        introDescription.style.opacity =
            "1";


        introDescription.style.visibility =
            "visible";
    }


    /* =====================================================
       INTRO DESCRIPTION TYPEWRITER
    ===================================================== */

    async function typeIntroDescription(
        element,
        text,
        speed = 35
    ) {

        if (!element) return;


        element.textContent = "";


        for (
            const character of text
        ) {

            element.textContent +=
                character;


            let delay =
                speed;


            if (
                character === " "
            ) {

                delay =
                    speed * 0.45;
            }


            if (
                ",.!?;:".includes(
                    character
                )
            ) {

                delay =
                    speed * 2.2;
            }


            await wait(delay);
        }
    }


    /* =====================================================
       RUN INTRO ANIMATION
    ===================================================== */

    async function runIntroAnimation() {

        if (
            !introDescription ||
            !introDescriptionText
        ) {

            return;
        }


        introDescription.style.minHeight =
            `${introDescription.scrollHeight}px`;


        introDescription.style.opacity =
            "1";


        introDescription.style.visibility =
            "visible";


        while (true) {

            await typeIntroDescription(
                introDescription,
                introDescriptionText,
                65
            );


            await wait(4500);


            introDescription.style.transition =
                "opacity .5s ease";


            introDescription.style.opacity =
                "0";


            await wait(600);


            introDescription.textContent =
                "";


            await wait(700);


            introDescription.style.opacity =
                "1";


            await wait(300);
        }
    }


    runIntroAnimation();


    /* =====================================================
       WHY TOLUWANI
       MOBILE AUTO-SLIDE CAROUSEL
    ===================================================== */

    const whyGrid =
        document.querySelector(
            ".why-grid"
        );


    const whyCards =
        document.querySelectorAll(
            ".why-item"
        );


    const whyDots =
        document.querySelectorAll(
            ".why-dot"
        );


    if (
        whyGrid &&
        whyCards.length > 1
    ) {

        let currentWhyIndex = 0;

        let autoSlideTimer = null;

        let resumeTimer = null;

        let scrollTimer = null;


        const reducedMotion =
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            );


        /* =================================================
           MOBILE CHECK
        ================================================= */

        function isMobileWhy() {

            return window.innerWidth <= 700;
        }


        /* =================================================
           UPDATE DOTS
        ================================================= */

        function updateWhyDots(index) {

            whyDots.forEach(
                (
                    dot,
                    dotIndex
                ) => {

                    dot.classList.toggle(
                        "active",
                        dotIndex === index
                    );


                    dot.setAttribute(
                        "aria-current",
                        dotIndex === index
                            ? "true"
                            : "false"
                    );
                }
            );
        }


        /* =================================================
           GET ACTUAL CARD POSITION
        ================================================= */

        function getWhyScrollPosition(index) {

            const card =
                whyCards[index];


            if (!card) {
                return 0;
            }


            const cardRect =
                card.getBoundingClientRect();


            const gridRect =
                whyGrid.getBoundingClientRect();


            return (
                cardRect.left -
                gridRect.left +
                whyGrid.scrollLeft
            );
        }


        /* =================================================
           MOVE TO CARD
        ================================================= */

        function goToWhyCard(index) {

            if (!isMobileWhy()) {
                return;
            }


            if (
                index >=
                whyCards.length
            ) {

                index = 0;
            }


            if (index < 0) {

                index =
                    whyCards.length - 1;
            }


            currentWhyIndex =
                index;


            whyGrid.scrollTo({

                left:
                    getWhyScrollPosition(
                        index
                    ),

                behavior:
                    "smooth"
            });


            updateWhyDots(
                currentWhyIndex
            );
        }


        /* =================================================
           STOP AUTO SLIDE
        ================================================= */

        function stopWhyAutoSlide() {

            if (autoSlideTimer) {

                clearInterval(
                    autoSlideTimer
                );


                autoSlideTimer =
                    null;
            }
        }


        /* =================================================
           START AUTO SLIDE
        ================================================= */

        function startWhyAutoSlide() {

            stopWhyAutoSlide();


            if (
                !isMobileWhy() ||
                reducedMotion.matches
            ) {

                return;
            }


            autoSlideTimer =
                setInterval(() => {

                    if (
                        !isMobileWhy()
                    ) {

                        stopWhyAutoSlide();

                        return;
                    }


                    const nextIndex =
                        currentWhyIndex + 1;


                    goToWhyCard(
                        nextIndex
                    );

                }, 2500);
        }


        /* =================================================
           PAUSE AUTO SLIDE
        ================================================= */

        function pauseWhyAutoSlide() {

            stopWhyAutoSlide();


            if (resumeTimer) {

                clearTimeout(
                    resumeTimer
                );
            }


            resumeTimer =
                setTimeout(() => {

                    startWhyAutoSlide();

                }, 5000);
        }


        /* =================================================
           UPDATE CURRENT CARD AFTER SWIPE
        ================================================= */

        function updateWhyIndexFromScroll() {

            if (!isMobileWhy()) {
                return;
            }


            const gridRect =
                whyGrid.getBoundingClientRect();


            let closestIndex = 0;


            let closestDistance =
                Infinity;


            whyCards.forEach(
                (
                    card,
                    index
                ) => {

                    const cardRect =
                        card.getBoundingClientRect();


                    const distance =
                        Math.abs(
                            cardRect.left -
                            gridRect.left
                        );


                    if (
                        distance <
                        closestDistance
                    ) {

                        closestDistance =
                            distance;


                        closestIndex =
                            index;
                    }
                }
            );


            currentWhyIndex =
                closestIndex;


            updateWhyDots(
                currentWhyIndex
            );
        }


        /* =================================================
           SCROLL LISTENER
        ================================================= */

        whyGrid.addEventListener(
            "scroll",
            () => {

                if (!isMobileWhy()) {
                    return;
                }


                if (scrollTimer) {

                    clearTimeout(
                        scrollTimer
                    );
                }


                scrollTimer =
                    setTimeout(() => {

                        updateWhyIndexFromScroll();

                    }, 120);
            },
            {
                passive: true
            }
        );


        /* =================================================
           TOUCH START
        ================================================= */

        whyGrid.addEventListener(
            "touchstart",
            () => {

                pauseWhyAutoSlide();

            },
            {
                passive: true
            }
        );


        /* =================================================
           POINTER DOWN
        ================================================= */

        whyGrid.addEventListener(
            "pointerdown",
            () => {

                pauseWhyAutoSlide();

            }
        );


        /* =================================================
           DOT CLICKS
        ================================================= */

        whyDots.forEach(
            (
                dot,
                index
            ) => {

                dot.addEventListener(
                    "click",
                    () => {

                        if (
                            !isMobileWhy()
                        ) {

                            return;
                        }


                        pauseWhyAutoSlide();


                        goToWhyCard(
                            index
                        );
                    }
                );
            }
        );


        /* =================================================
           RESIZE
        ================================================= */

        window.addEventListener(
            "resize",
            () => {

                if (
                    !isMobileWhy()
                ) {

                    stopWhyAutoSlide();

                    return;
                }


                startWhyAutoSlide();
            }
        );


        /* =================================================
           REDUCED MOTION
        ================================================= */

        if (
            reducedMotion.addEventListener
        ) {

            reducedMotion.addEventListener(
                "change",
                () => {

                    if (
                        reducedMotion.matches
                    ) {

                        stopWhyAutoSlide();

                    } else {

                        startWhyAutoSlide();
                    }
                }
            );
        }


        /* =================================================
           INITIALIZE
        ================================================= */

        updateWhyDots(
            currentWhyIndex
        );


        startWhyAutoSlide();
    }

});
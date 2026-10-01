const GALLERY_SUPABASE_URL =
    "https://istbncxutptjguijzfqq.supabase.co";

const GALLERY_SUPABASE_KEY =
    "sb_publishable_uZOo6VslQBSy5pn-RoK_pA_K6URSPSZ";

const GALLERY_TABLE =
    "toluwani_full_gallery";

const gallerySections =
    document.getElementById("gallerySections");


/* =========================================
   LOAD GALLERY
========================================= */

async function loadGallery() {
    try {
        const response = await fetch(
            `${GALLERY_SUPABASE_URL}/rest/v1/${GALLERY_TABLE}?select=*`,
            {
                method: "GET",
                headers: {
                    apikey: GALLERY_SUPABASE_KEY,
                    Authorization:
                        `Bearer ${GALLERY_SUPABASE_KEY}`
                }
            }
        );

        console.log("STATUS:", response.status);

        const result =
            await response.json();

        console.log(
            "SUPABASE RESULT:",
            result
        );

        if (!response.ok) {
            gallerySections.innerHTML = `
                <div class="gallery-error">
                    <p>
                        Unable to load gallery.
                    </p>
                </div>
            `;
            return;
        }

        if (
            !Array.isArray(result) ||
            result.length === 0
        ) {
            gallerySections.innerHTML = `
                <div class="gallery-message">
                    <p>
                        No gallery pieces are available yet.
                    </p>
                </div>
            `;
            return;
        }

        renderGallery(result);

    } catch (error) {
        console.error(
            "GALLERY ERROR:",
            error
        );

        gallerySections.innerHTML = `
            <div class="gallery-error">
                <p>
                    Unable to load gallery.
                </p>
            </div>
        `;
    }
}


/* =========================================
   RENDER GALLERY
========================================= */

function renderGallery(items) {

    gallerySections.innerHTML = "";

    const categories = [
        "Traditional",
        "Wedding",
        "English Wear",
        "Bespoke Dress",
        "Ready to Wear"
    ];

    categories.forEach(category => {

        const categoryItems =
            items
                .filter(
                    item =>
                        item.category === category
                )
                .sort(
                    (a, b) =>
                        (a.display_order || 0) -
                        (b.display_order || 0)
                );

        if (!categoryItems.length) {
            return;
        }

        const section =
            document.createElement("section");

        section.className =
            `full-gallery-category full-gallery-${category
                .toLowerCase()
                .replace(/\s+/g, "-")}`;

        section.innerHTML = `

            <div class="full-gallery-category-header">

                <p class="full-gallery-category-eyebrow">
${
    category === "Traditional"
        ? "TRADITIONAL COLLECTION"
        : category === "Wedding"
            ? "WEDDING COLLECTION"
            : category === "English Wear"
                ? "ENGLISH WEAR COLLECTION"
                : category === "Bespoke Dress"
                    ? "BESPOKE DRESS COLLECTION"
                    : category === "Ready to Wear"
                        ? "READY TO WEAR COLLECTION"
                        : escapeHTML(category)
}
                </p>


                <h2 class="full-gallery-category-heading">
${
    category === "Traditional"
        ? "Heritage in Every Thread"
        : category === "Wedding"
            ? "Made for Moments That Matter"
            : category === "English Wear"
                ? "Tailored for Modern Elegance"
                : category === "Bespoke Dress"
                    ? "Made Exclusively for You"
                    : category === "Ready to Wear"
                        ? "Effortless, Ready for You"
                        : escapeHTML(category)
}
                </h2>


${
    category === "Traditional"
        ? `
            <p class="full-gallery-category-intro">
                A curated collection celebrating
                traditional Nigerian craftsmanship,
                rich textures and timeless silhouettes,
                thoughtfully brought into the modern wardrobe.
            </p>
        `
        : category === "Wedding"
            ? `
                <p class="full-gallery-category-intro">
                    Refined bridal and occasion pieces crafted
                    with graceful details, flattering silhouettes
                    and a timeless sense of elegance.
                </p>
            `
            : category === "English Wear"
                ? `
                    <p class="full-gallery-category-intro">
                        A refined collection of contemporary
                        silhouettes, clean tailoring and effortless
                        sophistication, designed for occasions that
                        call for understated confidence.
                    </p>
                `
                : category === "Bespoke Dress"
                    ? `
                        <p class="full-gallery-category-intro">
                            Thoughtfully designed and individually crafted
                            pieces created around your style, silhouette
                            and occasion, with every detail tailored to
                            feel distinctly yours.
                        </p>
                    `
                    : category === "Ready to Wear"
                        ? `
                            <p class="full-gallery-category-intro">
                                A curated selection of refined pieces designed
                                for effortless style, combining contemporary
                                details, timeless elegance and the ease of a
                                look ready to wear.
                            </p>
                        `
                        : ""
}

            </div>

            <div class="full-gallery-grid"></div>
        `;

        const grid =
            section.querySelector(
                ".full-gallery-grid"
            );

        categoryItems.forEach(item => {

            grid.appendChild(
                createGalleryCard(item)
            );

        });

        gallerySections.appendChild(
            section
        );

    });
}


/* =========================================
   CREATE GALLERY CARD
========================================= */

function createGalleryCard(item) {

    const card =
        document.createElement("article");

    card.className =
        "full-gallery-card";

    card.innerHTML = `

        <button
            type="button"
            class="full-gallery-card-image"
            aria-label="View ${escapeHTML(item.title)}"
        >
            <img
                src="${escapeAttribute(item.image_url)}"
                alt="${escapeAttribute(item.title)}"
                loading="lazy"
            >
        </button>

        <div class="full-gallery-card-content">

            <p class="full-gallery-card-category">
                ${escapeHTML(item.category)}
            </p>

            <h3 class="full-gallery-card-title">
                ${escapeHTML(item.title)}
            </h3>

            <p class="full-gallery-card-description">
                ${escapeHTML(item.description || "")}
            </p>

            <button
                type="button"
                class="full-gallery-card-arrow"
                aria-label="View full details for ${escapeHTML(item.title)}"
            >
                <i class="fa-solid fa-arrow-right"></i>
            </button>

        </div>
    `;

    const imageButton =
        card.querySelector(
            ".full-gallery-card-image"
        );

    const arrowButton =
        card.querySelector(
            ".full-gallery-card-arrow"
        );

    imageButton.addEventListener(
        "click",
        () => openGalleryModal(item)
    );

    arrowButton.addEventListener(
        "click",
        () => openGalleryModal(item)
    );

    return card;
}


/* =========================================
   SECURITY HELPERS
========================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


function escapeAttribute(value) {
    return escapeHTML(value);
}


/* =========================================
   GALLERY MODAL
========================================= */

function openGalleryModal(item) {

    const modal =
        document.getElementById(
            "galleryModal"
        );

    const image =
        document.getElementById(
            "galleryModalImage"
        );

    const category =
        document.getElementById(
            "galleryModalCategory"
        );

    const title =
        document.getElementById(
            "galleryModalTitle"
        );

    const description =
        document.getElementById(
            "galleryModalDescription"
        );

    const bookButton =
        document.getElementById(
            "galleryBookButton"
        );


    image.src =
        item.image_url;

    image.alt =
        item.title;

    category.textContent =
        item.category;

    title.textContent =
        item.title;

    description.textContent =
        item.description || "";


    if (item.bookable) {

        bookButton.style.display =
            "inline-flex";

    } else {

        bookButton.style.display =
            "none";

    }


    modal.classList.remove(
        "modal-traditional",
        "modal-wedding",
        "modal-english-wear",
        "modal-bespoke-dress",
        "modal-ready-to-wear"
    );


    if (item.category === "Traditional") {

        modal.classList.add(
            "modal-traditional"
        );

    }


    if (item.category === "Wedding") {

        modal.classList.add(
            "modal-wedding"
        );

    }


    if (item.category === "English Wear") {

        modal.classList.add(
            "modal-english-wear"
        );

    }


    if (item.category === "Bespoke Dress") {

        modal.classList.add(
            "modal-bespoke-dress"
        );

    }
if (item.category === "Ready to Wear") {
    modal.classList.add(
        "modal-ready-to-wear"
    );
}

    modal.classList.add(
        "is-open"
    );

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "gallery-modal-open"
    );

}


/* =========================================
   CLOSE MODAL
========================================= */

function closeGalleryModal() {

    const modal =
        document.getElementById(
            "galleryModal"
        );

    modal.classList.remove(
        "is-open"
    );

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "gallery-modal-open"
    );

}


/* =========================================
   INITIALIZE
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadGallery();

        const closeButton =
            document.getElementById(
                "galleryModalClose"
            );

        const overlay =
            document.getElementById(
                "galleryModalOverlay"
            );


        closeButton?.addEventListener(
            "click",
            closeGalleryModal
        );


        overlay?.addEventListener(
            "click",
            closeGalleryModal
        );


        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Escape"
                ) {
                    closeGalleryModal();
                }

            }
        );

    }
);
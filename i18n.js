"use strict";

/* =========================================================
   ESTORA — LANGUAGE SWITCHER (EN <-> AR)
   ---------------------------------------------------------
   How it works
   ------------
   Instead of adding data-i18n to every single tag, this file
   walks the page, finds each piece of English text and swaps
   it for the Arabic value in the dictionary below. The
   original English is remembered on the node itself, so
   switching back is exact.

   A MutationObserver re-runs the pass whenever new content
   is rendered by JavaScript (property cards, details page,
   filter results...), so dynamic content is translated too.

   To add a new phrase: put it in DICTIONARY exactly as it
   appears in the HTML. Nothing else to do.
========================================================= */

const ESTORA_LANG_KEY = "estoraLang";


/* =========================================================
   DICTIONARY  —  english : arabic
========================================================= */

const DICTIONARY = {

    /* ---------- Navigation ---------- */

    "Home": "الرئيسية",
    "Properties": "العقارات",
    "About": "من نحن",
    "Contact": "تواصل معنا",
    "Let's Talk": "تواصل معنا",
    "REAL ESTATE": "عقارات",
    "Favorites": "المفضلة",
    "Admin": "لوحة التحكم",

    /* ---------- Loader / tagline ---------- */

    "Exceptional spaces. Extraordinary living.":
        "أماكن استثنائية. حياة غير عادية.",

    /* ---------- Hero ---------- */

    "PREMIUM REAL ESTATE": "عقارات فاخرة",
    "Find a place": "اعثر على مكان",
    "you'll love": "سوف تحبه",
    "to call home.": "لتسميه بيتك.",

    "Discover exceptional properties, remarkable architecture and spaces designed around the way you want to live.":
        "اكتشف عقارات استثنائية وتصاميم معمارية مميزة ومساحات مصممة لتناسب أسلوب حياتك.",

    "Explore Properties": "استكشف العقارات",
    "Discover More": "اكتشف المزيد",
    "SCROLL TO EXPLORE": "مرر للاستكشاف",
    "Cairo, Egypt": "القاهرة، مصر",

    /* ---------- Collection ---------- */

    "ESTORA COLLECTION": "مجموعة إستورا",
    "Find Your": "اعثر على",
    "Perfect Property": "عقارك المثالي",

    "Discover our exclusive collection of carefully selected properties.":
        "اكتشف مجموعتنا الحصرية من العقارات المختارة بعناية.",

    "No Properties Available": "لا توجد عقارات متاحة",
    "New properties will appear here soon.":
        "سوف تظهر العقارات الجديدة هنا قريباً.",

    /* ---------- Search box ---------- */

    "FIND YOUR PROPERTY": "ابحث عن عقارك",
    "What are you looking for?": "عن ماذا تبحث؟",

    "PURPOSE": "الغرض",
    "Buy": "شراء",
    "Rent": "إيجار",
    "Sale": "بيع",

    "LOCATION": "الموقع",
    "Any location": "كل المواقع",
    "New Cairo": "القاهرة الجديدة",
    "Sheikh Zayed": "الشيخ زايد",
    "North Coast": "الساحل الشمالي",
    "Maadi": "المعادي",

    "PROPERTY TYPE": "نوع العقار",
    "All types": "كل الأنواع",
    "Apartment": "شقة",
    "Villa": "فيلا",
    "Chalet": "شاليه",
    "Office": "مكتب",
    "House": "منزل",
    "Townhouse": "تاون هاوس",
    "Twin House": "توين هاوس",
    "Penthouse": "بنتهاوس",
    "Commercial": "تجاري",

    "PRICE RANGE": "نطاق السعر",
    "Any price": "كل الأسعار",
    "Search": "بحث",

    /* ---------- Featured ---------- */

    "SELECTED PROPERTIES": "عقارات مختارة",
    "Spaces worth": "مساحات تستحق",
    "discovering.": "الاكتشاف.",

    "A carefully selected collection of exceptional properties in remarkable locations.":
        "مجموعة مختارة بعناية من العقارات الاستثنائية في مواقع مميزة.",

    "View all properties": "عرض كل العقارات",

    /* ---------- Stats ---------- */

    "ESTORA IN NUMBERS": "إستورا في أرقام",
    "Built around": "مبنية على",
    "trust.": "الثقة.",
    "Happy Clients": "عميل سعيد",
    "Years Experience": "سنوات خبرة",
    "Locations": "موقع",

    /* ---------- About ---------- */

    "WHO WE ARE": "من نحن",
    "More than": "أكثر من",
    "real estate.": "مجرد عقارات.",

    "At ESTORA, we believe finding a property should feel as exceptional as the property itself.":
        "في إستورا نؤمن أن البحث عن عقار يجب أن يكون تجربة استثنائية مثل العقار نفسه.",

    "From contemporary apartments to extraordinary villas, we connect people with spaces that fit their ambitions, lifestyles and dreams.":
        "من الشقق العصرية إلى الفيلات الفاخرة، نربط الناس بالمساحات التي تناسب طموحاتهم وأسلوب حياتهم وأحلامهم.",

    "Discover our story": "اكتشف قصتنا",
    "EST.": "تأسست",
    "Building the future": "نبني المستقبل",

    /* ---------- Newsletter ---------- */

    "STAY UPDATED": "ابق على اطلاع",
    "Never Miss a": "لا تفوت أي",
    "New Property": "عقار جديد",

    "Subscribe to receive notifications whenever a new property is added to ESTORA.":
        "اشترك لتصلك إشعارات فور إضافة أي عقار جديد في إستورا.",

    "SUBSCRIBE": "اشترك",

    "Enter your WhatsApp number, e.g. +201001234567":
        "اكتب رقم الواتساب، مثال +201001234567",

    "Please enter your WhatsApp number.":
        "من فضلك اكتب رقم الواتساب.",

    "Successfully subscribed. Thank you!":
        "تم الاشتراك بنجاح. شكراً لك!",

    "You are already subscribed.":
        "أنت مشترك بالفعل.",

    /* ---------- CTA ---------- */

    "YOUR NEXT CHAPTER": "فصلك القادم",
    "Ready to find": "جاهز لتجد",
    "your place?": "مكانك؟",

    "Let our experts help you discover a property that feels like home.":
        "دع خبراءنا يساعدونك في اكتشاف عقار تشعر فيه أنك في بيتك.",

    "Talk to an Expert": "تحدث مع خبير",

    /* ---------- Footer ---------- */

    "Explore": "استكشف",
    "For Sale": "للبيع",
    "For Rent": "للإيجار",
    "Villas": "فيلات",
    "Apartments": "شقق",
    "Get in touch": "تواصل معنا",
    "Privacy Policy": "سياسة الخصوصية",
    "Terms & Conditions": "الشروط والأحكام",
    "© 2026 ESTORA. All Rights Reserved.":
        "© 2026 إستورا. جميع الحقوق محفوظة.",
    "Back to top": "العودة للأعلى",

    /* ---------- Property cards ---------- */

    "PRICE": "السعر",
    "VIEW PROPERTY": "عرض العقار",
    "SOLD OUT": "تم البيع",
    "FEATURED": "مميز",
    "NEW": "جديد",
    "EXCLUSIVE": "حصري",
    "Beds": "غرف",
    "Baths": "حمامات",
    "Property": "عقار",

    /* ---------- Properties page ---------- */

    "Explore our": "استكشف",
    "properties.": "عقاراتنا.",

    "Discover carefully selected villas, apartments and homes in some of Egypt's most desirable locations.":
        "اكتشف فيلات وشقق ومنازل مختارة بعناية في أفضل المواقع في مصر.",

    "Buy or Rent": "بيع أو إيجار",
    "All Locations": "كل المواقع",
    "All Types": "كل الأنواع",
    "RESET FILTERS": "إعادة تعيين",
    "No properties found": "لا توجد عقارات",
    "Try changing your filters.": "جرب تغيير خيارات البحث.",

    /* ---------- Details page ---------- */

    "Back to properties": "العودة للعقارات",
    "Back to Properties": "العودة للعقارات",
    "Property Price": "سعر العقار",
    "Contact Agent": "تواصل مع المسؤول",
    "Contact About Property": "استفسر عن العقار",
    "Contact on WhatsApp": "تواصل عبر واتساب",
    "Send Inquiry": "إرسال استفسار",
    "View on map": "عرض على الخريطة",
    "Available": "متاح",
    "Sold Out": "تم البيع",
    "Area": "المساحة",
    "Bedrooms": "غرف النوم",
    "Bathrooms": "الحمامات",
    "Property Not Found": "العقار غير موجود",

    "The property you're looking for is not available.":
        "العقار الذي تبحث عنه غير متاح.",

    "Contact ESTORA for full property information and availability.":
        "تواصل مع إستورا لمعرفة كل تفاصيل العقار وحالة التوفر."

};


/* =========================================================
   PATTERNS  —  for text that contains numbers
========================================================= */

const PATTERNS = [

    {
        test: /^(\d+)\s+PROPERTIES\s+FOUND$/i,
        ar: match => `${match[1]} عقار متاح`
    },

    {
        test: /^(\d+)\s+PROPERTY\s+FOUND$/i,
        ar: match => `${match[1]} عقار متاح`
    },

    {
        test: /^(\d[\d,.]*)\s*m²$/i,
        ar: match => `${match[1]} م²`
    },

    {
        test: /^(\d+)\s+Beds$/i,
        ar: match => `${match[1]} غرف`
    },

    {
        test: /^(\d+)\s+Baths$/i,
        ar: match => `${match[1]} حمام`
    }

];


/* =========================================================
   STATE
========================================================= */

let currentLang =
    localStorage.getItem(ESTORA_LANG_KEY) === "ar"
        ? "ar"
        : "en";

let isTranslating = false;

let observer = null;


/* =========================================================
   TRANSLATE ONE STRING
========================================================= */

function translateString(text) {

    const clean =
        text.replace(/\s+/g, " ").trim();


    if (!clean) return null;


    if (DICTIONARY[clean]) {

        return DICTIONARY[clean];

    }


    for (const pattern of PATTERNS) {

        const match = clean.match(pattern.test);

        if (match) {

            return pattern.ar(match);

        }

    }


    return null;

}


/* =========================================================
   SHOULD WE TOUCH THIS NODE?
========================================================= */

const SKIP_TAGS = [
    "SCRIPT",
    "STYLE",
    "NOSCRIPT",
    "TEXTAREA",
    "CODE",
    "PRE"
];


function isSkipped(node) {

    let element =
        node.nodeType === 3
            ? node.parentElement
            : node;


    while (element) {

        if (SKIP_TAGS.includes(element.tagName)) {

            return true;

        }

        if (
            element.hasAttribute &&
            element.hasAttribute("data-no-translate")
        ) {

            return true;

        }

        element = element.parentElement;

    }


    return false;

}


/* =========================================================
   ONE FULL PASS OVER THE PAGE
========================================================= */

function applyLanguage() {

    if (isTranslating) return;

    isTranslating = true;

    observer?.disconnect();


    const toArabic = currentLang === "ar";


    /* ---------- text nodes ---------- */

    const walker =
        document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT
        );


    const nodes = [];

    while (walker.nextNode()) {

        nodes.push(walker.currentNode);

    }


    nodes.forEach(node => {

        if (isSkipped(node)) return;

        if (!node.nodeValue.trim()) return;


        if (toArabic) {

            const source =
                node.estoraOriginal !== undefined
                    ? node.estoraOriginal
                    : node.nodeValue;


            const translated =
                translateString(source);


            if (translated) {

                node.estoraOriginal = source;

                node.nodeValue = translated;

            }


        } else if (node.estoraOriginal !== undefined) {

            node.nodeValue = node.estoraOriginal;

            delete node.estoraOriginal;

        }

    });


    /* ---------- attributes ---------- */

    const ATTRIBUTES = [
        "placeholder",
        "title",
        "aria-label"
    ];


    document
        .querySelectorAll(
            "[placeholder], [title], [aria-label]"
        )
        .forEach(element => {

            if (isSkipped(element)) return;


            ATTRIBUTES.forEach(attribute => {

                const value =
                    element.getAttribute(attribute);


                if (!value) return;


                const store =
                    `estoraOriginal_${attribute}`;


                if (toArabic) {

                    const source =
                        element[store] !== undefined
                            ? element[store]
                            : value;


                    const translated =
                        translateString(source);


                    if (translated) {

                        element[store] = source;

                        element.setAttribute(
                            attribute,
                            translated
                        );

                    }


                } else if (element[store] !== undefined) {

                    element.setAttribute(
                        attribute,
                        element[store]
                    );

                    delete element[store];

                }

            });

        });


    /* ---------- direction ---------- */

    document.documentElement.lang =
        toArabic ? "ar" : "en";

    document.documentElement.dir =
        toArabic ? "rtl" : "ltr";

    document.body.classList.toggle(
        "estora-rtl",
        toArabic
    );


    /* ---------- the button label ---------- */

    const label =
        document.getElementById("langLabel");


    if (label) {

        /* Show the language you can switch TO */

        label.textContent =
            toArabic ? "EN" : "AR";

    }


    isTranslating = false;

    startObserver();

}


/* =========================================================
   WATCH FOR CONTENT RENDERED BY JAVASCRIPT
========================================================= */

let pendingPass = null;


function startObserver() {

    if (!observer) {

        observer =
            new MutationObserver(() => {

                if (isTranslating) return;


                clearTimeout(pendingPass);

                pendingPass =
                    setTimeout(applyLanguage, 120);

            });

    }


    observer.observe(
        document.body,
        {
            childList: true,
            subtree: true
        }
    );

}


/* =========================================================
   TOGGLE
========================================================= */

function toggleLanguage() {

    currentLang =
        currentLang === "ar"
            ? "en"
            : "ar";


    localStorage.setItem(
        ESTORA_LANG_KEY,
        currentLang
    );


    applyLanguage();

}


document
    .getElementById("langToggle")
    ?.addEventListener("click", toggleLanguage);


/* Expose it, in case another script needs it */

window.estoraToggleLanguage = toggleLanguage;

window.estoraCurrentLanguage = () => currentLang;


/* =========================================================
   START
========================================================= */

function initI18n() {

    applyLanguage();

}


if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initI18n
    );

} else {

    initI18n();

}

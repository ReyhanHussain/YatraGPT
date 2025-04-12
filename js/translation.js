// translation.js - Manages multilingual content for YatraGPT

// Translation dictionary containing all UI text in English, Hindi, and Kannada
const translations = {
    // Navigation
    "features": {
        "en": "Features",
        "hi": "विशेषताएं",
        "kn": "ವೈಶಿಷ್ಟ್ಯಗಳು"
    },
    "itineraryBuilder": {
        "en": "Itinerary Builder",
        "hi": "यात्रा योजना निर्माता",
        "kn": "ಪ್ರಯಾಣ ಯೋಜನೆ ನಿರ್ಮಾಪಕ"
    },
    "ecoCalculator": {
        "en": "Eco Calculator",
        "hi": "इको कैलकुलेटर",
        "kn": "ಎಕೋ ಕ್ಯಾಲ್ಕುಲೇಟರ್"
    },
    "cultureMatch": {
        "en": "CultureMatch",
        "hi": "संस्कृति मिलान",
        "kn": "ಸಂಸ್ಕೃತಿ ಹೊಂದಾಣಿಕೆ"
    },
    "hiddenGems": {
        "en": "Hidden Gems",
        "hi": "छिपे हुए रत्न",
        "kn": "ಮರೆಯಾಗಿರುವ ರತ್ನಗಳು"
    },
    "contact": {
        "en": "Contact",
        "hi": "संपर्क",
        "kn": "ಸಂಪರ್ಕ"
    },

    // Hero Section
    "heroTitle": {
        "en": "A Cultural Odyssey Through Technology",
        "hi": "प्रौद्योगिकी के माध्यम से एक सांस्कृतिक यात्रा",
        "kn": "ತಂತ್ರಜ್ಞಾನದ ಮೂಲಕ ಸಾಂಸ್ಕೃತಿಕ ಓಡಿಸಿ"
    },
    "heroDescription": {
        "en": "Reimagine cultural tourism with AI-driven personalization, community engagement, and sustainability tracking.",
        "hi": "AI-संचालित वैयक्तिकरण, सामुदायिक सहभागिता और स्थिरता ट्रैकिंग के साथ सांस्कृतिक पर्यटन की कल्पना करें।",
        "kn": "ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆಯಿಂದ ಚಾಲಿತ ವೈಯಕ್ತಿಕರಣ, ಸಮುದಾಯ ತೊಡಗಿಸಿಕೊಳ್ಳುವಿಕೆ ಮತ್ತು ಸುಸ್ಥಿರತೆ ಟ್ರ್ಯಾಕಿಂಗ್‌ನೊಂದಿಗೆ ಸಾಂಸ್ಕೃತಿಕ ಪ್ರವಾಸೋದ್ಯಮವನ್ನು ಮರುಕಲ್ಪಿಸಿ."
    },
    "startJourney": {
        "en": "Start Your Journey",
        "hi": "अपनी यात्रा शुरू करें",
        "kn": "ನಿಮ್ಮ ಪ್ರಯಾಣವನ್ನು ಪ್ರಾರಂಭಿಸಿ"
    },
    "learnMore": {
        "en": "Learn More",
        "hi": "और अधिक जानें",
        "kn": "ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ"
    },

    // Features Section
    "discoverFeatures": {
        "en": "Discover Our Unique Features",
        "hi": "हमारी अनूठी विशेषताओं का पता लगाएं",
        "kn": "ನಮ್ಮ ವಿಶಿಷ್ಟ ವೈಶಿಷ್ಟ್ಯಗಳನ್ನು ಅನ್ವೇಷಿಸಿ"
    },
    "aiItineraryTitle": {
        "en": "AI-Powered Itinerary Builder",
        "hi": "AI-संचालित यात्रा योजना निर्माता",
        "kn": "ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆಯಿಂದ ಚಾಲಿತ ಪ್ರಯಾಣ ಯೋಜನೆ ನಿರ್ಮಾಪಕ"
    },
    "aiItineraryDesc": {
        "en": "Create personalized, day-by-day travel plans blending must-see landmarks with hidden cultural gems.",
        "hi": "अवश्य देखने वाले स्थलों को छिपे हुए सांस्कृतिक रत्नों के साथ मिलाकर व्यक्तिगत, दिन-प्रतिदिन की यात्रा योजनाएँ बनाएँ।",
        "kn": "ನೋಡಲೇಬೇಕಾದ ಪ್ರಮುಖ ಸ್ಥಳಗಳನ್ನು ಮರೆಯಾಗಿರುವ ಸಾಂಸ್ಕೃತಿಕ ರತ್ನಗಳೊಂದಿಗೆ ಮಿಶ್ರಣಗೊಳಿಸಿ ವೈಯಕ್ತಿಕ, ದಿನದಿಂದ-ದಿನಕ್ಕೆ ಪ್ರಯಾಣ ಯೋಜನೆಗಳನ್ನು ರಚಿಸಿ."
    },
    "explore": {
        "en": "Explore",
        "hi": "अन्वेषण करें",
        "kn": "ಅನ್ವೇಷಿಸಿ"
    },
    "ecoFootprintTitle": {
        "en": "Eco-Cultural Footprint",
        "hi": "पारिस्थितिक-सांस्कृतिक पदचिह्न",
        "kn": "ಪರಿಸರ-ಸಾಂಸ್ಕೃತಿಕ ಹೆಜ್ಜೆಗುರುತು"
    },
    "ecoFootprintDesc": {
        "en": "Calculate your environmental impact and discover sustainable alternatives for your journey.",
        "hi": "अपने पर्यावरणीय प्रभाव की गणना करें और अपनी यात्रा के लिए स्थायी विकल्पों का पता लगाएं।",
        "kn": "ನಿಮ್ಮ ಪರಿಸರದ ಪ್ರಭಾವವನ್ನು ಲೆಕ್ಕಹಾಕಿ ಮತ್ತು ನಿಮ್ಮ ಪ್ರಯಾಣಕ್ಕಾಗಿ ಸುಸ್ಥಿರ ಪರ್ಯಾಯಗಳನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ."
    },
    "calculate": {
        "en": "Calculate",
        "hi": "गणना करें",
        "kn": "ಲೆಕ್ಕ ಹಾಕಿ"
    },
    "cultureMatchTitle": {
        "en": "CultureMatch",
        "hi": "संस्कृति मिलान",
        "kn": "ಸಂಸ್ಕೃತಿ ಹೊಂದಾಣಿಕೆ"
    },
    "cultureMatchDesc": {
        "en": "Connect with local guides and like-minded travelers for authentic cultural experiences.",
        "hi": "प्रामाणिक सांस्कृतिक अनुभवों के लिए स्थानीय गाइडों और समान विचारधारा वाले यात्रियों से जुड़ें।",
        "kn": "ಅಧಿಕೃತ ಸಾಂಸ್ಕೃತಿಕ ಅನುಭವಗಳಿಗಾಗಿ ಸ್ಥಳೀಯ ಮಾರ್ಗದರ್ಶಕರು ಮತ್ತು ಸಮಾನ ಮನಸ್ಕ ಪ್ರಯಾಣಿಕರೊಂದಿಗೆ ಸಂಪರ್ಕ ಹೊಂದಿರಿ."
    },
    "connect": {
        "en": "Connect",
        "hi": "जुड़ें",
        "kn": "ಸಂಪರ್ಕಿಸಿ"
    },

    // Itinerary Builder Section
    "itineraryTitle": {
        "en": "AI-Powered Cultural Itinerary Builder",
        "hi": "AI-संचालित सांस्कृतिक यात्रा योजना निर्माता",
        "kn": "ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆಯಿಂದ ಚಾಲಿತ ಸಾಂಸ್ಕೃತಿಕ ಪ್ರಯಾಣ ಯೋಜನೆ ನಿರ್ಮಾಪಕ"
    },
    "itineraryDesc": {
        "en": "Let our advanced AI create the perfect cultural journey tailored to your preferences.",
        "hi": "हमारे उन्नत AI को आपकी प्राथमिकताओं के अनुसार सही सांस्कृतिक यात्रा बनाने दें।",
        "kn": "ನಮ್ಮ ಸುಧಾರಿತ ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆಯು ನಿಮ್ಮ ಆದ್ಯತೆಗಳಿಗೆ ತಕ್ಕಂತೆ ಪರಿಪೂರ್ಣ ಸಾಂಸ್ಕೃತಿಕ ಪ್ರಯಾಣವನ್ನು ರಚಿಸಲಿ."
    },
    "destination": {
        "en": "Destination",
        "hi": "गंतव्य",
        "kn": "ತಲುಪಬೇಕಾದ ಸ್ಥಳ"
    },
    "whereGoing": {
        "en": "Where are you going?",
        "hi": "आप कहां जा रहे हैं?",
        "kn": "ನೀವು ಎಲ್ಲಿಗೆ ಹೋಗುತ್ತಿದ್ದೀರಿ?"
    },
    "tripDuration": {
        "en": "Trip Duration",
        "hi": "यात्रा की अवधि",
        "kn": "ಪ್ರಯಾಣದ ಅವಧಿ"
    },
    "weekend": {
        "en": "Weekend (2 days)",
        "hi": "सप्ताहांत (2 दिन)",
        "kn": "ವಾರಾಂತ್ಯ (2 ದಿನಗಳು)"
    },
    "shortTrip": {
        "en": "Short Trip (3 days)",
        "hi": "छोटी यात्रा (3 दिन)",
        "kn": "ಕಿರು ಪ್ರಯಾಣ (3 ದಿನಗಳು)"
    },
    "mediumTrip": {
        "en": "Medium Trip (5 days)",
        "hi": "मध्यम यात्रा (5 दिन)",
        "kn": "ಮಧ್ಯಮ ಪ್ರಯಾಣ (5 ದಿನಗಳು)"
    },
    "oneWeek": {
        "en": "One Week (7 days)",
        "hi": "एक सप्ताह (7 दिन)",
        "kn": "ಒಂದು ವಾರ (7 ದಿನಗಳು)"
    },
    "twoWeeks": {
        "en": "Two Weeks (14 days)",
        "hi": "दो सप्ताह (14 दिन)",
        "kn": "ಎರಡು ವಾರಗಳು (14 ದಿನಗಳು)"
    },
    "interests": {
        "en": "Interests",
        "hi": "रुचियां",
        "kn": "ಆಸಕ್ತಿಗಳು"
    },
    "addInterest": {
        "en": "Add interest...",
        "hi": "रुचि जोड़ें...",
        "kn": "ಆಸಕ್ತಿ ಸೇರಿಸಿ..."
    },
    "travelPace": {
        "en": "Travel Pace",
        "hi": "यात्रा की गति",
        "kn": "ಪ್ರಯಾಣದ ವೇಗ"
    },
    "relaxed": {
        "en": "Relaxed",
        "hi": "आराम",
        "kn": "ವಿಶ್ರಾಂತಿ"
    },
    "intense": {
        "en": "Intense",
        "hi": "तीव्र",
        "kn": "ತೀವ್ರ"
    },
    "generateItinerary": {
        "en": "Generate Itinerary",
        "hi": "यात्रा योजना बनाएँ",
        "kn": "ಪ್ರಯಾಣ ಯೋಜನೆಯನ್ನು ತಯಾರಿಸಿ"
    },

    // Eco-Calculator Section
    "ecoCalculatorTitle": {
        "en": "Eco-Cultural Footprint Calculator",
        "hi": "पारिस्थितिक-सांस्कृतिक पदचिह्न कैलकुलेटर",
        "kn": "ಪರಿಸರ-ಸಾಂಸ್ಕೃತಿಕ ಹೆಜ್ಜೆಗುರುತು ಕ್ಯಾಲ್ಕುಲೇಟರ್"
    },
    "ecoCalculatorDesc": {
        "en": "Measure the environmental and cultural impact of your journey.",
        "hi": "अपनी यात्रा के पर्यावरणीय और सांस्कृतिक प्रभाव को मापें।",
        "kn": "ನಿಮ್ಮ ಪ್ರಯಾಣದ ಪರಿಸರ ಮತ್ತು ಸಾಂಸ್ಕೃತಿಕ ಪ್ರಭಾವವನ್ನು ಅಳೆಯಿರಿ."
    },
    "transportation": {
        "en": "Transportation",
        "hi": "परिवहन",
        "kn": "ಸಾರಿಗೆ"
    },
    "flight": {
        "en": "Flight",
        "hi": "उड़ान",
        "kn": "ವಿಮಾನ"
    },
    "train": {
        "en": "Train",
        "hi": "रेलगाड़ी",
        "kn": "ರೈಲು"
    },
    "bus": {
        "en": "Bus",
        "hi": "बस",
        "kn": "ಬಸ್"
    },
    "car": {
        "en": "Car",
        "hi": "कार",
        "kn": "ಕಾರು"
    },
    "distance": {
        "en": "Distance (km)",
        "hi": "दूरी (किमी)",
        "kn": "ದೂರ (ಕಿಮೀ)"
    },
    "accommodationType": {
        "en": "Accommodation Type",
        "hi": "आवास प्रकार",
        "kn": "ವಸತಿ ಪ್ರಕಾರ"
    },
    "hotel": {
        "en": "Hotel",
        "hi": "होटल",
        "kn": "ಹೋಟೆಲ್"
    },
    "hostel": {
        "en": "Hostel",
        "hi": "छात्रावास",
        "kn": "ಹಾಸ್ಟೆಲ್"
    },
    "apartment": {
        "en": "Apartment",
        "hi": "अपार्टमेंट",
        "kn": "ಅಪಾರ್ಟ್ಮೆಂಟ್"
    },
    "ecoLodge": {
        "en": "Eco Lodge",
        "hi": "इको लॉज",
        "kn": "ಎಕೋ ಲಾಡ್ಜ್"
    },
    "homestay": {
        "en": "Homestay",
        "hi": "होमस्टे",
        "kn": "ಹೋಮ್‌ಸ್ಟೇ"
    },
    "culturalActivities": {
        "en": "Cultural Activities",
        "hi": "सांस्कृतिक गतिविधियां",
        "kn": "ಸಾಂಸ್ಕೃತಿಕ ಚಟುವಟಿಕೆಗಳು"
    },
    "museumsGalleries": {
        "en": "Museums & Galleries",
        "hi": "संग्रहालय और गैलरी",
        "kn": "ಮ್ಯೂಸಿಯಂಗಳು ಮತ್ತು ಗ್ಯಾಲರಿಗಳು"
    },
    "historicalSites": {
        "en": "Historical Sites",
        "hi": "ऐतिहासिक स्थल",
        "kn": "ಐತಿಹಾಸಿಕ ಸ್ಥಳಗಳು"
    },
    "localFestivals": {
        "en": "Local Festivals",
        "hi": "स्थानीय त्योहार",
        "kn": "ಸ್ಥಳೀಯ ಹಬ್ಬಗಳು"
    },
    "traditionalWorkshops": {
        "en": "Traditional Workshops",
        "hi": "पारंपरिक कार्यशालाएं",
        "kn": "ಸಾಂಪ್ರದಾಯಿಕ ಕಾರ್ಯಾಗಾರಗಳು"
    },
    "localCuisine": {
        "en": "Local Cuisine",
        "hi": "स्थानीय व्यंजन",
        "kn": "ಸ್ಥಳೀಯ ಊಟ"
    },
    "calculateFootprint": {
        "en": "Calculate Footprint",
        "hi": "पदचिह्न की गणना करें",
        "kn": "ಹೆಜ್ಜೆಗುರುತನ್ನು ಲೆಕ್ಕ ಹಾಕಿ"
    },

    // CultureMatch Section 
    "cultureMatchSectionTitle": {
        "en": "CultureMatch",
        "hi": "संस्कृति मिलान",
        "kn": "ಸಂಸ್ಕೃತಿ ಹೊಂದಾಣಿಕೆ"
    },
    "cultureMatchSectionDesc": {
        "en": "Connect with locals and like-minded travelers for authentic experiences.",
        "hi": "प्रामाणिक अनुभवों के लिए स्थानीय लोगों और समान विचारधारा वाले यात्रियों से जुड़ें।",
        "kn": "ಅಧಿಕೃತ ಅನುಭವಗಳಿಗಾಗಿ ಸ್ಥಳೀಯರು ಮತ್ತು ಸಮಾನ ಮನಸ್ಕ ಪ್ರಯಾಣಿಕರೊಂದಿಗೆ ಸಂಪರ್ಕ ಹೊಂದಿರಿ."
    },
    "localGuide": {
        "en": "Local Guide",
        "hi": "स्थानीय गाइड",
        "kn": "ಸ್ಥಳೀಯ ಮಾರ್ಗದರ್ಶಕ"
    },
    "traveler": {
        "en": "Traveler",
        "hi": "यात्री",
        "kn": "ಪ್ರಯಾಣಿಕ"
    },
    "culturalConnectionsDb": {
        "en": "Cultural Connections Database",
        "hi": "सांस्कृतिक संबंध डेटाबेस",
        "kn": "ಸಾಂಸ್ಕೃತಿಕ ಸಂಪರ್ಕಗಳ ಡೇಟಾಬೇಸ್"
    },
    "createProfile": {
        "en": "Create Profile",
        "hi": "प्रोफ़ाइल बनाएँ",
        "kn": "ಪ್ರೊಫೈಲ್ ರಚಿಸಿ"
    },

    // Footer
    "copyright": {
        "en": "© 2025 YatraGPT. All rights reserved.",
        "hi": "© 2025 यात्राजीपीटी. सर्वाधिकार सुरक्षित।",
        "kn": "© 2025 ಯಾತ್ರಾಜಿಪಿಟಿ. ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ."
    },
    "joinNewsletter": {
        "en": "Join our newsletter",
        "hi": "हमारे न्यूज़लेटर से जुड़ें",
        "kn": "ನಮ್ಮ ಸುದ್ದಿಪತ್ರವನ್ನು ಸೇರಿಕೊಳ್ಳಿ"
    },
    "subscribe": {
        "en": "Subscribe",
        "hi": "सदस्यता लें",
        "kn": "ಚಂದಾದಾರರಾಗಿ"
    },
    "footerTagline": {
        "en": "A Cultural Odyssey Through Technology",
        "hi": "प्रौद्योगिकी के माध्यम से एक सांस्कृतिक यात्रा",
        "kn": "ತಂತ್ರಜ್ಞಾನದ ಮೂಲಕ ಸಾಂಸ್ಕೃತಿಕ ಓಡಿಸಿ"
    },
    "footerFeatures": {
        "en": "Features",
        "hi": "विशेषताएं",
        "kn": "ವೈಶಿಷ್ಟ್ಯಗಳು"
    },
    "footerCompany": {
        "en": "Company",
        "hi": "कंपनी",
        "kn": "ಕಂಪನಿ"
    },
    "aboutUs": {
        "en": "About Us",
        "hi": "हमारे बारे में",
        "kn": "ನಮ್ಮ ಬಗ್ಗೆ"
    },
    "ourMission": {
        "en": "Our Mission",
        "hi": "हमारा मिशन",
        "kn": "ನಮ್ಮ ಧ್ಯೇಯ"
    },
    "careers": {
        "en": "Careers",
        "hi": "करियर",
        "kn": "ಉದ್ಯೋಗಾವಕಾಶಗಳು"
    },
    "contactUs": {
        "en": "Contact Us",
        "hi": "संपर्क करें",
        "kn": "ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ"
    },
    "footerResources": {
        "en": "Resources",
        "hi": "संसाधन",
        "kn": "ಸಂಪನ್ಮೂಲಗಳು"
    },
    "blog": {
        "en": "Blog",
        "hi": "ब्लॉग",
        "kn": "ಬ್ಲಾಗ್"
    },
    "culturalGuides": {
        "en": "Cultural Guides",
        "hi": "सांस्कृतिक मार्गदर्शिकाएँ",
        "kn": "ಸಾಂಸ್ಕೃತಿಕ ಮಾರ್ಗದರ್ಶಿಗಳು"
    },
    "sustainabilityTips": {
        "en": "Sustainability Tips",
        "hi": "सतत विकास के सुझाव",
        "kn": "ಸುಸ್ಥಿರತೆ ಸಲಹೆಗಳು"
    },
    "communityStories": {
        "en": "Community Stories",
        "hi": "समुदाय की कहानियां",
        "kn": "ಸಮುದಾಯದ ಕಥೆಗಳು"
    },
    "connectWithUs": {
        "en": "Connect With Us",
        "hi": "हमसे जुड़ें",
        "kn": "ನಮ್ಮೊಂದಿಗೆ ಸಂಪರ್ಕಿಸಿ"
    },
    
    // Floating chat
    "askCulturalAI": {
        "en": "Ask our Cultural AI!",
        "hi": "हमारे सांस्कृतिक AI से पूछें!",
        "kn": "ನಮ್ಮ ಸಾಂಸ್ಕೃತಿಕ ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆಯನ್ನು ಕೇಳಿ!"
    }
};

// Current language
let currentLanguage = "en";

// Function to apply translations to the page
function applyTranslations(lang) {
    if (!["en", "hi", "kn"].includes(lang)) {
        console.error("Invalid language code");
        return;
    }
    
    currentLanguage = lang;
    
    // Save language preference
    localStorage.setItem("yatraLang", lang);
    
    // Update all elements with data-translate attribute
    document.querySelectorAll("[data-translate]").forEach(element => {
        const key = element.getAttribute("data-translate");
        
        if (translations[key] && translations[key][lang]) {
            // Check element type for different handling
            if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
                if (element.getAttribute("placeholder")) {
                    element.setAttribute("placeholder", translations[key][lang]);
                } else {
                    element.value = translations[key][lang];
                }
            } else {
                element.textContent = translations[key][lang];
            }
        }
    });
    
    // Update language selector UI
    document.querySelectorAll(".language-option").forEach(option => {
        if (option.getAttribute("data-lang") === lang) {
            option.classList.add("active");
        } else {
            option.classList.remove("active");
        }
    });
}

// Initialize translations based on saved preference or browser language
function initTranslations() {
    const savedLang = localStorage.getItem("yatraLang");
    const browserLang = navigator.language.split("-")[0];
    
    // Default to English, use saved language if available, otherwise try to match browser language
    let initialLang = "en";
    
    if (savedLang && ["en", "hi", "kn"].includes(savedLang)) {
        initialLang = savedLang;
    } else if (["hi", "kn"].includes(browserLang)) {
        initialLang = browserLang;
    }
    
    // Setup language selector event handlers
    setupLanguageSelector();
    
    // Apply initial translations
    applyTranslations(initialLang);
}

// Event handlers for language selector
function setupLanguageSelector() {
    document.querySelectorAll(".language-option").forEach(option => {
        option.addEventListener("click", function() {
            const lang = this.getAttribute("data-lang");
            applyTranslations(lang);
        });
    });
}

// Export functions
export { initTranslations, applyTranslations, setupLanguageSelector }; 
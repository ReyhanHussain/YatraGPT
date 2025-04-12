// Language manager for handling translations

// Import language files
import en from '../translations/en.js';
import es from '../translations/es.js';
import hi from '../translations/hi.js';
import kn from '../translations/kn.js';
import ar from '../translations/ar.js';
import ta from '../translations/ta.js';
import fr from '../translations/fr.js';

// Available languages
const languages = {
    en: { name: 'English', translations: en },
    es: { name: 'Español', translations: es },
    hi: { name: 'हिन्दी', translations: hi },
    kn: { name: 'ಕನ್ನಡ', translations: kn },
    ar: { name: 'العربية', translations: ar, dir: 'rtl' },
    ta: { name: 'தமிழ்', translations: ta },
    fr: { name: 'Français', translations: fr }
};

// Default language
let currentLanguage = 'en';

// Get the browser language if available
const getBrowserLanguage = () => {
    const browserLang = navigator.language.split('-')[0];
    return languages[browserLang] ? browserLang : 'en';
};

// Get a translation by key
const t = (key) => {
    // Get current language translations
    const translations = languages[currentLanguage].translations;
    
    // Return the translation or the key if not found
    return translations[key] || key;
};

// Apply translations to the page
const applyTranslations = () => {
    // Get all elements with the data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        
        // Handle different element types
        if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
            // For input placeholders
            element.setAttribute('placeholder', t(key));
        } else {
            // For regular elements
            element.textContent = t(key);
        }
    });
};

// Change the current language
const changeLanguage = (lang) => {
    // Only change if the language exists
    if (languages[lang]) {
        currentLanguage = lang;
        
        // Save preference to localStorage
        localStorage.setItem('yatraLanguage', lang);
        
        // Set text direction for RTL languages like Arabic
        if (languages[lang].dir === 'rtl') {
            document.documentElement.setAttribute('dir', 'rtl');
            document.body.classList.add('rtl');
        } else {
            document.documentElement.setAttribute('dir', 'ltr');
            document.body.classList.remove('rtl');
        }
        
        // Update html lang attribute
        document.documentElement.setAttribute('lang', lang);
        
        // Update language selector if it exists
        const languageSelector = document.getElementById('language-selector');
        if (languageSelector) {
            languageSelector.value = lang;
        }
        
        // Apply translations
        applyTranslations();
        
        // Dispatch an event for other scripts
        document.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: lang } 
        }));
    }
};

// Create the language selector
const createLanguageSelector = () => {
    // Create container
    const container = document.createElement('div');
    container.className = 'language-selector';
    
    // Create select element
    const select = document.createElement('select');
    select.id = 'language-selector';
    
    // Add options for each language
    Object.keys(languages).forEach(code => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = languages[code].name;
        select.appendChild(option);
    });
    
    // Set current language
    select.value = currentLanguage;
    
    // Add change event
    select.addEventListener('change', (e) => {
        changeLanguage(e.target.value);
    });
    
    // Add select to container
    container.appendChild(select);
    
    return container;
};

// Initialize language support
const initLanguageSupport = () => {
    // Check if there is a saved language preference
    const savedLanguage = localStorage.getItem('yatraLanguage');
    
    // Set initial language
    if (savedLanguage && languages[savedLanguage]) {
        currentLanguage = savedLanguage;
    } else {
        currentLanguage = getBrowserLanguage();
    }
    
    // Set text direction for RTL languages like Arabic
    if (languages[currentLanguage].dir === 'rtl') {
        document.documentElement.setAttribute('dir', 'rtl');
        document.body.classList.add('rtl');
    }
    
    // Update html lang attribute
    document.documentElement.setAttribute('lang', currentLanguage);
    
    // Add language selector to the navbar
    const navLinks = document.querySelector('.nav-links ul');
    if (navLinks) {
        const container = document.createElement('li');
        container.appendChild(createLanguageSelector());
        navLinks.appendChild(container);
    }
    
    // Apply initial translations
    applyTranslations();
};

export { initLanguageSupport, changeLanguage, t }; 
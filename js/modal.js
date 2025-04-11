// modal.js - Handles modal dialog functionality for YatraGPT

// Modal configuration
const modalConfig = {
    'about-us': {
        title: 'About YatraGPT',
        content: `
            <div class="modal-section">
                <h3>Our Story</h3>
                <p>YatraGPT was born from a passion for cultural exploration and a belief in technology's power to connect people across borders. Founded in 2023, we set out to create a platform that transcends traditional tourism, focusing on meaningful cultural exchange and sustainable travel practices.</p>
            </div>
            <div class="modal-section">
                <h3>Our Team</h3>
                <p>Our diverse team brings together experts in AI, cultural anthropology, sustainable tourism, and digital design. United by a shared love for cultural discovery, we work to create tools that make travel more enriching, sustainable, and connected.</p>
            </div>
        `
    },
    'our-mission': {
        title: 'Our Mission',
        content: `
            <div class="modal-section">
                <h3>Vision</h3>
                <p>We envision a world where cultural tourism becomes a force for positive change, fostering cross-cultural understanding while promoting sustainable practices and supporting local communities.</p>
            </div>
            <div class="modal-section">
                <h3>Mission Statement</h3>
                <p>YatraGPT's mission is to reimagine cultural tourism through AI-driven personalization, meaningful community connections, and sustainability tracking. We aim to:</p>
                <ul>
                    <li>Facilitate deeper cultural understanding through personalized experiences</li>
                    <li>Connect travelers with locals for authentic cultural exchange</li>
                    <li>Promote sustainable tourism practices that respect both environment and culture</li>
                    <li>Preserve and honor cultural heritage through technology</li>
                </ul>
            </div>
        `
    },
    'careers': {
        title: 'Join Our Team',
        content: `
            <div class="modal-section">
                <h3>Current Openings</h3>
                <div class="careers-list">
                    <div class="career-item">
                        <h4>AI Research Engineer</h4>
                        <p>Help us develop and refine our cultural recommendation algorithms.</p>
                        <button class="btn secondary apply-btn">Apply Now</button>
                    </div>
                    <div class="career-item">
                        <h4>Cultural Content Specialist</h4>
                        <p>Create and curate authentic cultural content for our platform.</p>
                        <button class="btn secondary apply-btn">Apply Now</button>
                    </div>
                    <div class="career-item">
                        <h4>UX/UI Designer</h4>
                        <p>Design intuitive interfaces that bring cultural experiences to life.</p>
                        <button class="btn secondary apply-btn">Apply Now</button>
                    </div>
                </div>
            </div>
            <div class="modal-section">
                <h3>Why Join Us?</h3>
                <p>At YatraGPT, you'll be part of a team passionate about cultural exchange and sustainable tourism. We offer competitive benefits, flexible remote work options, and an opportunity to make a meaningful impact on how people experience cultures around the world.</p>
            </div>
        `
    },
    'contact-us': {
        title: 'Contact Us',
        content: `
            <div class="contact-form">
                <div class="form-group">
                    <label for="contact-name">Your Name</label>
                    <input type="text" id="contact-name" placeholder="Enter your name">
                </div>
                <div class="form-group">
                    <label for="contact-email">Email Address</label>
                    <input type="email" id="contact-email" placeholder="Enter your email">
                </div>
                <div class="form-group">
                    <label for="contact-subject">Subject</label>
                    <select id="contact-subject">
                        <option value="general">General Inquiry</option>
                        <option value="support">Technical Support</option>
                        <option value="partnership">Partnership Opportunity</option>
                        <option value="feedback">Feedback</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="contact-message">Message</label>
                    <textarea id="contact-message" placeholder="Type your message here..."></textarea>
                </div>
                <button class="btn primary">Send Message</button>
            </div>
            <div class="contact-info">
                <div class="contact-method">
                    <i class="fas fa-envelope"></i>
                    <div>
                        <h4>Email</h4>
                        <p>info@yatragpt.com</p>
                    </div>
                </div>
                <div class="contact-method">
                    <i class="fas fa-phone"></i>
                    <div>
                        <h4>Phone</h4>
                        <p>+1 (555) 123-4567</p>
                    </div>
                </div>
                <div class="contact-method">
                    <i class="fas fa-map-marker-alt"></i>
                    <div>
                        <h4>Address</h4>
                        <p>123 Cultural Way, Tech Valley, CA 94043</p>
                    </div>
                </div>
            </div>
        `
    }
};

// Create and show modal
function showModal(modalId) {
    // Check if modal config exists
    if (!modalConfig[modalId]) {
        console.error(`Modal configuration not found for ID: ${modalId}`);
        return;
    }
    
    // Get modal configuration
    const config = modalConfig[modalId];
    
    // Create modal element
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = `modal-${modalId}`;
    
    // Add modal content
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${config.title}</h2>
                <button class="modal-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                ${config.content}
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Add event listener to close button
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => closeModal(modal));
    
    // Add event listener to close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
    
    // Add event listener to close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.querySelector('.modal')) {
            closeModal(modal);
        }
    });
    
    // Show modal with animation
    setTimeout(() => modal.classList.add('show'), 10);
}

// Close modal
function closeModal(modal) {
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300); // Remove after transition
}

// Initialize modals
function initModals() {
    // Find all elements with data-modal attribute
    const modalTriggers = document.querySelectorAll('[data-modal]');
    
    // Add event listeners to all modal triggers
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = trigger.getAttribute('data-modal');
            showModal(modalId);
        });
    });
    
    // Event delegation for Apply Now buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.apply-btn')) {
            // Close current modal
            const currentModal = document.querySelector('.modal.show');
            if (currentModal) {
                closeModal(currentModal);
            }
            
            // Open contact form with subject pre-filled
            setTimeout(() => {
                showModal('contact-us');
                
                // Get the job title and prefill the subject dropdown
                const careerItem = e.target.closest('.career-item');
                const jobTitle = careerItem.querySelector('h4').textContent;
                
                const subjectDropdown = document.getElementById('contact-subject');
                if (subjectDropdown) {
                    // Select "Partnership Opportunity" option which is index 2
                    subjectDropdown.selectedIndex = 2;
                }
                
                // Prefill message with job application text
                const messageField = document.getElementById('contact-message');
                if (messageField) {
                    messageField.value = `I'm interested in applying for the ${jobTitle} position.`;
                }
            }, 300);
        }
    });
}

export default initModals; 
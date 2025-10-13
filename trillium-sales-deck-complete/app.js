class SalesPresentation {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 14;
        this.slides = document.querySelectorAll('.slide');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.slideCounter = document.getElementById('slideCounter');
        
        this.init();
    }
    
    init() {
        this.updateSlideDisplay();
        this.bindEvents();
        this.addKeyboardNavigation();
    }
    
    bindEvents() {
        this.prevBtn.addEventListener('click', () => this.previousSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        // Add touch/swipe support
        this.addTouchSupport();
    }
    
    addKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    this.previousSlide();
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                case ' ': // Spacebar
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToSlide(1);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToSlide(this.totalSlides);
                    break;
            }
        });
    }
    
    addTouchSupport() {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const minSwipeDistance = 50;
            
            // Horizontal swipe
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
                if (deltaX > 0) {
                    this.previousSlide();
                } else {
                    this.nextSlide();
                }
            }
        });
    }
    
    nextSlide() {
        if (this.currentSlide < this.totalSlides) {
            this.goToSlide(this.currentSlide + 1);
        }
    }
    
    previousSlide() {
        if (this.currentSlide > 1) {
            this.goToSlide(this.currentSlide - 1);
        }
    }
    
    goToSlide(slideNumber) {
        if (slideNumber >= 1 && slideNumber <= this.totalSlides) {
            // Remove active class from current slide
            this.slides[this.currentSlide - 1].classList.remove('active');
            
            // Update current slide
            this.currentSlide = slideNumber;
            
            // Add active class to new slide
            this.slides[this.currentSlide - 1].classList.add('active');
            
            // Update UI
            this.updateSlideDisplay();
            
            // Add slide-specific animations
            this.animateSlideContent();
        }
    }
    
    updateSlideDisplay() {
        this.slideCounter.textContent = `${this.currentSlide} / ${this.totalSlides}`;
        
        // Update navigation buttons
        this.prevBtn.disabled = this.currentSlide === 1;
        this.nextBtn.disabled = this.currentSlide === this.totalSlides;
        
        // Add visual feedback for disabled buttons
        if (this.currentSlide === 1) {
            this.prevBtn.style.opacity = '0.5';
        } else {
            this.prevBtn.style.opacity = '1';
        }
        
        if (this.currentSlide === this.totalSlides) {
            this.nextBtn.style.opacity = '0.5';
        } else {
            this.nextBtn.style.opacity = '1';
        }
    }
    
    animateSlideContent() {
        const currentSlideElement = this.slides[this.currentSlide - 1];
        const animateElements = currentSlideElement.querySelectorAll(
            '.problem-card, .audience-card, .service-card, .value-card, .why-card, .team-member, .faq-item, .approach-item'
        );
        
        // Reset animations
        animateElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
        });
        
        // Animate elements in sequence
        animateElements.forEach((el, index) => {
            setTimeout(() => {
                el.style.transition = 'all 0.5s ease';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    // Method to export presentation data (useful for converting to PPT)
    exportPresentationData() {
        const slideData = [];
        
        this.slides.forEach((slide, index) => {
            const slideContent = {
                slideNumber: index + 1,
                title: slide.querySelector('.slide-title')?.textContent || slide.querySelector('h1')?.textContent,
                content: slide.querySelector('.slide-content')?.innerHTML
            };
            slideData.push(slideContent);
        });
        
        return {
            totalSlides: this.totalSlides,
            slides: slideData,
            theme: {
                primaryColor: '#FFC300',
                secondaryColor: '#4B5A5F',
                backgroundColor: '#FFFFFF',
                fontFamily: 'Inter'
            }
        };
    }
    
    // Print-friendly version
    preparePrintVersion() {
        // Show all slides for printing
        this.slides.forEach(slide => {
            slide.style.position = 'relative';
            slide.style.transform = 'none';
            slide.style.opacity = '1';
            slide.style.pageBreakAfter = 'always';
            slide.style.height = '100vh';
        });
        
        // Hide navigation
        document.querySelector('.slide-nav').style.display = 'none';
        
        // Print
        window.print();
        
        // Restore original state after printing
        setTimeout(() => {
            location.reload();
        }, 1000);
    }
}

// Interactive elements enhancement
class InteractiveElements {
    constructor() {
        this.init();
    }
    
    init() {
        this.addHoverEffects();
        this.addClickableElements();
        this.addProgressIndicator();
    }
    
    addHoverEffects() {
        // Enhanced hover effects for cards
        const cards = document.querySelectorAll(
            '.problem-card, .audience-card, .service-card, .value-card, .why-card, .pricing-card'
        );
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px) scale(1.02)';
                this.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
                this.style.boxShadow = '';
            });
        });
        
        // Button hover effects
        const buttons = document.querySelectorAll('.nav-btn, .cta-button');
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.1)';
            });
            
            btn.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
            });
        });
    }
    
    addClickableElements() {
        // Make contact information clickable
        const emailLinks = document.querySelectorAll('p:contains("@")');
        emailLinks.forEach(link => {
            if (link.textContent.includes('@')) {
                link.style.cursor = 'pointer';
                link.addEventListener('click', () => {
                    const email = link.textContent.match(/[\w.-]+@[\w.-]+\.[\w.-]+/)[0];
                    window.open(`mailto:${email}`, '_blank');
                });
            }
        });
        
        // Make website links clickable
        const websiteLinks = document.querySelectorAll('p');
        websiteLinks.forEach(link => {
            if (link.textContent.includes('TrilliumHiring.com')) {
                link.style.cursor = 'pointer';
                link.addEventListener('click', () => {
                    window.open('https://trilliumhiring.com', '_blank');
                });
            }
        });
    }
    
    addProgressIndicator() {
        // Create a progress bar
        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 4px;
            background: #FFC300;
            z-index: 1001;
            transition: width 0.3s ease;
        `;
        document.body.appendChild(progressBar);
        
        // Update progress based on current slide
        const updateProgress = () => {
            const progress = (presentation.currentSlide / presentation.totalSlides) * 100;
            progressBar.style.width = `${progress}%`;
        };
        
        // Update progress on slide change
        const originalGoToSlide = presentation.goToSlide.bind(presentation);
        presentation.goToSlide = function(slideNumber) {
            originalGoToSlide(slideNumber);
            updateProgress();
        };
        
        // Initial progress
        updateProgress();
    }
}

// Initialize the presentation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize main presentation
    window.presentation = new SalesPresentation();
    
    // Initialize interactive elements
    new InteractiveElements();
    
    // Add export functionality
    document.addEventListener('keydown', (e) => {
        // Ctrl+E to export data
        if (e.ctrlKey && e.key === 'e') {
            e.preventDefault();
            const data = presentation.exportPresentationData();
            console.log('Presentation Data:', data);
            
            // Download as JSON
            const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'trillium-sales-deck-data.json';
            a.click();
            URL.revokeObjectURL(url);
        }
        
        // Ctrl+P to prepare print version
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            presentation.preparePrintVersion();
        }
    });
    
    // Add fullscreen functionality
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F11') {
            e.preventDefault();
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }
    });
    
    // Show loading complete message
    console.log('🚀 Trillium Hiring Sales Deck loaded successfully!');
    console.log('💡 Keyboard shortcuts:');
    console.log('   • Arrow keys / Space: Navigate slides');
    console.log('   • Home/End: Go to first/last slide');
    console.log('   • Ctrl+E: Export presentation data');
    console.log('   • Ctrl+P: Print-friendly version');
    console.log('   • F11: Toggle fullscreen');
});

// Utility functions for presentation enhancement
const PresentationUtils = {
    // Add smooth scrolling to elements
    smoothScrollTo(element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    },
    
    // Copy slide content to clipboard
    copySlideContent(slideNumber) {
        const slide = document.querySelector(`#slide${slideNumber}`);
        if (slide) {
            const content = slide.querySelector('.slide-content').innerText;
            navigator.clipboard.writeText(content).then(() => {
                console.log('Slide content copied to clipboard!');
            });
        }
    },
    
    // Generate slide thumbnails for overview
    generateThumbnails() {
        // This could be used to create a slide overview/navigator
        const thumbnails = [];
        document.querySelectorAll('.slide').forEach((slide, index) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 200;
            canvas.height = 150;
            
            // Simple thumbnail representation
            ctx.fillStyle = '#F8F9FA';
            ctx.fillRect(0, 0, 200, 150);
            ctx.fillStyle = '#4B5A5F';
            ctx.font = '12px Inter';
            ctx.fillText(`Slide ${index + 1}`, 10, 20);
            
            thumbnails.push(canvas.toDataURL());
        });
        
        return thumbnails;
    }
};

// Make utilities available globally
window.PresentationUtils = PresentationUtils;
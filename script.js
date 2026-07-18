/* ==========================================================================
   MOBILE MENU NAVIGATION
   ========================================================================== */
const hamburger = document.getElementById('hamburger-menu');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close menu when clicking a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

/* ==========================================================================
   SCROLL ACTIVE LINK HIGHLIGHT & TRANSITIONS
   ========================================================================== */
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px', // Triggers when section occupies middle part of screen
    threshold: 0
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}, observerOptions);

sections.forEach(section => {
    observer.observe(section);
});

// Fade-in entrance animation for sections on scroll
const sectionFadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-visible');
        }
    });
}, { threshold: 0.1 });

sections.forEach(section => {
    section.classList.add('fade-in-section');
    sectionFadeObserver.observe(section);
});

/* Add CSS style for fade-in to document head dynamically to keep css clean */
const style = document.createElement('style');
style.textContent = `
    .fade-in-section {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.8s ease-out, transform 0.8s ease-out;
    }
    .fade-in-visible {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);

/* ==========================================================================
   INTERACTIVE CANVAS BACKGROUND (CIRCUIT GRID)
   ========================================================================== */
const canvas = document.getElementById('circuit-canvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
});

// Particle representing moving electrons/pulses
class TracePulse {
    constructor() {
        this.reset();
    }
    
    reset() {
        // Start at a random grid crossing point
        this.gridSize = 40;
        this.x = Math.floor(Math.random() * (width / this.gridSize)) * this.gridSize;
        this.y = Math.floor(Math.random() * (height / this.gridSize)) * this.gridSize;
        this.speed = Math.random() > 0.5 ? 2 : 4;
        
        // Choose initial direction (0=Up, 1=Right, 2=Down, 3=Left)
        this.dir = Math.floor(Math.random() * 4);
        this.length = Math.floor(Math.random() * 15) + 5;
        this.steps = 0;
        this.pulseColor = Math.random() > 0.4 ? '#00f3ff' : '#00ffd1';
        this.pulseWidth = Math.random() * 1.5 + 1;
    }
    
    update() {
        // Move cardinally
        switch(this.dir) {
            case 0: this.y -= this.speed; break; // Up
            case 1: this.x += this.speed; break; // Right
            case 2: this.y += this.speed; break; // Down
            case 3: this.x -= this.speed; break; // Left
        }
        
        this.steps++;
        
        // Decide whether to change direction or reset
        if (this.steps >= this.length) {
            if (Math.random() > 0.7) {
                // Change direction cardinally (90 degrees turn)
                const turns = [ (this.dir + 1) % 4, (this.dir + 3) % 4 ];
                this.dir = turns[Math.floor(Math.random() * 2)];
                this.steps = 0;
                this.length = Math.floor(Math.random() * 10) + 3;
            } else {
                this.reset();
            }
        }
        
        // Boundaries check
        if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
            this.reset();
        }
    }
    
    draw() {
        ctx.beginPath();
        ctx.strokeStyle = this.pulseColor;
        ctx.lineWidth = this.pulseWidth;
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.pulseColor;
        
        // Draw path line
        if (this.dir === 0) {
            ctx.moveTo(this.x, this.y + (this.speed * 2));
            ctx.lineTo(this.x, this.y);
        } else if (this.dir === 1) {
            ctx.moveTo(this.x - (this.speed * 2), this.y);
            ctx.lineTo(this.x, this.y);
        } else if (this.dir === 2) {
            ctx.moveTo(this.x, this.y - (this.speed * 2));
            ctx.lineTo(this.x, this.y);
        } else {
            ctx.moveTo(this.x + (this.speed * 2), this.y);
            ctx.lineTo(this.x, this.y);
        }
        
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset shadow for efficiency
    }
}

// Generate static nodes mimicking transistor cells
const staticNodes = [];
const nodeCount = Math.floor((width * height) / 80000);
for (let i = 0; i < nodeCount; i++) {
    staticNodes.push({
        x: Math.floor(Math.random() * (width / 40)) * 40,
        y: Math.floor(Math.random() * (height / 40)) * 40,
        size: Math.random() * 2 + 1.5,
        pulseOffset: Math.random() * Math.PI
    });
}

const pulses = Array.from({ length: 25 }, () => new TracePulse());

function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // Draw static silicon node pads
    ctx.fillStyle = 'rgba(0, 243, 255, 0.25)';
    staticNodes.forEach(node => {
        ctx.beginPath();
        // Pulsing glow radius
        const scale = 1 + Math.sin(Date.now() * 0.002 + node.pulseOffset) * 0.3;
        ctx.arc(node.x, node.y, node.size * scale, 0, Math.PI * 2);
        ctx.fill();
        
        // Outer concentric ring
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.05)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size * 3 * scale, 0, Math.PI * 2);
        ctx.stroke();
    });

    // Update and draw traces
    pulses.forEach(pulse => {
        pulse.update();
        pulse.draw();
    });
    
    requestAnimationFrame(animate);
}

animate();

/* ==========================================================================
   INTERACTIVE LOGIC GATE SANDBOX
   ========================================================================== */
const toggleA = document.getElementById('toggle-a');
const toggleB = document.getElementById('toggle-b');
const gateType = document.getElementById('gate-type');
const outputY = document.getElementById('output-y');
const gateText = document.getElementById('gate-text');
const svgGate = document.getElementById('svg-gate');
const verilogCode = document.getElementById('verilog-code');

const sigA = document.getElementById('sig-a');
const sigB = document.getElementById('sig-b');
const sigOut = document.getElementById('sig-out');
const gateSchematic = document.getElementById('gate-schematic');

// SVG Path definitions for logic gates (Designed for viewBox 0 0 100 60)
const gateSVGs = {
    AND: `
        <!-- Input connecting lines inside box -->
        <line x1="0" y1="15" x2="30" y2="15" />
        <line x1="0" y1="45" x2="30" y2="45" />
        <!-- AND Gate shape -->
        <path d="M 30 10 H 50 C 65 10 75 22 75 30 C 75 38 65 50 50 50 H 30 Z" />
        <!-- Output line -->
        <line x1="75" y1="30" x2="100" y2="30" />
    `,
    OR: `
        <line x1="0" y1="15" x2="28" y2="15" />
        <line x1="0" y1="45" x2="28" y2="45" />
        <!-- OR Gate shape -->
        <path d="M 20 10 C 27 10 32 20 50 30 C 32 40 27 50 20 50 C 30 38 30 22 20 10 Z" />
        <line x1="50" y1="30" x2="100" y2="30" />
    `,
    XOR: `
        <line x1="0" y1="15" x2="24" y2="15" />
        <line x1="0" y1="45" x2="24" y2="45" />
        <!-- Back curve -->
        <path d="M 12 10 C 22 22 22 38 12 50" />
        <!-- Main body curve -->
        <path d="M 20 10 C 27 10 32 20 50 30 C 32 40 27 50 20 50 C 30 38 30 22 20 10 Z" />
        <line x1="50" y1="30" x2="100" y2="30" />
    `,
    NAND: `
        <line x1="0" y1="15" x2="28" y2="15" />
        <line x1="0" y1="45" x2="28" y2="45" />
        <path d="M 28 10 H 46 C 60 10 70 20 70 30 C 70 40 60 50 46 50 H 28 Z" />
        <!-- Inverter Bubble -->
        <circle cx="75" cy="30" r="4.5" />
        <line x1="80" y1="30" x2="100" y2="30" />
    `,
    NOR: `
        <line x1="0" y1="15" x2="24" y2="15" />
        <line x1="0" y1="45" x2="24" y2="45" />
        <path d="M 18 10 C 25 10 30 20 48 30 C 30 40 25 50 18 50 C 28 38 28 22 18 10 Z" />
        <circle cx="53" cy="30" r="4.5" />
        <line x1="58" y1="30" x2="100" y2="30" />
    `
};

const verilogModules = {
    AND: `module and_gate (\n    input A, B,\n    output Y\n);\n    assign Y = A & B;\nendmodule`,
    OR: `module or_gate (\n    input A, B,\n    output Y\n);\n    assign Y = A | B;\nendmodule`,
    XOR: `module xor_gate (\n    input A, B,\n    output Y\n);\n    assign Y = A ^ B;\nendmodule`,
    NAND: `module nand_gate (\n    input A, B,\n    output Y\n);\n    assign Y = ~(A & B);\nendmodule`,
    NOR: `module nor_gate (\n    input A, B,\n    output Y\n);\n    assign Y = ~(A | B);\nendmodule`
};

function updateLogicSimulator() {
    const valA = parseInt(toggleA.getAttribute('data-value'));
    const valB = parseInt(toggleB.getAttribute('data-value'));
    const gate = gateType.value;
    
    let result = 0;
    
    // Evaluate logic
    switch(gate) {
        case 'AND': result = valA & valB; break;
        case 'OR':  result = valA | valB; break;
        case 'XOR': result = valA ^ valB; break;
        case 'NAND': result = (valA & valB) === 1 ? 0 : 1; break;
        case 'NOR':  result = (valA | valB) === 1 ? 0 : 1; break;
    }
    
    // Update displays
    outputY.textContent = result;
    gateText.textContent = gate;
    
    // Update SVG and Verilog code blocks
    svgGate.innerHTML = gateSVGs[gate];
    verilogCode.textContent = verilogModules[gate];
    
    // Signal wire glow updates
    if (valA === 1) {
        sigA.classList.add('active-sec');
    } else {
        sigA.classList.remove('active-sec');
    }
    
    if (valB === 1) {
        sigB.classList.add('active-sec');
    } else {
        sigB.classList.remove('active-sec');
    }
    
    if (result === 1) {
        outputY.classList.add('active');
        sigOut.classList.add('active');
        gateSchematic.classList.add('active');
        svgGate.classList.add('active');
    } else {
        outputY.classList.remove('active');
        sigOut.classList.remove('active');
        gateSchematic.classList.remove('active');
        svgGate.classList.remove('active');
    }
}

// Event Listeners for inputs
[toggleA, toggleB].forEach(btn => {
    btn.addEventListener('click', () => {
        const currVal = parseInt(btn.getAttribute('data-value'));
        const newVal = currVal === 0 ? 1 : 0;
        btn.setAttribute('data-value', newVal);
        btn.textContent = newVal;
        updateLogicSimulator();
    });
});

gateType.addEventListener('change', updateLogicSimulator);

// Initialize gate representation on load
updateLogicSimulator();

/* ==========================================================================
   CERTIFICATE ZOOM MODAL (Dynamic)
   ========================================================================== */
const modal = document.getElementById('cert-modal');
const modalImg = document.getElementById('img-modal-target');
const closeBtn = document.getElementById('close-modal');
const modalCaption = document.getElementById('modal-caption');
const modalDownload = document.getElementById('modal-download');
const modalVerify = document.getElementById('modal-verify');

function openCertModal(src, title, downloadHref, verifyHref) {
    modalImg.src = src;
    modalCaption.textContent = title || 'Certificate Preview';

    if (downloadHref) {
        modalDownload.href = downloadHref;
        // Derive a clean filename from the path
        const filename = downloadHref.split('/').pop().replace(/\.[^.]+$/, '') + '.svg';
        modalDownload.setAttribute('download', filename);
        modalDownload.style.display = 'inline-flex';
    } else {
        modalDownload.style.display = 'none';
    }

    if (verifyHref) {
        modalVerify.href = verifyHref;
        modalVerify.style.display = 'inline-flex';
    } else {
        modalVerify.style.display = 'none';
    }

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

const closeModal = () => {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
};

// --- Clickable certificate thumbnails (achievement section) ---
document.querySelectorAll('.certificate-thumbnail-container[data-cert-src]').forEach(thumb => {
    thumb.addEventListener('click', () => {
        const src      = thumb.dataset.certSrc;
        const title    = thumb.dataset.certTitle;
        const download = thumb.dataset.certDownload;
        const verify   = thumb.dataset.certVerify || null;
        openCertModal(src, title, download, verify);
    });
});

// --- "View" buttons inside cert-item cards ---
document.querySelectorAll('.view-cert-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const card    = btn.closest('.cert-item[data-cert-src]');
        if (!card) return;
        const src      = card.dataset.certSrc;
        const title    = card.dataset.certTitle;
        const download = card.dataset.certDownload;
        const verify   = card.dataset.certVerify || null;
        openCertModal(src, title, download, verify);
    });
});

if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
}

// Close when clicking the dark backdrop
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

/* ==========================================================================
   CONTACT FORM & TOAST
   ========================================================================== */
const contactForm = document.getElementById('contact-form');
const toast = document.getElementById('toast-message');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Perform simple form inputs check
        const nameVal = document.getElementById('name').value.trim();
        const emailVal = document.getElementById('email').value.trim();
        const msgVal = document.getElementById('message').value.trim();
        
        if (nameVal && emailVal && msgVal) {
            // Success animation
            toast.classList.add('show');
            
            // Clear inputs
            contactForm.reset();
            
            // Remove floating active classes from labels by triggering change
            document.querySelectorAll('.form-group input, .form-group textarea').forEach(input => {
                input.value = '';
            });
            
            // Dismiss toast after duration
            setTimeout(() => {
                toast.classList.remove('show');
            }, 4000);
        }
    });
}

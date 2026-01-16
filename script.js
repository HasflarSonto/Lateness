// State management
const state = {
    alcohol: null,
    time: null,
    importance: null,
    weather: null,
    day: null,
    hungover: null
};

// Lateness modifiers (in minutes)
const modifiers = {
    alcohol: {
        yes: -10,      // Motivated by drinks!
        no: 15         // Meh, no rush
    },
    time: {
        morning: 45,   // Mornings are HARD
        afternoon: 20,
        evening: 10,
        night: 5       // Night owl energy
    },
    importance: {
        critical: -5,  // Even Antonio tries a little
        important: 10,
        casual: 25,
        optional: 40   // "Do I even need to go?"
    },
    weather: {
        perfect: 5,
        okay: 10,
        bad: 30        // "I can't go out in THIS"
    },
    day: {
        weekday: 10,
        friday: 15,
        weekend: 25    // Weekend time is fluid
    },
    hungover: {
        yes: 35,       // Recovery time needed
        maybe: 15,
        no: 0
    }
};

// Base lateness (Antonio is always at least a little late)
const BASE_LATENESS = 12;

// Status messages for the fake tracker
const statusMessages = [
    '"Still in bed tbh"',
    '"Just woke up"',
    '"Getting in the shower"',
    '"Can\'t find my keys"',
    '"Okay actually leaving now"',
    '"Wait forgot my wallet"',
    '"On my way fr this time"',
    '"Traffic is crazy rn"',
    '"Almost there I think"',
    '"Parking is impossible"'
];

// Lateness messages based on how late
const latenessMessages = {
    veryLate: [
        "Might want to grab a snack...",
        "Hope you brought a book",
        "Consider starting without him",
        "Classic Antonio moment"
    ],
    prettyLate: [
        "Par for the course, really",
        "At least it's not an hour?",
        "He's trying his best (allegedly)"
    ],
    kindaLate: [
        "Not his worst performance",
        "Surprisingly reasonable",
        "The alcohol must be calling"
    ],
    barelyLate: [
        "Wow, almost on time!",
        "Mark this day on your calendar",
        "Something must be very important"
    ]
};

// All Antonio photos for cycling
const allPhotos = [
    'Photo/12dc5cb9552b0c374eb06b888b7cb3ba.jpg',
    'Photo/21c21d0cb1d3d9de0890e33875ee3d5e.jpg',
    'Photo/23bd6b6499ae2d9e3db9f1dc02811d0d.jpg',
    'Photo/4441ebd7706a826ffcb5adc93c14a836.jpg',
    'Photo/46de76274404f596ea7145fab2c910fa.jpg',
    'Photo/54699eae52b00d7f72501f7865b67de1.jpg',
    'Photo/76e58ee3fad78441e8d6050a0f6741bb.jpg',
    'Photo/7e3f9f09c75e2cb8946e76cefb701060.jpg',
    'Photo/9b2a9dc2a5090547577f63f41126996a.jpg',
    'Photo/a5c08e70845d162458783aac2da4e56b.jpg',
    'Photo/bbdd0075f81975047430096d9c893a31.jpg',
    'Photo/bea86c55677ebd488bdecd37f045242b.jpg',
    'Photo/ce47cc3a49721eb9c5226c94cfdf41f0.jpg',
    'Photo/db1991d2a35d9a89b6b6e5a66d1bb189.jpg',
    'Photo/ecb0125c78f9365606773654fba90130.jpg'
];

// Track which photos are currently shown
let currentPhotoIndices = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupToggleButtons();
    setupCalculateButton();
    setupTryAgainButton();
    initializeFloatingPhotos();
});

function setupToggleButtons() {
    const buttons = document.querySelectorAll('.toggle-btn');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const field = btn.dataset.field;
            const value = btn.dataset.value;

            // Deselect other buttons in the same group
            const group = btn.closest('.toggle-group');
            group.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('selected'));

            // Select this button
            btn.classList.add('selected');

            // Update state
            state[field] = value;

            // Check if all fields are filled
            updateCalculateButton();
        });
    });
}

function updateCalculateButton() {
    const calculateBtn = document.getElementById('calculate-btn');
    const allFilled = Object.values(state).every(v => v !== null);
    calculateBtn.disabled = !allFilled;
}

function setupCalculateButton() {
    const calculateBtn = document.getElementById('calculate-btn');
    calculateBtn.addEventListener('click', () => {
        const lateness = calculateLateness();
        showResults(lateness);
    });
}

function setupTryAgainButton() {
    const tryAgainBtn = document.getElementById('try-again-btn');
    tryAgainBtn.addEventListener('click', () => {
        // Reset state
        Object.keys(state).forEach(key => state[key] = null);

        // Reset UI
        document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('selected'));

        // Show form, hide results
        document.getElementById('question-form').classList.remove('hidden');
        document.getElementById('results').classList.add('hidden');

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Reset button
        updateCalculateButton();
    });
}

function calculateLateness() {
    let total = BASE_LATENESS;

    // Add modifiers
    total += modifiers.alcohol[state.alcohol];
    total += modifiers.time[state.time];
    total += modifiers.importance[state.importance];
    total += modifiers.weather[state.weather];
    total += modifiers.day[state.day];
    total += modifiers.hungover[state.hungover];

    // Add some randomness (+/- 10 minutes)
    total += Math.floor(Math.random() * 21) - 10;

    // Minimum 5 minutes late (Antonio is never on time)
    return Math.max(5, total);
}

function getLatenessMessage(lateness) {
    let messages;
    if (lateness >= 60) {
        messages = latenessMessages.veryLate;
    } else if (lateness >= 35) {
        messages = latenessMessages.prettyLate;
    } else if (lateness >= 20) {
        messages = latenessMessages.kindaLate;
    } else {
        messages = latenessMessages.barelyLate;
    }
    return messages[Math.floor(Math.random() * messages.length)];
}

function showResults(lateness) {
    // Hide form, show results
    document.getElementById('question-form').classList.add('hidden');
    document.getElementById('results').classList.remove('hidden');

    // Scroll to results
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Set lateness message
    document.getElementById('lateness-message').textContent = getLatenessMessage(lateness);

    // Animate the number
    animateNumber(lateness);

    // Start the fake tracker
    startFakeTracker(lateness);

    // Generate excuse
    generateExcuse(lateness);
}

function animateNumber(target) {
    const numberEl = document.querySelector('.time-number');
    let current = 0;
    const duration = 1500;
    const steps = 60;
    const increment = target / steps;
    const stepDuration = duration / steps;

    const interval = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(interval);
        }
        numberEl.textContent = Math.round(current);
    }, stepDuration);
}

function startFakeTracker(lateness) {
    const carMarker = document.getElementById('car-marker');
    const etaEl = document.getElementById('eta');
    const statusEl = document.getElementById('driver-status');

    // Calculate animation duration based on lateness
    const animDuration = Math.min(lateness * 500, 30000); // Max 30 seconds
    const startPosition = 8; // %
    const endPosition = 85; // %

    let currentTime = 0;
    let statusIndex = 0;

    // Update ETA
    etaEl.textContent = `ETA: ${lateness} min`;

    // Animate car position
    const positionInterval = setInterval(() => {
        currentTime += 100;
        const progress = currentTime / animDuration;

        if (progress >= 1) {
            carMarker.style.left = `${endPosition}%`;
            clearInterval(positionInterval);
            etaEl.textContent = 'Arriving...';
            return;
        }

        // Add some wobble to make it feel more "real"
        const wobble = Math.sin(currentTime / 500) * 2;
        const position = startPosition + (endPosition - startPosition) * easeInOut(progress) + wobble;
        carMarker.style.left = `${position}%`;

        // Update ETA countdown
        const remainingMin = Math.ceil(lateness * (1 - progress));
        etaEl.textContent = `ETA: ${remainingMin} min`;
    }, 100);

    // Update status messages
    const statusInterval = setInterval(() => {
        statusEl.textContent = statusMessages[statusIndex];
        statusIndex++;

        if (statusIndex >= statusMessages.length) {
            clearInterval(statusInterval);
        }
    }, animDuration / statusMessages.length);
}

function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

async function generateExcuse(lateness) {
    const container = document.getElementById('excuse-container');
    const excuseContent = container.querySelector('.excuse-content');

    // Build context for the excuse
    const context = {
        lateness,
        alcohol: state.alcohol === 'yes',
        timeOfDay: state.time,
        importance: state.importance,
        weather: state.weather,
        day: state.day,
        hungover: state.hungover
    };

    try {
        const response = await fetch('/api/generate-excuse', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(context)
        });

        if (!response.ok) {
            throw new Error('Failed to generate excuse');
        }

        const data = await response.json();

        // Display the excuse
        excuseContent.innerHTML = `<p class="excuse-text">${data.excuse}</p>`;
    } catch (error) {
        console.error('Error generating excuse:', error);
        // Fallback excuses
        const fallbackExcuses = [
            "My Uber driver took a 'scenic route' through another dimension",
            "I was ready on time but my reflection wasn't, had to wait for it",
            "Got stuck in a time loop for a bit, you wouldn't believe it",
            "My cat gave me a look and I legally couldn't leave",
            "Phone died and I had to wait for it to emotionally recover",
            "I left on time but forgot I existed for a few minutes",
            "Traffic was wild, saw at least 3 cars on the road",
            "Had an existential crisis about which shoes to wear",
            "My horoscope said to delay all plans by 30 minutes",
            "I got distracted by a really good song and had to finish it 4 times"
        ];
        const randomExcuse = fallbackExcuses[Math.floor(Math.random() * fallbackExcuses.length)];
        excuseContent.innerHTML = `<p class="excuse-text">${randomExcuse}</p>`;
    }
}

// Floating photos cycling system
function initializeFloatingPhotos() {
    const slots = document.querySelectorAll('.floating-photo');
    const numSlots = slots.length;

    // Shuffle photos array
    const shuffled = [...allPhotos].sort(() => Math.random() - 0.5);

    // Initialize each slot with a unique photo
    currentPhotoIndices = [];
    slots.forEach((slot, i) => {
        const photoIndex = i % shuffled.length;
        currentPhotoIndices.push(photoIndex);
        const img = slot.querySelector('img');
        img.src = shuffled[photoIndex];

        // Stagger the initial appearance
        setTimeout(() => {
            slot.style.opacity = '0.25';
        }, i * 800);
    });

    // Cycle photos every few seconds
    setInterval(() => {
        cycleRandomPhoto(slots, shuffled);
    }, 4000);
}

function cycleRandomPhoto(slots, photos) {
    // Pick a random slot to update
    const slotIndex = Math.floor(Math.random() * slots.length);
    const slot = slots[slotIndex];
    const img = slot.querySelector('img');

    // Fade out
    slot.style.opacity = '0';
    slot.style.transform = 'scale(0.8)';

    setTimeout(() => {
        // Get a new photo that's not currently displayed
        let newPhotoIndex;
        do {
            newPhotoIndex = Math.floor(Math.random() * photos.length);
        } while (currentPhotoIndices.includes(newPhotoIndex) && photos.length > slots.length);

        currentPhotoIndices[slotIndex] = newPhotoIndex;
        img.src = photos[newPhotoIndex];

        // Fade in
        slot.style.opacity = '0.25';
        slot.style.transform = 'scale(1)';
    }, 600);
}

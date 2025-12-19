// --- SCROLL ANIMATION ---
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        }
    });
}, { threshold: 0.1 });

// Initial reveal
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.hidden').forEach((el) => observer.observe(el));
});

// --- TYPEWRITER (Same as before) ---
const typeOutput = document.getElementById("typewriter-text");
if (typeOutput) {
    const words = ["Data Scientist", "AI Engineer", "Problem Solver"];
    let i = 0;
    let timer;
    function typingEffect() {
        let word = words[i].split("");
        var loopTyping = function () {
            if (word.length > 0) {
                typeOutput.innerHTML += word.shift();
            } else {
                setTimeout(deletingEffect, 2000);
                return false;
            }
            timer = setTimeout(loopTyping, 100);
        };
        loopTyping();
    }
    function deletingEffect() {
        let word = words[i].split("");
        var loopDeleting = function () {
            if (word.length > 0) {
                word.pop();
                typeOutput.innerHTML = word.join("");
            } else {
                if (words.length > (i + 1)) { i++; } else { i = 0; }
                typingEffect();
                return false;
            }
            timer = setTimeout(loopDeleting, 50);
        };
        loopDeleting();
    }
    typingEffect();
}

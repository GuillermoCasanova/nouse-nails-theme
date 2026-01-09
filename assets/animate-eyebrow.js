/**
 * Animate Eyebrow Text
 * Transforms text like "[ Lorem Ipsum ]" into structured divs and fades them in using GSAP
 */

function initEyebrowAnimations() {
    // Register ScrollTrigger plugin
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }
  
    const eyebrows = document.querySelectorAll('[data-animate-eyebrow="true"]');
  
    eyebrows.forEach((eyebrow, index) => {
      const originalText = eyebrow.textContent.trim();
  
      // Check if text matches pattern: [ Text ]
      const bracketMatch = originalText.match(/^\[\s*(.*?)\s*\]$/);
  
      if (bracketMatch) {
        const innerText = bracketMatch[1];
  
        // Create new structure with brackets wrappe
        const bracketsWrapper = document.createElement('div');
        bracketsWrapper.className = 'eyebrow-brackets-wrapper';
  
        const bracketsGroup = document.createElement('div');
        bracketsGroup.className = 'eyebrow-brackets-group';
  
        const leftBracket = document.createElement('div');
        leftBracket.className = 'eyebrow-bracket eyebrow-bracket--left';
        leftBracket.textContent = '[';
  
        const textContent = document.createElement('div');
        textContent.className = 'eyebrow-text';
        textContent.textContent = innerText;
  
        const rightBracket = document.createElement('div');
        rightBracket.className = 'eyebrow-bracket eyebrow-bracket--right';
        rightBracket.textContent = ']';
  
        const plusSign = document.createElement('div');
        plusSign.className = 'eyebrow-plus';
        plusSign.textContent = '+';
  
        // Append brackets and text to wrapper
        bracketsGroup.appendChild(leftBracket);
        bracketsGroup.appendChild(rightBracket);
  
        bracketsWrapper.appendChild(bracketsGroup);
        bracketsWrapper.appendChild(textContent);
  
        // Clear original content and append new structure
        eyebrow.innerHTML = '';
        eyebrow.appendChild(bracketsWrapper);
        eyebrow.appendChild(plusSign);
  
        // Add wrapper class for styling
        eyebrow.classList.add('eyebrow-animated');
  
        // Set initial states
        gsap.set(bracketsGroup, { width: '2rem' });
        gsap.set(leftBracket, { x: '15%' });
        gsap.set(rightBracket, { x: '-15%' });
        gsap.set(textContent, { clipPath: 'inset(0px 50%)' });
  
        // Create timeline for sequenced animation with stagger delay
        const timeline = gsap.timeline({
          delay: index * 0.2, // Stagger delay: 0.2s per element
          scrollTrigger: {
            trigger: eyebrow,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        });
  
        // Step 1: Fade in the entire eyebrow
        timeline.to(eyebrow, {
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out',
        });
  
        timeline.to(plusSign, {
          rotation: 90,
  
          duration: 0.3,
          ease: 'power2.out'
        });
  
        timeline.to(plusSign, {
  
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
  
        // Step 2: Animate wrapper width and brackets outward
        timeline.to(
          bracketsGroup,
          {
            width: '100%',
            duration: 0.5,
            ease: 'power2.out',
          }
        );
  
        timeline.to(textContent, {
          clipPath: 'inset(0px 0%)',
          duration: .6,
          ease: 'power2.out'
        }, '<');
  
        timeline.to(
          leftBracket,
          {
            x: '-12px',
            duration: 0.5,
            ease: 'power2.out',
          },
          '<'
        );
  
        timeline.to(
          rightBracket,
          {
            x: '12px',
            duration: 0.5,
            ease: 'power2.out',
          },
          '<'
        );
      } else {
        // For non-bracketed text, just fade in with stagger
        gsap.set(eyebrow, { opacity: 0 });
  
        gsap.to(eyebrow, {
          opacity: 1,
          duration: 0.8,
          delay: index * 0.2, // Stagger delay
          ease: 'power2.out',
          scrollTrigger: {
            trigger: eyebrow,
            start: 'bottom 40%',
            toggleActions: 'play none none none',
          },
        });
      }
    });
  }
  
  initEyebrowAnimations();
  
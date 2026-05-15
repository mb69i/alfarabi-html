document.addEventListener('DOMContentLoaded', () => {
  // 1. Magnetic Buttons
  const buttons = document.querySelectorAll('.btn-primary, .btn-gold');
  buttons.forEach(el => {
    el.addEventListener('mousemove', e => {
      // Temporarily disable transition during mousemove for instant follow
      el.style.transition = 'none';
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.35;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.35;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('mouseleave', () => {
      // Re-enable smooth transition for reset
      el.style.transition = 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease';
      el.style.transform = 'translate(0, 0)';
    });
  });

  // 2. 3D Card Tilt
  const cards = document.querySelectorAll('.glass-card');
  cards.forEach(el => {
    el.addEventListener('mousemove', e => {
      el.style.transition = 'none';
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
      el.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${x}deg) translateZ(8px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
      el.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateZ(0)';
    });
  });

  // 3. Custom Cursor (Desktop only)
  if (window.innerWidth > 768) {
    const cursor = document.createElement('div');
    cursor.style.position = 'fixed';
    cursor.style.top = '0';
    cursor.style.left = '0';
    cursor.style.width = '8px';
    cursor.style.height = '8px';
    cursor.style.backgroundColor = 'var(--gold, #D4AF37)';
    cursor.style.borderRadius = '50%';
    cursor.style.pointerEvents = 'none';
    cursor.style.zIndex = '999999';
    cursor.style.transition = 'width 0.2s, height 0.2s, background-color 0.2s, border 0.2s';
    
    // Create a wrapper for smooth following
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    
    document.body.appendChild(cursor);

    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Request animation frame for smooth lerping
    function updateCursor() {
      // Lerp
      cursorX += (mouseX - cursorX) * 0.2;
      cursorY += (mouseY - cursorY) * 0.2;
      
      // Center the cursor dot
      cursor.style.transform = `translate(${cursorX - 4}px, ${cursorY - 4}px)`;
      requestAnimationFrame(updateCursor);
    }
    updateCursor();

    const interactables = document.querySelectorAll('a, button, .glass-card, input, .ai-chat-fab');
    interactables.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.width = '32px';
        cursor.style.height = '32px';
        cursor.style.backgroundColor = 'transparent';
        cursor.style.border = '2px solid var(--gold, #D4AF37)';
        cursor.style.marginLeft = '-12px'; // Adjust for new size
        cursor.style.marginTop = '-12px';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.width = '8px';
        cursor.style.height = '8px';
        cursor.style.backgroundColor = 'var(--gold, #D4AF37)';
        cursor.style.border = 'none';
        cursor.style.marginLeft = '0';
        cursor.style.marginTop = '0';
      });
    });
  }
});

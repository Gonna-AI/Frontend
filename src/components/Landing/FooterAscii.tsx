import { useEffect, useRef } from 'react';
import './FooterAscii.css';

// Render a small, silent video as text only while the footer is on screen.
export default function FooterAscii() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return undefined;
    const context = canvas.getContext('2d');
    const sample = document.createElement('canvas');
    const sampleContext = sample.getContext('2d', { willReadFrequently: true });
    if (!context || !sampleContext) return undefined;

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const characters = ' .,:;irsXA253hMHGS#9B&@';
    let frame = 0;
    let lastDraw = 0;
    let visible = false;
    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.max(40, Math.min(180, Math.round(width / 8)));
      rows = Math.max(1, Math.ceil(height / (width / cols * 1.65)));
      sample.width = cols;
      sample.height = rows;
      draw();
    };

    function draw() {
      if (video.readyState < 2 || !video.videoWidth || !cols) return;
      // Fit the complete video in CSS pixels: character cells are taller than
      // they are wide, so fitting in grid coordinates would distort the image.
      const scale = Math.min(width / video.videoWidth, height / video.videoHeight);
      const sourceWidth = video.videoWidth * scale / width * cols;
      const sourceHeight = video.videoHeight * scale / height * rows;
      sampleContext!.fillStyle = '#000';
      sampleContext!.fillRect(0, 0, cols, rows);
      // Center the full image behind the wordmark on every screen.
      const sourceTop = (rows - sourceHeight) / 2;
      const sourceLeft = (cols - sourceWidth) / 2;
      sampleContext!.drawImage(video, sourceLeft, sourceTop, sourceWidth, sourceHeight);
      const pixels = sampleContext!.getImageData(0, 0, cols, rows).data;
      const cellWidth = width / cols;
      const cellHeight = height / rows;
      context!.clearRect(0, 0, width, height);
      context!.font = `${Math.max(5, cellHeight * 0.86)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      context!.textAlign = 'center';
      context!.textBaseline = 'middle';
      // Quantized tones keep the animation legible without thousands of style changes.
      for (let tone = 1; tone <= 5; tone++) {
        context!.fillStyle = `rgba(244, 221, 200, ${0.13 + tone * 0.15})`;
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const nx = (x - sourceLeft) / sourceWidth * 2 - 1;
            const ny = (y - sourceTop) / sourceHeight * 2 - 1;
            const distance = Math.sqrt(nx * nx * 0.49 + ny * ny);
            const fade = Math.max(0, Math.min(1, (1 - distance) / 0.38));
            if (!fade) continue;
            const i = (y * cols + x) * 4;
            const light = (pixels[i] * 0.2126 + pixels[i + 1] * 0.7152 + pixels[i + 2] * 0.0722) / 255 * fade;
            if (Math.min(5, Math.ceil(light * 5)) !== tone || light < 0.1) continue;
            const glyph = characters[Math.min(characters.length - 1, Math.floor(Math.sqrt(light) * (characters.length - 1)))];
            context!.fillText(glyph, (x + 0.5) * cellWidth, (y + 0.5) * cellHeight);
          }
        }
      }
    }

    const tick = (time: number) => {
      if (!visible || motion.matches) { frame = 0; return; }
      if (time - lastDraw >= 1000 / 15) { draw(); lastDraw = time; }
      frame = requestAnimationFrame(tick);
    };
    const syncPlayback = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      if (visible && !motion.matches && !document.hidden) {
        void video.play().then(() => { if (!frame && visible && !motion.matches && !document.hidden) frame = requestAnimationFrame(tick); }).catch(() => draw());
      } else {
        video.pause();
        if (visible) draw();
      }
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; syncPlayback(); }, { rootMargin: '100px 0px' });
    const resizeObserver = new ResizeObserver(resize);
    observer.observe(canvas);
    resizeObserver.observe(canvas);
    video.addEventListener('loadeddata', draw);
    document.addEventListener('visibilitychange', syncPlayback);
    motion.addEventListener('change', syncPlayback);
    resize();
    return () => {
      visible = false;
      observer.disconnect();
      resizeObserver.disconnect();
      if (frame) cancelAnimationFrame(frame);
      video.pause();
      video.removeEventListener('loadeddata', draw);
      document.removeEventListener('visibilitychange', syncPlayback);
      motion.removeEventListener('change', syncPlayback);
    };
  }, []);

  return (
    <div className="agero-footer-ascii" aria-hidden="true">
      <video ref={videoRef} src="/media/footer-ascii-source.mp4" muted loop playsInline preload="auto" />
      <canvas ref={canvasRef} />
    </div>
  );
}

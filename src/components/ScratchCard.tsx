import React, { useRef, useEffect, useState } from 'react';

interface ScratchCardProps {
  imageUrl: string;
  onNext: () => void;
}

const ScratchCard: React.FC<ScratchCardProps> = ({ imageUrl, onNext }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [resolvedImageUrl, setResolvedImageUrl] = useState('');

  useEffect(() => {
    // Vite handles resolving the public path correctly during build
    setResolvedImageUrl(new URL(imageUrl, import.meta.url).href);
  }, [imageUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas dimensions
    canvas.width = 500;
    canvas.height = 500;

    // Create a colorful gradient
    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#ff0000');
    gradient.addColorStop(0.17, '#ff7f00');
    gradient.addColorStop(0.34, '#ffff00');
    gradient.addColorStop(0.51, '#00ff00');
    gradient.addColorStop(0.68, '#0000ff');
    gradient.addColorStop(0.85, '#4b0082');
    gradient.addColorStop(1, '#9400d3');

    // Fill the canvas with the gradient
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }, [resolvedImageUrl]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.globalCompositeOperation = 'destination-out';
    context.beginPath();
    context.arc(x, y, 40, 0, Math.PI * 2, false);
    context.fill();
  };

  return (
    <div style={{ position: 'relative', width: '500px', height: '500px' }} onDoubleClick={onNext}>
      <img src={resolvedImageUrl} alt="meme" width="500" height="500" style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }} />
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 2, cursor: 'crosshair' }}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={draw}
        onMouseLeave={stopDrawing}
      />
    </div>
  );
};

export default ScratchCard;

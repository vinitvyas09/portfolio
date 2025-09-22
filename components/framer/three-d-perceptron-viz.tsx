"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTheme } from 'next-themes';

interface Point3D {
  x: number;
  y: number;
  z: number;
  label: 'class1' | 'class2';
}

interface ThreeDPerceptronVizProps {
  config?: {
    dataset?: string;
    rotatable?: boolean;
    showPlane?: boolean;
    animatePlaneAdjustment?: boolean;
    features?: string[];
  };
}

const ThreeDPerceptronViz: React.FC<ThreeDPerceptronVizProps> = ({
  config = {
    dataset: "3d_classification",
    rotatable: true,
    showPlane: true,
    animatePlaneAdjustment: false,
    features: ["Height", "Weight", "Age"]
  }
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState({ x: -0.3, y: 0.5 });
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const isDark = mounted && theme === 'dark';

  // Generate sample 3D data points
  const generateData = useCallback((): Point3D[] => {
    const points: Point3D[] = [];
    const numPoints = 60;

    // Generate class 1 points (e.g., younger, lighter, shorter)
    for (let i = 0; i < numPoints / 2; i++) {
      points.push({
        x: Math.random() * 0.4 - 0.6, // Lower height
        y: Math.random() * 0.4 - 0.6, // Lower weight
        z: Math.random() * 0.4 - 0.6, // Lower age
        label: 'class1'
      });
    }

    // Generate class 2 points (e.g., older, heavier, taller)
    for (let i = 0; i < numPoints / 2; i++) {
      points.push({
        x: Math.random() * 0.4 + 0.2, // Higher height
        y: Math.random() * 0.4 + 0.2, // Higher weight
        z: Math.random() * 0.4 + 0.2, // Higher age
        label: 'class2'
      });
    }

    return points;
  }, []);

  const [data] = useState<Point3D[]>(generateData);

  // Set mounted state for hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // 3D to 2D projection
  const project = useCallback((point: { x: number; y: number; z: number }, rotationX: number, rotationY: number, canvasWidth: number, canvasHeight: number) => {
    // Rotate around Y axis
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    const x1 = point.x * cosY - point.z * sinY;
    const z1 = point.x * sinY + point.z * cosY;

    // Rotate around X axis
    const cosX = Math.cos(rotationX);
    const sinX = Math.sin(rotationX);
    const y1 = point.y * cosX - z1 * sinX;
    const z2 = point.y * sinX + z1 * cosX;

    // Simple perspective projection
    const scale = 200;
    const perspective = 1 / (1 + z2 * 0.3);

    return {
      x: canvasWidth / 2 + x1 * scale * perspective,
      y: canvasHeight / 2 - y1 * scale * perspective,
      scale: perspective
    };
  }, []);

  // Draw the scene
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = isDark ? '#0a0a0a' : '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Colors for classes
    const class1Color = isDark ? '#60a5fa' : '#3b82f6'; // Blue
    const class2Color = isDark ? '#f87171' : '#ef4444'; // Red
    const planeColor = isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.1)';
    const axisColor = isDark ? 'rgba(148, 163, 184, 0.3)' : 'rgba(148, 163, 184, 0.4)';

    // Draw axes
    const origin = project({ x: 0, y: 0, z: 0 }, rotation.x, rotation.y, width, height);
    const xAxis = project({ x: 0.8, y: 0, z: 0 }, rotation.x, rotation.y, width, height);
    const yAxis = project({ x: 0, y: 0.8, z: 0 }, rotation.x, rotation.y, width, height);
    const zAxis = project({ x: 0, y: 0, z: 0.8 }, rotation.x, rotation.y, width, height);

    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1;

    // X axis
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(xAxis.x, xAxis.y);
    ctx.stroke();

    // Y axis
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(yAxis.x, yAxis.y);
    ctx.stroke();

    // Z axis
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(zAxis.x, zAxis.y);
    ctx.stroke();

    // Draw separating plane if enabled
    if (config.showPlane) {
      const planePoints = [
        { x: -0.6, y: -0.6, z: 0 },
        { x: 0.6, y: -0.6, z: 0 },
        { x: 0.6, y: 0.6, z: 0 },
        { x: -0.6, y: 0.6, z: 0 }
      ];

      const projectedPlane = planePoints.map(p => project(p, rotation.x, rotation.y, width, height));

      ctx.fillStyle = planeColor;
      ctx.beginPath();
      ctx.moveTo(projectedPlane[0].x, projectedPlane[0].y);
      for (let i = 1; i < projectedPlane.length; i++) {
        ctx.lineTo(projectedPlane[i].x, projectedPlane[i].y);
      }
      ctx.closePath();
      ctx.fill();

      // Draw plane border
      ctx.strokeStyle = isDark ? 'rgba(148, 163, 184, 0.3)' : 'rgba(148, 163, 184, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Sort points by depth for proper rendering
    const sortedData = [...data].sort((a, b) => {
      const projA = project(a, rotation.x, rotation.y, width, height);
      const projB = project(b, rotation.x, rotation.y, width, height);
      return projA.scale - projB.scale;
    });

    // Draw data points
    sortedData.forEach(point => {
      const projected = project(point, rotation.x, rotation.y, width, height);
      const radius = 4 * projected.scale;

      ctx.beginPath();
      ctx.arc(projected.x, projected.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = point.label === 'class1' ? class1Color : class2Color;
      ctx.fill();

      // Add border for better visibility
      ctx.strokeStyle = isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw axis labels
    ctx.fillStyle = isDark ? 'rgba(148, 163, 184, 0.8)' : 'rgba(100, 116, 139, 0.8)';
    ctx.font = '12px system-ui, -apple-system, sans-serif';
    ctx.fillText(config.features?.[0] || 'X', xAxis.x + 5, xAxis.y);
    ctx.fillText(config.features?.[1] || 'Y', yAxis.x + 5, yAxis.y);
    ctx.fillText(config.features?.[2] || 'Z', zAxis.x + 5, zAxis.y);

  }, [data, rotation, isDark, project, config.showPlane, config.features]);

  // Animation loop for smooth rotation
  const animate = useCallback(() => {
    if (!config.rotatable || isDragging) {
      draw();
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    // Gentle auto-rotation when not dragging
    setRotation(prev => ({
      x: prev.x,
      y: prev.y + 0.003
    }));

    draw();
    animationRef.current = requestAnimationFrame(animate);
  }, [config.rotatable, isDragging, draw]);

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!config.rotatable) return;
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !config.rotatable) return;

    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;

    setRotation(prev => ({
      x: prev.x + deltaY * 0.01,
      y: prev.y + deltaX * 0.01
    }));

    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!config.rotatable) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setLastMousePos({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !config.rotatable) return;
    const touch = e.touches[0];

    const deltaX = touch.clientX - lastMousePos.x;
    const deltaY = touch.clientY - lastMousePos.y;

    setRotation(prev => ({
      x: prev.x + deltaY * 0.01,
      y: prev.y + deltaX * 0.01
    }));

    setLastMousePos({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Set up canvas and animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = 400;
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  return (
    <div className="w-full my-8">
      <div className="relative bg-background  rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className={`w-full ${config.rotatable ? 'cursor-grab active:cursor-grabbing' : ''}`}
          style={{ height: '400px' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${!mounted ? 'bg-blue-500' : (isDark ? 'bg-blue-400' : 'bg-blue-500')}`} />
            <span className="text-muted-foreground">Class 1</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${!mounted ? 'bg-red-500' : (isDark ? 'bg-red-400' : 'bg-red-500')}`} />
            <span className="text-muted-foreground">Class 2</span>
          </div>
        </div>

        {/* Plane indicator */}
        {config.showPlane && (
          <div className="absolute top-4 right-4 text-sm text-muted-foreground">
            Separating plane
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreeDPerceptronViz;
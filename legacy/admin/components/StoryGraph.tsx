
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Scene } from '../types';
import { AlertCircle, ImageOff, Flag, Maximize } from 'lucide-react';

interface StoryGraphProps {
  scenes: Scene[];
  selectedSceneId: string | null;
  onSceneSelect: (id: string) => void;
}

export const StoryGraph: React.FC<StoryGraphProps> = ({ scenes, selectedSceneId, onSceneSelect }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Validation Logic for visual indicators
  const getSceneStatus = (scene: Scene) => {
    const issues = [];
    if (!scene.segments || scene.segments.length === 0 || scene.segments.some(s => !s.image)) {
        issues.push('missing_image');
    }
    if (!scene.isEnding && scene.choices.length === 0) issues.push('dead_end');
    // Check for incoming links would require full graph traversal which is heavy for render loop, skipping for now
    return issues;
  };

  const edges = useMemo(() => {
    const connections: { from: {x: number, y: number}, to: {x: number, y: number}, id: string }[] = [];
    scenes.forEach(sourceScene => {
      sourceScene.choices.forEach(choice => {
        if (choice.targetSceneId) {
          const targetScene = scenes.find(s => s.id === choice.targetSceneId);
          if (targetScene && sourceScene.x !== undefined && sourceScene.y !== undefined && targetScene.x !== undefined && targetScene.y !== undefined) {
             connections.push({
               id: `${sourceScene.id}-${choice.id}`,
               from: { x: sourceScene.x + 80, y: sourceScene.y + 40 }, // Right-middle
               to: { x: targetScene.x - 80, y: targetScene.y + 40 }, // Left-middle
             });
          }
        }
      });
    });
    return connections;
  }, [scenes]);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
       e.preventDefault();
       const zoomSensitivity = 0.001;
       const newScale = Math.min(Math.max(0.2, scale - e.deltaY * zoomSensitivity), 3);
       setScale(newScale);
    } else {
       // Pan with wheel if not zooming
       setPosition(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag if clicking on background
    if ((e.target as HTMLElement).tagName === 'svg') {
      setIsDragging(true);
      setStartPan({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Center graph initially
  useEffect(() => {
    if (scenes.length > 0) {
       // Very basic centering
       setPosition({ x: 50, y: 50 });
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative group cursor-grab active:cursor-grabbing select-none"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
         <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-md text-xs font-medium shadow-sm text-gray-500 border border-gray-200">
          {(scale * 100).toFixed(0)}%
        </div>
        <button onClick={() => { setScale(1); setPosition({x:0, y:0}); }} className="bg-white/90 p-1.5 rounded-md shadow-sm border border-gray-200 hover:bg-gray-50 text-gray-500">
           <Maximize size={16} />
        </button>
      </div>
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
            backgroundImage: 'radial-gradient(#6B7280 1px, transparent 1px)',
            backgroundSize: `${20 * scale}px ${20 * scale}px`,
            backgroundPosition: `${position.x}px ${position.y}px`
        }}
      />

      <div 
         style={{ 
           transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
           transformOrigin: '0 0',
           width: '100%',
           height: '100%',
           transition: isDragging ? 'none' : 'transform 0.1s ease-out'
         }}
      >
        <svg className="overflow-visible" width="100%" height="100%">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
            </marker>
          </defs>

          {/* Connections */}
          {edges.map((edge) => (
            <path
              key={edge.id}
              d={`M ${edge.from.x} ${edge.from.y} C ${(edge.from.x + edge.to.x) / 2} ${edge.from.y}, ${(edge.from.x + edge.to.x) / 2} ${edge.to.y}, ${edge.to.x} ${edge.to.y}`}
              stroke="#9ca3af"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arrowhead)"
            />
          ))}

          {/* Nodes */}
          {scenes.map((scene) => {
             const isSelected = scene.id === selectedSceneId;
             const issues = getSceneStatus(scene);
             const hasError = issues.includes('dead_end');
             const hasMissingContent = issues.includes('missing_image');
             
             return (
               <g 
                  key={scene.id} 
                  transform={`translate(${scene.x || 0}, ${scene.y || 0})`}
                  onClick={(e) => { e.stopPropagation(); onSceneSelect(scene.id); }}
                  className="cursor-pointer transition-all duration-200"
                  style={{ opacity: isSelected ? 1 : 0.95 }}
               >
                  {/* Node Box */}
                  <rect 
                    x="-80" y="0" 
                    width="160" height="80" 
                    rx="8" 
                    fill={isSelected ? '#EEF2FF' : 'white'} 
                    stroke={isSelected ? '#4F46E5' : (hasError ? '#EF4444' : (hasMissingContent ? '#F59E0B' : '#E5E7EB'))} 
                    strokeWidth={isSelected || hasError ? 2 : 1}
                    className="shadow-sm hover:shadow-md transition-shadow"
                  />
                  
                  {/* Header Strip */}
                  <rect 
                    x="-80" y="0" width="160" height="24" rx="8" 
                    fill={scene.isEnding ? '#D1FAE5' : (scene.id === 'sc1' ? '#DBEAFE' : '#F3F4F6')} 
                    clipPath="inset(0 0 70% 0)" 
                  />

                  {/* Header Icon/Text */}
                  <text x="0" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill={scene.isEnding ? '#065F46' : '#374151'}>
                    {scene.isEnding ? `ฉากจบ: ${scene.endingType}` : (scene.id === 'sc1' ? 'จุดเริ่มต้น' : 'ฉากทั่วไป')}
                  </text>
                  
                  {/* Title */}
                  <text x="0" y="45" textAnchor="middle" fontSize="12" fontWeight="600" fill="#111827">
                    {scene.title.length > 18 ? scene.title.substring(0, 15) + '...' : scene.title}
                  </text>

                  {/* Stats */}
                   <text x="0" y="65" textAnchor="middle" fontSize="10" fill="#6B7280">
                    {scene.choices.length} ทางเลือก
                  </text>

                  {/* Issue Indicators */}
                  <g transform="translate(50, -5)">
                     {issues.includes('missing_image') && <ImageOff size={12} className="text-orange-500" x="0" />}
                     {issues.includes('dead_end') && <AlertCircle size={12} className="text-red-500" x="-14" />}
                  </g>
               </g>
             );
          })}
        </svg>
      </div>

      {/* Minimap (Mock) */}
      <div className="absolute bottom-4 left-4 w-32 h-20 bg-white/80 border border-gray-200 rounded-md shadow-sm overflow-hidden pointer-events-none opacity-70 hidden md:block">
         <svg width="100%" height="100%" viewBox="0 0 1000 600">
           {scenes.map(s => (
             <rect key={s.id} x={s.x} y={s.y} width="160" height="80" fill="#CBD5E1" />
           ))}
           {/* Viewport Rect (mock) */}
           <rect x="0" y="0" width="1000" height="600" fill="none" stroke="red" strokeWidth="20" />
         </svg>
      </div>
    </div>
  );
};

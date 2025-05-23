'use client';

import { Beaker } from 'lucide-react';

interface ExperimentalControlsProps {
  temperature: number;
  setTemperature: (value: number) => void;
  showPrompt: boolean;
  setShowPrompt: (value: boolean) => void;
}

export default function ExperimentalControls({ 
  temperature, 
  setTemperature,
  showPrompt,
  setShowPrompt
}: ExperimentalControlsProps) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Beaker className="h-4 w-4 text-purple-500" />
        <h3 className="text-sm font-medium text-gray-700">Experimental Controls</h3>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="temperature" className="block text-xs font-medium text-gray-700">
              Temperature: {temperature.toFixed(1)}
            </label>
            <span className="text-xs text-gray-500">
              {temperature < 0.7 ? 'More Focused' : temperature > 0.9 ? 'More Creative' : 'Balanced'}
            </span>
          </div>
          <input
            type="range"
            id="temperature"
            min="0.5"
            max="1.2"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0.5</span>
            <span>1.2</span>
          </div>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="showPrompt"
            checked={showPrompt}
            onChange={(e) => setShowPrompt(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="showPrompt" className="ml-2 block text-xs text-gray-700">
            Show generated prompt (for debugging)
          </label>
        </div>
      </div>
      
      <p className="mt-3 text-xs text-gray-500">
        These are experimental features that may affect the quality of generated content.
      </p>
    </div>
  );
} 
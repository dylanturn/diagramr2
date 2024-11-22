import React, { useEffect } from 'react';
import { Toolbar } from './components/Toolbar';
import { Canvas } from './components/Canvas';
import { LayersPanel } from './components/LayersPanel';
import { SavedShapesPanel } from './components/SavedShapesPanel';
import { Pencil } from 'lucide-react';
import { initDb } from './lib/db';

export default function App() {
  useEffect(() => {
    initDb().catch(console.error);
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Pencil className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-semibold text-gray-900">Diagram Tool</h1>
        </div>
        <div className="text-sm text-gray-500">
          Hold 'C' to connect • Double-click text to edit
        </div>
      </header>
      
      <main className="flex-1 relative overflow-hidden">
        <Toolbar />
        <Canvas />
        <LayersPanel />
        <SavedShapesPanel />
      </main>
    </div>
  );
}
import React from 'react';
import { Toolbar } from './components/Toolbar';
import { Canvas } from './components/Canvas';
import { Pencil } from 'lucide-react';

function App() {
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
      </main>
    </div>
  );
}

export default App;
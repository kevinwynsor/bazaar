'use client'
import { useState } from 'react';
import { InventoryTab } from '../components/InventoryTab';

export default function App() {
  const [activeTab, setActiveTab] = useState<'kevin' | 'aya'>('kevin');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="mb-6">Bazaar Inventory System</h1>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('kevin')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'kevin'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Kevin's Inventory
          </button>
          <button
            onClick={() => setActiveTab('aya')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'aya'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Aya's Inventory
          </button>
        </div>

        {/* Inventory Content */}
        <InventoryTab owner={activeTab} />
      </div>
    </div>
  );
}

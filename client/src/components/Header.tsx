import React from 'react';
import { Menu, Search, Settings, MoreVertical } from 'lucide-react';
import { useLeads } from '@/context/LeadContext';

const Header: React.FC = () => {
  const { searchTerm, setSearchTerm } = useLeads();

  return (
    <header className="bg-gray-900 text-white border-b border-gray-700 py-2">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-md hover:bg-gray-800 lg:hidden">
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center">
              <img src="https://www.ruralking.com/RKStorefrontAssetStore/images/type-icons/hcl-logo-footer.webp" alt="Rural King" className="h-6 w-auto mr-2" />
              <span className="text-amber-300 font-bold text-xl">Rural King</span>
              <span className="text-gray-300 ml-1 hidden md:inline">| Lead Pipeline</span>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="relative mx-2">
              <input 
                type="text" 
                placeholder="Search leads..." 
                className="bg-gray-800 text-gray-200 text-sm rounded-lg px-4 py-1.5 pl-8 w-44 md:w-60 focus:outline-none focus:ring-1 focus:ring-amber-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="h-4 w-4 text-gray-400 absolute left-2.5 top-2" />
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="p-1.5 rounded-md hover:bg-gray-800">
                <MoreVertical className="h-5 w-5" />
              </button>
              <button className="p-1.5 rounded-md hover:bg-gray-800">
                <Settings className="h-5 w-5" />
              </button>
              <div className="w-8 h-8 rounded-full bg-amber-300 text-gray-900 flex items-center justify-center font-medium">
                DR
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

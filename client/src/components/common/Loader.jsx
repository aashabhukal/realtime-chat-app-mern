// src/components/common/Loader.jsx
import { Loader2 } from 'lucide-react';

const Loader = ({ fullscreen = false, text = 'Loading...' }) => {
  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
          <p className="text-gray-500 text-sm">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-6">
      <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
    </div>
  );
};

export default Loader;
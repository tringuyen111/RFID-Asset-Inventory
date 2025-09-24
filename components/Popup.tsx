import React from 'react';

interface PopupProps {
  isVisible: boolean;
  title: string;
  message: React.ReactNode;
  onClose: () => void; // Always required for closing/canceling
  onConfirm?: () => void; // Optional confirm action
  buttonText?: string; // For single button
  cancelButtonText?: string; // For two buttons
  confirmButtonText?: string; // For two buttons
}

const Popup: React.FC<PopupProps> = ({
  isVisible,
  title,
  message,
  onClose,
  onConfirm,
  buttonText = 'OK',
  cancelButtonText = 'Hủy',
  confirmButtonText = 'Xác nhận'
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-xl p-6 m-4 max-w-sm w-full text-center transform transition-all scale-95 opacity-0 animate-fade-in-scale">
        <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
        <div className="text-gray-600 mb-6">{message}</div>
        <div className="flex items-center space-x-3 mt-6">
            {onConfirm && (
                 <button
                    onClick={onClose}
                    className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold text-lg hover:bg-gray-300 transition-colors"
                >
                    {cancelButtonText}
                </button>
            )}
            <button
                onClick={onConfirm ? onConfirm : onClose}
                className="w-full bg-[#3D3799] text-white py-3 rounded-lg font-semibold text-lg hover:bg-opacity-90 transition-colors"
            >
                {onConfirm ? confirmButtonText : buttonText}
            </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-scale {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Popup;
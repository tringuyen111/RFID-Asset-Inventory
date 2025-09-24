
import React from 'react';
import { useNavigation } from '../App';
import { ICONS } from '../constants';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  rightAccessory?: React.ReactNode;
  confirmOnBack?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, showBackButton = false, rightAccessory, confirmOnBack = true }) => {
  const { requestGoBack, goBack } = useNavigation();

  const handleBackClick = () => {
    if (confirmOnBack) {
      requestGoBack();
    } else {
      goBack();
    }
  };

  return (
    <header className="flex-shrink-0 bg-white h-24 flex items-end pb-4 px-4">
      <div className="w-full flex items-center justify-between relative">
        <div className="absolute left-0">
          {showBackButton && (
            <button onClick={handleBackClick} className="p-2 -ml-2 text-gray-800">
              <ICONS.backArrow />
            </button>
          )}
        </div>
        <h1 className="text-xl font-bold text-gray-800 text-center w-full">
          {title}
        </h1>
        <div className="absolute right-0">
          {rightAccessory}
        </div>
      </div>
    </header>
  );
};

export default Header;

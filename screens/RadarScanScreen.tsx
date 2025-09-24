
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation } from '../App';
import Layout from '../components/Layout';
import { EXISTING_EPCS } from '../services/data';

interface RadarScanScreenProps {
  onScanComplete: (epcs: string[]) => void;
  mockEpcs?: string[];
}

const RadarScanScreen: React.FC<RadarScanScreenProps> = ({ onScanComplete, mockEpcs }) => {
  const { goBack } = useNavigation();
  const [isScanning, setIsScanning] = useState(false);
  const [foundEpcs, setFoundEpcs] = useState<string[]>([]);
  
  const stopScan = useCallback(() => {
    setIsScanning(false);
    onScanComplete(foundEpcs);
    goBack();
  }, [foundEpcs, onScanComplete, goBack]);

  useEffect(() => {
    let scanInterval: ReturnType<typeof setInterval>;
    let scanTimer: ReturnType<typeof setTimeout>;

    if (isScanning) {
      // Simulate finding a mix of existing and new EPCs to demonstrate validation
      const simulatedFinds = mockEpcs || [
          ...Array.from(EXISTING_EPCS), // All 5 known invalid EPCs from the "system"
          ...Array.from({length: 4}, (_, i) => `3008-NEW-${i}`), // 4 new valid EPCs
      ];
      
      const shuffledFinds = simulatedFinds.sort(() => 0.5 - Math.random());
      let index = 0;

      scanInterval = setInterval(() => {
        if (index < shuffledFinds.length) {
            const newEpc = shuffledFinds[index];
            setFoundEpcs(prev => [...new Set([...prev, newEpc])]);
            index++;
        }
      }, 300); // Faster interval to find all items within timeout

      scanTimer = setTimeout(() => {
        clearInterval(scanInterval);
        setFoundEpcs(currentEpcs => {
            onScanComplete(currentEpcs);
            goBack();
            return currentEpcs;
        });
      }, 4000);
    }
    
    return () => {
        if (scanInterval) clearInterval(scanInterval);
        if (scanTimer) clearTimeout(scanTimer);
    };
  }, [isScanning, onScanComplete, goBack, mockEpcs]);
  
  const startScan = () => {
      setFoundEpcs([]); // Reset EPCs for new scan session
      setIsScanning(true);
  };

  return (
    <Layout>
      <div className="relative flex flex-col items-center justify-center h-full w-full bg-gray-900 text-white overflow-hidden">
        {/* Radar Animation */}
        <div className="relative flex items-center justify-center w-80 h-80">
          {/* Static circles */}
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute border border-green-500/30 rounded-full"
              style={{
                width: `${(i + 1) * 80}px`,
                height: `${(i + 1) * 80}px`,
              }}
            ></div>
          ))}
          {/* Pulsing circle */}
          {isScanning && (
            <div className="absolute w-80 h-80 rounded-full bg-green-500/20 animate-ping"></div>
          )}
          {/* Sweeping line */}
          {isScanning && (
             <div className="absolute w-full h-full animate-spin" style={{ animationDuration: '3s' }}>
                <div className="absolute top-1/2 -mt-px w-1/2 h-px bg-gradient-to-r from-transparent to-green-400"></div>
             </div>
          )}
          {/* Center */}
          <div className="absolute w-4 h-4 bg-green-400 rounded-full"></div>
        </div>
        
        <div className="absolute top-24 text-center z-10">
            <h1 className="text-2xl font-bold mb-2">
                {isScanning ? 'Scanning...' : 'Ready to Scan'}
            </h1>
            <p className="text-green-300">
                {isScanning ? `${foundEpcs.length} tags found` : 'Press Start to begin'}
            </p>
        </div>

        <div className="absolute bottom-10 w-full px-8 z-10">
            {isScanning ? (
                 <button
                    onClick={stopScan}
                    className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-red-700 transition-colors"
                >
                    Stop Scan
                </button>
            ) : (
                <button
                    onClick={startScan}
                    className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors"
                >
                    Start Scan
                </button>
            )}
        </div>
      </div>
    </Layout>
  );
};

export default RadarScanScreen;

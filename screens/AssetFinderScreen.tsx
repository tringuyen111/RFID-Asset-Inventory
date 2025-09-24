
import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import Header from '../components/Header';

interface AssetFinderScreenProps {
  epc: string;
  assetName: string;
}

const Radar = ({ isFinding, signalStrength }: { isFinding: boolean, signalStrength: number }) => {
    const bezelNumbers = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
    
    // Memoize target position to keep it stable between renders unless signal strength changes
    const targetPosition = useMemo(() => {
        if (!isFinding) return { x: 0, y: 0 };
        const distance = (1 - signalStrength / 100) * 40; // 40% is max distance from center
        const angle = Math.random() * 2 * Math.PI;
        return {
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance,
        };
    }, [signalStrength, isFinding]);

    const targetSize = 2 + (signalStrength / 100) * 10;
    const targetOpacity = 0.5 + (signalStrength / 100) * 0.5;

    return (
        <div className="relative w-full max-w-[300px] aspect-square">
            {/* Grid and Bezel */}
            <div className="absolute inset-0">
                <div className="w-full h-full relative flex items-center justify-center">
                    {/* Concentric Circles */}
                    {[1, 0.75, 0.5, 0.25].map(scale => (
                        <div key={scale} className="absolute rounded-full border border-blue-500/20" style={{ width: `${scale * 100}%`, height: `${scale * 100}%` }}></div>
                    ))}
                    {/* Radial Lines */}
                    {[0, 45, 90, 135].map(deg => (
                        <div key={deg} className="absolute w-full h-[1px] bg-blue-500/20" style={{ transform: `rotate(${deg}deg)` }}></div>
                    ))}
                </div>
            </div>

            {/* Bezel Numbers */}
            <div className="absolute inset-[-18px] border-2 border-blue-400/30 rounded-full">
                {bezelNumbers.map(deg => (
                    <div key={deg} className="absolute w-full h-full" style={{ transform: `rotate(${deg}deg)` }}>
                        <span className="absolute top-[-1px] left-1/2 -translate-x-1/2 text-xs text-blue-300">{String(deg).padStart(3, '0')}</span>
                    </div>
                ))}
            </div>

            {/* Scanner Sweep */}
            {isFinding && (
                <div className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: '4s' }}>
                    <div className="absolute inset-0"
                        style={{
                            background: 'conic-gradient(from 90deg, rgba(77, 192, 253, 0), rgba(77, 192, 253, 0.3) 30%, rgba(77, 192, 253, 0))',
                            clipPath: 'polygon(50% 50%, 0% 0%, 50% 0, 100% 0)',
                            transformOrigin: '50% 50%',
                            transform: 'rotate(-45deg)'
                        }}
                    ></div>
                </div>
            )}
            
            {/* Target Blip */}
            {isFinding && (
                <div 
                    className="absolute top-1/2 left-1/2 rounded-full bg-cyan-300 transition-all duration-300 ease-out"
                    style={{
                        width: `${targetSize}px`,
                        height: `${targetSize}px`,
                        transform: `translate(-50%, -50%) translate(${targetPosition.x}vw, ${targetPosition.y}vw)`,
                        opacity: targetOpacity,
                        boxShadow: `0 0 ${targetSize * 1.5}px ${targetSize/2}px rgba(100, 220, 255, 0.5)`,
                        animation: `pulse ${2 - signalStrength/100}s infinite`
                    }}
                ></div>
            )}
        </div>
    );
};


const AssetFinderScreen: React.FC<AssetFinderScreenProps> = ({ epc, assetName }) => {
  const [isFinding, setIsFinding] = useState(false);
  const [signalStrength, setSignalStrength] = useState(0); // 0 to 100

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isFinding) {
      setSignalStrength(Math.random() * 25); 

      interval = setInterval(() => {
        setSignalStrength(prev => {
          const trend = 0.7; 
          const fluctuation = Math.random() * 8;
          let change = Math.random() < trend ? fluctuation : -fluctuation/2;
          const newStrength = Math.max(0, Math.min(100, prev + change));
          return newStrength;
        });
      }, 400);
    } else {
      setSignalStrength(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isFinding]);

  const getSignalText = () => {
    if (!isFinding) return 'Nhấn nút để bắt đầu tìm';
    if (signalStrength > 85) return 'Tín hiệu rất mạnh!';
    if (signalStrength > 65) return 'Đang đến gần';
    if (signalStrength > 35) return 'Tín hiệu trung bình';
    return 'Tín hiệu yếu';
  }

  return (
    <Layout>
      <Header title="Định vị tài sản" showBackButton />
      <div 
        className="flex flex-col flex-grow items-center justify-between p-6 text-center text-white overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at center, #0a224a, #000c1a)' }}
      >
        <div className="w-full">
            <p className="text-blue-300">Đang tìm tài sản</p>
            <h2 className="text-2xl font-bold text-white mt-1">{assetName}</h2>
            <p className="font-mono text-blue-200 bg-blue-900/50 inline-block px-3 py-1 rounded-md mt-2 text-sm">{epc}</p>
        </div>
        
        <Radar isFinding={isFinding} signalStrength={signalStrength} />

        <div className="w-full">
            <p className="text-xl font-semibold text-blue-200 h-10">{getSignalText()}</p>
             <p className="font-mono text-gray-400">RSSI: {isFinding ? Math.round(signalStrength) : '--'}</p>
        </div>

        <div className="w-full px-4 mt-4">
            <button
                onClick={() => setIsFinding(!isFinding)}
                className={`w-full text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform active:scale-95 shadow-lg ${isFinding ? `bg-red-600 hover:bg-red-700 shadow-red-500/30` : `bg-blue-600 hover:bg-blue-700 shadow-blue-500/30`}`}
            >
                {isFinding ? 'Dừng tìm' : 'Bắt đầu tìm'}
            </button>
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 4s linear infinite;
        }
      `}</style>
    </Layout>
  );
};

export default AssetFinderScreen;

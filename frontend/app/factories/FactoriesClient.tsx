'use client';

import dynamic from 'next/dynamic';
import Navigation from '@/components/Navigation';

const FactoryMap = dynamic(
    () => import('@/components/map/FactoryMap'),
    { ssr: false, loading: () => <MapLoader /> }
);

function MapLoader() {
    return (
        <div className="flex items-center justify-center h-full w-full bg-gray-950">
            <div className="text-center space-y-4">
                <div className="relative mx-auto w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-green-500/20 animate-ping" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-green-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                    <div className="absolute inset-2 flex items-center justify-center text-2xl">🏭</div>
                </div>
                <p className="text-green-400 font-medium text-sm tracking-widest uppercase animate-pulse">
                    Loading Factory Map…
                </p>
            </div>
        </div>
    );
}

export default function FactoriesClient() {
    return (
        <>
            <Navigation />
            <main className="h-screen flex flex-col pt-[60px]">
                <div className="flex-1 relative overflow-hidden">
                    <FactoryMap />
                </div>
            </main>
        </>
    );
}

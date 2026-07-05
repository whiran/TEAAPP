import type { Metadata } from 'next';
import FactoriesClient from './FactoriesClient';

export const metadata: Metadata = {
    title: 'Tea Factory Intelligence Map | Ceylon Tea Intelligence',
    description: 'Explore all 1,055 registered tea factories across Sri Lanka. Filter by elevation, district, management type, and more on an interactive map.',
};

export default function FactoriesPage() {
    return <FactoriesClient />;
}

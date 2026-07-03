import { Bike } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Logo = () => (
  <Link to="/" className="flex items-center gap-2 text-gray-900">
    <Bike className="h-5 w-5 text-blue-500" />
    <span className="font-semibold">Cycle Tracker</span>
  </Link>
);

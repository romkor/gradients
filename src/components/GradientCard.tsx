import { Button } from 'react-aria-components';
import type { Gradient } from '../utils/gradient';
import { generateCss } from '../utils/gradient';

interface GradientCardProps {
  gradient: Gradient;
  onClick: () => void;
  onDelete: () => void;
}

export function GradientCard({ gradient, onClick, onDelete }: GradientCardProps) {
  const css = generateCss(gradient);

  return (
    <div className="group relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-gray-600 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl hover:scale-[1.02]">
      <div
        className="w-full h-36"
        style={{ background: css }}
        onClick={onClick}
      />
      <div className="p-3 flex items-center justify-between" onClick={onClick}>
        <div>
          <p className="text-white font-medium text-sm">{gradient.name}</p>
          <p className="text-gray-500 text-xs capitalize">{gradient.type} gradient</p>
        </div>
        <Button
          onPress={() => onDelete()}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-red-900/50 hover:bg-red-700 text-red-400 hover:text-white transition-all cursor-pointer text-sm"
          aria-label="Delete gradient"
        >
          🗑
        </Button>
      </div>
    </div>
  );
}

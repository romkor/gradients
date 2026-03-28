import { useState, useCallback } from 'react';
import {
  Button,
  TextField,
  Input,
  Label,
  Slider,
  SliderTrack,
  SliderThumb,
} from 'react-aria-components';
import type { Gradient, ColorStop, GradientType } from '../utils/gradient';
import { generateId, generateGradientName, generateCss } from '../utils/gradient';

interface GradientEditorProps {
  initial: Gradient;
  onSave: (gradient: Gradient) => void;
  onCancel: () => void;
}

export function GradientEditor({ initial, onSave, onCancel }: GradientEditorProps) {
  const [gradient, setGradient] = useState<Gradient>(initial);

  const css = generateCss(gradient);

  const updateName = (name: string) => setGradient(g => ({ ...g, name }));
  const updateType = (type: GradientType) => setGradient(g => ({ ...g, type }));
  const updateAngle = (angle: number) => setGradient(g => ({ ...g, angle }));

  const addStop = useCallback(() => {
    const newStop: ColorStop = {
      id: generateId(),
      color: '#ffffff',
      position: 50,
    };
    setGradient(g => ({
      ...g,
      stops: [...g.stops, newStop],
    }));
  }, []);

  const removeStop = useCallback((id: string) => {
    setGradient(g => ({
      ...g,
      stops: g.stops.filter(s => s.id !== id),
    }));
  }, []);

  const updateStop = useCallback((id: string, updates: Partial<ColorStop>) => {
    setGradient(g => ({
      ...g,
      stops: g.stops.map(s => s.id === id ? { ...s, ...updates } : s),
    }));
  }, []);

  const autoGenerateName = () => {
    const name = generateGradientName(gradient.stops);
    setGradient(g => ({ ...g, name }));
  };

  const handleSave = () => {
    onSave({ ...gradient, updatedAt: Date.now() });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Preview */}
      <div
        className="w-full h-48 rounded-2xl shadow-lg border border-white/20"
        style={{ background: css }}
      />

      {/* CSS output */}
      <div className="bg-gray-900 rounded-xl p-3 text-sm font-mono text-gray-300 break-all">
        {css}
      </div>

      {/* Name field */}
      <div className="flex gap-2 items-end">
        <TextField className="flex-1 flex flex-col gap-1" value={gradient.name} onChange={updateName}>
          <Label className="text-sm font-medium text-gray-300">Gradient Name</Label>
          <Input className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </TextField>
        <Button
          onPress={autoGenerateName}
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 transition-colors cursor-pointer"
        >
          ✨ Auto
        </Button>
      </div>

      {/* Gradient type */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-gray-300">Type</span>
        <div className="flex gap-2">
          {(['linear', 'radial', 'conic'] as GradientType[]).map(type => (
            <Button
              key={type}
              onPress={() => updateType(type)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors cursor-pointer ${
                gradient.type === type
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      {/* Angle slider - for linear and conic */}
      {(gradient.type === 'linear' || gradient.type === 'conic') && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-300">Angle</span>
            <span className="text-sm text-gray-400">{gradient.angle}°</span>
          </div>
          <Slider
            value={gradient.angle}
            onChange={updateAngle}
            minValue={0}
            maxValue={360}
            className="w-full"
          >
            <SliderTrack className="relative h-2 bg-gray-700 rounded-full w-full">
              <SliderThumb className="w-5 h-5 bg-indigo-500 rounded-full shadow-lg border-2 border-white focus:outline-none focus:ring-2 focus:ring-indigo-400 top-1/2" />
            </SliderTrack>
          </Slider>
        </div>
      )}

      {/* Color stops */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-300">Color Stops</span>
          <Button
            onPress={addStop}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
          >
            + Add Stop
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          {gradient.stops.map((stop) => (
            <div key={stop.id} className="flex items-center gap-3 bg-gray-800/50 p-3 rounded-xl">
              {/* Color picker */}
              <div className="relative">
                <div
                  className="w-10 h-10 rounded-lg border-2 border-gray-600 cursor-pointer overflow-hidden"
                  style={{ backgroundColor: stop.color }}
                >
                  <input
                    type="color"
                    value={stop.color}
                    onChange={e => updateStop(stop.id, { color: e.target.value })}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
              </div>

              {/* Color hex input */}
              <TextField
                className="flex flex-col"
                value={stop.color}
                onChange={v => updateStop(stop.id, { color: v })}
              >
                <Input className="bg-gray-900 border border-gray-600 rounded-lg px-2 py-1 text-white text-sm font-mono w-24 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </TextField>

              {/* Position slider */}
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Position</span>
                  <span>{stop.position}%</span>
                </div>
                <Slider
                  value={stop.position}
                  onChange={v => updateStop(stop.id, { position: v })}
                  minValue={0}
                  maxValue={100}
                  className="w-full"
                >
                  <SliderTrack className="relative h-2 bg-gray-700 rounded-full w-full">
                    <SliderThumb className="w-4 h-4 bg-indigo-500 rounded-full shadow border-2 border-white focus:outline-none focus:ring-2 focus:ring-indigo-400 top-1/2" />
                  </SliderTrack>
                </Slider>
              </div>

              {/* Remove button */}
              {gradient.stops.length > 2 && (
                <Button
                  onPress={() => removeStop(stop.id)}
                  className="text-gray-500 hover:text-red-400 transition-colors text-lg leading-none cursor-pointer"
                >
                  ×
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          onPress={onCancel}
          className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium transition-colors cursor-pointer"
        >
          Cancel
        </Button>
        <Button
          onPress={handleSave}
          className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors cursor-pointer"
        >
          Save Gradient
        </Button>
      </div>
    </div>
  );
}

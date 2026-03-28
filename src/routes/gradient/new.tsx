import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GradientEditor } from '../../components/GradientEditor';
import { saveGradientFn } from '../../server/gradients';
import { createDefaultGradient } from '../../utils/gradient';
import type { Gradient } from '../../utils/gradient';

export const Route = createFileRoute('/gradient/new')({
  component: NewGradient,
});

function NewGradient() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: (gradient: Gradient) => saveGradientFn({ data: gradient }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gradients'] });
      navigate({ to: '/' });
    },
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate({ to: '/' })}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-white">Create Gradient</h1>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <GradientEditor
            initial={createDefaultGradient()}
            onSave={gradient => saveMutation.mutate(gradient)}
            onCancel={() => navigate({ to: '/' })}
          />
        </div>
      </div>
    </div>
  );
}

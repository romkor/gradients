import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GradientEditor } from '../../components/GradientEditor';
import { getGradientFn, saveGradientFn } from '../../server/gradients';
import type { Gradient } from '../../utils/gradient';

export const Route = createFileRoute('/gradient/$id')({
  component: EditGradient,
});

function EditGradient() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: gradient, isLoading } = useQuery({
    queryKey: ['gradient', id],
    queryFn: () => getGradientFn({ data: id }),
  });

  const saveMutation = useMutation({
    mutationFn: (g: Gradient) => saveGradientFn({ data: g }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gradients'] });
      queryClient.invalidateQueries({ queryKey: ['gradient', id] });
      navigate({ to: '/' });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!gradient) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Gradient not found</p>
          <button
            onClick={() => navigate({ to: '/' })}
            className="text-indigo-400 hover:text-indigo-300 cursor-pointer"
          >
            Go back home
          </button>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-white">Edit Gradient</h1>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <GradientEditor
            initial={gradient}
            onSave={g => saveMutation.mutate(g)}
            onCancel={() => navigate({ to: '/' })}
          />
        </div>
      </div>
    </div>
  );
}

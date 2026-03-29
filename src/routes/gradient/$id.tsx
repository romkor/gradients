import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GradientEditor } from '../../components/GradientEditor';
import {
  saveGradientFn,
  publishGradientFn,
  unpublishGradientFn,
  gradientQueryOptions,
} from '../../server/gradients';
import type { Gradient } from '../../utils/gradient';

export const Route = createFileRoute('/gradient/$id')({
  loader: ({ context: { queryClient }, params: { id } }) =>
    queryClient.ensureQueryData(gradientQueryOptions(id)),
  component: EditGradient,
});

function EditGradient() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: gradient, isLoading } = useQuery(gradientQueryOptions(id));

  const saveMutation = useMutation({
    mutationFn: (g: Gradient) => saveGradientFn({ data: g }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gradients'] });
      queryClient.invalidateQueries({ queryKey: ['gradient', id] });
      navigate({ to: '/' });
    },
  });

  const publishMutation = useMutation({
    mutationFn: () => publishGradientFn({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gradients'] });
      queryClient.invalidateQueries({ queryKey: ['gradient', id] });
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: () => unpublishGradientFn({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gradients'] });
      queryClient.invalidateQueries({ queryKey: ['gradient', id] });
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
          <div className="ml-auto">
            {gradient.isPublished ? (
              <button
                onClick={() => unpublishMutation.mutate()}
                disabled={unpublishMutation.isPending}
                className="px-4 py-1.5 rounded-lg text-sm font-medium bg-gray-700 hover:bg-gray-600 text-white transition-colors disabled:opacity-50 cursor-pointer"
              >
                {unpublishMutation.isPending ? 'Unpublishing…' : 'Unpublish'}
              </button>
            ) : (
              <button
                onClick={() => publishMutation.mutate()}
                disabled={publishMutation.isPending}
                className="px-4 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50 cursor-pointer"
              >
                {publishMutation.isPending ? 'Publishing…' : 'Publish'}
              </button>
            )}
          </div>
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

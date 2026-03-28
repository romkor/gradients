import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from 'react-aria-components';
import { GradientCard } from '../components/GradientCard';
import { loadGradientsFn, deleteGradientFn } from '../server/gradients';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: gradients = [] } = useQuery({
    queryKey: ['gradients'],
    queryFn: () => loadGradientsFn(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteGradientFn({ data: id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gradients'] }),
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
              Gradients
            </h1>
            <p className="text-gray-400 mt-1">Your gradient collection</p>
          </div>
          <Button
            onPress={() => navigate({ to: '/gradient/new' })}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-2"
          >
            <span>+</span> Create New
          </Button>
        </div>

        {/* Gradient grid */}
        {gradients.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🎨</div>
            <h2 className="text-xl font-medium text-gray-300 mb-2">No gradients yet</h2>
            <p className="text-gray-500 mb-6">Create your first gradient to get started</p>
            <Button
              onPress={() => navigate({ to: '/gradient/new' })}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors cursor-pointer"
            >
              Create New Gradient
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gradients.map(gradient => (
              <GradientCard
                key={gradient.id}
                gradient={gradient}
                onClick={() => navigate({ to: '/gradient/$id', params: { id: gradient.id } })}
                onDelete={() => deleteMutation.mutate(gradient.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

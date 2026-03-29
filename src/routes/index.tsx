import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, GridList, Text } from 'react-aria-components';
import { GridListItemLink } from '../components/GridListItemLink';
import { deleteGradientFn, gradientsQueryOptions } from '../server/gradients';

export const Route = createFileRoute('/')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(gradientsQueryOptions()),
  component: Home,
});

function Home() {
  const queryClient = useQueryClient();

  const { data: gradients = [] } = useQuery(gradientsQueryOptions());

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
          <Link
            to="/gradient/new"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-2"
          >
            <span>+</span> Create New
          </Link>
        </div>

        {/* Gradient grid */}
        <GridList
          layout="grid"
          aria-label="Gradients"
          items={gradients}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          renderEmptyState={() => (
            <div className="col-span-full text-center py-24">
              <div className="text-6xl mb-4">🎨</div>
              <h2 className="text-xl font-medium text-gray-300 mb-2">No gradients yet</h2>
              <p className="text-gray-500 mb-6">Create your first gradient to get started</p>
              <Link
                to="/gradient/new"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors cursor-pointer"
              >
                Create New Gradient
              </Link>
            </div>
          )}
        >
          {gradient => (
            <GridListItemLink
              to="/gradient/$id"
              params={{ id: gradient.id }}
              preload="intent"
              textValue={gradient.name}
              className="relative rounded-2xl overflow-hidden border border-white/10 bg-gray-900 cursor-pointer outline-none [&[data-focus-visible]]:outline-2 [&[data-focus-visible]]:outline-indigo-500 [&[data-focus-visible]]:outline-offset-2"
            >
              <div
                className="h-32 w-full"
                style={{ background: `linear-gradient(${gradient.angle}deg, ${gradient.stops.map(s => s.color).join(', ')})` }}
              />
              <div className="p-3 flex items-center justify-between gap-2">
                <div>
                  <Text className="block font-medium text-white truncate">{gradient.name}</Text>
                  <Text slot="description" className="block text-xs text-gray-400 capitalize">{gradient.type}</Text>
                  <Text slot="description" className="block text-xs text-gray-500">By {gradient.creatorName ?? 'Anonymous'}</Text>
                </div>
                <Button
                  onPress={e => { e.continuePropagation(); deleteMutation.mutate(gradient.id); }}
                  aria-label="Delete gradient"
                  className="shrink-0 p-1.5 text-gray-400 hover:text-red-400 transition-colors cursor-pointer rounded"
                >
                  🗑
                </Button>
              </div>
            </GridListItemLink>
          )}
        </GridList>
      </div>
    </div>
  );
}

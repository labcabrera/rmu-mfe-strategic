import { ComponentProps, lazy, Suspense } from 'react';

const CharacterViewStatsChart = lazy(() => import('./CharacterViewStatsChart'));

/** Workspace spec 091, E4: the chart library is only loaded where a chart is shown. */
export default function LazyStatsChart(props: ComponentProps<typeof CharacterViewStatsChart>) {
  return (
    <Suspense fallback={null}>
      <CharacterViewStatsChart {...props} />
    </Suspense>
  );
}

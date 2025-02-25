import { MetricCard } from './metric-card';

export function MetricsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <MetricCard title="" value="" isLoading={true} />
      <MetricCard title="" value="" isLoading={true} />
      <MetricCard title="" value="" isLoading={true} />
    </div>
  );
}

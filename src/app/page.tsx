import KPICard from '@/components/KPICard';
import RunsChart from '@/components/RunsChart';
import RecentInvoicesFeed from '@/components/RecentInvoicesFeed';
import OverviewBottomStats from '@/components/OverviewBottomStats';

const kpis = [
  { label: 'Confidence', value: '99%', subtext: '350,853 samples' },
  { label: 'Coverage', value: '99.98%', subtext: '702,496 samples' },
  { label: 'Number of Invoices', value: '768,549', subtext: 'Processed invoices' },
  { label: 'Avg. run time', value: '4.7 sec', subtext: 'From trigger to action' },
  { label: 'Risk Control', value: '0.03%', subtext: '150 duplicates · 3 fraud · 75 mismatched' },
];

export default function OverviewPage() {
  return (
    <div className="p-6 flex flex-col gap-4 h-full">
      <div className="grid grid-cols-5 gap-4 flex-shrink-0">
        {kpis.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>
      <div className="grid grid-cols-[1fr_300px] gap-4 flex-1 min-h-0">
        <RunsChart />
        <RecentInvoicesFeed />
      </div>
      <OverviewBottomStats />
    </div>
  );
}

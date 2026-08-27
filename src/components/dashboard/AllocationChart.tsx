'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatRupiah } from '@/utils/format';

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface AllocationChartProps {
  data: ChartData[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg shadow-lg border border-zinc-100 dark:border-zinc-700">
        <p className="font-medium text-zinc-900 dark:text-zinc-100">{payload[0].name}</p>
        <p className="text-zinc-600 dark:text-zinc-300">{formatRupiah(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export default function AllocationChart({ data }: AllocationChartProps) {
  // Filter out 0 values so they don't clutter the chart
  const activeData = data.filter((item) => item.value > 0);

  if (activeData.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Belum ada data pengeluaran/alokasi</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 flex flex-col h-full">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Persentase Alokasi Finansial</h3>
      <div className="flex-1 min-h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={activeData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={110}
              paddingAngle={2}
              dataKey="value"
            >
              {activeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              iconType="circle"
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => <span className="text-sm text-zinc-600 dark:text-zinc-300">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

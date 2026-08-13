import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis } from
'recharts';
import { usePlanner } from '../../contexts/PlannerContext';
import { scoreTrend } from '../../utils/analytics';

export function ScoreTrendChart() {
  const { attempts } = usePlanner();
  const data = scoreTrend(attempts);
  const first = data[0]?.score ?? 0;
  const last = data[data.length - 1]?.score ?? 0;
  const delta = last - first;

  return (
    <section
      aria-labelledby="trend-heading"
      className="rounded-card border border-ink-line bg-paper-raised p-5">
      
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="trend-heading" className="text-sm font-medium text-ink">
          Quiz scores over time
        </h2>
        <p className="text-xs text-ink-muted">
          {delta >= 0 ? '+' : ''}
          {delta} pts across {data.length} attempts
        </p>
      </div>

      <div className="mt-4 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid stroke="#DAD4C7" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#6E7B74"
              tickLine={false}
              axisLine={false}
              fontSize={12} />
            
            <YAxis
              domain={[0, 100]}
              stroke="#6E7B74"
              tickLine={false}
              axisLine={false}
              fontSize={12} />
            
            <Tooltip
              cursor={{ stroke: '#DAD4C7' }}
              contentStyle={{
                background: '#FFFDF8',
                border: '1px solid #DAD4C7',
                borderRadius: 12,
                fontSize: 12,
                color: '#16211D'
              }}
              formatter={(value: number) => [`${value}%`, 'Score']} />
            
            <Line
              type="monotone"
              dataKey="score"
              stroke="#1F6B54"
              strokeWidth={2}
              dot={{ r: 3, fill: '#1F6B54', strokeWidth: 0 }}
              activeDot={{ r: 5 }} />
            
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>);

}
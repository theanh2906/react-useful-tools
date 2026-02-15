/**
 * @module TimeCalculatorPage
 * @description Date/time arithmetic tool for computing durations between two
 * date-times and adding/subtracting days from a base date.
 */
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { Card, Button, Input, Badge } from '@/components/ui';

/**
 * Breaks a millisecond duration into days, hours, minutes and seconds.
 *
 * @param ms - Duration in milliseconds (sign is ignored).
 * @returns Object with `days`, `hours`, `minutes`, `seconds`.
 */
function formatDuration(ms: number) {
  const totalSeconds = Math.floor(Math.abs(ms) / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

/**
 * Time calculator page.
 * Provides two tools: duration between two date-times and
 * date arithmetic (add/subtract days).
 */
export function TimeCalculatorPage() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const [baseDate, setBaseDate] = useState('');
  const [addDays, setAddDays] = useState(0);
  const [addHours, setAddHours] = useState(0);
  const [addMinutes, setAddMinutes] = useState(0);

  const diff = useMemo(() => {
    if (!start || !end) return null;
    const startDate = new Date(start);
    const endDate = new Date(end);
    return endDate.getTime() - startDate.getTime();
  }, [start, end]);

  const resultDate = useMemo(() => {
    if (!baseDate) return null;
    const date = new Date(baseDate);
    date.setDate(date.getDate() + addDays);
    date.setHours(date.getHours() + addHours);
    date.setMinutes(date.getMinutes() + addMinutes);
    return date;
  }, [baseDate, addDays, addHours, addMinutes]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-white">
          Time Calculator
        </h1>
        <p className="text-slate-400 mt-1">
          Calculate time differences and add/subtract time
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="primary">Difference</Badge>
          </div>

          <Input
            label="Start Date & Time"
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
          <Input
            label="End Date & Time"
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            {diff !== null ? (
              <div className="space-y-2">
                <p className="text-sm text-slate-400">Difference</p>
                <p className="text-xl font-bold text-white">
                  {formatDuration(diff).days}d {formatDuration(diff).hours}h{' '}
                  {formatDuration(diff).minutes}m {formatDuration(diff).seconds}
                  s
                </p>
                <p className="text-xs text-slate-500">
                  {diff >= 0 ? 'End is after start' : 'End is before start'}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Select both dates to calculate.
              </p>
            )}
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="primary">Add / Subtract</Badge>
          </div>

          <Input
            label="Base Date & Time"
            type="datetime-local"
            value={baseDate}
            onChange={(e) => setBaseDate(e.target.value)}
          />

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Days"
              type="number"
              value={addDays}
              onChange={(e) => setAddDays(Number(e.target.value))}
            />
            <Input
              label="Hours"
              type="number"
              value={addHours}
              onChange={(e) => setAddHours(Number(e.target.value))}
            />
            <Input
              label="Minutes"
              type="number"
              value={addMinutes}
              onChange={(e) => setAddMinutes(Number(e.target.value))}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setAddDays((d) => -Math.abs(d));
                setAddHours((h) => -Math.abs(h));
                setAddMinutes((m) => -Math.abs(m));
              }}
            >
              <Minus className="w-4 h-4" />
              Subtract
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setAddDays((d) => Math.abs(d));
                setAddHours((h) => Math.abs(h));
                setAddMinutes((m) => Math.abs(m));
              }}
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            {resultDate ? (
              <div>
                <p className="text-sm text-slate-400">Result</p>
                <p className="text-xl font-bold text-white">
                  {resultDate.toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Choose a base date to compute result.
              </p>
            )}
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

export default TimeCalculatorPage;

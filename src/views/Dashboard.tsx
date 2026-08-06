/**
 * @module Dashboard
 * @description Warm Family OS daily overview.
 */
'use client';

import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  Baby,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Lightbulb,
  MapPin,
  Plus,
  Utensils,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Card, DatePicker, Progress } from '@/components/ui';
import { SHOW_PREGNANCY_UI } from '@/config/constants';
import { listenPeanutRecords, listenSoyaRecords } from '@/services/babyService';
import { listenUltrasounds } from '@/services/ultrasoundService';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import { useEventsStore } from '@/stores/eventsStore';
import { useMealCheckInStore } from '@/stores/mealCheckInStore';
import { useNotesStore } from '@/stores/notesStore';
import { useSettingsStore } from '@/stores/settingsStore';
import type { EventData } from '@/types';

function formatLongDate(date: Date) {
  const value = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatEventTime(event: EventData) {
  if (event.allDay) return 'Cả ngày';
  return new Date(event.start).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;
  const getBabyAge = useAppStore((state) => state.getBabyAge);
  const babyBirthDate = useAppStore((state) => state.babyBirthDate);
  const setBabyBirthDate = useAppStore((state) => state.setBabyBirthDate);
  const saveProfile = useAppStore((state) => state.saveProfile);
  const { events, subscribeEvents } = useEventsStore();
  const { notes, subscribeNotes } = useNotesStore();
  const { cycleStats, checkIns, loadCycleData } = useMealCheckInStore();
  const dashboardLayout = useSettingsStore((state) => state.settings.dashboardLayout) || [];
  const [ultrasoundCount, setUltrasoundCount] = useState(0);
  const [peanutCount, setPeanutCount] = useState(0);
  const [soyaCount, setSoyaCount] = useState(0);
  const [draftBirthDate, setDraftBirthDate] = useState(babyBirthDate || '');

  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10);
  const babyAge = getBabyAge();
  const visibleSections = useMemo(
    () => new Set(dashboardLayout.filter((item) => item.visible).map((item) => item.id)),
    [dashboardLayout]
  );

  useEffect(() => {
    subscribeEvents();
    subscribeNotes();
  }, [subscribeEvents, subscribeNotes, userId]);

  useEffect(() => {
    if (userId) loadCycleData(userId);
  }, [loadCycleData, userId]);

  useEffect(() => {
    let stopUltrasounds: (() => void) | null = null;
    let stopPeanut: (() => void) | null = null;
    let stopSoya: (() => void) | null = null;

    if (SHOW_PREGNANCY_UI) {
      listenUltrasounds((records) => setUltrasoundCount(records.length)).then((stop) => {
        stopUltrasounds = stop;
      });
      listenSoyaRecords((records) => setSoyaCount(records.length)).then((stop) => {
        stopSoya = stop;
      });
    }
    listenPeanutRecords((records) => setPeanutCount(records.length)).then((stop) => {
      stopPeanut = stop;
    });

    return () => {
      stopUltrasounds?.();
      stopPeanut?.();
      stopSoya?.();
    };
  }, [userId]);

  const timelineEvents = useMemo(() => {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfToday = startOfToday + 24 * 60 * 60 * 1000;
    const todayEvents = events
      .filter((event) => {
        const time = new Date(event.start).getTime();
        return time >= startOfToday && time < endOfToday;
      })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    if (todayEvents.length > 0) return todayEvents.slice(0, 6);
    return events
      .filter((event) => new Date(event.start).getTime() >= startOfToday)
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .slice(0, 5);
  }, [events, now]);

  const nextEvent = timelineEvents[0];
  const latestNote = useMemo(
    () => [...notes].sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())[0],
    [notes]
  );
  const checkedInToday = checkIns.some((checkIn) => checkIn.date === todayKey);
  const developmentRecords = peanutCount + soyaCount;

  const saveBirthDate = async () => {
    if (!draftBirthDate) return;
    setBabyBirthDate(draftBirthDate);
    await saveProfile();
  };

  const rightRailSections = [...dashboardLayout]
    .filter((item) => item.visible && ['recent-activity', 'stats-grid', 'baby-age', 'todays-tip'].includes(item.id))
    .sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-5 lg:space-y-6">
      <section className="flex flex-col gap-4 border-b border-line pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500">
            <Lightbulb className="size-6" />
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Chào buổi sáng, {user?.displayName?.split(' ')[0] || 'bạn'}
            </h1>
            <p className="mt-1 text-sm text-muted">Cùng nhau tạo nên một ngày thật ý nghĩa.</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3 rounded-md border border-line bg-elevated px-4 py-2.5">
            <CalendarDays className="size-5 text-accent-500" />
            <span className="text-sm font-semibold text-foreground">{formatLongDate(now)}</span>
          </div>
          <Link href="/calendar" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary-500 px-5 text-sm font-semibold text-white hover:bg-primary-600">
            <Plus className="size-5" />
            Tạo hoạt động
          </Link>
        </div>
      </section>

      {visibleSections.has('quick-setup') && !babyBirthDate && (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="font-semibold text-foreground">Hoàn tất hồ sơ gia đình</h2>
              <p className="mt-1 text-sm text-muted">Thêm ngày sinh của bé để cá nhân hóa thông tin theo dõi.</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <div className="min-w-[240px]">
                <DatePicker value={draftBirthDate} onChange={setDraftBirthDate} placeholder="Chọn ngày sinh" maxDate={todayKey} />
              </div>
              <button type="button" className="btn-primary" onClick={saveBirthDate} disabled={!draftBirthDate}>
                Lưu hồ sơ
              </button>
            </div>
          </div>
        </section>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="overflow-hidden rounded-lg border border-line bg-elevated">
          <header className="flex items-center justify-between border-b border-line bg-accent-50/70 px-5 py-4">
            <div className="flex items-center gap-3">
              <Activity className="size-5 text-accent-500" />
              <h2 className="text-lg font-semibold text-accent-600">Nhịp sống hôm nay</h2>
            </div>
            <Link href="/calendar" className="text-sm font-semibold text-accent-600 hover:text-accent-700">
              Xem lịch
            </Link>
          </header>

          <div className="divide-y divide-line">
            {timelineEvents.length > 0 ? (
              timelineEvents.map((event, index) => (
                <div key={event.id || `${event.start}-${index}`} className="grid grid-cols-[64px_1fr] gap-3 px-4 py-4 sm:grid-cols-[76px_44px_1fr_auto] sm:items-center sm:px-5">
                  <time className="text-sm font-semibold text-foreground">{formatEventTime(event)}</time>
                  <span className="hidden size-10 items-center justify-center rounded-full bg-accent-50 text-accent-500 sm:flex">
                    <CalendarDays className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{event.title}</p>
                    <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted">
                      {event.location ? <><MapPin className="size-3.5" />{event.location}</> : event.notes || 'Hoạt động gia đình'}
                    </p>
                  </div>
                  <span className="col-start-2 mt-2 w-fit rounded-full bg-accent-50 px-2.5 py-1 text-xs font-medium text-accent-600 sm:col-auto sm:mt-0">
                    {new Date(event.start).toDateString() === now.toDateString() ? 'Hôm nay' : 'Sắp tới'}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-5 py-12 text-center">
                <CalendarDays className="mx-auto size-9 text-slate-300" />
                <p className="mt-3 font-medium text-foreground">Hôm nay chưa có hoạt động.</p>
                <p className="mt-1 text-sm text-muted">Tạo một sự kiện để bắt đầu nhịp sống gia đình.</p>
              </div>
            )}

            {userId && (
              <div className="grid grid-cols-[64px_1fr] gap-3 px-4 py-4 sm:grid-cols-[76px_44px_1fr_auto] sm:items-center sm:px-5">
                <span className="text-sm font-semibold text-foreground">Bữa ăn</span>
                <span className="hidden size-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 sm:flex">
                  <Utensils className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Check-in bữa ăn hôm nay</p>
                  <p className="mt-1 text-xs text-muted">Theo dõi đều đặn trong chu kỳ hiện tại</p>
                </div>
                <Link
                  href="/meal-checkin"
                  className={`col-start-2 mt-2 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold sm:col-auto sm:mt-0 ${
                    checkedInToday ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {checkedInToday && <CheckCircle2 className="size-3.5" />}
                  {checkedInToday ? 'Đã check-in' : 'Chưa check-in'}
                </Link>
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          {rightRailSections.map((section) => {
            if (section.id === 'recent-activity') {
              return (
                <Card key={section.id} className="overflow-hidden">
                  <div className="border-b border-line px-5 py-4">
                    <h2 className="flex items-center gap-2 font-semibold text-foreground">
                      <CalendarDays className="size-5 text-accent-500" /> Sự kiện tiếp theo
                    </h2>
                  </div>
                  {nextEvent ? (
                    <div className="p-5">
                      <p className="text-xs font-medium text-muted">{new Date(nextEvent.start).toLocaleString('vi-VN')}</p>
                      <p className="mt-2 font-semibold text-foreground">{nextEvent.title}</p>
                      {nextEvent.location && <p className="mt-2 flex items-center gap-1 text-sm text-muted"><MapPin className="size-4" />{nextEvent.location}</p>}
                      <Link href="/calendar" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent-600">Xem chi tiết <ArrowRight className="size-4" /></Link>
                    </div>
                  ) : (
                    <p className="p-5 text-sm text-muted">Chưa có sự kiện sắp tới.</p>
                  )}
                </Card>
              );
            }

            if (section.id === 'stats-grid') {
              return (
                <Card key={section.id} className="p-5">
                  <h2 className="flex items-center gap-2 font-semibold text-foreground"><CheckCircle2 className="size-5 text-emerald-600" /> Tiến độ chu kỳ bữa ăn</h2>
                  {cycleStats ? (
                    <>
                      <p className="mt-5 text-2xl font-bold text-emerald-600">{cycleStats.checkedInDays} / {cycleStats.totalCycleDays}</p>
                      <p className="mt-1 text-sm text-muted">{cycleStats.percentage}% hoàn thành</p>
                      <Progress value={cycleStats.percentage} variant="success" className="mt-4" />
                      <Link href="/meal-checkin" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent-600">Xem chu kỳ <ArrowRight className="size-4" /></Link>
                    </>
                  ) : (
                    <p className="mt-3 text-sm text-muted">Đăng nhập để xem tiến độ check-in.</p>
                  )}
                </Card>
              );
            }

            if (section.id === 'baby-age' && babyAge) {
              return (
                <Card key={section.id} className="p-5">
                  <h2 className="flex items-center gap-2 font-semibold text-foreground"><Baby className="size-5 text-primary-500" /> Theo dõi bé</h2>
                  <div className="mt-4 grid grid-cols-3 divide-x divide-line text-center">
                    <div><p className="text-xl font-bold text-foreground">{babyAge.days}</p><p className="text-xs text-muted">Ngày</p></div>
                    <div><p className="text-xl font-bold text-foreground">{babyAge.weeks}</p><p className="text-xs text-muted">Tuần</p></div>
                    <div><p className="text-xl font-bold text-foreground">{babyAge.months}</p><p className="text-xs text-muted">Tháng</p></div>
                  </div>
                  <p className="mt-4 text-xs text-muted">{developmentRecords} bản ghi phát triển{SHOW_PREGNANCY_UI ? ` · ${ultrasoundCount} siêu âm` : ''}</p>
                </Card>
              );
            }

            if (section.id === 'todays-tip') {
              return (
                <Card key={section.id} className="border-amber-200 bg-amber-50 p-5">
                  <h2 className="flex items-center gap-2 font-semibold text-foreground"><Lightbulb className="size-5 text-amber-500" /> Mẹo nhỏ cho gia đình</h2>
                  <p className="mt-3 text-sm leading-6 text-muted">Dành một khoảng ngắn để cả nhà cùng ăn và chia sẻ về ngày hôm nay.</p>
                </Card>
              );
            }

            return null;
          })}

          {latestNote && (
            <Card className="p-5">
              <h2 className="flex items-center gap-2 font-semibold text-foreground"><FileText className="size-5 text-amber-500" /> Ghi chú gần đây</h2>
              <p className="mt-3 truncate text-sm font-semibold text-foreground">{latestNote.title}</p>
              <p className="mt-1 text-xs text-muted">{new Date(latestNote.createdDate).toLocaleString('vi-VN')}</p>
              <Link href="/notes" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent-600">Mở ghi chú <ArrowRight className="size-4" /></Link>
            </Card>
          )}
        </aside>
      </div>

      {visibleSections.has('quick-actions') && (
        <section className="border-t border-line pt-5">
          <div className="flex flex-wrap gap-2">
            {[
              { href: '/calendar', label: 'Lịch gia đình', icon: CalendarDays },
              { href: '/meal-checkin', label: 'Meal Check-in', icon: Utensils },
              { href: '/notes', label: 'Ghi chú', icon: FileText },
              { href: '/baby', label: 'Theo dõi bé', icon: Baby },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-line bg-elevated px-3 text-sm font-medium text-foreground hover:bg-surface">
                <item.icon className="size-4 text-accent-500" />
                {item.label}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default Dashboard;

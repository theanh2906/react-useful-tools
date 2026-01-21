import { createItem, listenCollection } from './realtimeDb';

export type TimelineEvent = {
  id?: string;
  title: string;
  date: string;
  description: string;
  type: 'checkup' | 'milestone' | 'ultrasound' | 'note';
};

const TIMELINE_PATH = 'timeline';

export const listenTimeline = (onChange: (events: TimelineEvent[]) => void) => {
  return listenCollection<TimelineEvent>(TIMELINE_PATH, onChange);
};

export const addTimelineEvent = async (event: TimelineEvent) => {
  return createItem(TIMELINE_PATH, event);
};

import { format, eachDayOfInterval } from 'date-fns';
import type { MealCheckIn, MealCheckInCycleConfig, MealCheckInCycleStats } from '../types';

const compressImageToBase64 = async (url: string): Promise<string> => {
   return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
         const canvas = document.createElement('canvas');
         const MAX_WIDTH = 800; // Resize to reasonable size
         const scale = Math.min(1, MAX_WIDTH / img.width);
         canvas.width = img.width * scale;
         canvas.height = img.height * scale;
         const ctx = canvas.getContext('2d');
         if (!ctx) {
           resolve(url);
           return;
         }
         ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
         resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.onerror = () => {
         resolve(url); // fallback
      };
      img.src = url;
   });
};

export const exportCalendarToHTML = async (
  cycleConfig: MealCheckInCycleConfig,
  cycleStats: MealCheckInCycleStats,
  checkIns: MealCheckIn[]
): Promise<void> => {
  const checkInsWithBase64 = await Promise.all(
    checkIns.map(async (c) => ({
      ...c,
      base64Image: await compressImageToBase64(c.imageUrl),
    }))
  );

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const currentMonthDates = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOfWeek = currentMonthDates[0].getDay();
  const leadingEmpty = Array.from({ length: firstDayOfWeek }, () => null);
  const total = leadingEmpty.length + currentMonthDates.length;
  const trailingCount = total % 7 === 0 ? 0 : 7 - (total % 7);
  const trailingEmpty = Array.from({ length: trailingCount }, () => null);
  const calendarCells = [...leadingEmpty, ...currentMonthDates, ...trailingEmpty];

  const hasCheckIn = (dateStr: string) => checkInsWithBase64.some(c => c.date === dateStr);
  
  const isOutsideCycleDate = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    if (hasCheckIn(dateStr)) return false;
    if (dateStr < cycleConfig.startDate) return true;
    if (cycleStats.checkedInDays >= cycleConfig.cycleDays) return true;
    return false;
  };
  
  const isTodayDate = (date: Date): boolean => format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  const isFutureDateObj = (date: Date): boolean => format(date, 'yyyy-MM-dd') > format(new Date(), 'yyyy-MM-dd');

  const checkInsData = checkInsWithBase64.reduce((acc, c) => {
    acc[c.date] = { date: c.date, imageUrl: c.base64Image, notes: c.notes || '' };
    return acc;
  }, {} as Record<string, any>);

  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const cellsHtml = calendarCells.map((dateObj) => {
    if (!dateObj) {
      return `<div class="aspect-square rounded-lg border border-transparent"></div>`;
    }
    const dateStr = format(dateObj, 'yyyy-MM-dd');
    const checked = hasCheckIn(dateStr);
    const today = isTodayDate(dateObj);
    const future = isFutureDateObj(dateObj);
    const outsideCycle = isOutsideCycleDate(dateObj);
    const disabled = future || outsideCycle;
    const clickable = checked && !disabled;

    let classes = 'aspect-square rounded-lg border-2 transition-all duration-200 relative flex items-center justify-center p-2 ';
    
    if (today) classes += 'border-blue-500 ';
    else classes += 'border-gray-200 ';

    if (checked) classes += 'bg-green-500 text-white ';
    else classes += 'bg-white ';

    if (disabled) classes += 'opacity-40 cursor-not-allowed ';
    
    if (clickable) classes += 'hover:shadow-md cursor-pointer hover:border-blue-400 ';
    else classes += 'cursor-default ';

    return `
      <button 
        class="${classes}" 
        ${clickable ? `onclick="openModal('${dateStr}')"` : 'disabled'}
      >
        <span class="text-lg font-semibold">${dateObj.getDate()}</span>
        ${checked ? `<svg class="w-4 h-4 absolute bottom-1 right-1 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>` : ''}
      </button>
    `;
  }).join('');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meal Check-In Export</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      body { background-color: #f9fafb; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"; }
    </style>
</head>
<body class="min-h-screen bg-gray-50 text-gray-900">
  <div class="container mx-auto p-4 max-w-4xl">
    <div class="mb-4 flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg px-4 py-2 text-sm">
      <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
      <span>This is an exported read-only view of the Meal Check-In calendar.</span>
    </div>

    <div class="mb-6">
      <h1 class="text-3xl font-bold mb-2">Meal Check-in</h1>
      <p class="text-gray-600">Track your daily meals.</p>
    </div>

    <!-- Stats Card -->
    <div class="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-6 shadow-sm">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold mb-1">Cycle Progress</h3>
          <p class="text-3xl font-bold text-green-600">${cycleStats.checkedInDays} / ${cycleStats.totalCycleDays}</p>
          <p class="text-sm text-gray-600 mt-1">${cycleStats.percentage}% Complete</p>
        </div>
        <div class="h-20 w-20 rounded-full border-4 border-green-600 flex items-center justify-center">
          <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
      </div>
      <div class="mt-4 bg-gray-200 rounded-full h-3 overflow-hidden">
        <div class="bg-green-600 h-full transition-all duration-500" style="width: ${cycleStats.percentage}%"></div>
      </div>
    </div>

    <!-- Calendar -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h2 class="text-xl font-bold flex items-center gap-2">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          Cycle Started: ${format(new Date(cycleConfig.startDate + 'T00:00:00'), 'MMM d, yyyy')}
        </h2>
      </div>

      <div class="grid grid-cols-7 gap-2 mb-2">
        ${weekdayLabels.map(l => `<div class="text-center text-xs sm:text-sm font-semibold text-gray-500 py-1">${l}</div>`).join('')}
      </div>

      <div class="grid grid-cols-7 gap-2">
        ${cellsHtml}
      </div>
    </div>
  </div>

  <!-- Modal Template -->
  <div id="imageModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 hidden opacity-0 transition-opacity duration-300">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden transform scale-95 transition-transform duration-300" id="modalContent">
      <div class="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 class="text-lg font-semibold">View Check-in</h3>
        <button onclick="closeModal()" class="p-1 rounded-lg hover:bg-gray-100 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      <div class="p-4 space-y-4">
        <p class="text-sm text-gray-600">Date: <span class="font-semibold" id="modalDate"></span></p>
        <img id="modalImage" src="" alt="Check-in" class="w-full rounded-lg" />
        <div id="modalNotesContainer" class="hidden">
           <h4 class="font-semibold mb-2">Notes:</h4>
           <p id="modalNotes" class="text-gray-700 bg-gray-50 p-3 rounded-lg"></p>
        </div>
        <button onclick="closeModal()" class="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors">
          Close
        </button>
      </div>
    </div>
  </div>

  <script>
    const checkInsData = ${JSON.stringify(checkInsData)};
    const modal = document.getElementById('imageModal');
    const modalContent = document.getElementById('modalContent');
    const modalDate = document.getElementById('modalDate');
    const modalImage = document.getElementById('modalImage');
    const modalNotesContainer = document.getElementById('modalNotesContainer');
    const modalNotes = document.getElementById('modalNotes');

    function openModal(dateStr) {
      const data = checkInsData[dateStr];
      if (!data) return;

      modalDate.textContent = data.date;
      modalImage.src = data.imageUrl;
      
      if (data.notes) {
        modalNotes.textContent = data.notes;
        modalNotesContainer.classList.remove('hidden');
      } else {
        modalNotesContainer.classList.add('hidden');
      }

      modal.classList.remove('hidden');
      // trigger reflow
      void modal.offsetWidth;
      modal.classList.remove('opacity-0');
      modalContent.classList.remove('scale-95');
    }

    function closeModal() {
      modal.classList.add('opacity-0');
      modalContent.classList.add('scale-95');
      setTimeout(() => {
        modal.classList.add('hidden');
        modalImage.src = '';
      }, 300);
    }
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  </script>
</body>
</html>
  `;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `meal-calendar-${format(new Date(), 'yyyy-MM-dd')}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

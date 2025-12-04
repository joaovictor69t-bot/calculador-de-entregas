import { WorkRecord, DailyRecord, NormalRecord } from './types';

// Currency Formatter
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
  }).format(value);
};

// Date Formatter (DD/MM/YYYY)
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

// Month Year Formatter (e.g., "Outubro 2023")
export const formatMonthYear = (yearMonth: string): string => {
  // yearMonth format: "YYYY-MM"
  const [year, month] = yearMonth.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  const formatted = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(date);
  // Capitalize first letter
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

// Logic: Normal Mode
export const calculateNormal = (parcels: number, collections: number): number => {
  const parcelRate = 1.00;
  const collectionRate = 0.80;
  return (parcels * parcelRate) + (collections * collectionRate);
};

// Logic: Daily Mode (Diária)
export const calculateDaily = (numberOfIds: 1 | 2, parcelCount: number): { value: number; label: string } => {
  if (numberOfIds === 1) {
    return { value: 180, label: 'Etapa 1 (1 ID)' };
  }

  // 2 IDs logic
  if (parcelCount < 150) {
    return { value: 260, label: 'Etapa 2 (<150 pcts)' };
  } else if (parcelCount <= 250) {
    return { value: 300, label: 'Etapa 3 (150-250 pcts)' };
  } else {
    return { value: 360, label: 'Etapa 4 (>250 pcts)' };
  }
};

// Image Compressor (to save LocalStorage space)
export const compressImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600; // Resize to max width 600px
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Compress to JPEG at 0.7 quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(dataUrl);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

// CSV Export
export const downloadCSV = (records: WorkRecord[]) => {
  const headers = ['Data', 'Modo', 'IDs', 'Parcelas', 'Coletas', 'Valor (£)'];
  
  const csvContent = [
    headers.join(','),
    ...records.map(r => {
      const ids = r.mode === 'NORMAL' ? (r as NormalRecord).routeId : (r as DailyRecord).routeIds.join(' + ');
      const parcels = r.mode === 'NORMAL' ? (r as NormalRecord).parcelCount : (r as DailyRecord).parcelCount;
      const collections = r.mode === 'NORMAL' ? (r as NormalRecord).collectionCount : '-';
      
      return [
        r.date,
        r.mode,
        `"${ids}"`, // Quote IDs in case of spaces
        parcels,
        collections,
        r.totalValue.toFixed(2)
      ].join(',');
    })
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `driver_log_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
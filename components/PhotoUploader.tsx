import React, { useRef, useState } from 'react';
import { Camera, X, Image as ImageIcon } from 'lucide-react';
import { compressImage } from '../utils';

interface PhotoUploaderProps {
  onPhotosChange: (photos: string[]) => void;
  currentPhotos: string[];
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({ onPhotosChange, currentPhotos }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsProcessing(true);
      try {
        const newPhotos: string[] = [];
        // Limit to 3 photos max for demo storage reasons
        const remainingSlots = 3 - currentPhotos.length;
        const filesToProcess = Array.from(e.target.files).slice(0, remainingSlots) as File[];

        for (const file of filesToProcess) {
          const compressed = await compressImage(file);
          newPhotos.push(compressed);
        }
        
        onPhotosChange([...currentPhotos, ...newPhotos]);
      } catch (error) {
        console.error("Error processing image", error);
        alert("Erro ao processar imagem.");
      } finally {
        setIsProcessing(false);
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const removePhoto = (index: number) => {
    const updated = currentPhotos.filter((_, i) => i !== index);
    onPhotosChange(updated);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">Comprovantes (Prints)</label>
      
      <div className="flex flex-wrap gap-2">
        {currentPhotos.map((photo, index) => (
          <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
            <img src={photo} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removePhoto(index)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {currentPhotos.length < 3 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-colors bg-white"
          >
            {isProcessing ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            ) : (
              <>
                <Camera size={24} />
                <span className="text-[10px] mt-1 font-medium">Add Foto</span>
              </>
            )}
          </button>
        )}
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        className="hidden"
      />
      <p className="text-xs text-slate-500">Máx: 3 fotos.</p>
    </div>
  );
};
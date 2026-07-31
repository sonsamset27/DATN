import { CheckCircle2, Loader2 } from 'lucide-react';

export default function ProgressStep({ isActive, isCompleted, title, description }) {
  return (
    <div className={`flex gap-4 ${!isActive && !isCompleted ? 'opacity-40' : ''}`}>
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${isCompleted ? 'bg-success border-success text-white' : isActive ? 'border-primary text-primary' : 'border-gray-300 text-gray-300'}`}>
          {isCompleted ? <CheckCircle2 size={16} /> : isActive ? <Loader2 size={16} className="animate-spin" /> : <div className="w-2 h-2 rounded-full bg-gray-300"></div>}
        </div>
        <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 my-1"></div>
      </div>
      <div className="pb-6">
        <h4 className={`font-semibold ${isActive ? 'text-primary' : isCompleted ? 'text-success' : 'text-gray-500'}`}>{title}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
      </div>
    </div>
  );
}

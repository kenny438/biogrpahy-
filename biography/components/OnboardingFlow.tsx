import React, { useState } from 'react';
import { ArrowRight, LayoutGrid, Palette, User, MapPin, AlignLeft, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { ProfileData, ProfileTheme } from '../types';
import { generateInitialProfile } from '../services/geminiService';

interface OnboardingFlowProps {
  onComplete: (data: ProfileData) => void;
  isSaving?: boolean;
}

const ThemeCard = ({ name, selected, onClick, previewClass }: any) => (
  <button 
    onClick={onClick}
    className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 ${selected ? 'border-black bg-gray-50 ring-1 ring-black scale-[1.02]' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}
  >
    <div className={`h-16 w-full mb-3 ${previewClass} shadow-sm`}></div>
    <span className={`font-bold ${selected ? 'text-black' : 'text-gray-500'}`}>{name}</span>
  </button>
);

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, isSaving = false }) => {
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    location: '',
    bio: '',
    theme: 'monochrome' as ProfileTheme
  });

  const totalSteps = 3;

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Create profile manually without AI
      const profile = generateInitialProfile(
        formData.name,
        formData.role,
        formData.location,
        formData.bio,
        formData.theme
      );
      onComplete(profile);
    }
  };

  const handleThemeSelect = (t: ProfileTheme) => {
    setFormData(prev => ({ ...prev, theme: t }));
  };

  if (isSaving) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
        <div className="relative">
           <div className="absolute inset-0 bg-white/20 blur-xl rounded-full animate-pulse"></div>
           <LayoutGrid className="w-16 h-16 text-white relative z-10 animate-bounce" />
        </div>
        <h2 className="text-2xl font-bold text-white mt-8 mb-2">
          Setting up your space...
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col min-h-[600px] relative">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gray-100">
           <div 
             className="h-full bg-black transition-all duration-500 ease-out" 
             style={{ width: `${(step / totalSteps) * 100}%` }}
           ></div>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 md:p-12 flex flex-col">
          
          <div className="mb-8">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Step {step} of {totalSteps}</span>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter mt-2 text-black">
              {step === 1 && "Identity"}
              {step === 2 && "Details"}
              {step === 3 && "Aesthetic"}
            </h1>
            <p className="text-gray-500 font-medium mt-2">
               {step === 1 && "What should we call you?"}
               {step === 2 && "Tell us a bit more about yourself."}
               {step === 3 && "Choose a vibe for your page."}
            </p>
          </div>

          <div className="flex-1">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                <div className="space-y-4">
                  <Input 
                    label="Display Name" 
                    placeholder="e.g. Jordan Lee"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="text-lg py-4"
                    autoFocus
                  />
                  <Input 
                    label="Role / Title" 
                    placeholder="e.g. Visual Artist"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="text-lg py-4"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                <div className="space-y-4">
                  <Input 
                    label="Location" 
                    placeholder="e.g. New York, NY"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="text-lg py-4"
                    autoFocus
                  />
                  <div className="flex flex-col gap-1.5 w-full">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">Short Bio</label>
                      <textarea
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all text-lg resize-none h-32"
                        placeholder="I create things for the web..."
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-8 duration-300 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                 <ThemeCard 
                    name="Monochrome" 
                    selected={formData.theme === 'monochrome'} 
                    onClick={() => handleThemeSelect('monochrome')}
                    previewClass="bg-gray-900 rounded-lg"
                 />
                 <ThemeCard 
                    name="Swiss" 
                    selected={formData.theme === 'swiss'} 
                    onClick={() => handleThemeSelect('swiss')}
                    previewClass="bg-white border border-black rounded-sm"
                 />
                 <ThemeCard 
                    name="Cyberpunk" 
                    selected={formData.theme === 'cyberpunk'} 
                    onClick={() => handleThemeSelect('cyberpunk')}
                    previewClass="bg-black border border-cyan-400"
                 />
                 <ThemeCard 
                    name="Y2K" 
                    selected={formData.theme === 'y2k'} 
                    onClick={() => handleThemeSelect('y2k')}
                    previewClass="bg-pink-200 rounded-[2rem]"
                 />
                  <ThemeCard 
                    name="Win95" 
                    selected={formData.theme === 'win95'} 
                    onClick={() => handleThemeSelect('win95')}
                    previewClass="bg-gray-300 border-t-2 border-white"
                 />
                 <ThemeCard 
                    name="Gameboy" 
                    selected={formData.theme === 'gameboy'} 
                    onClick={() => handleThemeSelect('gameboy')}
                    previewClass="bg-[#8bac0f]"
                 />
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
             {step > 1 ? (
               <button onClick={() => setStep(step - 1)} className="text-sm font-bold text-gray-400 hover:text-black transition-colors px-4 py-2">
                 Back
               </button>
             ) : <div></div>}
             
             <Button 
                onClick={handleNext} 
                disabled={(step === 1 && (!formData.name || !formData.role)) || (step === 2 && !formData.location)}
                className="!px-8 !py-4 !text-base !rounded-2xl"
             >
                {step === totalSteps ? "Launch Page" : "Next"}
                {step === totalSteps ? <LayoutGrid className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
             </Button>
          </div>

        </div>
      </div>
    </div>
  );
};
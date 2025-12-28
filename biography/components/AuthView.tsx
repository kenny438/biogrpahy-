import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Button } from './Button';
import { Input } from './Input';
import { LayoutGrid, ArrowRight, Loader2, Lock, MailCheck, Globe, Shield, Fingerprint } from 'lucide-react';

export const AuthView: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        if (data.user && !data.session) {
          setNeedsVerification(true);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (needsVerification) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white text-black">
        <div className="w-full max-w-md p-8 text-center animate-in fade-in zoom-in-95 duration-500">
           <div className="w-20 h-20 bg-black text-white rounded-full mx-auto flex items-center justify-center mb-6 shadow-xl">
              <MailCheck className="w-10 h-10" />
           </div>
           <h2 className="text-3xl font-black tracking-tighter mb-4">Check your email</h2>
           <p className="text-gray-500 mb-8 font-medium">
             We sent a verification link to <span className="text-black font-bold">{email}</span>.
             <br/>Click it to activate your BIOGRAPHY.
           </p>
           <Button 
             variant="secondary"
             onClick={() => {
               setNeedsVerification(false);
               setIsSignUp(false);
             }}
             className="w-full !rounded-xl !border-black"
           >
             Back to Sign In
           </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-white text-black selection:bg-black selection:text-white">
       
       {/* Left Side - Brand / Visuals (Hidden on mobile) */}
       <div className="hidden lg:flex w-1/2 bg-[#050505] text-white relative flex-col justify-between p-12 overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px]"></div>
          
          <div className="relative z-10">
             <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center font-black text-lg">
                    <Fingerprint className="w-6 h-6" />
                </div>
                <span className="font-bold text-xl tracking-tight">BIOGRAPHY</span>
             </div>
          </div>

          <div className="relative z-10 max-w-lg">
             <h1 className="text-6xl font-black tracking-tighter leading-tight mb-6">
                Your digital identity, <br/><span className="text-gray-500">simplified.</span>
             </h1>
             <p className="text-lg text-gray-400 font-medium leading-relaxed">
                Create a stunning, minimalist profile to share your links, thoughts, and vibe. No distractions, just you.
             </p>
          </div>

          <div className="relative z-10 flex gap-6 text-sm font-bold text-gray-500 uppercase tracking-widest">
             <span className="flex items-center gap-2"><Globe className="w-4 h-4"/> Global</span>
             <span className="flex items-center gap-2"><Shield className="w-4 h-4"/> Secure</span>
             <span className="flex items-center gap-2"><LayoutGrid className="w-4 h-4"/> Modular</span>
          </div>
       </div>

       {/* Right Side - Form */}
       <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
          <div className="w-full max-w-md animate-in slide-in-from-right-8 duration-700">
             
             {/* Mobile Header */}
             <div className="lg:hidden mb-12 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                   <Fingerprint className="w-8 h-8" />
                </div>
                <h1 className="text-4xl font-black tracking-tighter mb-2">BIOGRAPHY</h1>
                <p className="text-gray-500 font-medium">Curate your digital presence.</p>
             </div>

             <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2">{isSignUp ? 'Create your account' : 'Welcome back'}</h2>
                <p className="text-gray-500 text-sm">
                   {isSignUp ? 'Enter your details to get started.' : 'Please enter your details to sign in.'}
                </p>
             </div>

             <form onSubmit={handleAuth} className="space-y-6">
                {error && (
                  <div className="bg-red-50 text-red-600 text-sm font-bold p-4 rounded-xl flex items-start gap-2">
                    <div className="mt-0.5 min-w-[4px] h-[4px] bg-red-600 rounded-full" />
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <Input 
                    label="Email Address"
                    type="email" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="!bg-gray-50 !border-gray-200 focus:!ring-black/5 focus:!border-black transition-all h-12"
                  />
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Password</label>
                       {!isSignUp && <button type="button" className="text-xs font-bold text-black hover:underline">Forgot?</button>}
                    </div>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="!bg-gray-50 !border-gray-200 focus:!ring-black/5 focus:!border-black transition-all h-12"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full !bg-black !text-white hover:!bg-gray-800 !h-14 !text-base !font-bold !rounded-2xl shadow-xl hover:shadow-2xl transition-all"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : (isSignUp ? 'Create Account' : 'Sign In')}
                  {!loading && <ArrowRight className="w-5 h-5" />}
                </Button>
             </form>

             <div className="mt-8 text-center">
                <p className="text-sm font-medium text-gray-500">
                  {isSignUp ? "Already have an account?" : "New to BIOGRAPHY?"}
                  <button 
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError(null);
                    }}
                    className="ml-2 text-black font-black hover:underline underline-offset-4"
                  >
                    {isSignUp ? "Sign In" : "Join Now"}
                  </button>
                </p>
             </div>
             
             <div className="mt-12 flex items-center justify-center gap-2 text-gray-300">
                <Lock className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Secured by Supabase</span>
             </div>
          </div>
       </div>
    </div>
  );
};
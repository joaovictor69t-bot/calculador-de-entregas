import React, { useState } from 'react';
import { Mail, Lock, User, Truck, Loader2, UserPlus, LogIn, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegistering) {
        // --- REGISTRATION LOGIC ---
        
        if (password !== confirmPassword) {
          throw new Error("As senhas não coincidem.");
        }
        if (password.length < 6) {
            throw new Error("A senha deve ter pelo menos 6 caracteres.");
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                }
            }
        });

        if (signUpError) throw signUpError;
        
        // Supabase login is automatic after signup if email confirmation is off, 
        // or we alert them to check email.
        if (data.user) {
             onLoginSuccess();
        }

      } else {
        // --- LOGIN LOGIC ---
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError) {
            // Translate common Supabase errors
            if (signInError.message.includes('Invalid login')) {
                throw new Error("E-mail ou senha incorretos.");
            }
            throw signInError;
        }
        
        onLoginSuccess();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocorreu um erro ao conectar.");
    } finally {
        setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 space-y-6 animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-600/30">
            <Truck className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">DriverLog Pro</h1>
          <p className="text-slate-500 text-sm mt-1">
            {isRegistering ? 'Crie sua conta para começar' : 'Bem-vindo de volta'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2 border border-red-100 animate-in slide-in-from-top-2">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name Field (Register Only) */}
          {isRegistering && (
            <div className="relative group animate-in fade-in slide-in-from-bottom-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu Nome"
                className="block w-full pl-10 pr-3 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
              />
            </div>
          )}

          {/* Email Field */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu e-mail"
              className="block w-full pl-10 pr-3 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Password Field */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              className="block w-full pl-10 pr-3 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Confirm Password Field (Register Only) */}
          {isRegistering && (
            <div className="relative group animate-in fade-in slide-in-from-bottom-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              </div>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a senha"
                className="block w-full pl-10 pr-3 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                {isRegistering ? 'Cadastrar' : 'Entrar'} 
                {isRegistering ? <UserPlus size={18} /> : <LogIn size={18} />}
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors"
          >
            {isRegistering 
              ? 'Já possui uma conta? Faça Login' 
              : 'Não tem conta? Crie agora'}
          </button>
        </div>
      </div>
      
      <p className="mt-8 text-slate-400 text-xs text-center font-medium">
        © {new Date().getFullYear()} DriverLog Pro
      </p>
    </div>
  );
};
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, DEMO_CREDENTIALS } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useTheme } from '@/context/ThemeContext';
import { UserRole, Department, AcademicYear } from '@/types';
import {
  GraduationCap,
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  Users,
  Eye,
  EyeOff,
  Sun,
  Moon,
  ShieldCheck,
  CheckCircle2,
  Search,
  UserPlus,
  LogIn,
  BookOpen,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, signUp, loginWithPersona } = useAuth();
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();

  // Mode: 'login' | 'signup'
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Login form state
  const [email, setEmail] = useState('alex.chen@university.edu');
  const [password, setPassword] = useState('demo1234');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeLoggingAccount, setActiveLoggingAccount] = useState<string | null>(null);

  // Sign Up form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>('mentee');
  const [signupDepartment, setSignupDepartment] = useState<Department>('Computer Science & Engineering');
  const [signupYear, setSignupYear] = useState<AcademicYear>('2nd Year (Sophomore)');
  const [signupHeadline, setSignupHeadline] = useState('');

  // Demo accounts filtering & search
  const [demoRoleFilter, setDemoRoleFilter] = useState<'all' | 'mentor' | 'mentee'>('all');
  const [demoSearchQuery, setDemoSearchQuery] = useState('');

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('Validation Error', 'Please enter your university email.', 'error');
      return;
    }
    if (!password.trim()) {
      showToast('Validation Error', 'Please enter your password.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      showToast('Welcome back!', 'Successfully signed in to MentorLink via Firebase.', 'success');
      router.push('/');
    } catch (err: unknown) {
      const error = err as { message?: string };
      showToast('Sign In Error', error.message || 'Check your credentials and try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Sign Up Submit
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim()) {
      showToast('Validation Error', 'Please enter your full name.', 'error');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      showToast('Validation Error', 'Please enter a valid university email.', 'error');
      return;
    }
    if (!signupPassword || signupPassword.length < 6) {
      showToast('Validation Error', 'Password must be at least 6 characters.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await signUp({
        name: signupName.trim(),
        email: signupEmail.trim(),
        password: signupPassword,
        role: signupRole,
        department: signupDepartment,
        year: signupYear,
        headline: signupHeadline.trim() || `${signupYear} | ${signupDepartment}`,
      });
      showToast('Account Created! 🎉', 'Welcome to MentorLink! Your profile is live.', 'success');
      router.push('/');
    } catch (err: unknown) {
      const error = err as { message?: string };
      showToast('Sign Up Error', error.message || 'Could not create account.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle 1-Click Demo Fill & Login
  const handleFillAndLogin = async (cred: (typeof DEMO_CREDENTIALS)[0]) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setActiveLoggingAccount(cred.email);
    setIsLoading(true);

    try {
      await loginWithPersona(cred.user);
      showToast(`Signed in as ${cred.user.name}`, `Authenticated as ${cred.roleLabel}.`, 'success');
      router.push('/');
    } catch (err: unknown) {
      const error = err as { message?: string };
      showToast('Demo Login Alert', error.message || 'Attempting fallback...', 'warning');
      router.push('/');
    } finally {
      setIsLoading(false);
      setActiveLoggingAccount(null);
    }
  };

  // Filtered Demo Accounts
  const filteredDemos = DEMO_CREDENTIALS.filter((item) => {
    const matchesRole =
      demoRoleFilter === 'all'
        ? true
        : demoRoleFilter === 'mentor'
        ? item.user.role === 'mentor'
        : item.user.role === 'mentee';

    const matchesSearch =
      demoSearchQuery.trim() === '' ||
      item.user.name.toLowerCase().includes(demoSearchQuery.toLowerCase()) ||
      item.user.department.toLowerCase().includes(demoSearchQuery.toLowerCase()) ||
      item.user.skills.some((s) => s.toLowerCase().includes(demoSearchQuery.toLowerCase())) ||
      item.roleLabel.toLowerCase().includes(demoSearchQuery.toLowerCase());

    return matchesRole && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#EEF2F6] dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-300">
      {/* Top Navbar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200/80 dark:border-[#26334D] bg-white/80 dark:bg-[#151F32]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">MentorLink</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">University Mentorship Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Firebase Connected (Spark Tier)</span>
          </span>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-xs"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Auth Card (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-[#151F32] border border-slate-200/90 dark:border-[#26334D] rounded-3xl p-6 sm:p-8 shadow-xl">
            {/* Mode Switcher Tabs */}
            <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800/80 p-1 mb-6 border border-slate-200/80 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  authMode === 'login'
                    ? 'bg-white dark:bg-[#151F32] text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Log In</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  authMode === 'signup'
                    ? 'bg-white dark:bg-[#151F32] text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Sign Up</span>
              </button>
            </div>

            {/* LOGIN FORM */}
            {authMode === 'login' && (
              <div>
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-200/60 dark:border-indigo-800/60 mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Firebase Authentication</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Sign in to your account
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Connect with mentors, track goals, and start WebRTC calls.
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      University Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@university.edu"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/70 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/70 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm shadow-md hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isLoading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Sign In with Firebase</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* SIGN UP FORM */}
            {authMode === 'signup' && (
              <div>
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 text-xs font-bold border border-purple-200/60 dark:border-purple-800/60 mb-2">
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>New University Account</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Create your account
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Join university seniors & juniors on the live mentorship network.
                  </p>
                </div>

                <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="e.g. Maya Lin"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/70 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  {/* University Email */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      University Email
                    </label>
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="name@university.edu"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/70 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Password (min 6 chars)
                    </label>
                    <input
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/70 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  {/* Role Selection */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Your Primary Role
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSignupRole('mentee')}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                          signupRole === 'mentee'
                            ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Junior / Mentee</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSignupRole('mentor')}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                          signupRole === 'mentor'
                            ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <GraduationCap className="w-4 h-4" />
                        <span>Senior / Mentor</span>
                      </button>
                    </div>
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Department
                    </label>
                    <select
                      value={signupDepartment}
                      onChange={(e) => setSignupDepartment(e.target.value as Department)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/70 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                      <option value="Electrical & Electronic Engineering">Electrical & Electronic Engineering</option>
                      <option value="Data Science & AI">Data Science & AI</option>
                      <option value="Business Administration">Business Administration</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Biomedical Engineering">Biomedical Engineering</option>
                      <option value="Information Technology">Information Technology</option>
                    </select>
                  </div>

                  {/* Academic Year */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Academic Year
                    </label>
                    <select
                      value={signupYear}
                      onChange={(e) => setSignupYear(e.target.value as AcademicYear)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/70 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="1st Year (Freshman)">1st Year (Freshman)</option>
                      <option value="2nd Year (Sophomore)">2nd Year (Sophomore)</option>
                      <option value="3rd Year (Junior)">3rd Year (Junior)</option>
                      <option value="4th Year (Senior)">4th Year (Senior)</option>
                      <option value="Graduate / Alumni">Graduate / Alumni</option>
                    </select>
                  </div>

                  {/* Headline */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Profile Headline (Optional)
                    </label>
                    <input
                      type="text"
                      value={signupHeadline}
                      onChange={(e) => setSignupHeadline(e.target.value)}
                      placeholder="e.g. Aspiring SWE | Passionate about Full-Stack & AI"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/70 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 pt-3"
                  >
                    {isLoading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Register & Create Firestore Profile</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Right Column: 20 Prebuilt Dummy Accounts Panel (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#151F32] border border-slate-200/90 dark:border-[#26334D] rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-200/60 dark:border-emerald-800/60 mb-2">
                  <Users className="w-3.5 h-3.5" />
                  <span>20 Prebuilt Demo Accounts</span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  1-Click Instant Login (Seniors & Juniors)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Auto-creates in Firebase Auth & seeds Firestore profile on first click.
                </p>
              </div>

              {/* Password badge */}
              <div className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 font-mono">
                PW: <span className="font-bold text-indigo-600 dark:text-indigo-400">demo1234</span>
              </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mb-5">
              {/* Role Tabs */}
              <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setDemoRoleFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    demoRoleFilter === 'all'
                      ? 'bg-white dark:bg-[#151F32] text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  All (20)
                </button>
                <button
                  type="button"
                  onClick={() => setDemoRoleFilter('mentor')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    demoRoleFilter === 'mentor'
                      ? 'bg-white dark:bg-[#151F32] text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Seniors (10)
                </button>
                <button
                  type="button"
                  onClick={() => setDemoRoleFilter('mentee')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    demoRoleFilter === 'mentee'
                      ? 'bg-white dark:bg-[#151F32] text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Juniors (10)
                </button>
              </div>

              {/* Live Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={demoSearchQuery}
                  onChange={(e) => setDemoSearchQuery(e.target.value)}
                  placeholder="Search by name, skill, dept..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/70 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Scrollable Demo Grid (2 columns) */}
            <div className="max-h-[520px] overflow-y-auto pr-1 space-y-3 custom-scrollbar">
              {filteredDemos.map((item) => {
                const isLoggingThis = activeLoggingAccount === item.email;
                const isSenior = item.user.role === 'mentor';

                return (
                  <div
                    key={item.user.id}
                    className="p-3.5 rounded-2xl border border-slate-200/90 dark:border-[#26334D] bg-slate-50/60 dark:bg-[#1A263D]/60 hover:bg-white dark:hover:bg-[#1E2C46] transition-all hover:border-indigo-400 dark:hover:border-indigo-500/70 flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar */}
                      <img
                        src={item.user.avatar}
                        alt={item.user.name}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />

                      {/* Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {item.user.name}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide shrink-0 ${
                              isSenior
                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                            }`}
                          >
                            {isSenior ? 'Senior' : 'Junior'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-xs sm:max-w-sm">
                          {item.user.headline}
                        </p>

                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                            {item.email}
                          </span>
                          <span className="text-[11px] text-slate-400">•</span>
                          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                            {item.user.department.split('&')[0]}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 1-Click Fill & Login Button */}
                    <button
                      type="button"
                      onClick={() => handleFillAndLogin(item)}
                      disabled={isLoading}
                      className="shrink-0 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white font-bold text-xs transition-all border border-indigo-200/80 dark:border-indigo-800/80 shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isLoggingThis ? (
                        <span className="w-3.5 h-3.5 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Login</span>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}

              {filteredDemos.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No accounts matched your search criteria.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-slate-200/80 dark:border-[#26334D] bg-white/60 dark:bg-[#151F32]/60 text-center text-xs text-slate-500 dark:text-slate-400">
        MentorLink — University Senior-Junior Peer Mentorship Web Application • Powered by Firebase Spark Plan
      </footer>
    </div>
  );
}

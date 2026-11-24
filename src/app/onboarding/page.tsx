'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole, Department, AcademicYear } from '@/types';
import {
  GraduationCap,
  Sparkles,
  UserCheck,
  Users,
  Check,
  ArrowRight,
} from 'lucide-react';

const DEPARTMENTS: Department[] = [
  'Computer Science & Engineering',
  'Electrical & Electronic Engineering',
  'Data Science & AI',
  'Business Administration',
  'Information Technology',
  'Mechanical Engineering',
  'Biomedical Engineering',
];

const YEARS: AcademicYear[] = [
  '1st Year (Freshman)',
  '2nd Year (Sophomore)',
  '3rd Year (Junior)',
  '4th Year (Senior)',
  'Graduate / Alumni',
];

const POPULAR_SKILLS = [
  'React',
  'TypeScript',
  'Next.js',
  'Python',
  'PyTorch',
  'System Design',
  'Algorithms & DSA',
  'C++',
  'Embedded C',
  'Resume Review',
  'Mock Interviews',
  'Cloud / AWS',
  'Behavioral Prep',
];

export default function OnboardingPage() {
  const router = useRouter();
  const { currentUser, completeOnboarding } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [role, setRole] = useState<UserRole>(currentUser.role || 'mentee');
  const [department, setDepartment] = useState<Department>(currentUser.department || 'Computer Science & Engineering');
  const [year, setYear] = useState<AcademicYear>(currentUser.year || '2nd Year (Sophomore)');
  const [headline, setHeadline] = useState(currentUser.headline || 'Student @ University');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(currentUser.skills || ['React', 'Algorithms & DSA']);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    completeOnboarding({
      role,
      department,
      year,
      headline,
      bio,
      skills: selectedSkills,
    });
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#EEF2F6] dark:bg-[#0B1120] text-slate-900 dark:text-white flex flex-col justify-center items-center p-6 transition-colors duration-200">
      
      {/* Brand Header */}
      <div className="flex items-center gap-3.5 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
          <GraduationCap className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">MentorLink</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold">University Senior-Junior Mentorship Platform</p>
        </div>
      </div>

      {/* Main Stepper Card */}
      <div className="w-full max-w-xl bg-white dark:bg-[#151F32] border border-slate-200/90 dark:border-[#26334D] rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md">
        
        {/* Step Progress Pills */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-slate-700/60">
          {[
            { num: 1, label: 'Choose Role' },
            { num: 2, label: 'Department & Year' },
            { num: 3, label: 'Skills & Bio' },
          ].map((st) => (
            <div key={st.num} className="flex items-center gap-2">
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === st.num
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20'
                    : step > st.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                {step > st.num ? <Check className="w-4 h-4" /> : st.num}
              </span>
              <span className={`text-xs font-bold hidden sm:inline ${step === st.num ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                {st.label}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1: Role Selection */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="text-center">
              <h2 className="text-2xl font-extrabold">Select Your Mentorship Track</h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">How will you participate in MentorLink?</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {/* Junior Mentee Option */}
              <button
                type="button"
                onClick={() => setRole('mentee')}
                className={`p-6 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  role === 'mentee'
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-lg shadow-indigo-500/15'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Junior / Mentee</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  I am looking for guidance, resume critiques, mock interviews, and course planning advice from experienced seniors.
                </p>
              </button>

              {/* Senior Mentor Option */}
              <button
                type="button"
                onClick={() => setRole('mentor')}
                className={`p-6 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  role === 'mentor'
                    ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/40 shadow-lg shadow-purple-500/15'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Senior / Mentor</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  I am a 3rd/4th year student or alumni eager to mentor juniors, conduct mock interviews, and share study resources.
                </p>
              </button>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full mt-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue to Academic Setup</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Department & Academic Year */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in">
            <div>
              <h2 className="text-2xl font-extrabold">Academic Profile</h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Specify your university program</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                University Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Academic Year / Batch
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value as AcademicYear)}
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Headline / Current Status
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Sophomore CS Student | Seeking Summer SWE Internships"
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-2/3 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Skills</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Skills & Bio */}
        {step === 3 && (
          <form onSubmit={handleFinish} className="space-y-5 animate-in fade-in">
            <div>
              <h2 className="text-2xl font-extrabold">Skills & Bio</h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Highlight your technical skills or learning targets</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Select Topics / Skills ({selectedSkills.length} selected)
              </label>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                {POPULAR_SKILLS.map((sk) => {
                  const isSelected = selectedSkills.includes(sk);
                  return (
                    <button
                      type="button"
                      key={sk}
                      onClick={() => toggleSkill(sk)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {isSelected ? `✓ ${sk}` : sk}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Brief Bio / Mentorship Objective
              </label>
              <textarea
                rows={3}
                required
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share a short summary of your background and what you hope to accomplish on MentorLink..."
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                className="w-2/3 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Complete Profile & Open App</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

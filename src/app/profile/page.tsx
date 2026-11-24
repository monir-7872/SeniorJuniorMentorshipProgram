'use client';

import React, { useState } from 'react';
import TopHeader from '@/components/layout/TopHeader';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useLayout } from '@/context/LayoutContext';
import { playSuccessChime } from '@/lib/sound';
import { UserRole, Department, AcademicYear } from '@/types';
import {
  User as UserIcon,
  Mail,
  Briefcase,
  BookOpen,
  Camera,
  Plus,
  X,
  Save,
  CheckCircle2,
  Globe,
  Link2,
  Star,
  Clock,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

const DEPARTMENTS: Department[] = [
  'Computer Science & Engineering',
  'Electrical & Electronic Engineering',
  'Data Science & AI',
  'Business Administration',
  'Mechanical Engineering',
  'Biomedical Engineering',
  'Information Technology',
];

const ACADEMIC_YEARS: AcademicYear[] = [
  '1st Year (Freshman)',
  '2nd Year (Sophomore)',
  '3rd Year (Junior)',
  '4th Year (Senior)',
  'Graduate / Alumni',
];

const SUGGESTED_SKILLS = [
  'System Design',
  'Data Structures & Algorithms',
  'React',
  'Next.js',
  'TypeScript',
  'Python',
  'Machine Learning',
  'Resume & Portfolio Review',
  'Mock Technical Interviews',
  'Career Strategy',
  'Cloud (AWS/GCP)',
  'SQL & Databases',
];

export default function ProfilePage() {
  const { currentUser, updateProfile } = useAuth();
  const { showToast } = useToast();
  const { setQuickActionOpen } = useLayout();

  const [name, setName] = useState(currentUser.name || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [role, setRole] = useState<UserRole>(currentUser.role || 'mentee');
  const [department, setDepartment] = useState<Department>(
    currentUser.department || 'Computer Science & Engineering'
  );
  const [year, setYear] = useState<AcademicYear>(
    currentUser.year || '2nd Year (Sophomore)'
  );
  const [headline, setHeadline] = useState(currentUser.headline || '');
  const [companyOrLab, setCompanyOrLab] = useState(currentUser.companyOrLab || '');
  const [hourlyRate, setHourlyRate] = useState(
    currentUser.hourlyRate || 'Free Peer Mentoring'
  );
  const [bio, setBio] = useState(currentUser.bio || '');
  const [skills, setSkills] = useState<string[]>(currentUser.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [linkedIn, setLinkedIn] = useState(currentUser.linkedIn || '');
  const [github, setGithub] = useState(currentUser.github || '');
  const [isAvailable, setIsAvailable] = useState<boolean>(
    currentUser.isAvailable !== undefined ? currentUser.isAvailable : true
  );

  const [isSaving, setIsSaving] = useState(false);
  const [avatarMode, setAvatarMode] = useState<'upload' | 'url'>('upload');

  const handleAddSkill = (skillToAdd?: string) => {
    const val = (skillToAdd || skillInput).trim();
    if (val && !skills.includes(val)) {
      setSkills((prev) => [...prev, val]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      showToast('File Too Large', 'Please upload a photo under 500KB.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result as string);
      showToast('Photo Loaded', 'Profile photo preview updated.', 'info');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updateProfile({
        name: name.trim(),
        avatar: avatar.trim() || currentUser.avatar,
        role,
        department,
        year,
        headline: headline.trim(),
        companyOrLab: companyOrLab.trim(),
        hourlyRate: hourlyRate.trim(),
        bio: bio.trim(),
        skills,
        linkedIn: linkedIn.trim(),
        github: github.trim(),
        isAvailable,
      });

      playSuccessChime();
      showToast(
        'Profile Updated! 🎉',
        'Your university mentorship profile was saved successfully.',
        'success'
      );
    } catch (err) {
      console.error('Failed to update profile:', err);
      showToast('Error', 'Failed to save changes. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col pb-16">
      <TopHeader
        title="My Profile & Settings"
        subtitle="Manage your university credentials, mentorship availability, and profile appearance"
        onOpenQuickAction={() => setQuickActionOpen(true)}
      />

      <div className="p-4 sm:p-8 max-w-5xl w-full mx-auto space-y-8">
        
        {/* Top Profile Summary Card */}
        <div className="interactive-card bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-[#151F32] border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="relative group">
              <img
                src={avatar || currentUser.avatar}
                alt={name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-indigo-500/40 shadow-xl"
              />
              <span
                className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-slate-900 ${
                  isAvailable ? 'bg-emerald-500' : 'bg-slate-500'
                }`}
                title={isAvailable ? 'Available for mentorship' : 'Unavailable'}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h2 className="text-2xl font-extrabold text-white tracking-tight">{name}</h2>
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 capitalize">
                  {role === 'both' ? 'Mentor & Mentee' : role === 'mentor' ? 'Senior Mentor' : 'Junior Mentee'}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-300">{headline || department}</p>
              <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <span>{year}</span>
                <span>•</span>
                <span>{department}</span>
                {companyOrLab && (
                  <>
                    <span>•</span>
                    <span className="text-indigo-400 font-semibold">{companyOrLab}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto shrink-0">
            <div className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-2xl p-3.5 text-center min-w-[85px]">
              <div className="flex items-center justify-center gap-1 text-amber-400 font-bold text-base">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{currentUser.rating || 5.0}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Rating</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-2xl p-3.5 text-center min-w-[85px]">
              <div className="text-white font-bold text-base flex items-center justify-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{currentUser.sessionsCompleted || 0}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Sessions</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-2xl p-3.5 text-center min-w-[85px]">
              <div className="text-white font-bold text-base flex items-center justify-center gap-1">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>{currentUser.hoursMentored || 0}h</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Mentored</p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Basic Information */}
          <div className="bg-white dark:bg-[#151F32] border border-slate-200/90 dark:border-[#26334D] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Basic Profile Details</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Your name, avatar, and academic status</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Email (Read Only) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  University Email (Verified)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 text-sm font-medium text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Mentorship Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="mentee">Junior / Mentee (Seeking Mentorship)</option>
                  <option value="mentor">Senior / Mentor (Offering Guidance)</option>
                  <option value="both">Both (Mentor & Mentee)</option>
                </select>
              </div>

              {/* Academic Year */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Academic Year / Batch
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value as AcademicYear)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {ACADEMIC_YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Academic Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as Department)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Profile Avatar Editor */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Profile Photo
                </label>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setAvatarMode('upload')}
                    className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      avatarMode === 'upload'
                        ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarMode('url')}
                    className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      avatarMode === 'url'
                        ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    Image URL
                  </button>
                </div>
              </div>

              {avatarMode === 'upload' ? (
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-dashed border-indigo-400 dark:border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-bold hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-all cursor-pointer">
                    <Camera className="w-4 h-4" />
                    <span>Choose Image File (&lt; 500KB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-slate-400">JPG, PNG, WebP supported</span>
                </div>
              ) : (
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              )}
            </div>
          </div>

          {/* Section 2: Mentorship Bio & Headline */}
          <div className="bg-white dark:bg-[#151F32] border border-slate-200/90 dark:border-[#26334D] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Professional & Mentorship Summary</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Tell students about your experience and background</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Incoming Software Engineer @ Google | Ex-Uber SWE Intern"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Company, Lab, or Student Org
                  </label>
                  <input
                    type="text"
                    value={companyOrLab}
                    onChange={(e) => setCompanyOrLab(e.target.value)}
                    placeholder="e.g. Distributed Systems Lab / Google"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Mentorship Rate / Cadence
                  </label>
                  <input
                    type="text"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    placeholder="e.g. Free Peer Mentoring"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Biography & Mentorship Philosophy
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Write a brief introduction about your academic trajectory, what subjects you love mentoring in, and what students can expect..."
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Skills & Expertise Tags */}
          <div className="bg-white dark:bg-[#151F32] border border-slate-200/90 dark:border-[#26334D] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Skills & Mentorship Topics</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Add technical skills, courses, and guidance topics</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Input for custom skill */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="Type a skill and press Enter (e.g. Distributed Systems)..."
                  className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill()}
                  className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>

              {/* Active Skill Tags */}
              <div className="flex flex-wrap gap-2 pt-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-bold"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="p-0.5 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-800 text-indigo-500 dark:text-indigo-400 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
                {skills.length === 0 && (
                  <p className="text-xs text-slate-400 italic">No skills added yet.</p>
                )}
              </div>

              {/* Suggested Skills */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                  Suggested University Topics:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_SKILLS.filter((s) => !skills.includes(s)).map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleAddSkill(skill)}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Social & Links + Availability */}
          <div className="bg-white dark:bg-[#151F32] border border-slate-200/90 dark:border-[#26334D] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Online Profiles & Availability</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Connect your portfolio and toggle active availability</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* LinkedIn */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  LinkedIn Profile URL
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                  <input
                    type="url"
                    value={linkedIn}
                    onChange={(e) => setLinkedIn(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* GitHub */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  GitHub Profile URL
                </label>
                <div className="relative">
                  <Link2 className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 dark:text-slate-300" />
                  <input
                    type="url"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Availability Toggle */}
              <div className="md:col-span-2 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Available for Mentorship & 1-on-1 Sessions
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    When enabled, other students can discover your profile in Find Mentors and send mentorship requests.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAvailable(!isAvailable)}
                  className={`p-2 rounded-2xl transition-all flex items-center gap-2 cursor-pointer ${
                    isAvailable
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {isAvailable ? (
                    <ToggleRight className="w-7 h-7" />
                  ) : (
                    <ToggleLeft className="w-7 h-7" />
                  )}
                  <span className="text-xs font-bold pr-1">
                    {isAvailable ? 'Available' : 'Paused'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Save Changes Floating Bar */}
          <div className="sticky bottom-6 z-20 p-4 rounded-3xl bg-white/95 dark:bg-[#151F32]/95 backdrop-blur-md border border-slate-200 dark:border-[#26334D] shadow-2xl flex items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Make sure to save after making updates to your profile.
            </p>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 sm:px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 hover:scale-102 active:scale-98 transition-all cursor-pointer shrink-0"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

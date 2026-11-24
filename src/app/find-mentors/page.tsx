'use client';

import React, { useState, useMemo } from 'react';
import TopHeader from '@/components/layout/TopHeader';
import MentorCard from '@/components/mentors/MentorCard';
import MentorProfileModal from '@/components/mentors/MentorProfileModal';
import RequestMentorshipModal from '@/components/mentors/RequestMentorshipModal';
import { useAuth } from '@/context/AuthContext';
import { useMentorship } from '@/context/MentorshipContext';
import { useLayout } from '@/context/LayoutContext';
import { User, Department } from '@/types';
import { Search, RotateCcw, Sparkles } from 'lucide-react';

const DEPARTMENTS: (Department | 'All Departments')[] = [
  'All Departments',
  'Computer Science & Engineering',
  'Electrical & Electronic Engineering',
  'Data Science & AI',
  'Business Administration',
  'Mechanical Engineering',
  'Biomedical Engineering',
  'Information Technology',
];

const SKILL_FILTERS = [
  'All Skills',
  'System Design',
  'Algorithms',
  'React',
  'Python',
  'Machine Learning',
  'Robotics',
  'Resume Review',
  'Mock Interviews',
];

export default function FindMentorsPage() {
  const { currentUser } = useAuth();
  const { mentors } = useMentorship();
  const { setQuickActionOpen } = useLayout();

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All Departments');
  const [selectedSkill, setSelectedSkill] = useState<string>('All Skills');
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);

  const [previewMentor, setPreviewMentor] = useState<User | null>(null);
  const [requestMentor, setRequestMentor] = useState<User | null>(null);

  const userEmail = (currentUser.email || '').toLowerCase();

  // Dynamic live filtering
  const filteredMentors = useMemo(() => {
    return mentors.filter((m) => {
      // Exclude logged-in user
      if (m.id === currentUser.id || (userEmail && (m.email || '').toLowerCase() === userEmail)) {
        return false;
      }

      // Department filter
      if (selectedDept !== 'All Departments' && m.department !== selectedDept) {
        return false;
      }

      // Skill filter
      if (selectedSkill !== 'All Skills' && !m.skills.includes(selectedSkill)) {
        return false;
      }

      // Availability filter
      if (onlyAvailable && !m.isAvailable) {
        return false;
      }

      // Rating filter
      if (minRating > 0 && m.rating < minRating) {
        return false;
      }

      // Search query
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = m.name.toLowerCase().includes(query);
        const matchesDept = m.department.toLowerCase().includes(query);
        const matchesCompany = m.companyOrLab?.toLowerCase().includes(query);
        const matchesSkills = m.skills.some((s) => s.toLowerCase().includes(query));
        const matchesBio = m.bio.toLowerCase().includes(query);

        if (!matchesName && !matchesDept && !matchesCompany && !matchesSkills && !matchesBio) {
          return false;
        }
      }

      return true;
    });
  }, [mentors, search, selectedDept, selectedSkill, onlyAvailable, minRating, currentUser.id, userEmail]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedDept('All Departments');
    setSelectedSkill('All Skills');
    setOnlyAvailable(false);
    setMinRating(0);
  };

  const hasActiveFilters =
    search !== '' ||
    selectedDept !== 'All Departments' ||
    selectedSkill !== 'All Skills' ||
    onlyAvailable ||
    minRating > 0;

  return (
    <div className="flex-1 flex flex-col pb-16">
      <TopHeader
        title="Find Mentors"
        subtitle="Discover university senior mentors, research fellows, and alumni"
        onOpenQuickAction={() => setQuickActionOpen(true)}
      />

      <div className="p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
        
        {/* Search & Filter Control Bar */}
        <div className="bg-white dark:bg-[#151F32] border border-slate-200/90 dark:border-[#26334D] rounded-3xl p-6 md:p-8 shadow-sm space-y-5">
          
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3.5">
            {/* Live Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search mentors by name, skills (e.g. React, PyTorch), company (Google, Tesla), or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 rounded-2xl border border-transparent focus:border-indigo-500 focus:outline-none transition-all"
              />
            </div>

            {/* Department Dropdown */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="py-3 px-4 bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 rounded-2xl border border-transparent focus:border-indigo-500 focus:outline-none cursor-pointer"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            {/* Rating Filter */}
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="py-3 px-4 bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 rounded-2xl border border-transparent focus:border-indigo-500 focus:outline-none cursor-pointer"
            >
              <option value={0}>All Ratings</option>
              <option value={4.8}>⭐ 4.8+ Top Rated</option>
              <option value={4.9}>⭐ 4.9+ Exceptional</option>
            </select>

            {/* Available Toggle */}
            <button
              onClick={() => setOnlyAvailable(!onlyAvailable)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                onlyAvailable
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${onlyAvailable ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <span>Available Now</span>
            </button>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 px-3 py-3 rounded-2xl text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Skill Tag Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800 no-scrollbar">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Popular Skills:
            </span>
            {SKILL_FILTERS.map((skill) => {
              const active = selectedSkill === skill;
              return (
                <button
                  key={skill}
                  onClick={() => setSelectedSkill(skill)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    active
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {skill}
                </button>
              );
            })}
          </div>

        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Showing <span className="font-bold text-slate-900 dark:text-white">{filteredMentors.length}</span> verified mentors
          </p>
        </div>

        {/* Mentors Grid */}
        {filteredMentors.length === 0 ? (
          <div className="bg-white dark:bg-[#151F32] border border-slate-200/90 dark:border-[#26334D] rounded-3xl p-12 text-center">
            <Sparkles className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h4 className="text-lg font-bold text-slate-800 dark:text-white">No mentors matched your filters</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting your search terms or resetting filters to see mentors from other departments.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <MentorCard
                key={mentor.id}
                mentor={mentor}
                onPreview={(m) => setPreviewMentor(m)}
                onRequest={(m) => setRequestMentor(m)}
              />
            ))}
          </div>
        )}

      </div>

      {/* Profile & Request Modals */}
      <MentorProfileModal
        mentor={previewMentor}
        onClose={() => setPreviewMentor(null)}
        onRequest={(m) => {
          setPreviewMentor(null);
          setRequestMentor(m);
        }}
      />

      <RequestMentorshipModal
        mentor={requestMentor}
        onClose={() => setRequestMentor(null)}
      />

    </div>
  );
}

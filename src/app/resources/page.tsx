'use client';

import React, { useState, useMemo } from 'react';
import TopHeader from '@/components/layout/TopHeader';
import UploadResourceModal from '@/components/resources/UploadResourceModal';
import { useMentorship } from '@/context/MentorshipContext';
import { useLayout } from '@/context/LayoutContext';
import { ResourceCategory, SharedResource } from '@/types';
import { downloadFile } from '@/lib/utils';
import {
  BookOpen,
  Search,
  Plus,
  Download,
  Bookmark,
  Heart,
} from 'lucide-react';

const CATEGORIES: ('All' | ResourceCategory | 'Bookmarked')[] = [
  'All',
  'Notes & Study Guides',
  'Interview Prep & LeetCode',
  'Learning Roadmaps',
  'Resume & CV Templates',
  'Past Exam Papers & Solutions',
  'Bookmarked',
];

export default function ResourcesPage() {
  const { resources, toggleBookmarkResource, likeResource } = useMentorship();
  const { setQuickActionOpen } = useLayout();

  const [activeCategory, setActiveCategory] = useState<'All' | ResourceCategory | 'Bookmarked'>('All');
  const [search, setSearch] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      // Category filter
      if (activeCategory === 'Bookmarked') {
        if (!res.isBookmarked) return false;
      } else if (activeCategory !== 'All') {
        if (res.category !== activeCategory) return false;
      }

      // Search filter
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesTitle = res.title.toLowerCase().includes(query);
        const matchesDesc = res.description.toLowerCase().includes(query);
        const matchesTags = res.tags.some((t) => t.toLowerCase().includes(query));
        const matchesAuthor = res.authorName.toLowerCase().includes(query);

        if (!matchesTitle && !matchesDesc && !matchesTags && !matchesAuthor) {
          return false;
        }
      }

      return true;
    });
  }, [resources, activeCategory, search]);

  const handleDownload = (res: SharedResource) => {
    downloadFile(res.downloadUrl, `${res.title.replace(/[^a-zA-Z0-9]/g, '_')}.${res.fileType.toLowerCase()}`);
  };

  return (
    <div className="flex-1 flex flex-col pb-16">
      <TopHeader
        title="Resources Library"
        subtitle="Download student study notes, FAANG resume templates, and curated interview roadmaps"
        onOpenQuickAction={() => setQuickActionOpen(true)}
      />

      <div className="p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
        
        {/* Controls: Search & Upload */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search notes, roadmaps, interview cheatsheets, authors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#151F32] text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 rounded-2xl border border-slate-200/90 dark:border-[#26334D] focus:border-indigo-500 focus:outline-none shadow-xs transition-all"
            />
          </div>

          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/25 hover:scale-102 active:scale-98 transition-all shrink-0 self-start md:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Resource</span>
          </button>
        </div>

        {/* Categories Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#151F32] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-[#26334D]'
              }`}
            >
              {cat === 'Bookmarked' ? '★ Bookmarked' : cat}
            </button>
          ))}
        </div>

        {/* Resources Grid */}
        {filteredResources.length === 0 ? (
          <div className="bg-white dark:bg-[#151F32] border border-slate-200/90 dark:border-[#26334D] rounded-3xl p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h4 className="text-lg font-bold text-slate-800 dark:text-white">No resources found</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Be the first to share notes or roadmaps with university peers!
            </p>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="mt-4 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold cursor-pointer"
            >
              Share a Resource
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredResources.map((res) => {
              const isPdf = res.fileType === 'PDF';
              const isZip = res.fileType === 'ZIP';

              return (
                <div
                  key={res.id}
                  className="interactive-card bg-white dark:bg-[#151F32] border border-slate-200/90 dark:border-[#26334D] rounded-3xl p-6 md:p-8 shadow-sm hover:border-indigo-500/70 flex flex-col justify-between group"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${
                          isPdf
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                            : isZip
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900'
                            : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900'
                        }`}>
                          {res.fileType}
                        </div>
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900">
                            {res.category}
                          </span>
                          <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mt-1">
                            {res.title}
                          </h4>
                        </div>
                      </div>

                      {/* Bookmark Button */}
                      <button
                        onClick={() => toggleBookmarkResource(res.id)}
                        className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                          res.isBookmarked
                            ? 'bg-amber-50 dark:bg-amber-950/70 border-amber-300 dark:border-amber-800 text-amber-600'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                        }`}
                        title={res.isBookmarked ? 'Remove bookmark' : 'Bookmark this resource'}
                      >
                        <Bookmark className={`w-4 h-4 ${res.isBookmarked ? 'fill-amber-500' : ''}`} />
                      </button>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-3.5 leading-relaxed">
                      {res.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {res.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer & Download Action */}
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={res.authorAvatar}
                        alt={res.authorName}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight">{res.authorName}</p>
                        <span className="text-xs text-slate-400">{res.authorRole}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {/* Like button */}
                      <button
                        onClick={() => likeResource(res.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:border-rose-300 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                      >
                        <Heart className="w-4 h-4 text-rose-500" />
                        <span>{res.likesCount}</span>
                      </button>

                      {/* Download Button */}
                      <button
                        onClick={() => handleDownload(res)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/25 hover:scale-102 active:scale-98 transition-all cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download ({res.fileSize})</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      <UploadResourceModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />

    </div>
  );
}

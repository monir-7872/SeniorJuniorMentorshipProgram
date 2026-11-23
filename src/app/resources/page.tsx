'use client';

import React, { useState, useMemo } from 'react';
import TopHeader from '@/components/layout/TopHeader';
import UploadResourceModal from '@/components/resources/UploadResourceModal';
import { useMentorship } from '@/context/MentorshipContext';
import { ResourceCategory, SharedResource } from '@/types';
import { downloadFile } from '@/lib/utils';
import {
  BookOpen,
  Search,
  Plus,
  Download,
  Bookmark,
  Heart,
  FileText,
  Tag,
  Sparkles,
  FileCode,
  Archive,
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
        onOpenQuickAction={() => setUploadModalOpen(true)}
      />

      <div className="p-8 max-w-7xl w-full mx-auto space-y-6">
        
        {/* Controls: Search & Upload */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search notes, roadmaps, interview cheatsheets, authors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white text-xs font-medium text-slate-900 rounded-2xl border border-slate-200/80 focus:border-indigo-500 focus:outline-none shadow-xs transition-all"
            />
          </div>

          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 hover:scale-102 active:scale-98 transition-all shrink-0 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Resource</span>
          </button>
        </div>

        {/* Categories Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
              }`}
            >
              {cat === 'Bookmarked' ? '★ Bookmarked' : cat}
            </button>
          ))}
        </div>

        {/* Resources Grid */}
        {filteredResources.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800">No resources found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Be the first to share notes or roadmaps with university peers!
            </p>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
            >
              Share a Resource
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredResources.map((res) => {
              const isPdf = res.fileType === 'PDF';
              const isZip = res.fileType === 'ZIP';

              return (
                <div
                  key={res.id}
                  className="bg-white border border-slate-200/80 hover:border-indigo-300 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isPdf
                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                            : isZip
                            ? 'bg-amber-50 text-amber-600 border border-amber-200'
                            : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                        }`}>
                          {res.fileType}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                            {res.category}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mt-1">
                            {res.title}
                          </h4>
                        </div>
                      </div>

                      {/* Bookmark Button */}
                      <button
                        onClick={() => toggleBookmarkResource(res.id)}
                        className={`p-2 rounded-xl border transition-colors ${
                          res.isBookmarked
                            ? 'bg-amber-50 border-amber-200 text-amber-600'
                            : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                        }`}
                        title={res.isBookmarked ? 'Remove bookmark' : 'Bookmark this resource'}
                      >
                        <Bookmark className={`w-4 h-4 ${res.isBookmarked ? 'fill-amber-500' : ''}`} />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                      {res.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-3.5">
                      {res.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer & Download Action */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={res.authorAvatar}
                        alt={res.authorName}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800 leading-tight">{res.authorName}</p>
                        <span className="text-[10px] text-slate-400">{res.authorRole}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Like button */}
                      <button
                        onClick={() => likeResource(res.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 text-xs font-semibold transition-colors"
                      >
                        <Heart className="w-3.5 h-3.5" />
                        <span>{res.likesCount}</span>
                      </button>

                      {/* Download Button */}
                      <button
                        onClick={() => handleDownload(res)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs hover:scale-102 active:scale-98 transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
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

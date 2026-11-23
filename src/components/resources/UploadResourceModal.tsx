'use client';

import React, { useState } from 'react';
import { ResourceCategory } from '@/types';
import { useMentorship } from '@/context/MentorshipContext';
import { X, FileUp, Sparkles } from 'lucide-react';

interface UploadResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: ResourceCategory[] = [
  'Notes & Study Guides',
  'Interview Prep & LeetCode',
  'Learning Roadmaps',
  'Resume & CV Templates',
  'Past Exam Papers & Solutions',
];

export default function UploadResourceModal({ isOpen, onClose }: UploadResourceModalProps) {
  const { uploadResource } = useMentorship();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('Notes & Study Guides');
  const [tagsInput, setTagsInput] = useState('Study Notes, Algorithms, CS');
  const [fileType, setFileType] = useState<'PDF' | 'ZIP' | 'DOCX' | 'MD'>('PDF');
  const [fileContent, setFileContent] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    uploadResource({
      title,
      description,
      category,
      tags: tags.length > 0 ? tags : ['Study Resource'],
      fileType,
      fileName: `${title.replace(/\s+/g, '_')}.${fileType.toLowerCase()}`,
      fileContent: fileContent || `# ${title}\n\n${description}`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Share Study Resource</h3>
              <p className="text-xs text-slate-500">Publish guides, resumes, or roadmaps</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
              Resource Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Operating Systems Final Exam Summary & Virtual Memory Notes"
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ResourceCategory)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-indigo-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                Format
              </label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value as 'PDF' | 'ZIP' | 'DOCX' | 'MD')}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-indigo-500"
              >
                <option value="PDF">PDF Document</option>
                <option value="ZIP">ZIP Archive</option>
                <option value="DOCX">Word Document (.docx)</option>
                <option value="MD">Markdown (.md)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. Operating Systems, C++, Memory, Final Exam"
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain how this resource helps students and what is inside..."
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
            >
              Publish Resource
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

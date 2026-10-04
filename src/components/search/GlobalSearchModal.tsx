// src/components/search/GlobalSearchModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { Task, Project, User, SearchResults } from '../../types';
import { Search, X, CheckSquare, Folder, Users, MessageSquare, ArrowRight, CornerDownLeft } from 'lucide-react';
import { PriorityBadge, DeadlineBadge } from '../common/Badge';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTask: (task: Task) => void;
  onSelectProject: (projectId: string) => void;
  onSelectTeam: (userId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTask,
  onSelectProject,
  onSelectTeam
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({
    tasks: [],
    projects: [],
    team: [],
    comments: []
  });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open handled by parent
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ tasks: [], projects: [], team: [], comments: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ tasks: [], projects: [], team: [], comments: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.search(query.trim());
        setResults(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalResults =
    results.tasks.length + results.projects.length + results.team.length + results.comments.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#040508]/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Search Spotlight Dialog */}
      <div className="relative w-full max-w-2xl bg-[#0d0f18] border border-[#23273e] rounded-2xl shadow-2xl shadow-black/90 overflow-hidden z-10 animate-scale-up">
        {/* Top glowing line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#e5c07b]/60 to-transparent" />

        {/* Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#1b2033] bg-[#10121d]">
          <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search tasks, projects, team members, or discussions..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-500 hover:text-white mr-2">
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-[#191d2c] border border-white/5">
            ESC
          </span>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {query.trim() === '' ? (
            <div className="py-10 text-center text-xs text-slate-500">
              Type to search anything in your workspace...
            </div>
          ) : totalResults === 0 && !loading ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No results found for "<span className="text-white font-medium">{query}</span>"
            </div>
          ) : (
            <>
              {/* Tasks */}
              {results.tasks.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">
                    <CheckSquare className="w-3.5 h-3.5 text-[#e5c07b]" />
                    Tasks ({results.tasks.length})
                  </div>
                  {results.tasks.map(task => (
                    <div
                      key={task.id}
                      onClick={() => {
                        onSelectTask(task);
                        onClose();
                      }}
                      className="group flex items-center justify-between p-3 rounded-xl bg-[#131522] hover:bg-[#181c2e] border border-[#1f2438] hover:border-[#333b58] transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-sm font-semibold text-slate-200 group-hover:text-white truncate">
                          {task.title}
                        </span>
                        <PriorityBadge priority={task.priority} size="sm" />
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-[#e5c07b] group-hover:translate-x-0.5 transition-all shrink-0 ml-3" />
                    </div>
                  ))}
                </div>
              )}

              {/* Projects */}
              {results.projects.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">
                    <Folder className="w-3.5 h-3.5 text-sky-400" />
                    Projects ({results.projects.length})
                  </div>
                  {results.projects.map(proj => (
                    <div
                      key={proj.id}
                      onClick={() => {
                        onSelectProject(proj.id);
                        onClose();
                      }}
                      className="group flex items-center justify-between p-3 rounded-xl bg-[#131522] hover:bg-[#181c2e] border border-[#1f2438] hover:border-[#333b58] transition-all cursor-pointer"
                    >
                      <div className="min-w-0">
                        <h5 className="text-sm font-semibold text-slate-200 group-hover:text-white truncate">
                          {proj.name}
                        </h5>
                        <p className="text-xs text-slate-400 truncate">{proj.category}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-3" />
                    </div>
                  ))}
                </div>
              )}

              {/* Team Members */}
              {results.team.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">
                    <Users className="w-3.5 h-3.5 text-purple-400" />
                    Team Members ({results.team.length})
                  </div>
                  {results.team.map(member => (
                    <div
                      key={member.id}
                      onClick={() => {
                        onSelectTeam(member.id);
                        onClose();
                      }}
                      className="group flex items-center justify-between p-3 rounded-xl bg-[#131522] hover:bg-[#181c2e] border border-[#1f2438] hover:border-[#333b58] transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-7 h-7 rounded-full object-cover border border-white/10"
                        />
                        <div>
                          <h5 className="text-sm font-semibold text-slate-200 group-hover:text-white">
                            {member.name}
                          </h5>
                          <span className="text-[11px] text-slate-400">{member.role}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-3" />
                    </div>
                  ))}
                </div>
              )}

              {/* Comments */}
              {results.comments.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    Discussions & Comments ({results.comments.length})
                  </div>
                  {results.comments.map(c => (
                    <div
                      key={c.id}
                      onClick={() => {
                        api.getTask(c.taskId).then(task => {
                          onSelectTask(task);
                          onClose();
                        });
                      }}
                      className="p-3 rounded-xl bg-[#131522] hover:bg-[#181c2e] border border-[#1f2438] hover:border-[#333b58] transition-all cursor-pointer"
                    >
                      <span className="text-[11px] text-slate-400 block mb-1">
                        In task: <span className="text-slate-200 font-medium">{c.taskTitle}</span>
                      </span>
                      <p className="text-xs text-slate-300 italic">"{c.text}"</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-[#090b12] border-t border-[#1b2033] flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[#181c2c] border border-white/5 font-mono text-[10px]">
                Enter
              </kbd>{' '}
              to select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[#181c2c] border border-white/5 font-mono text-[10px]">
                Esc
              </kbd>{' '}
              to close
            </span>
          </div>
          <span>Taskora Spotlight</span>
        </div>
      </div>
    </div>
  );
};

'use client'

import { useState, useEffect, useRef } from 'react';
import { categories, getTotalProblems, type Category } from '@/data/problems';

type Progress = Record<string, boolean>;

function getInitialProgress(): Progress {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem('leetcode-progress');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export default function Home() {
  const [progress, setProgress] = useState<Progress>(getInitialProgress);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    localStorage.setItem('leetcode-progress', JSON.stringify(progress));
  }, [progress]);

  const toggleProblem = (problemId: string) => {
    setProgress(prev => ({
      ...prev,
      [problemId]: !prev[problemId]
    }));
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedCategories(new Set(categories.map(c => c.id)));
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  const markAllDone = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      const newProgress = { ...progress };
      category.problems.forEach(p => {
        newProgress[p.id] = true;
      });
      setProgress(newProgress);
    }
  };

  const markAllUndone = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      const newProgress = { ...progress };
      category.problems.forEach(p => {
        newProgress[p.id] = false;
      });
      setProgress(newProgress);
    }
  };

  const resetAll = () => {
    if (confirm('Are you sure you want to reset all progress?')) {
      setProgress({});
    }
  };

  const getCompletedCount = (category: Category) => {
    return category.problems.filter(p => progress[p.id]).length;
  };

  const getTotalCompleted = () => {
    return Object.values(progress).filter(Boolean).length;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#22c55e';
      case 'Medium': return '#f59e0b';
      case 'Hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const filteredCategories = categories.map(category => ({
    ...category,
    problems: category.problems.filter(problem => {
      const matchesSearch = problem.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDifficulty = filterDifficulty === 'all' || problem.difficulty === filterDifficulty;
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'done' && progress[problem.id]) ||
        (filterStatus === 'undone' && !progress[problem.id]);
      return matchesSearch && matchesDifficulty && matchesStatus;
    })
  })).filter(category => category.problems.length > 0);

  const totalProblems = getTotalProblems();
  const totalCompleted = getTotalCompleted();
  const progressPercentage = (totalCompleted / totalProblems * 100).toFixed(1);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      color: '#1e293b',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        padding: '24px 0',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div>
              <h1 style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                margin: 0,
                color: '#0f172a',
                letterSpacing: '-0.025em'
              }}>
                LeetCode Tracker
              </h1>
              <p style={{
                color: '#64748b',
                margin: '4px 0 0 0',
                fontSize: '0.875rem'
              }}>
                {totalProblems} problems • 27 categories
              </p>
            </div>
            
            {/* Progress Circle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                position: 'relative',
                width: '64px',
                height: '64px'
              }}>
                <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="3"
                    strokeDasharray={`${progressPercentage}, 100`}
                    style={{ transition: 'stroke-dasharray 0.5s ease' }}
                  />
                </svg>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#6366f1'
                }}>
                  {progressPercentage}%
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
                  {totalCompleted}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>completed</div>
              </div>
            </div>
          </div>
          
          {/* Search & Filters */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginTop: '20px',
            flexWrap: 'wrap'
          }}>
            <input
              type="text"
              placeholder="Search problems..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#fff',
                color: '#1e293b',
                width: '240px',
                outline: 'none',
                fontSize: '0.875rem',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#6366f1'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
            
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#fff',
                color: '#1e293b',
                cursor: 'pointer',
                outline: 'none',
                fontSize: '0.875rem'
              }}
            >
              <option value="all">All Levels</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#fff',
                color: '#1e293b',
                cursor: 'pointer',
                outline: 'none',
                fontSize: '0.875rem'
              }}
            >
              <option value="all">All Status</option>
              <option value="done">Done</option>
              <option value="undone">Not Done</option>
            </select>
            
            <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
              <button
                onClick={expandAll}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  color: '#475569',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  transition: 'all 0.2s'
                }}
              >
                Expand
              </button>
              <button
                onClick={collapseAll}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  color: '#475569',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  transition: 'all 0.2s'
                }}
              >
                Collapse
              </button>
              <button
                onClick={resetAll}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1px solid #fecaca',
                  background: '#fef2f2',
                  color: '#dc2626',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  transition: 'all 0.2s'
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredCategories.map((category) => {
            const isExpanded = expandedCategories.has(category.id);
            const completedCount = getCompletedCount(category);
            const totalCount = category.problems.length;
            const categoryPercent = totalCount > 0 ? (completedCount / totalCount * 100) : 0;

            return (
              <div
                key={category.id}
                style={{
                  background: '#fff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.2s'
                }}
              >
                {/* Category Header */}
                <div
                  onClick={() => toggleCategory(category.id)}
                  style={{
                    padding: '16px 20px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: completedCount === totalCount && totalCount > 0 
                        ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                        : '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: completedCount === totalCount && totalCount > 0 ? '#fff' : '#64748b',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      transition: 'all 0.3s'
                    }}>
                      {completedCount === totalCount && totalCount > 0 ? '✓' : category.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#0f172a' }}>
                        {category.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                        {completedCount} of {totalCount} completed
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Mini Progress Bar */}
                    <div style={{
                      width: '100px',
                      height: '6px',
                      background: '#f1f5f9',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${categoryPercent}%`,
                        background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                        borderRadius: '3px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <span style={{
                      fontSize: '0.875rem',
                      color: '#64748b',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s'
                    }}>
                      ▼
                    </span>
                  </div>
                </div>

                {/* Problems List */}
                {isExpanded && (
                  <div style={{ 
                    borderTop: '1px solid #f1f5f9',
                    animation: 'slideDown 0.2s ease'
                  }}>
                    <style>{`
                      @keyframes slideDown {
                        from { opacity: 0; transform: translateY(-10px); }
                        to { opacity: 1; transform: translateY(0); }
                      }
                    `}</style>
                    
                    {/* Category Actions */}
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      padding: '12px 20px',
                      background: '#fafbfc',
                      borderBottom: '1px solid #f1f5f9'
                    }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); markAllDone(category.id); }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: 'none',
                          background: '#22c55e',
                          color: '#fff',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 500
                        }}
                      >
                        Mark All Done
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); markAllUndone(category.id); }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          background: '#fff',
                          color: '#64748b',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 500
                        }}
                      >
                        Clear All
                      </button>
                    </div>

                    {/* Problems Grid */}
                    <div style={{ padding: '8px' }}>
                      {category.problems.map((problem, index) => (
                        <div
                          key={problem.id}
                          onClick={() => toggleProblem(problem.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 16px',
                            gap: '16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            background: progress[problem.id] ? '#f0fdf4' : 'transparent',
                            transition: 'all 0.15s'
                          }}
                        >
                          {/* Number */}
                          <div style={{
                            width: '28px',
                            fontSize: '0.75rem',
                            color: '#94a3b8',
                            fontWeight: 500
                          }}>
                            {index + 1}
                          </div>
                          
                          {/* Toggle */}
                          <div style={{
                            width: '44px',
                            height: '24px',
                            borderRadius: '12px',
                            background: progress[problem.id] ? '#22c55e' : '#e2e8f0',
                            position: 'relative',
                            transition: 'background 0.2s',
                            flexShrink: 0
                          }}>
                            <div style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              background: '#fff',
                              position: 'absolute',
                              top: '2px',
                              left: progress[problem.id] ? '22px' : '2px',
                              transition: 'left 0.2s',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                            }} />
                          </div>
                          
                          {/* Problem Name */}
                          <div style={{ flex: 1, fontWeight: 500, fontSize: '0.875rem' }}>
                            {problem.name}
                          </div>
                          
                          {/* Difficulty Badge */}
                          <span style={{
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.025em',
                            background: `${getDifficultyColor(problem.difficulty)}15`,
                            color: getDifficultyColor(problem.difficulty)
                          }}>
                            {problem.difficulty}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '32px 24px',
        color: '#94a3b8',
        fontSize: '0.75rem'
      }}>
        Progress saved locally in your browser
      </footer>
    </div>
  );
}

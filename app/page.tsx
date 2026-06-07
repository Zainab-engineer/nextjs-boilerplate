"use client";
import React, { useState, useEffect } from 'react';

type Mode = 'pomodoro' | 'short' | 'long';

type Task = {
  id: string;
  title: string;
  completed: boolean;
  pomodoro_count: number;
  est: number;
  created_at: string;
};

const COLORS = {
  pomodoro: 'bg-[#ba4949]',
  short: 'bg-[#38858a]',
  long: 'bg-[#397097]',
};

export default function Pomodoro() {
  const [mode, setMode] = useState<Mode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [est, setEst] = useState(1);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => { loadTasks(); }, []);

  async function loadTasks() {
    const res = await fetch('/api/tasks');
    if (res.ok) setTasks(await res.json());
  }

  const handleModeChange = (newMode: Mode, time: number) => {
    setMode(newMode);
    setTimeLeft(time * 60);
    setIsActive(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  async function addTask() {
    if (!newTask.trim()) return;
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTask, est }),
    });
    if (res.ok) loadTasks();
    setNewTask('');
    setEst(1);
    setIsAdding(false);
  }

  async function completePomodoro(task: Task) {
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pomodoro_count: task.pomodoro_count + 1 }),
    });
    loadTasks();
  }

  async function toggleCompleted(task: Task) {
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !task.completed }),
    });
    loadTasks();
  }

  async function deleteTask(id: string) {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    loadTasks();
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${COLORS[mode]} font-sans text-white pb-20`}>
      <nav className="max-w-2xl mx-auto flex justify-between items-center p-4 border-b border-black/10">
        <div className="flex items-center gap-2 font-bold text-xl">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Pomofocus
        </div>
        <div className="flex gap-2">
          <button className="bg-white/20 px-3 py-1 rounded text-sm backdrop-blur-sm hover:bg-white/30 transition">Report</button>
          <button className="bg-white/20 px-3 py-1 rounded text-sm backdrop-blur-sm hover:bg-white/30 transition">Setting</button>
          <button className="bg-white/20 px-3 py-1 rounded text-sm backdrop-blur-sm hover:bg-white/30 transition">Sign In</button>
        </div>
      </nav>

      <main className="max-w-md mx-auto mt-10 px-4">
        <div className="bg-white/10 rounded-lg p-6 text-center backdrop-blur-md">
          <div className="flex justify-center gap-2 sm:gap-4 mb-6">
            {(['pomodoro', 'short', 'long'] as const).map((m) => (
              <button 
                key={m}
                onClick={() => handleModeChange(m, m === 'pomodoro' ? 25 : m === 'short' ? 5 : 15)}
                className={`px-3 py-1 rounded font-bold capitalize ${mode === m ? 'bg-black/20' : 'hover:bg-black/5'}`}
              >
                {m === 'pomodoro' ? 'Pomodoro' : m === 'short' ? 'Short Break' : 'Long Break'}
              </button>
            ))}
          </div>

          <h1 className="text-8xl font-bold mb-8 tabular-nums">{formatTime(timeLeft)}</h1>

          <button 
            onClick={() => setIsActive(!isActive)}
            className="bg-white text-[#ba4949] text-2xl font-bold px-12 py-3 rounded shadow-[0_6px_0_rgb(235,235,235)] active:shadow-none active:translate-y-1 transition-all uppercase"
          >
            {isActive ? 'PAUSE' : 'START'}
          </button>
        </div>

        <div className="mt-6">
          <div className="text-center mb-4">
            <p className="opacity-60 text-sm">#{tasks.length > 0 ? 1 : 0}</p>
            <p className="font-medium text-lg">Time to focus!</p>
          </div>

          <div className="flex justify-between items-center border-b-2 border-white/20 pb-3 mb-4">
            <span className="text-xl font-bold">Tasks</span>
            <button className="bg-white/20 p-1 rounded hover:bg-white/30 transition">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
            </button>
          </div>

          <div className="space-y-2 mb-4">
            {tasks.map(task => (
              <div key={task.id} className="bg-white text-gray-800 p-4 rounded flex justify-between items-center border-l-8 border-[#ba4949] shadow-sm">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleCompleted(task)}>
                  <span className={`font-bold ${task.completed ? 'line-through text-gray-400' : ''}`}>{task.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm font-bold">{task.pomodoro_count}/{task.est}</span>
                  <button 
                    onClick={() => completePomodoro(task)}
                    className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold hover:bg-green-200 transition"
                  >
                    +1
                  </button>
                  <button onClick={() => deleteTask(task.id)} className="text-red-400 hover:text-red-600 text-lg leading-none">&times;</button>
                </div>
              </div>
            ))}
          </div>

          {!isAdding ? (
            <button 
              onClick={() => setIsAdding(true)}
              className="w-full py-4 border-2 border-dashed border-white/30 rounded-lg bg-black/10 flex items-center justify-center gap-2 font-bold opacity-80 hover:opacity-100 transition-all"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Task
            </button>
          ) : (
            <div className="bg-white rounded-lg p-6 text-gray-800 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
              <input 
                autoFocus
                placeholder="What are you working on?"
                className="w-full text-xl font-bold outline-none mb-4 italic text-gray-500 placeholder:text-gray-300"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
              />
              <p className="font-bold mb-2">Est Pomodoros</p>
              <div className="flex items-center gap-2 mb-6">
                <input 
                  type="number" 
                  className="bg-gray-100 w-20 p-2 rounded font-bold outline-none" 
                  value={est} 
                  onChange={(e) => setEst(parseInt(e.target.value) || 1)}
                />
                <button onClick={() => setEst(prev => prev + 1)} className="bg-white border p-1 px-3 rounded shadow-sm hover:bg-gray-50">▲</button>
                <button onClick={() => setEst(prev => Math.max(1, prev - 1))} className="bg-white border p-1 px-3 rounded shadow-sm hover:bg-gray-50">▼</button>
              </div>
              <div className="flex justify-end gap-4 bg-gray-100 -mx-6 -mb-6 p-4 rounded-b-lg">
                <button onClick={() => setIsAdding(false)} className="text-gray-400 font-bold hover:text-gray-600 transition">Cancel</button>
                <button 
                  onClick={addTask}
                  className="bg-[#222] text-white px-6 py-2 rounded font-bold shadow-md hover:bg-black transition"
                >Save</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

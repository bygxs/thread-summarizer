import React, { useState, useEffect } from 'react';
import { AIInstruction } from '../types';
import { getInstructions, saveInstruction, updateInstruction, deleteInstruction, setActiveInstruction } from '../services/dbService';

interface Toast {
  message: string;
  type: 'success' | 'error';
}

const SettingsView: React.FC = () => {
  const [instructions, setInstructions] = useState<AIInstruction[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchInstructions = async () => {
    setIsLoading(true);
    const data = await getInstructions();
    setInstructions(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchInstructions();
  }, []);

  const handleSave = async () => {
    if (!name.trim() || !content.trim()) {
      showToast('Name and content are required', 'error');
      return;
    }

    try {
      if (editingId !== null) {
        const original = instructions.find(i => i.id === editingId);
        if (original) {
          await updateInstruction({ ...original, name, content });
          showToast('Protocol updated successfully');
        }
      } else {
        await saveInstruction({ name, content, isActive: instructions.length === 0 });
        showToast('New protocol saved');
      }

      setEditingId(null);
      setName('');
      setContent('');
      fetchInstructions();
    } catch (err) {
      showToast('Failed to save protocol', 'error');
    }
  };

  const handleEdit = (inst: AIInstruction) => {
    setEditingId(inst.id);
    setName(inst.name);
    setContent(inst.content);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this instruction template?')) {
      try {
        await deleteInstruction(id);
        showToast('Protocol deleted');
        fetchInstructions();
      } catch (err) {
        showToast('Failed to delete', 'error');
      }
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await setActiveInstruction(id);
      showToast('Protocol activated');
      fetchInstructions();
    } catch (err) {
      showToast('Failed to activate', 'error');
    }
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-20 right-4 md:right-8 z-50 flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl border animate-in slide-in-from-right-10 duration-300 ${
          toast.type === 'success' 
            ? 'bg-emerald-500 text-white border-emerald-400' 
            : 'bg-rose-500 text-white border-rose-400'
        }`}>
          {toast.type === 'success' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
          <span className="font-bold text-sm">{toast.message}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">AI Settings</h2>
          <p className="text-slate-500 dark:text-dark-400 mt-1">Configure exactly how the AI processes your chat threads.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Editor Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-dark-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-dark-800 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              {editingId ? 'Edit Protocol' : 'New Protocol'}
              <span className="text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded uppercase tracking-tighter">System Logic</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Protocol Name</label>
                <input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dual-Report Handover"
                  className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-slate-200"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Instructions Content</label>
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Describe exactly how you want the narrative and technical summaries formatted..."
                  className="w-full h-80 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none dark:text-slate-300 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={handleSave}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95"
                >
                  {editingId ? 'Update Template' : 'Save Template'}
                </button>
                {editingId && (
                  <button 
                    onClick={() => {setEditingId(null); setName(''); setContent('');}}
                    className="px-6 py-3 bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-bold active:scale-95"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Templates List */}
        <div className="space-y-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Stored Protocols</h3>
          <div className="space-y-4">
            {instructions.map((inst) => (
              <div 
                key={inst.id}
                className={`p-5 rounded-2xl border transition-all ${
                  inst.isActive 
                  ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' 
                  : 'bg-white dark:bg-dark-900 border-slate-200 dark:border-dark-800 hover:border-slate-300 dark:hover:border-dark-700'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    inst.isActive 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-100 dark:bg-dark-800 text-slate-500'
                  }`}>
                    {inst.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(inst)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-dark-800 rounded text-slate-400 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                    </button>
                    {!inst.isDefault && (
                      <button onClick={() => handleDelete(inst.id)} className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded text-slate-400 hover:text-rose-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      </button>
                    )}
                  </div>
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">{inst.name}</h4>
                <p className="text-xs text-slate-500 dark:text-dark-400 line-clamp-2 italic mb-4">
                  {inst.content}
                </p>
                {!inst.isActive && (
                  <button 
                    onClick={() => handleActivate(inst.id)}
                    className="w-full py-2 bg-slate-100 dark:bg-dark-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white rounded-lg text-xs font-bold transition-all text-slate-600 dark:text-dark-300 active:scale-95"
                  >
                    Activate Protocol
                  </button>
                )}
              </div>
            ))}
            {instructions.length === 0 && !isLoading && (
              <div className="text-center py-10 bg-slate-50 dark:bg-dark-950 rounded-2xl border-2 border-dashed border-slate-200 dark:border-dark-800">
                <p className="text-xs text-slate-400">No custom protocols found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
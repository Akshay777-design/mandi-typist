import React, { useState, useMemo } from 'react';
import { Vegetable } from '../types';
import { Search, Plus, Trash2, Edit2, RotateCcw, Check, X } from 'lucide-react';

interface VegetablesManagerProps {
  vegetables: Vegetable[];
  onUpdateVegetables: (updated: Vegetable[]) => void;
  onResetToDefaults: () => void;
}

export const VegetablesManager: React.FC<VegetablesManagerProps> = ({
  vegetables,
  onUpdateVegetables,
  onResetToDefaults,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newManglish, setNewManglish] = useState('');
  const [newMalayalam, setNewMalayalam] = useState('');
  const [newCategory, setNewCategory] = useState('Common');

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editManglish, setEditManglish] = useState('');
  const [editMalayalam, setEditMalayalam] = useState('');

  const filteredVegetables = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return vegetables;
    return vegetables.filter(
      (v) =>
        v.manglish.toLowerCase().includes(q) ||
        v.malayalam.toLowerCase().includes(q) ||
        (v.category && v.category.toLowerCase().includes(q))
    );
  }, [vegetables, searchTerm]);

  const handleStartEdit = (veg: Vegetable) => {
    setEditingId(veg.id);
    setEditManglish(veg.manglish);
    setEditMalayalam(veg.malayalam);
  };

  const handleSaveEdit = (id: string) => {
    if (!editManglish.trim()) return;
    const updated = vegetables.map((v) =>
      v.id === id
        ? { ...v, manglish: editManglish.trim(), malayalam: editMalayalam.trim() }
        : v
    );
    onUpdateVegetables(updated);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (vegetables.length <= 5) {
      alert('You must have at least 5 vegetables for typing practice.');
      return;
    }
    const updated = vegetables.filter((v) => v.id !== id);
    onUpdateVegetables(updated);
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newManglish.trim()) return;

    const newVeg: Vegetable = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      manglish: newManglish.trim(),
      malayalam: newMalayalam.trim() || newManglish.trim(),
      category: newCategory.trim() || 'Custom',
      isCustom: true,
    };

    onUpdateVegetables([newVeg, ...vegetables]);
    setNewManglish('');
    setNewMalayalam('');
    setIsAddingNew(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Mandi Vegetable Catalog
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Customize Manglish spellings to match your wholesale shop’s billing codes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onResetToDefaults()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors min-h-[44px]"
            title="Reset to 63 default Kerala vegetable items"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Add New Item Form Accordion */}
      {isAddingNew && (
        <form
          onSubmit={handleAddNew}
          className="p-5 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 shadow-sm animate-in fade-in duration-150"
        >
          <div className="font-semibold text-sm text-emerald-900 dark:text-emerald-200 mb-3">
            Add Custom Vegetable Item
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Manglish Billing Name *
              </label>
              <input
                type="text"
                required
                value={newManglish}
                onChange={(e) => setNewManglish(e.target.value)}
                placeholder="e.g. Takali, Cabbage"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Malayalam Script Name
              </label>
              <input
                type="text"
                value={newMalayalam}
                onChange={(e) => setNewMalayalam(e.target.value)}
                placeholder="e.g. തക്കാളി"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-malayalam focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Common, Beans, Greens..."
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm focus:border-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors min-h-[44px]"
            >
              Save Vegetable
            </button>
          </div>
        </form>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Search across ${vegetables.length} vegetables by Manglish or Malayalam...`}
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-600 focus:outline-hidden shadow-xs"
        />
      </div>

      {/* Vegetable Cards / Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3 sm:p-5 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {filteredVegetables.map((veg) => {
            const isEditing = editingId === veg.id;

            if (isEditing) {
              return (
                <div
                  key={veg.id}
                  className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 flex flex-col gap-2"
                >
                  <input
                    type="text"
                    value={editManglish}
                    onChange={(e) => setEditManglish(e.target.value)}
                    placeholder="Manglish Name"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                  />
                  <input
                    type="text"
                    value={editMalayalam}
                    onChange={(e) => setEditMalayalam(e.target.value)}
                    placeholder="Malayalam Name"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-malayalam"
                  />
                  <div className="flex items-center justify-end gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(veg.id)}
                      className="p-1.5 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={veg.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-800"
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                      {veg.manglish}
                    </span>
                    {veg.isCustom && (
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">
                        Custom
                      </span>
                    )}
                  </div>
                  <span className="font-malayalam text-xs text-emerald-800 dark:text-emerald-400 truncate mt-0.5">
                    {veg.malayalam}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(veg)}
                    className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Edit spelling"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(veg.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Delete vegetable"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredVegetables.length === 0 && (
          <div className="text-center py-8 text-sm text-slate-500">
            No vegetables found matching &apos;{searchTerm}&apos;.
          </div>
        )}
      </div>
    </div>
  );
};

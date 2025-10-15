import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { FutureSketchData, VisionBoardImage } from '../../types';
import Card from '../../components/Card';
import { SaveIcon, PlusCircleIcon, TrashIcon } from '../../components/icons/Icons';
import { v4 as uuidv4 } from 'uuid';

const FutureSketchPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<FutureSketchData>({
    threeYearDream: '', odysseyPlan: '', visionBoard: [], futureCalendar: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('exercises');

  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageCaption, setNewImageCaption] = useState('');

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: sketchData, error } = await supabase
        .from('future_sketch')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      if (sketchData) {
        setData({
          threeYearDream: sketchData.three_year_dream || '',
          odysseyPlan: sketchData.odyssey_plan || '',
          visionBoard: sketchData.vision_board || [],
          futureCalendar: sketchData.future_calendar || ''
        });
      }
    } catch (err: any) { setError(err.message); } 
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('future_sketch')
        .upsert({
          user_id: user.id,
          three_year_dream: data.threeYearDream,
          odyssey_plan: data.odysseyPlan,
          vision_board: data.visionBoard,
          future_calendar: data.futureCalendar
        }, { onConflict: 'user_id' });
      
      if (error) throw error;
    } catch (err: any) { setError(err.message); } 
    finally { setSaving(false); }
  };

  const handleChange = (field: keyof Omit<FutureSketchData, 'visionBoard'>, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const addImageToBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;
    const newImage: VisionBoardImage = {
      id: uuidv4(),
      url: newImageUrl,
      caption: newImageCaption,
    };
    setData(prev => ({ ...prev, visionBoard: [...prev.visionBoard, newImage]}));
    setNewImageUrl('');
    setNewImageCaption('');
  };

  const deleteImageFromBoard = (id: string) => {
    setData(prev => ({ ...prev, visionBoard: prev.visionBoard.filter(img => img.id !== id) }));
  };


  if (loading) return <div className="text-center p-8">Loading your future...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Future Sketch</h1>
            <p className="mt-2 text-gray-400 max-w-3xl">This is your medium-term (3-5 years) vision. It makes your Life Compass more concrete and actionable.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-4 md:mt-0 flex items-center justify-center px-4 py-2 font-bold text-white bg-cyan-500 rounded-md hover:bg-cyan-600 disabled:opacity-50 transition-colors"
          >
            <SaveIcon className="w-5 h-5 mr-2" />
            {saving ? 'Saving...' : 'Save Sketch'}
          </button>
      </div>
      {error && <p className="text-red-500 bg-red-500/10 p-3 rounded-md">Error: {error}</p>}
      
      <div className="border-b border-gray-700">
        <nav className="flex -mb-px space-x-6">
          <button onClick={() => setActiveTab('exercises')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'exercises' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-gray-400 hover:text-white'}`}>
              Core Exercises
          </button>
          <button onClick={() => setActiveTab('visionBoard')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'visionBoard' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-gray-400 hover:text-white'}`}>
              Vision Board ({data.visionBoard.length})
          </button>
        </nav>
      </div>

      <div className={activeTab === 'exercises' ? 'block' : 'hidden'}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card><h2 className="font-bold">3-Year Dream</h2><p className="text-sm text-gray-400 mt-1">Describe your ideal life three years from now.</p><textarea value={data.threeYearDream} onChange={(e) => handleChange('threeYearDream', e.target.value)} rows={8} className="w-full p-2 mt-2 text-white bg-gray-900 border-gray-700 rounded-md"/></Card>
            <Card><h2 className="font-bold">Odyssey Plan</h2><p className="text-sm text-gray-400 mt-1">Sketch out three different five-year plans.</p><textarea value={data.odysseyPlan} onChange={(e) => handleChange('odysseyPlan', e.target.value)} rows={8} className="w-full p-2 mt-2 text-white bg-gray-900 border-gray-700 rounded-md"/></Card>
            <Card className="lg:col-span-2"><h2 className="font-bold">Future Calendar</h2><p className="text-sm text-gray-400 mt-1">What major events or milestones will you have?</p><textarea value={data.futureCalendar} onChange={(e) => handleChange('futureCalendar', e.target.value)} rows={8} className="w-full p-2 mt-2 text-white bg-gray-900 border-gray-700 rounded-md"/></Card>
        </div>
      </div>
      
      <div className={activeTab === 'visionBoard' ? 'block' : 'hidden'}>
        <Card>
          <form onSubmit={addImageToBoard} className="flex flex-col gap-3 sm:flex-row">
              <input type="url" placeholder="Image URL" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} required className="flex-grow p-2 text-white bg-gray-900 border-gray-700 rounded-md"/>
              <input type="text" placeholder="Caption (optional)" value={newImageCaption} onChange={e => setNewImageCaption(e.target.value)} className="flex-grow p-2 text-white bg-gray-900 border-gray-700 rounded-md"/>
              <button type="submit" className="flex items-center justify-center px-4 py-2 font-semibold text-white bg-cyan-500 rounded-md hover:bg-cyan-600">
                  <PlusCircleIcon className="w-5 h-5 mr-2"/> Add Image
              </button>
          </form>
        </Card>
        <div className="grid grid-cols-1 gap-4 mt-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {data.visionBoard.map(image => (
              <div key={image.id} className="relative group">
                <img src={image.url} alt={image.caption} className="object-cover w-full h-48 rounded-lg shadow-lg"/>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <p className="text-xs text-white">{image.caption}</p>
                  <button onClick={() => deleteImageFromBoard(image.id)} className="self-end p-1 bg-red-600/80 rounded-full hover:bg-red-500">
                    <TrashIcon className="w-4 h-4 text-white"/>
                  </button>
                </div>
              </div>
            ))}
        </div>
        {data.visionBoard.length === 0 && <p className="mt-6 text-center text-gray-400">Your vision board is empty. Add some images to bring your future to life!</p>}
      </div>

    </div>
  );
};

export default FutureSketchPage;
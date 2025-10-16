import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { LifeCompassData, RoleModel, BecomingProfile } from '../../types';
import Card from '../../components/Card';
import { SaveIcon, PlusCircleIcon, TrashIcon, EditIcon } from '../../components/icons/Icons';
import { v4 as uuidv4 } from 'uuid';
import { useAutoSave } from '../../hooks/useAutoSave';
import useLocalStorage from '../../hooks/useLocalStorage';
import ExpandableGuide from '../../components/ExpandableGuide';
import { GUIDE_CONTENT } from '../../constants/guideContent';

const LifeCompassPage: React.FC = () => {
  const { user } = useAuth();
  const [draft, setDraft] = useLocalStorage<LifeCompassData | null>(`life-compass-draft-${user?.id}`, null);
  const [data, setData] = useState<LifeCompassData>({
    eulogy: '', bucketList: '', mission: '', success: '',
    roleModels: [], becoming: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: compassData, error } = await supabase
        .from('life_compass')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      const loadedData = compassData ? {
        eulogy: compassData.eulogy || '',
        bucketList: compassData.bucket_list || '',
        mission: compassData.mission || '',
        success: compassData.success || '',
        roleModels: compassData.role_models || [],
        becoming: compassData.becoming || []
      } : { eulogy: '', bucketList: '', mission: '', success: '', roleModels: [], becoming: [] };

      if (draft && JSON.stringify(draft) !== JSON.stringify(loadedData)) {
        setData(draft);
      } else {
        setData(loadedData);
        setDraft(null);
      }
    } catch (err: any) { setError(err.message); } 
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('life_compass')
        .upsert({
          user_id: user.id,
          eulogy: data.eulogy,
          bucket_list: data.bucketList,
          mission: data.mission,
          success: data.success,
          role_models: data.roleModels.map(({ editing, ...rest }) => rest),
          becoming: data.becoming.map(({ editing, ...rest }) => rest),
        }, { onConflict: 'user_id' });

      if (error) throw error;
      setLastSaved(new Date());
      setDraft(null);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  }, [user, data, setDraft]);

  useAutoSave(data, {
    onSave: handleSave,
    delay: 3000,
    enabled: !loading
  });

  useEffect(() => {
    if (!loading && user) {
      setDraft(data);
    }
  }, [data, loading, user, setDraft]);
  
  // Generic handler for simple text areas
  const handleChange = (field: keyof LifeCompassData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  // --- Role Model Handlers ---
  const addRoleModel = () => {
    const newModel: RoleModel = { id: uuidv4(), name: 'New Role Model', description: '', imageUrl: '', emulate: '', avoid: '', editing: true };
    setData(p => ({ ...p, roleModels: [...p.roleModels, newModel] }));
  };
  const updateRoleModel = (id: string, field: keyof RoleModel, value: any) => {
    setData(p => ({ ...p, roleModels: p.roleModels.map(rm => rm.id === id ? { ...rm, [field]: value } : rm) }));
  };
  const deleteRoleModel = (id: string) => {
    setData(p => ({ ...p, roleModels: p.roleModels.filter(rm => rm.id !== id) }));
  };

  // --- Becoming Profile Handlers ---
  const addBecomingProfile = () => {
    const newProfile: BecomingProfile = { id: uuidv4(), who: 'New Identity', url: '', traits: '', sacrifices: '', editing: true };
    setData(p => ({ ...p, becoming: [...p.becoming, newProfile] }));
  };
  const updateBecomingProfile = (id: string, field: keyof BecomingProfile, value: any) => {
    setData(p => ({ ...p, becoming: p.becoming.map(bp => bp.id === id ? { ...bp, [field]: value } : bp) }));
  };
  const deleteBecomingProfile = (id: string) => {
    setData(p => ({ ...p, becoming: p.becoming.filter(bp => bp.id !== id) }));
  };


  if (loading) return <div className="text-center p-8">Loading your compass...</div>;

  return (
    <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Life Compass</h1>
              <p className="mt-2 text-gray-400 max-w-3xl">Define your 'North Star'. This is your long-term vision that guides all your actions.</p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col items-end gap-2">
              {lastSaved && (
                <span className="text-xs text-gray-400">
                  Auto-saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center justify-center px-4 py-2 font-bold text-white bg-cyan-500 rounded-md hover:bg-cyan-600 disabled:opacity-50 transition-colors"
              >
                <SaveIcon className="w-5 h-5 mr-2" />
                {saving ? 'Saving...' : 'Save Now'}
              </button>
            </div>
        </div>
        {error && <p className="text-red-500 bg-red-500/10 p-3 rounded-md">Error: {error}</p>}

        {/* Core Exercises */}
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Core Exercises</h2>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                  <h2 className="font-bold">The Eulogy Method</h2>
                  <div className="mt-2">
                    <ExpandableGuide title="How to approach this exercise" content={GUIDE_CONTENT.eulogyMethod} />
                  </div>
                  <textarea value={data.eulogy} onChange={e => handleChange('eulogy', e.target.value)} rows={8} className="w-full p-2 mt-3 text-white bg-gray-900 border-gray-700 rounded-md"/>
                </Card>
                <Card>
                  <h2 className="font-bold">The Bucket List</h2>
                  <div className="mt-2">
                    <ExpandableGuide title="How to approach this exercise" content={GUIDE_CONTENT.bucketList} />
                  </div>
                  <textarea value={data.bucketList} onChange={e => handleChange('bucketList', e.target.value)} rows={8} className="w-full p-2 mt-3 text-white bg-gray-900 border-gray-700 rounded-md"/>
                </Card>
                <Card>
                  <h2 className="font-bold">The Mission Prompt</h2>
                  <div className="mt-2">
                    <ExpandableGuide title="How to approach this exercise" content={GUIDE_CONTENT.missionPrompt} />
                  </div>
                  <textarea value={data.mission} onChange={e => handleChange('mission', e.target.value)} rows={8} className="w-full p-2 mt-3 text-white bg-gray-900 border-gray-700 rounded-md"/>
                </Card>
                <Card>
                  <h2 className="font-bold">The Success Prompt</h2>
                  <div className="mt-2">
                    <ExpandableGuide title="How to approach this exercise" content={GUIDE_CONTENT.successPrompt} />
                  </div>
                  <textarea value={data.success} onChange={e => handleChange('success', e.target.value)} rows={8} className="w-full p-2 mt-3 text-white bg-gray-900 border-gray-700 rounded-md"/>
                </Card>
            </div>
        </div>

        {/* Role Models */}
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Role Models ({data.roleModels.length})</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {data.roleModels.map(rm => <RoleModelCard key={rm.id} model={rm} onUpdate={updateRoleModel} onDelete={deleteRoleModel} />)}
                <button onClick={addRoleModel} className="flex flex-col items-center justify-center min-h-[200px] p-6 border-2 border-dashed border-gray-700 rounded-lg hover:bg-gray-800 transition-colors">
                  <PlusCircleIcon className="w-10 h-10 text-gray-500" />
                  <span className="mt-2 text-sm font-medium text-gray-400">Add Role Model</span>
                </button>
            </div>
        </div>

        {/* Who to Become */}
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Who to Become ({data.becoming.length})</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {data.becoming.map(bp => <BecomingCard key={bp.id} profile={bp} onUpdate={updateBecomingProfile} onDelete={deleteBecomingProfile} />)}
                <button onClick={addBecomingProfile} className="flex flex-col items-center justify-center min-h-[200px] p-6 border-2 border-dashed border-gray-700 rounded-lg hover:bg-gray-800 transition-colors">
                  <PlusCircleIcon className="w-10 h-10 text-gray-500" />
                  <span className="mt-2 text-sm font-medium text-gray-400">Add Identity Profile</span>
                </button>
            </div>
        </div>
    </div>
  );
};


const RoleModelCard: React.FC<{model: RoleModel, onUpdate: Function, onDelete: Function}> = ({model, onUpdate, onDelete}) => {
  const { id, name, description, imageUrl, emulate, avoid, editing } = model;
  if(editing) {
    return (
      <Card className="flex flex-col space-y-3">
        <input type="text" value={name} onChange={e => onUpdate(id, 'name', e.target.value)} className="w-full p-2 text-xl font-bold text-white bg-gray-900 border-gray-700 rounded-md"/>
        <input type="text" value={description} onChange={e => onUpdate(id, 'description', e.target.value)} placeholder="Description (e.g. Entrepreneur)" className="w-full p-2 text-sm text-gray-400 bg-gray-900 border-gray-700 rounded-md"/>
        <input type="text" value={imageUrl} onChange={e => onUpdate(id, 'imageUrl', e.target.value)} placeholder="Image URL" className="w-full p-2 text-sm bg-gray-900 border-gray-700 rounded-md"/>
        <textarea value={emulate} onChange={e => onUpdate(id, 'emulate', e.target.value)} placeholder="Qualities to emulate..." rows={3} className="w-full p-2 text-sm bg-gray-900 border-gray-700 rounded-md"/>
        <textarea value={avoid} onChange={e => onUpdate(id, 'avoid', e.target.value)} placeholder="Qualities to avoid..." rows={3} className="w-full p-2 text-sm bg-gray-900 border-gray-700 rounded-md"/>
        <button onClick={() => onUpdate(id, 'editing', false)} className="w-full py-2 text-sm font-semibold text-white bg-cyan-500 rounded-md hover:bg-cyan-600">Done</button>
      </Card>
    )
  }
  return (
    <Card className="flex flex-col">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">{name}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => onUpdate(id, 'editing', true)} className="p-1 text-gray-400 hover:text-white"><EditIcon className="w-4 h-4"/></button>
          <button onClick={() => onDelete(id)} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon className="w-4 h-4"/></button>
        </div>
      </div>
      {imageUrl && <img src={imageUrl} alt={name} className="object-cover w-full mt-3 rounded-md aspect-video"/>}
      <div className="mt-4">
        <h4 className="font-semibold text-green-400">Qualities to Emulate</h4>
        <p className="mt-1 text-sm text-white whitespace-pre-wrap">{emulate || "N/A"}</p>
      </div>
      <div className="mt-4">
        <h4 className="font-semibold text-red-400">Qualities to Avoid</h4>
        <p className="mt-1 text-sm text-white whitespace-pre-wrap">{avoid || "N/A"}</p>
      </div>
    </Card>
  )
}

const BecomingCard: React.FC<{profile: BecomingProfile, onUpdate: Function, onDelete: Function}> = ({profile, onUpdate, onDelete}) => {
  const { id, who, url, traits, sacrifices, editing } = profile;
  if(editing) {
    return (
      <Card className="flex flex-col space-y-3">
        <input type="text" value={who} onChange={e => onUpdate(id, 'who', e.target.value)} placeholder="Who you want to become..." className="w-full p-2 text-xl font-bold text-white bg-gray-900 border-gray-700 rounded-md"/>
        <input type="text" value={url} onChange={e => onUpdate(id, 'url', e.target.value)} placeholder="Image URL" className="w-full p-2 text-sm bg-gray-900 border-gray-700 rounded-md"/>
        <textarea value={traits} onChange={e => onUpdate(id, 'traits', e.target.value)} placeholder="What traits define this person?" rows={3} className="w-full p-2 text-sm bg-gray-900 border-gray-700 rounded-md"/>
        <textarea value={sacrifices} onChange={e => onUpdate(id, 'sacrifices', e.target.value)} placeholder="What are the costs/sacrifices?" rows={3} className="w-full p-2 text-sm bg-gray-900 border-gray-700 rounded-md"/>
        <button onClick={() => onUpdate(id, 'editing', false)} className="w-full py-2 text-sm font-semibold text-white bg-cyan-500 rounded-md hover:bg-cyan-600">Done</button>
      </Card>
    )
  }
  return (
    <Card className="flex flex-col">
       <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">{who}</h3>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => onUpdate(id, 'editing', true)} className="p-1 text-gray-400 hover:text-white"><EditIcon className="w-4 h-4"/></button>
          <button onClick={() => onDelete(id)} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon className="w-4 h-4"/></button>
        </div>
      </div>
      {url && <img src={url} alt={who} className="object-cover w-full mt-3 rounded-md aspect-video"/>}
       <div className="mt-4">
        <h4 className="font-semibold text-green-400">Defining Traits</h4>
        <p className="mt-1 text-sm text-white whitespace-pre-wrap">{traits || "N/A"}</p>
      </div>
      <div className="mt-4">
        <h4 className="font-semibold text-red-400">Costs & Sacrifices</h4>
        <p className="mt-1 text-sm text-white whitespace-pre-wrap">{sacrifices || "N/A"}</p>
      </div>
       <p className="mt-4 text-xs italic text-gray-400">Do you truly want to become this, or just experience the feeling of it?</p>
    </Card>
  )
}

export default LifeCompassPage;
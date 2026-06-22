import React, { useState } from 'react';
import { Bot, Upload, Loader2, Dumbbell, FileText } from 'lucide-react';
import { generateWorkoutPlan } from '../../lib/ai';

export function AIPlannerPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    goal: 'Muscle Gain',
    dietType: 'Veg',
    workoutSplit: 'Bro Split',
    photoBase64: null,
    photoMimeType: null,
  });

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      // Result is a data URL like: data:image/jpeg;base64,/9j/4AAQ...
      const base64String = reader.result.split(',')[1];
      setFormData(prev => ({
        ...prev,
        photoBase64: base64String,
        photoMimeType: file.type
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const plan = await generateWorkoutPlan(formData);
      setResult(plan);
      setStep(3); // Result step
    } catch (err) {
      setError(err.message || 'Something went wrong while generating the plan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-16 min-h-screen container mx-auto px-4 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white uppercase flex items-center justify-center gap-3">
          <Bot className="text-primary w-10 h-10" />
          AI Elite Planner
        </h1>
        <p className="text-muted-foreground mt-4 text-lg">
          Get a hyper-personalized workout and diet plan tailored for Rajasthan.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl mb-8">
          {error}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={() => setStep(2)} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Height (cm)</label>
              <input 
                required 
                type="number" 
                value={formData.height} 
                onChange={e => setFormData({...formData, height: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-primary"
                placeholder="e.g. 175"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Weight (kg)</label>
              <input 
                required 
                type="number" 
                value={formData.weight} 
                onChange={e => setFormData({...formData, weight: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-primary"
                placeholder="e.g. 70"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Primary Goal</label>
              <select 
                value={formData.goal} 
                onChange={e => setFormData({...formData, goal: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-primary"
              >
                <option>Muscle Gain</option>
                <option>Fat Loss</option>
                <option>Body Recomposition</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Diet Preference</label>
              <select 
                value={formData.dietType} 
                onChange={e => setFormData({...formData, dietType: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-primary"
              >
                <option>Veg</option>
                <option>Non-Veg</option>
                <option>Veg + Egg</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm text-zinc-400">Workout Split Preference</label>
              <select 
                value={formData.workoutSplit} 
                onChange={e => setFormData({...formData, workoutSplit: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-primary"
              >
                <option>Bro Split (One muscle a day)</option>
                <option>Push Pull Legs (Double muscle split)</option>
                <option>Upper / Lower Split</option>
                <option>Full Body</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full bg-primary text-black font-bold py-4 rounded-xl hover:bg-primary/90 transition-colors mt-4">
            Next Step
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleGenerate} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6 text-center">
          <Dumbbell className="w-16 h-16 text-zinc-700 mx-auto" />
          <h2 className="text-2xl font-bold text-white">Upload Physique Photo (Optional)</h2>
          <p className="text-zinc-400">Our Vision AI will analyze your body composition to better tailor your plan.</p>
          
          <div className="border-2 border-dashed border-zinc-700 rounded-xl p-8 relative hover:border-primary transition-colors">
            <input 
              type="file" 
              accept="image/*"
              onChange={handlePhotoUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-4">
              <Upload className="w-8 h-8 text-primary" />
              <span className="text-white font-medium">
                {formData.photoBase64 ? "Photo Uploaded! Click below to generate." : "Tap to upload or take a photo"}
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <button type="button" onClick={() => setStep(1)} className="flex-1 bg-zinc-800 text-white font-bold py-4 rounded-xl hover:bg-zinc-700 transition-colors">
              Back
            </button>
            <button disabled={loading} type="submit" className="flex-[2] bg-primary text-black font-bold py-4 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
              {loading ? (
                <><Loader2 className="animate-spin w-5 h-5" /> Generating...</>
              ) : (
                "Generate My Plan"
              )}
            </button>
          </div>
        </form>
      )}

      {step === 3 && result && (
        <div className="space-y-12 animate-in fade-in duration-500">
          
          {/* Diet Plan Section */}
          <section>
            <h2 className="text-3xl font-black italic tracking-tighter text-primary uppercase mb-6 flex items-center gap-2">
              <FileText /> Localized Diet Plan
            </h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <p className="text-zinc-300 mb-6">{result.diet_plan?.summary}</p>
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 mb-6 inline-block">
                <span className="text-zinc-400 text-sm">Target Calories:</span>
                <span className="text-2xl font-black text-white ml-2">{result.diet_plan?.daily_calories} kcal</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {result.diet_plan?.meals?.map((meal, idx) => (
                  <div key={idx} className="bg-zinc-950 p-5 rounded-xl border border-zinc-800">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-primary">{meal.time}</h3>
                      <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded-full">{meal.calories} kcal</span>
                    </div>
                    <p className="text-zinc-300 text-sm">{meal.food}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Workout Plan Section */}
          <section>
            <h2 className="text-3xl font-black italic tracking-tighter text-primary uppercase mb-6 flex items-center gap-2">
              <Dumbbell /> {result.workout_plan?.split_name || 'Workout Plan'}
            </h2>
            <div className="space-y-8">
              {result.workout_plan?.days?.map((day, idx) => (
                <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                  <div className="border-b border-zinc-800 pb-4 mb-6">
                    <h3 className="text-2xl font-black text-white">{day.day}</h3>
                    <p className="text-primary font-medium">{day.focus}</p>
                  </div>
                  
                  <div className="space-y-6">
                    {day.exercises?.map((ex, exIdx) => (
                      <div key={exIdx} className="flex flex-col md:flex-row gap-6 items-start bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                        {/* Placeholder Image using UI-Avatars or FakeImg */}
                        <div className="w-full md:w-32 h-32 flex-shrink-0">
                          <img 
                            src={`https://fakeimg.pl/400x300/222222/ea580c?text=${encodeURIComponent(ex.name.split(' ').slice(0,2).join(' '))}`} 
                            alt={ex.name} 
                            className="w-full h-full object-cover rounded-lg border border-zinc-700"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-white mb-2">{ex.name}</h4>
                          <div className="flex gap-4 mb-3">
                            <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm">Sets: {ex.sets}</span>
                            <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm">Reps: {ex.reps}</span>
                          </div>
                          <p className="text-zinc-400 text-sm">{ex.tips}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      )}
    </div>
  );
}

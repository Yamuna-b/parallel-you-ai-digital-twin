import React, { useState } from 'react';
import { motion } from 'framer-motion';

const steps = [
  'Basic Info',
  'Custom Questions',
  'Psychometric Quiz',
];

export default function ProfileWizard() {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({
    name: '', age: '', gender: '', location: '', education: '', job: '', relationship: '', health: '', interests: '',
    lifeEvents: '', values: '', goals: '', regrets: '',
    personality: '', riskTolerance: '', ambition: '',
  });

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl mx-auto p-6 bg-white dark:bg-black rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Profile Wizard</h2>
      <div className="mb-6">
        <span className="font-semibold">Step {step + 1} of {steps.length}: {steps[step]}</span>
      </div>
      {step === 0 && (
        <div className="grid gap-4">
          <input name="name" placeholder="Name" value={profile.name} onChange={handleChange} className="input" />
          <input name="age" placeholder="Age" value={profile.age} onChange={handleChange} className="input" />
          <input name="gender" placeholder="Gender" value={profile.gender} onChange={handleChange} className="input" />
          <input name="location" placeholder="Location" value={profile.location} onChange={handleChange} className="input" />
          <input name="education" placeholder="Education" value={profile.education} onChange={handleChange} className="input" />
          <input name="job" placeholder="Job" value={profile.job} onChange={handleChange} className="input" />
          <input name="relationship" placeholder="Relationship" value={profile.relationship} onChange={handleChange} className="input" />
          <input name="health" placeholder="Health" value={profile.health} onChange={handleChange} className="input" />
          <input name="interests" placeholder="Interests" value={profile.interests} onChange={handleChange} className="input" />
        </div>
      )}
      {step === 1 && (
        <div className="grid gap-4">
          <input name="lifeEvents" placeholder="Important Life Events" value={profile.lifeEvents} onChange={handleChange} className="input" />
          <input name="values" placeholder="Values" value={profile.values} onChange={handleChange} className="input" />
          <input name="goals" placeholder="Goals" value={profile.goals} onChange={handleChange} className="input" />
          <input name="regrets" placeholder="Regrets" value={profile.regrets} onChange={handleChange} className="input" />
        </div>
      )}
      {step === 2 && (
        <div className="grid gap-4">
          <input name="personality" placeholder="Personality (e.g. Big Five)" value={profile.personality} onChange={handleChange} className="input" />
          <input name="riskTolerance" placeholder="Risk Tolerance" value={profile.riskTolerance} onChange={handleChange} className="input" />
          <input name="ambition" placeholder="Ambition" value={profile.ambition} onChange={handleChange} className="input" />
        </div>
      )}
      <div className="flex justify-between mt-6">
        <button onClick={prevStep} disabled={step === 0} className="btn">Back</button>
        {step < steps.length - 1 ? (
          <button onClick={nextStep} className="btn">Next</button>
        ) : (
          <button className="btn">Finish</button>
        )}
      </div>
    </motion.div>
  );
}

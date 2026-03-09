import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, Key, ShieldCheck, CheckCircle2, ChevronRight, Loader2, Server } from 'lucide-react';

interface SetupWizardProps {
  onComplete: () => void;
}

export default function SetupWizard({ onComplete }: SetupWizardProps) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Admin
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminConfirm, setAdminConfirm] = useState('');

  // Step 2: Database
  const [dbClient, setDbClient] = useState('pg');
  const [dbHost, setDbHost] = useState('localhost');
  const [dbPort, setDbPort] = useState('5432');
  const [dbUser, setDbUser] = useState('postgres');
  const [dbPassword, setDbPassword] = useState('');
  const [dbName, setDbName] = useState('postgres');

  // Step 3: API Keys
  const [openaiKey, setOpenaiKey] = useState('');
  const [stripeKey, setStripeKey] = useState('');

  const steps = [
    { id: 'admin', title: 'Administrator', icon: ShieldCheck },
    { id: 'database', title: 'Database', icon: Database },
    { id: 'apikeys', title: 'API Keys', icon: Key },
  ];

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (adminPassword !== adminConfirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/setup/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUsername, password: adminPassword }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create admin');
      
      setStep(1);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDatabaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/setup/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: dbClient,
          connection: {
            host: dbHost,
            port: Number(dbPort),
            user: dbUser,
            password: dbPassword,
            database: dbName,
          }
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to configure database');
      
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApiKeysSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const keys: Record<string, string> = {};
      if (openaiKey) keys['openai'] = openaiKey;
      if (stripeKey) keys['stripe'] = stripeKey;

      const res = await fetch('/api/setup/apikeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save API keys');
      
      setStep(3);
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleCreatorMode = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/setup/creator-mode', {
        method: 'POST',
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to activate creator mode');
      
      setStep(3);
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center shadow-sm">
            <Server className="w-6 h-6 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl font-semibold tracking-tight text-zinc-900">
          System Initialization
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-500">
          Configure your environment to get started.
        </p>
        
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleCreatorMode}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-zinc-300 shadow-sm text-sm font-medium rounded-md text-zinc-700 bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Creators Login (Bypass Setup)
          </button>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        {/* Progress Stepper */}
        <div className="mb-8 px-4 sm:px-0">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-zinc-200 -z-10"></div>
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-zinc-900 -z-10 transition-all duration-500 ease-in-out"
              style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
            ></div>
            
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === step;
              const isPast = i < step;
              
              return (
                <div key={s.id} className="flex flex-col items-center">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                      isActive 
                        ? 'bg-zinc-900 border-zinc-900 text-white' 
                        : isPast 
                          ? 'bg-zinc-900 border-zinc-900 text-white' 
                          : 'bg-white border-zinc-300 text-zinc-400'
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`mt-2 text-xs font-medium ${isActive || isPast ? 'text-zinc-900' : 'text-zinc-400'}`}>
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-zinc-100">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600"
              >
                {error}
              </motion.div>
            )}

            {step === 0 && (
              <motion.form 
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleAdminSubmit} 
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-medium text-zinc-900">Create Administrator</h3>
                  <p className="text-sm text-zinc-500 mt-1">This account will have full access to system settings.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700">Username</label>
                  <div className="mt-1">
                    <input
                      type="text"
                      required
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      className="block w-full appearance-none rounded-lg border border-zinc-300 px-3 py-2 placeholder-zinc-400 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-zinc-900 sm:text-sm"
                      placeholder="admin"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700">Password</label>
                  <div className="mt-1">
                    <input
                      type="password"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="block w-full appearance-none rounded-lg border border-zinc-300 px-3 py-2 placeholder-zinc-400 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-zinc-900 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700">Confirm Password</label>
                  <div className="mt-1">
                    <input
                      type="password"
                      required
                      value={adminConfirm}
                      onChange={(e) => setAdminConfirm(e.target.value)}
                      className="block w-full appearance-none rounded-lg border border-zinc-300 px-3 py-2 placeholder-zinc-400 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-zinc-900 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full justify-center items-center rounded-lg border border-transparent bg-zinc-900 py-2.5 px-4 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue'}
                  </button>
                </div>
              </motion.form>
            )}

            {step === 1 && (
              <motion.form 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleDatabaseSubmit} 
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-medium text-zinc-900">Connect External Database</h3>
                  <p className="text-sm text-zinc-500 mt-1">Provide credentials for your primary business database. We will automatically run migrations to set up required tables.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700">Database Type</label>
                  <select
                    value={dbClient}
                    onChange={(e) => setDbClient(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-zinc-900 sm:text-sm"
                  >
                    <option value="pg">PostgreSQL</option>
                    <option value="mysql">MySQL</option>
                    <option value="sqlite3">SQLite (Local Testing)</option>
                  </select>
                </div>

                {dbClient !== 'sqlite3' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700">Host</label>
                        <input
                          type="text"
                          required
                          value={dbHost}
                          onChange={(e) => setDbHost(e.target.value)}
                          className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-zinc-900 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700">Port</label>
                        <input
                          type="text"
                          required
                          value={dbPort}
                          onChange={(e) => setDbPort(e.target.value)}
                          className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-zinc-900 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700">User</label>
                        <input
                          type="text"
                          required
                          value={dbUser}
                          onChange={(e) => setDbUser(e.target.value)}
                          className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-zinc-900 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700">Password</label>
                        <input
                          type="password"
                          value={dbPassword}
                          onChange={(e) => setDbPassword(e.target.value)}
                          className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-zinc-900 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700">Database Name</label>
                      <input
                        type="text"
                        required
                        value={dbName}
                        onChange={(e) => setDbName(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-zinc-900 sm:text-sm"
                      />
                    </div>
                  </>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full justify-center items-center rounded-lg border border-transparent bg-zinc-900 py-2.5 px-4 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Connect & Migrate'}
                  </button>
                </div>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleApiKeysSubmit} 
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-medium text-zinc-900">External API Keys</h3>
                  <p className="text-sm text-zinc-500 mt-1">Configure third-party integrations. These are securely encrypted in the local configuration database.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700">OpenAI API Key <span className="text-zinc-400 font-normal">(Optional)</span></label>
                  <div className="mt-1">
                    <input
                      type="password"
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                      className="block w-full appearance-none rounded-lg border border-zinc-300 px-3 py-2 placeholder-zinc-400 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-zinc-900 sm:text-sm font-mono"
                      placeholder="sk-..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700">Stripe Secret Key <span className="text-zinc-400 font-normal">(Optional)</span></label>
                  <div className="mt-1">
                    <input
                      type="password"
                      value={stripeKey}
                      onChange={(e) => setStripeKey(e.target.value)}
                      className="block w-full appearance-none rounded-lg border border-zinc-300 px-3 py-2 placeholder-zinc-400 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-zinc-900 sm:text-sm font-mono"
                      placeholder="sk_test_..."
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full justify-center items-center rounded-lg border border-transparent bg-zinc-900 py-2.5 px-4 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Setup'}
                  </button>
                </div>
              </motion.form>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center justify-center text-center"
              >
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-medium text-zinc-900">Setup Complete</h3>
                <p className="text-sm text-zinc-500 mt-2">Your system is now configured and ready to use.</p>
                <div className="mt-6">
                  <Loader2 className="w-6 h-6 text-zinc-400 animate-spin mx-auto" />
                  <p className="text-xs text-zinc-400 mt-2">Redirecting to dashboard...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

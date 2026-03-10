import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Moon,
  Globe,
  LogOut,
  Check,
  ChevronRight,
  Mail,
  Smartphone,
  Key,
  Trash2,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { User as UserType } from '../types';
import { updateProfile, changePassword, deleteAccount } from '../services/api';

interface SettingsProps {
  user: UserType;
  onLogout: () => void;
}

type SettingsTab = 'profile' | 'notifications' | 'security' | 'billing' | 'preferences';

export default function Settings({ user, onLogout }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Profile form
  const [profileName, setProfileName] = useState(user.name);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password form
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      await updateProfile(profileName);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err?.message ?? 'Failed to update profile.' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPwMsg(null);
    if (newPw !== confirmPw) {
      setPwMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPw.length < 8) {
      setPwMsg({ type: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }
    setPwSaving(true);
    try {
      await changePassword(currentPw, newPw);
      setPwMsg({ type: 'success', text: 'Password updated successfully.' });
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err: any) {
      setPwMsg({ type: 'error', text: err?.message ?? 'Failed to update password.' });
    } finally {
      setPwSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    try {
      await deleteAccount();
    } catch {
      // token is cleared by deleteAccount regardless
    }
    onLogout();
  };

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: true,
    priceAlerts: true,
    newsDigest: false,
    weeklyReport: true,
  });
  const [preferences, setPreferences] = useState({
    darkMode: true,
    compactView: false,
    autoRefresh: true,
    language: 'en',
    currency: 'USD',
  });

  const tabs = [
    { id: 'profile' as SettingsTab, label: 'Profile', icon: User },
    { id: 'notifications' as SettingsTab, label: 'Notifications', icon: Bell },
    { id: 'security' as SettingsTab, label: 'Security', icon: Shield },
    { id: 'billing' as SettingsTab, label: 'Billing', icon: CreditCard },
    { id: 'preferences' as SettingsTab, label: 'Preferences', icon: Moon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-purple flex items-center justify-center text-3xl font-bold text-white">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#141416] border border-white/20 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                  <User className="w-4 h-4 text-white" />
                </button>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{user.name}</h3>
                <p className="text-white/60">{user.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-[#6E56F8]/20 text-[#6E56F8] text-sm rounded-full">
                  {user.plan} Plan
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white/60 mb-1 block">Full Name</label>
                <Input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="bg-white/5 border-white/10 text-white rounded-xl"
                />
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1 block">Email</label>
                <Input
                  defaultValue={user.email}
                  disabled
                  className="bg-white/5 border-white/10 text-white/50 rounded-xl"
                />
              </div>
            </div>

            {profileMsg && (
              <p className={`text-sm ${profileMsg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {profileMsg.text}
              </p>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleSaveProfile}
                disabled={profileSaving}
                className="bg-gradient-purple hover:opacity-90 text-white rounded-xl"
              >
                {profileSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => { setProfileName(user.name); setProfileMsg(null); }}
                className="border-white/10 text-white hover:bg-white/5 rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              {[
                { key: 'emailAlerts', label: 'Email Alerts', description: 'Receive alerts about price movements and predictions', icon: Mail },
                { key: 'pushNotifications', label: 'Push Notifications', description: 'Get real-time notifications on your device', icon: Smartphone },
                { key: 'priceAlerts', label: 'Price Alerts', description: 'Notify when stocks hit your target prices', icon: Bell },
                { key: 'newsDigest', label: 'Daily News Digest', description: 'Receive a daily summary of market news', icon: Globe },
                { key: 'weeklyReport', label: 'Weekly Portfolio Report', description: 'Get a weekly analysis of your portfolio', icon: Check },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#6E56F8]/20 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-[#6E56F8]" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{item.label}</p>
                      <p className="text-sm text-white/50">{item.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications[item.key as keyof typeof notifications]}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, [item.key]: checked }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="p-4 bg-white/5 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Two-Factor Authentication</p>
                    <p className="text-sm text-white/50">Add an extra layer of security</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-white">Change Password</h4>
              <div className="grid gap-4">
                <Input
                  type="password"
                  placeholder="Current password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl"
                />
                <Input
                  type="password"
                  placeholder="New password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl"
                />
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl"
                />
              </div>
              {pwMsg && (
                <p className={`text-sm ${pwMsg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {pwMsg.text}
                </p>
              )}
              <Button
                onClick={handleChangePassword}
                disabled={pwSaving || !currentPw || !newPw || !confirmPw}
                className="bg-gradient-purple hover:opacity-90 text-white rounded-xl"
              >
                {pwSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Key className="w-4 h-4 mr-2" />}
                Update Password
              </Button>
            </div>

            <div className="pt-6 border-t border-white/10">
              <h4 className="font-medium text-red-400 mb-4">Danger Zone</h4>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(true)}
                className="border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-xl"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-6">
            <div className="p-6 bg-gradient-purple rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80">Current Plan</p>
                  <h3 className="text-2xl font-bold text-white">{user.plan}</h3>
                  <p className="text-white/60 mt-1">$29/month billed annually</p>
                </div>
                <Button className="bg-white text-[#6E56F8] hover:bg-white/90 rounded-xl">
                  Upgrade Plan
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-white">Payment Method</h4>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-white">•••• •••• •••• 4242</p>
                    <p className="text-sm text-white/50">Expires 12/25</p>
                  </div>
                </div>
                <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 rounded-xl">
                  Update
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-white">Billing History</h4>
              {[
                { date: 'Dec 1, 2024', amount: '$29.00', status: 'Paid' },
                { date: 'Nov 1, 2024', amount: '$29.00', status: 'Paid' },
                { date: 'Oct 1, 2024', amount: '$29.00', status: 'Paid' },
              ].map((invoice, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <p className="text-white">{invoice.date}</p>
                    <p className="text-sm text-white/50">Pro Plan - Monthly</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-white">{invoice.amount}</span>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-sm rounded">
                      {invoice.status}
                    </span>
                    <button className="text-[#6E56F8] hover:underline text-sm">
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium text-white">Appearance</h4>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#6E56F8]/20 flex items-center justify-center">
                    <Moon className="w-5 h-5 text-[#6E56F8]" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Dark Mode</p>
                    <p className="text-sm text-white/50">Use dark theme throughout the app</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.darkMode}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, darkMode: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <p className="font-medium text-white">Compact View</p>
                  <p className="text-sm text-white/50">Show more content with less spacing</p>
                </div>
                <Switch
                  checked={preferences.compactView}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, compactView: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <p className="font-medium text-white">Auto Refresh</p>
                  <p className="text-sm text-white/50">Automatically refresh data every 30 seconds</p>
                </div>
                <Switch
                  checked={preferences.autoRefresh}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, autoRefresh: checked }))
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-white">Regional</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/60 mb-1 block">Language</label>
                  <select className="w-full p-3 bg-white/5 border border-white/10 text-white rounded-xl">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-1 block">Currency</label>
                  <select className="w-full p-3 bg-white/5 border border-white/10 text-white rounded-xl">
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <motion.button
          onClick={() => {
            console.log('Sign out clicked');
            onLogout();
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </motion.button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ x: 4 }}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all relative ${
                activeTab === tab.id
                  ? 'bg-[#6E56F8] text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
              <motion.div
                animate={{ scale: activeTab === tab.id ? 1 : 0, opacity: activeTab === tab.id ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="ml-auto"
              >
                <ChevronRight className="w-4 h-4" />
              </motion.div>
            </motion.button>
          ))}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-3 glass-card p-6"
        >
          {renderContent()}
        </motion.div>
      </div>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-[#141416] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription className="text-white/60">
              This action cannot be undone. All your data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-white/70">
              Please type <span className="text-white font-medium">DELETE</span> to confirm:
            </p>
            <Input
              placeholder="Type DELETE"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="bg-white/5 border-white/10 text-white rounded-xl"
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => { setShowDeleteDialog(false); setDeleteConfirmText(''); }}
                className="flex-1 border-white/10 text-white hover:bg-white/5 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl disabled:opacity-50"
                disabled={deleteConfirmText !== 'DELETE'}
                onClick={handleDeleteAccount}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { Save, Bell, Shield, Database, Mail, Globe, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';
import { useState } from 'react';

export default function SettingsView() {
  const [resetting, setResetting] = useState(false);

  const handleResetDatabase = () => {
    if (!confirm('⚠️ WARNING: This will DELETE ALL DATA and reset the system to initial state.\n\nAll sessions, availability schedules, notifications, and user progress will be lost.\n\nAre you absolutely sure you want to continue?')) {
      return;
    }

    if (!confirm('This action CANNOT be undone. Type "RESET" to confirm.\n\nClick OK to proceed or Cancel to abort.')) {
      return;
    }

    try {
      setResetting(true);
      
      // Clear all localStorage data
      localStorage.clear();
      
      toast.success('Database reset successfully! Reloading page...');
      
      // Reload page after a short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (error) {
      console.error('Error resetting database:', error);
      toast.error('Failed to reset database');
      setResetting(false);
    }
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage system settings and configurations.</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="mb-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-50 p-3 rounded-lg">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-foreground">General Settings</h3>
                <p className="text-sm text-muted-foreground">Configure general system preferences</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="institution">Institution Name</Label>
                <Input id="institution" defaultValue="Ho Chi Minh City University of Technology" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="program">Program Name</Label>
                <Input id="program" defaultValue="BK TUTOR" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="semester">Current Semester</Label>
                <Input id="semester" defaultValue="Fall 2025" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="contact">Contact Email</Label>
                <Input id="contact" type="email" defaultValue="bktutor@hcmut.edu.vn" />
              </div>

              <div className="flex items-center justify-between py-3 border-t border-border">
                <div>
                  <p className="text-foreground">Allow student self-registration</p>
                  <p className="text-sm text-muted-foreground">Students can register for the program themselves</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between py-3 border-t border-border">
                <div>
                  <p className="text-foreground">Auto-matching tutors and students</p>
                  <p className="text-sm text-muted-foreground">Automatically match students with suitable tutors</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="pt-4 border-t border-border">
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-50 p-3 rounded-lg">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-foreground">Notification Settings</h3>
                <p className="text-sm text-muted-foreground">Manage notification preferences</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-foreground">Email notifications</p>
                  <p className="text-sm text-muted-foreground">Receive email notifications for important events</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-foreground">Session reminders</p>
                  <p className="text-sm text-muted-foreground">Send reminders before sessions start</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-foreground">Weekly reports</p>
                  <p className="text-sm text-muted-foreground">Receive weekly summary reports</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-foreground">New registrations</p>
                  <p className="text-sm text-muted-foreground">Notify when new students or tutors register</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="pt-4 border-t border-border">
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-50 p-3 rounded-lg">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-foreground">Security Settings</h3>
                <p className="text-sm text-muted-foreground">Manage security and access control</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-foreground">HCMUT SSO Integration</p>
                  <p className="text-sm text-muted-foreground">Single sign-on with university credentials</p>
                </div>
                <Switch defaultChecked disabled />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-foreground">Two-factor authentication</p>
                  <p className="text-sm text-muted-foreground">Require 2FA for administrator accounts</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-foreground">Session timeout</p>
                  <p className="text-sm text-muted-foreground">Automatically log out after 30 minutes of inactivity</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="pt-4 border-t border-border">
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="mt-6">
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-50 p-3 rounded-lg">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-foreground">System Integrations</h3>
                <p className="text-sm text-muted-foreground">Manage integrations with HCMUT systems</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-foreground">HCMUT_DATACORE</p>
                  <p className="text-sm text-muted-foreground">Sync student and faculty data</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-green-600">Connected</span>
                  <Switch defaultChecked disabled />
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-foreground">HCMUT_LIBRARY</p>
                  <p className="text-sm text-muted-foreground">Access library resources and materials</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-green-600">Connected</span>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-foreground">Email Service</p>
                  <p className="text-sm text-muted-foreground">Send notifications via university email</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-green-600">Connected</span>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="database" className="mt-6">
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-50 p-3 rounded-lg">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-foreground">Database Management</h3>
                <p className="text-sm text-muted-foreground">Reset and manage system database</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Database Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-foreground mb-2">Current Database Status</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">SSO Users (All HCMUT)</p>
                    <p className="text-foreground font-medium">67 users</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">BK TUTOR Users (Registered)</p>
                    <p className="text-foreground font-medium">35 users</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Students</p>
                    <p className="text-foreground font-medium">20 (10 pre-reg + 10 registered)</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tutors</p>
                    <p className="text-foreground font-medium">10 tutors</p>
                  </div>
                </div>
              </div>

              {/* Reset Database Section */}
              <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-foreground font-semibold mb-2">Reset Database to Initial State</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      This will completely reset the system database to its initial state. All data will be lost, including:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside mb-4">
                      <li>All sessions (completed, scheduled, pending)</li>
                      <li>Tutor availability schedules (will be reset to empty)</li>
                      <li>All notifications and messages</li>
                      <li>User progress and statistics</li>
                      <li>Materials and feedback</li>
                    </ul>
                    <div className="bg-white border border-red-200 rounded p-3 mb-4">
                      <p className="text-sm text-red-800 font-medium">
                        ⚠️ This action cannot be undone. Use only for testing or when you need to start fresh.
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  variant="destructive"
                  onClick={handleResetDatabase}
                  disabled={resetting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${resetting ? 'animate-spin' : ''}`} />
                  {resetting ? 'Resetting Database...' : 'Reset Database to Initial State'}
                </Button>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">After Reset:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• You will be logged out and redirected to login page</li>
                  <li>• All user accounts will still exist (SSO and BK TUTOR users)</li>
                  <li>• Tutors will need to set their availability schedules again</li>
                  <li>• Students can start booking sessions with fresh state</li>
                  <li>• All test accounts remain accessible with same passwords</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

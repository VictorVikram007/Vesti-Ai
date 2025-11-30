import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { useAuth } from "@/context/AuthContext";
import WardrobePreferencesSummary from "@/components/WardrobePreferencesSummary";



const Settings = () => {
  const { toast } = useToast();
  const { settings, updateSettings } = useSettings();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Apply theme + contrast + font size to document root
  useEffect(() => {
    const root = document.documentElement;
    if (settings.appearance.darkMode) root.classList.add("dark"); else root.classList.remove("dark");
    if (settings.appearance.highContrast) root.classList.add("[color-scheme:dark]", "contrast-more"); else root.classList.remove("[color-scheme:dark]", "contrast-more");
    root.style.setProperty("font-size", `${settings.appearance.fontSizePct}%`);
  }, [settings.appearance.darkMode, settings.appearance.highContrast, settings.appearance.fontSizePct]);



  const handleAvatarChange = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateSettings({ ...settings, profile: { ...settings.profile, avatarDataUrl: String(reader.result) } });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    toast({ title: "Settings saved", description: "Your preferences have been updated." });
  };

  const downloadData = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vesti-settings.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteAccount = () => {
    if (!user) return;
    
    // Remove user-specific data
    localStorage.removeItem(`vesti.settings.${user.id}`);
    localStorage.removeItem(`wardrobeItems.${user.id}`);
    localStorage.removeItem(`wardrobeOutfits.${user.id}`);
    toast({ title: "Account deletion requested", description: "User data cleared from local storage." });
  };

  const changePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const current = (document.getElementById("current") as HTMLInputElement)?.value;
    const next = (document.getElementById("new") as HTMLInputElement)?.value;
    const confirmNew = (document.getElementById("confirmNew") as HTMLInputElement)?.value;
    const valid = /^(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!valid.test(next)) {
      toast({ title: "Weak password", description: "Use 8+ chars with a number and symbol." });
      return;
    }
    if (next !== confirmNew) {
      toast({ title: "Passwords do not match", description: "Please re-enter." });
      return;
    }
    toast({ title: "Password change (demo)", description: "Wire to backend endpoint." });
  };

  const logout = () => {
    toast({ title: "Logged out", description: "Demo logout; redirecting to login." });
    navigate("/login");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full overflow-hidden bg-muted flex items-center justify-center">
              {settings.profile.avatarDataUrl ? (
                <img src={settings.profile.avatarDataUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs text-muted-foreground">No avatar</span>
              )}
            </div>
            <div>
              <Input type="file" accept="image/*" onChange={(e) => handleAvatarChange(e.target.files?.[0])} />
              <p className="text-xs text-muted-foreground mt-1">Recommended: square image</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Preferred name</Label>
              <Input id="name" value={settings.profile.name} onChange={(e) => updateSettings({ ...settings, profile: { ...settings.profile, name: e.target.value } })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={settings.profile.email} onChange={(e) => updateSettings({ ...settings, profile: { ...settings.profile, email: e.target.value } })} />
            </div>
            <div className="space-y-2">
              <Label>Pronouns</Label>
              <Select value={settings.profile.pronouns} onValueChange={(v) => updateSettings({ ...settings, profile: { ...settings.profile, pronouns: v } })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pronouns" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="she/her">she/her</SelectItem>
                  <SelectItem value="he/him">he/him</SelectItem>
                  <SelectItem value="they/them">they/them</SelectItem>
                  <SelectItem value="prefer-not-to-say">prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="pt-2">
            <Button onClick={handleSave}>Save changes</Button>
          </div>
        </CardContent>
      </Card>



      <WardrobePreferencesSummary />

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {([
            ["Outfit suggestions", "outfitSuggestions"],
            ["New features & updates", "newFeatures"],
            ["Wardrobe insights", "wardrobeInsights"],
            ["Promotions", "promotions"],
          ] as const).map(([label, key]) => (
            <label key={key} className="flex items-center justify-between text-sm">
              <span>{label}</span>
              <Switch
                checked={settings.notifications[key]}
                onCheckedChange={(v) => updateSettings({ ...settings, notifications: { ...settings.notifications, [key]: !!v } })}
              />
            </label>
          ))}
          <div className="flex items-center justify-between">
            <span className="text-sm inline-flex items-center gap-1">
              In-app notifications
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 opacity-60" aria-label="info" />
                </TooltipTrigger>
                <TooltipContent>Receive alerts and updates within the app.</TooltipContent>
              </Tooltip>
            </span>
            <Switch checked={settings.notifications.inApp} onCheckedChange={(v) => updateSettings({ ...settings, notifications: { ...settings.notifications, inApp: !!v } })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance & Accessibility</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark mode</p>
              <p className="text-sm text-muted-foreground">Use a dark color scheme.</p>
            </div>
            <Switch checked={settings.appearance.darkMode} onCheckedChange={(v) => updateSettings({ ...settings, appearance: { ...settings.appearance, darkMode: !!v } })} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">High contrast</p>
              <p className="text-sm text-muted-foreground">Improves contrast for readability.</p>
            </div>
            <Switch checked={settings.appearance.highContrast} onCheckedChange={(v) => updateSettings({ ...settings, appearance: { ...settings.appearance, highContrast: !!v } })} />
          </div>
          <div className="space-y-2">
            <Label>Font size: {settings.appearance.fontSizePct}%</Label>
            <input
              type="range"
              min={90}
              max={130}
              step={2}
              value={settings.appearance.fontSizePct}
              onChange={(e) => updateSettings({ ...settings, appearance: { ...settings.appearance, fontSizePct: Number(e.target.value) } })}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data & Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Personalized recommendations</p>
              <p className="text-sm text-muted-foreground">Allow the app to use your preferences to tailor suggestions.</p>
              <p className="text-xs text-muted-foreground">We store preferences locally for this demo. In production, this may include wardrobe metadata to improve recommendations.</p>
            </div>
            <Switch checked={settings.privacy.personalized} onCheckedChange={(v) => updateSettings({ ...settings, privacy: { ...settings.privacy, personalized: !!v } })} />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={downloadData}>Download my data</Button>
            <Button variant="destructive" onClick={deleteAccount}>Delete account</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing & Payments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">Payment Methods</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">VISA</div>
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 12/25</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Remove</Button>
              </div>
              <Button variant="outline" className="w-full">+ Add Payment Method</Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">Payment History</h3>
            <div className="space-y-2">
              {[
                { date: "Dec 15, 2024", amount: "$9.99", plan: "Premium Monthly", status: "Paid" },
                { date: "Nov 15, 2024", amount: "$9.99", plan: "Premium Monthly", status: "Paid" },
                { date: "Oct 15, 2024", amount: "$9.99", plan: "Premium Monthly", status: "Paid" }
              ].map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{payment.plan}</p>
                    <p className="text-sm text-muted-foreground">{payment.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{payment.amount}</p>
                    <p className="text-sm text-green-600">{payment.status}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm">View All Transactions</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={changePassword}>
            <div className="space-y-2">
              <Label htmlFor="current">Current password</Label>
              <Input id="current" type="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new">New password</Label>
              <Input id="new" type="password" required />
              <p className="text-xs text-muted-foreground">8+ characters, include a number and a symbol.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNew">Confirm new password</Label>
              <Input id="confirmNew" type="password" required />
            </div>
            <div className="md:col-span-3 flex items-center gap-2">
              <Button type="submit" variant="outline">Change password</Button>
              <Button type="button" variant="outline" onClick={logout}>Log out</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="sticky bottom-0 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40 border-t p-3">
        <div className="max-w-4xl mx-auto flex justify-between items-center gap-3">
          <div id="save-success" className="text-sm text-green-700" aria-live="polite"></div>
          <Button onClick={() => { handleSave(); const el = document.getElementById('save-success'); if (el) { el.textContent = 'Preferences saved!'; setTimeout(()=>{ el.textContent=''; }, 1500); } }}>Save all changes</Button>
        </div>
      </div>
    </div>
  );
};

export default Settings; 
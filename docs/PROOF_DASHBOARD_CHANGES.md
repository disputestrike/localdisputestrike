# Proof: Command Center + Mission Tab (Dashboard Changes)

## 1. Where the code lives

**File:** `client/src/pages/Dashboard.tsx`

---

## 2. Identity Header / Command Center

**Lines 497–529** — Card at top of main dashboard:

```tsx
        {/* Identity Header (Blueprint: Command Center scoreboard) */}
        <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-orange-500" />
              Command Center
            </CardTitle>
            <CardDescription>Your financial war room — scores, potential impact, and next steps</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg bg-white/80 p-3 border border-orange-100">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Scores (TU / EQ / EX)</p>
              <p className="text-lg font-bold text-orange-700 mt-1">— / — / —</p>
              ...
            </div>
            <div ...>Potential delta</div>
            <div ...>AI Strategist</div>
          </CardContent>
        </Card>
```

---

## 3. Mission tab as default

**Line 52** — State:

```tsx
  const [dashboardTab, setDashboardTab] = useState<string>('mission');
```

**Line 556** — Tabs use `mission` as initial value and are controlled:

```tsx
        <Tabs value={dashboardTab} onValueChange={setDashboardTab} className="space-y-6">
```

**Lines 558–561** — Mission trigger (first tab):

```tsx
            <TabsTrigger value="mission" className="gap-1.5">
              <LayoutDashboard className="h-4 w-4" />
              Mission
            </TabsTrigger>
```

---

## 4. Mission tab content

**Lines 602–648** — Mission `TabsContent`:

```tsx
          {/* Mission tab (Blueprint: Command Center overview, upload as secondary) */}
          <TabsContent value="mission" className="space-y-6">
            <Card className="border-orange-200 bg-orange-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-600" />
                  Your mission
                </CardTitle>
                <CardDescription>
                  Use Mission Control in the sidebar: Dashboard, My Live Report, Dispute Manager, Mailing Tracker. Upload or refresh reports anytime.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Button ... onClick={() => setDashboardTab('upload')}>
                  <Upload ... />
                  <span ...>Upload / Refresh reports</span>
                  ...
                </Button>
                <Button ... onClick={() => setLocation('/dashboard/reports')}>
                  <FileText ... />
                  <span ...>My Live Report</span>
                  ...
                </Button>
                <Button ... onClick={() => setLocation('/dashboard/disputes')}>
                  <AlertTriangle ... />
                  <span ...>Dispute Manager</span>
                  ...
                </Button>
              </CardContent>
            </Card>
            <Alert>
              <Bot ... />
              <AlertDescription>
                <strong>AI Strategist:</strong> {hasAccounts ? `We've identified ${...} negative accounts...` : 'Upload credit reports...'}
              </AlertDescription>
            </Alert>
          </TabsContent>
```

---

## 5. When you **don’t** see this UI

You **won’t** see Command Center / Mission tab if:

1. **Not logged in**  
   Dashboard shows “Sign in to Continue” (sidebar only). Command Center is only in the **authenticated** main dashboard.

2. **Post-payment redirect**  
   `?payment=success` + `previewAnalysis` in sessionStorage → we show **PreviewResults** (revealed), not the main dashboard.

3. **Free user with reports + analysis**  
   We show **PreviewResults** (gated) instead of the main dashboard.

4. **Railway / production**  
   If the app wasn’t rebuilt and redeployed after the latest commits, you’ll still see the old UI.

---

## 6. How to see it locally

1. **Run dev:**

   ```bash
   pnpm run dev
   ```

2. **Log in** (or register) so you’re authenticated.

3. Open **`/dashboard`** (not `/dashboard/reports` or other sub-routes).

4. Ensure you’re **not** in the post-payment flow (no `?payment=success` and no `previewAnalysis` in sessionStorage).

5. You should see:
   - **Command Center** card at top (orange, Scores / Potential / AI Strategist).
   - **Progress** card below.
   - **Mission** tab selected by default, with “Your mission” and the three buttons (Upload, My Live Report, Dispute Manager).

---

## 7. Git

- Commit: `ddaec19` — “Blueprint: Command Center main content, Mission default, Identity Header”
- Branch: `main`

To confirm:

```bash
git log -1 --oneline
git show ddaec19 --stat
```

---

## 8. Verify in your IDE (instant proof)

**Search in `client/src/pages/Dashboard.tsx`** for these exact strings. All must exist:

| Search for | Approx. line |
|------------|--------------|
| `Command Center` | 502 |
| `Your financial war room` | 504 |
| `Identity Header (Blueprint` | 497 |
| `Your mission` | 608 |
| `Mission tab (Blueprint` | 602 |
| `dashboardTab` | 52, 556, 619 |
| `setDashboardTab('upload')` | 619 |

**In Cursor:** `Ctrl+Shift+F` → search `Command Center` in `client/src/pages/Dashboard.tsx` → you should see the Identity Header block.

**Run in PowerShell (from repo root):**

```powershell
Select-String -Path "client\src\pages\Dashboard.tsx" -Pattern "Command Center|Your financial war room|Your mission|Identity Header|Mission tab|dashboardTab|setDashboardTab" | ForEach-Object { "$($_.LineNumber): $($_.Line.Trim())" }
```

You should see output like:

```
52: const [dashboardTab, setDashboardTab] = useState<string>('mission');
497: {/* Identity Header (Blueprint: Command Center scoreboard) */}
502: Command Center
504: <CardDescription>Your financial war room - scores, potential impact, and next steps</CardDescription>
556: <Tabs value={dashboardTab} onValueChange={setDashboardTab} ...
602: {/* Mission tab (Blueprint: Command Center overview, upload as secondary) */}
608: Your mission
618: onClick={() => setDashboardTab('upload')}
```

---

## 9. Railway / production

If you only check **https://localdisputestrike-production.up.railway.app/dashboard**:

- Ensure the app **rebuilt and redeployed** after commit `ddaec19`.
- Clear browser cache or hard-refresh (`Ctrl+Shift+R`).
- You must be **logged in**. If you see "Sign in to Continue," the main dashboard (Command Center, Mission) is not shown.

import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/dashboard-ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/dashboard-ui/dialog";
import { Input } from "@/components/dashboard-ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const MIN_LENGTH = 8;

const COPY = {
  en: {
    title: "Choose a new password",
    body: "You followed a password reset link. Set a new password now: until you do, your old one still works.",
    password: "New password",
    confirm: "Repeat the new password",
    submit: "Save new password",
    later: "Not now",
    short: `Use at least ${MIN_LENGTH} characters.`,
    mismatch: "The two passwords do not match.",
    done: "Your password has been changed.",
    failed: "The password could not be changed. Open the reset link in your email again, or try later.",
  },
  de: {
    title: "Neues Passwort festlegen",
    body: "Sie haben einen Link zum Zurücksetzen des Passworts verwendet. Legen Sie jetzt ein neues Passwort fest: Bis dahin gilt Ihr altes weiter.",
    password: "Neues Passwort",
    confirm: "Neues Passwort wiederholen",
    submit: "Neues Passwort speichern",
    later: "Später",
    short: `Mindestens ${MIN_LENGTH} Zeichen verwenden.`,
    mismatch: "Die beiden Passwörter stimmen nicht überein.",
    done: "Ihr Passwort wurde geändert.",
    failed: "Das Passwort konnte nicht geändert werden. Öffnen Sie den Link in Ihrer E-Mail erneut oder versuchen Sie es später noch einmal.",
  },
} as const;

/**
 * The reset email lands here (/dashboard?reset=true) with the visitor already signed in through the
 * link. Without this step "reset password" would only be a login link and the old password would stay valid.
 */
export function PasswordResetDialog() {
  const { user, updateUser } = useAuth();
  const { language } = useLanguage();
  const c = COPY[language === "de" ? "de" : "en"];
  const [params, setParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const open = params.get("reset") === "true" && Boolean(user);
  const close = () => {
    const next = new URLSearchParams(params);
    next.delete("reset");
    setParams(next, { replace: true });
    setPassword("");
    setRepeat("");
    setError("");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (password.length < MIN_LENGTH) return setError(c.short);
    if (password !== repeat) return setError(c.mismatch);
    setSaving(true);
    setError("");
    const { error: failure } = await updateUser({ password });
    setSaving(false);
    if (failure) return setError(failure.message || c.failed);
    toast.success(c.done);
    close();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) close(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{c.title}</DialogTitle>
          <DialogDescription>{c.body}</DialogDescription>
        </DialogHeader>
        <form className="grid gap-3" onSubmit={submit}>
          <label className="grid gap-1.5 text-sm font-medium" htmlFor="reset-password">
            {c.password}
            <Input autoComplete="new-password" id="reset-password" minLength={MIN_LENGTH} onChange={(e) => setPassword(e.target.value)} required type="password" value={password} />
          </label>
          <label className="grid gap-1.5 text-sm font-medium" htmlFor="reset-repeat">
            {c.confirm}
            <Input autoComplete="new-password" id="reset-repeat" onChange={(e) => setRepeat(e.target.value)} required type="password" value={repeat} />
          </label>
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
          <div className="mt-1 flex justify-end gap-2">
            <Button onClick={close} type="button" variant="ghost">{c.later}</Button>
            <Button disabled={saving} type="submit">{c.submit}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

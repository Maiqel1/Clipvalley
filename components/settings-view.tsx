"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { updatePassword, updateUsername } from "@/lib/actions/profile";
import { reestablishSession } from "@/lib/auth-client";
import { emptyProfileState, type ProfileState } from "@/lib/actions/types";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/cn";
import { duration, easeOutQuart, fadeUp } from "@/lib/motion";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";

type SettingsViewProps = {
  username: string | null;
  email: string;
  hasPassword: boolean;
};

export function SettingsView({ username, email, hasPassword }: SettingsViewProps) {
  const [usernameState, usernameAction, usernamePending] = React.useActionState(
    updateUsername,
    emptyProfileState,
  );
  // Not useActionState: the action returns a token the client must exchange
  // before the revoked session takes the page down with it.
  const [passwordState, setPasswordState] = React.useState<ProfileState>(emptyProfileState);
  const [passwordPending, setPasswordPending] = React.useState(false);

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setPasswordPending(true);
    const result = await updatePassword(emptyProfileState, data);

    if (result.customToken) {
      try {
        await reestablishSession(result.customToken);
      } catch {
        // Session could not be rebuilt — /session-ended clears the dead cookie
        // rather than letting the page bounce between guard and redirect.
        window.location.href = "/session-ended?notice=password-updated";
        return;
      }
    }

    setPasswordPending(false);
    setPasswordState({ error: result.error, notice: result.notice });
    if (!result.error) form.reset();
  }

  return (
    <AppShell username={username} syncState="idle">
      <motion.header initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
        <h1 className="text-headline-lg-mobile text-on-background md:text-headline-lg">Settings</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Signed in as <span className="text-on-surface">{email}</span>
        </p>
      </motion.header>

      <div className="flex max-w-xl flex-col gap-gutter">
        <Card title="Username" description="How you're identified inside Clipvalley.">
          <form action={usernameAction} className="flex flex-col gap-4">
            <Field
              label="Username"
              icon="person"
              name="username"
              defaultValue={username ?? ""}
              minLength={3}
              maxLength={24}
              pattern="[A-Za-z0-9_]+"
              hint="3–24 characters"
              required
            />
            <Button type="submit" loading={usernamePending} className="self-start">
              Save username
            </Button>
          </form>
          <Feedback state={usernameState} />
        </Card>

        <Card
          title={hasPassword ? "Password" : "Add a password"}
          description={
            hasPassword
              ? "Used when you sign in with your email instead of Google."
              : "Optional. You signed in with Google, which is all you need — add a password only if you also want to sign in with your email."
          }
        >
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            <Field
              label={hasPassword ? "New password" : "Password"}
              icon="lock"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              placeholder="At least 8 characters"
              required
            />
            <Field
              label="Confirm password"
              icon="lock"
              name="confirm"
              type="password"
              autoComplete="new-password"
              minLength={8}
              placeholder="Type it again"
              required
            />
            <Button type="submit" loading={passwordPending} className="self-start">
              {hasPassword ? "Update password" : "Add password"}
            </Button>
          </form>
          <Feedback state={passwordState} />
        </Card>

        <Card title="Session" description="You stay signed in on this device until you sign out.">
          <form action={signOut}>
            <Button type="submit" variant="secondary" className="self-start">
              <Icon name="logout" size={18} />
              Sign out
            </Button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-level-1">
      <h2 className="text-headline-md text-on-surface">{title}</h2>
      <p className="mt-1 mb-5 text-body-sm text-on-surface-variant">{description}</p>
      {children}
    </section>
  );
}

function Feedback({ state }: { state: ProfileState }) {
  return (
    <AnimatePresence>
      {(state.error || state.notice) && (
        <motion.p
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: "auto", marginTop: 16 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          transition={{ duration: duration.fast, ease: easeOutQuart }}
          role="alert"
          className={cn(
            "overflow-hidden rounded-lg px-4 py-3 text-body-sm",
            state.error
              ? "bg-error-container text-on-error-container"
              : "bg-primary-fixed text-on-primary-fixed",
          )}
        >
          {state.error ?? state.notice}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

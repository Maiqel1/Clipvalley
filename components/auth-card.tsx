"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { signInWithPassword, signUpWithPassword } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { GoogleButton } from "@/components/google-button";
import { cn } from "@/lib/cn";
import { duration, easeOutQuart, fadeUp } from "@/lib/motion";

type Tab = "login" | "signup";

const ERROR_COPY: Record<string, string> = {
  oauth_failed: "Google sign-in didn't complete. Please try again.",
  missing_code: "That sign-in link was incomplete. Please try again.",
  invalid_link: "That confirmation link isn't valid.",
  expired_link: "That confirmation link has expired. Sign in to get a new one.",
};

export function AuthCard({
  initialTab,
  next,
  error,
}: {
  initialTab: Tab;
  next?: string;
  error?: string;
}) {
  const [tab, setTab] = React.useState<Tab>(initialTab);
  const [direction, setDirection] = React.useState(0);

  const router = useRouter();
  const [loginPending, setLoginPending] = React.useState(false);
  const [signupPending, setSignupPending] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const destination = next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  async function submit(
    event: React.FormEvent<HTMLFormElement>,
    setPending: (value: boolean) => void,
    run: (data: FormData) => Promise<void>,
  ) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPending(true);
    setFormError(null);

    try {
      await run(data);
      router.push(destination);
      router.refresh();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Something went wrong. Try again.");
      setPending(false);
    }
  }

  function switchTab(nextTab: Tab) {
    if (nextTab === tab) return;
    setDirection(nextTab === "signup" ? 1 : -1);
    setTab(nextTab);
    const url = new URL(window.location.href);
    if (nextTab === "signup") url.searchParams.set("tab", "signup");
    else url.searchParams.delete("tab");
    window.history.replaceState(null, "", url);
  }

  const linkError = error ? (ERROR_COPY[error] ?? "Something went wrong. Please try again.") : null;
  const state = { error: formError ?? linkError, notice: null as string | null };

  return (
    <main className="z-10 mx-auto w-full max-w-md">
      <motion.div
        className="mb-8 flex flex-col items-center"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <Image
          src="/logo.png"
          alt=""
          width={80}
          height={80}
          priority
          className="mb-4 size-20 object-contain"
        />
        <h1 className="text-headline-lg-mobile text-primary md:text-headline-lg">Clipvalley</h1>
        <p className="mt-2 text-center text-body-md text-on-surface-variant">
          Seamlessly sync your clipboard.
        </p>
      </motion.div>

      <motion.div
        className="glass-card w-full rounded-xl p-6 md:p-8"
        initial={{ opacity: 0, y: 16, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: duration.slow, ease: easeOutQuart, delay: 0.08 }}
      >
        <div role="tablist" className="relative mb-8 flex border-b border-outline-variant/30">
          {(["login", "signup"] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              onClick={() => switchTab(value)}
              className={cn(
                "relative flex-1 pb-3 text-label-md font-semibold transition-colors duration-200",
                tab === value ? "text-primary" : "text-on-surface-variant hover:text-primary",
              )}
            >
              {value === "login" ? "Log In" : "Sign Up"}
              {tab === value && (
                <motion.span
                  layoutId="auth-tab-indicator"
                  className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: direction * 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -8 }}
            transition={{ duration: duration.fast, ease: easeOutQuart }}
          >
            {tab === "login" ? (
              <form
                onSubmit={(e) =>
                  submit(e, setLoginPending, (data) =>
                    signInWithPassword(
                      String(data.get("identifier") ?? ""),
                      String(data.get("password") ?? ""),
                    ),
                  )
                }
                className="flex flex-col gap-4"
              >
                <input type="hidden" name="next" value={next ?? "/dashboard"} />
                <Field
                  label="Email or username"
                  icon="person"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  placeholder="you@example.com or yourname"
                  required
                />
                <PasswordField
                  label="Password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="Your password"
                />
                <Button type="submit" size="lg" loading={loginPending} className="mt-2">
                  Log In
                  <Icon name="arrow_forward" size={18} />
                </Button>
              </form>
            ) : (
              <form
                onSubmit={(e) =>
                  submit(e, setSignupPending, (data) =>
                    signUpWithPassword(
                      String(data.get("username") ?? ""),
                      String(data.get("email") ?? ""),
                      String(data.get("password") ?? ""),
                    ),
                  )
                }
                className="flex flex-col gap-4"
              >
                <Field
                  label="Username"
                  icon="person"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="yourname"
                  minLength={3}
                  maxLength={24}
                  pattern="[A-Za-z0-9_]+"
                  hint="3–24 characters"
                  required
                />
                <Field
                  label="Email Address"
                  icon="mail"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                />
                <PasswordField
                  label="Password"
                  name="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  minLength={8}
                />
                <Button type="submit" size="lg" loading={signupPending} className="mt-2">
                  Create Account
                </Button>
                <p className="text-center text-body-sm text-on-surface-variant">
                  By signing up you agree to our{" "}
                  <Link className="text-primary hover:underline" href="/terms">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link className="text-primary hover:underline" href="/privacy">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </form>
            )}
          </motion.div>
        </AnimatePresence>

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

        <div className="my-8 flex items-center gap-4">
          <span className="h-px flex-1 bg-outline-variant/40" />
          <span className="text-body-sm text-on-surface-variant">or continue with</span>
          <span className="h-px flex-1 bg-outline-variant/40" />
        </div>

        <GoogleButton next={next} />
      </motion.div>
    </main>
  );
}

function PasswordField(props: React.ComponentProps<typeof Field>) {
  const [visible, setVisible] = React.useState(false);

  return (
    <Field
      {...props}
      icon="lock"
      type={visible ? "text" : "password"}
      required
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="grid size-8 place-items-center rounded-full text-on-surface-variant transition-colors duration-200 hover:text-primary"
        >
          <Icon name={visible ? "visibility_off" : "visibility"} size={20} />
        </button>
      }
    />
  );
}

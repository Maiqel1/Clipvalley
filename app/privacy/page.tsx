import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Section, List } from "@/components/legal-page";
import { SITE_NAME, CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE_NAME} collects, stores and uses your data.`,
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <Section title="The short version">
        <p>
          {SITE_NAME} stores the text and images you paste so you can retrieve them on your other
          devices. We do not sell your data, we do not run advertising, and we do not use analytics
          or tracking cookies. The only cookies we set are the ones that keep you signed in.
        </p>
      </Section>

      <Section title="What we collect">
        <List
          items={[
            <>
              <strong className="text-on-surface">Account details.</strong> Your email address and
              the username you choose. If you sign in with Google, we receive your email address and
              basic profile information from Google — nothing else, and we never gain access to your
              Google account.
            </>,
            <>
              <strong className="text-on-surface">Your clips.</strong> The text and images you paste
              into {SITE_NAME}, along with the time each was created. This is the content of the
              service; we store it so we can give it back to you.
            </>,
            <>
              <strong className="text-on-surface">Authentication data.</strong> If you set a
              password, it is hashed by our authentication provider and is never visible to us or
              stored in readable form.
            </>,
          ]}
        />
        <p>
          We do not collect analytics, device fingerprints, advertising identifiers, or location
          data. We do not use third-party trackers.
        </p>
      </Section>

      <Section title="How your clips are protected">
        <List
          items={[
            <>
              Every clip is tied to your account. Database access rules enforce, at the database
              level, that a signed-in user can only read and write their own rows — not merely in
              application code.
            </>,
            <>
              Images live in a private storage bucket. They are never publicly listable, and are
              served through short-lived signed links generated only for you.
            </>,
            <>All traffic is encrypted in transit over HTTPS.</>,
          ]}
        />
        <p>
          No system is perfectly secure. Please do not store passwords, payment card details, or
          other highly sensitive secrets in {SITE_NAME}.
        </p>
      </Section>

      <Section title="Share links">
        <p>
          You can turn any clip into a public read-only link. This only happens when you explicitly
          choose to share, and you can turn it off at any time — once you do, the link stops working
          immediately.
        </p>
        <p>
          While a link is active, <strong className="text-on-surface">anyone who has it can view
          that clip without signing in.</strong> The address is unguessable and we ask search engines
          not to index it, but treat it as unlisted rather than private. Only share clips you are
          comfortable being seen.
        </p>
      </Section>

      <Section title="Who else processes your data">
        <p>We keep this list short on purpose. These providers process data on our behalf:</p>
        <List
          items={[
            <>
              <strong className="text-on-surface">Google Firebase</strong> — database, file
              storage, and authentication.
            </>,
            <>
              <strong className="text-on-surface">Vercel</strong> — application hosting and delivery.
            </>,
            <>
              <strong className="text-on-surface">Google</strong> — only if you choose to sign in
              with Google.
            </>,
            <>
              <strong className="text-on-surface">Our email provider</strong> — used solely to send
              account emails such as sign-up confirmation and password resets. We do not send
              marketing email.
            </>,
          ]}
        />
        <p>
          We do not sell, rent, or trade your personal information. We disclose data only where
          legally required, or where necessary to investigate abuse of the service.
        </p>
      </Section>

      <Section title="Cookies and local storage">
        <p>
          We set cookies for one purpose: keeping you signed in. They are essential to the service
          and are not used for tracking or advertising. Clearing them signs you out.
        </p>
        <p>
          We also store small preferences in your browser&apos;s local storage — for example,
          whether you dismissed the &ldquo;bookmark this site&rdquo; prompt. This never leaves your
          device.
        </p>
      </Section>

      <Section title="How long we keep things">
        <p>
          Clips are kept until you delete them. Deleting a clip removes it permanently, including any
          stored image — there is no trash or recovery, so delete carefully.
        </p>
        <p>
          If you close your account, your clips and stored images are deleted along with it.
        </p>
      </Section>

      <Section title="Your rights">
        <p>
          You can view and edit your clips at any time from your dashboard, change your username and
          password in Settings, and delete any clip permanently.
        </p>
        <p>
          To request a copy of your data, or to delete your account entirely, email us at{" "}
          <a className="text-primary hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          . Depending on where you live you may have additional rights over your personal data,
          including access, correction, deletion, and portability — contact us and we will honour
          them.
        </p>
      </Section>

      <Section title="Age requirement">
        <p>
          You need to be at least 13 to have an account, or older where your country sets a higher
          minimum age for consenting to online services.
        </p>
        <p>
          This is an eligibility rule rather than a safety warning. {SITE_NAME} has no advertising,
          no public profiles, and no way for users to find or contact one another — the only thing
          you can see is your own content. The requirement exists because laws protecting
          children&apos;s data place obligations on services that knowingly collect it, and we are
          not set up to meet them.
        </p>
        <p>
          We do not knowingly collect personal information from anyone under that age. If we learn
          that we have, we will delete the account and its contents. If you believe a child has
          created an account, contact us.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          If we change this policy we will update the date at the top of this page. Significant
          changes will be announced in the app before they take effect.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about this policy or your data:{" "}
          <a className="text-primary hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          .
        </p>
        <p>
          See also our{" "}
          <Link className="text-primary hover:underline" href="/terms">
            Terms of Service
          </Link>
          .
        </p>
      </Section>
    </LegalPage>
  );
}

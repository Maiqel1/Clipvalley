import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Section, List } from "@/components/legal-page";
import { SITE_NAME, CONTACT_EMAIL, GOVERNING_LAW } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms you agree to when using ${SITE_NAME}.`,
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <Section title="Agreement">
        <p>
          By creating an account or using {SITE_NAME}, you agree to these terms. If you do not agree,
          please do not use the service.
        </p>
      </Section>

      <Section title="What the service does">
        <p>
          {SITE_NAME} stores text and images you paste and makes them available on any device where
          you sign in to the same account. Any clip can optionally be turned into a public read-only
          link.
        </p>
        <p>
          The service is provided free of charge. We may add, change, or remove features, and we may
          introduce paid plans in future.
        </p>
      </Section>

      <Section title="Your account">
        <List
          items={[
            <>You must provide a working email address and keep your login details secure.</>,
            <>
              You are responsible for everything that happens under your account. Tell us promptly if
              you believe someone else has access to it.
            </>,
            <>One account per email address. Do not register an address you do not control.</>,
            <>
              You must be at least 13 years old to use {SITE_NAME}, or older where your country
              sets a higher minimum age for consenting to online services.
            </>,
          ]}
        />
      </Section>

      <Section title="Your content">
        <p>
          <strong className="text-on-surface">Your clips remain yours.</strong> We claim no ownership
          over anything you paste. You grant us only the narrow permission needed to run the service
          — to store your content, and to display it back to you and to anyone you deliberately share
          a link with. That permission ends when you delete the content.
        </p>
        <p>
          You are responsible for the content you store, and for confirming you have the right to
          store it.
        </p>
      </Section>

      <Section title="Acceptable use">
        <p>Do not use {SITE_NAME} to store, share, or distribute:</p>
        <List
          items={[
            <>Anything unlawful, or content that infringes someone else&apos;s rights.</>,
            <>Malware, phishing material, or content designed to deceive or harm.</>,
            <>
              Other people&apos;s personal or confidential information without a lawful basis for
              doing so.
            </>,
            <>Content that harasses, threatens, or endangers anyone.</>,
          ]}
        />
        <p>Also do not:</p>
        <List
          items={[
            <>
              Attempt to access other users&apos; clips, probe the service for vulnerabilities, or
              circumvent its security controls.
            </>,
            <>
              Use automation to create accounts in bulk, or to place unreasonable load on the
              service.
            </>,
            <>Resell or redistribute the service as your own.</>,
          ]}
        />
        <p>
          Images are limited to 5 MB each. We may apply further limits on storage or request volume
          to keep the service running for everyone.
        </p>
      </Section>

      <Section title="Public share links">
        <p>
          Turning on sharing makes that clip readable by anyone holding the link, without signing in.
          You decide what to share and you are responsible for the consequences of sharing it. You
          can revoke a link at any time, which takes effect immediately.
        </p>
      </Section>

      <Section title="Availability">
        <p>
          {SITE_NAME} is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. We
          do not guarantee uninterrupted access, and we may suspend or discontinue the service, or
          any part of it, at any time.
        </p>
        <p>
          <strong className="text-on-surface">Keep your own copies of anything important.</strong>{" "}
          {SITE_NAME} is a convenience for moving content between devices, not a backup service, and
          deleted clips cannot be recovered.
        </p>
      </Section>

      <Section title="Suspension and termination">
        <p>
          You may stop using {SITE_NAME} at any time and request deletion of your account. We may
          suspend or terminate accounts that breach these terms, or where necessary to protect the
          service or its users. Where it is reasonable to do so, we will tell you why.
        </p>
      </Section>

      <Section title="Disclaimers and liability">
        <p>
          To the fullest extent permitted by law, we exclude all warranties not expressly stated in
          these terms, and we are not liable for lost data, lost profits, or any indirect or
          consequential loss arising from your use of the service.
        </p>
        <p>
          Nothing in these terms limits liability that cannot lawfully be limited, and this section
          does not affect any statutory rights you have as a consumer.
        </p>
      </Section>

      <Section title="Changes to these terms">
        <p>
          We may update these terms. The date at the top of this page shows when they last changed,
          and material changes will be announced in the app before taking effect. Continuing to use
          {" "}{SITE_NAME} after a change means you accept the updated terms.
        </p>
      </Section>

      <Section title="Governing law">
        <p>These terms are governed by the laws of {GOVERNING_LAW}.</p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about these terms:{" "}
          <a className="text-primary hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          .
        </p>
        <p>
          See also our{" "}
          <Link className="text-primary hover:underline" href="/privacy">
            Privacy Policy
          </Link>
          .
        </p>
      </Section>
    </LegalPage>
  );
}

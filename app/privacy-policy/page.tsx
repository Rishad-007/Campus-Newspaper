import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-5 px-4 py-4 sm:gap-6 sm:px-6 sm:py-6 lg:px-8">
      <header className="paper-surface rounded-2xl p-5 sm:p-6">
        <p className="text-xs font-semibold tracking-[0.14em] text-stone-600 uppercase">
          Legal Document
        </p>
        <h1 className="font-display mt-2 text-2xl text-stone-900 sm:text-5xl">
          Privacy Policy & Legal Disclaimer
        </h1>
        <p className="mt-2 text-sm text-stone-700">
          Effective date: 19 April 2026
        </p>
      </header>

      <section className="paper-surface space-y-6 rounded-2xl p-5 text-sm leading-7 text-stone-800 sm:p-6">
        <div>
          <h2 className="font-display text-2xl text-stone-900">
            1. Scope and Purpose
          </h2>
          <p className="mt-2">
            This Privacy Policy and Legal Disclaimer applies to the Daily BRUR
            website, including public pages, newsroom workflows, authentication
            features, and content publication systems.
          </p>
          <p className="mt-2">
            The purpose of this policy is to describe how information is
            handled, how complaints are processed, and how publication
            responsibility is allocated between contributors and platform
            operators.
          </p>
        </div>

        <div>
          <h2 className="font-display text-2xl text-stone-900">
            2. Data We Process
          </h2>
          <p className="mt-2">
            Depending on feature usage, the platform may process the following
            data categories:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              Account data: name, email, role, authentication identifiers.
            </li>
            <li>
              Editorial data: article drafts, images, tags, moderation notes.
            </li>
            <li>
              Operational data: timestamps, access logs, and audit-related
              metadata.
            </li>
            <li>Complaint data: contact details and complaint descriptions.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-2xl text-stone-900">
            3. Why We Process Data
          </h2>
          <p className="mt-2">Data is processed to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Authenticate users and enforce role-based access.</li>
            <li>Publish and moderate newspaper content.</li>
            <li>Investigate complaints and potential policy violations.</li>
            <li>Protect platform integrity, availability, and security.</li>
            <li>Comply with valid legal obligations and lawful requests.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-2xl text-stone-900">
            4. Content Responsibility and Editorial Position
          </h2>
          <p className="mt-2">
            Articles, opinions, reports, comments, and any published materials
            are the responsibility of the respective authors and publishing
            contributors.
          </p>
          <p className="mt-2">
            Content published through the platform reflects the position of the
            named author/editorial contributor and is not a personal statement
            of the software developer.
          </p>
          <p className="mt-2">
            The developer and technical implementation provider do not create,
            approve, or endorse each individual publication item by default, and
            therefore are not intended to bear personal liability for
            third-party authored content except where imposed by applicable law.
          </p>
          <p className="mt-2">
            The admin body performs workflow and moderation functions. To the
            fullest extent permitted by law, liability for factual claims,
            allegations, and legal validity of submitted content remains with
            the originating author and contributor chain.
          </p>
        </div>

        <div>
          <h2 className="font-display text-2xl text-stone-900">
            5. Complaints, Takedown, and Corrections
          </h2>
          <p className="mt-2">
            Any person may submit a complaint regarding allegedly defamatory,
            unlawful, inaccurate, or harmful content.
          </p>
          <p className="mt-2">
            Complaint reports are reviewed by the editorial/admin team and may
            result in one or more actions: correction, update notice, temporary
            unpublish, permanent removal, or legal escalation.
          </p>
          <p className="mt-2">
            Submitting a complaint does not guarantee removal outcome; decisions
            are taken based on available evidence, editorial policy, and legal
            requirements.
          </p>
        </div>

        <div>
          <h2 className="font-display text-2xl text-stone-900">
            6. Data Retention and Security
          </h2>
          <p className="mt-2">
            Data is retained only as long as reasonably necessary for
            publication workflow, moderation records, complaint processing,
            system security, and legal compliance.
          </p>
          <p className="mt-2">
            Reasonable technical and organizational safeguards are used to
            protect account and publication data. However, no internet-based
            system can be guaranteed to be 100% secure.
          </p>
        </div>

        <div>
          <h2 className="font-display text-2xl text-stone-900">
            7. User Rights and Requests
          </h2>
          <p className="mt-2">
            Subject to applicable law, users may request access, correction, or
            deletion of personal account data. Some records may be retained
            where legally required or necessary for dispute resolution and audit
            trails.
          </p>
        </div>

        <div>
          <h2 className="font-display text-2xl text-stone-900">
            8. Limitation of Liability
          </h2>
          <p className="mt-2">
            To the maximum extent permitted by applicable law, the developer,
            technical maintainers, and admin operators disclaim liability for
            indirect, incidental, punitive, or consequential damages arising
            from publication content submitted by contributors.
          </p>
          <p className="mt-2">
            Nothing in this section excludes liability that cannot be excluded
            by law. Where legal duties apply, this policy shall be interpreted
            in a manner consistent with those duties.
          </p>
        </div>

        <div>
          <h2 className="font-display text-2xl text-stone-900">
            9. Contributor Warranty and Indemnity
          </h2>
          <p className="mt-2">
            By submitting content, contributors represent that they have the
            necessary rights to publish the material and that the submission
            does not knowingly violate applicable law.
          </p>
          <p className="mt-2">
            Contributors agree to cooperate with reasonable investigation and,
            where legally enforceable, indemnify the platform against claims
            arising directly from unlawful or rights-infringing submissions.
          </p>
        </div>

        <div>
          <h2 className="font-display text-2xl text-stone-900">
            10. Third-Party Services
          </h2>
          <p className="mt-2">
            The platform may rely on third-party infrastructure and services
            (for example, cloud hosting, authentication, storage, and analytics
            components). Their independent terms and privacy rules may also
            apply.
          </p>
        </div>

        <div>
          <h2 className="font-display text-2xl text-stone-900">
            11. Governing Law and Jurisdiction
          </h2>
          <p className="mt-2">
            This policy is governed by applicable laws of the operating
            jurisdiction of the news portal, subject to mandatory legal rights.
            Disputes shall be handled through the competent forum/court unless
            otherwise required by law.
          </p>
        </div>

        <div>
          <h2 className="font-display text-2xl text-stone-900">
            12. Policy Updates
          </h2>
          <p className="mt-2">
            This policy may be updated from time to time. Material changes may
            be reflected by updating the effective date and publishing revised
            text on this page.
          </p>
        </div>

        <div>
          <h2 className="font-display text-2xl text-stone-900">
            13. Important Legal Clarification
          </h2>
          <p className="mt-2">
            This policy is designed to reduce risk and clarify responsibilities,
            but no policy text can guarantee complete immunity from legal claims
            in every jurisdiction or scenario.
          </p>
          <p className="mt-2">
            For enforceable legal protection, consult a licensed lawyer and
            tailor this policy and newsroom process to local law.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-full border border-stone-400 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-900 hover:text-stone-50 sm:min-h-10"
          >
            Back to homepage
          </Link>
        </div>
      </section>
    </main>
  );
}

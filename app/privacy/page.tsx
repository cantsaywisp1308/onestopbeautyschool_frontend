'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './privacy.module.css';

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.backgroundGlow}></div>
      
      <header className={styles.header}>
        <div className={styles.brand} onClick={() => router.push('/')}>
          OneStop <span className={styles.highlight}>Beauty</span>
        </div>
        <Link href="/" className={styles.backButton}>&larr; Back to Home</Link>
      </header>

      <main className={styles.main}>
        <div className={styles.policyCard}>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.lastUpdated}>Last Updated: May 7, 2026</p>

          <section className={styles.section}>
            <p className={styles.intro}>
              This Privacy Policy discloses the privacy practices for <strong>www.onestopbeautyschool.org</strong>. 
              This notice applies solely to the information collected by this website. It will notify you of the following:
            </p>
            <ul className={styles.list}>
              <li>What personally identifiable information is being collected from you through the website, how it is used and with whom it is shared.</li>
              <li>What choices are available to you regarding the use of your data.</li>
              <li>The security procedures in place to protect the misuse of your information.</li>
              <li>How you can correct any inaccuracies in the information.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.subTitle}>Information Collection, Use, and Sharing</h2>
            <p>
              One Stop Beauty School is the sole owner of the information collected on this website. 
              We only have access to/collect information that you voluntarily give us via email or other direct contact from you. 
              We will not sell or rent this information to anyone.
            </p>
            <p>
              We will only use your information to respond to you regarding the reason you contacted us. 
              We will not share your information with any third party outside of our organization, 
              other than necessary to fulfill your request, e.g. to ship an order.
            </p>
            <p>
              Unless you ask us not to, we may contact you via email in the future to tell you about specials, 
              new products or services, or changes to this policy.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.subTitle}>Your Access to and Control over Information</h2>
            <p>
              You may opt out of any future contacts from us at any time. You can do the following at any time 
              by contacting us via the email address or phone number given on our website:
            </p>
            <ul className={styles.list}>
              <li>See what data we have about you, if any.</li>
              <li>Change/correct any data we have about you.</li>
              <li>Have us delete any data we have about you.</li>
              <li>Express any concern you have about our use of your data.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.subTitle}>Security</h2>
            <p>
              We take precautions to protect your information. When you submit sensitive information via the website, 
              your information is protected both online and offline.
            </p>
            <p>
              Whenever we collect sensitive information (such as credit card data), that information is encrypted 
              and transmitted to us in a secure way. You can verify this by looking for a closed lock icon at the 
              bottom of your web browser or looking for “https” at the beginning of the address of the webpage.
            </p>
            <p>
              While we use encryption to protect sensitive information transmitted online, we also protect your 
              information offline. Only employees who need the information to perform a specific job 
              (for example, billing or customer service) are granted access to personally identifiable information. 
              The computers/servers in which we store personally identifiable information are kept in a secure environment.
            </p>
          </section>

          <section className={styles.contactSection}>
            <p>
              If you feel that we are not abiding by this Privacy Policy, you should contact us immediately 
              via telephone at <strong>(773) 232-8896</strong> or via email at 
              <a href="mailto:info@onestopbeautyschool.com" className={styles.contactLink}> info@onestopbeautyschool.com</a>.
            </p>
          </section>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>© 2026 OneStop Beauty School. All rights reserved.</p>
      </footer>
    </div>
  );
}

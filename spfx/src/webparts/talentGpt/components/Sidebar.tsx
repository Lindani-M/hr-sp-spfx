import * as React from 'react';
import { logoBase64 } from '../assets/logo';
import styles from './Sidebar.module.scss';

const Sidebar: React.FC = () => {
  return (
    <aside className={styles.sidebar}>

      {/* Logo card */}
      <div className={styles.logoCard}>
        <img src={logoBase64} alt="Allan Gray Philanthropy" className={styles.logoImg} />
      </div>

      {/* App identity */}
      <div className={styles.identity}>
        <span className={styles.appName}>TalentGPT</span>
        <span className={styles.appTag}>MSc Research Assistant</span>
      </div>

      <div className={styles.rule} />

      {/* About */}
      <div className={styles.section}>
        <p className={styles.sectionLabel}>About</p>
        <p className={styles.sectionDesc}>
          Search the manuscript, supporting literature, and supplementary slides
          from the MSc Documents SharePoint knowledge base.
        </p>
      </div>

      {/* Topic pills */}
      <div className={styles.section}>
        <p className={styles.sectionLabel}>Topics covered</p>
        <div className={styles.pills}>
          {[
            'Recruitment Headhunting',
            'Explainable ML',
            'Coresignal API',
            'TF-IDF',
            'Shapash',
            'RMSE / MAE',
            'Candidate Ranking',
            'Ridge Regression',
          ].map((t) => (
            <span key={t} className={styles.pill}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <p className={styles.powered}>Powered by Claude</p>
      </div>

    </aside>
  );
};

export default Sidebar;

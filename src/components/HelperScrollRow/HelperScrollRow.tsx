import React from 'react';
import { IonIcon } from '@ionic/react';
import { star, locationOutline } from 'ionicons/icons';
import { Helper } from '../../models/Helper';
import './HelperScrollRow.css';

interface HelperScrollRowProps {
  title: string;
  badge?: string;
  helpers: Helper[];
  onHelperClick: (helper: Helper) => void;
}

const HelperScrollRow: React.FC<HelperScrollRowProps> = ({ title, badge, helpers, onHelperClick }) => {
  return (
    <div className="hsr-section">
      <div className="hsr-header">
        <h2 className="hsr-title">{title}</h2>
        {badge && <span className="hsr-badge">{badge}</span>}
      </div>

      {helpers.length === 0 ? (
        <div className="hsr-empty">Loading...</div>
      ) : (
        <div className="hsr-scroll-track">
          {helpers.map((helper) => (
            <div
              key={helper.id}
              className="hsr-card"
              onClick={() => onHelperClick(helper)}
            >
              <div className="hsr-banner-wrap">
                <img
                  className="hsr-banner"
                  src={helper.banner || helper.avatar || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80'}
                  alt={helper.name}
                />
                <div className="hsr-rating-pill">
                  <IonIcon icon={star} />
                  <span>{helper.rating?.toFixed(1) ?? '–'}</span>
                </div>
              </div>

              <div className="hsr-body">
                <div className="hsr-avatar-wrap">
                  <img
                    className="hsr-avatar"
                    src={helper.avatar || 'https://www.gravatar.com/avatar?d=mp'}
                    alt={helper.name}
                  />
                </div>
                <p className="hsr-name">{helper.name}</p>
                <p className="hsr-category">{helper.category}</p>
                {helper.zipcodes?.[0] && (
                  <p className="hsr-location">
                    <IonIcon icon={locationOutline} />
                    {helper.zipcodes[0]}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HelperScrollRow;

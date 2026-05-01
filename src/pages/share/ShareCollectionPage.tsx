import React, { useState, useEffect } from 'react';
import {
  IonPage, IonContent, IonSpinner, IonIcon,
} from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import { star, locationOutline, shareOutline, home } from 'ionicons/icons';
import { getCardHolderById } from '../../services/CardHolderService';
import * as HelperService from '../../services/HelperService';
import { CardHolder } from '../../models/CardHolder';
import { Helper } from '../../models/Helper';
import UserProfileService from '../../services/UserProfileService';
import './ShareCollectionPage.css';

const ShareCollectionPage: React.FC = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const history = useHistory();
  const [collection, setCollection] = useState<CardHolder | null>(null);
  const [ownerName, setOwnerName] = useState<string | null>(null);
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const col = await getCardHolderById(collectionId);
        if (!col) { setNotFound(true); setLoading(false); return; }
        setCollection(col);
        
        // Fetch owner name
        if (col.userId) {
          const profile: any = await UserProfileService.getProfile(col.userId);
          if (profile && profile.firstName) {
            setOwnerName(`${profile.firstName} ${profile.lastName || ''}`.trim());
          }
        }

        const fetched = await Promise.all(
          col.helperIds.map(id => HelperService.getHelperById(id))
        );
        setHelpers(fetched.filter(Boolean) as Helper[]);
      } catch (err) {
        console.error(err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [collectionId]);

  const handleNativeShare = async () => {
    const url = window.location.href;
    const text = helpers
      .map((h, i) => `${i + 1}. ${h.name} ⭐${h.rating?.toFixed(1)} · ${h.category}`)
      .join('\n');
    const shareData = {
      title: `Recommended: ${collection?.name}`,
      text: `Check out my recommended list "${collection?.name}":\n\n${text}`,
      url,
    };
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(`${shareData.text}\n${url}`);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) return (
    <IonPage>
      <IonContent className="sc-content">
        <div className="sc-center"><IonSpinner name="dots" /></div>
      </IonContent>
    </IonPage>
  );

  if (notFound) return (
    <IonPage>
      <IonContent className="sc-content">
        <div className="sc-center">
          <p className="sc-not-found">This collection doesn't exist or has been removed.</p>
        </div>
      </IonContent>
    </IonPage>
  );

  return (
    <IonPage>
      <IonContent className="sc-content">
        {/* Hero header */}
        <div className="sc-hero">
          <button 
            onClick={() => history.push('/home')}
            style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', zIndex: 10 }}
          >
            <IonIcon icon={home} style={{ fontSize: '18px' }} />
          </button>
          <div className="sc-app-badge">Do It Together</div>
          <h1 className="sc-title">{collection?.name}</h1>
          <p className="sc-subtitle">
            {helpers.length} recommended {helpers.length === 1 ? 'helper' : 'helpers'}
            {ownerName && ` • Shared by ${ownerName}`}
          </p>
          <button className="sc-share-btn" onClick={handleNativeShare}>
            <IonIcon icon={shareOutline} />
            Share this list
          </button>
        </div>

        {/* Helper cards grid */}
        <div className="sc-grid">
          {helpers.map((helper, i) => (
            <div key={helper.id} className="sc-card">
              <div className="sc-banner-wrap">
                <img
                  className="sc-banner"
                  src={helper.banner || helper.avatar || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80'}
                  alt={helper.name}
                />
                <div className="sc-rank">#{i + 1}</div>
                <div className="sc-rating-pill">
                  <IonIcon icon={star} />
                  <span>{helper.rating?.toFixed(1) ?? '–'}</span>
                </div>
              </div>
              <div className="sc-body">
                <div className="sc-avatar-wrap">
                  <img
                    className="sc-avatar"
                    src={helper.avatar || 'https://www.gravatar.com/avatar?d=mp'}
                    alt={helper.name}
                  />
                </div>
                <p className="sc-name">{helper.name}</p>
                <p className="sc-category">{helper.category}</p>
                {helper.address && (
                  <p className="sc-address">{helper.address}</p>
                )}
                {helper.contact && (
                  <a className="sc-contact" href={`tel:${helper.contact}`}>{helper.contact}</a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="sc-footer">
          <p>Discover more trusted helpers in your neighborhood</p>
          <a className="sc-cta-btn" href="https://doitto-fdce8.web.app">
            Get Do It Together →
          </a>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ShareCollectionPage;

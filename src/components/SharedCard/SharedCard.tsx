import React, { useRef, useEffect, useState } from 'react';
import html2canvas from 'html2canvas';

export interface Helper {
  id: string;
  name: string;
  title: string;
  description: string;
  rating: number;
  avatar: string;
  hourlyRate?: number;
  skills?: string[];
  location?: string;
  experience?: number;
  completedJobs?: number;
}

interface ShareCardProps {
  helper: Helper;
  onCardGenerated?: (dataUrl: string) => void;
  className?: string;
}

const ShareCard: React.FC<ShareCardProps> = ({ helper, onCardGenerated, className }) => {
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCardUrl, setGeneratedCardUrl] = useState<string>('');

  const generateShareCard = async (): Promise<string> => {
    if (!helper || !shareCardRef.current) return '';
    
    setIsGenerating(true);
    
    try {
      const canvas = await html2canvas(shareCardRef.current, {
        logging: false,
        useCORS: true,
        allowTaint: false,
      });

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      setGeneratedCardUrl(dataUrl);
      onCardGenerated?.(dataUrl);
      return dataUrl;
    } catch (error) {
      console.error('Error generating share card:', error);
      return createFallbackShareCard();
    } finally {
      setIsGenerating(false);
    }
  };

  const createFallbackShareCard = (): string => {
    // Simple fallback using canvas
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return helper.avatar;

    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 630);

    // Draw content
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
    ctx.fillText(helper.name, 60, 120);
    
    ctx.font = '32px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
    ctx.fillText(helper.title, 60, 180);
    
    ctx.font = '24px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
    const description = helper.description.length > 120 
      ? helper.description.substring(0, 120) + '...' 
      : helper.description;
    ctx.fillText(description, 60, 250);
    
    ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
    ctx.fillText(`⭐ ${helper.rating}/5`, 60, 350);

    // Draw avatar
    const img = new Image();
    img.src = helper.avatar;
    img.onload = () => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(1000, 120, 80, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 920, 40, 160, 160);
      ctx.restore();
    };

    return canvas.toDataURL('image/png');
  };

  const handleDownload = async () => {
    const dataUrl = await generateShareCard();
    if (dataUrl) {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${helper.name.replace(/\s+/g, '-').toLowerCase()}-share-card.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = async () => {
    const dataUrl = await generateShareCard();
    if (dataUrl && navigator.share) {
      try {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `${helper.name}-share-card.png`, { type: 'image/png' });

        await navigator.share({
          title: `${helper.name} - ${helper.title}`,
          text: helper.description,
          files: [file],
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        handleDownload(); // Fallback to download
      }
    } else {
      handleDownload(); // Fallback to download
    }
  };

  return (
    <div className={`share-card-container ${className || ''}`}>
      {/* Hidden card for html2canvas */}
      <div
        ref={shareCardRef}
        style={{
          position: 'absolute',
          top: '-9999px',
          left: '-9999px',
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: 'white',
          fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
          <img
            src={helper.avatar}
            alt={helper.name}
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '60px',
              border: '4px solid white',
              objectFit: 'cover',
            }}
          />
          <div style={{ marginLeft: '30px' }}>
            <h1 style={{ fontSize: '36px', margin: '0 0 10px 0', fontWeight: '700' }}>
              {helper.name}
            </h1>
            <h2 style={{ fontSize: '24px', margin: '0', fontWeight: '500', opacity: '0.9' }}>
              {helper.title}
            </h2>
          </div>
        </div>

        <div style={{ flex: 1, marginBottom: '30px' }}>
          <p style={{ fontSize: '20px', lineHeight: '1.6', margin: '0' }}>
            {helper.description}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ fontSize: '24px', fontWeight: '700' }}>
              ⭐ {helper.rating}/5
            </div>
            {helper.hourlyRate && (
              <div style={{
                fontSize: '20px',
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '8px 16px',
                borderRadius: '25px',
              }}>
                💼 ${helper.hourlyRate}/hr
              </div>
            )}
          </div>

          {helper.skills && helper.skills.length > 0 && (
            <div style={{ display: 'flex', gap: '10px' }}>
              {helper.skills.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          fontSize: '16px',
          opacity: '0.7',
        }}>
          Shared via HelperPlatform
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
        <button
          onClick={handleShare}
          disabled={isGenerating}
          style={{
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            opacity: isGenerating ? 0.7 : 1,
          }}
        >
          {isGenerating ? 'Generating...' : 'Share Card'}
        </button>
        
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          style={{
            padding: '12px 24px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            opacity: isGenerating ? 0.7 : 1,
          }}
        >
          {isGenerating ? 'Generating...' : 'Download Card'}
        </button>
      </div>

      {/* Preview (optional) */}
      {generatedCardUrl && (
        <div style={{ marginTop: '20px' }}>
          <h3>Preview:</h3>
          <img
            src={generatedCardUrl}
            alt="Share card preview"
            style={{
              maxWidth: '100%',
              borderRadius: '10px',
              border: '2px solid #e9ecef',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ShareCard;

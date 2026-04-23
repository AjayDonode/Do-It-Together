import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Helper } from '../../models/Helper';
import { IonIcon, IonAvatar } from '@ionic/react';
import { star, briefcase } from 'ionicons/icons';
import './StackedCards.css';

interface StackedCardsProps {
  header: string;
  helpers: Helper[];
  onHelperClick: (helper: Helper) => void;
}

const StackedCards: React.FC<StackedCardsProps> = ({ header, helpers, onHelperClick }) => {
  // To avoid mutating props directly, we manage a local stack of cards
  // We reverse the array so the first item in helpers array ends up at the end of cards array (which is visually on top)
  const [cards, setCards] = useState<Helper[]>([]);
  const [exitX, setExitX] = useState<number>(0);
  const [exitY, setExitY] = useState<number>(0);

  useEffect(() => {
    // When new helpers are provided (like a new search), reset the stack
    setCards([...helpers].reverse());
  }, [helpers]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo, id: string) => {
    const swipeThreshold = 100;
    
    if (info.offset.x > swipeThreshold) {
      // Swiped Right (Keep / Skip)
      setExitX(500);
      setExitY(0);
      setCards(prev => prev.filter(c => c.id !== id));
    } else if (info.offset.x < -swipeThreshold) {
      // Swiped Left (Discard)
      setExitX(-500);
      setExitY(0);
      setCards(prev => prev.filter(c => c.id !== id));
    } else if (info.offset.y < -swipeThreshold) {
      // Swiped Up (Open Profile)
      setExitX(0);
      setExitY(-500);
      const targetHelper = cards.find(c => c.id === id);
      if (targetHelper) {
        onHelperClick(targetHelper);
      }
      setCards(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <div className="stacked-cards-container">
      <h2>{header}</h2>
      
      {cards.length === 0 ? (
        <div className="no-cards">No more helpers to show!</div>
      ) : (
        <div className="cards-stack-wrapper">
          <AnimatePresence>
            {cards.map((helper, idx) => {
              const isTopCard = idx === cards.length - 1;
              const distanceToTop = cards.length - 1 - idx;
              
              // Math to stagger cards backwards and add a messy rotation
              const scale = Math.max(1 - distanceToTop * 0.05, 0.85);
              const yOffset = distanceToTop * 14; // pixels down
              const opacity = distanceToTop > 2 ? 0 : 1; // Only show top 3 cards visibly
              
              // Alternating rotation for a deck-of-cards feel
              const rotations = [0, -4, 3, -2];
              const rotate = isTopCard ? 0 : (rotations[distanceToTop] || 0);
              
              
              if (distanceToTop > 3) return null; // Don't render cards deep in the stack for performance

              return (
                <motion.div
                  key={helper.id}
                  className="stack-card"
                  drag={isTopCard}
                  dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
                  onDragEnd={(e, info) => handleDragEnd(e, info, helper.id)}
                  initial={{ scale: 0.8, y: 50, rotate: 0, opacity: 0 }}
                  animate={{ scale, y: yOffset, rotate, opacity }}
                  exit={{ x: exitX, y: exitY, rotate: exitX > 0 ? 15 : exitX < 0 ? -15 : 0, opacity: 0, transition: { duration: 0.2 } }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  style={{ zIndex: idx }}
                >
                  <div className="card-image-wrapper" onClick={() => isTopCard && onHelperClick(helper)}>
                    <img src={helper.banner || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952'} alt="banner" className="stack-banner" />
                    <IonAvatar className="stack-avatar">
                      <img src={helper.avatar || 'https://www.gravatar.com/avatar?d=mp'} alt="avatar" />
                    </IonAvatar>
                  </div>
                  
                  <div className="stack-card-info" onClick={() => isTopCard && onHelperClick(helper)}>
                    <h3>{helper.name}</h3>
                    <p className="stack-title">{helper.title}</p>
                    
                    <div className="stack-rating">
                      <IonIcon icon={star} className="star-icon" />
                      <span>{helper.rating} ({helper.reviews?.length || 0} reviews)</span>
                    </div>
                    
                    <div className="stack-skills">
                      <IonIcon icon={briefcase} className="skill-icon" />
                      <div className="skill-chips">
                        {helper.tags?.slice(0, 3).map((tag, i) => (
                          <span key={i} className="skill-chip">{tag}</span>
                        ))}
                      </div>
                    </div>

                    <div className="stack-instructions">
                      <span>← Skip</span>
                      <span>Swipe Up</span>
                      <span>Keep →</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default StackedCards;

// src/components/HelperSwiper.tsx (Updated for uniform card heights)
import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import '@ionic/react/css/ionic-swiper.css';
import { IonCard, IonCardContent, IonImg, IonButton, IonButtons, IonAvatar, IonItem, IonLabel, IonText, IonIcon } from '@ionic/react';
import './HelperSwiper.css'; // Import the CSS file
import { Helper } from '../../models/Helper';
import MiniCard from '../mini-card/mini-card';
import { star } from 'ionicons/icons';

interface HelperSwiperProps {
    header: string;
    helpers: Helper[];
    onHelperClick: (helper: Helper) => void; 
}

const HelperSwiper: React.FC<HelperSwiperProps> = ({ header, helpers, onHelperClick }) => {
    const swiperRef = useRef<any>(null); // Reference for the Swiper instance

    const handleNext = () => {
        if (swiperRef.current) {
            swiperRef.current.swiper.slideNext(); // Move to the next slide
        }
    };

    const handlePrev = () => {
        if (swiperRef.current) {
            swiperRef.current.swiper.slidePrev(); // Move to the previous slide
        }
    };

    const handleCardClick = (helper: Helper) => {
        console.log('Clicked helper:=>', helper);
    };

    return (
        <div className="sm-container">
            {/* Header with buttons on same row */}
            <div className="header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 15px' }}>
                <h2>{header} ▶</h2>
            </div>

            <div className="swiper-container">
                <Swiper
                    ref={swiperRef} // Attach the ref to the Swiper
                    spaceBetween={0}
                    slidesPerView={2.5} // Default for small screens
                    navigation={true} // Add navigation arrows
                    pagination={{ clickable: true }} // Add pagination dots
                    breakpoints={{
                        640: {
                            slidesPerView: 2.5, // For medium screens
                            spaceBetween: 0,
                        },
                        768: {
                            slidesPerView: 4.5, // For larger screens
                            spaceBetween: 0,
                        },
                        1024: {
                            slidesPerView: 8.5, // For very large screens
                            spaceBetween: 1,
                        },
                    }}
                >
                    {helpers.map((helper) => (
                        <SwiperSlide key={helper.id}>
                           
                            
                            <MiniCard helper={helper} onClick={() => onHelperClick(helper)} ></MiniCard>
                           
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

        </div>
    );
};

export default HelperSwiper;

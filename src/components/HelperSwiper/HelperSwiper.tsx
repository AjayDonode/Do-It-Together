import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import '@ionic/react/css/ionic-swiper.css';
import { IonCard, IonCardContent, IonImg, IonButton, IonButtons, IonAvatar, IonItem, IonLabel, IonText } from '@ionic/react';
import './HelperSwiper.css'; // Import the CSS file
import { Helper } from '../../models/Helper';


interface HelperSwiperProps {
    header: string;
    helpers: Helper[];
    onHelperClick: (helper: Helper) => void; // Add a prop for click event
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

    return (
        <div className="container">
            <h2>{header} ▶ </h2>
            {/* <IonButtons > */}
            <div>
            <IonButton fill='clear' onClick={handlePrev} className="swiper-button-prev">
                ◀ {/* Left Arrow */}
            </IonButton>
            <IonButton fill='clear' onClick={handleNext} className="swiper-button-next">
                ▶ {/* Right Arrow */}
            </IonButton>
            {/* </IonButtons> */}
            </div>
            <div className="swiper-container">
                <Swiper
                    ref={swiperRef} // Attach the ref to the Swiper
                    spaceBetween={1}
                    slidesPerView={2.5} // Default for small screens
                    breakpoints={{
                        640: {
                            slidesPerView: 4, // For medium screens
                            spaceBetween: 1,
                        },
                        768: {
                            slidesPerView: 5, // For larger screens
                            spaceBetween: 1,
                        },
                        1024: {
                            slidesPerView: 8, // For very large screens
                            spaceBetween: 1,
                        },
                    }}
                >
                    {helpers.map((helper) => (
                        <SwiperSlide key={helper.id}>
                            <IonCard
                                className="profile-content"
                                onClick={() => onHelperClick(helper)} // Call the click handler from props
                            >
                                 <div className="image">
                                 <IonAvatar> 
                                    <img src={helper.avatar} alt={helper.name} className="card-img" />
                                 </IonAvatar>    
                                </div>
                                <IonItem lines='none' className='profile'>
                                    <IonLabel class='ion-text-center'>
                                        <IonText className='profile-name'>{helper.name}</IonText>
                                        <p>
                                            <IonText>{helper.rating > 0
                                            ? `Rating: ${helper.rating} *`
                                            : 'No rating yet'} <br></br>
                                        {helper.info.slice(0, 40)}</IonText>
                                       </p>
                                    </IonLabel>

                                </IonItem>
                                {/* <IonCardContent>
                                    <h3>{helper.name}</h3>
                                    <p>
                                        {helper.rating > 0
                                            ? `Rating: ${helper.rating} *`
                                            : 'No rating yet'} <br></br>
                                        {helper.info.slice(0, 40)}...</p>
                                </IonCardContent> */}
                            </IonCard>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
};

export default HelperSwiper;

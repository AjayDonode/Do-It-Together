// src/components/HelperSwiper/HelperSwiper.tsx
import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import './HelperSwiper.css';
import { Navigation } from 'swiper/modules';
import { Helper } from '../../models/Helper';
import MiniCard from '../mini-card/mini-card';

interface HelperSwiperProps {
  header: string;
  helpers: Helper[];
  onHelperClick: (helper: Helper) => void;
}

const HelperSwiper: React.FC<HelperSwiperProps> = ({ header, helpers, onHelperClick }) => {
  const swiperRef = useRef<any>(null);

  return (
    <div className="sm-container">
      <div className="header-container">
        <h2>{header}</h2>
        <div className="navigation-buttons">
          <div className="swiper-button-prev" onClick={() => swiperRef.current?.slidePrev()} />
          <div className="swiper-button-next" onClick={() => swiperRef.current?.slideNext()} />
        </div>
      </div>
      <Swiper
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        modules={[Navigation]}
        spaceBetween={20}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        }}
        className="swiper-container"
      >
        {helpers.map((helper) => (
          <SwiperSlide key={helper.id}>
           <MiniCard helper={helper} onClick={() => onHelperClick(helper)} ></MiniCard>
                           
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default HelperSwiper;

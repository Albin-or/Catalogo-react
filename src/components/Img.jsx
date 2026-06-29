import { useState, useEffect } from 'react';
import errorImgLocal from '../assets/error-img.svg';

export function Img({ src, alt, fallbackUrl, ...props }) {
  const cleanFallback = fallbackUrl || errorImgLocal;
  const [imgSrc, setImgSrc] = useState(src || cleanFallback);

  useEffect(() => {
    setImgSrc(src || cleanFallback);
  }, [src, cleanFallback]);

  return (
    <img
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => {
        if (imgSrc !== cleanFallback) {
          setImgSrc(cleanFallback);
        }
      }}
    />
  );
};
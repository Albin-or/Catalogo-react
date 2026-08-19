import { useState } from 'react';
import errorImgLocal from '../assets/error-img.svg';

export function Img({ src, alt, fallbackUrl, ...props }) {
  const cleanFallback = fallbackUrl || errorImgLocal;
  const requestedSrc = src || cleanFallback;
  const [failedSrc, setFailedSrc] = useState(null);
  const imgSrc = failedSrc === requestedSrc ? cleanFallback : requestedSrc;

  return (
    <img
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => {
        if (requestedSrc !== cleanFallback) {
          setFailedSrc(requestedSrc);
        }
      }}
    />
  );
};
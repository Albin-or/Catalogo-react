import { useState } from 'react';  
import errorImgLocal from '../assets/error-img.svg';

export function Img  ({ src, alt, fallbackUrl, ...props }) {  
  const [imgSrc, setImgSrc] = useState(src); 
  const cleanFallback = fallbackUrl || errorImgLocal;

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
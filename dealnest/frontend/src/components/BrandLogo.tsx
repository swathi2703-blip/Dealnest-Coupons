import { useState } from "react";

type BrandLogoProps = {
  className?: string;
  imageClassName?: string;
  textClassName?: string;
};

const BrandLogo = ({
  className = "",
  imageClassName = "h-10 w-auto",
  textClassName = "font-display font-bold text-xl",
}: BrandLogoProps) => {
  const [hasImageError, setHasImageError] = useState(false);

  return (
    <div className={className}>
      {hasImageError ? (
        <span className={textClassName}>DealNest</span>
      ) : (
        <img
          src="/dealnest-logo.svg"
          alt="DealNest"
          className={imageClassName}
          onError={() => setHasImageError(true)}
          loading="eager"
          decoding="async"
        />
      )}
    </div>
  );
};

export default BrandLogo;

import NextImage, { ImageProps as NextImageProps } from 'next/image';
import React, { ReactElement } from 'react';
import { styled } from 'stitches.config';

const Image = (props: NextImageProps) => {
  return (
    <NextImage
      {...props}
      layout="fill"
      objectFit="cover"
      className="next-image" // Add a class for potential global styling
    />
  );
};

Image.Root = styled('div', {
  position: 'relative',
  width: '100%',
  // Default to a square aspect ratio, can be overridden
  paddingBottom: '100%',

  '& > .next-image': {
    borderRadius: 'inherit', // Inherit border-radius from the parent
  },
});

Image.Source = () => {
  // This component is no longer needed with the new Image structure
  return null;
};

Image.RoundShape = (props: NextImageProps) => (
  <Image.Root css={{ borderRadius: '$round', paddingBottom: 0, width: props.width, height: props.height }}>
    <Image {...props} />
  </Image.Root>
);

export default Image;

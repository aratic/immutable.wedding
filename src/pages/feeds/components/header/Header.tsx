import Image from '@components/image';
import { Flex } from '@components/util/layout/Flex';
import React from 'react';
import { styled } from 'stitches.config';

interface Props {
  imageCount?: number;
}

export function Header({ imageCount }: Props) {
  return (
    <SHeader
      as="header"
      css={{
        zIndex: '$max',
        pt: '$20',
        pb: '$12',
        position: 'sticky',
        top: 0,
        backgroundColor: '$white',
        px: '$15',
        borderBottom: '1px solid $gray100',
      }}
      justify="between"
      align="center"
    >
      <Logo>wedding.log</Logo>
      <Flex.CenterVertical css={{ spaceX: '$12' }}>
        {imageCount != null && <ImageCount>{imageCount} photos</ImageCount>}
      </Flex.CenterVertical>
    </SHeader>
  );
}

const SHeader = styled(Flex.CenterVertical, {});

const Logo = styled('div', {
  fontFamily: 'sans-serif',
  fontWeight: 'bold',
  fontSize: '$lg',
});

const ImageCount = styled('div', {
  color: '$gray500',
  fontSize: '$sm',
});

import Image from '@components/image';
import { Highlight, RawHighlightData } from '@models/Highlight';
import { AnimatePresence, motion } from 'framer-motion';
import { GetStaticPropsContext, InferGetStaticPropsType } from 'next';
import { useRouter } from 'next/router';
import fs from 'fs';
import { getPlaiceholder } from 'plaiceholder';
import path from 'path';

import { Header } from '@pages/highlights/components/Header';
import { useAccount } from '@hooks/data/useAccount';

import { styled } from 'stitches.config';
import React, { useCallback, useState } from 'react';
import ContentWrapper from '@pages/highlights/components/ContentWrapper';

async function fetchHighlights() {
  const highlightJson = (await import('public/assets/data/highlights.json'))
    .default;
  const highlightDatdaset = highlightJson.data as RawHighlightData[];

  return highlightDatdaset;
}

export async function getStaticPaths() {
  const highlightDatdaset = await fetchHighlights();

  const paths = highlightDatdaset.map(({ id }) => ({
    params: { id: String(id) },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }: GetStaticPropsContext) {
  const rawHighlightDataSet = await fetchHighlights();
  // Read all image files from the directory
  const imageDir = path.join(process.cwd(), 'public/assets/img');
  const allImageFiles = fs.readdirSync(imageDir);
  const imageCandidates = allImageFiles
    .filter(file => file.toLowerCase().startsWith('ce5a') && file.toLowerCase().endsWith('.jpg'))
    .map(file => `/assets/img/${file}`);

  // Shuffle the images for randomness
  imageCandidates.sort(() => Math.random() - 0.5);
  let imageIdx = 0;

  const highlightDataSet = await Promise.all(
    rawHighlightDataSet.map(async highlightData => {
      const thumbnailImageSrc = imageCandidates[imageIdx++ % imageCandidates.length] || highlightData.thumbnailImageSrc;
      const { base64, metadata } = await getPlaiceholder(
        path.join('./public', thumbnailImageSrc),
      );

      const contents = await Promise.all(
        highlightData.contents.map(async content => {
          const imageSrcAssigned = imageCandidates[imageIdx++ % imageCandidates.length] || content.imageSrc;
          const { base64, metadata: imageMetadata } = await getPlaiceholder(path.join('./public', imageSrcAssigned));

          return {
            ...content,
            image: { width: imageMetadata.width, height: imageMetadata.height, src: imageSrcAssigned, blurDataURL: base64 },
          };
        })
      );

      const highlight: Highlight = {
        ...highlightData,
        thumbnailImage: {
          width: metadata.width, height: metadata.height, src: thumbnailImageSrc, blurDataURL: base64,
        },
        contents,
      };

      return highlight;
    })
  );

  const currentHighlight = highlightDataSet.find(
    ({ id }) => String(id) === params?.id
  );

  if (currentHighlight == null) {
    return { props: { highlight: null } };
  }

  return {
    props: { highlight: currentHighlight, highlightDataSet },
  };
}

type Props = InferGetStaticPropsType<typeof getStaticProps>;

export default function HighlightPage({ highlight, highlightDataSet }: Props) {
  const { data: account } = useAccount();
  const router = useRouter();

  const [index, setIndex] = useState(() => {
    return (
      highlightDataSet?.findIndex(dataSet => dataSet.id === highlight?.id) ?? 0
    );
  });

  const setNext = useCallback(() => {
    if (index === highlightDataSet!.length - 1) {
      router.push('/');
      return;
    }

    setIndex(prev => prev + 1);
  }, [highlightDataSet, index, router]);

  const setPrev = useCallback(() => {
    if (index === 0) {
      router.push('/');
      return;
    }

    setIndex(prev => prev - 1);
  }, [index, router]);

  const dataLength = highlightDataSet?.length ?? 0;
  const isIndexInBounds = index > -1 && index < dataLength;

  const mainContentImage = isIndexInBounds
    ? highlightDataSet?.[index].contents[0].image
    : null;

  const prevContentImage =
    index > 0 ? highlightDataSet?.[index - 1].contents[0].image : null;
  const nextContentImage =
    index < dataLength - 1
      ? highlightDataSet?.[index + 1].contents[0].image
      : null;

  const [backgroundContent, setBackgroundContent] =
    useState(nextContentImage);

  const setPrevToBackgroundContent = useCallback(() => {
    setBackgroundContent(prevContentImage);
  }, [prevContentImage]);

  const setNextToBackgroundContent = useCallback(() => {
    setBackgroundContent(nextContentImage);
  }, [nextContentImage]);

  return highlight == null ? (
    <div>Invalid Access</div>
  ) : (
    <AnimatePresence initial={false}>
      {backgroundContent != null ? (
        <ContentWrapper
          key={index + 1}
          imageContent={backgroundContent}
          initial={{ scale: 0, y: 105, opacity: 0 }}
          animate={{ scale: 0.75, y: 30, opacity: 0.5 }}
          transition={{
            scale: { duration: 0.2 },
            opacity: { duration: 0.4 },
          }}
        >
          <Header
            thumbnailImage={highlight.thumbnailImage}
            onClose={router.back}
          >
            {account.name}
          </Header>
          <StyledMotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Image.Root>
              <Image {...backgroundContent} width={520} height={520}>
                <Image.Source src={backgroundContent.src} alt={highlight.name} />
              </Image>
            </Image.Root>
          </StyledMotionDiv>
        </ContentWrapper>
      ) : null}

      {mainContentImage != null ? (
        <ContentWrapper
          key={index}
          imageContent={mainContentImage}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          drag="x"
          setPrev={setPrev}
          setNext={setNext}
          transition={{
            opacity: { duration: 0.2 },
          }}
          setPrevToBackgroundContent={setPrevToBackgroundContent}
          setNextToBackgroundContent={setNextToBackgroundContent}
        >
          <Header
            thumbnailImage={highlight.thumbnailImage}
            onClose={router.back}
          >
            {account.name}
          </Header>
          <StyledMotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Image.Root>
              <Image {...mainContentImage} width={520} height={520}>
                <Image.Source src={mainContentImage.src} alt={highlight.name} />
              </Image>
            </Image.Root>
          </StyledMotionDiv>
        </ContentWrapper>
      ) : null}
    </AnimatePresence>
  );
}

const StyledMotionDiv = styled(motion.div, {
  marginTop: `calc(25vh - 68px)`,
});

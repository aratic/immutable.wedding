import { FeedEntity, RawFeedData } from '@models/Feed';
import { Highlight, RawHighlightData } from '@models/Highlight';
import { Feed } from '@pages/feeds/components/feed/Feed';
import { Footer } from '@pages/feeds/components/footer/Footer';
import { Header } from '@pages/feeds/components/header/Header';
import { HighlightSection } from '@pages/feeds/components/highlight/HighlightSection';
import { InferGetStaticPropsType } from 'next';
import { getPlaiceholder } from 'plaiceholder';
import fs from 'fs';
import path from 'path';

export async function getStaticProps() {
  const [feedJson, highlightJson] = await Promise.all([
    (await import('public/assets/data/feeds.json')).default,
    (await import('public/assets/data/highlights.json')).default,
  ]);

  // Read all image files from the directory
  const imageDir = path.join(process.cwd(), 'public/assets/img');
  const allImageFiles = fs.readdirSync(imageDir);
  const imageCandidates = allImageFiles
    .filter(file => file.toLowerCase().startsWith('ce5a') && file.toLowerCase().endsWith('.jpg'))
    .map(file => `/assets/img/${file}`);
  console.log(`Found ${imageCandidates.length} images to use.`);

  // Shuffle the images for randomness
  imageCandidates.sort(() => Math.random() - 0.5);
  let imageIdx = 0;

  const feedDataset = feedJson.data as RawFeedData[];
  const highlightDatdaset = highlightJson.data as RawHighlightData[];

  const feedsPromises = Promise.all(
    feedDataset.map(async feed => {
      const contents = await Promise.all(
        feed.contents.map(async content => {
          // Use a shuffled image, looping if we run out
          const imageSrc = imageCandidates[imageIdx++ % imageCandidates.length] || '/assets/img/temp.jpg';
          console.log(`Assigning image ${imageSrc} to a feed item.`);


          const { base64, metadata } = await getPlaiceholder(path.join('./public', imageSrc));

          return { ...content, image: { width: metadata.width, height: metadata.height, src: imageSrc, blurDataURL: base64 } };
        })
      );
      return {
        ...feed,
        contents,
      } as FeedEntity;
    })
  );

  const highlightPromises = Promise.all(
    highlightDatdaset.map(async highlight => {
      // Use a shuffled image for the thumbnail
      const thumbnailImageSrc = imageCandidates[imageIdx++ % imageCandidates.length] || '/assets/img/temp.jpg';
      console.log(`Assigning image ${thumbnailImageSrc} to a highlight thumbnail.`);


      const { base64, metadata: thumbnailMetadata } = await getPlaiceholder(
        path.join('./public', thumbnailImageSrc),
        { size: 24 }
      );
      const contents = await Promise.all(
        highlight.contents.map(async content => {
          // Use a shuffled image for the content
          const imageSrc = imageCandidates[imageIdx++ % imageCandidates.length] || '/assets/img/temp.jpg';
          console.log(`Assigning image ${imageSrc} to a highlight content item.`);


          const { base64, metadata } = await getPlaiceholder(path.join('./public', imageSrc));

          return {
            ...content,
            image: { width: metadata.width, height: metadata.height, src: imageSrc, blurDataURL: base64 },
          };
        })
      );

      return {
        ...highlight,
        thumbnailImage: {
          width: thumbnailMetadata.width,
          height: thumbnailMetadata.height,
          src: thumbnailImageSrc,
          blurDataURL: base64,
        },
        contents,
      } as Highlight;
    })
  );

  const [feeds, highlights] = await Promise.all([
    feedsPromises,
    highlightPromises,
  ]);

  return { props: { feeds, highlights, imageCount: imageCandidates.length } };
}

type Props = InferGetStaticPropsType<typeof getStaticProps>;

export default function FeedsPage({ feeds, highlights, imageCount }: Props) {
  return (
    <>
      <Header imageCount={imageCount} />
      <HighlightSection highlights={highlights} />
      <Feed feeds={feeds} />
      <Footer />
    </>
  );
}

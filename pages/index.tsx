import { FeedEntity, RawFeedData } from '@models/Feed';
import { Highlight, RawHighlightData } from '@models/Highlight';
import { Feed } from '@pages/feeds/components/feed/Feed';
import { Footer } from '@pages/feeds/components/footer/Footer';
import { Header } from '@pages/feeds/components/header/Header';
import { HighlightSection } from '@pages/feeds/components/highlight/HighlightSection';
import { InferGetStaticPropsType } from 'next';
import { getPlaiceholder } from 'plaiceholder';
import path from 'path';

export async function getStaticProps() {
  const [feedJson, highlightJson] = await Promise.all([
    (await import('public/assets/data/feeds.json')).default,
    (await import('public/assets/data/highlights.json')).default,
  ]);
  const feedDataset = feedJson.data as RawFeedData[];
  const highlightDatdaset = highlightJson.data as RawHighlightData[];

  const feedsPromises = Promise.all(
    feedDataset.map(async feed => {
      const contents = await Promise.all(
        feed.contents.map(async content => {
          const imageSrc = content.imageSrc || '/assets/img/temp.jpg';


          const { base64, metadata } = await getPlaiceholder(path.join('./public', imageSrc));

          return { ...content, image: { ...metadata, src: imageSrc, blurDataURL: base64 } };
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
      const thumbnailImageSrc = highlight.thumbnailImageSrc || '/assets/img/temp.jpg';


      const { base64, metadata: thumbnailMetadata } = await getPlaiceholder(
        path.join('./public', thumbnailImageSrc),
        { size: 24 }
      );
      const contents = await Promise.all(
        highlight.contents.map(async content => {
          const imageSrc = content.imageSrc || '/assets/img/temp.jpg';


          const { base64, metadata } = await getPlaiceholder(path.join('./public', imageSrc));

          return {
            ...content,
            image: { ...metadata, src: imageSrc, blurDataURL: base64 },
          };
        })
      );

      return {
        ...highlight,
        thumbnailImage: {
          ...thumbnailMetadata,
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

  return { props: { feeds, highlights } };
}

type Props = InferGetStaticPropsType<typeof getStaticProps>;

export default function FeedsPage({ feeds, highlights }: Props) {
  return (
    <>
      <Header />
      <HighlightSection highlights={highlights} />
      <Feed feeds={feeds} />
      <Footer />
    </>
  );
}

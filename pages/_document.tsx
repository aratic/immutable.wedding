import Document, { Html, Head, Main, NextScript } from 'next/document';
import { getCssText } from '../stitches.config';

const gaId = process.env.NEXT_PUBLIC_GA_ID;

class MyDocument extends Document {
  render() {
    return (
      <Html lang="ko">
        <Head>
          <style
            id="stitches"
            dangerouslySetInnerHTML={{ __html: getCssText() }}
          />
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
            });
          `,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
          <noscript>You need to enable JavaScript to run this app.</noscript>
        </body>
      </Html>
    );
  }
}

export default MyDocument;
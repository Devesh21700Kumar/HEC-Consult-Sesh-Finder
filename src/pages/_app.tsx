import type { AppProps } from 'next/app'
import Head from 'next/head'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>My Buddy - HEC Session Manager</title>
        <meta name="description" content="Connect with HEC Paris students for case study sessions. Find study partners, schedule meetings, and collaborate effectively." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/HEC.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/assets/HEC.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://find-ur-consult-buddy-hec.netlify.app/" />
        <meta property="og:title" content="My Buddy - HEC Session Manager" />
        <meta property="og:description" content="Connect with HEC Paris students for case study sessions. Find study partners, schedule meetings, and collaborate effectively." />
        <meta property="og:image" content="https://find-ur-consult-buddy-hec.netlify.app/og-image.png" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://find-ur-consult-buddy-hec.netlify.app/" />
        <meta property="twitter:title" content="My Buddy - HEC Session Manager" />
        <meta property="twitter:description" content="Connect with HEC Paris students for case study sessions. Find study partners, schedule meetings, and collaborate effectively." />
        <meta property="twitter:image" content="https://find-ur-consult-buddy-hec.netlify.app/og-image.png" />
        
        {/* Additional meta tags */}
        <meta name="theme-color" content="#3B82F6" />
        <meta name="keywords" content="HEC Paris, case study, study partners, session management, collaboration, MBB, consulting" />
        <meta name="author" content="HEC Paris" />
        <meta name="application-name" content="My Buddy" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

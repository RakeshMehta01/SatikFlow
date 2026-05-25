import { useEffect } from 'react';

/**
 * Sets the browser tab title to "SatikFlow | <pageName>"
 * Resets to the base title on unmount.
 */
const usePageTitle = (pageName: string) => {
  useEffect(() => {
    document.title = `SatikFlow | ${pageName}`;
    return () => {
      document.title = 'SatikFlow - Lead & Sales Management';
    };
  }, [pageName]);
};

export default usePageTitle;

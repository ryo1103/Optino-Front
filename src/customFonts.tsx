import { Global } from '@mantine/core';
import Buch from './assets/fonts/TestSöhneBuch.otf';
import Fett from './assets/fonts/TestSöhneFett.otf';


export function CustomFonts() {

  return (
    <Global
      styles={[
       {
          '@font-face': {
            fontFamily: 'TestSöhne-Buch',
            src: `url(${Buch}) format("opentype")`,
            fontWeight: 400,
            fontStyle: 'normal',
          },
        }, 
        {
            '@font-face': {
              fontFamily: 'TestSöhne-Fett',
              src: `url(${Fett}) format("opentype")`,
              fontWeight: 400,
              fontStyle: 'normal',
            },
          }, 
        
      ]}
    />
  );
}
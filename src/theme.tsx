import { MantineThemeOverride, MantineProvider } from '@mantine/core';
const theme: MantineThemeOverride= {

    
    fontFamily: '',
    
    fontSizes:{sm:'12px',md:'14px', lg:'16px', xl:'18px'},
    
    
    colors:{
        base:['#FFFFFF', '#E5E6ED', '#A5ADCF', '#5D6588', '#34384C','#141518','#1E1F25' ],
        primary:['#5D6588','#1A82FF','#1E68F6','#34384C'],
        backgroundColor:['#141518'],
        price:['#11CABE', '#FA2256'],
        button:['#11CABE','#17d8cc']
    },

    headings:{
        fontFamily:'Graphik',
        sizes:{
            h1:{fontSize: '61px', fontWeight:700,},
            h2:{fontSize: '49px', fontWeight:700,},
            h3:{fontSize: '39px', fontWeight:700,},
            h4:{fontSize: '41px', fontWeight:700},
            h5:{fontSize: '25px', fontWeight:700},
            h6:{fontSize: '14px', fontWeight:600},

        }

    }


}

export default theme
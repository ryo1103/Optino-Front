import { Button, Text, Container, Group, Image, SegmentedControl, Grid, Divider, Space, createStyles, Select, Stack, Flex, Paper, Input, TextInput, Slider, Drawer, Title, Modal, Tooltip,Box, List,Mark} from '@mantine/core';
import { hover } from '@testing-library/user-event/dist/hover';
import { useCallback, useEffect, useMemo, useState } from 'react';

import Header from '../compoments/header';
const useStyles = createStyles((theme) => ({
    root:{
        border: '0.5px solid #707070',
        color:'#07005C',
        background:'rgba(255,255,255,0.3)',
        '&:not([data-disabled])': theme.fn.hover({
            backgroundColor: 'rgba(255,255,255,0.7)',
          }),
       // height:'96px',
        fontSize:'24px',
        fontWeight:400,


        

    },
    inner:{
        marginRight:'25px'
    }
    
}))

 function Stake  (){
    const { classes, cx } = useStyles();
    const [stake, useStake] = useState(0)
    return (
        <Header>

            <Group align={'start'} position="apart" ml={120} mr={120} mt={160} >
                <Title  order={3} c='#07005C' fw={400}>Stake</Title>
                <Title  order={3} c='#07005C' fw={400}>{stake} USDC</Title>
            </Group>
            <Group align={'start'} position="apart" ml={120} mr={120} mt={10} >
                <Title  order={3} c='#07005C' fw={400}>ARP</Title>
                <Title  order={3} c='#07005C' fw={400}>16 %</Title>
            </Group>


            <Group align={'start'} position="left" ml={120} mr={120}   mt={100}>
                <Button radius="md" classNames={{root:classes.root, inner:classes.inner}} size='xl'>Stake   </Button>
                <Button radius="md" classNames={{root:classes.root, inner:classes.inner}} size='xl' ml={60}>Unstake</Button>
            </Group>
            
        </Header>
    )
}

export default Stake
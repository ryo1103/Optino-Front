import { Button, Text, Container, Group, Image, SegmentedControl, Grid, Divider, Space, createStyles, Select, Stack, Flex, Paper, Input, TextInput, Slider, Drawer, Title, Modal, Tooltip,Box, List,Mark} from '@mantine/core';
import { useCallback, useEffect, useMemo, useState } from 'react';

import Header from '../compoments/header';
const useStyles = createStyles((theme) => ({
    back:{
        backgroundImage:`url(../assets/images/back1.png) cover`,

    }
    
}))

 function About  (){
    const { classes, cx } = useStyles();
    return (
        <Header>
            <Group align={'start'} position="apart" ml={120} w={'70%'} mt={80}>
                <Title order={3} c='#07005C'>About</Title>
                <Flex direction={'column'}>
                    <Text c='#07005C' display={'block'} w={629}  fz={22} lh='26.63px' >
                        We make a option product which settle to 0 or 1 based on its 
                        underlying asset’s price on expiration date. Traders receive a 
                        payout if the option expires in the money and incur a loss if it 
                        expires out of the money.
                    </Text>
                    <Text c='#07005C' display={'block'} w={629}  fz={22} lh='26.63px'  mt={30}>
                        For example , a trader buy a ETH-2000-CALL that will expire on 
                        April 1 , 2023 , at 12:00am . So when we come to expire time , if 
                        ETH price above 2000 , the option will settle to 1 , if ETH price 
                        below 2000 , the option will settle to 0.
                    </Text>
                </Flex>

            </Group>
            <Group align={'start'} position="apart" ml={120} w={'70%'} mt={160}>
                <Title  order={3} c='#07005C'>Contact Us</Title>
                <Text c='#07005C' display={'block'} w={629}  fz={22} lh='26.63px'>https://app.buidlbox.io/projects/optino</Text>

            </Group>
        </Header>
    )
}

export default About
import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';


export default function MenuDrawer() {
    const [state, setState] = React.useState({
        top: false,
        left: false,
        bottom: false,
        right: false,
    });

    const toggleDrawer = (anchor, open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }

        setState({ ...state, [anchor]: open });
    };

    const list = (anchor) => (
        <Box
            sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 250 }}
            role="presentation"
            onClick={toggleDrawer(anchor, false)}
            onKeyDown={toggleDrawer(anchor, false)}
        >
            <List>
                {['VM Catalogue', 'Vulnerability', 'Software Packages', 'Network Config', 'Cpu Disk and Memory', 'User'].map((item, index) => (
                    <ListItem key={item} disablePadding>
                        <ListItemButton href={`/${((item.split(" "))[0]).toLowerCase()}`}>
                            <ListItemIcon>
                                <GridViewOutlinedIcon />
                            </ListItemIcon>
                            <ListItemText primary={item} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <Box sx={{ border: "1px" }}>
            {['left'].map((anchor) => (
                <React.Fragment key={anchor}>
                    <IconButton aria-label="delete" style={{ color: "white", marginLeft: "12px" }} onClick={toggleDrawer(anchor, true)} >
                        <MenuRoundedIcon fontSize="large" />
                    </IconButton>
                    <Drawer
                        anchor={anchor}
                        open={state[anchor]}
                        onClose={toggleDrawer(anchor, false)}
                    >
                        {list(anchor)}
                    </Drawer>
                </React.Fragment>
            ))}
        </Box>
    );
}
import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import UploadFileSharpIcon from '@mui/icons-material/UploadFileSharp';
import {
	Container,
	createTheme,
	CssBaseline,
	ThemeProvider,
	ImageList,
	ImageListItem,
	Tabs,
	Tab,
	Fab,

} from "@mui/material";
import UploadIcon from '@mui/icons-material/Upload';
import { DialogContext } from './contexts/dialogContext';
import UploadDialog from './components/Dialog';
import UpdateDialog from './components/UpdateDialog';
import { getData } from './utils/fns';
import { UpdateDialogContext } from './contexts/updateDialogContext';
import { Button } from 'bootstrap';

const darkTheme = createTheme({
	palette: {
		mode: 'light'
	}
})

const drawerWidth = 240;
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
	({ theme, open }) => ({
	  flexGrow: 1,
	  padding: theme.spacing(3),
	  transition: theme.transitions.create('margin', {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	  }),
	  marginLeft: `-${drawerWidth}px`,
	  ...(open && {
		transition: theme.transitions.create('margin', {
		  easing: theme.transitions.easing.easeOut,
		  duration: theme.transitions.duration.enteringScreen,
		}),
		marginLeft: 0,
	  }),
	}),
  );
  
  const AppBar = styled(MuiAppBar, {
	shouldForwardProp: (prop) => prop !== 'open',
  })(({ theme, open }) => ({
	transition: theme.transitions.create(['margin', 'width'], {
	  easing: theme.transitions.easing.sharp,
	  duration: theme.transitions.duration.leavingScreen,
	}),
	...(open && {
	  width: `calc(100% - ${drawerWidth}px)`,
	  marginLeft: `${drawerWidth}px`,
	  transition: theme.transitions.create(['margin', 'width'], {
		easing: theme.transitions.easing.easeOut,
		duration: theme.transitions.duration.enteringScreen,
	  }),
	}),
  }));
  
  const DrawerHeader = styled('div')(({ theme }) => ({
	display: 'flex',
	alignItems: 'center',
	padding: theme.spacing(0, 1),
	// necessary for content to be below app bar
	...theme.mixins.toolbar,
	justifyContent: 'flex-end',
  }));
  

const categories = ['All', 'Animals', 'Flowers', 'People', 'Others'];

function App() {
	const theme = useTheme();
	const [openD, setOpenD] = React.useState(false);
  
	const [imageList, setImageList] = React.useState([]);

	const [value, setValue] = React.useState(0);

	const {handleOpen, open} = React.useContext(DialogContext);
	const {setImageData, handleUpdateOpen, openUpdate} = React.useContext(UpdateDialogContext);

	const handleDrawerOpen = () => {
		setOpenD(true);
	  };
	
	  const handleDrawerClose = () => {
		setOpenD(false);
	  };
	const handleChange = (event, newValue) => {
		setValue(newValue);
		fetchData(categories[newValue].toLowerCase() === 'all'? '':categories[newValue].toLowerCase());
	};

	const fetchData = async (category) => {
		try {
			const {data} = await getData(category);
			setImageList(data);
		} catch (err) {
			console.log(err)
		}
	}

	React.useEffect(() => {
		fetchData(categories[value].toLowerCase() === 'all'? '':categories[value].toLowerCase());
	}, [open, openUpdate])

	return (
		
		<Box sx={{ display: 'flex' }}>
		<CssBaseline />
		<AppBar position="fixed" open={openD}>
		  <Toolbar>
			<IconButton
			  color="inherit"
			  aria-label="open drawer"
			  onClick={handleDrawerOpen}
			  edge="start"
			  sx={{ mr: 2, ...(open && { display: 'none' }) }}
			>
			  <MenuIcon />
			</IconButton>
			<Typography variant="h6" noWrap component="div">
			  Photobook
			</Typography>
			<Fab color='light' sx={{ border:'none',boxShadow:'0px',marginLeft:'80%' }} onClick={handleOpen}>
					<UploadFileSharpIcon/>
				</Fab>
				
		  </Toolbar>
		</AppBar>
		<Drawer
		  sx={{
			width: drawerWidth,
			flexShrink: 0,
			'& .MuiDrawer-paper': {
			  width: drawerWidth,
			  boxSizing: 'border-box',
			},
		  }}
		  variant="persistent"
		  anchor="left"
		  open={openD}
		>
		  <DrawerHeader>
			<IconButton onClick={handleDrawerClose}>
			  {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
			</IconButton>
		  </DrawerHeader>
		  <Divider />
		  {/* <List >
			{categories.map((text,i) => (
			  <ListItem key={i} value={value} disablePadding  onClick={handleChange}>
				<ListItemButton   value={value} onClick={handleChange}>
				
				  <ListItemText primary={text}  onChange={handleChange} />
				</ListItemButton>
			  </ListItem>
			))}
		  </List> */}
		  		<Tabs value={value} onChange={handleChange} centered orientation="vertical">
		 			{categories.map((category, i) => <Tab key={category} label={category}/> )}
		 		</Tabs>
		  <Divider />
		 
		</Drawer>
		<Main open={openD}>
		  <DrawerHeader />
		  <ImageList cols={3} gap={5} sx={{ marginTop: 4}}>
					{imageList.map((item, index) => (
						<>
						<ImageListItem key={item.uid} onClick={() => {setImageData(item); handleUpdateOpen();}}>
							<img
								src={`${item.filename}?w=164&h=164&fit=crop&auto=format`}
								srcSet={`${item.filename}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
								alt={item.name}
								loading="lazy"
							/>
						</ImageListItem>
						</>
					))}
				</ImageList>
				
				<UploadDialog/>
				<UpdateDialog/>
		</Main>
	  </Box>
	)
}

export default App;

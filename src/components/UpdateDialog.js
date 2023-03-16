import * as React from "react";
import {
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    useTheme,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from "@mui/material";
import { UpdateDialogContext } from "../contexts/updateDialogContext";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from "dayjs";
import { deletePicture, post } from "../utils/fns";

const UpdateDialog = (props) => {
    const theme = useTheme();
    const {imageData} = React.useContext(UpdateDialogContext);
    const [category, setCategory] = React.useState('animals')
    const {openUpdate, handleUpdateClose} = React.useContext(UpdateDialogContext);
    const [postData, setPostData] = React.useState({
        image: null,
        name: '',
        location: '',
        date: null,
        uid: ''
    });
    const [preview, setPreview] = React.useState();
    
    const handleChange = async(e) => {
        if(e.target.id === 'image') {
            setPostData({
                ...postData,
                [e.target.id]: e.target.files[0]
            })
            setPreview(URL.createObjectURL(e.target.files[0]))
        } else {
            setPostData({
                ...postData,
                [e.target.id]: e.target.value
            })
        }
    }

    const handleSubmit = async () => {
        let formData = new FormData();
        Object.keys(postData).map(key => 
            formData.append(key, postData[key])
        )
        formData.append('category', category)
        try {
            await post(formData);
        } catch (err) {
            console.log(err.response)
        }
        handleUpdateClose()
    }

    const handleDelete = async () => {
        try {
            await deletePicture(postData.uid);
        } catch (err) {
            console.log(err)
        }
        handleUpdateClose();
    }

    React.useEffect(() => {
        setPostData({
            ...postData,
            name: imageData['name'],
            image: '',
            location: imageData['location'],
            uid: imageData['uid'],
            date: imageData['date']
        })
        setCategory(imageData['category'])
        setPreview(imageData['filename'])
    }, [openUpdate])

    return (
        <Dialog open={openUpdate} onClose={handleUpdateClose}>
            <DialogTitle sx={{marginLeft:'33%',fontWeight:'800'}}>EDIT METADATA</DialogTitle>
            <DialogContent>
                {preview && <img src={preview} sx={{marginLeft:'auto'}} alt='csc847' height={200} width={200}/> }
                <Button variant='contained'
                    component="label"
                    sx={{
                        border: `2px solid white`,
                        borderRadius: `10px`,
                        padding: `12px 36px 12px 36px`,
                        fontSize: `1rem`,
                        textAlign: 'center',
                        fontWeight: 600,
                        alignSelf: 'center',
                        justifySelf: 'center',
                        width: `40%`,
                        display:'flex',
                        alignItems:'center',
                        justifyContent:'center',
                        color:'white',
                        marginLeft:'30%'
                        
                    }}
                >
                    Upload New
                    <input
                        id="image"
                        type="file"
                        hidden
                        onChange={handleChange}
                    />
                </Button>
                <FormControl fullWidth sx={{ marginTop: 2}}>
                    <InputLabel id="demo-simple-select-autowidth-label">Category</InputLabel>
                    <Select
                        labelId="demo-simple-select-autowidth-label"
                        id="demo-simple-select-autowidth"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        label="Category"
                    >
                        <MenuItem value='animals'>Animals</MenuItem>
                        <MenuItem value='flowers'>Flowers</MenuItem>
                        <MenuItem value='people'>People</MenuItem>
                        <MenuItem value='others'>Others</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    margin="dense"
                    id="name"
                    label="Name"
                    value={postData.name}
                    type="text"
                    fullWidth
                    variant="outlined"
                    onChange={handleChange}
                />
                <TextField
                    margin="dense"
                    id="location"
                    label="Location"
                    type="text"
                    value={postData.location}
                    fullWidth
                    variant="outlined"
                    onChange={handleChange}
                />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        margin="dense"
                        fullWidth
                        id="date"
                        value={dayjs(postData.date)}
                        onChange={(value) => setPostData({...postData, date: value})}
                        sx={{ marginTop: 2}}
                    />
                </LocalizationProvider>
               
            </DialogContent>
            <DialogActions>
                <Button variant ='contained'onClick={handleDelete} sx={{color:'white'}}>Delete</Button>
                <Button variant ='contained'onClick={handleSubmit}sx={{color:'white'}}>Update</Button>
            </DialogActions>
        </Dialog>
    )
}

export default UpdateDialog;
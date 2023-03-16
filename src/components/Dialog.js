import * as React from "react";
import {
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
    useTheme
} from "@mui/material";
import { DialogContext } from "../contexts/dialogContext";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { post } from "../utils/fns";

const UploadDialog = () => {
    const theme = useTheme();
    const [category, setCategory] = React.useState('Animals')
    const {open, handleClose} = React.useContext(DialogContext);
    const [postData, setPostData] = React.useState({
        image: '',
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
        Object.keys(postData).map(key => formData.append(key, postData[key])
        )
        formData.append('category', category)
        try {
            const { data } = await post(formData);
            console.log(data)
        } catch (err) {
            console.log(err.response)
        }
        setPreview(null);
        handleClose();
    }

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle sx={{marginLeft:'37%',fontWeight:'800'}}>ADD IMAGE</DialogTitle>
            <DialogContent>
                
                {preview && <img src={preview} alt='csc847' height={200} width={200}/> }
                <Button variant="contained"
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
                    Upload 
                    <input
                        id="image"
                        type="file"
                        hidden
                        onChange={handleChange}
                    />
                </Button>
                <TextField
                    margin="dense"
                    id="name"
                    label="Name"
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
                    fullWidth
                    variant="outlined"
                    onChange={handleChange}
                />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        margin="dense"
                        fullWidth
                        id="date"
                        onChange={(value) => setPostData({...postData, date: value})}
                        sx={{ marginTop: 2}}
                    />
                </LocalizationProvider>
            </DialogContent>
            <DialogActions>
                <Button variant ='contained'onClick={handleSubmit}sx={{color:'white'}}>Submit</Button>
            </DialogActions>
        </Dialog>
       
    )
}

export default UploadDialog;
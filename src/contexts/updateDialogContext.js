import * as React from 'react';

export const UpdateDialogContext = React.createContext();

const UpdateDialogContextProvider = (props) => {
    const [open, setOpen] = React.useState(false);
    const [imageData, setImageData] = React.useState({})

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <UpdateDialogContext.Provider value={{ openUpdate: open, handleUpdateOpen: handleClickOpen, handleUpdateClose: handleClose, setImageData: setImageData, imageData: imageData}}>
            {props.children}
        </UpdateDialogContext.Provider>
    )
}

export default UpdateDialogContextProvider;
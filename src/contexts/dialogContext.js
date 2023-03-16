import * as React from 'react';

export const DialogContext = React.createContext();

const DialogContextProvider = (props) => {
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <DialogContext.Provider value={{ open: open, handleOpen: handleClickOpen, handleClose: handleClose}}>
            {props.children}
        </DialogContext.Provider>
    )
}

export default DialogContextProvider;
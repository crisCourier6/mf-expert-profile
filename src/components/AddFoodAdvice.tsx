import React, { useState } from 'react';
import api from '../api';
import { Typography, RadioGroup, FormControlLabel, Radio, Alert, Button, Dialog, DialogActions, DialogContent, 
    TextField, Snackbar, SnackbarCloseReason, DialogTitle, FormLabel, 
    Box,
    IconButton} from '@mui/material';
import { useParams } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

const AddFoodAdvice: React.FC= () => {
    const {id} = useParams()
    const token = window.sessionStorage.getItem("token") ?? window.localStorage.getItem("token")
    const foodAdviceURL = "/food-advice"
    const currentExpertId = window.sessionStorage.getItem("e_id") ?? window.localStorage.getItem("e_id")
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [snackbarOpen, setSnackbarOpen] = useState(false)
    const [snackbarMsg, setSnackbarMsg] = useState("")
    const [adviceContent, setAdviceContent] = useState("")
    const [adviceType, setAdviceType] = useState("warning")

    const handleSnackbarClose = (
        event: React.SyntheticEvent | Event,
        reason?: SnackbarCloseReason,
      ) => {
        if (reason === 'clickaway') {
          return;
        }
    
        setSnackbarOpen(false);
      }

    const handleOpenCreateFoodAdvice = () => {
        setAdviceContent("")
        setAdviceType("warning")
        setShowCreateForm(true)
    }

    const handleCloseCreateFoodAdvice = () => {
        setShowCreateForm(false)
    }

    const handleTypeChange = (e:string) => {
        setAdviceType(e)
    }

    const handleContentChange = (e:string) => {
        setAdviceContent(e)
    }

    const onCreateFoodAdvice = () => {
        const newFoodAdvice = {
            expertId: currentExpertId,
            foodLocalId: id,
            content: adviceContent,
            type: adviceType
        }
        api.post(`${foodAdviceURL}`, newFoodAdvice, {
            withCredentials: true,
            headers: {
                Authorization: "Bearer " + token
            }
        })
        .then((res) => {
            setSnackbarOpen(true);
            setSnackbarMsg("Consejo creado con éxito")
            handleCloseCreateFoodAdvice()
        })
        .catch((error) => {
            console.error(error);
            setSnackbarOpen(true)
            setSnackbarMsg(error.response.data.message)
            handleCloseCreateFoodAdvice()
        });
    };

    
    return (
        <>
            <Button onClick={handleOpenCreateFoodAdvice}
                variant="dark" 
                fullWidth
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding:0.2,
                    borderRadius:0,
                    border: "transparent",
                    "&:hover": {border: "transparent"}
                }}
            >
                <AddIcon sx={{fontSize: {xs:20, sm:25}}}></AddIcon>
                <Typography variant='subtitle2' color={"inherit"} sx={{fontSize: {xs:12, sm:14}}}>
                    Agregar consejo
                </Typography>
                
            </Button>
            <Dialog open={showCreateForm} onClose={handleCloseCreateFoodAdvice} 
            PaperProps={{
                sx: {
                    maxHeight: '80vh', 
                    width: "100vw",
                    maxWidth: "450px",
                    margin: 0
                }
            }} >
                <DialogTitle>
                    <Box sx={{display:"flex", justifyContent: "space-between"}}>
                        Agregar consejo
                        <IconButton
                        color="inherit"
                        onClick={handleCloseCreateFoodAdvice}
                        sx={{p:0}}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{
                    padding:0.5,
                    flex: 1, 
                    overflowY: 'auto'
                }}>
                        <TextField
                            inputProps={{maxLength: 250}}
                            helperText={`${adviceContent.length}/250`}
                            fullWidth
                            onChange={(e) => handleContentChange(e.target.value)}
                            label="Consejo"
                            multiline
                            rows={5}
                            margin="normal"
                        />
                            <FormLabel component="legend">Tipo de consejo</FormLabel>
                            <RadioGroup
                                row // Optional: This makes the radios appear horizontally
                                onChange={(e) => handleTypeChange(e.target.value)}
                                value={adviceType}
                            >
                                <FormControlLabel value="positive" control={<Radio />} label="Recomendación" />
                                <FormControlLabel value="negative" control={<Radio />} label="Advertencia" />
                            </RadioGroup>
                        <DialogActions>
                            <Button onClick={onCreateFoodAdvice} variant="contained" disabled={adviceContent===""}>Guardar</Button>
                        </DialogActions>
                </DialogContent>
            </Dialog>  
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                message={snackbarMsg}
            >
                <Alert variant="filled" onClose={handleSnackbarClose} severity={snackbarMsg.includes("Error")?"error":"success"} sx={{ width: '100%' }}>
                    {snackbarMsg}
                </Alert>
            </Snackbar>
        </>
    )
}

export default AddFoodAdvice;
import React, { useState } from 'react';
import api from '../api';
import { Typography, RadioGroup, FormControlLabel, Radio, Alert, Button, Dialog, DialogActions, DialogContent, 
    TextField, Snackbar, SnackbarCloseReason, DialogTitle, FormLabel } from '@mui/material';
import { useParams } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';


const AddFoodAdvice: React.FC= () => {
    const {id} = useParams()
    const token = window.sessionStorage.getItem("token") || window.localStorage.getItem("token")
    const foodAdviceURL = "/food-advice"
    const currentExpertId = window.sessionStorage.getItem("e_id") || window.localStorage.getItem("e_id")
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
            setSnackbarMsg("Recomendación creada con éxito")
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
                    width: "85vw",
                    maxWidth: "450px",
                }
            }} >
                <DialogTitle sx={{bgcolor: "primary.dark", color: "primary.contrastText"}}>
                    Agregar recomendación
                </DialogTitle>
                <DialogContent sx={{
                    padding:0.5,
                    flex: 1, 
                    overflowY: 'auto'
                }}>
                        <TextField
                            fullWidth
                            onChange={(e) => handleContentChange(e.target.value)}
                            label="Recomendación"
                            multiline
                            rows={5}
                            margin="normal"
                        />
                            <FormLabel component="legend">Tipo de recomendación</FormLabel>
                            <RadioGroup
                                row // Optional: This makes the radios appear horizontally
                                onChange={(e) => handleTypeChange(e.target.value)}
                                value={adviceType}
                            >
                                <FormControlLabel value="warning" control={<Radio />} label="General" />
                                <FormControlLabel value="positive" control={<Radio />} label="Positiva" />
                                <FormControlLabel value="negative" control={<Radio />} label="Negativa" />
                            </RadioGroup>
                        <DialogActions>
                            <Button onClick={handleCloseCreateFoodAdvice}>Cancelar</Button>
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
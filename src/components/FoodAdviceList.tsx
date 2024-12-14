import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, IconButton, Box, DialogActions, Button, Paper, 
    TextField, FormControlLabel, FormLabel, RadioGroup, Radio, Alert, SnackbarCloseReason, Snackbar } from '@mui/material';
import api from '../api';
import { FoodAdvice } from '../interfaces/FoodAdvice';
import dayjs from 'dayjs';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import RuleIcon from '@mui/icons-material/Rule';
import { useParams } from 'react-router-dom';

const FoodAdviceList: React.FC = () => {
    const [openList, setOpenList] = useState(false)
    const {id} = useParams()
    const [foodAdvices, setFoodAdvices] = useState<FoodAdvice[]>([]);
    const token = window.sessionStorage.getItem("token") || window.localStorage.getItem("token")
    const currentExpertId = window.sessionStorage.getItem("e_id") || window.localStorage.getItem("e_id")
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [snackbarOpen, setSnackbarOpen] = useState(false)
    const [snackbarMsg, setSnackbarMsg] = useState("")
    const [selectedFoodAdvice, setSelectedFoodAdvice] = useState<FoodAdvice | null>(null);
    const [editedContent, setEditedContent] = useState("");
    const [editedType, setEditedType] = useState("");
    const foodAdviceURL = "/food-advice"
    

    useEffect(() => {
        const queryParams = `?we=true&f=${id}`
        //console.log(`${foodAdviceURL}${queryParams}`)
        if(openList){
            api.get(`${foodAdviceURL}${queryParams}`,{
                withCredentials: true,
                headers: {
                    Authorization: "Bearer " + token
                }
            })
            .then(res=>{
                //console.log(res.data)
                setFoodAdvices(res.data)
            })
            .catch(error => {
                console.log(error.response)
            })
        }
    }, [openList]);

    const handleUpdateFoodAdvice = () => {
        if (selectedFoodAdvice) {
            const updatedFoodAdvice = {
                ...selectedFoodAdvice,
                content: editedContent,
                type: editedType,
            };

            api.patch(`${foodAdviceURL}/${selectedFoodAdvice.id}`, updatedFoodAdvice, {
                withCredentials: true,
                headers: { Authorization: "Bearer " + token },
            })
                .then(res => {
                    setSnackbarMsg(`Recomendación modificada con éxito`)
                    setFoodAdvices((prevAdvices) =>
                        prevAdvices.map((foodAdvice) => (foodAdvice.id === updatedFoodAdvice.id ? updatedFoodAdvice : foodAdvice))
                    );
                    setSelectedFoodAdvice(updatedFoodAdvice); // Update the selected role

                })
                .catch(error => {
                    console.log(error);
                });
        }
        setShowEditDialog(false);  // Close dialog after updating
    }

    const handleDeleteFoodAdvice = () => {
        if (selectedFoodAdvice) {
            api.delete(`${foodAdviceURL}/${selectedFoodAdvice.id}`, {
                withCredentials: true,
                headers: { Authorization: "Bearer " + token },
            })
            .then(res => {
                setSnackbarMsg(`Recomendación eliminada con éxito`)
                setFoodAdvices(foodAdvices.filter((foodAdvice: FoodAdvice) => foodAdvice.id !== selectedFoodAdvice?.id))
                setShowDeleteDialog(false)
            })
            .catch(error => {
                setSnackbarMsg(error.response.data.message)
                console.log(error);
            })
            .finally(()=>{
                setSnackbarOpen(true)
            })
        }
        setShowDeleteDialog(false);  // Close dialog after deleting
    }
    
    const openEditDialog = (foodAdvice: FoodAdvice) => {
        setSelectedFoodAdvice(foodAdvice);
        setEditedContent(foodAdvice.content || "");
        setEditedType(foodAdvice.type || "");
        setShowEditDialog(true);
    };

    // Open the delete confirmation dialog
    const openDeleteDialog = (foodAdvice: FoodAdvice) => {
        setSelectedFoodAdvice(foodAdvice);
        setShowDeleteDialog(true);
    };

    const handleSnackbarClose = (
        event: React.SyntheticEvent | Event,
        reason?: SnackbarCloseReason,
      ) => {
        if (reason === 'clickaway') {
          return;
        }
    
        setSnackbarOpen(false);
      }

    return (
        <>
            <Button onClick={()=>setOpenList(true)}
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
                    <RuleIcon sx={{fontSize: {xs:20, sm:25}}}></RuleIcon>
                    <Typography variant='subtitle2' color={"inherit"} sx={{fontSize: {xs:12, sm:14}}}>
                        Consejos
                    </Typography>
            </Button>
            <Dialog 
            open={openList} 
            onClose={()=>setOpenList(false)} 
            fullScreen
            PaperProps={{
                sx: {
                    maxHeight: '80vh', 
                    width: "95vw",
                    maxWidth: "500px"
                }
            }}>
                <DialogTitle sx={{bgcolor: "primary.dark", color: "primary.contrastText", textAlign: "center"}}>
                        Recomendaciones de consumo
                </DialogTitle>
                <DialogContent dividers sx={{padding:1}}>
                    <Box sx={{ 
                        display: 'flex', 
                        width: "100%",
                        alignItems: 'center', 
                        justifyContent: "center", 
                        flexDirection: "column",
                        gap:1,
                    }}>
                        {foodAdvices.map(foodAdvice => {
                            return (
                                <Box key={foodAdvice.id} sx={{ 
                                    display: 'flex', 
                                    width: "100%",
                                    flexDirection: "column",
                                    border: "2px solid",
                                    borderColor: "primary.dark",
                                    gap: 0.5,
                                }}> 
                                    <Paper sx={{
                                        width:"100%", 
                                        bgcolor: foodAdvice.type==="warning"
                                            ?"warning.main"
                                            :foodAdvice.type==="positive"
                                                ?"secondary.main"
                                                :"error.main",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        borderRadius:0
                                    }}>
                                        <Typography 
                                        variant="subtitle1" 
                                        color={foodAdvice.type==="warning"
                                            ?"warning.contrastText"
                                            :foodAdvice.type==="positive"
                                                ?"secondary.contrastText"
                                                :"error.contrastText"}
                                        sx={{flexGrow: 1, textAlign: "left", width: "80%", pl:1, fontSize:18}}
                                        >
                                            {foodAdvice.expertProfile?.user?.name} 
                                        </Typography>
                                    </Paper>
                                    <Box sx={{display: "flex", flexDirection: "column", width: "100%"}}>
                                        <Typography variant="subtitle1" textAlign={"justify"} sx={{px:1}}>
                                            {foodAdvice.content}
                                        </Typography>
                                        <Typography variant="subtitle2" textAlign={"right"} sx={{px:1, fontStyle: "italic"}}>
                                            {dayjs(foodAdvice.createdAt).format("DD/MM/YYYY")}
                                        </Typography>
                                    </Box>
                                    <Paper sx={{
                                        width:"100%", 
                                        bgcolor: foodAdvice.type==="warning"
                                                    ?"warning.main"
                                                    :foodAdvice.type==="positive"
                                                        ?"secondary.main"
                                                        :"error.main", 
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "start",
                                        borderRadius:0
                                    }}>
                                        <Box sx={{ display: "flex", flexDirection: "row-reverse", width:"100%", gap: 0.5 }}> {/* Wrap icons in a box for layout */}
                                            {foodAdvice.expertId === currentExpertId && 
                                                <>
                                                    <IconButton size="small" onClick={() => openEditDialog(foodAdvice)}>
                                                        <EditRoundedIcon sx={{ 
                                                            color: foodAdvice.type==="warning"
                                                                        ?"warning.contrastText"
                                                                        :foodAdvice.type==="positive"
                                                                            ?"secondary.contrastText"
                                                                            :"error.contrastText",
                                                            fontSize: 18
                                                        }}/>
                                                    </IconButton>
                                                </>
                                            }                   
                                            {foodAdvice.expertId === currentExpertId && 
                                                <>
                                                    <IconButton size="small" onClick={() => openDeleteDialog(foodAdvice)}>
                                                        <DeleteForeverRoundedIcon sx={{ 
                                                            color: foodAdvice.type==="warning"
                                                                        ?"warning.contrastText"
                                                                        :foodAdvice.type==="positive"
                                                                            ?"secondary.contrastText"
                                                                            :"error.contrastText", 
                                                            fontSize:18
                                                        }} />
                                                    </IconButton>
                                                </>
                                            }   
                                        </Box>
                                    </Paper>

                                </Box>
                            )
                        })}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={()=>setOpenList(false)}
                        variant="contained"
                    >
                        Cerrar
                    </Button>
                </DialogActions>
                {/* Edit Comment Dialog */}
                <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)}
                    PaperProps={{
                        sx: {
                            maxHeight: '80vh', 
                            width: "85vw",
                            maxWidth: "450px"
                        }
                    }} 
                >
                    <DialogTitle>Editar Comentario</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            label="Recomendación"
                            multiline
                            rows={4}
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            sx={{mt:2}}
                        />
                        <FormLabel component="legend">Tipo de recomendación</FormLabel>
                            <RadioGroup
                                row // Optional: This makes the radios appear horizontally
                                onChange={(e) => setEditedType(e.target.value)}
                                value={editedType}
                            >
                                <FormControlLabel value="warning" control={<Radio />} label="General" />
                                <FormControlLabel value="positive" control={<Radio />} label="Positiva" />
                                <FormControlLabel value="negative" control={<Radio />} label="Negativa" />
                            </RadioGroup>
                        
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowEditDialog(false)}>Cancelar</Button>
                        <Button onClick={handleUpdateFoodAdvice} variant="contained" disabled={editedContent=="" || editedType==""}>Guardar</Button>
                    </DialogActions>
                </Dialog>

                {/* Delete Comment Confirmation Dialog */}
                <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
                    <DialogTitle>Borrar recomendación</DialogTitle>
                    <DialogContent>
                        <Typography>¿Seguro que quieres borrar tu recomendación?</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowDeleteDialog(false)}>Cancelar</Button>
                        <Button onClick={handleDeleteFoodAdvice} variant="contained" color="error">Borrar</Button>
                    </DialogActions>
                </Dialog>
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={handleSnackbarClose}
                    message={snackbarMsg}
                >
                    <Alert onClose={handleSnackbarClose} severity={snackbarMsg.includes("Error")?"error":"success"} sx={{ width: '100%' }}>
                        {snackbarMsg}
                    </Alert>
                </Snackbar>
            </Dialog>
        </>
        
    );
};

export default FoodAdviceList;
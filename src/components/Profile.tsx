import React from "react";
import { Button, Box, Alert, Paper, Grid, Backdrop, Dialog, DialogContent, DialogActions, TextField, Snackbar, SnackbarCloseReason, InputAdornment, IconButton, Typography, FormControlLabel, Checkbox, DialogTitle} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';
// import { DevTool } from '@hookform/devtools';
import { Expert } from "../interfaces/Expert";
import { useForm } from "react-hook-form";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

type FormValues = {
    address: string,
    description: string,
    phone: string,
    webPage: string,
    specialty: string,
    isCoach: boolean,
    isNutritionist: boolean
}

const Profile: React.FC = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const { register, handleSubmit, formState, reset } = useForm<FormValues>({
        mode: "onBlur",
        reValidateMode: "onBlur",
        defaultValues: {
            address: "",
            description: "",
            phone: "",
            webPage: "",
            specialty: "",
            isCoach: false,
            isNutritionist: false
        }
    });
    const {errors, isValid} = formState
    const [user, setUser] = useState<Expert>({id: "", userId: ""})
    const [successOpen, setSuccessOpen] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false); // For dialog visibility
    const [isExpert, setIsExpert] = useState(false)

    const expertsURL = "http://192.168.100.6:8080/experts/"
    useEffect(()=>{
        
        axios.get(`${expertsURL}byUserId/${id}`, {
            withCredentials: true,
            headers: {
                Authorization: "Bearer " + window.localStorage.token
            }
        })
        .then((res)=>{
            console.log(res.data)
            setUser(res.data)
            reset(res.data)
            setIsExpert(true)
                                
        }).catch((error) => {
        })
    },[id, reset])

    const handleSuccessClose = (
        event: React.SyntheticEvent | Event,
        reason?: SnackbarCloseReason
    ) => {
        if (reason === 'clickaway') {
            return;
        }
        setSuccessOpen(false);
    };

    const handleDialogOpen = () => {
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    const onSubmit = (data: FormValues) => {
        axios.patch(`${expertsURL}byId/${user.id}`, data, {
            withCredentials: true,
            headers: {
                Authorization: "Bearer " + window.localStorage.token
            }
        })
        .then((res) => {
            console.log(res.data)
            setSuccessOpen(true);
            setUser(res.data); // Update the displayed user info
            setDialogOpen(false); // Close the dialog after successful submission
        })
        .catch((error) => {
            console.error(error);
        });
    };


    return ( isExpert && <Grid container 
            display="flex" 
            flexDirection="column" 
            justifyContent="center" 
            alignItems="center" 
            sx={{width: "100vw", maxWidth:"500px", gap:"10px"}}>
                
            <Box
                sx={{
                    border: "5px solid",
                    borderColor: "primary.main",
                    width:"90%",
                }}
                > 
                    <Paper elevation={0} square={true} sx={{
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        pb: "5px",
                        justifyContent: "flex-start",
                        display: "flex",
                        textIndent: 10
                    }}>
                        <Typography variant='h6' color= "primary.contrastText">
                        Información de experto
                        </Typography>
                    </Paper>
                    <Paper elevation={0}>
                    <ul style={{ paddingLeft: 10 }}>
                        <Typography variant='subtitle1' color= "primary.dark">
                            <li><span style={{fontWeight: "bold"}}>Descripción: </span>{user.description}</li>
                        </Typography>
                        <Typography variant='subtitle1' color= "primary.dark">
                            <li><span style={{fontWeight: "bold"}}>Especialidad: </span>{user.specialty}</li>
                        </Typography>
                        <Typography variant='subtitle1' color= "primary.dark">
                            <li><span style={{fontWeight: "bold"}}>Dirección: </span>{user.address}</li>
                        </Typography>
                        <Typography variant='subtitle1' color= "primary.dark">
                            <li><span style={{fontWeight: "bold"}}>Tel: </span>{user.phone}</li>
                        </Typography>
                        <Typography variant='subtitle1' color= "primary.dark">
                            <li><span style={{fontWeight: "bold"}}>Página web: </span>{user.webPage}</li>
                        </Typography>
                        <Typography variant='subtitle1' color="primary.dark">
                            <li>
                                <span style={{fontWeight: "bold"}}>
                                   {user.isNutritionist?<>Es nutricionista</>:<>No es nutricionista</>}
                                </span>
                            </li>
                        </Typography>
                        <Typography variant='subtitle1' color="primary.dark">
                            <li>
                                <span style={{fontWeight: "bold"}}>
                                   {user.isCoach?<>Es coach</>:<>No es coach</>}
                                </span>
                            </li>
                        </Typography>
                    </ul>
                    </Paper>
                    <Paper elevation={0} square={true} sx={{
                        bgcolor: "primary.main",
                        justifyContent: "center",
                        display: "flex",
                        flexDirection: "row"
                    }}>
                        <Button variant="contained" onClick={handleDialogOpen}
                        sx={{
                            borderRadius: 0, 
                            }}>
                            <Typography fontFamily="Montserrat" fontSize={14}>
                                Modificar información
                            </Typography>
                            
                        </Button>
                    </Paper> 
                </Box> 
                {/* Dialog for editing information */}
                <Dialog open={dialogOpen} onClose={handleDialogClose}
                PaperProps={{
                    sx: {
                        maxHeight: '80vh', 
                        width: "85vw",
                        maxWidth: "450px"
                    }
                }} >
                    
                    <DialogTitle sx={{bgcolor: "primary.dark", color: "primary.contrastText"}}>
                        Modificar información
                    </DialogTitle>
                    <DialogContent sx={{
                        padding:0.5,
                        flex: 1, 
                        overflowY: 'auto'
                    }}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <TextField
                                label="Descripción"
                                {...register('description', {required: "Ingresar descripción"})}
                                fullWidth
                                multiline
                                rows={4}
                                variant="outlined"
                                margin="normal"
                                defaultValue={user.description}  // Pre-fill with user description
                            />
                            <TextField
                                fullWidth
                                label="Especialidad"
                                {...register("specialty", {required: "Ingresar especialidad"})}
                                error={!!errors.specialty}
                                helperText={errors.specialty?.message}
                                margin="normal"
                            />
                            <TextField
                                fullWidth
                                label="Dirección"
                                {...register("address")}
                                error={!!errors.address}
                                helperText={errors.address?.message}
                                margin="normal"
                            />
                            <TextField
                                fullWidth
                                label="Teléfono"
                                {...register("phone")}
                                error={!!errors.phone}
                                helperText={errors.phone?.message}
                                margin="normal"
                            />
                            <TextField
                                fullWidth
                                label="Página Web"
                                {...register("webPage")}
                                error={!!errors.webPage}
                                helperText={errors.webPage?.message}
                                margin="normal"
                            />
                            
                            <FormControlLabel
                                control={<Checkbox {...register("isCoach")} defaultChecked={user.isCoach} />}
                                label="Coach"
                            />
                            <FormControlLabel
                                control={<Checkbox {...register("isNutritionist")} defaultChecked={user.isNutritionist} />}
                                label="Nutricionista"
                            />
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDialogClose}>Cancelar</Button>
                        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={!isValid}>Guardar</Button>
                    </DialogActions>
                </Dialog>         
                <Snackbar
                    open = {successOpen}
                    autoHideDuration={3000}
                    onClose={handleSuccessClose}
                    sx={{bottom: "40vh"}}
                    >
                    <Alert
                        severity="success"
                        variant="filled"
                        action={
                            <Button color="inherit" size="small" onClick={handleSuccessClose}>
                                OK
                            </Button>
                            }
                        sx={{ width: '100%',
                            color: "secondary.contrastText",
                            bgcolor: "secondary.main"
                        }}
                    >
                        Datos actualizados!
                    </Alert>
                </Snackbar>  
        </Grid>
    )
}

export default Profile
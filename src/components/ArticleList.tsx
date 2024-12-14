import React, { useEffect, useState } from 'react';
import api from '../api';
import { Box, Card, CardContent, Grid, IconButton, Typography, Alert, Button, Dialog, 
    DialogActions, DialogContent, TextField, Snackbar, SnackbarCloseReason, CardActions, 
    DialogTitle, Tooltip, CircularProgress } from '@mui/material';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { useForm } from 'react-hook-form';
import { Article } from '../interfaces/Article';
import ArticleDetails from './ArticleDetails';

type ArticleValues = {
    title: string,
    description: string,
    link: string
}

const ArticleList: React.FC<{ isAppBarVisible: boolean, canCreateArticle:boolean }> = ({ isAppBarVisible, canCreateArticle }) => {
    const articlesURL = "/articles"
    const token = window.sessionStorage.getItem("token") || window.localStorage.getItem("token")
    const [articles, setArticles] = useState<Article[]>([])
    const currentExpertId = window.sessionStorage.getItem("e_id") || window.localStorage.getItem("e_id")
    const [showEditForm, setShowEditForm] = useState(false)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [snackbarOpen, setSnackbarOpen] = useState(false)
    const [snackbarMsg, setSnackbarMsg] = useState("")
    const [allDone, setAllDone] = useState(false)
    const [openArticle, setOpenArticle] = useState(false)
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
    const queryParams = "?we=true"
    const articleForm = useForm<ArticleValues>({
        mode: "onBlur",
        reValidateMode: "onBlur",
        defaultValues: {
            title: "",
            description: "",
            link: ""
        }
    });
    const { register: registerArticle, handleSubmit: handleSubmitArticle, formState: articleFormState } = articleForm;
    const { errors: articleErrors, isValid: isArticleValid } = articleFormState;

    useEffect(() => {
        document.title = "Artículos de salud - EF Admin";
        api.get(`${articlesURL}${queryParams}`, {
            withCredentials: true,
            headers: {
                Authorization: "Bearer " + token
            }
        })
        .then(res => {
            setArticles(res.data)
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        })
        .finally(() => {
            setAllDone(true); // Set the flag after both requests have completed
        });

        
    
    }, []);

    const handleSnackbarClose = (
        event: React.SyntheticEvent | Event,
        reason?: SnackbarCloseReason,
      ) => {
        if (reason === 'clickaway') {
          return;
        }
    
        setSnackbarOpen(false);
      }
    const handleOpenArticle = (article: Article) => {
        setSelectedArticle(article)
        setOpenArticle(true)
    };

    const handleCloseArticle = () => {
        setOpenArticle(false);
        setSelectedArticle(null);
    };

    const handleDeleteArticle = (article: Article) => {
        setSelectedArticle(article)
        setShowDeleteDialog(true)
    }

    const handleOpenArticleForm = (article: Article) => {
        setSelectedArticle(article)
        const { title, description, link } = article
        articleForm.reset({title, description, link})
        setShowEditForm(true)
    }

    const handleCloseArticleForm = () => {
        setShowEditForm(false)
        setSelectedArticle(null)
    }

    const handleOpenCreateArticle = () => {
        articleForm.reset({title: "", description: "", link: ""})
        setShowCreateForm(true)
    }

    const handleCloseCreateArticle = () => {
        setShowCreateForm(false)
        setSelectedArticle(null)
    }

    const onCreateArticle = (data: ArticleValues) => {
        // console.log(data)
        api.post(`${articlesURL}`, {...data, expertId: currentExpertId}, {
            withCredentials: true,
            headers: {
                Authorization: "Bearer " + token
            }
        })
        .then((res) => {
            setSnackbarOpen(true);
            setSnackbarMsg("Artículo creado con éxito")
            setArticles((prevArticles) => [...prevArticles, res.data] )
            handleCloseCreateArticle()
        })
        .catch((error) => {
            console.error(error);
            setSnackbarOpen(true)
            setSnackbarMsg(error.response.data.message)
            handleCloseCreateArticle()
        });
    };

    const onEditArticle = (data: ArticleValues) => {
        // console.log(data)
        api.patch(`${articlesURL}/${selectedArticle?.id}`, data, {
            withCredentials: true,
            headers: {
                Authorization: "Bearer " + token
            }
        })
        .then((res) => {
            setSnackbarOpen(true);
            setSnackbarMsg("Artículo modificado con éxito")
            setArticles((prevArticles) => 
                prevArticles.map((article) =>
                    article.id===res.data.id ? res.data : article
                )
            )
            handleCloseArticleForm()
        })
        .catch((error) => {
            console.error(error);
            setSnackbarOpen(true)
            setSnackbarMsg(error.response.data.message)
            handleCloseArticleForm()
        });
    };

    const onDeleteArticle = () => {
        api.delete(`${articlesURL}/${selectedArticle?.id}`, {
            withCredentials: true,
            headers: {
                Authorization: "Bearer " + token
            }
        })
        .then(res => {
            // console.log(res)
            setSnackbarOpen(true)
            setSnackbarMsg(`Artículo eliminado con éxito`)
            setArticles(articles.filter((article: Article) => article.id !== selectedArticle?.id))
            setShowDeleteDialog(false)
            
        })
        .catch(error =>{
            console.log(error.message)
            setSnackbarOpen(true)
            setSnackbarMsg(error.response.data.message)
            handleCloseArticleForm()
        })
    }

    return ( allDone?
        <Grid container display="flex" 
        flexDirection="column" 
        justifyContent="center"
        alignItems="center"
        sx={{width: "100vw", gap:2, flexWrap: "wrap", pb: 7}}
        >
            <Box 
                sx={{
                    position: 'sticky',
                    top: isAppBarVisible?"50px":"0px",
                    width:"100%",
                    maxWidth: "500px",
                    transition: "top 0.1s",
                    backgroundColor: 'primary.dark', // Ensure visibility over content
                    zIndex: 100,
                    boxShadow: 3,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    borderBottom: "5px solid",
                    borderColor: "secondary.main",
                    boxSizing: "border-box"
                  }}
            >
                <Typography variant='h5' width="100%"  color="primary.contrastText" sx={{py:1, borderLeft: "3px solid",
                    borderRight: "3px solid",
                    borderColor: "secondary.main",
                    boxSizing: "border-box",
                }}>
                    Artículos
                </Typography>
            </Box>

            <Box sx={{
                display:"flex", 
                flexDirection:"row", 
                justifyContent:"space-around",
                flexWrap: "wrap",
                alignItems:"stretch",
                width: "100vw", 
                maxWidth:"1000px", 
                gap:"10px"
            }}
            >
            
                { articles.map((article)=>{
                    return (
                    <Card key={article.id} sx={{
                    border: "4px solid", 
                    borderColor: "primary.dark", 
                    bgcolor: "primary.contrastText",
                    width:"90%", 
                    maxWidth: "450px",
                    height: "15vh",
                    maxHeight: "250px", 
                    minHeight: "100px",
                    display:"flex",
                    }}>
                        <CardContent sx={{
                        width:"80%",
                        height: "100%", 
                        display:"flex", 
                        flexDirection: "row", 
                        justifyContent: "center",
                        alignItems: "center",
                        padding:0,
                        }}>
                            <Box sx={{
                                width:"100%", 
                                height: "100%",
                                display:"flex", 
                                flexDirection: "column",
                                justifyContent: "flex-start",
                                
                            }}>
                                <Typography 
                                variant="h6" 
                                color="secondary.contrastText" 
                                width="100%" 
                                sx={{alignContent:"center", 
                                    borderBottom: "2px solid", 
                                    borderColor: "primary.main", 
                                    bgcolor: "secondary.main"}}
                                >
                                    {article.title}
                                </Typography>
                                <Typography 
                                variant='subtitle1' 
                                color= "primary.dark" 
                                sx={{
                                    textAlign:"left", 
                                    ml:1, 
                                    alignItems: "start", 
                                    justifyContent: "center", 
                                    display: "flex", 
                                    gap:1,
                                    height:"80%",
                                    overflow: "hidden", // Ensures content outside the box is hidden
                                    textOverflow: "ellipsis", // Adds "..." when text overflows
                                }}>
                                    {article.description}
                                </Typography>                               
                            </Box>
                        </CardContent>
                        <CardActions sx={{padding:0, width:"20%"}}>
                        <Box sx={{
                            width:"100%", 
                            display:"flex", 
                            height: "100%",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            bgcolor: "primary.dark",
                            }}>
                                {article.expertId===currentExpertId
                                    ?<><Tooltip title="Eliminar artículo" key="delete" placement="right" arrow={true}>
                                            <IconButton onClick={()=>handleDeleteArticle(article)}>
                                                <DeleteForeverRoundedIcon
                                                sx={{
                                                    color:"error.main", 
                                                    fontSize: {
                                                        xs: 18,   // font size for extra small screens (mobile)
                                                        sm: 24,   // font size for large screens (desktops)
                                                    }
                                                }}/>
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Modificar artículo" key="edit" placement="right" arrow={true}>
                                            <IconButton onClick={()=>handleOpenArticleForm(article)}>
                                                <EditIcon 
                                                sx={{
                                                    color:"primary.contrastText", 
                                                    fontSize: {
                                                        xs: 18,   // font size for extra small screens (mobile)
                                                        sm: 24,   // font size for large screens (desktops)
                                                    }
                                                }}/>
                                            </IconButton>
                                        </Tooltip></>
                                :<></>}
                                 
                                <Button onClick={() => {
                                handleOpenArticle(article)
                                }} 
                                variant='text' 
                                sx={{color: "secondary.main", 
                                    fontSize: {
                                        xs: 12,   // font size for extra small screens (mobile)
                                        sm: 16,   // font size for large screens (desktops)
                                    }, 
                                    padding:0
                                }}>
                                    Ver más
                                </Button>
                            </Box>
                        </CardActions>
                    </Card> 
                )}
            )}
            {selectedArticle && (
                <ArticleDetails 
                article={selectedArticle} 
                open={openArticle} 
                onClose={handleCloseArticle} 
                    />
            )}
            <Dialog open={showEditForm} onClose={handleCloseArticleForm} 
            PaperProps={{
                sx: {
                    maxHeight: '80vh', 
                    width: "85vw",
                    maxWidth: "450px"
                }
            }} >
                <DialogTitle sx={{bgcolor: "primary.dark", color: "primary.contrastText"}}>
                    Modificar artículo
                </DialogTitle>
                <DialogContent sx={{
                    padding:0.5,
                    flex: 1, 
                    overflowY: 'auto'
                }}>
                    <form onSubmit={handleSubmitArticle(onEditArticle)}>
                        <TextField
                            fullWidth
                            label="Título"
                            {...registerArticle("title", {required: "Ingresar título"})}
                            error={!!articleErrors.title}
                            helperText={articleErrors.title?.message}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Descripción"
                            multiline
                            rows={4}
                            {...registerArticle("description")}
                            error={!!articleErrors.description}
                            helperText={articleErrors.description?.message}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Enlace"
                            {...registerArticle("link")}
                            error={!!articleErrors.link}
                            helperText={articleErrors.link?.message}
                            margin="normal"
                        />
                        <DialogActions>
                            <Button onClick={handleCloseArticleForm}>Cancelar</Button>
                            <Button type="submit" variant="contained" disabled={!isArticleValid}>Guardar</Button>
                        </DialogActions>
                    </form>
                </DialogContent>
            </Dialog>    
            <Dialog open={showCreateForm} onClose={handleCloseCreateArticle} 
            PaperProps={{
                sx: {
                    maxHeight: '80vh', 
                    width: "85vw",
                    maxWidth: "450px"
                }
            }} >
                <DialogTitle sx={{bgcolor: "primary.dark", color: "primary.contrastText"}}>
                    Crear artículo
                </DialogTitle>
                <DialogContent sx={{
                    padding:0.5,
                    flex: 1, 
                    overflowY: 'auto'
                }}>
                    <form onSubmit={handleSubmitArticle(onCreateArticle)}>
                        <TextField
                            fullWidth
                            label="Título"
                            {...registerArticle("title", {required: "Ingresar título"})}
                            error={!!articleErrors.title}
                            helperText={articleErrors.title?.message}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Descripción"
                            multiline
                            rows={4}
                            {...registerArticle("description")}
                            error={!!articleErrors.description}
                            helperText={articleErrors.description?.message}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Enlace"
                            {...registerArticle("link")}
                            error={!!articleErrors.link}
                            helperText={articleErrors.link?.message}
                            margin="normal"
                        />
                        <DialogActions>
                            <Button onClick={handleCloseCreateArticle}>Cancelar</Button>
                            <Button type="submit" variant="contained" disabled={!isArticleValid}>Guardar</Button>
                        </DialogActions>
                    </form>
                </DialogContent>
            </Dialog>        

            <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
                <DialogTitle>Borrar artículo: {selectedArticle?.title}</DialogTitle>
                <DialogContent>
                    ¿Seguro que desea borrar este artículo?  
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowDeleteDialog(false)} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={onDeleteArticle} variant="contained" color="primary">
                        Borrar
                    </Button>
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
            {canCreateArticle && 
                <Button onClick={handleOpenCreateArticle}
                variant="dark" 
                sx={{
                    display: "flex",
                    position: 'fixed',
                    bottom: 0, // 16px from the bottom
                    zIndex: 100, // High zIndex to ensure it's on top of everything
                    height: "48px",
                    width: "50%",
                    maxWidth: "500px"
                }}
                >
                    <AddIcon sx={{fontSize: 40}}></AddIcon>
                    <Typography variant='subtitle1' color={"inherit"}>
                        Crear artículo
                    </Typography>
                    
                </Button>
            }
            
        </Box>
   
        </Grid>
        
        :<CircularProgress/>   
    )
}

export default ArticleList;
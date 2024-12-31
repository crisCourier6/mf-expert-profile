import React, { useEffect, useState } from 'react';
import api from '../api';
import { Box, Card, CardContent, Grid, IconButton, Typography, Alert, Button, Dialog, 
    DialogActions, DialogContent, TextField, Snackbar, SnackbarCloseReason, CardActions, 
    DialogTitle, Tooltip, CircularProgress, 
    Checkbox,
    InputAdornment,
    Divider} from '@mui/material';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { useForm } from 'react-hook-form';
import { Article } from '../interfaces/Article';
import ClearIcon from '@mui/icons-material/Clear';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CloseIcon from '@mui/icons-material/Close';
import NavigateBack from './NavigateBack';
import { Link } from 'react-router-dom';

type ArticleValues = {
    title: string,
    description: string,
    link: string
}

const ArticleList: React.FC<{ isAppBarVisible: boolean, canCreateArticle:boolean }> = ({ isAppBarVisible, canCreateArticle }) => {
    const articlesURL = "/articles"
    const token = window.sessionStorage.getItem("token") || window.localStorage.getItem("token")
    const [articles, setArticles] = useState<Article[]>([])
    const [filteredArticles, setFilteredArticles] = useState<Article[]>([])
    const [searchQuery, setSearchQuery] = useState("");
    const currentExpertId = window.sessionStorage.getItem("e_id") || window.localStorage.getItem("e_id")
    const [showEditForm, setShowEditForm] = useState(false)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [snackbarOpen, setSnackbarOpen] = useState(false)
    const [snackbarMsg, setSnackbarMsg] = useState("")
    const [allDone, setAllDone] = useState(false)
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
    const [showUserUploaded, setShowUserUploaded] = useState(false)
    const queryParams = "?we=true"
    const articleForm = useForm<ArticleValues>({
        mode: "onChange",
        reValidateMode: "onChange",
        defaultValues: {
            title: "",
            description: "",
            link: ""
        }
    });
    const { register: registerArticle, handleSubmit: handleSubmitArticle, formState: articleFormState, watch } = articleForm;
    const { errors: articleErrors, isValid: isArticleValid } = articleFormState;
    const description = watch('description', '');

    useEffect(() => {
        document.title = "Artículos de salud - EyesFood";
        api.get(`${articlesURL}${queryParams}`, {
            withCredentials: true,
            headers: {
                Authorization: "Bearer " + token
            }
        })
        .then(res => {
            const onlyActive = res.data.filter((article: Article) => article.expertProfile?.user?.isActive )
            setArticles(onlyActive)
            setFilteredArticles(onlyActive)
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        })
        .finally(() => {
            setAllDone(true); // Set the flag after both requests have completed
        });

        
    
    }, []);

    useEffect(()=>{
        let newFilteredArticles = articles
        if (showUserUploaded){
            newFilteredArticles = newFilteredArticles.filter((article) => article.expertId === currentExpertId)
        }
        if (searchQuery.length>2){
            const lowercasedQuery = searchQuery.toLowerCase()
            newFilteredArticles = newFilteredArticles.filter((article) => 
                article.title?.toLowerCase().includes(lowercasedQuery) || 
                article.description?.toLowerCase().includes(lowercasedQuery)
            )
        }
        setFilteredArticles(newFilteredArticles)
    }, [showUserUploaded, searchQuery, articles])

    const handleSnackbarClose = (
        event: React.SyntheticEvent | Event,
        reason?: SnackbarCloseReason,
      ) => {
        if (reason === 'clickaway') {
          return;
        }
    
        setSnackbarOpen(false);
      }
    
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const handleOpenLink = (article:Article) => {
        if (article.link){
            const url = article.link.startsWith('http://') || article.link.startsWith('https://')
                ? article.link
                : `https://${article.link}`; 

            window.open(url, '_blank')
        }
    };

    const handleClear = () => {
        setSearchQuery('')
    }

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

    const handleSwitchChange = () => {
        setShowUserUploaded(!showUserUploaded)
    };

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
                    flexDirection: "row",
                    alignItems: "center",
                    borderBottom: "5px solid",
                    borderLeft: "5px solid",
                    borderRight: "5px solid",
                    borderColor: "secondary.main",
                    boxSizing: "border-box",
                    color: "primary.contrastText"
                  }}
            >
                <Box sx={{display: "flex", flex: 1}}>
                    <NavigateBack/>
                </Box>
                <Box sx={{display: "flex", flex: 4}}>
                    <Typography variant='h6' width="100%"  color="primary.contrastText" sx={{py:1}}>
                        Artículos de salud
                    </Typography>
                </Box>
                <Box sx={{display: "flex", flex: 1}}>
                </Box>
            </Box>

            <Box sx={{
                display:"flex", 
                flexDirection:"column", 
                justifyContent:"center",
                alignItems:"center",
                width: "100%", 
                maxWidth:"500px", 
                gap:2
            }}
            >   
                <TextField 
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Buscar artículo"
                    variant="standard"
                    inputProps={{maxLength: 100}}
                    sx={{mt: 0.5, width:"90%", maxWidth: "400px"}}
                    InputProps={{
                        endAdornment: (
                            searchQuery && (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={handleClear} // Clear the input
                                        edge="end"
                                    >
                                        <ClearIcon />
                                    </IconButton>
                                </InputAdornment>
                            )
                        ),
                    }}
                />
                {
                    canCreateArticle && <>
                    <Box sx={{display:"flex", alignItems: "center", justifyContent: "center", width: "95%"}}>
                        <Box sx={{display: "flex", alignItems: "center", cursor: "pointer"}} onClick={handleSwitchChange}>
                            <Checkbox 
                            id={"filter"}
                            checked={showUserUploaded}
                            onChange={handleSwitchChange}
                            size="small"
                            />
                            <Typography variant='subtitle2' sx={{textDecoration: "underline"}}>
                                Subidos por mi
                            </Typography>
                        </Box>
                        <Divider orientation='vertical' flexItem sx={{px:1}}/>
                        <Button onClick={handleOpenCreateArticle} >
                            <AddIcon/>
                            <Typography variant='subtitle2' sx={{textDecoration: "underline"}}>
                                Agregar artículo
                            </Typography>
                        </Button>
                        
                    </Box>
                    </>
                }
                 
                { filteredArticles.map((article)=>{
                    return (
                    <Card key={article.id} sx={{
                    border: "4px solid", 
                    borderColor: "primary.dark", 
                    bgcolor: "primary.contrastText",
                    width:"95%", 
                    maxWidth: "450px",
                    height: "auto",
                    display:"flex",
                    flexDirection: "column"
                    }}>
                        <CardContent 
                        sx={{
                        width:"100%",
                        height: "auto", 
                        display:"flex", 
                        flexDirection: "column", 
                        justifyContent: "center",
                        alignItems: "center",
                        padding:0,
                        }}>
                            <Typography 
                                variant="subtitle1" 
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
                            variant='subtitle2' 
                            color= "primary.dark" 
                            sx={{
                                textAlign:"left", 
                                p:1,
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

                            <Box sx={{display: "flex", width: "100%", justifyContent: "flex-end"}}>
                                <Typography variant='subtitle2' 
                                sx={{
                                    fontStyle: "italic", 
                                    pr:1,
                                    pb: 1,
                                    color: "inherit",       // Optional, ensures link color matches the typography style
                                    "&:hover": {
                                        textDecoration: "underline", // Adds underline on hover
                                    },
                                }}
                                component={Link}
                                to={`/experts?expert=${article.expertProfile?.id}`}
                                >
                                    Subido por {article.expertProfile?.user?.name}
                                </Typography>
                            </Box>                          
                           
                        </CardContent>
                        <CardActions sx={{padding:0, width:"100%", maxHeight: "25px"}}>
                        <Box sx={{
                            width:"100%", 
                            display:"flex", 
                            height: "100%",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            bgcolor: "primary.dark",
                            }}>
                                <Box sx={{display:"flex", flex: 2, justifyContent: "center"}}>
                                    <Button onClick={() => {handleOpenLink(article)}}  
                                        sx={{color: "secondary.main", p:0}}
                                    >
                                        <OpenInNewIcon fontSize='small'/>
                                        Ver artículo
                                    </Button>
                                </Box>
                                {article.expertId===currentExpertId
                                    ?<Box sx={{display: "flex", justifyContent: "flex-end"}}>
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
                                        </Tooltip>
                                        <Tooltip title="Eliminar artículo" key="delete" placement="right" arrow={true}>
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
                                    </Box>
                                :<></>}
                            </Box>
                        </CardActions>
                    </Card> 
                )}
            )}
            <Dialog open={showEditForm} onClose={handleCloseArticleForm} 
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
                        Modificar artículo
                        <IconButton
                        color="inherit"
                        onClick={handleCloseArticleForm}
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
                    <form onSubmit={handleSubmitArticle(onEditArticle)}>
                        <TextField
                            fullWidth
                            inputProps={{maxLength: 100}}
                            label="Título"
                            {...registerArticle("title", {required: "Ingresar título"})}
                            error={!!articleErrors.title}
                            helperText={articleErrors.title?.message}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Descripción"
                            inputProps={{maxLength: 250}}
                            multiline
                            rows={4}
                            {...registerArticle("description")}
                            error={!!articleErrors.description}
                            helperText={
                                articleErrors.description?.message ||
                                `${description.length}/${250}`
                            }
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Enlace"
                            {...registerArticle("link")}
                            inputProps={{maxLength: 250}}
                            error={!!articleErrors.link}
                            helperText={articleErrors.link?.message}
                            margin="normal"
                        />
                        <DialogActions>
                            <Button type="submit" variant="contained" disabled={!isArticleValid}>Guardar</Button>
                        </DialogActions>
                    </form>
                </DialogContent>
            </Dialog>    
            <Dialog open={showCreateForm} onClose={handleCloseCreateArticle} 
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
                        Agregar artículo
                        <IconButton
                        color="inherit"
                        onClick={handleCloseCreateArticle}
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
                    <form onSubmit={handleSubmitArticle(onCreateArticle)}>
                        <TextField
                            fullWidth
                            inputProps={{maxLength: 100}}
                            label="Título"
                            {...registerArticle("title", {required: "Ingresar título"})}
                            error={!!articleErrors.title}
                            helperText={articleErrors.title?.message}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Descripción"
                            inputProps={{maxLength: 250}}
                            multiline
                            rows={4}
                            {...registerArticle("description")}
                            error={!!articleErrors.description}
                            helperText={
                                articleErrors.description?.message ||
                                `${description.length}/${250}`
                            }
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Enlace"
                            inputProps={{maxLength: 250}}
                            {...registerArticle("link")}
                            error={!!articleErrors.link}
                            helperText={articleErrors.link?.message}
                            margin="normal"
                        />
                        <DialogActions>
                            <Button type="submit" variant="contained" disabled={!isArticleValid}>Guardar</Button>
                        </DialogActions>
                    </form>
                </DialogContent>
            </Dialog>        

            <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
                <DialogTitle>Borrar artículo</DialogTitle>
                <DialogContent>
                    <Typography variant='subtitle1'>
                        ¿Seguro que desea borrar este artículo?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowDeleteDialog(false)} color="primary">
                        No
                    </Button>
                    <Button onClick={onDeleteArticle} variant="contained" color="primary">
                        Sí
                    </Button>
                </DialogActions>
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
        </Box>
   
        </Grid>
        
        :<CircularProgress/>   
    )
}

export default ArticleList;
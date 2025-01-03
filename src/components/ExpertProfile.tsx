import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, IconButton, Box, Avatar, 
    DialogActions, Button, Divider, Paper, TextField, FormControlLabel, Checkbox} from '@mui/material';
import api from '../api';
import { Expert } from '../interfaces/Expert';
import { Comment } from '../interfaces/Comment';
import NoPhotoIcon from "../../public/NoPhotoIcon"
import LocalPhoneRoundedIcon from '@mui/icons-material/LocalPhoneRounded';
import InsertLinkRoundedIcon from '@mui/icons-material/InsertLinkRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import dayjs from 'dayjs';
import GradeOutlinedIcon from '@mui/icons-material/GradeOutlined';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';

interface ExpertProfileProps {
    expert: Expert;
    comments: Comment[];
    open: boolean;
    scrollToComments: boolean;
    onClose: () => void;
    onUpdateComment: (updatedComment: Comment) => void;
    onDeleteComment: (commentId: string) => void;
    onNewComment: (newComment: Comment) => void; 
}

const ExpertProfile: React.FC<ExpertProfileProps> = ({ expert, comments, open, onClose, onUpdateComment, onDeleteComment, onNewComment, scrollToComments }) => {
    const [professions, setProfessions] = useState("")
    const [localComments, setLocalComments] = useState<Comment[]>([]);
    const token = window.sessionStorage.getItem("token") ?? window.localStorage.getItem("token")
    const currentUserId = window.sessionStorage.getItem("id") ?? window.localStorage.getItem("id")
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
    const [editedContent, setEditedContent] = useState("");
    const [editedIsRecommended, setEditedIsRecommended] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newCommentContent, setNewCommentContent] = useState("");
    const [isRecommended, setIsRecommended] = useState<null|boolean>(false);
    const [expandedComments, setExpandedComments] = useState(true);
    const commentsRef = useRef<HTMLDivElement>(null);
    const commentsURL = "/comments-expert"
    useEffect(()=>{
        if(expert.isNutritionist && expert.isCoach){
            setProfessions("Nutricionista y coach")
        }
        else if (expert.isCoach){
            setProfessions("Coach")
        }
        else if (expert.isNutritionist){
            setProfessions("Nutricionista")
        }
        else{
            setProfessions("Error: no tengo profesión")
        }
    },[expert])

    useEffect(() => {
        setLocalComments(comments);
    }, [comments]);

    useEffect(() => {
        if (open && scrollToComments) {
            setExpandedComments(true)
            // Scroll to the comments section when the ExpertProfile opens
            setTimeout(() => {
                if (commentsRef.current) {
                    commentsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            }, 0); // Timeout to ensure the DOM has updated
        }
    }, [open, scrollToComments]);

    const handleUpdateComment = () => {
        if (selectedComment) {
            const updatedComment = {
                ...selectedComment,
                content: editedContent,
                isRecommended: editedIsRecommended,
            };

            api.patch(`${commentsURL}/${selectedComment.id}`, updatedComment, {
                withCredentials: true,
                headers: { Authorization: "Bearer " + token },
            })
                .then(res => {
                    onUpdateComment(updatedComment)
                    setNewCommentContent("");  // Clear the input fields after creating
                    setEditedContent("")
                    setIsRecommended(false);
                    setEditedIsRecommended(false)
                })
                .catch(error => {
                    console.log(error);
                });
        }
        setShowEditDialog(false);  // Close dialog after updating
    }

    const handleDeleteComment = () => {
        if (selectedComment) {
            api.delete(`${commentsURL}/${selectedComment.id}`, {
                withCredentials: true,
                headers: { Authorization: "Bearer " + token },
            })
                .then(res => {
                    onDeleteComment(selectedComment.id)
                })
                .catch(error => {
                    console.log(error);
                });
        }
        setShowDeleteDialog(false);  // Close dialog after deleting
    }

    const openCreateDialog = () => setShowCreateDialog(true);
    const closeCreateDialog = () => {
        setNewCommentContent("")
        setIsRecommended(false)
        setShowCreateDialog(false)
    }

    const handleCreateComment = () => {
        const newComment = {
            content: newCommentContent,
            isRecommended,
            userId: currentUserId,
            expertId: expert.userId
        };
        
        // Call your API to create a comment
        api.post(commentsURL, newComment, {
            withCredentials: true,
            headers: {
                Authorization: "Bearer " + token
            }
        }).then(res => {
            onNewComment(res.data);  // Call the parent's new comment function
            setNewCommentContent("");  // Clear the input fields after creating
            setEditedContent("")
            setIsRecommended(false);
            setEditedIsRecommended(false)
            closeCreateDialog();
        }).catch(error => {
            console.log(error);
        });
    };
    

    const openEditDialog = (comment: Comment) => {
        setSelectedComment(comment);
        setEditedContent(comment.content || "");
        setEditedIsRecommended(comment.isRecommended || false);
        setShowEditDialog(true);
    };

    // Open the delete confirmation dialog
    const openDeleteDialog = (comment: Comment) => {
        setSelectedComment(comment);
        setShowDeleteDialog(true);
    };

    const toggleExpand = () => {
        setExpandedComments(prev => !prev);
    };

    return (
        <Dialog 
        open={open} 
        onClose={onClose} 
        fullScreen
        PaperProps={{
            sx: {
                maxHeight: '80vh', 
                width: "95vw",
                maxWidth: "500px"
            }
        }}>
            <DialogTitle sx={{bgcolor: "primary.dark"}}>
                <Box sx={{display:"flex", justifyContent: "space-between", alignItems: "flex-start", height: "100%"}}>
                    <Box sx={{display: "flex", flex:1}}>
                        <Avatar
                            alt={expert.user?.name}
                            sx={{ width: "100%", height: "auto", bgcolor :"transparent" }}
                        
                        >
                            {expert.user?.profilePic === "default_profile.png" ? (
                                <NoPhotoIcon height={"100%"} width={"100%"} fill='white' /> // Render the icon when it's the default profile picture
                            ) : (
                                <img
                                    src={expert.user?.profilePic}
                                    alt={expert.user?.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            )}
                        </Avatar> 
                    </Box>
                        <Box sx={{ 
                        display: 'flex', 
                        height: "100%",
                        flex: 5,
                        alignItems: 'center', 
                        justifyContent: "center", 
                        flexDirection: "column",
                        gap: 0.5
                    }}>
                        <Typography variant='h6' width="100%"  color="primary.contrastText" textAlign={"center"}>
                            {expert.user?.name}
                        </Typography>
                        <Typography variant="subtitle1" textAlign={"center"} color="primary.contrastText">
                            {professions}
                        </Typography>
                    </Box>
                    <Box sx={{display: "flex", flex:0.5, justifyContent: "flex-end"}}>
                        <IconButton
                        onClick={onClose}
                        sx={{p:0}}
                        >
                            <CloseIcon sx={{color: "primary.contrastText"}} />
                        </IconButton>
                    </Box>
                </Box>
            
            </DialogTitle>
            <DialogContent dividers sx={{padding:1}}>
                <Typography variant='h6'>
                    Descripción
                </Typography>
                <Typography variant="subtitle2" textAlign={"justify"}>
                    {expert.description}
                </Typography>
                <Typography variant="subtitle2">
                    <strong>Especialidad:</strong> {expert.specialty}
                </Typography>
                <Divider sx={{my:1}}/>
                <Typography variant='h6'>
                    Información
                </Typography>
                <Typography 
                variant='subtitle2' 
                color= "primary.dark" 
                sx={{
                    textAlign:"left", 
                    ml:1, 
                    alignItems: "center", 
                    justifyContent: "start", 
                    display: "flex", 
                    gap:1
                }}>
                    <EmailRoundedIcon sx={{fontSize:20}}/>{expert.user?.email}
                </Typography>
                {expert.phone?
                    <Typography 
                    variant='subtitle2' 
                    color= "primary.dark" 
                    sx={{
                        textAlign:"left", 
                        ml:1, 
                        alignItems: "center", 
                        justifyContent: "start", 
                        display: "flex", 
                        gap:1
                    }}>
                        <LocalPhoneRoundedIcon sx={{fontSize:20}}/>{expert.phone}
                    </Typography>
                :null}
                {expert.address?
                    <Typography 
                    variant='subtitle2' 
                    color= "primary.dark" 
                    sx={{
                        textAlign:"left", 
                        ml:1, 
                        alignItems: "center", 
                        justifyContent: "start", 
                        display: "flex", 
                        gap:1
                    }}>
                        <PlaceRoundedIcon sx={{fontSize:20}}/>{expert.address}
                    </Typography>
                    :null
                }
                <Typography 
                variant='subtitle2' 
                color= "primary.dark" 
                sx={{
                    textAlign:"left", 
                    ml:1, 
                    alignItems: "center", 
                    justifyContent: "start", 
                    display: "flex", 
                    gap:1
                }}>
                    <InsertLinkRoundedIcon sx={{fontSize:20}}/>
                    {expert.webPage?<a 
                            href={expert.webPage?.startsWith('http')? expert.webPage : `https://${expert.webPage}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: 'blue', textDecoration: 'none' }}
                        >
                            Ver página web
                    </a>:<>Sin página web</>}
                </Typography>
                <Divider sx={{my:1}}/>
                <Typography variant="h6" onClick={toggleExpand} sx={{ cursor: 'pointer' }}>
                    Comentarios {expandedComments ? "▲" : "▼"}
                </Typography>
                <Box ref={commentsRef} sx={{ 
                    display: 'flex', 
                    width: "100%",
                    alignItems: 'center', 
                    justifyContent: "center", 
                    flexDirection: "column",
                    gap:2,
                }}>
                {
                expandedComments && currentUserId!=expert.userId &&
                    <Button onClick={openCreateDialog} sx={{mt:1}}>
                        <AddIcon/>
                        <Typography variant='subtitle2' sx={{textDecoration: "underline"}}>
                            Agregar comentario
                        </Typography>
                    </Button>
                    
                }
                {expandedComments && 
                    localComments.map(comment => {
                        return (
                            <Box key={comment.id} sx={{ 
                                display: 'flex', 
                                width: "100%",
                                flexDirection: "column",
                                border: "2px solid",
                                borderColor: "primary.dark",
                                gap: 0.5,
                            }}> 
                                <Paper sx={{
                                    width:"100%", 
                                    bgcolor: comment.isRecommended?"secondary.main":"primary.dark", 
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    borderRadius:0
                                }}>
                                    <Typography 
                                    variant="subtitle1" 
                                    color={comment.isRecommended?"secondary.contrastText":"primary.contrastText"}
                                    sx={{flexGrow: 1, textAlign: "left", width: "80%", pl:1, fontSize:18}}
                                    >
                                        {comment.user?.name} 
                                    </Typography>
                                    {comment.isRecommended && 
                                        <GradeOutlinedIcon sx={{color: "primary.dark", width: "20%", textAlign: "right"}}/>
                                    }
                                </Paper>
                                <Box sx={{display: "flex", flexDirection: "column", width: "100%"}}>
                                    <Typography variant="subtitle1" textAlign={"justify"} sx={{px:1}}>
                                        {comment.content}
                                    </Typography>
                                    <Typography variant="subtitle2" textAlign={"right"} sx={{px:1, fontStyle: "italic"}}>
                                        {dayjs(comment.createdAt).format("DD/MM/YYYY")}
                                    </Typography>
                                </Box>
                                <Paper sx={{
                                    width:"100%", 
                                    bgcolor: comment.isRecommended?"secondary.main":"primary.dark", 
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "start",
                                    borderRadius:0
                                }}>
                                    <Box sx={{ display: "flex", flexDirection: "row-reverse", width:"100%", gap: 2 }}> {/* Wrap icons in a box for layout */}
                                                        
                                        {comment.userId === currentUserId && 
                                            
                                                <IconButton size="small" onClick={() => openDeleteDialog(comment)}>
                                                    <DeleteForeverRoundedIcon sx={{ 
                                                        color: "error.main", 
                                                        fontSize:18
                                                    }} />
                                                </IconButton>
                                           
                                        }   
                                        {comment.userId === currentUserId && 
                                         
                                                <IconButton size="small" onClick={() => openEditDialog(comment)}>
                                                    <EditRoundedIcon sx={{ 
                                                        color: comment.isRecommended ? "secondary.contrastText" : "primary.contrastText",
                                                        fontSize: 18
                                                    }}/>
                                                </IconButton>
                                          
                                        }   
                                    </Box>
                                </Paper>

                            </Box>
                        )
                    })}
                </Box>
            </DialogContent>
            {/* Edit Comment Dialog */}
            <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)}
                PaperProps={{
                    sx: {
                        maxHeight: '80vh', 
                        width: "100vw",
                        maxWidth: "450px",
                        margin: 0
                    }
                }} 
            >
                <DialogTitle>
                    <Box sx={{display:"flex", justifyContent: "space-between"}}>
                        Editar comentario
                        <IconButton
                        color="inherit"
                        onClick={() => setShowEditDialog(false)}
                        sx={{p:0}}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    
                    <TextField
                        fullWidth
                        label="Comentario"
                        inputProps={{maxLength: 500}}
                        multiline
                        rows={4}
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        sx={{mt:2}}
                    />
                    <FormControlLabel
                    control={
                        <Checkbox
                            checked={editedIsRecommended ?? false} // Handle null by defaulting to false
                            onChange={(event) => setEditedIsRecommended(event.target.checked)}
                        />
                    }
                    label="Recomendado"
                    />
                    <Box sx={{display:"flex", justifyContent: "flex-end", pt:2}}>
                        <Button onClick={handleUpdateComment} variant="contained" disabled={editedContent==""}>Guardar</Button>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Delete Comment Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
                <DialogTitle>Borrar comentario</DialogTitle>
                <DialogContent>
                    <Typography>¿Seguro que quieres borrar tu comentario?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowDeleteDialog(false)}>No</Button>
                    <Button onClick={handleDeleteComment} variant="contained">Sí</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={showCreateDialog} onClose={closeCreateDialog}
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
                    Nuevo comentario - {expert.user?.name}
                    <IconButton
                    color="inherit"
                    onClick={closeCreateDialog}
                    sx={{p:0}}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
                    
                </DialogTitle>
                <DialogContent sx={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                    <TextField
                        label="Comentario"
                        inputProps={{maxLength: 500}}
                        fullWidth
                        multiline
                        rows={4}
                        value={newCommentContent}
                        onChange={(e) => setNewCommentContent(e.target.value)}
                        sx={{mt:2}}
                    />
                    <FormControlLabel
                    control={
                        <Checkbox
                            checked={isRecommended ?? false} // Handle null by defaulting to false
                            onChange={(event) => setIsRecommended(event.target.checked)}
                        />
                    }
                    label="Recomendado"
                    />
                    <Box sx={{display:"flex", justifyContent: "flex-end", pt:2, width: "100%"}}>
                        <Button onClick={handleCreateComment} variant="contained" color="primary" disabled={newCommentContent===""}>
                            Guardar
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </Dialog>
        
    );
};

export default ExpertProfile;
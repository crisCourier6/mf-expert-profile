import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, IconButton, Box, Avatar, 
    DialogActions, Button, Divider, Paper, TextField, FormControlLabel, Switch, 
    RadioGroup,
    Radio} from '@mui/material';
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
    const token = window.sessionStorage.getItem("token") || window.localStorage.getItem("token")
    const currentUserId = window.sessionStorage.getItem("id") || window.localStorage.getItem("id")
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
    const [editedContent, setEditedContent] = useState("");
    const [editedIsRecommended, setEditedIsRecommended] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newCommentContent, setNewCommentContent] = useState("");
    const [isRecommended, setIsRecommended] = useState<null|boolean>(null);
    const [expandedComments, setExpandedComments] = useState(false);
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
        //console.log(comments)
    }, [comments]);

    useEffect(() => {
        //console.log(open, scrollToComments, commentsRef)
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
                    setIsRecommended(null);
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
    const closeCreateDialog = () => setShowCreateDialog(false);

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
            //console.log(res);
            onNewComment(res.data);  // Call the parent's new comment function
            setNewCommentContent("");  // Clear the input fields after creating
            setIsRecommended(null);
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
            <DialogTitle sx={{padding:0.5, bgcolor: "primary.dark"}}>
            <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: "center", 
                    flexDirection: "column",
                    gap: 0.5
                }}>
                    <Avatar
                        alt={expert.user?.name}
                        sx={{ width: 64, height: 64, bgcolor :"transparent" }}
                       
                    >
                        {expert.user?.profilePic === "default_profile.png" ? (
                            <NoPhotoIcon height={48} width={48} fill='white' /> // Render the icon when it's the default profile picture
                        ) : (
                            <img
                                src={expert.user?.profilePic}
                                alt={expert.user?.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        )}
                    </Avatar> 
                    

                    <Typography variant='h6' width="100%"  color="primary.contrastText" textAlign={"center"}>
                        {expert.user?.name}
                    </Typography>
                    <Typography variant="subtitle1" textAlign={"center"} color="primary.contrastText">
                        {professions}
                    </Typography>
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
                {expandedComments && 
                <Box ref={commentsRef} sx={{ 
                    display: 'flex', 
                    width: "100%",
                    alignItems: 'center', 
                    justifyContent: "center", 
                    flexDirection: "column",
                    gap:1,
                }}>
                    {localComments.map(comment => {
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
                                    <Box sx={{ display: "flex", flexDirection: "row-reverse", width:"100%", gap: 0.5 }}> {/* Wrap icons in a box for layout */}
                                        {comment.userId === currentUserId && 
                                            <>
                                                <IconButton size="small" onClick={() => openEditDialog(comment)}>
                                                    <EditRoundedIcon sx={{ 
                                                        color: comment.isRecommended ? "secondary.contrastText" : "primary.contrastText",
                                                        fontSize: 18
                                                    }}/>
                                                </IconButton>
                                            </>
                                        }                   
                                        {comment.userId === currentUserId && 
                                            <>
                                                <IconButton size="small" onClick={() => openDeleteDialog(comment)}>
                                                    <DeleteForeverRoundedIcon sx={{ 
                                                        color: comment.isRecommended ? "secondary.contrastText" : "primary.contrastText", 
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
                }
            </DialogContent>
            <DialogActions>
                {currentUserId!=expert.userId && <>
                <Button variant='contained' onClick={openCreateDialog}>
                    Comentar
                </Button>
                </>
                }
                <Button
                    onClick={onClose}
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
                        label="Comentario"
                        multiline
                        rows={4}
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        sx={{mt:2}}
                    />
                    <RadioGroup
                        value={
                            editedIsRecommended
                                ? "recommended"
                                : "notRecommended"
                        }
                        onChange={(event) =>
                            setEditedIsRecommended(event.target.value === "recommended")
                        }
                        row
                    >
                        <FormControlLabel
                            value="recommended"
                            control={<Radio />}
                            label="Recomendado"
                        />
                        <FormControlLabel
                            value="notRecommended"
                            control={<Radio />}
                            label="No recomendado"
                        />
                    </RadioGroup>
                    <Box sx={{display:"flex", justifyContent: "flex-end", pt:2}}>
                        <Button onClick={() => setShowEditDialog(false)}>Cancelar</Button>
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
                    <Button onClick={() => setShowDeleteDialog(false)}>Cancelar</Button>
                    <Button onClick={handleDeleteComment} variant="contained" color="error">Borrar</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={showCreateDialog} onClose={closeCreateDialog}
            PaperProps={{
                sx: {
                    maxHeight: '80vh', 
                    width: "85vw",
                    maxWidth: "450px"
                }
            }} >
                <DialogTitle>Nuevo comentario - {expert.user?.name}</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Comentario"
                        fullWidth
                        multiline
                        rows={4}
                        value={newCommentContent}
                        onChange={(e) => setNewCommentContent(e.target.value)}
                        sx={{mt:2}}
                    />
                    <RadioGroup
                        value={
                            isRecommended === null
                                ? "" // No option is selected initially
                                : isRecommended
                                ? "recommended"
                                : "notRecommended"
                        }
                        onChange={(event) =>
                            setIsRecommended(event.target.value === "recommended")
                        }
                        row
                    >
                        <FormControlLabel
                            value="recommended"
                            control={<Radio />}
                            label="Recomendado"
                        />
                        <FormControlLabel
                            value="notRecommended"
                            control={<Radio />}
                            label="No recomendado"
                        />
                    </RadioGroup>
                    <Box sx={{display:"flex", justifyContent: "flex-end", pt:2}}>
                        <Button onClick={closeCreateDialog}>Cancelar</Button>
                        <Button onClick={handleCreateComment} variant="contained" color="primary" disabled={newCommentContent===" " || isRecommended===null}>
                            Guardar
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </Dialog>
        
    );
};

export default ExpertProfile;
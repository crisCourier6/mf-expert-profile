import React, { useEffect, useState } from 'react';
import api from '../api';
import { Box, Card, CardContent, Grid, IconButton, Typography, Button, InputAdornment, TextField, CardActions } from '@mui/material';
import { Expert } from '../interfaces/Expert';
import { Comment } from '../interfaces/Comment';
import InsertLinkRoundedIcon from '@mui/icons-material/InsertLinkRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import ClearIcon from '@mui/icons-material/Clear'; 
import GradeRoundedIcon from '@mui/icons-material/GradeRounded';
import GradeOutlinedIcon from '@mui/icons-material/GradeOutlined';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import CommentRoundedIcon from '@mui/icons-material/CommentRounded';
import ExpertProfile from './ExpertProfile';

const ExpertList: React.FC<{ isAppBarVisible: boolean, onReady:()=>void }> = ({ isAppBarVisible, onReady }) => {
    const expertsURL = "/expert-profile"
    const commentsURL = "/comments-expert"
    const [experts, setExperts] = useState<Expert[]>([])
    const [comments, setComments] = useState<Comment[]>([])
    const token = window.sessionStorage.getItem("token") || window.localStorage.getItem("token")
    const currentUserId = window.sessionStorage.getItem("id") || window.localStorage.getItem("id")
    const [expertsFiltered, setExpertsFiltered] = useState<Expert[]>([])
    const [searchQuery, setSearchQuery] = useState("");
    const [allDone, setAllDone] = useState(false)
    const [expertStats, setExpertStats] = useState<{ 
        [expertId: string]: { 
            recommendationCount: number; 
            totalComments: number;
            userHasCommented: boolean;
            userHasRecommended: boolean;
        } 
    }>({});
    const [openExpert, setOpenExpert] = useState(false)
    const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null)
    const [selectedComments, setSelectedComments] = useState<Comment[]>([])
    const [scrollToComments, setScrollToComments] = useState(false)
    const commentsQueryParams = "?wu=true&we=true"
    

    useEffect(() => {
        document.title = `Expertos - EyesFood`
        const fetchExperts = api.get(expertsURL, {
            withCredentials: true,
            headers: {
                Authorization: "Bearer " + token
            }
        });
    
        const fetchComments = api.get(`${commentsURL}${commentsQueryParams}`, {
            withCredentials: true,
            headers: {
                Authorization: "Bearer " + token
            }
        });
    
        Promise.all([fetchExperts, fetchComments])
            .then(([expertsResponse, commentsResponse]) => {
                //console.log("Experts:", expertsResponse.data);
                //console.log("Comments:", commentsResponse.data);

                const expertsData = expertsResponse.data;
                const commentsData = commentsResponse.data;
                setExperts(expertsData);
                setComments(commentsData);
                setExpertsFiltered(expertsData);

                // Create a map to count recommendations for each expert
                const stats: { [expertId: string]: any } = {};
                commentsData.forEach((comment: Comment) => {
                    const expertId = comment.expertId;

                    if (!stats[expertId]) {
                        stats[expertId] = {
                            recommendationCount: 0,
                            totalComments: 0,
                            userHasCommented: false,
                            userHasRecommended: false,
                        };
                    }

                    // Increment total comments
                    stats[expertId].totalComments++;

                    // Increment recommendations if the comment is recommended
                    if (comment.isRecommended) {
                        stats[expertId].recommendationCount++;
                    }

                    // Check if the logged-in user has commented/recommended
                    if (comment.userId === currentUserId) {
                        stats[expertId].userHasCommented = true;
                        if (comment.isRecommended) {
                            stats[expertId].userHasRecommended = true;
                        }
                    }
                    setExpertStats(stats);
                });
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            })
            .finally(() => {
                setAllDone(true); // Set the flag after both requests have completed
                onReady()
            });
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setExpertsFiltered(experts);
        } else {
            setExpertsFiltered(
                experts.filter(expert =>
                    expert.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        }
      }, [searchQuery, experts]);

    useEffect(()=>{
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100); // Adjust the delay as needed
    }, [expertsFiltered])

    useEffect(()=>{
        const stats: { [expertId: string]: any } = {};
        comments.forEach((comment: Comment) => {
            const expertId = comment.expertId;

            if (!stats[expertId]) {
                stats[expertId] = {
                    recommendationCount: 0,
                    totalComments: 0,
                    userHasCommented: false,
                    userHasRecommended: false,
                };
            }

            // Increment total comments
            stats[expertId].totalComments++;

            // Increment recommendations if the comment is recommended
            if (comment.isRecommended) {
                stats[expertId].recommendationCount++;
            }

            // Check if the logged-in user has commented/recommended
            if (comment.userId === currentUserId) {
                stats[expertId].userHasCommented = true;
                if (comment.isRecommended) {
                    stats[expertId].userHasRecommended = true;
                }
            }
            
        })
        setExpertStats(stats);
        if (selectedExpert){
            const expertComments = comments.filter(comment => comment.expertId === selectedExpert.userId);
            setSelectedComments(expertComments); // Assuming you have state to hold expert comments
        }
    }, [comments])

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const handleOpenExpert = (expert: Expert) => {
        setSelectedExpert(expert);
        const expertComments = comments.filter(comment => comment.expertId === expert.userId);
        setSelectedComments(expertComments); // Assuming you have state to hold expert comments
        setOpenExpert(true);
    };

    const handleCloseExpert = () => {
        setOpenExpert(false);
        setSelectedExpert(null);
    };

    const updateComment = (updatedComment: Comment) => {
        setComments((prevComments) =>
            prevComments.map((comment) =>
                comment.id === updatedComment.id ? updatedComment : comment
            )
        );
        //console.log("actualice comments")
    };

    // Function to delete a comment
    const deleteComment = (commentId: string) => {
        setComments((prevComments) =>
            prevComments.filter((comment) => comment.id !== commentId)
        );
        //console.log("actualice comments")
    };

    const newComment = (newComment: Comment) => {
        setComments(prevComments => [...prevComments, newComment]);
    };

    return ( allDone?
        <Grid container display="flex" 
        flexDirection="column" 
        justifyContent="center"
        alignItems="center"
        sx={{width: "100vw", maxWidth:"500px", gap:2, flexWrap: "wrap", pb: 7}}
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
                    Expertos
                </Typography>
            </Box>
            <Box sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                width: "90%"
            }}>
                <TextField 
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Buscar por nombre"
                    variant="standard"
                    inputProps={{maxLength: 100}}
                    fullWidth
                    sx={{mt: 0.5, maxWidth: "60%"}}
                    InputProps={{
                        endAdornment: (
                            searchQuery && (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setSearchQuery('')} // Clear the input
                                        edge="end"
                                    >
                                        <ClearIcon />
                                    </IconButton>
                                </InputAdornment>
                            )
                        ),
                    }}
                />
            </Box>
            
            
            { expertsFiltered.map((expert)=>{
                const stats = expertStats[expert.userId] || {
                    recommendationCount: 0,
                    totalComments: 0,
                    userHasCommented: false,
                    userHasRecommended: false,
                };
                return (
                    <Card key={expert.id} sx={{
                        border: "4px solid", 
                        borderColor: "primary.dark", 
                        bgcolor: "primary.dark",
                        width:"90%", 
                        height: "20vh",
                        maxHeight: "120px", 
                        minHeight: "60px",
                        display:"flex",
                        flexDirection: "column"
                    }}>
                    <CardContent onClick={() => {
                                handleOpenExpert(expert)
                                setScrollToComments(false)
                                }} 
                    sx={{
                        width:"100%",
                        height: "75%", 
                        display:"flex", 
                        flexDirection: "row", 
                        justifyContent: "center",
                        alignItems: "center",
                        padding:0,
                        cursor: "pointer"
                    }}>
                        <Box sx={{
                            width:"100%", 
                            height: "100%",
                            display:"flex", 
                            flexDirection: "column",
                            justifyContent: "flex-start",
                            bgcolor: "primary.contrastText"
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
                                {expert.user?.name}
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
                                <EmailRoundedIcon sx={{fontSize:18}}/>{expert.user?.email}
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
                                gap:1,
                                bgcolor: "primary.contrastText"
                            }}>
                            <InsertLinkRoundedIcon sx={{fontSize:18}}/>
                            {expert.webPage?
                                <a 
                                    href={expert.webPage?.startsWith('http')? expert.webPage : `https://${expert.webPage}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    style={{ color: 'blue', textDecoration: 'none' }}
                                >
                                    Ver página web
                                </a>:
                                <>Sin página web</>
                            }
                            </Typography>
                            <Typography variant='subtitle2' color= "primary.dark" sx={{textAlign:"left", ml:1}}>
                               <span style={{fontWeight: "bold"}}>Especialidad: </span>{expert.specialty}
                            </Typography>
                            <Box sx={{
                                width:"100%", 
                                display:"flex", 
                                flexDirection: "column",
                                justifyContent: "center",
                                bgcolor: "secondary.main"
                            }}>     
                            </Box>
                                
                        </Box>
                    </CardContent>
                    <CardActions sx={{padding:0, width:"100%", height: "25%"}}>
                    <Box sx={{
                        width:"100%", 
                        display:"flex", 
                        height: "100%",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        bgcolor: "primary.dark",
                        }}>
                            <Box sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap:0
                            }}>
                                <IconButton disabled={true}>
                                {stats.userHasRecommended ? <GradeRoundedIcon sx={{color: "secondary.main", fontSize:18}} /> : <GradeOutlinedIcon sx={{color: "primary.contrastText", fontSize:18}}/>}
                                </IconButton>
                                <Typography variant="subtitle1" color="primary.contrastText">{stats.recommendationCount}</Typography>
                            </Box>
                            <Box sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap:0
                            }}>
                                <IconButton onClick={() => {
                                    handleOpenExpert(expert)
                                    setScrollToComments(true)
                                }}>
                                    {stats.userHasCommented ? <CommentRoundedIcon sx={{color: "secondary.main", fontSize:18}}/> : <CommentOutlinedIcon sx={{color: "primary.contrastText", fontSize:18}}/>}
                                </IconButton>
                                <Typography variant="body2" color="primary.contrastText">{stats.totalComments}</Typography>
                                
                            </Box>
                            <Button onClick={() => {
                                handleOpenExpert(expert)
                                setScrollToComments(false)
                                }} 
                                variant='text' 
                                sx={{color: "secondary.main", fontSize:12, padding:0}}>
                                Ver más
                            </Button>
                        </Box>
                    </CardActions>
                </Card> 
            )}
        )}
            {selectedExpert && (
                <ExpertProfile expert={selectedExpert} 
                comments={selectedComments} 
                open={openExpert} 
                onClose={handleCloseExpert} 
                onUpdateComment={updateComment}
                onDeleteComment={deleteComment}
                onNewComment={newComment}
                scrollToComments = {scrollToComments}
                 />
            )}
   
        </Grid>
        
        :null  
    )
}

export default ExpertList;
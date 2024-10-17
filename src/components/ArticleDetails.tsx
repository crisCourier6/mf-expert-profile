import React, { useRef} from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, Box, DialogActions, Button, Divider} from '@mui/material';

import { Article } from '../interfaces/Article';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import dayjs from 'dayjs';

interface ArticleDetailsProps {
    article: Article
    open: boolean
    onClose: () => void
}

const ArticleDetails: React.FC<ArticleDetailsProps> = ({ article, onClose, open }) => {
    const currentUserId = window.localStorage.id
    const commentsRef = useRef<HTMLDivElement>(null);

    const handleOpenLink = () => {
        if (article.link){
            const url = article.link.startsWith('http://') || article.link.startsWith('https://')
                ? article.link
                : `https://${article.link}`; 

            window.open(url, '_blank')
        }
        
    };

    return (
        <Dialog 
        open={open} 
        onClose={onClose} 
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
                    <Typography variant='h6' width="100%"  color="primary.contrastText" textAlign={"center"}>
                        {article.title}
                    </Typography>
                    <Typography variant="subtitle1" textAlign={"center"} color="primary.contrastText">
                        Subido por {article.expertProfile?.user?.name}
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent dividers sx={{padding:1}}>
                <Box sx={{display: "flex", flexDirection: "column", width: "100%"}}>
                    <Typography variant="subtitle1" textAlign={"justify"} sx={{px:1}}>
                        {article.description}
                    </Typography>
                    <Typography variant="subtitle2" textAlign={"right"} sx={{px:1, fontStyle: "italic"}}>
                        {dayjs(article.createdAt).format("DD/MM/YYYY")}
                    </Typography>
                </Box>
                <Divider sx={{my:1}}/>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={onClose}
                    variant="contained"
                >
                    Cerrar
                </Button>
                <Button variant='contained' onClick={handleOpenLink} 
                sx={{display: "flex", 
                    gap:1, 
                    justifyContent: "space-between", 
                    alignItems: "center"
                }}>
                    
                    Ver artículo
                    <OpenInNewIcon/>
                </Button>
            </DialogActions>
        </Dialog>
        
    );
};

export default ArticleDetails;
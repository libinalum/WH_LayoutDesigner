import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Chip,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import ReplyIcon from '@mui/icons-material/Reply';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import { Comment } from '../../types';
import { formatDate } from '../../utils/formatters';
import useUserStore from '../../store/userStore';

interface CommentPanelProps {
  projectId: string;
  facilityId?: string;
  layoutId?: string;
  position?: { x: number; y: number; z?: number };
}

const CommentPanel: React.FC<CommentPanelProps> = ({
  projectId,
  facilityId,
  layoutId,
  position,
}: CommentPanelProps) => {
  const { currentUser } = useUserStore();
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  
  useEffect(() => {
    fetchComments();
  }, [projectId, facilityId, layoutId]);
  
  const fetchComments = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would call the API
      // const response = await axios.get(`/api/projects/${projectId}/comments`);
      // setComments(response.data);
      
      // Simulate API call
      setTimeout(() => {
        const mockComments: Comment[] = [
          {
            id: 'comment-1',
            userId: 'user-1',
            userName: 'John Doe',
            content: 'I think we should increase the aisle width in this area to accommodate larger equipment.',
            createdAt: '2025-05-01T14:30:00Z',
            updatedAt: '2025-05-01T14:30:00Z',
            resolved: false,
            position: { x: 120, y: 85 }
          },
          {
            id: 'comment-2',
            userId: 'user-2',
            userName: 'Jane Smith',
            content: 'Good point. The current width is 8 feet, what would you suggest?',
            createdAt: '2025-05-01T15:45:00Z',
            updatedAt: '2025-05-01T15:45:00Z',
            parentId: 'comment-1',
            resolved: false
          },
          {
            id: 'comment-3',
            userId: 'user-1',
            userName: 'John Doe',
            content: 'I would recommend at least 12 feet to allow for forklifts to pass each other safely.',
            createdAt: '2025-05-01T16:20:00Z',
            updatedAt: '2025-05-01T16:20:00Z',
            parentId: 'comment-1',
            resolved: false
          },
          {
            id: 'comment-4',
            userId: 'user-3',
            userName: 'Bob Johnson',
            content: 'The rack height in zone B seems excessive. Can we reduce it to improve stability?',
            createdAt: '2025-05-02T09:15:00Z',
            updatedAt: '2025-05-02T09:15:00Z',
            resolved: true,
            position: { x: 250, y: 150 }
          }
        ];
        
        setComments(mockComments);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setIsLoading(false);
    }
  };
  
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, comment: Comment) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedComment(comment);
  };
  
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };
  
  const handleAddComment = async () => {
    if (newComment.trim() === '' || !currentUser) return;
    
    try {
      // In a real implementation, this would call the API
      // const response = await axios.post(`/api/projects/${projectId}/comments`, {
      //   content: newComment,
      //   parentId: replyTo,
      //   position
      // });
      // const addedComment = response.data;
      
      // Simulate API call
      const addedComment: Comment = {
        id: `comment-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        content: newComment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        parentId: replyTo,
        resolved: false,
        position: replyTo ? undefined : position
      };
      
      setComments([...comments, addedComment]);
      setNewComment('');
      setReplyTo(null);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };
  
  const handleEditComment = async () => {
    if (editText.trim() === '' || !editingComment) return;
    
    try {
      // In a real implementation, this would call the API
      // await axios.put(`/api/comments/${editingComment}`, {
      //   content: editText
      // });
      
      // Update comment locally
      setComments(comments.map((comment: Comment) =>
        comment.id === editingComment 
          ? { ...comment, content: editText, updatedAt: new Date().toISOString() } 
          : comment
      ));
      
      setEditingComment(null);
      setEditText('');
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };
  
  const handleDeleteComment = async () => {
    if (!selectedComment) return;
    
    try {
      // In a real implementation, this would call the API
      // await axios.delete(`/api/comments/${selectedComment.id}`);
      
      // Remove comment and its replies locally
      const commentIdsToRemove = [selectedComment.id];
      
      // Find all replies recursively
      const findReplies = (parentId: string) => {
        comments.forEach((comment: Comment) => {
          if (comment.parentId === parentId) {
            commentIdsToRemove.push(comment.id);
            findReplies(comment.id);
          }
        });
      };
      
      findReplies(selectedComment.id);
      
      setComments(comments.filter((comment: Comment) => !commentIdsToRemove.includes(comment.id)));
      handleCloseMenu();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };
  
  const handleResolveComment = async () => {
    if (!selectedComment) return;
    
    try {
      // In a real implementation, this would call the API
      // await axios.put(`/api/comments/${selectedComment.id}/resolve`);
      
      // Update comment locally
      setComments(comments.map((comment: Comment) =>
        comment.id === selectedComment.id 
          ? { ...comment, resolved: true, updatedAt: new Date().toISOString() } 
          : comment
      ));
      
      handleCloseMenu();
    } catch (error) {
      console.error('Error resolving comment:', error);
    }
  };
  
  const handleStartEdit = () => {
    if (!selectedComment) return;
    
    setEditingComment(selectedComment.id);
    setEditText(selectedComment.content);
    handleCloseMenu();
  };
  
  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditText('');
  };
  
  const handleReply = (commentId: string) => {
    setReplyTo(commentId);
  };
  
  const renderCommentItem = (comment: Comment) => {
    const isEditing = editingComment === comment.id;
    const isCurrentUser = currentUser && comment.userId === currentUser.id;
    
    return (
      <ListItem 
        key={comment.id} 
        alignItems="flex-start"
        sx={{ 
          pl: comment.parentId ? 4 : 2,
          bgcolor: comment.resolved ? 'action.hover' : 'inherit'
        }}
      >
        <ListItemAvatar>
          <Avatar sx={{ bgcolor: isCurrentUser ? 'primary.main' : 'secondary.main' }}>
            <PersonIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle2" component="span">
                  {comment.userName}
                </Typography>
                {comment.resolved && (
                  <Tooltip title="Resolved">
                    <CheckCircleIcon color="success" fontSize="small" sx={{ ml: 1 }} />
                  </Tooltip>
                )}
              </Box>
              <Box>
                {!comment.resolved && (
                  <IconButton 
                    size="small" 
                    onClick={(e: React.MouseEvent<HTMLElement>) => handleOpenMenu(e, comment)}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </Box>
          }
          secondary={
            <>
              {isEditing ? (
                <Box sx={{ mt: 1 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={editText}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditText(e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      size="small" 
                      onClick={handleCancelEdit}
                      sx={{ mr: 1 }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="small" 
                      variant="contained" 
                      onClick={handleEditComment}
                    >
                      Save
                    </Button>
                  </Box>
                </Box>
              ) : (
                <>
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.primary"
                    sx={{ 
                      display: 'inline',
                      textDecoration: comment.resolved ? 'line-through' : 'none'
                    }}
                  >
                    {comment.content}
                  </Typography>
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 1 }}
                  >
                    {formatDate(comment.updatedAt, 'relative')}
                    {comment.position && (
                      <Chip 
                        label={`Position: ${comment.position.x}, ${comment.position.y}`} 
                        size="small" 
                        variant="outlined"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Typography>
                  {!comment.resolved && !comment.parentId && (
                    <Button
                      size="small"
                      startIcon={<ReplyIcon />}
                      onClick={() => handleReply(comment.id)}
                      sx={{ mt: 1 }}
                    >
                      Reply
                    </Button>
                  )}
                </>
              )}
            </>
          }
        />
      </ListItem>
    );
  };
  
  // Group comments by parent
  const topLevelComments = comments.filter((comment: Comment) => !comment.parentId);
  const commentReplies = new Map<string, Comment[]>();
  
  comments.forEach((comment: Comment) => {
    if (comment.parentId) {
      const replies = commentReplies.get(comment.parentId) || [];
      replies.push(comment);
      commentReplies.set(comment.parentId, replies);
    }
  });
  
  // Render a comment thread (comment + replies)
  const renderCommentThread = (comment: Comment) => {
    const replies = commentReplies.get(comment.id) || [];
    
    return (
      <React.Fragment key={comment.id}>
        {renderCommentItem(comment)}
        {replies.map(reply => renderCommentItem(reply))}
      </React.Fragment>
    );
  };
  
  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">
          Comments & Feedback
        </Typography>
      </Box>
      
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : comments.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No comments yet. Add the first comment!
            </Typography>
          </Box>
        ) : (
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {topLevelComments.map((comment: Comment) => renderCommentThread(comment))}
          </List>
        )}
      </Box>
      
      <Divider />
      
      <Box sx={{ p: 2 }}>
        {replyTo && (
          <Box sx={{ mb: 1 }}>
            <Chip 
              label={`Replying to ${comments.find((c: Comment) => c.id === replyTo)?.userName || 'comment'}`}
              onDelete={() => setReplyTo(null)}
              size="small"
              color="primary"
            />
          </Box>
        )}
        <Box sx={{ display: 'flex' }}>
          <TextField
            fullWidth
            placeholder={replyTo ? "Write a reply..." : "Add a comment..."}
            multiline
            rows={2}
            value={newComment}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewComment(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ mr: 1 }}
          />
          <Button
            variant="contained"
            endIcon={<SendIcon />}
            onClick={handleAddComment}
            disabled={newComment.trim() === ''}
          >
            Send
          </Button>
        </Box>
      </Box>
      
      {/* Comment actions menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
      >
        {selectedComment && selectedComment.userId === currentUser?.id && (
          <MenuItem onClick={handleStartEdit}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Edit
          </MenuItem>
        )}
        <MenuItem onClick={handleResolveComment}>
          <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
          Mark as Resolved
        </MenuItem>
        {selectedComment && selectedComment.userId === currentUser?.id && (
          <MenuItem onClick={handleDeleteComment}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        )}
      </Menu>
    </Paper>
  );
};

export default CommentPanel;
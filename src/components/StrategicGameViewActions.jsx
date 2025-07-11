import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';

import { RMU_API_STRATEGIC_URL } from "../constants/environment";

const StrategicGameViewActions = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const strategicGame = location.state?.strategicGame;

    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

    const deleteStrategicGame = async () => {
        const url = `${RMU_API_STRATEGIC_URL}/strategic-games/${strategicGame.id}`;
        const response = await fetch(url, { method: "DELETE" });
        const deleteResponse = await response;
        if (deleteResponse.status == 204) {
            navigate("/strategic");
        } else {
            //TODO display error
            console.log("delete data: " + data);
        }
    };

    const handleEditClick = () => {
        navigate(`/strategic/edit/${strategicGame.id}`, { state: { strategicGame: strategicGame } });
    }

    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
    }

    const handleDialogDeleteClose = () => {
        setDeleteDialogOpen(false);
    }

    const handleDialogDelete = () => {
        deleteStrategicGame();
        setDeleteDialogOpen(false);
    }

    return (
        <div class="strategic-game-view-actions">
            <Stack spacing={2} direction="row" sx={{
                justifyContent: "flex-end",
                alignItems: "flex-start",
            }}>
                <IconButton variant="outlined" onClick={handleEditClick}>
                    <EditIcon />
                </IconButton>
                <IconButton variant="outlined" onClick={handleDeleteClick}>
                    <DeleteIcon />
                </IconButton>
            </Stack>
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDialogDeleteClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Strategic game delete confirmation"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to remove '{strategicGame.name}'? This action cannot be undone
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogDeleteClose}>Cancel</Button>
                    <Button onClick={handleDialogDelete} autoFocus>Delete</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default StrategicGameViewActions;
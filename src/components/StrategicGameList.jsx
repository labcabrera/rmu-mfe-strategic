import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';

import StrategicGameListItem from "./StrategicGameListItem";

import { RMU_API_STRATEGIC_URL } from "../constants/environment";

const StrategicGameList = () => {

    const debugMode = true;

    const navigate = useNavigate();

    const [strategicGames, setStrategicGames] = useState([]);
    const [displayError, setDisplayError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const getStrategicGames = async () => {
        const url = `${RMU_API_STRATEGIC_URL}/strategic-games`;
        try {
            const response = await fetch(url, { method: "GET", });
            const data = await response.json();
            setStrategicGames(data.content);
        } catch (error) {
            setDisplayError(true);
            setErrorMessage(`Error loading strategic games from ${url}. ${error.message}`);
        }
    };

    const createNewGame = async () => {
        navigate("/strategic/creation");
    };

    const handleSnackbarClose = () => {
        setDisplayError(false);
    };

    useEffect(() => {
        getStrategicGames();
    }, []);

    return (
        <div>
            <div class="strategic-game-list-actions">
                <Stack spacing={2} direction="row" sx={{
                    justifyContent: "flex-end",
                    alignItems: "flex-start",
                }}>
                    <IconButton variant="outlined" onClick={createNewGame}>
                        <AddIcon />
                    </IconButton>
                </Stack>
            </div>
            <div class="strategic-game-list">
                <List>
                    {strategicGames.map((item) => (
                        <StrategicGameListItem key={item.id} strategicGame={item} />
                    ))}
                </List>
            </div>
            <Snackbar
                open={displayError}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                onClose={handleSnackbarClose}
                message={errorMessage}
                action={
                    <React.Fragment>
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            sx={{ p: 0.5 }}
                            onClick={handleSnackbarClose}>
                            <CloseIcon />
                        </IconButton>
                    </React.Fragment>
                }
            />
        </div>
    );
}

export default StrategicGameList;
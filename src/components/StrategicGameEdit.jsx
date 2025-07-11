import React, { useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";

import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import { RMU_API_STRATEGIC_URL } from "../constants/environment";

const StrategicGameEdit = () => {

    const debugMode = false;
    const location = useLocation();
    const strategicGame = location.state?.strategicGame;
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: strategicGame.name,
        description: strategicGame.description
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value })
    }

    const handleSubmit = (e) => {
        try {
            e.preventDefault();
            const url = `${RMU_API_STRATEGIC_URL}/strategic-games/${strategicGame.id}`;
            const requestOptions = {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            };
            fetch(url, requestOptions)
                .then(response => response.json())
                .then(data => navigate(`/strategic/view/${data.id}`, { state: { strategicGame: data } }));
        } catch (error) {
            //setDisplayError(true);
            //setErrorMessage(`Error updating stratetic game from ${url}. ${error.message}`);
        }
    }

    const handleCancelClick = (e) => {
        navigate(`/strategic/view/${strategicGame.id}`, { state: { strategicGame: strategicGame } });
    }

    return (
        <div>
            <div class="strategic-game-view">
                <div class="strategic-game-view-actions">
                    <Stack spacing={2} direction="row" sx={{
                        justifyContent: "flex-end",
                        alignItems: "flex-start",
                    }}>
                        <IconButton variant="outlined" onClick={handleCancelClick}>
                            <CancelIcon />
                        </IconButton>
                        <IconButton variant="outlined" onClick={handleSubmit}>
                            <SaveIcon />
                        </IconButton>
                    </Stack>
                </div>
                <div>
                    <Box component="form"
                        sx={{ '& > :not(style)': { m: 1, width: '80ch' } }}>
                        <TextField
                            label="Name"
                            variant="outlined"
                            fullWidth
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            margin="normal"
                            required />
                        <TextField
                            label="Description"
                            variant="outlined"
                            fullWidth
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            margin="normal"
                            multiline
                            maxRows={4}
                            required />
                    </Box>
                </div>
            </div>
            {debugMode ? (
                <div>
                    <pre>
                        {JSON.stringify(formData, null, 2)}
                    </pre>
                    <pre>
                        {JSON.stringify(strategicGame, null, 2)}
                    </pre>
                </div>
            ) : null}
        </div>
    );
}

export default StrategicGameEdit;
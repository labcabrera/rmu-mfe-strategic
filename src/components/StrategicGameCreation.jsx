import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import { RMU_API_CORE_URL, RMU_API_STRATEGIC_URL } from "../constants/environment";

const StrategicGameCreation = () => {

    const debugMode = false;

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        realm: '',
        description: ''
    });

    const [realms, setRealms] = useState([]);
    const [displayError, setDisplayError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const getRealms = async () => {
        const url = `${RMU_API_CORE_URL}/realms`;
        try {
            const response = await fetch(url, { method: "GET", });
            const data = await response.json();
            setRealms(data.content.map(mapRealm));
        } catch (error) {
            setDisplayError(true);
            setErrorMessage(`Error loading realms from ${url}. ${error.message}`);
        }
    };

    useEffect(() => {
        getRealms();
    }, []);

    const handleSubmit = (e) => {
        try {
            e.preventDefault();
            const url = `${RMU_API_STRATEGIC_URL}/strategic-games`;
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            };
            fetch(url, requestOptions)
                .then(response => response.json())
                .then(data => navigate("/strategic/view/" + data.id, { state: { strategicGame: data } }));
        } catch (error) {
            setDisplayError(true);
            setErrorMessage(`Error creating game from ${url}. ${error.message}`);
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value })
    }

    const mapRealm = (realm) => {
        return {
            value: realm.id,
            label: realm.name,
        }
    }

    const handleSnackbarClose = () => {
        setDisplayError(false);
    };

    return (
        <div class="strategic-game-creation">
            <div class="strategic-game-view-actions">
                <Stack spacing={2} direction="row" sx={{
                    justifyContent: "flex-end",
                    alignItems: "flex-start",
                }}>
                    <IconButton variant="outlined" onClick={handleSubmit}>
                        <SaveIcon />
                    </IconButton>
                </Stack>
            </div>
            <Box>
                <TextField
                    label="Name"
                    variant="outlined"
                    fullWidth
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    margin="normal"
                    required />
                <Autocomplete
                    disablePortal
                    options={realms}
                    onChange={(event, newValue) => {
                        setFormData({ ...formData, realm: newValue.value });
                    }}
                    renderInput={(params) => <TextField {...params} label="Realm" />} />
                <TextField
                    label="Description"
                    variant="outlined"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    maxRows={4}
                    margin="normal" />
            </Box>
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
            {debugMode ? (
                <div>
                    <pre>
                        {JSON.stringify(formData, null, 2)}
                    </pre>
                </div>
            ) : null}
        </div>
    );
}

export default StrategicGameCreation;
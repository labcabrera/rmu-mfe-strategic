import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

import StrategicGameViewActions from "./StrategicGameViewActions";

import { RMU_API_CORE_URL } from "../constants/environment";

const StrategicGameView = () => {

    const debugMode = false;
    const location = useLocation();
    const strategicGame = location.state?.strategicGame;

    const [realmName, setRealmName] = useState(strategicGame.realm);

    const getRealmName = async () => {
        const url = `${RMU_API_CORE_URL}/realms/${strategicGame.realm}`;
        try {
            const response = await fetch(url, { method: "GET", });
            const data = await response.json();
            setRealmName(data.name);
        } catch (error) {
            //TODO
            console.log(error);
        }
    };

    useEffect(() => {
        getRealmName();
    }, []);

    return (
        <div class="strategic-game-view">
            <StrategicGameViewActions />
            <Box component="form"
                sx={{ '& > :not(style)': { m: 1, width: '80ch' } }}>

                <TextField
                    label="Name"
                    name="name"
                    value={strategicGame.name}
                    disabled
                    size="small" />
                <TextField
                    label="Realm"
                    name="realm"
                    value={realmName}
                    disabled
                    size="small" />
                <TextField
                    label="Description"
                    name="description"
                    value={strategicGame.description}
                    disabled
                    size="small"
                    multiline
                    maxRows={4} />
                <TextField
                    label="User"
                    name="user"
                    value={strategicGame.user}
                    disabled
                    size="small"
                />
                <TextField
                    label="Created"
                    name="createdAt"
                    value={strategicGame.createdAt}
                    disabled
                    size="small"
                />
                <TextField
                    label="Updated"
                    name="createdAt"
                    value={strategicGame.updatedAt}
                    disabled
                    size="small"
                />
            </Box >
            {debugMode ? (
                <div>
                    <pre>
                        {JSON.stringify(strategicGame, null, 2)}
                    </pre>
                    <pre>
                        {JSON.stringify(location.state, null, 2)}
                    </pre>
                    <pre>
                        {JSON.stringify(realmName, null, 2)}
                    </pre>
                </div>
            ) : null}
        </div >
    );
}

export default StrategicGameView;

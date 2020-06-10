import React from 'react';
import { IconButton, Tooltip } from '@material-ui/core';
import { Refresh } from '@material-ui/icons';

const QuizFinish = (props) => {
    const backButton = (
        <Tooltip title="Перейти к списку тестов">
            <IconButton
                onClick={props.handleBackToList}>
                <Refresh fontSize='large' />
            </IconButton>
        </Tooltip>
    );

    return (
        <>
            <h1>Поздравляю! Тест окончен</h1>
            {backButton}
        </>
    )
}

export default QuizFinish;
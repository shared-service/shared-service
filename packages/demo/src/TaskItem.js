import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';

import { useSharedState } from '@shared-service/react';

const useStyles = makeStyles({
  itemText: {
    paddingRight: '50px',
  },
  text: {
    cursor: 'pointer',
  }
});

function TaskItem({
  id,
  name,
  completed,
  handleCompleteChange,
  deleteTask,
  editTask,
}) {
  const classes = useStyles();
  const [editing, setEditing] = useSharedState(`editing-${id}`, false);
  const [editingName, setEditingName] = useSharedState(`editingName-${id}`, name);
  const onSave = () => {
    if (!editingName) {
      return;
    }
    if (editingName !== name) {
      editTask(editingName);
    }
    setEditing(false);
  }
  return (
    <ListItem>
      <ListItemIcon>
        <Checkbox
          edge="start"
          checked={completed}
          tabIndex={-1}
          disableRipple
          onChange={handleCompleteChange}
        />
      </ListItemIcon>
      <ListItemText className={classes.itemText}>
        {
          editing ? (
            <TextField
              variant="outlined"
              multiline
              fullWidth
              onChange={(event) => {
                setEditingName(event.target.value);
              }}
              value={editingName}
            />
          ) : (
            <Typography onClick={() => setEditing(true)} className={classes.text}>
              {name}
            </Typography>
          )
        }
      </ListItemText>
      <ListItemSecondaryAction>
        {
          editing ? (
            <>
              <IconButton edge="end" aria-label="Cancel" onClick={onSave}>
                <CancelIcon />
              </IconButton>
              <IconButton edge="end" aria-label="Save" onClick={onSave}>
                <SaveIcon />
              </IconButton>
            </>
          ) : (
            <IconButton edge="end" aria-label="Delete" onClick={deleteTask}>
              <DeleteIcon />
            </IconButton>
          )
        }
      </ListItemSecondaryAction>
    </ListItem>
  );
}

export default TaskItem;

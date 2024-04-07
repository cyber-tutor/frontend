import * as React from 'react';
import CircularProgress, {
  CircularProgressProps,
} from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface CircularProgressWithLabelProps extends CircularProgressProps {
  value: number;
  size?: number; 
}

function CircularProgressWithLabel(props: CircularProgressWithLabelProps) {
  const { size = 40, ...otherProps } = props; 

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant="determinate" {...otherProps} size={size} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="caption"
          component="div"
          color="text.secondary"
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

interface CircularWithValueLabelProps {
  value: number;
  size?: number;
}

export default function CircularWithValueLabel({ value, size }: CircularWithValueLabelProps) {
  return <CircularProgressWithLabel value={value} size={size} />;
}

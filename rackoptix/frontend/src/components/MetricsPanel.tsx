import { FC } from 'react';
import {
  Box,
  Typography,
  Divider,
  Grid,
  Paper,
  LinearProgress,
  Tooltip,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import BarChartIcon from '@mui/icons-material/BarChart';
import { Layout } from '../store/layoutStore';

interface MetricsPanelProps {
  layout: Layout | null;
}

const MetricsPanel: FC<MetricsPanelProps> = ({ layout }) => {
  if (!layout) {
    return (
      <Typography variant="body1">
        Select a layout to view metrics
      </Typography>
    );
  }
  
  // Helper function to format percentage
  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };
  
  // Helper function to get color based on value
  const getColorForValue = (value: number, isHigherBetter: boolean = true) => {
    if (isHigherBetter) {
      if (value >= 0.8) return 'success.main';
      if (value >= 0.6) return 'warning.main';
      return 'error.main';
    } else {
      if (value <= 0.3) return 'success.main';
      if (value <= 0.5) return 'warning.main';
      return 'error.main';
    }
  };
  
  // Extract metrics from layout
  const metrics = layout.metrics || {};
  
  // Default metrics if not available
  const storageDensity = metrics.storage_density || 0;
  const spaceUtilization = metrics.space_utilization || 0;
  const palletPositions = metrics.pallet_positions || 0;
  const travelDistance = metrics.travel_distance || 0;
  const accessibilityScore = metrics.accessibility_score || 0;
  const throughputCapacity = metrics.throughput_capacity || 0;
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Layout Metrics
      </Typography>
      
      <Divider sx={{ mb: 2 }} />
      
      <Grid container spacing={3}>
        {/* Key Performance Indicators */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Key Performance Indicators
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h5" color="primary" gutterBottom>
                {palletPositions.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Pallet Positions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h5" color={getColorForValue(storageDensity)} gutterBottom>
                {formatPercentage(storageDensity)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Storage Density
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h5" color={getColorForValue(spaceUtilization)} gutterBottom>
                {formatPercentage(spaceUtilization)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Space Utilization
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Detailed Metrics */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Detailed Metrics
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Metric</TableCell>
                  <TableCell align="right">Value</TableCell>
                  <TableCell align="right">Rating</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      Storage Density
                      <Tooltip title="Percentage of available space used for storage">
                        <IconButton size="small">
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell align="right">{formatPercentage(storageDensity)}</TableCell>
                  <TableCell align="right">
                    <LinearProgress
                      variant="determinate"
                      value={storageDensity * 100}
                      color={storageDensity >= 0.8 ? "success" : storageDensity >= 0.6 ? "warning" : "error"}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </TableCell>
                </TableRow>
                
                <TableRow>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      Space Utilization
                      <Tooltip title="Percentage of facility floor space utilized">
                        <IconButton size="small">
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell align="right">{formatPercentage(spaceUtilization)}</TableCell>
                  <TableCell align="right">
                    <LinearProgress
                      variant="determinate"
                      value={spaceUtilization * 100}
                      color={spaceUtilization >= 0.8 ? "success" : spaceUtilization >= 0.6 ? "warning" : "error"}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </TableCell>
                </TableRow>
                
                <TableRow>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      Accessibility Score
                      <Tooltip title="Measure of how easily products can be accessed">
                        <IconButton size="small">
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell align="right">{formatPercentage(accessibilityScore)}</TableCell>
                  <TableCell align="right">
                    <LinearProgress
                      variant="determinate"
                      value={accessibilityScore * 100}
                      color={accessibilityScore >= 0.8 ? "success" : accessibilityScore >= 0.6 ? "warning" : "error"}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </TableCell>
                </TableRow>
                
                <TableRow>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      Average Travel Distance
                      <Tooltip title="Average distance traveled to access products">
                        <IconButton size="small">
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell align="right">{travelDistance.toFixed(1)} ft</TableCell>
                  <TableCell align="right">
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, (1 - travelDistance / 100) * 100)}
                      color={travelDistance <= 30 ? "success" : travelDistance <= 60 ? "warning" : "error"}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </TableCell>
                </TableRow>
                
                <TableRow>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      Throughput Capacity
                      <Tooltip title="Estimated pallets per hour that can be processed">
                        <IconButton size="small">
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell align="right">{throughputCapacity.toFixed(0)} pallets/hr</TableCell>
                  <TableCell align="right">
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, (throughputCapacity / 200) * 100)}
                      color={throughputCapacity >= 120 ? "success" : throughputCapacity >= 80 ? "warning" : "error"}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        
        {/* Rack Statistics */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Rack Statistics
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Rack Type</TableCell>
                  <TableCell align="right">Count</TableCell>
                  <TableCell align="right">Pallet Positions</TableCell>
                  <TableCell align="right">% of Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Group racks by type and count */}
                {Object.entries(
                  layout.racks.reduce((acc: Record<string, { count: number, positions: number }>, rack) => {
                    const type = rack.rack_type_id;
                    if (!acc[type]) {
                      acc[type] = { count: 0, positions: 0 };
                    }
                    acc[type].count += 1;
                    // Estimate pallet positions based on bays and levels
                    const levels = rack.configuration?.beam_levels || 3;
                    acc[type].positions += rack.bays * levels;
                    return acc;
                  }, {})
                ).map(([type, { count, positions }]) => (
                  <TableRow key={type}>
                    <TableCell>{type.charAt(0).toUpperCase() + type.slice(1)}</TableCell>
                    <TableCell align="right">{count}</TableCell>
                    <TableCell align="right">{positions}</TableCell>
                    <TableCell align="right">
                      {palletPositions > 0 ? `${((positions / palletPositions) * 100).toFixed(1)}%` : '0%'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MetricsPanel;
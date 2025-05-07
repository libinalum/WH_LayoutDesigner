import { FC, useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Slider,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import UndoIcon from '@mui/icons-material/Undo';
import GridOnIcon from '@mui/icons-material/GridOn';
import StraightenIcon from '@mui/icons-material/Straighten';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import LayersIcon from '@mui/icons-material/Layers';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import PanToolIcon from '@mui/icons-material/PanTool';
import { Stage, Layer, Rect, Line, Circle, Group, Text, Arrow } from 'react-konva';
import Konva from 'konva';
import { useNavigate } from 'react-router-dom';
import useFacilityStore from '../store/facilityStore';
import { Boundary, Obstruction } from '../store/facilityStore';
import axios from 'axios';

// Canvas dimensions
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// Grid settings
const GRID_SIZE = 20;
const GRID_COLOR = '#e0e0e0';

// Colors
const COLORS = {
  boundary: '#2b5797',
  column: '#f28f1c',
  wall: '#f28f1c',
  dock: '#4caf50',
  zone: '#9c27b0',
  selected: '#ff0000',
  measurement: '#00bcd4'
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      style={{ height: '100%' }}
    >
      {value === index && (
        <Box sx={{ p: 1, height: '100%', overflow: 'auto' }}>
          {children}
        </Box>
      )}
    </div>
  );
};

interface Zone {
  id: string;
  name: string;
  purpose: string;
  points: number[];
}

interface Measurement {
  id: string;
  type: 'distance' | 'area';
  points: number[];
  value: number;
  unit: string;
}

const FacilityEditor: FC = () => {
  // Use the facility store
  const {
    currentFacility,
    setCurrentFacility,
    saveFacility
  } = useFacilityStore();
  
  // Local state
  const [facilityName, setFacilityName] = useState<string>('New Facility');
  const [clearHeight, setClearHeight] = useState<number>(32);
  const [drawingMode, setDrawingMode] = useState<string>('select');
  const [points, setPoints] = useState<number[]>([]);
  const [obstructions, setObstructions] = useState<any[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [visibleLayers, setVisibleLayers] = useState({
    boundary: true,
    obstructions: true,
    zones: true,
    measurements: true
  });
  const [newZoneName, setNewZoneName] = useState('');
  const [newZonePurpose, setNewZonePurpose] = useState('storage');
  const [columnSize, setColumnSize] = useState(GRID_SIZE);
  const [wallWidth, setWallWidth] = useState(8);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurementType, setMeasurementType] = useState<'distance' | 'area'>('distance');
  
  const stageRef = useRef<Konva.Stage | null>(null);
  const navigate = useNavigate();
  
  // Initialize from store or create new facility
  useEffect(() => {
    if (currentFacility) {
      setFacilityName(currentFacility.name);
      setClearHeight(currentFacility.clear_height);
      
      // Convert GeoJSON to points if boundary exists
      if (currentFacility.boundary &&
          currentFacility.boundary.coordinates &&
          currentFacility.boundary.coordinates.length > 0) {
        const coords = currentFacility.boundary.coordinates[0];
        const flatCoords = coords.reduce((acc, coord) => [...acc, coord[0], coord[1]], [] as number[]);
        setPoints(flatCoords);
      }
      
      // Convert obstructions
      if (currentFacility.obstructions) {
        const convertedObstructions = currentFacility.obstructions.map(obs => {
          if (obs.type === 'column') {
            const coords = obs.shape.coordinates[0][0];
            return {
              id: obs.id,
              type: 'column',
              x: coords[0],
              y: coords[1],
              width: columnSize,
              height: columnSize,
              height3d: obs.height
            };
          } else if (obs.type === 'wall') {
            const coords = obs.shape.coordinates[0];
            const points = coords.reduce((acc, coord) => [...acc, coord[0], coord[1]], [] as number[]);
            return {
              id: obs.id,
              type: 'wall',
              points,
              height3d: obs.height
            };
          } else if (obs.type === 'dock') {
            const coords = obs.shape.coordinates[0][0];
            return {
              id: obs.id,
              type: 'dock',
              x: coords[0],
              y: coords[1],
              width: columnSize * 2,
              height: columnSize,
              height3d: obs.height
            };
          }
          return obs;
        });
        setObstructions(convertedObstructions);
      }
      
      // Convert zones if they exist
      if (currentFacility.metadata?.zones) {
        const convertedZones = currentFacility.metadata.zones.map((zone: any) => {
          const coords = zone.boundary.coordinates[0];
          const points = coords.reduce((acc: number[], coord: number[]) =>
            [...acc, coord[0], coord[1]], [] as number[]);
          
          return {
            id: zone.id,
            name: zone.name,
            purpose: zone.purpose,
            points
          };
        });
        setZones(convertedZones);
      }
    }
  }, [currentFacility, columnSize]);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle drawing mode change
  const handleDrawingModeChange = (event: SelectChangeEvent) => {
    setDrawingMode(event.target.value);
    setPoints([]);
    setSelectedItem(null);
    setIsMeasuring(false);
  };
  
  // Get snapped coordinates
  const getSnappedCoordinates = (x: number, y: number): [number, number] => {
    if (snapToGrid) {
      return [
        Math.round(x / GRID_SIZE) * GRID_SIZE,
        Math.round(y / GRID_SIZE) * GRID_SIZE
      ];
    }
    return [x, y];
  };
  
  // Handle stage click for drawing
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!stageRef.current || isDragging) return;
    
    const stage = stageRef.current;
    const pointerPos = stage.getPointerPosition();
    
    if (!pointerPos) return;
    
    // Convert to world coordinates
    const worldPos = {
      x: (pointerPos.x - position.x) / scale,
      y: (pointerPos.y - position.y) / scale
    };
    
    // Snap to grid if enabled
    const [x, y] = getSnappedCoordinates(worldPos.x, worldPos.y);
    
    if (drawingMode === 'select') {
      // Select the closest item
      let closestItem = null;
      let minDistance = Infinity;
      
      // Check boundary points
      for (let i = 0; i < points.length; i += 2) {
        const distance = Math.sqrt(Math.pow(points[i] - x, 2) + Math.pow(points[i + 1] - y, 2));
        if (distance < minDistance && distance < 10 / scale) {
          minDistance = distance;
          closestItem = 'boundary';
        }
      }
      
      // Check obstructions
      obstructions.forEach(obs => {
        if (obs.type === 'column' || obs.type === 'dock') {
          const centerX = obs.x + obs.width / 2;
          const centerY = obs.y + obs.height / 2;
          const distance = Math.sqrt(Math.pow(centerX - x, 2) + Math.pow(centerY - y, 2));
          if (distance < minDistance && distance < 20 / scale) {
            minDistance = distance;
            closestItem = obs.id;
          }
        } else if (obs.type === 'wall') {
          // Check each segment of the wall
          for (let i = 0; i < obs.points.length - 2; i += 2) {
            const x1 = obs.points[i];
            const y1 = obs.points[i + 1];
            const x2 = obs.points[i + 2];
            const y2 = obs.points[i + 3];
            
            // Distance from point to line segment
            const A = x - x1;
            const B = y - y1;
            const C = x2 - x1;
            const D = y2 - y1;
            
            const dot = A * C + B * D;
            const len_sq = C * C + D * D;
            let param = -1;
            if (len_sq !== 0) param = dot / len_sq;
            
            let xx, yy;
            
            if (param < 0) {
              xx = x1;
              yy = y1;
            } else if (param > 1) {
              xx = x2;
              yy = y2;
            } else {
              xx = x1 + param * C;
              yy = y1 + param * D;
            }
            
            const distance = Math.sqrt(Math.pow(x - xx, 2) + Math.pow(y - yy, 2));
            if (distance < minDistance && distance < 10 / scale) {
              minDistance = distance;
              closestItem = obs.id;
            }
          }
        }
      });
      
      // Check zones
      zones.forEach(zone => {
        // Check if point is inside polygon
        let inside = false;
        for (let i = 0, j = zone.points.length - 2; i < zone.points.length; j = i, i += 2) {
          const xi = zone.points[i], yi = zone.points[i + 1];
          const xj = zone.points[j], yj = zone.points[j + 1];
          
          const intersect = ((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
          if (intersect) inside = !inside;
        }
        
        if (inside) {
          closestItem = zone.id;
        }
      });
      
      // Check measurements
      measurements.forEach(measurement => {
        if (measurement.type === 'distance') {
          // Check line
          for (let i = 0; i < measurement.points.length - 2; i += 2) {
            const x1 = measurement.points[i];
            const y1 = measurement.points[i + 1];
            const x2 = measurement.points[i + 2];
            const y2 = measurement.points[i + 3];
            
            // Distance from point to line segment (same as wall calculation)
            const A = x - x1;
            const B = y - y1;
            const C = x2 - x1;
            const D = y2 - y1;
            
            const dot = A * C + B * D;
            const len_sq = C * C + D * D;
            let param = -1;
            if (len_sq !== 0) param = dot / len_sq;
            
            let xx, yy;
            
            if (param < 0) {
              xx = x1;
              yy = y1;
            } else if (param > 1) {
              xx = x2;
              yy = y2;
            } else {
              xx = x1 + param * C;
              yy = y1 + param * D;
            }
            
            const distance = Math.sqrt(Math.pow(x - xx, 2) + Math.pow(y - yy, 2));
            if (distance < minDistance && distance < 10 / scale) {
              minDistance = distance;
              closestItem = measurement.id;
            }
          }
        } else if (measurement.type === 'area') {
          // Check if point is inside polygon (same as zone calculation)
          let inside = false;
          for (let i = 0, j = measurement.points.length - 2; i < measurement.points.length; j = i, i += 2) {
            const xi = measurement.points[i], yi = measurement.points[i + 1];
            const xj = measurement.points[j], yj = measurement.points[j + 1];
            
            const intersect = ((yi > y) !== (yj > y)) &&
              (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
          }
          
          if (inside) {
            closestItem = measurement.id;
          }
        }
      });
      
      setSelectedItem(closestItem);
      
    } else if (drawingMode === 'boundary') {
      // Add point to boundary
      setPoints([...points, x, y]);
    } else if (drawingMode === 'column') {
      // Add column obstruction
      const newObstruction = {
        id: `obstruction-${Date.now()}`,
        type: 'column',
        x: x - columnSize / 2,
        y: y - columnSize / 2,
        width: columnSize,
        height: columnSize,
        height3d: clearHeight
      };
      setObstructions([...obstructions, newObstruction]);
    } else if (drawingMode === 'wall') {
      // For wall, we need two points
      if (points.length === 0 || points.length === 2) {
        setPoints([...points, x, y]);
      } else {
        const newObstruction = {
          id: `obstruction-${Date.now()}`,
          type: 'wall',
          points: [...points, x, y],
          height3d: clearHeight
        };
        setObstructions([...obstructions, newObstruction]);
        setPoints([]);
      }
    } else if (drawingMode === 'dock') {
      // Add dock obstruction
      const newObstruction = {
        id: `obstruction-${Date.now()}`,
        type: 'dock',
        x: x - columnSize,
        y: y - columnSize / 2,
        width: columnSize * 2,
        height: columnSize,
        height3d: 4 // Standard dock height
      };
      setObstructions([...obstructions, newObstruction]);
    } else if (drawingMode === 'zone') {
      // Add point to zone
      setPoints([...points, x, y]);
    } else if (drawingMode === 'measure' && isMeasuring) {
      // Add measurement point
      if (measurementType === 'distance') {
        if (points.length < 4) {
          setPoints([...points, x, y]);
          
          // If we have two points, create the measurement
          if (points.length === 2) {
            const x1 = points[0];
            const y1 = points[1];
            const distance = Math.sqrt(Math.pow(x - x1, 2) + Math.pow(y - y1, 2));
            const newMeasurement: Measurement = {
              id: `measurement-${Date.now()}`,
              type: 'distance',
              points: [...points, x, y],
              value: Math.round(distance * 10) / 10,
              unit: 'ft'
            };
            setMeasurements([...measurements, newMeasurement]);
            setPoints([]);
            setIsMeasuring(false);
          }
        }
      } else if (measurementType === 'area') {
        setPoints([...points, x, y]);
        
        // If we have at least 6 points (3 points for a triangle), allow closing the polygon
        if (points.length >= 4 &&
            Math.abs(x - points[0]) < 10 / scale &&
            Math.abs(y - points[1]) < 10 / scale) {
          // Close the polygon
          const newPoints = [...points];
          
          // Calculate area using Shoelace formula
          let area = 0;
          for (let i = 0; i < newPoints.length; i += 2) {
            const j = (i + 2) % newPoints.length;
            area += newPoints[i] * newPoints[j + 1];
            area -= newPoints[i + 1] * newPoints[j];
          }
          area = Math.abs(area) / 2;
          
          const newMeasurement: Measurement = {
            id: `measurement-${Date.now()}`,
            type: 'area',
            points: newPoints,
            value: Math.round(area * 10) / 10,
            unit: 'sq ft'
          };
          setMeasurements([...measurements, newMeasurement]);
          setPoints([]);
          setIsMeasuring(false);
        }
      }
    }
  };
  
  // Handle wheel for zoom
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    if (!stage) return;
    
    const oldScale = scale;
    const pointerPos = stage.getPointerPosition();
    
    if (!pointerPos) return;
    
    const mousePointTo = {
      x: (pointerPos.x - position.x) / oldScale,
      y: (pointerPos.y - position.y) / oldScale,
    };
    
    // Handle zoom
    const newScale = e.evt.deltaY < 0 ? oldScale * 1.1 : oldScale / 1.1;
    
    // Limit scale
    const limitedScale = Math.max(0.1, Math.min(5, newScale));
    
    const newPos = {
      x: pointerPos.x - mousePointTo.x * limitedScale,
      y: pointerPos.y - mousePointTo.y * limitedScale,
    };
    
    setScale(limitedScale);
    setPosition(newPos);
  };
  
  // Handle drag start
  const handleDragStart = () => {
    setIsDragging(true);
  };
  
  // Handle drag end
  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    setIsDragging(false);
    setPosition({
      x: e.target.x(),
      y: e.target.y(),
    });
  };
  
  // Clear the last point
  const handleUndo = () => {
    if (points.length >= 2) {
      setPoints(points.slice(0, points.length - 2));
    }
  };
  
  // Clear all points
  const handleClear = () => {
    setPoints([]);
  };
  
  // Delete selected item
  const handleDelete = () => {
    if (!selectedItem) return;
    
    if (selectedItem === 'boundary') {
      setPoints([]);
    } else {
      // Check if it's an obstruction
      const obstIndex = obstructions.findIndex(o => o.id === selectedItem);
      if (obstIndex >= 0) {
        const newObstructions = [...obstructions];
        newObstructions.splice(obstIndex, 1);
        setObstructions(newObstructions);
      }
      
      // Check if it's a zone
      const zoneIndex = zones.findIndex(z => z.id === selectedItem);
      if (zoneIndex >= 0) {
        const newZones = [...zones];
        newZones.splice(zoneIndex, 1);
        setZones(newZones);
      }
      
      // Check if it's a measurement
      const measureIndex = measurements.findIndex(m => m.id === selectedItem);
      if (measureIndex >= 0) {
        const newMeasurements = [...measurements];
        newMeasurements.splice(measureIndex, 1);
        setMeasurements(newMeasurements);
      }
    }
    
    setSelectedItem(null);
  };
  
  // Start measuring
  const handleStartMeasuring = (type: 'distance' | 'area') => {
    setMeasurementType(type);
    setIsMeasuring(true);
    setPoints([]);
    setDrawingMode('measure');
  };
  
  // Add zone
  const handleAddZone = () => {
    if (points.length < 6) {
      alert('Please draw a zone with at least 3 points');
      return;
    }
    
    const newZone: Zone = {
      id: `zone-${Date.now()}`,
      name: newZoneName || `Zone ${zones.length + 1}`,
      purpose: newZonePurpose,
      points: [...points]
    };
    
    setZones([...zones, newZone]);
    setPoints([]);
    setNewZoneName('');
  };
  
  // Toggle layer visibility
  const handleToggleLayer = (layer: keyof typeof visibleLayers) => {
    setVisibleLayers({
      ...visibleLayers,
      [layer]: !visibleLayers[layer]
    });
  };
  
  // Save facility
  const handleSave = async () => {
    if (points.length < 6) {
      alert('Please define a facility boundary with at least 3 points');
      return;
    }
    
    // Convert points to GeoJSON format
    const coordinates = [];
    for (let i = 0; i < points.length; i += 2) {
      coordinates.push([points[i], points[i + 1]]);
    }
    
    // Close the polygon if needed
    if (points.length >= 6 &&
        (points[0] !== points[points.length - 2] ||
         points[1] !== points[points.length - 1])) {
      coordinates.push([points[0], points[1]]);
    }
    
    const boundary: Boundary = {
      type: 'Polygon',
      coordinates: [coordinates]
    };
    
    // Convert obstructions to GeoJSON
    const convertedObstructions: Obstruction[] = obstructions.map(obs => {
      if (obs.type === 'column' || obs.type === 'dock') {
        // Convert rectangle to polygon
        const x = obs.x;
        const y = obs.y;
        const width = obs.width;
        const height = obs.height;
        
        return {
          id: obs.id,
          type: obs.type,
          shape: {
            type: 'Polygon',
            coordinates: [[
              [x, y],
              [x + width, y],
              [x + width, y + height],
              [x, y + height],
              [x, y]
            ]]
          },
          height: obs.height3d,
          properties: {}
        };
      } else if (obs.type === 'wall') {
        // Convert line to polygon (with width)
        const points = obs.points;
        const coords = [];
        
        for (let i = 0; i < points.length; i += 2) {
          coords.push([points[i], points[i + 1]]);
        }
        
        return {
          id: obs.id,
          type: 'wall',
          shape: {
            type: 'LineString',
            coordinates: coords
          },
          height: obs.height3d,
          properties: {
            width: wallWidth
          }
        };
      }
      
      return obs as unknown as Obstruction;
    });
    
    // Create or update facility
    const facilityData = {
      name: facilityName,
      description: '',
      clear_height: clearHeight,
      boundary,
      obstructions: convertedObstructions,
      metadata: {
        zones: zones.map(zone => ({
          id: zone.id,
          name: zone.name,
          purpose: zone.purpose,
          boundary: {
            type: 'Polygon',
            coordinates: [
              Array.from({ length: zone.points.length / 2 }).map((_, i) =>
                [zone.points[i * 2], zone.points[i * 2 + 1]]
              )
            ]
          }
        }))
      }
    };
    
    setCurrentFacility(facilityData);
    
    try {
      const savedFacility = await saveFacility();
      if (savedFacility) {
        alert('Facility saved successfully!');
      }
    } catch (error) {
      console.error('Error saving facility:', error);
      alert('Error saving facility');
    }
  };
  
  // View in 3D
  const handleView3D = () => {
    // Save current facility first
    handleSave();
    // Navigate to 3D viewer
    navigate('/layout');
  };
  
  // Draw grid lines
  const renderGrid = () => {
    if (!showGrid) return null;
    
    const gridLines = [];
    
    // Calculate visible grid area based on current pan and zoom
    const startX = Math.floor(-position.x / scale / GRID_SIZE) * GRID_SIZE;
    const startY = Math.floor(-position.y / scale / GRID_SIZE) * GRID_SIZE;
    const endX = Math.ceil((CANVAS_WIDTH - position.x) / scale / GRID_SIZE) * GRID_SIZE;
    const endY = Math.ceil((CANVAS_HEIGHT - position.y) / scale / GRID_SIZE) * GRID_SIZE;
    
    // Vertical lines
    for (let i = startX; i <= endX; i += GRID_SIZE) {
      gridLines.push(
        <Line
          key={`v-${i}`}
          points={[i, startY, i, endY]}
          stroke={GRID_COLOR}
          strokeWidth={1 / scale}
        />
      );
    }
    
    // Horizontal lines
    for (let i = startY; i <= endY; i += GRID_SIZE) {
      gridLines.push(
        <Line
          key={`h-${i}`}
          points={[startX, i, endX, i]}
          stroke={GRID_COLOR}
          strokeWidth={1 / scale}
        />
      );
    }
    
    return gridLines;
  };
  
  // Render selected item properties
  const renderSelectedProperties = () => {
    if (!selectedItem) {
      return (
        <Typography variant="body2" color="text.secondary">
          No item selected. Click on an item to select it.
        </Typography>
      );
    }
    
    if (selectedItem === 'boundary') {
      return (
        <Box>
          <Typography variant="subtitle2">Facility Boundary</Typography>
          <Typography variant="body2">
            {points.length / 2} points
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
              size="small"
            >
              Delete Boundary
            </Button>
          </Box>
        </Box>
      );
    }
    
    // Check if it's an obstruction
    const obstruction = obstructions.find(o => o.id === selectedItem);
    if (obstruction) {
      return (
        <Box>
          <Typography variant="subtitle2">
            {obstruction.type.charAt(0).toUpperCase() + obstruction.type.slice(1)}
          </Typography>
          
          <TextField
            fullWidth
            label="Height (ft)"
            type="number"
            value={obstruction.height3d}
            onChange={(e) => {
              const newObstructions = [...obstructions];
              const index = newObstructions.findIndex(o => o.id === selectedItem);
              if (index >= 0) {
                newObstructions[index] = {
                  ...newObstructions[index],
                  height3d: Number(e.target.value)
                };
                setObstructions(newObstructions);
              }
            }}
            margin="normal"
            size="small"
            InputProps={{ inputProps: { min: 0 } }}
          />
          
          {(obstruction.type === 'column' || obstruction.type === 'dock') && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" gutterBottom>
                Position: ({obstruction.x}, {obstruction.y})
              </Typography>
              <Typography variant="body2" gutterBottom>
                Size: {obstruction.width} x {obstruction.height}
              </Typography>
            </Box>
          )}
          
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
              size="small"
            >
              Delete {obstruction.type}
            </Button>
          </Box>
        </Box>
      );
    }
    
    // Check if it's a zone
    const zone = zones.find(z => z.id === selectedItem);
    if (zone) {
      return (
        <Box>
          <Typography variant="subtitle2">Zone</Typography>
          
          <TextField
            fullWidth
            label="Name"
            value={zone.name}
            onChange={(e) => {
              const newZones = [...zones];
              const index = newZones.findIndex(z => z.id === selectedItem);
              if (index >= 0) {
                newZones[index] = {
                  ...newZones[index],
                  name: e.target.value
                };
                setZones(newZones);
              }
            }}
            margin="normal"
            size="small"
          />
          
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Purpose</InputLabel>
            <Select
              value={zone.purpose}
              label="Purpose"
              onChange={(e) => {
                const newZones = [...zones];
                const index = newZones.findIndex(z => z.id === selectedItem);
                if (index >= 0) {
                  newZones[index] = {
                    ...newZones[index],
                    purpose: e.target.value
                  };
                  setZones(newZones);
                }
              }}
            >
              <MenuItem value="storage">Storage</MenuItem>
              <MenuItem value="receiving">Receiving</MenuItem>
              <MenuItem value="shipping">Shipping</MenuItem>
              <MenuItem value="staging">Staging</MenuItem>
              <MenuItem value="office">Office</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
              size="small"
            >
              Delete Zone
            </Button>
          </Box>
        </Box>
      );
    }
    
    // Check if it's a measurement
    const measurement = measurements.find(m => m.id === selectedItem);
    if (measurement) {
      return (
        <Box>
          <Typography variant="subtitle2">
            {measurement.type === 'distance' ? 'Distance Measurement' : 'Area Measurement'}
          </Typography>
          
          <Typography variant="body1" sx={{ mt: 1 }}>
            {measurement.value} {measurement.unit}
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
              size="small"
            >
              Delete Measurement
            </Button>
          </Box>
        </Box>
      );
    }
    
    return null;
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Facility Editor
      </Typography>
      
      <Grid container spacing={3}>
        {/* Left side - Canvas */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              height: CANVAS_HEIGHT + 80,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Toolbar */}
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <FormControl size="small" sx={{ width: 200 }}>
                <InputLabel>Drawing Mode</InputLabel>
                <Select
                  value={drawingMode}
                  label="Drawing Mode"
                  onChange={handleDrawingModeChange}
                >
                  <MenuItem value="select">Select</MenuItem>
                  <MenuItem value="boundary">Facility Boundary</MenuItem>
                  <MenuItem value="column">Column</MenuItem>
                  <MenuItem value="wall">Wall</MenuItem>
                  <MenuItem value="dock">Dock Door</MenuItem>
                  <MenuItem value="zone">Zone</MenuItem>
                </Select>
              </FormControl>
              
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Toggle Grid">
                  <IconButton
                    onClick={() => setShowGrid(!showGrid)}
                    color={showGrid ? 'primary' : 'default'}
                  >
                    <GridOnIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Snap to Grid">
                  <IconButton
                    onClick={() => setSnapToGrid(!snapToGrid)}
                    color={snapToGrid ? 'primary' : 'default'}
                  >
                    <PanToolIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Measure Distance">
                  <IconButton
                    onClick={() => handleStartMeasuring('distance')}
                    color={isMeasuring && measurementType === 'distance' ? 'primary' : 'default'}
                  >
                    <StraightenIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Measure Area">
                  <IconButton
                    onClick={() => handleStartMeasuring('area')}
                    color={isMeasuring && measurementType === 'area' ? 'primary' : 'default'}
                  >
                    <SquareFootIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Zoom In">
                  <IconButton
                    onClick={() => setScale(scale * 1.2)}
                  >
                    <ZoomInIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Zoom Out">
                  <IconButton
                    onClick={() => setScale(Math.max(0.1, scale / 1.2))}
                  >
                    <ZoomOutIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="View in 3D">
                  <IconButton
                    onClick={handleView3D}
                    color="secondary"
                  >
                    <ViewInArIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <Box>
                <Tooltip title="Undo">
                  <IconButton onClick={handleUndo}>
                    <UndoIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Clear">
                  <IconButton onClick={handleClear}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
                {selectedItem && (
                  <Tooltip title="Delete Selected">
                    <IconButton onClick={handleDelete} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
            
            {/* Layer controls */}
            <Box sx={{ mb: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                icon={<LayersIcon />}
                label="Boundary"
                color={visibleLayers.boundary ? 'primary' : 'default'}
                onClick={() => handleToggleLayer('boundary')}
                size="small"
              />
              <Chip
                icon={<LayersIcon />}
                label="Obstructions"
                color={visibleLayers.obstructions ? 'primary' : 'default'}
                onClick={() => handleToggleLayer('obstructions')}
                size="small"
              />
              <Chip
                icon={<LayersIcon />}
                label="Zones"
                color={visibleLayers.zones ? 'primary' : 'default'}
                onClick={() => handleToggleLayer('zones')}
                size="small"
              />
              <Chip
                icon={<LayersIcon />}
                label="Measurements"
                color={visibleLayers.measurements ? 'primary' : 'default'}
                onClick={() => handleToggleLayer('measurements')}
                size="small"
              />
            </Box>
            
            <Box
              sx={{
                border: '1px solid #ccc',
                borderRadius: 1,
                overflow: 'hidden',
                flex: 1,
                position: 'relative'
              }}
            >
              <Stage
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                onClick={handleStageClick}
                onWheel={handleWheel}
                ref={stageRef}
              >
                <Layer>
                  {/* Draggable group for pan/zoom */}
                  <Group
                    x={position.x}
                    y={position.y}
                    scaleX={scale}
                    scaleY={scale}
                    draggable={drawingMode === 'select'}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  >
                    {/* Grid */}
                    {renderGrid()}
                    
                    {/* Boundary line */}
                    {visibleLayers.boundary && points.length >= 4 && (
                      <Line
                        points={points}
                        stroke={COLORS.boundary}
                        strokeWidth={2 / scale}
                        closed={points.length >= 6}
                        fill={points.length >= 6 ? 'rgba(43, 87, 151, 0.1)' : undefined}
                        dash={selectedItem === 'boundary' ? [10 / scale, 5 / scale] : undefined}
                      />
                    )}
                    
                    {/* Points */}
                    {visibleLayers.boundary && points.length >= 2 &&
                      Array.from({ length: points.length / 2 }).map((_, i) => (
                        <Circle
                          key={i}
                          x={points[i * 2]}
                          y={points[i * 2 + 1]}
                          radius={4 / scale}
                          fill={COLORS.boundary}
                          stroke={selectedItem === 'boundary' ? COLORS.selected : undefined}
                          strokeWidth={1 / scale}
                        />
                      ))}
                    
                    {/* Obstructions */}
                    {visibleLayers.obstructions && obstructions.map((obs, i) => {
                      const isSelected = selectedItem === obs.id;
                      
                      if (obs.type === 'column') {
                        return (
                          <Rect
                            key={i}
                            x={obs.x}
                            y={obs.y}
                            width={obs.width}
                            height={obs.height}
                            fill={COLORS.column}
                            stroke={isSelected ? COLORS.selected : undefined}
                            strokeWidth={isSelected ? 2 / scale : undefined}
                          />
                        );
                      } else if (obs.type === 'wall') {
                        return (
                          <Line
                            key={i}
                            points={obs.points}
                            stroke={COLORS.wall}
                            strokeWidth={wallWidth / scale}
                            lineCap="round"
                            lineJoin="round"
                            dash={isSelected ? [10 / scale, 5 / scale] : undefined}
                          />
                        );
                      } else if (obs.type === 'dock') {
                        return (
                          <Rect
                            key={i}
                            x={obs.x}
                            y={obs.y}
                            width={obs.width}
                            height={obs.height}
                            fill={COLORS.dock}
                            stroke={isSelected ? COLORS.selected : undefined}
                            strokeWidth={isSelected ? 2 / scale : undefined}
                          />
                        );
                      }
                      return null;
                    })}
                    
                    {/* Zones */}
                    {visibleLayers.zones && zones.map((zone, i) => {
                      const isSelected = selectedItem === zone.id;
                      
                      return (
                        <Group key={i}>
                          <Line
                            points={zone.points}
                            closed
                            fill={`${COLORS.zone}40`}
                            stroke={isSelected ? COLORS.selected : COLORS.zone}
                            strokeWidth={2 / scale}
                            dash={isSelected ? [10 / scale, 5 / scale] : undefined}
                          />
                          <Text
                            x={zone.points[0] + 5 / scale}
                            y={zone.points[1] + 5 / scale}
                            text={zone.name}
                            fontSize={14 / scale}
                            fill="#000"
                          />
                        </Group>
                      );
                    })}
                    
                    {/* Measurements */}
                    {visibleLayers.measurements && measurements.map((measurement, i) => {
                      const isSelected = selectedItem === measurement.id;
                      
                      if (measurement.type === 'distance') {
                        const x1 = measurement.points[0];
                        const y1 = measurement.points[1];
                        const x2 = measurement.points[2];
                        const y2 = measurement.points[3];
                        
                        // Calculate midpoint for label
                        const midX = (x1 + x2) / 2;
                        const midY = (y1 + y2) / 2;
                        
                        return (
                          <Group key={i}>
                            <Arrow
                              points={[x1, y1, x2, y2]}
                              pointerLength={10 / scale}
                              pointerWidth={10 / scale}
                              fill={COLORS.measurement}
                              stroke={isSelected ? COLORS.selected : COLORS.measurement}
                              strokeWidth={2 / scale}
                              dash={isSelected ? [10 / scale, 5 / scale] : undefined}
                            />
                            <Text
                              x={midX}
                              y={midY}
                              text={`${measurement.value} ${measurement.unit}`}
                              fontSize={14 / scale}
                              fill="#000"
                              offsetX={20}
                              offsetY={10}
                              background="#fff"
                              padding={5 / scale}
                            />
                          </Group>
                        );
                      } else if (measurement.type === 'area') {
                        return (
                          <Group key={i}>
                            <Line
                              points={measurement.points}
                              closed
                              fill={`${COLORS.measurement}40`}
                              stroke={isSelected ? COLORS.selected : COLORS.measurement}
                              strokeWidth={2 / scale}
                              dash={isSelected ? [10 / scale, 5 / scale] : undefined}
                            />
                            <Text
                              x={measurement.points[0] + 10 / scale}
                              y={measurement.points[1] + 10 / scale}
                              text={`${measurement.value} ${measurement.unit}`}
                              fontSize={14 / scale}
                              fill="#000"
                              background="#fff"
                              padding={5 / scale}
                            />
                          </Group>
                        );
                      }
                      return null;
                    })}
                  </Group>
                </Layer>
              </Stage>
            </Box>
          </Paper>
        </Grid>
        
        {/* Right side - Properties */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, height: CANVAS_HEIGHT + 80 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="property tabs">
                <Tab label="Facility" id="tab-0" />
                <Tab label="Drawing" id="tab-1" />
                <Tab label="Selected" id="tab-2" />
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>
                Facility Properties
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Facility Name"
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  margin="normal"
                  size="small"
                />
                
                <TextField
                  fullWidth
                  label="Clear Height (ft)"
                  type="number"
                  value={clearHeight}
                  onChange={(e) => setClearHeight(Number(e.target.value))}
                  margin="normal"
                  size="small"
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Box>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                fullWidth
              >
                Save Facility
              </Button>
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              {drawingMode === 'column' && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Column Properties
                  </Typography>
                  
                  <TextField
                    fullWidth
                    label="Column Size (ft)"
                    type="number"
                    value={columnSize / GRID_SIZE}
                    onChange={(e) => setColumnSize(Number(e.target.value) * GRID_SIZE)}
                    margin="normal"
                    size="small"
                    InputProps={{ inputProps: { min: 0.5, step: 0.5 } }}
                  />
                </Box>
              )}
              
              {drawingMode === 'wall' && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Wall Properties
                  </Typography>
                  
                  <TextField
                    fullWidth
                    label="Wall Width (in)"
                    type="number"
                    value={wallWidth}
                    onChange={(e) => setWallWidth(Number(e.target.value))}
                    margin="normal"
                    size="small"
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                </Box>
              )}
              
              {drawingMode === 'zone' && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Zone Properties
                  </Typography>
                  
                  <TextField
                    fullWidth
                    label="Zone Name"
                    value={newZoneName}
                    onChange={(e) => setNewZoneName(e.target.value)}
                    margin="normal"
                    size="small"
                    placeholder={`Zone ${zones.length + 1}`}
                  />
                  
                  <FormControl fullWidth margin="normal" size="small">
                    <InputLabel>Purpose</InputLabel>
                    <Select
                      value={newZonePurpose}
                      label="Purpose"
                      onChange={(e) => setNewZonePurpose(e.target.value)}
                    >
                      <MenuItem value="storage">Storage</MenuItem>
                      <MenuItem value="receiving">Receiving</MenuItem>
                      <MenuItem value="shipping">Shipping</MenuItem>
                      <MenuItem value="staging">Staging</MenuItem>
                      <MenuItem value="office">Office</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleAddZone}
                    fullWidth
                    sx={{ mt: 2 }}
                    disabled={points.length < 6}
                  >
                    Add Zone
                  </Button>
                </Box>
              )}
              
              {drawingMode === 'measure' && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Measurement
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {measurementType === 'distance'
                      ? 'Click two points to measure the distance between them.'
                      : 'Click multiple points to define an area, then click near the first point to complete.'}
                  </Typography>
                  
                  <FormControl fullWidth margin="normal" size="small">
                    <InputLabel>Measurement Type</InputLabel>
                    <Select
                      value={measurementType}
                      label="Measurement Type"
                      onChange={(e) => setMeasurementType(e.target.value as 'distance' | 'area')}
                    >
                      <MenuItem value="distance">Distance</MenuItem>
                      <MenuItem value="area">Area</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setIsMeasuring(true)}
                    fullWidth
                    sx={{ mt: 2 }}
                    disabled={isMeasuring}
                  >
                    Start Measuring
                  </Button>
                </Box>
              )}
              
              {(drawingMode === 'boundary' || drawingMode === 'select') && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Boundary Points
                  </Typography>
                  
                  <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                    {points.length >= 2 ? (
                      Array.from({ length: points.length / 2 }).map((_, i) => (
                        <Box key={i} sx={{ mb: 1 }}>
                          Point {i + 1}: ({points[i * 2]}, {points[i * 2 + 1]})
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No points added yet. Click on the canvas to add points.
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              {renderSelectedProperties()}
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FacilityEditor;
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Switch,
  FormControlLabel,
  FormGroup,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Tabs,
  Tab,
  TextField,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';

import useUserStore from '../store/userStore';
import { UserPreferences } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const Settings: React.FC = () => {
  const { currentUser, fetchCurrentUser, updateUserPreferences } = useUserStore();
  const [tabValue, setTabValue] = useState(0);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchCurrentUser();
      setIsLoading(false);
    };
    
    loadData();
  }, [fetchCurrentUser]);

  useEffect(() => {
    if (currentUser?.preferences) {
      setPreferences({ ...currentUser.preferences });
    }
  }, [currentUser]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (preferences) {
      setPreferences({
        ...preferences,
        theme: event.target.checked ? 'dark' : 'light'
      });
    }
  };

  const handleMeasurementUnitChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    if (preferences) {
      setPreferences({
        ...preferences,
        measurementUnit: event.target.value as 'imperial' | 'metric'
      });
    }
  };

  const handleNotificationsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (preferences) {
      setPreferences({
        ...preferences,
        notifications: event.target.checked
      });
    }
  };

  const handleDefaultViewChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    if (preferences) {
      setPreferences({
        ...preferences,
        defaultView: event.target.value as 'list' | 'grid'
      });
    }
  };

  const handleShortcutChange = (shortcutKey: string, value: string) => {
    if (preferences) {
      setPreferences({
        ...preferences,
        shortcuts: {
          ...preferences.shortcuts,
          [shortcutKey]: value
        }
      });
    }
  };

  const handleSavePreferences = async () => {
    if (!preferences) return;
    
    try {
      await updateUserPreferences(preferences);
      setSaveSuccess(true);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setSaveError(true);
    }
  };

  const handleResetDefaults = () => {
    if (currentUser?.preferences) {
      // Reset to application defaults
      setPreferences({
        theme: 'light',
        measurementUnit: 'imperial',
        notifications: true,
        defaultView: 'grid',
        shortcuts: {
          'save': 'Ctrl+S',
          'new': 'Ctrl+N',
          'delete': 'Delete',
          'duplicate': 'Ctrl+D',
          'undo': 'Ctrl+Z',
          'redo': 'Ctrl+Y'
        }
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSaveSuccess(false);
    setSaveError(false);
  };

  if (isLoading || !preferences) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading settings...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Settings
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<SettingsBackupRestoreIcon />}
            onClick={handleResetDefaults}
            sx={{ mr: 2 }}
          >
            Reset to Defaults
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSavePreferences}
          >
            Save Changes
          </Button>
        </Box>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="settings tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Appearance" id="settings-tab-0" aria-controls="settings-tabpanel-0" />
          <Tab label="Preferences" id="settings-tab-1" aria-controls="settings-tabpanel-1" />
          <Tab label="Keyboard Shortcuts" id="settings-tab-2" aria-controls="settings-tabpanel-2" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Theme" />
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LightModeIcon sx={{ mr: 1 }} />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.theme === 'dark'}
                          onChange={handleThemeChange}
                        />
                      }
                      label=""
                    />
                    <DarkModeIcon sx={{ ml: 1 }} />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                      {preferences.theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader 
                  title="Measurement Units" 
                  action={
                    <Tooltip title="Choose your preferred measurement system">
                      <IconButton size="small">
                        <HelpOutlineIcon />
                      </IconButton>
                    </Tooltip>
                  }
                />
                <CardContent>
                  <FormControl fullWidth>
                    <InputLabel id="measurement-unit-label">Measurement Unit</InputLabel>
                    <Select
                      labelId="measurement-unit-label"
                      value={preferences.measurementUnit}
                      label="Measurement Unit"
                      onChange={handleMeasurementUnitChange as any}
                    >
                      <MenuItem value="imperial">Imperial (feet, inches)</MenuItem>
                      <MenuItem value="metric">Metric (meters, centimeters)</MenuItem>
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Notifications" />
                <CardContent>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.notifications}
                          onChange={handleNotificationsChange}
                        />
                      }
                      label="Enable notifications"
                    />
                  </FormGroup>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Default View" />
                <CardContent>
                  <FormControl fullWidth>
                    <InputLabel id="default-view-label">Default View</InputLabel>
                    <Select
                      labelId="default-view-label"
                      value={preferences.defaultView}
                      label="Default View"
                      onChange={handleDefaultViewChange as any}
                    >
                      <MenuItem value="list">List View</MenuItem>
                      <MenuItem value="grid">Grid View</MenuItem>
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="body2" color="text.secondary" paragraph>
            Customize keyboard shortcuts for common actions. Use format like "Ctrl+S" or "Alt+Shift+F".
          </Typography>
          <Grid container spacing={3}>
            {Object.entries(preferences.shortcuts).map(([key, value]) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <TextField
                  fullWidth
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={value}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleShortcutChange(key, e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Paper>

      <Snackbar
        open={saveSuccess}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Settings saved successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        open={saveError}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          Error saving settings. Please try again.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
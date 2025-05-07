import { FC, useRef, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Facility, Obstruction } from '../store/facilityStore';
import { Layout, Rack } from '../store/layoutStore';

interface FacilityViewer3DProps {
  facility: Facility;
  layout?: Layout | null;
  width?: number;
  height?: number;
  onRackSelect?: (rackId: string) => void;
  onRackPlace?: (position: { x: number, y: number, rotation: number }) => void;
  drawingMode?: string;
}

const FacilityViewer3D: FC<FacilityViewer3DProps> = ({ 
  facility, 
  layout = null,
  width = 800, 
  height = 600,
  onRackSelect,
  onRackPlace,
  drawingMode = 'select'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const rackMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const [isPlacingRack, setIsPlacingRack] = useState<boolean>(false);
  const [placementPosition, setPlacementPosition] = useState<THREE.Vector3 | null>(null);
  const [placementRotation, setPlacementRotation] = useState<number>(0);
  const [placementPreviewMesh, setPlacementPreviewMesh] = useState<THREE.Mesh | null>(null);
  
  // Initialize scene
  useEffect(() => {
    if (!containerRef.current || !facility) return;
    
    // Initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Add camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
    camera.position.set(0, 500, 1000);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;
    
    // Add renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controlsRef.current = controls;
    
    // Create floor (facility boundary)
    if (facility.boundary && facility.boundary.coordinates && facility.boundary.coordinates.length > 0) {
      const coordinates = facility.boundary.coordinates[0];
      
      // Create floor shape
      const floorShape = new THREE.Shape();
      
      // Move to first point
      const firstPoint = coordinates[0];
      floorShape.moveTo(firstPoint[0], firstPoint[1]);
      
      // Line to remaining points
      for (let i = 1; i < coordinates.length; i++) {
        const point = coordinates[i];
        floorShape.lineTo(point[0], point[1]);
      }
      
      // Create geometry from shape
      const floorGeometry = new THREE.ShapeGeometry(floorShape);
      
      // Rotate to lay flat on XZ plane
      floorGeometry.rotateX(-Math.PI / 2);
      
      // Create material
      const floorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2b5797, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5
      });
      
      // Create mesh
      const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
      floorMesh.userData.type = 'floor';
      
      // Add to scene
      scene.add(floorMesh);
      
      // Center camera on facility
      const boundingBox = new THREE.Box3().setFromObject(floorMesh);
      const center = boundingBox.getCenter(new THREE.Vector3());
      const size = boundingBox.getSize(new THREE.Vector3());
      
      // Position camera to view entire facility
      const maxDim = Math.max(size.x, size.z);
      const fov = camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
      cameraZ *= 1.5; // Add some margin
      
      camera.position.set(center.x, cameraZ, center.z + cameraZ);
      camera.lookAt(center.x, 0, center.z);
      
      // Update controls target
      controls.target.set(center.x, 0, center.z);
      controls.update();
    }
    
    // Add obstructions
    if (facility.obstructions && facility.obstructions.length > 0) {
      facility.obstructions.forEach(obstruction => {
        if (obstruction.type === 'column') {
          // Create column
          addColumn(scene, obstruction);
        } else if (obstruction.type === 'wall') {
          // Create wall
          addWall(scene, obstruction);
        } else if (obstruction.type === 'dock') {
          // Create dock
          addDock(scene, obstruction);
        }
      });
    }
    
    // Add grid
    const gridSize = 1000;
    const gridDivisions = 100;
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x888888, 0xcccccc);
    scene.add(gridHelper);
    
    // Add event listeners
    const handleMouseMove = (event: MouseEvent) => {
      // Calculate mouse position in normalized device coordinates
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // If placing a rack, update the preview position
      if (isPlacingRack && placementPreviewMesh) {
        // Raycast to find intersection with floor or grid
        raycasterRef.current.setFromCamera(mouseRef.current, camera);
        const intersects = raycasterRef.current.intersectObjects(scene.children);
        
        for (let i = 0; i < intersects.length; i++) {
          const intersect = intersects[i];
          const object = intersect.object;
          
          // Only place on floor or grid
          if (object.userData.type === 'floor' || object instanceof THREE.GridHelper) {
            const position = intersect.point;
            
            // Snap to grid (5 foot increments)
            position.x = Math.round(position.x / 5) * 5;
            position.z = Math.round(position.z / 5) * 5;
            
            // Update preview position
            placementPreviewMesh.position.set(position.x, placementPreviewMesh.position.y, position.z);
            setPlacementPosition(position);
            break;
          }
        }
      }
    };
    
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) return; // Only handle left click
      
      // Calculate mouse position in normalized device coordinates
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Raycast to find intersection
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(scene.children);
      
      if (isPlacingRack && placementPosition && onRackPlace) {
        // Place the rack
        onRackPlace({
          x: placementPosition.x,
          y: placementPosition.z,
          rotation: placementRotation
        });
        
        // Reset placement state
        setIsPlacingRack(false);
        setPlacementPosition(null);
        
        // Remove preview mesh
        if (placementPreviewMesh) {
          scene.remove(placementPreviewMesh);
          setPlacementPreviewMesh(null);
        }
        
        return;
      }
      
      // Handle rack selection
      if (drawingMode === 'select' && onRackSelect) {
        for (let i = 0; i < intersects.length; i++) {
          const intersect = intersects[i];
          const object = intersect.object;
          
          if (object.userData.type === 'rack' && object.userData.id) {
            onRackSelect(object.userData.id);
            return;
          }
        }
      }
      
      // Handle rack placement
      if (drawingMode !== 'select' && !isPlacingRack) {
        // Start placing a rack
        setIsPlacingRack(true);
        
        // Create preview mesh
        const previewMesh = createRackPreviewMesh(drawingMode);
        if (previewMesh) {
          scene.add(previewMesh);
          setPlacementPreviewMesh(previewMesh);
          
          // Position at mouse position
          for (let i = 0; i < intersects.length; i++) {
            const intersect = intersects[i];
            const object = intersect.object;
            
            // Only place on floor or grid
            if (object.userData.type === 'floor' || object instanceof THREE.GridHelper) {
              const position = intersect.point;
              
              // Snap to grid (5 foot increments)
              position.x = Math.round(position.x / 5) * 5;
              position.z = Math.round(position.z / 5) * 5;
              
              // Update preview position
              previewMesh.position.set(position.x, previewMesh.position.y, position.z);
              setPlacementPosition(position);
              break;
            }
          }
        }
      }
    };
    
    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle rotation with R key
      if (event.key === 'r' && isPlacingRack && placementPreviewMesh) {
        // Rotate 90 degrees
        setPlacementRotation((prev) => {
          const newRotation = (prev + Math.PI / 2) % (Math.PI * 2);
          placementPreviewMesh.rotation.y = newRotation;
          return newRotation;
        });
      }
      
      // Cancel placement with Escape key
      if (event.key === 'Escape' && isPlacingRack) {
        setIsPlacingRack(false);
        setPlacementPosition(null);
        
        // Remove preview mesh
        if (placementPreviewMesh) {
          scene.remove(placementPreviewMesh);
          setPlacementPreviewMesh(null);
        }
      }
    };
    
    // Add event listeners
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('keydown', handleKeyDown);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      if (controlsRef.current) controlsRef.current.update();
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    animate();
    
    // Cleanup
    return () => {
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('keydown', handleKeyDown);
      
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      // Dispose resources
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            
            if (object.material instanceof THREE.Material) {
              object.material.dispose();
            } else if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            }
          }
        });
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [facility, width, height, drawingMode, onRackSelect]);
  
  // Update racks when layout changes
  useEffect(() => {
    if (!sceneRef.current || !layout) return;
    
    // Clear existing racks
    rackMeshesRef.current.forEach((mesh) => {
      if (sceneRef.current) sceneRef.current.remove(mesh);
    });
    rackMeshesRef.current.clear();
    
    // Add racks from layout
    layout.racks.forEach((rack) => {
      addRack(sceneRef.current!, rack);
    });
  }, [layout]);
  
  // Helper function to add a column
  const addColumn = (scene: THREE.Scene, obstruction: Obstruction) => {
    if (!obstruction.shape || !obstruction.shape.coordinates) return;
    
    // Get coordinates
    const coordinates = obstruction.shape.coordinates[0][0];
    
    // Create geometry
    const width = 20; // Default size if not specified
    const height = obstruction.height || 10;
    
    const geometry = new THREE.BoxGeometry(width, height, width);
    
    // Create material
    const material = new THREE.MeshStandardMaterial({ color: 0xf28f1c });
    
    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData.type = 'obstruction';
    mesh.userData.id = obstruction.id;
    
    // Position mesh
    mesh.position.set(coordinates[0], height / 2, coordinates[1]);
    
    // Add to scene
    scene.add(mesh);
  };
  
  // Helper function to add a wall
  const addWall = (scene: THREE.Scene, obstruction: Obstruction) => {
    if (!obstruction.shape || !obstruction.shape.coordinates) return;
    
    // Get coordinates
    const coordinates = obstruction.shape.coordinates;
    
    // Get wall properties
    const height = obstruction.height || 10;
    const width = obstruction.properties?.width || 8;
    
    // Create wall segments
    for (let i = 0; i < coordinates.length - 1; i++) {
      const start = coordinates[i];
      const end = coordinates[i + 1];
      
      // Calculate length and angle
      const dx = end[0] - start[0];
      const dz = end[1] - start[1];
      const length = Math.sqrt(dx * dx + dz * dz);
      const angle = Math.atan2(dz, dx);
      
      // Create geometry
      const geometry = new THREE.BoxGeometry(length, height, width);
      
      // Create material
      const material = new THREE.MeshStandardMaterial({ color: 0xf28f1c });
      
      // Create mesh
      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData.type = 'obstruction';
      mesh.userData.id = obstruction.id;
      
      // Position and rotate mesh
      mesh.position.set(
        start[0] + dx / 2,
        height / 2,
        start[1] + dz / 2
      );
      mesh.rotation.y = angle;
      
      // Add to scene
      scene.add(mesh);
    }
  };
  
  // Helper function to add a dock
  const addDock = (scene: THREE.Scene, obstruction: Obstruction) => {
    if (!obstruction.shape || !obstruction.shape.coordinates) return;
    
    // Get coordinates
    const coordinates = obstruction.shape.coordinates[0][0];
    
    // Create geometry
    const width = 40; // Default width if not specified
    const depth = 20; // Default depth if not specified
    const height = obstruction.height || 4;
    
    const geometry = new THREE.BoxGeometry(width, height, depth);
    
    // Create material
    const material = new THREE.MeshStandardMaterial({ color: 0x4caf50 });
    
    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData.type = 'obstruction';
    mesh.userData.id = obstruction.id;
    
    // Position mesh
    mesh.position.set(coordinates[0], height / 2, coordinates[1]);
    
    // Add to scene
    scene.add(mesh);
  };
  
  // Helper function to add a rack
  const addRack = (scene: THREE.Scene, rack: Rack) => {
    if (!rack.location || !rack.location.coordinates) return;
    
    // Get rack properties
    const height = rack.height || 20;
    const length = rack.length || 96;
    const depth = rack.depth || 48;
    const orientation = rack.orientation || 0;
    
    // Get coordinates (center of rack)
    const coordinates = rack.location.coordinates[0];
    const centerX = coordinates.reduce((sum, point) => sum + point[0], 0) / coordinates.length;
    const centerZ = coordinates.reduce((sum, point) => sum + point[1], 0) / coordinates.length;
    
    // Create rack base
    const baseGeometry = new THREE.BoxGeometry(length, 1, depth);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });
    const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
    baseMesh.position.set(centerX, 0.5, centerZ);
    baseMesh.rotation.y = orientation;
    
    // Create rack group
    const rackGroup = new THREE.Group();
    rackGroup.add(baseMesh);
    
    // Create uprights
    const uprightsGeometry = new THREE.BoxGeometry(2, height, depth);
    const uprightsMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    
    // Left upright
    const leftUpright = new THREE.Mesh(uprightsGeometry, uprightsMaterial);
    leftUpright.position.set(-length / 2 + 1, height / 2, 0);
    rackGroup.add(leftUpright);
    
    // Right upright
    const rightUpright = new THREE.Mesh(uprightsGeometry, uprightsMaterial);
    rightUpright.position.set(length / 2 - 1, height / 2, 0);
    rackGroup.add(rightUpright);
    
    // Create beams
    const beamGeometry = new THREE.BoxGeometry(length - 4, 4, 4);
    const beamMaterial = new THREE.MeshStandardMaterial({ color: 0xf28f1c });
    
    // Get beam elevations from configuration
    const beamElevations = rack.configuration?.beam_elevations || [];
    const beamLevels = rack.configuration?.beam_levels || 3;
    
    // If no beam elevations specified, generate default ones
    if (beamElevations.length === 0) {
      const firstBeamHeight = rack.configuration?.first_beam_height || 6;
      const beamSpacing = rack.configuration?.beam_height || 6;
      
      for (let i = 1; i <= beamLevels; i++) {
        const beamHeight = firstBeamHeight + (i - 1) * beamSpacing;
        
        // Front beam
        const frontBeam = new THREE.Mesh(beamGeometry, beamMaterial);
        frontBeam.position.set(0, beamHeight, depth / 2 - 2);
        rackGroup.add(frontBeam);
        
        // Back beam
        const backBeam = new THREE.Mesh(beamGeometry, beamMaterial);
        backBeam.position.set(0, beamHeight, -depth / 2 + 2);
        rackGroup.add(backBeam);
      }
    } else {
      // Use specified beam elevations
      beamElevations.forEach((elevation, index) => {
        if (index === 0) return; // Skip floor level
        
        // Front beam
        const frontBeam = new THREE.Mesh(beamGeometry, beamMaterial);
        frontBeam.position.set(0, elevation, depth / 2 - 2);
        rackGroup.add(frontBeam);
        
        // Back beam
        const backBeam = new THREE.Mesh(beamGeometry, beamMaterial);
        backBeam.position.set(0, elevation, -depth / 2 + 2);
        rackGroup.add(backBeam);
      });
    }
    
    // Create bay dividers if multiple bays
    if (rack.bays > 1) {
      const bayWidth = length / rack.bays;
      const dividerGeometry = new THREE.BoxGeometry(2, height, depth);
      const dividerMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
      
      for (let i = 1; i < rack.bays; i++) {
        const divider = new THREE.Mesh(dividerGeometry, dividerMaterial);
        divider.position.set(-length / 2 + i * bayWidth, height / 2, 0);
        rackGroup.add(divider);
      }
    }
    
    // Set rack position and rotation
    rackGroup.position.set(centerX, 0, centerZ);
    rackGroup.rotation.y = orientation;
    
    // Set user data
    rackGroup.userData.type = 'rack';
    rackGroup.userData.id = rack.id;
    rackGroup.userData.rackType = rack.rack_type_id;
    
    // Add to scene
    scene.add(rackGroup);
    
    // Store reference
    rackMeshesRef.current.set(rack.id, rackGroup as unknown as THREE.Mesh);
    
    return rackGroup;
  };
  
  // Helper function to create a rack preview mesh
  const createRackPreviewMesh = (rackType: string) => {
    // Default rack dimensions
    const height = 20;
    const length = 96;
    const depth = 48;
    
    // Create rack group
    const rackGroup = new THREE.Group();
    
    // Create rack base
    const baseGeometry = new THREE.BoxGeometry(length, 1, depth);
    const baseMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x666666,
      transparent: true,
      opacity: 0.7
    });
    const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
    baseMesh.position.set(0, 0.5, 0);
    rackGroup.add(baseMesh);
    
    // Create uprights
    const uprightsGeometry = new THREE.BoxGeometry(2, height, depth);
    const uprightsMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x333333,
      transparent: true,
      opacity: 0.7
    });
    
    // Left upright
    const leftUpright = new THREE.Mesh(uprightsGeometry, uprightsMaterial);
    leftUpright.position.set(-length / 2 + 1, height / 2, 0);
    rackGroup.add(leftUpright);
    
    // Right upright
    const rightUpright = new THREE.Mesh(uprightsGeometry, uprightsMaterial);
    rightUpright.position.set(length / 2 - 1, height / 2, 0);
    rackGroup.add(rightUpright);
    
    // Create beams
    const beamGeometry = new THREE.BoxGeometry(length - 4, 4, 4);
    const beamMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xf28f1c,
      transparent: true,
      opacity: 0.7
    });
    
    // Add beams at default positions
    const beamLevels = 3;
    const firstBeamHeight = 6;
    const beamSpacing = 6;
    
    for (let i = 1; i <= beamLevels; i++) {
      const beamHeight = firstBeamHeight + (i - 1) * beamSpacing;
      
      // Front beam
      const frontBeam = new THREE.Mesh(beamGeometry, beamMaterial);
      frontBeam.position.set(0, beamHeight, depth / 2 - 2);
      rackGroup.add(frontBeam);
      
      // Back beam
      const backBeam = new THREE.Mesh(beamGeometry, beamMaterial);
      backBeam.position.set(0, beamHeight, -depth / 2 + 2);
      rackGroup.add(backBeam);
    }
    
    // Set user data
    rackGroup.userData.type = 'rack_preview';
    rackGroup.userData.rackType = rackType;
    
    return rackGroup as unknown as THREE.Mesh;
  };
  
  return (
    <Box 
      ref={containerRef} 
      sx={{ 
        width, 
        height,
        border: '1px solid #ccc',
        borderRadius: 1,
        overflow: 'hidden'
      }}
    />
  );
};

export default FacilityViewer3D;
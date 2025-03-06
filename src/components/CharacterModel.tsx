
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CharacterState } from '../hooks/useCharacterCustomization';

interface CharacterModelProps {
  character: CharacterState;
  isGameMode?: boolean;
  isRotating?: boolean;
  controls?: any;
  isAbilityActive?: boolean;
}

const CharacterModel: React.FC<CharacterModelProps> = ({
  character,
  isGameMode = false,
  isRotating = true,
  controls,
  isAbilityActive = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const characterRef = useRef<THREE.Group | null>(null);
  const orbitControlsRef = useRef<OrbitControls | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Clean up function for the animation frame
  const cleanupAnimationFrame = () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };
  
  // Set up the Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Initialize scene, camera, and renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(
      75, 
      containerRef.current.clientWidth / containerRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Add orbit controls if not in game mode
    if (!isGameMode) {
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      orbitControlsRef.current = controls;
    }
    
    // Create character group
    const characterGroup = new THREE.Group();
    characterRef.current = characterGroup;
    scene.add(characterGroup);
    
    // Set up animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      // Rotate character if enabled
      if (isRotating && !isGameMode && characterRef.current) {
        characterRef.current.rotation.y += 0.01;
      }
      
      // Update orbit controls
      if (orbitControlsRef.current) {
        orbitControlsRef.current.update();
      }
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      cleanupAnimationFrame();
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      window.removeEventListener('resize', handleResize);
      
      // Dispose of Three.js resources
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [isGameMode, isRotating]);
  
  // Update character model when character state changes
  useEffect(() => {
    if (!characterRef.current || !sceneRef.current) return;
    
    // Clear existing character model
    while (characterRef.current.children.length > 0) {
      const object = characterRef.current.children[0];
      characterRef.current.remove(object);
    }
    
    // Create new character based on selected parts and colors
    
    // Head
    let headGeometry;
    switch (character.head) {
      case 'head-1': // Helmet
        headGeometry = new THREE.ConeGeometry(0.5, 0.8, 8);
        break;
      case 'head-2': // Mask
        headGeometry = new THREE.SphereGeometry(0.5, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
        break;
      case 'head-3': // Hood
        headGeometry = new THREE.SphereGeometry(0.5, 32, 16);
        break;
      default:
        headGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    }
    
    const headMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(character.colors.head),
      roughness: 0.7,
      metalness: 0.3
    });
    
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.5;
    characterRef.current.add(head);
    
    // Torso
    let torsoGeometry;
    switch (character.torso) {
      case 'torso-1': // Armor
        torsoGeometry = new THREE.BoxGeometry(1.2, 1.5, 0.6);
        break;
      case 'torso-2': // Suit
        torsoGeometry = new THREE.CylinderGeometry(0.5, 0.7, 1.5, 8);
        break;
      case 'torso-3': // Jacket
        torsoGeometry = new THREE.CapsuleGeometry(0.6, 0.3, 4, 8);
        break;
      default:
        torsoGeometry = new THREE.BoxGeometry(1, 1.5, 0.5);
    }
    
    const torsoMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(character.colors.torso),
      roughness: 0.7,
      metalness: 0.3
    });
    
    const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
    torso.position.y = 0.4;
    characterRef.current.add(torso);
    
    // Arms
    let armGeometry;
    switch (character.arms) {
      case 'arms-1': // Gauntlets
        armGeometry = new THREE.CylinderGeometry(0.2, 0.25, 1, 8);
        break;
      case 'arms-2': // Bracers
        armGeometry = new THREE.BoxGeometry(0.2, 1, 0.2);
        break;
      case 'arms-3': // Sleeves
        armGeometry = new THREE.CapsuleGeometry(0.15, 0.7, 4, 8);
        break;
      default:
        armGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1, 8);
    }
    
    const armMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(character.colors.arms),
      roughness: 0.7,
      metalness: 0.3
    });
    
    // Scale arms if strength ability is active
    const armScale = (character.superAbility === 'strength' && isAbilityActive) ? 1.4 : 1;
    
    // Left arm
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.7, 0.4, 0);
    leftArm.scale.set(armScale, armScale, armScale);
    leftArm.rotation.z = Math.PI / 12;
    characterRef.current.add(leftArm);
    
    // Right arm
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.7, 0.4, 0);
    rightArm.scale.set(armScale, armScale, armScale);
    rightArm.rotation.z = -Math.PI / 12;
    characterRef.current.add(rightArm);
    
    // Legs
    let legGeometry;
    switch (character.legs) {
      case 'legs-1': // Boots
        legGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1, 8);
        break;
      case 'legs-2': // Greaves
        legGeometry = new THREE.BoxGeometry(0.3, 1, 0.3);
        break;
      case 'legs-3': // Pants
        legGeometry = new THREE.CapsuleGeometry(0.2, 0.6, 4, 8);
        break;
      default:
        legGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 8);
    }
    
    const legMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(character.colors.legs),
      roughness: 0.7,
      metalness: 0.3
    });
    
    // Left leg
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.3, -0.6, 0);
    characterRef.current.add(leftLeg);
    
    // Right leg
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.3, -0.6, 0);
    characterRef.current.add(rightLeg);
    
    // Add special ability effects
    if (character.superAbility && isAbilityActive) {
      switch (character.superAbility) {
        case 'flying':
          // Add cape
          const capeGeometry = new THREE.PlaneGeometry(1.5, 2);
          const capeMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#ff3333'),
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9,
          });
          const cape = new THREE.Mesh(capeGeometry, capeMaterial);
          cape.position.set(0, 0.4, -0.4);
          cape.rotation.x = Math.PI / 10;
          characterRef.current.add(cape);
          break;
          
        case 'magic':
          // Add glowing effects to hands
          const glowGeometry = new THREE.SphereGeometry(0.2, 16, 16);
          const glowMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#33ccff'),
            emissive: new THREE.Color('#33ccff'),
            emissiveIntensity: 2,
            transparent: true,
            opacity: 0.8
          });
          
          const leftGlow = new THREE.Mesh(glowGeometry, glowMaterial);
          leftGlow.position.set(-0.7, -0.1, 0);
          characterRef.current.add(leftGlow);
          
          const rightGlow = new THREE.Mesh(glowGeometry, glowMaterial);
          rightGlow.position.set(0.7, -0.1, 0);
          characterRef.current.add(rightGlow);
          break;
          
        default:
          break;
      }
    }
    
    // Position character
    if (isGameMode && controls) {
      characterRef.current.position.set(controls.position.x, controls.position.y, controls.position.z);
      characterRef.current.rotation.y = controls.rotation;
    } else {
      characterRef.current.position.set(0, 0, 0);
    }
    
  }, [character, isGameMode, controls, isAbilityActive]);
  
  // Update character position in game mode
  useEffect(() => {
    if (isGameMode && controls && characterRef.current) {
      characterRef.current.position.set(controls.position.x, controls.position.y, controls.position.z);
      characterRef.current.rotation.y = controls.rotation;
    }
  }, [isGameMode, controls]);
  
  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full ${isAbilityActive ? getAbilityClass() : ''}`}
    />
  );
  
  // Helper function to get the ability class for styling
  function getAbilityClass() {
    if (!isAbilityActive || !character.superAbility) return '';
    return `hero-${character.superAbility}`;
  }
};

export default CharacterModel;

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const EarthGlobe = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // 检查WebGL支持
    if (!window.WebGLRenderingContext) {
      console.error('WebGL not supported');
      return;
    }

    // 初始化场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000814);

    // 初始化相机
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 3;

    // 初始化渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // 创建地球几何体
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    
    // 使用可靠的地球纹理 - 尝试多个源
    const textureLoader = new THREE.TextureLoader();
    let material;
    
    // 首先尝试加载真实地球纹理
    const earthTextureUrls = [
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
      'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'
    ];
    
    let textureLoaded = false;
    
    const loadTexture = (urls, index = 0) => {
      if (index >= urls.length) {
        // 所有URL都失败，使用后备方案
        createFallbackMaterial();
        return;
      }
      
      textureLoader.load(
        urls[index],
        (texture) => {
          // 纹理加载成功
          texture.colorSpace = THREE.SRGBColorSpace;
          material = new THREE.MeshPhongMaterial({
            map: texture,
            shininess: 5,
            specular: new THREE.Color(0x333333)
          });
          if (earthRef.current) {
            earthRef.current.material = material;
            earthRef.current.material.needsUpdate = true;
          }
          textureLoaded = true;
        },
        undefined,
        (error) => {
          console.warn(`Failed to load texture from ${urls[index]}:`, error);
          // 尝试下一个URL
          loadTexture(urls, index + 1);
        }
      );
    };
    
    const createFallbackMaterial = () => {
      // 创建更逼真的后备材质
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      
      // 创建类似地球的纹理
      const gradient = ctx.createLinearGradient(0, 0, 512, 256);
      gradient.addColorStop(0, '#006994');
      gradient.addColorStop(0.3, '#29b6f6');
      gradient.addColorStop(0.5, '#1e88e5');
      gradient.addColorStop(0.7, '#0288d1');
      gradient.addColorStop(1, '#01579b');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 256);
      
      // 添加一些大陆形状的模拟
      ctx.fillStyle = '#2e7d32';
      ctx.beginPath();
      ctx.ellipse(150, 100, 40, 60, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(350, 150, 50, 40, 0, 0, Math.PI * 2);
      ctx.fill();
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      material = new THREE.MeshPhongMaterial({
        map: texture,
        shininess: 15,
        specular: new THREE.Color(0xffffff)
      });
      
      if (earthRef.current) {
        earthRef.current.material = material;
        earthRef.current.material.needsUpdate = true;
      }
    };

    // 初始使用简单蓝色材质
    material = new THREE.MeshPhongMaterial({ 
      color: 0x1e88e5,
      shininess: 30,
      specular: new THREE.Color(0xffffff)
    });
    
    const earth = new THREE.Mesh(geometry, material);
    scene.add(earth);
    const earthRef = { current: earth };

    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-5, -3, -5);
    scene.add(pointLight);

    // 旋转和缩放状态
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotation = { x: 0, y: 0 };
    let zoom = 3; // 初始缩放距离

    // 鼠标事件处理
    const handleMouseDown = (event) => {
      isDragging = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
      mountRef.current.style.cursor = 'grabbing';
    };

    const handleMouseMove = (event) => {
      if (!isDragging) return;
      
      const deltaX = event.clientX - previousMousePosition.x;
      const deltaY = event.clientY - previousMousePosition.y;
      
      rotation.y += deltaX * 0.01;
      rotation.x += deltaY * 0.01;
      
      // 限制垂直旋转
      rotation.x = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, rotation.x));
      
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
      mountRef.current.style.cursor = 'grab';
    };

    // 鼠标滚轮缩放
    const handleWheel = (event) => {
      event.preventDefault();
      const wheelDelta = event.deltaY > 0 ? 1 : -1;
      zoom += wheelDelta * 0.2;
      // 限制缩放范围
      zoom = Math.max(1.5, Math.min(8, zoom));
      camera.position.z = zoom;
    };

    // 触摸事件处理
    const handleTouchStart = (event) => {
      if (event.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { 
          x: event.touches[0].clientX, 
          y: event.touches[0].clientY 
        };
        mountRef.current.style.cursor = 'grabbing';
        event.preventDefault();
      }
    };

    const handleTouchMove = (event) => {
      if (!isDragging || event.touches.length !== 1) return;
      
      const deltaX = event.touches[0].clientX - previousMousePosition.x;
      const deltaY = event.touches[0].clientY - previousMousePosition.y;
      
      rotation.y += deltaX * 0.01;
      rotation.x += deltaY * 0.01;
      
      rotation.x = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, rotation.x));
      
      previousMousePosition = { 
        x: event.touches[0].clientX, 
        y: event.touches[0].clientY 
      };
      event.preventDefault();
    };

    const handleTouchEnd = () => {
      isDragging = false;
      mountRef.current.style.cursor = 'grab';
    };

    // 添加事件监听器
    const canvasEl = renderer.domElement;
    canvasEl.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvasEl.addEventListener('wheel', handleWheel, { passive: false });
    canvasEl.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    // 开始加载纹理
    loadTexture(earthTextureUrls);

    // 动画循环
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      // 自动缓慢旋转（仅在不拖拽时）
      if (!isDragging) {
        earth.rotation.y += 0.001;
      }
      
      // 应用手动旋转
      earth.rotation.x = rotation.x;
      earth.rotation.y += rotation.y;
      
      renderer.render(scene, camera);
    };
    
    animate();

    // 窗口大小调整
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);

    // 清理
    return () => {
      cancelAnimationFrame(animationId);
      canvasEl.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvasEl.removeEventListener('wheel', handleWheel);
      canvasEl.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      style={{
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        cursor: 'grab'
      }}
    />
  );
};

export default EarthGlobe;
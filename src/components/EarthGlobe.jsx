import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const EarthGlobe = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // 初始化场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020a1f);

    // 初始化相机
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 3;

    // 初始化渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // 创建地球几何体 - 使用简单的蓝色材质
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshPhongMaterial({ 
      color: 0x1e88e5,
      shininess: 60,
      specular: 0xffffff
    });
    const earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(2, 2, 3);
    scene.add(directionalLight);

    // 旋转状态
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotation = { x: 0, y: 0 };
    let autoRotation = 0;

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
    const canvas = renderer.domElement;
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    // 动画循环
    const animate = () => {
      requestAnimationFrame(animate);
      
      // 自动旋转
      if (!isDragging) {
        autoRotation += 0.002;
      }
      
      // 应用旋转
      earth.rotation.x = rotation.x;
      earth.rotation.y = rotation.y + autoRotation;
      
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
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
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
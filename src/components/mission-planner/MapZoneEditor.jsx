import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MapPin, Plus, X, Trash2, Upload, Download, Users, Shield, Ship, Target } from 'lucide-react';
import { MapContainer, TileLayer, Polygon, Polyline, Marker, Circle as LeafletCircle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { zoneTypes } from './constants';

// HTML escape helper to prevent XSS in Leaflet divIcons
const escapeHtml = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Default padding constant (prevents new array on every render)
const DEFAULT_PADDING = [50, 50];

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Map click handler component
const MapClickHandler = ({ isDrawingMode, onAddPoint }) => {
  useMapEvents({
    click: (e) => {
      if (isDrawingMode) {
        onAddPoint({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    }
  });
  return null;
};

// Map size invalidator - ensures tiles load correctly when container becomes visible
const MapInvalidateSize = () => {
  const map = useMap();

  useEffect(() => {
    // Invalidate size multiple times to handle flex layout settling
    const timers = [100, 300, 600].map(delay =>
      setTimeout(() => map.invalidateSize(), delay)
    );

    // Also use ResizeObserver for dynamic resizing
    const container = map.getContainer();
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(container);

    return () => {
      timers.forEach(clearTimeout);
      resizeObserver.disconnect();
    };
  }, [map]);

  return null;
};

// Map bounds fitter (fits to all points on mount)
const MapFitBounds = ({ bounds, padding = DEFAULT_PADDING }) => {
  const map = useMap();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (bounds && bounds.length > 0 && !hasInitialized.current) {
      try {
        const leafletBounds = L.latLngBounds(bounds.map(p => [p.lat, p.lng]));
        if (leafletBounds.isValid()) {
          map.fitBounds(leafletBounds, { padding, maxZoom: 8 });
        }
        hasInitialized.current = true;
      } catch {
        // Silently handle - map will just use default bounds
      }
    }
  }, [bounds, padding, map]);

  return null;
};

// Draggable marker for zone vertices
const DraggableMarker = ({ position, index, color, onDrag }) => {
  const markerIcon = useMemo(() => L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 16px;
      height: 16px;
      background: ${escapeHtml(color)};
      border: 2px solid #fff;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8px;
      font-weight: bold;
      color: #fff;
    ">${index + 1}</div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  }), [color, index]);

  return (
    <Marker
      position={[position.lat, position.lng]}
      icon={markerIcon}
      draggable
      eventHandlers={{
        dragend: (e) => {
          const { lat, lng } = e.target.getLatLng();
          onDrag(index, { lat, lng });
        }
      }}
    />
  );
};

// Interactive Nautical Map Zone Editor with Leaflet + OpenSeaMap
const MapZoneEditor = ({ zoneConfig, setZoneConfig, missionType }) => {
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [mapLayer, setMapLayer] = useState('nautical');
  const [importError, setImportError] = useState(null);
  const fileInputRef = useRef(null);

  const zoneStyle = zoneTypes[missionType] || zoneTypes.SEA_DENIAL;
  // Normalize aerial geometry types to existing handlers
  // orbit/track → route (waypoint-based paths)
  // station → perimeter (single point with radius)
  const rawGeometryType = zoneStyle.geometryType || 'zone';
  const geometryType = (() => {
    switch (rawGeometryType) {
      case 'orbit':
      case 'track':
        return 'route'; // Use waypoint-based drawing
      case 'station':
        return 'perimeter'; // Use center+radius drawing
      default:
        return rawGeometryType;
    }
  })();

  // Default data based on geometry type
  const getDefaultConfig = () => {
    switch (geometryType) {
      case 'route':
        return {
          waypoints: [
            { lat: 25.0, lng: -80.5, label: 'A' },
            { lat: 25.5, lng: -79.5, label: 'B' },
            { lat: 26.0, lng: -78.5, label: 'C' }
          ]
        };
      case 'target':
        return {
          targets: [
            { lat: 25.2, lng: -80.0, label: 'T1', type: 'primary' }
          ],
          staging: { lat: 25.0, lng: -81.0, label: 'STAGING' }
        };
      case 'perimeter':
        if (missionType === 'PORT_SECURITY') {
          return {
            center: { lat: 21.35, lng: -157.97 },
            radius: 8,
            assetName: 'Naval Station Pearl Harbor'
          };
        }
        return {
          center: { lat: 25.2, lng: -80.0 },
          radius: 20,
          assetName: 'HVU Alpha'
        };
      default:
        return {
          coordinates: [
            { lat: 25.0, lng: -80.5 },
            { lat: 25.5, lng: -80.0 },
            { lat: 25.3, lng: -79.3 },
            { lat: 24.8, lng: -79.5 }
          ]
        };
    }
  };

  // Check if zone config has actual geometry data for current geometry type
  const hasGeometryData = (cfg) => {
    if (!cfg) return false;
    switch (geometryType) {
      case 'route':
        return cfg.waypoints && cfg.waypoints.length > 0;
      case 'target':
        return cfg.targets && cfg.targets.length > 0;
      case 'perimeter':
        return !!cfg.center;
      default:
        return cfg.coordinates && cfg.coordinates.length > 0;
    }
  };

  // Use defaults if zoneConfig is empty or lacks geometry for current type
  const config = hasGeometryData(zoneConfig) ? zoneConfig : { ...zoneConfig, ...getDefaultConfig() };
  const points = config.coordinates || [];
  const waypoints = config.waypoints || [];
  const targets = config.targets || [];
  const staging = config.staging;
  const perimeterCenter = config.center;
  const perimeterRadius = config.radius || 20;

  // Calculate center for map view
  const center = useMemo(() => {
    if (geometryType === 'perimeter' && perimeterCenter) {
      return [perimeterCenter.lat, perimeterCenter.lng];
    }
    if (geometryType === 'route' && waypoints.length > 0) {
      const lat = waypoints.reduce((sum, p) => sum + p.lat, 0) / waypoints.length;
      const lng = waypoints.reduce((sum, p) => sum + p.lng, 0) / waypoints.length;
      return [lat, lng];
    }
    if (geometryType === 'target') {
      const allPoints = [...targets, staging].filter(Boolean);
      if (allPoints.length > 0) {
        const lat = allPoints.reduce((sum, p) => sum + p.lat, 0) / allPoints.length;
        const lng = allPoints.reduce((sum, p) => sum + p.lng, 0) / allPoints.length;
        return [lat, lng];
      }
    }
    if (points.length > 0) {
      const lat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
      const lng = points.reduce((sum, p) => sum + p.lng, 0) / points.length;
      return [lat, lng];
    }
    return [25.2, -80.0];
  }, [geometryType, points, waypoints, targets, staging, perimeterCenter]);

  // Get all points for bounds fitting
  const allBoundsPoints = useMemo(() => {
    if (geometryType === 'perimeter' && perimeterCenter) {
      const radiusDeg = perimeterRadius / 60;
      return [
        { lat: perimeterCenter.lat + radiusDeg, lng: perimeterCenter.lng - radiusDeg },
        { lat: perimeterCenter.lat + radiusDeg, lng: perimeterCenter.lng + radiusDeg },
        { lat: perimeterCenter.lat - radiusDeg, lng: perimeterCenter.lng - radiusDeg },
        { lat: perimeterCenter.lat - radiusDeg, lng: perimeterCenter.lng + radiusDeg }
      ];
    }
    if (geometryType === 'route' && waypoints.length > 0) return waypoints;
    if (geometryType === 'target') {
      const allPoints = [...targets];
      if (staging) allPoints.push(staging);
      return allPoints;
    }
    if (points.length > 0) return points;
    return [{ lat: 25.2, lng: -80.0 }];
  }, [geometryType, points, waypoints, targets, staging, perimeterCenter, perimeterRadius]);

  // Calculate area/distance based on geometry type
  const calculateMetric = () => {
    if (geometryType === 'zone' && points.length >= 3) {
      let area = 0;
      for (let i = 0; i < points.length; i++) {
        const j = (i + 1) % points.length;
        area += points[i].lng * points[j].lat;
        area -= points[j].lng * points[i].lat;
      }
      return { value: Math.abs(area / 2) * 3600, unit: 'sq nm', label: 'Area' };
    }
    if (geometryType === 'route' && waypoints.length >= 2) {
      let distance = 0;
      for (let i = 1; i < waypoints.length; i++) {
        const lat1 = waypoints[i-1].lat * Math.PI / 180;
        const lat2 = waypoints[i].lat * Math.PI / 180;
        const dLat = lat2 - lat1;
        const dLng = (waypoints[i].lng - waypoints[i-1].lng) * Math.PI / 180;
        const a = Math.sin(dLat/2)**2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng/2)**2;
        distance += 2 * 3440.065 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      }
      return { value: distance, unit: 'nm', label: 'Route' };
    }
    if (geometryType === 'perimeter') {
      return { value: Math.PI * perimeterRadius ** 2, unit: 'sq nm', label: 'Defense Zone' };
    }
    if (geometryType === 'target') {
      return { value: targets.length, unit: 'targets', label: 'Targets' };
    }
    return { value: 0, unit: '', label: '' };
  };

  const metric = calculateMetric();

  // Add point/waypoint based on geometry type
  const addPoint = (newPoint) => {
    if (geometryType === 'route') {
      const newWaypoints = [...waypoints, { ...newPoint, label: String.fromCharCode(65 + waypoints.length) }];
      setZoneConfig({ ...config, waypoints: newWaypoints });
    } else if (geometryType === 'target') {
      const newTargets = [...targets, { ...newPoint, label: `T${targets.length + 1}`, type: 'secondary' }];
      setZoneConfig({ ...config, targets: newTargets });
    } else if (geometryType === 'perimeter') {
      setZoneConfig({ ...config, center: newPoint });
    } else {
      const newPoints = [...points, newPoint];
      setZoneConfig({ ...config, coordinates: newPoints });
    }
  };

  // Update point position
  const updatePoint = (index, newPos) => {
    if (geometryType === 'route') {
      const newWaypoints = [...waypoints];
      newWaypoints[index] = { ...newWaypoints[index], ...newPos };
      setZoneConfig({ ...config, waypoints: newWaypoints });
    } else if (geometryType === 'target') {
      const newTargets = [...targets];
      newTargets[index] = { ...newTargets[index], ...newPos };
      setZoneConfig({ ...config, targets: newTargets });
    } else if (geometryType === 'perimeter') {
      setZoneConfig({ ...config, center: newPos });
    } else {
      const newPoints = [...points];
      newPoints[index] = newPos;
      setZoneConfig({ ...config, coordinates: newPoints });
    }
  };

  const updateStaging = (newPos) => {
    setZoneConfig({ ...config, staging: { ...staging, ...newPos } });
  };

  const removePoint = (index) => {
    if (geometryType === 'route') {
      if (waypoints.length <= 2) return;
      const newWaypoints = waypoints.filter((_, i) => i !== index).map((wp, i) => ({
        ...wp,
        label: String.fromCharCode(65 + i)
      }));
      setZoneConfig({ ...config, waypoints: newWaypoints });
    } else if (geometryType === 'target') {
      const newTargets = targets.filter((_, i) => i !== index).map((t, i) => ({
        ...t,
        label: `T${i + 1}`
      }));
      setZoneConfig({ ...config, targets: newTargets });
    } else {
      if (points.length <= 3) return;
      const newPoints = points.filter((_, i) => i !== index);
      setZoneConfig({ ...config, coordinates: newPoints });
    }
  };

  const clearZone = () => {
    if (geometryType === 'route') {
      setZoneConfig({ ...config, waypoints: [] });
    } else if (geometryType === 'target') {
      setZoneConfig({ ...config, targets: [], staging: null });
    } else if (geometryType === 'perimeter') {
      setZoneConfig({ ...config, center: null, radius: 20 });
    } else {
      setZoneConfig({ ...config, coordinates: [] });
    }
    setIsDrawingMode(true);
  };

  const adjustRadius = (delta) => {
    const newRadius = Math.max(5, Math.min(100, perimeterRadius + delta));
    setZoneConfig({ ...config, radius: newRadius });
  };

  const handleImportGeoJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const geojson = JSON.parse(event.target?.result);
        let coordinates = [];
        if (geojson.type === 'Feature' && geojson.geometry) {
          if (geojson.geometry.type === 'Polygon') {
            coordinates = geojson.geometry.coordinates[0].map(([lng, lat]) => ({ lat, lng }));
          } else if (geojson.geometry.type === 'LineString') {
            coordinates = geojson.geometry.coordinates.map(([lng, lat], i) => ({ lat, lng, label: String.fromCharCode(65 + i) }));
            if (geometryType === 'route') {
              setZoneConfig({ ...config, waypoints: coordinates, name: geojson.properties?.name || config.name });
              return;
            }
          }
        }
        if (coordinates.length > 1) {
          const first = coordinates[0];
          const last = coordinates[coordinates.length - 1];
          if (Math.abs(first.lat - last.lat) < 0.0001 && Math.abs(first.lng - last.lng) < 0.0001) {
            coordinates.pop();
          }
        }
        if (coordinates.length >= 3) {
          setZoneConfig({ ...config, coordinates, name: geojson.properties?.name || config.name });
        }
      } catch {
        setImportError('Failed to parse GeoJSON file. Please check the file format.');
        setTimeout(() => setImportError(null), 5000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const exportGeoJSON = () => {
    let geometry;
    if (geometryType === 'route') {
      geometry = { type: 'LineString', coordinates: waypoints.map(p => [p.lng, p.lat]) };
    } else if (geometryType === 'target') {
      geometry = { type: 'MultiPoint', coordinates: targets.map(t => [t.lng, t.lat]) };
    } else if (geometryType === 'perimeter' && perimeterCenter) {
      geometry = { type: 'Point', coordinates: [perimeterCenter.lng, perimeterCenter.lat] };
    } else {
      geometry = { type: 'Polygon', coordinates: [[...points.map(p => [p.lng, p.lat]), [points[0]?.lng, points[0]?.lat]]] };
    }

    const geojson = {
      type: 'Feature',
      properties: {
        name: config.name || zoneStyle.label,
        missionType,
        geometryType,
        ...(geometryType === 'perimeter' ? { radius_nm: perimeterRadius } : {}),
        metric: `${metric.value.toFixed(1)} ${metric.unit}`
      },
      geometry
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.name || 'mission-area'}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tileLayers = {
    nautical: {
      // CartoDB Voyager with English labels + OpenSeaMap nautical overlay
      base: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      seamark: 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
      attribution: '&copy; CARTO | OpenSeaMap'
    },
    satellite: {
      base: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri'
    },
    dark: {
      // CartoDB Dark Matter - English labels
      base: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; CARTO'
    }
  };

  const currentLayer = tileLayers[mapLayer];

  const getDrawingHint = () => {
    switch (geometryType) {
      case 'route': return 'Click to add waypoints (A → B → C...)';
      case 'target': return 'Click to add target points';
      case 'perimeter': return 'Click to set defense center';
      default: return 'Click to add zone vertices';
    }
  };

  const getStatusText = () => {
    switch (geometryType) {
      case 'route': return `${waypoints.length} waypoints`;
      case 'target': return `${targets.length} targets${staging ? ' + staging' : ''}`;
      case 'perimeter': return perimeterCenter ? `${perimeterRadius} nm radius` : 'Set center point';
      default: return `${points.length} vertices`;
    }
  };

  const createWaypointIcon = (label, color) => {
    return L.divIcon({
      className: 'custom-waypoint',
      html: `<div style="width: 24px; height: 24px; background: ${escapeHtml(color)}; border: 2px solid #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #000; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">${escapeHtml(label)}</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  const createTargetIcon = (label, isPrimary) => {
    return L.divIcon({
      className: 'custom-target',
      html: `<div style="width: ${isPrimary ? 28 : 22}px; height: ${isPrimary ? 28 : 22}px; background: ${isPrimary ? '#ef4444' : '#f97316'}; border: 2px solid #fff; border-radius: 4px; transform: rotate(45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"><span style="transform: rotate(-45deg); font-size: 9px; font-weight: 700; color: #fff;">${escapeHtml(label)}</span></div>`,
      iconSize: [isPrimary ? 28 : 22, isPrimary ? 28 : 22],
      iconAnchor: [isPrimary ? 14 : 11, isPrimary ? 14 : 11]
    });
  };

  const createStagingIcon = () => {
    return L.divIcon({
      className: 'custom-staging',
      html: `<div style="padding: 4px 8px; background: #22c55e; border: 2px solid #fff; border-radius: 4px; font-size: 9px; font-weight: 700; color: #000; box-shadow: 0 2px 6px rgba(0,0,0,0.4); white-space: nowrap;">STAGING</div>`,
      iconSize: [60, 24],
      iconAnchor: [30, 12]
    });
  };

  const createDefenseIcon = (assetName) => {
    return L.divIcon({
      className: 'custom-defense',
      html: `<div style="padding: 4px 8px; background: #f97316; border: 2px solid #fff; border-radius: 4px; font-size: 9px; font-weight: 700; color: #000; box-shadow: 0 2px 6px rgba(0,0,0,0.4); white-space: nowrap;">${escapeHtml(assetName) || 'ASSET'}</div>`,
      iconSize: [80, 24],
      iconAnchor: [40, 12]
    });
  };

  return (
    <div
      className="bg-darkest rounded-lg overflow-hidden h-full flex flex-col"
      style={{ border: `2px solid ${zoneStyle.color}40` }}
    >
      {/* Header */}
      <div
        className="px-2 py-1.5 flex items-center justify-between gap-2 overflow-hidden"
        style={{ backgroundColor: `${zoneStyle.color}15`, borderBottom: `1px solid ${zoneStyle.color}30` }}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-shrink">
          <MapPin size={12} color={zoneStyle.color} className="flex-shrink-0" />
          <span className="text-[0.65rem] font-semibold whitespace-nowrap" style={{ color: zoneStyle.color }}>
            {zoneStyle.label.toUpperCase()}
          </span>
          <span className="text-gray-500 text-[0.5rem] truncate">
            {getStatusText()}
          </span>
        </div>
        <div className="flex gap-1 items-center flex-shrink-0">
          {geometryType === 'perimeter' && (
            <div className="flex gap-0.5 mr-1">
              <button onClick={() => adjustRadius(-5)} className="px-1 py-0.5 bg-darker border border-gray-600/40 rounded text-gray-400 text-[0.5rem] cursor-pointer">-5nm</button>
              <button onClick={() => adjustRadius(5)} className="px-1 py-0.5 bg-darker border border-gray-600/40 rounded text-gray-400 text-[0.5rem] cursor-pointer">+5nm</button>
            </div>
          )}
          <select value={mapLayer} onChange={(e) => setMapLayer(e.target.value)} className="px-1 py-0.5 bg-darker border border-gray-600/40 rounded text-gray-400 text-[0.5rem] cursor-pointer">
            <option value="nautical">Nautical</option>
            <option value="satellite">Satellite</option>
            <option value="dark">Dark</option>
          </select>
          <button
            onClick={() => setIsDrawingMode(!isDrawingMode)}
            className={`px-1.5 py-0.5 rounded text-[0.5rem] font-semibold cursor-pointer flex items-center gap-0.5 ${isDrawingMode ? 'bg-[var(--zone-color)] text-black' : 'bg-transparent text-[var(--zone-color)]'}`}
            style={{ border: `1px solid ${zoneStyle.color}60`, '--zone-color': zoneStyle.color }}
          >
            <Plus size={10} />
            {isDrawingMode ? 'DRAWING' : 'DRAW'}
          </button>
          <input type="file" ref={fileInputRef} accept=".geojson,.json" onChange={handleImportGeoJSON} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} title="Import GeoJSON" className="px-1.5 py-0.5 bg-transparent border border-gray-600/40 rounded text-gray-400 text-[0.5rem] cursor-pointer flex items-center gap-0.5">
            <Upload size={10} />
          </button>
          <button onClick={exportGeoJSON} title="Export GeoJSON" className="px-1.5 py-0.5 bg-transparent border border-gray-600/40 rounded text-gray-400 text-[0.5rem] cursor-pointer flex items-center gap-0.5">
            <Download size={10} />
          </button>
          {importError && (
            <div className="absolute top-full left-0 mt-1 px-2 py-1 bg-red-500/90 text-white text-[0.5rem] rounded whitespace-nowrap z-50">
              {importError}
            </div>
          )}
          <button onClick={clearZone} title="Clear all" className="px-1.5 py-0.5 bg-transparent border border-red-500/40 rounded text-red-500 text-[0.5rem] cursor-pointer">
            <Trash2 size={10} />
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="px-3 py-1.5 text-[0.55rem] text-gray-400" style={{ backgroundColor: `${zoneStyle.color}08`, borderBottom: `1px solid ${zoneStyle.color}20` }}>
        {zoneStyle.description}
      </div>

      {/* Leaflet Map */}
      <div className="flex-1 relative" style={{ minHeight: '250px' }}>
        <MapContainer center={center} zoom={7} style={{ height: '100%', width: '100%', minHeight: '250px', backgroundColor: '#0a1520' }} zoomControl>
          <TileLayer url={currentLayer.base} attribution={currentLayer.attribution} />
          {mapLayer === 'nautical' && currentLayer.seamark && <TileLayer url={currentLayer.seamark} />}
          <MapInvalidateSize />
          <MapClickHandler isDrawingMode={isDrawingMode} onAddPoint={addPoint} />
          <MapFitBounds key={missionType} bounds={allBoundsPoints} />

          {geometryType === 'zone' && points.length >= 3 && (
            <Polygon positions={points.map(p => [p.lat, p.lng])} pathOptions={{ color: zoneStyle.color, fillColor: zoneStyle.color, fillOpacity: zoneStyle.fillOpacity, weight: 2 }} />
          )}
          {geometryType === 'route' && waypoints.length >= 2 && (
            <Polyline positions={waypoints.map(p => [p.lat, p.lng])} pathOptions={{ color: zoneStyle.color, weight: 3, dashArray: '10, 5' }} />
          )}
          {geometryType === 'target' && targets.length >= 2 && (
            <Polygon positions={targets.map(t => [t.lat, t.lng])} pathOptions={{ color: zoneStyle.color, fillColor: zoneStyle.color, fillOpacity: 0.15, weight: 1, dashArray: '5, 5' }} />
          )}
          {geometryType === 'perimeter' && perimeterCenter && (
            <LeafletCircle center={[perimeterCenter.lat, perimeterCenter.lng]} radius={perimeterRadius * 1852} pathOptions={{ color: zoneStyle.color, fillColor: zoneStyle.color, fillOpacity: zoneStyle.fillOpacity, weight: 2, dashArray: '8, 4' }} />
          )}

          {geometryType === 'zone' && points.map((point, index) => (
            <DraggableMarker key={`zone-${index}`} position={point} index={index} color={zoneStyle.color} onDrag={updatePoint} />
          ))}
          {geometryType === 'route' && waypoints.map((wp, index) => (
            <Marker
              key={`wp-${index}`}
              position={[wp.lat, wp.lng]}
              icon={createWaypointIcon(wp.label, zoneStyle.color)}
              draggable
              eventHandlers={{ dragend: (e) => { const { lat, lng } = e.target.getLatLng(); updatePoint(index, { lat, lng }); } }}
            />
          ))}
          {geometryType === 'target' && targets.map((target, index) => (
            <Marker
              key={`target-${index}`}
              position={[target.lat, target.lng]}
              icon={createTargetIcon(target.label, target.type === 'primary')}
              draggable
              eventHandlers={{ dragend: (e) => { const { lat, lng } = e.target.getLatLng(); updatePoint(index, { lat, lng }); } }}
            />
          ))}
          {geometryType === 'target' && staging && (
            <Marker
              position={[staging.lat, staging.lng]}
              icon={createStagingIcon()}
              draggable
              eventHandlers={{ dragend: (e) => { const { lat, lng } = e.target.getLatLng(); updateStaging({ lat, lng }); } }}
            />
          )}
          {geometryType === 'perimeter' && perimeterCenter && (
            <Marker
              position={[perimeterCenter.lat, perimeterCenter.lng]}
              icon={createDefenseIcon(config.assetName)}
              draggable
              eventHandlers={{ dragend: (e) => { const { lat, lng } = e.target.getLatLng(); updatePoint(0, { lat, lng }); } }}
            />
          )}
        </MapContainer>

        {isDrawingMode && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded text-black text-[0.55rem] font-semibold z-[1000]" style={{ backgroundColor: zoneStyle.color }}>
            {getDrawingHint()}
          </div>
        )}
        {geometryType === 'target' && !staging && targets.length > 0 && (
          <button
            onClick={() => {
              const avgLat = targets.reduce((s, t) => s + t.lat, 0) / targets.length;
              const avgLng = targets.reduce((s, t) => s + t.lng, 0) / targets.length;
              setZoneConfig({ ...config, staging: { lat: avgLat - 0.5, lng: avgLng - 0.5, label: 'STAGING' } });
            }}
            className="absolute bottom-2 right-2 px-2 py-1.5 bg-green-500 border-0 rounded text-black text-[0.55rem] font-semibold cursor-pointer z-[1000] flex items-center gap-1"
          >
            <Plus size={12} /> Add Staging Area
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-border-subtle bg-darkest">
        <div className="flex items-center gap-2 mb-1.5">
          <input
            type="text"
            value={config.name || ''}
            onChange={(e) => setZoneConfig({ ...config, name: e.target.value })}
            placeholder={geometryType === 'route' ? 'Route Name' : geometryType === 'perimeter' ? 'Asset Name' : 'Zone Name'}
            className="flex-1 px-2 py-1 bg-darker border border-gray-600/40 rounded text-gray-50 text-[0.6rem]"
          />
          {geometryType === 'perimeter' && (
            <input
              type="number"
              value={perimeterRadius}
              onChange={(e) => setZoneConfig({ ...config, radius: Math.max(5, Math.min(100, Number(e.target.value))) })}
              className="w-[60px] px-2 py-1 bg-darker border border-gray-600/40 rounded text-gray-50 text-[0.6rem] text-center"
            />
          )}
        </div>
        <div className="flex flex-wrap gap-1 max-h-[60px] overflow-y-auto">
          {geometryType === 'zone' && points.map((point, index) => (
            <div key={index} className="flex items-center gap-1 px-1.5 py-0.5 bg-darker border border-border-subtle rounded text-[0.5rem] text-gray-400">
              <span className="font-semibold" style={{ color: zoneStyle.color }}>{index + 1}</span>
              <span>{point.lat.toFixed(3)}°, {point.lng.toFixed(3)}°</span>
              {points.length > 3 && (
                <button onClick={() => removePoint(index)} className="p-0 bg-transparent border-0 text-red-500 cursor-pointer flex"><X size={8} /></button>
              )}
            </div>
          ))}
          {geometryType === 'route' && waypoints.map((wp, index) => (
            <div key={index} className="flex items-center gap-1 px-1.5 py-0.5 bg-darker rounded text-[0.5rem] text-gray-400" style={{ border: `1px solid ${zoneStyle.color}40` }}>
              <span className="font-bold text-[0.55rem]" style={{ color: zoneStyle.color }}>{wp.label}</span>
              <span>{wp.lat.toFixed(3)}°, {wp.lng.toFixed(3)}°</span>
              {index > 0 && index < waypoints.length - 1 && (
                <button onClick={() => removePoint(index)} className="p-0 bg-transparent border-0 text-red-500 cursor-pointer flex"><X size={8} /></button>
              )}
            </div>
          ))}
          {geometryType === 'route' && missionType === 'ESCORT' && (
            <div className="w-full mt-1 px-1.5 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded">
              <div className="flex items-center gap-1 mb-1">
                <Shield size={10} color="#eab308" />
                <span className="text-yellow-500 text-[0.5rem] font-semibold">ESCORTED VESSELS</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {(config.escortedVessels || []).map((vessel, idx) => (
                  <div key={idx} className="flex items-center gap-1 px-1.5 py-0.5 bg-darker border border-yellow-500/40 rounded text-[0.5rem] text-gray-50">
                    <Ship size={8} color="#eab308" />
                    <span>{vessel}</span>
                    <button onClick={() => { const updated = (config.escortedVessels || []).filter((_, i) => i !== idx); setZoneConfig({ ...config, escortedVessels: updated }); }} className="p-0 bg-transparent border-0 text-red-500 cursor-pointer flex"><X size={8} /></button>
                  </div>
                ))}
                <input
                  type="text"
                  placeholder="Add vessel (press Enter)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      const updated = [...(config.escortedVessels || []), e.target.value.trim()];
                      setZoneConfig({ ...config, escortedVessels: updated });
                      e.target.value = '';
                    }
                  }}
                  className="flex-1 min-w-[100px] px-1.5 py-0.5 bg-darker border border-dashed border-yellow-500/40 rounded text-gray-50 text-[0.5rem]"
                />
              </div>
            </div>
          )}
          {geometryType === 'target' && targets.map((target, index) => (
            <div key={index} className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[0.5rem] text-gray-400 ${target.type === 'primary' ? 'bg-red-500/20 border border-red-500' : 'bg-darker border border-border-subtle'}`}>
              <span className={`font-bold ${target.type === 'primary' ? 'text-red-500' : 'text-orange-500'}`}>{target.label}</span>
              <span>{target.lat.toFixed(3)}°, {target.lng.toFixed(3)}°</span>
              <button onClick={() => { const newTargets = [...targets]; newTargets[index] = { ...newTargets[index], type: newTargets[index].type === 'primary' ? 'secondary' : 'primary' }; setZoneConfig({ ...config, targets: newTargets }); }} className="p-0 bg-transparent border-0 text-yellow-400 cursor-pointer flex" title="Toggle primary/secondary"><Target size={8} /></button>
              <button onClick={() => removePoint(index)} className="p-0 bg-transparent border-0 text-red-500 cursor-pointer flex"><X size={8} /></button>
            </div>
          ))}
          {geometryType === 'perimeter' && perimeterCenter && (
            <div className="w-full flex flex-col gap-1">
              <div className="flex items-center gap-2 px-1.5 py-0.5 bg-darker rounded text-[0.5rem] text-gray-400" style={{ border: `1px solid ${zoneStyle.color}40` }}>
                <span className="font-semibold" style={{ color: zoneStyle.color }}>LOITER CENTER</span>
                <span>{perimeterCenter.lat.toFixed(3)}°, {perimeterCenter.lng.toFixed(3)}°</span>
                <span style={{ color: zoneStyle.color }}>|</span>
                <span className="font-semibold" style={{ color: zoneStyle.color }}>RADIUS</span>
                <span>{perimeterRadius} nm</span>
              </div>
              <div className="flex items-center gap-2 px-1.5 py-1 bg-orange-500/10 border border-orange-500/30 rounded text-[0.5rem]">
                <span className="text-orange-500 font-semibold">LOITER PATTERN</span>
                <select value={config.loiterPattern || 'racetrack'} onChange={(e) => setZoneConfig({ ...config, loiterPattern: e.target.value })} className="px-1 py-0.5 bg-darker border border-orange-500/40 rounded text-gray-50 text-[0.5rem] cursor-pointer">
                  <option value="racetrack">Racetrack</option>
                  <option value="figure8">Figure-8</option>
                  <option value="expanding">Expanding Square</option>
                  <option value="sector">Sector Search</option>
                  <option value="random">Random Walk</option>
                </select>
                <span className="text-gray-400 text-[0.45rem] italic">Vessels move within collection box</span>
              </div>
            </div>
          )}
          {(geometryType === 'perimeter' || geometryType === 'zone' || geometryType === 'target') && (
            <div className="w-full mt-1 px-1.5 py-1.5 bg-lime-brand/[0.08] border border-lime-brand/30 rounded">
              <div className="flex items-center gap-1 mb-1">
                <Users size={10} color="#cbfd00" />
                <span className="text-lime-brand text-[0.5rem] font-semibold">SWARM DEPLOYMENT</span>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <div className="flex items-center gap-1">
                  <span className="text-gray-400 text-[0.45rem]">Vessels:</span>
                  <input type="number" min="1" max="20" value={config.swarmSize || 1} onChange={(e) => setZoneConfig({ ...config, swarmSize: Math.max(1, Math.min(20, Number(e.target.value))) })} className="w-10 px-1 py-0.5 bg-darker border border-lime-brand/40 rounded text-gray-50 text-[0.5rem] text-center" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-400 text-[0.45rem]">Formation:</span>
                  <select value={config.swarmFormation || 'distributed'} onChange={(e) => setZoneConfig({ ...config, swarmFormation: e.target.value })} className="px-1 py-0.5 bg-darker border border-lime-brand/40 rounded text-gray-50 text-[0.5rem] cursor-pointer">
                    <option value="distributed">Distributed Coverage</option>
                    <option value="overlapping">Overlapping Sectors</option>
                    <option value="picket">Picket Line</option>
                    <option value="rotating">Rotating Stations</option>
                    <option value="layered">Layered Defense</option>
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-400 text-[0.45rem]">Spacing:</span>
                  <select value={config.swarmSpacing || 'auto'} onChange={(e) => setZoneConfig({ ...config, swarmSpacing: e.target.value })} className="px-1 py-0.5 bg-darker border border-lime-brand/40 rounded text-gray-50 text-[0.5rem] cursor-pointer">
                    <option value="auto">Auto (sensor range)</option>
                    <option value="tight">Tight (&lt;5nm)</option>
                    <option value="standard">Standard (5-15nm)</option>
                    <option value="wide">Wide (15-30nm)</option>
                    <option value="max">Max Coverage (&gt;30nm)</option>
                  </select>
                </div>
              </div>
              {(config.swarmSize || 1) > 1 && (
                <div className="mt-1 text-[0.45rem] text-gray-400 italic">
                  {config.swarmSize} vessels with {config.swarmFormation || 'distributed'} formation provides
                  {config.swarmFormation === 'overlapping' ? ' redundant sensor coverage' :
                   config.swarmFormation === 'picket' ? ' early warning barrier' :
                   config.swarmFormation === 'rotating' ? ' 24/7 persistent presence' :
                   config.swarmFormation === 'layered' ? ' defense in depth' :
                   ' maximum area coverage'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapZoneEditor;

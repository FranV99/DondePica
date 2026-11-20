// Configuración de mapas base y vista inicial
export const CENTRO = [40.1, -3.6]
export const MAPAS_BASE = {
  topo_gris: {
    nombre: 'Topográfico gris',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attr: 'Tiles &copy; Esri',
    clase: 'tiles-gris',
  },
  topo: {
    nombre: 'Topográfico',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attr: 'Tiles &copy; Esri',
  },
  osm: {
    nombre: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attr: '&copy; colaboradores de OpenStreetMap',
  },
  satelite: {
    nombre: 'Satélite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attr: 'Imagery &copy; Esri',
  },
}

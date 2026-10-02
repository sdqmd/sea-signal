import { useEffect, useMemo, useRef, useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import type { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl'
import type * as GeoJSON from 'geojson'
import mapWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, CarFront, Compass, Crosshair, ExternalLink,
  Heart, Hotel, Layers3, MapPin, Minus, Navigation, Plus, Search, ShieldCheck,
  SlidersHorizontal, Waves, X,
} from 'lucide-react'
import { muisUrl, places, type Place } from './places'
import routeData from './routes.json'

maplibregl.setWorkerUrl(mapWorkerUrl)

type Filter = 'All picks' | 'À la carte' | 'Buffet' | 'By the water'
type Sort = 'Our picks' | 'Nearest to hotel'
type Route = { distanceMeters: number; coordinates: number[][] }
const routes = routeData as Record<string, Route>
const hotel = {
  name: 'Rendezvous Hotel Singapore',
  address: '9 Bras Basah Road, Singapore 189559',
  lng: 103.8493161247068,
  lat: 1.298583008114835,
}
const initialCenter: [number, number] = [103.872, 1.308]
const filters: Filter[] = ['All picks', 'À la carte', 'Buffet', 'By the water']
const jumps = [
  { label: 'Top pick', id: 'mutiara-geylang' },
  { label: 'Joo Chiat', id: 'home-of-seafood' },
  { label: 'Jewel', id: 'sampanman-jewel' },
  { label: 'West side', id: 'rasa-jurong' },
  { label: 'Orchard', id: 'straits-kitchen' },
]

function featureCollection(items: Place[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: 'FeatureCollection',
    features: items.map((place) => ({
      type: 'Feature',
      properties: { id: place.id, rank: String(place.rank) },
      geometry: { type: 'Point', coordinates: [place.lng, place.lat] },
    })),
  }
}

function routeFeature(place: Place | null): GeoJSON.FeatureCollection<GeoJSON.LineString> {
  const route = place ? routes[place.id] : null
  return {
    type: 'FeatureCollection',
    features: route && place ? [{
      type: 'Feature', properties: { id: place.id },
      geometry: { type: 'LineString', coordinates: [[hotel.lng, hotel.lat], ...route.coordinates, [place.lng, place.lat]] },
    }] : [],
  }
}

function distanceLabel(meters: number) {
  return meters < 1000 ? `${meters} m` : `${(meters / 1000).toFixed(1)} km`
}

function addMapLayers(map: MapLibreMap) {
  const firstLabel = map.getStyle().layers.find((layer) => layer.type === 'symbol')?.id
  if (map.getLayer('building')) map.setLayoutProperty('building', 'visibility', 'none')
  if (map.getLayer('building-3d')) map.setLayoutProperty('building-3d', 'visibility', 'none')
  map.addLayer({
    id: 'signal-buildings', type: 'fill-extrusion', source: 'openmaptiles', 'source-layer': 'building', minzoom: 12,
    paint: {
      'fill-extrusion-color': ['interpolate', ['linear'], ['get', 'render_height'], 0, '#1b414a', 25, '#27606b', 100, '#337c84'],
      'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 12, 0, 13.3, ['coalesce', ['get', 'render_height'], 8]],
      'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
      'fill-extrusion-opacity': 0.84,
    },
  }, firstLabel)
  map.addSource('route', { type: 'geojson', data: routeFeature(null) })
  map.addLayer({ id: 'route-glow', type: 'line', source: 'route', paint: {
    'line-color': '#83e5cd', 'line-width': 18, 'line-opacity': 0.18, 'line-blur': 7,
  } })
  map.addLayer({ id: 'route-casing', type: 'line', source: 'route', layout: {
    'line-cap': 'round', 'line-join': 'round',
  }, paint: { 'line-color': '#0b2a31', 'line-width': 9, 'line-opacity': 0.9 } })
  map.addLayer({ id: 'route-line', type: 'line', source: 'route', layout: {
    'line-cap': 'round', 'line-join': 'round',
  }, paint: { 'line-color': '#95efd6', 'line-width': 4, 'line-opacity': 0.98 } })
  map.addSource('hotel', { type: 'geojson', data: {
    type: 'Feature', properties: { name: hotel.name },
    geometry: { type: 'Point', coordinates: [hotel.lng, hotel.lat] },
  } })
  map.addLayer({ id: 'hotel-glow', type: 'circle', source: 'hotel', paint: {
    'circle-radius': 27, 'circle-color': '#8ff1d7', 'circle-opacity': 0.18, 'circle-blur': 0.4,
  } })
  map.addLayer({ id: 'hotel-pin', type: 'circle', source: 'hotel', paint: {
    'circle-radius': 13, 'circle-color': '#123e42', 'circle-stroke-color': '#9af2d9', 'circle-stroke-width': 3,
  } })
  map.addLayer({ id: 'hotel-core', type: 'symbol', source: 'hotel', layout: {
    'text-field': 'H', 'text-font': ['Noto Sans Bold'], 'text-size': 13, 'text-allow-overlap': true,
  }, paint: { 'text-color': '#e7fff3' } })
  map.addLayer({ id: 'hotel-label', type: 'symbol', source: 'hotel', layout: {
    'text-field': 'HOTEL', 'text-font': ['Noto Sans Bold'], 'text-size': 10,
    'text-offset': [0, 2.5], 'text-allow-overlap': true,
  }, paint: { 'text-color': '#c4ffea', 'text-halo-color': '#09252c', 'text-halo-width': 2 } })
  map.addSource('places', { type: 'geojson', data: featureCollection(places) })
  map.addLayer({ id: 'pin-glow', type: 'circle', source: 'places', paint: {
    'circle-radius': 23, 'circle-color': '#ffad7b', 'circle-opacity': 0.18, 'circle-blur': 0.45,
  } })
  map.addLayer({ id: 'pins', type: 'circle', source: 'places', paint: {
    'circle-radius': 15, 'circle-color': '#ffad7b', 'circle-stroke-color': '#fff2dd', 'circle-stroke-width': 2.3,
  } })
  map.addLayer({ id: 'pin-rank', type: 'symbol', source: 'places', layout: {
    'text-field': ['get', 'rank'], 'text-font': ['Noto Sans Bold'], 'text-size': 12,
  }, paint: { 'text-color': '#203840' } })
  map.addSource('selected', { type: 'geojson', data: featureCollection([]) })
  map.addLayer({ id: 'selected-halo', type: 'circle', source: 'selected', paint: {
    'circle-radius': 32, 'circle-color': '#ffad7b', 'circle-opacity': 0.25, 'circle-blur': 0.3,
  } })
  map.addLayer({ id: 'selected-ring', type: 'circle', source: 'selected', paint: {
    'circle-radius': 19, 'circle-color': '#ffbc94', 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 3,
  } })
  map.addLayer({ id: 'selected-rank', type: 'symbol', source: 'selected', layout: {
    'text-field': ['get', 'rank'], 'text-font': ['Noto Sans Bold'], 'text-size': 14,
  }, paint: { 'text-color': '#203840' } })
  for (const layer of ['hotel-glow', 'hotel-pin', 'hotel-core', 'hotel-label']) map.moveLayer(layer)
}

function Logo() {
  return <div className="brand-mark"><Waves size={27} strokeWidth={2.2} /><span className="brand-spark" /></div>
}

function App() {
  const mapNode = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const searchInput = useRef<HTMLInputElement>(null)
  const [mapReady, setMapReady] = useState(false)
  const [mapError, setMapError] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('All picks')
  const [sort, setSort] = useState<Sort>('Our picks')
  const [selectedId, setSelectedId] = useState<string | null>(places[0].id)
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('sea-signal-favorites') || '[]') } catch { return [] }
  })
  const [onlyFavorites, setOnlyFavorites] = useState(false)
  const [areaMode, setAreaMode] = useState(false)
  const [viewport, setViewport] = useState<[number, number]>(initialCenter)
  const [bounds, setBounds] = useState<maplibregl.LngLatBounds | null>(null)
  const [is3D, setIs3D] = useState(true)
  const [activeJump, setActiveJump] = useState('')
  const [mobileListOpen, setMobileListOpen] = useState(false)
  const selected = places.find((place) => place.id === selectedId) || null

  useEffect(() => {
    try { localStorage.setItem('sea-signal-favorites', JSON.stringify(favorites)) } catch { /* saving is optional */ }
  }, [favorites])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setMobileListOpen(true)
        window.setTimeout(() => searchInput.current?.focus(), 50)
      }
      if (event.key === 'Escape') { searchInput.current?.blur(); setSelectedId(null) }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!mapNode.current || mapRef.current) return
    const map = new maplibregl.Map({
      container: mapNode.current,
      style: 'https://tiles.openfreemap.org/styles/dark',
      center: initialCenter, zoom: 11.5, pitch: 57, bearing: -18, minZoom: 10, maxZoom: 18,
      attributionControl: false,
    })
    mapRef.current = map
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')
    map.on('load', () => { addMapLayers(map); setMapReady(true) })
    map.on('error', (event) => { if (event.error?.message?.includes('style')) setMapError(true) })
    map.on('moveend', () => {
      const center = map.getCenter()
      setViewport([center.lng, center.lat])
      setBounds(map.getBounds())
    })
    const onPinClick = (event: maplibregl.MapLayerMouseEvent) => {
      const id = event.features?.[0]?.properties?.id as string | undefined
      const place = places.find((item) => item.id === id)
      if (place) selectPlace(place)
    }
    for (const layer of ['pins', 'pin-rank', 'selected-ring', 'selected-rank']) {
      map.on('click', layer, onPinClick)
      map.on('mouseenter', layer, () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', layer, () => { map.getCanvas().style.cursor = '' })
    }
    return () => { map.remove(); mapRef.current = null }
  }, [])

  const visible = useMemo(() => places
    .filter((place) => filter === 'All picks' || (filter === 'By the water' ? place.waterfront : place.format === filter))
    .filter((place) => !onlyFavorites || favorites.includes(place.id))
    .filter((place) => !search.trim() || `${place.name} ${place.area} ${place.dish} ${place.address}`.toLowerCase().includes(search.trim().toLowerCase()))
    .filter((place) => !areaMode || !bounds || bounds.contains([place.lng, place.lat]))
    .sort((a, b) => sort === 'Our picks' ? a.rank - b.rank : routes[a.id].distanceMeters - routes[b.id].distanceMeters),
  [filter, onlyFavorites, favorites, search, areaMode, bounds, sort])

  useEffect(() => {
    if (mapReady && mapRef.current) (mapRef.current.getSource('places') as GeoJSONSource).setData(featureCollection(visible))
  }, [mapReady, visible])
  useEffect(() => {
    if (mapReady && mapRef.current) (mapRef.current.getSource('selected') as GeoJSONSource).setData(featureCollection(selected ? [selected] : []))
  }, [mapReady, selected])
  useEffect(() => {
    if (mapReady && mapRef.current) (mapRef.current.getSource('route') as GeoJSONSource).setData(routeFeature(selected))
  }, [mapReady, selected])
  useEffect(() => {
    if (mapReady) fitRoute(places[0], 0)
  }, [mapReady])

  function fitRoute(place: Place, duration = 1050) {
    const map = mapRef.current
    if (!map) return
    const trip = routes[place.id]
    const routeBounds = new maplibregl.LngLatBounds([hotel.lng, hotel.lat], [hotel.lng, hotel.lat])
    trip.coordinates.forEach((point) => routeBounds.extend(point as [number, number]))
    routeBounds.extend([place.lng, place.lat])
    const mobile = window.innerWidth <= 700
    map.fitBounds(routeBounds, {
      padding: mobile ? { top: 150, bottom: 480, left: 26, right: 26 } : { top: 165, bottom: 250, left: 85, right: 85 },
      maxZoom: 15.4, duration, essential: true,
    })
  }

  function selectPlace(place: Place) {
    setSelectedId(place.id)
    setMobileListOpen(false)
    fitRoute(place)
  }
  function toggleFavorite(id: string) {
    setFavorites((previous) => previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id])
  }
  function toggle3D() {
    const next = !is3D
    setIs3D(next)
    mapRef.current?.easeTo({ pitch: next ? 57 : 0, bearing: next ? -18 : 0, duration: 650 })
    if (mapRef.current?.getLayer('signal-buildings')) mapRef.current.setLayoutProperty('signal-buildings', 'visibility', next ? 'visible' : 'none')
  }
  function resetFilters() {
    setSearch(''); setFilter('All picks'); setOnlyFavorites(false); setAreaMode(false)
  }

  const countLabel = `${visible.length} ${visible.length === 1 ? 'place' : 'places'}`
  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><Logo /><div className="brand-name">SEA<span>SIGNAL</span><small>THE CHILLI CRAB HUNT</small></div></div>
      <div className="topbar-center"><span className="topbar-line" /><span>HALAL CHILLI CRAB FROM RENDEZVOUS HOTEL</span><span className="topbar-line" /></div>
      <div className="topbar-right"><span className="live-dot" /><span>CURATED FIELD GUIDE</span><span className="topbar-divider" /><span className="topbar-coords">SINGAPORE · 01</span></div>
    </header>
    <main className="workspace">
      <aside className={`sidebar ${mobileListOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-scroll">
          <div className="sidebar-intro">
            <div className="eyebrow"><span className="eyebrow-line" /> THE SINGAPORE CRAB TRAIL</div>
            <h1>Halal chilli crab<br /><em>worth hunting.</em></h1>
            <p>Seven researched spots. Every pin has a chilli crab dish and an outlet found in the MUIS halal register.</p>
          </div>
          <div className="trust-strip"><ShieldCheck size={17} /><span>OUTLETS CHECKED IN MUIS REGISTER</span><a href={muisUrl} target="_blank" rel="noreferrer" aria-label="Open MUIS halal register"><ArrowUpRight size={16} /></a></div>
          <button className="start-point" onClick={() => fitRoute(selected || places[0])} aria-label="Show route from Rendezvous Hotel Singapore"><span className="start-icon"><Hotel size={20} /></span><span className="start-copy"><small>STARTING POINT · FIXED</small><strong>Rendezvous Hotel Singapore</strong><span>9 Bras Basah Road, Singapore 189559</span></span><ArrowUpRight size={16} className="start-arrow" /></button>
          <div className="search-wrap">
            <Search size={19} strokeWidth={2} />
            <input ref={searchInput} aria-label="Search chilli crab places or areas" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search places, dishes, areas..." />
            {search ? <button className="input-clear" aria-label="Clear search" onClick={() => setSearch('')}><X size={16} /></button> : <kbd>⌘ K</kbd>}
          </div>
          <div className="filters-title"><span>CHOOSE YOUR CRAB CRAWL</span><SlidersHorizontal size={15} /></div>
          <div className="filter-row">{filters.map((item) => <button key={item} className={`filter-chip ${filter === item ? 'active' : ''}`} onClick={() => setFilter(item)}>{item}</button>)}</div>
          <div className="discover-row">
            <div><span className="section-kicker">THE SHORTLIST</span><h2>{onlyFavorites ? 'Saved spots' : 'Crab picks'}<span className="result-count">{countLabel}</span></h2></div>
            <button className={`saved-toggle ${onlyFavorites ? 'active' : ''}`} onClick={() => setOnlyFavorites(!onlyFavorites)} title={onlyFavorites ? 'Show all picks' : 'Show saved picks'} aria-label={onlyFavorites ? 'Show all picks' : 'Show saved picks'}><Heart size={18} fill={onlyFavorites ? 'currentColor' : 'none'} /></button>
          </div>
          <div className="sort-row"><span>ORDERED BY</span><button onClick={() => setSort(sort === 'Our picks' ? 'Nearest to hotel' : 'Our picks')}>{sort} <ArrowDownRight size={14} /></button></div>
          <div className="results-list">
            {visible.length ? visible.map((place) => <article key={place.id} className={`restaurant-card crab-card ${selectedId === place.id ? 'selected' : ''}`}>
              <button className="card-main" onClick={() => selectPlace(place)} aria-label={`View ${place.name} on map`}>
                <div className="card-index">{String(place.rank).padStart(2, '0')}</div>
                <div className="card-icon crab-icon" aria-hidden="true">🦀</div>
                <div className="card-body"><div className="card-category">{place.badge} <span>·</span> {place.area}</div><h3>{place.name}</h3><div className="card-dish">{place.dish}</div><div className="card-distance"><CarFront size={13} /> {distanceLabel(routes[place.id].distanceMeters)} drive from hotel</div><div className="card-location"><ShieldCheck size={13} /> MUIS-listed outlet <span>·</span> {place.format}</div></div>
                <ArrowUpRight className="card-arrow" size={19} />
              </button>
              <button className={`card-heart ${favorites.includes(place.id) ? 'is-saved' : ''}`} onClick={() => toggleFavorite(place.id)} aria-label={`${favorites.includes(place.id) ? 'Remove' : 'Save'} ${place.name}`}><Heart size={16} fill={favorites.includes(place.id) ? 'currentColor' : 'none'} /></button>
            </article>) : <div className="empty-state"><span className="empty-crab">🦀</span><h3>No crabs in this view</h3><p>Try another area or reset the search.</p><button onClick={resetFilters}>Reset filters <ArrowRight size={16} /></button></div>}
          </div>
        </div>
        <div className="sidebar-footer"><span className="footer-pulse" /><span>MUIS REGISTER CHECKED 02 OCT 2026</span><a href={muisUrl} target="_blank" rel="noreferrer">RECHECK STATUS <ArrowUpRight size={12} /></a></div>
      </aside>
      <section className="map-stage" aria-label="Interactive map of halal chilli crab restaurants in Singapore">
        <div ref={mapNode} className="map-canvas" />
        {mapError && <div className="map-error">Map tiles are unavailable right now. The researched shortlist remains searchable.</div>}
        <div className="map-grid" /><div className="map-vignette" />
        <div className="map-top-left"><div className="map-top-eyebrow"><span className="map-top-square" /> SINGAPORE / THE CRAB TRAIL</div><div className="map-title">The chilli crab <em>trail.</em></div><div className="map-subtitle">Driving routes from Rendezvous Hotel Singapore.</div></div>
        <div className="map-top-right"><span className="digital-label"><span className="mini-blink" /> DIGITAL TWIN VIEW</span><span className="map-mode">{is3D ? '3D' : '2D'} MODE</span></div>
        <div className="neighborhood-bar"><div className="neighborhood-label"><Compass size={15} /> JUMP TO</div>{jumps.map((jump) => <button key={jump.id} className={activeJump === jump.id ? 'active' : ''} onClick={() => { const place = places.find((item) => item.id === jump.id)!; setActiveJump(jump.id); setAreaMode(false); selectPlace(place) }}>{jump.label}</button>)}</div>
        <div className="map-controls"><button title="Zoom in" aria-label="Zoom in" onClick={() => mapRef.current?.zoomIn()}><Plus size={20} /></button><button title="Zoom out" aria-label="Zoom out" onClick={() => mapRef.current?.zoomOut()}><Minus size={20} /></button><span className="control-separator" /><button title="Reset north" aria-label="Reset north" onClick={() => mapRef.current?.easeTo({ bearing: 0, duration: 600 })}><Navigation size={19} /></button><button className={is3D ? 'control-active' : ''} title="Toggle 3D buildings" aria-label="Toggle 3D buildings" onClick={toggle3D}><Layers3 size={20} /></button></div>
        <div className="map-bottom-left"><div className="coordinate-readout"><span>MAP CENTRE</span><strong>{viewport[1].toFixed(4)}° N &nbsp; {viewport[0].toFixed(4)}° E</strong></div><div className="signal-dashes"><i /><i /><i /><i /><i /></div></div>
        <button className={`area-button ${areaMode ? 'active' : ''}`} onClick={() => { setAreaMode(!areaMode); setBounds(mapRef.current?.getBounds() || null) }}><Crosshair size={17} />{areaMode ? 'Showing this area' : 'Search this area'}<ArrowDownRight size={17} /></button>
        {selected && <div className="detail-card crab-detail">
          <button className="detail-close" aria-label="Close restaurant details" onClick={() => setSelectedId(null)}><X size={18} /></button>
          <div className="detail-art"><div className="detail-art-orbit orbit-one" /><div className="detail-art-orbit orbit-two" /><span className="detail-crab" aria-hidden="true">🦀</span><span>SEA / SIGNAL</span></div>
          <div className="detail-content"><div className="detail-eyebrow"><span className="detail-dot" /> {selected.badge.toUpperCase()} · {selected.area.toUpperCase()}</div><h2>{selected.name}</h2><div className="route-distance"><CarFront size={17} /><strong>{distanceLabel(routes[selected.id].distanceMeters)}</strong><span>driving from Rendezvous Hotel</span></div><p className="detail-dish">{selected.dish}</p><p className="detail-why">{selected.why}</p><div className="detail-proof"><ShieldCheck size={14} /> MUIS listing {selected.certificate} <span>· checked 02 Oct 2026</span></div><div className="detail-actions"><a className="direction-button" href={`https://www.google.com/maps/dir/?api=1&origin=${hotel.lat},${hotel.lng}&destination=${selected.lat},${selected.lng}&travelmode=driving`} target="_blank" rel="noreferrer">Hotel → restaurant <Navigation size={15} /></a><a className="osm-button" href={selected.menuUrl} target="_blank" rel="noreferrer">Dish source <ExternalLink size={14} /></a><a className="osm-button" href={muisUrl} target="_blank" rel="noreferrer">Check MUIS <ExternalLink size={14} /></a><button className={`detail-save ${favorites.includes(selected.id) ? 'active' : ''}`} title="Save place" aria-label="Save place" onClick={() => toggleFavorite(selected.id)}><Heart size={17} fill={favorites.includes(selected.id) ? 'currentColor' : 'none'} /></button></div></div>
        </div>}
        <div className="map-attribution-note">MAP DATA © OPENSTREETMAP CONTRIBUTORS <span>·</span> TILES BY OPENFREEMAP <span>·</span> ROUTES BY OSRM</div>
      </section>
    </main>
    <button className="mobile-list-toggle" onClick={() => setMobileListOpen(!mobileListOpen)}>{mobileListOpen ? <><X size={17} /> Close list</> : <><MapPin size={17} /> Explore {countLabel}</>}</button>
  </div>
}

export default App

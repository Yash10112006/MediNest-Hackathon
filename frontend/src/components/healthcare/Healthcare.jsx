// frontend/src/pages/patient/Healthcare.jsx

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    MapPin,
    Search,
    Hospital,
    Stethoscope,
    Pill,
    Ambulance,
    Phone,
    Navigation,
    Star,
    Clock,
    X,
    LocateFixed,
    Map,
    List,
    ChevronRight,
    ShieldCheck
} from 'lucide-react'

import {
    GoogleMap,
    MarkerF,
    InfoWindowF,
    useLoadScript
} from '@react-google-maps/api'

const GOOGLE_MAPS_API_KEY =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

const mapContainerStyle = {
    width: '100%',
    height: '100%'
}

const defaultCenter = {
    lat: 20.5937,
    lng: 78.9629
}

const healthcareFacilities = [
    {
        id: 'h001',
        name: 'District Civil Hospital',
        type: 'hospital',
        distance: '1.2 km',
        rating: 4.6,
        contact: '+919876543210',
        address: 'Main Road, District Medical Campus',
        coordinates: {
            lat: 20.5937,
            lng: 78.9629
        }
    },
    {
        id: 'h002',
        name: 'MediNest Primary Care Clinic',
        type: 'doctor',
        distance: '2.1 km',
        rating: 4.8,
        contact: '+919876543211',
        address: 'Village Health Centre, Main Bazaar',
        coordinates: {
            lat: 20.5995,
            lng: 78.9565
        }
    },
    {
        id: 'h003',
        name: 'Jan Aushadhi Pharmacy',
        type: 'pharmacy',
        distance: '1.7 km',
        rating: 4.5,
        contact: '+919876543212',
        address: 'Near Bus Stand, Main Market',
        coordinates: {
            lat: 20.5885,
            lng: 78.9682
        }
    },
    {
        id: 'h004',
        name: '24x7 Emergency Care Centre',
        type: 'emergency',
        distance: '3.4 km',
        rating: 4.7,
        contact: '+919876543213',
        address: 'Highway Road, Emergency Medical Complex',
        coordinates: {
            lat: 20.6018,
            lng: 78.9762
        }
    },
    {
        id: 'h005',
        name: 'Rural Health Clinic',
        type: 'doctor',
        distance: '4.2 km',
        rating: 4.4,
        contact: '+919876543214',
        address: 'Gram Panchayat Road',
        coordinates: {
            lat: 20.5821,
            lng: 78.9475
        }
    },
    {
        id: 'h006',
        name: 'LifeCare Medical Store',
        type: 'pharmacy',
        distance: '2.8 km',
        rating: 4.3,
        contact: '+919876543215',
        address: 'Gandhi Chowk, Market Road',
        coordinates: {
            lat: 20.6074,
            lng: 78.9518
        }
    }
]

const facilityTypes = {
    all: {
        label: 'All',
        icon: MapPin
    },

    hospital: {
        label: 'Hospitals',
        icon: Hospital
    },

    doctor: {
        label: 'Doctors',
        icon: Stethoscope
    },

    pharmacy: {
        label: 'Pharmacies',
        icon: Pill
    },

    emergency: {
        label: 'Emergency',
        icon: Ambulance
    }
}

function getFacilityIcon(type) {
    switch (type) {
        case 'hospital':
            return Hospital

        case 'doctor':
            return Stethoscope

        case 'pharmacy':
            return Pill

        case 'emergency':
            return Ambulance

        default:
            return MapPin
    }
}

function getFacilityLabel(type) {
    return facilityTypes[type]?.label || 'Healthcare'
}

function getFacilityStyles(type) {
    switch (type) {
        case 'hospital':
            return {
                wrapper:
                    'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-900',
                icon:
                    'text-teal-600 dark:text-teal-400'
            }

        case 'doctor':
            return {
                wrapper:
                    'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900',
                icon:
                    'text-indigo-600 dark:text-indigo-400'
            }

        case 'pharmacy':
            return {
                wrapper:
                    'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900',
                icon:
                    'text-cyan-600 dark:text-cyan-400'
            }

        case 'emergency':
            return {
                wrapper:
                    'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900',
                icon:
                    'text-rose-600 dark:text-rose-400'
            }

        default:
            return {
                wrapper:
                    'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
                icon:
                    'text-slate-500'
            }
    }
}

function getDirectionsUrl(coordinates) {
    return `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`
}

export default function Healthcare() {
    console.log('🔥 NEW HEALTHCARE PAGE LOADED')
    const [selectedType, setSelectedType] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedFacility, setSelectedFacility] = useState(null)
    const [viewMode, setViewMode] = useState('split')
    const [map, setMap] = useState(null)

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: GOOGLE_MAPS_API_KEY
    })

    const filteredFacilities = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()

        return healthcareFacilities.filter((facility) => {
            const matchesType =
                selectedType === 'all' ||
                facility.type === selectedType

            const matchesSearch =
                !query ||
                facility.name.toLowerCase().includes(query) ||
                facility.address.toLowerCase().includes(query) ||
                facility.type.toLowerCase().includes(query)

            return matchesType && matchesSearch
        })
    }, [selectedType, searchQuery])

    const handleMapLoad = (mapInstance) => {
        setMap(mapInstance)

        if (
            window.google &&
            filteredFacilities.length > 0
        ) {
            const bounds =
                new window.google.maps.LatLngBounds()

            filteredFacilities.forEach((facility) => {
                bounds.extend(facility.coordinates)
            })

            mapInstance.fitBounds(bounds)
        }
    }

    const focusFacility = (facility) => {
        setSelectedFacility(facility)

        if (map) {
            map.panTo(facility.coordinates)
            map.setZoom(16)
        }
    }

    const locateUser = () => {
        if (!navigator.geolocation) {
            alert(
                'Location services are not supported by your browser.'
            )
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                }

                if (map) {
                    map.panTo(location)
                    map.setZoom(14)
                }
            },
            () => {
                alert(
                    'Unable to access your location. Please allow location permission.'
                )
            }
        )
    }

    const getMarkerIcon = (facility) => {
        if (!window.google) return undefined

        let color = '#0d9488'

        if (facility.type === 'doctor') {
            color = '#4f46e5'
        }

        if (facility.type === 'pharmacy') {
            color = '#0891b2'
        }

        if (facility.type === 'emergency') {
            color = '#e11d48'
        }

        return {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 11,
            fillColor: color,
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 transition-colors">

            <div className="max-w-7xl mx-auto">

                {/* HEADER */}

                <motion.div
                    initial={{
                        opacity: 0,
                        y: -20
                    }}
                    animate={{
                        opacity: 1,
                        y: 0
                    }}
                    transition={{
                        duration: 0.5
                    }}
                    className="mb-8"
                >
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">

                        <div>

                            <div className="flex flex-wrap items-center gap-2 mb-2">

                                <span className="px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-wider border border-teal-500/20">
                                    Healthcare Network
                                </span>

                                <span className="flex items-center gap-1 text-xs text-slate-400">
                                    <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
                                    Verified Facilities
                                </span>

                            </div>

                            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                Find Healthcare Near You
                            </h1>

                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">
                                Discover nearby hospitals, doctors,
                                pharmacies and emergency facilities
                                through the MediNest healthcare network.
                            </p>

                        </div>

                        <motion.button
                            whileHover={{
                                scale: 1.03
                            }}
                            whileTap={{
                                scale: 0.97
                            }}
                            onClick={locateUser}
                            className="self-start lg:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold shadow-lg shadow-teal-500/20 transition"
                        >
                            <LocateFixed className="w-4 h-4" />
                            Use My Location
                        </motion.button>

                    </div>
                </motion.div>

                {/* SEARCH + FILTER */}

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 15
                    }}
                    animate={{
                        opacity: 1,
                        y: 0
                    }}
                    transition={{
                        delay: 0.1
                    }}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm mb-6"
                >

                    <div className="flex flex-col xl:flex-row gap-4">

                        <div className="relative flex-1">

                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                            <input
                                value={searchQuery}
                                onChange={(e) =>
                                    setSearchQuery(e.target.value)
                                }
                                placeholder="Search hospitals, doctors, pharmacies..."
                                className="w-full h-11 pl-11 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition"
                            />

                            {searchQuery && (
                                <button
                                    onClick={() =>
                                        setSearchQuery('')
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}

                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-1">

                            {Object.entries(facilityTypes).map(
                                ([type, config]) => {
                                    const Icon = config.icon
                                    const active =
                                        selectedType === type

                                    return (
                                        <button
                                            key={type}
                                            onClick={() =>
                                                setSelectedType(type)
                                            }
                                            className={`
                                                flex-shrink-0
                                                flex items-center gap-2
                                                px-3.5 py-2.5
                                                rounded-xl
                                                text-xs font-bold
                                                border
                                                transition
                                                ${active
                                                    ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-500/20'
                                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-300 hover:text-teal-600'
                                                }
                                            `}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {config.label}
                                        </button>
                                    )
                                }
                            )}

                        </div>

                    </div>

                </motion.div>

                {/* MOBILE VIEW SWITCH */}

                <div className="flex lg:hidden justify-end mb-4">

                    <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1">

                        <button
                            onClick={() =>
                                setViewMode('list')
                            }
                            className={`
                                p-2 rounded-lg
                                ${viewMode === 'list'
                                    ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-600'
                                    : 'text-slate-400'
                                }
                            `}
                        >
                            <List className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() =>
                                setViewMode('map')
                            }
                            className={`
                                p-2 rounded-lg
                                ${viewMode === 'map'
                                    ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-600'
                                    : 'text-slate-400'
                                }
                            `}
                        >
                            <Map className="w-4 h-4" />
                        </button>

                    </div>

                </div>

                {/* MAIN CONTENT */}

                <div className="grid lg:grid-cols-[420px_1fr] gap-6">

                    {/* FACILITY LIST */}

                    <div
                        className={`
                            space-y-4
                            ${viewMode === 'map'
                                ? 'hidden lg:block'
                                : ''
                            }
                        `}
                    >

                        <div className="flex items-center justify-between">

                            <div>

                                <h2 className="font-bold text-slate-900 dark:text-white">
                                    Nearby Healthcare
                                </h2>

                                <p className="text-xs text-slate-400 mt-0.5">
                                    {filteredFacilities.length}
                                    {' '}
                                    facilities found
                                </p>

                            </div>

                            <span className="text-xs text-slate-400">
                                Sorted by distance
                            </span>

                        </div>

                        {filteredFacilities.length === 0 ? (

                            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center">

                                <MapPin className="w-10 h-10 mx-auto text-slate-300 mb-3" />

                                <h3 className="font-bold text-slate-800 dark:text-white">
                                    No facilities found
                                </h3>

                                <p className="text-xs text-slate-400 mt-1">
                                    Try another search or facility type.
                                </p>

                            </div>

                        ) : (

                            <AnimatePresence mode="popLayout">

                                {filteredFacilities.map(
                                    (facility, index) => (
                                        <FacilityCard
                                            key={facility.id}
                                            facility={facility}
                                            index={index}
                                            selected={
                                                selectedFacility?.id ===
                                                facility.id
                                            }
                                            onSelect={() =>
                                                focusFacility(facility)
                                            }
                                        />
                                    )
                                )}

                            </AnimatePresence>

                        )}

                    </div>

                    {/* MAP */}

                    <div
                        className={`
                            ${viewMode === 'list'
                                ? 'hidden lg:block'
                                : ''
                            }
                        `}
                    >

                        <div className="relative h-[620px] lg:h-[700px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">

                            {!GOOGLE_MAPS_API_KEY ? (

                                <MapConfigurationMessage />

                            ) : loadError ? (

                                <MapError />

                            ) : !isLoaded ? (

                                <MapLoading />

                            ) : (

                                <GoogleMap
                                    mapContainerStyle={
                                        mapContainerStyle
                                    }
                                    center={defaultCenter}
                                    zoom={13}
                                    onLoad={handleMapLoad}
                                    options={{
                                        streetViewControl: false,
                                        mapTypeControl: false,
                                        fullscreenControl: false,
                                        clickableIcons: true,
                                        gestureHandling: 'greedy'
                                    }}
                                >

                                    {filteredFacilities.map(
                                        (facility) => (
                                            <MarkerF
                                                key={facility.id}
                                                position={
                                                    facility.coordinates
                                                }
                                                icon={getMarkerIcon(
                                                    facility
                                                )}
                                                onClick={() =>
                                                    focusFacility(
                                                        facility
                                                    )
                                                }
                                            />
                                        )
                                    )}

                                    {selectedFacility && (

                                        <InfoWindowF
                                            position={
                                                selectedFacility.coordinates
                                            }
                                            onCloseClick={() =>
                                                setSelectedFacility(
                                                    null
                                                )
                                            }
                                        >

                                            <div className="p-1 min-w-[230px]">

                                                <div className="flex items-start gap-3">

                                                    <div
                                                        className={`
                                                            w-9 h-9
                                                            rounded-xl
                                                            flex items-center
                                                            justify-center
                                                            ${getFacilityStyles(
                                                            selectedFacility.type
                                                        ).wrapper
                                                            }
                                                        `}
                                                    >
                                                        {(() => {
                                                            const Icon =
                                                                getFacilityIcon(
                                                                    selectedFacility.type
                                                                )

                                                            return (
                                                                <Icon className="w-4 h-4" />
                                                            )
                                                        })()}
                                                    </div>

                                                    <div className="min-w-0">

                                                        <h3 className="font-bold text-sm text-slate-900">
                                                            {
                                                                selectedFacility.name
                                                            }
                                                        </h3>

                                                        <p className="text-xs text-slate-500 mt-0.5">
                                                            {
                                                                getFacilityLabel(
                                                                    selectedFacility.type
                                                                )
                                                            }
                                                        </p>

                                                    </div>

                                                </div>

                                                <div className="flex items-center gap-3 mt-3 text-xs">

                                                    <span className="flex items-center gap-1 text-slate-600">
                                                        <MapPin className="w-3 h-3" />
                                                        {
                                                            selectedFacility.distance
                                                        }
                                                    </span>

                                                    <span className="flex items-center gap-1 text-amber-500">
                                                        <Star className="w-3 h-3 fill-current" />
                                                        {
                                                            selectedFacility.rating
                                                        }
                                                    </span>

                                                </div>

                                                <div className="flex gap-2 mt-3">

                                                    <a
                                                        href={`tel:${selectedFacility.contact}`}
                                                        className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-600 text-white text-xs font-bold"
                                                    >
                                                        <Phone className="w-3 h-3" />
                                                        Call
                                                    </a>

                                                    <a
                                                        href={getDirectionsUrl(
                                                            selectedFacility.coordinates
                                                        )}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold"
                                                    >
                                                        <Navigation className="w-3 h-3" />
                                                        Directions
                                                    </a>

                                                </div>

                                            </div>

                                        </InfoWindowF>

                                    )}

                                </GoogleMap>

                            )}

                            {isLoaded &&
                                !loadError &&
                                GOOGLE_MAPS_API_KEY && (

                                    <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">

                                        <div className="pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl px-3.5 py-2.5 shadow-lg border border-slate-200 dark:border-slate-700">

                                            <div className="flex items-center gap-2">

                                                <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />

                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                                    MediNest Healthcare Network
                                                </span>

                                            </div>

                                        </div>

                                        <button
                                            onClick={locateUser}
                                            className="pointer-events-auto w-10 h-10 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-teal-600 hover:bg-teal-50 transition"
                                            title="Use my location"
                                        >
                                            <LocateFixed className="w-4 h-4" />
                                        </button>

                                    </div>

                                )}

                        </div>

                    </div>

                </div>

                {/* EMERGENCY BANNER */}

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 20
                    }}
                    animate={{
                        opacity: 1,
                        y: 0
                    }}
                    transition={{
                        delay: 0.25
                    }}
                    className="mt-6 bg-gradient-to-r from-rose-600 to-red-600 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-rose-600/20"
                >

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                        <div className="flex items-center gap-4">

                            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">

                                <Ambulance className="w-6 h-6" />

                            </div>

                            <div>

                                <h3 className="font-bold">
                                    Medical Emergency?
                                </h3>

                                <p className="text-xs text-rose-100 mt-1">
                                    For life-threatening emergencies,
                                    call 112 immediately.
                                </p>

                            </div>

                        </div>

                        <a
                            href="tel:112"
                            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-rose-700 font-extrabold text-sm hover:bg-rose-50 transition"
                        >
                            <Phone className="w-4 h-4" />
                            Call 112
                        </a>

                    </div>

                </motion.div>

            </div>

        </div>
    )
}

function FacilityCard({
    facility,
    index,
    selected,
    onSelect
}) {
    const Icon = getFacilityIcon(facility.type)
    const styles = getFacilityStyles(facility.type)

    return (
        <motion.div
            layout
            initial={{
                opacity: 0,
                y: 15
            }}
            animate={{
                opacity: 1,
                y: 0
            }}
            exit={{
                opacity: 0,
                y: -10
            }}
            transition={{
                delay: index * 0.04
            }}
            className={`
                group
                bg-white dark:bg-slate-900
                rounded-3xl
                p-5
                border
                shadow-sm
                transition-all duration-200
                ${selected
                    ? 'border-teal-400 dark:border-teal-600 shadow-lg shadow-teal-500/10'
                    : 'border-slate-200/80 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-800 hover:shadow-lg'
                }
            `}
        >

            <button
                onClick={onSelect}
                className="w-full text-left"
            >

                <div className="flex gap-4">

                    <div
                        className={`
                            w-12 h-12
                            rounded-2xl
                            flex items-center
                            justify-center
                            border
                            flex-shrink-0
                            ${styles.wrapper}
                        `}
                    >
                        <Icon className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 flex-1">

                        <div className="flex items-start justify-between gap-3">

                            <div>

                                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                                    {facility.name}
                                </h3>

                                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                                    {getFacilityLabel(
                                        facility.type
                                    )}
                                </span>

                            </div>

                            <ChevronRight
                                className={`
                                    w-4 h-4
                                    flex-shrink-0
                                    text-slate-300
                                    group-hover:text-teal-500
                                    transition
                                    ${selected
                                        ? 'text-teal-500 translate-x-1'
                                        : ''
                                    }
                                `}
                            />

                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-3">

                            <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                <MapPin className="w-3.5 h-3.5 text-teal-500" />
                                {facility.distance}
                            </span>

                            <span className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                {facility.rating}
                            </span>

                            <span className="flex items-center gap-1 text-xs text-slate-400">
                                <Clock className="w-3.5 h-3.5" />
                                Open
                            </span>

                        </div>

                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 truncate">
                            {facility.address}
                        </p>

                    </div>

                </div>

            </button>

            <div className="grid grid-cols-2 gap-2 mt-4">

                <a
                    href={`tel:${facility.contact}`}
                    onClick={(e) =>
                        e.stopPropagation()
                    }
                    className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 text-xs font-bold border border-teal-100 dark:border-teal-900 hover:bg-teal-100 dark:hover:bg-teal-900/50 transition"
                >
                    <Phone className="w-3.5 h-3.5" />
                    Call
                </a>

                <a
                    href={getDirectionsUrl(
                        facility.coordinates
                    )}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) =>
                        e.stopPropagation()
                    }
                    className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                    <Navigation className="w-3.5 h-3.5" />
                    Directions
                </a>

            </div>

        </motion.div>
    )
}

function MapLoading() {
    return (
        <div className="h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800">

            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-4">

                <MapPin className="w-7 h-7 text-teal-500 animate-pulse" />

            </div>

            <p className="font-bold text-slate-700 dark:text-slate-200">
                Loading healthcare map...
            </p>

            <p className="text-xs text-slate-400 mt-1">
                Connecting to Google Maps
            </p>

        </div>
    )
}

function MapConfigurationMessage() {
    return (
        <div className="h-full flex items-center justify-center p-8 bg-slate-100 dark:bg-slate-800">

            <div className="max-w-md text-center">

                <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">

                    <Map className="w-8 h-8 text-amber-500" />

                </div>

                <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">
                    Google Maps Not Configured
                </h3>

                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    Add your Google Maps API key to the frontend environment
                    variables to enable the interactive healthcare map.
                </p>

                <div className="mt-4 px-4 py-3 rounded-xl bg-slate-900 text-left overflow-x-auto">

                    <code className="text-xs text-slate-200">
                        VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
                    </code>

                </div>

            </div>

        </div>
    )
}

function MapError() {
    return (
        <div className="h-full flex items-center justify-center p-8 bg-slate-100 dark:bg-slate-800">

            <div className="text-center max-w-sm">

                <MapPin className="w-12 h-12 mx-auto text-rose-400 mb-4" />

                <h3 className="font-bold text-slate-800 dark:text-white">
                    Map unavailable
                </h3>

                <p className="text-xs text-slate-400 mt-2">
                    Google Maps could not be loaded. Please check your API key
                    and internet connection.
                </p>

            </div>

        </div>
    )
}
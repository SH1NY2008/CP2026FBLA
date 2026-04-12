"use client"

import React from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { Business } from "@/lib/data"

// Fix for default icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
})

interface MapViewProps {
  businesses: Business[]
  latitude: number
  longitude: number
}

export function MapView({ businesses, latitude, longitude }: MapViewProps) {
  if (typeof window === "undefined") {
    return null
  }

  return (
    <MapContainer center={[latitude, longitude]} zoom={13} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {businesses.map(business => (
        <Marker key={business.id} position={[business.latitude, business.longitude]}>
          <Popup>
            <div>
              <h3>{business.name}</h3>
              <p>{business.address}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

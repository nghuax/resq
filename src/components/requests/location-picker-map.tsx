"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { Marker as LeafletMarker } from "leaflet";
import L from "leaflet";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Coordinates = {
  latitude: number;
  longitude: number;
};

function MapSync({ value }: { value: Coordinates }) {
  const map = useMap();

  useEffect(() => {
    map.setView([value.latitude, value.longitude], map.getZoom());
  }, [map, value.latitude, value.longitude]);

  return null;
}

function MapClickHandler({
  onChange,
}: {
  onChange: (value: Coordinates) => void;
}) {
  useMapEvents({
    click(event) {
      onChange({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  return null;
}

function DraggableMarker({
  value,
  onChange,
}: {
  value: Coordinates;
  onChange: (value: Coordinates) => void;
}) {
  const markerRef = useRef<LeafletMarker | null>(null);

  return (
    <Marker
      draggable
      position={[value.latitude, value.longitude]}
      ref={markerRef}
      eventHandlers={{
        dragend() {
          const marker = markerRef.current;

          if (!marker) {
            return;
          }

          const point = marker.getLatLng();
          onChange({
            latitude: point.lat,
            longitude: point.lng,
          });
        },
      }}
    />
  );
}

export function LocationPickerMap({
  value,
  onChange,
}: {
  value: Coordinates;
  onChange: (value: Coordinates) => void;
}) {
  const [isLocating, setIsLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "/leaflet/marker-icon-2x.png",
      iconUrl: "/leaflet/marker-icon.png",
      shadowUrl: "/leaflet/marker-shadow.png",
    });
  }, []);

  function detectGpsLocation() {
    if (!navigator.geolocation) {
      setErrorMessage("Trình duyệt này không hỗ trợ GPS.");
      return;
    }

    setIsLocating(true);
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsLocating(false);
      },
      () => {
        setErrorMessage("Không thể lấy vị trí hiện tại. Hãy kiểm tra quyền truy cập GPS.");
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  }

  return (
    <Card className="space-y-4 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-[var(--ink-900)]">Bản đồ vị trí sự cố</p>
          <p className="text-sm text-[var(--ink-500)]">
            Chạm trên bản đồ để đặt marker, kéo marker để chỉnh lại, hoặc dùng GPS.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={detectGpsLocation}
          disabled={isLocating}
        >
          {isLocating ? "Đang tìm GPS..." : "Dùng GPS hiện tại"}
        </Button>
      </div>

      <MapContainer
        center={[value.latitude, value.longitude]}
        zoom={15}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution="OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapSync value={value} />
        <MapClickHandler onChange={onChange} />
        <DraggableMarker value={value} onChange={onChange} />
      </MapContainer>

      <div className="flex flex-col gap-2 rounded-2xl bg-[var(--sand-50)] px-4 py-3 text-sm text-[var(--ink-700)] sm:flex-row sm:items-center sm:justify-between">
        <span>
          Vĩ độ: <strong>{value.latitude.toFixed(6)}</strong>
        </span>
        <span>
          Kinh độ: <strong>{value.longitude.toFixed(6)}</strong>
        </span>
      </div>

      {errorMessage ? (
        <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}
    </Card>
  );
}

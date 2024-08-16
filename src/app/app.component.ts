import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.js';
import Geocoder from 'leaflet-control-geocoder';
L.Icon.Default.imagePath = '/assets/images/';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'LeafletAngular';
  private map!: L.Map;
  private currentPosition!: L.LatLng;
  private currentPositionMarker!: L.Marker;
  markers: L.Marker[] = [
    L.marker([34.43085448264402, 8.769936764523381]),
    L.marker([34.43672674627866, 8.739459056116173]),
    L.marker([34.425543305786036, 8.746801395304384]),
    L.marker([34.41119065929488, 8.748936674850265]),
  ];

  constructor() {}

  ngOnInit() {
    if (!navigator.geolocation) {
      console.log('Geolocation is not supported by this browser.');
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.currentPosition = L.latLng(
            position.coords.latitude,
            position.coords.longitude
          );
          this.setupMap();
          this.placeCurrentPositionMarker();
          this.addMapMarkers();
          this.adjustMapView();
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  }

  private setupMap() {
    const baseMapURL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    this.map = L.map('map');
    L.tileLayer(baseMapURL).addTo(this.map);

    // Add the geocoding control
    const geocoderControl = new Geocoder();
    geocoderControl.addTo(this.map);

    // Add a geocoding event
    geocoderControl.on('markgeocode', function (e) {
      console.log(e);
    });
  }

  private placeCurrentPositionMarker() {
    if (this.currentPosition) {
      const currentPositionIcon = L.icon({
        iconUrl: 'assets/images/UserLocation.png',
        iconSize: [40, 40],
        iconAnchor: [19, 38],
        popupAnchor: [0, -30],
      });

      // Create the current position marker
      this.currentPositionMarker = L.marker(
        [this.currentPosition.lat, this.currentPosition.lng],
        {
          icon: currentPositionIcon,
          title: 'Your Position',
        }
      ).addTo(this.map);

      // Add a `mouseover` event to display the popup
      this.currentPositionMarker.on('mouseover', () => {
        this.currentPositionMarker
          .bindPopup('Your current position')
          .openPopup();
      });

      // Add a `mouseout` event to close the popup
      this.currentPositionMarker.on('mouseout', () => {
        this.currentPositionMarker.closePopup();
      });
    }
  }

  private addMapMarkers() {
    this.markers.forEach((marker) => {
      marker.addTo(this.map);

      // Listen to the `mouseover` event to display the popup with the distance
      marker.on('mouseover', () => {
        const markerPosition = marker.getLatLng();
        const distanceInMeters =
          this.currentPosition.distanceTo(markerPosition); // Calculate the distance in meters
        const distanceInKilometers = distanceInMeters / 1000; // Convert to kilometers
        marker
          .bindPopup(
            `Distance from your location: ${distanceInKilometers.toFixed(2)} km`
          )
          .openPopup();
      });

      // Listen to the `mouseout` event to close the popup
      marker.on('mouseout', () => {
        marker.closePopup();
      });
    });
  }

  private adjustMapView() {
    const bounds = L.latLngBounds(
      this.markers.map((marker) => marker.getLatLng())
    );
    this.map.fitBounds(bounds);
  }
}

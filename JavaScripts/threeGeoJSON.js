import * as THREE from "three";
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { Line2 } from 'three/addons/lines/Line2.js';

/* Draw GeoJSON

Iterates through the latitude and longitude values, converts the values to XYZ coordinates,
and draws the geoJSON geometries.

*/

export function drawThreeGeo({ json, radius, materalOptions }) {
  const container = new THREE.Object3D();
  container.userData.update = (t) => {
    for (let i = 0; i < container.children.length; i++) {
      container.children[i].userData.update?.(t);
    }
  }

  const x_values = [];
  const y_values = [];
  const z_values = [];
  const json_geom = createGeometryArray(json);

  //Re-usable array to hold coordinate values. This is necessary so that you can add
  //interpolated coordinates. Otherwise, lines go through the sphere instead of wrapping around.
  let coordinate_array = [];
  for (let geom_num = 0; geom_num < json_geom.length; geom_num++) {
    if (json_geom[geom_num].type == 'Point') {
      convertToSphereCoords(json_geom[geom_num].coordinates, radius);
      drawParticle(x_values[0], y_values[0], z_values[0], materalOptions);

    } else if (json_geom[geom_num].type == 'MultiPoint') {
      for (let point_num = 0; point_num < json_geom[geom_num].coordinates.length; point_num++) {
        convertToSphereCoords(json_geom[geom_num].coordinates[point_num], radius);
        drawParticle(x_values[0], y_values[0], z_values[0], materalOptions);
      }

    } else if (json_geom[geom_num].type == 'LineString') {
      coordinate_array = createCoordinateArray(json_geom[geom_num].coordinates);

      for (let point_num = 0; point_num < coordinate_array.length; point_num++) {
        convertToSphereCoords(coordinate_array[point_num], radius);
      }
      drawLine(x_values, y_values, z_values, materalOptions);

    } else if (json_geom[geom_num].type == 'Polygon') {
      for (let segment_num = 0; segment_num < json_geom[geom_num].coordinates.length; segment_num++) {
        coordinate_array = createCoordinateArray(json_geom[geom_num].coordinates[segment_num]);

        for (let point_num = 0; point_num < coordinate_array.length; point_num++) {
          convertToSphereCoords(coordinate_array[point_num], radius);
        }
        drawLine(x_values, y_values, z_values, materalOptions);
      }

    } else if (json_geom[geom_num].type == 'MultiLineString') {
      for (let segment_num = 0; segment_num < json_geom[geom_num].coordinates.length; segment_num++) {
        coordinate_array = createCoordinateArray(json_geom[geom_num].coordinates[segment_num]);

        for (let point_num = 0; point_num < coordinate_array.length; point_num++) {
          convertToSphereCoords(coordinate_array[point_num], radius);
        }
        drawLine(x_values, y_values, z_values, materalOptions);
      }

    } else if (json_geom[geom_num].type == 'MultiPolygon') {
      for (let polygon_num = 0; polygon_num < json_geom[geom_num].coordinates.length; polygon_num++) {
        for (let segment_num = 0; segment_num < json_geom[geom_num].coordinates[polygon_num].length; segment_num++) {
          coordinate_array = createCoordinateArray(json_geom[geom_num].coordinates[polygon_num][segment_num]);

          for (let point_num = 0; point_num < coordinate_array.length; point_num++) {
            convertToSphereCoords(coordinate_array[point_num], radius);
          }
          drawLine(x_values, y_values, z_values, materalOptions);
        }
      }
    } else {
      throw new Error('The geoJSON is not valid.');
    }
  }

  function createGeometryArray(json) {
    let geometry_array = [];

    if (json.type == 'Feature') {
      geometry_array.push(json.geometry);
    } else if (json.type == 'FeatureCollection') {
      for (let feature_num = 0; feature_num < json.features.length; feature_num++) {
        geometry_array.push(json.features[feature_num].geometry);
      }
    } else if (json.type == 'GeometryCollection') {
      for (let geom_num = 0; geom_num < json.geometries.length; geom_num++) {
        geometry_array.push(json.geometries[geom_num]);
      }
    } else {
      throw new Error('The geoJSON is not valid.');
    }
    return geometry_array;
  }

  function createCoordinateArray(feature) {
    //Loop through the coordinates and figure out if the points need interpolation.
    const temp_array = [];
    let interpolation_array = [];

    for (let point_num = 0; point_num < feature.length; point_num++) {
      const point1 = feature[point_num];
      const point2 = feature[point_num - 1];

      if (point_num > 0) {
        if (needsInterpolation(point2, point1)) {
          interpolation_array = [point2, point1];
          interpolation_array = interpolatePoints(interpolation_array);

          for (let inter_point_num = 0; inter_point_num < interpolation_array.length; inter_point_num++) {
            temp_array.push(interpolation_array[inter_point_num]);
          }
        } else {
          temp_array.push(point1);
        }
      } else {
        temp_array.push(point1);
      }
    }
    return temp_array;
  }

  function needsInterpolation(point2, point1) {
    //If the distance between two latitude and longitude values is
    //greater than five degrees, return true.
    const lon1 = point1[0];
    const lat1 = point1[1];
    const lon2 = point2[0];
    const lat2 = point2[1];
    const lon_distance = Math.abs(lon1 - lon2);
    const lat_distance = Math.abs(lat1 - lat2);

    if (lon_distance > 5 || lat_distance > 5) {
      return true;
    } else {
      return false;
    }
  }

  function interpolatePoints(interpolation_array) {
    //This function is recursive. It will continue to add midpoints to the
    //interpolation array until needsInterpolation() returns false.
    let temp_array = [];
    let point1, point2;

    for (let point_num = 0; point_num < interpolation_array.length - 1; point_num++) {
      point1 = interpolation_array[point_num];
      point2 = interpolation_array[point_num + 1];

      if (needsInterpolation(point2, point1)) {
        temp_array.push(point1);
        temp_array.push(getMidpoint(point1, point2));
      } else {
        temp_array.push(point1);
      }
    }

    temp_array.push(interpolation_array[interpolation_array.length - 1]);

    if (temp_array.length > interpolation_array.length) {
      temp_array = interpolatePoints(temp_array);
    } else {
      return temp_array;
    }
    return temp_array;
  }

  function getMidpoint(point1, point2) {
    const midpoint_lon = (point1[0] + point2[0]) / 2;
    const midpoint_lat = (point1[1] + point2[1]) / 2;
    const midpoint = [midpoint_lon, midpoint_lat];

    return midpoint;
  }

  function convertToSphereCoords(coordinates_array, sphere_radius) {
      const lon = THREE.MathUtils.degToRad(coordinates_array[0]);
      const lat = THREE.MathUtils.degToRad(coordinates_array[1]);

      const x = sphere_radius * Math.cos(lat) * Math.sin(lon);
      const y = sphere_radius * Math.sin(lat);
      const z = sphere_radius * Math.cos(lat) * Math.cos(lon);

      x_values.push(x);
      y_values.push(y);
      z_values.push(z);
  }

  function drawParticle(x, y, z, options) {
    let geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([x, y, z], 3)
    );

    const particle_material = new THREE.PointsMaterial(options);

    const particle = new THREE.Points(geo, particle_material);
    container.add(particle);

    clearArrays();
  }

  function drawLine(x_values, y_values, z_values, options) {
    const lineGeo = new LineGeometry();
    const verts = [];
    for (let i = 0; i < x_values.length; i++) {
      verts.push(x_values[i], y_values[i], z_values[i]);
    }
    lineGeo.setPositions(verts);
    const hue = 0.33 + Math.random() * 0.2
    const color = new THREE.Color().setHSL(hue, 1, 0.5)
    const lineMaterial = new LineMaterial({
      color,
      linewidth: 1.5,
    });

    const line = new Line2(lineGeo, lineMaterial);
    line.computeLineDistances();
    const rate = Math.random() * 0.0002;
    line.userData.update = (t) => {
      lineMaterial.dashOffset = t * rate;
    }
    container.add(line);

    clearArrays();
  }

  function clearArrays() {
    x_values.length = 0;
    y_values.length = 0;
    z_values.length = 0;
  }

  return container;
}
